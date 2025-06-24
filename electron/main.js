// electron/main.js
// This is the main entry point for the Electron application
// It manages the application lifecycle and bootstraps all core systems

// Import Electron modules
const { app, BrowserWindow, ipcMain, Menu, shell, dialog, net } = require('electron');
const path = require('path');
const fs = require('fs');

// Import custom managers and handlers
const WindowManager = require('./src/main/WindowManager');
const IPCHandler = require('./src/main/IPCHandler');
const MenuBuilder = require('./src/main/MenuBuilder');
const StateManager = require('./src/main/StateManager');
const AppUpdater = require('./src/main/AppUpdater');
const PolygonBridge = require('./src/main/PolygonBridge');

// Import configuration files
const appConfig = require('./config/app.config');
const windowConfig = require('./config/window.config');

// Development tools (only in dev mode)
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
    require('electron-debug')({ showDevTools: true });
}

// ===== LOGGING SYSTEM =====
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    VERBOSE: 4
};

// Set log level based on environment
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL ? 
    LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO :
    (isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO);

// Control market data logging separately
const LOG_MARKET_DATA = process.env.LOG_MARKET_DATA === 'true';

function log(level, ...args) {
    if (level <= CURRENT_LOG_LEVEL) {
        const timestamp = new Date().toISOString().substring(11, 19);
        const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
        
        switch(level) {
            case LOG_LEVELS.ERROR:
                console.error(`[${timestamp}] [${levelName}]`, ...args);
                break;
            case LOG_LEVELS.WARN:
                console.warn(`[${timestamp}] [${levelName}]`, ...args);
                break;
            default:
                console.log(`[${timestamp}] [${levelName}]`, ...args);
        }
    }
}

// Convenience logging functions
const logError = (...args) => log(LOG_LEVELS.ERROR, ...args);
const logWarn = (...args) => log(LOG_LEVELS.WARN, ...args);
const logInfo = (...args) => log(LOG_LEVELS.INFO, ...args);
const logDebug = (...args) => log(LOG_LEVELS.DEBUG, ...args);
const logVerbose = (...args) => log(LOG_LEVELS.VERBOSE, ...args);

// ===== END LOGGING SYSTEM =====

// Global references to prevent garbage collection
let windowManager = null;  // Manages all application windows
let ipcHandler = null;     // Handles all IPC communication
let stateManager = null;   // Manages persistent application state
let appUpdater = null;     // Handles auto-updates
let polygonBridge = null;  // Manages Polygon server connection

// Single instance lock - ensures only one instance of the app runs
const gotTheLock = app.requestSingleInstanceLock();

// If we didn't get the lock, another instance is running
if (!gotTheLock) {
    app.quit(); // Quit this instance
} else {
    // Handle second instance attempt - focus existing window
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // If someone tried to run a second instance, focus our main window
        if (windowManager) {
            const mainWindow = windowManager.getWindow('main');
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            }
        }
    });
}

// Enable sandbox for all renderers (security best practice)
app.enableSandbox();

// Initialize the application when Electron is ready
app.whenReady().then(async () => {
    logInfo('[Main] Application starting...');
    
    try {
        // Initialize state manager first (loads saved preferences)
        stateManager = new StateManager({
            name: 'alpha-v1-state',
            defaults: {
                windowStates: {},      // Saved window positions/sizes
                preferences: {         // User preferences
                    theme: 'dark',
                    autoConnect: true,
                    multiWindow: true
                },
                recentSymbols: [],     // Recently viewed symbols
                layouts: {}            // Saved table layouts
            }
        });
        
        // Initialize window manager with saved state
        windowManager = new WindowManager({
            stateManager: stateManager,
            windowConfig: windowConfig,
            isDevelopment: isDevelopment
        });
        
        // Initialize IPC handler for inter-process communication
        ipcHandler = new IPCHandler({
            windowManager: windowManager,
            stateManager: stateManager
        });

        // Initialize Polygon Bridge
        polygonBridge = new PolygonBridge({
            ipcHandler: ipcHandler,
            autoStartServer: false, // Never auto-start (assume server is running)
            serverUrl: 'http://127.0.0.1:8200',
            wsUrl: 'ws://127.0.0.1:8200'
        });

        // Pass PolygonBridge reference to IPCHandler for bridge:get-status
        ipcHandler.polygonBridge = polygonBridge;

        // Set up Polygon Bridge event handlers
        polygonBridge.on('ready', () => {
            logInfo('[Main] PolygonBridge ready');
        });

        polygonBridge.on('server-exit', ({ code, signal }) => {
            logError(`[Main] Polygon server exited unexpectedly: ${code} ${signal}`);
        });

        // Update the market-data event handler to properly format data for bridge.js
        polygonBridge.on('market-data', ({ windowId, subscriptionId, stream, data }) => {
            if (LOG_MARKET_DATA) {
                logVerbose(`[Main] Market data update - window: ${windowId}, stream: ${stream}, items: ${data.length}`);
            }
            
            const window = windowManager.getWindow(windowId);
            if (window && !window.isDestroyed()) {
                // Format for bridge.js
                const update = {
                    type: 'marketData',
                    table: 'scanner',
                    data: data,
                    options: {
                        stream: stream,
                        subscriptionId: subscriptionId
                    }
                };
                
                // Send BOTH events to ensure compatibility
                window.webContents.send('market-data-update', update);
                window.webContents.send('market-data', { subscriptionId, stream, data });
            }
        });

        polygonBridge.on('reconnection-failed', ({ clientId, attempts }) => {
            logError(`[Main] WebSocket reconnection failed for ${clientId} after ${attempts} attempts`);
            const windowId = clientId.replace('window-', '');
            const window = windowManager.getWindow(windowId);
            if (window && !window.isDestroyed()) {
                window.webContents.send('connection-error', {
                    type: 'websocket',
                    message: 'Lost connection to market data. Please check your connection.'
                });
            }
        });

        // Initialize the bridge
        try {
            await polygonBridge.initialize();
            logInfo('[Main] PolygonBridge initialized successfully');
            
            // Connect PolygonBridge data responses back to IPCHandler
            ipcHandler.on('data-request', (request) => {
                logVerbose('[Main] Forwarding data-request to PolygonBridge:', request.operationId);
                // PolygonBridge will handle this and emit data-response-{operationId}
            });
            
        } catch (error) {
            logError('[Main] Failed to initialize PolygonBridge:', error);
            if (!isDevelopment) {
                dialog.showErrorBox('Connection Error', 
                    'Failed to connect to market data server. Please ensure the server is running.');
            }
        }

        // Set up IPC handlers for data operations that aren't already in IPCHandler
        ipcMain.handle('data:connect', async (event) => {
            try {
                logDebug('[Main] Handling data:connect request');
                // PolygonBridge is already initialized, just return success
                return polygonBridge.initialized;
            } catch (error) {
                logError('[Main] Error in data:connect:', error);
                return false;
            }
        });

        // Replace the existing data:request-initial handler with auto-subscribe functionality
        ipcMain.handle('data:request-initial', async (event) => {
            try {
                logDebug('[Main] Handling data:request-initial - AUTO SUBSCRIBING');
                
                // Get the window that made the request
                const window = BrowserWindow.fromWebContents(event.sender);
                const windowId = windowManager.getWindowId(window);
                
                // Default symbols to subscribe to
                const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'SPY'];
                logVerbose('[Main] Auto-subscribing to symbols:', defaultSymbols);
                
                // Create subscriptions for trades and quotes
                const subscriptions = [];
                
                // Subscribe to trades
                const tradeSubId = `${windowId}-trades-auto-${Date.now()}`;
                ipcHandler.emit('data-subscribe', {
                    subscriptionId: tradeSubId,
                    windowId: windowId,
                    stream: 'trades',
                    symbols: defaultSymbols,
                    options: { auto: true }
                });
                subscriptions.push({ id: tradeSubId, stream: 'trades' });
                
                // Subscribe to quotes
                const quoteSubId = `${windowId}-quotes-auto-${Date.now()}`;
                ipcHandler.emit('data-subscribe', {
                    subscriptionId: quoteSubId,
                    windowId: windowId,
                    stream: 'quotes',
                    symbols: defaultSymbols,
                    options: { auto: true }
                });
                subscriptions.push({ id: quoteSubId, stream: 'quotes' });
                
                logVerbose('[Main] Created subscriptions:', subscriptions);
                
                // Also fetch initial data if available
                try {
                    // Get previous close prices for gap calculations
                    const closeData = await polygonBridge.fetchPolygonData({
                        endpoint: '/previous-close',
                        symbols: defaultSymbols.join(',')
                    });
                    logDebug('[Main] Fetched previous close data');
                } catch (error) {
                    logWarn('[Main] Could not fetch previous close:', error.message);
                }
                
                return {
                    success: true,
                    message: 'Subscriptions created',
                    symbols: defaultSymbols,
                    subscriptions: subscriptions
                };
                
            } catch (error) {
                logError('[Main] Error in data:request-initial:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        ipcMain.handle('data:get-market-status', async (event) => {
            try {
                logVerbose('[Main] Handling data:get-market-status');
                
                // Since there's no market status endpoint, just use time-based logic
                const now = new Date();
                const hour = now.getHours();
                const day = now.getDay();
                
                // Weekend check
                if (day === 0 || day === 6) {
                    return 'Closed';
                }
                
                // Weekday hours (ET timezone approximation)
                if (hour >= 4 && hour < 9.5) {
                    return 'Pre-Market';
                } else if (hour >= 9.5 && hour < 16) {
                    return 'Open';
                } else if (hour >= 16 && hour < 20) {
                    return 'After-Hours';
                } else {
                    return 'Closed';
                }
            } catch (error) {
                logError('[Main] Error in data:get-market-status:', error);
                return 'Unknown';
            }
        });
        
        // Note: bridge:get-status is already handled by IPCHandler.setupAppHandlers()
        // Update the existing handler to return actual PolygonBridge status
        if (polygonBridge) {
            ipcHandler.on('bridge-status-request', () => {
                return polygonBridge.getStatus();
            });
        }
        
        // Set up application menu
        const menuBuilder = new MenuBuilder({
            windowManager: windowManager,
            isDevelopment: isDevelopment
        });
        Menu.setApplicationMenu(menuBuilder.buildMenu());
        
        // Initialize auto-updater (production only)
        if (!isDevelopment && appConfig.common.autoUpdate) {
            appUpdater = new AppUpdater();
            appUpdater.checkForUpdates();
        }
        
        // Get window dimensions and position
        // Note: WindowManager creates IDs like "main-1", so we need to check both
        const windowId = 'main-1'; // First main window
        const width = stateManager.get(`windowStates.${windowId}.width`) || 
                     stateManager.get('windowStates.main.width', 1600);
        const height = stateManager.get(`windowStates.${windowId}.height`) || 
                      stateManager.get('windowStates.main.height', 900);
        let x = stateManager.get(`windowStates.${windowId}.x`) || 
                stateManager.get('windowStates.main.x');
        let y = stateManager.get(`windowStates.${windowId}.y`) || 
                stateManager.get('windowStates.main.y');
        
        // Validate window position - reset if off-screen
        const { screen } = require('electron');
        const displays = screen.getAllDisplays();
        const primaryDisplay = screen.getPrimaryDisplay();
        
        logDebug('[Main] Available displays:', displays.length);
        displays.forEach((display, index) => {
            logVerbose(`[Main] Display ${index}:`, {
                id: display.id,
                bounds: display.bounds,
                workArea: display.workArea,
                scaleFactor: display.scaleFactor
            });
        });
        
        const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
        const scaleFactor = primaryDisplay.scaleFactor || 1;
        
        logDebug('[Main] Primary display scale factor:', scaleFactor);
        
        // Check if window position is valid
        let isPositionValid = false;
        if (x !== undefined && y !== undefined) {
            // Check if position is within any display
            isPositionValid = displays.some(display => {
                const bounds = display.bounds;
                return x >= bounds.x && x < bounds.x + bounds.width &&
                       y >= bounds.y && y < bounds.y + bounds.height;
            });
        }
        
        if (!isPositionValid) {
            logDebug('[Main] Window position invalid or off-screen, centering on primary display');
            x = primaryDisplay.bounds.x + Math.round((screenWidth - width) / 2);
            y = primaryDisplay.bounds.y + Math.round((screenHeight - height) / 2);
        }
        
        // Ensure reasonable dimensions
        const finalWidth = Math.min(width, screenWidth);
        const finalHeight = Math.min(height, screenHeight);
        
        logDebug('[Main] Screen dimensions:', { screenWidth, screenHeight });
        logDebug('[Main] Creating main window with dimensions:', { 
            width: finalWidth, 
            height: finalHeight, 
            x, 
            y 
        });
        
        // Create the main application window - don't pass saved state, let WindowManager handle it
        const mainWindow = await windowManager.createWindow('main', {
            width: 1600,
            height: 900,
            center: true, // Always center on first launch
            show: false   // Don't show until positioned
        });
        
        // Add debugging and ensure window is shown
        if (mainWindow) {
            logInfo('[Main] Main window created successfully');
            logDebug('[Main] Window ID:', mainWindow.id);
            logVerbose('[Main] Window visible:', mainWindow.isVisible());
            logVerbose('[Main] Window bounds:', mainWindow.getBounds());
            logVerbose('[Main] Window is minimized:', mainWindow.isMinimized());
            logVerbose('[Main] Window is focused:', mainWindow.isFocused());
            
            // Force show the window if it's not visible
            if (!mainWindow.isVisible()) {
                logDebug('[Main] Window not visible, forcing show...');
                mainWindow.show();
            }
            
            // If window is minimized, restore it
            if (mainWindow.isMinimized()) {
                logDebug('[Main] Window is minimized, restoring...');
                mainWindow.restore();
            }
            
            // Force correct window bounds after creation
            setTimeout(() => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    logDebug('[Main] Force-setting window bounds to correct values');
                    mainWindow.setBounds({
                        x: x,
                        y: y,
                        width: finalWidth,
                        height: finalHeight
                    });
                    mainWindow.center();
                    mainWindow.show();
                    mainWindow.focus();
                }
            }, 100);
            
            // Set up event handlers for debugging
            
            mainWindow.on('show', () => {
                logVerbose('[Main] Window show event');
            });
            
            mainWindow.on('hide', () => {
                logVerbose('[Main] Window hide event');
            });
            
            mainWindow.on('close', () => {
                logDebug('[Main] Window closing');
            });
            
            mainWindow.on('closed', () => {
                logDebug('[Main] Window closed');
            });
            
            // Notify renderer that application is ready
            mainWindow.webContents.on('did-finish-load', () => {
                logInfo('[Main] Window finished loading');
                mainWindow.webContents.send('app:ready', {
                    version: app.getVersion(),
                    platform: process.platform,
                    config: appConfig.common
                });
            });
            
            mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                logError('[Main] Window failed to load:', errorCode, errorDescription);
            });
            
            mainWindow.webContents.on('crashed', (event, killed) => {
                logError('[Main] Window crashed:', killed);
            });
            
            // Open DevTools in development
            if (isDevelopment) {
                mainWindow.webContents.openDevTools();
            }
            
        } else {
            logError('[Main] Failed to create main window - window is null');
            throw new Error('Failed to create main window');
        }
        
        // Set up global shortcuts (imported from config)
        setupGlobalShortcuts();
        
        logInfo('[Main] Application initialized successfully');
        
    } catch (error) {
        logError('[Main] Failed to initialize application:', error);
        dialog.showErrorBox('Initialization Error', 
            `Failed to start application: ${error.message}`);
        app.quit();
    }
});

// Handle all windows being closed
app.on('window-all-closed', () => {
    logDebug('[Main] All windows closed');
    
    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle app reactivation (macOS specific)
app.on('activate', async () => {
    logDebug('[Main] App activated');
    
    // On macOS, re-create window when dock icon is clicked
    if (windowManager && windowManager.getWindowCount() === 0) {
        await windowManager.createWindow('main');
    }
});

// Handle app termination
app.on('before-quit', async (event) => {
    logInfo('[Main] Application shutting down...');
    
    // Prevent default quit to save state first
    event.preventDefault();
    
    try {
        // Save all window states
        if (windowManager) {
            windowManager.saveAllWindowStates();
        }
        
        // Save any pending state changes
        if (stateManager) {
            await stateManager.save();
        }
        
        // Clean up IPC handlers
        if (ipcHandler) {
            ipcHandler.cleanup();
        }

        // Shutdown Polygon Bridge
        if (polygonBridge) {
            await polygonBridge.shutdown();
        }
        
        logInfo('[Main] Cleanup complete, quitting...');
        
        // Now actually quit
        app.exit(0);
        
    } catch (error) {
        logError('[Main] Error during shutdown:', error);
        app.exit(1);
    }
});

// Handle certificate errors (important for localhost development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (isDevelopment && url.startsWith('https://localhost')) {
        // Ignore certificate errors in development for localhost
        event.preventDefault();
        callback(true);
    } else {
        // Use default behavior in production
        callback(false);
    }
});

// Set up global keyboard shortcuts
function setupGlobalShortcuts() {
    const { globalShortcut } = require('electron');
    const shortcuts = require('./config/shortcuts.config');
    
    // Register each shortcut from config
    Object.entries(shortcuts.global).forEach(([action, accelerator]) => {
        const success = globalShortcut.register(accelerator, () => {
            logVerbose(`[Main] Global shortcut triggered: ${action}`);
            
            // Send action to focused window
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
                focusedWindow.webContents.send('shortcut:triggered', { action });
            }
        });
        
        if (!success) {
            logWarn(`[Main] Failed to register shortcut: ${accelerator}`);
        }
    });
}

// Export for testing purposes
module.exports = { windowManager, ipcHandler, stateManager, polygonBridge };
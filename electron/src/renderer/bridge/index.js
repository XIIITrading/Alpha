/**
 * Perspective Integration Bridge - Modularized Version
 * 
 * This is the main entry point for the bridge module.
 * It coordinates all sub-modules and provides the public API.
 */

// Import configurations
import { TABLE_CONFIGS } from './config/tableConfigs.js';

// Import state management
import { BridgeState, setState, getMetrics } from './state/bridgeState.js';

// Import core functionality
import { loadPerspective } from './core/initialization.js';

// Import data handling
import { handleDataUpdate } from './data/updateHandler.js';
import { createTable, updateTable } from './data/tableManager.js';

// Import viewer management
import { createViewer, createAllViewers } from './viewers/viewerManager.js';

// Import dashboard utilities
import { cleanupDashboard } from './dashboards/utils.js';

/**
 * Public initialization function
 * Called from index.js
 */
export async function initialize(config) {
    console.log('Initializing AG-Grid bridge...');
    
    // Store configuration
    setState('config', config);
    
    try {
        // Load AG-Grid
        await loadPerspective();
        
        // Create table configurations
        for (const [tableId, tableConfig] of Object.entries(TABLE_CONFIGS)) {
            await createTable(tableId, tableConfig);
        }
        
        // Create viewers
        await createAllViewers();
        
        // Expose bridge API to window for debugging
        window.PerspectiveBridge = {
            handleDataUpdate,
            updateTable,
            getTables: () => BridgeState.tables,
            getViewers: () => BridgeState.viewers,
            getDashboards: () => BridgeState.dashboards,
            getMetrics: () => ({
                ...getMetrics(),
                // Add GridManager metrics
                ...(BridgeState.gridManager?.getMetrics ? BridgeState.gridManager.getMetrics() : {})
            }),
            // Add GridManager reference for debugging
            gridManager: BridgeState.gridManager,
            cleanupDashboard,
            // Add grid ready check
            isGridReady: (gridId) => {
                const gridInfo = BridgeState.gridManager?.getGrid(gridId);
                return gridInfo && gridInfo.api && !gridInfo.api.isDestroyed();
            }
        };
        
        console.log('AG-Grid bridge initialized successfully');
        
        // Process any pending market updates
        if (window.pendingMarketUpdates && window.pendingMarketUpdates.length > 0) {
            console.log(`Processing ${window.pendingMarketUpdates.length} queued market updates`);
            window.pendingMarketUpdates.forEach(update => {
                window.PerspectiveBridge.handleDataUpdate(update);
            });
            window.pendingMarketUpdates = [];
        }
        
        // Notify ready callback
        if (config.callbacks.onReady) {
            config.callbacks.onReady();
        }
        
    } catch (error) {
        console.error('Failed to initialize AG-Grid bridge:', error);
        if (config.callbacks.onError) {
            config.callbacks.onError(error);
        }
        throw error;
    }
}

/**
 * Export individual functions for testing
 */
export {
    createTable,
    createViewer,
    updateTable,
    handleDataUpdate
};
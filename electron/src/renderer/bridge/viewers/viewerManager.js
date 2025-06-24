/**
 * Viewer Manager
 * Manages AG-Grid viewer creation and lifecycle
 */

import { BridgeState } from '../state/bridgeState.js';
import { TABLE_CONFIGS } from '../config/tableConfigs.js';
import { createPreMarketDashboard } from '../dashboards/index.js';

/**
 * Create an AG-Grid viewer for a table
 * @param {string} tabId - Tab identifier
 * @param {string} tableId - Table to display
 * @param {object} container - DOM container for viewer
 */
export async function createViewer(tabId, tableId, container) {
    console.log(`Creating viewer for tab: ${tabId}, table: ${tableId}`);
    
    try {
        // Check if this is the pre-market tab
        if (tableId === 'premarket') {
            const dashboard = await createPreMarketDashboard(tabId, container);
            
            // Store viewer reference with consistent structure
            const viewer = {
                element: dashboard,
                container: container,
                isDashboard: true,
                instance: {
                    // Add notifyResize method for dashboards
                    notifyResize: () => {
                        const dashboardState = BridgeState.dashboards.get(tabId);
                        if (dashboardState && dashboardState.grids) {
                            // Resize all grids in the dashboard
                            Object.entries(dashboardState.grids).forEach(([gridId, gridApi]) => {
                                // Get grid info through GridManager
                                const gridInfo = BridgeState.gridManager.getGrid(`pm-${gridId}`);
                                if (gridInfo && gridInfo.api && !gridInfo.api.isDestroyed()) {
                                    try {
                                        gridInfo.api.sizeColumnsToFit();
                                    } catch (e) {
                                        console.log(`Grid ${gridId} resize error:`, e);
                                    }
                                }
                            });
                        }
                    }
                }
            };
            
            // Store in viewers map
            BridgeState.viewers.set(tabId, viewer);
            
            return viewer;
        }
        
        // Get table configuration for standard tables
        const tableConfig = TABLE_CONFIGS[tableId];
        if (!tableConfig) {
            throw new Error(`Unknown table configuration: ${tableId}`);
        }
        
        // Create container div for the grid
        const gridContainer = document.createElement('div');
        gridContainer.id = `grid-container-${tabId}`;
        gridContainer.style.width = '100%';
        gridContainer.style.height = '100%';
        container.appendChild(gridContainer);
        
        // Create AG-Grid instance
        const gridApi = await BridgeState.gridManager.createGrid(
            tableId,
            gridContainer,
            tableConfig
        );
        
        // Create viewer object with consistent structure
        const viewer = {
            element: gridContainer,
            grid: gridApi,
            tableId: tableId,
            container: container,
            instance: {
                // Add notifyResize method that calls AG-Grid's sizeColumnsToFit
                notifyResize: () => {
                    const gridInfo = BridgeState.gridManager.getGrid(tableId);
                    if (gridInfo && gridInfo.api && !gridInfo.api.isDestroyed()) {
                        try {
                            gridInfo.api.sizeColumnsToFit();
                        } catch (e) {
                            console.log(`Grid ${tableId} resize error:`, e);
                        }
                    }
                }
            }
        };
        
        // Store viewer reference
        BridgeState.viewers.set(tabId, viewer);
        
        // Set up event handlers
        setupViewerEvents(tabId, gridContainer);
        
        // Load saved view configuration if exists
        await loadViewerState(tabId, gridContainer);
        
        console.log(`AG-Grid created for ${tabId}`);
        
        return viewer;
        
    } catch (error) {
        console.error(`Failed to create AG-Grid for ${tabId}:`, error);
        throw error;
    }
}

/**
 * Set up event handlers for a viewer
 * @param {string} tabId - Tab identifier
 * @param {HTMLElement} gridContainer - Grid container element
 */
export function setupViewerEvents(tabId, gridContainer) {
    // AG-Grid handles most events internally
    // Add any custom event handlers here if needed
    console.log(`Events configured for ${tabId}`);
}

/**
 * Load saved viewer state
 * @param {string} tabId - Tab identifier
 * @param {HTMLElement} gridContainer - Grid container element
 */
export async function loadViewerState(tabId, gridContainer) {
    // AG-Grid state management can be implemented here
    // For now, we'll skip this as AG-Grid handles its own state well
    console.log(`State loading for ${tabId} - not implemented yet`);
}

/**
 * Create all viewers for tabs
 */
export async function createAllViewers() {
    const { AppState, Elements, callbacks } = BridgeState.config;
    
    // Create a viewer for each tab
    for (const tab of AppState.tabs) {
        try {
            // Create container div
            const container = document.createElement('div');
            container.id = `viewer-container-${tab.id}`;
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.display = tab.id === AppState.activeTab ? 'block' : 'none';
            
            // Add to tab content
            Elements.tabContent.appendChild(container);
            
            // Create viewer (dashboard or single grid)
            const viewer = await createViewer(tab.id, tab.id, container);
            
            // Notify callback
            if (callbacks.onViewerCreated) {
                callbacks.onViewerCreated(tab.id, viewer);
            }
            
        } catch (error) {
            console.error(`Failed to create viewer for ${tab.id}:`, error);
        }
    }
}

/**
 * Get viewer by tab ID
 */
export function getViewer(tabId) {
    return BridgeState.viewers.get(tabId);
}

/**
 * Get all viewer IDs
 */
export function getViewerIds() {
    return Array.from(BridgeState.viewers.keys());
}
/**
 * Dashboard Utilities
 * Common utilities for dashboard management
 */

import { BridgeState } from '../state/bridgeState.js';

/**
 * Cleanup dashboard resources
 */
export function cleanupDashboard(tabId) {
    const dashboard = BridgeState.dashboards.get(tabId);
    if (!dashboard) return;
    
    // Clear update intervals
    dashboard.updateIntervals.forEach(interval => clearInterval(interval));
    
    // Destroy grids
    Object.values(dashboard.grids).forEach(gridApi => {
        if (gridApi && !gridApi.isDestroyed()) {
            gridApi.destroy();
        }
    });
    
    // Remove from state
    BridgeState.dashboards.delete(tabId);
}

/**
 * Get dashboard state
 */
export function getDashboardState(tabId) {
    return BridgeState.dashboards.get(tabId);
}

/**
 * Check if tab is a dashboard
 */
export function isDashboard(tabId) {
    return BridgeState.dashboards.has(tabId);
}
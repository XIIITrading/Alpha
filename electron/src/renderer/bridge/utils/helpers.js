/**
 * Helper Utilities
 * Common helper functions used across modules
 */

import { BridgeState } from '../state/bridgeState.js';

/**
 * Wait for grids to be ready before sizing
 */
export async function waitForGridsReady(gridIds) {
    const maxWaitTime = 5000; // 5 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
        const allReady = gridIds.every(id => {
            const gridInfo = BridgeState.gridManager.getGrid(id);
            return gridInfo && gridInfo.api && !gridInfo.api.isDestroyed();
        });
        
        if (allReady) {
            // Size columns after grids are ready
            gridIds.forEach(id => {
                const gridInfo = BridgeState.gridManager.getGrid(id);
                if (gridInfo && gridInfo.api) {
                    // Use setTimeout to ensure DOM is ready
                    setTimeout(() => {
                        try {
                            gridInfo.api.sizeColumnsToFit();
                        } catch (e) {
                            console.log(`Grid ${id} not ready for sizing yet`);
                        }
                    }, 100);
                }
            });
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.warn('Some grids did not become ready in time');
}

/**
 * Update panel status text
 */
export function updatePanelStatus(panelId, status) {
    const statusElement = document.getElementById(`status-${panelId}`);
    if (statusElement) {
        statusElement.textContent = status;
    }
}
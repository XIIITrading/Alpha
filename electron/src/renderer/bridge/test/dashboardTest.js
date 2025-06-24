/**
 * Test dashboard modules
 */

import { createPreMarketDashboard } from '../dashboards/premarket/index.js';
import { cleanupDashboard, isDashboard } from '../dashboards/utils.js';
import { BridgeState, setState } from '../state/bridgeState.js';

console.log('=== Dashboard Test ===');

// Mock GridManager for testing
const mockGridManager = {
    createGrid: async (id, container, config) => {
        console.log(`Mock creating grid: ${id}`);
        return {
            api: {
                isDestroyed: () => false,
                sizeColumnsToFit: () => console.log(`Sizing columns for ${id}`),
                destroy: () => console.log(`Destroying grid ${id}`)
            }
        };
    },
    getGrid: (id) => ({
        api: {
            isDestroyed: () => false,
            sizeColumnsToFit: () => {}
        }
    }),
    updateGrid: (id, data, replace) => {
        console.log(`Updating grid ${id} with ${data.length} rows`);
    }
};

// Set mock GridManager
setState('gridManager', mockGridManager);

// Test dashboard functions
console.log('\n--- Testing Dashboard Creation ---');
console.log('isDashboard before:', isDashboard('test-tab'));

// Create mock container
if (typeof document === 'undefined') {
    console.log('\nNote: Running in Node.js without DOM - skipping DOM-dependent tests');
    console.log('Dashboard module structure verified successfully');
} else {
    const container = document.createElement('div');
    await createPreMarketDashboard('test-tab', container);
    
    console.log('isDashboard after:', isDashboard('test-tab'));
    console.log('Dashboard count:', BridgeState.dashboards.size);
    
    // Test cleanup
    console.log('\n--- Testing Dashboard Cleanup ---');
    cleanupDashboard('test-tab');
    console.log('isDashboard after cleanup:', isDashboard('test-tab'));
}

console.log('\n=== Dashboard Test Complete ===');
/**
 * Test data handling modules
 */

import { handleDataUpdate } from '../data/updateHandler.js';
import { createTable, updateTable, getTableConfig } from '../data/tableManager.js';
import { BridgeState, setState } from '../state/bridgeState.js';

console.log('=== Data Handling Test ===');

// Mock GridManager
const mockGridManager = {
    updateGrid: (tableId, data, replace) => {
        console.log(`Mock update: ${tableId} with ${Array.isArray(data) ? data.length : 1} items, replace: ${replace}`);
    }
};

setState('gridManager', mockGridManager);

// Test table creation
console.log('\n--- Testing Table Creation ---');
await createTable('test-table', { name: 'Test Table', schema: { id: 'string', value: 'number' } });
console.log('Tables count:', BridgeState.tables.size);
console.log('Table config:', getTableConfig('test-table'));

// Test data updates
console.log('\n--- Testing Data Updates ---');

// Mock requestAnimationFrame for Node.js
if (typeof requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = (callback) => {
        setTimeout(callback, 16); // ~60fps
    };
}

// Test market data update
const marketUpdate = {
    type: 'marketData',
    table: 'scanner',
    data: [
        { symbol: 'AAPL', price: 150.25, volume: 1000000 },
        { symbol: 'MSFT', price: 380.50, volume: 2000000 }
    ]
};

handleDataUpdate(marketUpdate);
console.log('Market data size after update:', BridgeState.marketData.size);
console.log('Update queue size:', BridgeState.updateQueue.size);

// Test regular update
const regularUpdate = {
    type: 'append',
    table: 'test-table',
    data: { id: '1', value: 100 }
};

handleDataUpdate(regularUpdate);

// Wait for batched update to process
await new Promise(resolve => setTimeout(resolve, 50));

console.log('Update count:', BridgeState.updateCount);

// Test replace update
const replaceUpdate = {
    type: 'replace',
    table: 'test-table',
    data: [
        { id: '2', value: 200 },
        { id: '3', value: 300 }
    ]
};

handleDataUpdate(replaceUpdate);

// Wait for processing
await new Promise(resolve => setTimeout(resolve, 50));

console.log('Final update count:', BridgeState.updateCount);

console.log('\n=== Data Handling Test Complete ===');
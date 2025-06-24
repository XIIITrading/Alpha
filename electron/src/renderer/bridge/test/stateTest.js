/**
 * Test state management
 */

import { BridgeState, setState, getState, updateMarketData, getMarketData, getMetrics } from '../state/bridgeState.js';

console.log('=== State Management Test ===');

// Test initial state
console.log('\nInitial state:');
console.log('gridManager:', BridgeState.gridManager);
console.log('tables size:', BridgeState.tables.size);
console.log('viewers size:', BridgeState.viewers.size);

// Test setState/getState
console.log('\nTesting setState/getState:');
setState('config', { testValue: 123 });
console.log('config after setState:', getState('config'));

// Test market data functions
console.log('\nTesting market data:');
updateMarketData('AAPL', { price: 150.25, volume: 1000000 });
updateMarketData('MSFT', { price: 380.50, volume: 2000000 });
console.log('AAPL data:', getMarketData('AAPL'));
console.log('Market data size:', BridgeState.marketData.size);

// Test metrics
console.log('\nTesting metrics:');
console.log('Metrics:', getMetrics());

// Test Maps
console.log('\nTesting Maps:');
BridgeState.tables.set('scanner', { config: {}, rowCount: 0 });
BridgeState.viewers.set('tab1', { element: null });
console.log('Updated metrics:', getMetrics());

console.log('\n=== State Test Complete ===');
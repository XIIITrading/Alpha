/**
 * Test calculation modules
 */

import { GapScannerModule, MarketStructureModule, HVNProximityModule, MomentumModule } from '../modules/index.js';
import { updateMarketData } from '../state/bridgeState.js';

console.log('=== Modules Test ===');

// Set up test market data
const testData = new Map([
    ['AAPL', {
        symbol: 'AAPL',
        price: 150.25,
        previousClose: 145.00,
        preMarketPrice: 151.00,
        volume: 1000000,
        avgVolume: 800000,
        relativeVolume: 1.25,
        change: 5.25,
        levels: [
            { level: 148.50, type: 'SUPPORT', strength: 3 },
            { level: 152.00, type: 'RESISTANCE', strength: 4 }
        ]
    }],
    ['MSFT', {
        symbol: 'MSFT',
        price: 380.50,
        previousClose: 375.00,
        preMarketPrice: 382.00,
        volume: 2000000,
        avgVolume: 1500000,
        relativeVolume: 1.33,
        change: 5.50,
        levels: [
            { level: 378.00, type: 'SUPPORT', strength: 2 },
            { level: 385.00, type: 'RESISTANCE', strength: 5 }
        ]
    }]
]);

// Update state with test data
testData.forEach((data, symbol) => updateMarketData(symbol, data));

// Test Gap Scanner
console.log('\n--- Testing Gap Scanner ---');
const gapScanner = new GapScannerModule(null); // null gridManager for testing
const gaps = await gapScanner.calculate(testData);
console.log('Gap results:', gaps.length);
console.log('First gap:', gaps[0]);

// Test Market Structure
console.log('\n--- Testing Market Structure ---');
const marketStructure = new MarketStructureModule(null);
const structure = await marketStructure.calculate(testData);
console.log('Structure results:', structure.length);
console.log('First structure:', structure[0]);

// Test HVN Proximity
console.log('\n--- Testing HVN Proximity ---');
const hvnProximity = new HVNProximityModule(null, null);
const hvn = await hvnProximity.calculate(['AAPL', 'MSFT']);
console.log('HVN results:', hvn.length);
console.log('First HVN:', hvn[0]);

// Test Momentum
console.log('\n--- Testing Momentum ---');
const momentum = new MomentumModule(null);
const momentumResults = await momentum.calculate(testData);
console.log('Momentum results:', momentumResults.length);
console.log('First momentum:', momentumResults[0]);

console.log('\n=== Modules Test Complete ===');
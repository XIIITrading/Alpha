/**
 * Core Module Test
 * Verifies core grid functionality
 */

import { ColumnBuilder, GridEvents, GridCreator } from '../core/index.js';
import { gridState } from '../state/index.js';

console.log('=== Core Module Test ===\n');

// Mock AG-Grid
global.agGrid = {
    createGrid: (div, options) => {
        return {
            setGridOption: () => {},
            destroy: () => {},
            isDestroyed: () => false,
            getDisplayedRowCount: () => 0
        };
    }
};

// Mock DOM
global.document = {
    createElement: (tag) => ({
        style: {},
        className: '',
        appendChild: () => {}
    })
};

const tests = [
    {
        name: 'Column Builder',
        test: () => {
            // Test schema
            const schema = {
                symbol: 'string',
                price: 'float',
                changePercent: 'float',
                volume: 'integer'
            };
            
            // Test column building
            const columns = ColumnBuilder.buildColumnDefs('test', schema, null);
            
            if (columns.length !== 4) {
                throw new Error(`Expected 4 columns, got ${columns.length}`);
            }
            
            // Check symbol column has special config
            const symbolCol = columns.find(c => c.field === 'symbol');
            if (!symbolCol.cellClass || symbolCol.cellClass !== 'symbol-cell') {
                throw new Error('Symbol column missing special configuration');
            }
            
            // Check price column has renderer
            const priceCol = columns.find(c => c.field === 'price');
            if (priceCol.cellRenderer !== 'PriceChangeRenderer') {
                throw new Error('Price column missing renderer');
            }
            
            console.log('✓ Column builder working');
            console.log(`  - Built ${columns.length} columns from schema`);
            console.log(`  - Applied special configurations`);
        }
    },
    {
        name: 'Header Formatter',
        test: () => {
            // Test various field names
            const tests = [
                ['symbol', 'Symbol'],
                ['changePercent', 'Change Percent'],
                ['preMarketVolume', 'Pre Market Volume'],
                ['hvnStrength', 'HVN Strength'],
                ['unrealizedPL', 'Unrealized P&L']
            ];
            
            for (const [input, expected] of tests) {
                const result = ColumnBuilder.formatHeader(input);
                if (result !== expected) {
                    throw new Error(`Header format failed: ${input} → ${result}, expected ${expected}`);
                }
            }
            
            console.log('✓ Header formatter working');
            console.log('  - Correctly formats camelCase to Title Case');
            console.log('  - Handles special abbreviations');
        }
    },
    {
        name: 'Grid Events',
        test: () => {
            // Test event handler creation
            const onGridReady = GridEvents.createOnGridReady('test-table');
            const onRowDataUpdated = GridEvents.createOnRowDataUpdated('test-table');
            const onGridSizeChanged = GridEvents.createOnGridSizeChanged('test-table');
            
            if (typeof onGridReady !== 'function') {
                throw new Error('onGridReady is not a function');
            }
            if (typeof onRowDataUpdated !== 'function') {
                throw new Error('onRowDataUpdated is not a function');
            }
            if (typeof onGridSizeChanged !== 'function') {
                throw new Error('onGridSizeChanged is not a function');
            }
            
            console.log('✓ Grid events working');
            console.log('  - Event handlers created successfully');
        }
    },
    {
        name: 'Grid Creator',
        test: async () => {
            // Mock container
            const mockContainer = {
                innerHTML: '',
                appendChild: () => {}
            };
            
            // Test config
            const tableConfig = {
                schema: {
                    symbol: 'string',
                    price: 'float'
                },
                defaultView: {
                    columns: ['symbol', 'price']
                }
            };
            
            try {
                const api = await GridCreator.createGrid('test-grid', mockContainer, tableConfig);
                
                if (!api) {
                    throw new Error('Grid API not returned');
                }
                
                // Check grid was registered
                if (!gridState.hasGrid('test-grid')) {
                    throw new Error('Grid not registered in state');
                }
                
                console.log('✓ Grid creator working');
                console.log('  - Grid created and registered');
                
                // Cleanup
                gridState.removeGrid('test-grid');
                
            } catch (error) {
                throw new Error(`Grid creation failed: ${error.message}`);
            }
        }
    }
];

// Run tests
let passed = 0;
let failed = 0;

for (const { name, test } of tests) {
    try {
        await test();
        passed++;
    } catch (error) {
        console.error(`✗ ${name}: ${error.message}`);
        failed++;
    }
}

console.log(`\n=== Summary ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${tests.length}`);

if (failed === 0) {
    console.log('\n✅ All core tests passed!');
} else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
}
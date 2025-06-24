/**
 * State Management Test
 * Verifies state management functionality
 * Updated for Phase 2 to include renderer registration testing
 */

console.log('=== State Management Test ===\n');

import { gridState, GridState } from '../state/index.js';

// Test state functionality
const tests = [
    {
        name: 'State Instance',
        test: () => {
            console.log('✓ State instance created');
            console.log(`  - Type: ${gridState.constructor.name}`);
            console.log(`  - Is GridState: ${gridState instanceof GridState}`);
            
            if (!gridState) throw new Error('State instance not created');
        }
    },
    {
        name: 'Grid Management',
        test: () => {
            // Test adding grid
            const testGrid = {
                api: { mock: true },
                gridOptions: {},
                gridDiv: {},
                container: {},
                config: {}
            };
            
            gridState.addGrid('test-grid', testGrid);
            
            if (!gridState.hasGrid('test-grid')) {
                throw new Error('Grid not added');
            }
            
            const retrieved = gridState.getGrid('test-grid');
            if (retrieved !== testGrid) {
                throw new Error('Grid retrieval failed');
            }
            
            console.log('✓ Grid management working');
            console.log(`  - Grids count: ${gridState.getAllGrids().size}`);
            
            // Test removal
            gridState.removeGrid('test-grid');
            if (gridState.hasGrid('test-grid')) {
                throw new Error('Grid removal failed');
            }
        }
    },
    {
        name: 'Update Queue',
        test: () => {
            const tableId = 'test-table';
            const update1 = { data: [{ symbol: 'AAPL' }], timestamp: Date.now() };
            const update2 = { data: [{ symbol: 'GOOGL' }], timestamp: Date.now() };
            
            gridState.addToUpdateQueue(tableId, update1);
            gridState.addToUpdateQueue(tableId, update2);
            
            const queue = gridState.getUpdateQueue(tableId);
            if (queue.length !== 2) {
                throw new Error(`Queue length incorrect: ${queue.length}`);
            }
            
            console.log('✓ Update queue working');
            console.log(`  - Queue length: ${queue.length}`);
            
            gridState.clearUpdateQueue(tableId);
            if (gridState.getUpdateQueue(tableId).length !== 0) {
                throw new Error('Queue clear failed');
            }
        }
    },
    {
        name: 'Update Scheduling',
        test: () => {
            gridState.setUpdateScheduled(true);
            if (!gridState.isUpdateScheduled()) {
                throw new Error('Update scheduling set failed');
            }
            
            gridState.setUpdateScheduled(false);
            if (gridState.isUpdateScheduled()) {
                throw new Error('Update scheduling clear failed');
            }
            
            console.log('✓ Update scheduling working');
        }
    },
    {
        name: 'Performance Tracking',
        test: () => {
            const tableId = 'perf-test';
            
            gridState.incrementUpdateCount(tableId);
            gridState.incrementUpdateCount(tableId);
            gridState.incrementUpdateCount(tableId);
            
            if (gridState.getUpdateCount(tableId) !== 3) {
                throw new Error('Update count incorrect');
            }
            
            if (gridState.getTotalUpdateCount() < 3) {
                throw new Error('Total update count incorrect');
            }
            
            console.log('✓ Performance tracking working');
            console.log(`  - Update count: ${gridState.getUpdateCount(tableId)}`);
            console.log(`  - Total updates: ${gridState.getTotalUpdateCount()}`);
        }
    },
    {
        name: 'Component Registration',
        test: () => {
            const mockRenderer = class MockRenderer {};
            const mockFormatter = (params) => params.value;
            const mockComparator = (a, b) => a - b;
            
            gridState.registerCellRenderer('MockRenderer', mockRenderer);
            gridState.registerValueFormatter('mockFormat', mockFormatter);
            gridState.registerComparator('mockCompare', mockComparator);
            
            if (!gridState.cellRenderers.MockRenderer) {
                throw new Error('Cell renderer registration failed');
            }
            
            console.log('✓ Component registration working');
            console.log(`  - Renderers: ${Object.keys(gridState.cellRenderers).length}`);
            console.log(`  - Formatters: ${Object.keys(gridState.valueFormatters).length}`);
            console.log(`  - Comparators: ${Object.keys(gridState.comparators).length}`);
        }
    },
    {
        name: 'Cell Renderer Registration (Phase 2)',
        test: () => {
            // Check that cell renderers were auto-registered
            const rendererCount = Object.keys(gridState.cellRenderers).length;
            
            // Note: This count includes the MockRenderer from previous test
            if (rendererCount < 6) {
                throw new Error(`Expected at least 6 cell renderers, found ${rendererCount}`);
            }
            
            // Verify specific renderers exist
            const expectedRenderers = [
                'PriceChangeRenderer',
                'PLRenderer',
                'VolumeBarRenderer',
                'AlertRenderer',
                'SignalStrengthRenderer',
                'GapTypeRenderer'
            ];
            
            for (const name of expectedRenderers) {
                if (!gridState.cellRenderers[name]) {
                    throw new Error(`Missing renderer: ${name}`);
                }
            }
            
            console.log('✓ Cell renderer auto-registration working (Phase 2)');
            console.log(`  - Auto-registered renderers: ${expectedRenderers.length}`);
            console.log(`  - Total renderers: ${rendererCount}`);
        }
    },
    {
        name: 'Configuration',
        test: () => {
            const testConfig = { test: true };
            gridState.setConfig(testConfig);
            
            if (gridState.getConfig() !== testConfig) {
                throw new Error('Config set/get failed');
            }
            
            gridState.setTheme('test-theme');
            if (gridState.getTheme() !== 'test-theme') {
                throw new Error('Theme set/get failed');
            }
            
            gridState.setFlashDuration(1000);
            if (gridState.getFlashDuration() !== 1000) {
                throw new Error('Flash duration set/get failed');
            }
            
            console.log('✓ Configuration working');
        }
    },
    {
        name: 'Metrics',
        test: () => {
            // Clear state first
            gridState.clear();
            
            // Add test data
            gridState.addGrid('metrics-grid-1', { api: { getDisplayedRowCount: () => 100 } });
            gridState.addGrid('metrics-grid-2', { api: { getDisplayedRowCount: () => 200 } });
            gridState.incrementUpdateCount('metrics-grid-1');
            gridState.incrementUpdateCount('metrics-grid-1');
            gridState.incrementUpdateCount('metrics-grid-2');
            
            const metrics = gridState.getMetrics();
            
            if (metrics.gridCount !== 2) {
                throw new Error(`Grid count incorrect: ${metrics.gridCount}`);
            }
            
            console.log('✓ Metrics working');
            console.log(`  - Grid count: ${metrics.gridCount}`);
            console.log(`  - Total updates: ${metrics.totalUpdates}`);
            console.log(`  - Grid details: ${JSON.stringify(metrics.grids, null, 2)}`);
        }
    },
    {
        name: 'Clear State',
        test: () => {
            gridState.clear();
            
            if (gridState.getAllGrids().size !== 0) {
                throw new Error('Clear failed - grids remain');
            }
            
            if (gridState.getTotalUpdateCount() !== 0) {
                throw new Error('Clear failed - update counts remain');
            }
            
            console.log('✓ State clearing working');
            console.log('  - Note: Cell renderers are preserved during clear (by design)');
        }
    },
    {
        name: 'Formatter and Comparator Registration (Phase 3)',
        test: () => {
            // Check formatters
            const formatterCount = Object.keys(gridState.valueFormatters).length;
            if (formatterCount < 4) {
                throw new Error(`Expected at least 4 formatters, found ${formatterCount}`);
            }
            
            // Verify specific formatters exist
            const expectedFormatters = ['currency', 'percent', 'largeNumber', 'datetime'];
            for (const name of expectedFormatters) {
                if (!gridState.valueFormatters[name]) {
                    throw new Error(`Missing formatter: ${name}`);
                }
            }
            
            // Check comparators
            const comparatorCount = Object.keys(gridState.comparators).length;
            if (comparatorCount < 1) {
                throw new Error(`Expected at least 1 comparator, found ${comparatorCount}`);
            }
            
            if (!gridState.comparators.percentChange) {
                throw new Error('Missing percentChange comparator');
            }
            
            console.log('✓ Formatter and comparator auto-registration working (Phase 3)');
            console.log(`  - Auto-registered formatters: ${formatterCount}`);
            console.log(`  - Auto-registered comparators: ${comparatorCount}`);
        }
    }
];

// Run tests
let passed = 0;
let failed = 0;

for (const { name, test } of tests) {
    try {
        test();
        passed++;
    } catch (error) {
        console.error(`✗ ${name}: ${error.message}`);
        console.error(error.stack);
        failed++;
    }
}

console.log(`\n=== Summary ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${tests.length}`);

if (failed === 0) {
    console.log('\n✅ All state tests passed!');
} else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
}
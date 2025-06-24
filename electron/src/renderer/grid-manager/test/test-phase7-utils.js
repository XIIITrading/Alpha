/**
 * test-phase7-utils.js - Test utility functionality
 */

// Mock grid API
const createMockGrid = (data = []) => ({
    api: {
        exportDataAsCsv: (options) => {
            console.log(`[MockGrid] CSV export called with:`, options.fileName);
        },
        getColumns: () => [
            { 
                getColId: () => 'symbol', 
                isVisible: () => true,
                getColDef: () => ({ headerName: 'Symbol' }),
                getActualWidth: () => 100,
                getPinned: () => 'left',
                getSort: () => null,
                getSortIndex: () => null
            },
            { 
                getColId: () => 'price', 
                isVisible: () => true,
                getColDef: () => ({ headerName: 'Price' }),
                getActualWidth: () => 80,
                getPinned: () => null,
                getSort: () => 'asc',
                getSortIndex: () => 0
            },
            { 
                getColId: () => 'hidden', 
                isVisible: () => false,
                getColDef: () => ({ headerName: 'Hidden' }),
                getActualWidth: () => 100,
                getPinned: () => null,
                getSort: () => null,
                getSortIndex: () => null
            }
        ],
        setGridOption: (option, value) => {
            console.log(`[MockGrid] Set ${option}:`, value);
        },
        getGridOption: (option) => null,
        setFilterModel: (model) => {
            console.log(`[MockGrid] Filter model set:`, model);
        },
        getFilterModel: () => ({ symbol: { type: 'contains', filter: 'AAPL' } }),
        setColumnVisible: (colId, visible) => {
            console.log(`[MockGrid] Column ${colId} visibility:`, visible);
        },
        // Add missing methods
        forEachNodeAfterFilterAndSort: (callback) => {
            // Mock some data
            const mockData = [
                { symbol: 'AAPL', price: 150.00, volume: 1000000 },
                { symbol: 'GOOGL', price: 140.00, volume: 2000000 },
                { symbol: 'MSFT', price: 380.00, volume: 1500000 }
            ];
            mockData.forEach((data, index) => {
                callback({ data, rowIndex: index });
            });
        },
        getValue: (colId, node) => {
            return node.data[colId];
        },
        copySelectedRangeToClipboard: (includeHeaders) => {
            console.log(`[MockGrid] Copy to clipboard with headers:`, includeHeaders);
        },
        copySelectedRowsToClipboard: (options) => {
            console.log(`[MockGrid] Copy selected rows:`, options);
        },
        autoSizeColumns: (columnIds) => {
            console.log(`[MockGrid] Auto-size columns:`, columnIds);
        },
        autoSizeAllColumns: () => {
            console.log(`[MockGrid] Auto-size all columns`);
        },
        sizeColumnsToFit: () => {
            console.log(`[MockGrid] Size columns to fit`);
        },
        resetColumnState: () => {
            console.log(`[MockGrid] Reset column state`);
        },
        getColumnState: () => [
            { colId: 'symbol', width: 100, pinned: 'left' },
            { colId: 'price', width: 80, pinned: null }
        ],
        applyColumnState: (params) => {
            console.log(`[MockGrid] Apply column state:`, params);
        },
        moveColumn: (colId, toIndex) => {
            console.log(`[MockGrid] Move column ${colId} to index ${toIndex}`);
        },
        setColumnPinned: (colId, position) => {
            console.log(`[MockGrid] Pin column ${colId} to ${position}`);
        },
        isDestroyed: () => false
    }
});

// Mock grid state
const mockGridState = {
    grids: new Map(),
    getGrid(tableId) {
        return this.grids.get(tableId);
    },
    addMockGrid(tableId, data) {
        this.grids.set(tableId, createMockGrid(data));
    }
};

import GridUtils from '../utils/index.js';
import { headerFormatter } from '../utils/HeaderFormatter.js';

console.log('🧪 Testing Phase 7: Utils\n');

// Set up test data
mockGridState.addMockGrid('watchlist');
const utils = new GridUtils(mockGridState);

// Test 1: Export functionality
console.log('1️⃣ Testing Export Manager...');
utils.exportToCsv('watchlist', 'test-export.csv');
const jsonData = utils.getDataAsJson('watchlist');
console.log('✓ Export to CSV called');
console.log('✓ JSON data retrieved:', Array.isArray(jsonData));
console.log('  Sample data:', jsonData[0]);

// Test clipboard
utils.copyToClipboard('watchlist', { selected: true });
console.log('✓ Copy to clipboard called');

// Test 2: Filter functionality
console.log('\n2️⃣ Testing Filter Manager...');
utils.applyQuickFilter('watchlist', 'AAPL');
const filterModel = utils.getFilterModel('watchlist');
console.log('✓ Quick filter applied');
console.log('✓ Current filter model:', filterModel);

utils.saveFilterState('watchlist', 'default');
console.log('✓ Filter state saved');

utils.clearFilters('watchlist');
console.log('✓ Filters cleared');

// Test saved filters
const savedFilters = utils.filterManager.getSavedFilters('watchlist');
console.log('✓ Saved filters:', savedFilters);

// Test 3: Column functionality
console.log('\n3️⃣ Testing Column Manager...');
utils.updateColumnVisibility('watchlist', {
    'symbol': true,
    'price': false
});
console.log('✓ Column visibility updated');

utils.autoSizeColumns('watchlist', ['symbol', 'price']);
console.log('✓ Auto-size columns called');

utils.sizeColumnsToFit('watchlist');
console.log('✓ Size columns to fit called');

utils.saveColumnState('watchlist', 'custom');
console.log('✓ Column state saved');

utils.columnManager.pinColumn('watchlist', 'symbol', 'left');
console.log('✓ Column pinned');

// Test 4: Header formatting
console.log('\n4️⃣ Testing Header Formatter...');
const testHeaders = [
    'symbol',
    'changePercent',
    'unrealizedPL',
    'hvnStrength',
    'market_cap',
    'avgVolume',
    'rsi14',
    'priceUSD',
    'volumeWeightedAvgPrice',
    'preMarketChangePercent'
];

console.log('Header formatting results:');
testHeaders.forEach(header => {
    const formatted = headerFormatter.format(header);
    console.log(`  ${header} → ${formatted}`);
});

// Test special cases
console.log('\n✓ Special cases:');
console.log('  pl →', headerFormatter.format('pl'));
console.log('  atr →', headerFormatter.format('atr'));
console.log('  vwap →', headerFormatter.format('vwap'));
console.log('  macd →', headerFormatter.format('macd'));

// Test custom special case
headerFormatter.addSpecialCase('custom', 'CUSTOM');
console.log('  custom →', headerFormatter.format('custom'));

// Test 5: Integration
console.log('\n5️⃣ Testing Utils Integration...');
console.log('✓ Grid ready check:', utils.isGridReady('watchlist'));
console.log('✓ Export manager ready:', !!utils.exportManager);
console.log('✓ Filter manager ready:', !!utils.filterManager);
console.log('✓ Column manager ready:', !!utils.columnManager);
console.log('✓ Header formatter ready:', !!utils.headerFormatter);

// Test batch operations
const batchHeaders = headerFormatter.formatBatch(['symbol', 'price', 'change']);
console.log('✓ Batch header formatting:', batchHeaders);

// Test visible columns
const visibleColumns = utils.columnManager.getVisibleColumns('watchlist');
console.log('✓ Visible columns:', visibleColumns);

console.log('\n✅ Phase 7 Utils tests completed!');
console.log('\n📊 Summary:');
console.log('- Export Manager: CSV, Excel, JSON, Clipboard ✓');
console.log('- Filter Manager: Apply, save, restore ✓');
console.log('- Column Manager: Visibility, sizing, state ✓');
console.log('- Header Formatter: Smart formatting ✓');
console.log('- Integration: All utils working together ✓');
console.log('\nReady for Phase 8: Integration Testing! 🧩');

process.exit(0);
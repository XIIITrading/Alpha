/**
 * Default Grid Configuration
 * Extracted from GridManager.js - Phase 1
 */

/**
 * Functionality:
 * Stores all default AG-Grid options including row heights, performance settings, and column configurations
 * Provides default column definitions and special column configurations
 * Maps schema types to AG-Grid column filters
 * Defines header formatting special cases
 */

export const GRID_DEFAULTS = {
    // Default column definition
    defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: true,
        suppressHeaderMenuButton: false
    },
    
    // Grid sizing
    rowHeight: 28,
    headerHeight: 32,
    floatingFiltersHeight: 32,
    
    // Performance settings
    animateRows: true,
    rowBuffer: 20,
    maxBlocksInCache: 10,
    cacheQuickFilter: true,
    
    // Styling
    rowClass: 'trading-row'
};

// Schema to column definition mappings
export const SCHEMA_TO_COLDEF = {
    string: { filter: 'agTextColumnFilter' },
    float: { filter: 'agNumberColumnFilter', type: 'numericColumn' },
    integer: { filter: 'agNumberColumnFilter', type: 'numericColumn' },
    boolean: { filter: 'agBooleanColumnFilter' },
    datetime: { filter: 'agDateColumnFilter' }
};

// Special column configurations by field name
export const SPECIAL_COLUMNS = {
    symbol: {
        pinned: 'left',
        width: 80,
        cellClass: 'symbol-cell',
        cellStyle: { fontWeight: 'bold' }
    },
    price: {
        cellRenderer: 'PriceChangeRenderer',
        width: 90
    },
    change: {
        cellRenderer: 'PLRenderer',
        width: 80
    },
    changePercent: {
        cellRenderer: 'PLRenderer',
        width: 90,
        comparator: 'percentChange' // Will be resolved later
    },
    preMarketChangePercent: {
        cellRenderer: 'PLRenderer',
        width: 100
    },
    gapPercent: {
        cellRenderer: 'PLRenderer',
        width: 90,
        comparator: 'percentChange' // Will be resolved later
    },
    gapType: {
        cellRenderer: 'GapTypeRenderer',
        width: 80
    },
    volume: {
        cellRenderer: 'VolumeBarRenderer',
        width: 100
    },
    preMarketVolume: {
        cellRenderer: 'VolumeBarRenderer',
        width: 110
    },
    unrealizedPL: {
        cellRenderer: 'PLRenderer',
        width: 100
    },
    unrealizedPLPercent: {
        cellRenderer: 'PLRenderer',
        width: 90
    },
    alerts: {
        cellRenderer: 'AlertRenderer',
        width: 70
    },
    strength: {
        cellRenderer: 'SignalStrengthRenderer',
        width: 120
    },
    hvnStrength: {
        cellRenderer: 'SignalStrengthRenderer',
        width: 120
    },
    marketCap: {
        valueFormatter: 'largeNumber', // Will be resolved later
        width: 100
    },
    timestamp: {
        valueFormatter: 'datetime', // Will be resolved later
        width: 100
    },
    momentum5m: {
        cellRenderer: 'PLRenderer',
        width: 90
    },
    momentum15m: {
        cellRenderer: 'PLRenderer',
        width: 90
    }
};

// Header formatting special cases
export const HEADER_SPECIAL_CASES = {
    'hvn': 'HVN',
    'poc': 'POC',
    'atr': 'ATR',
    'rsi': 'RSI',
    'pl': 'P&L',
    'p l': 'P&L'
};
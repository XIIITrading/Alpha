/**
 * Bridge State Management
 * Centralized state for the bridge module
 */

/**
 * Bridge state management
 */
export const BridgeState = {
    // AG-Grid Manager Instance
    gridManager: null,
    
    // Map of table name to table configuration
    tables: new Map(),
    
    // Map of tab ID to grid configuration
    viewers: new Map(),
    
    // Map of dashboard ID to dashboard configuration
    dashboards: new Map(),
    
    // Update queue for batching high-frequency updates
    updateQueue: new Map(),
    
    // Performance tracking
    updateCount: 0,
    lastUpdateTime: Date.now(),
    
    // Configuration passed from index.js
    config: null,
    
    // Market data store for calculations
    marketData: new Map(),
    
    // Volume profile engine (will be initialized later)
    volumeProfileEngine: null,
    
    // Track grid ready states
    gridReadyStates: new Map()
};

/**
 * State management functions
 */

export function setState(key, value) {
    BridgeState[key] = value;
}

export function getState(key) {
    return BridgeState[key];
}

export function updateMarketData(symbol, data) {
    BridgeState.marketData.set(symbol, data);
}

export function getMarketData(symbol) {
    return BridgeState.marketData.get(symbol);
}

export function getAllMarketData() {
    return BridgeState.marketData;
}

export function incrementUpdateCount() {
    BridgeState.updateCount++;
}

export function getMetrics() {
    return {
        updateCount: BridgeState.updateCount,
        tableCount: BridgeState.tables.size,
        viewerCount: BridgeState.viewers.size,
        dashboardCount: BridgeState.dashboards.size,
        marketDataCount: BridgeState.marketData.size
    };
}

// Default export for convenience
export default BridgeState;
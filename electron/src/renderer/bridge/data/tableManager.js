/**
 * Table Manager
 * Manages table creation and updates
 */

import { BridgeState, incrementUpdateCount } from '../state/bridgeState.js';

/**
 * Create a table configuration
 * @param {string} tableId - Unique table identifier
 * @param {object} config - Table configuration
 */
export async function createTable(tableId, config) {
    console.log(`Creating table configuration: ${tableId}`);
    
    try {
        // Store table configuration
        BridgeState.tables.set(tableId, {
            config: config,
            rowCount: 0
        });
        
        console.log(`Table configuration stored: ${tableId}`);
        return true;
        
    } catch (error) {
        console.error(`Failed to create table ${tableId}:`, error);
        throw error;
    }
}

/**
 * Update table with new data
 * @param {string} tableId - Table to update
 * @param {Array|Object} data - Data to add/update
 * @param {boolean} replace - Replace all data (true) or append (false)
 */
export async function updateTable(tableId, data, replace = false) {
    try {
        // Use GridManager's update method
        if (BridgeState.gridManager) {
            BridgeState.gridManager.updateGrid(tableId, data, replace);
            
            // Track update count
            incrementUpdateCount();
        }
        
    } catch (error) {
        console.error(`Failed to update table ${tableId}:`, error);
    }
}

/**
 * Get table configuration
 * @param {string} tableId - Table identifier
 */
export function getTableConfig(tableId) {
    const table = BridgeState.tables.get(tableId);
    return table ? table.config : null;
}

/**
 * Get all table IDs
 */
export function getTableIds() {
    return Array.from(BridgeState.tables.keys());
}
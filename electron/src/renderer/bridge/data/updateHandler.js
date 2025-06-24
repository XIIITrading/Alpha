/**
 * Data Update Handler
 * Manages incoming data updates and batching for performance
 */

import { BridgeState, updateMarketData } from '../state/bridgeState.js';
import { updateTable } from './tableManager.js';

/**
 * Handle incoming data updates from IPC
 * Implements batching for performance
 * @param {object} update - Update message from main process
 */
export function handleDataUpdate(update) {
    const { type, table, data, options = {} } = update;
    
    // Update market data store if it's market data
    if (type === 'marketData' && data) {
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.symbol) {
                    updateMarketData(item.symbol, item);
                }
            });
        } else if (data.symbol) {
            updateMarketData(data.symbol, data);
        }
    }
    
    // Add to update queue for batching
    if (!BridgeState.updateQueue.has(table)) {
        BridgeState.updateQueue.set(table, []);
    }
    
    BridgeState.updateQueue.get(table).push({
        type,
        data,
        options,
        timestamp: Date.now()
    });
    
    // Process queue on next frame
    scheduleUpdateProcessing();
}

/**
 * Process batched updates
 * Uses requestAnimationFrame for smooth updates
 */
let updateScheduled = false;
export function scheduleUpdateProcessing() {
    if (updateScheduled) return;
    
    updateScheduled = true;
    requestAnimationFrame(async () => {
        updateScheduled = false;
        await processUpdateQueue();
    });
}

/**
 * Process all queued updates
 */
export async function processUpdateQueue() {
    const startTime = performance.now();
    
    for (const [tableId, updates] of BridgeState.updateQueue) {
        if (updates.length === 0) continue;
        
        // Combine updates for efficiency
        const combinedData = [];
        let shouldReplace = false;
        
        for (const update of updates) {
            if (update.type === 'replace') {
                shouldReplace = true;
                combinedData.length = 0; // Clear previous updates
                combinedData.push(...(Array.isArray(update.data) ? update.data : [update.data]));
            } else {
                combinedData.push(...(Array.isArray(update.data) ? update.data : [update.data]));
            }
        }
        
        // Apply updates through GridManager
        await updateTable(tableId, combinedData, shouldReplace);
        
        // Clear processed updates
        updates.length = 0;
    }
    
    // Track latency
    const latency = performance.now() - startTime;
    if (BridgeState.config) {
        BridgeState.config.AppState.metrics.latency = Math.round(latency);
    }
}
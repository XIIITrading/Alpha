/**
 * UpdateProcessor.js - Processes grid updates and transactions
 * 
 * Handles the application of updates to AG-Grid instances,
 * including add/update/remove transactions and previous value tracking.
 */

/**
 * Functionality:
 * Processes grid updates and transactions
 * Handles the application of updates to AG-Grid instances
 * Includes add/update/remove transactions and previous value tracking
 */

class UpdateProcessor {
    constructor(gridState) {
        this.gridState = gridState;
        this.metrics = {
            processed: 0,
            errors: 0,
            lastLatency: 0
        };
    }

    /**
     * Process all queued updates for all grids
     * @param {Map} updateQueues - Map of tableId -> updates array
     */
    processAll(updateQueues) {
        const startTime = performance.now();
        let totalProcessed = 0;

        for (const [tableId, updates] of updateQueues) {
            if (updates.length === 0) continue;
            
            const processed = this.processTableUpdates(tableId, updates);
            totalProcessed += processed;
        }

        this.metrics.lastLatency = performance.now() - startTime;
        this.metrics.processed += totalProcessed;

        return totalProcessed;
    }

    /**
     * Process updates for a specific table
     * @param {string} tableId - Table identifier
     * @param {Array} updates - Array of update objects
     * @returns {number} Number of updates processed
     */
    processTableUpdates(tableId, updates) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !this.isGridReady(grid)) {
            return 0;
        }

        try {
            const transaction = this.buildTransaction(grid, updates);
            this.applyTransaction(grid, transaction, updates);
            return updates.length;
        } catch (error) {
            console.error(`[UpdateProcessor] Error processing updates for ${tableId}:`, error);
            this.metrics.errors++;
            return 0;
        }
    }

    /**
     * Build transaction object from updates
     * @param {Object} grid - Grid instance
     * @param {Array} updates - Update array
     * @returns {Object} Transaction object with add/update/remove arrays
     */
    buildTransaction(grid, updates) {
        let transaction = {
            add: [],
            update: [],
            remove: []
        };

        let shouldReplace = false;

        for (const update of updates) {
            if (update.replace) {
                shouldReplace = true;
                transaction = {
                    add: update.data,
                    update: [],
                    remove: []
                };
                break; // Replace overrides all other updates
            }

            // Process each data item
            update.data.forEach(row => {
                const rowId = this.getRowId(row);
                const existingNode = grid.api.getRowNode(rowId);

                if (existingNode) {
                    // Track previous values for animations
                    const updatedRow = this.trackPreviousValues(row, existingNode.data);
                    transaction.update.push(updatedRow);
                } else {
                    transaction.add.push(row);
                }
            });
        }

        return { transaction, shouldReplace };
    }

    /**
     * Apply transaction to grid
     * @param {Object} grid - Grid instance
     * @param {Object} transactionData - Transaction data
     * @param {Array} updates - Original updates for metadata
     */
    applyTransaction(grid, transactionData, updates) {
        const { transaction, shouldReplace } = transactionData;

        if (shouldReplace) {
            // Replace all data
            grid.api.setGridOption('rowData', transaction.add);
        } else {
            // Apply incremental updates
            const result = grid.api.applyTransaction(transaction);
            
            // Check for development mode in a browser-safe way
            if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
                this.logTransactionResult(result, updates[0]?.tableId);
            }
        }
    }

    /**
     * Track previous values for animation purposes
     * @param {Object} newData - New row data
     * @param {Object} oldData - Existing row data
     * @returns {Object} New data with previous values tracked
     */
    trackPreviousValues(newData, oldData) {
        const tracked = { ...newData };

        // Track price changes for flash animations
        if (newData.price !== undefined && oldData.price !== undefined) {
            tracked._previousPrice = oldData.price;
        }

        // Track other values that might need animation
        const animatedFields = ['change', 'changePercent', 'volume', 'unrealizedPL'];
        animatedFields.forEach(field => {
            if (newData[field] !== undefined && oldData[field] !== undefined) {
                tracked[`_previous${field.charAt(0).toUpperCase() + field.slice(1)}`] = oldData[field];
            }
        });

        return tracked;
    }

    /**
     * Get row ID for a data item
     * @param {Object} row - Row data
     * @returns {string} Row identifier
     */
    getRowId(row) {
        return row.symbol || row.id || `row-${Date.now()}-${Math.random()}`;
    }

    /**
     * Check if grid is ready for updates
     * @param {Object} grid - Grid instance
     * @returns {boolean} True if grid is ready
     */
    isGridReady(grid) {
        return grid && grid.api && !grid.api.isDestroyed();
    }

    /**
     * Log transaction results for debugging
     * @param {Object} result - AG-Grid transaction result
     * @param {string} tableId - Table identifier
     */
    logTransactionResult(result, tableId) {
        if (!result) return;

        const summary = {
            tableId,
            added: result.add?.length || 0,
            updated: result.update?.length || 0,
            removed: result.remove?.length || 0
        };

        if (summary.added > 0 || summary.updated > 0 || summary.removed > 0) {
            console.log('[UpdateProcessor] Transaction applied:', summary);
        }
    }

    /**
     * Get processor metrics
     * @returns {Object} Processing metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics.processed = 0;
        this.metrics.errors = 0;
        this.metrics.lastLatency = 0;
    }
}

export default UpdateProcessor;
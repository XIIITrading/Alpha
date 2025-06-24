/**
 * Update Manager - Main module for grid update management
 * 
 * Coordinates update queuing, processing, and metrics tracking
 * for all grid instances.
 */

import UpdateQueue from './UpdateQueue.js';
import UpdateProcessor from './UpdateProcessor.js';
import UpdateMetrics from './UpdateMetrics.js';

class UpdateManager {
    constructor(gridState) {
        this.gridState = gridState;
        this.queue = new UpdateQueue();
        this.processor = new UpdateProcessor(gridState);
        this.metrics = new UpdateMetrics();

        // Set processor callback
        this.queue.setProcessor(this.processQueues.bind(this));

        // Performance monitoring
        this.monitoringEnabled = false;
        this.monitoringInterval = null;
    }

    /**
     * Add update to queue
     * @param {string} tableId - Table identifier
     * @param {Array|Object} data - Data to update
     * @param {boolean} replace - Whether to replace all data
     */
    update(tableId, data, replace = false) {
        this.queue.add(tableId, data, replace);
        this.metrics.initTable(tableId);
    }

    /**
     * Process all queued updates
     * @param {Map} queues - Update queues from UpdateQueue
     */
    processQueues(queues) {
        const startTime = performance.now();
        const updateCounts = new Map();

        // Process each table's updates
        for (const [tableId, updates] of queues) {
            if (updates.length === 0) continue;

            const count = this.processTableQueue(tableId, updates);
            if (count > 0) {
                updateCounts.set(tableId, count);
            }
        }

        // Record metrics
        const totalLatency = performance.now() - startTime;
        for (const [tableId, count] of updateCounts) {
            this.metrics.recordUpdate(tableId, count, totalLatency / updateCounts.size);
        }

        // Update global state metrics if available
        if (this.gridState.config?.AppState) {
            this.gridState.config.AppState.metrics.latency = Math.round(totalLatency);
        }
    }

    /**
     * Process updates for a single table
     * @param {string} tableId - Table identifier
     * @param {Array} updates - Update array
     * @returns {number} Number of updates processed
     */
    processTableQueue(tableId, updates) {
        try {
            const processed = this.processor.processTableUpdates(tableId, updates);
            
            // Track operation types
            const details = this.analyzeUpdates(updates);
            this.metrics.recordUpdate(tableId, processed, 0, details);
            
            return processed;
        } catch (error) {
            this.metrics.recordError(tableId, error);
            return 0;
        }
    }

    /**
     * Analyze updates to categorize operations
     * @param {Array} updates - Update array
     * @returns {Object} Operation counts
     */
    analyzeUpdates(updates) {
        const details = {
            adds: 0,
            modifications: 0,
            removes: 0
        };

        for (const update of updates) {
            if (update.replace) {
                details.adds += update.data.length;
            } else {
                // In a real scenario, we'd check against existing data
                // For now, assume all are modifications
                details.modifications += update.data.length;
            }
        }

        return details;
    }

    /**
     * Get update metrics
     * @param {string} tableId - Optional table ID for specific metrics
     * @returns {Object} Metrics
     */
    getMetrics(tableId = null) {
        if (tableId) {
            return this.metrics.getTableMetrics(tableId);
        }
        return this.metrics.getAllMetrics();
    }

    /**
     * Check if updates are pending
     * @returns {boolean} True if updates are pending
     */
    hasPendingUpdates() {
        return this.queue.hasPendingUpdates();
    }

    /**
     * Clear pending updates for a table
     * @param {string} tableId - Table identifier
     */
    clearPendingUpdates(tableId) {
        this.queue.clearQueue(tableId);
    }

    /**
     * Enable performance monitoring
     * @param {number} intervalMs - Monitoring interval in milliseconds
     */
    enableMonitoring(intervalMs = 5000) {
        if (this.monitoringInterval) return;

        this.monitoringEnabled = true;
        this.monitoringInterval = setInterval(() => {
            const metrics = this.metrics.exportForMonitoring();
            console.log('[UpdateManager] Performance metrics:', metrics);
            
            // Emit metrics event if event system is available
            if (this.gridState.config?.events) {
                this.gridState.config.events.emit('grid:metrics', metrics);
            }
        }, intervalMs);
    }

    /**
     * Disable performance monitoring
     */
    disableMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.monitoringEnabled = false;
    }

    /**
     * Cleanup for a specific table
     * @param {string} tableId - Table identifier
     */
    cleanupTable(tableId) {
        this.queue.removeQueue(tableId);
        this.metrics.resetTable(tableId);
    }

    /**
     * Reset all metrics
     */
    resetMetrics() {
        this.metrics.resetAll();
        this.processor.resetMetrics();
    }

    /**
     * Destroy the update manager
     */
    destroy() {
        this.disableMonitoring();
        this.queue.clearProcessedQueues();
        this.resetMetrics();
    }

    /**
     * Get queue statistics
     * @returns {Object} Queue statistics
     */
    getQueueStats() {
        return this.queue.getStats();
    }

    /**
     * Force immediate processing of queued updates
     */
    forceProcess() {
        if (this.queue.hasPendingUpdates()) {
            this.queue.scheduleProcessing();
        }
    }
}

export default UpdateManager;

// Export components for advanced usage
export { UpdateQueue, UpdateProcessor, UpdateMetrics };
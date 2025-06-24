/**
 * UpdateQueue.js - Manages queued updates for grid data
 * 
 * Handles batching of updates using requestAnimationFrame for optimal performance.
 * Each grid table maintains its own queue of pending updates.
 */

/**
 * Functionality:
 * Manages queued updates for grid data
 * Handles batching of updates using requestAnimationFrame for optimal performance
 * Each grid table maintains its own queue of pending updates
 */

class UpdateQueue {
    constructor() {
        this.queues = new Map();        // Map of tableId -> update array
        this.scheduled = false;         // Whether processing is scheduled
        this.processor = null;          // Callback for processing updates
    }

    /**
     * Set the processor callback
     * @param {Function} processor - Function to process queued updates
     */
    setProcessor(processor) {
        this.processor = processor;
    }

    /**
     * Add updates to queue for a specific table
     * @param {string} tableId - Table identifier
     * @param {Array|Object} data - Data to update
     * @param {boolean} replace - Whether to replace all data
     */
    add(tableId, data, replace = false) {
        if (!this.queues.has(tableId)) {
            this.queues.set(tableId, []);
        }

        const queue = this.queues.get(tableId);
        queue.push({
            data: Array.isArray(data) ? data : [data],
            replace,
            timestamp: Date.now()
        });

        this.scheduleProcessing();
    }

    /**
     * Schedule update processing using requestAnimationFrame
     */
    scheduleProcessing() {
        if (this.scheduled || !this.processor) return;

        this.scheduled = true;
        requestAnimationFrame(() => {
            this.scheduled = false;
            this.processor(this.queues);
            this.clearProcessedQueues();
        });
    }

    /**
     * Clear all processed queues
     */
    clearProcessedQueues() {
        for (const queue of this.queues.values()) {
            queue.length = 0;
        }
    }

    /**
     * Get queue for a specific table
     * @param {string} tableId - Table identifier
     * @returns {Array} Update queue
     */
    getQueue(tableId) {
        return this.queues.get(tableId) || [];
    }

    /**
     * Check if any updates are pending
     * @returns {boolean} True if updates are pending
     */
    hasPendingUpdates() {
        for (const queue of this.queues.values()) {
            if (queue.length > 0) return true;
        }
        return false;
    }

    /**
     * Clear queue for a specific table
     * @param {string} tableId - Table identifier
     */
    clearQueue(tableId) {
        if (this.queues.has(tableId)) {
            this.queues.get(tableId).length = 0;
        }
    }

    /**
     * Remove queue for a table
     * @param {string} tableId - Table identifier
     */
    removeQueue(tableId) {
        this.queues.delete(tableId);
    }

    /**
     * Get all table IDs with pending updates
     * @returns {Array<string>} Table IDs
     */
    getPendingTableIds() {
        const tableIds = [];
        for (const [tableId, queue] of this.queues) {
            if (queue.length > 0) {
                tableIds.push(tableId);
            }
        }
        return tableIds;
    }

    /**
     * Get update statistics
     * @returns {Object} Statistics about queued updates
     */
    getStats() {
        const stats = {
            totalQueues: this.queues.size,
            totalUpdates: 0,
            queues: {}
        };

        for (const [tableId, queue] of this.queues) {
            stats.totalUpdates += queue.length;
            stats.queues[tableId] = {
                pending: queue.length,
                oldest: queue.length > 0 ? Date.now() - queue[0].timestamp : 0
            };
        }

        return stats;
    }
}

export default UpdateQueue;
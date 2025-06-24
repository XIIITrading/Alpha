/**
 * UpdateMetrics.js - Tracks update performance metrics
 * 
 * Monitors update counts, latency, and performance statistics
 * for grid update operations.
 */

/**
 * Functionality:
 * Tracks update performance metrics
 * Monitors update counts, latency, and performance statistics
 * for grid update operations
 */

class UpdateMetrics {
    constructor() {
        this.metrics = new Map(); // Map of tableId -> metrics
        this.global = {
            totalUpdates: 0,
            totalLatency: 0,
            averageLatency: 0,
            peakLatency: 0,
            lastUpdateTime: null
        };
    }

    /**
     * Initialize metrics for a table
     * @param {string} tableId - Table identifier
     */
    initTable(tableId) {
        if (!this.metrics.has(tableId)) {
            this.metrics.set(tableId, {
                updates: 0,
                adds: 0,
                modifications: 0,
                removes: 0,
                errors: 0,
                lastUpdate: null,
                avgBatchSize: 0,
                totalBatches: 0
            });
        }
    }

    /**
     * Record an update batch
     * @param {string} tableId - Table identifier
     * @param {number} count - Number of updates in batch
     * @param {number} latency - Processing latency in ms
     * @param {Object} details - Additional details (adds, updates, removes)
     */
    recordUpdate(tableId, count, latency, details = {}) {
        this.initTable(tableId);
        const tableMetrics = this.metrics.get(tableId);

        // Update table metrics
        tableMetrics.updates += count;
        tableMetrics.totalBatches++;
        tableMetrics.avgBatchSize = 
            (tableMetrics.avgBatchSize * (tableMetrics.totalBatches - 1) + count) / 
            tableMetrics.totalBatches;
        tableMetrics.lastUpdate = Date.now();

        // Track operation types
        if (details.adds) tableMetrics.adds += details.adds;
        if (details.modifications) tableMetrics.modifications += details.modifications;
        if (details.removes) tableMetrics.removes += details.removes;

        // Update global metrics
        this.global.totalUpdates += count;
        this.global.totalLatency += latency;
        this.global.averageLatency = 
            this.global.totalLatency / this.global.totalUpdates;
        this.global.peakLatency = Math.max(this.global.peakLatency, latency);
        this.global.lastUpdateTime = Date.now();
    }

    /**
     * Record an error
     * @param {string} tableId - Table identifier
     * @param {Error} error - Error object
     */
    recordError(tableId, error) {
        this.initTable(tableId);
        const tableMetrics = this.metrics.get(tableId);
        tableMetrics.errors++;
        
        console.error(`[UpdateMetrics] Error for table ${tableId}:`, error);
    }

    /**
     * Get metrics for a specific table
     * @param {string} tableId - Table identifier
     * @returns {Object} Table metrics
     */
    getTableMetrics(tableId) {
        return this.metrics.get(tableId) || null;
    }

    /**
     * Get all metrics
     * @returns {Object} All metrics including global and per-table
     */
    getAllMetrics() {
        const tableMetrics = {};
        for (const [tableId, metrics] of this.metrics) {
            tableMetrics[tableId] = { ...metrics };
        }

        return {
            global: { ...this.global },
            tables: tableMetrics,
            summary: this.getSummary()
        };
    }

    /**
     * Get metrics summary
     * @returns {Object} Summary statistics
     */
    getSummary() {
        const activeTables = Array.from(this.metrics.entries())
            .filter(([_, m]) => Date.now() - m.lastUpdate < 60000) // Active in last minute
            .length;

        const totalErrors = Array.from(this.metrics.values())
            .reduce((sum, m) => sum + m.errors, 0);

        return {
            activeTables,
            totalTables: this.metrics.size,
            totalErrors,
            updatesPerSecond: this.calculateUpdatesPerSecond(),
            healthStatus: this.getHealthStatus(totalErrors) // Pass errors to avoid recursion
        };
    }

    /**
     * Calculate updates per second (last minute)
     * @returns {number} Updates per second
     */
    calculateUpdatesPerSecond() {
        const oneMinuteAgo = Date.now() - 60000;
        let recentUpdates = 0;

        for (const metrics of this.metrics.values()) {
            if (metrics.lastUpdate > oneMinuteAgo) {
                // Estimate updates in last minute based on average batch size
                const batches = Math.ceil((Date.now() - Math.max(metrics.lastUpdate - 60000, oneMinuteAgo)) / 1000);
                recentUpdates += batches * metrics.avgBatchSize;
            }
        }

        return Math.round(recentUpdates / 60);
    }

    /**
     * Get health status based on metrics
     * @param {number} totalErrors - Total error count (optional)
     * @returns {string} Health status: 'good', 'warning', or 'critical'
     */
    getHealthStatus(totalErrors = null) {
        // Calculate total errors if not provided
        if (totalErrors === null) {
            totalErrors = Array.from(this.metrics.values())
                .reduce((sum, m) => sum + m.errors, 0);
        }
        
        if (this.global.averageLatency > 100 || totalErrors > 10) {
            return 'critical';
        } else if (this.global.averageLatency > 50 || totalErrors > 5) {
            return 'warning';
        }
        return 'good';
    }

    /**
     * Reset metrics for a table
     * @param {string} tableId - Table identifier
     */
    resetTable(tableId) {
        this.metrics.delete(tableId);
    }

    /**
     * Reset all metrics
     */
    resetAll() {
        this.metrics.clear();
        this.global = {
            totalUpdates: 0,
            totalLatency: 0,
            averageLatency: 0,
            peakLatency: 0,
            lastUpdateTime: null
        };
    }

    /**
     * Export metrics for monitoring
     * @returns {Object} Metrics in monitoring-friendly format
     */
    exportForMonitoring() {
        const metrics = this.getAllMetrics();
        
        return {
            timestamp: Date.now(),
            health: metrics.summary.healthStatus,
            performance: {
                avgLatency: Math.round(this.global.averageLatency),
                peakLatency: this.global.peakLatency,
                updatesPerSecond: metrics.summary.updatesPerSecond
            },
            tables: metrics.summary.totalTables,
            errors: metrics.summary.totalErrors
        };
    }
}

export default UpdateMetrics;
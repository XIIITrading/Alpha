/**
 * GridManager - Main Entry Point
 * Complete implementation with all phases integrated
 */

// Import configurations
import { 
    GRID_DEFAULTS, 
    THEMES,
    DEFAULT_THEME,
    ANIMATION_CONFIG
} from './config/index.js';

// Import state management
import { gridState } from './state/index.js';

// Import core functionality (Phase 4)
import { createGrid as coreCreateGrid, safeColumnsFit } from './core/index.js';

// Import update management (Phase 5)
import UpdateManager from './updates/index.js';

// Import style injection (Phase 6)
import { styleInjector } from './styles/index.js';

// Import utilities (Phase 7)
import GridUtils from './utils/index.js';

/**
 * GridManager Class
 * Main class that coordinates all grid functionality
 */
class GridManager {
    constructor(config) {
        // Store global config
        gridState.setConfig(config);
        gridState.setTheme(DEFAULT_THEME);
        gridState.setFlashDuration(ANIMATION_CONFIG.flashDuration);
        
        // Initialize update management (Phase 5)
        this.updateManager = new UpdateManager(gridState);
        
        // Inject styles (Phase 6)
        styleInjector.injectStyles(DEFAULT_THEME);
        
        // Initialize utilities (Phase 7)
        this.utils = new GridUtils(gridState);
        
        // Also expose gridState for the shim
        this.gridState = gridState;
        
        console.log('[GridManager] Initialized with config:', config);
    }
    
    /**
     * Create a new grid instance
     * Implemented in Phase 4
     */
    async createGrid(tableId, container, tableConfig) {
        const grid = await coreCreateGrid(tableId, container, tableConfig);
        
        // Initialize update metrics for this table
        this.updateManager.metrics.initTable(tableId);
        
        return grid;
    }
    
    /**
     * Update grid data with batching support
     * Implemented in Phase 5
     */
    updateGrid(tableId, data, replace = false) {
        this.updateManager.update(tableId, data, replace);
    }
    
    /**
     * Get update metrics
     * @param {string} tableId - Optional table ID for specific metrics
     * @returns {Object} Update metrics
     */
    getUpdateMetrics(tableId = null) {
        return this.updateManager.getMetrics(tableId);
    }
    
    /**
     * Enable performance monitoring for updates
     * @param {number} interval - Monitoring interval in milliseconds
     */
    enableUpdateMonitoring(interval = 5000) {
        this.updateManager.enableMonitoring(interval);
    }
    
    /**
     * Disable performance monitoring
     */
    disableUpdateMonitoring() {
        this.updateManager.disableMonitoring();
    }
    
    /**
     * Check if there are pending updates
     * @returns {boolean} True if updates are pending
     */
    hasPendingUpdates() {
        return this.updateManager.hasPendingUpdates();
    }
    
    /**
     * Clear pending updates for a table
     * @param {string} tableId - Table identifier
     */
    clearPendingUpdates(tableId) {
        this.updateManager.clearPendingUpdates(tableId);
    }
    
    /**
     * Force immediate processing of queued updates
     */
    forceUpdateProcessing() {
        this.updateManager.forceProcess();
    }
    
    /**
     * Get queue statistics
     * @returns {Object} Queue statistics
     */
    getQueueStats() {
        return this.updateManager.getQueueStats();
    }
    
    /**
     * Reset update metrics
     */
    resetUpdateMetrics() {
        this.updateManager.resetMetrics();
    }
    
    // ========== Export Methods (Phase 7) ==========
    
    /**
     * Export grid data to CSV
     */
    exportToCsv(tableId, filename, options) {
        return this.utils.exportToCsv(tableId, filename, options);
    }
    
    /**
     * Export grid data to Excel
     */
    exportToExcel(tableId, filename, options) {
        return this.utils.exportToExcel(tableId, filename, options);
    }
    
    /**
     * Get grid data as JSON
     */
    getDataAsJson(tableId, options) {
        return this.utils.getDataAsJson(tableId, options);
    }
    
    /**
     * Copy data to clipboard
     */
    copyToClipboard(tableId, options) {
        return this.utils.copyToClipboard(tableId, options);
    }
    
    // ========== Filter Methods (Phase 7) ==========
    
    /**
     * Apply quick filter to grid
     */
    applyQuickFilter(tableId, filterText) {
        return this.utils.applyQuickFilter(tableId, filterText);
    }
    
    /**
     * Clear all filters
     */
    clearFilters(tableId) {
        return this.utils.clearFilters(tableId);
    }
    
    /**
     * Get current filter model
     */
    getFilterModel(tableId) {
        return this.utils.getFilterModel(tableId);
    }
    
    /**
     * Set filter model
     */
    setFilterModel(tableId, filterModel) {
        return this.utils.setFilterModel(tableId, filterModel);
    }
    
    /**
     * Save current filter state
     */
    saveFilterState(tableId, name) {
        return this.utils.saveFilterState(tableId, name);
    }
    
    /**
     * Restore saved filter state
     */
    restoreFilterState(tableId, name) {
        return this.utils.restoreFilterState(tableId, name);
    }
    
    /**
     * Get saved filter names
     */
    getSavedFilters(tableId) {
        return this.utils.filterManager.getSavedFilters(tableId);
    }
    
    // ========== Column Methods (Phase 7) ==========
    
    /**
     * Update column visibility
     */
    updateColumnVisibility(tableId, columnVisibility) {
        return this.utils.updateColumnVisibility(tableId, columnVisibility);
    }
    
    /**
     * Auto-size columns
     */
    autoSizeColumns(tableId, columnIds) {
        return this.utils.autoSizeColumns(tableId, columnIds);
    }
    
    /**
     * Size columns to fit viewport
     */
    sizeColumnsToFit(tableId) {
        return this.utils.sizeColumnsToFit(tableId);
    }
    
    /**
     * Save column state
     */
    saveColumnState(tableId, name) {
        return this.utils.saveColumnState(tableId, name);
    }
    
    /**
     * Restore column state
     */
    restoreColumnState(tableId, name) {
        return this.utils.restoreColumnState(tableId, name);
    }
    
    /**
     * Show all columns
     */
    showAllColumns(tableId) {
        return this.utils.columnManager.showAllColumns(tableId);
    }
    
    /**
     * Hide specific columns
     */
    hideColumns(tableId, columnIds) {
        return this.utils.columnManager.hideColumns(tableId, columnIds);
    }
    
    /**
     * Show specific columns
     */
    showColumns(tableId, columnIds) {
        return this.utils.columnManager.showColumns(tableId, columnIds);
    }
    
    /**
     * Pin column
     */
    pinColumn(tableId, columnId, position) {
        return this.utils.columnManager.pinColumn(tableId, columnId, position);
    }
    
    // ========== Utility Methods ==========
    
    /**
     * Format header text (backward compatibility)
     */
    formatHeader(field) {
        return this.utils.formatHeader(field);
    }
    
    /**
     * Update theme
     */
    updateTheme(theme) {
        gridState.setTheme(theme);
        styleInjector.updateTheme(theme);
    }
    
    /**
     * Add custom styles
     */
    addCustomStyles(styles) {
        styleInjector.addCustomStyles(styles);
    }
    
    /**
     * Destroy a grid instance
     */
    destroyGrid(tableId) {
        const grid = gridState.getGrid(tableId);
        if (grid && grid.api && !grid.api.isDestroyed()) {
            grid.api.destroy();
        }
        
        // Clean up update management for this table
        this.updateManager.cleanupTable(tableId);
        
        gridState.removeGrid(tableId);
    }
    
    /**
     * Destroy all grids
     */
    destroy() {
        // Destroy update manager first
        this.updateManager.destroy();
        
        // Then destroy all grids
        gridState.getAllGrids().forEach((grid, tableId) => {
            if (grid && grid.api && !grid.api.isDestroyed()) {
                grid.api.destroy();
            }
        });
        
        // Remove styles
        styleInjector.removeStyles();
        
        // Clear state
        gridState.clear();
    }
    
    /**
     * Resize all grids
     */
    resizeGrids() {
        gridState.getAllGrids().forEach((grid, tableId) => {
            if (grid.api && !grid.api.isDestroyed()) {
                requestAnimationFrame(() => {
                    safeColumnsFit(tableId);
                });
            }
        });
    }
    
    /**
     * Get comprehensive metrics including update metrics
     * @returns {Object} Combined metrics
     */
    getMetrics() {
        const updateMetrics = this.updateManager.getMetrics();
        const gridMetrics = gridState.getMetrics();
        
        return {
            gridCount: gridState.grids.size,
            totalUpdates: updateMetrics.global.totalUpdates,
            averageLatency: Math.round(updateMetrics.global.averageLatency),
            peakLatency: updateMetrics.global.peakLatency,
            health: updateMetrics.summary.healthStatus,
            updatesPerSecond: updateMetrics.summary.updatesPerSecond,
            grids: gridMetrics.grids
        };
    }
    
    // ========== Public API Methods ==========
    
    /**
     * Get grid instance
     */
    getGrid(tableId) {
        return gridState.getGrid(tableId);
    }
    
    /**
     * Check if grid is ready
     */
    isGridReady(tableId) {
        const grid = gridState.getGrid(tableId);
        return grid && grid.api && !grid.api.isDestroyed();
    }
    
    /**
     * Get all grid IDs
     */
    getGridIds() {
        return Array.from(gridState.grids.keys());
    }
    
    /**
     * Get grid configuration
     */
    getGridConfig(tableId) {
        const grid = gridState.getGrid(tableId);
        return grid ? grid.config : null;
    }
    
    // ========== Legacy Support Methods ==========
    
    /**
     * Schedule update processing (legacy support)
     * @deprecated Use updateGrid instead
     */
    scheduleUpdateProcessing() {
        console.warn('[GridManager] scheduleUpdateProcessing is deprecated. Updates are automatically scheduled.');
        this.updateManager.forceProcess();
    }
    
    /**
     * Process update queues (legacy support)
     * @deprecated Updates are processed automatically
     */
    processUpdateQueues() {
        console.warn('[GridManager] processUpdateQueues is deprecated. Updates are processed automatically.');
        this.updateManager.forceProcess();
    }
    
    /**
     * Inject styles (legacy support)
     * @deprecated Styles are injected automatically
     */
    injectStyles() {
        console.warn('[GridManager] injectStyles is deprecated. Styles are injected automatically.');
        return true;
    }
}

// Export the main class
export default GridManager;

// Also export configurations for external use
export {
    GRID_DEFAULTS,
    THEMES,
    DEFAULT_THEME,
    ANIMATION_CONFIG
};

// Export components for advanced usage
export { gridState } from './state/index.js';
export { default as UpdateManager } from './updates/index.js';
export { UpdateQueue, UpdateProcessor, UpdateMetrics } from './updates/index.js';
export { styleInjector } from './styles/index.js';
export { 
    ExportManager, 
    FilterManager, 
    ColumnManager, 
    headerFormatter 
} from './utils/index.js';
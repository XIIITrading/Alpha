/**
 * GridManager.js - Migration Shim
 * 
 * This file provides backward compatibility for the legacy GridManager API
 * while using the new modular grid-manager implementation under the hood.
 * 
 * This allows existing code to continue working without modification
 * while benefiting from the improved modular architecture.
 */

// Import the new modular GridManager
import ModularGridManager from './grid-manager/index.js';

// Import components that might be used directly
import { headerFormatter } from './grid-manager/utils/index.js';

/**
 * GridManager - Legacy API Shim
 * 
 * Maintains the exact same API as the original GridManager
 * but delegates to the new modular implementation
 */
class GridManager {
    constructor(config) {
        // Initialize the modular GridManager
        this._modular = new ModularGridManager(config);
        
        // Legacy properties that might be accessed directly
        this.grids = new Map();
        this.config = config;
        this.updateQueues = new Map();
        this.cellRenderers = {};
        this.theme = 'ag-theme-alpine-dark';
        this.updateScheduled = false;
        this.flashDuration = 500;
        this.updateCounts = new Map();
        
        // Copy cell renderers from the modular version
        this._copyCellRenderers();
        
        console.log('[GridManager Shim] Initialized with backward compatibility');
    }
    
    /**
     * Copy cell renderers for legacy access
     */
    _copyCellRenderers() {
        // Get renderers from the modular state
        const state = this._modular.gridState || {};
        if (state.renderers) {
            state.renderers.forEach((renderer, name) => {
                this.cellRenderers[name] = renderer;
            });
        }
    }
    
    /**
     * Legacy method to get grid reference
     * Some old code might access grids directly via gridManager.grids
     */
    _syncGridsMap() {
        // Clear and repopulate the legacy grids map
        this.grids.clear();
        const gridIds = this._modular.getGridIds();
        gridIds.forEach(id => {
            const grid = this._modular.getGrid(id);
            if (grid) {
                this.grids.set(id, grid);
            }
        });
    }
    
    /**
     * Create a new grid instance
     */
    async createGrid(tableId, container, tableConfig) {
        const result = await this._modular.createGrid(tableId, container, tableConfig);
        this._syncGridsMap();
        
        // Initialize legacy update queue
        this.updateQueues.set(tableId, []);
        
        return result;
    }
    
    /**
     * Update grid data with batching support
     */
    updateGrid(tableId, data, replace = false) {
        // Update legacy queue for backward compatibility
        if (!this.updateQueues.has(tableId)) {
            this.updateQueues.set(tableId, []);
        }
        this.updateQueues.get(tableId).push({
            data: Array.isArray(data) ? data : [data],
            replace,
            timestamp: Date.now()
        });
        
        // Delegate to modular implementation
        return this._modular.updateGrid(tableId, data, replace);
    }
    
    /**
     * Legacy methods that might be called directly
     */
    scheduleUpdateProcessing() {
        return this._modular.scheduleUpdateProcessing();
    }
    
    processUpdateQueues() {
        return this._modular.processUpdateQueues();
    }
    
    /**
     * Destroy a grid instance
     */
    destroyGrid(tableId) {
        const result = this._modular.destroyGrid(tableId);
        this._syncGridsMap();
        this.updateQueues.delete(tableId);
        this.updateCounts.delete(tableId);
        return result;
    }
    
    /**
     * Destroy all grids
     */
    destroy() {
        const result = this._modular.destroy();
        this.grids.clear();
        this.updateQueues.clear();
        this.updateCounts.clear();
        return result;
    }
    
    /**
     * Resize all grids
     */
    resizeGrids() {
        return this._modular.resizeGrids();
    }
    
    /**
     * Get grid instance
     */
    getGrid(tableId) {
        return this._modular.getGrid(tableId);
    }
    
    /**
     * Check if grid is ready
     */
    isGridReady(tableId) {
        return this._modular.isGridReady(tableId);
    }
    
    /**
     * Get metrics - legacy format
     */
    getMetrics() {
        const metrics = this._modular.getMetrics();
        
        // Ensure legacy format
        return {
            gridCount: this.grids.size,
            totalUpdates: metrics.totalUpdates || 0,
            grids: metrics.grids || {}
        };
    }
    
    // ========== Export Methods ==========
    
    exportToCsv(tableId, filename = 'export.csv', options) {
        return this._modular.exportToCsv(tableId, filename, options);
    }
    
    exportToExcel(tableId, filename = 'export.xlsx', options) {
        return this._modular.exportToExcel(tableId, filename, options);
    }
    
    getDataAsJson(tableId, options) {
        return this._modular.getDataAsJson(tableId, options);
    }
    
    copyToClipboard(tableId, options) {
        return this._modular.copyToClipboard(tableId, options);
    }
    
    // ========== Filter Methods ==========
    
    applyQuickFilter(tableId, filterText) {
        return this._modular.applyQuickFilter(tableId, filterText);
    }
    
    clearFilters(tableId) {
        return this._modular.clearFilters(tableId);
    }
    
    getFilterModel(tableId) {
        return this._modular.getFilterModel(tableId);
    }
    
    setFilterModel(tableId, filterModel) {
        return this._modular.setFilterModel(tableId, filterModel);
    }
    
    // ========== Column Methods ==========
    
    updateColumnVisibility(tableId, columnVisibility) {
        return this._modular.updateColumnVisibility(tableId, columnVisibility);
    }
    
    autoSizeColumns(tableId, columnIds) {
        return this._modular.autoSizeColumns(tableId, columnIds);
    }
    
    sizeColumnsToFit(tableId) {
        return this._modular.sizeColumnsToFit(tableId);
    }
    
    // ========== Legacy Methods ==========
    
    /**
     * Initialize cell renderers (legacy - no-op as they're auto-initialized)
     */
    initializeCellRenderers() {
        console.log('[GridManager Shim] initializeCellRenderers called (no-op)');
    }
    
    /**
     * Initialize value formatters (legacy - no-op as they're auto-initialized)
     */
    initializeValueFormatters() {
        console.log('[GridManager Shim] initializeValueFormatters called (no-op)');
        // Return legacy format
        this.valueFormatters = {
            currency: () => {},
            percent: () => {},
            largeNumber: () => {},
            datetime: () => {}
        };
    }
    
    /**
     * Initialize comparators (legacy - no-op as they're auto-initialized)
     */
    initializeComparators() {
        console.log('[GridManager Shim] initializeComparators called (no-op)');
        this.comparators = {
            percentChange: () => 0
        };
    }
    
    /**
     * Format header (legacy method)
     */
    formatHeader(field) {
        return this._modular.formatHeader(field);
    }
    
    /**
     * Inject styles (legacy - no-op as styles are auto-injected)
     */
    injectStyles() {
        console.log('[GridManager Shim] injectStyles called (no-op)');
    }
    
    /**
     * Get column definitions (legacy method)
     */
    getColumnDefs(tableId, schema, defaultView) {
        // This is handled internally by the modular version
        // Return a basic structure for backward compatibility
        const columnDefs = [];
        for (const [field, type] of Object.entries(schema)) {
            columnDefs.push({
                field: field,
                headerName: this.formatHeader(field),
                sortable: true,
                resizable: true
            });
        }
        return columnDefs;
    }
    
    /**
     * Safe columns fit (legacy method)
     */
    safeColumnsFit(tableId) {
        return this._modular.sizeColumnsToFit(tableId);
    }
    
    /**
     * Export filtered data only
     */
    exportFilteredData(tableId, filename = 'filtered-export.csv') {
        return this._modular.exportToCsv(tableId, filename, {
            onlySelected: false,
            allColumns: false
        });
    }
    
    /**
     * Export selected rows
     */
    exportSelectedRows(tableId, filename = 'selected-export.csv') {
        return this._modular.exportToCsv(tableId, filename, {
            onlySelected: true,
            onlySelectedAllPages: true
        });
    }
    
    /**
     * Additional legacy methods that might be used
     */
    saveFilterState(tableId, name) {
        return this._modular.saveFilterState(tableId, name);
    }
    
    restoreFilterState(tableId, name) {
        return this._modular.restoreFilterState(tableId, name);
    }
    
    saveColumnState(tableId, name) {
        return this._modular.saveColumnState(tableId, name);
    }
    
    restoreColumnState(tableId, name) {
        return this._modular.restoreColumnState(tableId, name);
    }
    
    showAllColumns(tableId) {
        return this._modular.showAllColumns(tableId);
    }
    
    hideColumns(tableId, columnIds) {
        return this._modular.hideColumns(tableId, columnIds);
    }
    
    showColumns(tableId, columnIds) {
        return this._modular.showColumns(tableId, columnIds);
    }
}

// Export the shim as default
export default GridManager;

// Also export any direct imports that old code might use
export { headerFormatter };
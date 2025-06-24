/**
 * Utils Module - Main entry point for utility functions
 * 
 * Exports all utility managers and formatters
 */

import ExportManager from './ExportManager.js';
import FilterManager from './FilterManager.js';
import ColumnManager from './ColumnManager.js';
import HeaderFormatter, { headerFormatter } from './HeaderFormatter.js';

// Create a utility facade for the main GridManager
class GridUtils {
    constructor(gridState) {
        this.exportManager = new ExportManager(gridState);
        this.filterManager = new FilterManager(gridState);
        this.columnManager = new ColumnManager(gridState);
        this.headerFormatter = headerFormatter;
    }

    // Export methods
    exportToCsv(tableId, filename, options) {
        return this.exportManager.exportToCsv(tableId, filename, options);
    }

    exportToExcel(tableId, filename, options) {
        return this.exportManager.exportToExcel(tableId, filename, options);
    }

    getDataAsJson(tableId, options) {
        return this.exportManager.getDataAsJson(tableId, options);
    }

    copyToClipboard(tableId, options) {
        return this.exportManager.copyToClipboard(tableId, options);
    }

    // Filter methods
    applyQuickFilter(tableId, filterText) {
        return this.filterManager.applyQuickFilter(tableId, filterText);
    }

    clearFilters(tableId) {
        return this.filterManager.clearFilters(tableId);
    }

    getFilterModel(tableId) {
        return this.filterManager.getFilterModel(tableId);
    }

    setFilterModel(tableId, filterModel) {
        return this.filterManager.setFilterModel(tableId, filterModel);
    }

    saveFilterState(tableId, name) {
        return this.filterManager.saveFilterState(tableId, name);
    }

    restoreFilterState(tableId, name) {
        return this.filterManager.restoreFilterState(tableId, name);
    }

    // Column methods
    updateColumnVisibility(tableId, columnVisibility) {
        return this.columnManager.updateColumnVisibility(tableId, columnVisibility);
    }

    autoSizeColumns(tableId, columnIds) {
        return this.columnManager.autoSizeColumns(tableId, columnIds);
    }

    sizeColumnsToFit(tableId) {
        return this.columnManager.sizeColumnsToFit(tableId);
    }

    saveColumnState(tableId, name) {
        return this.columnManager.saveColumnState(tableId, name);
    }

    restoreColumnState(tableId, name) {
        return this.columnManager.restoreColumnState(tableId, name);
    }

    // Header formatting
    formatHeader(field, options) {
        return this.headerFormatter.format(field, options);
    }

    // Utility method to check grid readiness
    isGridReady(tableId) {
        const grid = this.exportManager.gridState.getGrid(tableId);
        return grid && grid.api && !grid.api.isDestroyed();
    }
}

export default GridUtils;

// Export individual managers for advanced usage
export {
    ExportManager,
    FilterManager,
    ColumnManager,
    HeaderFormatter,
    headerFormatter
};
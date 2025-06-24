/**
 * ExportManager.js - Handles grid data export functionality
 * 
 * Provides methods to export grid data in various formats
 */

class ExportManager {
    constructor(gridState) {
        this.gridState = gridState;
    }

    /**
     * Export grid data to CSV
     * @param {string} tableId - Table identifier
     * @param {string} filename - Output filename
     * @param {Object} options - Export options
     */
    exportToCsv(tableId, filename = 'export.csv', options = {}) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            console.warn(`[ExportManager] Cannot export - grid ${tableId} not ready`);
            return false;
        }

        const exportOptions = {
            fileName: filename,
            columnKeys: this.getVisibleColumns(grid),
            skipColumnHeaders: options.skipHeaders || false,
            skipColumnGroupHeaders: true,
            processHeaderCallback: options.processHeader || this.defaultHeaderProcessor,
            processCellCallback: options.processCell || this.defaultCellProcessor,
            ...options
        };

        try {
            grid.api.exportDataAsCsv(exportOptions);
            console.log(`[ExportManager] Exported ${tableId} to ${filename}`);
            return true;
        } catch (error) {
            console.error(`[ExportManager] Export failed:`, error);
            return false;
        }
    }

    /**
     * Export grid data to Excel
     * @param {string} tableId - Table identifier
     * @param {string} filename - Output filename
     * @param {Object} options - Export options
     */
    exportToExcel(tableId, filename = 'export.xlsx', options = {}) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            console.warn(`[ExportManager] Cannot export - grid ${tableId} not ready`);
            return false;
        }

        // Note: Excel export requires ag-grid-enterprise
        if (!grid.api.exportDataAsExcel) {
            console.warn('[ExportManager] Excel export requires AG-Grid Enterprise');
            // Fall back to CSV
            return this.exportToCsv(tableId, filename.replace('.xlsx', '.csv'), options);
        }

        const exportOptions = {
            fileName: filename,
            columnKeys: this.getVisibleColumns(grid),
            sheetName: options.sheetName || tableId,
            ...options
        };

        try {
            grid.api.exportDataAsExcel(exportOptions);
            console.log(`[ExportManager] Exported ${tableId} to Excel`);
            return true;
        } catch (error) {
            console.error(`[ExportManager] Excel export failed:`, error);
            return false;
        }
    }

    /**
     * Get data as JSON
     * @param {string} tableId - Table identifier
     * @param {Object} options - Export options
     * @returns {Array} Grid data as JSON
     */
    getDataAsJson(tableId, options = {}) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return [];
        }

        const data = [];
        const columns = options.allColumns ? 
            grid.api.getColumns() : 
            this.getVisibleColumns(grid);

        grid.api.forEachNodeAfterFilterAndSort((node) => {
            if (node.data) {
                const row = {};
                columns.forEach(col => {
                    const colId = col.getColId ? col.getColId() : col;
                    row[colId] = grid.api.getValue(colId, node);
                });
                data.push(row);
            }
        });

        return data;
    }

    /**
     * Copy selected data to clipboard
     * @param {string} tableId - Table identifier
     * @param {Object} options - Copy options
     */
    copyToClipboard(tableId, options = {}) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        const copyOptions = {
            includeHeaders: options.includeHeaders !== false,
            includeGroupHeaders: false,
            ...options
        };

        try {
            if (options.selected) {
                grid.api.copySelectedRangeToClipboard(copyOptions.includeHeaders);
            } else {
                grid.api.copySelectedRowsToClipboard(copyOptions);
            }
            console.log(`[ExportManager] Data copied to clipboard`);
            return true;
        } catch (error) {
            console.error(`[ExportManager] Copy failed:`, error);
            return false;
        }
    }

    /**
     * Get visible columns
     * @param {Object} grid - Grid instance
     * @returns {Array} Visible column IDs
     */
    getVisibleColumns(grid) {
        return grid.api.getColumns()
            .filter(col => col.isVisible())
            .map(col => col.getColId());
    }

    /**
     * Default header processor
     * @param {Object} params - Header params
     * @returns {string} Processed header
     */
    defaultHeaderProcessor(params) {
        return params.column.getColDef().headerName || params.column.getColId();
    }

    /**
     * Default cell processor
     * @param {Object} params - Cell params
     * @returns {string} Processed cell value
     */
    defaultCellProcessor(params) {
        if (params.value === null || params.value === undefined) {
            return '';
        }
        
        // Handle special data types
        if (params.value instanceof Date) {
            return params.value.toISOString();
        }
        
        if (typeof params.value === 'object') {
            return JSON.stringify(params.value);
        }
        
        return params.value;
    }

    /**
     * Export filtered data only
     * @param {string} tableId - Table identifier
     * @param {string} filename - Output filename
     */
    exportFilteredData(tableId, filename = 'filtered-export.csv') {
        return this.exportToCsv(tableId, filename, {
            onlySelected: false,
            allColumns: false,
            onlySelectedAllPages: false
        });
    }

    /**
     * Export selected rows
     * @param {string} tableId - Table identifier
     * @param {string} filename - Output filename
     */
    exportSelectedRows(tableId, filename = 'selected-export.csv') {
        return this.exportToCsv(tableId, filename, {
            onlySelected: true,
            onlySelectedAllPages: true
        });
    }
}

export default ExportManager;
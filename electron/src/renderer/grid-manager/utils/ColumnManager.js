/**
 * ColumnManager.js - Manages column operations
 * 
 * Handles column visibility, sizing, and state management
 */

class ColumnManager {
    constructor(gridState) {
        this.gridState = gridState;
        this.savedColumnStates = new Map();
    }

    /**
     * Update column visibility
     * @param {string} tableId - Table identifier
     * @param {Object} columnVisibility - Map of columnId -> boolean
     */
    updateColumnVisibility(tableId, columnVisibility) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            Object.entries(columnVisibility).forEach(([colId, visible]) => {
                grid.api.setColumnVisible(colId, visible);
            });
            
            console.log(`[ColumnManager] Column visibility updated for ${tableId}`);
            return true;
        } catch (error) {
            console.error(`[ColumnManager] Update visibility failed:`, error);
            return false;
        }
    }

    /**
     * Show all columns
     * @param {string} tableId - Table identifier
     */
    showAllColumns(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        const allColumns = grid.api.getColumns();
        allColumns.forEach(col => {
            grid.api.setColumnVisible(col.getColId(), true);
        });
        
        return true;
    }

    /**
     * Hide columns
     * @param {string} tableId - Table identifier
     * @param {Array<string>} columnIds - Column IDs to hide
     */
    hideColumns(tableId, columnIds) {
        const visibility = {};
        columnIds.forEach(colId => {
            visibility[colId] = false;
        });
        return this.updateColumnVisibility(tableId, visibility);
    }

    /**
     * Show columns
     * @param {string} tableId - Table identifier
     * @param {Array<string>} columnIds - Column IDs to show
     */
    showColumns(tableId, columnIds) {
        const visibility = {};
        columnIds.forEach(colId => {
            visibility[colId] = true;
        });
        return this.updateColumnVisibility(tableId, visibility);
    }

    /**
     * Auto-size columns
     * @param {string} tableId - Table identifier
     * @param {Array<string>} columnIds - Specific columns to size (optional)
     */
    autoSizeColumns(tableId, columnIds = null) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            if (columnIds) {
                grid.api.autoSizeColumns(columnIds);
            } else {
                grid.api.autoSizeAllColumns();
            }
            return true;
        } catch (error) {
            console.error(`[ColumnManager] Auto-size failed:`, error);
            return false;
        }
    }

    /**
     * Size columns to fit viewport
     * @param {string} tableId - Table identifier
     */
    sizeColumnsToFit(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            grid.api.sizeColumnsToFit();
            return true;
        } catch (error) {
            console.error(`[ColumnManager] Size to fit failed:`, error);
            return false;
        }
    }

    /**
     * Reset column state to defaults
     * @param {string} tableId - Table identifier
     */
    resetColumnState(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            grid.api.resetColumnState();
            console.log(`[ColumnManager] Column state reset for ${tableId}`);
            return true;
        } catch (error) {
            console.error(`[ColumnManager] Reset failed:`, error);
            return false;
        }
    }

    /**
     * Save current column state
     * @param {string} tableId - Table identifier
     * @param {string} name - Name for saved state
     */
    saveColumnState(tableId, name) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        const state = grid.api.getColumnState();
        const key = `${tableId}-${name}`;
        
        this.savedColumnStates.set(key, {
            state,
            timestamp: Date.now()
        });
        
        console.log(`[ColumnManager] Column state saved: ${key}`);
        return true;
    }

    /**
     * Restore saved column state
     * @param {string} tableId - Table identifier
     * @param {string} name - Name of saved state
     */
    restoreColumnState(tableId, name) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        const key = `${tableId}-${name}`;
        const saved = this.savedColumnStates.get(key);
        
        if (!saved) {
            console.warn(`[ColumnManager] No saved state found: ${key}`);
            return false;
        }

        try {
            grid.api.applyColumnState({ state: saved.state });
            console.log(`[ColumnManager] Column state restored: ${key}`);
            return true;
        } catch (error) {
            console.error(`[ColumnManager] Restore failed:`, error);
            return false;
        }
    }

    /**
     * Get column state
     * @param {string} tableId - Table identifier
     * @returns {Array} Column state
     */
    getColumnState(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return null;
        }

        return grid.api.getColumnState();
    }

    /**
     * Move column
     * @param {string} tableId - Table identifier
     * @param {string} columnId - Column to move
     * @param {number} toIndex - Target index
     */
    moveColumn(tableId, columnId, toIndex) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            grid.api.moveColumn(columnId, toIndex);
            return true;
        } catch (error) {
            console.error(`[ColumnManager] Move column failed:`, error);
            return false;
        }
    }

    /**
     * Pin column
     * @param {string} tableId - Table identifier
     * @param {string} columnId - Column to pin
     * @param {string} position - 'left', 'right', or null
     */
    pinColumn(tableId, columnId, position) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            grid.api.setColumnPinned(columnId, position);
            return true;
        } catch (error) {
            console.error(`[ColumnManager] Pin column failed:`, error);
            return false;
        }
    }

    /**
     * Get visible columns info
     * @param {string} tableId - Table identifier
     * @returns {Array} Visible columns info
     */
    getVisibleColumns(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return [];
        }

        return grid.api.getColumns()
            .filter(col => col.isVisible())
            .map(col => ({
                id: col.getColId(),
                headerName: col.getColDef().headerName || col.getColId(),
                width: col.getActualWidth(),
                pinned: col.getPinned(),
                sort: col.getSort(),
                sortIndex: col.getSortIndex()
            }));
    }
}

export default ColumnManager;
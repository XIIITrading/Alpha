/**
 * FilterManager.js - Manages grid filtering functionality
 * 
 * Provides methods for applying, clearing, and managing filters
 */

class FilterManager {
    constructor(gridState) {
        this.gridState = gridState;
        this.savedFilters = new Map(); // Store saved filter states
    }

    /**
     * Apply quick filter
     * @param {string} tableId - Table identifier
     * @param {string} filterText - Quick filter text
     */
    applyQuickFilter(tableId, filterText) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            console.warn(`[FilterManager] Cannot apply filter - grid ${tableId} not ready`);
            return false;
        }

        try {
            grid.api.setGridOption('quickFilterText', filterText);
            console.log(`[FilterManager] Quick filter applied: "${filterText}"`);
            return true;
        } catch (error) {
            console.error(`[FilterManager] Quick filter failed:`, error);
            return false;
        }
    }

    /**
     * Clear all filters
     * @param {string} tableId - Table identifier
     */
    clearFilters(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            grid.api.setFilterModel(null);
            grid.api.setGridOption('quickFilterText', '');
            console.log(`[FilterManager] Filters cleared for ${tableId}`);
            return true;
        } catch (error) {
            console.error(`[FilterManager] Clear filters failed:`, error);
            return false;
        }
    }

    /**
     * Get current filter model
     * @param {string} tableId - Table identifier
     * @returns {Object|null} Current filter model
     */
    getFilterModel(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return null;
        }

        return grid.api.getFilterModel();
    }

    /**
     * Set filter model
     * @param {string} tableId - Table identifier
     * @param {Object} filterModel - Filter model to apply
     */
    setFilterModel(tableId, filterModel) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            grid.api.setFilterModel(filterModel);
            console.log(`[FilterManager] Filter model applied to ${tableId}`);
            return true;
        } catch (error) {
            console.error(`[FilterManager] Set filter model failed:`, error);
            return false;
        }
    }

    /**
     * Save current filter state
     * @param {string} tableId - Table identifier
     * @param {string} name - Name for saved filter
     */
    saveFilterState(tableId, name) {
        const filterModel = this.getFilterModel(tableId);
        const grid = this.gridState.getGrid(tableId);
        
        if (!grid) return false;

        const quickFilterText = grid.api.getGridOption('quickFilterText') || '';
        
        const filterState = {
            filterModel,
            quickFilterText,
            timestamp: Date.now()
        };

        const key = `${tableId}-${name}`;
        this.savedFilters.set(key, filterState);
        
        console.log(`[FilterManager] Filter state saved: ${key}`);
        return true;
    }

    /**
     * Restore saved filter state
     * @param {string} tableId - Table identifier
     * @param {string} name - Name of saved filter
     */
    restoreFilterState(tableId, name) {
        const key = `${tableId}-${name}`;
        const filterState = this.savedFilters.get(key);
        
        if (!filterState) {
            console.warn(`[FilterManager] No saved filter found: ${key}`);
            return false;
        }

        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        try {
            if (filterState.filterModel) {
                grid.api.setFilterModel(filterState.filterModel);
            }
            if (filterState.quickFilterText) {
                grid.api.setGridOption('quickFilterText', filterState.quickFilterText);
            }
            
            console.log(`[FilterManager] Filter state restored: ${key}`);
            return true;
        } catch (error) {
            console.error(`[FilterManager] Restore filter failed:`, error);
            return false;
        }
    }

    /**
     * Get saved filter names for a table
     * @param {string} tableId - Table identifier
     * @returns {Array<string>} Saved filter names
     */
    getSavedFilters(tableId) {
        const filters = [];
        const prefix = `${tableId}-`;
        
        for (const [key, value] of this.savedFilters) {
            if (key.startsWith(prefix)) {
                filters.push({
                    name: key.substring(prefix.length),
                    timestamp: value.timestamp
                });
            }
        }
        
        return filters.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Delete saved filter
     * @param {string} tableId - Table identifier
     * @param {string} name - Name of saved filter
     */
    deleteSavedFilter(tableId, name) {
        const key = `${tableId}-${name}`;
        return this.savedFilters.delete(key);
    }

    /**
     * Apply column filter
     * @param {string} tableId - Table identifier
     * @param {string} columnId - Column ID
     * @param {Object} filterOptions - Filter options
     */
    applyColumnFilter(tableId, columnId, filterOptions) {
        const currentModel = this.getFilterModel(tableId) || {};
        
        if (filterOptions === null) {
            delete currentModel[columnId];
        } else {
            currentModel[columnId] = filterOptions;
        }
        
        return this.setFilterModel(tableId, currentModel);
    }

    /**
     * Get column filter
     * @param {string} tableId - Table identifier
     * @param {string} columnId - Column ID
     * @returns {Object|null} Column filter
     */
    getColumnFilter(tableId, columnId) {
        const filterModel = this.getFilterModel(tableId);
        return filterModel ? filterModel[columnId] || null : null;
    }

    /**
     * Clear column filter
     * @param {string} tableId - Table identifier
     * @param {string} columnId - Column ID
     */
    clearColumnFilter(tableId, columnId) {
        return this.applyColumnFilter(tableId, columnId, null);
    }

    /**
     * Check if any filters are active
     * @param {string} tableId - Table identifier
     * @returns {boolean} True if filters are active
     */
    hasActiveFilters(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return false;
        }

        const filterModel = this.getFilterModel(tableId);
        const quickFilter = grid.api.getGridOption('quickFilterText');
        
        return !!(filterModel && Object.keys(filterModel).length > 0) || !!quickFilter;
    }

    /**
     * Export current filter state
     * @param {string} tableId - Table identifier
     * @returns {Object} Filter state
     */
    exportFilterState(tableId) {
        const grid = this.gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) {
            return null;
        }

        return {
            filterModel: this.getFilterModel(tableId),
            quickFilterText: grid.api.getGridOption('quickFilterText') || '',
            activeFilters: this.hasActiveFilters(tableId)
        };
    }
}

export default FilterManager;
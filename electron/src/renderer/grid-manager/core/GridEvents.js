/**
 * Grid Events
 * Handles AG-Grid events
 * Extracted from GridManager.js - Phase 4
 */

/**
 * Functionality:
 * Handles AG-Grid events
 * Applies default filters
 * Sizes columns to fit
 * Updates row data
 */

import { gridState } from '../state/index.js';

export class GridEvents {
    /**
     * Create onGridReady event handler
     * @param {string} tableId - Table identifier
     * @returns {Function} Event handler
     */
    static createOnGridReady(tableId) {
        return (params) => {
            console.log(`[GridManager] Grid ready: ${tableId}`);
            
            const grid = gridState.getGrid(tableId);
            if (!grid) return;
            
            // Apply default filters
            const defaultFilter = grid.config.defaultView?.filter;
            if (defaultFilter && defaultFilter.length > 0) {
                const filterModel = {};
                
                defaultFilter.forEach(([field, operator, value]) => {
                    // Build filter model based on operator
                    if (operator === '==') {
                        filterModel[field] = {
                            filterType: 'text',
                            type: 'equals',
                            filter: value
                        };
                    } else if (operator === '>') {
                        filterModel[field] = {
                            filterType: 'number',
                            type: 'greaterThan',
                            filter: value
                        };
                    } else if (operator === '<') {
                        filterModel[field] = {
                            filterType: 'number',
                            type: 'lessThan',
                            filter: value
                        };
                    } else if (operator === '!=') {
                        filterModel[field] = {
                            filterType: 'text',
                            type: 'notEqual',
                            filter: value
                        };
                    }
                });
                
                // Apply all filters at once
                params.api.setFilterModel(filterModel);
            }
            
            // Size columns to fit after a delay
            setTimeout(() => {
                GridEvents.safeColumnsFit(tableId);
            }, 100);
        };
    }

    /**
     * Create onRowDataUpdated event handler
     * @param {string} tableId - Table identifier
     * @returns {Function} Event handler
     */
    static createOnRowDataUpdated(tableId) {
        return () => {
            gridState.incrementUpdateCount(tableId);
        };
    }

    /**
     * Create onGridSizeChanged event handler
     * @param {string} tableId - Table identifier
     * @returns {Function} Event handler
     */
    static createOnGridSizeChanged(tableId) {
        return (params) => {
            // Only size columns if grid has width
            if (params.clientWidth > 0) {
                GridEvents.safeColumnsFit(tableId);
            }
        };
    }

    /**
     * Safely size columns to fit
     * @param {string} tableId - Table identifier
     */
    static safeColumnsFit(tableId) {
        const grid = gridState.getGrid(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) return;
        
        // Check if grid container has width
        const container = grid.container;
        if (container && container.offsetWidth > 0) {
            try {
                grid.api.sizeColumnsToFit();
            } catch (error) {
                console.log(`[GridManager] Could not size columns for ${tableId}:`, error.message);
            }
        }
    }
}
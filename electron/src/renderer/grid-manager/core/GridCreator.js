/**
 * Grid Creator
 * Creates and initializes AG-Grid instances
 * Extracted from GridManager.js - Phase 4
 */

/**
 * Functionality:
 * Creates and initializes AG-Grid instances
 * Handles grid creation and initialization
 * Applies default configurations
 * Handles grid events
 */

import { GRID_DEFAULTS, DEFAULT_THEME } from '../config/index.js';
import { gridState } from '../state/index.js';
import { ColumnBuilder } from './ColumnBuilder.js';
import { GridEvents } from './GridEvents.js';

export class GridCreator {
    /**
     * Create a new grid instance
     * @param {string} tableId - Table identifier
     * @param {HTMLElement} container - Container element
     * @param {Object} tableConfig - Table configuration
     * @returns {Object} AG-Grid API instance
     */
    static async createGrid(tableId, container, tableConfig) {
        console.log(`[GridManager] Creating grid: ${tableId}`);
        
        try {
            // Check if agGrid is available
            if (typeof agGrid === 'undefined') {
                throw new Error('AG-Grid library not loaded. Please ensure ag-grid-community.min.js is loaded before creating grids.');
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Create grid container
            const gridDiv = document.createElement('div');
            gridDiv.className = gridState.getTheme() || DEFAULT_THEME;
            gridDiv.style.width = '100%';
            gridDiv.style.height = '100%';
            container.appendChild(gridDiv);

            // Get column definitions
            const columnDefs = ColumnBuilder.buildColumnDefs(
                tableId, 
                tableConfig.schema, 
                tableConfig.defaultView
            );

            // Build grid options
            const gridOptions = {
                // Column configuration
                columnDefs: columnDefs,
                defaultColDef: GRID_DEFAULTS.defaultColDef,
                
                // Data
                rowData: [],
                
                // Sizing
                rowHeight: GRID_DEFAULTS.rowHeight,
                headerHeight: GRID_DEFAULTS.headerHeight,
                floatingFiltersHeight: GRID_DEFAULTS.floatingFiltersHeight,
                
                // Performance settings
                animateRows: GRID_DEFAULTS.animateRows,
                rowBuffer: GRID_DEFAULTS.rowBuffer,
                maxBlocksInCache: GRID_DEFAULTS.maxBlocksInCache,
                cacheQuickFilter: GRID_DEFAULTS.cacheQuickFilter,
                
                // Styling
                rowClass: GRID_DEFAULTS.rowClass,
                
                // Row ID
                getRowId: (params) => {
                    return params.data.symbol || params.data.id || 
                           `${tableId}-${Date.now()}-${Math.random()}`;
                },
                
                // Components
                components: gridState.cellRenderers,
                
                // Events
                onGridReady: GridEvents.createOnGridReady(tableId),
                onRowDataUpdated: GridEvents.createOnRowDataUpdated(tableId),
                onGridSizeChanged: GridEvents.createOnGridSizeChanged(tableId),
                
                // Initial state for sorting
                initialState: this.buildInitialState(tableConfig)
            };

            // Add any custom gridOptions from the table config
            if (tableConfig.gridOptions) {
                Object.assign(gridOptions, tableConfig.gridOptions);
            }

            // Create the grid
            const gridApi = agGrid.createGrid(gridDiv, gridOptions);
            
            // Store grid reference
            gridState.addGrid(tableId, {
                api: gridApi,
                gridOptions: gridOptions,
                gridDiv: gridDiv,
                container: container,
                config: tableConfig
            });

            return gridApi;
            
        } catch (error) {
            console.error(`[GridManager] Failed to create grid ${tableId}:`, error);
            throw error;
        }
    }

    /**
     * Build initial state configuration
     * @param {Object} tableConfig - Table configuration
     * @returns {Object} Initial state configuration
     */
    static buildInitialState(tableConfig) {
        const state = {};
        
        if (tableConfig.defaultView?.sort) {
            state.sort = {
                sortModel: tableConfig.defaultView.sort.map(([colId, sort]) => ({
                    colId,
                    sort
                }))
            };
        }
        
        return state;
    }
}
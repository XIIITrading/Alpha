/**
 * State Management
 * Extracted from GridManager.js - Phase 1
 * Updated in Phase 2 to include cell renderer registration
 * Updated in Phase 3 to include formatter and comparator registration
 */

/**
 * Functionality:
 * Manages the state of the grid manager
 * Stores grid instances, update queues, performance tracking, and configuration
 * Provides methods for grid management, update queue handling, and performance metrics
 */

import { CELL_RENDERERS } from '../renderers/index.js';
import { VALUE_FORMATTERS } from '../formatters/index.js';
import { COMPARATORS } from '../comparators/index.js';


class GridState {
    constructor() {
        // Grid instances
        this.grids = new Map();              // Map of tableId -> { gridApi, gridOptions, gridDiv, container, config }
        
        // Update management
        this.updateQueues = new Map();       // Batched updates per table
        this.updateScheduled = false;
        
        // Performance tracking
        this.updateCounts = new Map();
        
        // Components (will be populated by initializeComponents)
        this.cellRenderers = {};             // Custom cell renderers
        this.valueFormatters = {};           // Value formatters
        this.comparators = {};               // Custom comparators
        
        // Global configuration
        this.config = null;                  // Global configuration
        this.theme = null;                   // Current theme
        this.flashDuration = 500;            // Flash animation duration in ms
        
        // Initialize all components
        this.initializeComponents();
    }
    
    /**
     * Initialize and register all components
     * Phase 2: Cell renderers
     * Phase 3: Value formatters and comparators
     */
    initializeComponents() {
        // Register all cell renderers (Phase 2)
        Object.entries(CELL_RENDERERS).forEach(([name, renderer]) => {
            this.registerCellRenderer(name, renderer);
        });
        
        // Register all value formatters (Phase 3)
        Object.entries(VALUE_FORMATTERS).forEach(([name, formatter]) => {
            this.registerValueFormatter(name, formatter);
        });
        
        // Register all comparators (Phase 3)
        Object.entries(COMPARATORS).forEach(([name, comparator]) => {
            this.registerComparator(name, comparator);
        });
        
        console.log('[GridState] Components initialized:', {
            renderers: Object.keys(this.cellRenderers).length,
            formatters: Object.keys(this.valueFormatters).length,
            comparators: Object.keys(this.comparators).length
        });
    }

    // Grid management
    addGrid(tableId, gridData) {
        this.grids.set(tableId, gridData);
        this.updateQueues.set(tableId, []);
        this.updateCounts.set(tableId, 0);
    }

    getGrid(tableId) {
        return this.grids.get(tableId);
    }

    removeGrid(tableId) {
        this.grids.delete(tableId);
        this.updateQueues.delete(tableId);
        this.updateCounts.delete(tableId);
    }

    hasGrid(tableId) {
        return this.grids.has(tableId);
    }

    getAllGrids() {
        return this.grids;
    }

    // Update queue management
    addToUpdateQueue(tableId, update) {
        if (!this.updateQueues.has(tableId)) {
            this.updateQueues.set(tableId, []);
        }
        this.updateQueues.get(tableId).push(update);
    }

    getUpdateQueue(tableId) {
        return this.updateQueues.get(tableId) || [];
    }

    clearUpdateQueue(tableId) {
        if (this.updateQueues.has(tableId)) {
            this.updateQueues.get(tableId).length = 0;
        }
    }

    // Update scheduling
    setUpdateScheduled(scheduled) {
        this.updateScheduled = scheduled;
    }

    isUpdateScheduled() {
        return this.updateScheduled;
    }

    // Performance tracking
    incrementUpdateCount(tableId) {
        this.updateCounts.set(tableId, 
            (this.updateCounts.get(tableId) || 0) + 1);
    }

    getUpdateCount(tableId) {
        return this.updateCounts.get(tableId) || 0;
    }

    getTotalUpdateCount() {
        let total = 0;
        this.updateCounts.forEach(count => total += count);
        return total;
    }

    // Component registration
    registerCellRenderer(name, renderer) {
        this.cellRenderers[name] = renderer;
    }

    registerValueFormatter(name, formatter) {
        this.valueFormatters[name] = formatter;
    }

    registerComparator(name, comparator) {
        this.comparators[name] = comparator;
    }

    // Configuration
    setConfig(config) {
        this.config = config;
    }

    getConfig() {
        return this.config;
    }

    setTheme(theme) {
        this.theme = theme;
    }

    getTheme() {
        return this.theme;
    }

    setFlashDuration(duration) {
        this.flashDuration = duration;
    }

    getFlashDuration() {
        return this.flashDuration;
    }

    // Metrics
    getMetrics() {
        const metrics = {
            gridCount: this.grids.size,
            totalUpdates: this.getTotalUpdateCount(),
            grids: {}
        };
        
        this.grids.forEach((grid, tableId) => {
            metrics.grids[tableId] = {
                updates: this.getUpdateCount(tableId),
                rowCount: grid.api?.getDisplayedRowCount() || 0
            };
        });
        
        return metrics;
    }

    // Cleanup
    clear() {
        this.grids.clear();
        this.updateQueues.clear();
        this.updateCounts.clear();
        this.updateScheduled = false;
    }
}

// Create singleton instance
const gridState = new GridState();

// Export state instance and class
export { gridState, GridState };
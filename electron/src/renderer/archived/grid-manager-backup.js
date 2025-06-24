/**
 * GridManager - AG-Grid Community implementation for trading tables
 * 
 * This module manages all AG-Grid instances and provides high-performance
 * data updates with custom cell renderers for trading data visualization.
 */

// AG-Grid will be loaded via script tags in index.html
// No imports needed here - agGrid is available globally
// Using AG-Grid v32.2.2 APIs

class GridManager {
    constructor(config) {
        this.grids = new Map();              // Map of tableId -> { gridApi, gridOptions, gridDiv, container, config }
        this.config = config;                // Global configuration
        this.updateQueues = new Map();       // Batched updates per table
        this.cellRenderers = {};             // Custom cell renderers
        this.theme = 'ag-theme-alpine-dark'; // Dark theme for trading
        this.updateScheduled = false;
        this.flashDuration = 500;            // Flash animation duration in ms
        
        // Performance tracking
        this.updateCounts = new Map();
        
        // Initialize custom components
        this.initializeCellRenderers();
        this.initializeValueFormatters();
        this.initializeComparators();
    }

    /**
     * Initialize custom cell renderers for trading data
     */
    initializeCellRenderers() {
        // Price Change Renderer with flash animation
        this.cellRenderers.PriceChangeRenderer = class {
            init(params) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'price-cell';
                this.refresh(params);
            }

            refresh(params) {
                const value = params.value;
                const oldValue = params.node.data._previousPrice;
                
                if (oldValue !== undefined && value !== oldValue) {
                    // Flash animation for price change
                    this.eGui.classList.remove('flash-up', 'flash-down');
                    void this.eGui.offsetWidth; // Force reflow
                    
                    if (value > oldValue) {
                        this.eGui.classList.add('flash-up');
                        this.eGui.style.color = '#00ff00';
                    } else {
                        this.eGui.classList.add('flash-down');
                        this.eGui.style.color = '#ff3333';
                    }
                    
                    setTimeout(() => {
                        this.eGui.style.color = '';
                        this.eGui.classList.remove('flash-up', 'flash-down');
                    }, 500);
                }
                
                this.eGui.textContent = value?.toFixed(2) || '0.00';
                return true;
            }

            getGui() {
                return this.eGui;
            }
        };

        // P&L Renderer with color coding
        this.cellRenderers.PLRenderer = class {
            init(params) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'pl-cell';
                this.refresh(params);
            }

            refresh(params) {
                const value = params.value || 0;
                const isPercent = params.colDef.field.includes('Percent');
                
                // Color based on positive/negative
                if (value > 0) {
                    this.eGui.style.color = '#00ff00';
                    this.eGui.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                } else if (value < 0) {
                    this.eGui.style.color = '#ff3333';
                    this.eGui.style.backgroundColor = 'rgba(255, 51, 51, 0.1)';
                } else {
                    this.eGui.style.color = '#888';
                    this.eGui.style.backgroundColor = 'transparent';
                }
                
                // Format value
                if (isPercent) {
                    this.eGui.textContent = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
                } else {
                    this.eGui.textContent = `${value >= 0 ? '+' : ''}$${Math.abs(value).toFixed(2)}`;
                }
                
                return true;
            }

            getGui() {
                return this.eGui;
            }
        };

        // Volume Bar Renderer
        this.cellRenderers.VolumeBarRenderer = class {
            init(params) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'volume-bar-cell';
                this.eGui.style.position = 'relative';
                this.eGui.style.width = '100%';
                this.eGui.style.height = '100%';
                this.refresh(params);
            }

            refresh(params) {
                const value = params.value || 0;
                const relativeVolume = params.data.relativeVolume || 1;
                
                // Clear previous content
                this.eGui.innerHTML = '';
                
                // Create bar container
                const barContainer = document.createElement('div');
                barContainer.style.position = 'absolute';
                barContainer.style.bottom = '2px';
                barContainer.style.left = '2px';
                barContainer.style.right = '2px';
                barContainer.style.height = '4px';
                barContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                barContainer.style.borderRadius = '2px';
                
                // Create actual bar
                const bar = document.createElement('div');
                bar.style.position = 'absolute';
                bar.style.left = '0';
                bar.style.top = '0';
                bar.style.height = '100%';
                bar.style.width = `${Math.min(relativeVolume * 100, 100)}%`;
                bar.style.backgroundColor = relativeVolume > 1.5 ? '#ffaa00' : '#00aaff';
                bar.style.borderRadius = '2px';
                bar.style.transition = 'width 0.3s ease';
                
                barContainer.appendChild(bar);
                
                // Add text
                const text = document.createElement('div');
                text.style.position = 'relative';
                text.style.zIndex = '1';
                text.style.padding = '0 4px';
                text.textContent = this.formatVolume(value);
                
                this.eGui.appendChild(text);
                this.eGui.appendChild(barContainer);
                
                return true;
            }

            formatVolume(value) {
                if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                return value.toString();
            }

            getGui() {
                return this.eGui;
            }
        };

        // Alert Icon Renderer
        this.cellRenderers.AlertRenderer = class {
            init(params) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'alert-cell';
                this.eGui.style.textAlign = 'center';
                this.refresh(params);
            }

            refresh(params) {
                const count = params.value || 0;
                
                if (count > 0) {
                    this.eGui.innerHTML = `
                        <span style="color: #ffaa00; font-size: 16px;">⚠</span>
                        <span style="margin-left: 4px; color: #ffaa00;">${count}</span>
                    `;
                    
                    if (count > 2) {
                        this.eGui.style.animation = 'pulse 1s infinite';
                    }
                } else {
                    this.eGui.textContent = '';
                }
                
                return true;
            }

            getGui() {
                return this.eGui;
            }
        };

        // Signal Strength Renderer
        this.cellRenderers.SignalStrengthRenderer = class {
            init(params) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'signal-strength-cell';
                this.eGui.style.display = 'flex';
                this.eGui.style.alignItems = 'center';
                this.eGui.style.gap = '4px';
                this.refresh(params);
            }

            refresh(params) {
                const strength = params.value || 0;
                const bars = 5;
                
                this.eGui.innerHTML = '';
                
                for (let i = 0; i < bars; i++) {
                    const bar = document.createElement('div');
                    bar.style.width = '3px';
                    bar.style.height = `${8 + i * 2}px`;
                    bar.style.backgroundColor = i < (strength / 20) ? '#00ff00' : '#333';
                    bar.style.borderRadius = '1px';
                    this.eGui.appendChild(bar);
                }
                
                const text = document.createElement('span');
                text.style.marginLeft = '8px';
                text.style.fontSize = '11px';
                text.textContent = `${strength}%`;
                this.eGui.appendChild(text);
                
                return true;
            }

            getGui() {
                return this.eGui;
            }
        };

        // Gap Type Renderer for Pre-Market Dashboard
        this.cellRenderers.GapTypeRenderer = class {
            init(params) {
                this.eGui = document.createElement('div');
                this.refresh(params);
            }

            refresh(params) {
                const gapType = params.value || 'Unknown';
                const colors = {
                    'Small': '#888',
                    'Medium': '#ffaa00',
                    'Large': '#ff6600',
                    'Extreme': '#ff0000'
                };
                
                this.eGui.style.color = colors[gapType] || '#888';
                this.eGui.style.fontWeight = '600';
                this.eGui.style.fontSize = '11px';
                this.eGui.textContent = gapType;
                
                return true;
            }

            getGui() {
                return this.eGui;
            }
        };
    }

    /**
     * Initialize value formatters for different data types
     */
    initializeValueFormatters() {
        this.valueFormatters = {
            currency: (params) => {
                const value = params.value;
                if (value == null) return '';
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(value);
            },
            
            percent: (params) => {
                const value = params.value;
                if (value == null) return '';
                return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
            },
            
            largeNumber: (params) => {
                const value = params.value;
                if (value == null) return '';
                if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
                if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
                if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
                return `$${value.toFixed(0)}`;
            },
            
            datetime: (params) => {
                const value = params.value;
                if (!value) return '';
                const date = new Date(value);
                return date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        };
    }

    /**
     * Initialize custom comparators for sorting
     */
    initializeComparators() {
        this.comparators = {
            percentChange: (valueA, valueB) => {
                // Sort by absolute value for biggest movers
                return Math.abs(valueB || 0) - Math.abs(valueA || 0);
            }
        };
    }

    /**
     * Get column definitions based on table schema
     */
    getColumnDefs(tableId, schema, defaultView) {
        const columnDefs = [];
        
        // Map schema types to AG-Grid column properties
        const schemaToColDef = {
            string: { filter: 'agTextColumnFilter' },
            float: { filter: 'agNumberColumnFilter', type: 'numericColumn' },
            integer: { filter: 'agNumberColumnFilter', type: 'numericColumn' },
            boolean: { filter: 'agBooleanColumnFilter' },
            datetime: { filter: 'agDateColumnFilter' }
        };

        // Special column configurations by field name
        const specialColumns = {
            symbol: {
                pinned: 'left',
                width: 80,
                cellClass: 'symbol-cell',
                cellStyle: { fontWeight: 'bold' }
            },
            price: {
                cellRenderer: 'PriceChangeRenderer',
                width: 90
            },
            change: {
                cellRenderer: 'PLRenderer',
                width: 80
            },
            changePercent: {
                cellRenderer: 'PLRenderer',
                width: 90,
                comparator: this.comparators.percentChange
            },
            preMarketChangePercent: {
                cellRenderer: 'PLRenderer',
                width: 100
            },
            gapPercent: {
                cellRenderer: 'PLRenderer',
                width: 90,
                comparator: this.comparators.percentChange
            },
            gapType: {
                cellRenderer: 'GapTypeRenderer',
                width: 80
            },
            volume: {
                cellRenderer: 'VolumeBarRenderer',
                width: 100
            },
            preMarketVolume: {
                cellRenderer: 'VolumeBarRenderer',
                width: 110
            },
            unrealizedPL: {
                cellRenderer: 'PLRenderer',
                width: 100
            },
            unrealizedPLPercent: {
                cellRenderer: 'PLRenderer',
                width: 90
            },
            alerts: {
                cellRenderer: 'AlertRenderer',
                width: 70
            },
            strength: {
                cellRenderer: 'SignalStrengthRenderer',
                width: 120
            },
            hvnStrength: {
                cellRenderer: 'SignalStrengthRenderer',
                width: 120
            },
            marketCap: {
                valueFormatter: this.valueFormatters.largeNumber,
                width: 100
            },
            timestamp: {
                valueFormatter: this.valueFormatters.datetime,
                width: 100
            },
            momentum5m: {
                cellRenderer: 'PLRenderer',
                width: 90
            },
            momentum15m: {
                cellRenderer: 'PLRenderer',
                width: 90
            }
        };

        // Build column definitions
        for (const [field, type] of Object.entries(schema)) {
            const baseColDef = {
                field: field,
                headerName: this.formatHeader(field),
                sortable: true,
                resizable: true,
                ...schemaToColDef[type]
            };

            // Apply special column config if exists
            if (specialColumns[field]) {
                Object.assign(baseColDef, specialColumns[field]);
            }

            // Set visibility based on defaultView
            if (defaultView?.columns && !defaultView.columns.includes(field)) {
                baseColDef.hide = true;
            }

            columnDefs.push(baseColDef);
        }

        return columnDefs;
    }

    /**
     * Format field name to human-readable header
     */
    formatHeader(field) {
        // Handle special cases
        const specialCases = {
            'hvn': 'HVN',
            'poc': 'POC',
            'atr': 'ATR',
            'rsi': 'RSI',
            'pl': 'P&L'
        };
        
        // Check for special cases in the field name
        for (const [key, value] of Object.entries(specialCases)) {
            if (field.toLowerCase().includes(key)) {
                field = field.replace(new RegExp(key, 'gi'), value);
            }
        }
        
        return field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Create a new grid instance
     */
    async createGrid(tableId, container, tableConfig) {
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
            gridDiv.className = this.theme;
            gridDiv.style.width = '100%';
            gridDiv.style.height = '100%';
            container.appendChild(gridDiv);

            // Get column definitions
            const columnDefs = this.getColumnDefs(
                tableId, 
                tableConfig.schema, 
                tableConfig.defaultView
            );

            // Grid options
            const gridOptions = {
                columnDefs: columnDefs,
                defaultColDef: {
                    sortable: true,
                    resizable: true,
                    filter: true,
                    floatingFilter: true,
                    suppressHeaderMenuButton: false
                    // REMOVED animateRows from defaultColDef - it's not a column property
                },
                rowData: [],
                rowHeight: 28,
                headerHeight: 32,
                floatingFiltersHeight: 32,
                
                // Performance settings - animateRows should only be here
                animateRows: true,
                rowBuffer: 20,
                maxBlocksInCache: 10,
                cacheQuickFilter: true,
                
                // Styling
                rowClass: 'trading-row',
                
                // Use getRowId instead of getRowNodeId (v31+ change)
                getRowId: (params) => {
                    return params.data.symbol || params.data.id || 
                           `${tableId}-${Date.now()}-${Math.random()}`;
                },
                
                // Components
                components: this.cellRenderers,
                
                // Events
                onGridReady: (params) => {
                    console.log(`[GridManager] Grid ready: ${tableId}`);
                    this.onGridReady(tableId, params);
                },
                
                onRowDataUpdated: () => {
                    this.updateCounts.set(tableId, 
                        (this.updateCounts.get(tableId) || 0) + 1);
                },
                
                onGridSizeChanged: (params) => {
                    // Only size columns if grid has width
                    if (params.clientWidth > 0) {
                        this.safeColumnsFit(tableId);
                    }
                },
                
                // Initial state for sorting (v31+ change)
                initialState: {
                    sort: tableConfig.defaultView?.sort ? {
                        sortModel: tableConfig.defaultView.sort.map(([colId, sort]) => ({
                            colId,
                            sort
                        }))
                    } : undefined
                }
            };

            // Add any custom gridOptions from the table config
            if (tableConfig.gridOptions) {
                Object.assign(gridOptions, tableConfig.gridOptions);
            }

            // Create the grid using createGrid (v31+ API)
            const gridApi = agGrid.createGrid(gridDiv, gridOptions);
            
            // Store grid reference - API is returned directly in v31+
            this.grids.set(tableId, {
                api: gridApi,
                gridOptions: gridOptions,
                gridDiv: gridDiv,
                container: container,
                config: tableConfig
            });

            // Initialize update queue
            this.updateQueues.set(tableId, []);

            // Add CSS for animations
            this.injectStyles();

            return gridApi; // Return the API directly
            
        } catch (error) {
            console.error(`[GridManager] Failed to create grid ${tableId}:`, error);
            throw error;
        }
    }

    /**
     * Handle grid ready event
     */
    onGridReady(tableId, params) {
        const grid = this.grids.get(tableId);
        if (grid) {
            // Apply default filters using the new API (v31+ compatible)
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
                
                // Apply all filters at once using setFilterModel
                params.api.setFilterModel(filterModel);
            }
            
            // Size columns to fit after a delay to ensure grid is visible
            setTimeout(() => {
                this.safeColumnsFit(tableId);
            }, 100);
        }
    }

    /**
     * Safely size columns to fit
     */
    safeColumnsFit(tableId) {
        const grid = this.grids.get(tableId);
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

    /**
     * Update grid data with batching support
     */
    updateGrid(tableId, data, replace = false) {
        // Add to update queue
        if (!this.updateQueues.has(tableId)) {
            this.updateQueues.set(tableId, []);
        }
        
        this.updateQueues.get(tableId).push({
            data: Array.isArray(data) ? data : [data],
            replace,
            timestamp: Date.now()
        });
        
        // Schedule processing
        this.scheduleUpdateProcessing();
    }

    /**
     * Schedule update processing using requestAnimationFrame
     */
    scheduleUpdateProcessing() {
        if (this.updateScheduled) return;
        
        this.updateScheduled = true;
        requestAnimationFrame(() => {
            this.updateScheduled = false;
            this.processUpdateQueues();
        });
    }

    /**
     * Process all queued updates
     */
    processUpdateQueues() {
        const startTime = performance.now();
        
        for (const [tableId, updates] of this.updateQueues) {
            if (updates.length === 0) continue;
            
            const grid = this.grids.get(tableId);
            if (!grid || !grid.api || grid.api.isDestroyed()) continue;
            
            // Process updates
            let transactions = {
                add: [],
                update: [],
                remove: []
            };
            
            let shouldReplace = false;
            
            for (const update of updates) {
                if (update.replace) {
                    shouldReplace = true;
                    transactions = {
                        add: update.data,
                        update: [],
                        remove: []
                    };
                } else {
                    // For updates, we need to check if rows exist
                    update.data.forEach(row => {
                        const rowNode = grid.api.getRowNode(
                            row.symbol || row.id || JSON.stringify(row)
                        );
                        
                        if (rowNode) {
                            // Store previous values for animations
                            if (row.price !== undefined) {
                                row._previousPrice = rowNode.data.price;
                            }
                            transactions.update.push(row);
                        } else {
                            transactions.add.push(row);
                        }
                    });
                }
            }
            
            // Apply updates
            try {
                if (shouldReplace) {
                    grid.api.setGridOption('rowData', transactions.add);
                } else {
                    grid.api.applyTransaction(transactions);
                }
            } catch (error) {
                console.error(`[GridManager] Error updating grid ${tableId}:`, error);
            }
            
            // Clear processed updates
            updates.length = 0;
        }
        
        // Update metrics
        const latency = performance.now() - startTime;
        if (this.config && this.config.AppState) {
            this.config.AppState.metrics.latency = Math.round(latency);
        }
    }

    /**
     * Inject CSS styles for animations and custom styling
     */
    injectStyles() {
        if (document.getElementById('grid-manager-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'grid-manager-styles';
        style.textContent = `
            /* AG-Grid Dark Theme Overrides */
            .ag-theme-alpine-dark {
                --ag-background-color: #0d0d0d;
                --ag-header-background-color: #1a1a1a;
                --ag-odd-row-background-color: #0d0d0d;
                --ag-row-hover-color: #1a1a1a;
                --ag-border-color: #333;
                --ag-header-foreground-color: #e0e0e0;
                --ag-foreground-color: #e0e0e0;
                --ag-row-border-color: #222;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
            }
            
            /* Trading row styles */
            .trading-row {
                border-bottom: 1px solid #222;
            }
            
            .trading-row:hover {
                background-color: #1a1a1a !important;
            }
            
            /* Symbol cell */
            .symbol-cell {
                color: #00aaff !important;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            /* Flash animations */
            @keyframes flash-up {
                0% { background-color: rgba(0, 255, 0, 0.3); }
                100% { background-color: transparent; }
            }
            
            @keyframes flash-down {
                0% { background-color: rgba(255, 51, 51, 0.3); }
                100% { background-color: transparent; }
            }
            
            .flash-up {
                animation: flash-up 0.5s ease-out;
            }
            
            .flash-down {
                animation: flash-down 0.5s ease-out;
            }
            
            /* Price cell */
            .price-cell {
                font-weight: 500;
                transition: color 0.3s ease;
            }
            
            /* P&L cell */
            .pl-cell {
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 3px;
                text-align: right;
                transition: all 0.3s ease;
            }
            
            /* Volume bar cell */
            .volume-bar-cell {
                font-size: 11px;
                font-weight: 500;
            }
            
            /* Alert cell pulse */
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
            }
            
            /* Header styling */
            .ag-header-cell-label {
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* Filter styling */
            .ag-floating-filter {
                background-color: #0d0d0d;
                border-top: 1px solid #333;
            }
            
            .ag-floating-filter-input {
                font-size: 11px;
            }
            
            /* Scrollbar styling */
            .ag-theme-alpine-dark .ag-body-viewport::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            
            .ag-theme-alpine-dark .ag-body-viewport::-webkit-scrollbar-track {
                background: #0d0d0d;
            }
            
            .ag-theme-alpine-dark .ag-body-viewport::-webkit-scrollbar-thumb {
                background: #333;
                border-radius: 4px;
            }
            
            .ag-theme-alpine-dark .ag-body-viewport::-webkit-scrollbar-thumb:hover {
                background: #444;
            }
            
            /* Fix for grid sizing */
            .ag-root-wrapper {
                height: 100%;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Resize all grids (call when window resizes)
     */
    resizeGrids() {
        this.grids.forEach((grid, tableId) => {
            if (grid.api && !grid.api.isDestroyed()) {
                // Wait a frame to ensure container has resized
                requestAnimationFrame(() => {
                    this.safeColumnsFit(tableId);
                });
            }
        });
    }

    /**
     * Get grid instance by ID
     */
    getGrid(tableId) {
        return this.grids.get(tableId);
    }

    /**
     * Destroy a grid instance
     */
    destroyGrid(tableId) {
        const grid = this.grids.get(tableId);
        if (grid) {
            if (grid.api && !grid.api.isDestroyed()) {
                grid.api.destroy();
            }
            this.grids.delete(tableId);
            this.updateQueues.delete(tableId);
            this.updateCounts.delete(tableId);
        }
    }

    /**
     * Destroy all grids
     */
    destroy() {
        this.grids.forEach((grid, tableId) => {
            this.destroyGrid(tableId);
        });
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        const metrics = {
            gridCount: this.grids.size,
            totalUpdates: 0,
            grids: {}
        };
        
        this.updateCounts.forEach((count, tableId) => {
            metrics.totalUpdates += count;
            metrics.grids[tableId] = {
                updates: count,
                rowCount: this.grids.get(tableId)?.api?.getDisplayedRowCount() || 0
            };
        });
        
        return metrics;
    }

    /**
     * Check if a grid is ready
     */
    isGridReady(tableId) {
        const grid = this.grids.get(tableId);
        return grid && grid.api && !grid.api.isDestroyed();
    }

    /**
     * Update column visibility
     */
    updateColumnVisibility(tableId, columnVisibility) {
        const grid = this.grids.get(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) return;
        
        grid.api.setColumnsVisible(Object.keys(columnVisibility), columnVisibility);
    }

    /**
     * Export grid data to CSV
     */
    exportToCsv(tableId, filename = 'export.csv') {
        const grid = this.grids.get(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) return;
        
        grid.api.exportDataAsCsv({
            fileName: filename,
            columnKeys: grid.api.getColumns()
                .filter(col => col.isVisible())
                .map(col => col.getColId())
        });
    }

    /**
     * Apply quick filter
     */
    applyQuickFilter(tableId, filterText) {
        const grid = this.grids.get(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) return;
        
        grid.api.setGridOption('quickFilterText', filterText);
    }

    /**
     * Clear all filters
     */
    clearFilters(tableId) {
        const grid = this.grids.get(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) return;
        
        grid.api.setFilterModel(null);
    }

    /**
     * Get current filter model
     */
    getFilterModel(tableId) {
        const grid = this.grids.get(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) return null;
        
        return grid.api.getFilterModel();
    }

    /**
     * Set filter model
     */
    setFilterModel(tableId, filterModel) {
        const grid = this.grids.get(tableId);
        if (!grid || !grid.api || grid.api.isDestroyed()) return;
        
        grid.api.setFilterModel(filterModel);
    }
}

export default GridManager;
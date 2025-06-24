# GridManager Module

## Overview
Modular AG-Grid implementation for high-performance trading tables with real-time updates and custom visualizations.

## Module Structure

### Core Components

#### `index.js` - Main Entry Point
- **Function:** GridManager class initialization and public API
- **Exports:** GridManager class
- **Dependencies:** All submodules

#### `config/` - Configuration Management
- `gridDefaults.js`: Default AG-Grid options
- `themes.js`: Theme configurations (dark/light)
- `animations.js`: Flash durations, transitions

#### `state/` - State Management
- Manages grid instances Map
- Update queues Map
- Performance metrics tracking

#### `renderers/` - Cell Renderers
- Custom cell renderers for trading data
- Each renderer is a self-contained class
- Handles animations and styling

#### `formatters/` - Value Formatters
- Currency formatting
- Percentage formatting
- Large number abbreviation
- DateTime formatting

#### `core/` - Core Grid Logic
- Grid creation and initialization
- Column definition building
- Event handling

#### `updates/` - Update Management
- Batched update queuing
- Transaction processing
- Performance optimization

#### `styles/` - Styling
- CSS injection
- Theme overrides
- Animation definitions

#### `utils/` - Utilities
- Header formatting
- Export functionality
- Filter management

## API Reference

### Main Methods
- `createGrid(tableId, container, tableConfig)`
- `updateGrid(tableId, data, replace)`
- `destroyGrid(tableId)`
- `resizeGrids()`
- `getMetrics()`

### Grid Operations
- `exportToCsv(tableId, filename)`
- `applyQuickFilter(tableId, filterText)`
- `clearFilters(tableId)`
- `updateColumnVisibility(tableId, columnVisibility)`
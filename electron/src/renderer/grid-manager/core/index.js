/**
 * Core Module Aggregator
 * Exports all core grid functionality
 * Extracted from GridManager.js - Phase 4
 */

/**
 * Functionality:
 * Exports all core grid functionality
 * Provides a single import point for all core functionality
 * Exports convenient methods for grid creation and event handling
 */

import { GridCreator } from './GridCreator.js';
import { ColumnBuilder } from './ColumnBuilder.js';
import { GridEvents } from './GridEvents.js';

// Export individual modules
export {
    GridCreator,
    ColumnBuilder,
    GridEvents
};

// Export convenient methods
export const createGrid = GridCreator.createGrid.bind(GridCreator);
export const buildColumnDefs = ColumnBuilder.buildColumnDefs.bind(ColumnBuilder);
export const safeColumnsFit = GridEvents.safeColumnsFit.bind(GridEvents);
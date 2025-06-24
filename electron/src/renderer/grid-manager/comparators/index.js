/**
 * Comparators Aggregator
 * Exports all custom comparators
 * Extracted from GridManager.js - Phase 3
 */

/**
 * Functionality:
 * Exports all custom comparators
 * Provides a single import point for all comparators
 * Exports a map of comparators for registration
 */

import { percentChangeComparator } from './percentChange.js';

// Export individual comparators
export {
    percentChangeComparator
};

// Export comparator map for registration
export const COMPARATORS = {
    percentChange: percentChangeComparator
};
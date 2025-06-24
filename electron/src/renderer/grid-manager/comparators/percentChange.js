/**
 * Percent Change Comparator
 * Sorts by absolute value for biggest movers
 * Extracted from GridManager.js - Phase 3
 */

/**
 * Functionality:
 * Sorts by absolute value for biggest movers
 * Provides a public API for percent change sorting
 */

export function percentChangeComparator(valueA, valueB) {
    // Sort by absolute value for biggest movers
    return Math.abs(valueB || 0) - Math.abs(valueA || 0);
}
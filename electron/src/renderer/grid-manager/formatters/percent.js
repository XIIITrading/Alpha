/**
 * Percent Formatter
 * Formats values as percentages with sign
 * Extracted from GridManager.js - Phase 3
 */

/**
 * Functionality:
 * Formats values as percentages with sign
 * Handles null/undefined values
 * Provides a public API for percentage formatting
 */

export function percentFormatter(params) {
    const value = params.value;
    if (value == null) return '';
    
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
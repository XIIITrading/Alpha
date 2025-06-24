/**
 * Large Number Formatter
 * Formats large numbers with abbreviations
 * Extracted from GridManager.js - Phase 3
 */

/**
 * Functionality:
 * Formats large numbers with abbreviations
 * Handles null/undefined values
 * Provides a public API for large number formatting
 */

export function largeNumberFormatter(params) {
    const value = params.value;
    if (value == null) return '';
    
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    
    return `$${value.toFixed(0)}`;
}
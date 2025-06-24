/**
 * Currency Formatter
 * Formats values as USD currency
 * Extracted from GridManager.js - Phase 3
 */

/**
 * Functionality:
 * Formats values as USD currency
 * Uses Intl.NumberFormat for currency formatting
 * Provides a public API for currency formatting
 */

export function currencyFormatter(params) {
    const value = params.value;
    if (value == null) return '';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}
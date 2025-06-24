/**
 * DateTime Formatter
 * Formats datetime values as time strings
 * Extracted from GridManager.js - Phase 3
 */

/**
 * Functionality:
 * Formats datetime values as time strings
 * Handles null/undefined values
 * Provides a public API for datetime formatting
 */

export function datetimeFormatter(params) {
    const value = params.value;
    if (!value) return '';
    
    const date = new Date(value);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
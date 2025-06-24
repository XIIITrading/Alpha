/**
 * HeaderFormatter.js - Formats column headers
 * 
 * Provides consistent header formatting across grids
 */

class HeaderFormatter {
    constructor() {
        // Special case mappings
        this.specialCases = {
            'hvn': 'HVN',
            'poc': 'POC',
            'atr': 'ATR',
            'rsi': 'RSI',
            'pl': 'P&L',
            'ema': 'EMA',
            'sma': 'SMA',
            'vwap': 'VWAP',
            'macd': 'MACD',
            'bb': 'BB',
            'id': 'ID',
            'api': 'API',
            'url': 'URL'
        };
        
        // Common abbreviations to preserve
        this.preserveAbbreviations = new Set([
            'CEO', 'CFO', 'CTO', 'IPO', 'ETF', 'GDP', 'USD', 'EUR', 'GBP'
        ]);
    }

    /**
     * Format field name to human-readable header
     * @param {string} field - Field name
     * @param {Object} options - Formatting options
     * @returns {string} Formatted header
     */
    format(field, options = {}) {
        if (!field) return '';
        
        // Apply custom formatter if provided
        if (options.formatter && typeof options.formatter === 'function') {
            return options.formatter(field);
        }
        
        // Check for exact match in special cases
        const lowerField = field.toLowerCase();
        for (const [key, value] of Object.entries(this.specialCases)) {
            if (lowerField === key) {
                return value;
            }
        }
        
        // Handle snake_case
        if (field.includes('_')) {
            return this.formatSnakeCase(field);
        }
        
        // Handle camelCase
        if (this.isCamelCase(field)) {
            return this.formatCamelCase(field);
        }
        
        // Handle special patterns
        field = this.handleSpecialPatterns(field);
        
        // Capitalize first letter
        return this.capitalizeFirst(field);
    }

    /**
     * Format snake_case to Title Case
     * @param {string} field - Snake case field
     * @returns {string} Formatted header
     */
    formatSnakeCase(field) {
        return field
            .split('_')
            .map(word => this.formatWord(word))
            .join(' ');
    }

    /**
     * Format camelCase to Title Case
     * @param {string} field - Camel case field
     * @returns {string} Formatted header
     */
    formatCamelCase(field) {
        // Insert spaces before capital letters
        let result = field.replace(/([A-Z])/g, ' $1').trim();
        
        // Handle consecutive capitals (e.g., 'PLPercent' -> 'PL Percent')
        result = result.replace(/([A-Z])([A-Z])([a-z])/g, '$1$2 $3');
        
        // Format each word
        return result
            .split(' ')
            .map(word => this.formatWord(word))
            .join(' ');
    }

    /**
     * Format individual word
     * @param {string} word - Word to format
     * @returns {string} Formatted word
     */
    formatWord(word) {
        if (!word) return '';
        
        const upper = word.toUpperCase();
        
        // Check if it's a known abbreviation
        if (this.preserveAbbreviations.has(upper)) {
            return upper;
        }
        
        // Check special cases
        const lower = word.toLowerCase();
        if (this.specialCases[lower]) {
            return this.specialCases[lower];
        }
        
        // Check if entire word is uppercase (likely abbreviation)
        if (word === upper && word.length <= 4) {
            return upper;
        }
        
        // Standard capitalization
        return this.capitalizeFirst(word);
    }

    /**
     * Handle special patterns in field names
     * @param {string} field - Field name
     * @returns {string} Processed field
     */
    handleSpecialPatterns(field) {
        // Replace common patterns
        field = field.replace(/Pct$/i, ' Percent');
        field = field.replace(/Amt$/i, ' Amount');
        field = field.replace(/Qty$/i, ' Quantity');
        field = field.replace(/Num$/i, ' Number');
        field = field.replace(/Avg$/i, ' Average');
        field = field.replace(/Min$/i, ' Minimum');
        field = field.replace(/Max$/i, ' Maximum');
        field = field.replace(/Dt$/i, ' Date');
        field = field.replace(/Tm$/i, ' Time');
        
        return field.trim();
    }

    /**
     * Check if string is camelCase
     * @param {string} str - String to check
     * @returns {boolean} True if camelCase
     */
    isCamelCase(str) {
        return /^[a-z]+([A-Z][a-z]*)*$/.test(str) || 
               /^[A-Z][a-z]+([A-Z][a-z]*)*$/.test(str);
    }

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Add custom special case
     * @param {string} key - Key to match (lowercase)
     * @param {string} value - Formatted value
     */
    addSpecialCase(key, value) {
        this.specialCases[key.toLowerCase()] = value;
    }

    /**
     * Add abbreviation to preserve
     * @param {string} abbr - Abbreviation to preserve
     */
    addAbbreviation(abbr) {
        this.preserveAbbreviations.add(abbr.toUpperCase());
    }

    /**
     * Batch format headers
     * @param {Array<string>} fields - Array of field names
     * @param {Object} options - Formatting options
     * @returns {Object} Map of field -> formatted header
     */
    formatBatch(fields, options = {}) {
        const result = {};
        fields.forEach(field => {
            result[field] = this.format(field, options);
        });
        return result;
    }
}

// Export singleton instance
export const headerFormatter = new HeaderFormatter();

// Also export class for customization
export default HeaderFormatter;
/**
 * Column Builder
 * Builds AG-Grid column definitions from schema
 * Extracted from GridManager.js - Phase 4
 */

import { 
    SCHEMA_TO_COLDEF, 
    SPECIAL_COLUMNS, 
    HEADER_SPECIAL_CASES 
} from '../config/index.js';
import { gridState } from '../state/index.js';

export class ColumnBuilder {
    /**
     * Build column definitions from table schema
     * @param {string} tableId - Table identifier
     * @param {Object} schema - Table schema definition
     * @param {Object} defaultView - Default view configuration
     * @returns {Array} Column definitions for AG-Grid
     */
    static buildColumnDefs(tableId, schema, defaultView) {
        const columnDefs = [];
        
        // Build column definitions
        for (const [field, type] of Object.entries(schema)) {
            const baseColDef = {
                field: field,
                headerName: this.formatHeader(field),
                sortable: true,
                resizable: true,
                ...SCHEMA_TO_COLDEF[type]
            };

            // Apply special column config if exists
            if (SPECIAL_COLUMNS[field]) {
                const specialConfig = { ...SPECIAL_COLUMNS[field] };
                
                // Resolve string references to actual functions
                if (typeof specialConfig.comparator === 'string') {
                    specialConfig.comparator = gridState.comparators[specialConfig.comparator];
                }
                if (typeof specialConfig.valueFormatter === 'string') {
                    specialConfig.valueFormatter = gridState.valueFormatters[specialConfig.valueFormatter];
                }
                
                Object.assign(baseColDef, specialConfig);
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
     * @param {string} field - Field name
     * @returns {string} Formatted header
     */
    static formatHeader(field) {
        // Direct mappings for problematic fields
        const directMappings = {
            'hvnStrength': 'HVN Strength',
            'unrealizedPL': 'Unrealized P&L',
            'realizedPL': 'Realized P&L',
            'pl': 'P&L',
            'pocLevel': 'POC Level',
            'pocValue': 'POC Value',
            'atrValue': 'ATR Value',
            'rsiValue': 'RSI Value',
            'rsiStrength': 'RSI Strength'
        };
        
        // Check if we have a direct mapping
        if (directMappings[field]) {
            return directMappings[field];
        }
        
        // Otherwise, do standard camelCase conversion
        return field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
}
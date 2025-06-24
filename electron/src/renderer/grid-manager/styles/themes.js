/**
 * themes.js - Grid theme styles
 * 
 * Defines theme-specific styles for AG-Grid
 * Currently implements dark theme for trading interface
 */

export const THEME_STYLES = {
    'ag-theme-alpine-dark': `
        /* AG-Grid Dark Theme Overrides */
        .ag-theme-alpine-dark {
            --ag-background-color: #0d0d0d;
            --ag-header-background-color: #1a1a1a;
            --ag-odd-row-background-color: #0d0d0d;
            --ag-row-hover-color: #1a1a1a;
            --ag-border-color: #333;
            --ag-header-foreground-color: #e0e0e0;
            --ag-foreground-color: #e0e0e0;
            --ag-row-border-color: #222;
            --ag-selected-row-background-color: rgba(0, 170, 255, 0.1);
            --ag-range-selection-border-color: #00aaff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
        }
        
        /* Header styling */
        .ag-theme-alpine-dark .ag-header-cell {
            background-color: #1a1a1a;
            border-right: 1px solid #333;
        }
        
        .ag-theme-alpine-dark .ag-header-cell-label {
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #e0e0e0;
        }
        
        /* Row styling */
        .ag-theme-alpine-dark .ag-row {
            border-bottom: 1px solid #222;
        }
        
        .ag-theme-alpine-dark .ag-row:hover {
            background-color: #1a1a1a !important;
        }
        
        /* Cell styling */
        .ag-theme-alpine-dark .ag-cell {
            border-right: 1px solid #222;
            padding: 0 8px;
            display: flex;
            align-items: center;
        }
        
        /* Filter styling */
        .ag-theme-alpine-dark .ag-floating-filter {
            background-color: #0d0d0d;
            border-top: 1px solid #333;
        }
        
        .ag-theme-alpine-dark .ag-floating-filter-input {
            font-size: 11px;
            background-color: #1a1a1a;
            border: 1px solid #333;
            color: #e0e0e0;
        }
        
        .ag-theme-alpine-dark .ag-floating-filter-input:focus {
            border-color: #00aaff;
            outline: none;
        }
        
        /* Scrollbar styling */
        .ag-theme-alpine-dark .ag-body-viewport::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        .ag-theme-alpine-dark .ag-body-viewport::-webkit-scrollbar-track {
            background: #0d0d0d;
        }
        
        .ag-theme-alpine-dark .ag-body-viewport::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 4px;
        }
        
        .ag-theme-alpine-dark .ag-body-viewport::-webkit-scrollbar-thumb:hover {
            background: #444;
        }
        
        /* Fix for grid sizing */
        .ag-theme-alpine-dark .ag-root-wrapper {
            height: 100%;
        }
        
        /* Menu styling */
        .ag-theme-alpine-dark .ag-menu {
            background-color: #1a1a1a;
            border: 1px solid #333;
        }
        
        .ag-theme-alpine-dark .ag-menu-option {
            color: #e0e0e0;
        }
        
        .ag-theme-alpine-dark .ag-menu-option:hover {
            background-color: #333;
        }
    `
};

export default THEME_STYLES;
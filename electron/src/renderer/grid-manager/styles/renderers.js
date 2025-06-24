/**
 * renderers.js - Cell renderer specific styles
 * 
 * Styles for custom cell renderers used in trading grids
 */

export const RENDERER_STYLES = `
    /* Trading row base style */
    .trading-row {
        border-bottom: 1px solid #222;
        transition: background-color 0.2s ease;
    }
    
    .trading-row:hover {
        background-color: #1a1a1a !important;
    }
    
    /* Symbol cell */
    .symbol-cell {
        color: #00aaff !important;
        font-weight: 600;
        letter-spacing: 0.5px;
        cursor: pointer;
    }
    
    .symbol-cell:hover {
        color: #33bbff !important;
        text-decoration: underline;
    }
    
    /* Price cell */
    .price-cell {
        font-weight: 500;
        transition: color 0.3s ease;
        font-family: 'Consolas', 'Monaco', monospace;
    }
    
    /* P&L cell */
    .pl-cell {
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 3px;
        text-align: right;
        transition: all 0.3s ease;
        font-family: 'Consolas', 'Monaco', monospace;
    }
    
    .pl-cell.positive {
        color: #00ff00;
        background-color: rgba(0, 255, 0, 0.1);
    }
    
    .pl-cell.negative {
        color: #ff3333;
        background-color: rgba(255, 51, 51, 0.1);
    }
    
    .pl-cell.neutral {
        color: #888;
        background-color: transparent;
    }
    
    /* Volume bar cell */
    .volume-bar-cell {
        font-size: 11px;
        font-weight: 500;
        position: relative;
    }
    
    .volume-bar-container {
        position: absolute;
        bottom: 2px;
        left: 2px;
        right: 2px;
        height: 4px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
    }
    
    .volume-bar {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background-color: #00aaff;
        border-radius: 2px;
        transition: width 0.3s ease;
    }
    
    .volume-bar.high {
        background-color: #ffaa00;
    }
    
    /* Alert cell */
    .alert-cell {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }
    
    .alert-icon {
        color: #ffaa00;
        font-size: 16px;
    }
    
    .alert-count {
        color: #ffaa00;
        font-weight: 600;
        font-size: 12px;
    }
    
    /* Signal strength cell */
    .signal-strength-cell {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 8px;
    }
    
    .signal-bar {
        width: 3px;
        background-color: #333;
        border-radius: 1px;
        transition: background-color 0.3s ease;
    }
    
    .signal-bar.active {
        background-color: #00ff00;
    }
    
    .signal-strength-text {
        margin-left: 8px;
        font-size: 11px;
        color: #e0e0e0;
    }
    
    /* Gap type cell */
    .gap-type-cell {
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 3px;
        text-align: center;
    }
    
    .gap-type-small {
        color: #888;
        background-color: rgba(136, 136, 136, 0.1);
    }
    
    .gap-type-medium {
        color: #ffaa00;
        background-color: rgba(255, 170, 0, 0.1);
    }
    
    .gap-type-large {
        color: #ff6600;
        background-color: rgba(255, 102, 0, 0.1);
    }
    
    .gap-type-extreme {
        color: #ff0000;
        background-color: rgba(255, 0, 0, 0.1);
    }
`;

export default RENDERER_STYLES;
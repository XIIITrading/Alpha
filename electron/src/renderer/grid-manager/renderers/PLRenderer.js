/**
 * P&L (Profit & Loss) Renderer
 * Displays P&L values with color coding
 * Extracted from GridManager.js - Phase 2
 */

/**
 * Functionality:
 * Manages P&L value formatting and color coding
 * Handles positive/negative P&L values with background colors
 * Provides a public API for P&L rendering
 */

import { ANIMATION_COLORS } from '../config/index.js';

export class PLRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.className = 'pl-cell';
        this.refresh(params);
    }

    refresh(params) {
        const value = params.value || 0;
        const isPercent = params.colDef.field.includes('Percent');
        
        // Color based on positive/negative
        if (value > 0) {
            this.eGui.style.color = ANIMATION_COLORS.plPositive;
            this.eGui.style.backgroundColor = ANIMATION_COLORS.plPositiveBg;
        } else if (value < 0) {
            this.eGui.style.color = ANIMATION_COLORS.plNegative;
            this.eGui.style.backgroundColor = ANIMATION_COLORS.plNegativeBg;
        } else {
            this.eGui.style.color = ANIMATION_COLORS.plNeutral;
            this.eGui.style.backgroundColor = 'transparent';
        }
        
        // Format value
        if (isPercent) {
            this.eGui.textContent = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
        } else {
            this.eGui.textContent = `${value >= 0 ? '+' : ''}$${Math.abs(value).toFixed(2)}`;
        }
        
        return true;
    }

    getGui() {
        return this.eGui;
    }
}
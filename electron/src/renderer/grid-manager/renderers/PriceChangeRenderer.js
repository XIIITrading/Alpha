/**
 * Price Change Renderer
 * Displays prices with flash animations on change
 * Extracted from GridManager.js - Phase 2
 */

/**
 * Functionality:
 * Manages price change animations and formatting
 * Handles price up/down flash animations
 * Provides a public API for price change rendering
 */

import { ANIMATION_COLORS, ANIMATION_CONFIG } from '../config/index.js';

export class PriceChangeRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.className = 'price-cell';
        this.refresh(params);
    }

    refresh(params) {
        const value = params.value;
        const oldValue = params.node.data._previousPrice;
        
        if (oldValue !== undefined && value !== oldValue) {
            // Flash animation for price change
            this.eGui.classList.remove('flash-up', 'flash-down');
            void this.eGui.offsetWidth; // Force reflow
            
            if (value > oldValue) {
                this.eGui.classList.add('flash-up');
                this.eGui.style.color = ANIMATION_COLORS.priceUp;
            } else {
                this.eGui.classList.add('flash-down');
                this.eGui.style.color = ANIMATION_COLORS.priceDown;
            }
            
            setTimeout(() => {
                this.eGui.style.color = '';
                this.eGui.classList.remove('flash-up', 'flash-down');
            }, ANIMATION_CONFIG.flashDuration);
        }
        
        this.eGui.textContent = value?.toFixed(2) || '0.00';
        return true;
    }

    getGui() {
        return this.eGui;
    }
}
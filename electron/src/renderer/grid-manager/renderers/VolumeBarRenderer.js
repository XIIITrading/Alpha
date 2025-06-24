/**
 * Volume Bar Renderer
 * Displays volume with visual bar representation
 * Extracted from GridManager.js - Phase 2
 */

/**
 * Functionality:
 * Manages volume bar rendering and formatting
 * Handles volume bar creation and animation
 * Provides a public API for volume bar rendering
 */

import { ANIMATION_COLORS, ANIMATION_CONFIG } from '../config/index.js';

export class VolumeBarRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.className = 'volume-bar-cell';
        this.eGui.style.position = 'relative';
        this.eGui.style.width = '100%';
        this.eGui.style.height = '100%';
        this.refresh(params);
    }

    refresh(params) {
        const value = params.value || 0;
        const relativeVolume = params.data.relativeVolume || 1;
        
        // Clear previous content
        this.eGui.innerHTML = '';
        
        // Create bar container
        const barContainer = document.createElement('div');
        barContainer.style.position = 'absolute';
        barContainer.style.bottom = '2px';
        barContainer.style.left = '2px';
        barContainer.style.right = '2px';
        barContainer.style.height = '4px';
        barContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        barContainer.style.borderRadius = '2px';
        
        // Create actual bar
        const bar = document.createElement('div');
        bar.style.position = 'absolute';
        bar.style.left = '0';
        bar.style.top = '0';
        bar.style.height = '100%';
        bar.style.width = `${Math.min(relativeVolume * 100, 100)}%`;
        bar.style.backgroundColor = relativeVolume > 1.5 ? 
            ANIMATION_COLORS.volumeHigh : ANIMATION_COLORS.volumeNormal;
        bar.style.borderRadius = '2px';
        bar.style.transition = `width ${ANIMATION_CONFIG.volumeBarTransitionDuration}ms ease`;
        
        barContainer.appendChild(bar);
        
        // Add text
        const text = document.createElement('div');
        text.style.position = 'relative';
        text.style.zIndex = '1';
        text.style.padding = '0 4px';
        text.textContent = this.formatVolume(value);
        
        this.eGui.appendChild(text);
        this.eGui.appendChild(barContainer);
        
        return true;
    }

    formatVolume(value) {
        if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
        return value.toString();
    }

    getGui() {
        return this.eGui;
    }
}
/**
 * Signal Strength Renderer
 * Displays signal strength with bar visualization
 * Extracted from GridManager.js - Phase 2
 */

/**
 * Functionality:
 * Manages signal strength bar visualization
 * Handles signal strength display with color coding
 * Provides a public API for signal strength rendering
 */

import { ANIMATION_COLORS } from '../config/index.js';

export class SignalStrengthRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.className = 'signal-strength-cell';
        this.eGui.style.display = 'flex';
        this.eGui.style.alignItems = 'center';
        this.eGui.style.gap = '4px';
        this.refresh(params);
    }

    refresh(params) {
        const strength = params.value || 0;
        const bars = 5;
        
        this.eGui.innerHTML = '';
        
        for (let i = 0; i < bars; i++) {
            const bar = document.createElement('div');
            bar.style.width = '3px';
            bar.style.height = `${8 + i * 2}px`;
            bar.style.backgroundColor = i < (strength / 20) ? 
                ANIMATION_COLORS.signalActive : ANIMATION_COLORS.signalInactive;
            bar.style.borderRadius = '1px';
            this.eGui.appendChild(bar);
        }
        
        const text = document.createElement('span');
        text.style.marginLeft = '8px';
        text.style.fontSize = '11px';
        text.textContent = `${strength}%`;
        this.eGui.appendChild(text);
        
        return true;
    }

    getGui() {
        return this.eGui;
    }
}
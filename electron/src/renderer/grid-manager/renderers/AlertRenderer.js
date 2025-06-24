/**
 * Alert Renderer
 * Displays alert icons with count
 * Extracted from GridManager.js - Phase 2
 */

/**
 * Functionality:
 * Manages alert icon display and animation
 * Handles alert count display with color coding
 * Provides a public API for alert rendering
 */

import { ANIMATION_COLORS } from '../config/index.js';

export class AlertRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.className = 'alert-cell';
        this.eGui.style.textAlign = 'center';
        this.refresh(params);
    }

    refresh(params) {
        const count = params.value || 0;
        
        if (count > 0) {
            this.eGui.innerHTML = `
                <span style="color: ${ANIMATION_COLORS.alertWarning}; font-size: 16px;">⚠</span>
                <span style="margin-left: 4px; color: ${ANIMATION_COLORS.alertWarning};">${count}</span>
            `;
            
            if (count > 2) {
                this.eGui.style.animation = 'pulse 1s infinite';
            }
        } else {
            this.eGui.textContent = '';
        }
        
        return true;
    }

    getGui() {
        return this.eGui;
    }
}
/**
 * Gap Type Renderer
 * Displays gap type with color coding
 * Extracted from GridManager.js - Phase 2
 */

/**
 * Functionality:
 * Manages gap type display and color coding
 * Handles gap type display with color coding
 * Provides a public API for gap type rendering
 */

export class GapTypeRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.refresh(params);
    }

    refresh(params) {
        const gapType = params.value || 'Unknown';
        const colors = {
            'Small': '#888',
            'Medium': '#ffaa00',
            'Large': '#ff6600',
            'Extreme': '#ff0000'
        };
        
        this.eGui.style.color = colors[gapType] || '#888';
        this.eGui.style.fontWeight = '600';
        this.eGui.style.fontSize = '11px';
        this.eGui.textContent = gapType;
        
        return true;
    }

    getGui() {
        return this.eGui;
    }
}
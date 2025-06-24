/**
 * StyleInjector - Main styles module
 * 
 * Handles injection and management of all grid styles
 */

import ANIMATIONS from './animations.js';
import THEME_STYLES from './themes.js';
import RENDERER_STYLES from './renderers.js';

class StyleInjector {
    constructor() {
        this.styleId = 'grid-manager-styles';
        this.injected = false;
    }

    /**
     * Inject all styles into the document
     * @param {string} theme - Theme name (default: 'ag-theme-alpine-dark')
     */
    injectStyles(theme = 'ag-theme-alpine-dark') {
        if (this.injected && document.getElementById(this.styleId)) {
            console.log('[StyleInjector] Styles already injected');
            return;
        }

        const styles = this.buildStylesheet(theme);
        this.injectStyleElement(styles);
        this.injected = true;
        
        console.log('[StyleInjector] Styles injected successfully');
    }

    /**
     * Build complete stylesheet
     * @param {string} theme - Theme name
     * @returns {string} Complete CSS
     */
    buildStylesheet(theme) {
        const themeStyles = THEME_STYLES[theme] || '';
        
        return `
            /* Grid Manager Styles - Auto-generated */
            ${themeStyles}
            ${RENDERER_STYLES}
            ${ANIMATIONS}
            
            /* Additional utility classes */
            .grid-container {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }
            
            .grid-loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .grid-loading-text {
                color: #e0e0e0;
                font-size: 14px;
                font-weight: 500;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .ag-theme-alpine-dark {
                    font-size: 11px;
                }
                
                .ag-theme-alpine-dark .ag-header-cell-label {
                    font-size: 10px;
                }
            }
        `;
    }

    /**
     * Inject style element into document head
     * @param {string} styles - CSS content
     */
    injectStyleElement(styles) {
        // Remove existing styles if any
        this.removeStyles();
        
        const styleElement = document.createElement('style');
        styleElement.id = this.styleId;
        styleElement.textContent = styles;
        
        document.head.appendChild(styleElement);
    }

    /**
     * Remove injected styles
     */
    removeStyles() {
        const existing = document.getElementById(this.styleId);
        if (existing) {
            existing.remove();
            this.injected = false;
        }
    }

    /**
     * Update theme
     * @param {string} newTheme - New theme name
     */
    updateTheme(newTheme) {
        this.removeStyles();
        this.injectStyles(newTheme);
    }

    /**
     * Add custom styles
     * @param {string} customStyles - Additional CSS
     */
    addCustomStyles(customStyles) {
        const styleElement = document.getElementById(this.styleId);
        if (styleElement) {
            styleElement.textContent += `\n/* Custom Styles */\n${customStyles}`;
        }
    }

    /**
     * Check if styles are injected
     * @returns {boolean} True if styles are injected
     */
    isInjected() {
        return this.injected && !!document.getElementById(this.styleId);
    }
}

// Export singleton instance
export const styleInjector = new StyleInjector();

// Also export class for testing
export default StyleInjector;

// Export style components
export { ANIMATIONS, THEME_STYLES, RENDERER_STYLES };
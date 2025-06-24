/**
 * Animation Configuration
 * Extracted from GridManager.js - Phase 1
 */

/**
 * Functionality:
 * Defines animation settings for price changes, volume bars, and alerts
 * Provides color mappings for different price states
 */

export const ANIMATION_CONFIG = {
    flashDuration: 500, // Flash animation duration in ms
    colorTransitionDuration: 300, // Color transition duration in ms
    volumeBarTransitionDuration: 300 // Volume bar transition duration in ms
};

export const ANIMATION_COLORS = {
    priceUp: '#00ff00',
    priceDown: '#ff3333',
    plPositive: '#00ff00',
    plNegative: '#ff3333',
    plPositiveBg: 'rgba(0, 255, 0, 0.1)',
    plNegativeBg: 'rgba(255, 51, 51, 0.1)',
    plNeutral: '#888',
    volumeNormal: '#00aaff',
    volumeHigh: '#ffaa00',
    alertWarning: '#ffaa00',
    signalActive: '#00ff00',
    signalInactive: '#333'
};
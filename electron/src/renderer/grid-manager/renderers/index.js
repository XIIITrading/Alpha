/**
 * Cell Renderers Aggregator
 * Exports all custom cell renderers
 * Extracted from GridManager.js - Phase 2
 */

/**
 * Functionality:
 * Exports all custom cell renderers
 * Provides a single import point for all renderers
 * Exports a map of renderers for AG-Grid registration
 */

import { PriceChangeRenderer } from './PriceChangeRenderer.js';
import { PLRenderer } from './PLRenderer.js';
import { VolumeBarRenderer } from './VolumeBarRenderer.js';
import { AlertRenderer } from './AlertRenderer.js';
import { SignalStrengthRenderer } from './SignalStrengthRenderer.js';
import { GapTypeRenderer } from './GapTypeRenderer.js';

// Export individual renderers
export {
    PriceChangeRenderer,
    PLRenderer,
    VolumeBarRenderer,
    AlertRenderer,
    SignalStrengthRenderer,
    GapTypeRenderer
};

// Export renderer map for AG-Grid registration
export const CELL_RENDERERS = {
    PriceChangeRenderer,
    PLRenderer,
    VolumeBarRenderer,
    AlertRenderer,
    SignalStrengthRenderer,
    GapTypeRenderer
};
/**
 * Module Aggregator
 * Exports all calculation modules
 */

export { GapScannerModule } from './gapScanner.js';
export { MarketStructureModule } from './marketStructure.js';
export { HVNProximityModule } from './hvnProximity.js';
export { MomentumModule } from './momentum.js';

// Re-export as default object for convenience
import { GapScannerModule } from './gapScanner.js';
import { MarketStructureModule } from './marketStructure.js';
import { HVNProximityModule } from './hvnProximity.js';
import { MomentumModule } from './momentum.js';

export default {
    GapScannerModule,
    MarketStructureModule,
    HVNProximityModule,
    MomentumModule
};
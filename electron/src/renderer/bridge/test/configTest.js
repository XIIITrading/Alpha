/**
 * Test configuration extraction
 */

import { TABLE_CONFIGS, PREMARKET_GRID_CONFIGS } from '../config/index.js';

console.log('=== Configuration Test ===');
console.log('TABLE_CONFIGS keys:', Object.keys(TABLE_CONFIGS));
console.log('PREMARKET_GRID_CONFIGS keys:', Object.keys(PREMARKET_GRID_CONFIGS));

// Verify specific configs
console.log('\nScanner config exists:', !!TABLE_CONFIGS.scanner);
console.log('Scanner schema keys:', Object.keys(TABLE_CONFIGS.scanner.schema));

console.log('\nGappers config exists:', !!PREMARKET_GRID_CONFIGS.gappers);
console.log('Gappers schema keys:', Object.keys(PREMARKET_GRID_CONFIGS.gappers.schema));
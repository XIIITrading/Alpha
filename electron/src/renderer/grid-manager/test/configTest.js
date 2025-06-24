/**
 * Configuration Test
 * Verifies all configuration modules load correctly
 */

/**
 * Functionality:
 * Verifies all configuration modules load correctly
 * Tests individual imports and exports
 * Provides a summary of test results
 */

console.log('=== Configuration Test ===\n');

// Test individual imports
const tests = [
    {
        name: 'Grid Defaults',
        test: async () => {
            const { GRID_DEFAULTS, SCHEMA_TO_COLDEF, SPECIAL_COLUMNS, HEADER_SPECIAL_CASES } = 
                await import('../config/gridDefaults.js');
            
            console.log('✓ Grid Defaults loaded');
            console.log(`  - Default column properties: ${Object.keys(GRID_DEFAULTS.defaultColDef).length}`);
            console.log(`  - Schema mappings: ${Object.keys(SCHEMA_TO_COLDEF).length}`);
            console.log(`  - Special columns: ${Object.keys(SPECIAL_COLUMNS).length}`);
            console.log(`  - Header special cases: ${Object.keys(HEADER_SPECIAL_CASES).length}`);
            
            // Verify critical configs exist
            if (!GRID_DEFAULTS.rowHeight) throw new Error('Missing rowHeight');
            if (!SPECIAL_COLUMNS.symbol) throw new Error('Missing symbol column config');
        }
    },
    {
        name: 'Themes',
        test: async () => {
            const { THEMES, DEFAULT_THEME } = await import('../config/themes.js');
            
            console.log('✓ Themes loaded');
            console.log(`  - Available themes: ${Object.keys(THEMES).join(', ')}`);
            console.log(`  - Default theme: ${DEFAULT_THEME}`);
            
            if (!DEFAULT_THEME) throw new Error('Missing default theme');
        }
    },
    {
        name: 'Animations',
        test: async () => {
            const { ANIMATION_CONFIG, ANIMATION_COLORS } = await import('../config/animations.js');
            
            console.log('✓ Animations loaded');
            console.log(`  - Animation settings: ${Object.keys(ANIMATION_CONFIG).length}`);
            console.log(`  - Animation colors: ${Object.keys(ANIMATION_COLORS).length}`);
            
            if (!ANIMATION_CONFIG.flashDuration) throw new Error('Missing flash duration');
        }
    },
    {
        name: 'Config Index',
        test: async () => {
            const config = await import('../config/index.js');
            
            console.log('✓ Config index loaded');
            console.log(`  - Exported items: ${Object.keys(config).length}`);
            
            // Verify all expected exports
            const expectedExports = [
                'GRID_DEFAULTS', 'SCHEMA_TO_COLDEF', 'SPECIAL_COLUMNS', 'HEADER_SPECIAL_CASES',
                'THEMES', 'DEFAULT_THEME',
                'ANIMATION_CONFIG', 'ANIMATION_COLORS'
            ];
            
            for (const exp of expectedExports) {
                if (!config[exp]) throw new Error(`Missing export: ${exp}`);
            }
        }
    }
];

// Run tests
let passed = 0;
let failed = 0;

for (const { name, test } of tests) {
    try {
        await test();
        passed++;
    } catch (error) {
        console.error(`✗ ${name}: ${error.message}`);
        failed++;
    }
}

console.log(`\n=== Summary ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${tests.length}`);

if (failed === 0) {
    console.log('\n✅ All configuration tests passed!');
} else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
}
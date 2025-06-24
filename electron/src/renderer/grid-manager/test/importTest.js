console.log('Testing imports...\n');

try {
    const renderers = await import('../renderers/index.js');
    console.log('✓ Renderers imported');
    console.log('  - CELL_RENDERERS exists:', !!renderers.CELL_RENDERERS);
    console.log('  - Renderer count:', Object.keys(renderers.CELL_RENDERERS || {}).length);
} catch (error) {
    console.error('✗ Renderers import failed:', error.message);
    console.error('  Stack:', error.stack);
}

try {
    const formatters = await import('../formatters/index.js');
    console.log('✓ Formatters imported');
    console.log('  - VALUE_FORMATTERS exists:', !!formatters.VALUE_FORMATTERS);
    console.log('  - Formatter count:', Object.keys(formatters.VALUE_FORMATTERS || {}).length);
} catch (error) {
    console.error('✗ Formatters import failed:', error.message);
    console.error('  Stack:', error.stack);
}

try {
    const comparators = await import('../comparators/index.js');
    console.log('✓ Comparators imported');
    console.log('  - COMPARATORS exists:', !!comparators.COMPARATORS);
    console.log('  - Comparator count:', Object.keys(comparators.COMPARATORS || {}).length);
} catch (error) {
    console.error('✗ Comparators import failed:', error.message);
    console.error('  Stack:', error.stack);
}

console.log('\nTesting state import...');
try {
    const state = await import('../state/stateManager.js');
    console.log('✓ State imported successfully');
} catch (error) {
    console.error('✗ State import failed:', error.message);
    console.error('  Stack:', error.stack);
}
/**
 * Cell Renderers Test
 * Verifies all cell renderers work correctly
 */

import { createMockParams, mockDocument } from './mockRendererEnvironment.js';
import { CELL_RENDERERS } from '../renderers/index.js';

// Set up environment
global.document = mockDocument;
global.setTimeout = (fn) => fn();

console.log('=== Cell Renderers Test ===\n');

const tests = [
    {
        name: 'PriceChangeRenderer',
        test: () => {
            const renderer = new CELL_RENDERERS.PriceChangeRenderer();
            
            // Test initialization
            const params = createMockParams(100.50, 'price', { _previousPrice: 100.00 });
            renderer.init(params);
            
            const gui = renderer.getGui();
            if (!gui) throw new Error('GUI not created');
            if (!gui.className.includes('price-cell')) throw new Error('Class not set');
            
            // Test price increase
            params.value = 101.00;
            renderer.refresh(params);
            if (!gui.textContent.includes('101.00')) throw new Error('Price not updated');
            
            console.log('✓ PriceChangeRenderer working');
        }
    },
    {
        name: 'PLRenderer',
        test: () => {
            const renderer = new CELL_RENDERERS.PLRenderer();
            
            // Test positive value
            const params = createMockParams(50.25, 'unrealizedPL');
            renderer.init(params);
            
            const gui = renderer.getGui();
            if (!gui.textContent.includes('+$50.25')) throw new Error('Positive format incorrect');
            
            // Test percentage
            const percentParams = createMockParams(-10.5, 'changePercent');
            renderer.init(percentParams);
            renderer.refresh(percentParams);
            if (!renderer.getGui().textContent.includes('-10.50%')) throw new Error('Percent format incorrect');
            
            console.log('✓ PLRenderer working');
        }
    },
    {
        name: 'VolumeBarRenderer',
        test: () => {
            const renderer = new CELL_RENDERERS.VolumeBarRenderer();
            
            const params = createMockParams(1500000, 'volume', { relativeVolume: 1.5 });
            renderer.init(params);
            
            const gui = renderer.getGui();
            if (!gui.textContent.includes('1.5M')) throw new Error('Volume format incorrect');
            if (gui.children.length < 2) throw new Error('Bar elements not created');
            
            console.log('✓ VolumeBarRenderer working');
        }
    },
    {
        name: 'AlertRenderer',
        test: () => {
            const renderer = new CELL_RENDERERS.AlertRenderer();
            
            // Test with alerts
            const params = createMockParams(3, 'alerts');
            renderer.init(params);
            
            const gui = renderer.getGui();
            if (!gui.innerHTML.includes('⚠')) throw new Error('Alert icon not shown');
            if (!gui.innerHTML.includes('3')) throw new Error('Alert count not shown');
            
            // Test with no alerts
            params.value = 0;
            renderer.refresh(params);
            if (gui.textContent !== '') throw new Error('Should be empty with 0 alerts');
            
            console.log('✓ AlertRenderer working');
        }
    },
    {
        name: 'SignalStrengthRenderer',
        test: () => {
            const renderer = new CELL_RENDERERS.SignalStrengthRenderer();
            
            const params = createMockParams(60, 'strength');
            renderer.init(params);
            
            const gui = renderer.getGui();
            if (!gui.textContent.includes('60%')) throw new Error('Strength percentage not shown');
            if (gui.children.length !== 6) throw new Error('Should have 5 bars + text'); // 5 bars + 1 text span
            
            console.log('✓ SignalStrengthRenderer working');
        }
    },
    {
        name: 'GapTypeRenderer',
        test: () => {
            const renderer = new CELL_RENDERERS.GapTypeRenderer();
            
            const params = createMockParams('Large', 'gapType');
            renderer.init(params);
            
            const gui = renderer.getGui();
            if (gui.textContent !== 'Large') throw new Error('Gap type not displayed');
            if (!gui.style.color) throw new Error('Color not set');
            
            console.log('✓ GapTypeRenderer working');
        }
    },
    {
        name: 'Renderer Map',
        test: () => {
            const rendererCount = Object.keys(CELL_RENDERERS).length;
            if (rendererCount !== 6) throw new Error(`Expected 6 renderers, got ${rendererCount}`);
            
            // Verify all are classes
            for (const [name, RendererClass] of Object.entries(CELL_RENDERERS)) {
                const instance = new RendererClass();
                if (typeof instance.init !== 'function') {
                    throw new Error(`${name} missing init method`);
                }
            }
            
            console.log('✓ Renderer map complete');
            console.log(`  - Total renderers: ${rendererCount}`);
        }
    }
];

// Run tests
let passed = 0;
let failed = 0;

for (const { name, test } of tests) {
    try {
        test();
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
    console.log('\n✅ All renderer tests passed!');
} else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
}
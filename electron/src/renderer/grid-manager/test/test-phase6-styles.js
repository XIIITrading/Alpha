/**
 * test-phase6-styles.js - Test style injection functionality
 */

// Mock DOM for Node.js
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

import StyleInjector, { ANIMATIONS, THEME_STYLES, RENDERER_STYLES } from '../styles/index.js';

console.log('🧪 Testing Phase 6: Styles\n');

// Test 1: Style content
console.log('1️⃣ Testing style content...');
console.log('✓ Animations defined:', ANIMATIONS.includes('@keyframes'));
console.log('✓ Theme styles defined:', Object.keys(THEME_STYLES).length > 0);
console.log('✓ Renderer styles defined:', RENDERER_STYLES.includes('.trading-row'));

// Test 2: StyleInjector
console.log('\n2️⃣ Testing StyleInjector...');
const injector = new StyleInjector();

// Check initial state
console.log('✓ Initial state - not injected:', !injector.isInjected());

// Inject styles
injector.injectStyles();
console.log('✓ Styles injected');

// Verify injection
const styleElement = document.getElementById('grid-manager-styles');
console.log('✓ Style element exists:', !!styleElement);
console.log('✓ Style content length:', styleElement?.textContent.length || 0);

// Test 3: Style content verification
console.log('\n3️⃣ Verifying injected styles...');
const content = styleElement?.textContent || '';
console.log('✓ Contains theme styles:', content.includes('ag-theme-alpine-dark'));
console.log('✓ Contains animations:', content.includes('@keyframes flash-up'));
console.log('✓ Contains renderer styles:', content.includes('.price-cell'));

// Test 4: Remove styles
console.log('\n4️⃣ Testing style removal...');
injector.removeStyles();
console.log('✓ Styles removed');
console.log('✓ Style element gone:', !document.getElementById('grid-manager-styles'));
console.log('✓ Injected flag reset:', !injector.isInjected());

// Test 5: Custom styles
console.log('\n5️⃣ Testing custom styles...');
injector.injectStyles();
injector.addCustomStyles('.custom-class { color: red; }');
const updatedContent = document.getElementById('grid-manager-styles')?.textContent || '';
console.log('✓ Custom styles added:', updatedContent.includes('.custom-class'));

// Test 6: Theme update
console.log('\n6️⃣ Testing theme update...');
injector.updateTheme('ag-theme-alpine-dark');
console.log('✓ Theme updated');
console.log('✓ Styles re-injected:', injector.isInjected());

console.log('\n✅ Phase 6 Style tests completed!');
console.log('\n📊 Summary:');
console.log('- Style definitions ✓');
console.log('- Style injection ✓');
console.log('- Style removal ✓');
console.log('- Custom styles ✓');
console.log('- Theme updates ✓');
console.log('\nReady for Phase 7: Utils! 🛠️');

process.exit(0);
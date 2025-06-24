/**
 * Value Formatters Test
 * Verifies all formatters work correctly
 */

import { VALUE_FORMATTERS } from '../formatters/index.js';

console.log('=== Value Formatters Test ===\n');

const tests = [
    {
        name: 'Currency Formatter',
        test: () => {
            const formatter = VALUE_FORMATTERS.currency;
            
            // Test regular value
            let result = formatter({ value: 1234.56 });
            if (result !== '$1,234.56') throw new Error(`Expected $1,234.56, got ${result}`);
            
            // Test zero
            result = formatter({ value: 0 });
            if (result !== '$0.00') throw new Error(`Expected $0.00, got ${result}`);
            
            // Test negative
            result = formatter({ value: -999.99 });
            if (result !== '-$999.99') throw new Error(`Expected -$999.99, got ${result}`);
            
            // Test null
            result = formatter({ value: null });
            if (result !== '') throw new Error('Expected empty string for null');
            
            console.log('✓ Currency formatter working');
            console.log('  - Formats: $1,234.56, -$999.99');
        }
    },
    {
        name: 'Percent Formatter',
        test: () => {
            const formatter = VALUE_FORMATTERS.percent;
            
            // Test positive
            let result = formatter({ value: 5.256 });
            if (result !== '+5.26%') throw new Error(`Expected +5.26%, got ${result}`);
            
            // Test negative
            result = formatter({ value: -3.501 });
            if (result !== '-3.50%') throw new Error(`Expected -3.50%, got ${result}`);
            
            // Test zero
            result = formatter({ value: 0 });
            if (result !== '+0.00%') throw new Error(`Expected +0.00%, got ${result}`);
            
            // Test null
            result = formatter({ value: null });
            if (result !== '') throw new Error('Expected empty string for null');
            
            console.log('✓ Percent formatter working');
            console.log('  - Formats: +5.26%, -3.50%');
        }
    },
    {
        name: 'Large Number Formatter',
        test: () => {
            const formatter = VALUE_FORMATTERS.largeNumber;
            
            // Test trillions
            let result = formatter({ value: 1.234e12 });
            if (result !== '$1.23T') throw new Error(`Expected $1.23T, got ${result}`);
            
            // Test billions
            result = formatter({ value: 4.567e9 });
            if (result !== '$4.57B') throw new Error(`Expected $4.57B, got ${result}`);
            
            // Test millions
            result = formatter({ value: 8.91e6 });
            if (result !== '$8.91M') throw new Error(`Expected $8.91M, got ${result}`);
            
            // Test small number
            result = formatter({ value: 1234 });
            if (result !== '$1234') throw new Error(`Expected $1234, got ${result}`);
            
            // Test null
            result = formatter({ value: null });
            if (result !== '') throw new Error('Expected empty string for null');
            
            console.log('✓ Large number formatter working');
            console.log('  - Formats: $1.23T, $4.57B, $8.91M');
        }
    },
    {
        name: 'DateTime Formatter',
        test: () => {
            const formatter = VALUE_FORMATTERS.datetime;
            
            // Test with fixed date (9:30:45 AM)
            const testDate = new Date('2024-01-15T09:30:45');
            let result = formatter({ value: testDate });
            
            // Just check that it includes time components
            if (!result.includes(':')) throw new Error('Expected time format with colons');
            if (!result.match(/\d{1,2}:\d{2}:\d{2}/)) {
                throw new Error('Expected HH:MM:SS format');
            }
            
            // Test timestamp
            result = formatter({ value: Date.now() });
            if (!result.includes(':')) throw new Error('Expected time format');
            
            // Test null
            result = formatter({ value: null });
            if (result !== '') throw new Error('Expected empty string for null');
            
            console.log('✓ DateTime formatter working');
            console.log(`  - Sample format: ${formatter({ value: new Date() })}`);
        }
    },
    {
        name: 'Formatter Map',
        test: () => {
            const formatterCount = Object.keys(VALUE_FORMATTERS).length;
            if (formatterCount !== 4) {
                throw new Error(`Expected 4 formatters, got ${formatterCount}`);
            }
            
            // Verify all are functions
            for (const [name, formatter] of Object.entries(VALUE_FORMATTERS)) {
                if (typeof formatter !== 'function') {
                    throw new Error(`${name} is not a function`);
                }
            }
            
            console.log('✓ Formatter map complete');
            console.log(`  - Total formatters: ${formatterCount}`);
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
    console.log('\n✅ All formatter tests passed!');
} else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
}
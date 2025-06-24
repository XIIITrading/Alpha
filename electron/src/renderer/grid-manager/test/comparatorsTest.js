/**
 * Comparators Test
 * Verifies all comparators work correctly
 */

import { COMPARATORS } from '../comparators/index.js';

console.log('=== Comparators Test ===\n');

const tests = [
    {
        name: 'Percent Change Comparator',
        test: () => {
            const comparator = COMPARATORS.percentChange;
            
            // Test that it sorts by absolute value (biggest movers first)
            let result = comparator(5, -10);
            if (result <= 0) throw new Error('Should place 5 after -10 (|-10| > |5|)');
            
            result = comparator(-15, 8);
            if (result >= 0) throw new Error('Should place -15 before 8 (|-15| > |8|)');
            
            result = comparator(10, -10);
            if (result !== 0) throw new Error('Equal absolute values should return 0');
            
            // Test null handling
            result = comparator(null, 5);
            if (result <= 0) throw new Error('Null (treated as 0) should come after 5');
            
            result = comparator(5, null);
            if (result >= 0) throw new Error('5 should come before null (treated as 0)');
            
            // Test actual sorting behavior
            const values = [5, -10, 3, -7, 0, 15, -15];
            const sorted = [...values].sort(comparator);
            
            // Verify sorted by absolute value (descending)
            const absoluteValues = sorted.map(v => Math.abs(v));
            const expectedAbsolute = [15, 15, 10, 7, 5, 3, 0];
            
            if (JSON.stringify(absoluteValues) !== JSON.stringify(expectedAbsolute)) {
                throw new Error(`Not sorted by absolute value. Expected: ${expectedAbsolute}, Got: ${absoluteValues}`);
            }
            
            console.log('✓ Percent change comparator working');
            console.log('  - Sorts by absolute value (biggest movers first)');
            console.log(`  - Example sort: [${values}] → [${sorted}]`);
            console.log(`  - Absolute values: [${absoluteValues}]`);
        }
    },
    {
        name: 'Comparator Map',
        test: () => {
            const comparatorCount = Object.keys(COMPARATORS).length;
            if (comparatorCount !== 1) {
                throw new Error(`Expected 1 comparator, got ${comparatorCount}`);
            }
            
            // Verify all are functions
            for (const [name, comparator] of Object.entries(COMPARATORS)) {
                if (typeof comparator !== 'function') {
                    throw new Error(`${name} is not a function`);
                }
            }
            
            console.log('✓ Comparator map complete');
            console.log(`  - Total comparators: ${comparatorCount}`);
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
    console.log('\n✅ All comparator tests passed!');
} else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
}
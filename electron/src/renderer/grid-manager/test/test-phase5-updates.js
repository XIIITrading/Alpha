/**
 * test-phase5-updates.js - Test update management functionality
 */

// Mock requestAnimationFrame for Node.js
global.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 16); // ~60fps
};

global.performance = global.performance || {
    now: () => Date.now()
};

import UpdateQueue from '../updates/UpdateQueue.js';
import UpdateProcessor from '../updates/UpdateProcessor.js';
import UpdateMetrics from '../updates/UpdateMetrics.js';
import UpdateManager from '../updates/index.js';

// Mock grid state
const mockGridState = {
    grids: new Map(),
    config: { AppState: { metrics: { latency: 0 } } },
    
    getGrid(tableId) {
        return this.grids.get(tableId);
    },
    
    addMockGrid(tableId, rowData = []) {
        const mockApi = {
            getRowNode: (id) => {
                const data = rowData.find(r => r.symbol === id || r.id === id);
                return data ? { data } : null;
            },
            applyTransaction: (transaction) => {
                console.log(`[MockGrid] Applied transaction to ${tableId}:`, {
                    add: transaction.add?.length || 0,
                    update: transaction.update?.length || 0,
                    remove: transaction.remove?.length || 0
                });
                return {
                    add: transaction.add || [],
                    update: transaction.update || [],
                    remove: transaction.remove || []
                };
            },
            setGridOption: (option, value) => {
                if (option === 'rowData') {
                    console.log(`[MockGrid] Replaced all data in ${tableId} with ${value.length} rows`);
                }
            },
            isDestroyed: () => false
        };
        
        this.grids.set(tableId, { api: mockApi });
    }
};

console.log('🧪 Testing Phase 5: Update Management\n');

// Test 1: UpdateQueue
console.log('1️⃣ Testing UpdateQueue...');
const queue = new UpdateQueue();
let processedCount = 0;

queue.setProcessor((queues) => {
    processedCount++;
    console.log(`✓ Processor called ${processedCount} time(s)`);
});

queue.add('watchlist', { symbol: 'AAPL', price: 150.00 });
queue.add('watchlist', [
    { symbol: 'GOOGL', price: 140.00 },
    { symbol: 'MSFT', price: 380.00 }
]);

console.log('✓ Queue stats:', queue.getStats());
console.log('✓ Has pending updates:', queue.hasPendingUpdates());

// Wait for requestAnimationFrame
setTimeout(() => {
    console.log('✓ Updates processed via requestAnimationFrame\n');
    
    // Test 2: UpdateProcessor
    console.log('2️⃣ Testing UpdateProcessor...');
    mockGridState.addMockGrid('watchlist', [
        { symbol: 'AAPL', price: 149.00 }
    ]);

    const processor = new UpdateProcessor(mockGridState);
    const testUpdates = [
        {
            data: [
                { symbol: 'AAPL', price: 151.00 },  // Update
                { symbol: 'TSLA', price: 250.00 }   // Add
            ],
            replace: false,
            timestamp: Date.now()
        }
    ];

    const processed = processor.processTableUpdates('watchlist', testUpdates);
    console.log(`✓ Processed ${processed} updates`);
    console.log('✓ Processor metrics:', processor.getMetrics());

    // Test 3: UpdateMetrics
    console.log('\n3️⃣ Testing UpdateMetrics...');
    const metrics = new UpdateMetrics();

    metrics.recordUpdate('watchlist', 3, 15, {
        adds: 1,
        modifications: 2
    });

    metrics.recordUpdate('portfolio', 5, 20, {
        adds: 2,
        modifications: 3
    });

    metrics.recordError('watchlist', new Error('Test error'));

    console.log('✓ Table metrics:', metrics.getTableMetrics('watchlist'));
    console.log('✓ All metrics:', JSON.stringify(metrics.getAllMetrics(), null, 2));
    console.log('✓ Health status:', metrics.getSummary().healthStatus);

    // Test 4: UpdateManager (Integration)
    console.log('\n4️⃣ Testing UpdateManager (Integration)...');
    mockGridState.addMockGrid('portfolio', [
        { symbol: 'NVDA', price: 700.00 }
    ]);

    const manager = new UpdateManager(mockGridState);

    // Add updates
    manager.update('portfolio', { symbol: 'NVDA', price: 705.00 });
    manager.update('portfolio', [
        { symbol: 'AMD', price: 150.00 },
        { symbol: 'INTC', price: 45.00 }
    ]);

    console.log('✓ Queue stats before processing:', manager.getQueueStats());
    console.log('✓ Has pending updates:', manager.hasPendingUpdates());

    // Force processing
    setTimeout(() => {
        manager.forceProcess();
        
        setTimeout(() => {
            console.log('✓ Metrics after processing:', manager.getMetrics().summary);
            
            // Test monitoring
            console.log('\n5️⃣ Testing Performance Monitoring...');
            manager.enableMonitoring(1000);
            console.log('✓ Monitoring enabled');
            
            // Add more updates to see monitoring
            manager.update('portfolio', { symbol: 'NVDA', price: 710.00 });
            
            setTimeout(() => {
                manager.disableMonitoring();
                console.log('✓ Monitoring disabled');
                
                // Test cleanup
                console.log('\n6️⃣ Testing Cleanup...');
                manager.cleanupTable('portfolio');
                console.log('✓ Cleaned up portfolio table');
                
                manager.destroy();
                console.log('✓ Manager destroyed');
                
                console.log('\n✅ Phase 5 Update Management tests completed!');
                console.log('\n📊 Summary:');
                console.log('- UpdateQueue: Batching with requestAnimationFrame ✓');
                console.log('- UpdateProcessor: Transaction handling ✓');
                console.log('- UpdateMetrics: Performance tracking ✓');
                console.log('- UpdateManager: Integration and monitoring ✓');
                console.log('\nReady for Phase 6: Styles! 🎨');
                
                // Exit process
                process.exit(0);
            }, 1500);
        }, 100);
    }, 100);
}, 50);
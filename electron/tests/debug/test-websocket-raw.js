// test-websocket-raw.js
// Test raw WebSocket connection to your Polygon server

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8200/ws/test-client';
const TEST_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT'];

console.log('🔌 Testing Raw WebSocket Connection to Polygon Server\n');
console.log('URL:', WS_URL);
console.log('Symbols:', TEST_SYMBOLS.join(', '));
console.log('=' + '='.repeat(50) + '\n');

const ws = new WebSocket(WS_URL);
let messageCount = 0;
let lastMessageTime = Date.now();

ws.on('open', () => {
    console.log('✅ WebSocket Connected!\n');
    
    // Send subscription message
    const subscribeMsg = {
        action: 'subscribe',
        symbols: TEST_SYMBOLS,
        channels: ['T', 'Q', 'A']  // Trades, Quotes, Aggregates
    };
    
    console.log('📤 Sending subscription:', JSON.stringify(subscribeMsg, null, 2));
    ws.send(JSON.stringify(subscribeMsg));
    console.log('\n🔍 Listening for messages...\n');
});

ws.on('message', (data) => {
    messageCount++;
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime;
    lastMessageTime = now;
    
    try {
        const message = JSON.parse(data.toString());
        
        console.log(`📥 Message #${messageCount} (${timeSinceLastMessage}ms since last):`);
        console.log('Type:', message.type);
        
        if (message.type === 'market_data') {
            const marketData = message.data;
            
            if (Array.isArray(marketData)) {
                console.log(`Batch data with ${marketData.length} items:`);
                marketData.slice(0, 3).forEach((item, i) => {
                    console.log(`  [${i}] ${item.symbol || 'NO_SYMBOL'} - Event: ${item.event_type}, Price: ${item.price}, Size: ${item.size}`);
                });
                if (marketData.length > 3) {
                    console.log(`  ... and ${marketData.length - 3} more items`);
                }
            } else {
                console.log('Single data item:');
                console.log(`  Symbol: ${marketData.symbol || 'NO_SYMBOL'}`);
                console.log(`  Event Type: ${marketData.event_type}`);
                console.log(`  Price: ${marketData.price}`);
                console.log(`  Size/Volume: ${marketData.size || marketData.volume}`);
                console.log(`  Timestamp: ${marketData.timestamp}`);
            }
        } else {
            console.log('Full message:', JSON.stringify(message, null, 2).substring(0, 500));
        }
        
        console.log('-'.repeat(50));
        
    } catch (error) {
        console.error('❌ Failed to parse message:', error.message);
        console.log('Raw data:', data.toString().substring(0, 200));
        console.log('-'.repeat(50));
    }
});

ws.on('error', (error) => {
    console.error('\n❌ WebSocket Error:', error.message);
});

ws.on('close', (code, reason) => {
    console.log('\n🔌 WebSocket Closed');
    console.log('Code:', code);
    console.log('Reason:', reason || 'No reason provided');
    console.log('\n📊 Summary:');
    console.log(`Total messages received: ${messageCount}`);
    process.exit(0);
});

// Status check every 10 seconds
setInterval(() => {
    console.log(`\n📊 Status: ${messageCount} messages received, WebSocket state: ${ws.readyState}`);
    if (messageCount === 0) {
        console.log('⚠️  No messages received yet. Check if:');
        console.log('   - Server is running on port 8200');
        console.log('   - Market is open (or server is in replay mode)');
        console.log('   - Subscription message format is correct');
    }
}, 10000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down...');
    ws.close();
});

console.log('Press Ctrl+C to stop\n');
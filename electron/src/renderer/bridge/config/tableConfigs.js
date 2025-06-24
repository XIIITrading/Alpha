/**
 * Standard Table Configurations
 * Configuration for scanner, positions, signals, and levels tables
 */

// Configuration for standard tables
export const TABLE_CONFIGS = {
    scanner: {
        name: 'Scanner Results',
        schema: {
            symbol: 'string',           // Stock symbol
            price: 'float',            // Current price
            change: 'float',           // Price change
            changePercent: 'float',    // Percentage change
            volume: 'integer',         // Volume
            relativeVolume: 'float',   // Volume vs average
            marketCap: 'float',        // Market capitalization
            float: 'float',            // Float shares
            shortFloat: 'float',       // Short float percentage
            atr: 'float',              // Average True Range
            beta: 'float',             // Beta coefficient
            rsi: 'float',              // RSI indicator
            alerts: 'integer',         // Number of alerts
            timestamp: 'datetime'      // Last update time
        },
        defaultView: {
            columns: ['symbol', 'price', 'changePercent', 'volume', 'relativeVolume'],
            sort: [['relativeVolume', 'desc']],
            filter: []
        },
        // Add grid options here to avoid colDef warnings
        gridOptions: {
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true
        }
    },
    
    positions: {
        name: 'Open Positions',
        schema: {
            symbol: 'string',          // Stock symbol
            side: 'string',            // LONG or SHORT
            quantity: 'integer',       // Share quantity
            entryPrice: 'float',       // Entry price
            currentPrice: 'float',     // Current price
            marketValue: 'float',      // Current market value
            unrealizedPL: 'float',     // Unrealized P&L
            unrealizedPLPercent: 'float', // Unrealized P&L %
            realizedPL: 'float',       // Realized P&L (partial fills)
            stopLoss: 'float',         // Stop loss price
            takeProfit: 'float',       // Take profit price
            duration: 'integer',       // Position duration (seconds)
            timestamp: 'datetime'      // Last update
        },
        defaultView: {
            columns: ['symbol', 'side', 'quantity', 'entryPrice', 'currentPrice', 'unrealizedPL', 'unrealizedPLPercent'],
            sort: [['unrealizedPLPercent', 'desc']],
            filter: []
        },
        gridOptions: {
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true
        }
    },
    
    signals: {
        name: 'Trading Signals',
        schema: {
            id: 'string',              // Unique signal ID
            timestamp: 'datetime',     // Signal generation time
            symbol: 'string',          // Stock symbol
            type: 'string',            // Signal type (ENTRY, EXIT, etc.)
            direction: 'string',       // BUY or SELL
            strength: 'float',         // Signal strength (0-100)
            price: 'float',            // Trigger price
            stopLoss: 'float',         // Suggested stop loss
            takeProfit: 'float',       // Suggested take profit
            confidence: 'float',       // Confidence score
            source: 'string',          // Signal source/strategy
            status: 'string',          // ACTIVE, TRIGGERED, EXPIRED
            notes: 'string'            // Additional notes
        },
        defaultView: {
            columns: ['timestamp', 'symbol', 'type', 'direction', 'price', 'strength', 'status'],
            sort: [['timestamp', 'desc']],
            filter: [['status', '==', 'ACTIVE']]
        },
        gridOptions: {
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true
        }
    },
    
    levels: {
        name: 'Price Levels',
        schema: {
            symbol: 'string',          // Stock symbol
            type: 'string',            // SUPPORT, RESISTANCE, PIVOT
            level: 'float',            // Price level
            strength: 'integer',       // Level strength (1-5)
            touches: 'integer',        // Number of touches
            lastTouch: 'datetime',     // Last touch time
            created: 'datetime',       // When level was identified
            timeframe: 'string',       // Timeframe (5m, 1h, 1d, etc.)
            active: 'boolean'          // Is level still active
        },
        defaultView: {
            columns: ['symbol', 'type', 'level', 'strength', 'touches', 'timeframe'],
            sort: [['symbol', 'asc'], ['level', 'desc']],
            filter: [['active', '==', true]]
        },
        gridOptions: {
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true
        }
    }
};
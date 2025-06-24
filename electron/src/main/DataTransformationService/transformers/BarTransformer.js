// electron/src/main/DataTransformationService/transformers/BarTransformer.js
/**
 * BarTransformer - Transforms Polygon aggregate bar events to AG-Grid format
 * 
 * Handles:
 * - OHLC data transformation
 * - Volume weighted average price (VWAP)
 * - Bar statistics
 */

const log = require('electron-log');
const logger = log.scope('BarTransformer');

class BarTransformer {
    constructor(options = {}) {
        this.options = options;
        
        // Field mapping
        this.fieldMap = {
            symbol: 'symbol',
            timestamp: 'timestamp',
            open: 'open',
            high: 'high',
            low: 'low',
            close: 'close',
            volume: 'volume',
            vwap: 'vwap',
            transactions: 'transactions'
        };
    }
    
    /**
     * Transform a bar event
     * @param {Object} bar - Raw bar event from Polygon
     * @returns {Object} - Transformed bar data
     */
    transform(bar) {
        if (!bar) return null;
        
        try {
            const transformed = {
                _eventType: 'bar',
                _originalData: bar
            };
            
            // Apply field mappings
            for (const [source, target] of Object.entries(this.fieldMap)) {
                if (bar[source] !== undefined) {
                    transformed[target] = bar[source];
                }
            }
            
            // Use close price as current price
            transformed.price = transformed.close || 0;
            
            // Format timestamp
            if (transformed.timestamp) {
                transformed.timestamp = new Date(transformed.timestamp).toISOString();
                transformed.rawTimestamp = bar.timestamp;
            }
            
            // Calculate bar statistics
            if (transformed.high && transformed.low) {
                // Bar range
                transformed.range = transformed.high - transformed.low;
                transformed.rangePercent = transformed.low > 0 
                    ? (transformed.range / transformed.low) * 100 
                    : 0;
                
                // Body size (open to close)
                if (transformed.open && transformed.close) {
                    transformed.bodySize = Math.abs(transformed.close - transformed.open);
                    transformed.bodySizePercent = transformed.open > 0
                        ? (transformed.bodySize / transformed.open) * 100
                        : 0;
                    
                    // Candle type
                    transformed.candleType = this.getCandleType(transformed);
                }
            }
            
            // Calculate typical price
            if (transformed.high && transformed.low && transformed.close) {
                transformed.typicalPrice = (transformed.high + transformed.low + transformed.close) / 3;
            }
            
            // Add transaction rate
            if (transformed.transactions && transformed.volume) {
                transformed.avgTradeSize = transformed.volume / transformed.transactions;
            }
            
            return transformed;
            
        } catch (error) {
            logger.error('Error transforming bar:', error, bar);
            return null;
        }
    }
    
    /**
     * Determine candle type
     * @param {Object} bar - Bar data with OHLC
     * @returns {string} - Candle type
     */
    getCandleType(bar) {
        const bodyPercent = bar.bodySizePercent || 0;
        const isGreen = bar.close >= bar.open;
        
        // Doji (very small body)
        if (bodyPercent < 0.1) {
            return 'Doji';
        }
        
        // Strong move (large body)
        if (bodyPercent > 2) {
            return isGreen ? 'Strong Bullish' : 'Strong Bearish';
        }
        
        // Normal
        return isGreen ? 'Bullish' : 'Bearish';
    }
}

module.exports = BarTransformer;
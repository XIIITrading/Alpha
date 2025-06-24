// electron/src/main/DataTransformationService/transformers/QuoteTransformer.js
/**
 * QuoteTransformer - Transforms Polygon quote events to AG-Grid format
 * 
 * Handles:
 * - Bid/Ask data transformation
 * - Spread calculations
 * - Quote size aggregation
 */

const log = require('electron-log');
const logger = log.scope('QuoteTransformer');

class QuoteTransformer {
    constructor(options = {}) {
        this.options = options;
        
        // Field mapping
        this.fieldMap = {
            symbol: 'symbol',
            timestamp: 'timestamp',
            bid_price: 'bidPrice',
            bid_size: 'bidSize',
            ask_price: 'askPrice',
            ask_size: 'askSize',
            exchange: 'exchange'
        };
    }
    
    /**
     * Transform a quote event
     * @param {Object} quote - Raw quote event from Polygon
     * @returns {Object} - Transformed quote data
     */
    transform(quote) {
        if (!quote) return null;
        
        try {
            const transformed = {
                _eventType: 'quote',
                _originalData: quote
            };
            
            // Apply field mappings
            for (const [source, target] of Object.entries(this.fieldMap)) {
                if (quote[source] !== undefined) {
                    transformed[target] = quote[source];
                }
            }
            
            // Format timestamp
            if (transformed.timestamp) {
                transformed.timestamp = new Date(transformed.timestamp).toISOString();
                transformed.rawTimestamp = quote.timestamp;
            }
            
            // Calculate spread
            if (transformed.askPrice && transformed.bidPrice) {
                transformed.spread = transformed.askPrice - transformed.bidPrice;
                transformed.spreadPercent = transformed.bidPrice > 0 
                    ? (transformed.spread / transformed.bidPrice) * 100 
                    : 0;
                
                // Calculate mid price
                transformed.price = (transformed.askPrice + transformed.bidPrice) / 2;
            }
            
            // Calculate quote size in dollars
            if (transformed.bidSize && transformed.bidPrice) {
                transformed.bidValue = transformed.bidSize * transformed.bidPrice;
            }
            if (transformed.askSize && transformed.askPrice) {
                transformed.askValue = transformed.askSize * transformed.askPrice;
            }
            
            // Add volume (bid + ask sizes)
            transformed.volume = (transformed.bidSize || 0) + (transformed.askSize || 0);
            
            return transformed;
            
        } catch (error) {
            logger.error('Error transforming quote:', error, quote);
            return null;
        }
    }
}

module.exports = QuoteTransformer;
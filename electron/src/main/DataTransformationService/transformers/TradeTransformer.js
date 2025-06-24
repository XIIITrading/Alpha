// electron/src/main/DataTransformationService/transformers/TradeTransformer.js
/**
 * TradeTransformer - Transforms Polygon trade events to AG-Grid format
 * 
 * Handles field mapping:
 * - size → volume
 * - timestamp formatting
 * - Default value assignment
 */

const log = require('electron-log');
const logger = log.scope('TradeTransformer');

class TradeTransformer {
    constructor(options = {}) {
        this.options = options;
        
        // Field mapping configuration
        this.fieldMap = {
            // Direct mappings
            symbol: 'symbol',
            price: 'price',
            timestamp: 'timestamp',
            exchange: 'exchange',
            
            // Renamed fields
            size: 'volume',  // Polygon uses 'size', AG-Grid expects 'volume'
            
            // Metadata fields
            trade_id: 'tradeId',
            conditions: 'conditions'
        };
        
        // Default values for missing fields
        this.defaults = {
            volume: 0,
            price: 0,
            change: 0,
            changePercent: 0,
            relativeVolume: 0,
            timestamp: null
        };
    }
    
    /**
     * Transform a trade event
     * @param {Object} trade - Raw trade event from Polygon
     * @returns {Object} - Transformed trade data
     */
    transform(trade) {
        if (!trade) return null;
        
        try {
            // Start with base transformation
            const transformed = {
                _eventType: 'trade',
                _originalData: trade  // Keep original for debugging
            };
            
            // Apply field mappings
            for (const [source, target] of Object.entries(this.fieldMap)) {
                if (trade[source] !== undefined) {
                    transformed[target] = trade[source];
                }
            }
            
            // Handle special transformations
            
            // 1. Timestamp conversion
            if (transformed.timestamp) {
                // Polygon sends Unix timestamp in milliseconds
                transformed.timestamp = this.formatTimestamp(transformed.timestamp);
                transformed.rawTimestamp = trade.timestamp;
            }
            
            // 2. Price validation
            if (transformed.price) {
                transformed.price = this.validatePrice(transformed.price);
            }
            
            // 3. Volume validation
            if (transformed.volume !== undefined) {
                transformed.volume = Math.max(0, parseInt(transformed.volume) || 0);
            }
            
            // 4. Exchange name mapping
            if (transformed.exchange !== undefined) {
                transformed.exchangeName = this.getExchangeName(transformed.exchange);
            }
            
            // 5. Trade conditions interpretation
            if (transformed.conditions && Array.isArray(transformed.conditions)) {
                transformed.conditionFlags = this.parseConditions(transformed.conditions);
            }
            
            // Apply defaults for missing fields
            for (const [field, defaultValue] of Object.entries(this.defaults)) {
                if (transformed[field] === undefined) {
                    transformed[field] = defaultValue;
                }
            }
            
            // Validate required fields
            if (!transformed.symbol || transformed.price === null) {
                logger.warn('Invalid trade data - missing required fields', trade);
                return null;
            }
            
            return transformed;
            
        } catch (error) {
            logger.error('Error transforming trade:', error, trade);
            return null;
        }
    }
    
    /**
     * Format timestamp to ISO string
     * @param {number} timestamp - Unix timestamp in milliseconds
     * @returns {string} - ISO formatted timestamp
     */
    formatTimestamp(timestamp) {
        try {
            // Ensure timestamp is a number
            const ts = parseInt(timestamp);
            if (isNaN(ts)) return new Date().toISOString();
            
            // Create date and return ISO string
            return new Date(ts).toISOString();
        } catch (error) {
            logger.error('Error formatting timestamp:', error);
            return new Date().toISOString();
        }
    }
    
    /**
     * Validate and clean price
     * @param {number} price - Raw price value
     * @returns {number} - Validated price
     */
    validatePrice(price) {
        const parsed = parseFloat(price);
        if (isNaN(parsed) || parsed < 0) {
            logger.warn('Invalid price value:', price);
            return 0;
        }
        
        // Round to reasonable precision (4 decimal places)
        return Math.round(parsed * 10000) / 10000;
    }
    
    /**
     * Get exchange name from code
     * @param {number} exchangeCode - Polygon exchange code
     * @returns {string} - Exchange name
     */
    getExchangeName(exchangeCode) {
        const exchangeMap = {
            1: 'NYSE',
            2: 'ARCA',
            3: 'AMEX',
            4: 'NASDAQ',
            5: 'NSX',
            6: 'FINRA',
            7: 'ISE',
            8: 'EDGA',
            9: 'EDGX',
            10: 'CHX',
            11: 'CBOE',
            12: 'BATS',
            13: 'PHLX',
            14: 'BX',
            15: 'CTS',
            16: 'LTSE',
            17: 'IEX',
            18: 'MEMX',
            19: 'PSX',
            20: 'PEARL',
            21: 'MIAX'
        };
        
        return exchangeMap[exchangeCode] || `Exchange ${exchangeCode}`;
    }
    
    /**
     * Parse trade conditions
     * @param {Array} conditions - Array of condition codes
     * @returns {Object} - Parsed condition flags
     */
    parseConditions(conditions) {
        const flags = {
            isRegular: true,
            isOddLot: false,
            isAfterHours: false,
            isIntermarket: false,
            isFormT: false
        };
        
        // Common condition codes
        const conditionMap = {
            2: 'averagePrice',
            7: 'autoExecution',
            14: 'oddLot',
            15: 'priorReference',
            16: 'openingPrint',
            20: 'imbalance',
            29: 'closingPrint',
            37: 'qualifiedContingentTrade',
            41: 'tradeThruExempt',
            52: 'derivativelyPriced',
            53: 'marketCenterOfficialClose'
        };
        
        conditions.forEach(code => {
            if (code === 14) flags.isOddLot = true;
            if (code === 37) flags.isIntermarket = true;
            if ([15, 16, 29].includes(code)) flags.isFormT = true;
        });
        
        return flags;
    }
    
    /**
     * Transform batch of trades
     * @param {Array} trades - Array of trade events
     * @returns {Array} - Array of transformed trades
     */
    transformBatch(trades) {
        if (!Array.isArray(trades)) return [];
        
        return trades
            .map(trade => this.transform(trade))
            .filter(Boolean);  // Remove null results
    }
    
    /**
     * Validate transformed data
     * @param {Object} data - Transformed data
     * @returns {boolean} - Is valid
     */
    validate(data) {
        // Required fields
        if (!data.symbol || typeof data.symbol !== 'string') return false;
        if (data.price === null || data.price === undefined) return false;
        if (data.volume === null || data.volume === undefined) return false;
        if (!data.timestamp) return false;
        
        // Value ranges
        if (data.price < 0) return false;
        if (data.volume < 0) return false;
        
        return true;
    }
}

module.exports = TradeTransformer;
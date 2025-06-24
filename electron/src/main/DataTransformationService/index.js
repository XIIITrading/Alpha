// electron/src/main/DataTransformationService/index.js
/**
 * DataTransformationService - Transforms raw Polygon data to AG-Grid format
 * 
 * This service handles:
 * - Field mapping (size → volume)
 * - Calculated fields (change, changePercent, relativeVolume)
 * - Data enrichment (marketCap, float, etc.)
 * - Historical data tracking for calculations
 */

const MarketDataStore = require('./MarketDataStore');
const TradeTransformer = require('./transformers/TradeTransformer');
const QuoteTransformer = require('./transformers/QuoteTransformer');
const BarTransformer = require('./transformers/BarTransformer');
const ChangeCalculator = require('./calculators/ChangeCalculator');
const VolumeCalculator = require('./calculators/VolumeCalculator');
const log = require('electron-log');

const logger = log.scope('DataTransformationService');

class DataTransformationService {
    constructor(options = {}) {
        // Configuration
        this.options = {
            historySize: options.historySize || 1000,          // Keep last N updates per symbol
            volumeWindow: options.volumeWindow || 20,          // Number of bars for volume average
            enrichmentData: options.enrichmentData || {},      // Static data (marketCap, float, etc.)
            ...options
        };
        
        // Initialize components
        this.marketDataStore = new MarketDataStore({
            maxHistorySize: this.options.historySize
        });
        
        // Initialize transformers
        this.transformers = {
            trade: new TradeTransformer(),
            quote: new QuoteTransformer(),
            bar: new BarTransformer(),
            aggregate: new BarTransformer() // Aggregate bars use same transformer
        };
        
        // Initialize calculators
        this.calculators = {
            change: new ChangeCalculator(this.marketDataStore),
            volume: new VolumeCalculator(this.marketDataStore, {
                windowSize: this.options.volumeWindow
            })
        };
        
        // Metrics
        this.metrics = {
            transformedCount: 0,
            errorCount: 0,
            lastTransformTime: null
        };
        
        logger.info('DataTransformationService initialized', this.options);
    }
    
    /**
     * Transform raw Polygon data to AG-Grid format
     * @param {Object|Array} data - Raw data from Polygon WebSocket
     * @returns {Object|Array} - Transformed data ready for AG-Grid
     */
    transform(data) {
        try {
            // Handle array of data
            if (Array.isArray(data)) {
                return data.map(item => this.transformSingle(item)).filter(Boolean);
            }
            
            // Handle single data item
            return this.transformSingle(data);
            
        } catch (error) {
            logger.error('Transform error:', error);
            this.metrics.errorCount++;
            return null;
        }
    }
    
    /**
     * Transform a single data item
     * @param {Object} item - Single data item
     * @returns {Object} - Transformed item
     */
    transformSingle(item) {
        if (!item) return null;
        
        const startTime = performance.now();
        
        try {
            // Determine data type
            const eventType = item.event_type || item.type || 'unknown';
            
            // Get appropriate transformer
            const transformer = this.transformers[eventType];
            if (!transformer) {
                logger.warn(`No transformer for event type: ${eventType}`);
                return null;
            }
            
            // Step 1: Basic field transformation
            let transformed = transformer.transform(item);
            if (!transformed || !transformed.symbol) {
                return null;
            }
            
            // Step 2: Store in market data store (for calculations)
            this.marketDataStore.update(transformed.symbol, {
                ...transformed,
                rawData: item,
                updateTime: Date.now()
            });
            
            // Step 3: Calculate derived fields
            transformed = this.enrichWithCalculations(transformed);
            
            // Step 4: Add static enrichment data
            transformed = this.enrichWithStaticData(transformed);
            
            // Step 5: Format for AG-Grid
            transformed = this.formatForGrid(transformed);
            
            // Update metrics
            this.metrics.transformedCount++;
            this.metrics.lastTransformTime = performance.now() - startTime;
            
            return transformed;
            
        } catch (error) {
            logger.error(`Error transforming item:`, error, item);
            this.metrics.errorCount++;
            return null;
        }
    }
    
    /**
     * Enrich data with calculations
     * @param {Object} data - Transformed data
     * @returns {Object} - Data with calculated fields
     */
    enrichWithCalculations(data) {
        if (!data.symbol) return data;
        
        // Calculate price changes
        const changeData = this.calculators.change.calculate(data.symbol, data.price);
        Object.assign(data, changeData);
        
        // Calculate volume metrics
        if (data.volume !== undefined) {
            const volumeData = this.calculators.volume.calculate(data.symbol, data.volume);
            Object.assign(data, volumeData);
        }
        
        // Add momentum calculations if we have enough history
        const history = this.marketDataStore.getHistory(data.symbol);
        if (history && history.length > 5) {
            data.momentum5m = this.calculateMomentum(history, 5);
            data.momentum15m = this.calculateMomentum(history, 15);
        }
        
        return data;
    }
    
    /**
     * Calculate momentum over a time window
     * @param {Array} history - Price history
     * @param {number} minutes - Time window in minutes
     * @returns {number} - Momentum percentage
     */
    calculateMomentum(history, minutes) {
        const now = Date.now();
        const windowStart = now - (minutes * 60 * 1000);
        
        // Find price at window start
        let startPrice = null;
        let endPrice = history[history.length - 1].price;
        
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].updateTime <= windowStart) {
                startPrice = history[i].price;
                break;
            }
        }
        
        if (!startPrice) {
            // Use oldest available if window is larger than history
            startPrice = history[0].price;
        }
        
        return ((endPrice - startPrice) / startPrice) * 100;
    }
    
    /**
     * Enrich with static data (marketCap, float, etc.)
     * @param {Object} data - Transformed data
     * @returns {Object} - Data with static fields
     */
    enrichWithStaticData(data) {
        const staticData = this.options.enrichmentData[data.symbol];
        if (!staticData) return data;
        
        // Add static fields if they don't exist
        return {
            ...data,
            marketCap: data.marketCap || staticData.marketCap || 0,
            float: data.float || staticData.float || 0,
            shortFloat: data.shortFloat || staticData.shortFloat || 0,
            atr: data.atr || staticData.atr || 0,
            beta: data.beta || staticData.beta || 0,
            sector: data.sector || staticData.sector || 'Unknown',
            industry: data.industry || staticData.industry || 'Unknown'
        };
    }
    
    /**
     * Format data for AG-Grid display
     * @param {Object} data - Enriched data
     * @returns {Object} - Grid-ready data
     */
    formatForGrid(data) {
        // Ensure all expected fields exist with defaults
        return {
            // Core fields
            symbol: data.symbol,
            price: data.price || 0,
            
            // Calculated fields
            change: data.change || 0,
            changePercent: data.changePercent || 0,
            
            // Volume fields
            volume: data.volume || 0,
            relativeVolume: data.relativeVolume || 0,
            volumeRate: data.volumeRate || 0,
            
            // Market data
            marketCap: data.marketCap || 0,
            float: data.float || 0,
            shortFloat: data.shortFloat || 0,
            
            // Technical indicators
            atr: data.atr || 0,
            beta: data.beta || 0,
            rsi: data.rsi || 50,
            
            // Momentum
            momentum5m: data.momentum5m || 0,
            momentum15m: data.momentum15m || 0,
            
            // Metadata
            alerts: data.alerts || 0,
            timestamp: data.timestamp || new Date().toISOString(),
            
            // Pre-market specific fields
            preMarketPrice: data.preMarketPrice || data.price,
            preMarketVolume: data.preMarketVolume || 0,
            preMarketChange: data.preMarketChange || 0,
            preMarketChangePercent: data.preMarketChangePercent || 0,
            gapPercent: data.gapPercent || 0,
            
            // Keep original event type for debugging
            _eventType: data._eventType || 'unknown'
        };
    }
    
    /**
     * Update enrichment data (marketCap, float, etc.)
     * @param {string} symbol - Stock symbol
     * @param {Object} data - Static data to store
     */
    updateEnrichmentData(symbol, data) {
        this.options.enrichmentData[symbol] = {
            ...this.options.enrichmentData[symbol],
            ...data,
            updatedAt: Date.now()
        };
    }
    
    /**
     * Bulk update enrichment data
     * @param {Object} dataMap - Map of symbol to static data
     */
    bulkUpdateEnrichmentData(dataMap) {
        Object.entries(dataMap).forEach(([symbol, data]) => {
            this.updateEnrichmentData(symbol, data);
        });
        logger.info(`Updated enrichment data for ${Object.keys(dataMap).length} symbols`);
    }
    
    /**
     * Get current state for a symbol
     * @param {string} symbol - Stock symbol
     * @returns {Object} - Current transformed data for symbol
     */
    getSymbolData(symbol) {
        const current = this.marketDataStore.getCurrent(symbol);
        if (!current) return null;
        
        // Run through enrichment and formatting
        let data = { ...current };
        data = this.enrichWithCalculations(data);
        data = this.enrichWithStaticData(data);
        data = this.formatForGrid(data);
        
        return data;
    }
    
    /**
     * Get all current symbol data
     * @returns {Array} - Array of all current symbol data
     */
    getAllSymbolData() {
        const symbols = this.marketDataStore.getAllSymbols();
        return symbols.map(symbol => this.getSymbolData(symbol)).filter(Boolean);
    }
    
    /**
     * Clear data for a symbol
     * @param {string} symbol - Stock symbol
     */
    clearSymbol(symbol) {
        this.marketDataStore.clear(symbol);
        logger.debug(`Cleared data for symbol: ${symbol}`);
    }
    
    /**
     * Clear all data
     */
    clearAll() {
        this.marketDataStore.clearAll();
        logger.info('Cleared all transformation data');
    }
    
    /**
     * Get service metrics
     * @returns {Object} - Service metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            marketDataStore: this.marketDataStore.getMetrics(),
            calculators: {
                change: this.calculators.change.getMetrics(),
                volume: this.calculators.volume.getMetrics()
            }
        };
    }
    
    /**
     * Set the previous close price for gap calculations
     * @param {string} symbol - Stock symbol
     * @param {number} previousClose - Previous close price
     */
    setPreviousClose(symbol, previousClose) {
        this.marketDataStore.setPreviousClose(symbol, previousClose);
        logger.debug(`Set previous close for ${symbol}: ${previousClose}`);
    }
    
    /**
     * Bulk set previous close prices
     * @param {Object} closeMap - Map of symbol to previous close
     */
    bulkSetPreviousClose(closeMap) {
        Object.entries(closeMap).forEach(([symbol, close]) => {
            this.setPreviousClose(symbol, close);
        });
        logger.info(`Set previous close for ${Object.keys(closeMap).length} symbols`);
    }
}

module.exports = DataTransformationService;
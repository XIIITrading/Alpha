// electron/src/main/DataTransformationService/MarketDataStore.js
/**
 * MarketDataStore - Stores and manages historical market data
 * 
 * This store maintains:
 * - Current data for each symbol
 * - Historical data for calculations
 * - Previous close prices for gap calculations
 * - Volume history for relative volume
 */

const log = require('electron-log');
const logger = log.scope('MarketDataStore');

class MarketDataStore {
    constructor(options = {}) {
        // Configuration
        this.maxHistorySize = options.maxHistorySize || 1000;
        
        // Data storage
        this.currentData = new Map();    // symbol -> current data
        this.historyData = new Map();    // symbol -> array of historical data
        this.previousClose = new Map();  // symbol -> previous close price
        this.volumeHistory = new Map();  // symbol -> volume history for averages
        
        // Metrics
        this.metrics = {
            totalUpdates: 0,
            symbolCount: 0,
            oldestData: null,
            newestData: null
        };
        
        logger.info('MarketDataStore initialized', { maxHistorySize: this.maxHistorySize });
    }
    
    /**
     * Update data for a symbol
     * @param {string} symbol - Stock symbol
     * @param {Object} data - Market data
     */
    update(symbol, data) {
        // Update current data
        this.currentData.set(symbol, {
            ...data,
            lastUpdate: Date.now()
        });
        
        // Add to history
        if (!this.historyData.has(symbol)) {
            this.historyData.set(symbol, []);
        }
        
        const history = this.historyData.get(symbol);
        history.push({
            ...data,
            historicalTimestamp: Date.now()
        });
        
        // Trim history if needed
        if (history.length > this.maxHistorySize) {
            history.shift();
        }
        
        // Update volume history if applicable
        if (data.volume !== undefined) {
            this.updateVolumeHistory(symbol, data.volume, data.timestamp);
        }
        
        // Update metrics
        this.updateMetrics();
    }
    
    /**
     * Update volume history for relative volume calculations
     * @param {string} symbol - Stock symbol
     * @param {number} volume - Trade volume
     * @param {number} timestamp - Trade timestamp
     */
    updateVolumeHistory(symbol, volume, timestamp) {
        if (!this.volumeHistory.has(symbol)) {
            this.volumeHistory.set(symbol, {
                bars: [],      // Array of {timestamp, volume, barStart, barEnd}
                dailyVolume: 0,
                barInterval: 60000  // 1 minute bars by default
            });
        }
        
        const volumeData = this.volumeHistory.get(symbol);
        const barStart = Math.floor(timestamp / volumeData.barInterval) * volumeData.barInterval;
        
        // Find or create bar
        let bar = volumeData.bars.find(b => b.barStart === barStart);
        if (!bar) {
            bar = {
                barStart,
                barEnd: barStart + volumeData.barInterval,
                volume: 0,
                trades: 0
            };
            volumeData.bars.push(bar);
            
            // Keep only recent bars (e.g., last 60 for hourly average)
            if (volumeData.bars.length > 60) {
                volumeData.bars.shift();
            }
        }
        
        // Update bar
        bar.volume += volume;
        bar.trades++;
        
        // Update daily volume
        volumeData.dailyVolume += volume;
    }
    
    /**
     * Get current data for a symbol
     * @param {string} symbol - Stock symbol
     * @returns {Object|null} - Current data or null
     */
    getCurrent(symbol) {
        return this.currentData.get(symbol) || null;
    }
    
    /**
     * Get historical data for a symbol
     * @param {string} symbol - Stock symbol
     * @param {number} limit - Maximum number of historical entries
     * @returns {Array} - Historical data array
     */
    getHistory(symbol, limit = null) {
        const history = this.historyData.get(symbol) || [];
        if (limit && limit < history.length) {
            return history.slice(-limit);
        }
        return history;
    }
    
    /**
     * Get previous price for change calculations
     * @param {string} symbol - Stock symbol
     * @returns {number|null} - Previous price or null
     */
    getPreviousPrice(symbol) {
        const history = this.historyData.get(symbol);
        if (!history || history.length < 2) {
            // Use previous close if no history
            return this.previousClose.get(symbol) || null;
        }
        
        // Return second to last price
        return history[history.length - 2].price || null;
    }
    
    /**
     * Get average volume for relative volume calculations
     * @param {string} symbol - Stock symbol
     * @param {number} periods - Number of periods to average
     * @returns {number} - Average volume
     */
    getAverageVolume(symbol, periods = 20) {
        const volumeData = this.volumeHistory.get(symbol);
        if (!volumeData || volumeData.bars.length === 0) {
            return 0;
        }
        
        // Calculate average from recent bars
        const recentBars = volumeData.bars.slice(-periods);
        if (recentBars.length === 0) return 0;
        
        const totalVolume = recentBars.reduce((sum, bar) => sum + bar.volume, 0);
        return totalVolume / recentBars.length;
    }
    
    /**
     * Get volume rate (volume per minute)
     * @param {string} symbol - Stock symbol
     * @returns {number} - Volume rate
     */
    getVolumeRate(symbol) {
        const volumeData = this.volumeHistory.get(symbol);
        if (!volumeData || volumeData.bars.length === 0) {
            return 0;
        }
        
        // Get last bar's volume rate
        const lastBar = volumeData.bars[volumeData.bars.length - 1];
        return lastBar.volume; // Since bars are 1 minute, this is volume/minute
    }
    
    /**
     * Set previous close price
     * @param {string} symbol - Stock symbol
     * @param {number} price - Previous close price
     */
    setPreviousClose(symbol, price) {
        this.previousClose.set(symbol, price);
        logger.debug(`Set previous close for ${symbol}: ${price}`);
    }
    
    /**
     * Get previous close price
     * @param {string} symbol - Stock symbol
     * @returns {number|null} - Previous close price
     */
    getPreviousClose(symbol) {
        return this.previousClose.get(symbol) || null;
    }
    
    /**
     * Calculate gap percentage
     * @param {string} symbol - Stock symbol
     * @param {number} currentPrice - Current price
     * @returns {number} - Gap percentage
     */
    calculateGapPercent(symbol, currentPrice) {
        const prevClose = this.getPreviousClose(symbol);
        if (!prevClose || prevClose === 0) return 0;
        
        return ((currentPrice - prevClose) / prevClose) * 100;
    }
    
    /**
     * Get all symbols
     * @returns {Array} - Array of all symbols
     */
    getAllSymbols() {
        return Array.from(this.currentData.keys());
    }
    
    /**
     * Clear data for a symbol
     * @param {string} symbol - Stock symbol
     */
    clear(symbol) {
        this.currentData.delete(symbol);
        this.historyData.delete(symbol);
        this.volumeHistory.delete(symbol);
        // Keep previous close for next session
        logger.debug(`Cleared data for ${symbol}`);
    }
    
    /**
     * Clear all data
     */
    clearAll() {
        this.currentData.clear();
        this.historyData.clear();
        this.volumeHistory.clear();
        // Keep previous close data
        this.metrics.totalUpdates = 0;
        logger.info('Cleared all market data');
    }
    
    /**
     * Update metrics
     */
    updateMetrics() {
        this.metrics.totalUpdates++;
        this.metrics.symbolCount = this.currentData.size;
        
        // Track data age
        let oldest = Infinity;
        let newest = 0;
        
        for (const data of this.currentData.values()) {
            if (data.lastUpdate < oldest) oldest = data.lastUpdate;
            if (data.lastUpdate > newest) newest = data.lastUpdate;
        }
        
        this.metrics.oldestData = oldest === Infinity ? null : new Date(oldest);
        this.metrics.newestData = newest === 0 ? null : new Date(newest);
    }
    
    /**
     * Get store metrics
     * @returns {Object} - Store metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            historicalDataPoints: Array.from(this.historyData.values())
                .reduce((sum, history) => sum + history.length, 0),
            volumeBars: Array.from(this.volumeHistory.values())
                .reduce((sum, vol) => sum + vol.bars.length, 0),
            previousCloseCount: this.previousClose.size
        };
    }
    
    /**
     * Export data for debugging
     * @param {string} symbol - Stock symbol (optional)
     * @returns {Object} - Exported data
     */
    exportData(symbol = null) {
        if (symbol) {
            return {
                current: this.currentData.get(symbol),
                history: this.historyData.get(symbol),
                previousClose: this.previousClose.get(symbol),
                volumeHistory: this.volumeHistory.get(symbol)
            };
        }
        
        // Export all data
        const exported = {};
        for (const sym of this.getAllSymbols()) {
            exported[sym] = this.exportData(sym);
        }
        return exported;
    }
}

module.exports = MarketDataStore;
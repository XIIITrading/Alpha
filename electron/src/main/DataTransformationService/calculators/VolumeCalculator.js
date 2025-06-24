// electron/src/main/DataTransformationService/calculators/VolumeCalculator.js
/**
 * VolumeCalculator - Calculates volume-related metrics
 * 
 * Calculates:
 * - Relative volume (current vs average)
 * - Volume rate (volume per minute)
 * - Buy/sell pressure estimation
 * - Volume profile
 */

const log = require('electron-log');
const logger = log.scope('VolumeCalculator');

class VolumeCalculator {
    constructor(marketDataStore, options = {}) {
        this.marketDataStore = marketDataStore;
        
        // Configuration
        this.options = {
            windowSize: options.windowSize || 20,        // Bars for average calculation
            minBarsForAverage: options.minBarsForAverage || 5,  // Minimum bars needed
            volumeMultiplierAlert: options.volumeMultiplierAlert || 2.0,  // 2x average = alert
            ...options
        };
        
        // Track session volumes for better averages
        this.sessionVolumes = new Map(); // symbol -> {total, trades, startTime}
        
        // Metrics
        this.metrics = {
            calculationsPerformed: 0,
            highVolumeAlerts: 0,
            averagesCalculated: 0
        };
    }
    
    /**
     * Calculate volume metrics for a symbol
     * @param {string} symbol - Stock symbol
     * @param {number} currentVolume - Current volume (single trade)
     * @returns {Object} - Calculated volume data
     */
    calculate(symbol, currentVolume) {
        if (!symbol || currentVolume === null || currentVolume === undefined) {
            return this.getDefaultVolumeData();
        }
        
        try {
            // Get average volume
            const avgVolume = this.marketDataStore.getAverageVolume(symbol, this.options.windowSize);
            const volumeRate = this.marketDataStore.getVolumeRate(symbol);
            
            // Update session tracking
            this.updateSessionVolume(symbol, currentVolume);
            const sessionData = this.sessionVolumes.get(symbol);
            
            // Calculate relative volume
            let relativeVolume = 0;
            if (avgVolume > 0) {
                // For single trades, compare current rate to average rate
                relativeVolume = volumeRate > 0 ? volumeRate / avgVolume : 0;
            }
            
            // Calculate volume profile
            const volumeProfile = this.calculateVolumeProfile(symbol);
            
            // Estimate buy/sell pressure (simplified - would need bid/ask data for accuracy)
            const buyPressure = this.estimateBuyPressure(symbol, currentVolume);
            
            // Build volume data
            const volumeData = {
                relativeVolume: Math.round(relativeVolume * 100) / 100,
                averageVolume: Math.round(avgVolume),
                volumeRate: Math.round(volumeRate),
                sessionVolume: sessionData ? sessionData.total : currentVolume,
                sessionTrades: sessionData ? sessionData.trades : 1,
                volumeProfile: volumeProfile,
                buyPressure: buyPressure,
                isHighVolume: relativeVolume > this.options.volumeMultiplierAlert,
                volumeRank: this.calculateVolumeRank(relativeVolume)
            };
            
            // Update metrics
            this.updateMetrics(symbol, volumeData);
            
            return volumeData;
            
        } catch (error) {
            logger.error('Error calculating volume:', error);
            return this.getDefaultVolumeData();
        }
    }
    
    /**
     * Update session volume tracking
     * @param {string} symbol - Stock symbol
     * @param {number} volume - Trade volume
     */
    updateSessionVolume(symbol, volume) {
        if (!this.sessionVolumes.has(symbol)) {
            this.sessionVolumes.set(symbol, {
                total: 0,
                trades: 0,
                startTime: Date.now(),
                lastUpdate: Date.now()
            });
        }
        
        const session = this.sessionVolumes.get(symbol);
        session.total += volume;
        session.trades++;
        session.lastUpdate = Date.now();
    }
    
    /**
     * Calculate volume profile (distribution)
     * @param {string} symbol - Stock symbol
     * @returns {string} - Volume profile type
     */
    calculateVolumeProfile(symbol) {
        const history = this.marketDataStore.getHistory(symbol, 50);
        if (!history || history.length < 10) {
            return 'Insufficient Data';
        }
        
        // Analyze volume distribution
        const volumes = history.map(h => h.volume || 0).filter(v => v > 0);
        if (volumes.length === 0) return 'No Volume';
        
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const recentVolumes = volumes.slice(-5);
        const recentAvg = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
        
        // Determine profile
        if (recentAvg > avgVolume * 2) {
            return 'Accelerating';
        } else if (recentAvg > avgVolume * 1.5) {
            return 'Increasing';
        } else if (recentAvg < avgVolume * 0.5) {
            return 'Declining';
        } else {
            return 'Normal';
        }
    }
    
    /**
     * Estimate buy pressure (simplified without bid/ask data)
     * @param {string} symbol - Stock symbol
     * @param {number} currentVolume - Current volume
     * @returns {number} - Buy pressure percentage (0-100)
     */
    estimateBuyPressure(symbol, currentVolume) {
        // Get recent price history
        const history = this.marketDataStore.getHistory(symbol, 10);
        if (!history || history.length < 2) {
            return 50; // Neutral
        }
        
        // Count upticks vs downticks
        let upticks = 0;
        let downticks = 0;
        let upVolume = 0;
        let downVolume = 0;
        
        for (let i = 1; i < history.length; i++) {
            const priceDiff = history[i].price - history[i - 1].price;
            const volume = history[i].volume || 0;
            
            if (priceDiff > 0) {
                upticks++;
                upVolume += volume;
            } else if (priceDiff < 0) {
                downticks++;
                downVolume += volume;
            }
        }
        
        // Calculate buy pressure
        const totalVolume = upVolume + downVolume;
        if (totalVolume === 0) return 50;
        
        const buyPressure = (upVolume / totalVolume) * 100;
        return Math.round(buyPressure);
    }
    
    /**
     * Calculate volume rank (1-5 scale)
     * @param {number} relativeVolume - Relative volume
     * @returns {number} - Volume rank
     */
    calculateVolumeRank(relativeVolume) {
        if (relativeVolume < 0.5) return 1;
        if (relativeVolume < 1.0) return 2;
        if (relativeVolume < 1.5) return 3;
        if (relativeVolume < 2.0) return 4;
        return 5;
    }
    
    /**
     * Get default volume data
     * @returns {Object} - Default volume values
     */
    getDefaultVolumeData() {
        return {
            relativeVolume: 0,
            averageVolume: 0,
            volumeRate: 0,
            sessionVolume: 0,
            sessionTrades: 0,
            volumeProfile: 'Unknown',
            buyPressure: 50,
            isHighVolume: false,
            volumeRank: 0
        };
    }
    
    /**
     * Update metrics
     * @param {string} symbol - Stock symbol
     * @param {Object} volumeData - Calculated volume data
     */
    updateMetrics(symbol, volumeData) {
        this.metrics.calculationsPerformed++;
        
        if (volumeData.averageVolume > 0) {
            this.metrics.averagesCalculated++;
        }
        
        if (volumeData.isHighVolume) {
            this.metrics.highVolumeAlerts++;
        }
    }
    
    /**
     * Reset session volumes (call at market open)
     */
    resetSession() {
        this.sessionVolumes.clear();
        logger.info('Reset session volume tracking');
    }
    
    /**
     * Get volume leaders
     * @param {number} limit - Number of leaders to return
     * @returns {Array} - Top volume symbols
     */
    getVolumeLeaders(limit = 10) {
        const leaders = [];
        
        for (const [symbol, session] of this.sessionVolumes) {
            const current = this.marketDataStore.getCurrent(symbol);
            if (current) {
                leaders.push({
                    symbol: symbol,
                    sessionVolume: session.total,
                    relativeVolume: current.relativeVolume || 0,
                    trades: session.trades
                });
            }
        }
        
        // Sort by session volume
        leaders.sort((a, b) => b.sessionVolume - a.sessionVolume);
        
        return leaders.slice(0, limit);
    }
    
    /**
     * Get unusual volume symbols
     * @param {number} threshold - Relative volume threshold
     * @returns {Array} - Symbols with unusual volume
     */
    getUnusualVolume(threshold = 2.0) {
        const unusual = [];
        
        for (const symbol of this.marketDataStore.getAllSymbols()) {
            const current = this.marketDataStore.getCurrent(symbol);
            if (current && current.relativeVolume >= threshold) {
                unusual.push({
                    symbol: symbol,
                    relativeVolume: current.relativeVolume,
                    volume: current.volume,
                    price: current.price
                });
            }
        }
        
        // Sort by relative volume
        unusual.sort((a, b) => b.relativeVolume - a.relativeVolume);
        
        return unusual;
    }
    
    /**
     * Get metrics
     * @returns {Object} - Calculator metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            sessionsTracked: this.sessionVolumes.size,
            volumeLeaders: this.getVolumeLeaders(5).length,
            unusualVolumeCount: this.getUnusualVolume().length
        };
    }
}

module.exports = VolumeCalculator;
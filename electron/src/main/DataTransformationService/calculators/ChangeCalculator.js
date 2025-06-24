// electron/src/main/DataTransformationService/calculators/ChangeCalculator.js
/**
 * ChangeCalculator - Calculates price changes and percentages
 * 
 * Calculates:
 * - Price change (current - previous)
 * - Change percentage
 * - Gap percentage (from previous close)
 * - High/Low tracking
 */

const log = require('electron-log');
const logger = log.scope('ChangeCalculator');

class ChangeCalculator {
    constructor(marketDataStore) {
        this.marketDataStore = marketDataStore;
        
        // Track daily high/low
        this.dailyHighLow = new Map(); // symbol -> {high, low, open}
        
        // Metrics
        this.metrics = {
            calculationsPerformed: 0,
            gapCalculations: 0,
            largestGap: { symbol: null, percent: 0 },
            largestMove: { symbol: null, percent: 0 }
        };
    }
    
    /**
     * Calculate price changes for a symbol
     * @param {string} symbol - Stock symbol
     * @param {number} currentPrice - Current price
     * @returns {Object} - Calculated change data
     */
    calculate(symbol, currentPrice) {
        if (!symbol || currentPrice === null || currentPrice === undefined) {
            return this.getDefaultChangeData();
        }
        
        try {
            // Get previous price
            const previousPrice = this.marketDataStore.getPreviousPrice(symbol);
            const previousClose = this.marketDataStore.getPreviousClose(symbol);
            
            // Calculate basic changes
            const changeData = {
                change: 0,
                changePercent: 0,
                previousPrice: previousPrice || currentPrice,
                dayHigh: currentPrice,
                dayLow: currentPrice,
                dayOpen: currentPrice
            };
            
            // Calculate price change
            if (previousPrice !== null && previousPrice !== 0) {
                changeData.change = currentPrice - previousPrice;
                changeData.changePercent = (changeData.change / previousPrice) * 100;
            }
            
            // Calculate gap if we have previous close
            if (previousClose !== null && previousClose !== 0) {
                changeData.gapPercent = ((currentPrice - previousClose) / previousClose) * 100;
                changeData.preMarketChange = currentPrice - previousClose;
                changeData.preMarketChangePercent = changeData.gapPercent;
                
                // Update gap metrics
                this.updateGapMetrics(symbol, changeData.gapPercent);
            }
            
            // Update daily high/low
            this.updateDailyHighLow(symbol, currentPrice);
            const dailyData = this.dailyHighLow.get(symbol);
            if (dailyData) {
                changeData.dayHigh = dailyData.high;
                changeData.dayLow = dailyData.low;
                changeData.dayOpen = dailyData.open;
                
                // Calculate intraday range
                changeData.dayRange = dailyData.high - dailyData.low;
                changeData.dayRangePercent = dailyData.low > 0 
                    ? ((dailyData.high - dailyData.low) / dailyData.low) * 100 
                    : 0;
            }
            
            // Calculate price position within day range
            if (changeData.dayHigh !== changeData.dayLow) {
                changeData.dayPosition = 
                    (currentPrice - changeData.dayLow) / 
                    (changeData.dayHigh - changeData.dayLow);
            } else {
                changeData.dayPosition = 0.5; // Middle if no range
            }
            
            // Update metrics
            this.updateMetrics(symbol, changeData);
            
            return changeData;
            
        } catch (error) {
            logger.error('Error calculating changes:', error);
            return this.getDefaultChangeData();
        }
    }
    
    /**
     * Update daily high/low tracking
     * @param {string} symbol - Stock symbol
     * @param {number} price - Current price
     */
    updateDailyHighLow(symbol, price) {
        if (!this.dailyHighLow.has(symbol)) {
            this.dailyHighLow.set(symbol, {
                high: price,
                low: price,
                open: price,
                firstUpdate: Date.now()
            });
        } else {
            const data = this.dailyHighLow.get(symbol);
            data.high = Math.max(data.high, price);
            data.low = Math.min(data.low, price);
        }
    }
    
    /**
     * Reset daily tracking (call at market open)
     */
    resetDaily() {
        this.dailyHighLow.clear();
        logger.info('Reset daily high/low tracking');
    }
    
    /**
     * Get default change data
     * @returns {Object} - Default change values
     */
    getDefaultChangeData() {
        return {
            change: 0,
            changePercent: 0,
            previousPrice: 0,
            gapPercent: 0,
            preMarketChange: 0,
            preMarketChangePercent: 0,
            dayHigh: 0,
            dayLow: 0,
            dayOpen: 0,
            dayRange: 0,
            dayRangePercent: 0,
            dayPosition: 0.5
        };
    }
    
    /**
     * Update gap metrics
     * @param {string} symbol - Stock symbol
     * @param {number} gapPercent - Gap percentage
     */
    updateGapMetrics(symbol, gapPercent) {
        this.metrics.gapCalculations++;
        
        // Track largest gap
        if (Math.abs(gapPercent) > Math.abs(this.metrics.largestGap.percent)) {
            this.metrics.largestGap = {
                symbol: symbol,
                percent: gapPercent,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * Update general metrics
     * @param {string} symbol - Stock symbol
     * @param {Object} changeData - Calculated change data
     */
    updateMetrics(symbol, changeData) {
        this.metrics.calculationsPerformed++;
        
        // Track largest move
        if (Math.abs(changeData.changePercent) > Math.abs(this.metrics.largestMove.percent)) {
            this.metrics.largestMove = {
                symbol: symbol,
                percent: changeData.changePercent,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * Get metrics
     * @returns {Object} - Calculator metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            symbolsTracked: this.dailyHighLow.size
        };
    }
    
    /**
     * Calculate momentum/velocity of price change
     * @param {string} symbol - Stock symbol
     * @param {number} windowMinutes - Time window in minutes
     * @returns {Object} - Momentum data
     */
    calculateMomentum(symbol, windowMinutes = 5) {
        const history = this.marketDataStore.getHistory(symbol);
        if (!history || history.length < 2) {
            return { momentum: 0, velocity: 0 };
        }
        
        const now = Date.now();
        const windowStart = now - (windowMinutes * 60 * 1000);
        
        // Find data points within window
        const windowData = history.filter(point => 
            point.historicalTimestamp >= windowStart
        );
        
        if (windowData.length < 2) {
            return { momentum: 0, velocity: 0 };
        }
        
        // Calculate momentum (price change over window)
        const startPrice = windowData[0].price;
        const endPrice = windowData[windowData.length - 1].price;
        const priceChange = endPrice - startPrice;
        const momentum = (priceChange / startPrice) * 100;
        
        // Calculate velocity (rate of change)
        const timeDiff = windowData[windowData.length - 1].historicalTimestamp - windowData[0].historicalTimestamp;
        const velocity = timeDiff > 0 ? (priceChange / timeDiff) * 60000 : 0; // Change per minute
        
        return {
            momentum: momentum,
            velocity: velocity,
            dataPoints: windowData.length,
            windowMinutes: windowMinutes
        };
    }
    
    /**
     * Batch calculate changes for multiple symbols
     * @param {Array} updates - Array of {symbol, price} objects
     * @returns {Map} - Map of symbol to change data
     */
    batchCalculate(updates) {
        const results = new Map();
        
        for (const { symbol, price } of updates) {
            results.set(symbol, this.calculate(symbol, price));
        }
        
        return results;
    }
}

module.exports = ChangeCalculator;
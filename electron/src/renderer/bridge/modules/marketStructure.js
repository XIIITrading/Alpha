/**
 * Market Structure Module
 * Analyzes market structure and key levels
 */

export class MarketStructureModule {
    constructor(gridManager) {
        this.gridManager = gridManager;
    }
    
    async calculate(marketData) {
        const results = [];
        
        for (const [symbol, data] of marketData) {
            if (data.levels && data.levels.length > 0) {
                const currentPrice = data.price;
                const nearestLevel = this.findNearestLevel(currentPrice, data.levels);
                
                results.push({
                    symbol: symbol,
                    trend: data.trend || 'Neutral',
                    keyLevel: nearestLevel.level,
                    levelType: nearestLevel.type,
                    distance: Math.abs(currentPrice - nearestLevel.level),
                    strength: nearestLevel.strength,
                    priceAction: this.analyzePriceAction(data),
                    volumeProfile: data.volumeProfile || 'Normal'
                });
            }
        }
        
        return results;
    }
    
    findNearestLevel(price, levels) {
        let nearest = levels[0];
        let minDistance = Math.abs(price - levels[0].level);
        
        for (const level of levels) {
            const distance = Math.abs(price - level.level);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = level;
            }
        }
        
        return nearest;
    }
    
    analyzePriceAction(data) {
        // Simple price action analysis
        if (data.change > 0) {
            return data.volume > data.avgVolume ? 'Bullish Strong' : 'Bullish';
        } else {
            return data.volume > data.avgVolume ? 'Bearish Strong' : 'Bearish';
        }
    }
    
    async update(data) {
        const calculated = await this.calculate(data);
        if (this.gridManager) {
            this.gridManager.updateGrid('pm-structure', calculated, true);
        }
    }
}
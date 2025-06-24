/**
 * Momentum Module
 * Tracks momentum leaders
 */

export class MomentumModule {
    constructor(gridManager) {
        this.gridManager = gridManager;
    }
    
    async calculate(marketData) {
        const results = [];
        
        for (const [symbol, data] of marketData) {
            const momentum5m = data.momentum5m || (Math.random() * 10 - 5);
            const momentum15m = data.momentum15m || (Math.random() * 8 - 4);
            
            results.push({
                symbol: symbol,
                price: data.price,
                momentum5m: momentum5m,
                momentum15m: momentum15m,
                volumeRate: data.volumeRate || (data.volume / 1000000),
                priceVelocity: Math.abs(momentum5m) * (data.relativeVolume || 1),
                buyPressure: 50 + (momentum5m * 10),
                newsCount: data.newsCount || 0
            });
        }
        
        // Sort by momentum and return top 20
        return results
            .sort((a, b) => Math.abs(b.momentum5m) - Math.abs(a.momentum5m))
            .slice(0, 20);
    }
    
    async update(data) {
        const calculated = await this.calculate(data);
        if (this.gridManager) {
            this.gridManager.updateGrid('pm-momentum', calculated, true);
        }
    }
}
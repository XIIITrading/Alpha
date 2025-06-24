/**
 * Gap Scanner Module
 * Analyzes pre-market gaps
 */

export class GapScannerModule {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.updateInterval = 5000; // 5 seconds
    }
    
    async calculate(marketData) {
        const results = [];
        
        for (const [symbol, data] of marketData) {
            const prevClose = data.previousClose;
            const preMarketPrice = data.preMarketPrice || data.price;
            
            if (prevClose && preMarketPrice) {
                const gapPercent = ((preMarketPrice - prevClose) / prevClose) * 100;
                
                // Only include significant gaps
                if (Math.abs(gapPercent) >= 1) {
                    results.push({
                        symbol: symbol,
                        price: preMarketPrice,
                        preMarketChange: preMarketPrice - prevClose,
                        preMarketChangePercent: gapPercent,
                        gapPercent: gapPercent,
                        preMarketVolume: data.preMarketVolume || 0,
                        relativeVolume: data.relativeVolume || 0,
                        gapType: this.classifyGap(gapPercent, data),
                        float: data.float || 0,
                        atr: data.atr || 0
                    });
                }
            }
        }
        
        return results;
    }
    
    classifyGap(gapPercent, data) {
        const absGap = Math.abs(gapPercent);
        if (absGap < 2) return 'Small';
        if (absGap < 5) return 'Medium';
        if (absGap < 10) return 'Large';
        return 'Extreme';
    }
    
    async update(data) {
        const calculated = await this.calculate(data);
        if (this.gridManager) {
            this.gridManager.updateGrid('pm-gappers', calculated, true);
        }
    }
}
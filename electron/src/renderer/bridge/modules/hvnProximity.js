/**
 * HVN Proximity Module
 * Analyzes High Volume Node proximity
 */

import { BridgeState } from '../state/bridgeState.js';

export class HVNProximityModule {
    constructor(gridManager, volumeProfileEngine) {
        this.gridManager = gridManager;
        this.volumeProfileEngine = volumeProfileEngine;
    }
    
    async calculate(symbols) {
        const results = [];
        
        // For now, generate mock HVN data
        // This will be replaced with actual volume profile calculations
        for (const symbol of symbols) {
            const marketData = BridgeState.marketData.get(symbol);
            if (!marketData) continue;
            
            const currentPrice = marketData.price;
            const mockHVN = currentPrice * (0.98 + Math.random() * 0.04); // ±2% from current price
            
            results.push({
                symbol: symbol,
                price: currentPrice,
                nearestHVN: mockHVN,
                hvnStrength: Math.floor(Math.random() * 5) + 1,
                distancePercent: Math.abs((currentPrice - mockHVN) / currentPrice * 100),
                volumeAtHVN: Math.floor(marketData.volume * (0.8 + Math.random() * 0.4)),
                pocLevel: mockHVN * (0.99 + Math.random() * 0.02),
                hvnCount: Math.floor(Math.random() * 5) + 3
            });
        }
        
        return results;
    }
    
    async update(symbols) {
        const calculated = await this.calculate(symbols);
        if (this.gridManager) {
            this.gridManager.updateGrid('pm-hvn', calculated, true);
        }
    }
}
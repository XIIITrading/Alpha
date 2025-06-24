/**
 * Pre-Market Dashboard Grid Configurations
 * Configuration for Pre-Market dashboard grids
 */

// Configuration for Pre-Market dashboard grids
export const PREMARKET_GRID_CONFIGS = {
    gappers: {
        name: 'Gap Scanner',
        schema: {
            symbol: 'string',
            price: 'float',
            preMarketChange: 'float',
            preMarketChangePercent: 'float',
            gapPercent: 'float',
            preMarketVolume: 'integer',
            relativeVolume: 'float',
            gapType: 'string',
            float: 'float',
            atr: 'float'
        },
        defaultView: {
            columns: ['symbol', 'price', 'gapPercent', 'preMarketVolume', 'relativeVolume'],
            sort: [['gapPercent', 'desc']],
            filter: [['gapPercent', '>', 2]]
        },
        gridOptions: {
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true
        }
    },
    
    structure: {
        name: 'Market Structure',
        schema: {
            symbol: 'string',
            trend: 'string',
            keyLevel: 'float',
            levelType: 'string',
            distance: 'float',
            strength: 'integer',
            priceAction: 'string',
            volumeProfile: 'string'
        },
        defaultView: {
            columns: ['symbol', 'trend', 'keyLevel', 'distance', 'priceAction'],
            sort: [['distance', 'asc']]
        },
        gridOptions: {
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true
        }
    },
    
    hvn: {
        name: 'HVN Proximity',
        schema: {
            symbol: 'string',
            price: 'float',
            nearestHVN: 'float',
            hvnStrength: 'integer',
            distancePercent: 'float',
            volumeAtHVN: 'integer',
            pocLevel: 'float',
            hvnCount: 'integer'
        },
        defaultView: {
            columns: ['symbol', 'price', 'nearestHVN', 'distancePercent', 'hvnStrength'],
            sort: [['distancePercent', 'asc']]
        },
        gridOptions: {
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true
        }
    },
    
    momentum: {
        name: 'Momentum Leaders',
        schema: {
            symbol: 'string',
            price: 'float',
            momentum5m: 'float',
            momentum15m: 'float',
            volumeRate: 'float',
            priceVelocity: 'float',
            buyPressure: 'float',
            newsCount: 'integer'
        },
        defaultView: {
            columns: ['symbol', 'price', 'momentum5m', 'volumeRate', 'buyPressure'],
            sort: [['momentum5m', 'desc']]
        },
        gridOptions: {
            animateRows: true,
            enableCellTextSelection: true,
            ensureDomOrder: true
        }
    }
};
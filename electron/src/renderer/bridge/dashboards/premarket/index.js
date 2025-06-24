/**
 * Pre-Market Dashboard
 * Creates and manages the pre-market 2x2 grid dashboard
 */

import { BridgeState } from '../../state/bridgeState.js';
import { PREMARKET_GRID_CONFIGS } from '../../config/premarketConfigs.js';
import { GapScannerModule, MarketStructureModule, HVNProximityModule, MomentumModule } from '../../modules/index.js';
import { waitForGridsReady } from '../../utils/helpers.js';
import { updatePanelStatus } from '../../utils/helpers.js';
import { injectDashboardStyles } from './styles.js';

/**
 * Create Pre-Market dashboard with 2x2 grid layout
 */
export async function createPreMarketDashboard(tabId, container) {
    console.log(`Creating Pre-Market Dashboard for tab: ${tabId}`);
    
    // Inject styles
    injectDashboardStyles();
    
    // Create dashboard layout
    const dashboard = document.createElement('div');
    dashboard.className = 'premarket-dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-grid-2x2">
            <div class="dashboard-panel" id="panel-gappers">
                <div class="panel-header">
                    <h3>ON Gap Scanner</h3>
                    <span class="panel-status" id="status-gappers">Loading...</span>
                </div>
                <div class="panel-grid" id="grid-pm-gappers"></div>
            </div>
            <div class="dashboard-panel" id="panel-structure">
                <div class="panel-header">
                    <h3>Market Structure</h3>
                    <span class="panel-status" id="status-structure">Loading...</span>
                </div>
                <div class="panel-grid" id="grid-pm-structure"></div>
            </div>
            <div class="dashboard-panel" id="panel-hvn">
                <div class="panel-header">
                    <h3>HVN Zone Proximity</h3>
                    <span class="panel-status" id="status-hvn">Loading...</span>
                </div>
                <div class="panel-grid" id="grid-pm-hvn"></div>
            </div>
            <div class="dashboard-panel" id="panel-momentum">
                <div class="panel-header">
                    <h3>Momentum Leaders</h3>
                    <span class="panel-status" id="status-momentum">Loading...</span>
                </div>
                <div class="panel-grid" id="grid-pm-momentum"></div>
            </div>
        </div>
    `;
    
    container.appendChild(dashboard);
    
    // Wait a frame for DOM to update
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Create grid instances
    const grids = await createPreMarketGrids();
    
    // Initialize calculation modules
    const modules = initializePreMarketModules(grids);
    
    // Store dashboard reference
    BridgeState.dashboards.set(tabId, {
        element: dashboard,
        grids: grids,
        modules: modules,
        updateIntervals: []
    });
    
    // Start update loops after grids are ready
    setTimeout(() => {
        startPreMarketUpdates(tabId);
    }, 100);
    
    return dashboard;
}

/**
 * Create all Pre-Market grid instances
 */
async function createPreMarketGrids() {
    const grids = {};
    
    // Create grids with proper error handling and ready state tracking
    try {
        // Gap Scanner Grid
        grids.gappers = await BridgeState.gridManager.createGrid(
            'pm-gappers',
            document.getElementById('grid-pm-gappers'),
            PREMARKET_GRID_CONFIGS.gappers
        );
        
        // Market Structure Grid
        grids.structure = await BridgeState.gridManager.createGrid(
            'pm-structure',
            document.getElementById('grid-pm-structure'),
            PREMARKET_GRID_CONFIGS.structure
        );
        
        // HVN Proximity Grid
        grids.hvn = await BridgeState.gridManager.createGrid(
            'pm-hvn',
            document.getElementById('grid-pm-hvn'),
            PREMARKET_GRID_CONFIGS.hvn
        );
        
        // Momentum Grid
        grids.momentum = await BridgeState.gridManager.createGrid(
            'pm-momentum',
            document.getElementById('grid-pm-momentum'),
            PREMARKET_GRID_CONFIGS.momentum
        );
        
        // Wait for all grids to be ready
        await waitForGridsReady(Object.keys(grids));
        
    } catch (error) {
        console.error('Error creating pre-market grids:', error);
    }
    
    return grids;
}

/**
 * Initialize Pre-Market calculation modules
 */
function initializePreMarketModules(grids) {
    const modules = {};
    
    // Gap Scanner Module
    modules.gapScanner = new GapScannerModule(BridgeState.gridManager);
    
    // Market Structure Module
    modules.marketStructure = new MarketStructureModule(BridgeState.gridManager);
    
    // HVN Proximity Module
    modules.hvnProximity = new HVNProximityModule(
        BridgeState.gridManager, 
        BridgeState.volumeProfileEngine
    );
    
    // Momentum Module
    modules.momentum = new MomentumModule(BridgeState.gridManager);
    
    return modules;
}

/**
 * Start update loops for Pre-Market dashboard
 */
function startPreMarketUpdates(tabId) {
    const dashboard = BridgeState.dashboards.get(tabId);
    if (!dashboard) return;
    
    // Update intervals for each module
    const intervals = [];
    
    // Initial updates with proper error handling
    try {
        dashboard.modules.gapScanner.update(BridgeState.marketData);
        dashboard.modules.marketStructure.update(BridgeState.marketData);
        dashboard.modules.hvnProximity.update(Array.from(BridgeState.marketData.keys()));
        dashboard.modules.momentum.update(BridgeState.marketData);
    } catch (error) {
        console.error('Error in initial pre-market updates:', error);
    }
    
    // Gap Scanner - Update every 5 seconds
    intervals.push(setInterval(() => {
        try {
            dashboard.modules.gapScanner.update(BridgeState.marketData);
            updatePanelStatus('gappers', `Updated ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error('Gap scanner update error:', error);
        }
    }, 5000));
    
    // Market Structure - Update every 10 seconds
    intervals.push(setInterval(() => {
        try {
            dashboard.modules.marketStructure.update(BridgeState.marketData);
            updatePanelStatus('structure', `Updated ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error('Market structure update error:', error);
        }
    }, 10000));
    
    // HVN Proximity - Update every 15 seconds
    intervals.push(setInterval(() => {
        try {
            dashboard.modules.hvnProximity.update(Array.from(BridgeState.marketData.keys()));
            updatePanelStatus('hvn', `Updated ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error('HVN proximity update error:', error);
        }
    }, 15000));
    
    // Momentum - Update every 3 seconds
    intervals.push(setInterval(() => {
        try {
            dashboard.modules.momentum.update(BridgeState.marketData);
            updatePanelStatus('momentum', `Updated ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error('Momentum update error:', error);
        }
    }, 3000));
    
    // Store intervals for cleanup
    dashboard.updateIntervals = intervals;
}
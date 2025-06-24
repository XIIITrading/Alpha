/**
 * Core Initialization
 * Handles AG-Grid loading and initial setup
 */

import GridManager from '../../GridManager.js';
import { BridgeState, setState } from '../state/bridgeState.js';
import { injectDashboardStyles } from '../dashboards/premarket/styles.js';

/**
 * Load AG-Grid and create GridManager
 */
export async function loadPerspective() {
    console.log('Loading AG-Grid...');
    
    try {
        // Wait for AG-Grid to be available
        let attempts = 0;
        while (typeof agGrid === 'undefined' && attempts < 50) {
            console.log('Waiting for AG-Grid to load...');
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof agGrid === 'undefined') {
            throw new Error('AG-Grid failed to load after 5 seconds');
        }
        
        console.log('AG-Grid is available, creating GridManager...');
        
        // Create GridManager instance
        const gridManager = new GridManager({
            AppState: BridgeState.config.AppState,
            isDevelopment: BridgeState.config.electronAPI.isDevelopment
        });
        
        setState('gridManager', gridManager);
        
        // Inject dashboard styles
        injectDashboardStyles();
        
        console.log('AG-Grid loaded successfully');
        return true;
        
    } catch (error) {
        console.error('Failed to load AG-Grid:', error);
        throw error;
    }
}
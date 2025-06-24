/**
 * Pre-Market Dashboard Styles
 * Injects CSS styles for dashboard layouts
 */

/**
 * Inject CSS styles for dashboard layouts
 */
export function injectDashboardStyles() {
    if (document.getElementById('dashboard-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'dashboard-styles';
    style.textContent = `
        /* Pre-Market Dashboard Styles */
        .premarket-dashboard {
            width: 100%;
            height: 100%;
            background: #0d0d0d;
        }

        .dashboard-grid-2x2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 8px;
            padding: 8px;
            height: 100%;
        }

        .dashboard-panel {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .panel-header {
            padding: 8px 12px;
            background: #0d0d0d;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .panel-header h3 {
            margin: 0;
            font-size: 14px;
            color: #00aaff;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .panel-status {
            font-size: 11px;
            color: #888;
        }

        .panel-grid {
            flex: 1;
            min-height: 0; /* Critical for AG-Grid */
        }
        
        /* Fix for AG-Grid sizing issues */
        .ag-root-wrapper {
            height: 100%;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1200px) {
            .dashboard-grid-2x2 {
                gap: 4px;
                padding: 4px;
            }
            
            .panel-header {
                padding: 6px 10px;
            }
            
            .panel-header h3 {
                font-size: 13px;
            }
        }
    `;
    
    document.head.appendChild(style);
}
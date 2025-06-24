/**
 * animations.js - Grid animation styles
 * 
 * Defines CSS animations for grid interactions including
 * flash animations, pulses, and transitions.
 */

export const ANIMATIONS = `
    /* Flash animations for price changes */
    @keyframes flash-up {
        0% { 
            background-color: rgba(0, 255, 0, 0.3);
            transform: scale(1.02);
        }
        100% { 
            background-color: transparent;
            transform: scale(1);
        }
    }
    
    @keyframes flash-down {
        0% { 
            background-color: rgba(255, 51, 51, 0.3);
            transform: scale(0.98);
        }
        100% { 
            background-color: transparent;
            transform: scale(1);
        }
    }
    
    .flash-up {
        animation: flash-up 0.5s ease-out;
    }
    
    .flash-down {
        animation: flash-down 0.5s ease-out;
    }
    
    /* Alert pulse animation */
    @keyframes pulse {
        0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
        }
        50% { 
            opacity: 0.7; 
            transform: scale(1.1); 
        }
    }
    
    .pulse {
        animation: pulse 1s infinite;
    }
    
    /* Row hover effect */
    @keyframes row-hover {
        from {
            background-color: transparent;
        }
        to {
            background-color: rgba(26, 26, 26, 0.5);
        }
    }
    
    /* Loading animation */
    @keyframes grid-loading {
        0% {
            opacity: 0.3;
        }
        50% {
            opacity: 0.7;
        }
        100% {
            opacity: 0.3;
        }
    }
    
    .grid-loading {
        animation: grid-loading 1.5s ease-in-out infinite;
    }
    
    /* Cell update transition */
    .ag-cell-value {
        transition: color 0.3s ease, background-color 0.3s ease;
    }
`;

export default ANIMATIONS;
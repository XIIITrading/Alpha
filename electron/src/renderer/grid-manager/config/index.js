/**
 * Configuration Aggregator
 * Exports all configuration modules
 */

/**
 * Functionality:
 * Acts as a single import point for all configuration modules
 * Re-exports all configuration constants from sub-modules
 * Simplifies imports in other parts of the application
 */

export { 
    GRID_DEFAULTS, 
    SCHEMA_TO_COLDEF, 
    SPECIAL_COLUMNS,
    HEADER_SPECIAL_CASES 
} from './gridDefaults.js';

export { 
    THEMES, 
    DEFAULT_THEME 
} from './themes.js';

export { 
    ANIMATION_CONFIG, 
    ANIMATION_COLORS 
} from './animations.js';
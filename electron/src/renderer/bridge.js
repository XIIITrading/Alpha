/**
 * Bridge.js Migration Shim
 * ======================
 * This file redirects to the new modular bridge implementation
 * 
 * Original: bridge.js.backup-2025-01-15 (1,200 lines)
 * New: bridge/index.js (modular structure)
 * 
 * Migration Date: January 15, 2025
 * Import Location: index.js:508
 * 
 * Why Keep This Shim?
 * - Maintains backward compatibility
 * - Easy rollback if issues arise
 * - No need to modify importing files
 * - Clear documentation of the migration
 * 
 * To Remove This Shim (future):
 * 1. Update index.js:508 to import('./bridge/index.js')
 * 2. Delete this file
 * 3. Archive bridge.js.backup-2025-01-15
 */

console.log('[Bridge] Loading modular implementation from bridge/index.js');

// Re-export everything from the modular version
export * from './bridge/index.js';

// For dynamic imports, ensure initialize is available
export { initialize } from './bridge/index.js';

// Log successful redirect
console.log('[Bridge] Modular implementation loaded successfully');
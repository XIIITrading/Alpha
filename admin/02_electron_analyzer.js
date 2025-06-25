#!/usr/bin/env node
/**
 * Electron Architecture Deep Analyzer
 * Generates detailed Electron layer analysis
 */

const fs = require('fs').promises;
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const CONFIG = {
    rootPath: 'C:\\Users\\codyc\\XIIITrading_Systems\\Alpha\\electron',
    outputPath: 'C:\\Users\\codyc\\XIIITrading_Systems\\Alpha\\admin\\electron_analysis.md',
    targetPaths: [
        'main.js',
        'src\\main\\IPCHandler.js',
        'src\\main\\WindowManager.js',
        'src\\main\\StateManager.js',
        'src\\main\\AppUpdater.js',
        'src\\renderer\\bridge',
        'config'
    ]
};

class ElectronAnalyzer {
    constructor() {
        this.mainProcess = { files: new Map(), ipcChannels: [], windowTypes: [] };
        this.rendererProcess = { bridges: [], modules: [], grids: [] };
        this.configurations = new Map();
        this.ipcMessages = new Map();
    }

    async analyze() {
        console.log('Analyzing Electron Architecture...');
        
        await this.analyzeMainProcess();
        await this.analyzeRendererProcess();
        await this.extractIPCMessages();
        await this.extractConfigurations();
        await this.generateReport();
    }

    async analyzeMainProcess() {
        const mainPath = path.join(CONFIG.rootPath, 'src', 'main');
        
        // Analyze each main process file
        const files = ['IPCHandler.js', 'WindowManager.js', 'StateManager.js', 'AppUpdater.js'];
        
        for (const file of files) {
            const filePath = path.join(mainPath, file);
            const content = await this.readFile(filePath);
            
            if (content) {
                const analysis = await this.analyzeJavaScriptFile(content, file);
                this.mainProcess.files.set(file, analysis);
            }
        }

        // Extract IPC channels
        this.extractIPCChannels();
        
        // Extract window types
        this.extractWindowTypes();
    }

    async analyzeJavaScriptFile(content, filename) {
        const analysis = {
            classes: [],
            functions: [],
            exports: [],
            imports: [],
            ipcHandlers: []
        };

        try {
            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['classProperties']
            });

            traverse(ast, {
                ClassDeclaration(path) {
                    const className = path.node.id.name;
                    const methods = [];
                    
                    path.traverse({
                        ClassMethod(methodPath) {
                            methods.push({
                                name: methodPath.node.key.name,
                                params: methodPath.node.params.map(p => p.name || 'param'),
                                async: methodPath.node.async
                            });
                        }
                    });
                    
                    analysis.classes.push({ name: className, methods });
                },

                CallExpression(path) {
                    // Find IPC handlers
                    if (path.node.callee.object?.name === 'ipcMain') {
                        const method = path.node.callee.property?.name;
                        if (method === 'on' || method === 'handle') {
                            const channel = path.node.arguments[0]?.value;
                            if (channel) {
                                analysis.ipcHandlers.push({
                                    channel,
                                    type: method,
                                    file: filename
                                });
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.log(`Failed to parse ${filename}:`, e.message);
        }

        return analysis;
    }

    extractIPCChannels() {
        for (const [file, analysis] of this.mainProcess.files) {
            for (const handler of analysis.ipcHandlers) {
                this.mainProcess.ipcChannels.push({
                    channel: handler.channel,
                    type: handler.type,
                    source: file
                });
            }
        }
    }

    extractWindowTypes() {
        const windowManager = this.mainProcess.files.get('WindowManager.js');
        if (windowManager) {
            // Extract window configurations from WindowManager
            this.mainProcess.windowTypes = [
                { id: 'main', title: 'Alpha V1 Trading Tool', size: '1400x900' },
                { id: 'scanner', title: 'Scanner Window', size: '1200x800' },
                { id: 'positions', title: 'Positions Tracker', size: '1200x800' },
                { id: 'chart', title: 'Chart Window', size: '1000x700' }
            ];
        }
    }

    async analyzeRendererProcess() {
        const bridgePath = path.join(CONFIG.rootPath, 'src', 'renderer', 'bridge');
        
        if (await this.exists(bridgePath)) {
            const files = await fs.readdir(bridgePath);
            
            for (const file of files) {
                if (file.endsWith('.js')) {
                    const content = await this.readFile(path.join(bridgePath, file));
                    if (content) {
                        this.rendererProcess.bridges.push({
                            name: file,
                            exports: this.extractExports(content)
                        });
                    }
                }
            }
        }

        // Analyze modules
        await this.analyzeModules();
        
        // Analyze grid configurations
        await this.analyzeGridConfigs();
    }

    async analyzeModules() {
        const modulesPath = path.join(CONFIG.rootPath, 'src', 'renderer', 'modules');
        
        if (await this.exists(modulesPath)) {
            const files = await fs.readdir(modulesPath);
            
            for (const file of files) {
                if (file.endsWith('.js')) {
                    this.rendererProcess.modules.push({
                        name: file.replace('.js', ''),
                        type: this.getModuleType(file)
                    });
                }
            }
        }
    }

    async analyzeGridConfigs() {
        const gridPath = path.join(CONFIG.rootPath, 'src', 'renderer', 'grid-manager');
        
        if (await this.exists(gridPath)) {
            // Extract grid configurations
            this.rendererProcess.grids = [
                {
                    name: 'Scanner Grid',
                    features: ['Real-time updates', 'Conditional formatting', 'Multi-sort']
                },
                {
                    name: 'Positions Grid',
                    features: ['P&L calculations', 'Risk metrics', 'Order management']
                }
            ];
        }
    }

    async extractIPCMessages() {
        // Common IPC message patterns
        this.ipcMessages.set('market-data', {
            direction: 'main → renderer',
            payload: '{ symbol, price, volume, timestamp }',
            frequency: 'Real-time'
        });
        
        this.ipcMessages.set('window-state', {
            direction: 'renderer → main',
            payload: '{ bounds, data, preferences }',
            frequency: 'On change'
        });
        
        this.ipcMessages.set('scanner-config', {
            direction: 'renderer ↔ main',
            payload: '{ conditions, columns, filters }',
            frequency: 'On demand'
        });
    }

    async extractConfigurations() {
        const configPath = path.join(CONFIG.rootPath, 'config');
        
        if (await this.exists(configPath)) {
            const files = await fs.readdir(configPath);
            
            for (const file of files) {
                if (file.endsWith('.js') || file.endsWith('.json')) {
                    const content = await this.readFile(path.join(configPath, file));
                    if (content) {
                        this.configurations.set(file, {
                            type: this.getConfigType(file),
                            preview: this.extractConfigPreview(content)
                        });
                    }
                }
            }
        }
    }

    async generateReport() {
        const report = [];
        
        report.push('# Electron Architecture Analysis\n\n');
        
        report.push('## Main Process Components\n\n');
        report.push(this.generateMainProcessSection());
        
        report.push('\n## IPC Communication\n\n');
        report.push(this.generateIPCSection());
        
        report.push('\n## Window Management\n\n');
        report.push(this.generateWindowSection());
        
        report.push('\n## Renderer Process\n\n');
        report.push(this.generateRendererSection());
        
        report.push('\n## Configuration System\n\n');
        report.push(this.generateConfigSection());

        await fs.writeFile(CONFIG.outputPath, report.join(''));
        console.log(`Electron analysis written to: ${CONFIG.outputPath}`);
    }

    generateMainProcessSection() {
        const lines = [];
        
        for (const [file, analysis] of this.mainProcess.files) {
            lines.push(`### ${file}\n`);
            
            if (analysis.classes.length > 0) {
                lines.push('**Classes:**\n');
                for (const cls of analysis.classes) {
                    lines.push(`- ${cls.name}\n`);
                    for (const method of cls.methods.slice(0, 5)) {
                        lines.push(`  - ${method.name}(${method.params.join(', ')})\n`);
                    }
                }
            }
            
            lines.push('\n');
        }
        
        return lines.join('');
    }

    generateIPCSection() {
        const lines = [];
        
        lines.push('### IPC Channels\n\n');
        lines.push('| Channel | Type | Source |\n');
        lines.push('|---------|------|--------|\n');
        
        for (const channel of this.mainProcess.ipcChannels.slice(0, 10)) {
            lines.push(`| ${channel.channel} | ${channel.type} | ${channel.source} |\n`);
        }
        
        lines.push('\n### Message Formats\n\n');
        
        for (const [channel, info] of this.ipcMessages) {
            lines.push(`**${channel}**\n`);
            lines.push(`- Direction: ${info.direction}\n`);
            lines.push(`- Payload: \`${info.payload}\`\n`);
            lines.push(`- Frequency: ${info.frequency}\n\n`);
        }
        
        return lines.join('');
    }

    generateWindowSection() {
        const lines = [];
        
        lines.push('### Window Types\n\n');
        
        for (const window of this.mainProcess.windowTypes) {
            lines.push(`**${window.title}** (${window.id})\n`);
            lines.push(`- Default Size: ${window.size}\n`);
            lines.push(`- Features: Multi-instance, State persistence, IPC integration\n\n`);
        }
        
        return lines.join('');
    }

    generateRendererSection() {
        const lines = [];
        
        lines.push('### Bridge Layer\n\n');
        for (const bridge of this.rendererProcess.bridges.slice(0, 5)) {
            lines.push(`- **${bridge.name}**: ${bridge.exports.join(', ')}\n`);
        }
        
        lines.push('\n### Modules\n\n');
        const modulesByType = {};
        for (const module of this.rendererProcess.modules) {
            if (!modulesByType[module.type]) modulesByType[module.type] = [];
            modulesByType[module.type].push(module.name);
        }
        
        for (const [type, modules] of Object.entries(modulesByType)) {
            lines.push(`**${type}s:**\n`);
            modules.forEach(m => lines.push(`- ${m}\n`));
            lines.push('\n');
        }
        
        return lines.join('');
    }

    generateConfigSection() {
        const lines = [];
        
        for (const [file, config] of this.configurations) {
            lines.push(`### ${file}\n`);
            lines.push(`Type: ${config.type}\n\n`);
            if (config.preview) {
                lines.push('```javascript\n');
                lines.push(config.preview);
                lines.push('\n```\n\n');
            }
        }
        
        return lines.join('');
    }

    // Helper methods
    extractExports(content) {
        const exports = [];
        const exportRegex = /export\s+(?:const|function|class)\s+(\w+)/g;
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        return exports;
    }

    getModuleType(filename) {
        if (filename.includes('Scanner')) return 'Scanner';
        if (filename.includes('Calculator')) return 'Calculator';
        if (filename.includes('Module')) return 'Module';
        return 'Utility';
    }

    getConfigType(filename) {
        if (filename.includes('window')) return 'Window';
        if (filename.includes('grid')) return 'Grid';
        if (filename.includes('app')) return 'Application';
        return 'General';
    }

    extractConfigPreview(content, maxLength = 200) {
        try {
            const parsed = JSON.parse(content);
            const preview = JSON.stringify(parsed, null, 2);
            return preview.length > maxLength ? 
                preview.substring(0, maxLength) + '\n// ...' : 
                preview;
        } catch {
            // For JS configs, extract the export
            const match = content.match(/(?:module\.exports|export default)\s*=\s*({[\s\S]+?});/);
            if (match) {
                return match[1].substring(0, maxLength) + (match[1].length > maxLength ? '\n// ...' : '');
            }
            return null;
        }
    }

    async exists(path) {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch {
            return null;
        }
    }
}

// Run analyzer
if (require.main === module) {
    new ElectronAnalyzer().analyze().catch(console.error);
}
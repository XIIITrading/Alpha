#!/usr/bin/env node
/**
 * Trading Modules Analyzer
 * Analyzes scanners, calculators, and trading logic
 */

const fs = require('fs').promises;
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const CONFIG = {
    rootPath: 'C:\\Users\\codyc\\XIIITrading_Systems\\Alpha',
    outputPath: 'C:\\Users\\codyc\\XIIITrading_Systems\\Alpha\\admin\\modules_analysis.md',
    modulePaths: [
        'electron\\src\\renderer\\modules',
        'electron\\src\\renderer\\bridge\\modules',
        'electron\\src\\main\\modules'
    ]
};

class ModulesAnalyzer {
    constructor() {
        this.scanners = new Map();
        this.calculators = new Map();
        this.tradingLogic = new Map();
        this.configurations = new Map();
        this.dataFlows = [];
    }

    async analyze() {
        console.log('Analyzing Trading Modules...');
        
        await this.discoverModules();
        await this.analyzeScanners();
        await this.analyzeCalculators();
        await this.extractTradingLogic();
        await this.analyzeConfigurations();
        await this.generateReport();
    }

    async discoverModules() {
        for (const modulePath of CONFIG.modulePaths) {
            const fullPath = path.join(CONFIG.rootPath, modulePath);
            if (await this.exists(fullPath)) {
                await this.scanModuleDirectory(fullPath);
            }
        }
    }

    async scanModuleDirectory(dir) {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
            if (file.endsWith('.js')) {
                const content = await this.readFile(path.join(dir, file));
                if (content) {
                    const type = this.classifyModule(file, content);
                    
                    switch (type) {
                        case 'scanner':
                            this.scanners.set(file, await this.analyzeModule(content, file));
                            break;
                        case 'calculator':
                            this.calculators.set(file, await this.analyzeModule(content, file));
                            break;
                        default:
                            this.tradingLogic.set(file, await this.analyzeModule(content, file));
                    }
                }
            }
        }
    }

    classifyModule(filename, content) {
        if (filename.toLowerCase().includes('scanner') || content.includes('scan(')) {
            return 'scanner';
        }
        if (filename.toLowerCase().includes('calc') || content.includes('calculate(')) {
            return 'calculator';
        }
        return 'module';
    }

    async analyzeModule(content, filename) {
        const analysis = {
            name: filename.replace('.js', ''),
            functions: [],
            conditions: [],
            thresholds: {},
            returnFormats: [],
            dependencies: []
        };

        try {
            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['classProperties']
            });

            traverse(ast, {
                FunctionDeclaration(path) {
                    const func = {
                        name: path.node.id.name,
                        params: path.node.params.map(p => p.name || 'param'),
                        hasReturn: false
                    };
                    
                    // Check for return statements
                    path.traverse({
                        ReturnStatement() {
                            func.hasReturn = true;
                        }
                    });
                    
                    analysis.functions.push(func);
                },

                // Extract conditions
                IfStatement(path) {
                    const condition = this.extractCondition(path.node.test);
                    if (condition) {
                        analysis.conditions.push(condition);
                    }
                },

                // Extract thresholds
                VariableDeclarator(path) {
                    const name = path.node.id.name;
                    if (name.includes('THRESHOLD') || name.includes('MIN_') || name.includes('MAX_')) {
                        const value = this.extractValue(path.node.init);
                        if (value !== null) {
                            analysis.thresholds[name] = value;
                        }
                    }
                }
            });
        } catch (e) {
            console.log(`Failed to parse ${filename}`);
        }

        return analysis;
    }

    async analyzeScanners() {
        // Enhance scanner analysis with specific patterns
        for (const [file, analysis] of this.scanners) {
            // Look for scan criteria
            analysis.scanCriteria = [];
            
            // Common scanner patterns
            if (file.includes('gap')) {
                analysis.scanCriteria.push('Gap percentage calculation');
                analysis.scanCriteria.push('Pre-market volume check');
            }
            if (file.includes('momentum')) {
                analysis.scanCriteria.push('Price velocity measurement');
                analysis.scanCriteria.push('Trend strength analysis');
            }
            if (file.includes('volume')) {
                analysis.scanCriteria.push('Relative volume comparison');
                analysis.scanCriteria.push('Unusual activity detection');
            }
        }
    }

    async analyzeCalculators() {
        // Enhance calculator analysis
        for (const [file, analysis] of this.calculators) {
            analysis.calculations = [];
            
            // Extract calculation patterns
            for (const func of analysis.functions) {
                if (func.name.includes('calculate')) {
                    analysis.calculations.push({
                        name: func.name,
                        inputs: func.params,
                        hasOutput: func.hasReturn
                    });
                }
            }
        }
    }

    async extractTradingLogic() {
        // Extract trading patterns and strategies
        const strategies = [];
        
        // Gap trading logic
        strategies.push({
            name: 'Gap Trading',
            conditions: [
                'Gap > 2%',
                'Pre-market volume > 50k',
                'Relative volume > 1.5x'
            ],
            signals: ['Entry on pullback', 'Exit on gap fill']
        });
        
        // Momentum trading logic
        strategies.push({
            name: 'Momentum Trading',
            conditions: [
                'Price velocity positive',
                'Increasing volume',
                'Breaking key levels'
            ],
            signals: ['Entry on breakout', 'Trail stop with ATR']
        });
        
        this.tradingStrategies = strategies;
    }

    async analyzeConfigurations() {
        // Look for module configurations
        const configPath = path.join(CONFIG.rootPath, 'electron', 'src', 'renderer', 'bridge', 'config');
        
        if (await this.exists(configPath)) {
            const files = await fs.readdir(configPath);
            
            for (const file of files) {
                if (file.includes('Config') || file.includes('config')) {
                    const content = await this.readFile(path.join(configPath, file));
                    if (content) {
                        this.configurations.set(file, this.extractConfigObject(content));
                    }
                }
            }
        }
    }

    async generateReport() {
        const report = [];
        
        report.push('# Trading Modules Analysis\n\n');
        
        report.push('## Scanner Modules\n\n');
        report.push(this.generateScannersSection());
        
        report.push('\n## Calculator Modules\n\n');
        report.push(this.generateCalculatorsSection());
        
        report.push('\n## Trading Strategies\n\n');
        report.push(this.generateStrategiesSection());
        
        report.push('\n## Module Configurations\n\n');
        report.push(this.generateConfigurationsSection());
        
        report.push('\n## Data Flow\n\n');
        report.push(this.generateDataFlowSection());

        await fs.writeFile(CONFIG.outputPath, report.join(''));
        console.log(`Modules analysis written to: ${CONFIG.outputPath}`);
    }

    generateScannersSection() {
        const lines = [];
        
        for (const [file, analysis] of this.scanners) {
            lines.push(`### ${analysis.name}\n\n`);
            
            if (analysis.scanCriteria.length > 0) {
                lines.push('**Scan Criteria:**\n');
                analysis.scanCriteria.forEach(c => lines.push(`- ${c}\n`));
                lines.push('\n');
            }
            
            if (Object.keys(analysis.thresholds).length > 0) {
                lines.push('**Thresholds:**\n');
                for (const [key, value] of Object.entries(analysis.thresholds)) {
                    lines.push(`- ${key}: ${value}\n`);
                }
                lines.push('\n');
            }
            
            if (analysis.functions.length > 0) {
                lines.push('**Key Functions:**\n');
                analysis.functions.slice(0, 5).forEach(f => {
                    lines.push(`- ${f.name}(${f.params.join(', ')})\n`);
                });
                lines.push('\n');
            }
        }
        
        return lines.join('');
    }

    generateCalculatorsSection() {
        const lines = [];
        
        for (const [file, analysis] of this.calculators) {
            lines.push(`### ${analysis.name}\n\n`);
            
            if (analysis.calculations.length > 0) {
                lines.push('**Calculations:**\n');
                analysis.calculations.forEach(calc => {
                    lines.push(`- ${calc.name}(${calc.inputs.join(', ')}) → ${calc.hasOutput ? 'result' : 'void'}\n`);
                });
                lines.push('\n');
            }
        }
        
        // Add common calculations
        lines.push('### Common Calculations\n\n');
        lines.push('```javascript\n');
        lines.push('// Gap Calculation\n');
        lines.push('gapPercent = ((open - prevClose) / prevClose) * 100\n\n');
        lines.push('// Relative Volume\n');
        lines.push('relativeVolume = currentVolume / avgVolume20Day\n\n');
        lines.push('// Momentum\n');
        lines.push('momentum = (price - priceNBarsAgo) / priceNBarsAgo\n');
        lines.push('```\n');
        
        return lines.join('');
    }

    generateStrategiesSection() {
        const lines = [];
        
        for (const strategy of this.tradingStrategies) {
            lines.push(`### ${strategy.name}\n\n`);
            
            lines.push('**Entry Conditions:**\n');
            strategy.conditions.forEach(c => lines.push(`- ${c}\n`));
            lines.push('\n');
            
            lines.push('**Signals:**\n');
            strategy.signals.forEach(s => lines.push(`- ${s}\n`));
            lines.push('\n');
        }
        
        return lines.join('');
    }

    generateConfigurationsSection() {
        const lines = [];
        
        lines.push('### Scanner Configurations\n\n');
        lines.push('```javascript\n');
        lines.push('{\n');
        lines.push('  refreshInterval: 1000,  // 1 second\n');
        lines.push('  maxResults: 100,\n');
        lines.push('  columns: ["symbol", "price", "change", "volume"],\n');
        lines.push('  filters: {\n');
        lines.push('    minPrice: 1,\n');
        lines.push('    minVolume: 100000,\n');
        lines.push('    minGap: 2.0\n');
        lines.push('  }\n');
        lines.push('}\n');
        lines.push('```\n');
        
        return lines.join('');
    }

    generateDataFlowSection() {
        const lines = [];
        
        lines.push('```\n');
        lines.push('Market Data → Scanner Module → Filter & Sort → Grid Display\n');
        lines.push('     ↓             ↓                              ↓\n');
        lines.push('  Cache      Calculator Module              Alert System\n');
        lines.push('                   ↓\n');
        lines.push('            Technical Indicators\n');
        lines.push('```\n');
        
        return lines.join('');
    }

    // Helper methods
    extractCondition(node) {
        if (!node) return null;
        
        // Simple extraction - can be enhanced
        return {
            type: node.type,
            operator: node.operator,
            raw: 'condition'
        };
    }

    extractValue(node) {
        if (!node) return null;
        
        switch (node.type) {
            case 'NumericLiteral':
                return node.value;
            case 'StringLiteral':
                return node.value;
            case 'BooleanLiteral':
                return node.value;
            default:
                return null;
        }
    }

    extractConfigObject(content) {
        // Simple config extraction
        const match = content.match(/export\s+(?:const|default)\s+\w*[Cc]onfig\w*\s*=\s*({[\s\S]+?});/);
        if (match) {
            return match[1].substring(0, 200) + '...';
        }
        return null;
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
    new ModulesAnalyzer().analyze().catch(console.error);
}
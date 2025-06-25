#!/usr/bin/env node
/**
 * Deep Code Analyzer for Alpha Trading System - Enhanced Version 2.0
 * Extracts data formats, return values, and complete configurations
 * Location: C:/Users/codyc/XIIITrading_Systems/Alpha/admin/deep_analyzer.js
 */

const fs = require('fs').promises;
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;

// Install required packages first:
// npm install @babel/parser @babel/traverse @babel/types @babel/generator

const CONFIG = {
    rootPath: 'C:\\Users\\codyc\\XIIITrading_Systems\\Alpha',
    outputPath: 'C:\\Users\\codyc\\XIIITrading_Systems\\Alpha\\admin\\deep_analysis.md',
    ignoredPatterns: [
        '__pycache__', '.git', 'node_modules', '.env', '.pyc', 
        '.pyo', '.log', '.db', '.sqlite', '.DS_Store', 'venv',
        'env', '.venv', 'dist', 'build', '.egg-info', '.pytest_cache',
        '.min.js', '.min.css', 'vendor', 'ag-grid-community.min.js'
    ],
    maxFileSize: 10 * 1024 * 1024,
    priorityPatterns: [
        'Calculator', 'Scanner', 'Module', 'Transformer', 
        'Bridge', 'Handler', 'Manager', 'Service', 'config', 'Config'
    ]
};

class DeepCodeAnalyzer {
    constructor() {
        this.files = new Map();
        this.calculations = new Map();
        this.dataFlows = new Map();
        this.messageFormats = new Map();
        this.dataStructures = new Map();
        this.returnFormats = new Map();
        this.configurations = new Map();
        this.gridDefinitions = new Map();
        this.constants = new Map();
        this.tradingLogic = new Map();
        this.startTime = Date.now();
    }

    async analyze() {
        console.log('='.repeat(60));
        console.log('DEEP CODE ANALYZER - Version 2.0');
        console.log('='.repeat(60));
        console.log(`Root: ${CONFIG.rootPath}`);
        console.log(`Output: ${CONFIG.outputPath}`);
        console.log('='.repeat(60) + '\n');

        try {
            console.log('STEP 1/8: Scanning files...');
            await this.scanFiles();

            console.log('\nSTEP 2/8: Extracting implementations...');
            await this.extractImplementations();

            console.log('\nSTEP 3/8: Analyzing calculations...');
            await this.analyzeCalculations();

            console.log('\nSTEP 4/8: Extracting data formats...');
            await this.extractDataFormats();

            console.log('\nSTEP 5/8: Extracting configurations...');
            await this.extractConfigurations();

            console.log('\nSTEP 6/8: Tracing data flows...');
            await this.traceDataFlows();

            console.log('\nSTEP 7/8: Analyzing trading logic...');
            await this.analyzeTradingLogic();

            console.log('\nSTEP 8/8: Generating deep analysis report...');
            await this.generateDeepReport();

        } catch (error) {
            console.error('Analysis failed:', error);
        }

        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
        console.log('\n' + '='.repeat(60));
        console.log(`✓ Deep analysis complete in ${elapsed} seconds!`);
        console.log(`✓ Report saved to: ${CONFIG.outputPath}`);
        console.log('='.repeat(60) + '\n');
    }

    async scanFiles() {
        const scanDirectory = async (dir) => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !this.isIgnored(entry.name)) {
                    await scanDirectory(fullPath);
                } else if (entry.isFile() && !this.isIgnored(entry.name)) {
                    const stat = await fs.stat(fullPath);
                    if (stat.size <= CONFIG.maxFileSize) {
                        const relativePath = path.relative(CONFIG.rootPath, fullPath);
                        
                        const isPriority = CONFIG.priorityPatterns.some(pattern => 
                            entry.name.includes(pattern)
                        );
                        
                        this.files.set(relativePath, {
                            path: fullPath,
                            relativePath,
                            name: entry.name,
                            type: this.getFileType(entry.name),
                            isPriority
                        });
                    }
                }
            }
        };

        await scanDirectory(CONFIG.rootPath);
        const priorityCount = Array.from(this.files.values()).filter(f => f.isPriority).length;
        console.log(`  ✓ Found ${this.files.size} files (${priorityCount} priority files)`);
    }

    async extractImplementations() {
        let processed = 0;
        let extracted = 0;
        const total = this.files.size;

        const sortedFiles = Array.from(this.files.entries()).sort((a, b) => {
            return (b[1].isPriority ? 1 : 0) - (a[1].isPriority ? 1 : 0);
        });

        for (const [relativePath, fileInfo] of sortedFiles) {
            try {
                const content = await fs.readFile(fileInfo.path, 'utf8');
                
                let hasExtracted = false;
                
                switch (fileInfo.type) {
                    case 'javascript':
                        hasExtracted = await this.deepAnalyzeJavaScript(fileInfo, content);
                        break;
                    case 'python':
                        hasExtracted = await this.deepAnalyzePython(fileInfo, content);
                        break;
                    case 'json':
                        hasExtracted = await this.deepAnalyzeJson(fileInfo, content);
                        break;
                }

                if (hasExtracted) extracted++;
                processed++;
                
                if (processed % 50 === 0) {
                    console.log(`  Progress: ${processed}/${total} files (${extracted} with implementations)`);
                }
            } catch (error) {
                console.debug(`  Skipped ${relativePath}: ${error.message}`);
            }
        }

        console.log(`  ✓ Extracted implementations from ${extracted} files`);
    }

    async deepAnalyzeJavaScript(fileInfo, content) {
        try {
            if (content.length > 500000 || fileInfo.name.includes('.min.')) {
                return false;
            }

            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript', 'classProperties', 'asyncGenerators'],
                errorRecovery: true
            });

            fileInfo.functions = [];
            fileInfo.dataStructures = [];
            fileInfo.returnFormats = [];
            fileInfo.configurations = [];
            fileInfo.gridDefinitions = [];
            fileInfo.constants = [];

            let foundContent = false;

            traverse(ast, {
                // Extract function returns and data structures
                FunctionDeclaration(path) {
                    const func = extractFunctionWithReturn(path);
                    if (func.name && !func.name.startsWith('_')) {
                        fileInfo.functions.push(func);
                        if (func.returnFormat) {
                            fileInfo.returnFormats.push({
                                function: func.name,
                                format: func.returnFormat
                            });
                        }
                        foundContent = true;
                    }
                },

                // Extract variable functions with returns
                VariableDeclarator(path) {
                    if (path.node.init && 
                        (t.isArrowFunctionExpression(path.node.init) || 
                         t.isFunctionExpression(path.node.init))) {
                        const func = extractVariableFunctionWithReturn(path);
                        if (func.name) {
                            fileInfo.functions.push(func);
                            if (func.returnFormat) {
                                fileInfo.returnFormats.push({
                                    function: func.name,
                                    format: func.returnFormat
                                });
                            }
                            foundContent = true;
                        }
                    }
                    
                    // Extract configuration objects
                    const name = path.node.id.name;
                    if (name && (name.includes('CONFIG') || name.includes('config') || 
                                 name.includes('Config') || name.includes('OPTIONS') ||
                                 name.includes('DEFAULTS'))) {
                        const config = extractConfiguration(path);
                        if (config) {
                            fileInfo.configurations.push(config);
                            foundContent = true;
                        }
                    }
                    
                    // Extract grid column definitions
                    if (name && (name.includes('columns') || name.includes('colDef'))) {
                        const gridDef = extractGridDefinition(path);
                        if (gridDef) {
                            fileInfo.gridDefinitions.push(gridDef);
                            foundContent = true;
                        }
                    }
                },

                // Extract object expressions that might be data structures
                ObjectExpression(path) {
                    const parent = path.parent;
                    if (t.isReturnStatement(parent)) {
                        const structure = extractDataStructure(path);
                        if (structure && Object.keys(structure).length > 0) {
                            fileInfo.dataStructures.push({
                                context: 'return value',
                                structure
                            });
                        }
                    }
                },

                // Extract TypeScript interfaces and types
                TSInterfaceDeclaration(path) {
                    const interfaceDef = extractInterface(path);
                    if (interfaceDef) {
                        fileInfo.dataStructures.push({
                            type: 'interface',
                            name: interfaceDef.name,
                            structure: interfaceDef.properties
                        });
                        foundContent = true;
                    }
                },

                TSTypeAliasDeclaration(path) {
                    const typeDef = extractTypeAlias(path);
                    if (typeDef) {
                        fileInfo.dataStructures.push({
                            type: 'type',
                            name: typeDef.name,
                            structure: typeDef.definition
                        });
                        foundContent = true;
                    }
                }
            });

            // Extract patterns from content
            this.extractPatterns(fileInfo, content);
            this.extractTradingPatterns(fileInfo, content);

            return foundContent;

        } catch (error) {
            return this.regexExtractJavaScript(fileInfo, content);
        }
    }

    async deepAnalyzePython(fileInfo, content) {
        fileInfo.functions = [];
        fileInfo.dataStructures = [];
        fileInfo.returnFormats = [];
        fileInfo.configurations = [];
        fileInfo.constants = [];

        let foundContent = false;

        // Extract function returns
        const funcRegex = /^([ \t]*)(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:\s*\n((?:\1[ \t]+.*\n)*)/gm;
        let match;
        
        while ((match = funcRegex.exec(content)) !== null) {
            const indent = match[1];
            const name = match[2];
            const params = match[3];
            const returnType = match[4];
            const body = match[5];
            
            const returnFormat = this.extractPythonReturn(body, returnType);
            
            if (returnFormat) {
                fileInfo.returnFormats.push({
                    function: name,
                    format: returnFormat
                });
            }
            
            // Extract docstring for data format hints
            const docstringMatch = body.match(/^\s*"""([\s\S]*?)"""/);
            if (docstringMatch) {
                const docstring = docstringMatch[1];
                const returnsMatch = docstring.match(/Returns?:\s*([\s\S]*?)(?:\n\s*\n|$)/);
                if (returnsMatch) {
                    fileInfo.dataStructures.push({
                        context: `${name} return`,
                        description: returnsMatch[1].trim()
                    });
                }
            }
            
            foundContent = true;
        }

        // Extract configuration dictionaries
        const configRegex = /^(\w*(?:CONFIG|SETTINGS?|OPTIONS?|DEFAULTS?)\w*)\s*=\s*{([^}]+)}/gmi;
        while ((match = configRegex.exec(content)) !== null) {
            const configName = match[1];
            const configBody = match[2];
            
            try {
                const config = this.parsePythonDict(configBody);
                fileInfo.configurations.push({
                    name: configName,
                    values: config
                });
                foundContent = true;
            } catch (e) {
                // Fallback to raw
                fileInfo.configurations.push({
                    name: configName,
                    raw: configBody
                });
            }
        }

        // Extract dataclass definitions
        const dataclassRegex = /@dataclass\s*\n\s*class\s+(\w+).*?:\s*\n((?:\s+\w+:\s*[\w\[\],\s]+.*\n)+)/g;
        while ((match = dataclassRegex.exec(content)) !== null) {
            const className = match[1];
            const fields = this.parseDataclassFields(match[2]);
            
            fileInfo.dataStructures.push({
                type: 'dataclass',
                name: className,
                structure: fields
            });
            foundContent = true;
        }

        // Extract constants
        const constRegex = /^([A-Z_]+)\s*=\s*(.+)$/gm;
        while ((match = constRegex.exec(content)) !== null) {
            const value = this.parsePythonValue(match[2]);
            fileInfo.constants.push({
                name: match[1],
                value: value,
                raw: match[2]
            });
            foundContent = true;
        }

        return foundContent;
    }

    async deepAnalyzeJson(fileInfo, content) {
        try {
            const data = JSON.parse(content);
            
            fileInfo.dataStructures = [{
                type: 'json',
                name: fileInfo.name,
                structure: data
            }];
            
            // If it's a config file, add to configurations
            if (fileInfo.name.includes('config')) {
                fileInfo.configurations = [{
                    name: fileInfo.name,
                    values: data
                }];
            }
            
            // If it's package.json, extract specific sections
            if (fileInfo.name === 'package.json') {
                if (data.config) {
                    fileInfo.configurations.push({
                        name: 'package.config',
                        values: data.config
                    });
                }
            }
            
            return true;
        } catch (e) {
            return false;
        }
    }

    async extractDataFormats() {
        const formats = new Map();
        
        for (const [path, fileInfo] of this.files) {
            // Collect return formats
            if (fileInfo.returnFormats?.length > 0) {
                for (const format of fileInfo.returnFormats) {
                    const key = `${path}:${format.function}`;
                    formats.set(key, {
                        file: path,
                        function: format.function,
                        format: format.format
                    });
                }
            }
            
            // Collect data structures
            if (fileInfo.dataStructures?.length > 0) {
                for (const structure of fileInfo.dataStructures) {
                    const key = `${path}:${structure.name || structure.context}`;
                    formats.set(key, {
                        file: path,
                        name: structure.name || structure.context,
                        type: structure.type,
                        structure: structure.structure
                    });
                }
            }
            
            // Look for example data in comments
            if (fileInfo.type === 'javascript' || fileInfo.type === 'python') {
                const content = await fs.readFile(fileInfo.path, 'utf8');
                const examples = this.extractExampleData(content);
                for (const example of examples) {
                    formats.set(`${path}:example:${example.name}`, {
                        file: path,
                        name: example.name,
                        type: 'example',
                        structure: example.data
                    });
                }
            }
        }
        
        this.dataStructures = formats;
        console.log(`  ✓ Extracted ${formats.size} data formats`);
    }

    extractExampleData(content) {
        const examples = [];
        
        // Look for example comments
        const exampleRegex = /(?:Example|example|EXAMPLE|Sample|sample):\s*(?:```)?([^`\n]+(?:\n[^`\n]+)*?)(?:```)?/g;
        let match;
        
        while ((match = exampleRegex.exec(content)) !== null) {
            try {
                // Try to parse as JSON
                const cleaned = match[1].trim()
                    .replace(/\/\/.*/g, '') // Remove comments
                    .replace(/,\s*}/g, '}') // Remove trailing commas
                    .replace(/,\s*]/g, ']');
                    
                const data = JSON.parse(cleaned);
                examples.push({
                    name: 'example',
                    data
                });
            } catch (e) {
                // Not valid JSON, skip
            }
        }
        
        // Look for WebSocket message examples
        const wsRegex = /(?:ws|websocket|WebSocket).*?(?:message|Message).*?[=:]\s*({[^}]+})/gi;
        while ((match = wsRegex.exec(content)) !== null) {
            try {
                const data = JSON.parse(match[1]);
                examples.push({
                    name: 'websocket_message',
                    data
                });
            } catch (e) {
                // Not valid JSON
            }
        }
        
        return examples;
    }

    async extractConfigurations() {
        const configs = new Map();
        
        for (const [path, fileInfo] of this.files) {
            if (fileInfo.configurations?.length > 0) {
                for (const config of fileInfo.configurations) {
                    configs.set(`${path}:${config.name}`, {
                        file: path,
                        name: config.name,
                        values: config.values || config.raw
                    });
                }
            }
            
            // Extract grid configurations
            if (fileInfo.gridDefinitions?.length > 0) {
                for (const grid of fileInfo.gridDefinitions) {
                    configs.set(`${path}:grid:${grid.name}`, {
                        file: path,
                        name: `Grid: ${grid.name}`,
                        values: grid.columns
                    });
                }
            }
        }
        
        this.configurations = configs;
        console.log(`  ✓ Extracted ${configs.size} configurations`);
    }

    extractPythonReturn(body, returnType) {
        // Look for return statements
        const returnRegex = /^\s*return\s+(.+)$/gm;
        const returns = [];
        let match;
        
        while ((match = returnRegex.exec(body)) !== null) {
            const returnValue = match[1].trim();
            
            // Try to parse the return value
            if (returnValue.startsWith('{')) {
                // Dictionary return
                const dictMatch = returnValue.match(/{([^}]+)}/);
                if (dictMatch) {
                    try {
                        const parsed = this.parsePythonDict(dictMatch[1]);
                        returns.push(parsed);
                    } catch (e) {
                        returns.push(returnValue);
                    }
                }
            } else if (returnValue.startsWith('[')) {
                // List return
                returns.push('array');
            } else if (returnValue.includes('(') && returnValue.includes(',')) {
                // Tuple return
                returns.push('tuple');
            } else {
                returns.push(returnValue);
            }
        }
        
        if (returns.length > 0) {
            return returns[0];
        }
        
        return returnType || null;
    }

    parsePythonDict(dictBody) {
        const result = {};
        
        // Simple parser for Python dict literals
        const items = dictBody.split(',').map(s => s.trim());
        
        for (const item of items) {
            const colonIndex = item.indexOf(':');
            if (colonIndex > -1) {
                const key = item.slice(0, colonIndex).trim().replace(/['"]/g, '');
                const value = item.slice(colonIndex + 1).trim();
                result[key] = this.parsePythonValue(value);
            }
        }
        
        return result;
    }

    parsePythonValue(value) {
        value = value.trim();
        
        // String
        if (value.startsWith('"') || value.startsWith("'")) {
            return value.slice(1, -1);
        }
        
        // Number
        if (/^-?\d+(\.\d+)?$/.test(value)) {
            return parseFloat(value);
        }
        
        // Boolean
        if (value === 'True') return true;
        if (value === 'False') return false;
        if (value === 'None') return null;
        
        // List
        if (value.startsWith('[')) {
            return 'array';
        }
        
        // Dict
        if (value.startsWith('{')) {
            return 'object';
        }
        
        // Function call or variable
        return value;
    }

    parseDataclassFields(body) {
        const fields = [];
        const lines = body.split('\n');
        
        for (const line of lines) {
            const fieldMatch = line.match(/(\w+):\s*([^\s=]+)(?:\s*=\s*(.+))?/);
            if (fieldMatch) {
                fields.push({
                    name: fieldMatch[1],
                    type: fieldMatch[2],
                    default: fieldMatch[3]?.trim(),
                    required: !fieldMatch[3]
                });
            }
        }
        
        return fields;
    }

    async analyzeCalculations() {
        const allCalculations = new Map();

        for (const [path, fileInfo] of this.files) {
            if (fileInfo.calculations?.length > 0) {
                for (const calc of fileInfo.calculations) {
                    const key = calc.variable || calc.name || 'unnamed';
                    if (!allCalculations.has(key)) {
                        allCalculations.set(key, []);
                    }
                    allCalculations.get(key).push({
                        file: path,
                        ...calc
                    });
                }
            }
        }

        this.calculations = allCalculations;
        console.log(`  ✓ Found ${allCalculations.size} unique calculations`);
    }

    async traceDataFlows() {
        const flows = new Map();

        // Find WebSocket data entry points
        for (const [path, fileInfo] of this.files) {
            if (path.includes('websocket') || path.includes('WebSocket')) {
                const handlers = this.extractWebSocketHandlers(fileInfo);
                for (const handler of handlers) {
                    flows.set(handler.event, {
                        entry: path,
                        handler: handler,
                        transformations: [],
                        outputs: []
                    });
                }
            }
        }

        this.dataFlows = flows;
        console.log(`  ✓ Traced ${flows.size} data flows`);
    }

    extractWebSocketHandlers(fileInfo) {
        const handlers = [];
        
        if (fileInfo.eventHandlers) {
            for (const handler of fileInfo.eventHandlers) {
                if (handler.type === 'WebSocket' || handler.event?.includes('message')) {
                    handlers.push(handler);
                }
            }
        }

        if (fileInfo.functions) {
            for (const func of fileInfo.functions) {
                if (func.name.includes('on_') || func.name.includes('handle_')) {
                    handlers.push({
                        event: func.name.replace(/on_|handle_/, ''),
                        function: func.name,
                        params: func.params
                    });
                }
            }
        }

        return handlers;
    }

    async analyzeTradingLogic() {
        const tradingLogic = new Map();

        for (const [path, fileInfo] of this.files) {
            if (path.includes('scanner') || path.includes('Scanner') ||
                path.includes('calculator') || path.includes('Calculator') ||
                path.includes('module') || path.includes('Module')) {
                
                const logic = {
                    file: path,
                    strategies: [],
                    calculations: fileInfo.calculations || [],
                    dataFormats: fileInfo.returnFormats || []
                };

                if (fileInfo.functions) {
                    for (const func of fileInfo.functions) {
                        if (func.name.includes('scan') || func.name.includes('detect') ||
                            func.name.includes('calculate') || func.name.includes('analyze')) {
                            
                            logic.strategies.push({
                                name: func.name,
                                params: func.params,
                                returnFormat: func.returnFormat,
                                implementation: func.implementation
                            });
                        }
                    }
                }

                if (logic.strategies.length > 0 || logic.calculations.length > 0) {
                    tradingLogic.set(path, logic);
                }
            }
        }

        this.tradingLogic = tradingLogic;
        console.log(`  ✓ Analyzed ${tradingLogic.size} trading logic files`);
    }

    async generateDeepReport() {
        const report = [];

        // Header
        report.push('# Deep Code Analysis Report - Version 2.0');
        report.push(`\n**Generated:** ${new Date().toISOString()}`);
        report.push(`**Total Files Analyzed:** ${this.files.size}`);
        report.push('\n---\n');

        // Data Formats and Structures
        report.push('## Data Formats and Structures\n');
        report.push(this.generateDataFormatsSection());
        report.push('\n---\n');

        // Configuration Details
        report.push('## Configuration Details\n');
        report.push(this.generateConfigurationSection());
        report.push('\n---\n');

        // Trading Logic Implementation
        report.push('## Trading Logic Implementation\n');
        report.push(this.generateTradingLogicSection());
        report.push('\n---\n');

        // Calculations and Formulas
        report.push('## Calculations and Formulas\n');
        report.push(this.generateCalculationsSection());
        report.push('\n---\n');

        // Data Flow and Transformations
        report.push('## Data Flow and Transformations\n');
        report.push(this.generateDataFlowSection());

        await fs.writeFile(CONFIG.outputPath, report.join('\n'), 'utf8');
        console.log(`  ✓ Deep analysis report written to: ${CONFIG.outputPath}`);
    }

    generateDataFormatsSection() {
        const sections = [];

        // Group by type
        const byType = {
            returnFormats: [],
            dataStructures: [],
            examples: [],
            gridColumns: []
        };

        for (const [key, format] of this.dataStructures) {
            if (format.type === 'example') {
                byType.examples.push(format);
            } else if (format.function) {
                byType.returnFormats.push(format);
            } else {
                byType.dataStructures.push(format);
            }
        }

        // Add grid definitions
        for (const [path, fileInfo] of this.files) {
            if (fileInfo.gridDefinitions?.length > 0) {
                for (const grid of fileInfo.gridDefinitions) {
                    byType.gridColumns.push({
                        file: path,
                        name: grid.name,
                        columns: grid.columns
                    });
                }
            }
        }

        // Generate sections
        if (byType.returnFormats.length > 0) {
            sections.push('### Function Return Formats\n');
            
            // Group by file
            const byFile = new Map();
            for (const format of byType.returnFormats) {
                if (!byFile.has(format.file)) {
                    byFile.set(format.file, []);
                }
                byFile.get(format.file).push(format);
            }
            
            for (const [file, formats] of byFile) {
                sections.push(`#### ${file}\n`);
                
                for (const format of formats.slice(0, 5)) {
                    sections.push(`**${format.function}() returns:**`);
                    sections.push('```javascript');
                    if (typeof format.format === 'object') {
                        sections.push(JSON.stringify(format.format, null, 2));
                    } else {
                        sections.push(String(format.format));
                    }
                    sections.push('```\n');
                }
            }
        }

        if (byType.dataStructures.length > 0) {
            sections.push('### Data Structures\n');
            
            for (const structure of byType.dataStructures.slice(0, 10)) {
                sections.push(`**${structure.name}** *(${structure.file})*`);
                sections.push('```javascript');
                if (typeof structure.structure === 'object') {
                    sections.push(JSON.stringify(structure.structure, null, 2));
                } else {
                    sections.push(String(structure.structure));
                }
                sections.push('```\n');
            }
        }

        if (byType.examples.length > 0) {
            sections.push('### Example Data\n');
            
            for (const example of byType.examples.slice(0, 5)) {
                sections.push(`**${example.name}** *(${example.file})*`);
                sections.push('```json');
                sections.push(JSON.stringify(example.structure, null, 2));
                sections.push('```\n');
            }
        }

        if (byType.gridColumns.length > 0) {
            sections.push('### Grid Column Definitions\n');
            
            for (const grid of byType.gridColumns.slice(0, 3)) {
                sections.push(`**${grid.name}** *(${grid.file})*`);
                sections.push('```javascript');
                sections.push(JSON.stringify(grid.columns, null, 2));
                sections.push('```\n');
            }
        }

        return sections.join('\n');
    }

    generateConfigurationSection() {
        const sections = [];

        // Group configurations by type
        const configTypes = {
            app: [],
            trading: [],
            ui: [],
            data: [],
            grid: [],
            other: []
        };

        for (const [key, config] of this.configurations) {
            const name = config.name.toLowerCase();
            
            if (name.includes('app') || name.includes('window')) {
                configTypes.app.push(config);
            } else if (name.includes('trading') || name.includes('strategy')) {
                configTypes.trading.push(config);
            } else if (name.includes('ui') || name.includes('display')) {
                configTypes.ui.push(config);
            } else if (name.includes('data') || name.includes('feed')) {
                configTypes.data.push(config);
            } else if (name.includes('grid') || name.includes('column')) {
                configTypes.grid.push(config);
            } else {
                configTypes.other.push(config);
            }
        }

        // Generate sections for each type
        for (const [type, configs] of Object.entries(configTypes)) {
            if (configs.length > 0) {
                sections.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)} Configuration\n`);
                
                for (const config of configs.slice(0, 5)) {
                    sections.push(`**${config.name}** *(${config.file})*`);
                    sections.push('```javascript');
                    
                    if (typeof config.values === 'object') {
                        // Pretty print with proper indentation
                        const formatted = JSON.stringify(config.values, null, 2);
                        sections.push(formatted.length > 1000 ? 
                            formatted.slice(0, 1000) + '\n// ... truncated' : 
                            formatted
                        );
                    } else {
                        sections.push(String(config.values));
                    }
                    
                    sections.push('```\n');
                }
                
                if (configs.length > 5) {
                    sections.push(`*... and ${configs.length - 5} more ${type} configurations*\n`);
                }
            }
        }

        // Add constants section
        const allConstants = new Map();
        for (const [path, fileInfo] of this.files) {
            if (fileInfo.constants?.length > 0) {
                for (const constant of fileInfo.constants) {
                    if (!allConstants.has(constant.name)) {
                        allConstants.set(constant.name, {
                            ...constant,
                            file: path
                        });
                    }
                }
            }
        }

        if (allConstants.size > 0) {
            sections.push('### Constants and Settings\n');
            
            const importantConstants = Array.from(allConstants.values())
                .filter(c => c.name.includes('THRESHOLD') || 
                            c.name.includes('LIMIT') || 
                            c.name.includes('INTERVAL') ||
                            c.name.includes('WINDOW'))
                .slice(0, 20);
                
            for (const constant of importantConstants) {
                sections.push(`**${constant.name}:** \`${constant.value}\``);
                sections.push(`*File: ${constant.file}*\n`);
            }
        }

        return sections.join('\n');
    }

    generateTradingLogicSection() {
        const sections = [];

        for (const [path, logic] of this.tradingLogic) {
            sections.push(`### ${path}\n`);
            
            // Show strategies with their return formats
            for (const strategy of logic.strategies) {
                sections.push(`**${strategy.name}(${strategy.params?.join(', ') || ''}):**\n`);
                
                if (strategy.returnFormat) {
                    sections.push('**Returns:**');
                    sections.push('```javascript');
                    if (typeof strategy.returnFormat === 'object') {
                        sections.push(JSON.stringify(strategy.returnFormat, null, 2));
                    } else {
                        sections.push(String(strategy.returnFormat));
                    }
                    sections.push('```\n');
                }
                
                // Show key implementation steps
                if (strategy.implementation?.steps?.length > 0) {
                    sections.push('**Implementation:**');
                    sections.push('```javascript');
                    
                    const meaningfulSteps = strategy.implementation.steps
                        .filter(step => step.code && step.code.trim().length > 10)
                        .slice(0, 10);
                    
                    for (const step of meaningfulSteps) {
                        sections.push(step.code);
                    }
                    
                    sections.push('```\n');
                }
            }
        }

        return sections.join('\n');
    }

    generateCalculationsSection() {
        const sections = [];

        sections.push('### Key Calculations\n');

        // Group calculations by type
        const calculationTypes = {
            momentum: [],
            gap: [],
            volume: [],
            price: [],
            percent: [],
            other: []
        };

        for (const [name, calcs] of this.calculations) {
            for (const calc of calcs) {
                const lowerName = name.toLowerCase();
                
                if (lowerName.includes('momentum')) {
                    calculationTypes.momentum.push(calc);
                } else if (lowerName.includes('gap')) {
                    calculationTypes.gap.push(calc);
                } else if (lowerName.includes('volume')) {
                    calculationTypes.volume.push(calc);
                } else if (lowerName.includes('price')) {
                    calculationTypes.price.push(calc);
                } else if (lowerName.includes('percent')) {
                    calculationTypes.percent.push(calc);
                } else {
                    calculationTypes.other.push(calc);
                }
            }
        }

        // Generate sections for each type
        for (const [type, calcs] of Object.entries(calculationTypes)) {
            if (calcs.length > 0) {
                sections.push(`#### ${type.charAt(0).toUpperCase() + type.slice(1)} Calculations\n`);
                
                for (const calc of calcs.slice(0, 5)) {
                    sections.push(`**${calc.variable}:**`);
                    sections.push('```javascript');
                    sections.push(`${calc.variable} = ${calc.formula || calc.value}`);
                    sections.push('```');
                    sections.push(`*File: ${calc.file}*\n`);
                }
            }
        }

        return sections.join('\n');
    }

    generateDataFlowSection() {
        const sections = [];

        sections.push('### Data Processing Pipeline\n');
        sections.push('```');
        sections.push('1. MARKET DATA INGESTION');
        sections.push('   Polygon WebSocket → Python Server → Data Validation');
        sections.push('   ↓');
        sections.push('2. DATA TRANSFORMATION');
        sections.push('   Raw Quotes/Trades → Aggregated Bars → Calculated Metrics');
        sections.push('   ↓');
        sections.push('3. TRADING ANALYSIS');
        sections.push('   Gap Detection → Momentum Calculation → Volume Analysis');
        sections.push('   ↓');
        sections.push('4. SIGNAL GENERATION');
        sections.push('   Condition Checks → Threshold Comparison → Alert Creation');
        sections.push('   ↓');
        sections.push('5. UI UPDATE');
        sections.push('   IPC Message → Grid Update → Visual Indicators');
        sections.push('```');

        return sections.join('\n');
    }

    // Helper methods
    extractPatterns(fileInfo, content) {
        // Extract grid column definitions more thoroughly
        const gridColRegex = /(?:columns?|colDefs?)\s*[:=]\s*\[([^\]]+)\]/gs;
        let match;
        
        fileInfo.gridColumns = [];
        while ((match = gridColRegex.exec(content)) !== null) {
            const colDef = match[1];
            const columns = this.parseGridColumns(colDef);
            if (columns.length > 0) {
                fileInfo.gridColumns.push(...columns);
            }
        }
    }

    parseGridColumns(colDef) {
        const columns = [];
        
        // More comprehensive regex for column definitions
        const colRegex = /{\s*field:\s*['"`](\w+)['"`]([^}]+)}/g;
        let match;
        
        while ((match = colRegex.exec(colDef)) !== null) {
            const field = match[1];
            const config = match[2];
            
            const column = { field };
            
            // Extract all properties
            const propRegex = /(\w+):\s*(['"`]([^'"`]+)['"`]|(\d+)|true|false)/g;
            let propMatch;
            
            while ((propMatch = propRegex.exec(config)) !== null) {
                const key = propMatch[1];
                const value = propMatch[3] || propMatch[4] || propMatch[0].split(':')[1].trim();
                column[key] = value;
            }
            
            columns.push(column);
        }
        
        return columns;
    }

    extractTradingPatterns(fileInfo, content) {
        const patterns = {
            gapCalculations: [],
            momentumCalculations: [],
            signals: [],
            thresholds: []
        };
        
        // Extract with more context
        const gapRegex = /(\w*gap\w*)\s*=\s*([^;\n]+)[;\n]/gi;
        let match;
        while ((match = gapRegex.exec(content)) !== null) {
            patterns.gapCalculations.push({
                variable: match[1],
                formula: match[2].trim()
            });
        }
        
        fileInfo.tradingPatterns = patterns;
    }

    regexExtractJavaScript(fileInfo, content) {
        // Enhanced fallback extraction
        fileInfo.functions = [];
        fileInfo.configurations = [];
        fileInfo.dataStructures = [];
        
        // Extract configuration objects
        const configRegex = /(?:const|let|var)\s+(\w*(?:CONFIG|SETTINGS?|OPTIONS?)\w*)\s*=\s*({[\s\S]+?});/gi;
        let match;
        
        while ((match = configRegex.exec(content)) !== null) {
            try {
                const configStr = match[2]
                    .replace(/\/\/.*/g, '') // Remove comments
                    .replace(/,\s*}/g, '}'); // Remove trailing commas
                    
                const config = eval(`(${configStr})`);
                fileInfo.configurations.push({
                    name: match[1],
                    values: config
                });
            } catch (e) {
                fileInfo.configurations.push({
                    name: match[1],
                    raw: match[2]
                });
            }
        }
        
        return fileInfo.configurations.length > 0;
    }

    isIgnored(name) {
        return CONFIG.ignoredPatterns.some(pattern => {
            if (pattern.startsWith('*')) {
                return name.endsWith(pattern.slice(1));
            }
            return name === pattern || name.includes(pattern);
        });
    }

    getFileType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const typeMap = {
            '.py': 'python',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.json': 'json',
            '.md': 'markdown'
        };
        return typeMap[ext] || 'other';
    }
}

// Enhanced helper functions
function extractFunctionWithReturn(path) {
    const node = path.node;
    const name = node.id?.name || 'anonymous';
    const params = node.params.map(p => {
        if (t.isIdentifier(p)) return p.name;
        if (t.isAssignmentPattern(p)) return p.left.name;
        return 'param';
    });
    
    const implementation = extractFunctionImplementation(path);
    const returnFormat = extractReturnFormat(path);
    
    return {
        name,
        params,
        implementation,
        returnFormat,
        isAsync: node.async
    };
}

function extractVariableFunctionWithReturn(path) {
    const node = path.node;
    const name = node.id.name;
    const funcNode = node.init;
    
    const params = funcNode.params.map(p => {
        if (t.isIdentifier(p)) return p.name;
        if (t.isAssignmentPattern(p)) return p.left.name;
        return 'param';
    });
    
    const implementation = extractFunctionImplementation(path.get('init'));
    const returnFormat = extractReturnFormat(path.get('init'));
    
    return {
        name,
        params,
        implementation,
        returnFormat,
        isAsync: funcNode.async
    };
}

function extractReturnFormat(path) {
    const returns = [];
    
    path.traverse({
        ReturnStatement(innerPath) {
            if (innerPath.getFunctionParent() === path) {
                const arg = innerPath.node.argument;
                if (arg) {
                    const format = extractDataStructure(innerPath.get('argument'));
                    returns.push(format);
                }
            }
        }
    });
    
    return returns.length > 0 ? returns[0] : null;
}

function extractDataStructure(path) {
    const node = path.node;
    
    if (!node) return null;
    
    switch (node.type) {
        case 'ObjectExpression':
            const obj = {};
            for (const prop of node.properties) {
                if (t.isObjectProperty(prop) || t.isProperty(prop)) {
                    const key = prop.key.name || prop.key.value;
                    if (key) {
                        obj[key] = extractDataStructure(path.get(`properties.${node.properties.indexOf(prop)}.value`));
                    }
                }
            }
            return obj;
            
        case 'ArrayExpression':
            if (node.elements.length > 0) {
                return [extractDataStructure(path.get('elements.0'))];
            }
            return [];
            
        case 'StringLiteral':
            return 'string';
        case 'NumericLiteral':
            return 'number';
        case 'BooleanLiteral':
            return 'boolean';
        case 'NullLiteral':
            return null;
        case 'Identifier':
            return node.name;
        case 'CallExpression':
            return `${generateCode(node.callee)}()`;
        case 'MemberExpression':
            return generateCode(node);
        default:
            return generateCode(node);
    }
}

function extractConfiguration(path) {
    const node = path.node;
    const name = node.id.name;
    
    if (node.init && t.isObjectExpression(node.init)) {
        const values = extractObjectLiteral(path.get('init'));
        return {
            name,
            values
        };
    }
    
    return null;
}

function extractObjectLiteral(path) {
    const node = path.node;
    const result = {};
    
    if (t.isObjectExpression(node)) {
        for (let i = 0; i < node.properties.length; i++) {
            const prop = node.properties[i];
            if (t.isObjectProperty(prop) || t.isProperty(prop)) {
                const key = prop.key.name || prop.key.value;
                if (key) {
                    const valuePath = path.get(`properties.${i}.value`);
                    const value = extractValue(valuePath.node);
                    result[key] = value;
                }
            }
        }
    }
    
    return result;
}

function extractGridDefinition(path) {
    const node = path.node;
    const name = node.id.name;
    
    if (node.init && t.isArrayExpression(node.init)) {
        const columns = [];
        
        for (let i = 0; i < node.init.elements.length; i++) {
            const elem = node.init.elements[i];
            if (t.isObjectExpression(elem)) {
                const col = extractObjectLiteral(path.get(`init.elements.${i}`));
                columns.push(col);
            }
        }
        
        return {
            name,
            columns
        };
    }
    
    return null;
}

function extractInterface(path) {
    const node = path.node;
    const name = node.id.name;
    const properties = {};
    
    for (const prop of node.body.body) {
        if (t.isTSPropertySignature(prop)) {
            const key = prop.key.name;
            const type = generateCode(prop.typeAnnotation?.typeAnnotation);
            properties[key] = {
                type,
                optional: prop.optional || false
            };
        }
    }
    
    return {
        name,
        properties
    };
}

function extractTypeAlias(path) {
    const node = path.node;
    const name = node.id.name;
    const definition = generateCode(node.typeAnnotation);
    
    return {
        name,
        definition
    };
}

function extractValue(node) {
    if (!node) return null;
    
    switch (node.type) {
        case 'NumericLiteral':
            return node.value;
        case 'StringLiteral':
            return node.value;
        case 'BooleanLiteral':
            return node.value;
        case 'NullLiteral':
            return null;
        case 'Identifier':
            return `<${node.name}>`;
        case 'ObjectExpression':
            const obj = {};
            for (const prop of node.properties) {
                if (prop.key) {
                    const key = prop.key.name || prop.key.value;
                    obj[key] = extractValue(prop.value);
                }
            }
            return obj;
        case 'ArrayExpression':
            return node.elements.map(el => extractValue(el));
        case 'TemplateLiteral':
            return generateCode(node);
        case 'BinaryExpression':
        case 'UnaryExpression':
        case 'ConditionalExpression':
        case 'LogicalExpression':
            return generateCode(node);
        default:
            const generated = generateCode(node);
            return generated.length < 100 ? generated : node.type;
    }
}

function extractFunctionImplementation(path) {
    const implementation = {
        steps: [],
        variables: new Map(),
        conditions: [],
        returns: [],
        calls: []
    };
    
    try {
        const bodyPath = path.get('body');
        if (!bodyPath) return implementation;
        
        bodyPath.traverse({
            VariableDeclarator(innerPath) {
                if (innerPath.getFunctionParent() === path) {
                    const name = innerPath.node.id.name;
                    const value = generateCode(innerPath.node.init);
                    implementation.variables.set(name, value);
                    implementation.steps.push({
                        type: 'variable',
                        code: `${name} = ${value}`
                    });
                }
            },
            
            AssignmentExpression(innerPath) {
                if (innerPath.getFunctionParent() === path) {
                    const code = generateCode(innerPath.node);
                    implementation.steps.push({
                        type: 'assignment',
                        code: code
                    });
                }
            },
            
            IfStatement(innerPath) {
                if (innerPath.getFunctionParent() === path) {
                    const condition = generateCode(innerPath.node.test);
                    implementation.conditions.push({
                        condition: condition,
                        type: 'if'
                    });
                    
                    implementation.steps.push({
                        type: 'condition',
                        code: `if (${condition})`
                    });
                }
            },
            
            CallExpression(innerPath) {
                if (innerPath.getFunctionParent() === path) {
                    const callee = generateCode(innerPath.node.callee);
                    implementation.calls.push(callee);
                    
                    const code = generateCode(innerPath.node);
                    implementation.steps.push({
                        type: 'call',
                        code: code
                    });
                }
            },
            
            ReturnStatement(innerPath) {
                if (innerPath.getFunctionParent() === path) {
                    const value = generateCode(innerPath.node.argument);
                    implementation.returns.push(value);
                    implementation.steps.push({
                        type: 'return',
                        code: `return ${value}`
                    });
                }
            }
        });
    } catch (error) {
        // If traversal fails, return what we have
    }
    
    return implementation;
}

function generateCode(node) {
    if (!node) return 'null';
    
    // Use babel generator for better code generation
    try {
        const { code } = generate(node, { 
            concise: true,
            jsonCompatibleStrings: true
        });
        return code;
    } catch (e) {
        // Fallback to manual generation
        return manualGenerateCode(node);
    }
}

function manualGenerateCode(node) {
    if (!node) return 'null';
    
    switch (node.type) {
        case 'Identifier':
            return node.name;
        case 'NumericLiteral':
            return node.value.toString();
        case 'StringLiteral':
            return `"${node.value}"`;
        case 'BooleanLiteral':
            return node.value.toString();
        case 'NullLiteral':
            return 'null';
        case 'MemberExpression':
            const obj = manualGenerateCode(node.object);
            const prop = node.computed ? 
                `[${manualGenerateCode(node.property)}]` : 
                `.${manualGenerateCode(node.property)}`;
            return `${obj}${prop}`;
        case 'CallExpression':
            const callee = manualGenerateCode(node.callee);
            const args = node.arguments.map(arg => manualGenerateCode(arg)).join(', ');
            return `${callee}(${args})`;
        case 'ObjectExpression':
            const props = node.properties.map(p => {
                const key = p.key.name || p.key.value;
                const value = manualGenerateCode(p.value);
                return `${key}: ${value}`;
            }).join(', ');
            return `{${props}}`;
        case 'ArrayExpression':
            const elements = node.elements.map(el => el ? manualGenerateCode(el) : 'null').join(', ');
            return `[${elements}]`;
        default:
            return node.type;
    }
}

// Main execution
async function main() {
    const analyzer = new DeepCodeAnalyzer();
    await analyzer.analyze();
}

if (require.main === module) {
    main().catch(err => {
        console.error('Analysis failed:', err);
        process.exit(1);
    });
}
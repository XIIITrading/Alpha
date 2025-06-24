/**
 * Mock Renderer Environment
 * Provides mock DOM and AG-Grid environment for testing
 * Updated to fix innerHTML and textContent handling
 */

/**
 * Functionality:
 * Provides mock DOM elements for testing
 * Creates a mock document object with createElement method
 * Creates a mock element class with tagName, className, textContent, innerHTML, style, children, and classList properties
 * Provides a mock offsetWidth property for element width
 */

// Mock DOM elements
export class MockElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.className = '';
        this._textContent = '';
        this._innerHTML = '';
        this.style = {};
        this.children = [];
        this.classList = {
            add: (className) => {
                if (!this.className.includes(className)) {
                    this.className += ` ${className}`;
                }
            },
            remove: (className) => {
                this.className = this.className.replace(className, '').trim();
            }
        };
    }
    
    appendChild(child) {
        this.children.push(child);
        // Update textContent to include child content
        this._updateTextContent();
    }
    
    get offsetWidth() {
        return 100; // Mock width
    }
    
    get innerHTML() {
        return this._innerHTML;
    }
    
    set innerHTML(value) {
        this._innerHTML = value;
        this.children = [];
        // Extract text content from HTML (simple implementation)
        this._textContent = value.replace(/<[^>]*>/g, '');
    }
    
    get textContent() {
        return this._textContent;
    }
    
    set textContent(value) {
        this._textContent = value;
        this._innerHTML = value;
        this.children = [];
    }
    
    _updateTextContent() {
        // Combine own text with children's text
        const childText = this.children
            .map(child => child.textContent || '')
            .join('');
        if (childText && !this._innerHTML) {
            this._textContent = childText;
        }
    }
}

// Mock document
export const mockDocument = {
    createElement: (tagName) => new MockElement(tagName)
};

// Mock AG-Grid params
export function createMockParams(value, field = 'testField', data = {}) {
    return {
        value: value,
        colDef: {
            field: field
        },
        node: {
            data: data
        },
        data: data
    };
}

// Setup global mocks
if (typeof global !== 'undefined') {
    global.document = mockDocument;
    global.setTimeout = (fn, delay) => fn();
}
class DataProcessor {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.queue = [];
        this.isProcessing = false;
    }

    async processData(input) {
        if (!input || typeof input !== 'object') {
            throw new Error('Invalid input data');
        }

        const result = await this.transform(input);
        this.cache.set(input.id, result);
        return result;
    }

    transform(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ...data,
                    processed: true,
                    timestamp: Date.now()
                });
            }, 100);
        });
    }

    get cacheSize() {
        return this.cache.size;
    }

    set maxCacheSize(size) {
        this._maxCacheSize = size;
        this.cleanCache();
    }

    cleanCache() {
        if (this.cache.size > this._maxCacheSize) {
            const entries = Array.from(this.cache.entries());
            const toDelete = entries.slice(0, entries.length - this._maxCacheSize);
            toDelete.forEach(([key]) => this.cache.delete(key));
        }
    }

    static createProcessor(type) {
        switch (type) {
            case 'json':
                return new JSONProcessor();
            case 'xml':
                return new XMLProcessor();
            default:
                return new DataProcessor();
        }
    }

    static validateConfig(config) {
        return config && typeof config === 'object' && config.type;
    }
}

class JSONProcessor extends DataProcessor {
    constructor() {
        super({ type: 'json' });
        this.validator = new JSONValidator();
    }

    async processData(input) {
        const isValid = await this.validator.validate(input);
        if (!isValid) {
            throw new Error('Invalid JSON structure');
        }
        return super.processData(input);
    }

    stringify(data) {
        try {
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('JSON stringify failed:', error);
            return null;
        }
    }

    parse(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON parse failed:', error);
            return null;
        }
    }
}

class XMLProcessor extends DataProcessor {
    constructor() {
        super({ type: 'xml' });
        this.xmlValidator = new XMLValidator();
        this.namespaces = new Map();
    }

    async processData(input) {
        const isValid = await this.xmlValidator.validate(input);
        if (!isValid) {
            throw new Error('Invalid XML structure');
        }
        return super.processData(input);
    }

    parseXML(xmlString) {
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            return parser.parseFromString(xmlString, 'text/xml');
        }
        return this.fallbackXMLParse(xmlString);
    }

    fallbackXMLParse(xmlString) {
        const tags = xmlString.match(/<[^>]+>/g) || [];
        return {
            tagCount: tags.length,
            rootElement: tags[0] || null
        };
    }

    addNamespace(prefix, uri) {
        this.namespaces.set(prefix, uri);
    }

    removeNamespace(prefix) {
        return this.namespaces.delete(prefix);
    }
}

const processors = {
    json: new JSONProcessor(),
    xml: new XMLProcessor(),
    default: new DataProcessor()
};

function createAdvancedProcessor(options) {
    const { type, config, middleware = [] } = options;
    
    let processor;
    switch (type) {
        case 'json':
            processor = new JSONProcessor();
            break;
        case 'xml':
            processor = new XMLProcessor();
            break;
        default:
            processor = new DataProcessor(config);
    }

    middleware.forEach(mw => {
        if (typeof mw === 'function') {
            processor = mw(processor);
        }
    });

    return processor;
}

async function processWithRetry(processor, data, maxRetries = 3) {
    let attempts = 0;
    let lastError;

    while (attempts < maxRetries) {
        try {
            return await processor.processData(data);
        } catch (error) {
            lastError = error;
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
    }

    throw new Error(`Processing failed after ${maxRetries} attempts: ${lastError.message}`);
}

const asyncProcessor = async (data) => {
    const processor = createAdvancedProcessor({
        type: 'json',
        config: { maxCacheSize: 100 },
        middleware: [
            (proc) => {
                const originalProcess = proc.processData.bind(proc);
                proc.processData = async (input) => {
                    console.log('Processing:', input.id);
                    return originalProcess(input);
                };
                return proc;
            }
        ]
    });

    return processWithRetry(processor, data);
};

const complexArrowFunction = (param1, param2 = {}) => ({
    result: param1 + (param2.value || 0),
    timestamp: Date.now(),
    metadata: {
        type: typeof param1,
        hasParam2: !!param2.value
    }
});

const advancedAsyncArrow = async (config) => {
    const { timeout = 5000, retries = 3 } = config;
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            Math.random() > 0.5 ? resolve({ success: true }) : reject(new Error('Random failure'));
        }, timeout);
    });
};

const curriedFunction = (a) => (b) => (c) => a + b + c;

const destructuringFunction = ({ name, age, ...rest }) => {
    return {
        formattedName: name.toUpperCase(),
        isAdult: age >= 18,
        additionalInfo: rest
    };
};

const generatorFunction = function* (start, end) {
    for (let i = start; i <= end; i++) {
        yield i * 2;
    }
};

const asyncGeneratorFunction = async function* (urls) {
    for (const url of urls) {
        try {
            const response = await fetch(url);
            yield await response.json();
        } catch (error) {
            yield { error: error.message, url };
        }
    }
};

module.exports = {
    DataProcessor,
    JSONProcessor,
    XMLProcessor,
    processors,
    createAdvancedProcessor,
    processWithRetry,
    asyncProcessor,
    complexArrowFunction,
    advancedAsyncArrow,
    curriedFunction,
    destructuringFunction,
    generatorFunction,
    asyncGeneratorFunction
};
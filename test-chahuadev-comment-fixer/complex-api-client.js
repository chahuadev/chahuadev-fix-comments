const EventEmitter = require('events');

class CustomError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }

    static fromJSON(json) {
        const error = new CustomError(json.message, json.code, json.details);
        error.timestamp = json.timestamp;
        return error;
    }
}

class ValidationError extends CustomError {
    constructor(field, value, rule) {
        super(`Validation failed for field '${field}'`, 'VALIDATION_ERROR', {
            field,
            value,
            rule
        });
    }
}

class NetworkError extends CustomError {
    constructor(message, statusCode, response) {
        super(message, 'NETWORK_ERROR', {
            statusCode,
            response
        });
        this.statusCode = statusCode;
    }

    get isRetryable() {
        return this.statusCode >= 500 || this.statusCode === 429;
    }
}

class APIClient extends EventEmitter {
    #apiKey;
    #baseURL;
    #timeout;

    constructor(config) {
        super();
        this.#apiKey = config.apiKey;
        this.#baseURL = config.baseURL;
        this.#timeout = config.timeout || 30000;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.retryConfig = {
            attempts: 3,
            delay: 1000,
            backoff: 2
        };
    }

    addRequestInterceptor(interceptor) {
        if (typeof interceptor !== 'function') {
            throw new ValidationError('interceptor', interceptor, 'must be a function');
        }
        this.requestInterceptors.push(interceptor);
        return () => {
            const index = this.requestInterceptors.indexOf(interceptor);
            if (index > -1) {
                this.requestInterceptors.splice(index, 1);
            }
        };
    }

    addResponseInterceptor(interceptor) {
        if (typeof interceptor !== 'function') {
            throw new ValidationError('interceptor', interceptor, 'must be a function');
        }
        this.responseInterceptors.push(interceptor);
    }

    async request(method, endpoint, data = null, options = {}) {
        const config = {
            method: method.toUpperCase(),
            url: `${this.#baseURL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.#apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'APIClient/1.0',
                ...options.headers
            },
            timeout: options.timeout || this.#timeout,
            data
        };

        for (const interceptor of this.requestInterceptors) {
            await interceptor(config);
        }

        this.emit('request:start', { method, endpoint, config });

        try {
            const response = await this.performRequest(config);
            
            for (const interceptor of this.responseInterceptors) {
                await interceptor(response);
            }

            this.emit('request:success', { method, endpoint, response });
            return response;

        } catch (error) {
            this.emit('request:error', { method, endpoint, error });
            throw error;
        }
    }

    async performRequest(config) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.8) {
                    reject(new NetworkError('Request failed', 500, null));
                    return;
                }

                const mockResponse = {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'content-type': 'application/json'
                    },
                    data: {
                        success: true,
                        timestamp: Date.now(),
                        method: config.method,
                        url: config.url
                    }
                };

                resolve(mockResponse);
            }, Math.random() * 1000);
        });
    }

    async get(endpoint, options) {
        return this.request('GET', endpoint, null, options);
    }

    async post(endpoint, data, options) {
        return this.request('POST', endpoint, data, options);
    }

    async put(endpoint, data, options) {
        return this.request('PUT', endpoint, data, options);
    }

    async patch(endpoint, data, options) {
        return this.request('PATCH', endpoint, data, options);
    }

    async delete(endpoint, options) {
        return this.request('DELETE', endpoint, null, options);
    }

    withRetry(maxAttempts = this.retryConfig.attempts) {
        return {
            get: (endpoint, options) => this.retryRequest(() => this.get(endpoint, options), maxAttempts),
            post: (endpoint, data, options) => this.retryRequest(() => this.post(endpoint, data, options), maxAttempts),
            put: (endpoint, data, options) => this.retryRequest(() => this.put(endpoint, data, options), maxAttempts),
            patch: (endpoint, data, options) => this.retryRequest(() => this.patch(endpoint, data, options), maxAttempts),
            delete: (endpoint, options) => this.retryRequest(() => this.delete(endpoint, options), maxAttempts)
        };
    }

    async retryRequest(requestFn, maxAttempts) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxAttempts || (error instanceof NetworkError && !error.isRetryable)) {
                    break;
                }

                const delay = this.retryConfig.delay * Math.pow(this.retryConfig.backoff, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                this.emit('request:retry', { attempt, maxAttempts, delay, error });
            }
        }

        throw lastError;
    }

    static create(config) {
        return new APIClient(config);
    }

    [Symbol.for('debug')] () {
        return {
            baseURL: this.#baseURL,
            timeout: this.#timeout,
            hasApiKey: !!this.#apiKey,
            interceptors: {
                request: this.requestInterceptors.length,
                response: this.responseInterceptors.length
            }
        };
    }
}

const createAuthenticatedClient = (apiKey, baseURL) => {
    const client = new APIClient({ apiKey, baseURL });
    
    client.addRequestInterceptor(async (config) => {
        config.headers['X-Timestamp'] = Date.now().toString();
        config.headers['X-Request-ID'] = Math.random().toString(36).substr(2, 9);
    });

    client.addResponseInterceptor(async (response) => {
        if (response.status === 401) {
            throw new NetworkError('Authentication failed', 401, response);
        }
    });

    return client;
};

const withLogging = (client) => {
    const originalRequest = client.request.bind(client);
    
    client.request = async (method, endpoint, data, options) => {
        const startTime = Date.now();
        console.log(`[API] ${method} ${endpoint} - Starting`);
        
        try {
            const result = await originalRequest(method, endpoint, data, options);
            const duration = Date.now() - startTime;
            console.log(`[API] ${method} ${endpoint} - Success (${duration}ms)`);
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[API] ${method} ${endpoint} - Error (${duration}ms):`, error.message);
            throw error;
        }
    };

    return client;
};

const withRateLimit = (client, maxRequests = 10, windowMs = 60000) => {
    const requests = [];
    const originalRequest = client.request.bind(client);

    client.request = async (method, endpoint, data, options) => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        const recentRequests = requests.filter(time => time > windowStart);
        
        if (recentRequests.length >= maxRequests) {
            const oldestRequest = Math.min(...recentRequests);
            const waitTime = oldestRequest + windowMs - now;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        requests.push(now);
        if (requests.length > maxRequests * 2) {
            requests.splice(0, requests.length - maxRequests);
        }

        return originalRequest(method, endpoint, data, options);
    };

    return client;
};

async function* fetchPaginated(client, endpoint, pageSize = 50) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await client.get(endpoint, {
            params: { page, limit: pageSize }
        });

        yield response.data;

        hasMore = response.data.hasMore || response.data.data.length === pageSize;
        page++;
    }
}

const asyncPipeline = (...fns) => async (input) => {
    let result = input;
    for (const fn of fns) {
        result = await fn(result);
    }
    return result;
};

const memoizeAsync = (fn, ttl = 300000) => {
    const cache = new Map();
    
    return async (...args) => {
        const key = JSON.stringify(args);
        const cached = cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.value;
        }

        const result = await fn(...args);
        cache.set(key, { value: result, timestamp: Date.now() });
        
        if (cache.size > 100) {
            const entries = Array.from(cache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toDelete = entries.slice(0, 50);
            toDelete.forEach(([key]) => cache.delete(key));
        }

        return result;
    };
};

module.exports = {
    CustomError,
    ValidationError,
    NetworkError,
    APIClient,
    createAuthenticatedClient,
    withLogging,
    withRateLimit,
    fetchPaginated,
    asyncPipeline,
    memoizeAsync
};
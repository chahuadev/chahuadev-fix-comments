class DatabaseManager {
    constructor() {
        this.connections = new Map();
        this.queryCache = new Map();
        this.transactionPool = [];
        this.connectionPool = [];
        this.maxConnections = 10;
        this.queryTimeout = 30000;
        this.retryAttempts = 3;
    }

    async createConnection(config) {
        const connectionId = this.generateConnectionId();

        const connection = {
            id: connectionId,
            host: config.host || 'localhost',
            port: config.port || 3306,
            database: config.database,
            username: config.username,
            password: config.password,
            charset: config.charset || 'utf8mb4',
            timezone: config.timezone || 'UTC',
            ssl: config.ssl || false,
            status: 'connecting',
            createdAt: new Date(),
            lastUsed: new Date(),
            queryCount: 0,
            errorCount: 0
        };

        try {
            await this.establishConnection(connection);
            connection.status = 'connected';
            this.connections.set(connectionId, connection);
            this.connectionPool.push(connectionId);

            return connectionId;
        } catch (error) {
            connection.status = 'failed';
            connection.lastError = error.message;
            throw new Error(`Failed to establish database connection: ${error.message}`);
        }
    }

    async establishConnection(connection) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve(connection);
                } else {
                    reject(new Error('Connection timeout'));
                }
            }, Math.random() * 1000 + 500);
        });
    }

    generateConnectionId() {
        return 'conn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async executeQuery(connectionId, query, params = []) {
        const connection = this.connections.get(connectionId);

        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        if (connection.status !== 'connected') {
            throw new Error(`Connection ${connectionId} is not active`);
        }

        const queryId = this.generateQueryId();
        const startTime = Date.now();

        try {
            const result = await this.performQuery(connection, query, params, queryId);
            const executionTime = Date.now() - startTime;

            connection.queryCount++;
            connection.lastUsed = new Date();

            this.cacheResult(queryId, result, query, params);

            return {
                queryId,
                result,
                executionTime,
                affectedRows: result.affectedRows || 0,
                insertId: result.insertId || null
            };

        } catch (error) {
            connection.errorCount++;
            throw new Error(`Query execution failed: ${error.message}`);
        }
    }

    async performQuery(connection, query, params, queryId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Query timeout'));
            }, this.queryTimeout);

            setTimeout(() => {
                clearTimeout(timeout);

                const queryType = query.trim().split(' ')[0].toUpperCase();

                switch (queryType) {
                    case 'SELECT':
                        resolve(this.generateSelectResult(query, params));
                        break;
                    case 'INSERT':
                        resolve(this.generateInsertResult());
                        break;
                    case 'UPDATE':
                        resolve(this.generateUpdateResult());
                        break;
                    case 'DELETE':
                        resolve(this.generateDeleteResult());
                        break;
                    default:
                        resolve({ success: true, message: 'Query executed successfully' });
                }
            }, Math.random() * 500 + 100);
        });
    }

    generateSelectResult(query, params) {
        const mockData = [];
        const rowCount = Math.floor(Math.random() * 10) + 1;

        for (let i = 0; i < rowCount; i++) {
            mockData.push({
                id: i + 1,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                created_at: new Date(Date.now() - Math.random() * 31536000000),
                status: Math.random() > 0.5 ? 'active' : 'inactive',
                score: Math.floor(Math.random() * 100)
            });
        }

        return {
            rows: mockData,
            rowCount: mockData.length,
            fields: ['id', 'name', 'email', 'created_at', 'status', 'score']
        };
    }

    generateInsertResult() {
        return {
            affectedRows: 1,
            insertId: Math.floor(Math.random() * 10000) + 1,
            success: true
        };
    }

    generateUpdateResult() {
        return {
            affectedRows: Math.floor(Math.random() * 5) + 1,
            success: true
        };
    }

    generateDeleteResult() {
        return {
            affectedRows: Math.floor(Math.random() * 3) + 1,
            success: true
        };
    }

    generateQueryId() {
        return 'query_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    cacheResult(queryId, result, query, params) {
        const cacheKey = this.generateCacheKey(query, params);
        const cacheEntry = {
            queryId,
            result,
            query,
            params,
            timestamp: Date.now(),
            hitCount: 0
        };

        this.queryCache.set(cacheKey, cacheEntry);

        if (this.queryCache.size > 1000) {
            const oldestKey = Array.from(this.queryCache.keys())[0];
            this.queryCache.delete(oldestKey);
        }
    }

    generateCacheKey(query, params) {
        return btoa(query + JSON.stringify(params)).replace(/[^a-zA-Z0-9]/g, '');
    }

    getCachedResult(query, params) {
        const cacheKey = this.generateCacheKey(query, params);
        const cacheEntry = this.queryCache.get(cacheKey);

        if (cacheEntry) {
            const age = Date.now() - cacheEntry.timestamp;
            if (age < 300000) {
                cacheEntry.hitCount++;
                return cacheEntry.result;
            } else {
                this.queryCache.delete(cacheKey);
            }
        }

        return null;
    }

    async beginTransaction(connectionId) {
        const connection = this.connections.get(connectionId);

        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        const transactionId = this.generateTransactionId();
        const transaction = {
            id: transactionId,
            connectionId,
            status: 'active',
            queries: [],
            startTime: Date.now(),
            rollbackPoint: null
        };

        this.transactionPool.push(transaction);

        return transactionId;
    }

    async commitTransaction(transactionId) {
        const transaction = this.findTransaction(transactionId);

        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found`);
        }

        if (transaction.status !== 'active') {
            throw new Error(`Transaction ${transactionId} is not active`);
        }

        try {
            for (const query of transaction.queries) {
                await this.executeQuery(transaction.connectionId, query.sql, query.params);
            }

            transaction.status = 'committed';
            transaction.endTime = Date.now();

            return {
                transactionId,
                status: 'committed',
                queriesExecuted: transaction.queries.length,
                duration: transaction.endTime - transaction.startTime
            };

        } catch (error) {
            transaction.status = 'failed';
            transaction.error = error.message;
            throw new Error(`Transaction commit failed: ${error.message}`);
        }
    }

    async rollbackTransaction(transactionId) {
        const transaction = this.findTransaction(transactionId);

        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found`);
        }

        transaction.status = 'rolled_back';
        transaction.endTime = Date.now();

        return {
            transactionId,
            status: 'rolled_back',
            duration: transaction.endTime - transaction.startTime
        };
    }

    addQueryToTransaction(transactionId, sql, params = []) {
        const transaction = this.findTransaction(transactionId);

        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found`);
        }

        if (transaction.status !== 'active') {
            throw new Error(`Transaction ${transactionId} is not active`);
        }

        transaction.queries.push({
            sql,
            params,
            timestamp: Date.now()
        });
    }

    findTransaction(transactionId) {
        return this.transactionPool.find(t => t.id === transactionId);
    }

    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    }

    async closeConnection(connectionId) {
        const connection = this.connections.get(connectionId);

        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        connection.status = 'closed';
        connection.closedAt = new Date();

        this.connections.delete(connectionId);
        this.connectionPool = this.connectionPool.filter(id => id !== connectionId);

        const activeTransactions = this.transactionPool.filter(t => t.connectionId === connectionId && t.status === 'active');
        for (const transaction of activeTransactions) {
            await this.rollbackTransaction(transaction.id);
        }

        return {
            connectionId,
            status: 'closed',
            totalQueries: connection.queryCount,
            totalErrors: connection.errorCount,
            lifetime: connection.closedAt - connection.createdAt
        };
    }

    getConnectionStats(connectionId) {
        const connection = this.connections.get(connectionId);

        if (!connection) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        return {
            id: connection.id,
            status: connection.status,
            host: connection.host,
            database: connection.database,
            queryCount: connection.queryCount,
            errorCount: connection.errorCount,
            createdAt: connection.createdAt,
            lastUsed: connection.lastUsed,
            uptime: Date.now() - connection.createdAt.getTime()
        };
    }

    getAllConnections() {
        return Array.from(this.connections.values()).map(conn => ({
            id: conn.id,
            host: conn.host,
            database: conn.database,
            status: conn.status,
            queryCount: conn.queryCount,
            errorCount: conn.errorCount
        }));
    }

    getCacheStats() {
        const stats = {
            totalEntries: this.queryCache.size,
            totalHits: 0,
            averageAge: 0,
            oldestEntry: null,
            newestEntry: null
        };

        if (this.queryCache.size > 0) {
            const entries = Array.from(this.queryCache.values());
            const now = Date.now();

            stats.totalHits = entries.reduce((sum, entry) => sum + entry.hitCount, 0);
            stats.averageAge = entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length;

            const timestamps = entries.map(entry => entry.timestamp);
            stats.oldestEntry = Math.min(...timestamps);
            stats.newestEntry = Math.max(...timestamps);
        }

        return stats;
    }

    clearCache() {
        const clearedEntries = this.queryCache.size;
        this.queryCache.clear();
        return { clearedEntries };
    }

    async healthCheck() {
        const activeConnections = Array.from(this.connections.values()).filter(conn => conn.status === 'connected');
        const failedConnections = Array.from(this.connections.values()).filter(conn => conn.status === 'failed');
        const activeTransactions = this.transactionPool.filter(t => t.status === 'active');

        return {
            timestamp: new Date().toISOString(),
            totalConnections: this.connections.size,
            activeConnections: activeConnections.length,
            failedConnections: failedConnections.length,
            activeTransactions: activeTransactions.length,
            cacheSize: this.queryCache.size,
            poolUtilization: (this.connectionPool.length / this.maxConnections) * 100,
            status: activeConnections.length > 0 ? 'healthy' : 'degraded'
        };
    }
}

async function runDatabaseDemo() {
    const dbManager = new DatabaseManager();

    try {
        console.log('Database Manager Demo');
        console.log('====================');

        const connectionConfig = {
            host: 'localhost',
            port: 3306,
            database: 'test_db',
            username: 'testuser',
            password: 'testpass'
        };

        console.log('Creating database connection...');
        const connectionId = await dbManager.createConnection(connectionConfig);
        console.log('Connection created:', connectionId);

        console.log('\nExecuting SELECT query...');
        const selectResult = await dbManager.executeQuery(connectionId, 'SELECT * FROM users WHERE status = ?', ['active']);
        console.log('Query result:', selectResult);

        console.log('\nExecuting INSERT query...');
        const insertResult = await dbManager.executeQuery(connectionId, 'INSERT INTO users (name, email) VALUES (?, ?)', ['John Doe', 'john@example.com']);
        console.log('Insert result:', insertResult);

        console.log('\nStarting transaction...');
        const transactionId = await dbManager.beginTransaction(connectionId);
        console.log('Transaction started:', transactionId);

        dbManager.addQueryToTransaction(transactionId, 'UPDATE users SET status = ? WHERE id = ?', ['inactive', 1]);
        dbManager.addQueryToTransaction(transactionId, 'INSERT INTO audit_log (action, user_id) VALUES (?, ?)', ['deactivate', 1]);

        console.log('\nCommitting transaction...');
        const commitResult = await dbManager.commitTransaction(transactionId);
        console.log('Transaction committed:', commitResult);

        console.log('\nConnection stats:');
        const stats = dbManager.getConnectionStats(connectionId);
        console.log(stats);

        console.log('\nHealth check:');
        const health = await dbManager.healthCheck();
        console.log(health);

        console.log('\nClosing connection...');
        const closeResult = await dbManager.closeConnection(connectionId);
        console.log('Connection closed:', closeResult);

    } catch (error) {
        console.error('Demo error:', error.message);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
} else {
    runDatabaseDemo();
}
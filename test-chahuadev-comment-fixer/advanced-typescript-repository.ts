interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    timeout?: number;
    retryAttempts?: number;
}

interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    fields: string[];
    executionTime: number;
    queryId: string;
}

interface TransactionOptions {
    isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
    timeout?: number;
    readOnly?: boolean;
}

interface PaginationOptions {
    page: number;
    limit: number;
    offset?: number;
}

interface SortOptions {
    field: string;
    direction: 'ASC' | 'DESC';
}

interface FilterOptions {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'notin';
    value: any;
}

type ValidationRule = {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
};

type ValidationSchema = {
    [key: string]: ValidationRule;
};

type EventListener<T = any> = (data: T) => void | Promise<void>;

type CacheStrategy = 'memory' | 'redis' | 'file' | 'none';

abstract class BaseRepository<T, K = string | number> {
    protected abstract tableName: string;
    protected abstract primaryKey: string;
    protected connection: DatabaseConnection;
    protected cache: Map<K, T>;
    protected cacheStrategy: CacheStrategy;
    protected cacheTTL: number;

    constructor(connection: DatabaseConnection, cacheStrategy: CacheStrategy = 'memory', cacheTTL: number = 300000) {
        this.connection = connection;
        this.cache = new Map();
        this.cacheStrategy = cacheStrategy;
        this.cacheTTL = cacheTTL;
    }

    abstract validate(data: Partial<T>): Promise<ValidationResult>;
    abstract serialize(data: T): Record<string, any>;
    abstract deserialize(data: Record<string, any>): T;

    async findById(id: K): Promise<T | null> {
        const cacheKey = `${this.tableName}:${id}`;

        if (this.cacheStrategy !== 'none' && this.cache.has(id)) {
            return this.cache.get(id) || null;
        }

        const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
        const result = await this.connection.query<T>(query, [id]);

        if (result.rows.length > 0) {
            const entity = this.deserialize(result.rows[0] as any);
            this.setCacheItem(id, entity);
            return entity;
        }

        return null;
    }

    async findMany(options: {
        filters?: FilterOptions[];
        sort?: SortOptions[];
        pagination?: PaginationOptions;
    } = {}): Promise<QueryResult<T>> {
        let query = `SELECT * FROM ${this.tableName}`;
        const params: any[] = [];
        let paramIndex = 1;

        if (options.filters && options.filters.length > 0) {
            const whereConditions = options.filters.map(filter => {
                const paramPlaceholder = `$${paramIndex++}`;
                params.push(filter.value);

                switch (filter.operator) {
                    case 'eq': return `${filter.field} = ${paramPlaceholder}`;
                    case 'neq': return `${filter.field} <> ${paramPlaceholder}`;
                    case 'gt': return `${filter.field} > ${paramPlaceholder}`;
                    case 'gte': return `${filter.field} >= ${paramPlaceholder}`;
                    case 'lt': return `${filter.field} < ${paramPlaceholder}`;
                    case 'lte': return `${filter.field} <= ${paramPlaceholder}`;
                    case 'like': return `${filter.field} LIKE ${paramPlaceholder}`;
                    case 'in': return `${filter.field} = ANY(${paramPlaceholder})`;
                    case 'notin': return `${filter.field} <> ALL(${paramPlaceholder})`;
                    default: return `${filter.field} = ${paramPlaceholder}`;
                }
            });

            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        if (options.sort && options.sort.length > 0) {
            const orderBy = options.sort
                .map(sort => `${sort.field} ${sort.direction}`)
                .join(', ');
            query += ` ORDER BY ${orderBy}`;
        }

        if (options.pagination) {
            query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
            params.push(options.pagination.limit, options.pagination.offset || 0);
        }

        const result = await this.connection.query<T>(query, params);

        return {
            rows: result.rows.map(row => this.deserialize(row as any)),
            rowCount: result.rowCount,
            fields: result.fields,
            executionTime: result.executionTime,
            queryId: result.queryId
        };
    }

    async create(data: Omit<T, keyof { id: any; createdAt: any; updatedAt: any }>): Promise<T> {
        const validation = await this.validate(data as Partial<T>);
        if (!validation.isValid) {
            throw new ValidationError('Validation failed', validation.errors);
        }

        const serializedData = this.serialize(data as T);
        const fields = Object.keys(serializedData);
        const values = Object.values(serializedData);
        const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');

        const query = `
            INSERT INTO ${this.tableName} (${fields.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;

        const result = await this.connection.query<T>(query, values);
        const createdEntity = this.deserialize(result.rows[0] as any);

        this.setCacheItem(createdEntity[this.primaryKey as keyof T] as K, createdEntity);
        this.emit('created', createdEntity);

        return createdEntity;
    }

    async update(id: K, data: Partial<T>): Promise<T | null> {
        const validation = await this.validate(data);
        if (!validation.isValid) {
            throw new ValidationError('Validation failed', validation.errors);
        }

        const serializedData = this.serialize(data as T);
        const fields = Object.keys(serializedData);
        const values = Object.values(serializedData);

        const setClause = fields
            .map((field, index) => `${field} = $${index + 2}`)
            .join(', ');

        const query = `
            UPDATE ${this.tableName} 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
            WHERE ${this.primaryKey} = $1 
            RETURNING *
        `;

        const result = await this.connection.query<T>(query, [id, ...values]);

        if (result.rows.length > 0) {
            const updatedEntity = this.deserialize(result.rows[0] as any);
            this.setCacheItem(id, updatedEntity);
            this.emit('updated', updatedEntity);
            return updatedEntity;
        }

        return null;
    }

    async delete(id: K): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
        const result = await this.connection.query(query, [id]);

        if (result.rowCount > 0) {
            this.cache.delete(id);
            this.emit('deleted', { id });
            return true;
        }

        return false;
    }

    async exists(id: K): Promise<boolean> {
        const query = `SELECT 1 FROM ${this.tableName} WHERE ${this.primaryKey} = $1 LIMIT 1`;
        const result = await this.connection.query(query, [id]);
        return result.rowCount > 0;
    }

    async count(filters?: FilterOptions[]): Promise<number> {
        let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        const params: any[] = [];

        if (filters && filters.length > 0) {
            const whereConditions = filters.map((filter, index) => {
                params.push(filter.value);
                return `${filter.field} ${this.getOperatorSQL(filter.operator)} $${index + 1}`;
            });

            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        const result = await this.connection.query(query, params);
        return parseInt(result.rows[0].count);
    }

    protected setCacheItem(key: K, value: T): void {
        if (this.cacheStrategy === 'memory') {
            this.cache.set(key, value);
            setTimeout(() => {
                this.cache.delete(key);
            }, this.cacheTTL);
        }
    }

    protected getOperatorSQL(operator: FilterOptions['operator']): string {
        const operatorMap = {
            'eq': '=',
            'neq': '<>',
            'gt': '>',
            'gte': '>=',
            'lt': '<',
            'lte': '<=',
            'like': 'LIKE',
            'in': '= ANY',
            'notin': '<> ALL'
        };

        return operatorMap[operator] || '=';
    }

    private eventListeners: Map<string, EventListener[]> = new Map();

    protected emit(event: string, data: any): void {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    on(event: string, listener: EventListener): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(listener);
    }

    off(event: string, listener: EventListener): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
}

class DatabaseConnection {
    private config: DatabaseConfig;
    private isConnected: boolean = false;
    private queryCount: number = 0;
    private connectionPool: any[] = [];
    private maxConnections: number = 10;
    private currentConnections: number = 0;
    private queryTimeout: number = 30000;
    private retryAttempts: number = 3;

    constructor(config: DatabaseConfig) {
        this.config = {
            timeout: 30000,
            retryAttempts: 3,
            ssl: false,
            ...config
        };
        this.queryTimeout = this.config.timeout!;
        this.retryAttempts = this.config.retryAttempts!;
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            return;
        }

        try {
            await this.establishConnection();
            this.isConnected = true;
            console.log(`Connected to database: ${this.config.database}`);
        } catch (error) {
            console.error('Database connection failed:', error);
            throw new ConnectionError('Failed to connect to database');
        }
    }

    async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
        if (!this.isConnected) {
            throw new ConnectionError('Database not connected');
        }

        const startTime = Date.now();
        const queryId = this.generateQueryId();
        this.queryCount++;

        try {
            const result = await this.executeQuery<T>(sql, params);
            const executionTime = Date.now() - startTime;

            return {
                ...result,
                executionTime,
                queryId
            };
        } catch (error) {
            console.error(`Query failed [${queryId}]:`, error);
            throw new QueryError(`Query execution failed: ${error}`);
        }
    }

    async transaction<T>(
        callback: (connection: DatabaseConnection) => Promise<T>,
        options: TransactionOptions = {}
    ): Promise<T> {
        const transactionConnection = new DatabaseConnection(this.config);
        await transactionConnection.connect();

        try {
            await transactionConnection.beginTransaction(options);
            const result = await callback(transactionConnection);
            await transactionConnection.commit();
            return result;
        } catch (error) {
            await transactionConnection.rollback();
            throw error;
        } finally {
            await transactionConnection.disconnect();
        }
    }

    async beginTransaction(options: TransactionOptions = {}): Promise<void> {
        let sql = 'BEGIN';

        if (options.isolationLevel) {
            sql += ` ISOLATION LEVEL ${options.isolationLevel}`;
        }

        if (options.readOnly) {
            sql += ' READ ONLY';
        }

        await this.query(sql);
    }

    async commit(): Promise<void> {
        await this.query('COMMIT');
    }

    async rollback(): Promise<void> {
        await this.query('ROLLBACK');
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            this.isConnected = false;
            this.currentConnections = 0;
            console.log('Database disconnected');
        }
    }

    getStats(): ConnectionStats {
        return {
            isConnected: this.isConnected,
            queryCount: this.queryCount,
            currentConnections: this.currentConnections,
            maxConnections: this.maxConnections,
            config: {
                host: this.config.host,
                port: this.config.port,
                database: this.config.database,
                ssl: this.config.ssl || false
            }
        };
    }

    private async establishConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Connection timeout'));
                }
            }, Math.random() * 1000 + 500);
        });
    }

    private async executeQuery<T>(sql: string, params: any[]): Promise<Omit<QueryResult<T>, 'executionTime' | 'queryId'>> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Query timeout'));
            }, this.queryTimeout);

            setTimeout(() => {
                clearTimeout(timeout);

                const mockResult: Omit<QueryResult<T>, 'executionTime' | 'queryId'> = {
                    rows: this.generateMockRows<T>(sql),
                    rowCount: Math.floor(Math.random() * 10) + 1,
                    fields: ['id', 'name', 'email', 'created_at', 'updated_at']
                };

                resolve(mockResult);
            }, Math.random() * 100 + 50);
        });
    }

    private generateMockRows<T>(sql: string): T[] {
        const rowCount = Math.floor(Math.random() * 5) + 1;
        const rows: any[] = [];

        for (let i = 0; i < rowCount; i++) {
            rows.push({
                id: i + 1,
                name: `Record ${i + 1}`,
                email: `record${i + 1}@example.com`,
                created_at: new Date(Date.now() - Math.random() * 31536000000),
                updated_at: new Date()
            });
        }

        return rows as T[];
    }

    private generateQueryId(): string {
        return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

interface ConnectionStats {
    isConnected: boolean;
    queryCount: number;
    currentConnections: number;
    maxConnections: number;
    config: {
        host: string;
        port: number;
        database: string;
        ssl: boolean;
    };
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

class ValidationError extends Error {
    public errors: string[];

    constructor(message: string, errors: string[] = []) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

class ConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConnectionError';
    }
}

class QueryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QueryError';
    }
}

class Validator {
    static validate(data: any, schema: ValidationSchema): ValidationResult {
        const errors: string[] = [];

        for (const [field, rule] of Object.entries(schema)) {
            const value = data[field];

            if (rule.required && (value === undefined || value === null)) {
                errors.push(`Field '${field}' is required`);
                continue;
            }

            if (value !== undefined && value !== null) {
                if (rule.type && typeof value !== rule.type) {
                    errors.push(`Field '${field}' must be of type ${rule.type}`);
                }

                if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
                    errors.push(`Field '${field}' must be at least ${rule.minLength} characters long`);
                }

                if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
                    errors.push(`Field '${field}' must be no more than ${rule.maxLength} characters long`);
                }

                if (rule.min && typeof value === 'number' && value < rule.min) {
                    errors.push(`Field '${field}' must be at least ${rule.min}`);
                }

                if (rule.max && typeof value === 'number' && value > rule.max) {
                    errors.push(`Field '${field}' must be no more than ${rule.max}`);
                }

                if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
                    errors.push(`Field '${field}' does not match the required pattern`);
                }

                if (rule.custom) {
                    const customResult = rule.custom(value);
                    if (typeof customResult === 'string') {
                        errors.push(customResult);
                    } else if (!customResult) {
                        errors.push(`Field '${field}' failed custom validation`);
                    }
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

class UserRepository extends BaseRepository<User, number> {
    protected tableName = 'users';
    protected primaryKey = 'id';

    async validate(data: Partial<User>): Promise<ValidationResult> {
        const schema: ValidationSchema = {
            username: {
                required: true,
                type: 'string',
                minLength: 3,
                maxLength: 50,
                pattern: /^[a-zA-Z0-9_]+$/
            },
            email: {
                required: true,
                type: 'string',
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            password: {
                required: true,
                type: 'string',
                minLength: 8,
                custom: (value) => {
                    const hasUpperCase = /[A-Z]/.test(value);
                    const hasLowerCase = /[a-z]/.test(value);
                    const hasNumbers = /\d/.test(value);
                    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
                    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
                    if (!hasNumbers) return 'Password must contain at least one number';
                    if (!hasSpecialChar) return 'Password must contain at least one special character';

                    return true;
                }
            },
            age: {
                type: 'number',
                min: 13,
                max: 120
            }
        };

        return Validator.validate(data, schema);
    }

    serialize(user: User): Record<string, any> {
        return {
            username: user.username,
            email: user.email,
            password: user.password,
            age: user.age,
            isActive: user.isActive,
            role: user.role
        };
    }

    deserialize(data: Record<string, any>): User {
        return {
            id: data.id,
            username: data.username,
            email: data.email,
            password: data.password,
            age: data.age,
            isActive: data.isActive || true,
            role: data.role || 'user',
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.findMany({
            filters: [{ field: 'email', operator: 'eq', value: email }]
        });

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const result = await this.findMany({
            filters: [{ field: 'username', operator: 'eq', value: username }]
        });

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findActiveUsers(): Promise<User[]> {
        const result = await this.findMany({
            filters: [{ field: 'isActive', operator: 'eq', value: true }],
            sort: [{ field: 'username', direction: 'ASC' }]
        });

        return result.rows;
    }

    async updateLastLogin(id: number): Promise<void> {
        const query = `UPDATE ${this.tableName} SET last_login = CURRENT_TIMESTAMP WHERE id = $1`;
        await this.connection.query(query, [id]);
        this.cache.delete(id);
    }
}

interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    age?: number;
    isActive: boolean;
    role: 'admin' | 'moderator' | 'user';
    createdAt: Date;
    updatedAt: Date;
}

async function demonstrateTypeScriptRepository(): Promise<void> {
    console.log('TypeScript Repository Pattern Demonstration');
    console.log('==========================================');

    const dbConfig: DatabaseConfig = {
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        username: 'postgres',
        password: 'password',
        ssl: true,
        timeout: 30000,
        retryAttempts: 3
    };

    const connection = new DatabaseConnection(dbConfig);

    try {
        await connection.connect();
        console.log('Database connected successfully');

        const userRepo = new UserRepository(connection, 'memory', 300000);

        userRepo.on('created', (user: User) => {
            console.log(`User created: ${user.username} (${user.email})`);
        });

        userRepo.on('updated', (user: User) => {
            console.log(`User updated: ${user.username}`);
        });

        userRepo.on('deleted', (data: { id: number }) => {
            console.log(`User deleted: ID ${data.id}`);
        });

        console.log('\n1. Creating new user...');
        const newUser = await userRepo.create({
            username: 'john_doe',
            email: 'john@example.com',
            password: 'SecurePass123!',
            age: 25,
            isActive: true,
            role: 'user'
        });
        console.log('Created user:', newUser.username);

        console.log('\n2. Finding user by email...');
        const foundUser = await userRepo.findByEmail('john@example.com');
        console.log('Found user:', foundUser?.username || 'Not found');

        console.log('\n3. Updating user...');
        if (foundUser) {
            const updatedUser = await userRepo.update(foundUser.id, {
                age: 26
            });
            console.log('Updated user age:', updatedUser?.age);
        }

        console.log('\n4. Finding active users...');
        const activeUsers = await userRepo.findActiveUsers();
        console.log(`Found ${activeUsers.length} active users`);

        console.log('\n5. Transaction example...');
        await connection.transaction(async (txConnection) => {
            const txUserRepo = new UserRepository(txConnection);

            await txUserRepo.create({
                username: 'jane_doe',
                email: 'jane@example.com',
                password: 'AnotherPass456!',
                age: 23,
                isActive: true,
                role: 'user'
            });

            await txUserRepo.create({
                username: 'admin_user',
                email: 'admin@example.com',
                password: 'AdminPass789!',
                age: 30,
                isActive: true,
                role: 'admin'
            });

            console.log('Transaction completed successfully');
        });

        console.log('\n6. Database statistics...');
        const stats = connection.getStats();
        console.log('Connection stats:', stats);

        console.log('\n7. User count...');
        const userCount = await userRepo.count();
        console.log(`Total users: ${userCount}`);

        console.log('\n8. Paginated results...');
        const paginatedUsers = await userRepo.findMany({
            pagination: { page: 1, limit: 2 },
            sort: [{ field: 'createdAt', direction: 'DESC' }]
        });
        console.log(`Page 1 results: ${paginatedUsers.rows.length} users`);

    } catch (error) {
        if (error instanceof ValidationError) {
            console.error('Validation failed:', error.errors);
        } else if (error instanceof ConnectionError) {
            console.error('Connection error:', error.message);
        } else if (error instanceof QueryError) {
            console.error('Query error:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    } finally {
        await connection.disconnect();
        console.log('\nDemo completed and connection closed');
    }
}

if (require.main === module) {
    demonstrateTypeScriptRepository().catch(console.error);
}

export {
    DatabaseConnection,
    BaseRepository,
    UserRepository,
    Validator,
    ValidationError,
    ConnectionError,
    QueryError
};

export type {
    DatabaseConfig,
    QueryResult,
    TransactionOptions,
    PaginationOptions,
    SortOptions,
    FilterOptions,
    ValidationRule,
    ValidationSchema,
    ValidationResult,
    User,
    EventListener,
    CacheStrategy,
    ConnectionStats
};
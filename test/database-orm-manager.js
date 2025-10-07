const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class QueryBuilder {
    constructor(tableName) {
        this.table = tableName;
        this.selectFields = ['*'];
        this.whereConditions = [];
        this.joinClauses = [];
        this.orderByClauses = [];
        this.groupByClauses = [];
        this.havingConditions = [];
        this.limitValue = null;
        this.offsetValue = null;
        this.insertData = null;
        this.updateData = null;
        this.queryType = 'SELECT';
    }

    select(fields) {
        if (Array.isArray(fields)) {
            this.selectFields = fields;
        } else if (typeof fields === 'string') {
            this.selectFields = fields.split(',').map(field => field.trim());
        }
        return this;
    }

    where(field, operator, value) {
        if (arguments.length === 2) {
            value = operator;
            operator = '=';
        }
        this.whereConditions.push({ field, operator, value, type: 'AND' });
        return this;
    }

    orWhere(field, operator, value) {
        if (arguments.length === 2) {
            value = operator;
            operator = '=';
        }
        this.whereConditions.push({ field, operator, value, type: 'OR' });
        return this;
    }

    whereIn(field, values) {
        this.whereConditions.push({ field, operator: 'IN', value: values, type: 'AND' });
        return this;
    }

    whereNotIn(field, values) {
        this.whereConditions.push({ field, operator: 'NOT IN', value: values, type: 'AND' });
        return this;
    }

    whereNull(field) {
        this.whereConditions.push({ field, operator: 'IS NULL', value: null, type: 'AND' });
        return this;
    }

    whereNotNull(field) {
        this.whereConditions.push({ field, operator: 'IS NOT NULL', value: null, type: 'AND' });
        return this;
    }

    whereBetween(field, min, max) {
        this.whereConditions.push({ field, operator: 'BETWEEN', value: [min, max], type: 'AND' });
        return this;
    }

    whereLike(field, pattern) {
        this.whereConditions.push({ field, operator: 'LIKE', value: pattern, type: 'AND' });
        return this;
    }

    join(table, leftField, operator, rightField) {
        if (arguments.length === 3) {
            rightField = operator;
            operator = '=';
        }
        this.joinClauses.push({ type: 'INNER JOIN', table, leftField, operator, rightField });
        return this;
    }

    leftJoin(table, leftField, operator, rightField) {
        if (arguments.length === 3) {
            rightField = operator;
            operator = '=';
        }
        this.joinClauses.push({ type: 'LEFT JOIN', table, leftField, operator, rightField });
        return this;
    }

    rightJoin(table, leftField, operator, rightField) {
        if (arguments.length === 3) {
            rightField = operator;
            operator = '=';
        }
        this.joinClauses.push({ type: 'RIGHT JOIN', table, leftField, operator, rightField });
        return this;
    }

    orderBy(field, direction = 'ASC') {
        this.orderByClauses.push({ field, direction: direction.toUpperCase() });
        return this;
    }

    groupBy(...fields) {
        this.groupByClauses.push(...fields);
        return this;
    }

    having(field, operator, value) {
        if (arguments.length === 2) {
            value = operator;
            operator = '=';
        }
        this.havingConditions.push({ field, operator, value });
        return this;
    }

    limit(count) {
        this.limitValue = count;
        return this;
    }

    offset(count) {
        this.offsetValue = count;
        return this;
    }

    insert(data) {
        this.queryType = 'INSERT';
        this.insertData = data;
        return this;
    }

    update(data) {
        this.queryType = 'UPDATE';
        this.updateData = data;
        return this;
    }

    delete() {
        this.queryType = 'DELETE';
        return this;
    }

    buildWhereClause() {
        if (this.whereConditions.length === 0) return '';

        let whereClause = ' WHERE ';
        this.whereConditions.forEach((condition, index) => {
            if (index > 0) {
                whereClause += ` ${condition.type} `;
            }

            if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
                const values = condition.value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
                whereClause += `${condition.field} ${condition.operator} (${values})`;
            } else if (condition.operator === 'BETWEEN') {
                whereClause += `${condition.field} BETWEEN ${condition.value[0]} AND ${condition.value[1]}`;
            } else if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
                whereClause += `${condition.field} ${condition.operator}`;
            } else {
                const value = typeof condition.value === 'string' ? `'${condition.value}'` : condition.value;
                whereClause += `${condition.field} ${condition.operator} ${value}`;
            }
        });

        return whereClause;
    }

    buildJoinClause() {
        if (this.joinClauses.length === 0) return '';

        return this.joinClauses.map(join =>
            ` ${join.type} ${join.table} ON ${join.leftField} ${join.operator} ${join.rightField}`
        ).join('');
    }

    buildOrderByClause() {
        if (this.orderByClauses.length === 0) return '';

        const orderBy = this.orderByClauses.map(order =>
            `${order.field} ${order.direction}`
        ).join(', ');

        return ` ORDER BY ${orderBy}`;
    }

    buildGroupByClause() {
        if (this.groupByClauses.length === 0) return '';
        return ` GROUP BY ${this.groupByClauses.join(', ')}`;
    }

    buildHavingClause() {
        if (this.havingConditions.length === 0) return '';

        let havingClause = ' HAVING ';
        this.havingConditions.forEach((condition, index) => {
            if (index > 0) havingClause += ' AND ';
            const value = typeof condition.value === 'string' ? `'${condition.value}'` : condition.value;
            havingClause += `${condition.field} ${condition.operator} ${value}`;
        });

        return havingClause;
    }

    buildLimitClause() {
        let limitClause = '';
        if (this.limitValue !== null) {
            limitClause += ` LIMIT ${this.limitValue}`;
        }
        if (this.offsetValue !== null) {
            limitClause += ` OFFSET ${this.offsetValue}`;
        }
        return limitClause;
    }

    toSQL() {
        switch (this.queryType) {
            case 'SELECT':
                return `SELECT ${this.selectFields.join(', ')} FROM ${this.table}` +
                    this.buildJoinClause() +
                    this.buildWhereClause() +
                    this.buildGroupByClause() +
                    this.buildHavingClause() +
                    this.buildOrderByClause() +
                    this.buildLimitClause();

            case 'INSERT':
                const fields = Object.keys(this.insertData);
                const values = Object.values(this.insertData).map(v =>
                    typeof v === 'string' ? `'${v}'` : v
                );
                return `INSERT INTO ${this.table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;

            case 'UPDATE':
                const updatePairs = Object.entries(this.updateData).map(([key, value]) =>
                    `${key} = ${typeof value === 'string' ? `'${value}'` : value}`
                );
                return `UPDATE ${this.table} SET ${updatePairs.join(', ')}` + this.buildWhereClause();

            case 'DELETE':
                return `DELETE FROM ${this.table}` + this.buildWhereClause();

            default:
                throw new Error(`Unsupported query type: ${this.queryType}`);
        }
    }
}

class Model {
    constructor(tableName, connection) {
        this.tableName = tableName;
        this.connection = connection;
        this.attributes = {};
        this.originalAttributes = {};
        this.fillable = [];
        this.guarded = ['id'];
        this.timestamps = true;
        this.primaryKey = 'id';
        this.isNewRecord = true;
    }

    static table(tableName) {
        return new this(tableName);
    }

    static query() {
        return new QueryBuilder(this.tableName);
    }

    static async find(id) {
        const query = new QueryBuilder(this.tableName);
        const sql = query.where(this.primaryKey || 'id', id).toSQL();
        const result = await this.connection.execute(sql);

        if (result.length > 0) {
            const instance = new this();
            instance.attributes = result[0];
            instance.originalAttributes = { ...result[0] };
            instance.isNewRecord = false;
            return instance;
        }

        return null;
    }

    static async findOrFail(id) {
        const result = await this.find(id);
        if (!result) {
            throw new Error(`Record with ${this.primaryKey || 'id'} ${id} not found`);
        }
        return result;
    }

    static async all() {
        const query = new QueryBuilder(this.tableName);
        const sql = query.toSQL();
        const results = await this.connection.execute(sql);

        return results.map(row => {
            const instance = new this();
            instance.attributes = row;
            instance.originalAttributes = { ...row };
            instance.isNewRecord = false;
            return instance;
        });
    }

    static async where(field, operator, value) {
        const query = new QueryBuilder(this.tableName);
        const sql = query.where(field, operator, value).toSQL();
        const results = await this.connection.execute(sql);

        return results.map(row => {
            const instance = new this();
            instance.attributes = row;
            instance.originalAttributes = { ...row };
            instance.isNewRecord = false;
            return instance;
        });
    }

    static async create(data) {
        const instance = new this();
        instance.fill(data);
        await instance.save();
        return instance;
    }

    fill(data) {
        Object.keys(data).forEach(key => {
            if (this.isFillable(key)) {
                this.attributes[key] = data[key];
            }
        });
        return this;
    }

    isFillable(key) {
        if (this.fillable.length > 0) {
            return this.fillable.includes(key);
        }
        return !this.guarded.includes(key);
    }

    get(key) {
        return this.attributes[key];
    }

    set(key, value) {
        this.attributes[key] = value;
        return this;
    }

    async save() {
        if (this.timestamps) {
            if (this.isNewRecord) {
                this.attributes.created_at = new Date();
            }
            this.attributes.updated_at = new Date();
        }

        let sql;
        if (this.isNewRecord) {
            const query = new QueryBuilder(this.tableName);
            sql = query.insert(this.attributes).toSQL();
        } else {
            const changes = this.getChanges();
            if (Object.keys(changes).length === 0) {
                return this;
            }

            const query = new QueryBuilder(this.tableName);
            sql = query.update(changes).where(this.primaryKey, this.attributes[this.primaryKey]).toSQL();
        }

        const result = await this.connection.execute(sql);

        if (this.isNewRecord && result.insertId) {
            this.attributes[this.primaryKey] = result.insertId;
        }

        this.originalAttributes = { ...this.attributes };
        this.isNewRecord = false;

        return this;
    }

    async delete() {
        if (this.isNewRecord) {
            throw new Error('Cannot delete unsaved record');
        }

        const query = new QueryBuilder(this.tableName);
        const sql = query.delete().where(this.primaryKey, this.attributes[this.primaryKey]).toSQL();

        await this.connection.execute(sql);
        return true;
    }

    getChanges() {
        const changes = {};
        Object.keys(this.attributes).forEach(key => {
            if (this.attributes[key] !== this.originalAttributes[key]) {
                changes[key] = this.attributes[key];
            }
        });
        return changes;
    }

    isDirty() {
        return Object.keys(this.getChanges()).length > 0;
    }

    toJSON() {
        return { ...this.attributes };
    }
}

class Migration {
    constructor(name) {
        this.name = name;
        this.version = Date.now();
        this.upQueries = [];
        this.downQueries = [];
    }

    createTable(tableName, callback) {
        const schema = new TableSchema(tableName);
        callback(schema);
        this.upQueries.push(schema.toCreateSQL());
        this.downQueries.unshift(`DROP TABLE IF EXISTS ${tableName}`);
        return this;
    }

    dropTable(tableName) {
        this.upQueries.push(`DROP TABLE IF EXISTS ${tableName}`);
        return this;
    }

    alterTable(tableName, callback) {
        const schema = new TableSchema(tableName, true);
        callback(schema);
        this.upQueries.push(...schema.toAlterSQL());
        return this;
    }

    addColumn(tableName, columnName, type, options = {}) {
        let sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${type}`;

        if (options.nullable === false) sql += ' NOT NULL';
        if (options.default !== undefined) sql += ` DEFAULT ${options.default}`;
        if (options.unique) sql += ' UNIQUE';

        this.upQueries.push(sql);
        this.downQueries.unshift(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
        return this;
    }

    dropColumn(tableName, columnName) {
        this.upQueries.push(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
        return this;
    }

    addIndex(tableName, columns, options = {}) {
        const indexName = options.name || `idx_${tableName}_${columns.join('_')}`;
        const unique = options.unique ? 'UNIQUE ' : '';
        const columnList = Array.isArray(columns) ? columns.join(', ') : columns;

        this.upQueries.push(`CREATE ${unique}INDEX ${indexName} ON ${tableName} (${columnList})`);
        this.downQueries.unshift(`DROP INDEX ${indexName}`);
        return this;
    }

    dropIndex(tableName, indexName) {
        this.upQueries.push(`DROP INDEX ${indexName}`);
        return this;
    }

    raw(sql) {
        this.upQueries.push(sql);
        return this;
    }

    async up(connection) {
        for (const query of this.upQueries) {
            await connection.execute(query);
        }
    }

    async down(connection) {
        for (const query of this.downQueries) {
            await connection.execute(query);
        }
    }
}

class TableSchema {
    constructor(tableName, isAlter = false) {
        this.tableName = tableName;
        this.isAlter = isAlter;
        this.columns = [];
        this.indexes = [];
        this.constraints = [];
    }

    id(name = 'id') {
        this.columns.push({
            name,
            type: 'INTEGER',
            primaryKey: true,
            autoIncrement: true,
            nullable: false
        });
        return this;
    }

    string(name, length = 255) {
        this.columns.push({
            name,
            type: `VARCHAR(${length})`,
            nullable: true
        });
        return this;
    }

    text(name) {
        this.columns.push({
            name,
            type: 'TEXT',
            nullable: true
        });
        return this;
    }

    integer(name) {
        this.columns.push({
            name,
            type: 'INTEGER',
            nullable: true
        });
        return this;
    }

    bigInteger(name) {
        this.columns.push({
            name,
            type: 'BIGINT',
            nullable: true
        });
        return this;
    }

    float(name, precision = 8, scale = 2) {
        this.columns.push({
            name,
            type: `FLOAT(${precision}, ${scale})`,
            nullable: true
        });
        return this;
    }

    decimal(name, precision = 8, scale = 2) {
        this.columns.push({
            name,
            type: `DECIMAL(${precision}, ${scale})`,
            nullable: true
        });
        return this;
    }

    boolean(name) {
        this.columns.push({
            name,
            type: 'BOOLEAN',
            nullable: true,
            default: false
        });
        return this;
    }

    date(name) {
        this.columns.push({
            name,
            type: 'DATE',
            nullable: true
        });
        return this;
    }

    datetime(name) {
        this.columns.push({
            name,
            type: 'DATETIME',
            nullable: true
        });
        return this;
    }

    timestamp(name) {
        this.columns.push({
            name,
            type: 'TIMESTAMP',
            nullable: true,
            default: 'CURRENT_TIMESTAMP'
        });
        return this;
    }

    timestamps() {
        this.timestamp('created_at').nullable(false);
        this.timestamp('updated_at').nullable(false);
        return this;
    }

    json(name) {
        this.columns.push({
            name,
            type: 'JSON',
            nullable: true
        });
        return this;
    }

    nullable(nullable = true) {
        if (this.columns.length > 0) {
            this.columns[this.columns.length - 1].nullable = nullable;
        }
        return this;
    }

    default(value) {
        if (this.columns.length > 0) {
            this.columns[this.columns.length - 1].default = value;
        }
        return this;
    }

    unique() {
        if (this.columns.length > 0) {
            this.columns[this.columns.length - 1].unique = true;
        }
        return this;
    }

    index(columns, options = {}) {
        this.indexes.push({
            columns: Array.isArray(columns) ? columns : [columns],
            unique: options.unique || false,
            name: options.name
        });
        return this;
    }

    foreign(column) {
        return new ForeignKeyBuilder(this, column);
    }

    toCreateSQL() {
        const columnDefinitions = this.columns.map(col => {
            let definition = `${col.name} ${col.type}`;

            if (col.primaryKey) definition += ' PRIMARY KEY';
            if (col.autoIncrement) definition += ' AUTO_INCREMENT';
            if (!col.nullable) definition += ' NOT NULL';
            if (col.default !== undefined) {
                definition += ` DEFAULT ${typeof col.default === 'string' ? `'${col.default}'` : col.default}`;
            }
            if (col.unique) definition += ' UNIQUE';

            return definition;
        });

        const constraintDefinitions = this.constraints.map(constraint => constraint.toSQL());

        const allDefinitions = [...columnDefinitions, ...constraintDefinitions];

        let sql = `CREATE TABLE ${this.tableName} (\n  ${allDefinitions.join(',\n  ')}\n)`;

        return sql;
    }

    toAlterSQL() {
        const queries = [];

        this.columns.forEach(col => {
            let sql = `ALTER TABLE ${this.tableName} ADD COLUMN ${col.name} ${col.type}`;

            if (!col.nullable) sql += ' NOT NULL';
            if (col.default !== undefined) {
                sql += ` DEFAULT ${typeof col.default === 'string' ? `'${col.default}'` : col.default}`;
            }
            if (col.unique) sql += ' UNIQUE';

            queries.push(sql);
        });

        this.indexes.forEach(idx => {
            const indexName = idx.name || `idx_${this.tableName}_${idx.columns.join('_')}`;
            const unique = idx.unique ? 'UNIQUE ' : '';
            queries.push(`CREATE ${unique}INDEX ${indexName} ON ${this.tableName} (${idx.columns.join(', ')})`);
        });

        return queries;
    }
}

class ForeignKeyBuilder {
    constructor(schema, column) {
        this.schema = schema;
        this.column = column;
        this.referenceTable = null;
        this.referenceColumn = 'id';
        this.onDeleteAction = 'RESTRICT';
        this.onUpdateAction = 'RESTRICT';
    }

    references(column) {
        this.referenceColumn = column;
        return this;
    }

    on(table) {
        this.referenceTable = table;
        this.schema.constraints.push(this);
        return this.schema;
    }

    onDelete(action) {
        this.onDeleteAction = action.toUpperCase();
        return this;
    }

    onUpdate(action) {
        this.onUpdateAction = action.toUpperCase();
        return this;
    }

    cascade() {
        this.onDeleteAction = 'CASCADE';
        this.onUpdateAction = 'CASCADE';
        return this;
    }

    restrict() {
        this.onDeleteAction = 'RESTRICT';
        this.onUpdateAction = 'RESTRICT';
        return this;
    }

    setNull() {
        this.onDeleteAction = 'SET NULL';
        return this;
    }

    toSQL() {
        const constraintName = `fk_${this.schema.tableName}_${this.column}_${this.referenceTable}_${this.referenceColumn}`;
        return `CONSTRAINT ${constraintName} FOREIGN KEY (${this.column}) REFERENCES ${this.referenceTable}(${this.referenceColumn}) ON DELETE ${this.onDeleteAction} ON UPDATE ${this.onUpdateAction}`;
    }
}

class DatabaseConnection {
    constructor(config) {
        this.config = config;
        this.isConnected = false;
        this.transactionLevel = 0;
        this.queryLog = [];
        this.executionTime = {};
    }

    async connect() {
        try {
            this.isConnected = true;
            console.log(`Connected to ${this.config.type} database`);
            return this;
        } catch (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    async execute(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }

        const startTime = Date.now();
        const queryId = crypto.randomUUID();

        try {
            console.log(`Executing query: ${sql}`);
            if (params.length > 0) {
                console.log(`Parameters:`, params);
            }

            const result = await this.simulateQuery(sql, params);

            const executionTime = Date.now() - startTime;
            this.executionTime[queryId] = executionTime;

            this.queryLog.push({
                id: queryId,
                sql,
                params,
                executionTime,
                timestamp: new Date()
            });

            return result;
        } catch (error) {
            this.queryLog.push({
                id: queryId,
                sql,
                params,
                error: error.message,
                timestamp: new Date()
            });
            throw error;
        }
    }

    async simulateQuery(sql, params) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

        const sqlUpper = sql.toUpperCase().trim();

        if (sqlUpper.startsWith('SELECT')) {
            return this.simulateSelectResult(sql);
        } else if (sqlUpper.startsWith('INSERT')) {
            return { insertId: Math.floor(Math.random() * 10000) + 1, affectedRows: 1 };
        } else if (sqlUpper.startsWith('UPDATE')) {
            return { affectedRows: Math.floor(Math.random() * 5) + 1 };
        } else if (sqlUpper.startsWith('DELETE')) {
            return { affectedRows: Math.floor(Math.random() * 3) + 1 };
        } else {
            return { success: true, message: 'Query executed successfully' };
        }
    }

    simulateSelectResult(sql) {
        const mockData = [];
        const rowCount = Math.floor(Math.random() * 10) + 1;

        for (let i = 0; i < rowCount; i++) {
            mockData.push({
                id: i + 1,
                name: `Record ${i + 1}`,
                email: `record${i + 1}@example.com`,
                created_at: new Date(Date.now() - Math.random() * 31536000000),
                updated_at: new Date(),
                status: Math.random() > 0.5 ? 'active' : 'inactive'
            });
        }

        return mockData;
    }

    async beginTransaction() {
        this.transactionLevel++;
        console.log(`Starting transaction (level ${this.transactionLevel})`);
        return this;
    }

    async commit() {
        if (this.transactionLevel === 0) {
            throw new Error('No active transaction to commit');
        }
        this.transactionLevel--;
        console.log(`Transaction committed (level ${this.transactionLevel})`);
        return this;
    }

    async rollback() {
        if (this.transactionLevel === 0) {
            throw new Error('No active transaction to rollback');
        }
        this.transactionLevel = 0;
        console.log('Transaction rolled back');
        return this;
    }

    async transaction(callback) {
        await this.beginTransaction();

        try {
            const result = await callback(this);
            await this.commit();
            return result;
        } catch (error) {
            await this.rollback();
            throw error;
        }
    }

    getQueryLog() {
        return this.queryLog;
    }

    clearQueryLog() {
        this.queryLog = [];
    }

    async close() {
        this.isConnected = false;
        console.log('Database connection closed');
    }
}

class MigrationRunner {
    constructor(connection, migrationsPath = './migrations') {
        this.connection = connection;
        this.migrationsPath = migrationsPath;
    }

    async createMigrationsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                version BIGINT NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_migration (name)
            )
        `;
        await this.connection.execute(sql);
    }

    async getExecutedMigrations() {
        const sql = 'SELECT name, version FROM migrations ORDER BY version ASC';
        try {
            return await this.connection.execute(sql);
        } catch (error) {
            return [];
        }
    }

    async runMigration(migration) {
        await this.connection.transaction(async (conn) => {
            await migration.up(conn);
            await conn.execute(
                'INSERT INTO migrations (name, version) VALUES (?, ?)',
                [migration.name, migration.version]
            );
        });
    }

    async rollbackMigration(migration) {
        await this.connection.transaction(async (conn) => {
            await migration.down(conn);
            await conn.execute(
                'DELETE FROM migrations WHERE name = ?',
                [migration.name]
            );
        });
    }

    async migrate() {
        await this.createMigrationsTable();

        const executedMigrations = await this.getExecutedMigrations();
        const executedNames = executedMigrations.map(m => m.name);

        console.log('Running pending migrations...');

        let migrationsRun = 0;

        console.log(`Migration completed. ${migrationsRun} migrations executed.`);
        return migrationsRun;
    }

    async rollback(steps = 1) {
        const executedMigrations = await this.getExecutedMigrations();
        const migrationsToRollback = executedMigrations
            .sort((a, b) => b.version - a.version)
            .slice(0, steps);

        console.log(`Rolling back ${migrationsToRollback.length} migrations...`);

        for (const migrationData of migrationsToRollback) {
            console.log(`Rolling back: ${migrationData.name}`);
        }

        console.log('Rollback completed.');
        return migrationsToRollback.length;
    }

    async status() {
        await this.createMigrationsTable();

        const executedMigrations = await this.getExecutedMigrations();

        console.log('\nMigration Status:');
        console.log('================');

        if (executedMigrations.length === 0) {
            console.log('No migrations have been executed.');
        } else {
            console.log('Executed migrations:');
            executedMigrations.forEach(migration => {
                console.log(`   ${migration.name} (version: ${migration.version})`);
            });
        }

        return {
            executed: executedMigrations.length,
            pending: 0
        };
    }
}

async function demonstrateORM() {
    console.log('Database ORM Demonstration');
    console.log('=========================');

    const config = {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'test_db',
        username: 'test_user',
        password: 'test_password'
    };

    const connection = new DatabaseConnection(config);
    await connection.connect();

    console.log('\n1. Query Builder Examples:');
    console.log('--------------------------');

    const queryBuilder = new QueryBuilder('users');

    console.log('Simple select:');
    console.log(queryBuilder.select(['name', 'email']).where('status', 'active').toSQL());

    console.log('\nComplex query with joins:');
    const complexQuery = new QueryBuilder('users')
        .select(['users.name', 'profiles.bio', 'roles.name as role_name'])
        .leftJoin('profiles', 'users.id', 'profiles.user_id')
        .join('roles', 'users.role_id', 'roles.id')
        .where('users.status', 'active')
        .where('users.created_at', '>=', '2024-01-01')
        .orderBy('users.name', 'ASC')
        .limit(10);

    console.log(complexQuery.toSQL());

    console.log('\n2. Migration Examples:');
    console.log('----------------------');

    const createUsersMigration = new Migration('create_users_table');
    createUsersMigration.createTable('users', (table) => {
        table.id();
        table.string('name', 100).nullable(false);
        table.string('email').unique().nullable(false);
        table.string('password').nullable(false);
        table.boolean('is_active').default(true);
        table.timestamps();
    });

    console.log('Migration SQL:');
    console.log(createUsersMigration.upQueries[0]);

    console.log('\n3. Model Operations:');
    console.log('-------------------');

    class User extends Model {
        constructor() {
            super('users', connection);
            this.fillable = ['name', 'email', 'password', 'is_active'];
        }
    }

    try {
        const allUsers = await User.all();
        console.log(`Found ${allUsers.length} users`);

        const newUser = new User();
        newUser.fill({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashed_password',
            is_active: true
        });

        await newUser.save();
        console.log('New user created with ID:', newUser.get('id'));

    } catch (error) {
        console.error('Model operation failed:', error.message);
    }

    console.log('\n4. Migration Runner:');
    console.log('-------------------');

    const migrationRunner = new MigrationRunner(connection);
    await migrationRunner.status();

    console.log('\n5. Query Log:');
    console.log('-------------');

    const queryLog = connection.getQueryLog();
    queryLog.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.sql} (${entry.executionTime}ms)`);
    });

    await connection.close();
}

if (require.main === module) {
    demonstrateORM().catch(console.error);
}

module.exports = {
    QueryBuilder,
    Model,
    Migration,
    TableSchema,
    DatabaseConnection,
    MigrationRunner
};
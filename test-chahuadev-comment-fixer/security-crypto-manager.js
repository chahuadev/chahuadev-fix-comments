const crypto = require('crypto');
const fs = require('fs').promises;

class CryptoManager {
    constructor(options = {}) {
        this.algorithm = options.algorithm || 'aes-256-gcm';
        this.keyLength = options.keyLength || 32;
        this.ivLength = options.ivLength || 16;
        this.tagLength = options.tagLength || 16;
        this.iterations = options.iterations || 100000;
        this.keyCache = new Map();
    }

    generateKey(password, salt) {
        const cacheKey = `${password}:${salt.toString('hex')}`;
        
        if (this.keyCache.has(cacheKey)) {
            return this.keyCache.get(cacheKey);
        }

        const key = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');
        this.keyCache.set(cacheKey, key);
        
        if (this.keyCache.size > 100) {
            const firstKey = this.keyCache.keys().next().value;
            this.keyCache.delete(firstKey);
        }
        
        return key;
    }

    encrypt(data, password) {
        try {
            const salt = crypto.randomBytes(16);
            const iv = crypto.randomBytes(this.ivLength);
            const key = this.generateKey(password, salt);
            
            const cipher = crypto.createCipher(this.algorithm, key, { iv });
            
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const tag = cipher.getAuthTag();
            
            return {
                encrypted,
                salt: salt.toString('hex'),
                iv: iv.toString('hex'),
                tag: tag.toString('hex'),
                algorithm: this.algorithm
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    decrypt(encryptedData, password) {
        try {
            const { encrypted, salt, iv, tag, algorithm } = encryptedData;
            
            const key = this.generateKey(password, Buffer.from(salt, 'hex'));
            const decipher = crypto.createDecipher(algorithm, key, { 
                iv: Buffer.from(iv, 'hex') 
            });
            
            decipher.setAuthTag(Buffer.from(tag, 'hex'));
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    generateHash(data, algorithm = 'sha256') {
        return crypto.createHash(algorithm).update(data).digest('hex');
    }

    generateHMAC(data, secret, algorithm = 'sha256') {
        return crypto.createHmac(algorithm, secret).update(data).digest('hex');
    }

    verifyHMAC(data, secret, expectedHmac, algorithm = 'sha256') {
        const computedHmac = this.generateHMAC(data, secret, algorithm);
        return crypto.timingSafeEqual(
            Buffer.from(computedHmac, 'hex'),
            Buffer.from(expectedHmac, 'hex')
        );
    }

    generateRandomBytes(length = 32) {
        return crypto.randomBytes(length);
    }

    generateSecurePassword(length = 16, includeSymbols = true) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const fullCharset = includeSymbols ? charset + symbols : charset;
        
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, fullCharset.length);
            password += fullCharset[randomIndex];
        }
        
        return password;
    }

    async encryptFile(filePath, password, outputPath = null) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            const encrypted = this.encrypt(data, password);
            
            const output = outputPath || `${filePath}.encrypted`;
            await fs.writeFile(output, JSON.stringify(encrypted, null, 2));
            
            return output;
        } catch (error) {
            throw new Error(`File encryption failed: ${error.message}`);
        }
    }

    async decryptFile(encryptedFilePath, password, outputPath = null) {
        try {
            const encryptedData = JSON.parse(await fs.readFile(encryptedFilePath, 'utf8'));
            const decrypted = this.decrypt(encryptedData, password);
            
            const output = outputPath || encryptedFilePath.replace('.encrypted', '');
            await fs.writeFile(output, decrypted);
            
            return output;
        } catch (error) {
            throw new Error(`File decryption failed: ${error.message}`);
        }
    }

    static create(options) {
        return new CryptoManager(options);
    }
}

class DigitalSignature {
    constructor(algorithm = 'rsa', keySize = 2048) {
        this.algorithm = algorithm;
        this.keySize = keySize;
        this.keyPairs = new Map();
    }

    generateKeyPair(keyId = 'default') {
        const { publicKey, privateKey } = crypto.generateKeyPairSync(this.algorithm, {
            modulusLength: this.keySize,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        this.keyPairs.set(keyId, { publicKey, privateKey });
        return { publicKey, privateKey };
    }

    sign(data, privateKey, algorithm = 'sha256') {
        try {
            const sign = crypto.createSign(algorithm);
            sign.update(data);
            return sign.sign(privateKey, 'hex');
        } catch (error) {
            throw new Error(`Signing failed: ${error.message}`);
        }
    }

    verify(data, signature, publicKey, algorithm = 'sha256') {
        try {
            const verify = crypto.createVerify(algorithm);
            verify.update(data);
            return verify.verify(publicKey, signature, 'hex');
        } catch (error) {
            throw new Error(`Verification failed: ${error.message}`);
        }
    }

    signWithKeyId(data, keyId = 'default') {
        const keyPair = this.keyPairs.get(keyId);
        if (!keyPair) {
            throw new Error(`Key pair with ID '${keyId}' not found`);
        }
        return this.sign(data, keyPair.privateKey);
    }

    verifyWithKeyId(data, signature, keyId = 'default') {
        const keyPair = this.keyPairs.get(keyId);
        if (!keyPair) {
            throw new Error(`Key pair with ID '${keyId}' not found`);
        }
        return this.verify(data, signature, keyPair.publicKey);
    }

    exportKeyPair(keyId = 'default') {
        return this.keyPairs.get(keyId);
    }

    importKeyPair(publicKey, privateKey, keyId = 'default') {
        this.keyPairs.set(keyId, { publicKey, privateKey });
    }

    listKeyIds() {
        return Array.from(this.keyPairs.keys());
    }

    deleteKeyPair(keyId) {
        return this.keyPairs.delete(keyId);
    }
}

class SecureStorage {
    constructor(cryptoManager, filePath) {
        this.crypto = cryptoManager;
        this.filePath = filePath;
        this.data = new Map();
        this.isLoaded = false;
        this.autoSave = true;
    }

    async load(password) {
        try {
            const encryptedData = JSON.parse(await fs.readFile(this.filePath, 'utf8'));
            const decrypted = this.crypto.decrypt(encryptedData, password);
            const parsed = JSON.parse(decrypted);
            
            this.data = new Map(Object.entries(parsed));
            this.isLoaded = true;
            
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.data = new Map();
                this.isLoaded = true;
                return true;
            }
            throw new Error(`Failed to load secure storage: ${error.message}`);
        }
    }

    async save(password) {
        try {
            const dataObject = Object.fromEntries(this.data);
            const serialized = JSON.stringify(dataObject, null, 2);
            const encrypted = this.crypto.encrypt(serialized, password);
            
            await fs.writeFile(this.filePath, JSON.stringify(encrypted, null, 2));
            return true;
        } catch (error) {
            throw new Error(`Failed to save secure storage: ${error.message}`);
        }
    }

    set(key, value, password) {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }

        this.data.set(key, value);
        
        if (this.autoSave) {
            return this.save(password);
        }
        
        return Promise.resolve();
    }

    get(key) {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }
        
        return this.data.get(key);
    }

    has(key) {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }
        
        return this.data.has(key);
    }

    delete(key, password) {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }
        
        const deleted = this.data.delete(key);
        
        if (deleted && this.autoSave) {
            return this.save(password);
        }
        
        return Promise.resolve(deleted);
    }

    clear(password) {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }
        
        this.data.clear();
        
        if (this.autoSave) {
            return this.save(password);
        }
        
        return Promise.resolve();
    }

    keys() {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }
        
        return Array.from(this.data.keys());
    }

    values() {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }
        
        return Array.from(this.data.values());
    }

    entries() {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }
        
        return Array.from(this.data.entries());
    }

    size() {
        if (!this.isLoaded) {
            throw new Error('Storage not loaded. Call load() first.');
        }
        
        return this.data.size;
    }

    setAutoSave(enabled) {
        this.autoSave = enabled;
    }
}

function createSecureHash(data, algorithm = 'sha256', rounds = 1) {
    let hash = data;
    
    for (let i = 0; i < rounds; i++) {
        hash = crypto.createHash(algorithm).update(hash).digest('hex');
    }
    
    return hash;
}

function compareSecureHashes(hash1, hash2) {
    if (hash1.length !== hash2.length) {
        return false;
    }
    
    return crypto.timingSafeEqual(
        Buffer.from(hash1, 'hex'),
        Buffer.from(hash2, 'hex')
    );
}

async function secureDelete(filePath, passes = 3) {
    try {
        const stats = await fs.stat(filePath);
        const fileSize = stats.size;
        
        for (let pass = 0; pass < passes; pass++) {
            const randomData = crypto.randomBytes(fileSize);
            await fs.writeFile(filePath, randomData);
            await fs.fsync(await fs.open(filePath, 'r+'));
        }
        
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        throw new Error(`Secure deletion failed: ${error.message}`);
    }
}

const createCryptoUtilities = (options = {}) => {
    const crypto = new CryptoManager(options);
    const signature = new DigitalSignature();
    
    return {
        crypto,
        signature,
        createSecureStorage: (filePath) => new SecureStorage(crypto, filePath),
        hash: (data, algorithm) => createSecureHash(data, algorithm),
        compareHashes: compareSecureHashes,
        secureDelete,
        generateKey: () => crypto.generateRandomBytes(32).toString('hex'),
        generatePassword: (length, includeSymbols) => crypto.generateSecurePassword(length, includeSymbols)
    };
};

module.exports = {
    CryptoManager,
    DigitalSignature,
    SecureStorage,
    createSecureHash,
    compareSecureHashes,
    secureDelete,
    createCryptoUtilities
};
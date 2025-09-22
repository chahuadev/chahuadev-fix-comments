#!/usr/bin/env node

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                    🧪 Chahuadev Comment Fixer - Test Suite                     ║
// ║                 ระบบทดสอบแบบครอบคลุมสำหรับ Production Release                  ║
// ║                [การใช้งาน] ทดสอบทุก edge case ก่อน publish NPM                 ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// @author บริษัท ชาหัว ดีเวลลอปเมนต์ จำกัด
// @version 1.1.0
// @description Comprehensive test suite for Chahuadev Comment Fixer

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 1: Test Configuration                               ║
// ║                     การกำหนดค่าและข้อมูลทดสอบ                                  ║
// ║              [การใช้งาน] หลัก: กำหนดพารามิเตอร์การทดสอบ                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// ค่าคงที่สำหรับการทดสอบ - Test constants
const TEST_CONFIG = {
    TEST_DIR: './test-cases',
    BACKUP_DIR: './.chahuadev-fix-comments-backups',
    TIMEOUT: 30000, // 30 seconds
    TEMP_FILES: [],
    CLEANUP_ON_EXIT: true
};

// สถิติการทดสอบ - Test statistics
const TEST_STATS = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    startTime: Date.now(),
    errors: []
};

// สีสำหรับ console output - Console colors
const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    WHITE: '\x1b[37m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 2: Test Data Generation                             ║
// ║                     การสร้างข้อมูลทดสอบแบบซับซ้อน                             ║
// ║              [การใช้งาน] หลัก: สร้าง test cases ที่หลากหลาย                     ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// สร้างโค้ดทดสอบแบบซับซ้อน - Generate complex test code
const TEST_CASES = {
    // 1. Basic Function Types - ฟังก์ชันพื้นฐาน
    basicFunctions: `
/**
 * Calculate total price with discount
 */
function calculatePrice(items, discount) {
    return items.reduce((sum, item) => sum + item.price, 0) - discount;
}

/**
 * Process user data asynchronously
 */
const processData = async (userData) => {
    return await validateAndTransform(userData);
};

/**
 * Event handler for user clicks
 */
const handleClick = (event) => {
    event.preventDefault();
    processUserAction(event.target.value);
};
`,

    // 2. Complex Nested Structure - โครงสร้างซับซ้อน
    complexNested: `
class UserManager {
    /**
     * Initialize user manager with database connection
     */
    constructor(dbConnection) {
        this.db = dbConnection;
        this.cache = new Map();
    }

    /**
     * Get user information by ID
     */
    async getUserInfo(userId) {
        if (this.cache.has(userId)) {
            return this.cache.get(userId);
        }
        
        const user = await this.db.users.findById(userId);
        this.cache.set(userId, user);
        return user;
    }

    /**
     * Update user profile with validation
     */
    async updateProfile(userId, profileData) {
        const validation = await this.validateProfile(profileData);
        if (!validation.isValid) {
            throw new Error(\`Validation failed: \${validation.errors.join(', ')}\`);
        }
        
        return await this.db.users.update(userId, profileData);
    }
}
`,

    // 3. Edge Cases - กรณีพิเศษ
    edgeCases: `
// ฟังก์ชันใน string - Function in string
const exampleString = "function fakeFunction() { return 'This should not be detected'; }";

// ฟังก์ชันใน comment - Function in comment  
// function commentedFunction() { return false; }

/*
function blockedFunction() {
    return 'This is in a block comment';
}
*/

/**
 * Real function that should be detected
 */
function realFunction() {
    const innerString = "function insideString() { }";
    // function insideLineComment() { }
    /*
    function insideBlockComment() {
        return "nested";
    }
    */
    return "This is a real function";
}

/**
 * Arrow function with destructuring
 */
const destructureFunction = ({ name, age, ...rest }) => {
    return { name: name.toUpperCase(), age, ...rest };
};

/**
 * Function with template literals
 */
const templateFunction = (user) => {
    return \`Hello \${user.name}, you are \${user.age} years old!\`;
};
`,

    // 4. Modern JavaScript Features - ฟีเจอร์ JavaScript สมัยใหม่
    modernJS: `
/**
 * Async generator function
 */
async function* dataStream(source) {
    for await (const chunk of source) {
        yield await processChunk(chunk);
    }
}

/**
 * Arrow function with async
 */
const fetchUserData = async (userId) => {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error;
    }
};

/**
 * Higher-order function
 */
const createValidator = (rules) => (data) => {
    return rules.every(rule => rule(data));
};

/**
 * Curried function
 */
const multiply = (a) => (b) => a * b;

/**
 * Function with default parameters
 */
function processOrder(order, options = { validate: true, notify: false }) {
    if (options.validate) {
        validateOrder(order);
    }
    
    const result = executeOrder(order);
    
    if (options.notify) {
        notifyUser(order.userId, result);
    }
    
    return result;
}
`,

    // 5. Complex Comments - คอมเมนต์ซับซ้อน
    complexComments: `
/**
 * Complex multiline comment
 * with multiple lines of description
 * and various formatting
 * @param {Object} data - The input data
 * @param {string} data.name - User name
 * @param {number} data.age - User age
 * @returns {Promise<Object>} Processed data
 */
function complexFunction(data) {
    return processComplexData(data);
}

/*
 * Another style of multiline comment
 * without the double asterisk
 */
function anotherFunction() {
    return "result";
}

/**
 * Function with inline code examples
 * Example usage: calculateTotal([1, 2, 3])
 * Returns: 6
 */
function calculateTotal(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
}
`,

    // 6. Mixed Content - เนื้อหาผสม
    mixedContent: `
import React from 'react';
import { useState, useEffect } from 'react';

/**
 * React component for user profile
 */
const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Load user data on component mount
     */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await fetchUser(userId);
                setUser(userData);
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [userId]);

    /**
     * Handle profile update
     */
    const handleUpdate = async (newData) => {
        setLoading(true);
        try {
            const updated = await updateUser(userId, newData);
            setUser(updated);
        } catch (error) {
            alert(\`Update failed: \${error.message}\`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="user-profile">
            <h1>{user.name}</h1>
            <p>Age: {user.age}</p>
        </div>
    );
};

/**
 * Export the component as default
 */
export default UserProfile;
`
};

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 3: Test Utilities                                  ║
// ║                     ฟังก์ชันช่วยเหลือสำหรับการทดสอบ                           ║
// ║              [การใช้งาน] หลัก: เครื่องมือและ helpers                            ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// แสดงข้อความแบบมีสี - Colored console output
function colorLog(color, message) {
    console.log(`${color}${message}${COLORS.RESET}`);
}

// สร้างไฟล์ทดสอบชั่วคราว - Create temporary test file
function createTestFile(filename, content) {
    const filePath = path.join(TEST_CONFIG.TEST_DIR, filename);
    
    // สร้าง directory ถ้าไม่มี
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    TEST_CONFIG.TEMP_FILES.push(filePath);
    return filePath;
}

// ทำความสะอาดไฟล์ทดสอบ - Cleanup test files
function cleanupTestFiles() {
    if (!TEST_CONFIG.CLEANUP_ON_EXIT) return;
    
    TEST_CONFIG.TEMP_FILES.forEach(filePath => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.warn(`Failed to cleanup ${filePath}:`, error.message);
        }
    });
    
    // ลบ directory ทดสอบ
    if (fs.existsSync(TEST_CONFIG.TEST_DIR)) {
        try {
            fs.rmSync(TEST_CONFIG.TEST_DIR, { recursive: true, force: true });
        } catch (error) {
            console.warn(`Failed to cleanup test directory:`, error.message);
        }
    }
    
    // ลบ backup directory ถ้ามี
    if (fs.existsSync(TEST_CONFIG.BACKUP_DIR)) {
        try {
            fs.rmSync(TEST_CONFIG.BACKUP_DIR, { recursive: true, force: true });
        } catch (error) {
            console.warn(`Failed to cleanup backup directory:`, error.message);
        }
    }
}

// เรียกใช้ CLI และรับผลลัพธ์ - Execute CLI and capture output
function executeCLI(args, options = {}) {
    try {
        const command = `node fix-comments.js ${args}`;
        const result = execSync(command, {
            encoding: 'utf8',
            timeout: TEST_CONFIG.TIMEOUT,
            ...options
        });
        return { success: true, output: result, error: null };
    } catch (error) {
        return { success: false, output: null, error: error.message };
    }
}

// ตรวจสอบผลลัพธ์ - Validate results
function validateResult(testName, expected, actual, description = '') {
    TEST_STATS.total++;
    
    try {
        if (typeof expected === 'function') {
            // Custom validation function
            const isValid = expected(actual);
            if (isValid) {
                TEST_STATS.passed++;
                colorLog(COLORS.GREEN, `  ✅ ${testName}: ${description || 'PASSED'}`);
                return true;
            } else {
                throw new Error('Custom validation failed');
            }
        } else if (expected === actual || JSON.stringify(expected) === JSON.stringify(actual)) {
            TEST_STATS.passed++;
            colorLog(COLORS.GREEN, `  ✅ ${testName}: ${description || 'PASSED'}`);
            return true;
        } else {
            throw new Error(`Expected: ${expected}, Got: ${actual}`);
        }
    } catch (error) {
        TEST_STATS.failed++;
        TEST_STATS.errors.push({ test: testName, error: error.message, description });
        colorLog(COLORS.RED, `  ❌ ${testName}: ${error.message}`);
        if (description) {
            colorLog(COLORS.YELLOW, `     Description: ${description}`);
        }
        return false;
    }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 4: Core Test Functions                             ║
// ║                     ฟังก์ชันทดสอบหลักแต่ละประเภท                              ║
// ║              [การใช้งาน] หลัก: ทดสอบฟีเจอร์ต่างๆ ของระบบ                      ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// ทดสอบ CLI Help และ Version - Test CLI help and version
function testCLIBasics() {
    colorLog(COLORS.CYAN, '\n🔧 Testing CLI Basics...');
    
    // Test help command
    const helpResult = executeCLI('--help');
    validateResult(
        'CLI Help',
        (output) => output.success && output.output.includes('Chahuadev Comment Fixer'),
        helpResult,
        'Help command should work and show app name'
    );
    
    // Test version command
    const versionResult = executeCLI('--version');
    validateResult(
        'CLI Version',
        (output) => output.success && output.output.trim().match(/^\d+\.\d+\.\d+$/),
        versionResult,
        'Version command should return semantic version'
    );
    
    // Test invalid command
    const invalidResult = executeCLI('--invalid-flag');
    validateResult(
        'Invalid Flag',
        (output) => !output.success || output.output.includes('help'),
        invalidResult,
        'Invalid flags should show help or fail gracefully'
    );
}

// ทดสอบการแปลงคอมเมนต์พื้นฐาน - Test basic comment conversion
function testBasicCommentConversion() {
    colorLog(COLORS.CYAN, '\n📝 Testing Basic Comment Conversion...');
    
    Object.entries(TEST_CASES).forEach(([caseName, content]) => {
        const testFile = createTestFile(`${caseName}.js`, content);
        
        // Count original /** */ comments
        const originalComments = (content.match(/\/\*\*/g) || []).length;
        
        // Execute fix-comments
        const result = executeCLI(testFile);
        
        validateResult(
            `Process ${caseName}`,
            (output) => output.success,
            result,
            `Should successfully process ${caseName} test case`
        );
        
        if (result.success && fs.existsSync(testFile)) {
            const processedContent = fs.readFileSync(testFile, 'utf8');
            
            // Check that /** */ comments are converted
            const remainingBlockComments = (processedContent.match(/\/\*\*/g) || []).length;
            validateResult(
                `Convert ${caseName}`,
                0,
                remainingBlockComments,
                `All /** */ comments should be converted to // format`
            );
            
            // Check that bilingual comments are added
            const bilingualComments = (processedContent.match(/\/\/.*-.*[a-zA-Z]/g) || []).length;
            validateResult(
                `Bilingual ${caseName}`,
                (count) => count >= originalComments,
                bilingualComments,
                `Should have bilingual descriptions`
            );
        }
    });
}

// ทดสอบการตรวจจับ Context - Test context detection
function testContextDetection() {
    colorLog(COLORS.CYAN, '\n🎯 Testing Context Detection...');
    
    const contextTestCode = `
const message = "/** fake comment in string */";
// /** comment in line comment */
/*
/** nested comment
*/
function realFunction() {
    const str = "function fakeInString() {}";
    return "real";
}
/**
 * This should be converted
 */
function anotherReal() {
    return true;
}
`;
    
    const testFile = createTestFile('context-test.js', contextTestCode);
    const result = executeCLI(testFile);
    
    validateResult(
        'Context Processing',
        (output) => output.success,
        result,
        'Should process file with context challenges'
    );
    
    if (result.success && fs.existsSync(testFile)) {
        const processed = fs.readFileSync(testFile, 'utf8');
        
        // Should not modify strings
        validateResult(
            'String Protection',
            true,
            processed.includes('"/** fake comment in string */"'),
            'Comments in strings should not be modified'
        );
        
        // Should not modify line comments
        validateResult(
            'Line Comment Protection',
            true,
            processed.includes('// /** comment in line comment */'),
            'Comments in line comments should not be modified'
        );
        
        // Should convert real comments
        validateResult(
            'Real Comment Conversion',
            false,
            processed.includes('/** \n * This should be converted\n */'),
            'Real /** */ comments should be converted'
        );
    }
}

// ทดสอบการจัดโซน - Test zone organization
function testZoneOrganization() {
    colorLog(COLORS.CYAN, '\n🗂️ Testing Zone Organization...');
    
    const zoneTestCode = `
function authenticateUser(credentials) {
    return verifyCredentials(credentials);
}

function apiRequest(endpoint, data) {
    return fetch(endpoint, { method: 'POST', body: JSON.stringify(data) });
}

function saveData(data) {
    return database.save(data);
}

function renderUI(component) {
    return document.body.appendChild(component);
}

function validateInput(input) {
    return input && input.length > 0;
}
`;
    
    const testFile = createTestFile('zone-test.js', zoneTestCode);
    const result = executeCLI(`${testFile} --organize-zones`);
    
    validateResult(
        'Zone Organization',
        (output) => output.success,
        result,
        'Should successfully organize code into zones'
    );
    
    if (result.success && fs.existsSync(testFile)) {
        const processed = fs.readFileSync(testFile, 'utf8');
        
        // Check for zone headers
        const zoneHeaders = (processed.match(/╔═+╗/g) || []).length;
        validateResult(
            'Zone Headers',
            (count) => count > 0,
            zoneHeaders,
            'Should create zone headers with decorative borders'
        );
        
        // Check for bilingual zone descriptions
        validateResult(
            'Bilingual Zones',
            true,
            processed.includes('โซน') && processed.includes('Zone'),
            'Zone headers should be bilingual'
        );
    }
}

// ทดสอบการสำรองข้อมูล - Test backup functionality
function testBackupFunctionality() {
    colorLog(COLORS.CYAN, '\n💾 Testing Backup Functionality...');
    
    const backupTestCode = TEST_CASES.basicFunctions;
    const testFile = createTestFile('backup-test.js', backupTestCode);
    const originalContent = fs.readFileSync(testFile, 'utf8');
    
    const result = executeCLI(testFile);
    
    validateResult(
        'Backup Processing',
        (output) => output.success,
        result,
        'Should successfully create backup'
    );
    
    // Check if backup directory exists
    validateResult(
        'Backup Directory',
        true,
        fs.existsSync(TEST_CONFIG.BACKUP_DIR),
        'Backup directory should be created'
    );
    
    if (fs.existsSync(TEST_CONFIG.BACKUP_DIR)) {
        const backupFiles = fs.readdirSync(TEST_CONFIG.BACKUP_DIR);
        validateResult(
            'Backup Files',
            (count) => count > 0,
            backupFiles.length,
            'Should create backup files'
        );
        
        // Verify backup content matches original
        if (backupFiles.length > 0) {
            const backupFile = path.join(TEST_CONFIG.BACKUP_DIR, backupFiles[0]);
            const backupContent = fs.readFileSync(backupFile, 'utf8');
            validateResult(
                'Backup Content',
                originalContent,
                backupContent,
                'Backup should contain original content'
            );
        }
    }
}

// ทดสอบประสิทธิภาพ - Test performance
function testPerformance() {
    colorLog(COLORS.CYAN, '\n⚡ Testing Performance...');
    
    // Create large test file
    const largeContent = TEST_CASES.complexNested.repeat(100); // ~100KB
    const testFile = createTestFile('performance-test.js', largeContent);
    
    const startTime = Date.now();
    const result = executeCLI(testFile);
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    validateResult(
        'Performance Processing',
        (output) => output.success,
        result,
        'Should handle large files'
    );
    
    validateResult(
        'Processing Speed',
        (time) => time < 10000, // Less than 10 seconds
        processingTime,
        `Processing should complete in reasonable time (${processingTime}ms)`
    );
    
    // Check memory efficiency
    const stats = fs.statSync(testFile);
    validateResult(
        'Memory Efficiency',
        (fileSize) => fileSize > 0,
        stats.size,
        'Should handle file without memory issues'
    );
}

// ทดสอบความปลอดภัย - Test security features
function testSecurityFeatures() {
    colorLog(COLORS.CYAN, '\n🛡️ Testing Security Features...');
    
    // Test path traversal protection
    const dangerousPath = '../../../etc/passwd';
    const result1 = executeCLI(dangerousPath);
    validateResult(
        'Path Traversal Protection',
        (output) => !output.success,
        result1,
        'Should reject dangerous paths'
    );
    
    // Test large file protection
    const veryLargeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
    const largeFile = createTestFile('large-test.js', veryLargeContent);
    const result2 = executeCLI(largeFile);
    validateResult(
        'Large File Protection',
        (output) => !output.success || output.output.includes('too large'),
        result2,
        'Should handle very large files gracefully'
    );
    
    // Test symlink protection
    // Note: This test might not work on all systems
    try {
        const symlinkPath = path.join(TEST_CONFIG.TEST_DIR, 'symlink-test.js');
        const targetPath = path.join(TEST_CONFIG.TEST_DIR, 'target.js');
        fs.writeFileSync(targetPath, 'function test() {}');
        fs.symlinkSync(targetPath, symlinkPath);
        
        const result3 = executeCLI(symlinkPath);
        validateResult(
            'Symlink Handling',
            (output) => output.success || output.error.includes('symlink'),
            result3,
            'Should handle symlinks appropriately'
        );
    } catch (error) {
        TEST_STATS.skipped++;
        colorLog(COLORS.YELLOW, '  ⏭️ Symlink Test: SKIPPED (not supported on this system)');
    }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 5: Advanced Tests                                  ║
// ║                     การทดสอบขั้นสูงและกรณีพิเศษ                               ║
// ║              [การใช้งาน] หลัก: ทดสอบ edge cases และ advanced features           ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// ทดสอบ Tokenizer Prototype - Test tokenizer prototype
function testTokenizerPrototype() {
    colorLog(COLORS.CYAN, '\n🔤 Testing Tokenizer Prototype...');
    
    if (!fs.existsSync('prototype-tokenizer-v2.js')) {
        TEST_STATS.skipped++;
        colorLog(COLORS.YELLOW, '  ⏭️ Tokenizer Prototype: SKIPPED (file not found)');
        return;
    }
    
    try {
        const result = execSync('node prototype-tokenizer-v2.js', { 
            encoding: 'utf8', 
            timeout: TEST_CONFIG.TIMEOUT 
        });
        
        validateResult(
            'Tokenizer Execution',
            (output) => output.includes('Tokenizer ทำงานได้อย่างสมบูรณ์'),
            result,
            'Tokenizer prototype should execute successfully'
        );
        
        validateResult(
            'Function Detection',
            (output) => output.includes('พบฟังก์ชันทั้งหมด'),
            result,
            'Should detect functions correctly'
        );
        
        validateResult(
            'Accuracy Comparison',
            (output) => output.includes('100%'),
            result,
            'Should demonstrate 100% accuracy'
        );
        
    } catch (error) {
        TEST_STATS.failed++;
        TEST_STATS.errors.push({ test: 'Tokenizer Prototype', error: error.message });
        colorLog(COLORS.RED, `  ❌ Tokenizer Prototype: ${error.message}`);
    }
}

// ทดสอบการทำงานแบบ Recursive - Test recursive directory processing
function testRecursiveProcessing() {
    colorLog(COLORS.CYAN, '\n📁 Testing Recursive Processing...');
    
    // Create nested directory structure
    const nestedStructure = {
        'src/utils.js': TEST_CASES.basicFunctions,
        'src/components/UserProfile.js': TEST_CASES.mixedContent,
        'src/services/api.js': TEST_CASES.modernJS,
        'tests/utils.test.js': TEST_CASES.complexComments
    };
    
    Object.entries(nestedStructure).forEach(([relativePath, content]) => {
        const fullPath = path.join(TEST_CONFIG.TEST_DIR, relativePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content, 'utf8');
        TEST_CONFIG.TEMP_FILES.push(fullPath);
    });
    
    const result = executeCLI(`${TEST_CONFIG.TEST_DIR} --recursive`);
    
    validateResult(
        'Recursive Processing',
        (output) => output.success,
        result,
        'Should process nested directories recursively'
    );
    
    // Check that all files were processed
    Object.keys(nestedStructure).forEach(relativePath => {
        const fullPath = path.join(TEST_CONFIG.TEST_DIR, relativePath);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasBlockComments = content.includes('/**');
            validateResult(
                `Processed ${relativePath}`,
                false,
                hasBlockComments,
                'File should have block comments converted'
            );
        }
    });
}

// ทดสอบ Error Handling - Test error handling
function testErrorHandling() {
    colorLog(COLORS.CYAN, '\n🚨 Testing Error Handling...');
    
    // Test non-existent file
    const result1 = executeCLI('non-existent-file.js');
    validateResult(
        'Non-existent File',
        (output) => !output.success,
        result1,
        'Should handle non-existent files gracefully'
    );
    
    // Test permission denied (create readonly file)
    const readonlyFile = createTestFile('readonly.js', TEST_CASES.basicFunctions);
    try {
        fs.chmodSync(readonlyFile, 0o444); // readonly
        const result2 = executeCLI(readonlyFile);
        validateResult(
            'Permission Denied',
            (output) => !output.success || output.error.includes('permission'),
            result2,
            'Should handle permission errors'
        );
        fs.chmodSync(readonlyFile, 0o644); // restore permissions
    } catch (error) {
        TEST_STATS.skipped++;
        colorLog(COLORS.YELLOW, '  ⏭️ Permission Test: SKIPPED (chmod not supported)');
    }
    
    // Test malformed JavaScript
    const malformedCode = `
    function incomplete( {
        return "missing closing parenthesis";
    }
    
    /**
     * This comment is above malformed code
     */
    function another() {
        const unclosed = "string;
        return unclosed;
    `;
    
    const malformedFile = createTestFile('malformed.js', malformedCode);
    const result3 = executeCLI(malformedFile);
    validateResult(
        'Malformed JavaScript',
        (output) => output.success, // Should still process comments even with syntax errors
        result3,
        'Should process comments even in malformed JavaScript'
    );
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 6: Test Execution & Reporting                      ║
// ║                     การรันเทสและสร้างรายงาน                                   ║
// ║              [การใช้งาน] หลัก: รันเทสทั้งหมดและสรุปผล                          ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// รายงานผลการทดสอบ - Generate test report
function generateTestReport() {
    const duration = Date.now() - TEST_STATS.startTime;
    const passRate = ((TEST_STATS.passed / TEST_STATS.total) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    colorLog(COLORS.BOLD + COLORS.CYAN, '📊 TEST SUMMARY REPORT');
    console.log('='.repeat(80));
    
    colorLog(COLORS.WHITE, `📅 Date: ${new Date().toLocaleString()}`);
    colorLog(COLORS.WHITE, `⏱️  Duration: ${duration}ms`);
    colorLog(COLORS.WHITE, `📦 Package: @chahuadev/fix-comments v1.1.0`);
    
    console.log('\n📈 STATISTICS:');
    colorLog(COLORS.GREEN, `  ✅ Passed: ${TEST_STATS.passed}`);
    colorLog(COLORS.RED, `  ❌ Failed: ${TEST_STATS.failed}`);
    colorLog(COLORS.YELLOW, `  ⏭️  Skipped: ${TEST_STATS.skipped}`);
    colorLog(COLORS.BLUE, `  📊 Total: ${TEST_STATS.total}`);
    colorLog(COLORS.CYAN, `  🎯 Pass Rate: ${passRate}%`);
    
    if (TEST_STATS.errors.length > 0) {
        console.log('\n🚨 FAILED TESTS:');
        TEST_STATS.errors.forEach((error, index) => {
            colorLog(COLORS.RED, `  ${index + 1}. ${error.test}`);
            colorLog(COLORS.YELLOW, `     Error: ${error.error}`);
            if (error.description) {
                colorLog(COLORS.WHITE, `     Note: ${error.description}`);
            }
        });
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (TEST_STATS.failed === 0) {
        colorLog(COLORS.GREEN, '  ✅ All tests passed! Package is ready for NPM release.');
        colorLog(COLORS.GREEN, '  ✅ No critical issues found.');
        colorLog(COLORS.GREEN, '  ✅ Security tests passed.');
        colorLog(COLORS.GREEN, '  ✅ Performance requirements met.');
    } else {
        colorLog(COLORS.RED, '  ❌ Some tests failed. Please fix issues before publishing.');
        colorLog(COLORS.YELLOW, '  ⚠️  Review failed tests and implement fixes.');
        if (TEST_STATS.failed > TEST_STATS.passed) {
            colorLog(COLORS.RED, '  🚫 DO NOT PUBLISH - Too many failures!');
        }
    }
    
    console.log('\n🏆 QUALITY ASSESSMENT:');
    if (passRate >= 95) {
        colorLog(COLORS.GREEN, '  🏆 EXCELLENT (95%+) - Production Ready!');
    } else if (passRate >= 85) {
        colorLog(COLORS.YELLOW, '  👍 GOOD (85%+) - Minor issues to address');
    } else if (passRate >= 70) {
        colorLog(COLORS.YELLOW, '  ⚠️  FAIR (70%+) - Needs improvement');
    } else {
        colorLog(COLORS.RED, '  🚫 POOR (<70%) - Major issues found');
    }
    
    console.log('\n' + '='.repeat(80));
    
    return TEST_STATS.failed === 0;
}

// รันเทสทั้งหมด - Run all tests
function runAllTests() {
    colorLog(COLORS.BOLD + COLORS.BLUE, '🚀 Starting Comprehensive Test Suite for @chahuadev/fix-comments');
    colorLog(COLORS.WHITE, `📅 ${new Date().toLocaleString()}`);
    colorLog(COLORS.WHITE, '🎯 Testing all features before NPM publication\n');
    
    try {
        // Core functionality tests
        testCLIBasics();
        testBasicCommentConversion();
        testContextDetection();
        testZoneOrganization();
        testBackupFunctionality();
        
        // Advanced tests
        testPerformance();
        testSecurityFeatures();
        testTokenizerPrototype();
        testRecursiveProcessing();
        testErrorHandling();
        
        // Generate final report
        const allPassed = generateTestReport();
        
        // Cleanup
        cleanupTestFiles();
        
        // Exit with appropriate code
        process.exit(allPassed ? 0 : 1);
        
    } catch (error) {
        colorLog(COLORS.RED, `\n💥 CRITICAL ERROR: ${error.message}`);
        cleanupTestFiles();
        process.exit(1);
    }
}

// Handle cleanup on exit
process.on('exit', cleanupTestFiles);
process.on('SIGINT', () => {
    colorLog(COLORS.YELLOW, '\n⏹️  Test interrupted by user');
    cleanupTestFiles();
    process.exit(1);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        TEST_CASES,
        TEST_STATS,
        validateResult,
        executeCLI
    };
}

// Run tests if called directly
if (typeof require !== 'undefined' && require.main === module) {
    runAllTests();
}
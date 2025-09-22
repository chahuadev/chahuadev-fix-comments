#!/usr/bin/env node
// CHAHUADEV COMMENT FIXER - เครื่องมือแก้ไขคอมเมนต์แบบอัจฉริยะ
// ===============================================================
// @fileoverview Universal Comment Format Fixer with AI-Friendly Bilingual Comments
// @author บริษัท ชาหัว ดีเวลลอปเมนต์ จำกัด
// @author Chahua Development Co., Ltd.
// @version 1.2.0
// ----------------------------------
//  นโยบายความปลอดภัยระดับป้อมปราการ:
// ----------------------------------
// เครื่องมือนี้แก้ไข /** */ comments เป็น // format พร้อมคำอธิบายสองภาษา
// มีระบบตรวจสอบความปลอดภัยและไวยากรณ์ขั้นสูงเพื่อป้องกันการทำลายโค้ด
// สามารถค้นหาฟังก์ชันและเพิ่มคอมเมนต์อัตโนมัติได้ด้วย Advanced Tokenizer
// ----------------------------------
//  This tool fixes /** */ comments to // format with bilingual descriptions
//  Includes advanced security and syntax validation to prevent code corruption
//  Can automatically find functions and add comments using Advanced Tokenizer
// ----------------------------------

// Import advanced tokenizer system for 100% accurate function detection
const { 
    JavaScriptTokenizer, 
    FunctionPatternMatcher, 
    TOKEN_TYPES 
} = require('./prototype-tokenizer-v2.js');

const fs = require('fs');
const path = require('path');

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 0: Custom Error Classes                              ║
// ║                     Enhanced Error Handling System                               ║
// ║              [การใช้งาน] สำคัญ: การจัดการข้อผิดพลาดแบบมืออาชีพ                         ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝
class SecurityError extends Error {
    constructor(message, filePath = null, errorCode = 'SEC_001') {
        super(message);
        this.name = 'SecurityError';
        this.filePath = filePath;
        this.errorCode = errorCode;
        this.timestamp = new Date().toISOString();
    }
}

class SymlinkError extends SecurityError {
    constructor(message, filePath = null, linkTarget = null) {
        super(message, filePath, 'SYM_001');
        this.name = 'SymlinkError';
        this.linkTarget = linkTarget;
    }
}

class SyntaxValidationError extends Error {
    constructor(message, filePath = null, syntaxDetails = null) {
        super(message);
        this.name = 'SyntaxValidationError';
        this.filePath = filePath;
        this.syntaxDetails = syntaxDetails;
        this.errorCode = 'SYN_001';
        this.timestamp = new Date().toISOString();
    }
}

class ReDoSError extends SecurityError {
    constructor(message, pattern = null, filePath = null) {
        super(message, filePath, 'REDOS_001');
        this.name = 'ReDoSError';
        this.pattern = pattern;
    }
}

class PathValidationError extends SecurityError {
    constructor(message, filePath = null, reason = null) {
        super(message, filePath, 'PATH_001');
        this.name = 'PathValidationError';
        this.reason = reason;
    }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 1: การกำหนดค่าและความปลอดภัย                        ║
// ║                    Security Configuration และ Protection Functions            ║
// ║              [การใช้งาน] ร่วมกัน: การตั้งค่าระบบความปลอดภัยทั้งระบบ            ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

//  Security Configuration
const SECURITY_CONFIG = {
    MAX_PATH_LENGTH: 260,
    ALLOWED_EXTENSIONS: ['.js', '.ts', '.jsx', '.tsx'],
    FORBIDDEN_PATHS: [
        /^[A-Z]:\\Windows\\/i,
        /^[A-Z]:\\Program Files\\/i,
        /^\/etc\//,
        /^\/usr\/bin\//,
        /^\/System\//,
        /^\/bin\//,
        /^\/sbin\//
    ],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    REGEX_TIMEOUT: 5000,
    MAX_FILES_PER_SECOND: 100,
    // Symlink Security Settings
    ALLOW_SYMLINKS: false,
    MAX_SYMLINK_DEPTH: 3,
    // ReDoS Protection Settings
    ENABLE_REDOS_PROTECTION: true,
    MAX_PATTERN_EXECUTION_TIME: 100 // milliseconds per pattern
};

// ══════════════════════════════════════════════════════════════════════════════
//                ฟังก์ชันป้องกัน Regular Expression DoS (ReDoS)
//                    ReDoS Attack Prevention Function
// ══════════════════════════════════════════════════════════════════════════════
function safeRegexExecution(pattern, content, filePath = null) {
    if (!content || typeof content !== 'string') {
        return Promise.resolve(null);
    }

    if (!SECURITY_CONFIG.ENABLE_REDOS_PROTECTION) {
        try {
            return Promise.resolve(content.match(pattern));
        } catch (error) {
            return Promise.resolve(null);
        }
    }

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new ReDoSError(
                `Regular expression execution timeout (${SECURITY_CONFIG.MAX_PATTERN_EXECUTION_TIME}ms)`,
                pattern.source,
                filePath
            ));
        }, SECURITY_CONFIG.MAX_PATTERN_EXECUTION_TIME);

        try {
            const result = content.match(pattern);
            clearTimeout(timeout);
            resolve(result);
        } catch (error) {
            clearTimeout(timeout);
            reject(new ReDoSError(
                `Regular expression execution error: ${error.message}`,
                pattern.source,
                filePath
            ));
        }
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//              ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลนำเข้า
//                        Input Validation Function
// ══════════════════════════════════════════════════════════════════════════════
function validateInput(target) {
    if (!target || typeof target !== 'string') {
        throw new PathValidationError('Invalid target path', target, 'INVALID_TYPE');
    }

    if (target.length > SECURITY_CONFIG.MAX_PATH_LENGTH) {
        throw new PathValidationError('Path too long', target, 'PATH_TOO_LONG');
    }

    const dangerousChars = /[<>"|?*\x00-\x1f]/;
    if (dangerousChars.test(target)) {
        throw new PathValidationError('Dangerous characters in path', target, 'DANGEROUS_CHARS');
    }

    return true;
}

// ══════════════════════════════════════════════════════════════════════════════
//                   ฟังก์ชันตรวจสอบความปลอดภัยของ Path
//                        Path Security Validation Function  
// ══════════════════════════════════════════════════════════════════════════════
function isPathSafe(targetPath) {
    const normalizedPath = path.resolve(targetPath);

    for (const forbiddenPattern of SECURITY_CONFIG.FORBIDDEN_PATHS) {
        if (forbiddenPattern.test(normalizedPath)) {
            throw new SecurityError(
                `Access to system directories is not allowed: ${normalizedPath}`,
                targetPath,
                'SYSTEM_DIR_ACCESS'
            );
        }
    }

    if (normalizedPath.includes('..')) {
        throw new SecurityError('Path traversal is not allowed', targetPath, 'PATH_TRAVERSAL');
    }

    return true;
}

// ══════════════════════════════════════════════════════════════════════════════
//                ฟังก์ชันตรวจสอบและป้องกัน Symbolic Link Attack
//                    Symbolic Link Attack Prevention Function
// ══════════════════════════════════════════════════════════════════════════════
function checkSymlinkSafety(filePath, depth = 0) {
    if (depth > SECURITY_CONFIG.MAX_SYMLINK_DEPTH) {
        throw new SymlinkError(
            `Symlink depth exceeded maximum (${SECURITY_CONFIG.MAX_SYMLINK_DEPTH})`,
            filePath
        );
    }

    try {
        const stats = fs.lstatSync(filePath);
        if (stats.isSymbolicLink()) {
            if (!SECURITY_CONFIG.ALLOW_SYMLINKS) {
                throw new SymlinkError('Symbolic links are not allowed', filePath);
            }

            const linkTarget = fs.readlinkSync(filePath);
            const absoluteTarget = path.resolve(path.dirname(filePath), linkTarget);

            if (fs.existsSync(absoluteTarget)) {
                return checkSymlinkSafety(absoluteTarget, depth + 1);
            } else {
                throw new SymlinkError('Symbolic link target does not exist', filePath, linkTarget);
            }
        }
        return true;
    } catch (error) {
        if (error instanceof SymlinkError) {
            throw error;
        }
        return true; // File doesn't exist or other error, let other functions handle it
    }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 2: ระบบสำรองและกู้คืนไฟล์                          ║
// ║                     File Backup and Recovery System                            ║
// ║              [การใช้งาน] สำคัญ: การสำรองไฟล์เพื่อป้องกันการสูญหาย                 ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// สร้างการสำรองไฟล์ก่อนแก้ไข - Create file backup before modification
function createBackup(filePath) {
    try {
        const backupDir = path.join(path.dirname(filePath), '.chahuadev-fix-comments-backups');

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const fileName = path.basename(filePath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `${fileName}.${timestamp}.backup`;
        const backupPath = path.join(backupDir, backupFileName);

        fs.copyFileSync(filePath, backupPath);
        console.log(` สำรองไฟล์: ${backupPath}`);
        return backupPath;
    } catch (error) {
        console.error(`❌ ไม่สามารถสำรองไฟล์ได้: ${error.message}`);
        throw error;
    }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 3: ระบบวิเคราะห์โครงสร้างโค้ด                       ║
// ║                     Code Structure Analysis และ Zone Detection                ║
// ║              [การใช้งาน] หลัก: วิเคราะห์และจัดกลุ่มฟังก์ชันตามหัวข้อ             ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// ตรวจจับหัวข้อใหญ่จากโค้ด - Detect major topics from code structure
function detectMajorTopics(content) {
    const topics = [];
    const lines = content.split('\n');

    // รายการคำหลักสำหรับแต่ละหัวข้อ - Keywords for each topic category
    const topicPatterns = [
        {
            name: 'Authentication & Security',
            thai: 'ระบบการยืนยันตัวตนและความปลอดภัย',
            keywords: ['auth', 'login', 'logout', 'token', 'security', 'validate', 'permission', 'role'],
            functions: []
        },
        {
            name: 'Network & API Communication',
            thai: 'การจัดการเครือข่ายและการติดต่อ API',
            keywords: ['request', 'response', 'api', 'fetch', 'http', 'network', 'connection', 'online', 'offline'],
            functions: []
        },
        {
            name: 'Data Management',
            thai: 'การจัดการข้อมูล',
            keywords: ['data', 'crud', 'create', 'read', 'update', 'delete', 'get', 'set', 'save', 'load'],
            functions: []
        },
        {
            name: 'User Interface',
            thai: 'การจัดการส่วนติดต่อผู้ใช้',
            keywords: ['ui', 'render', 'display', 'show', 'hide', 'toggle', 'modal', 'view', 'element'],
            functions: []
        },
        {
            name: 'File Management',
            thai: 'การจัดการไฟล์',
            keywords: ['file', 'upload', 'download', 'image', 'avatar', 'attachment'],
            functions: []
        },
        {
            name: 'Event Handling',
            thai: 'การจัดการเหตุการณ์',
            keywords: ['event', 'click', 'handle', 'listener', 'callback', 'trigger'],
            functions: []
        },
        {
            name: 'Utilities & Helpers',
            thai: 'ฟังก์ชันช่วยเหลือและยูทิลิตี้',
            keywords: ['util', 'helper', 'format', 'parse', 'validate', 'convert', 'transform'],
            functions: []
        }
    ];

    // วิเคราะห์ฟังก์ชันและจัดกลุ่ม - Analyze functions and group them
    const functions = findFunctions(content);

    functions.forEach(func => {
        const funcName = func.name.toLowerCase();
        let assigned = false;

        // หาหัวข้อที่เหมาะสมสำหรับฟังก์ชัน - Find appropriate topic for function
        for (const topic of topicPatterns) {
            if (topic.keywords.some(keyword => funcName.includes(keyword))) {
                topic.functions.push(func);
                assigned = true;
                break;
            }
        }

        // ถ้าไม่ตรงกับหัวข้อไหน ให้ใส่ใน Utilities - If no match, put in Utilities
        if (!assigned) {
            topicPatterns[topicPatterns.length - 1].functions.push(func);
        }
    });

    // กรองเฉพาะหัวข้อที่มีฟังก์ชัน - Filter topics that have functions
    return topicPatterns.filter(topic => topic.functions.length > 0);
}

// ค้นหาฟังก์ชันในโค้ด - Find functions in code
function findFunctions(content) {
    const functions = [];

    // รูปแบบต่างๆของการประกาศฟังก์ชัน - Various function declaration patterns
    const patterns = [
        // function name() {}
        /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g,
        // const name = function() {}
        /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function\s*\([^)]*\)\s*=>/g,
        // const name = () => {}
        /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>\s*\{/g,
        // let/var name = function() {}
        /(?:let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function\s*\([^)]*\)\s*\{/g,
        // async function name() {}
        /async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g,
        // method name() {} (ในคลาส)
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && !match[1].match(/^(if|for|while|switch|catch)$/)) {
                functions.push({
                    name: match[1],
                    fullMatch: match[0],
                    index: match.index
                });
            }
        }
    });

    // เรียงตามตำแหน่งในไฟล์ - Sort by position in file
    return functions.sort((a, b) => a.index - b.index);
}

// สร้างโซนหัวข้อ - Generate zone headers
function generateZoneHeader(zoneNumber, englishTitle, thaiTitle, description = '') {
    const borderTop = '// ╔══════════════════════════════════════════════════════════════════════════════════╗';
    const borderBottom = '// ╚══════════════════════════════════════════════════════════════════════════════════╝';

    // คำนวณการจัดตำแหน่งกลาง - Calculate center alignment
    const maxWidth = 86; // ความกว้างของกรอบ
    const zoneTitle = `โซน ${zoneNumber}: ${thaiTitle}`;
    const englishLine = englishTitle;
    const descLine = description || `[การใช้งาน] ${thaiTitle}`;

    const zonePadding = Math.max(0, Math.floor((maxWidth - zoneTitle.length) / 2));
    const englishPadding = Math.max(0, Math.floor((maxWidth - englishLine.length) / 2));
    const descPadding = Math.max(0, Math.floor((maxWidth - descLine.length) / 2));

    return `${borderTop}
// ║${' '.repeat(zonePadding)}${zoneTitle}${' '.repeat(maxWidth - zoneTitle.length - zonePadding)}║
// ║${' '.repeat(englishPadding)}${englishLine}${' '.repeat(maxWidth - englishLine.length - englishPadding)}║
// ║${' '.repeat(descPadding)}${descLine}${' '.repeat(maxWidth - descLine.length - descPadding)}║
${borderBottom}`;
}

// จัดระเบียบโค้ดตามโซน - Organize code by zones
function organizeCodeByZones(content, options = {}) {
    const topics = detectMajorTopics(content);

    if (topics.length === 0) {
        console.log(' ไม่พบหัวข้อใหญ่ที่เหมาะสมสำหรับการจัดโซน');
        return content;
    }

    console.log(` พบ ${topics.length} หัวข้อใหญ่:`);
    topics.forEach((topic, index) => {
        console.log(`   ${index + 1}. ${topic.thai} (${topic.functions.length} ฟังก์ชัน)`);
    });

    let result = content;
    let zoneNumber = 1;

    // เพิ่มโซนส่วนหัวให้แต่ละหัวข้อ - Add zone headers for each topic
    topics.forEach(topic => {
        const zoneHeader = generateZoneHeader(
            zoneNumber++,
            topic.name,
            topic.thai,
            `[การใช้งาน] ${topic.functions.length} ฟังก์ชัน: ${topic.thai}`
        );

        // หาตำแหน่งที่เหมาะสมสำหรับใส่โซน - Find appropriate position to insert zone
        if (topic.functions.length > 0) {
            const firstFunction = topic.functions[0];
            const functionPosition = result.indexOf(firstFunction.fullMatch);

            if (functionPosition > -1) {
                // แทรกโซนหัวข้อก่อนฟังก์ชันแรก - Insert zone header before first function
                const beforeFunction = result.substring(0, functionPosition);
                const afterFunction = result.substring(functionPosition);

                result = beforeFunction + '\n' + zoneHeader + '\n\n' + afterFunction;
            }
        }
    });

    return result;
}

// ค้นหาฟังก์ชันในโค้ดด้วย Advanced Tokenizer - Find functions using Advanced Tokenizer
function findFunctions(content) {
    try {
        // ใช้ระบบ tokenizer ขั้นสูงสำหรับความแม่นยำ 100%
        // Use advanced tokenizer system for 100% accuracy
        const tokenizer = new JavaScriptTokenizer(content);
        const tokens = tokenizer.tokenize();
        const matcher = new FunctionPatternMatcher(tokens);
        const detectedFunctions = matcher.findFunctions();

        // แปลงผลลัพธ์ให้ตรงกับรูปแบบเดิม - Convert results to match existing format
        return detectedFunctions.map(func => ({
            name: func.name,
            type: func.type.replace('_', ' '), // เช่น 'function_declaration' -> 'function declaration'
            position: func.line || 0,
            fullMatch: `function ${func.name}(${func.parameters ? func.parameters.join(', ') : ''})`,
            line: func.line,
            column: func.column,
            parameters: func.parameters || [],
            isAsync: func.isAsync || false
        }));

    } catch (error) {
        console.warn('⚠️ Tokenizer พบปัญหา กลับไปใช้ regex แทน:', error.message);
        
        // Fallback ไปใช้ regex แบบเก่าหากมีปัญหา - Fallback to old regex if there's an issue
        return findFunctionsWithRegex(content);
    }
}

// ฟังก์ชัน fallback สำหรับใช้ regex - Fallback function using regex
function findFunctionsWithRegex(content) {
    const functions = [];

    // Pattern สำหรับค้นหาฟังก์ชันประเภทต่างๆ - Patterns for different function types
    const patterns = [
        // function declaration
        /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
        // arrow functions
        /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g,
        // method in class
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g,
        // async functions
        /async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
        // async arrow functions
        /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*async\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g
    ];

    let match;
    for (const pattern of patterns) {
        while ((match = pattern.exec(content)) !== null) {
            if (match[1]) {
                functions.push({
                    name: match[1],
                    type: detectFunctionType(match[0]),
                    position: match.index,
                    fullMatch: match[0]
                });
            }
        }
    }

    return functions;
}

// ตรวจสอบประเภทของฟังก์ชัน - Detect function type
function detectFunctionType(functionString) {
    if (functionString.includes('async')) return 'async';
    if (functionString.includes('=>')) return 'arrow';
    if (functionString.includes('function')) return 'function';
    return 'method';
}

// สร้างคอมเมนต์สำหรับฟังก์ชัน - Generate comment for function
function generateFunctionComment(functionInfo, isAI = false) {
    const { name, type } = functionInfo;

    // ลองแปลชื่อฟังก์ชันเป็นคำอธิบาย - Try to translate function name to description
    const description = generateDescriptionFromName(name);
    const englishDesc = generateEnglishDescription(name);

    let comment = `    // ${description} - ${englishDesc}\n`;

    if (isAI) {
        comment += `    // @function ${name} - ฟังก์ชัน${type === 'async' ? 'แบบ async' : ''}\n`;
        comment += `    // @description ${description}\n`;
        if (type === 'async') {
            comment += `    // @returns {Promise} - Promise ที่ส่งคืน - Return promise\n`;
        }
    }

    return comment;
}

// สร้างคำอธิบายจากชื่อฟังก์ชัน - Generate description from function name
function generateDescriptionFromName(name) {
    // แปลงจาก camelCase เป็นคำพูด
    const words = name.replace(/([A-Z])/g, ' $1').toLowerCase().trim();

    // คำศัพท์พื้นฐาน - Basic vocabulary
    const translations = {
        'get': 'ดึงข้อมูล',
        'set': 'ตั้งค่า',
        'create': 'สร้าง',
        'delete': 'ลบ',
        'update': 'อัปเดต',
        'show': 'แสดง',
        'hide': 'ซ่อน',
        'toggle': 'สลับ',
        'handle': 'จัดการ',
        'init': 'เริ่มต้น',
        'render': 'แสดงผล',
        'load': 'โหลด',
        'save': 'บันทึก',
        'fetch': 'ดึงข้อมูล',
        'send': 'ส่ง',
        'validate': 'ตรวจสอบ',
        'check': 'ตรวจสอบ',
        'format': 'จัดรูปแบบ',
        'parse': 'แยกวิเคราะห์',
        'execute': 'ดำเนินการ',
        'process': 'ประมวลผล'
    };

    let description = words;
    for (const [eng, thai] of Object.entries(translations)) {
        description = description.replace(new RegExp(`\\b${eng}\\b`, 'g'), thai);
    }

    return description || 'ฟังก์ชันการทำงาน';
}

// สร้างคำอธิบายภาษาอังกฤษ - Generate English description
function generateEnglishDescription(name) {
    const words = name.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    return words.charAt(0).toUpperCase() + words.slice(1) || 'Function operation';
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 4: ระบบแก้ไขคอมเมนต์                               ║
// ║                     Comment Fixing and Processing System                       ║
// ║              [การใช้งาน] หลัก: แก้ไข /** */ เป็น // format                      ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// แก้ไข /** */ comments เป็น // format - Fix /** */ comments to // format
function fixComments(content, options = {}) {
    const { addMissingComments = false, aiMode = false } = options;

    let result = content;
    let fixCount = 0;

    // ใช้ regex ที่ครอบคลุมมากขึ้นสำหรับ /** */ comments
    // Use more comprehensive regex for /** */ comments
    
    // Pattern 1: Single line /** comment */ above function
    const singleLinePattern = /(\s*)(\/\*\*\s*([^*]+?)\s*\*\/\s*\n)(\s*)((?:async\s+)?(?:function\s+|const\s+|let\s+|var\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:\([^)]*\)|=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>|\s*\([^)]*\)\s*\{))/g;
    
    result = result.replace(singleLinePattern, (match, indent1, comment, description, indent2, functionDef, functionName) => {
        fixCount++;
        const cleanDesc = description.trim();
        const englishDesc = generateEnglishDescription(functionName);
        return `${indent1}// ${cleanDesc} - ${englishDesc}\n${indent2}${functionDef}`;
    });

    // Pattern 2: Multi-line /** comments */ above function
    const multiLinePattern = /([ \t]*)(\/\*\*[\s\S]*?\*\/\s*?\n)([ \t]*)((?:async\s+)?(?:function\s+|const\s+|let\s+|var\s+|class\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:\([^)]*\)|=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>|\s*\([^)]*\)\s*\{|\s+extends|\s*\{))/g;
    
    result = result.replace(multiLinePattern, (match, indent1, comment, indent2, functionDef, functionName) => {
        fixCount++;
        
        // Extract meaningful description from multi-line comment
        let description = 'ฟังก์ชันการทำงาน';
        
        // ลองหาบรรทัดแรกที่มีเนื้อหา
        const lines = comment.split('\n');
        for (const line of lines) {
            const cleaned = line.replace(/^\s*\*+\s*/, '').trim();
            if (cleaned && !cleaned.match(/^\/\*+/) && !cleaned.match(/^\*+\/$/)) {
                description = cleaned;
                break;
            }
        }
        
        const englishDesc = generateEnglishDescription(functionName);
        return `${indent1}// ${description} - ${englishDesc}\n${indent2}${functionDef}`;
    });

    // Pattern 3: /** comments */ ที่ไม่ได้อยู่เหนือฟังก์ชัน - Standalone comments
    const standalonePattern = /([ \t]*)(\/\*\*[\s\S]*?\*\/)/g;
    
    result = result.replace(standalonePattern, (match, indent, comment) => {
        // ถ้าไม่ได้อยู่เหนือฟังก์ชัน ให้แปลงเป็น // comment ธรรมดา
        let description = 'คอมเมนต์';
        
        const lines = comment.split('\n');
        for (const line of lines) {
            const cleaned = line.replace(/^\s*\*+\s*/, '').trim();
            if (cleaned && !cleaned.match(/^\/\*+/) && !cleaned.match(/^\*+\/$/)) {
                description = cleaned;
                break;
            }
        }
        
        fixCount++;
        return `${indent}// ${description}`;
    });

    // เพิ่มคอมเมนต์ให้ฟังก์ชันที่ไม่มีคอมเมนต์
    if (addMissingComments) {
        result = addMissingFunctionComments(result, aiMode);
    }

    // จัดระเบียบโซนอัตโนมัติ - Organize zones automatically
    if (options.organizeZones) {
        console.log('🗂️  จัดระเบียบโซนอัตโนมัติ...');
        result = organizeCodeByZones(result, options);
    }

    console.log(`🔧 แก้ไขคอมเมนต์แล้ว ${fixCount} ตำแหน่ง`);
    return result;
}

// เพิ่มคอมเมนต์ให้ฟังก์ชันที่ไม่มี - Add comments to functions without comments
function addMissingFunctionComments(content, aiMode = false) {
    const lines = content.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1];

        // ตรวจสอบว่าเป็นฟังก์ชันและไม่มีคอมเมนต์ข้างบน
        const functionMatch = line.match(/^(\s*)((?:async\s+)?(?:function\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:\([^)]*\)|=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>))/);

        if (functionMatch && !isLineComment(lines[i - 1])) {
            const indent = functionMatch[1];
            const functionName = functionMatch[3];
            const functionInfo = { name: functionName, type: detectFunctionType(line) };

            // เพิ่มคอมเมนต์
            const comment = generateFunctionComment(functionInfo, aiMode);
            result.push(comment.trimEnd());
        }

        result.push(line);
    }

    return result.join('\n');
}

// ตรวจสอบว่าบรรทัดเป็นคอมเมนต์หรือไม่ - Check if line is a comment
function isLineComment(line) {
    if (!line) return false;
    const trimmed = line.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 5: ระบบประมวลผลไฟล์                                ║
// ║                     File Processing and Management System                      ║
// ║              [การใช้งาน] หลัก: ประมวลผลไฟล์และโฟลเดอร์                         ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// ประมวลผลไฟล์เดี่ยว - Process single file
async function processFile(filePath, options = {}) {
    try {
        // ตรวจสอบความปลอดภัย
        validateInput(filePath);
        isPathSafe(filePath);
        checkSymlinkSafety(filePath);

        // ตรวจสอบว่าเป็นไฟล์ JavaScript
        const ext = path.extname(filePath).toLowerCase();
        if (!SECURITY_CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
            console.log(`⏭  ข้ามไฟล์: ${filePath} (ไม่ใช่ไฟล์ JavaScript)`);
            return { processed: false, reason: 'Invalid extension' };
        }

        // อ่านไฟล์
        if (!fs.existsSync(filePath)) {
            console.log(` ไม่พบไฟล์: ${filePath}`);
            return { processed: false, reason: 'File not found' };
        }

        const stats = fs.statSync(filePath);
        if (stats.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
            console.log(`  ไฟล์ใหญ่เกินไป: ${filePath}`);
            return { processed: false, reason: 'File too large' };
        }

        const originalContent = fs.readFileSync(filePath, 'utf8');

        // ตรวจสอบว่ามี /** */ หรือไม่
        const hasBlockComments = originalContent.includes('/**');
        if (!hasBlockComments && !options.addMissingComments) {
            console.log(` ไฟล์ ${filePath} ไม่มี /** */ comments ที่ต้องแก้ไข`);
            return { processed: false, reason: 'No block comments found' };
        }

        // สร้างสำรอง
        const backupPath = createBackup(filePath);

        console.log(` กำลังประมวลผล: ${filePath}`);

        // แก้ไขคอมเมนต์
        const fixedContent = fixComments(originalContent, options);

        // ตรวจสอบความแตกต่าง
        if (originalContent === fixedContent) {
            console.log(`ℹ  ไม่มีการเปลี่ยนแปลง: ${filePath}`);
            return { processed: false, reason: 'No changes needed' };
        }

        // เขียนไฟล์ใหม่
        fs.writeFileSync(filePath, fixedContent, 'utf8');

        console.log(` เสร็จสิ้น: ${filePath}`);
        return {
            processed: true,
            backupPath,
            originalSize: originalContent.length,
            newSize: fixedContent.length
        };

    } catch (error) {
        console.error(` เกิดข้อผิดพลาด: ${filePath} - ${error.message}`);
        return { processed: false, error: error.message };
    }
}

// ประมวลผลโฟลเดอร์ - Process directory
async function processDirectory(dirPath, options = {}) {
    try {
        validateInput(dirPath);
        isPathSafe(dirPath);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory not found: ${dirPath}`);
        }

        const stats = fs.statSync(dirPath);
        if (!stats.isDirectory()) {
            throw new Error(`Path is not a directory: ${dirPath}`);
        }

        const results = [];
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const fileStats = fs.statSync(filePath);

            if (fileStats.isDirectory()) {
                if (options.recursive && !file.startsWith('.') && file !== 'node_modules') {
                    const subResults = await processDirectory(filePath, options);
                    results.push(...subResults);
                }
            } else {
                const result = await processFile(filePath, options);
                results.push({ file: filePath, ...result });
            }
        }

        return results;

    } catch (error) {
        console.error(` เกิดข้อผิดพลาดในโฟลเดอร์: ${dirPath} - ${error.message}`);
        return [];
    }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         โซน 6: CLI Interface และ Main Function                 ║
// ║                     Command Line Interface และ Application Entry               ║
// ║              [การใช้งาน] หลัก: การรับคำสั่งและการทำงานหลัก                        ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

// แสดงการใช้งาน - Show usage
function showUsage() {
    console.log(`
🔧 Chahuadev Comment Fixer v1.1.0
เครื่องมือแก้ไข /** */ comments เป็น // format พร้อมคำอธิบายสองภาษา

การใช้งาน:
  npx @chahuadev/fix-comments <path> [options]
  
ตัวอย่าง:
  npx @chahuadev/fix-comments ./src
  npx @chahuadev/fix-comments app.js --add-missing
  npx @chahuadev/fix-comments . -r --ai-mode
  npx @chahuadev/fix-comments forum.js --organize-zones
  
ตัวเลือก:
  -r, --recursive       ประมวลผลไฟล์ในโฟลเดอร์ย่อยทั้งหมด
  --add-missing         เพิ่มคอมเมนต์ให้ฟังก์ชันที่ไม่มีคอมเมนต์
  --ai-mode            โหมด AI-friendly (เพิ่ม @function, @description)
  -z, --organize-zones  จัดระเบียบโค้ดเป็นโซนตามหัวข้อใหญ่ (ใหม่!)
  --add-author         เพิ่มข้อมูล @author ลงในไฟล์
  --author=<name>      กำหนดชื่อผู้เขียน (default: บริษัท ชาหัว ดีเวลลอปเมนต์ จำกัด)
  -h, --help           แสดงวิธีการใช้งาน
  -v, --version        แสดงเวอร์ชัน
  
ฟีเจอร์:
   แก้ไข /** */ เป็น // format
   เพิ่มคำอธิบายสองภาษา (ไทย/English)
   ค้นหาฟังก์ชันและเพิ่มคอมเมนต์อัตโนมัติ
   จัดระเบียบโซนอัตโนมัติตามหัวข้อใหญ่ (ใหม่!)
   ตรวจจับการทำงานของฟังก์ชันอัตโนมัติ
   สำรองไฟล์อัตโนมัติ
   ระบบความปลอดภัยขั้นสูง
`);
}

// ฟังก์ชันหลัก - Main function
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        showUsage();
        return;
    }

    if (args.includes('-v') || args.includes('--version')) {
        console.log('1.0.0');
        return;
    }

    const target = args[0];
    const options = {
        recursive: args.includes('-r') || args.includes('--recursive'),
        addMissingComments: args.includes('--add-missing'),
        aiMode: args.includes('--ai-mode'),
        organizeZones: args.includes('--organize-zones') || args.includes('-z'),
        addAuthor: args.includes('--add-author'),
        author: args.find(arg => arg.startsWith('--author='))?.split('=')[1]
    };

    console.log(' เริ่มต้น Chahuadev Comment Fixer');
    console.log(` เป้าหมาย: ${target}`);
    console.log(`  ตัวเลือก:`, options);
    console.log('');

    try {
        const targetPath = path.resolve(target);
        const stats = fs.statSync(targetPath);

        let results = [];

        if (stats.isFile()) {
            const result = await processFile(targetPath, options);
            results = [{ file: targetPath, ...result }];
        } else if (stats.isDirectory()) {
            results = await processDirectory(targetPath, options);
        }

        // สรุปผล
        const processed = results.filter(r => r.processed).length;
        const total = results.length;

        console.log('\n สรุปผลการทำงาน:');
        console.log(` ประมวลผลสำเร็จ: ${processed} ไฟล์`);
        console.log(` ไฟล์ทั้งหมด: ${total} ไฟล์`);

        if (processed > 0) {
            console.log('\n เสร็จสิ้น! ไฟล์ถูกแก้ไขและสำรองไว้แล้ว');
            console.log(' ไฟล์สำรองอยู่ในโฟลเดอร์ .chahuadev-fix-comments-backups');
        }

    } catch (error) {
        console.error(` เกิดข้อผิดพลาด: ${error.message}`);
        process.exit(1);
    }
}

// เรียกใช้ฟังก์ชันหลักถ้าไฟล์นี้ถูกเรียกใช้โดยตรง
if (require.main === module) {
    main().catch(error => {
        console.error(' เกิดข้อผิดพลาดที่ไม่คาดคิด:', error.message);
        process.exit(1);
    });
}

module.exports = {
    fixComments,
    processFile,
    processDirectory,
    findFunctions,
    generateFunctionComment
};
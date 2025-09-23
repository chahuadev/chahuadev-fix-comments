#!/usr/bin/env node

// ======================================================================
// Universal Comment Fixer v1.2.0/เครื่องมือแก้ไขคอมเมนต์สากล v1.2.0
// ======================================================================

// @author บริษัท ชาหัว ดีเวลลอปเมนต์ จำกัด (Chahua Development Co., Ltd.)
// @version 1.2.0
// @description Professional comment standardization tool with AI-friendly format
// @security_features Path Traversal Protection, File Size Limits, Symlink Protection

//  SECURITY FEATURES:
// ┌─────────────────────────────────────────────────────────────────┐
// │ • Path Traversal Protection: Prevents ../../../etc/passwd attacks │
// │ • File Size Limits: 10MB maximum to prevent DoS attacks          │
// │ • Symbolic Link Protection: Prevents infinite loop attacks        │
// │ • System Directory Blacklist: Blocks access to sensitive paths    │
// │ • Backup Path Validation: Secure backup creation with sanitization │
// │ • Working Directory Enforcement: All operations within project     │
// └─────────────────────────────────────────────────────────────────┘

const fs = require('fs');
const path = require('path');

// ======================================================================
// JavaScript Tokenizer Engine/เครื่องมือ Tokenizer ของ JavaScript
// ======================================================================

// Token types:ประเภทของโทเค็น
const TOKEN_TYPES = {
    // คำหลัก - Keywords
    KEYWORD: 'KEYWORD',

    // ชื่อตัวแปร/ฟังก์ชัน - Identifiers
    IDENTIFIER: 'IDENTIFIER',

    // เครื่องหมาย - Operators and punctuation
    EQUALS: 'EQUALS',           // =
    ARROW: 'ARROW',             // =>
    PAREN_OPEN: 'PAREN_OPEN',   // (
    PAREN_CLOSE: 'PAREN_CLOSE', // )
    BRACE_OPEN: 'BRACE_OPEN',   // {
    BRACE_CLOSE: 'BRACE_CLOSE', // }
    SEMICOLON: 'SEMICOLON',     // ;
    COMMA: 'COMMA',             // ,

    // คอมเมนต์ - Comments
    LINE_COMMENT: 'LINE_COMMENT',     // //
    BLOCK_COMMENT: 'BLOCK_COMMENT',   // /* */

    // สตริง - Strings
    STRING: 'STRING',

    // ตัวเลข - Numbers
    NUMBER: 'NUMBER',

    // ช่องว่าง - Whitespace
    WHITESPACE: 'WHITESPACE',
    NEWLINE: 'NEWLINE',

    // จุดสิ้นสุด - End of file
    EOF: 'EOF'
};

// คำหลักของ JavaScript - JavaScript keywords
const KEYWORDS = new Set([
    'function', 'const', 'let', 'var', 'async', 'await',
    'class', 'constructor', 'static', 'get', 'set', 'abstract',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'return', 'break', 'continue', 'throw', 'try', 'catch',
    'import', 'export', 'default', 'from', 'as'
]);

// ======================================================================
// Security Manager สำหรับ Parser/ระบบจัดการความปลอดภัยสำหรับ Parser
// ======================================================================
class TokenizerSecurityManager {
    constructor(options = {}) {
        // SECURITY: กำหนดขีดจำกัดการทำงานเพื่อป้องกัน DoS attacks
        this.MAX_DEPTH = options.maxDepth || 100;           // ความลึกสูงสุดของ nested structures
        this.MAX_TOKENS = options.maxTokens || 500000;      // จำนวน token สูงสุด
        this.MAX_PARSING_TIME = options.maxParsingTime || 30000; // เวลาประมวลผลสูงสุด (30 วินาที)
        this.MAX_LOOP_ITERATIONS = options.maxLoopIterations || 1000000; // จำนวนการวนลูปสูงสุด

        this.startTime = null;
        this.iterationCount = 0;
        this.currentDepth = 0;
        this.warnings = [];
    }

    // เริ่มต้นการตรวจสอบ
    startParsing() {
        this.startTime = Date.now();
        this.iterationCount = 0;
        this.currentDepth = 0;
        this.warnings = [];
    }

    // ตรวจสอบการวนลูปแต่ละครั้ง
    checkIteration() {
        this.iterationCount++;

        // ตรวจสอบ timeout
        if (this.startTime && (Date.now() - this.startTime) > this.MAX_PARSING_TIME) {
            throw new Error(`SECURITY: Parsing timeout after ${this.MAX_PARSING_TIME}ms. File may contain malicious patterns.`);
        }

        // ตรวจสอบจำนวนการวนลูป
        if (this.iterationCount > this.MAX_LOOP_ITERATIONS) {
            throw new Error(`SECURITY: Too many parsing iterations (${this.MAX_LOOP_ITERATIONS}). File may contain complexity attack patterns.`);
        }
    }

    // ตรวจสอบความลึก
    enterDepth() {
        this.currentDepth++;
        if (this.currentDepth > this.MAX_DEPTH) {
            throw new Error(`SECURITY: Parsing depth exceeded ${this.MAX_DEPTH} levels. File may contain deeply nested malicious structures.`);
        }
    }

    // ออกจากความลึก
    exitDepth() {
        if (this.currentDepth > 0) {
            this.currentDepth--;
        }
    }

    // ตรวจสอบจำนวน tokens
    checkTokenCount(tokenCount) {
        if (tokenCount > this.MAX_TOKENS) {
            throw new Error(`SECURITY: Token count exceeded ${this.MAX_TOKENS}. File too complex for safe processing.`);
        }
    }

    // เพิ่มคำเตือน
    addWarning(message) {
        this.warnings.push(`SECURITY WARNING: ${message}`);
    }

    // รับสถิติ
    getStats() {
        return {
            processingTime: this.startTime ? Date.now() - this.startTime : 0,
            iterations: this.iterationCount,
            maxDepth: this.currentDepth,
            warnings: this.warnings
        };
    }
}

// JavaScript Tokenizer:โทเค็นไนเซอร์ JavaScript
class JavaScriptTokenizer {
    constructor(code, securityOptions = {}) {
        this.code = code;
        this.cursor = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        // SECURITY: เพิ่ม Security Manager
        this.security = new TokenizerSecurityManager(securityOptions);
    }

    // แปลงโค้ดทั้งหมดเป็น tokens - Tokenize entire code
    tokenize() {
        // SECURITY: เริ่มต้นการตรวจสอบ
        this.security.startParsing();

        try {
            while (this.cursor < this.code.length) {
                // SECURITY: ตรวจสอบในแต่ละการวนลูป
                this.security.checkIteration();
                this.readNextToken();
            }

            // SECURITY: ตรวจสอบจำนวน tokens ทั้งหมด
            this.security.checkTokenCount(this.tokens.length);

            // เพิ่ม EOF token
            this.addToken(TOKEN_TYPES.EOF, '', this.line, this.column);

            // แสดงสถิติความปลอดภัยถ้ามีคำเตือน
            const stats = this.security.getStats();
            if (stats.warnings.length > 0) {
                console.warn('Tokenizer Security Warnings:');
                stats.warnings.forEach(warning => console.warn(` - ${warning}`));
            }

            return this.tokens;
        } catch (error) {
            // รายงานข้อผิดพลาดด้านความปลอดภัย
            if (error.message.includes('SECURITY:')) {
                console.error(`SECURITY ALERT: ${error.message}`);
                console.error('File processing stopped for security reasons.');
            }
            throw error;
        }
    }

    // อ่าน token ถัดไป - Read next token
    readNextToken() {
        const char = this.currentChar();

        // ข้ามช่องว่าง - Skip whitespace
        if (this.isWhitespace(char)) {
            this.readWhitespace();
            return;
        }

        // อ่านบรรทัดใหม่ - Read newline
        if (char === '\n') {
            this.addToken(TOKEN_TYPES.NEWLINE, char, this.line, this.column);
            this.advance();
            this.line++;
            this.column = 1;
            return;
        }

        // อ่านตัวอักษร (identifier หรือ keyword) - Read letters
        if (this.isLetter(char) || char === '_' || char === '$') {
            this.readIdentifierOrKeyword();
            return;
        }

        // อ่านตัวเลข - Read numbers
        if (this.isDigit(char)) {
            this.readNumber();
            return;
        }

        // อ่านสตริง - Read strings
        if (char === '"' || char === "'" || char === '`') {
            this.readString(char);
            return;
        }

        // อ่านคอมเมนต์ - Read comments
        if (char === '/' && this.peek() === '/') {
            this.readLineComment();
            return;
        }

        if (char === '/' && this.peek() === '*') {
            this.readBlockComment();
            return;
        }

        // อ่าน arrow function (=>) - Read arrow operator
        if (char === '=' && this.peek() === '>') {
            this.addToken(TOKEN_TYPES.ARROW, '=>', this.line, this.column);
            this.advance(2);
            return;
        }

        // อ่านเครื่องหมายต่างๆ - Read operators and punctuation
        this.readOperatorOrPunctuation(char);
    }

    // อ่าน identifier หรือ keyword - Read identifier or keyword
    readIdentifierOrKeyword() {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        while (this.cursor < this.code.length &&
            (this.isAlphaNumeric(this.currentChar()) ||
                this.currentChar() === '_' ||
                this.currentChar() === '$')) {
            value += this.currentChar();
            this.advance();
        }

        const type = KEYWORDS.has(value) ? TOKEN_TYPES.KEYWORD : TOKEN_TYPES.IDENTIFIER;
        this.addToken(type, value, startLine, startColumn);
    }

    // อ่านตัวเลข - Read number
    readNumber() {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        while (this.cursor < this.code.length && this.isDigit(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }

        // รองรับจุดทศนิยม - Support decimal points
        if (this.currentChar() === '.' && this.isDigit(this.peek())) {
            value += this.currentChar();
            this.advance();

            while (this.cursor < this.code.length && this.isDigit(this.currentChar())) {
                value += this.currentChar();
                this.advance();
            }
        }

        this.addToken(TOKEN_TYPES.NUMBER, value, startLine, startColumn);
    }

    // อ่านสตริง - Read string
    readString(quote) {
        const startLine = this.line;
        const startColumn = this.column;
        let value = quote;
        this.advance(); // ข้าม quote แรก

        while (this.cursor < this.code.length && this.currentChar() !== quote) {
            if (this.currentChar() === '\\') {
                value += this.currentChar();
                this.advance();
                if (this.cursor < this.code.length) {
                    value += this.currentChar();
                    this.advance();
                }
            } else {
                value += this.currentChar();
                this.advance();
            }
        }

        if (this.cursor < this.code.length) {
            value += this.currentChar(); // เพิ่ม quote ปิด
            this.advance();
        }

        this.addToken(TOKEN_TYPES.STRING, value, startLine, startColumn);
    }

    // อ่านคอมเมนต์บรรทัดเดียว - Read line comment
    readLineComment() {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        while (this.cursor < this.code.length && this.currentChar() !== '\n') {
            value += this.currentChar();
            this.advance();
        }

        this.addToken(TOKEN_TYPES.LINE_COMMENT, value, startLine, startColumn);
    }

    // อ่านคอมเมนต์บล็อค - Read block comment
    readBlockComment() {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        while (this.cursor < this.code.length - 1 &&
            !(this.currentChar() === '*' && this.peek() === '/')) {
            if (this.currentChar() === '\n') {
                this.line++;
                this.column = 1;
            }
            value += this.currentChar();
            this.advance();
        }

        if (this.cursor < this.code.length - 1) {
            value += this.currentChar(); // เพิ่ม *
            this.advance();
            value += this.currentChar(); // เพิ่ม /
            this.advance();
        }

        this.addToken(TOKEN_TYPES.BLOCK_COMMENT, value, startLine, startColumn);
    }

    // อ่านช่องว่าง - Read whitespace
    readWhitespace() {
        while (this.cursor < this.code.length && this.isWhitespace(this.currentChar())) {
            this.advance();
        }
    }

    // อ่านเครื่องหมายและตัวดำเนินการ - Read operators and punctuation
    readOperatorOrPunctuation(char) {
        const tokenMap = {
            '=': TOKEN_TYPES.EQUALS,
            '(': TOKEN_TYPES.PAREN_OPEN,
            ')': TOKEN_TYPES.PAREN_CLOSE,
            '{': TOKEN_TYPES.BRACE_OPEN,
            '}': TOKEN_TYPES.BRACE_CLOSE,
            ';': TOKEN_TYPES.SEMICOLON,
            ',': TOKEN_TYPES.COMMA
        };

        const type = tokenMap[char] || TOKEN_TYPES.IDENTIFIER;
        this.addToken(type, char, this.line, this.column);
        this.advance();
    }

    // Helper methods
    currentChar() {
        return this.cursor >= this.code.length ? '\0' : this.code[this.cursor];
    }

    peek(offset = 1) {
        const peekPos = this.cursor + offset;
        return peekPos >= this.code.length ? '\0' : this.code[peekPos];
    }

    advance(count = 1) {
        for (let i = 0; i < count && this.cursor < this.code.length; i++) {
            this.cursor++;
            this.column++;
        }
    }

    addToken(type, value, line, column) {
        this.tokens.push({
            type,
            value,
            line,
            column,
            position: this.cursor - value.length
        });
    }

    isWhitespace(char) {
        return char === ' ' || char === '\t' || char === '\r';
    }

    isLetter(char) {
        return /[a-zA-Z]/.test(char);
    }

    isDigit(char) {
        return /[0-9]/.test(char);
    }

    isAlphaNumeric(char) {
        return this.isLetter(char) || this.isDigit(char);
    }
}

// Function Pattern Matcher:ตัวจับรูปแบบฟังก์ชัน
class FunctionPatternMatcher {
    constructor(tokens, securityOptions = {}) {
        this.tokens = tokens.filter(t => t.type !== TOKEN_TYPES.WHITESPACE);
        this.functions = [];
        this.cursor = 0;
        this.scopeStack = []; // เก็บ scope ปัจจุบัน (global, class, function)
        this.braceDepth = 0;  // เก็บระดับ {}
        this.inClass = false; // ตรวจสอบว่าอยู่ใน class หรือไม่
        this.classNames = []; // เก็บชื่อคลาสที่พบ
        // SECURITY: เพิ่ม Security Manager
        this.security = new TokenizerSecurityManager(securityOptions);
    }

    // ค้นหาฟังก์ชันทั้งหมด - Find all functions
    findFunctions() {
        // SECURITY: เริ่มต้นการตรวจสอบ
        this.security.startParsing();

        try {
            this.buildScopeMap(); // สร้าง scope map ก่อน
            this.cursor = 0; // reset cursor

            while (this.cursor < this.tokens.length) {
                // SECURITY: ตรวจสอบในแต่ละการวนลูป
                this.security.checkIteration();

                const func = this.matchFunctionPattern();
                if (func) {
                    this.functions.push(func);
                } else {
                    this.cursor++;
                }
            }

            // แสดงสถิติความปลอดภัยถ้ามีคำเตือน
            const stats = this.security.getStats();
            if (stats.warnings.length > 0) {
                console.warn('Parser Security Warnings:');
                stats.warnings.forEach(warning => console.warn(` - ${warning}`));
            }

            return this.functions;
        } catch (error) {
            // รายงานข้อผิดพลาดด้านความปลอดภัย
            if (error.message.includes('SECURITY:')) {
                console.error(`SECURITY ALERT: ${error.message}`);
                console.error('Function parsing stopped for security reasons.');
            }
            throw error;
        }
    }

    // สร้าง scope map เพื่อเข้าใจโครงสร้างโค้ด
    buildScopeMap() {
        let braceDepth = 0;
        let inClass = false;
        let classDepth = -1;

        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];

            if (token.type === TOKEN_TYPES.KEYWORD && token.value === 'class') {
                inClass = true;
                classDepth = braceDepth + 1; // คลาสจะอยู่ในระดับ brace ถัดไป
            }

            if (token.type === TOKEN_TYPES.BRACE_OPEN) {
                braceDepth++;
                // SECURITY: ตรวจสอบความลึกเกินขีดจำกัด
                if (braceDepth > this.security.MAX_DEPTH) {
                    this.security.addWarning(`Deep nesting detected: ${braceDepth} levels (max recommended: ${this.security.MAX_DEPTH})`);
                    // ข้ามการประมวลผลในระดับที่ลึกเกินไป
                    continue;
                }
                this.security.enterDepth();
            }

            if (token.type === TOKEN_TYPES.BRACE_CLOSE) {
                braceDepth--;
                this.security.exitDepth();
                // ถ้าออกจากระดับคลาส
                if (inClass && braceDepth < classDepth) {
                    inClass = false;
                    classDepth = -1;
                }
            }

            // เก็บข้อมูล scope ใน token
            token.inClass = inClass;
            token.braceDepth = braceDepth;
        }
    }

    // ตรวจสอบรูปแบบฟังก์ชัน - Match function patterns
    matchFunctionPattern() {
        // ตรวจสอบว่าอยู่ในคอมเมนต์หรือสตริงหรือไม่
        if (this.isInCommentOrString()) {
            return null;
        }

        // เรียงลำดับการตรวจสอบให้ถูกต้อง
        return this.matchClassDeclaration() ||
            this.matchFunctionDeclaration() ||
            this.matchArrowFunction() ||
            this.matchAsyncFunction() ||
            this.matchAsyncClassMethod() ||
            this.matchGetter() ||
            this.matchSetter() ||
            this.matchStaticMethod() ||
            this.matchClassMethod();
    }

    // รูปแบบ: function name() {} - Function declaration pattern
    matchFunctionDeclaration() {
        // รูปแบบปกติ: function name() {}
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'function' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const functionToken = this.currentToken();
            const nameToken = this.peekToken(1);
            const params = this.extractParameters(this.cursor + 2);

            this.cursor += 3; // ข้าม 'function', name, '('

            return {
                type: 'function_declaration',
                name: nameToken.value,
                line: functionToken.line,
                column: functionToken.column,
                parameters: params,
                isAsync: false
            };
        }

        // รูปแบบ generator: function* name() {}
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'function' &&
            this.peekToken(1)?.value === '*' &&
            this.peekToken(2)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(3)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const functionToken = this.currentToken();
            const nameToken = this.peekToken(2);

            // กรองชื่อที่ไม่ถูกต้อง - ป้องกันการใช้ * เป็นชื่อ
            if (!nameToken.value ||
                nameToken.value.trim() === '' ||
                nameToken.value === '*' ||
                nameToken.value.includes('*') ||
                /^[^\w]/.test(nameToken.value) ||
                nameToken.value.length < 2) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 3);
            this.cursor += 4; // ข้าม 'function', '*', name, '('

            return {
                type: 'generator_function',
                name: nameToken.value,
                line: functionToken.line,
                column: functionToken.column,
                parameters: params,
                isAsync: false,
                isGenerator: true
            };
        }

        // รูปแบบ const name = function* () {}
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            (this.currentToken()?.value === 'const' || this.currentToken()?.value === 'let' || this.currentToken()?.value === 'var') &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.EQUALS &&
            this.peekToken(3)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(3)?.value === 'function' &&
            this.peekToken(4)?.value === '*') {

            const keywordToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // กรองชื่อที่ไม่ถูกต้อง
            if (!nameToken.value ||
                nameToken.value.trim() === '' ||
                nameToken.value === '*' ||
                nameToken.value.includes('*') ||
                /^[^\w]/.test(nameToken.value) ||
                nameToken.value.length < 2) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 5);
            this.cursor += 6; // ข้าม keyword, name, '=', 'function', '*', '('

            return {
                type: 'generator_function',
                name: nameToken.value,
                line: keywordToken.line,
                column: keywordToken.column,
                parameters: params,
                isAsync: false,
                isGenerator: true
            };
        }

        return null;
    }

    // รูปแบบ: const name = () => {} - Arrow function pattern
    matchArrowFunction() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            (this.currentToken()?.value === 'const' || this.currentToken()?.value === 'let' || this.currentToken()?.value === 'var') &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.EQUALS) {

            // หา arrow (=>) ในตำแหน่งที่เป็นไปได้
            let arrowPos = this.findArrowInRange(this.cursor + 3, this.cursor + 10);
            if (arrowPos !== -1) {
                const keywordToken = this.currentToken();
                const nameToken = this.peekToken(1);
                const params = this.extractParametersBeforeArrow(this.cursor + 3, arrowPos);

                this.cursor = arrowPos + 1;

                return {
                    type: 'arrow_function',
                    name: nameToken.value,
                    line: keywordToken.line,
                    column: keywordToken.column,
                    parameters: params,
                    isAsync: this.checkAsyncBeforeArrow(this.cursor - 5, arrowPos)
                };
            }
        }
        return null;
    }

    // รูปแบบ: async function name() {} - Async function pattern
    matchAsyncFunction() {
        // รูปแบบปกติ: async function name() {}
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'async' &&
            this.peekToken(1)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(1)?.value === 'function' &&
            this.peekToken(2)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(3)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const asyncToken = this.currentToken();
            const nameToken = this.peekToken(2);
            const params = this.extractParameters(this.cursor + 3);

            this.cursor += 4; // ข้าม 'async', 'function', name, '('

            return {
                type: 'async_function',
                name: nameToken.value,
                line: asyncToken.line,
                column: asyncToken.column,
                parameters: params,
                isAsync: true
            };
        }

        // รูปแบบ async generator: async function* name() {}
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'async' &&
            this.peekToken(1)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(1)?.value === 'function' &&
            this.peekToken(2)?.value === '*' &&
            this.peekToken(3)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(4)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const asyncToken = this.currentToken();
            const nameToken = this.peekToken(3);

            // กรองชื่อที่ไม่ถูกต้อง
            if (!nameToken.value ||
                nameToken.value.trim() === '' ||
                nameToken.value === '*' ||
                nameToken.value.includes('*') ||
                /^[^\w]/.test(nameToken.value) ||
                nameToken.value.length < 2) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 4);
            this.cursor += 5; // ข้าม 'async', 'function', '*', name, '('

            return {
                type: 'async_generator_function',
                name: nameToken.value,
                line: asyncToken.line,
                column: asyncToken.column,
                parameters: params,
                isAsync: true,
                isGenerator: true
            };
        }

        // รูปแบบ const name = async function* () {}
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            (this.currentToken()?.value === 'const' || this.currentToken()?.value === 'let' || this.currentToken()?.value === 'var') &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.EQUALS &&
            this.peekToken(3)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(3)?.value === 'async' &&
            this.peekToken(4)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(4)?.value === 'function' &&
            this.peekToken(5)?.value === '*') {

            const keywordToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // กรองชื่อที่ไม่ถูกต้อง
            if (!nameToken.value ||
                nameToken.value.trim() === '' ||
                nameToken.value === '*' ||
                nameToken.value.includes('*') ||
                /^[^\w]/.test(nameToken.value) ||
                nameToken.value.length < 2) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 6);
            this.cursor += 7; // ข้าม keyword, name, '=', 'async', 'function', '*', '('

            return {
                type: 'async_generator_function',
                name: nameToken.value,
                line: keywordToken.line,
                column: keywordToken.column,
                parameters: params,
                isAsync: true,
                isGenerator: true
            };
        }

        return null;
    }

    // รูปแบบ: methodName() {} (ในคลาส) - Class method pattern
    matchClassMethod() {
        const currentToken = this.currentToken();

        if (currentToken?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(1)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const nameToken = currentToken;

            // กรองคำที่ไม่ใช่ method
            const excludedNames = [
                'constructor', 'super', 'this', 'new', 'Map', 'Set', 'Array', 'Object', 'Promise',
                'console', 'Math', 'JSON', 'Date', 'String', 'Number', 'Boolean', 'Error',
                'require', 'module', 'exports', 'process', 'Buffer', 'setTimeout', 'setInterval',
                'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue'
            ];

            if (excludedNames.includes(nameToken.value)) {
                return null;
            }

            // กรอง operators และ keywords
            if (nameToken.value.length === 1 && /[+\-*/=<>!&|^%]/.test(nameToken.value)) {
                return null;
            }

            // ตรวจสอบว่าไม่ใช่การเรียกใช้ฟังก์ชัน (function call)
            const prevToken = this.peekToken(-1);
            if (prevToken && (prevToken.value === '.' || prevToken.value === 'new' || prevToken.type === TOKEN_TYPES.PAREN_CLOSE)) {
                return null;
            }

            // ตรวจสอบว่าอยู่ในคลาสหรือไม่โดยดูบริบทรอบข้าง
            if (!this.isInClassContext()) {
                return null;
            }

            // ตรวจสอบว่าต่อด้วย { (method body) หรือไม่
            const nextTokenAfterParen = this.findTokenAfterParentheses();
            if (!nextTokenAfterParen || nextTokenAfterParen.type !== TOKEN_TYPES.BRACE_OPEN) {
                return null;
            }

            // ตรวจสอบว่าไม่ใช่ชื่อที่ว่างเปล่าหรือมีแค่ symbols
            if (!nameToken.value || nameToken.value.trim() === '' || /^[^\w]/.test(nameToken.value)) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 1);
            this.cursor += 2; // ข้าม name, '('

            return {
                type: 'class_method',
                name: nameToken.value,
                line: nameToken.line,
                column: nameToken.column,
                parameters: params,
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: async methodName() {} (ในคลาส) - Async class method pattern
    matchAsyncClassMethod() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'async' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const asyncToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // ตรวจสอบว่าอยู่ในคลาสหรือไม่
            if (!this.isInClassContext()) {
                return null;
            }

            // กรองคำที่ไม่ใช่ method
            const excludedNames = [
                'constructor', 'super', 'this', 'new', 'Map', 'Set', 'Array', 'Object', 'Promise',
                'console', 'Math', 'JSON', 'Date', 'String', 'Number', 'Boolean', 'Error',
                'require', 'module', 'exports', 'process', 'Buffer', 'setTimeout', 'setInterval',
                'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue'
            ];

            if (excludedNames.includes(nameToken.value)) {
                return null;
            }

            // ตรวจสอบว่าต่อด้วย { (method body) หรือไม่
            const nextTokenAfterParen = this.findTokenAfterParentheses();
            if (!nextTokenAfterParen || nextTokenAfterParen.type !== TOKEN_TYPES.BRACE_OPEN) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 2);
            this.cursor += 3; // ข้าม 'async', name, '('

            return {
                type: 'async_class_method',
                name: nameToken.value,
                line: asyncToken.line,
                column: asyncToken.column,
                parameters: params,
                isAsync: true
            };
        }
        return null;
    }

    // รูปแบบ: get propertyName() {} - Getter pattern
    matchGetter() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'get' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const getToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // ตรวจสอบว่าอยู่ในคลาสหรือไม่
            if (!this.isInClassContext()) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 2);
            this.cursor += 3; // ข้าม 'get', name, '('

            return {
                type: 'getter',
                name: nameToken.value,
                line: getToken.line,
                column: getToken.column,
                parameters: params,
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: set propertyName(value) {} - Setter pattern
    matchSetter() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'set' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const setToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // ตรวจสอบว่าอยู่ในคลาสหรือไม่
            if (!this.isInClassContext()) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 2);
            this.cursor += 3; // ข้าม 'set', name, '('

            return {
                type: 'setter',
                name: nameToken.value,
                line: setToken.line,
                column: setToken.column,
                parameters: params,
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: static methodName() {} - Static method pattern
    matchStaticMethod() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'static' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const staticToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // ตรวจสอบว่าอยู่ในคลาสหรือไม่
            if (!this.isInClassContext()) {
                return null;
            }

            const params = this.extractParameters(this.cursor + 2);
            this.cursor += 3; // ข้าม 'static', name, '('

            return {
                type: 'static_method',
                name: nameToken.value,
                line: staticToken.line,
                column: staticToken.column,
                parameters: params,
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: class ClassName {} หรือ abstract class ClassName {} - Class declaration pattern
    matchClassDeclaration() {
        // ตรวจสอบ abstract class pattern
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'abstract' &&
            this.peekToken(1)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(1)?.value === 'class' &&
            this.peekToken(2)?.type === TOKEN_TYPES.IDENTIFIER) {

            const abstractToken = this.currentToken();
            const classToken = this.peekToken(1);
            const nameToken = this.peekToken(2);

            // ตรวจสอบว่าเป็นคลาสที่ top-level หรือไม่ (ไม่ใช่ nested class)
            const currentDepth = abstractToken.braceDepth || 0;
            // อนุญาติให้ class อยู่ในระดับที่ลึกกว่าได้บ้าง สำหรับไฟล์ที่ซับซ้อน
            if (currentDepth > 3) {
                return null; // ข้าม deeply nested class
            }

            this.cursor += 3; // ข้าม 'abstract', 'class', name

            return {
                type: 'class_declaration',
                name: nameToken.value,
                line: abstractToken.line,
                column: abstractToken.column,
                parameters: [],
                isAsync: false,
                isAbstract: true
            };
        }

        // ตรวจสอบ regular class pattern
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'class' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER) {

            const classToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // ตรวจสอบว่าเป็นคลาสที่ top-level หรือไม่ (ไม่ใช่ nested class)
            const currentDepth = classToken.braceDepth || 0;
            // อนุญาติให้ class อยู่ในระดับที่ลึกกว่าได้บ้าง สำหรับไฟล์ที่ซับซ้อน
            if (currentDepth > 3) {
                return null; // ข้าม deeply nested class
            } this.cursor += 2; // ข้าม 'class', name

            return {
                type: 'class_declaration',
                name: nameToken.value,
                line: classToken.line,
                column: classToken.column,
                parameters: [],
                isAsync: false
            };
        }
        return null;
    }

    // Helper methods - ฟังก์ชันช่วยเหลือ
    currentToken() {
        return this.cursor < this.tokens.length ? this.tokens[this.cursor] : null;
    }

    peekToken(offset) {
        const pos = this.cursor + offset;
        return pos >= 0 && pos < this.tokens.length ? this.tokens[pos] : null;
    }

    isInCommentOrString() {
        const token = this.currentToken();
        return token?.type === TOKEN_TYPES.LINE_COMMENT ||
            token?.type === TOKEN_TYPES.BLOCK_COMMENT ||
            token?.type === TOKEN_TYPES.STRING;
    }

    extractParameters(startPos) {
        const params = [];
        let pos = startPos;
        let depth = 1; // เริ่มที่ 1 เพราะเราข้าม '(' แรกแล้ว

        while (pos < this.tokens.length && depth > 0) {
            const token = this.tokens[pos];

            if (token.type === TOKEN_TYPES.PAREN_OPEN) {
                depth++;
            } else if (token.type === TOKEN_TYPES.PAREN_CLOSE) {
                depth--;
            } else if (token.type === TOKEN_TYPES.IDENTIFIER && depth === 1) {
                params.push(token.value);
            }

            pos++;
        }

        return params;
    }

    extractParametersBeforeArrow(startPos, arrowPos) {
        const params = [];
        let pos = startPos;

        while (pos < arrowPos) {
            const token = this.tokens[pos];
            if (token.type === TOKEN_TYPES.IDENTIFIER) {
                params.push(token.value);
            }
            pos++;
        }

        return params;
    }

    // หาโทเค็นหลังจากวงเล็บปิด () - Find token after parentheses
    findTokenAfterParentheses() {
        let pos = this.cursor + 1; // เริ่มที่ (
        let depth = 1;

        while (pos < this.tokens.length && depth > 0) {
            const token = this.tokens[pos];
            if (token.type === TOKEN_TYPES.PAREN_OPEN) {
                depth++;
            } else if (token.type === TOKEN_TYPES.PAREN_CLOSE) {
                depth--;
            }
            pos++;
        }

        // ข้าม whitespace และหาโทเค็นถัดไป
        while (pos < this.tokens.length && this.tokens[pos].type === TOKEN_TYPES.WHITESPACE) {
            pos++;
        }

        return pos < this.tokens.length ? this.tokens[pos] : null;
    }

    findArrowInRange(start, end) {
        // ขยายขอบเขตการค้นหาให้กว้างขึ้นสำหรับ parameter ที่ซับซ้อน
        const searchEnd = Math.min(end + 15, this.tokens.length);

        for (let i = start; i < searchEnd; i++) {
            if (this.tokens[i]?.type === TOKEN_TYPES.ARROW) {
                // ตรวจสอบว่าไม่อยู่ในบล็อกอื่น (เช่น object literal)
                let braceCount = 0;
                let parenCount = 0;

                for (let j = start; j < i; j++) {
                    const checkToken = this.tokens[j];
                    if (checkToken) {
                        if (checkToken.type === TOKEN_TYPES.BRACE_OPEN) braceCount++;
                        else if (checkToken.type === TOKEN_TYPES.BRACE_CLOSE) braceCount--;
                        else if (checkToken.type === TOKEN_TYPES.PAREN_OPEN) parenCount++;
                        else if (checkToken.type === TOKEN_TYPES.PAREN_CLOSE) parenCount--;
                    }
                }

                // ถ้า brace และ paren สมดุล แสดงว่าเป็น arrow function ที่ถูกต้อง
                if (braceCount === 0 && parenCount <= 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    checkAsyncBeforeArrow(start, end) {
        for (let i = start; i < end; i++) {
            if (this.tokens[i]?.type === TOKEN_TYPES.KEYWORD &&
                this.tokens[i]?.value === 'async') {
                return true;
            }
        }
        return false;
    }

    isInClassContext() {
        // ตรวจสอบด้วยการนับ braces และหา class keyword
        let braceDepth = 0;
        let foundClass = false;
        let classStart = -1;

        // ตรวจสอบย้อนหลังเพื่อหา class declaration
        for (let i = Math.max(0, this.cursor - 100); i < this.cursor; i++) {
            const token = this.tokens[i];
            if (!token) continue;

            if (token.type === TOKEN_TYPES.KEYWORD && token.value === 'class') {
                foundClass = true;
                classStart = i;
                braceDepth = 0; // รีเซ็ต
            }

            if (foundClass && i > classStart) {
                if (token.type === TOKEN_TYPES.BRACE_OPEN) {
                    braceDepth++;
                } else if (token.type === TOKEN_TYPES.BRACE_CLOSE) {
                    braceDepth--;
                    if (braceDepth <= 0) {
                        foundClass = false; // ออกจาก class แล้ว
                    }
                }
            }
        }

        // ตรวจสอบว่าปัจจุบันอยู่ใน class body หรือไม่
        return foundClass && braceDepth > 0;
    }
}

// ======================================================================
// Structure Parser Engine/เครื่องมือ Parser โครงสร้างใหม่
// ======================================================================

// Structure Parser: ตัววิเคราะห์โครงสร้างโค้ดแบบใหม่ (แทนที่ FunctionPatternMatcher)
class StructureParser {
    constructor(tokens, securityOptions = {}) {
        this.tokens = tokens.filter(t => t.type !== TOKEN_TYPES.WHITESPACE);
        this.cursor = 0;
        this.scopeStack = [];
        this.structures = [];
        // SECURITY: เพิ่ม Security Manager
        this.security = new TokenizerSecurityManager(securityOptions);
    }

    // วิเคราะห์โครงสร้างทั้งหมด
    parse() {
        // SECURITY: เริ่มต้นการตรวจสอบ
        this.security.startParsing();

        try {
            while (this.cursor < this.tokens.length) {
                // SECURITY: ตรวจสอบในแต่ละการวนลูป
                this.security.checkIteration();

                const structure = this.parseDeclaration();
                if (structure) {
                    this.structures.push(structure);
                }
            }

            // แสดงสถิติความปลอดภัยถ้ามีคำเตือน
            const stats = this.security.getStats();
            if (stats.warnings.length > 0) {
                console.warn('Parser Security Warnings:');
                stats.warnings.forEach(warning => console.warn(` - ${warning}`));
            }

            return this.structures;
        } catch (error) {
            // รายงานข้อผิดพลาดด้านความปลอดภัย
            if (error.message.includes('SECURITY:')) {
                console.error(`SECURITY ALERT: ${error.message}`);
                console.error('Structure parsing stopped for security reasons.');
            }
            throw error;
        }
    }

    // วิเคราะห์โครงสร้างหลักในระดับบนสุด (Global Scope)
    parseDeclaration() {
        const currentToken = this.currentToken();
        if (!currentToken) return null;

        // ตรวจสอบว่าอยู่ในคอมเมนต์หรือสตริงหรือไม่
        if (this.isInCommentOrString()) {
            this.advance();
            return null;
        }

        // ตรวจจับ class declaration: class MyClass { ... }
        if (currentToken.type === TOKEN_TYPES.KEYWORD && currentToken.value === 'class') {
            return this.parseClassDeclaration();
        }

        // ตรวจจับ function declaration: function myFunc() { ... }
        if (currentToken.type === TOKEN_TYPES.KEYWORD && currentToken.value === 'function') {
            return this.parseFunctionDeclaration();
        }

        // ตรวจจับ const/let/var ที่เป็น arrow function หรือ function expression
        if (currentToken.type === TOKEN_TYPES.KEYWORD && ['const', 'let', 'var'].includes(currentToken.value)) {
            return this.parseVariableDeclaration();
        }

        // ถ้าไม่ใช่โครงสร้างที่สนใจ ให้ข้ามไป
        this.advance();
        return null;
    }

    // วิเคราะห์ Class
    parseClassDeclaration() {
        const classToken = this.advance(); // consume 'class'
        if (this.currentToken()?.type !== TOKEN_TYPES.IDENTIFIER) return null;

        const nameToken = this.advance(); // consume class name
        const classStructure = {
            type: 'class_declaration',
            name: nameToken.value,
            line: classToken.line,
            column: classToken.column,
            methods: []
        };

        // หา body ของ class
        if (this.currentToken()?.type === TOKEN_TYPES.BRACE_OPEN) {
            const bodyStartIndex = this.cursor;
            const bodyEndIndex = this.findMatchingBrace(bodyStartIndex);

            if (bodyEndIndex !== -1) {
                // SECURITY: ตรวจสอบระดับความลึก
                this.security.enterDepth();

                // เข้าไปวิเคราะห์ภายใน body ของ class
                this.parseClassBody(classStructure, bodyEndIndex);
                this.cursor = bodyEndIndex + 1; // เลื่อน cursor ไปหลัง '}'

                this.security.exitDepth();
            }
        }

        return classStructure;
    }

    // วิเคราะห์ภายใน Class Body
    parseClassBody(classStructure, bodyEndIndex) {
        this.advance(); // consume '{'

        while (this.cursor < bodyEndIndex) {
            const token = this.currentToken();
            if (!token) break;

            let isAsync = false;
            let isStatic = false;
            let kind = 'method'; // 'method', 'get', 'set'

            // ตรวจจับ async / static / get / set
            if (token.type === TOKEN_TYPES.KEYWORD) {
                if (token.value === 'async') {
                    isAsync = true;
                    this.advance();
                } else if (token.value === 'static') {
                    isStatic = true;
                    this.advance();
                } else if (token.value === 'get' || token.value === 'set') {
                    kind = token.value;
                    this.advance();
                }
            }

            // ตรวจจับ Method: methodName(...) { ... }
            const nameToken = this.currentToken();
            const parenToken = this.peekToken(1);

            if (nameToken?.type === TOKEN_TYPES.IDENTIFIER && parenToken?.type === TOKEN_TYPES.PAREN_OPEN) {
                // ไม่จับ constructor เพราะไม่ต้องการคอมเมนต์
                if (nameToken.value !== 'constructor') {
                    classStructure.methods.push({
                        type: 'class_method',
                        name: nameToken.value,
                        line: nameToken.line,
                        column: nameToken.column,
                        isAsync,
                        isStatic,
                        kind,
                        parameters: this.extractParameters(this.cursor + 1)
                    });
                }

                // ข้ามผ่าน method ทั้งหมดไปอย่างรวดเร็ว
                const methodBodyStart = this.findToken(TOKEN_TYPES.BRACE_OPEN, this.cursor);
                if (methodBodyStart !== -1) {
                    const methodBodyEnd = this.findMatchingBrace(methodBodyStart);
                    if (methodBodyEnd !== -1) {
                        this.cursor = methodBodyEnd + 1;
                        continue;
                    }
                }
            }
            this.advance();
        }
    }

    // วิเคราะห์ Function
    parseFunctionDeclaration() {
        const funcToken = this.advance(); // consume 'function'

        // ตรวจจับ generator function: function* name()
        let isGenerator = false;
        if (this.currentToken()?.value === '*') {
            isGenerator = true;
            this.advance(); // consume '*'
        }

        if (this.currentToken()?.type !== TOKEN_TYPES.IDENTIFIER) {
            // อาจเป็น function expression ที่ไม่มีชื่อ
            return null;
        }

        const nameToken = this.advance();
        const funcStructure = {
            type: isGenerator ? 'generator_function' : 'function_declaration',
            name: nameToken.value,
            line: funcToken.line,
            column: funcToken.column,
            parameters: this.extractParameters(this.cursor),
            isAsync: false
        };

        // ข้ามไปจนสุด body ของฟังก์ชัน
        const bodyStart = this.findToken(TOKEN_TYPES.BRACE_OPEN, this.cursor);
        if (bodyStart !== -1) {
            const bodyEnd = this.findMatchingBrace(bodyStart);
            if (bodyEnd !== -1) {
                this.cursor = bodyEnd + 1;
            }
        }

        return funcStructure;
    }

    // วิเคราะห์ const/let/var = ...
    parseVariableDeclaration() {
        this.advance(); // consume const/let/var
        const nameToken = this.currentToken();
        if (nameToken?.type !== TOKEN_TYPES.IDENTIFIER) return null;
        this.advance(); // consume name

        if (this.currentToken()?.type !== TOKEN_TYPES.EQUALS) return null;
        this.advance(); // consume '='

        // ตรวจจับ async keyword
        let isAsync = false;
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD && this.currentToken().value === 'async') {
            isAsync = true;
            this.advance();
        }

        // ตรวจจับ arrow function: () => { ... }
        const nextToken = this.currentToken();

        let isArrowFunc = false;
        if (nextToken?.type === TOKEN_TYPES.PAREN_OPEN) {
            const closingParen = this.findMatchingParen(this.cursor);
            if (closingParen !== -1 && this.tokens[closingParen + 1]?.type === TOKEN_TYPES.ARROW) {
                isArrowFunc = true;
            }
        } else if (nextToken?.type === TOKEN_TYPES.IDENTIFIER) {
            // Handle arrow functions without parens: a => ...
            if (this.peekToken(1)?.type === TOKEN_TYPES.ARROW) {
                isArrowFunc = true;
            }
        }

        if (isArrowFunc) {
            const funcStructure = {
                type: 'arrow_function',
                name: nameToken.value,
                line: nameToken.line,
                column: nameToken.column,
                isAsync,
                parameters: this.extractArrowParameters(this.cursor)
            };

            const bodyStart = this.findToken(TOKEN_TYPES.BRACE_OPEN, this.cursor);
            if (bodyStart !== -1) {
                const bodyEnd = this.findMatchingBrace(bodyStart);
                if (bodyEnd !== -1) {
                    this.cursor = bodyEnd + 1;
                }
            } else {
                // Arrow function แบบไม่มี {} - หา semicolon
                const semicolon = this.findToken(TOKEN_TYPES.SEMICOLON, this.cursor);
                if (semicolon !== -1) this.cursor = semicolon + 1;
            }
            return funcStructure;
        }

        return null;
    }

    // --- Helper Methods ---

    // ฟังก์ชันหัวใจ: ค้นหาวงเล็บปีกกาปิดที่คู่กัน
    findMatchingBrace(startIndex) {
        let depth = 1;
        for (let i = startIndex + 1; i < this.tokens.length; i++) {
            // SECURITY: ป้องกันการวนลูปไม่สิ้นสุด
            if (i - startIndex > this.security.MAX_LOOP_ITERATIONS) {
                this.security.addWarning(`Potential infinite loop detected in findMatchingBrace`);
                break;
            }

            if (this.tokens[i].type === TOKEN_TYPES.BRACE_OPEN) {
                depth++;
            } else if (this.tokens[i].type === TOKEN_TYPES.BRACE_CLOSE) {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1; // Not found
    }

    // ค้นหาวงเล็บปิดที่คู่กัน
    findMatchingParen(startIndex) {
        let depth = 1;
        for (let i = startIndex + 1; i < this.tokens.length; i++) {
            if (this.tokens[i].type === TOKEN_TYPES.PAREN_OPEN) {
                depth++;
            } else if (this.tokens[i].type === TOKEN_TYPES.PAREN_CLOSE) {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1; // Not found
    }

    // ค้นหา token ประเภทที่ต้องการ
    findToken(type, startIndex) {
        for (let i = startIndex; i < this.tokens.length; i++) {
            if (this.tokens[i].type === type) return i;
        }
        return -1;
    }

    // ดึงพารามิเตอร์ของฟังก์ชัน (ปรับปรุงจากเดิม)
    extractParameters(parenIndex) {
        if (this.tokens[parenIndex]?.type !== TOKEN_TYPES.PAREN_OPEN) return [];

        const params = [];
        const closingParen = this.findMatchingParen(parenIndex);
        if (closingParen === -1) return [];

        // ดึง parameter names ระหว่าง ( และ )
        for (let i = parenIndex + 1; i < closingParen; i++) {
            const token = this.tokens[i];
            if (token.type === TOKEN_TYPES.IDENTIFIER) {
                params.push(token.value);
            }
        }

        return params;
    }

    // ดึงพารามิเตอร์ของ arrow function
    extractArrowParameters(startIndex) {
        const firstToken = this.tokens[startIndex];
        if (!firstToken) return [];

        if (firstToken.type === TOKEN_TYPES.PAREN_OPEN) {
            return this.extractParameters(startIndex);
        } else if (firstToken.type === TOKEN_TYPES.IDENTIFIER) {
            return [firstToken.value];
        }

        return [];
    }

    // ตรวจสอบว่าอยู่ในคอมเมนต์หรือสตริงหรือไม่
    isInCommentOrString() {
        const currentToken = this.currentToken();
        return currentToken && (
            currentToken.type === TOKEN_TYPES.LINE_COMMENT ||
            currentToken.type === TOKEN_TYPES.BLOCK_COMMENT ||
            currentToken.type === TOKEN_TYPES.STRING
        );
    }

    currentToken() { return this.tokens[this.cursor]; }
    peekToken(offset = 1) { return this.tokens[this.cursor + offset]; }
    advance() {
        if (!this.isAtEnd()) this.cursor++;
        return this.tokens[this.cursor - 1];
    }
    isAtEnd() { return this.cursor >= this.tokens.length; }

    // Method สำหรับ backward compatibility กับ FunctionPatternMatcher
    findFunctions() {
        const structures = this.parse();
        const allItems = [];

        structures.forEach(s => {
            if (s.type === 'class_declaration') {
                // เพิ่มตัวคลาสเอง
                allItems.push({
                    type: s.type,
                    name: s.name,
                    line: s.line,
                    column: s.column,
                    parameters: []
                });

                // เพิ่มเมธอดทั้งหมดในคลาส
                if (s.methods) {
                    s.methods.forEach(m => allItems.push(m));
                }
            } else {
                allItems.push(s);
            }
        });

        return allItems;
    }
}

// ======================================================================
// Smart File Analyzer Engine/เครื่องมือวิเคราะห์ไฟล์อัจฉริยะ
// ======================================================================

// Smart File Analyzer: ตัวเรียนรู้และวิเคราะห์ไฟล์ทั้งหมดก่อนสร้างคอมเมนต์
class SmartFileAnalyzer {
    constructor(content, securityOptions = {}) {
        this.content = content;
        this.lines = content.split('\n');
        this.security = new TokenizerSecurityManager(securityOptions);

        // ข้อมูลที่เรียนรู้ได้จากไฟล์
        this.fileBlueprint = {
            classes: new Map(),           // Map<className, classInfo>
            functions: new Map(),         // Map<functionName, functionInfo>
            patterns: new Set(),          // Set ของ patterns ที่พบ
            keywords: new Set(),          // Set ของ keywords ที่ควรเพิ่ม
            relationships: new Map(),     // Map ของความสัมพันธ์ระหว่าง classes/functions
            context: {                    // บริบทของไฟล์
                type: 'unknown',          // 'api', 'database', 'ui', 'algorithm', etc.
                domain: 'unknown',        // 'web', 'crypto', 'data', etc.
                complexity: 'simple'      // 'simple', 'moderate', 'complex'
            }
        };
    }

    // วิเคราะห์ไฟล์ทั้งหมดและสร้าง blueprint
    analyzeFile() {
        try {
            this.security.startParsing();

            // Phase 0: TypeScript Pre-analysis/การวิเคราะห์ TypeScript เบื้องต้น
            this.analyzeTypeScriptStructures();

            // Phase 1: Tokenize และ Parse โครงสร้าง
            const tokenizer = new JavaScriptTokenizer(this.content, this.security);
            const tokens = tokenizer.tokenize();
            const parser = new StructureParser(tokens, this.security);
            const structures = parser.parse();

            // Phase 2: วิเคราะห์โครงสร้างลึก
            this.analyzeStructures(structures);

            // Phase 3: ค้นหาลวดลายและความสัมพันธ์
            this.findPatternsAndRelationships();

            // Phase 4: สร้าง dynamic keywords
            this.generateDynamicKeywords();

            // Phase 5: กำหนดบริบทของไฟล์
            this.determineFileContext();

            console.log(` Smart Analysis Complete: Found ${this.fileBlueprint.classes.size} classes, ${this.fileBlueprint.functions.size} functions, ${this.fileBlueprint.keywords.size} keywords`);

            return this.fileBlueprint;

        } catch (error) {
            console.error(' Smart Analysis Error:', error.message);
            return null;
        }
    }

    // วิเคราะห์โครงสร้าง TypeScript เฉพาะ
    analyzeTypeScriptStructures() {
        // วิเคราะห์ interfaces
        this.analyzeInterfaces();

        // วิเคราะห์ type aliases
        this.analyzeTypeAliases();

        // วิเคราะห์ enums
        this.analyzeEnums();

        // วิเคราะห์ abstract classes
        this.analyzeAbstractClasses();

        // วิเคราะห์ generics
        this.analyzeGenerics();

        // วิเคราะห์ const declarations (JavaScript/Node.js เฉพาะ)
        this.analyzeConstDeclarations();
    }

    // วิเคราะห์ const declarations
    analyzeConstDeclarations() {
        const constRegex = /const\s+(\w+)\s*=\s*([^;]+);?/g;
        let match;

        while ((match = constRegex.exec(this.content)) !== null) {
            const constName = match[1];
            const constValue = match[2].trim();
            const lineNumber = this.content.substring(0, match.index).split('\n').length;

            const constType = this.inferConstType(constName, constValue);

            // ข้ามถ้าเป็น require statements หรือ imports
            if (constType === 'require' || constType === 'import') {
                continue;
            }

            const constInfo = {
                name: constName,
                line: lineNumber,
                type: constType,
                value: constValue,
                purpose: this.inferConstPurpose(constName, constValue, constType),
                complexity: constValue.length > 200 ? 'high' : constValue.length > 50 ? 'moderate' : 'simple'
            };

            // เพิ่มเข้า functions หรือ classes ตามประเภท
            if (constType === 'function' || constType === 'arrow_function' || constType === 'middleware') {
                this.fileBlueprint.functions.set(constName, constInfo);
                this.addPattern(constName, 'const_function');
            } else {
                this.fileBlueprint.classes.set(constName, constInfo);
                this.addPattern(constName, constType);
            }

            this.addDynamicKeyword(constName.toLowerCase(), `${constName} ${constType}`, this.getThaiConstType(constType, constName));
        }
    }

    // อนุมานประเภทของ const
    inferConstType(constName, constValue) {
        const name = constName.toLowerCase();
        const value = constValue.toLowerCase();

        // ตรวจสอบ require/import
        if (value.includes('require(') || value.includes('import(')) {
            return 'require';
        }

        // ตรวจสอบ functions
        if (value.includes('=>') || value.includes('function(')) {
            if (name.includes('middleware') || name.includes('auth') || name.includes('limit') || value.includes('(req, res')) {
                return 'middleware';
            }
            return 'arrow_function';
        }

        // ตรวจสอบ Express app
        if (value.includes('express()')) {
            return 'express_app';
        }

        // ตรวจสอบ configuration objects
        if (name.includes('config') || name.includes('setting') || name.includes('option')) {
            return 'configuration';
        }

        // ตรวจสอบ database/data objects
        if (name.includes('database') || name.includes('db') || name.includes('data') || value.includes('users:') || value.includes('posts:')) {
            return 'data_store';
        }

        // ตรวจสอบ storage/upload objects
        if (name.includes('storage') || name.includes('upload') || value.includes('multer.') || value.includes('diskStorage')) {
            return 'storage_config';
        }

        // ตรวจสอบ rate limiters
        if (name.includes('limit') || value.includes('rateLimit(')) {
            return 'rate_limiter';
        }

        // ตรวจสอบ objects ทั่วไป
        if (value.startsWith('{') || value.includes('{')) {
            return 'object';
        }

        // ตรวจสอบ arrays
        if (value.startsWith('[')) {
            return 'array';
        }

        return 'constant';
    }

    // อนุมานวัตถุประสงค์ของ const
    inferConstPurpose(constName, constValue, constType) {
        const name = constName.toLowerCase();

        switch (constType) {
            case 'configuration':
                return 'app_config';
            case 'data_store':
                return 'in_memory_database';
            case 'storage_config':
                return 'file_upload_config';
            case 'rate_limiter':
                return 'api_rate_limiter';
            case 'middleware':
                if (name.includes('auth')) return 'auth_middleware';
                if (name.includes('validate')) return 'validation_middleware';
                if (name.includes('async')) return 'async_wrapper';
                return 'express_middleware';
            case 'arrow_function':
                if (name.includes('find')) return 'finder_function';
                if (name.includes('generate')) return 'generator_function';
                return 'utility_function';
            case 'express_app':
                return 'express_application';
            default:
                return constType;
        }
    }

    // แปลประเภท const เป็นภาษาไทย
    getThaiConstType(constType, constName) {
        const name = constName.toLowerCase();

        switch (constType) {
            case 'configuration':
                return `การกำหนดค่า ${constName}`;
            case 'data_store':
                return `ที่เก็บข้อมูล ${constName}`;
            case 'storage_config':
                return `การกำหนดค่าการจัดเก็บไฟล์ ${constName}`;
            case 'rate_limiter':
                return `ตัวจำกัดอัตรา ${constName}`;
            case 'middleware':
                return `มิดเดิลแวร์ ${constName}`;
            case 'arrow_function':
                return `ฟังก์ชัน ${constName}`;
            case 'express_app':
                return `แอปพลิเคชัน Express ${constName}`;
            case 'object':
                return `ออบเจ็กต์ ${constName}`;
            case 'array':
                return `อาร์เรย์ ${constName}`;
            default:
                return `ค่าคงที่ ${constName}`;
        }
    }    // วิเคราะห์ interfaces
    analyzeInterfaces() {
        const interfaceRegex = /interface\s+(\w+)(?:<[^>]*>)?\s*(?:extends\s+[^{]+)?\s*{/g;
        let match;

        while ((match = interfaceRegex.exec(this.content)) !== null) {
            const interfaceName = match[1];
            const lineNumber = this.content.substring(0, match.index).split('\n').length;

            const interfaceInfo = {
                name: interfaceName,
                line: lineNumber,
                type: 'interface',
                properties: this.extractInterfaceProperties(match.index),
                purpose: this.inferInterfacePurpose(interfaceName),
                complexity: 'simple'
            };

            this.fileBlueprint.classes.set(interfaceName, interfaceInfo);
            this.addPattern(interfaceName, 'interface');
            this.addDynamicKeyword(interfaceName.toLowerCase(), `${interfaceName} interface`, `อินเทอร์เฟซ ${interfaceName}`);
        }
    }

    // วิเคราะห์ type aliases
    analyzeTypeAliases() {
        const typeRegex = /type\s+(\w+)(?:<[^>]*>)?\s*=\s*([^;]+);?/g;
        let match;

        while ((match = typeRegex.exec(this.content)) !== null) {
            const typeName = match[1];
            const typeDefinition = match[2].trim();
            const lineNumber = this.content.substring(0, match.index).split('\n').length;

            const typeInfo = {
                name: typeName,
                line: lineNumber,
                type: 'type_alias',
                definition: typeDefinition,
                purpose: this.inferTypePurpose(typeName, typeDefinition),
                complexity: typeDefinition.length > 100 ? 'high' : 'simple'
            };

            this.fileBlueprint.functions.set(typeName, typeInfo);
            this.addPattern(typeName, 'type');
            this.addDynamicKeyword(typeName.toLowerCase(), `${typeName} type definition`, `นิยามประเภท ${typeName}`);
        }
    }

    // วิเคราะห์ enums
    analyzeEnums() {
        const enumRegex = /enum\s+(\w+)\s*{([^}]+)}/g;
        let match;

        while ((match = enumRegex.exec(this.content)) !== null) {
            const enumName = match[1];
            const enumBody = match[2];
            const lineNumber = this.content.substring(0, match.index).split('\n').length;

            const enumInfo = {
                name: enumName,
                line: lineNumber,
                type: 'enum',
                values: this.extractEnumValues(enumBody),
                purpose: this.inferEnumPurpose(enumName),
                complexity: 'simple'
            };

            this.fileBlueprint.classes.set(enumName, enumInfo);
            this.addPattern(enumName, 'enum');
            this.addDynamicKeyword(enumName.toLowerCase(), `${enumName} enumeration`, `การนับ ${enumName}`);
        }
    }

    // วิเคราะห์ abstract classes
    analyzeAbstractClasses() {
        const abstractRegex = /abstract\s+class\s+(\w+)(?:<[^>]*>)?(?:\s+extends\s+\w+)?(?:\s+implements\s+[^{]+)?\s*{/g;
        let match;

        while ((match = abstractRegex.exec(this.content)) !== null) {
            const className = match[1];
            const lineNumber = this.content.substring(0, match.index).split('\n').length;

            const classInfo = {
                name: className,
                line: lineNumber,
                type: 'abstract_class',
                isAbstract: true,
                methods: new Map(),
                properties: new Set(),
                purpose: this.inferAbstractClassPurpose(className),
                complexity: 'moderate'
            };

            this.fileBlueprint.classes.set(className, classInfo);
            this.addPattern(className, 'abstract_class');
            this.addDynamicKeyword(className.toLowerCase(), `${className} abstract class`, `คลาสนามธรรม ${className}`);
        }
    }

    // วิเคราะห์ generics
    analyzeGenerics() {
        const genericRegex = /<([^>]+)>/g;
        let match;

        while ((match = genericRegex.exec(this.content)) !== null) {
            const genericParams = match[1].split(',').map(param => param.trim());

            genericParams.forEach(param => {
                if (param.length === 1 && /[A-Z]/.test(param)) {
                    this.addDynamicKeyword(`generic_${param.toLowerCase()}`, `Generic type ${param}`, `ประเภททั่วไป ${param}`);
                }
            });
        }
    }    // วิเคราะห์โครงสร้างที่ได้จาก parser
    analyzeStructures(structures) {
        structures.forEach(structure => {
            if (structure.type === 'class_declaration') {
                this.analyzeClass(structure);
            } else {
                this.analyzeFunction(structure);
            }
        });
    }

    // วิเคราะห์คลาสอย่างละเอียด
    analyzeClass(classStructure) {
        const className = classStructure.name;
        const classInfo = {
            name: className,
            line: classStructure.line,
            methods: new Map(),
            properties: new Set(),
            extends: null,
            implements: [],
            purpose: this.inferClassPurpose(className),
            complexity: this.calculateClassComplexity(classStructure)
        };

        // วิเคราะห์ methods ในคลาส
        if (classStructure.methods) {
            classStructure.methods.forEach(method => {
                const methodInfo = {
                    name: method.name,
                    type: method.type,
                    line: method.line,
                    isAsync: method.isAsync || false,
                    isStatic: method.isStatic || false,
                    kind: method.kind || 'method',
                    parameters: method.parameters || [],
                    purpose: this.inferMethodPurpose(method.name, className),
                    accessibility: this.inferAccessibility(method.name)
                };
                classInfo.methods.set(method.name, methodInfo);
            });
        }

        this.fileBlueprint.classes.set(className, classInfo);
        this.addPattern(className, 'class');
    }

    // วิเคราะห์ฟังก์ชันอย่างละเอียด
    analyzeFunction(funcStructure) {
        const functionName = funcStructure.name;
        const functionInfo = {
            name: functionName,
            type: funcStructure.type,
            line: funcStructure.line,
            parameters: funcStructure.parameters || [],
            isAsync: funcStructure.isAsync || false,
            isGenerator: funcStructure.isGenerator || false,
            purpose: this.inferFunctionPurpose(functionName),
            scope: 'global',
            complexity: this.calculateFunctionComplexity(funcStructure)
        };

        this.fileBlueprint.functions.set(functionName, functionInfo);
        this.addPattern(functionName, 'function');
    }

    // ค้นหาลวดลายและความสัมพันธ์
    findPatternsAndRelationships() {
        // หาความสัมพันธ์ระหว่าง classes
        for (const [className, classInfo] of this.fileBlueprint.classes) {
            // ค้นหา inheritance และ composition patterns
            this.findClassRelationships(className, classInfo);

            // ค้นหา design patterns
            this.detectDesignPatterns(className, classInfo);
        }

        // หาความสัมพันธ์ระหว่าง functions
        for (const [funcName, funcInfo] of this.fileBlueprint.functions) {
            this.findFunctionRelationships(funcName, funcInfo);
        }
    }

    // สร้าง dynamic keywords จากสิ่งที่พบในไฟล์
    generateDynamicKeywords() {
        // ตรวจสอบว่า fileBlueprint มีข้อมูลหรือไม่
        if (!this.fileBlueprint || !this.fileBlueprint.classes || !this.fileBlueprint.functions) {
            console.log(' Warning: fileBlueprint not properly initialized, skipping keyword generation');
            return;
        }

        try {
            // สร้าง keywords จากชื่อ classes
            for (const className of this.fileBlueprint.classes.keys()) {
                this.addDynamicKeyword(className.toLowerCase(), `${className} class`, `คลาส ${className}`);

                // เพิ่ม variations
                if (className.endsWith('Manager')) {
                    this.addDynamicKeyword(className.toLowerCase(), `${className} manager`, `ตัวจัดการ ${className.replace('Manager', '')}`);
                }
                if (className.endsWith('Controller')) {
                    this.addDynamicKeyword(className.toLowerCase(), `${className} controller`, `ตัวควบคุม ${className.replace('Controller', '')}`);
                }
                if (className.endsWith('Service')) {
                    this.addDynamicKeyword(className.toLowerCase(), `${className} service`, `บริการ ${className.replace('Service', '')}`);
                }
            }

            // สร้าง keywords จากชื่อ methods และ functions
            const allMethods = new Set();
            for (const classInfo of this.fileBlueprint.classes.values()) {
                if (classInfo.methods) {
                    for (const methodName of classInfo.methods.keys()) {
                        allMethods.add(methodName);
                    }
                }
            }
            for (const funcName of this.fileBlueprint.functions.keys()) {
                allMethods.add(funcName);
            }

            // เพิ่ม method-specific keywords
            for (const methodName of allMethods) {
                this.addMethodSpecificKeywords(methodName);
            }

        } catch (error) {
            console.log(' Warning: Error generating dynamic keywords:', error.message);
        }
    }

    // เพิ่ม keywords เฉพาะสำหรับ methods
    addMethodSpecificKeywords(methodName) {
        const name = methodName.toLowerCase();

        // CRUD operations
        if (name.includes('create') || name.includes('add') || name.includes('insert')) {
            this.addDynamicKeyword(name, `Create ${methodName}`, `สร้าง ${methodName}`);
        }
        if (name.includes('get') || name.includes('fetch') || name.includes('find') || name.includes('retrieve')) {
            this.addDynamicKeyword(name, `Get ${methodName}`, `ดึง ${methodName}`);
        }
        if (name.includes('update') || name.includes('modify') || name.includes('edit') || name.includes('change')) {
            this.addDynamicKeyword(name, `Update ${methodName}`, `อัปเดต ${methodName}`);
        }
        if (name.includes('delete') || name.includes('remove') || name.includes('destroy')) {
            this.addDynamicKeyword(name, `Delete ${methodName}`, `ลบ ${methodName}`);
        }

        // Validation and processing
        if (name.includes('validate') || name.includes('check') || name.includes('verify')) {
            this.addDynamicKeyword(name, `Validate ${methodName}`, `ตรวจสอบ ${methodName}`);
        }
        if (name.includes('process') || name.includes('handle') || name.includes('execute')) {
            this.addDynamicKeyword(name, `Process ${methodName}`, `ประมวลผล ${methodName}`);
        }

        // Specific method patterns
        if (name.includes('generate') && name.includes('key')) {
            this.addDynamicKeyword(name, 'Generate encryption key', 'สร้างคีย์การเข้ารหัส');
        }
        if (name.includes('encrypt')) {
            this.addDynamicKeyword(name, 'Encrypt data', 'เข้ารหัสข้อมูล');
        }
        if (name.includes('decrypt')) {
            this.addDynamicKeyword(name, 'Decrypt data', 'ถอดรหัสข้อมูล');
        }
        if (name.includes('cache') && name.includes('size')) {
            this.addDynamicKeyword(name, 'Get cache size', 'ดึงขนาดแคช');
        }
        if (name.includes('max') && name.includes('cache')) {
            this.addDynamicKeyword(name, 'Set maximum cache size', 'กำหนดขนาดแคชสูงสุด');
        }
    }

    // กำหนดบริบทของไฟล์
    determineFileContext() {
        // ตรวจสอบว่า fileBlueprint มีข้อมูลหรือไม่
        if (!this.fileBlueprint || !this.fileBlueprint.classes || !this.fileBlueprint.functions) {
            this.fileBlueprint.context = {
                type: 'unknown',
                domain: 'unknown',
                complexity: 'simple'
            };
            return;
        }

        const classNames = Array.from(this.fileBlueprint.classes.keys()).map(name => name.toLowerCase());
        const functionNames = Array.from(this.fileBlueprint.functions.keys()).map(name => name.toLowerCase());
        const allNames = [...classNames, ...functionNames];

        // ตรวจสอบเนื้อหาไฟล์เพื่อจับบริบทได้แม่นยำขึ้น
        const content = this.content.toLowerCase();

        // ตรวจจับประเภทของไฟล์
        if (content.includes('express') || content.includes('app.get') || content.includes('app.post') ||
            content.includes('req, res') || allNames.some(name => name.includes('app') || name.includes('server') || name.includes('router'))) {
            this.fileBlueprint.context.type = 'api';
            this.fileBlueprint.context.domain = 'web';
        } else if (allNames.some(name => name.includes('crypto') || name.includes('encrypt') || name.includes('hash')) ||
            content.includes('bcrypt') || content.includes('jwt') || content.includes('crypto')) {
            this.fileBlueprint.context.type = 'security';
            this.fileBlueprint.context.domain = 'crypto';
        } else if (allNames.some(name => name.includes('database') || name.includes('db') || name.includes('sql')) ||
            content.includes('database') || content.includes('mongodb') || content.includes('mysql')) {
            this.fileBlueprint.context.type = 'database';
            this.fileBlueprint.context.domain = 'data';
        } else if (allNames.some(name => name.includes('api') || name.includes('client') || name.includes('request'))) {
            this.fileBlueprint.context.type = 'api';
            this.fileBlueprint.context.domain = 'web';
        } else if (allNames.some(name => name.includes('algorithm') || name.includes('sort') || name.includes('search'))) {
            this.fileBlueprint.context.type = 'algorithm';
            this.fileBlueprint.context.domain = 'computation';
        } else if (allNames.some(name => name.includes('component') || name.includes('render') || name.includes('ui'))) {
            this.fileBlueprint.context.type = 'ui';
            this.fileBlueprint.context.domain = 'frontend';
        }        // ตรวจจับความซับซ้อน
        const totalStructures = this.fileBlueprint.classes.size + this.fileBlueprint.functions.size;
        if (totalStructures > 20) {
            this.fileBlueprint.context.complexity = 'complex';
        } else if (totalStructures > 10) {
            this.fileBlueprint.context.complexity = 'moderate';
        }
    }

    // Helper methods
    addPattern(name, type) {
        this.fileBlueprint.patterns.add(`${type}:${name.toLowerCase()}`);
    }

    addDynamicKeyword(key, english, thai) {
        this.fileBlueprint.keywords.add(JSON.stringify({ key, english, thai }));
    }

    inferClassPurpose(className) {
        const name = className.toLowerCase();
        if (name.includes('manager')) return 'manager';
        if (name.includes('controller')) return 'controller';
        if (name.includes('service')) return 'service';
        if (name.includes('model')) return 'model';
        if (name.includes('view')) return 'view';
        if (name.includes('component')) return 'component';
        if (name.includes('error')) return 'error';
        if (name.includes('validator')) return 'validator';
        if (name.includes('parser')) return 'parser';
        if (name.includes('tokenizer')) return 'tokenizer';
        return 'class';
    }

    inferMethodPurpose(methodName, className) {
        const method = methodName.toLowerCase();
        const cls = className.toLowerCase();

        // Context-aware purpose inference
        if (cls.includes('crypto') || cls.includes('security')) {
            if (method.includes('generate')) return 'generate_crypto';
            if (method.includes('encrypt')) return 'encrypt_data';
            if (method.includes('decrypt')) return 'decrypt_data';
        }

        if (cls.includes('cache') || cls.includes('memory')) {
            if (method.includes('size')) return 'get_size';
            if (method.includes('clear')) return 'clear_cache';
            if (method.includes('max')) return 'set_limit';
        }

        // General purpose inference
        if (method.includes('get') || method.includes('fetch')) return 'getter';
        if (method.includes('set') || method.includes('assign')) return 'setter';
        if (method.includes('create') || method.includes('add')) return 'creator';
        if (method.includes('delete') || method.includes('remove')) return 'destroyer';
        if (method.includes('update') || method.includes('modify')) return 'updater';
        if (method.includes('validate') || method.includes('check')) return 'validator';
        if (method.includes('process') || method.includes('handle')) return 'processor';

        return 'method';
    }

    inferFunctionPurpose(functionName) {
        const name = functionName.toLowerCase();
        if (name.includes('demo') || name.includes('test') || name.includes('example')) return 'demo';
        if (name.includes('init') || name.includes('setup')) return 'initializer';
        if (name.includes('main') || name.includes('run')) return 'main';
        if (name.includes('helper') || name.includes('util')) return 'utility';
        return 'function';
    }

    inferAccessibility(methodName) {
        if (methodName.startsWith('_')) return 'private';
        if (methodName.startsWith('#')) return 'private';
        return 'public';
    }

    calculateClassComplexity(classStructure) {
        const methodCount = classStructure.methods ? classStructure.methods.length : 0;
        if (methodCount > 15) return 'high';
        if (methodCount > 8) return 'medium';
        return 'low';
    }

    calculateFunctionComplexity(funcStructure) {
        const paramCount = funcStructure.parameters ? funcStructure.parameters.length : 0;
        if (paramCount > 5) return 'high';
        if (paramCount > 2) return 'medium';
        return 'low';
    }

    findClassRelationships(className, classInfo) {
        // Implementation for finding class relationships
        // This would analyze inheritance, composition, etc.
    }

    detectDesignPatterns(className, classInfo) {
        // Implementation for detecting design patterns
        // Singleton, Factory, Observer, etc.
    }

    findFunctionRelationships(funcName, funcInfo) {
        // Implementation for finding function relationships
        // Helper functions, utility functions, etc.
    }

    // ===================================================================
    // TypeScript Helper Methods/เมธอดช่วยเหลือสำหรับ TypeScript
    // ===================================================================

    // แยกคุณสมบัติของ interface
    extractInterfaceProperties(startIndex) {
        const properties = [];
        const startPos = this.content.indexOf('{', startIndex);
        const endPos = this.findMatchingBrace(startPos);

        if (startPos === -1 || endPos === -1) return properties;

        const interfaceBody = this.content.substring(startPos + 1, endPos);
        const lines = interfaceBody.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
                const propertyMatch = trimmed.match(/(\w+)(\?)?:\s*([^;]+);?/);
                if (propertyMatch) {
                    properties.push({
                        name: propertyMatch[1],
                        optional: !!propertyMatch[2],
                        type: propertyMatch[3].trim()
                    });
                }
            }
        });

        return properties;
    }

    // แยกค่าของ enum
    extractEnumValues(enumBody) {
        const values = [];
        const lines = enumBody.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('//')) {
                const valueMatch = trimmed.match(/(\w+)(?:\s*=\s*([^,]+))?/);
                if (valueMatch) {
                    values.push({
                        name: valueMatch[1],
                        value: valueMatch[2] ? valueMatch[2].trim() : null
                    });
                }
            }
        });

        return values;
    }

    // หา matching brace
    findMatchingBrace(startPos) {
        let depth = 1;
        let pos = startPos + 1;

        while (pos < this.content.length && depth > 0) {
            const char = this.content[pos];
            if (char === '{') depth++;
            else if (char === '}') depth--;
            pos++;
        }

        return depth === 0 ? pos - 1 : -1;
    }

    // อนุมานวัตถุประสงค์ของ interface
    inferInterfacePurpose(interfaceName) {
        const name = interfaceName.toLowerCase();

        if (name.includes('config') || name.includes('options')) return 'configuration';
        if (name.includes('result') || name.includes('response')) return 'result_type';
        if (name.includes('request') || name.includes('params')) return 'input_type';
        if (name.includes('error') || name.includes('exception')) return 'error_type';
        if (name.includes('event') || name.includes('listener')) return 'event_type';
        if (name.includes('data') || name.includes('model')) return 'data_type';
        if (name.includes('service') || name.includes('client')) return 'service_interface';
        if (name.includes('repository') || name.includes('dao')) return 'repository_interface';

        return 'interface';
    }

    // อนุมานวัตถุประสงค์ของ type alias
    inferTypePurpose(typeName, typeDefinition) {
        const name = typeName.toLowerCase();
        const definition = typeDefinition.toLowerCase();

        if (name.includes('listener') || name.includes('callback') || name.includes('handler')) return 'callback_type';
        if (name.includes('rule') || name.includes('schema') || name.includes('validation')) return 'validation_type';
        if (name.includes('strategy') || name.includes('policy')) return 'strategy_type';
        if (definition.includes('string') && definition.includes('|')) return 'string_union';
        if (definition.includes('number') && definition.includes('|')) return 'number_union';
        if (definition.includes('=>')) return 'function_type';
        if (definition.includes('{') && definition.includes('}')) return 'object_type';

        return 'type_alias';
    }

    // อนุมานวัตถุประสงค์ของ enum
    inferEnumPurpose(enumName) {
        const name = enumName.toLowerCase();

        if (name.includes('status') || name.includes('state')) return 'status_enum';
        if (name.includes('type') || name.includes('kind')) return 'type_enum';
        if (name.includes('level') || name.includes('priority')) return 'level_enum';
        if (name.includes('direction') || name.includes('order')) return 'direction_enum';
        if (name.includes('mode') || name.includes('strategy')) return 'mode_enum';

        return 'enumeration';
    }

    // อนุมานวัตถุประสงค์ของ abstract class
    inferAbstractClassPurpose(className) {
        const name = className.toLowerCase();

        if (name.includes('base') || name.includes('abstract')) return 'base_class';
        if (name.includes('repository') || name.includes('dao')) return 'repository_base';
        if (name.includes('service') || name.includes('provider')) return 'service_base';
        if (name.includes('controller') || name.includes('handler')) return 'controller_base';
        if (name.includes('component') || name.includes('widget')) return 'component_base';

        return 'abstract_class';
    }
}

// Structure Analyzer:ตัววิเคราะห์โครงสร้างโค้ด
class StructureAnalyzer {
    constructor(tokens, content) {
        this.tokens = tokens.filter(t => t.type !== TOKEN_TYPES.WHITESPACE);
        this.content = content;
        this.lines = content.split('\n');
        this.structures = [];
    }

    // วิเคราะห์โครงสร้างทั้งหมด - Analyze all structures
    analyzeAll() {
        let cursor = 0;

        while (cursor < this.tokens.length) {
            const structure = this.analyzeStructureAt(cursor);
            if (structure) {
                this.structures.push(structure);
                cursor = structure.endTokenIndex || cursor + 1;
            } else {
                cursor++;
            }
        }

        return this.structures;
    }

    // วิเคราะห์โครงสร้างที่ตำแหน่งเฉพาะ - Analyze structure at specific position
    analyzeStructureAt(startCursor) {
        const token = this.tokens[startCursor];
        if (!token) return null;

        // วิเคราะห์ class
        if (token.type === TOKEN_TYPES.KEYWORD && token.value === 'class') {
            return this.analyzeClass(startCursor);
        }

        // วิเคราะห์ const/let/var object
        if (token.type === TOKEN_TYPES.KEYWORD &&
            ['const', 'let', 'var'].includes(token.value)) {
            return this.analyzeObjectDeclaration(startCursor);
        }

        // วิเคราะห์ function
        if (token.type === TOKEN_TYPES.KEYWORD && token.value === 'function') {
            return this.analyzeFunction(startCursor);
        }

        return null;
    }

    // วิเคราะห์คลาส - Analyze class structure
    analyzeClass(startCursor) {
        const classToken = this.tokens[startCursor];
        const nameToken = this.tokens[startCursor + 1];

        if (!nameToken || nameToken.type !== TOKEN_TYPES.IDENTIFIER) {
            return null;
        }

        // หาขอบเขตของคลาส
        const classBounds = this.findBlockBounds(startCursor + 2, TOKEN_TYPES.BRACE_OPEN);
        if (!classBounds) return null;

        // วิเคราะห์สมาชิกของคลาส
        const members = this.analyzeClassMembers(classBounds.startIndex, classBounds.endIndex);

        // อ่านเนื้อหาคลาสเพื่อเข้าใจความหมาย
        const classContent = this.extractContentBetweenLines(classToken.line, classBounds.endLine);
        const purpose = this.inferClassPurpose(nameToken.value, classContent, members);

        return {
            type: 'class',
            name: nameToken.value,
            line: classToken.line,
            column: classToken.column,
            startTokenIndex: startCursor,
            endTokenIndex: classBounds.endTokenIndex,
            endLine: classBounds.endLine,
            members: members,
            purpose: purpose,
            content: classContent
        };
    }

    // วิเคราะห์การประกาศ object - Analyze object declaration
    analyzeObjectDeclaration(startCursor) {
        const keywordToken = this.tokens[startCursor];
        const nameToken = this.tokens[startCursor + 1];
        const equalsToken = this.tokens[startCursor + 2];
        const braceToken = this.tokens[startCursor + 3];

        if (!nameToken || nameToken.type !== TOKEN_TYPES.IDENTIFIER ||
            !equalsToken || equalsToken.type !== TOKEN_TYPES.EQUALS ||
            !braceToken || braceToken.type !== TOKEN_TYPES.BRACE_OPEN) {
            return null;
        }

        // หาขอบเขตของ object
        const objectBounds = this.findBlockBounds(startCursor + 3, TOKEN_TYPES.BRACE_OPEN);
        if (!objectBounds) return null;

        // วิเคราะห์คุณสมบัติของ object
        const properties = this.analyzeObjectProperties(objectBounds.startIndex, objectBounds.endIndex);

        // อ่านเนื้อหา object เพื่อเข้าใจความหมาย
        const objectContent = this.extractContentBetweenLines(keywordToken.line, objectBounds.endLine);
        const purpose = this.inferObjectPurpose(nameToken.value, objectContent, properties);

        return {
            type: 'object',
            name: nameToken.value,
            line: keywordToken.line,
            column: keywordToken.column,
            startTokenIndex: startCursor,
            endTokenIndex: objectBounds.endTokenIndex,
            endLine: objectBounds.endLine,
            properties: properties,
            purpose: purpose,
            content: objectContent
        };
    }

    // วิเคราะห์ฟังก์ชัน - Analyze function structure
    analyzeFunction(startCursor) {
        const functionToken = this.tokens[startCursor];
        const nameToken = this.tokens[startCursor + 1];

        if (!nameToken || nameToken.type !== TOKEN_TYPES.IDENTIFIER) {
            return null;
        }

        // หาพารามิเตอร์
        const params = this.extractFunctionParameters(startCursor + 2);

        // หาขอบเขตของฟังก์ชัน
        const functionBounds = this.findFunctionBounds(startCursor);
        if (!functionBounds) return null;

        // อ่านเนื้อหาฟังก์ชันเพื่อเข้าใจความหมาย
        const functionContent = this.extractContentBetweenLines(functionToken.line, functionBounds.endLine);
        const purpose = this.inferFunctionPurpose(nameToken.value, functionContent, params);

        return {
            type: 'function',
            name: nameToken.value,
            line: functionToken.line,
            column: functionToken.column,
            startTokenIndex: startCursor,
            endTokenIndex: functionBounds.endTokenIndex,
            endLine: functionBounds.endLine,
            parameters: params,
            purpose: purpose,
            content: functionContent
        };
    }

    // หาขอบเขตของบล็อค - Find block bounds
    findBlockBounds(startCursor, openType) {
        let depth = 0;
        let startIndex = -1;
        let endIndex = -1;
        let endTokenIndex = -1;

        for (let i = startCursor; i < this.tokens.length; i++) {
            const token = this.tokens[i];

            if (token.type === openType) {
                if (depth === 0) {
                    startIndex = i;
                }
                depth++;
            } else if (token.type === TOKEN_TYPES.BRACE_CLOSE) {
                depth--;
                if (depth === 0) {
                    endIndex = i;
                    endTokenIndex = i;
                    break;
                }
            }
        }

        if (startIndex === -1 || endIndex === -1) {
            return null;
        }

        return {
            startIndex,
            endIndex,
            endTokenIndex,
            endLine: this.tokens[endIndex]?.line || 0
        };
    }

    // หาขอบเขตของฟังก์ชัน - Find function bounds
    findFunctionBounds(startCursor) {
        // หา { แรกหลังจาก )
        let braceStart = -1;
        let parenDepth = 0;

        for (let i = startCursor; i < this.tokens.length; i++) {
            const token = this.tokens[i];

            if (token.type === TOKEN_TYPES.PAREN_OPEN) {
                parenDepth++;
            } else if (token.type === TOKEN_TYPES.PAREN_CLOSE) {
                parenDepth--;
            } else if (token.type === TOKEN_TYPES.BRACE_OPEN && parenDepth === 0) {
                braceStart = i;
                break;
            }
        }

        if (braceStart === -1) return null;

        return this.findBlockBounds(braceStart, TOKEN_TYPES.BRACE_OPEN);
    }

    // วิเคราะห์สมาชิกของคลาส - Analyze class members
    analyzeClassMembers(startIndex, endIndex) {
        const members = [];
        // Implementation for analyzing class methods and properties
        // This would parse constructor, methods, properties, etc.
        return members;
    }

    // วิเคราะห์คุณสมบัติของ object - Analyze object properties
    analyzeObjectProperties(startIndex, endIndex) {
        const properties = [];

        for (let i = startIndex + 1; i < endIndex; i++) {
            const token = this.tokens[i];

            if (token.type === TOKEN_TYPES.IDENTIFIER) {
                const nextToken = this.tokens[i + 1];
                if (nextToken && nextToken.value === ':') {
                    // พบคุณสมบัติ
                    const valueToken = this.tokens[i + 2];
                    properties.push({
                        name: token.value,
                        line: token.line,
                        value: valueToken?.value || '',
                        type: this.inferPropertyType(valueToken)
                    });
                }
            }
        }

        return properties;
    }

    // แยกพารามิเตอร์ของฟังก์ชัน - Extract function parameters
    extractFunctionParameters(startCursor) {
        const params = [];
        let depth = 0;

        for (let i = startCursor; i < this.tokens.length; i++) {
            const token = this.tokens[i];

            if (token.type === TOKEN_TYPES.PAREN_OPEN) {
                depth++;
            } else if (token.type === TOKEN_TYPES.PAREN_CLOSE) {
                depth--;
                if (depth === 0) break;
            } else if (token.type === TOKEN_TYPES.IDENTIFIER && depth === 1) {
                params.push(token.value);
            }
        }

        return params;
    }

    // แยกเนื้อหาระหว่างบรรทัด - Extract content between lines
    extractContentBetweenLines(startLine, endLine) {
        const lines = [];
        for (let i = startLine - 1; i < endLine && i < this.lines.length; i++) {
            lines.push(this.lines[i]);
        }
        return lines.join('\n');
    }

    // อนุมานจุดประสงค์ของคลาส - Infer class purpose
    inferClassPurpose(className, content, members) {
        const name = className.toLowerCase();

        // วิเคราะห์จากชื่อคลาส
        if (name.includes('tokenizer')) {
            return {
                english: `${className} tokenizer`,
                thai: `โทเค็นไนเซอร์ ${className}`,
                category: 'parser'
            };
        }

        if (name.includes('matcher') || name.includes('pattern')) {
            return {
                english: `${className} pattern matcher`,
                thai: `ตัวจับรูปแบบ ${className}`,
                category: 'matcher'
            };
        }

        if (name.includes('generator') || name.includes('creator')) {
            return {
                english: `${className} generator`,
                thai: `ตัวสร้าง ${className}`,
                category: 'generator'
            };
        }

        if (name.includes('analyzer') || name.includes('scanner')) {
            return {
                english: `${className} analyzer`,
                thai: `ตัววิเคราะห์ ${className}`,
                category: 'analyzer'
            };
        }

        // วิเคราะห์จากเนื้อหา
        if (content.includes('constructor') && content.includes('this.')) {
            return {
                english: `${className} class`,
                thai: `คลาส ${className}`,
                category: 'class'
            };
        }

        return {
            english: `${className} component`,
            thai: `ส่วนประกอบ ${className}`,
            category: 'component'
        };
    }

    // อนุมานจุดประสงค์ของ object - Infer object purpose
    inferObjectPurpose(objectName, content, properties) {
        const name = objectName.toLowerCase();

        // วิเคราะห์จากชื่อ
        if (name.includes('types') || name.includes('type')) {
            return {
                english: `${objectName} type definitions`,
                thai: `คำจำกัดความประเภท ${objectName}`,
                category: 'types'
            };
        }

        if (name.includes('config') || name.includes('settings')) {
            return {
                english: `${objectName} configuration`,
                thai: `การกำหนดค่า ${objectName}`,
                category: 'config'
            };
        }

        if (name.includes('constants') || name.includes('const')) {
            return {
                english: `${objectName} constants`,
                thai: `ค่าคงที่ ${objectName}`,
                category: 'constants'
            };
        }

        // วิเคราะห์จากคุณสมบัติ
        if (properties.length > 5 && properties.every(p => p.type === 'string')) {
            return {
                english: `${objectName} enumeration`,
                thai: `การแจงนับ ${objectName}`,
                category: 'enum'
            };
        }

        return {
            english: `${objectName} object`,
            thai: `วัตถุ ${objectName}`,
            category: 'object'
        };
    }

    // อนุมานจุดประสงค์ของฟังก์ชัน - Infer function purpose  
    inferFunctionPurpose(functionName, content, parameters) {
        const name = functionName.toLowerCase();

        // วิเคราะห์จากชื่อและเนื้อหา
        if (content.includes('return') && content.includes('new ')) {
            return {
                english: `Create ${functionName}`,
                thai: `สร้าง ${functionName}`,
                category: 'factory'
            };
        }

        if (content.includes('this.') && content.includes('=')) {
            return {
                english: `Initialize ${functionName}`,
                thai: `เริ่มต้น ${functionName}`,
                category: 'constructor'
            };
        }

        // ใช้ระบบเดิมแต่ปรับปรุง
        return {
            english: `Process ${functionName}`,
            thai: `ประมวลผล ${functionName}`,
            category: 'process'
        };
    }

    // อนุมานประเภทของคุณสมบัติ - Infer property type
    inferPropertyType(token) {
        if (!token) return 'unknown';

        if (token.type === TOKEN_TYPES.STRING) return 'string';
        if (token.type === TOKEN_TYPES.NUMBER) return 'number';
        if (token.value === 'true' || token.value === 'false') return 'boolean';
        if (token.type === TOKEN_TYPES.BRACE_OPEN) return 'object';

        return 'identifier';
    }
}

// ======================================================================
// Comment Generation Engine/เครื่องมือสร้างคอมเมนต์
// ======================================================================

// Comment Generator:ตัวสร้างคอมเมนต์
class CommentGenerator {
    constructor() {
        this.functionDescriptions = {
            // ═══════════════════════════════════════════════════════════════
            // DATABASE & CRUD OPERATIONS - การดำเนินการฐานข้อมูล
            // ═══════════════════════════════════════════════════════════════
            'get': ['Get data', 'ดึงข้อมูล'],
            'fetch': ['Fetch data', 'ดึงข้อมูล'],
            'retrieve': ['Retrieve data', 'ดึงข้อมูล'],
            'load': ['Load data', 'โหลดข้อมูล'],
            'read': ['Read data', 'อ่านข้อมูล'],
            'find': ['Find data', 'ค้นหาข้อมูล'],
            'search': ['Search data', 'ค้นหาข้อมูล'],
            'query': ['Query data', 'สอบถามข้อมูล'],
            'select': ['Select data', 'เลือกข้อมูล'],
            'filter': ['Filter data', 'กรองข้อมูล'],
            'sort': ['Sort data', 'เรียงข้อมูล'],
            'order': ['Order data', 'จัดเรียงข้อมูล'],
            'create': ['Create data', 'สร้างข้อมูล'],
            'insert': ['Insert data', 'เพิ่มข้อมูล'],
            'addinterceptor': ['Add interceptor', 'เพิ่มตัวสกัดกั้น'],
            'addrequestinterceptor': ['Add request interceptor', 'เพิ่มตัวสกัดกั้นคำขอ'],
            'addresponseinterceptor': ['Add response interceptor', 'เพิ่มตัวสกัดกั้นการตอบกลับ'],
            'tojson': ['Convert to JSON', 'แปลงเป็น JSON'],
            'fromjson': ['Create from JSON', 'สร้างจาก JSON'],
            'isretryable': ['Check if retryable', 'ตรวจสอบว่าลองใหม่ได้หรือไม่'],
            'performrequest': ['Perform request', 'ดำเนินการขอ'],
            'retryrequest': ['Retry request', 'ลองคำขอใหม่'],
            'withretry': ['With retry logic', 'พร้อมตรรกะลองใหม่'],
            'post': ['Post data', 'โพสต์ข้อมูล'],
            'put': ['Put data', 'ใส่ข้อมูล'],
            'update': ['Update data', 'อัพเดทข้อมูล'],
            'modify': ['Modify data', 'แก้ไขข้อมูล'],
            'edit': ['Edit data', 'แก้ไขข้อมูล'],
            'patch': ['Patch data', 'แพทช์ข้อมูล'],
            'change': ['Change data', 'เปลี่ยนข้อมูล'],
            'delete': ['Delete data', 'ลบข้อมูล'],
            'remove': ['Remove item', 'ลบรายการ'],
            'destroy': ['Destroy data', 'ทำลายข้อมูล'],
            'drop': ['Drop data', 'ทิ้งข้อมูล'],
            'save': ['Save data', 'บันทึกข้อมูล'],
            'store': ['Store data', 'เก็บข้อมูล'],
            'persist': ['Persist data', 'บันทึกถาวร'],
            'commit': ['Commit changes', 'ยืนยันการเปลี่ยนแปลง'],
            'rollback': ['Rollback changes', 'ย้อนกลับการเปลี่ยนแปลง'],

            // ═══════════════════════════════════════════════════════════════
            // VALIDATION & VERIFICATION - การตรวจสอบและยืนยัน
            // ═══════════════════════════════════════════════════════════════
            'validate': ['Validate input', 'ตรวจสอบความถูกต้อง'],
            'check': ['Check data', 'ตรวจสอบข้อมูล'],
            'verify': ['Verify data', 'ยืนยันข้อมูล'],
            'test': ['Test function', 'ทดสอบฟังก์ชัน'],
            'ensure': ['Ensure condition', 'ประกันเงื่อนไข'],
            'assert': ['Assert condition', 'ยืนยันเงื่อนไข'],
            'confirm': ['Confirm action', 'ยืนยันการกระทำ'],
            'authorize': ['Authorize user', 'อนุญาตผู้ใช้'],
            'authenticate': ['Authenticate user', 'รับรองผู้ใช้'],
            'permit': ['Permit access', 'อนุญาตการเข้าถึง'],
            'allow': ['Allow action', 'อนุญาตการกระทำ'],
            'deny': ['Deny access', 'ปฏิเสธการเข้าถึง'],
            'reject': ['Reject request', 'ปฏิเสธคำขอ'],
            'approve': ['Approve request', 'อนุมัติคำขอ'],

            // ═══════════════════════════════════════════════════════════════
            // PROCESSING & COMPUTATION - การประมวลผลและคำนวณ
            // ═══════════════════════════════════════════════════════════════
            'process': ['Process data', 'ประมวลผลข้อมูล'],
            'handle': ['Handle event', 'จัดการเหตุการณ์'],
            'execute': ['Execute command', 'ดำเนินการคำสั่ง'],
            'run': ['Run process', 'รันกระบวนการ'],
            'perform': ['Perform action', 'ปฏิบัติการ'],
            'operate': ['Operate system', 'ดำเนินการระบบ'],
            'start': ['Start process', 'เริ่มกระบวนการ'],
            'begin': ['Begin operation', 'เริ่มการดำเนินการ'],
            'launch': ['Launch application', 'เปิดแอปพลิเคชัน'],
            'init': ['Initialize system', 'เริ่มต้นระบบ'],
            'initialize': ['Initialize data', 'เริ่มต้นข้อมูล'],
            'setup': ['Setup configuration', 'ตั้งค่าระบบ'],
            'configure': ['Configure settings', 'กำหนดค่าการตั้งค่า'],
            'stop': ['Stop process', 'หยุดกระบวนการ'],
            'end': ['End operation', 'สิ้นสุดการดำเนินการ'],
            'finish': ['Finish task', 'เสร็จสิ้นงาน'],
            'complete': ['Complete operation', 'ดำเนินการเสร็จสิ้น'],
            'terminate': ['Terminate process', 'ยุติกระบวนการ'],
            'kill': ['Kill process', 'ฆ่ากระบวนการ'],
            'abort': ['Abort operation', 'ยกเลิกการดำเนินการ'],
            'cancel': ['Cancel request', 'ยกเลิกคำขอ'],
            'pause': ['Pause execution', 'หยุดชั่วคราว'],
            'resume': ['Resume execution', 'ดำเนินการต่อ'],
            'restart': ['Restart system', 'เริ่มต้นใหม่'],
            'reload': ['Reload data', 'โหลดข้อมูลใหม่'],
            'refresh': ['Refresh content', 'รีเฟรชเนื้อหา'],
            'reset': ['Reset state', 'รีเซ็ตสถานะ'],
            'clear': ['Clear data', 'เคลียร์ข้อมูล'],
            'clean': ['Clean up', 'ทำความสะอาด'],
            'flush': ['Flush cache', 'ล้างแคช'],
            'purge': ['Purge data', 'ลบข้อมูลออก'],

            // ═══════════════════════════════════════════════════════════════
            // DATA TRANSFORMATION - การแปลงข้อมูล
            // ═══════════════════════════════════════════════════════════════
            'parse': ['Parse data', 'แปลงข้อมูล'],
            'format': ['Format data', 'จัดรูปแบบข้อมูล'],
            'convert': ['Convert data', 'แปลงข้อมูล'],
            'transform': ['Transform data', 'เปลี่ยนแปลงข้อมูล'],
            'map': ['Map data', 'แมปข้อมูล'],
            'reduce': ['Reduce data', 'ลดข้อมูล'],
            'filter': ['Filter data', 'กรองข้อมูล'],
            'compress': ['Compress data', 'บีบอัดข้อมูล'],
            'decompress': ['Decompress data', 'คลายการบีบอัด'],
            'encode': ['Encode data', 'เข้ารหัสข้อมูล'],
            'decode': ['Decode data', 'ถอดรหัสข้อมูล'],
            'encrypt': ['Encrypt data', 'เข้ารหัสข้อมูล'],
            'decrypt': ['Decrypt data', 'ถอดรหัสข้อมูล'],
            'hash': ['Hash data', 'แฮชข้อมูล'],
            'serialize': ['Serialize data', 'ซีเรียลไลซ์ข้อมูล'],
            'deserialize': ['Deserialize data', 'ดีซีเรียลไลซ์ข้อมูล'],
            'stringify': ['Stringify data', 'แปลงเป็นสตริง'],
            'normalize': ['Normalize data', 'ทำให้ข้อมูลเป็นมาตรฐาน'],
            'sanitize': ['Sanitize input', 'ทำความสะอาดข้อมูลนำเข้า'],
            'escape': ['Escape characters', 'หลีกเลี่ยงอักขระ'],

            // ═══════════════════════════════════════════════════════════════
            // MATHEMATICAL & COMPUTATIONAL - คณิตศาสตร์และการคำนวณ
            // ═══════════════════════════════════════════════════════════════
            'calculate': ['Calculate value', 'คำนวณค่า'],
            'compute': ['Compute result', 'คำนวณผลลัพธ์'],
            'evaluate': ['Evaluate expression', 'ประเมินนิพจน์'],
            'measure': ['Measure value', 'วัดค่า'],
            'count': ['Count items', 'นับจำนวน'],
            'sum': ['Sum values', 'รวมค่า'],
            'total': ['Total amount', 'จำนวนรวม'],
            'average': ['Average value', 'ค่าเฉลี่ย'],
            'mean': ['Mean value', 'ค่าเฉลี่ย'],
            'median': ['Median value', 'ค่ามัธยฐาน'],
            'mode': ['Mode value', 'ค่าฐานนิยม'],
            'min': ['Minimum value', 'ค่าต่ำสุด'],
            'max': ['Maximum value', 'ค่าสูงสุด'],
            'range': ['Range of values', 'ช่วงค่า'],
            'variance': ['Variance calculation', 'การคำนวณความแปรปรวน'],
            'deviation': ['Deviation calculation', 'การคำนวณส่วนเบียงเบน'],
            'round': ['Round number', 'ปัดเศษจำนวน'],
            'ceil': ['Ceiling number', 'ปัดขึ้น'],
            'floor': ['Floor number', 'ปัดลง'],
            'abs': ['Absolute value', 'ค่าสัมบูรณ์'],
            'sqrt': ['Square root', 'รากที่สอง'],
            'pow': ['Power calculation', 'การยกกำลัง'],
            'log': ['Logarithm calculation', 'การคำนวณลอการิทึม'],
            'sin': ['Sine function', 'ฟังก์ชันไซน์'],
            'cos': ['Cosine function', 'ฟังก์ชันโคไซน์'],
            'tan': ['Tangent function', 'ฟังก์ชันแทนเจนต์'],

            // ═══════════════════════════════════════════════════════════════
            // UI & PRESENTATION - อินเทอร์เฟซและการแสดงผล
            // ═══════════════════════════════════════════════════════════════
            'render': ['Render content', 'แสดงผลเนื้อหา'],
            'display': ['Display info', 'แสดงข้อมูล'],
            'show': ['Show element', 'แสดงองค์ประกอบ'],
            'hide': ['Hide element', 'ซ่อนองค์ประกอบ'],
            'toggle': ['Toggle state', 'สลับสถานะ'],
            'open': ['Open dialog', 'เปิดไดอะล็อก'],
            'close': ['Close window', 'ปิดหน้าต่าง'],
            'modal': ['Modal dialog', 'ไดอะล็อกโมดัล'],
            'popup': ['Popup window', 'หน้าต่างป๊อปอัป'],
            'tooltip': ['Tooltip display', 'แสดงคำแนะนำ'],
            'menu': ['Menu system', 'ระบบเมนู'],
            'dropdown': ['Dropdown menu', 'เมนูดรอปดาวน์'],
            'sidebar': ['Sidebar component', 'ส่วนประกอบแถบข้าง'],
            'navbar': ['Navigation bar', 'แถบนำทาง'],
            'header': ['Header component', 'ส่วนหัว'],
            'footer': ['Footer component', 'ส่วนท้าย'],
            'panel': ['Panel component', 'ส่วนประกอบแผง'],
            'tab': ['Tab component', 'ส่วนประกอบแท็บ'],
            'card': ['Card component', 'ส่วนประกอบการ์ด'],
            'button': ['Button component', 'ส่วนประกอบปุ่ม'],
            'input': ['Input field', 'ช่องข้อมูลนำเข้า'],
            'form': ['Form component', 'ส่วนประกอบฟอร์ม'],
            'table': ['Table component', 'ส่วนประกอบตาราง'],
            'list': ['List component', 'ส่วนประกอบรายการ'],
            'grid': ['Grid layout', 'เลย์เอาต์กริด'],
            'chart': ['Chart visualization', 'การแสดงผลแผนภูมิ'],
            'graph': ['Graph display', 'การแสดงผลกราฟ'],

            // ═══════════════════════════════════════════════════════════════
            // NETWORKING & COMMUNICATION - เครือข่ายและการสื่อสาร
            // ═══════════════════════════════════════════════════════════════
            'send': ['Send data', 'ส่งข้อมูล'],
            'receive': ['Receive data', 'รับข้อมูล'],
            'request': ['Request data', 'ขอข้อมูล'],
            'response': ['Response data', 'ตอบกลับข้อมูล'],
            'connect': ['Connect server', 'เชื่อมต่อเซิร์ฟเวอร์'],
            'disconnect': ['Disconnect server', 'ตัดการเชื่อมต่อ'],
            'socket': ['Socket connection', 'การเชื่อมต่อซ็อกเก็ต'],
            'websocket': ['WebSocket connection', 'การเชื่อมต่อเว็บซ็อกเก็ต'],
            'http': ['HTTP request', 'คำขอ HTTP'],
            'https': ['HTTPS request', 'คำขอ HTTPS'],
            'api': ['API endpoint', 'จุดสิ้นสุด API'],
            'rest': ['REST API', 'REST API'],
            'graphql': ['GraphQL query', 'คิวรี GraphQL'],
            'ajax': ['AJAX request', 'คำขอ AJAX'],
            'xhr': ['XMLHttpRequest', 'XMLHttpRequest'],
            'download': ['Download file', 'ดาวน์โหลดไฟล์'],
            'upload': ['Upload file', 'อัปโหลดไฟล์'],
            'stream': ['Stream data', 'สตรีมข้อมูล'],
            'broadcast': ['Broadcast message', 'ออกอากาศข้อความ'],
            'publish': ['Publish event', 'เผยแพร่เหตุการณ์'],
            'subscribe': ['Subscribe event', 'สมัครสมาชิกเหตุการณ์'],
            'emit': ['Emit signal', 'ส่งสัญญาณ'],
            'listen': ['Listen event', 'ฟังเหตุการณ์'],
            'poll': ['Poll data', 'โพลข้อมูล'],

            // ═══════════════════════════════════════════════════════════════
            // FILE & STORAGE OPERATIONS - การดำเนินการไฟล์และที่เก็บข้อมูล
            // ═══════════════════════════════════════════════════════════════
            'file': ['File operation', 'การดำเนินการไฟล์'],
            'folder': ['Folder operation', 'การดำเนินการโฟลเดอร์'],
            'directory': ['Directory operation', 'การดำเนินการไดเรกทอรี'],
            'path': ['Path handling', 'การจัดการพาธ'],
            'write': ['Write file', 'เขียนไฟล์'],
            'read': ['Read file', 'อ่านไฟล์'],
            'copy': ['Copy file', 'คัดลอกไฟล์'],
            'move': ['Move file', 'ย้ายไฟล์'],
            'rename': ['Rename file', 'เปลี่ยนชื่อไฟล์'],
            'create': ['Create file', 'สร้างไฟล์'],
            'mkdir': ['Make directory', 'สร้างไดเรกทอรี'],
            'exists': ['Check existence', 'ตรวจสอบการมีอยู่'],
            'stat': ['File statistics', 'สถิติไฟล์'],
            'watch': ['Watch changes', 'เฝ้าดูการเปลี่ยนแปลง'],
            'backup': ['Backup data', 'สำรองข้อมูล'],
            'restore': ['Restore data', 'กู้คืนข้อมูล'],
            'archive': ['Archive files', 'เก็บถาวรไฟล์'],
            'extract': ['Extract archive', 'แยกไฟล์เก็บถาวร'],
            'zip': ['Zip files', 'บีบอัดไฟล์'],
            'unzip': ['Unzip files', 'แตกไฟล์บีบอัด'],

            // ═══════════════════════════════════════════════════════════════
            // CACHE & MEMORY MANAGEMENT - การจัดการแคชและหน่วยความจำ
            // ═══════════════════════════════════════════════════════════════
            'cache': ['Cache data', 'แคชข้อมูล'],
            'memoize': ['Memoize function', 'จดจำฟังก์ชัน'],
            'buffer': ['Buffer data', 'บัฟเฟอร์ข้อมูล'],
            'pool': ['Connection pool', 'พูลการเชื่อมต่อ'],
            'queue': ['Queue system', 'ระบบคิว'],
            'stack': ['Stack operations', 'การดำเนินการสแต็ก'],
            'heap': ['Heap management', 'การจัดการฮีป'],
            'memory': ['Memory management', 'การจัดการหน่วยความจำ'],
            'garbage': ['Garbage collection', 'การเก็บขยะ'],
            'leak': ['Memory leak', 'การรั่วไหลของหน่วยความจำ'],
            'allocate': ['Allocate memory', 'จัดสรรหน่วยความจำ'],
            'deallocate': ['Deallocate memory', 'ยกเลิกการจัดสรร'],
            'optimize': ['Optimize performance', 'เพิ่มประสิทธิภาพ'],
            'throttle': ['Throttle execution', 'จำกัดการดำเนินการ'],
            'debounce': ['Debounce function', 'ดีเบาส์ฟังก์ชัน'],

            // ═══════════════════════════════════════════════════════════════
            // ERROR HANDLING & LOGGING - การจัดการข้อผิดพลาดและการบันทึก
            // ═══════════════════════════════════════════════════════════════
            'error': ['Error handling', 'การจัดการข้อผิดพลาด'],
            'exception': ['Exception handling', 'การจัดการข้อยกเว้น'],
            'throw': ['Throw error', 'โยนข้อผิดพลาด'],
            'catch': ['Catch error', 'จับข้อผิดดพลาด'],
            'try': ['Try operation', 'ลองการดำเนินการ'],
            'finally': ['Finally block', 'บล็อกสุดท้าย'],
            'log': ['Log message', 'บันทึกข้อความ'],
            'warn': ['Warning message', 'ข้อความเตือน'],
            'info': ['Information message', 'ข้อความข้อมูล'],
            'debug': ['Debug message', 'ข้อความดีบัก'],
            'trace': ['Trace execution', 'ติดตามการดำเนินการ'],
            'monitor': ['Monitor system', 'ตรวจสอบระบบ'],
            'alert': ['Alert notification', 'การแจ้งเตือน'],
            'notify': ['Notify user', 'แจ้งผู้ใช้'],

            // ═══════════════════════════════════════════════════════════════
            // SECURITY & AUTHENTICATION - ความปลอดภัยและการรับรอง
            // ═══════════════════════════════════════════════════════════════
            'login': ['Login user', 'เข้าสู่ระบบผู้ใช้'],
            'logout': ['Logout user', 'ออกจากระบบผู้ใช้'],
            'signin': ['Sign in user', 'ลงชื่อเข้าใช้'],
            'signout': ['Sign out user', 'ลงชื่อออก'],
            'signup': ['Sign up user', 'สมัครสมาชิก'],
            'register': ['Register user', 'ลงทะเบียนผู้ใช้'],
            'auth': ['Authentication', 'การรับรองตัวตน'],
            'token': ['Token management', 'การจัดการโทเคน'],
            'jwt': ['JWT token', 'โทเคน JWT'],
            'session': ['Session management', 'การจัดการเซสชัน'],
            'cookie': ['Cookie handling', 'การจัดการคุกกี้'],
            'csrf': ['CSRF protection', 'การป้องกัน CSRF'],
            'xss': ['XSS protection', 'การป้องกัน XSS'],
            'cors': ['CORS handling', 'การจัดการ CORS'],
            'secure': ['Security function', 'ฟังก์ชันความปลอดภัย'],
            'permission': ['Permission check', 'ตรวจสอบสิทธิ์'],
            'role': ['Role management', 'การจัดการบทบาท'],
            'acl': ['Access control', 'การควบคุมการเข้าถึง'],

            // ═══════════════════════════════════════════════════════════════
            // TESTING & QUALITY ASSURANCE - การทดสอบและการประกันคุณภาพ
            // ═══════════════════════════════════════════════════════════════
            'test': ['Test function', 'ทดสอบฟังก์ชัน'],
            'spec': ['Specification test', 'ทดสอบข้อกำหนด'],
            'suite': ['Test suite', 'ชุดทดสอบ'],
            'case': ['Test case', 'กรณีทดสอบ'],
            'mock': ['Mock function', 'ฟังก์ชันจำลอง'],
            'stub': ['Stub function', 'ฟังก์ชันดัมมี่'],
            'spy': ['Spy function', 'ฟังก์ชันสายลับ'],
            'expect': ['Expect assertion', 'การยืนยันคาดหวัง'],
            'should': ['Should assertion', 'การยืนยันควร'],
            'describe': ['Describe test', 'อธิบายการทดสอบ'],
            'it': ['Test case description', 'คำอธิบายกรณีทดสอบ'],
            'before': ['Before hook', 'ฮุคก่อนหน้า'],
            'after': ['After hook', 'ฮุคหลังจาก'],
            'setup': ['Setup test', 'ตั้งค่าการทดสอบ'],
            'teardown': ['Teardown test', 'ทำลายการทดสอบ'],
            'benchmark': ['Benchmark test', 'ทดสอบประสิทธิภาพ'],
            'performance': ['Performance test', 'ทดสอบประสิทธิภาพ'],

            // ═══════════════════════════════════════════════════════════════
            // UTILITY & HELPER FUNCTIONS - ฟังก์ชันช่วยเหลือและเครื่องมือ
            // ═══════════════════════════════════════════════════════════════
            'util': ['Utility function', 'ฟังก์ชันเครื่องมือ'],
            'helper': ['Helper function', 'ฟังก์ชันช่วยเหลือ'],
            'tool': ['Tool function', 'ฟังก์ชันเครื่องมือ'],
            'generator': ['Generator function', 'ฟังก์ชันตัวสร้าง'],
            'factory': ['Factory function', 'ฟังก์ชันโรงงาน'],
            'builder': ['Builder function', 'ฟังก์ชันผู้สร้าง'],
            'creator': ['Creator function', 'ฟังก์ชันผู้สร้าง'],
            'constructor': ['Constructor function', 'ฟังก์ชันคอนสตรัคเตอร์'],
            'destructor': ['Destructor function', 'ฟังก์ชันดีสตรัคเตอร์'],
            'adapter': ['Adapter pattern', 'รูปแบบอะแดปเตอร์'],
            'wrapper': ['Wrapper function', 'ฟังก์ชันห่อหุ้ม'],
            'decorator': ['Decorator pattern', 'รูปแบบเดคคอเรเตอร์'],
            'observer': ['Observer pattern', 'รูปแบบผู้สังเกตการณ์'],
            'strategy': ['Strategy pattern', 'รูปแบบกลยุทธ์'],
            'singleton': ['Singleton pattern', 'รูปแบบซิงเกิลตัน'],

            // ═══════════════════════════════════════════════════════════════
            // CLASSES & COMPLEX TYPES - คลาสและประเภทที่ซับซ้อน
            // ═══════════════════════════════════════════════════════════════
            'class': ['Class definition', 'คำจำกัดความคลาส'],
            'interface': ['Interface definition', 'คำจำกัดความอินเทอร์เฟซ'],
            'type': ['Type definition', 'คำจำกัดความประเภท'],
            'enum': ['Enumeration', 'การนับเลข'],
            'struct': ['Structure definition', 'คำจำกัดความโครงสร้าง'],
            'module': ['Module definition', 'คำจำกัดความโมดูล'],
            'component': ['Component class', 'คลาสส่วนประกอบ'],
            'service': ['Service class', 'คลาสบริการ'],
            'controller': ['Controller class', 'คลาสควบคุม'],
            'model': ['Model class', 'คลาสแบบจำลอง'],
            'view': ['View class', 'คลาสมุมมอง'],
            'repository': ['Repository class', 'คลาสที่เก็บ'],
            'dao': ['Data Access Object', 'วัตถุการเข้าถึงข้อมูล'],
            'dto': ['Data Transfer Object', 'วัตถุการถ่ายโอนข้อมูล'],
            'entity': ['Entity class', 'คลาสเอนทิตี'],
            'manager': ['Manager class', 'คลาสผู้จัดการ'],
            'handler': ['Handler class', 'คลาสผู้จัดการ'],
            'processor': ['Processor class', 'คลาสผู้ประมวลผล'],
            'validator': ['Validator class', 'คลาสตัวตรวจสอบ'],
            'parser': ['Parser class', 'คลาสตัวแยกวิเคราะห์'],
            'formatter': ['Formatter class', 'คลาสตัวจัดรูปแบบ'],
            'converter': ['Converter class', 'คลาสตัวแปลง'],
            'transformer': ['Transformer class', 'คลาสตัวเปลี่ยนแปลง'],
            'builder': ['Builder class', 'คลาสตัวสร้าง'],
            'factory': ['Factory class', 'คลาสโรงงาน'],
            'strategy': ['Strategy class', 'คลาสกลยุทธ์'],
            'command': ['Command class', 'คลาสคำสั่ง'],
            'event': ['Event class', 'คลาสเหตุการณ์'],
            'listener': ['Listener class', 'คลาสตัวฟัง'],
            'observer': ['Observer class', 'คลาสผู้สังเกตการณ์'],
            'subject': ['Subject class', 'คลาสหัวข้อ'],
            'proxy': ['Proxy class', 'คลาสพร็อกซี่'],
            'adapter': ['Adapter class', 'คลาสอะแดปเตอร์'],
            'facade': ['Facade class', 'คลาสหน้าต่าง'],
            'bridge': ['Bridge class', 'คลาสสะพาน'],
            'composite': ['Composite class', 'คลาสคอมโพสิต'],
            'decorator': ['Decorator class', 'คลาสเดคคอเรเตอร์'],
            'flyweight': ['Flyweight class', 'คลาสน้ำหนักเบา'],
            'iterator': ['Iterator class', 'คลาสตัววนซ้ำ'],
            'mediator': ['Mediator class', 'คลาสผู้ไกล่เกลี่ย'],
            'memento': ['Memento class', 'คลาสที่ระลึก'],
            'prototype': ['Prototype class', 'คลาสต้นแบบ'],
            'state': ['State class', 'คลาสสถานะ'],
            'template': ['Template class', 'คลาสแม่แบบ'],
            'visitor': ['Visitor class', 'คลาสผู้เยือน'],
            'calculator': ['Calculator class', 'คลาสเครื่องคิดเลข'],
            'advanced': ['Advanced system', 'ระบบขั้นสูง'],
            'complex': ['Complex system', 'ระบบที่ซับซ้อน'],
            'simple': ['Simple function', 'ฟังก์ชันง่าย'],
            'basic': ['Basic function', 'ฟังก์ชันพื้นฐาน'],
            'core': ['Core function', 'ฟังก์ชันหลัก'],
            'main': ['Main function', 'ฟังก์ชันหลัก'],
            'primary': ['Primary function', 'ฟังก์ชันหลัก'],
            'secondary': ['Secondary function', 'ฟังก์ชันรอง'],
            'custom': ['Custom function', 'ฟังก์ชันกำหนดเอง'],
            'dynamic': ['Dynamic function', 'ฟังก์ชันไดนามิก'],
            'static': ['Static function', 'ฟังก์ชันสแตติก'],
            'async': ['Async function', 'ฟังก์ชันแบบอะซิงค์'],
            'sync': ['Sync function', 'ฟังก์ชันแบบซิงค์'],
            'generic': ['Generic function', 'ฟังก์ชันทั่วไป'],
            'specific': ['Specific function', 'ฟังก์ชันเฉพาะ'],
            'abstract': ['Abstract function', 'ฟังก์ชันนามธรรม'],
            'concrete': ['Concrete function', 'ฟังก์ชันที่เป็นรูปธรรม'],
            'virtual': ['Virtual function', 'ฟังก์ชันเสมือน'],
            'override': ['Override function', 'ฟังก์ชันเขียนทับ'],
            'implement': ['Implementation', 'การนำไปใช้'],
            'extend': ['Extension function', 'ฟังก์ชันส่วนขยาย'],
            'inherit': ['Inheritance function', 'ฟังก์ชันการสืบทอด'],
            'compose': ['Composition function', 'ฟังก์ชันการผสมผสาน'],
            'aggregate': ['Aggregation function', 'ฟังก์ชันการรวบรวม'],
            'associate': ['Association function', 'ฟังก์ชันการเชื่อมโยง'],
            'delegate': ['Delegation function', 'ฟังก์ชันการมอบหมาย'],
            'encapsulate': ['Encapsulation function', 'ฟังก์ชันการห่อหุ้ม'],
            'polymorphic': ['Polymorphic function', 'ฟังก์ชันแบบพหุรูป'],

            // ═══════════════════════════════════════════════════════════════
            // FRAMEWORK & LIBRARY SPECIFIC - เฉพาะเฟรมเวิร์กและไลบรารี
            // ═══════════════════════════════════════════════════════════════
            'react': ['React component', 'คอมโพเนนต์ React'],
            'vue': ['Vue component', 'คอมโพเนนต์ Vue'],
            'angular': ['Angular component', 'คอมโพเนนต์ Angular'],
            'nodejs': ['Node.js function', 'ฟังก์ชัน Node.js'],
            'express': ['Express middleware', 'มิดเดิลแวร์ Express'],
            'redux': ['Redux action', 'การกระทำ Redux'],
            'mongoose': ['Mongoose model', 'แบบจำลอง Mongoose'],
            'sequelize': ['Sequelize model', 'แบบจำลอง Sequelize'],
            'typeorm': ['TypeORM entity', 'เอนทิตี TypeORM'],
            'prisma': ['Prisma model', 'แบบจำลอง Prisma'],
            'graphql': ['GraphQL resolver', 'ตัวแยกวิเคราะห์ GraphQL'],
            'apollo': ['Apollo client', 'ลูกค้า Apollo'],
            'next': ['Next.js page', 'หน้า Next.js'],
            'nuxt': ['Nuxt.js page', 'หน้า Nuxt.js'],
            'gatsby': ['Gatsby component', 'คอมโพเนนต์ Gatsby'],
            'svelte': ['Svelte component', 'คอมโพเนนต์ Svelte'],
            'webpack': ['Webpack configuration', 'การกำหนดค่า Webpack'],
            'vite': ['Vite configuration', 'การกำหนดค่า Vite'],
            'rollup': ['Rollup configuration', 'การกำหนดค่า Rollup'],
            'babel': ['Babel transformation', 'การเปลี่ยนแปลง Babel'],
            'eslint': ['ESLint rule', 'กฎ ESLint'],
            'prettier': ['Prettier formatter', 'ตัวจัดรูปแบบ Prettier'],
            'jest': ['Jest test', 'การทดสอบ Jest'],
            'mocha': ['Mocha test', 'การทดสอบ Mocha'],
            'cypress': ['Cypress test', 'การทดสอบ Cypress'],
            'playwright': ['Playwright test', 'การทดสอบ Playwright'],
            'socket': ['Socket.io handler', 'ตัวจัดการ Socket.io'],
            'passport': ['Passport strategy', 'กลยุทธ์ Passport'],
            'multer': ['Multer middleware', 'มิดเดิลแวร์ Multer'],
            'cors': ['CORS middleware', 'มิดเดิลแวร์ CORS'],
            'helmet': ['Helmet security', 'ความปลอดภัย Helmet'],
            'bcrypt': ['Bcrypt hashing', 'การแฮช Bcrypt'],
            'jwt': ['JWT authentication', 'การรับรองตัวตน JWT'],
            'axios': ['Axios request', 'คำขอ Axios'],
            'lodash': ['Lodash utility', 'เครื่องมือ Lodash'],
            'moment': ['Moment.js date', 'วันที่ Moment.js'],
            'dayjs': ['Day.js date', 'วันที่ Day.js'],
            'luxon': ['Luxon date', 'วันที่ Luxon'],

            // ═══════════════════════════════════════════════════════════════
            // DATA STRUCTURES & ALGORITHMS - โครงสร้างข้อมูลและอัลกอริทึม  
            // ═══════════════════════════════════════════════════════════════
            'node': ['Node structure', 'โครงสร้างโหนด'],
            'tree': ['Tree structure', 'โครงสร้างต้นไม้'],
            'graph': ['Graph structure', 'โครงสร้างกราฟ'],
            'linkedlist': ['LinkedList structure', 'โครงสร้างลิงค์ลิสต์'],
            'algorithm': ['Algorithm implementation', 'การใช้งานอัลกอริทึม'],
            'sort': ['Sort algorithm', 'อัลกอริทึมการเรียง'],
            'search': ['Search algorithm', 'อัลกอริทึมการค้นหา'],

            // ═══════════════════════════════════════════════════════════════
            // DEFAULT & FALLBACK - ค่าเริ่มต้นและทางเลือก
            // ═══════════════════════════════════════════════════════════════
            'default': ['Function', 'ฟังก์ชัน']
        };
    }

    // สร้างคอมเมนต์สำหรับฟังก์ชันโดยวิเคราะห์โครงสร้าง - Generate comments with structure analysis
    generateFunctionComment(func, options = {}) {
        const { aiMode = false, addMissing = false, structure = null } = options;

        let description;

        // ถ้ามี structure analysis ให้ใช้ข้อมูลจากการวิเคราะห์
        if (structure && structure.purpose) {
            description = {
                english: structure.purpose.english,
                thai: structure.purpose.thai
            };
        } else {
            // ใช้วิธีเดิม
            description = this.getFunctionDescription(func.name, func.type);
        }

        // สร้าง comment ในรูปแบบ zone header เหมือนกันทั้งหมด
        let comment = '';
        comment += '// ======================================================================\n';
        comment += `// EN: ${description.english}\n`;
        comment += `// TH: ${description.thai}\n`;
        comment += '// ======================================================================\n';

        // สำหรับ object ที่มี properties เยอะ ให้เพิ่มคอมเมนต์แยกหมวดหมู่
        if (structure && structure.type === 'object' && structure.properties && structure.properties.length > 0) {
            const categorizedProps = this.categorizeObjectProperties(structure.properties, structure.name);
            return this.generateObjectComments(comment, categorizedProps, structure);
        }

        return comment;
    }

    // สร้างคอมเมนต์สำหรับ object แบบครบถ้วน - Generate comprehensive object comments
    generateObjectComments(headerComment, categorizedProps, structure) {
        // สำหรับ object ที่มี properties เยอะ เราไม่ต้องแทรกคอมเมนต์ลงในโครงสร้าง
        // แค่ส่งคืน header comment เท่านั้น เพราะ properties จะถูกแทรกโดย addMissingComments
        return headerComment.trim();
    }

    // จัดหมวดหมู่ properties ของ object - Categorize object properties
    categorizeObjectProperties(properties, objectName) {
        const categories = {
            keywords: [],
            identifiers: [],
            operators: [],
            comments: [],
            strings: [],
            numbers: [],
            whitespace: [],
            other: []
        };

        properties.forEach(prop => {
            const name = prop.name.toLowerCase();

            if (name.includes('keyword')) {
                categories.keywords.push(prop);
            } else if (name.includes('identifier')) {
                categories.identifiers.push(prop);
            } else if (name.includes('equals') || name.includes('arrow') ||
                name.includes('paren') || name.includes('brace') ||
                name.includes('semicolon') || name.includes('comma')) {
                categories.operators.push(prop);
            } else if (name.includes('comment') || name.includes('line') || name.includes('block')) {
                categories.comments.push(prop);
            } else if (name.includes('string')) {
                categories.strings.push(prop);
            } else if (name.includes('number')) {
                categories.numbers.push(prop);
            } else if (name.includes('whitespace') || name.includes('newline') || name.includes('eof')) {
                categories.whitespace.push(prop);
            } else {
                categories.other.push(prop);
            }
        });

        return categories;
    }

    // สร้างคอมเมนต์สำหรับ property - Generate property comment
    generatePropertyComment(prop, objectName) {
        const name = prop.name.toLowerCase();

        // คอมเมนต์เฉพาะสำหรับ TOKEN_TYPES
        if (objectName.includes('TOKEN')) {
            if (name.includes('keyword')) return '           // คำหลัก';
            if (name.includes('identifier')) return '   // ชื่อตัวแปร/ฟังก์ชัน';
            if (name.includes('equals')) return '           // =';
            if (name.includes('arrow')) return '             // =>';
            if (name.includes('paren_open')) return '   // (';
            if (name.includes('paren_close')) return ' // )';
            if (name.includes('brace_open')) return '   // {';
            if (name.includes('brace_close')) return ' // }';
            if (name.includes('semicolon')) return '     // ;';
            if (name.includes('comma')) return '             // ,';
            if (name.includes('line_comment')) return '     // //';
            if (name.includes('block_comment')) return '   // /* */';
            if (name.includes('string')) return '            // สตริง';
            if (name.includes('number')) return '            // ตัวเลข';
            if (name.includes('whitespace')) return '    // ช่องว่าง';
            if (name.includes('newline')) return '        // บรรทัดใหม่';
            if (name.includes('eof')) return '                // จุดสิ้นสุดไฟล์';
        }

        return '';
    }

    // รับคอมเมนต์หมวดหมู่ - Get category comment
    getCategoryComment(category) {
        const categoryComments = {
            keywords: 'คำหลัก - Keywords',
            identifiers: 'ชื่อตัวแปร/ฟังก์ชัน - Identifiers',
            operators: 'เครื่องหมาย - Operators and punctuation',
            comments: 'คอมเมนต์ - Comments',
            strings: 'สตริง - Strings',
            numbers: 'ตัวเลข - Numbers',
            whitespace: 'ช่องว่าง - Whitespace',
            other: 'อื่นๆ - Others'
        };

        return categoryComments[category] || 'อื่นๆ - Others';
    }

    // หาคำอธิบายฟังก์ชันจากชื่อ - Get function description from name
    getFunctionDescription(functionName, funcType = '') {
        const name = functionName.toLowerCase();
        const type = funcType.toLowerCase();

        // ค้นหาคำที่ตรงกัน โดยพิจารณาประเภทด้วย
        for (const [keyword, descriptions] of Object.entries(this.functionDescriptions)) {
            if (keyword !== 'default' && name.includes(keyword)) {
                // กรณีพิเศษ: ถ้าเป็นคลาสที่มีชื่อ node ให้เป็น "Node class" แทน "Node.js function"
                if (keyword === 'node' && (type.includes('class') || type === 'class_declaration')) {
                    return {
                        english: 'Node class',
                        thai: 'คลาสโหนด'
                    };
                }

                // กรณีพิเศษ: tree + node = TreeNode class
                if (name.includes('tree') && name.includes('node') && (type.includes('class') || type === 'class_declaration')) {
                    return {
                        english: 'TreeNode class',
                        thai: 'คลาสโหนดต้นไม้'
                    };
                }

                // กรณีพิเศษ: graph + node = GraphNode class  
                if (name.includes('graph') && name.includes('node') && (type.includes('class') || type === 'class_declaration')) {
                    return {
                        english: 'GraphNode class',
                        thai: 'คลาสโหนดกราฟ'
                    };
                }

                // สำหรับคลาส ให้เติม "class" เข้าไปใน description
                if (type.includes('class') || type === 'class_declaration') {
                    const baseDesc = descriptions[0].toLowerCase();
                    if (!baseDesc.includes('class')) {
                        return {
                            english: `${descriptions[0]} class`,
                            thai: `คลาส${descriptions[1]}`
                        };
                    }
                }

                return {
                    english: descriptions[0],
                    thai: descriptions[1]
                };
            }
        }

        // ถ้าไม่พบ ใช้ default โดยพิจารณาประเภท
        if (type.includes('class') || type === 'class_declaration') {
            return {
                english: `${functionName} class`,
                thai: `คลาส ${functionName}`
            };
        }

        const defaultDesc = this.functionDescriptions.default;
        return {
            english: `${defaultDesc[0]} ${functionName}`,
            thai: `${defaultDesc[1]} ${functionName}`
        };
    }

    // หาจุดเริ่มต้นที่แท้จริงของฟังก์ชัน (รวม decorators, exports, etc.)
    findRealStartLine(lines, functionLine) {
        let startLine = functionLine;
        const originalLine = lines[functionLine];

        if (!originalLine) return startLine;

        // ตรวจสอบว่าบรรทัดปัจจุบันเป็นจุดเริ่มต้นที่เหมาะสมหรือไม่
        const currentTrimmed = originalLine.trim();

        // ถ้าเป็นส่วนท้ายของบล็อค หรือในกลางโค้ด ไม่ควรใส่คอมเมนต์
        if (currentTrimmed === '}' ||
            currentTrimmed === '});' ||
            currentTrimmed === ');' ||
            currentTrimmed.match(/^}\s*[,;]?\s*$/) ||
            !this.isValidStartLine(currentTrimmed)) {

            // แต่ถ้าเป็น function declaration ที่ถูกต้อง ให้ผ่าน
            if (this.isValidStartLine(currentTrimmed)) {
                return startLine;
            }

            return -1; // ไม่เหมาะสมที่จะใส่คอมเมนต์
        }        // ตรวจสอบย้อนหลังเพื่อหา decorators, exports, หรือ annotations
        for (let i = functionLine - 1; i >= Math.max(0, functionLine - 10); i--) {
            const line = lines[i];
            if (!line) continue;

            const trimmed = line.trim();

            // บรรทัดว่าง - ข้าม
            if (trimmed === '') continue;

            // Comment - ถ้าเป็นคอมเมนต์ของเราแล้ว หยุด
            if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
                if (trimmed.includes('======') || trimmed.includes('EN:') || trimmed.includes(':ชื่อ') || trimmed.includes(':คลาส') || trimmed.includes('class:')) {
                    break; // เจอคอมเมนต์ของเราแล้ว
                }
                continue;
            }

            // Decorators (@), exports, imports, type annotations
            if (trimmed.startsWith('@') ||
                trimmed.startsWith('export') ||
                trimmed.startsWith('import') ||
                trimmed.includes('interface ') ||
                trimmed.includes('type ') ||
                (trimmed.endsWith(',') && !trimmed.includes('{')) ||
                (trimmed.endsWith(';') && !trimmed.includes('{'))) {
                startLine = i;
                continue;
            }

            // ถ้าเจอบรรทัดที่ไม่เกี่ยวข้อง หยุด
            break;
        }

        return startLine;
    }

    // ตรวจสอบว่าบรรทัดนี้เหมาะสมที่จะเป็นจุดเริ่มต้นหรือไม่
    isValidStartLine(trimmedLine) {
        // รูปแบบที่เหมาะสมสำหรับการเริ่มต้น
        const validPatterns = [
            // JavaScript/TypeScript basic patterns
            /^class\s+\w+/,           // class declarations
            /^abstract\s+class\s+\w+/, // abstract class declarations
            /^interface\s+\w+/,       // interface declarations
            /^type\s+\w+\s*=/,        // type alias declarations
            /^enum\s+\w+/,            // enum declarations
            /^function\s+\w+/,        // function declarations
            /^async\s+function/,      // async functions
            /^function\*/,            // generator functions
            /^async\s+function\*/,    // async generator functions
            /^const\s+\w+\s*=/,       // const declarations
            /^let\s+\w+\s*=/,         // let declarations
            /^var\s+\w+\s*=/,         // var declarations
            /^\w+\s*:/,               // object methods
            /^\w+\s*\(/,              // function calls (methods)

            // Export patterns
            /^export/,                // exports
            /^module\.exports/,       // module exports

            // Method patterns
            /^static\s+\w+\s*\(/,     // static methods
            /^abstract\s+\w+\s*\(/,   // abstract methods
            /^public\s+\w+\s*\(/,     // public methods
            /^private\s+\w+\s*\(/,    // private methods
            /^protected\s+\w+\s*\(/,  // protected methods
            /^readonly\s+\w+\s*:/,    // readonly properties
            /^get\s+\w+\s*\(/,        // getters
            /^set\s+\w+\s*\(/,        // setters
            /^async\s+\w+\s*\(/,      // async methods

            // Generic patterns
            /^class\s+\w+<[^>]+>/,    // generic classes
            /^interface\s+\w+<[^>]+>/, // generic interfaces
            /^function\s+\w+<[^>]+>/, // generic functions

            // Decorator patterns
            /^@\w+/                   // decorators
        ];

        // ตรวจสอบว่าตรงกับรูปแบบใดรูปแบบหนึ่งหรือไม่
        return validPatterns.some(pattern => pattern.test(trimmedLine));
    }

    // ตรวจสอบว่าตำแหน่งนี้เหมาะสมสำหรับการใส่คอมเมนต์หรือไม่
    isAppropriateCommentLocation(lines, lineIndex) {
        const currentLine = lines[lineIndex];
        if (!currentLine) return false;

        const trimmed = currentLine.trim();

        // ไม่ควรใส่คอมเมนต์ที่ตำแหน่งเหล่านี้
        const inappropriatePatterns = [
            /^}\s*$/,                 // closing braces only
            /^}\);?\s*$/,             // closing function calls
            /^\);\s*$/,               // closing parentheses
            /^,\s*$/,                 // comma only
            /^;\s*$/,                 // semicolon only
            /^break;?\s*$/,           // break statements
            /^continue;?\s*$/,        // continue statements
            /^case\s/,                // case statements
            /^default:\s*$/,          // default case
            /^else\s*{?\s*$/,         // else statements
            /^catch\s*\(/,            // catch blocks
            /^finally\s*{?\s*$/,      // finally blocks
            /^\s*$|^$/                // empty lines
        ];

        // ตรวจสอบบรรทัดปัจจุบัน
        if (inappropriatePatterns.some(pattern => pattern.test(trimmed))) {
            return false;
        }

        // ตรวจสอบบริบทรอบข้าง - ไม่ควรอยู่ในกลางบล็อค
        let openBraces = 0;
        let isInFunction = false;
        let isInClass = false;

        // ตรวจสอบจากบรรทัดก่อนหน้า
        for (let i = Math.max(0, lineIndex - 20); i < lineIndex; i++) {
            const line = lines[i];
            if (!line) continue;

            const lineTrimmed = line.trim();

            // นับ braces
            for (const char of lineTrimmed) {
                if (char === '{') openBraces++;
                if (char === '}') openBraces--;
            }

            // ตรวจสอบว่าเรากำลังอยู่ในฟังก์ชันหรือคลาส
            if (lineTrimmed.includes('function ') || lineTrimmed.includes('class ')) {
                if (openBraces > 0) {
                    isInFunction = lineTrimmed.includes('function ');
                    isInClass = lineTrimmed.includes('class ');
                }
            }
        }

        // ถ้าอยู่ลึกในบล็อค (openBraces > 2) ไม่ควรใส่คอมเมนต์ 
        // ยกเว้นถ้าเป็น top-level function/class ในไฟล์ หรือ const declarations
        if (openBraces > 2) {
            return false;
        }

        // ถ้าอยู่ในกลางฟังก์ชันหรือคลาส และไม่ใช่จุดเริ่มต้นของ method ใหม่
        if ((isInFunction || isInClass) && openBraces > 0) {
            // ตรวจสอบว่าเป็น method ใหม่หรือไม่
            if (!this.isValidStartLine(trimmed)) {
                return false;
            }
        }

        // พิเศษ: ยอมรับ top-level const declarations (openBraces === 0)
        if (openBraces === 0 && trimmed.startsWith('const ')) {
            return true;
        }

        return true;
    }

    // สร้าง zone header - Generate zone header
    generateZoneHeader(title, description) {
        return '// ======================================================================\n' +
            `// ${title}/${description}\n` +
            '// ======================================================================\n';
    }

    // สร้างคอมเมนต์ที่จัดรูปแบบแล้วจาก smart comment
    generateFormattedComment(smartComment, type) {
        if (!smartComment || !smartComment.english || !smartComment.thai) {
            return this.generateFunctionComment({ name: 'Unknown', type: type });
        }

        // ใช้ zone header format สำหรับทุกประเภทคอมเมนต์
        return `// ======================================================================\n` +
            `// EN: ${smartComment.english}\n` +
            `// TH: ${smartComment.thai}\n` +
            `// ======================================================================`;
    }
}

// ======================================================================
// Smart Learning Functions/ฟังก์ชันเรียนรู้อัจฉริยะ
// ======================================================================

/**
 * วิเคราะห์ไฟล์ด้วยระบบ Smart Learning
 * Analyze file with Smart Learning system
 * @param {string} content - เนื้อหาไฟล์
 * @param {Object} options - ตัวเลือกการวิเคราะห์
 * @returns {Object} ผลการวิเคราะห์และ blueprint ของไฟล์
 */
function analyzeFileWithSmartLearning(content, options = {}) {
    try {
        console.log(' Starting Smart Learning Analysis...');

        // สร้าง SmartFileAnalyzer instance
        const analyzer = new SmartFileAnalyzer(content, options.security || {});

        // วิเคราะห์ไฟล์และสร้าง blueprint
        const blueprint = analyzer.analyzeFile();

        if (!blueprint) {
            console.log(' Smart Learning Analysis failed, falling back to traditional method');
            return null;
        }

        // แสดงผลสรุปการวิเคราะห์
        console.log(' Smart Learning Results:');
        console.log(`   - Classes: ${blueprint.classes.size}`);
        console.log(`   - Functions: ${blueprint.functions.size}`);
        console.log(`   - Patterns: ${blueprint.patterns.size}`);
        console.log(`   - Keywords: ${blueprint.keywords.size}`);
        console.log(`   - File Type: ${blueprint.context.type}`);
        console.log(`   - Domain: ${blueprint.context.domain}`);
        console.log(`   - Complexity: ${blueprint.context.complexity}`);

        return {
            success: true,
            blueprint: blueprint,
            analyzer: analyzer
        };

    } catch (error) {
        console.error(' Smart Learning Analysis Error:', error.message);
        return null;
    }
}

/**
 * สร้างคอมเมนต์อัจฉริยะจากข้อมูล blueprint
 * Generate smart comment from blueprint data
 * @param {string} functionName - ชื่อฟังก์ชันหรือคลาส
 * @param {string} type - ประเภท (function, class, method)
 * @param {Object} blueprint - ข้อมูล blueprint จาก SmartFileAnalyzer
 * @param {Object} structureInfo - ข้อมูลโครงสร้างเพิ่มเติม
 * @returns {Object} คอมเมนต์ที่สร้างขึ้น
 */
function generateSmartComment(functionName, type, blueprint, structureInfo = {}) {
    try {
        // ถ้าไม่มี blueprint ใช้วิธีเดิม
        if (!blueprint) {
            const generator = new CommentGenerator();
            return generator.getFunctionDescription(functionName, type);
        }

        let comment = null;

        // ===================================================================
        // TypeScript Structures Support/รองรับโครงสร้าง TypeScript
        // ===================================================================

        // ตรวจสอบประเภท TypeScript เฉพาะ
        if (type === 'interface') {
            comment = generateInterfaceComment(functionName, blueprint, structureInfo);
        } else if (type === 'type_alias') {
            comment = generateTypeAliasComment(functionName, blueprint, structureInfo);
        } else if (type === 'enum') {
            comment = generateEnumComment(functionName, blueprint, structureInfo);
        } else if (type === 'abstract_class') {
            comment = generateAbstractClassComment(functionName, blueprint, structureInfo);
        }
        // ===================================================================
        // Const Declarations Support/รองรับ const declarations
        // ===================================================================
        else if (['configuration', 'data_store', 'storage_config', 'rate_limiter', 'middleware', 'arrow_function', 'express_app', 'object', 'array', 'constant'].includes(type)) {
            comment = generateConstComment(functionName, blueprint, structureInfo, type);
        }
        else if (type.includes('class') || type === 'class_declaration') {
            comment = generateSmartClassComment(functionName, blueprint, structureInfo);
        } else {
            comment = generateSmartFunctionComment(functionName, blueprint, structureInfo);
        }        // ถ้าไม่สามารถสร้างคอมเมนต์อัจฉริยะได้ ใช้วิธีเดิม
        if (!comment) {
            console.log(` Falling back to traditional method for: ${functionName}`);
            const generator = new CommentGenerator();
            return generator.getFunctionDescription(functionName, type);
        }

        return comment;

    } catch (error) {
        console.error(` Smart Comment Generation Error for ${functionName}:`, error.message);

        // ใช้วิธีเดิมเป็น fallback
        const generator = new CommentGenerator();
        return generator.getFunctionDescription(functionName, type);
    }
}/**
 * สร้างคอมเมนต์อัจฉริยะสำหรับคลาส
 * Generate smart comment for class
 */
function generateSmartClassComment(className, blueprint, structureInfo) {
    const classInfo = blueprint.classes.get(className);

    if (!classInfo) {
        return null;
    }

    const context = blueprint.context;
    let englishComment = '';
    let thaiComment = '';

    // สร้างคอมเมนต์ตามบริบทและวัตถุประสงค์ของคลาส
    switch (classInfo.purpose) {
        case 'manager':
            if (context.domain === 'crypto') {
                englishComment = `${className} - Security and cryptographic operations manager`;
                thaiComment = `${className} - ตัวจัดการงานด้านความปลอดภัยและการเข้ารหัส`;
            } else if (context.domain === 'data') {
                englishComment = `${className} - Data management and processing manager`;
                thaiComment = `${className} - ตัวจัดการข้อมูลและการประมวลผล`;
            } else {
                englishComment = `${className} - System operations manager`;
                thaiComment = `${className} - ตัวจัดการการดำเนินงานระบบ`;
            }
            break;

        case 'controller':
            englishComment = `${className} - Application flow controller`;
            thaiComment = `${className} - ตัวควบคุมการทำงานของแอปพลิเคชัน`;
            break;

        case 'service':
            englishComment = `${className} - Business logic service provider`;
            thaiComment = `${className} - ผู้ให้บริการตรรกะทางธุรกิจ`;
            break;

        case 'error':
            englishComment = `${className} - Custom error handling class`;
            thaiComment = `${className} - คลาสจัดการข้อผิดพลาดแบบกำหนดเอง`;
            break;

        case 'validator':
            englishComment = `${className} - Data validation and verification`;
            thaiComment = `${className} - การตรวจสอบและยืนยันข้อมูล`;
            break;

        default:
            // ใช้บริบทไฟล์ในการสร้างคอมเมนต์
            if (context.type === 'security') {
                englishComment = `${className} - Security-related class`;
                thaiComment = `${className} - คลาสที่เกี่ยวข้องกับความปลอดภัย`;
            } else if (context.type === 'api') {
                englishComment = `${className} - API-related class`;
                thaiComment = `${className} - คลาสที่เกี่ยวข้องกับ API`;
            } else if (context.type === 'database') {
                englishComment = `${className} - Database-related class`;
                thaiComment = `${className} - คลาสที่เกี่ยวข้องกับฐานข้อมูล`;
            } else {
                englishComment = `${className} class`;
                thaiComment = `คลาส ${className}`;
            }
    }

    return {
        english: englishComment,
        thai: thaiComment
    };
}

/**
 * สร้างคอมเมนต์อัจฉริยะสำหรับฟังก์ชัน
 * Generate smart comment for function
 */
function generateSmartFunctionComment(functionName, blueprint, structureInfo) {
    // ค้นหาฟังก์ชันใน blueprint
    let functionInfo = blueprint.functions.get(functionName);

    // ถ้าไม่พบในฟังก์ชันระดับ global ลองหาใน class methods
    if (!functionInfo) {
        for (const classInfo of blueprint.classes.values()) {
            const methodInfo = classInfo.methods.get(functionName);
            if (methodInfo) {
                functionInfo = {
                    ...methodInfo,
                    parentClass: classInfo.name,
                    isMethod: true
                };
                break;
            }
        }
    }

    if (!functionInfo) {
        return null;
    }

    const context = blueprint.context;
    let englishComment = '';
    let thaiComment = '';

    // สร้างคอมเมนต์ตามวัตถุประสงค์และบริบท
    switch (functionInfo.purpose) {
        case 'generate_crypto':
            englishComment = `Generate cryptographic ${functionName.toLowerCase().includes('key') ? 'key' : 'data'}`;
            thaiComment = `สร้าง${functionName.toLowerCase().includes('key') ? 'คีย์' : 'ข้อมูล'}เข้ารหัส`;
            break;

        case 'encrypt_data':
            englishComment = 'Encrypt sensitive data';
            thaiComment = 'เข้ารหัสข้อมูลที่สำคัญ';
            break;

        case 'decrypt_data':
            englishComment = 'Decrypt encrypted data';
            thaiComment = 'ถอดรหัสข้อมูลที่เข้ารหัส';
            break;

        case 'get_size':
            if (functionName.toLowerCase().includes('cache')) {
                englishComment = 'Get current cache size';
                thaiComment = 'ดึงขนาดแคชปัจจุบัน';
            } else {
                englishComment = 'Get size information';
                thaiComment = 'ดึงข้อมูลขนาด';
            }
            break;

        case 'set_limit':
            if (functionName.toLowerCase().includes('cache')) {
                englishComment = 'Set maximum cache limit';
                thaiComment = 'กำหนดขีดจำกัดแคชสูงสุด';
            } else {
                englishComment = 'Set operational limit';
                thaiComment = 'กำหนดขีดจำกัดการทำงาน';
            }
            break;

        case 'clear_cache':
            englishComment = 'Clear cache data';
            thaiComment = 'ล้างข้อมูลแคช';
            break;

        case 'getter':
            if (context.domain === 'crypto') {
                englishComment = `Get ${functionName.replace(/^get/, '').toLowerCase()} value`;
                thaiComment = `ดึงค่า ${functionName.replace(/^get/, '').toLowerCase()}`;
            } else {
                englishComment = `Get ${functionName.replace(/^get/, '').toLowerCase()}`;
                thaiComment = `ดึง ${functionName.replace(/^get/, '').toLowerCase()}`;
            }
            break;

        case 'setter':
            let setterName = functionName
                .replace(/^set([A-Z])/, '$1') // ลบ "set" และรักษาตัวพิมพ์ใหญ่
                .replace(/([A-Z])/g, ' $1') // เพิ่ม space ก่อนตัวพิมพ์ใหญ่
                .toLowerCase()
                .trim();
            englishComment = `Set ${setterName}`;
            thaiComment = `กำหนด ${setterName}`;
            break;

        case 'creator':
            let creatorName = functionName
                .replace(/^create([A-Z])/, '$1') // ลบ "create" และรักษาตัวพิมพ์ใหญ่
                .replace(/([A-Z])/g, ' $1') // เพิ่ม space ก่อนตัวพิมพ์ใหญ่
                .toLowerCase()
                .trim();
            englishComment = `Create new ${creatorName}`;
            thaiComment = `สร้าง ${creatorName} ใหม่`;
            break;

        case 'validator':
            let validatorName = functionName
                .replace(/^(validate|check|verify)([A-Z])/, '$2') // ลบ prefix และรักษาตัวพิมพ์ใหญ่
                .replace(/([A-Z])/g, ' $1') // เพิ่ม space ก่อนตัวพิมพ์ใหญ่
                .toLowerCase()
                .trim();
            englishComment = `Validate ${validatorName}`;
            thaiComment = `ตรวจสอบ ${validatorName}`;
            break;

        case 'processor':
            let processorName = functionName
                .replace(/^(process|handle|execute)([A-Z])/, '$2') // ลบ prefix และรักษาตัวพิมพ์ใหญ่
                .replace(/([A-Z])/g, ' $1') // เพิ่ม space ก่อนตัวพิมพ์ใหญ่
                .toLowerCase()
                .trim();
            englishComment = `Process ${processorName}`;
            thaiComment = `ประมวลผล ${processorName}`;
            break;

        case 'demo':
            // แก้ไข regex ให้จัดการคำพิเศษก่อน
            let cleanedName = functionName;
            if (functionName === 'demonstrateAlgorithms') {
                cleanedName = 'advanced algorithms and data structures';
            } else if (functionName === 'demonstrateFeatures') {
                cleanedName = 'system features';
            } else {
                // สำหรับชื่อทั่วไป ลบ prefix แล้วเพิ่ม space ก่อนตัวพิมพ์ใหญ่
                cleanedName = functionName
                    .replace(/^(demo|test|example)([A-Z])/, '$2') // ลบ prefix และรักษาตัวพิมพ์ใหญ่
                    .replace(/([A-Z])/g, ' $1') // เพิ่ม space ก่อนตัวพิมพ์ใหญ่
                    .toLowerCase()
                    .trim();
            }
            englishComment = `Demonstration of ${cleanedName}`;
            thaiComment = `การสาธิต ${cleanedName}`;
            break;

        default:
            // ใช้บริบทไฟล์และชื่อฟังก์ชันในการสร้างคอมเมนต์
            if (context.type === 'security' && functionName.toLowerCase().includes('key')) {
                englishComment = 'Security key operation';
                thaiComment = 'การดำเนินการด้านคีย์ความปลอดภัย';
            } else if (context.type === 'api' && functionName.toLowerCase().includes('request')) {
                englishComment = 'API request operation';
                thaiComment = 'การดำเนินการคำขอ API';
            } else {
                // Fallback ไปที่วิธีเดิม
                return null;
            }
    }

    return {
        english: englishComment,
        thai: thaiComment
    };
}

// ===================================================================
// TypeScript Comment Generators/ตัวสร้างคอมเมนต์ TypeScript
// ===================================================================

/**
 * สร้างคอมเมนต์สำหรับ Interface
 */
function generateInterfaceComment(interfaceName, blueprint, structureInfo) {
    const interfaceInfo = blueprint.classes.get(interfaceName);

    if (!interfaceInfo) {
        return null;
    }

    let englishComment = '';
    let thaiComment = '';

    switch (interfaceInfo.purpose) {
        case 'configuration':
            englishComment = `${interfaceName} - Configuration interface`;
            thaiComment = `${interfaceName} - อินเทอร์เฟซการกำหนดค่า`;
            break;
        case 'result_type':
            englishComment = `${interfaceName} - Result data structure`;
            thaiComment = `${interfaceName} - โครงสร้างข้อมูลผลลัพธ์`;
            break;
        case 'input_type':
            englishComment = `${interfaceName} - Input parameters interface`;
            thaiComment = `${interfaceName} - อินเทอร์เฟซพารามิเตอร์นำเข้า`;
            break;
        case 'error_type':
            englishComment = `${interfaceName} - Error information interface`;
            thaiComment = `${interfaceName} - อินเทอร์เฟซข้อมูลข้อผิดพลาด`;
            break;
        case 'event_type':
            englishComment = `${interfaceName} - Event data interface`;
            thaiComment = `${interfaceName} - อินเทอร์เฟซข้อมูลเหตุการณ์`;
            break;
        case 'data_type':
            englishComment = `${interfaceName} - Data model interface`;
            thaiComment = `${interfaceName} - อินเทอร์เฟซโมเดลข้อมูล`;
            break;
        case 'service_interface':
            englishComment = `${interfaceName} - Service contract interface`;
            thaiComment = `${interfaceName} - อินเทอร์เฟซสัญญาการให้บริการ`;
            break;
        case 'repository_interface':
            englishComment = `${interfaceName} - Repository pattern interface`;
            thaiComment = `${interfaceName} - อินเทอร์เฟซรูปแบบพื้นที่เก็บข้อมูล`;
            break;
        default:
            englishComment = `${interfaceName} - Interface definition`;
            thaiComment = `${interfaceName} - นิยามอินเทอร์เฟซ`;
    }

    return {
        english: englishComment,
        thai: thaiComment
    };
}

/**
 * สร้างคอมเมนต์สำหรับ Type Alias
 */
function generateTypeAliasComment(typeName, blueprint, structureInfo) {
    const typeInfo = blueprint.functions.get(typeName);

    if (!typeInfo) {
        return null;
    }

    let englishComment = '';
    let thaiComment = '';

    switch (typeInfo.purpose) {
        case 'callback_type':
            englishComment = `${typeName} - Callback function type`;
            thaiComment = `${typeName} - ประเภทฟังก์ชันเรียกกลับ`;
            break;
        case 'validation_type':
            englishComment = `${typeName} - Validation rule type`;
            thaiComment = `${typeName} - ประเภทกฎการตรวจสอบ`;
            break;
        case 'strategy_type':
            englishComment = `${typeName} - Strategy pattern type`;
            thaiComment = `${typeName} - ประเภทรูปแบบกลยุทธ์`;
            break;
        case 'string_union':
            englishComment = `${typeName} - String union type`;
            thaiComment = `${typeName} - ประเภทการรวมสตริง`;
            break;
        case 'number_union':
            englishComment = `${typeName} - Number union type`;
            thaiComment = `${typeName} - ประเภทการรวมตัวเลข`;
            break;
        case 'function_type':
            englishComment = `${typeName} - Function signature type`;
            thaiComment = `${typeName} - ประเภทลายเซ็นฟังก์ชัน`;
            break;
        case 'object_type':
            englishComment = `${typeName} - Object structure type`;
            thaiComment = `${typeName} - ประเภทโครงสร้างออบเจ็กต์`;
            break;
        default:
            englishComment = `${typeName} - Type alias definition`;
            thaiComment = `${typeName} - นิยามนามแฝงประเภท`;
    }

    return {
        english: englishComment,
        thai: thaiComment
    };
}

/**
 * สร้างคอมเมนต์สำหรับ Enum
 */
function generateEnumComment(enumName, blueprint, structureInfo) {
    const enumInfo = blueprint.classes.get(enumName);

    if (!enumInfo) {
        return null;
    }

    let englishComment = '';
    let thaiComment = '';

    switch (enumInfo.purpose) {
        case 'status_enum':
            englishComment = `${enumName} - Status enumeration`;
            thaiComment = `${enumName} - การแจงนับสถานะ`;
            break;
        case 'type_enum':
            englishComment = `${enumName} - Type enumeration`;
            thaiComment = `${enumName} - การแจงนับประเภท`;
            break;
        case 'level_enum':
            englishComment = `${enumName} - Level enumeration`;
            thaiComment = `${enumName} - การแจงนับระดับ`;
            break;
        case 'direction_enum':
            englishComment = `${enumName} - Direction enumeration`;
            thaiComment = `${enumName} - การแจงนับทิศทาง`;
            break;
        case 'mode_enum':
            englishComment = `${enumName} - Mode enumeration`;
            thaiComment = `${enumName} - การแจงนับโหมด`;
            break;
        default:
            englishComment = `${enumName} - Enumeration values`;
            thaiComment = `${enumName} - ค่าการแจงนับ`;
    }

    return {
        english: englishComment,
        thai: thaiComment
    };
}

/**
 * สร้างคอมเมนต์สำหรับ Abstract Class
 */
function generateAbstractClassComment(className, blueprint, structureInfo) {
    const classInfo = blueprint.classes.get(className);

    if (!classInfo) {
        return null;
    }

    let englishComment = '';
    let thaiComment = '';

    switch (classInfo.purpose) {
        case 'base_class':
            englishComment = `${className} - Abstract base class`;
            thaiComment = `${className} - คลาสฐานนามธรรม`;
            break;
        case 'repository_base':
            englishComment = `${className} - Abstract repository base class`;
            thaiComment = `${className} - คลาสฐานพื้นที่เก็บข้อมูลนามธรรม`;
            break;
        case 'service_base':
            englishComment = `${className} - Abstract service base class`;
            thaiComment = `${className} - คลาสฐานบริการนามธรรม`;
            break;
        case 'controller_base':
            englishComment = `${className} - Abstract controller base class`;
            thaiComment = `${className} - คลาสฐานตัวควบคุมนามธรรม`;
            break;
        case 'component_base':
            englishComment = `${className} - Abstract component base class`;
            thaiComment = `${className} - คลาสฐานส่วนประกอบนามธรรม`;
            break;
        default:
            englishComment = `${className} - Abstract class definition`;
            thaiComment = `${className} - นิยามคลาสนามธรรม`;
    }

    return {
        english: englishComment,
        thai: thaiComment
    };
}

/**
 * สร้างคอมเมนต์สำหรับ Const Declaration
 */
function generateConstComment(constName, blueprint, structureInfo, constType) {
    // หาข้อมูลจาก blueprint
    let constInfo = blueprint.classes.get(constName) || blueprint.functions.get(constName);

    if (!constInfo) {
        return null;
    }

    let englishComment = '';
    let thaiComment = '';

    switch (constType) {
        case 'configuration':
            englishComment = `${constName} - Application configuration settings`;
            thaiComment = `${constName} - การกำหนดค่าแอปพลิเคชัน`;
            break;

        case 'data_store':
            englishComment = `${constName} - In-memory data storage`;
            thaiComment = `${constName} - ที่เก็บข้อมูลในหน่วยความจำ`;
            break;

        case 'storage_config':
            englishComment = `${constName} - File upload storage configuration`;
            thaiComment = `${constName} - การกำหนดค่าการจัดเก็บไฟล์อัปโหลด`;
            break;

        case 'rate_limiter':
            if (constName.toLowerCase().includes('auth')) {
                englishComment = `${constName} - Authentication rate limiting middleware`;
                thaiComment = `${constName} - มิดเดิลแวร์จำกัดอัตราการรับรองตัวตน`;
            } else {
                englishComment = `${constName} - API rate limiting middleware`;
                thaiComment = `${constName} - มิดเดิลแวร์จำกัดอัตรา API`;
            }
            break;

        case 'middleware':
            if (constInfo.purpose === 'auth_middleware') {
                englishComment = `${constName} - Authentication middleware function`;
                thaiComment = `${constName} - ฟังก์ชันมิดเดิลแวร์การรับรองตัวตน`;
            } else if (constInfo.purpose === 'validation_middleware') {
                englishComment = `${constName} - Request validation middleware function`;
                thaiComment = `${constName} - ฟังก์ชันมิดเดิลแวร์ตรวจสอบคำขอ`;
            } else if (constInfo.purpose === 'async_wrapper') {
                englishComment = `${constName} - Async error handling wrapper`;
                thaiComment = `${constName} - ตัวห่อหุ้มจัดการข้อผิดพลาดแบบ async`;
            } else {
                englishComment = `${constName} - Express middleware function`;
                thaiComment = `${constName} - ฟังก์ชันมิดเดิลแวร์ Express`;
            }
            break;

        case 'arrow_function':
            if (constInfo.purpose === 'finder_function') {
                englishComment = `${constName} - Data finder utility function`;
                thaiComment = `${constName} - ฟังก์ชันยูทิลิตี้ค้นหาข้อมูล`;
            } else if (constInfo.purpose === 'generator_function') {
                englishComment = `${constName} - ID generator utility function`;
                thaiComment = `${constName} - ฟังก์ชันยูทิลิตี้สร้าง ID`;
            } else {
                englishComment = `${constName} - Utility function`;
                thaiComment = `${constName} - ฟังก์ชันยูทิลิตี้`;
            }
            break;

        case 'express_app':
            englishComment = `${constName} - Express application instance`;
            thaiComment = `${constName} - อินสแตนซ์แอปพลิเคชัน Express`;
            break;

        case 'object':
            englishComment = `${constName} - Configuration object`;
            thaiComment = `${constName} - ออบเจ็กต์การกำหนดค่า`;
            break;

        case 'array':
            englishComment = `${constName} - Data array`;
            thaiComment = `${constName} - อาร์เรย์ข้อมูล`;
            break;

        default:
            englishComment = `${constName} - Constant definition`;
            thaiComment = `${constName} - นิยามค่าคงที่`;
    }

    return {
        english: englishComment,
        thai: thaiComment
    };
}

// ======================================================================
// Main Comment Processing Engine/เครื่องมือประมวลผลคอมเมนต์หลัก
// ======================================================================

// ======================================================================
// Process file/ประมวลผลไฟล์
// ======================================================================
function processFile(filePath, options = {}) {
    try {
        //  SECURITY: File Size Limit Protection (DoS Prevention)
        const stat = fs.statSync(filePath);
        const fileSizeInMB = stat.size / (1024 * 1024);
        const maxSizeInMB = 10; // กำหนด limit ที่ 10MB ตามที่ระบุใน help

        if (fileSizeInMB > maxSizeInMB) {
            if (options.verbose) {
                console.warn(`  Skipping large file: ${filePath} (${fileSizeInMB.toFixed(2)} MB > ${maxSizeInMB} MB limit)`);
            }
            return {
                success: true,
                changes: false,
                skipped: true,
                reason: `File too large (${fileSizeInMB.toFixed(2)} MB)`
            };
        }

        //  SECURITY: Symbolic Link Protection
        if (stat.isSymbolicLink()) {
            if (options.verbose) {
                console.warn(`  Skipping symbolic link: ${filePath} (security protection)`);
            }
            return {
                success: true,
                changes: false,
                skipped: true,
                reason: 'Symbolic link protection'
            };
        }

        // อ่านไฟล์
        const content = fs.readFileSync(filePath, 'utf8');

        // สร้าง backup ถ้าต้องการ
        if (options.backup) {
            createBackup(filePath);
        }

        // ประมวลผลเนื้อหา
        let processedContent = content;

        // 1. แปลง /** */ comments เป็น // format
        processedContent = fixComments(processedContent);

        // 2. ใช้ tokenizer เพื่อหาฟังก์ชันและเพิ่มคอมเมนต์
        if (options.addMissing || options.aiMode) {
            processedContent = addMissingComments(processedContent, options);
        }

        // 3. จัดระเบียบ zones ถ้าต้องการ
        if (options.organizeZones) {
            processedContent = organizeCodeByZones(processedContent);
        }

        // เขียนไฟล์กลับ (ถ้าไม่ใช่ dry-run)
        if (!options.dryRun) {
            fs.writeFileSync(filePath, processedContent, 'utf8');
        }

        return {
            success: true,
            originalSize: content.length,
            newSize: processedContent.length,
            changes: content !== processedContent,
            preview: options.dryRun ? processedContent : null
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ======================================================================
// Fix comments/แก้ไขคอมเมนต์
// ======================================================================
function fixComments(content) {
    // แปลง /** */ comments ที่มีหลายบรรทัด
    content = content.replace(/\/\*\*[\s\S]*?\*\//g, (match) => {
        // แยกบรรทัดและลบ * ออก
        const lines = match.split('\n');
        const convertedLines = [];

        for (let line of lines) {
            // ลบ /** และ */ และ * ที่ขึ้นต้น
            line = line.replace(/^\s*\/\*\*\s*/, '').replace(/\s*\*\/\s*$/, '').replace(/^\s*\*\s*/, '').trim();

            if (line) {
                convertedLines.push(`// ${line}`);
            }
        }

        return convertedLines.join('\n');
    });

    return content;
}

// ======================================================================
// Add missing comments/เพิ่มคอมเมนต์ที่ขาดหาย
// ======================================================================
function addMissingComments(content, options = {}) {
    try {
        // SECURITY: กำหนดขีดจำกัดความปลอดภัยสำหรับการประมวลผล
        const securityOptions = {
            maxDepth: 50,           // ลดความลึกสำหรับการวิเคราะห์โค้ด
            maxTokens: 100000,      // จำกัด tokens สำหรับไฟล์ปกติ
            maxParsingTime: 15000   // จำกัดเวลา 15 วินาที
        };

        // ===================================================================
        // PHASE 1: Smart Learning Analysis/การวิเคราะห์แบบเรียนรู้อัจฉริยะ
        // ===================================================================
        let smartAnalysis = null;
        if (options.enableSmartLearning !== false) {
            smartAnalysis = analyzeFileWithSmartLearning(content, { security: securityOptions });
        }

        // ใช้ tokenizer และ StructureParser ใหม่เพื่อวิเคราะห์โค้ด
        const tokenizer = new JavaScriptTokenizer(content, securityOptions);
        const tokens = tokenizer.tokenize();

        // ใช้ StructureParser ตัวใหม่ที่แม่นยำกว่า
        const parser = new StructureParser(tokens, securityOptions);
        const structures = parser.parse();

        if (structures.length === 0) {
            return content;
        }

        // รวม structures และ methods เข้าด้วยกัน
        const allItems = [];
        const addedItems = new Map();

        // ===================================================================
        // PHASE 2: TypeScript Structures from Smart Learning/โครงสร้าง TypeScript จาก Smart Learning
        // ===================================================================
        if (smartAnalysis && smartAnalysis.success && smartAnalysis.blueprint) {
            const blueprint = smartAnalysis.blueprint;

            // เพิ่ม TypeScript interfaces, types, enums จาก Smart Learning
            for (const [name, info] of blueprint.classes.entries()) {
                const key = `${name}-${info.line}`;
                if (!addedItems.has(key) && name && name.length > 0) {
                    allItems.push({
                        type: info.type || 'class_declaration',
                        name: name,
                        line: info.line,
                        column: info.column || 0,
                        parameters: [],
                        smartInfo: info  // เพิ่มข้อมูลจาก Smart Learning
                    });
                    addedItems.set(key, info.type);
                }
            }

            // เพิ่ม TypeScript type aliases จาก Smart Learning
            for (const [name, info] of blueprint.functions.entries()) {
                if (info.type === 'type_alias') {
                    const key = `${name}-${info.line}`;
                    if (!addedItems.has(key) && name && name.length > 0) {
                        allItems.push({
                            type: 'type_alias',
                            name: name,
                            line: info.line,
                            column: info.column || 0,
                            parameters: [],
                            smartInfo: info
                        });
                        addedItems.set(key, 'type_alias');
                    }
                }
            }
        }

        structures.forEach(s => {
            if (s.type === 'class_declaration') {
                // เพิ่มตัวคลาสเอง
                const classKey = `${s.name}-${s.line}`;
                if (!addedItems.has(classKey) && s.name && s.name.length > 0) {
                    allItems.push({
                        type: s.type,
                        name: s.name,
                        line: s.line,
                        column: s.column,
                        parameters: []
                    });
                    addedItems.set(classKey, s.type);
                }

                // เพิ่มเมธอดทั้งหมดในคลาส
                if (s.methods) {
                    s.methods.forEach(m => {
                        const methodKey = `${m.name}-${m.line}`;
                        if (!addedItems.has(methodKey) && m.name !== 'constructor') {
                            allItems.push(m);
                            addedItems.set(methodKey, m.type);
                        }
                    });
                }
            } else {
                // functions, arrow functions อื่นๆ
                const key = `${s.name}-${s.line}`;
                if (!addedItems.has(key) && s.name && s.name.length > 0) {
                    allItems.push(s);
                    addedItems.set(key, s.type);
                }
            }
        });

        // เพิ่มการค้นหา methods โดยใช้ regex เป็นการสำรอง
        const regexMethods = findMethodsWithRegex(content);
        regexMethods.forEach(method => {
            const key = `${method.name}-${method.line}`;
            if (!addedItems.has(key) && method.name !== 'constructor') {
                allItems.push(method);
                addedItems.set(key, method.type);
            }
        });

        if (allItems.length === 0) {
            return content;
        }

        // สร้าง comment generator
        const generator = new CommentGenerator();

        // แปลงเนื้อหาเป็น array ของบรรทัด
        const lines = content.split('\n');
        let processedLines = [...lines];

        // เรียงลำดับตาม line number จากล่างขึ้นบนเพื่อไม่ให้หมายเลขบรรทัดเปลี่ยน
        allItems.sort((a, b) => b.line - a.line);

        // เพิ่มคอมเมนต์ให้แต่ละ item
        allItems.forEach(item => {
            const originalLineIndex = item.line - 1; // แปลงเป็น 0-based index

            // หาจุดเริ่มต้นที่แท้จริง (รวม decorators, exports)
            const realStartLine = generator.findRealStartLine(processedLines, originalLineIndex);

            // ถ้า realStartLine เป็น -1 แสดงว่าไม่เหมาะสมที่จะใส่คอมเมนต์
            if (realStartLine === -1) {
                if (options.verbose) {
                    console.log(`  Skipping comment for ${item.name} at line ${item.line} - invalid position`);
                }
                return;
            }

            const lineIndex = realStartLine;

            // ตรวจสอบว่าบรรทัดก่อนหน้ามีคอมเมนต์หรือไม่
            let hasComment = false;
            let checkLines = 0;
            for (let i = 1; i <= 10 && checkLines < 5; i++) {
                if (lineIndex - i >= 0) {
                    const prevLine = processedLines[lineIndex - i];
                    if (prevLine && prevLine.trim()) {
                        checkLines++;
                        if (prevLine.trim().startsWith('//') ||
                            prevLine.trim().startsWith('/*') ||
                            prevLine.includes('*/')) {
                            hasComment = true;
                            break;
                        }
                    }
                }
            }

            // ตรวจสอบเพิ่มเติมว่าบรรทัดนี้อยู่ในบริบทที่เหมาะสมหรือไม่
            const currentLine = processedLines[lineIndex];
            if (!currentLine || !generator.isAppropriateCommentLocation(processedLines, lineIndex)) {
                if (options.verbose) {
                    console.log(`  Skipping comment for ${item.name} at line ${item.line} - inappropriate context`);
                }
                return;
            }

            // ถ้าไม่มีคอมเมนต์ ให้เพิ่มคอมเมนต์
            if (!hasComment) {
                // หา structure ที่ตรงกับ item นี้
                const matchingStructure = structures.find(s =>
                    s.line === item.line && s.name === item.name
                );

                // ===================================================================
                // PHASE 2: Smart Comment Generation/การสร้างคอมเมนต์อัจฉริยะ
                // ===================================================================
                let comment;

                if (smartAnalysis && smartAnalysis.success) {
                    // ใช้ระบบ Smart Learning เพื่อสร้างคอมเมนต์
                    const smartComment = generateSmartComment(
                        item.name,
                        item.type,
                        smartAnalysis.blueprint,
                        matchingStructure
                    );

                    // สร้าง formatted comment จาก smart comment
                    comment = generator.generateFormattedComment(smartComment, item.type);

                    if (options.verbose) {
                        console.log(`  Using Smart Learning for ${item.name}: ${smartComment.english}`);
                    }
                } else {
                    // ใช้วิธีเดิมเมื่อ Smart Learning ไม่พร้อมใช้งาน
                    comment = generator.generateFunctionComment(item, {
                        ...options,
                        structure: matchingStructure
                    });

                    if (options.verbose) {
                        console.log(`  Using traditional method for ${item.name}`);
                    }
                }

                // เพิ่มคอมเมนต์
                const commentLines = comment.split('\n').filter(line => line.trim());

                // หาระดับ indentation ของบรรทัดต้นฉบับ
                const originalLine = processedLines[lineIndex] || '';
                const indentMatch = originalLine.match(/^(\s*)/);
                const indent = indentMatch ? indentMatch[1] : '';

                // เพิ่ม indentation ให้กับคอมเมนต์
                const indentedCommentLines = commentLines.map(line => {
                    if (line.trim()) {
                        return indent + line;
                    }
                    return line;
                });

                // แทรกคอมเมนต์
                processedLines.splice(lineIndex, 0, ...indentedCommentLines);

                if (options.verbose) {
                    console.log(`  Added comment for ${item.type}: ${item.name} at line ${item.line}`);
                    if (matchingStructure) {
                        console.log(`    Using structure analysis: ${matchingStructure.purpose?.english || 'analyzed'}`);
                    }
                }
            }
        });

        return processedLines.join('\n');

    } catch (error) {
        console.error(`Error in addMissingComments: ${error.message}`);
        return content;
    }
}

// ฟังก์ชันช่วยเหลือสำหรับหา methods ที่ tokenizer อาจพลาด
function findMethodsWithRegex(content) {
    const methods = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // รูปแบบ method ต่างๆ ที่อาจถูกพลาด
        const patterns = [
            /^\s*(\w+)\s*\(\s*[^)]*\)\s*\{/,           // methodName() {
            /^\s*async\s+(\w+)\s*\(\s*[^)]*\)\s*\{/,   // async methodName() {
            /^\s*static\s+(\w+)\s*\(\s*[^)]*\)\s*\{/,  // static methodName() {
            /^\s*get\s+(\w+)\s*\(\s*[^)]*\)\s*\{/,     // get propertyName() {
            /^\s*set\s+(\w+)\s*\(\s*[^)]*\)\s*\{/,     // set propertyName() {
        ];

        for (const pattern of patterns) {
            const match = trimmed.match(pattern);
            if (match && match[1]) {
                const methodName = match[1];

                // กรอง keywords และ built-in functions
                const excludedNames = [
                    'constructor', 'super', 'this', 'new', 'Map', 'Set', 'Array', 'Object', 'Promise',
                    'console', 'Math', 'JSON', 'Date', 'String', 'Number', 'Boolean', 'Error',
                    'require', 'module', 'exports', 'process', 'Buffer', 'setTimeout', 'setInterval',
                    'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue'
                ];

                if (!excludedNames.includes(methodName) && methodName !== '*') {
                    // ตรวจสอบว่าอยู่ในคลาสหรือไม่โดยดูบริบทรอบข้าง
                    let inClass = false;
                    for (let i = Math.max(0, index - 20); i < index; i++) {
                        if (lines[i] && lines[i].includes('class ')) {
                            let braceCount = 0;
                            for (let j = i; j <= index; j++) {
                                const testLine = lines[j] || '';
                                braceCount += (testLine.match(/\{/g) || []).length;
                                braceCount -= (testLine.match(/\}/g) || []).length;
                            }
                            if (braceCount > 0) {
                                inClass = true;
                                break;
                            }
                        }
                    }

                    if (inClass) {
                        // กำหนดประเภท
                        let type = 'class_method';
                        if (trimmed.includes('async ')) type = 'async_class_method';
                        else if (trimmed.includes('static ')) type = 'static_method';
                        else if (trimmed.includes('get ')) type = 'getter';
                        else if (trimmed.includes('set ')) type = 'setter';

                        methods.push({
                            type: type,
                            name: methodName,
                            line: index + 1,
                            column: trimmed.indexOf(methodName),
                            parameters: [],
                            isAsync: trimmed.includes('async '),
                            fromRegex: true
                        });
                    }
                }
            }
        }
    });

    return methods;
}

// ======================================================================
// Create backup/สร้างไฟล์สำรอง
// ======================================================================
function createBackup(filePath) {
    try {
        //  SECURITY: Validate backup path
        const resolvedFilePath = path.resolve(filePath);
        const workingDir = process.cwd();

        if (!resolvedFilePath.startsWith(workingDir)) {
            console.error(` Security Error: Cannot create backup for file outside working directory: ${filePath}`);
            return null;
        }

        const backupDir = '.chahuadev-fix-comments-backups';

        // สร้างโฟลเดอร์ backup ถ้ายังไม่มี
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        //  SECURITY: Sanitize filename to prevent path injection
        const fileName = path.basename(filePath).replace(/[<>:"/\\|?*]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);

        //  SECURITY: Double-check backup path is safe
        const resolvedBackupPath = path.resolve(backupPath);
        const resolvedBackupDir = path.resolve(backupDir);

        if (!resolvedBackupPath.startsWith(resolvedBackupDir)) {
            console.error(` Security Error: Invalid backup path detected: ${backupPath}`);
            return null;
        }

        // คัดลอกไฟล์
        fs.copyFileSync(filePath, backupPath);

        return backupPath;
    } catch (error) {
        console.error(`Error creating backup: ${error.message}`);
        return null;
    }
}

// ======================================================================
// Organize code by zones/จัดระเบียบโค้ดตามโซน
// ======================================================================
function organizeCodeByZones(content) {
    // Simple zone organization - can be enhanced
    const generator = new CommentGenerator();

    // เพิ่ม zone headers ที่จุดสำคัญ
    let organized = content;

    // เพิ่ม main zone header ที่ต้นไฟล์ถ้ายังไม่มี
    if (!content.includes('╔═') && !content.includes('Zone')) {
        const header = generator.generateZoneHeader(
            'Main Application Zone',
            'Core functionality and business logic'
        );
        organized = header + '\n' + organized;
    }

    return organized;
}

// ======================================================================
// CLI Interface & Options/อินเตอร์เฟซบรรทัดคำสั่งและตัวเลือก
// ======================================================================

// ======================================================================
// Show help message/แสดงข้อความช่วยเหลือ
// ======================================================================
function showHelp() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════════╗
║                       Universal Comment Fixer v1.2.0                          ║
║                Professional Comment Standardization Tool                        ║
╚══════════════════════════════════════════════════════════════════════════════════╝

USAGE:
  fix-comments [target] [options]

TARGETS:
  [file]        Process single file
  [directory]   Process all files in directory
  .             Process current directory

OPTIONS:
  -d, --dry-run         Preview changes without modifying files
  -v, --verbose         Show detailed processing information
  -b, --backup          Create backup before making changes
  -r, --recursive       Process all files in subdirectories
  --add-missing         Add comments to functions without comments
  --ai-mode             AI-friendly mode (add @function, @description)
  --organize-zones      Organize code into logical zones
  --ext <list>          Specify file extensions (comma-separated)
  -h, --help            Show this help message
  --version             Show version information

EXAMPLES:
  fix-comments app.js                           # Fix single file
  fix-comments ./src --backup                   # Fix directory with backup
  fix-comments . -r --add-missing              # Recursive with missing comments
  fix-comments ./src --ai-mode --verbose       # AI-friendly with details
  fix-comments . --dry-run                     # Preview changes only

SUPPORTED FILES:
  .js, .ts, .jsx, .tsx - JavaScript/TypeScript files

SECURITY FEATURES:
  - Path Traversal Protection: Prevents ../../../etc/passwd attacks
  - File Size Limits: 10MB maximum to prevent DoS attacks
  - Parsing Timeout: 30-second maximum to prevent infinite loops
  - Depth Limits: 100-level maximum nesting to prevent complexity attacks
  - Extension Validation: Only valid file extensions accepted
  - System Directory Blacklist: Blocks access to sensitive system paths
  - Working Directory Enforcement: All operations within project scope

SECURITY WARNINGS:
    Run this tool only within your project directories
    Avoid running in Home directory or system directories
    Tool has built-in protection but exercise caution
    Review changes before committing to version control

For more information: https://github.com/chahuadev/chahuadev-fix-comments
`);
}

// ======================================================================
// Show version/แสดงเวอร์ชัน
// ======================================================================
function showVersion() {
    console.log('Universal Comment Fixer v1.2.0');
    console.log('Professional Comment Standardization Tool');
    console.log('Copyright (c) 2025 Chahua Development Co., Ltd.');
}

// ======================================================================
// Process directory/ประมวลผลไดเรกทอรี
// ======================================================================
function processDirectory(dirPath, options = {}) {
    const extensions = options.extensions || ['.js', '.ts', '.jsx', '.tsx'];
    const results = {
        total: 0,
        processed: 0,
        errors: 0,
        files: []
    };

    try {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);

            //  SECURITY: Check if it's a symbolic link first
            const lstat = fs.lstatSync(filePath);
            if (lstat.isSymbolicLink()) {
                if (options.verbose) {
                    console.warn(`  Skipping symbolic link: ${filePath} (circular reference protection)`);
                }
                continue; // ข้าม symbolic link เพื่อป้องกัน infinite loop
            }

            const stat = fs.statSync(filePath);

            if (stat.isDirectory() && options.recursive) {
                //  SECURITY: Enhanced system directory protection
                const secureSkipDirs = [
                    'node_modules', '.git', 'dist', 'build', '.chahuadev-fix-comments-backups',
                    '.npm', '.cache', '.vscode', '.idea', 'coverage', 'logs', 'tmp', 'temp',
                    'System32', 'etc', 'proc', 'sys', 'Windows', 'Program Files', 'Users',
                    '.ssh', '.aws', '.config', '.docker'
                ];

                if (secureSkipDirs.some(skipDir => file.toLowerCase().includes(skipDir.toLowerCase()))) {
                    if (options.verbose) {
                        console.warn(` Skipping protected directory: ${filePath}`);
                    }
                    continue;
                }

                // ประมวลผลโฟลเดอร์ย่อย
                const subResults = processDirectory(filePath, options);
                results.total += subResults.total;
                results.processed += subResults.processed;
                results.errors += subResults.errors;
                results.files.push(...subResults.files);

            } else if (stat.isFile()) {
                const ext = path.extname(file);
                if (extensions.includes(ext)) {
                    results.total++;

                    if (options.verbose) {
                        console.log(`Processing: ${filePath}`);
                    }

                    const result = processFile(filePath, options);
                    if (result.success) {
                        results.processed++;
                        if (result.changes || options.dryRun) {
                            results.files.push({
                                path: filePath,
                                changes: result.changes,
                                originalSize: result.originalSize,
                                newSize: result.newSize
                            });
                        }
                    } else {
                        results.errors++;
                        console.error(`Error processing ${filePath}: ${result.error}`);
                    }
                }
            }
        }

    } catch (error) {
        console.error(`Error reading directory ${dirPath}: ${error.message}`);
        results.errors++;
    }

    return results;
}

// ======================================================================
// Main function/ฟังก์ชันหลัก
// ======================================================================
function main() {
    const args = process.argv.slice(2);

    // ตรวจสอบคำสั่ง
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        showHelp();
        return;
    }

    if (args.includes('--version')) {
        showVersion();
        return;
    }

    // กำหนดค่าเริ่มต้น
    const options = {
        dryRun: args.includes('-d') || args.includes('--dry-run'),
        verbose: args.includes('-v') || args.includes('--verbose'),
        backup: args.includes('-b') || args.includes('--backup'),
        recursive: args.includes('-r') || args.includes('--recursive'),
        addMissing: args.includes('--add-missing'),
        aiMode: args.includes('--ai-mode'),
        organizeZones: args.includes('--organize-zones'),
        extensions: ['.js', '.ts', '.jsx', '.tsx']
    };

    // ดึง extension ที่กำหนด และตรวจสอบความปลอดภัย
    const extIndex = args.findIndex(arg => arg === '--ext');
    if (extIndex !== -1 && args[extIndex + 1]) {
        // SECURITY: Extension Validation - ป้องกันการใส่อินพุตที่ไม่ถูกต้อง
        const inputExtensions = args[extIndex + 1]
            .split(',')
            .map(ext => ext.trim().toLowerCase())
            // กรองเอาเฉพาะ extension ที่มีรูปแบบถูกต้อง (ขึ้นต้นด้วย . และตามด้วยตัวอักษร/ตัวเลข)
            .filter(ext => {
                // ตรวจสอบว่าเป็นรูปแบบ extension ที่ถูกต้อง
                if (!/^\.[a-z0-9]+$/.test(ext)) {
                    console.warn(`Warning: Invalid extension format '${ext}' ignored. Extensions must start with '.' followed by alphanumeric characters.`);
                    return false;
                }
                // ตรวจสอบความยาวที่สมเหตุสมผล
                if (ext.length > 10) {
                    console.warn(`Warning: Extension '${ext}' too long (max 10 chars), ignored.`);
                    return false;
                }
                return true;
            });

        if (inputExtensions.length > 0) {
            options.extensions = inputExtensions;
        } else {
            console.warn(`Warning: No valid extensions provided, using defaults: ${options.extensions.join(', ')}`);
        }
    }

    // หา target (ไฟล์หรือไดเรกทอรี)
    let target = '.';
    for (let i = 0; i < args.length; i++) {
        if (!args[i].startsWith('-') &&
            (extIndex === -1 || i !== extIndex + 1)) {
            target = args[i];
            break;
        }
    }

    //  SECURITY: Path Traversal Protection
    const workingDir = process.cwd();
    const resolvedTarget = path.resolve(target);

    // ป้องกันการเข้าถึงไฟล์นอกโปรเจกต์ปัจจุบัน
    if (!resolvedTarget.startsWith(workingDir)) {
        console.error(` Security Error: Target path '${target}' is outside of the current project directory.`);
        console.error(`   Working directory: ${workingDir}`);
        console.error(`   Resolved target: ${resolvedTarget}`);
        console.error(`   Access denied for security reasons.`);
        process.exit(1);
    }

    //  SECURITY: System Directory Protection
    const forbiddenPaths = [
        'node_modules', '.git', '.npm', '.cache', 'System32', 'etc', 'proc', 'sys',
        'Windows', 'Program Files', 'Users', '.ssh', '.aws', '.config'
    ];

    const targetLower = target.toLowerCase();
    for (const forbidden of forbiddenPaths) {
        if (targetLower.includes(forbidden.toLowerCase())) {
            console.error(`❌ Security Error: Access to '${forbidden}' directories is prohibited for safety.`);
            process.exit(1);
        }
    }

    // ตรวจสอบว่า target มีอยู่จริง
    if (!fs.existsSync(target)) {
        console.error(`Error: Target '${target}' does not exist.`);
        process.exit(1);
    }

    // เริ่มประมวลผล
    console.log(`Starting Comment Fixer v1.2.0...`);
    console.log(`Target: ${target}`);
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);

    const startTime = Date.now();
    const stat = fs.statSync(target);
    let results;

    if (stat.isFile()) {
        // ประมวลผลไฟล์เดียว
        console.log(`Processing single file...`);
        const result = processFile(target, options);

        if (result.success) {
            if (result.changes) {
                console.log(`✓ File processed successfully`);
                if (options.dryRun && result.preview) {
                    console.log('\n--- PREVIEW ---');
                    console.log(result.preview);
                    console.log('--- END PREVIEW ---\n');
                }
            } else {
                console.log(`- No changes needed`);
            }
        } else {
            console.error(`✗ Error: ${result.error}`);
            process.exit(1);
        }

    } else if (stat.isDirectory()) {
        // ประมวลผลไดเรกทอรี
        console.log(`Processing directory${options.recursive ? ' (recursive)' : ''}...`);
        results = processDirectory(target, options);

        // แสดงผลสรุป
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`\n═══════════════════════════════════════════════════════════════════════════════════`);
        console.log(`SUMMARY:`);
        console.log(`  Files found: ${results.total}`);
        console.log(`  Files processed: ${results.processed}`);
        console.log(`  Files with changes: ${results.files.length}`);
        console.log(`  Errors: ${results.errors}`);
        console.log(`  Duration: ${duration}s`);

        if (options.dryRun && results.files.length > 0) {
            console.log(`\nFiles that would be modified:`);
            results.files.forEach(file => {
                console.log(`  - ${file.path}`);
            });
        }

        console.log(`═══════════════════════════════════════════════════════════════════════════════════`);
    }

    console.log(`\nComment Fixer completed ${options.dryRun ? '(DRY RUN)' : 'successfully'}!`);
}

// เรียกใช้ฟังก์ชันหลักถ้าไฟล์นี้ถูกเรียกใช้โดยตรง
if (require.main === module) {
    main();
}

// Export สำหรับการใช้งานเป็น module
module.exports = {
    processFile,
    processDirectory,
    fixComments,
    addMissingComments,
    JavaScriptTokenizer,
    FunctionPatternMatcher,
    CommentGenerator,
    createBackup,
    organizeCodeByZones
};
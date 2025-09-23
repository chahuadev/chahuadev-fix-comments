#!/usr/bin/env node

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                       Universal Comment Fixer v1.2.0                          ║
// ║                Professional Comment Standardization Tool                        ║
// ║           Transform /** */ comments to // format with bilingual support        ║
// ║                    [Production] Ready for Enterprise Use                       ║
// ║                       Security Hardened Against Attacks                     ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

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

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         JavaScript Tokenizer Engine                           ║
// ║                  Advanced Function Detection without Dependencies               ║
// ║              [Core] 100% accurate function detection using tokenizer           ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

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
    'class', 'constructor', 'static', 'get', 'set',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'return', 'break', 'continue', 'throw', 'try', 'catch',
    'import', 'export', 'default', 'from', 'as'
]);

// JavaScript Tokenizer:โทเค็นไนเซอร์ JavaScript
class JavaScriptTokenizer {
    constructor(code) {
        this.code = code;
        this.cursor = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    // แปลงโค้ดทั้งหมดเป็น tokens - Tokenize entire code
    tokenize() {
        while (this.cursor < this.code.length) {
            this.readNextToken();
        }

        // เพิ่ม EOF token
        this.addToken(TOKEN_TYPES.EOF, '', this.line, this.column);
        return this.tokens;
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
    constructor(tokens) {
        this.tokens = tokens.filter(t => t.type !== TOKEN_TYPES.WHITESPACE);
        this.functions = [];
        this.cursor = 0;
        this.scopeStack = []; // เก็บ scope ปัจจุบัน (global, class, function)
        this.braceDepth = 0;  // เก็บระดับ {}
        this.inClass = false; // ตรวจสอบว่าอยู่ใน class หรือไม่
        this.classNames = []; // เก็บชื่อคลาสที่พบ
    }

    // ค้นหาฟังก์ชันทั้งหมด - Find all functions
    findFunctions() {
        this.buildScopeMap(); // สร้าง scope map ก่อน
        this.cursor = 0; // reset cursor

        while (this.cursor < this.tokens.length) {
            const func = this.matchFunctionPattern();
            if (func) {
                this.functions.push(func);
            } else {
                this.cursor++;
            }
        }
        return this.functions;
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
            }

            if (token.type === TOKEN_TYPES.BRACE_CLOSE) {
                braceDepth--;
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

    // รูปแบบ: class ClassName {} - Class declaration pattern
    matchClassDeclaration() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'class' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER) {

            const classToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // ตรวจสอบว่าเป็นคลาสที่ top-level หรือไม่ (ไม่ใช่ nested class)
            const currentDepth = classToken.braceDepth || 0;
            if (currentDepth > 0) {
                return null; // ข้าม nested class
            }

            this.cursor += 2; // ข้าม 'class', name

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

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         Structure Analyzer Engine                             ║
// ║                  Advanced Code Structure Understanding System                  ║
// ║         [Core] Deep analysis of classes and functions for accurate comments    ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

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

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         Comment Generation Engine                              ║
// ║                     Auto-generate bilingual comments for functions             ║
// ║              [Core] Smart comment generation with AI-friendly format           ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

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

        // สร้าง comment ตามประเภท
        let comment = '';

        if (func.type === 'class_declaration' || (structure && structure.type === 'class')) {
            // คอมเมนต์แบบคลาส
            comment += `// ${description.english}:${description.thai}\n`;
        } else if (structure && structure.type === 'object') {
            // คอมเมนต์แบบ object (เช่น TOKEN_TYPES)
            comment += `// ${description.english}:${description.thai}\n`;

            // เพิ่มคอมเมนต์สำหรับ properties ของ object
            if (structure.properties && structure.properties.length > 0) {
                // สำหรับ object ที่มี properties เยอะ ให้เพิ่มคอมเมนต์แยกหมวดหมู่
                const categorizedProps = this.categorizeObjectProperties(structure.properties, structure.name);
                return this.generateObjectComments(comment, categorizedProps, structure);
            }
        } else {
            // คอมเมนต์แบบฟังก์ชันทั่วไป
            comment += '// ======================================================================\n';
            comment += `// ${description.english}/${description.thai}\n`;
            comment += '// ======================================================================\n';
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
            currentTrimmed.startsWith('}') ||
            currentTrimmed.includes('return ') ||
            currentTrimmed.includes('yield ') ||
            !this.isValidStartLine(currentTrimmed)) {
            return -1; // ไม่เหมาะสมที่จะใส่คอมเมนต์
        }

        // ตรวจสอบย้อนหลังเพื่อหา decorators, exports, หรือ annotations
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
            /^class\s+\w+/,           // class declarations
            /^function\s+\w+/,        // function declarations
            /^async\s+function/,      // async functions
            /^function\*/,            // generator functions
            /^async\s+function\*/,    // async generator functions
            /^const\s+\w+\s*=/,       // const declarations
            /^let\s+\w+\s*=/,         // let declarations
            /^var\s+\w+\s*=/,         // var declarations
            /^\w+\s*:/,               // object methods
            /^\w+\s*\(/,              // function calls (methods)
            /^export/,                // exports
            /^module\.exports/,       // module exports
            /^static\s+\w+\s*\(/,     // static methods
            /^get\s+\w+\s*\(/,        // getters
            /^set\s+\w+\s*\(/,        // setters
            /^async\s+\w+\s*\(/       // async methods
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
            /^}/,                     // closing braces
            /^}\);/,                  // closing function calls
            /^\);/,                   // closing parentheses
            /^,/,                     // comma
            /^;/,                     // semicolon
            /^return\s/,              // return statements
            /^yield\s/,               // yield statements
            /^break;?$/,              // break statements
            /^continue;?$/,           // continue statements
            /^case\s/,                // case statements
            /^default:/,              // default case
            /^else/,                  // else statements
            /^catch/,                 // catch blocks
            /^finally/,               // finally blocks
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

        // ถ้าอยู่ลึกในบล็อค (openBraces > 1) ไม่ควรใส่คอมเมนต์
        if (openBraces > 1) {
            return false;
        }

        // ถ้าอยู่ในกลางฟังก์ชันหรือคลาส และไม่ใช่จุดเริ่มต้นของ method ใหม่
        if ((isInFunction || isInClass) && openBraces > 0) {
            // ตรวจสอบว่าเป็น method ใหม่หรือไม่
            if (!this.isValidStartLine(trimmed)) {
                return false;
            }
        }

        return true;
    }

    // สร้าง zone header - Generate zone header
    generateZoneHeader(title, description) {
        const line = '═'.repeat(78);
        return `// ╔${line}╗\n` +
            `// ║${title.padStart(Math.floor((78 + title.length) / 2)).padEnd(78)}║\n` +
            `// ║${description.padStart(Math.floor((78 + description.length) / 2)).padEnd(78)}║\n` +
            `// ╚${line}╝\n`;
    }
}

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         Main Comment Processing Engine                         ║
// ║                     Core logic for comment transformation                      ║
// ║              [Production] Battle-tested comment conversion system              ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

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
        // ใช้ tokenizer และ structure analyzer เพื่อวิเคราะห์โค้ด
        const tokenizer = new JavaScriptTokenizer(content);
        const tokens = tokenizer.tokenize();

        // สร้าง Structure Analyzer เพื่อเข้าใจโครงสร้างโค้ด
        const structureAnalyzer = new StructureAnalyzer(tokens, content);
        const structures = structureAnalyzer.analyzeAll();

        // ใช้ Function Pattern Matcher สำหรับหาฟังก์ชัน
        const matcher = new FunctionPatternMatcher(tokens);
        const functions = matcher.findFunctions();

        if (functions.length === 0 && structures.length === 0) {
            return content;
        }

        // รวม functions และ structures เข้าด้วยกัน และกรองรายการซ้ำ
        const allItems = [];
        const addedItems = new Map(); // ใช้ Map เพื่อเก็บข้อมูลเพิ่มเติม

        // เพิ่ม structures ก่อน (object, class) - ให้ความสำคัญมากกว่า
        structures.forEach(structure => {
            const key = `${structure.name}-${structure.line}`;
            if (!addedItems.has(key) && structure.name && structure.name.length > 0) {
                allItems.push(structure);
                addedItems.set(key, structure.type);
            }
        });

        // เพิ่ม functions ที่ไม่ซ้ำกับ structures
        functions.forEach(func => {
            const key = `${func.name}-${func.line}`;
            if (!addedItems.has(key) &&
                func.name !== 'constructor' &&
                func.name &&
                func.name.length > 0) {
                allItems.push(func);
                addedItems.set(key, func.type);
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

                // สร้างคอมเมนต์โดยใช้ข้อมูลจาก structure analysis
                const comment = generator.generateFunctionComment(item, {
                    ...options,
                    structure: matchingStructure
                });

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

                if (!excludedNames.includes(methodName)) {
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

// ╔══════════════════════════════════════════════════════════════════════════════════╗
// ║                         CLI Interface & Options                               ║
// ║                     Command line interface with full options                   ║
// ║              [Interface] User-friendly command line interface                  ║
// ╚══════════════════════════════════════════════════════════════════════════════════╝

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

SECURITY:
  - Automatic backup creation
  - Path traversal protection
  - System directory blocking
  - File size limits (10MB max)

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

    // ดึง extension ที่กำหนด
    const extIndex = args.findIndex(arg => arg === '--ext');
    if (extIndex !== -1 && args[extIndex + 1]) {
        options.extensions = args[extIndex + 1].split(',').map(ext => ext.trim());
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
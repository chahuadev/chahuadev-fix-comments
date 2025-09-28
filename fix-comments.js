#!/usr/bin/env node

// ======================================================================
// Universal Comment Fixer 3.0.0-beta/เครื่องมือแก้ไขคอมเมนต์สากล v3.0.0-beta
// ======================================================================

// @author บริษัท ชาหัว ดีเวลลอปเมนต์ จำกัด (Chahua Development Co., Ltd.)
// @version v3.0.0-beta
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
// Professional Logging System/ระบบบันทึกมืออาชีพ
// ======================================================================

class ProfessionalLogger {
    constructor() {
        this.projectName = path.basename(process.cwd());
        this.logsDir = path.join(process.cwd(), 'logs');

        // สร้างโฟลเดอร์ logs หลักถ้ายังไม่มี
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }

        // สร้างโฟลเดอร์ย่อยสำหรับโปรเจกต์นี้
        this.projectLogsDir = path.join(this.logsDir, this.projectName);
        if (!fs.existsSync(this.projectLogsDir)) {
            fs.mkdirSync(this.projectLogsDir, { recursive: true });
        }

        // สร้างโฟลเดอร์ session ตามวันเวลา
        const now = new Date();
        const dateFolder = now.toISOString().slice(0, 10); // 2025-09-24
        const timeFolder = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // 03-53-12
        this.sessionFolder = `${dateFolder}_${timeFolder}`;
        this.sessionLogsDir = path.join(this.projectLogsDir, this.sessionFolder);

        if (!fs.existsSync(this.sessionLogsDir)) {
            fs.mkdirSync(this.sessionLogsDir, { recursive: true });
        }

        this.logFiles = {
            error: path.join(this.sessionLogsDir, 'error.log'),
            debug: path.join(this.sessionLogsDir, 'debug.log'),
            audit: path.join(this.sessionLogsDir, 'audit.log'),
            performance: path.join(this.sessionLogsDir, 'performance.log'),
            diagnostic: path.join(this.sessionLogsDir, 'diagnostic.log')
        };

        // เขียน session header
        this.writeSessionHeader();
    }

    writeSessionHeader() {
        const timestamp = new Date().toISOString();
        const header = `\n${'='.repeat(80)}\nSESSION START: ${timestamp} | Project: ${this.projectName}\n${'='.repeat(80)}\n`;

        Object.values(this.logFiles).forEach(logFile => {
            fs.appendFileSync(logFile, header, 'utf8');
        });
    }

    formatLogEntry(level, category, message, data = null) {
        const timestamp = new Date().toISOString();
        let entry = `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}`;

        if (data) {
            entry += `\n  Data: ${JSON.stringify(data, null, 2)}`;
        }

        entry += '\n';
        return entry;
    }

    error(category, message, error = null, data = null) {
        const logData = { ...data };
        if (error) {
            logData.error = {
                message: error.message,
                stack: error.stack,
                name: error.name
            };
        }

        const entry = this.formatLogEntry('ERROR', category, message, logData);
        fs.appendFileSync(this.logFiles.error, entry, 'utf8');

        // แสดงใน console ด้วย
        console.error(`[ERROR] ${category}: ${message}`);
    }

    debug(category, message, data = null) {
        const entry = this.formatLogEntry('DEBUG', category, message, data);
        fs.appendFileSync(this.logFiles.debug, entry, 'utf8');
    }

    audit(action, filePath, details = null) {
        const entry = this.formatLogEntry('AUDIT', 'FILE_OPERATION',
            `${action}: ${filePath}`, details);
        fs.appendFileSync(this.logFiles.audit, entry, 'utf8');
    }

    performance(operation, duration, details = null) {
        const entry = this.formatLogEntry('PERFORMANCE', operation,
            `Duration: ${duration}ms`, details);
        fs.appendFileSync(this.logFiles.performance, entry, 'utf8');
    }

    info(category, message, data = null) {
        const entry = this.formatLogEntry('INFO', category, message, data);
        fs.appendFileSync(this.logFiles.debug, entry, 'utf8');
    }

    // สร้าง diagnostic report แยกต่างหาก
    diagnostic(category, message, data = null) {
        const entry = this.formatLogEntry('DIAGNOSTIC', category, message, data);

        // เขียนลงทั้ง audit และ debug ในโฟลเดอร์ session
        fs.appendFileSync(this.logFiles.audit, entry, 'utf8');
        fs.appendFileSync(this.logFiles.debug, `\n=== DIAGNOSTIC REPORT ===\n${entry}=== END DIAGNOSTIC ===\n`, 'utf8');

        // เขียนลงไฟล์ diagnostic ใน session folder
        if (!fs.existsSync(this.logFiles.diagnostic)) {
            const header = `DIAGNOSTIC REPORTS LOG - ${new Date().toISOString()}\nProject: ${this.projectName} | Session: ${this.sessionFolder}\n${'='.repeat(80)}\n\n`;
            fs.writeFileSync(this.logFiles.diagnostic, header, 'utf8');
        }
        fs.appendFileSync(this.logFiles.diagnostic, entry, 'utf8');
    }
}

// สร้าง logger instance
const logger = new ProfessionalLogger();

// ======================================================================
// Organized Backup System/ระบบสำรองข้อมูลที่เป็นระบบ
// ======================================================================

class OrganizedBackupManager {
    constructor() {
        this.projectName = path.basename(process.cwd());
        this.backupsDir = path.join(process.cwd(), '.backups');
        this.projectBackupDir = path.join(this.backupsDir, this.projectName);

        // สร้างโฟลเดอร์ backup ถ้ายังไม่มี
        this.ensureBackupDirectories();
    }

    ensureBackupDirectories() {
        if (!fs.existsSync(this.backupsDir)) {
            fs.mkdirSync(this.backupsDir, { recursive: true });
            logger.audit('CREATE_BACKUP_DIR', this.backupsDir);
        }

        if (!fs.existsSync(this.projectBackupDir)) {
            fs.mkdirSync(this.projectBackupDir, { recursive: true });
            logger.audit('CREATE_PROJECT_BACKUP_DIR', this.projectBackupDir);
        }
    }

    createBackup(originalFilePath) {
        try {
            // ตรวจสอบว่าไฟล์ต้นฉบับมีอยู่จริง
            if (!fs.existsSync(originalFilePath)) {
                throw new Error(`Original file does not exist: ${originalFilePath}`);
            }

            // สร้างโฟลเดอร์ตามวันที่-เวลา
            const now = new Date();
            const dateFolder = now.toISOString().slice(0, 10); // 2025-09-24
            const timeFolder = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // 03-40-40
            const sessionFolder = `${dateFolder}_${timeFolder}`;

            // สร้างโฟลเดอร์ backup session
            const sessionBackupDir = path.join(this.projectBackupDir, sessionFolder);
            if (!fs.existsSync(sessionBackupDir)) {
                fs.mkdirSync(sessionBackupDir, { recursive: true });
                logger.audit('CREATE_SESSION_BACKUP_DIR', sessionBackupDir);
            }

            // ใช้ชื่อไฟล์ต้นฉบับธรรมดา
            const originalFileName = path.basename(originalFilePath);
            const backupFilePath = path.join(sessionBackupDir, originalFileName);

            // คัดลอกไฟล์ต้นฉบับไป backup (เก็บไฟล์ต้นฉบับ)
            const originalContent = fs.readFileSync(originalFilePath, 'utf8');
            fs.writeFileSync(backupFilePath, originalContent, 'utf8');

            // บันทึก audit log
            logger.audit('BACKUP_CREATED', originalFilePath, {
                backupPath: backupFilePath,
                sessionFolder: sessionFolder,
                originalSize: originalContent.length,
                originalFileName: originalFileName
            });

            logger.info('BACKUP', `Original file backed up to: ${sessionFolder}/${originalFileName}`);

            return backupFilePath;

        } catch (error) {
            logger.error('BACKUP', `Failed to create backup for ${originalFilePath}`, error);
            throw error;
        }
    }

    cleanupOldBackups(maxAge = 7) {
        try {
            const sessionFolders = fs.readdirSync(this.projectBackupDir);
            const cutoffTime = Date.now() - (maxAge * 24 * 60 * 60 * 1000);

            let cleanedCount = 0;

            sessionFolders.forEach(sessionFolder => {
                const sessionPath = path.join(this.projectBackupDir, sessionFolder);
                const stats = fs.statSync(sessionPath);

                // ถ้าเป็นโฟลเดอร์และเก่าเกินกำหนด
                if (stats.isDirectory() && stats.mtime.getTime() < cutoffTime) {
                    // ลบทั้งโฟลเดอร์
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    cleanedCount++;
                    logger.audit('BACKUP_SESSION_CLEANED', sessionPath, {
                        sessionFolder: sessionFolder,
                        age: maxAge
                    });
                }
            });

            if (cleanedCount > 0) {
                logger.info('BACKUP', `Cleaned up ${cleanedCount} old backup sessions`);
            }

        } catch (error) {
            logger.error('BACKUP', 'Failed to cleanup old backups', error);
        }
    }
}

// ======================================================================
// File Comparison & Analysis System - ระบบเปรียบเทียบและวิเคราะห์ไฟล์
// ======================================================================
class FileComparisonAnalyzer {
    constructor() {
        this.comparisonResults = [];
    }

    // เปรียบเทียบไฟล์ก่อนและหลัง แล้วสร้าง detailed report
    compareAndAnalyze(originalContent, modifiedContent, filePath) {
        try {
            const comparisonId = Date.now();
            logger.debug('FILE_COMPARISON', `Starting comparison analysis for: ${filePath}`, { comparisonId });

            // วิเคราะห์ไฟล์ก่อน (Original)
            const originalAnalysis = this.analyzeFileStructures(originalContent, 'ORIGINAL');
            logger.debug('FILE_ANALYSIS', `Original file analysis completed`, {
                filePath,
                structures: originalAnalysis.summary
            });

            // วิเคราะห์ไฟล์หลัง (Modified)
            const modifiedAnalysis = this.analyzeFileStructures(modifiedContent, 'MODIFIED');
            logger.debug('FILE_ANALYSIS', `Modified file analysis completed`, {
                filePath,
                structures: modifiedAnalysis.summary
            });

            // เปรียบเทียบและสร้าง report
            const comparisonReport = this.generateComparisonReport(
                originalAnalysis,
                modifiedAnalysis,
                filePath
            );

            // บันทึก detailed report ลง audit log
            this.logDetailedReport(comparisonReport, filePath);

            // บันทึก error และ skip report
            this.logErrorAndSkipReport(comparisonReport, filePath);

            this.comparisonResults.push(comparisonReport);

            return comparisonReport;

        } catch (error) {
            logger.error('FILE_COMPARISON', `Failed to compare files: ${filePath}`, error);
            return null;
        }
    }

    // วิเคราะห์โครงสร้างไฟล์โดยใช้ระบบที่มีอยู่
    analyzeFileStructures(content, type) {
        try {
            // ใช้ SmartFileAnalyzer ที่มีอยู่แล้ว
            const analyzer = new SmartFileAnalyzer(content, {
                maxDepth: 50,
                maxTokens: 100000,
                maxParsingTime: 15000
            });

            const analysis = analyzer.analyzeFile();

            // นับจำนวน structures แต่ละประเภท
            const summary = {
                totalFunctions: analysis.functions ? analysis.functions.length : 0,
                totalClasses: analysis.classes ? analysis.classes.length : 0,
                totalMethods: analysis.methods ? analysis.methods.length : 0,
                totalVariables: analysis.variables ? analysis.variables.length : 0,
                totalInterfaces: 0,
                totalTypeAliases: 0,
                totalAbstractClasses: 0,
                totalStaticMethods: 0,
                totalArrowFunctions: 0
            };

            // นับ TypeScript structures
            if (analysis.interfaces) summary.totalInterfaces = analysis.interfaces.length;
            if (analysis.typeAliases) summary.totalTypeAliases = analysis.typeAliases.length;
            if (analysis.abstractClasses) summary.totalAbstractClasses = analysis.abstractClasses.length;
            if (analysis.staticMethods) summary.totalStaticMethods = analysis.staticMethods.length;
            if (analysis.arrowFunctions) summary.totalArrowFunctions = analysis.arrowFunctions.length;

            // ตรวจสอบ functions ที่ไม่มี comment
            const functionsWithoutComments = this.findFunctionsWithoutComments(content, analysis.functions || []);
            const classesWithoutComments = this.findClassesWithoutComments(content, analysis.classes || []);

            return {
                type,
                analysis,
                summary,
                functionsWithoutComments,
                classesWithoutComments,
                totalStructures: Object.values(summary).reduce((a, b) => a + b, 0)
            };

        } catch (error) {
            logger.error('STRUCTURE_ANALYSIS', `Failed to analyze ${type} content`, error);
            return { type, error: error.message, summary: {}, totalStructures: 0 };
        }
    }

    // หา functions ที่ไม่มี comment
    findFunctionsWithoutComments(content, functions) {
        const withoutComments = [];
        const lines = content.split('\n');

        functions.forEach(func => {
            const funcLine = func.line - 1; // 0-based index

            // Smart Function Detection - กรองตัวแปรและ patterns พิเศษออก
            if (this.isLikelyVariable(func.name, content, funcLine)) {
                return; // ข้ามตัวแปรที่ถูก misidentify เป็น function
            }

            // กรอง React Components ที่เป็น const assignments ออก
            if (this.isReactComponent(func.name, content, funcLine)) {
                return; // ข้าม React Components - อันนี้ควรเป็น component จริงๆ
            }

            let hasComment = false;

            // ตรวจสอบ 3 บรรทัดก่อนหน้า
            for (let i = 1; i <= 3; i++) {
                const checkLine = funcLine - i;
                if (checkLine >= 0 && lines[checkLine]) {
                    const line = lines[checkLine].trim();
                    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
                        hasComment = true;
                        break;
                    }
                }
            }

            if (!hasComment) {
                withoutComments.push({
                    name: func.name,
                    line: func.line,
                    type: func.type || 'function'
                });
            }
        });

        return withoutComments;
    }

    // หา classes ที่ไม่มี comment (พร้อม Smart Detection)
    findClassesWithoutComments(content, classes) {
        const withoutComments = [];
        const lines = content.split('\n');

        classes.forEach(cls => {
            const classLine = cls.line - 1; // 0-based index

            // Smart Class Detection - กรองตัวแปรออก
            if (this.isLikelyVariable(cls.name, content, classLine)) {
                return; // ข้ามตัวแปรที่ถูก misidentify
            }

            // กรอง React Components ที่เป็น const assignments ออก
            if (this.isReactComponent(cls.name, content, classLine)) {
                return; // ข้าม React Components ที่ควรเป็น functions
            }

            let hasComment = false;            // ตรวจสอบ 3 บรรทัดก่อนหน้า
            for (let i = 1; i <= 3; i++) {
                const checkLine = classLine - i;
                if (checkLine >= 0 && lines[checkLine]) {
                    const line = lines[checkLine].trim();
                    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
                        hasComment = true;
                        break;
                    }
                }
            }

            if (!hasComment) {
                withoutComments.push({
                    name: cls.name,
                    line: cls.line,
                    type: cls.type || 'class'
                });
            }
        });

        return withoutComments;
    }

    // Smart Detection - ตรวจสอบว่าชื่อนั้นเป็นตัวแปรหรือไม่
    isLikelyVariable(name, content, lineIndex) {
        const lines = content.split('\n');
        if (lineIndex < 0 || lineIndex >= lines.length) return false;

        const currentLine = lines[lineIndex].trim();
        const lowerName = name.toLowerCase();

        // Escape ตัวอักษรพิเศษใน name ก่อนใช้ใน RegExp
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // ตรวจสอบ patterns ที่เป็นตัวแปร
        const variablePatterns = [
            // Variable declarations
            new RegExp(`\\b(const|let|var)\\s+${escapedName}\\s*=`),
            new RegExp(`\\b${escapedName}\\s*=\\s*`),

            // Function parameters
            new RegExp(`function\\s*\\([^)]*\\b${escapedName}\\b[^)]*\\)`),
            new RegExp(`\\([^)]*\\b${escapedName}\\b[^)]*\\)\\s*=>`),

            // Destructuring
            new RegExp(`{[^}]*\\b${escapedName}\\b[^}]*}`),
            new RegExp(`\\[[^\\]]*\\b${escapedName}\\b[^\\]]*\\]`),

            // Loop variables
            new RegExp(`for\\s*\\([^;]*\\b${escapedName}\\b`),

            // React Context patterns
            new RegExp(`\\b${escapedName}\\s*=\\s*createContext`),
            new RegExp(`\\bconst\\s+${escapedName}\\s*=\\s*createContext`),

            // React Hook patterns
            new RegExp(`\\b${escapedName}\\s*=\\s*use[A-Z]`),
            new RegExp(`\\bconst\\s+\\[.*${escapedName}.*\\]\\s*=\\s*useState`),

            // Arrow function assignments
            new RegExp(`\\bconst\\s+${escapedName}\\s*=\\s*\\(`),
            new RegExp(`\\bconst\\s+${escapedName}\\s*=\\s*\\w+\\s*=>`),
        ];

        // ตรวจสอบบรรทัดปัจจุบันและใกล้เคียง (เพิ่มช่วงการตรวจสอบ)
        for (let i = Math.max(0, lineIndex - 3); i <= Math.min(lines.length - 1, lineIndex + 3); i++) {
            const line = lines[i];
            if (variablePatterns.some(pattern => pattern.test(line))) {
                return true;
            }
        }

        // ตรวจสอบ common variable names
        const commonVariableNames = [
            'result', 'data', 'item', 'value', 'temp', 'node', 'element',
            'current', 'next', 'prev', 'parent', 'child', 'left', 'right',
            'count', 'index', 'length', 'size', 'max', 'min', 'sum',
            'start', 'end', 'pos', 'queue', 'stack', 'list', 'array',
            'map', 'set', 'key', 'val', 'obj', 'target', 'source',
            'input', 'output', 'buffer', 'cache', 'config', 'options',
            // Algorithm-specific variables
            'dp', 'memo', 'visited', 'distances', 'graph', 'matrix',
            'heap', 'buckets', 'intervals', 'points', 'edges', 'vertices',
            // React-specific variable names
            'user', 'users', 'state', 'props', 'context', 'ref', 'refs',
            'handler', 'handlers', 'callback', 'callbacks', 'event', 'events',
            'timeout', 'interval', 'timer', 'loading', 'error', 'success'
        ];

        if (commonVariableNames.includes(lowerName)) {
            return true;
        }

        // ตรวจสอบ React Context patterns (ขึ้นต้นด้วยตัวพิมพ์ใหญ่ แต่ลงท้ายด้วย Context)
        if (name.endsWith('Context') && /^[A-Z][a-zA-Z]*Context$/.test(name)) {
            return true;
        }

        // ตรวจสอบ React Component patterns ที่เป็น const assignment
        if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
            // ตรวจสอบว่าเป็น const component assignment หรือไม่
            const componentPattern = new RegExp(`const\\s+${name}\\s*=`);
            for (let i = Math.max(0, lineIndex - 2); i <= Math.min(lines.length - 1, lineIndex + 2); i++) {
                if (componentPattern.test(lines[i])) {
                    return true;
                }
            }
        }

        // ตรวจสอบ short variable names (มักเป็น loop counters)
        if (name.length <= 2 && /^[a-zA-Z][0-9]?$/.test(name)) {
            return true;
        }

        // ตรวจสอบ camelCase variables (ขึ้นต้นด้วยตัวพิมพ์เล็ก)
        if (/^[a-z][a-zA-Z0-9]*$/.test(name)) {
            return true;
        }

        return false;
    }

    // ตรวจสอบว่าเป็น React Component หรือไม่
    isReactComponent(name, content, lineIndex) {
        const lines = content.split('\n');
        if (lineIndex < 0 || lineIndex >= lines.length) return false;

        // React Component ต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) return false;

        // ตรวจสอบ patterns ของ React Components
        const reactComponentPatterns = [
            // const Component = () => {}
            new RegExp(`const\\s+${name}\\s*=\\s*\\([^)]*\\)\\s*=>`),
            // const Component = function() {}
            new RegExp(`const\\s+${name}\\s*=\\s*function`),
            // const Component = React.memo()
            new RegExp(`const\\s+${name}\\s*=\\s*React\\.memo`),
            // const Component = forwardRef()
            new RegExp(`const\\s+${name}\\s*=\\s*forwardRef`),
            // export const Component = 
            new RegExp(`export\\s+const\\s+${name}\\s*=`),
        ];

        // ตรวจสอบบรรทัดใกล้เคียง
        for (let i = Math.max(0, lineIndex - 2); i <= Math.min(lines.length - 1, lineIndex + 2); i++) {
            const line = lines[i];
            if (reactComponentPatterns.some(pattern => pattern.test(line))) {
                return true;
            }
        }

        // ตรวจสอบ JSX return patterns
        const jsxPatterns = [
            /return\s*\(/,
            /return\s*</,
            />\s*$/,
            /<\/[a-zA-Z]/
        ];

        // ตรวจสอบใน function body ว่ามี JSX หรือไม่
        for (let i = lineIndex; i < Math.min(lines.length, lineIndex + 20); i++) {
            const line = lines[i].trim();
            if (jsxPatterns.some(pattern => pattern.test(line))) {
                return true;
            }
            // หยุดตรวจสอบถ้าเจอปิด function
            if (line.includes('}') && !line.includes('{')) {
                break;
            }
        }

        return false;
    }

    // สร้าง comparison report
    generateComparisonReport(originalAnalysis, modifiedAnalysis, filePath) {
        const report = {
            filePath,
            timestamp: new Date().toISOString(),
            original: originalAnalysis,
            modified: modifiedAnalysis,
            changes: {
                functionsAdded: modifiedAnalysis.summary.totalFunctions - originalAnalysis.summary.totalFunctions,
                classesAdded: modifiedAnalysis.summary.totalClasses - originalAnalysis.summary.totalClasses,
                commentsAdded: 0, // จะคำนวณจากการเปรียบเทียบ
                structuresSkipped: (modifiedAnalysis.functionsWithoutComments?.length || 0) + (modifiedAnalysis.classesWithoutComments?.length || 0),
                errors: []
            },
            skippedStructures: {
                functions: modifiedAnalysis.functionsWithoutComments || [],
                classes: modifiedAnalysis.classesWithoutComments || []
            }
        };

        // คำนวณจำนวน comments ที่เพิ่ม
        report.changes.commentsAdded = this.calculateCommentsAdded(originalAnalysis, modifiedAnalysis);

        return report;
    }

    // คำนวณจำนวน comments ที่เพิ่มขึ้น
    calculateCommentsAdded(original, modified) {
        const originalCommentLines = this.countCommentLines(original.analysis?.content || '');
        const modifiedCommentLines = this.countCommentLines(modified.analysis?.content || '');
        return Math.max(0, modifiedCommentLines - originalCommentLines);
    }

    // นับจำนวนบรรทัดที่มี comment
    countCommentLines(content) {
        const lines = content.split('\n');
        return lines.filter(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
        }).length;
    }

    // บันทึก detailed report ลง audit log
    logDetailedReport(report, filePath) {
        logger.audit('FILE_COMPARISON_REPORT', filePath, {
            summary: {
                totalStructuresOriginal: report.original.totalStructures,
                totalStructuresModified: report.modified.totalStructures,
                functionsAdded: report.changes.functionsAdded,
                classesAdded: report.changes.classesAdded,
                commentsAdded: report.changes.commentsAdded,
                structuresSkipped: report.changes.structuresSkipped
            },
            originalStructures: report.original.summary,
            modifiedStructures: report.modified.summary
        });
    }

    // บันทึก error และ skip report แยกต่างหาก พร้อมวิเคราะห์ละเอียดและแนะนำวิธีแก้ไข
    logErrorAndSkipReport(report, filePath) {
        if (report.changes.structuresSkipped > 0) {
            // วิเคราะห์รูปแบบที่ skip
            const analysisResult = this.analyzeSkippedPatterns(report, filePath);

            logger.error('STRUCTURES_SKIPPED',
                `${report.changes.structuresSkipped} structures were skipped in ${filePath}`,
                null,
                {
                    skippedFunctions: report.skippedStructures.functions.map(f => `${f.name} (line ${f.line})`),
                    skippedClasses: report.skippedStructures.classes.map(c => `${c.name} (line ${c.line})`),
                    totalSkipped: report.changes.structuresSkipped,
                    reasons: 'Functions/Classes without comments detected',
                    patternAnalysis: analysisResult.patterns,
                    suggestedSolutions: analysisResult.solutions,
                    codeExamples: analysisResult.examples
                }
            );

            // สร้าง detailed diagnostic report
            this.generateDetailedDiagnosticReport(report, filePath, analysisResult);
        }

        // สร้าง summary report
        logger.performance('FILE_PROCESSING_SUMMARY', 0, {
            filePath,
            success: true,
            totalStructures: report.modified.totalStructures,
            commentsAdded: report.changes.commentsAdded,
            functionsSkipped: report.skippedStructures.functions.length,
            classesSkipped: report.skippedStructures.classes.length,
            errorCount: report.changes.errors.length
        });
    }

    // วิเคราะห์รูปแบบของ structures ที่ถูก skip
    analyzeSkippedPatterns(report, filePath) {
        const analysis = {
            patterns: {
                variableDeclarations: 0,
                shortVariableNames: 0,
                nestedStructures: 0,
                generatedCode: 0,
                utilityVariables: 0
            },
            solutions: [],
            examples: []
        };

        // วิเคราะห์ functions ที่ skip
        report.skippedStructures.functions.forEach(func => {
            if (func.name.length <= 2) {
                analysis.patterns.shortVariableNames++;
                analysis.solutions.push(`Short variable name detected: "${func.name}" - Consider using descriptive names`);
            }

            if (['i', 'j', 'k', 'x', 'y', 'z', 'n', 'm'].includes(func.name)) {
                analysis.patterns.utilityVariables++;
                analysis.solutions.push(`Loop/utility variable detected: "${func.name}" - This is likely a loop counter or temporary variable`);
            }
        });

        // วิเคราะห์ classes ที่ skip
        report.skippedStructures.classes.forEach(cls => {
            if (cls.name.length <= 2) {
                analysis.patterns.shortVariableNames++;
                analysis.solutions.push(`Short variable name detected: "${cls.name}" - This appears to be a variable, not a class`);
            }

            if (['temp', 'result', 'data', 'item', 'node', 'value'].includes(cls.name.toLowerCase())) {
                analysis.patterns.variableDeclarations++;
                analysis.solutions.push(`Variable declaration detected: "${cls.name}" - This is likely a variable assignment`);
            }

            if (cls.name.match(/^[a-z][a-zA-Z]*$/)) {
                analysis.patterns.variableDeclarations++;
                analysis.solutions.push(`Camel case variable detected: "${cls.name}" - This follows variable naming convention`);
            }
        });

        // สร้าง code examples สำหรับการแก้ไข
        if (analysis.patterns.variableDeclarations > 0) {
            analysis.examples.push({
                type: 'Variable Declaration Fix',
                problem: 'const result = someFunction();',
                solution: '// Calculate processing result\nconst result = someFunction();'
            });
        }

        if (analysis.patterns.shortVariableNames > 0) {
            analysis.examples.push({
                type: 'Short Variable Name Fix',
                problem: 'let i = 0;',
                solution: '// Loop counter for iteration\nlet i = 0;'
            });
        }

        return analysis;
    }

    // สร้าง detailed diagnostic report
    generateDetailedDiagnosticReport(report, filePath, analysisResult) {
        const diagnosticData = {
            filePath: filePath,
            timestamp: new Date().toISOString(),
            issuesSummary: {
                totalIssues: report.changes.structuresSkipped,
                functionIssues: report.skippedStructures.functions.length,
                classIssues: report.skippedStructures.classes.length,
                mainCauses: this.identifyMainCauses(analysisResult.patterns, report)
            },
            detailedAnalysis: {
                likelyVariableDeclarations: analysisResult.patterns.variableDeclarations,
                shortVariableNames: analysisResult.patterns.shortVariableNames,
                utilityVariables: analysisResult.patterns.utilityVariables,
                suggestedFixes: analysisResult.solutions.length
            },
            actionableRecommendations: this.generateActionableRecommendations(report, analysisResult),
            codeImprovementSuggestions: analysisResult.examples
        };

        logger.diagnostic('STRUCTURE_ANALYSIS',
            `Detailed diagnostic for ${path.basename(filePath)}`,
            diagnosticData);
    }

    // ระบุสาเหตุหลักของปัญหา
    identifyMainCauses(patterns, report) {
        const causes = [];

        if (patterns.variableDeclarations > 0) {
            causes.push('Variable declarations misidentified as classes');
        }

        if (patterns.shortVariableNames > 0) {
            causes.push('Short variable names detected');
        }

        if (patterns.utilityVariables > 0) {
            causes.push('Loop counters and utility variables present');
        }

        // เพิ่ม Advanced Pattern Analysis
        const advancedPatterns = this.analyzeAdvancedPatterns(report.skippedStructures);



        if (advancedPatterns.typeScriptPatterns > 0) {
            causes.push('TypeScript advanced constructs (interfaces, types, generics)');
        }

        if (advancedPatterns.reactPatterns > 0) {
            causes.push('React patterns (hooks, components, context)');
        }

        if (advancedPatterns.modernJsPatterns > 0) {
            causes.push('Modern JavaScript patterns (destructuring, async/await)');
        }

        if (advancedPatterns.classMethodPatterns > 0) {
            causes.push('Advanced class methods and decorators');
        }

        return causes.length > 0 ? causes : ['Unknown pattern - requires manual review'];
    }

    // วิเคราะห์ Advanced Patterns ที่ Parser ยังไม่รู้จัก
    analyzeAdvancedPatterns(skippedStructures) {
        const patterns = {
            typeScriptPatterns: 0,
            reactPatterns: 0,
            modernJsPatterns: 0,
            classMethodPatterns: 0,
            algorithmPatterns: 0
        };

        const allStructures = [
            ...(skippedStructures.functions || []),
            ...(skippedStructures.classes || [])
        ];

        allStructures.forEach(structure => {
            const name = structure.name;
            const lowerName = name.toLowerCase();

            // TypeScript Patterns
            if (this.isTypeScriptPattern(name)) {
                patterns.typeScriptPatterns++;
            }

            // React Patterns
            if (this.isReactPattern(name)) {
                patterns.reactPatterns++;
            }

            // Modern JavaScript Patterns
            if (this.isModernJsPattern(name)) {
                patterns.modernJsPatterns++;
            }

            // Class Method Patterns
            if (this.isClassMethodPattern(name)) {
                patterns.classMethodPatterns++;
            }

            // Algorithm Patterns
            if (this.isAlgorithmPattern(name)) {
                patterns.algorithmPatterns++;
            }
        });

        return patterns;
    }

    // ตรวจสอบ TypeScript Patterns
    isTypeScriptPattern(name) {
        const tsPatterns = [
            /^[A-Z][a-zA-Z]*Options$/,       // ConnectionOptions, QueryOptions
            /^[A-Z][a-zA-Z]*Config$/,        // DatabaseConfig, ApiConfig
            /^[A-Z][a-zA-Z]*Handler$/,       // EventHandler, ErrorHandler
            /^[A-Z][a-zA-Z]*Listener$/,      // EventListener, ChangeListener
            /^[A-Z][a-zA-Z]*Result$/,        // QueryResult, ValidationResult
            /^[A-Z][a-zA-Z]*Error$/,         // ValidationError, ConnectionError
            /^[A-Z][a-zA-Z]*Stats$/,         // ConnectionStats, PerformanceStats
            /^[A-Z][a-zA-Z]*Schema$/,        // ValidationSchema, DatabaseSchema
            /^I[A-Z][a-zA-Z]*$/,             // Interface naming (IUser, IDatabase)
            /^T[A-Z][a-zA-Z]*$/,             // Type parameter naming
        ];

        return tsPatterns.some(pattern => pattern.test(name));
    }

    // ตรวจสอบ React Patterns
    isReactPattern(name) {
        const reactPatterns = [
            /^use[A-Z][a-zA-Z]*$/,           // Custom hooks (useApi, useLocalStorage)
            /^[A-Z][a-zA-Z]*Context$/,       // React Context (ThemeContext, UserContext)
            /^[A-Z][a-zA-Z]*Provider$/,      // Context Provider (NotificationProvider)
            /^handle[A-Z][a-zA-Z]*$/,        // Event handlers (handleClick, handleSubmit)
            /^on[A-Z][a-zA-Z]*$/,            // Event callbacks (onClick, onSubmit)
            /^render[A-Z][a-zA-Z]*$/,        // Render methods (renderItem, renderField)
            /^[a-z]+Ref$/,                   // React refs (inputRef, containerRef)
            /^[A-Z][a-zA-Z]*Table$/,         // React Table components (DataTable, UserTable)
            /^[A-Z][a-zA-Z]*Form$/,          // React Form components (LoginForm, ContactForm)
            /^[A-Z][a-zA-Z]*Modal$/,         // React Modal components (ConfirmModal, EditModal)
            /^[A-Z][a-zA-Z]*Button$/,        // React Button components (SubmitButton, CancelButton)
            /^[A-Z][a-zA-Z]*Input$/,         // React Input components (TextInput, DateInput)
            /^[A-Z][a-zA-Z]*List$/,          // React List components (ItemList, UserList)
            /^[A-Z][a-zA-Z]*Card$/,          // React Card components (ProfileCard, NewsCard)
            /^[A-Z][a-zA-Z]*Builder$/,       // React Builder components (FormBuilder, LayoutBuilder)
            /^[A-Z][a-zA-Z]*Dashboard$/,     // React Dashboard components
            /^[A-Z][a-zA-Z]*Panel$/,         // React Panel components
            /^[A-Z][a-zA-Z]*Widget$/,        // React Widget components
        ];

        return reactPatterns.some(pattern => pattern.test(name));
    }

    // ตรวจสอบ Modern JavaScript Patterns
    isModernJsPattern(name) {
        const modernPatterns = [
            /^[a-z]+Async$/,                 // Async functions (fetchAsync, loadAsync)
            /^[a-z]+Promise$/,               // Promise-based functions
            /^[a-z]+Generator$/,             // Generator functions
            /^[a-z]+Iterator$/,              // Iterator functions
            /^create[A-Z][a-zA-Z]*$/,        // Factory functions (createConnection, createUser)
            /^build[A-Z][a-zA-Z]*$/,         // Builder functions
            /^process[A-Z][a-zA-Z]*$/,       // Processing functions
        ];

        return modernPatterns.some(pattern => pattern.test(name));
    }

    // ตรวจสอบ Class Method Patterns
    isClassMethodPattern(name) {
        const classPatterns = [
            /^[a-z]+Connection$/,            // Database connections
            /^[a-z]+Manager$/,               // Manager classes
            /^[a-z]+Builder$/,               // Builder classes  
            /^[a-z]+Factory$/,               // Factory classes
            /^[a-z]+Repository$/,            // Repository pattern
            /^[a-z]+Service$/,               // Service classes
            /^[a-z]+Controller$/,            // Controller classes
        ];

        return classPatterns.some(pattern => pattern.test(name));
    }

    // ตรวจสอบ Algorithm Patterns
    isAlgorithmPattern(name) {
        const algoPatterns = [
            /^[a-z]{1,3}$/,                  // Short algorithm variables (dp, bfs, dfs)
            /^[a-z]+Tree$/,                  // Tree structures
            /^[a-z]+Node$/,                  // Node structures  
            /^[a-z]+Graph$/,                 // Graph structures
            /^[a-z]+Queue$/,                 // Queue structures
            /^[a-z]+Stack$/,                 // Stack structures
        ];

        return algoPatterns.some(pattern => pattern.test(name));
    }

    // สร้างคำแนะนำที่สามารถทำได้จริง
    generateActionableRecommendations(report, analysisResult) {
        const recommendations = [];

        if (analysisResult.patterns.variableDeclarations > 5) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Review variable declarations',
                description: 'Many variables were misidentified as classes. Consider adding comments above variable declarations.',
                example: '// Store calculation result\nconst result = calculate();'
            });
        }

        if (analysisResult.patterns.shortVariableNames > 3) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Use descriptive variable names',
                description: 'Short variable names (i, j, x, y) are common and may not need comments.',
                example: 'for (let index = 0; index < items.length; index++)'
            });
        }

        if (report.changes.structuresSkipped > 20) {
            recommendations.push({
                priority: 'LOW',
                action: 'Consider code refactoring',
                description: 'High number of skipped structures suggests complex code that may benefit from refactoring.',
                example: 'Break down large functions into smaller, well-documented functions'
            });
        }

        // Advanced Pattern Recommendations
        const advancedPatterns = this.analyzeAdvancedPatterns(report.skippedStructures);

        if (advancedPatterns.typeScriptPatterns > 0) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Add TypeScript interface/type documentation',
                description: 'TypeScript constructs detected. These need proper documentation for better code understanding.',
                example: '// Interface defining database connection options\ninterface ConnectionOptions { ... }'
            });
        }

        if (advancedPatterns.reactPatterns > 0) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Document React components and hooks',
                description: 'React patterns detected. Components and custom hooks should have clear documentation.',
                example: '// Custom hook for managing API calls with loading state\nconst useApi = () => { ... }'
            });
        }

        if (advancedPatterns.modernJsPatterns > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Document async/await and modern patterns',
                description: 'Modern JavaScript patterns detected. Async operations need clear documentation.',
                example: '// Asynchronously processes user data with error handling\nasync function processUserData() { ... }'
            });
        }

        if (advancedPatterns.classMethodPatterns > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Add class method documentation',
                description: 'Advanced class methods detected. Repository/Service patterns need clear documentation.',
                example: '// Repository class for managing user database operations\nclass UserRepository { ... }'
            });
        }

        return recommendations;
    }
}

// สร้าง file comparison analyzer instance
const fileComparisonAnalyzer = new FileComparisonAnalyzer();

// สร้าง backup manager instance
const backupManager = new OrganizedBackupManager();

// ======================================================================
// Helper Functions - ฟังก์ชันช่วยเหลือสำหรับการประมวลผล
// ======================================================================

// ฟังก์ชันคำนวณหมายเลขบรรทัดที่จัดการ line endings ได้ถูกต้อง
// @param {string} content - เนื้อหาของไฟล์
// @param {number} index - ตำแหน่งที่ต้องการหาหมายเลขบรรทัด
// @returns {number} หมายเลขบรรทัด (เริ่มต้นที่ 1)
function calculateLineNumber(content, index) {
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return normalizedContent.substring(0, index).split('\n').length;
}

// ฟังก์ชันสำหรับ normalize line endings
// @param {string} content - เนื้อหาของไฟล์
// @returns {string} เนื้อหาที่ normalize แล้ว
function normalizeLineEndings(content) {
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

// ฟังก์ชันตรวจสอบว่าแต่ละ structure มี comment เฉพาะตัวหรือไม่
// @param {string} content - เนื้อหาของไฟล์
// @param {Array} structures - รายการ structures ที่ตรวจพบ
// @returns {Map} Map ที่เก็บข้อมูล comment status ของแต่ละ structure
function analyzeCommentStatus(content, structures) {
    const commentStatusMap = new Map();
    const normalizedContent = normalizeLineEndings(content);
    const lines = normalizedContent.split('\n');

    structures.forEach(structure => {
        const structureLine = structure.line - 1; // แปลงเป็น 0-based index
        let hasComment = false;
        let commentLines = [];

        // ตรวจสอบ 3-5 บรรทัดก่อนหน้าเฉพาะ structure นี้
        for (let i = 1; i <= 5; i++) {
            const checkIndex = structureLine - i;
            if (checkIndex >= 0 && checkIndex < lines.length) {
                const line = lines[checkIndex];
                const trimmed = line.trim();

                // เจอ comment line
                if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.includes('*/')) {
                    const commentContent = trimmed.toLowerCase();
                    const structureName = structure.name.toLowerCase();

                    // ตรวจสอบว่า comment นี้เกี่ยวข้องกับ structure นี้หรือไม่
                    // หลัก: ชื่อ structure ต้องตรงกัน หรือ comment ต้องเฉพาะเจาะจง
                    if (commentContent.includes(structureName) ||
                        (commentContent.includes('en:') &&
                            (commentContent.includes(structureName) ||
                                (commentContent.includes('interface') && structure.type === 'interface_declaration') ||
                                (commentContent.includes('type') && structure.type === 'type_alias' && commentContent.includes('alias')) ||
                                (commentContent.includes('static') && structure.type === 'static_method') ||
                                (commentContent.includes('abstract') && structure.type === 'abstract_class'))) ||
                        (commentContent.includes('th:') &&
                            (commentContent.includes(structureName) ||
                                (commentContent.includes('interface') && structure.type === 'interface_declaration') ||
                                (commentContent.includes('type') && structure.type === 'type_alias' && commentContent.includes('alias')) ||
                                (commentContent.includes('static') && structure.type === 'static_method') ||
                                (commentContent.includes('abstract') && structure.type === 'abstract_class'))) ||
                        commentContent.includes('======')) {
                        hasComment = true;
                        commentLines.push(checkIndex + 1); // แปลงกลับเป็น 1-based
                        break;
                    }
                }

                // เจอ code line อื่นที่ไม่เกี่ยวข้อง ให้หยุดค้นหา
                else if (trimmed &&
                    !trimmed.startsWith('export') &&
                    !trimmed.startsWith('@') &&
                    !trimmed.startsWith('{') &&
                    !trimmed.startsWith('}')) {
                    break;
                }
            }
        }

        commentStatusMap.set(structure.name, {
            hasComment,
            commentLines,
            structure: structure
        });
    });

    return commentStatusMap;
}

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
    BRACKET_OPEN: 'BRACKET_OPEN',   // [
    BRACKET_CLOSE: 'BRACKET_CLOSE', // ]
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

// คำหลักของ JavaScript, TypeScript, JSX, TSX ครบถ้วน - Complete keywords for JS/TS/JSX/TSX
const KEYWORDS = new Set([
    // ═══════════════════════════════════════════════════════════════
    // JavaScript Core Keywords
    // ═══════════════════════════════════════════════════════════════
    'function', 'const', 'let', 'var', 'async', 'await',
    'class', 'constructor', 'static', 'get', 'set', 'abstract',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'return', 'break', 'continue', 'throw', 'try', 'catch',
    'import', 'export', 'default', 'from', 'as', 'finally',
    'with', 'delete', 'new', 'this', 'super', 'instanceof',
    'of', 'in', 'null', 'undefined', 'true', 'false',
    'yield', 'debugger', 'arguments', 'eval',

    // ═══════════════════════════════════════════════════════════════
    // TypeScript Specific Keywords
    // ═══════════════════════════════════════════════════════════════
    'interface', 'type', 'enum', 'namespace', 'module',
    'declare', 'readonly', 'public', 'private', 'protected',
    'implements', 'extends', 'keyof', 'typeof', 'infer',
    'never', 'unknown', 'any', 'void', 'string', 'number', 'boolean',
    'object', 'symbol', 'bigint', 'unique', 'is', 'asserts',
    'override', 'satisfies', 'out', 'in', 'const',

    // ═══════════════════════════════════════════════════════════════
    // Advanced TypeScript Utility Types & Keywords
    // ═══════════════════════════════════════════════════════════════
    'Partial', 'Required', 'Pick', 'Omit', 'Exclude', 'Extract',
    'NonNullable', 'Parameters', 'ReturnType', 'InstanceType',
    'ThisType', 'Record', 'Readonly', 'Array', 'Promise',
    'Awaited', 'ConstructorParameters', 'ThisParameterType',
    'OmitThisParameter', 'Uppercase', 'Lowercase', 'Capitalize', 'Uncapitalize',

    // ═══════════════════════════════════════════════════════════════
    // React Core Components & Hooks
    // ═══════════════════════════════════════════════════════════════
    'React', 'Component', 'PureComponent', 'memo', 'forwardRef',
    'createContext', 'useContext', 'createRef', 'useRef',
    'useState', 'useEffect', 'useReducer', 'useCallback', 'useMemo',
    'useLayoutEffect', 'useImperativeHandle', 'useDebugValue',
    'useDeferredValue', 'useTransition', 'useId', 'useSyncExternalStore',
    'useInsertionEffect', 'startTransition', 'flushSync',

    // ═══════════════════════════════════════════════════════════════
    // React Advanced Components & APIs  
    // ═══════════════════════════════════════════════════════════════
    'Fragment', 'StrictMode', 'Suspense', 'SuspenseList', 'Profiler',
    'createElement', 'createFactory', 'cloneElement', 'isValidElement',
    'Children', 'lazy', 'ErrorBoundary', 'Portal', 'createPortal',

    // ═══════════════════════════════════════════════════════════════
    // React Router & State Management
    // ═══════════════════════════════════════════════════════════════
    'Router', 'Route', 'Routes', 'Link', 'NavLink', 'Navigate',
    'useNavigate', 'useLocation', 'useParams', 'useSearchParams',
    'Outlet', 'BrowserRouter', 'HashRouter', 'MemoryRouter',
    'Provider', 'Consumer', 'connect', 'useSelector', 'useDispatch',

    // ═══════════════════════════════════════════════════════════════
    // JSX Specific Elements & Attributes
    // ═══════════════════════════════════════════════════════════════
    'JSX', 'IntrinsicElements', 'ElementType', 'ComponentProps',
    'PropsWithChildren', 'PropsWithRef', 'RefAttributes',
    'ClassAttributes', 'HTMLAttributes', 'DOMAttributes',
    'CSSProperties', 'MouseEvent', 'KeyboardEvent', 'FormEvent',
    'ChangeEvent', 'FocusEvent', 'TouchEvent', 'WheelEvent',

    // ═══════════════════════════════════════════════════════════════
    // Next.js Specific Keywords
    // ═══════════════════════════════════════════════════════════════
    'GetServerSideProps', 'GetStaticProps', 'GetStaticPaths',
    'NextPage', 'NextApiRequest', 'NextApiResponse', 'NextApiHandler',
    'AppProps', 'Document', 'Head', 'Image', 'Link',
    'useRouter', 'withRouter', 'getServerSideProps', 'getStaticProps',

    // ═══════════════════════════════════════════════════════════════
    // Node.js & Server-side Keywords
    // ═══════════════════════════════════════════════════════════════
    'require', 'module', 'exports', '__dirname', '__filename',
    'process', 'global', 'Buffer', 'console', 'setTimeout', 'setInterval',
    'clearTimeout', 'clearInterval', 'setImmediate', 'clearImmediate',

    // ═══════════════════════════════════════════════════════════════
    // Testing Framework Keywords
    // ═══════════════════════════════════════════════════════════════
    'describe', 'it', 'test', 'expect', 'beforeEach', 'afterEach',
    'beforeAll', 'afterAll', 'jest', 'mock', 'spy', 'stub',
    'render', 'screen', 'fireEvent', 'waitFor', 'act',

    // ═══════════════════════════════════════════════════════════════
    // Build Tools & Bundlers Keywords
    // ═══════════════════════════════════════════════════════════════
    'webpack', 'vite', 'rollup', 'parcel', 'babel', 'tsc',
    'eslint', 'prettier', 'tsconfig', 'package', 'dependencies',

    // ═══════════════════════════════════════════════════════════════
    // CSS-in-JS & Styling Libraries
    // ═══════════════════════════════════════════════════════════════
    'styled', 'css', 'keyframes', 'createGlobalStyle', 'ThemeProvider',
    'makeStyles', 'useStyles', 'withStyles', 'createStyles',
    'Box', 'Stack', 'Grid', 'Container', 'Paper', 'Card',

    // ═══════════════════════════════════════════════════════════════
    // Database & API Keywords
    // ═══════════════════════════════════════════════════════════════
    'fetch', 'axios', 'query', 'mutation', 'subscription',
    'GraphQL', 'REST', 'API', 'endpoint', 'middleware',
    'mongoose', 'prisma', 'sequelize', 'typeorm', 'knex',

    // ═══════════════════════════════════════════════════════════════
    // Common Library & Framework Keywords
    // ═══════════════════════════════════════════════════════════════
    'lodash', 'moment', 'dayjs', 'date-fns', 'ramda',
    'rxjs', 'observable', 'subject', 'subscription',
    'express', 'koa', 'fastify', 'nest', 'apollo',

    // ═══════════════════════════════════════════════════════════════
    // Development & Debugging Keywords
    // ═══════════════════════════════════════════════════════════════
    'development', 'production', 'staging', 'test',
    'debug', 'trace', 'warn', 'error', 'info', 'log',
    'performance', 'profiler', 'benchmark', 'optimization'
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
        this.braceDepth = 0; // ติดตาม depth ของ {}
        this.parenDepth = 0; // ติดตาม depth ของ ()
        this.bracketDepth = 0; // ติดตาม depth ของ []
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
            '[': TOKEN_TYPES.BRACKET_OPEN,
            ']': TOKEN_TYPES.BRACKET_CLOSE,
            ';': TOKEN_TYPES.SEMICOLON,
            ',': TOKEN_TYPES.COMMA
        };

        // อัพเดท depth counters
        if (char === '{') this.braceDepth++;
        else if (char === '}') this.braceDepth--;
        else if (char === '(') this.parenDepth++;
        else if (char === ')') this.parenDepth--;
        else if (char === '[') this.bracketDepth++;
        else if (char === ']') this.bracketDepth--;

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
            position: this.cursor - value.length,
            braceDepth: this.braceDepth,
            parenDepth: this.parenDepth,
            bracketDepth: this.bracketDepth
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

        // ===================================================================
        // ENHANCED PATTERN DETECTION v2.0 - The Next Frontier
        // การตรวจจับรูปแบบขั้นสูง v2.0 - มิติใหม่ของการพัฒนา
        // ===================================================================

        // Priority 1: TypeScript Advanced Constructs
        return this.matchInterfaceDeclaration() ||
            this.matchTypeAlias() ||
            this.matchEnumDeclaration() ||
            this.matchNamespaceDeclaration() ||
            this.matchModuleDeclaration() ||
            this.matchDeclareStatement() ||

            // Priority 2: Class and Object Patterns
            this.matchClassDeclaration() ||
            this.matchAbstractClass() ||
            this.matchGenericClass() ||

            // Priority 3: React/JSX Advanced Patterns
            this.matchReactComponent() ||
            this.matchExportedComponent() ||
            this.matchReactHooks() ||
            this.matchReactForwardRef() ||
            this.matchReactMemo() ||
            this.matchHigherOrderComponent() ||

            // Priority 4: Function Patterns
            this.matchFunctionDeclaration() ||
            this.matchArrowFunction() ||
            this.matchAsyncFunction() ||
            this.matchGeneratorFunction() ||
            this.matchIIFE() ||
            this.matchCurriedFunction() ||
            this.matchFactoryFunction() ||

            // Priority 5: Method Patterns
            this.matchAsyncClassMethod() ||
            this.matchGetter() ||
            this.matchSetter() ||
            this.matchStaticMethod() ||
            this.matchPrivateMethod() ||
            this.matchProtectedMethod() ||
            this.matchClassMethod() ||

            // Priority 6: Modern JavaScript Patterns
            this.matchDestructuringAssignment() ||
            this.matchSpreadOperator() ||
            this.matchAsyncIterator() ||
            this.matchProxyHandler() ||

            // Priority 7: Algorithm & Data Structure Patterns
            this.matchAlgorithmFunction() ||
            this.matchDataStructureMethod() ||
            this.matchMathFunction() ||

            // Priority 8: Express.js & Node.js Patterns  
            this.matchExpressRoute() ||
            this.matchExpressMiddleware() ||
            this.matchNodeJSModule();
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

            // ลดความเข้มงวด - ตรวจสอบบริบทแต่ยอมรับกรณีพิเศษ
            const inClass = this.isInClassContext();
            const nextTokenAfterParen = this.findTokenAfterParentheses();
            const hasMethodBody = nextTokenAfterParen && nextTokenAfterParen.type === TOKEN_TYPES.BRACE_OPEN;

            // ต้องอยู่ในคลาสหรือมี method body ที่ชัดเจน
            if (!inClass && !hasMethodBody) {
                return null;
            }

            // ถ้าไม่มี method body ชัดเจนแต่อยู่ในคลาส ก็ยังพอจะรับได้
            if (inClass && !hasMethodBody) {
                // ตรวจสอบว่าเป็น method pattern ที่น่าจะใช่หรือไม่
                if (!this.isLikelyMethodName(nameToken.value)) {
                    return null;
                }
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
            // อนุญาติให้ class อยู่ในระดับที่ลึกกว่าได้บ้าง สำหรับไฟล์ที่ซับซ้อน - แต่ไม่เกิน 2 level
            if (currentDepth > 2) {
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
            // อนุญาติให้ class อยู่ในระดับที่ลึกกว่าได้บ้าง สำหรับไฟล์ที่ซับซ้อน - แต่ไม่เกิน 2 level
            if (currentDepth > 2) {
                return null; // ข้าม deeply nested class
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

    // รูปแบบ: interface InterfaceName {} - Interface declaration pattern
    matchInterfaceDeclaration() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'interface' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER) {

            const interfaceToken = this.currentToken();
            const nameToken = this.peekToken(1);

            this.cursor += 2; // ข้าม 'interface', name

            return {
                type: 'interface_declaration',
                name: nameToken.value,
                line: interfaceToken.line,
                column: interfaceToken.column,
                parameters: [],
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: type TypeName = ... - Type alias declaration pattern  
    matchTypeAlias() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'type' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.EQUALS) {

            const typeToken = this.currentToken();
            const nameToken = this.peekToken(1);

            this.cursor += 3; // ข้าม 'type', name, '='

            return {
                type: 'type_alias',
                name: nameToken.value,
                line: typeToken.line,
                column: typeToken.column,
                parameters: [],
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: enum EnumName {} - Enum declaration pattern
    matchEnumDeclaration() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'enum' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER) {

            const enumToken = this.currentToken();
            const nameToken = this.peekToken(1);

            this.cursor += 2; // ข้าม 'enum', name

            return {
                type: 'enum_declaration',
                name: nameToken.value,
                line: enumToken.line,
                column: enumToken.column,
                parameters: [],
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: const ComponentName = () => { - React Functional Component pattern
    matchReactComponent() {
        // Pattern: const ComponentName = () => JSX
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'const' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(1)?.value.match(/^[A-Z][a-zA-Z0-9]*$/) && // Component name starts with uppercase
            this.peekToken(2)?.type === TOKEN_TYPES.EQUALS &&
            this.peekToken(3)?.type === TOKEN_TYPES.PAREN_OPEN) {

            const constToken = this.currentToken();
            const nameToken = this.peekToken(1);
            const params = this.extractParameters(this.cursor + 3);

            this.cursor += 4; // ข้าม 'const', name, '=', '('

            return {
                type: 'react_component',
                name: nameToken.value,
                line: constToken.line,
                column: constToken.column,
                parameters: params,
                isAsync: false,
                isReactComponent: true
            };
        }

        // Pattern: function ComponentName() { return JSX
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'function' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(1)?.value.match(/^[A-Z][a-zA-Z0-9]*$/)) { // Component name starts with uppercase

            const functionToken = this.currentToken();
            const nameToken = this.peekToken(1);
            const params = this.extractParameters(this.cursor + 2);

            this.cursor += 3; // ข้าม 'function', name, '('

            return {
                type: 'react_component',
                name: nameToken.value,
                line: functionToken.line,
                column: functionToken.column,
                parameters: params,
                isAsync: false,
                isReactComponent: true
            };
        }

        return null;
    }

    // รูปแบบ: export const/function ComponentName - Exported Component pattern
    matchExportedComponent() {
        // Pattern: export const ComponentName = 
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'export' &&
            this.peekToken(1)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(1)?.value === 'const' &&
            this.peekToken(2)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.value.match(/^[A-Z][a-zA-Z0-9]*$/)) {

            const exportToken = this.currentToken();
            const nameToken = this.peekToken(2);
            const params = this.extractParameters(this.cursor + 4); // after 'export const name ='

            this.cursor += 5; // ข้าม 'export', 'const', name, '=', '('

            return {
                type: 'exported_component',
                name: nameToken.value,
                line: exportToken.line,
                column: exportToken.column,
                parameters: params,
                isAsync: false,
                isExported: true,
                isReactComponent: true
            };
        }

        // Pattern: export function ComponentName
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'export' &&
            this.peekToken(1)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(1)?.value === 'function' &&
            this.peekToken(2)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.value.match(/^[A-Z][a-zA-Z0-9]*$/)) {

            const exportToken = this.currentToken();
            const nameToken = this.peekToken(2);
            const params = this.extractParameters(this.cursor + 3);

            this.cursor += 4; // ข้าม 'export', 'function', name, '('

            return {
                type: 'exported_component',
                name: nameToken.value,
                line: exportToken.line,
                column: exportToken.column,
                parameters: params,
                isAsync: false,
                isExported: true,
                isReactComponent: true
            };
        }

        // Pattern: export default class ComponentName
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'export' &&
            this.peekToken(1)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(1)?.value === 'default' &&
            this.peekToken(2)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(2)?.value === 'class' &&
            this.peekToken(3)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(3)?.value.match(/^[A-Z][a-zA-Z0-9]*$/)) {

            const exportToken = this.currentToken();
            const nameToken = this.peekToken(3);

            this.cursor += 4; // ข้าม 'export', 'default', 'class', name

            return {
                type: 'exported_class_component',
                name: nameToken.value,
                line: exportToken.line,
                column: exportToken.column,
                parameters: [],
                isAsync: false,
                isExported: true,
                isReactComponent: true
            };
        }

        return null;
    }

    // ตรวจสอบว่าชื่อน่าจะเป็น method หรือไม่
    isLikelyMethodName(name) {
        // ตรวจสอบ pattern ต่างๆ ที่มักเป็น method name
        const methodPatterns = [
            /^(get|set|is|has|can|should|will|create|make|build|init|setup|config|configure)/, // action verbs
            /^(process|handle|manage|calculate|compute|validate|check|verify|parse|format)/, // processing verbs
            /^(render|update|delete|remove|add|insert|save|load|fetch|send|receive|execute)/, // CRUD operations
            /^(start|stop|pause|resume|restart|reset|clear|clean|refresh|reload|sync)/, // lifecycle verbs
            /^(connect|disconnect|login|logout|authenticate|authorize|encrypt|decrypt)/, // auth/network
            /^(on[A-Z]|handle[A-Z]|process[A-Z])/, // event handlers
            /^[a-z][a-zA-Z]*[A-Z]/, // camelCase with uppercase
            /^[a-z]+[0-9]+/, // มีตัวเลขปน
            /.*[A-Z].*[A-Z].*/ // มี uppercase หลายตัว
        ];

        // ห้าม built-in keywords
        const excludedPatterns = [
            /^(if|else|for|while|switch|case|break|continue|return|try|catch|finally|throw)$/,
            /^(var|let|const|function|class|import|export|default|from|as|typeof|instanceof)$/,
            /^(null|undefined|true|false|this|super|new|delete|void)$/
        ];

        // ตรวจสอบว่าไม่ใช่ keyword ที่ต้องห้าม
        if (excludedPatterns.some(pattern => pattern.test(name))) {
            return false;
        }

        // ตรวจสอบว่าตรงกับ pattern ที่เป็น method
        return methodPatterns.some(pattern => pattern.test(name)) ||
            (name.length > 2 && /^[a-z][a-zA-Z0-9_]*$/.test(name));
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
            const structureAnalyzer = new StructureAnalyzer(tokens, this.content);
            const structures = structureAnalyzer.analyzeAll();

            // Phase 2: วิเคราะห์โครงสร้างลึก
            this.analyzeStructures(structures);

            // Phase 3: ค้นหาลวดลายและความสัมพันธ์
            this.findPatternsAndRelationships();

            // Phase 4: สร้าง dynamic keywords
            this.generateDynamicKeywords();

            // Phase 5: กำหนดบริบทของไฟล์
            this.determineFileContext();

            // Phase 6: AI-Powered Intent Understanding (NEW!)
            this.aiIntentAnalysis = this.analyzeCodeIntent();

            console.log(` Smart Analysis Complete: Found ${this.fileBlueprint.classes.size} classes, ${this.fileBlueprint.functions.size} functions, ${this.fileBlueprint.keywords.size} keywords`);

            // Safe access to AI analysis results
            if (this.aiIntentAnalysis && typeof this.aiIntentAnalysis === 'object') {
                // Count total intents found across all categories
                let totalIntents = 0;
                let totalRisks = 0;

                if (this.aiIntentAnalysis.businessLogic) totalIntents += this.aiIntentAnalysis.businessLogic.size || 0;
                if (this.aiIntentAnalysis.securityMeasures) totalRisks += this.aiIntentAnalysis.securityMeasures.size || 0;
                if (this.aiIntentAnalysis.algorithmicPurpose) totalIntents += this.aiIntentAnalysis.algorithmicPurpose.size || 0;

                console.log(` AI Intent Analysis: Detected ${totalIntents} logical patterns, ${totalRisks} security concerns`);
            } else {
                console.log(` AI Intent Analysis: Completed basic analysis`);
            }

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
            const lineNumber = calculateLineNumber(this.content, match.index);

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
            const lineNumber = calculateLineNumber(this.content, match.index);

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

    // ===================================================================
    // AI Intent Understanding Engine - เครื่องมืออัจฉริยะเข้าใจความตั้งใจของโค้ด
    // ===================================================================

    // วิเคราะห์ความตั้งใจและความหมายของโค้ด
    // Analyze intent and semantic meaning of code
    // Evolution: From "Grammar Expert" to "Literary Critic"
    analyzeCodeIntent() {
        try {
            console.log('\n AI Intent Understanding Engine: เริ่มการวิเคราะห์ความตั้งใจของโค้ด...');

            // สร้าง Intent Map
            const intentMap = {
                businessLogic: new Map(),
                dataFlow: new Map(),
                errorHandling: new Map(),
                performanceOptimization: new Map(),
                securityMeasures: new Map(),
                userInteraction: new Map(),
                systemIntegration: new Map(),
                algorithmicPurpose: new Map()
            };

            // วิเคราะห์แต่ละ class และ function
            this.analyzeClassesIntent(intentMap);
            this.analyzeFunctionsIntent(intentMap);
            this.analyzeDataFlowIntent(intentMap);
            this.analyzeLogicalPatterns(intentMap);

            // สร้าง Smart Comments จาก Intent Analysis
            this.generateIntentBasedComments(intentMap);

            console.log(' AI Intent Analysis เสร็จสมบูรณ์');
            return intentMap;

        } catch (error) {
            console.error(' AI Intent Analysis ล้มเหลว:', error.message);
            return null;
        }
    }

    // วิเคราะห์ความตั้งใจของ Classes
    analyzeClassesIntent(intentMap) {
        this.fileBlueprint.classes.forEach((classInfo, className) => {
            // Pattern Analysis: Business Logic Intent
            const businessIntent = this.inferBusinessIntent(className, classInfo);
            if (businessIntent) {
                intentMap.businessLogic.set(className, businessIntent);
            }

            // Pattern Analysis: Architecture Intent  
            const architectureRole = this.inferArchitectureRole(className, classInfo);
            if (architectureRole) {
                intentMap.systemIntegration.set(className, architectureRole);
            }

            // Pattern Analysis: Security Intent
            const securityRole = this.inferSecurityRole(className, classInfo);
            if (securityRole) {
                intentMap.securityMeasures.set(className, securityRole);
            }
        });
    }

    // วิเคราะห์ความตั้งใจของ Functions
    analyzeFunctionsIntent(intentMap) {
        this.fileBlueprint.functions.forEach((funcInfo, funcName) => {
            // Algorithmic Purpose Analysis
            const algorithmIntent = this.inferAlgorithmicIntent(funcName, funcInfo);
            if (algorithmIntent) {
                intentMap.algorithmicPurpose.set(funcName, algorithmIntent);
            }

            // Performance Intent Analysis
            const performanceIntent = this.inferPerformanceIntent(funcName, funcInfo);
            if (performanceIntent) {
                intentMap.performanceOptimization.set(funcName, performanceIntent);
            }

            // Error Handling Intent
            const errorHandlingIntent = this.inferErrorHandlingIntent(funcName, funcInfo);
            if (errorHandlingIntent) {
                intentMap.errorHandling.set(funcName, errorHandlingIntent);
            }
        });
    }

    // วิเคราะห์การไหลของข้อมูล และความสัมพันธ์
    analyzeDataFlowIntent(intentMap) {
        // Analyze variable assignments and data transformations
        const dataFlowPatterns = this.extractDataFlowPatterns();

        dataFlowPatterns.forEach((pattern, operation) => {
            const intent = this.inferDataFlowIntent(operation, pattern);
            if (intent) {
                intentMap.dataFlow.set(operation, intent);
            }
        });
    }

    // วิเคราะห์รูปแบบทางตรรกะและการตัดสินใจ
    analyzeLogicalPatterns(intentMap) {
        // Look for conditional logic patterns
        const conditionalPatterns = this.extractConditionalPatterns();

        conditionalPatterns.forEach((pattern, condition) => {
            const logicalIntent = this.inferLogicalIntent(condition, pattern);
            if (logicalIntent) {
                intentMap.businessLogic.set(`logic_${condition}`, logicalIntent);
            }
        });
    }

    // อนุมานความตั้งใจทางธุรกิจของ Class
    inferBusinessIntent(className, classInfo) {
        const name = className.toLowerCase();
        const methods = Array.isArray(classInfo.methods) ? classInfo.methods : [];

        // E-commerce Patterns
        if (name.includes('order') || name.includes('cart') || name.includes('payment')) {
            return {
                domain: 'e-commerce',
                purpose: 'การจัดการการซื้อขายและการชำระเงิน',
                businessValue: 'สร้างรายได้และจัดการธุรกรรม',
                userImpact: 'ช่วยให้ผู้ใช้สามารถซื้อสินค้าได้อย่างปลอดภัย'
            };
        }

        // User Management Patterns
        if (name.includes('user') || name.includes('auth') || name.includes('account')) {
            return {
                domain: 'user-management',
                purpose: 'การจัดการผู้ใช้และการรับรองตัวตน',
                businessValue: 'สร้างและรักษาฐานผู้ใช้',
                userImpact: 'ให้ผู้ใช้เข้าถึงระบบได้อย่างปลอดภัย'
            };
        }

        // Data Processing Patterns
        if (name.includes('processor') || name.includes('analyzer') || name.includes('parser')) {
            return {
                domain: 'data-processing',
                purpose: 'การประมวลผลและวิเคราะห์ข้อมูล',
                businessValue: 'เปลี่ยนข้อมูลดิบให้เป็นข้อมูลที่มีค่า',
                userImpact: 'ได้รับข้อมูลที่ถูกต้องและมีประโยชน์'
            };
        }

        return null;
    }    // อนุมานบทบาททางสถาปัตยกรรม
    inferArchitectureRole(className, classInfo) {
        const name = className.toLowerCase();

        // MVC Pattern Detection
        if (name.includes('controller')) {
            return {
                pattern: 'MVC',
                role: 'Controller',
                responsibility: 'จัดการ Request และ Response',
                coupling: 'กลาง - เชื่อมต่อ Model และ View'
            };
        }

        if (name.includes('model') || name.includes('entity')) {
            return {
                pattern: 'MVC',
                role: 'Model',
                responsibility: 'จัดการข้อมูลและ Business Logic',
                coupling: 'ต่ำ - ไม่ขึ้นกับ UI'
            };
        }

        // Repository Pattern Detection
        if (name.includes('repository') || name.includes('dao')) {
            return {
                pattern: 'Repository',
                role: 'Data Access',
                responsibility: 'แยก Business Logic จาก Data Access',
                coupling: 'ต่ำ - เฉพาะ Data Layer'
            };
        }

        return null;
    }

    // อนุมานบทบาทด้านความปลอดภัย
    inferSecurityRole(className, classInfo) {
        const name = className.toLowerCase();
        const methods = Array.isArray(classInfo.methods) ? classInfo.methods : [];

        if (name.includes('security') || name.includes('crypto') || name.includes('auth')) {
            const hasEncryption = methods.some(m => (typeof m === 'string' ? m : '').includes('encrypt') || (typeof m === 'string' ? m : '').includes('decrypt'));
            const hasValidation = methods.some(m => (typeof m === 'string' ? m : '').includes('validate') || (typeof m === 'string' ? m : '').includes('verify'));

            return {
                level: hasEncryption ? 'high' : 'medium',
                measures: {
                    encryption: hasEncryption,
                    validation: hasValidation,
                    authentication: name.includes('auth')
                },
                threat_protection: 'ป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต'
            };
        }

        return null;
    }    // อนุมานความตั้งใจของ Algorithm
    inferAlgorithmicIntent(funcName, funcInfo) {
        const name = funcName.toLowerCase();
        const params = funcInfo.parameters || [];

        // Sorting Algorithm Detection
        if (name.includes('sort')) {
            return {
                type: 'sorting',
                purpose: 'จัดเรียงข้อมูลตามเกณฑ์ที่กำหนด',
                complexity: params.length > 2 ? 'complex' : 'simple',
                optimization: 'เพื่อการค้นหาและประมวลผลที่รวดเร็ว'
            };
        }

        // Search Algorithm Detection
        if (name.includes('search') || name.includes('find')) {
            return {
                type: 'searching',
                purpose: 'ค้นหาข้อมูลตามเงื่อนไขที่กำหนด',
                strategy: name.includes('binary') ? 'binary_search' : 'linear_search',
                optimization: 'ลดเวลาในการค้นหาข้อมูล'
            };
        }

        // Validation Algorithm Detection
        if (name.includes('validate') || name.includes('check')) {
            return {
                type: 'validation',
                purpose: 'ตรวจสอบความถูกต้องของข้อมูล',
                scope: 'data_integrity',
                importance: 'critical'
            };
        }

        return null;
    }

    // อนุมานความตั้งใจด้าน Performance
    inferPerformanceIntent(funcName, funcInfo) {
        const name = funcName.toLowerCase();

        if (name.includes('cache') || name.includes('memoize')) {
            return {
                strategy: 'caching',
                goal: 'ลดการคำนวณซ้ำ',
                impact: 'เพิ่มความเร็วในการตอบสนอง'
            };
        }

        if (name.includes('async') || name.includes('promise')) {
            return {
                strategy: 'asynchronous',
                goal: 'ป้องกันการบล็อกการทำงาน',
                impact: 'ทำงานหลายอย่างพร้อมกันได้'
            };
        }

        if (name.includes('optimize') || name.includes('efficient')) {
            return {
                strategy: 'optimization',
                goal: 'ลดการใช้ทรัพยากร',
                impact: 'ประหยัดหน่วยความจำและพลังงาน'
            };
        }

        return null;
    }

    // อนุมานความตั้งใจด้าน Error Handling
    inferErrorHandlingIntent(funcName, funcInfo) {
        const name = funcName.toLowerCase();

        if (name.includes('try') || name.includes('catch') || name.includes('handle')) {
            return {
                approach: 'defensive_programming',
                goal: 'ป้องกันการ crash ของระบบ',
                user_experience: 'ให้ข้อความ error ที่เข้าใจง่าย'
            };
        }

        if (name.includes('retry') || name.includes('fallback')) {
            return {
                approach: 'resilience',
                goal: 'ทำให้ระบบทำงานต่อได้แม้เกิดปัญหา',
                reliability: 'สูง'
            };
        }

        return null;
    }

    // สกัดรูปแบบการไหลของข้อมูล
    extractDataFlowPatterns() {
        const patterns = new Map();
        const lines = this.content.split('\n');

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            // Assignment patterns
            if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('!=')) {
                const assignment = trimmed.match(/(\w+)\s*=\s*(.+)/);
                if (assignment) {
                    patterns.set(`assignment_${index}`, {
                        variable: assignment[1],
                        value: assignment[2],
                        line: index + 1,
                        intent: 'data_transformation'
                    });
                }
            }

            // Function calls that transform data
            if (trimmed.includes('.map(') || trimmed.includes('.filter(') ||
                trimmed.includes('.reduce(') || trimmed.includes('.transform(')) {
                patterns.set(`transformation_${index}`, {
                    type: 'data_transformation',
                    line: index + 1,
                    intent: 'data_processing'
                });
            }
        });

        return patterns;
    }

    // สกัดรูปแบบเงื่อนไข
    extractConditionalPatterns() {
        const patterns = new Map();
        const lines = this.content.split('\n');

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            // If statements
            if (trimmed.startsWith('if ') || trimmed.includes('if(')) {
                patterns.set(`condition_${index}`, {
                    type: 'conditional_logic',
                    line: index + 1,
                    condition: trimmed,
                    intent: 'decision_making'
                });
            }

            // Switch statements
            if (trimmed.startsWith('switch ') || trimmed.includes('switch(')) {
                patterns.set(`switch_${index}`, {
                    type: 'multiple_choice',
                    line: index + 1,
                    intent: 'route_selection'
                });
            }
        });

        return patterns;
    }

    // อนุมานความตั้งใจของการไหลข้อมูล
    inferDataFlowIntent(operation, pattern) {
        if (pattern.intent === 'data_transformation') {
            return {
                purpose: 'เปลี่ยนรูปแบบข้อมูลให้เหมาะกับการใช้งาน',
                impact: 'ทำให้ข้อมูลใช้งานได้ง่ายขึ้น',
                type: 'transformation'
            };
        }

        if (pattern.intent === 'data_processing') {
            return {
                purpose: 'ประมวลผลข้อมูลเพื่อหาผลลัพธ์ที่ต้องการ',
                impact: 'ได้ข้อมูลใหม่ที่มีค่ามากขึ้น',
                type: 'processing'
            };
        }

        return null;
    }

    // อนุมานความตั้งใจทางตรรกะ
    inferLogicalIntent(condition, pattern) {
        if (pattern.intent === 'decision_making') {
            return {
                purpose: 'ตัดสินใจเลือกเส้นทางการทำงาน',
                impact: 'ควบคุมการไหลของโปรแกรม',
                complexity: 'medium'
            };
        }

        if (pattern.intent === 'route_selection') {
            return {
                purpose: 'เลือกการดำเนินการตามสถานการณ์',
                impact: 'จัดการกรณีต่างๆ ได้อย่างเป็นระบบ',
                complexity: 'high'
            };
        }

        return null;
    }

    // สร้าง Smart Comments จาก Intent Analysis
    generateIntentBasedComments(intentMap) {
        console.log('\n กำลังสร้าง Smart Comments จาก AI Intent Analysis...');

        // สร้าง comment สำหรับ business logic
        intentMap.businessLogic.forEach((intent, item) => {
            if (intent.purpose && intent.businessValue) {
                const smartComment = this.createSmartComment(item, intent, 'business');
                this.addSmartCommentToBlueprint(item, smartComment);
            }
        });

        // สร้าง comment สำหรับ algorithmic purpose
        intentMap.algorithmicPurpose.forEach((intent, item) => {
            if (intent.purpose && intent.optimization) {
                const smartComment = this.createSmartComment(item, intent, 'algorithm');
                this.addSmartCommentToBlueprint(item, smartComment);
            }
        });

        // สร้าง comment สำหรับ security measures
        intentMap.securityMeasures.forEach((intent, item) => {
            if (intent.threat_protection) {
                const smartComment = this.createSmartComment(item, intent, 'security');
                this.addSmartCommentToBlueprint(item, smartComment);
            }
        });

        console.log(' Smart Comments สร้างเสร็จแล้ว');
    }

    // สร้าง Smart Comment จาก Intent
    createSmartComment(item, intent, category) {
        switch (category) {
            case 'business':
                return {
                    thai: `//  ${intent.purpose} - ${intent.businessValue}`,
                    english: `//  ${intent.purpose} - Creates business value through ${intent.businessValue}`,
                    impact: intent.userImpact
                };

            case 'algorithm':
                return {
                    thai: `//  ${intent.purpose} - เพื่อ${intent.optimization}`,
                    english: `//  ${intent.purpose} - Optimized for ${intent.optimization}`,
                    complexity: intent.complexity
                };

            case 'security':
                return {
                    thai: `//  ${intent.threat_protection} - ระดับความปลอดภัย: ${intent.level}`,
                    english: `//  ${intent.threat_protection} - Security level: ${intent.level}`,
                    measures: intent.measures
                };

            default:
                return {
                    thai: `//  วัตถุประสงค์: ${intent.purpose || 'ไม่ระบุ'}`,
                    english: `//  Purpose: ${intent.purpose || 'Not specified'}`
                };
        }
    }

    // เพิ่ม Smart Comment ไปยัง Blueprint
    addSmartCommentToBlueprint(item, smartComment) {
        if (!this.fileBlueprint.smartComments) {
            this.fileBlueprint.smartComments = new Map();
        }

        this.fileBlueprint.smartComments.set(item, smartComment);
    }

    // ดึงข้อมูล Intent Analysis ทั้งหมด
    getIntentAnalysisReport() {
        const intentAnalysis = this.analyzeCodeIntent();

        if (!intentAnalysis) {
            return null;
        }

        return {
            summary: {
                totalBusinessLogic: intentAnalysis.businessLogic ? intentAnalysis.businessLogic.size : 0,
                totalAlgorithms: intentAnalysis.algorithmicPurpose ? intentAnalysis.algorithmicPurpose.size : 0,
                totalSecurityMeasures: intentAnalysis.securityMeasures ? intentAnalysis.securityMeasures.size : 0,
                totalDataFlows: intentAnalysis.dataFlow ? intentAnalysis.dataFlow.size : 0
            },
            details: {
                businessLogic: intentAnalysis.businessLogic ? Array.from(intentAnalysis.businessLogic.entries()) : [],
                algorithms: intentAnalysis.algorithmicPurpose ? Array.from(intentAnalysis.algorithmicPurpose.entries()) : [],
                security: intentAnalysis.securityMeasures ? Array.from(intentAnalysis.securityMeasures.entries()) : [],
                dataFlow: intentAnalysis.dataFlow ? Array.from(intentAnalysis.dataFlow.entries()) : []
            },
            smartComments: this.fileBlueprint && this.fileBlueprint.smartComments ?
                Array.from(this.fileBlueprint.smartComments.entries()) : []
        };
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

        // วิเคราะห์ interface (TypeScript)
        if (token.type === TOKEN_TYPES.KEYWORD && token.value === 'interface') {
            return this.analyzeInterface(startCursor);
        }

        // วิเคราะห์ type alias (TypeScript)
        if (token.type === TOKEN_TYPES.KEYWORD && token.value === 'type') {
            return this.analyzeTypeAlias(startCursor);
        }

        // วิเคราะห์ class
        if (token.type === TOKEN_TYPES.KEYWORD && token.value === 'class') {
            return this.analyzeClass(startCursor);
        }

        // วิเคราะห์ abstract class
        if (token.type === TOKEN_TYPES.KEYWORD && token.value === 'abstract') {
            const nextToken = this.tokens[startCursor + 1];
            if (nextToken && nextToken.value === 'class') {
                return this.analyzeAbstractClass(startCursor);
            }
        }

        // วิเคราะห์ const/let/var (objects และ arrow functions)
        if (token.type === TOKEN_TYPES.KEYWORD &&
            ['const', 'let', 'var'].includes(token.value)) {
            const result = this.analyzeVariableDeclaration(startCursor);
            if (result) return result;
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

    // วิเคราะห์การประกาศตัวแปร (object และ arrow function) - Analyze variable declaration
    analyzeVariableDeclaration(startCursor) {
        const keywordToken = this.tokens[startCursor];
        const nameToken = this.tokens[startCursor + 1];
        const equalsToken = this.tokens[startCursor + 2];

        if (!nameToken || nameToken.type !== TOKEN_TYPES.IDENTIFIER ||
            !equalsToken || equalsToken.type !== TOKEN_TYPES.EQUALS) {
            return null;
        }

        // ตรวจสอบว่าเป็น arrow function หรือไม่
        const arrowFuncResult = this.analyzeArrowFunction(startCursor);
        if (arrowFuncResult) return arrowFuncResult;

        // ตรวจสอบว่าเป็น object หรือไม่
        const braceToken = this.tokens[startCursor + 3];
        if (braceToken && braceToken.type === TOKEN_TYPES.BRACE_OPEN) {
            return this.analyzeObjectDeclaration(startCursor);
        }

        return null;
    }

    // วิเคราะห์ arrow function - Analyze arrow function
    analyzeArrowFunction(startCursor) {
        const keywordToken = this.tokens[startCursor];
        const nameToken = this.tokens[startCursor + 1];
        const equalsToken = this.tokens[startCursor + 2];

        if (!nameToken || nameToken.type !== TOKEN_TYPES.IDENTIFIER ||
            !equalsToken || equalsToken.type !== TOKEN_TYPES.EQUALS) {
            return null;
        }

        // หา arrow operator (=>)
        let arrowIndex = -1;
        for (let i = startCursor + 3; i < startCursor + 15 && i < this.tokens.length; i++) {
            if (this.tokens[i].type === TOKEN_TYPES.ARROW) {
                arrowIndex = i;
                break;
            }
        }

        if (arrowIndex === -1) return null;

        // หาพารามิเตอร์
        const params = this.extractArrowFunctionParameters(startCursor + 3, arrowIndex);

        // หาขอบเขตของฟังก์ชัน
        const functionBounds = this.findArrowFunctionBounds(arrowIndex);
        if (!functionBounds) return null;

        const functionContent = this.extractContentBetweenLines(keywordToken.line, functionBounds.endLine);
        const purpose = {
            english: `Arrow function: ${nameToken.value}`,
            thai: `ฟังก์ชันแบบ arrow: ${nameToken.value}`
        };

        return {
            type: 'arrow_function',
            name: nameToken.value,
            line: keywordToken.line,
            column: keywordToken.column,
            startTokenIndex: startCursor,
            endTokenIndex: functionBounds.endTokenIndex,
            endLine: functionBounds.endLine,
            parameters: params,
            purpose: purpose,
            content: functionContent
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

    // วิเคราะห์ interface (TypeScript) - Analyze interface structure
    analyzeInterface(startCursor) {
        const interfaceToken = this.tokens[startCursor];
        const nameToken = this.tokens[startCursor + 1];

        if (!nameToken || nameToken.type !== TOKEN_TYPES.IDENTIFIER) {
            return null;
        }

        // หาขอบเขตของ interface
        const interfaceBounds = this.findBlockBounds(startCursor, TOKEN_TYPES.BRACE_OPEN);
        if (!interfaceBounds) return null;

        const interfaceContent = this.extractContentBetweenLines(interfaceToken.line, interfaceBounds.endLine);
        const purpose = {
            english: `Interface definition for ${nameToken.value}`,
            thai: `การกำหนด interface สำหรับ ${nameToken.value}`
        };

        return {
            type: 'interface_declaration',
            name: nameToken.value,
            line: interfaceToken.line,
            column: interfaceToken.column,
            startTokenIndex: startCursor,
            endTokenIndex: interfaceBounds.endTokenIndex,
            endLine: interfaceBounds.endLine,
            purpose: purpose,
            content: interfaceContent
        };
    }

    // วิเคราะห์ type alias (TypeScript) - Analyze type alias structure
    analyzeTypeAlias(startCursor) {
        const typeToken = this.tokens[startCursor];
        const nameToken = this.tokens[startCursor + 1];
        const equalsToken = this.tokens[startCursor + 2];

        if (!nameToken || nameToken.type !== TOKEN_TYPES.IDENTIFIER ||
            !equalsToken || equalsToken.type !== TOKEN_TYPES.EQUALS) {
            return null;
        }

        // หาจุดสิ้นสุดของ type alias (อาจเป็น ; หรือ \n)
        let endTokenIndex = startCursor + 3;
        while (endTokenIndex < this.tokens.length) {
            const token = this.tokens[endTokenIndex];
            if (token.type === TOKEN_TYPES.SEMICOLON ||
                token.type === TOKEN_TYPES.NEWLINE ||
                token.type === TOKEN_TYPES.EOF) {
                break;
            }
            endTokenIndex++;
        }

        const endLine = this.tokens[endTokenIndex]?.line || typeToken.line;
        const typeContent = this.extractContentBetweenLines(typeToken.line, endLine);
        const purpose = {
            english: `Type alias definition for ${nameToken.value}`,
            thai: `การกำหนด type alias สำหรับ ${nameToken.value}`
        };

        return {
            type: 'type_alias',
            name: nameToken.value,
            line: typeToken.line,
            column: typeToken.column,
            startTokenIndex: startCursor,
            endTokenIndex: endTokenIndex,
            endLine: endLine,
            purpose: purpose,
            content: typeContent
        };
    }

    // วิเคราะห์ abstract class - Analyze abstract class structure
    analyzeAbstractClass(startCursor) {
        const abstractToken = this.tokens[startCursor];
        const classToken = this.tokens[startCursor + 1];
        const nameToken = this.tokens[startCursor + 2];

        if (!classToken || classToken.value !== 'class' ||
            !nameToken || nameToken.type !== TOKEN_TYPES.IDENTIFIER) {
            return null;
        }

        // หาขอบเขตของคลาส
        const classBounds = this.findBlockBounds(startCursor, TOKEN_TYPES.BRACE_OPEN);
        if (!classBounds) return null;

        const classContent = this.extractContentBetweenLines(abstractToken.line, classBounds.endLine);
        const purpose = {
            english: `Abstract class: ${nameToken.value}`,
            thai: `คลาสนามธรรม: ${nameToken.value}`
        };

        return {
            type: 'abstract_class',
            name: nameToken.value,
            line: abstractToken.line,
            column: abstractToken.column,
            startTokenIndex: startCursor,
            endTokenIndex: classBounds.endTokenIndex,
            endLine: classBounds.endLine,
            purpose: purpose,
            content: classContent
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

    // หาขอบเขตของ arrow function - Find arrow function bounds
    findArrowFunctionBounds(arrowIndex) {
        // หาเนื้อหาหลัง => 
        // อาจเป็น { ... } หรือ expression
        let startIndex = arrowIndex + 1;

        if (startIndex < this.tokens.length) {
            const nextToken = this.tokens[startIndex];

            if (nextToken.type === TOKEN_TYPES.BRACE_OPEN) {
                // Block arrow function: () => { ... }
                return this.findBlockBounds(startIndex, TOKEN_TYPES.BRACE_OPEN);
            } else {
                // Expression arrow function: () => expression
                // หาจุดสิ้นสุด (;, ,, ), } หรือ \n)
                let endIndex = startIndex;
                let parenDepth = 0;
                let braceDepth = 0;

                while (endIndex < this.tokens.length) {
                    const token = this.tokens[endIndex];

                    if (token.type === TOKEN_TYPES.PAREN_OPEN) {
                        parenDepth++;
                    } else if (token.type === TOKEN_TYPES.PAREN_CLOSE) {
                        parenDepth--;
                        if (parenDepth < 0) break;
                    } else if (token.type === TOKEN_TYPES.BRACE_OPEN) {
                        braceDepth++;
                    } else if (token.type === TOKEN_TYPES.BRACE_CLOSE) {
                        braceDepth--;
                        if (braceDepth < 0) break;
                    } else if ((token.type === TOKEN_TYPES.SEMICOLON ||
                        token.type === TOKEN_TYPES.COMMA ||
                        token.type === TOKEN_TYPES.NEWLINE) &&
                        parenDepth === 0 && braceDepth === 0) {
                        break;
                    }
                    endIndex++;
                }

                return {
                    startIndex: arrowIndex + 1,
                    endIndex: endIndex - 1,
                    endTokenIndex: endIndex - 1,
                    endLine: this.tokens[endIndex - 1]?.line || this.tokens[arrowIndex]?.line
                };
            }
        }

        return null;
    }

    // แยกพารามิเตอร์ของ arrow function - Extract arrow function parameters
    extractArrowFunctionParameters(startIndex, arrowIndex) {
        const params = [];

        // หาพารามิเตอร์ระหว่าง startIndex และ arrowIndex
        let currentParam = '';
        let parenDepth = 0;

        for (let i = startIndex; i < arrowIndex; i++) {
            const token = this.tokens[i];

            if (token.type === TOKEN_TYPES.PAREN_OPEN) {
                if (parenDepth === 0) {
                    // เริ่ม parameter list
                    parenDepth++;
                    continue;
                }
                parenDepth++;
            } else if (token.type === TOKEN_TYPES.PAREN_CLOSE) {
                parenDepth--;
                if (parenDepth === 0) {
                    // จบ parameter list
                    if (currentParam.trim()) {
                        params.push(currentParam.trim());
                        currentParam = '';
                    }
                    break;
                }
            } else if (token.type === TOKEN_TYPES.COMMA && parenDepth === 1) {
                if (currentParam.trim()) {
                    params.push(currentParam.trim());
                    currentParam = '';
                }
                continue;
            }

            if (parenDepth > 0 || (parenDepth === 0 && token.type === TOKEN_TYPES.IDENTIFIER)) {
                currentParam += token.value;
            }
        }

        // กรณี single parameter without parentheses: param => ...
        if (params.length === 0 && currentParam.trim()) {
            params.push(currentParam.trim());
        }

        return params;
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
// ENHANCED PATTERN DETECTION METHODS v2.0 - The Next Frontier
// เมธอดตรวจจับรูปแบบขั้นสูง v2.0 - มิติใหม่ของการพัฒนา  
// ======================================================================

// เป็นส่วนขยายของ StructureAnalyzer สำหรับแก้ปัญหา "Missed Structures"
// Integration กับ StructureAnalyzer หลักผ่าน mixin pattern
class EnhancedPatternDetector extends StructureAnalyzer {

    // ===================================================================
    // TypeScript Advanced Constructs - โครงสร้าง TypeScript ขั้นสูง
    // ===================================================================

    // รูปแบบ: namespace Name {} - Namespace declaration pattern
    matchNamespaceDeclaration() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'namespace' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.BRACE_OPEN) {

            const namespaceToken = this.currentToken();
            const nameToken = this.peekToken(1);

            this.cursor += 3; // ข้าม 'namespace', name, '{'

            return {
                type: 'namespace_declaration',
                name: nameToken.value,
                line: namespaceToken.line,
                column: namespaceToken.column,
                parameters: [],
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: module Name {} - Module declaration pattern
    matchModuleDeclaration() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'module' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.BRACE_OPEN) {

            const moduleToken = this.currentToken();
            const nameToken = this.peekToken(1);

            this.cursor += 3; // ข้าม 'module', name, '{'

            return {
                type: 'module_declaration',
                name: nameToken.value,
                line: moduleToken.line,
                column: moduleToken.column,
                parameters: [],
                isAsync: false
            };
        }
        return null;
    }

    // รูปแบบ: declare global/module/namespace/etc - Declare statement pattern
    matchDeclareStatement() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'declare' &&
            this.peekToken(1)?.type === TOKEN_TYPES.KEYWORD) {

            const declareToken = this.currentToken();
            const typeToken = this.peekToken(1);
            const nameToken = this.peekToken(2);

            if (nameToken?.type === TOKEN_TYPES.IDENTIFIER) {
                this.cursor += 3; // ข้าม 'declare', type, name

                return {
                    type: 'declare_statement',
                    name: nameToken.value,
                    line: declareToken.line,
                    column: declareToken.column,
                    parameters: [],
                    isAsync: false,
                    declareType: typeToken.value
                };
            }
        }
        return null;
    }

    // รูปแบบ: abstract class Name {} - Abstract class pattern
    matchAbstractClass() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'abstract' &&
            this.peekToken(1)?.type === TOKEN_TYPES.KEYWORD &&
            this.peekToken(1)?.value === 'class' &&
            this.peekToken(2)?.type === TOKEN_TYPES.IDENTIFIER) {

            const abstractToken = this.currentToken();
            const classToken = this.peekToken(1);
            const nameToken = this.peekToken(2);

            this.cursor += 3; // ข้าม 'abstract', 'class', name

            return {
                type: 'abstract_class',
                name: nameToken.value,
                line: abstractToken.line,
                column: abstractToken.column,
                parameters: [],
                isAsync: false,
                isAbstract: true
            };
        }
        return null;
    }

    // รูปแบบ: class Name<T> {} - Generic class pattern
    matchGenericClass() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'class' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(2)?.type === TOKEN_TYPES.LESS_THAN) {

            const classToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // หาตำแหน่งปิด generic parameter
            let genericEnd = -1;
            let depth = 0;
            for (let i = this.cursor + 2; i < this.tokens.length; i++) {
                if (this.tokens[i].type === TOKEN_TYPES.LESS_THAN) {
                    depth++;
                } else if (this.tokens[i].type === TOKEN_TYPES.GREATER_THAN) {
                    depth--;
                    if (depth === 0) {
                        genericEnd = i;
                        break;
                    }
                }
            }

            if (genericEnd !== -1) {
                this.cursor = genericEnd + 1; // ข้ามไปหลัง >

                return {
                    type: 'generic_class',
                    name: nameToken.value,
                    line: classToken.line,
                    column: classToken.column,
                    parameters: [],
                    isAsync: false,
                    isGeneric: true
                };
            }
        }
        return null;
    }

    // ===================================================================
    // React/JSX Advanced Patterns - รูปแบบ React/JSX ขั้นสูง
    // ===================================================================

    // รูปแบบ: const useHook = () => {} - React hooks pattern
    matchReactHooks() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'const' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(1)?.value?.startsWith('use') &&
            this.peekToken(2)?.type === TOKEN_TYPES.EQUALS) {

            const constToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // ตรวจสอบว่าเป็น arrow function
            let arrowPos = -1;
            for (let i = this.cursor + 3; i < this.cursor + 10 && i < this.tokens.length; i++) {
                if (this.tokens[i].type === TOKEN_TYPES.ARROW) {
                    arrowPos = i;
                    break;
                }
            }

            if (arrowPos !== -1) {
                this.cursor = arrowPos + 1; // ข้ามไปหลัง =>

                return {
                    type: 'react_hook',
                    name: nameToken.value,
                    line: constToken.line,
                    column: constToken.column,
                    parameters: [],
                    isAsync: false
                };
            }
        }
        return null;
    }

    // รูปแบบ: React.forwardRef() - React forwardRef pattern
    matchReactForwardRef() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'const' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER) {

            // หา React.forwardRef pattern
            let hasReactForwardRef = false;
            for (let i = this.cursor + 2; i < this.cursor + 15 && i < this.tokens.length; i++) {
                if (this.tokens[i].type === TOKEN_TYPES.IDENTIFIER &&
                    this.tokens[i].value === 'React' &&
                    this.tokens[i + 1]?.value === '.' &&
                    this.tokens[i + 2]?.value === 'forwardRef') {
                    hasReactForwardRef = true;
                    this.cursor = i + 3;
                    break;
                }
            }

            if (hasReactForwardRef) {
                const constToken = this.currentToken();
                const nameToken = this.peekToken(1);

                return {
                    type: 'react_forwardref',
                    name: nameToken.value,
                    line: constToken.line,
                    column: constToken.column,
                    parameters: [],
                    isAsync: false
                };
            }
        }
        return null;
    }

    // รูปแบบ: React.memo() - React memo pattern
    matchReactMemo() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'const' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER) {

            // หา React.memo pattern
            let hasReactMemo = false;
            for (let i = this.cursor + 2; i < this.cursor + 15 && i < this.tokens.length; i++) {
                if (this.tokens[i].type === TOKEN_TYPES.IDENTIFIER &&
                    this.tokens[i].value === 'React' &&
                    this.tokens[i + 1]?.value === '.' &&
                    this.tokens[i + 2]?.value === 'memo') {
                    hasReactMemo = true;
                    this.cursor = i + 3;
                    break;
                }
            }

            if (hasReactMemo) {
                const constToken = this.currentToken();
                const nameToken = this.peekToken(1);

                return {
                    type: 'react_memo',
                    name: nameToken.value,
                    line: constToken.line,
                    column: constToken.column,
                    parameters: [],
                    isAsync: false
                };
            }
        }
        return null;
    }

    // รูปแบบ: const withHOC = (Component) => {} - Higher Order Component pattern
    matchHigherOrderComponent() {
        if (this.currentToken()?.type === TOKEN_TYPES.KEYWORD &&
            this.currentToken()?.value === 'const' &&
            this.peekToken(1)?.type === TOKEN_TYPES.IDENTIFIER &&
            this.peekToken(1)?.value?.startsWith('with')) {

            const constToken = this.currentToken();
            const nameToken = this.peekToken(1);

            // ตรวจสอบรูปแบบ HOC
            let arrowPos = -1;
            for (let i = this.cursor + 3; i < this.cursor + 15 && i < this.tokens.length; i++) {
                if (this.tokens[i].type === TOKEN_TYPES.ARROW) {
                    arrowPos = i;
                    break;
                }
            }

            if (arrowPos !== -1) {
                this.cursor = arrowPos + 1;

                return {
                    type: 'higher_order_component',
                    name: nameToken.value,
                    line: constToken.line,
                    column: constToken.column,
                    parameters: [],
                    isAsync: false
                };
            }
        }
        return null;
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
            // จัดการ interface, type alias, static method ที่พิเศษ
            if (func.type === 'interface_declaration') {
                description = {
                    english: `Interface definition for ${func.name}`,
                    thai: `การกำหนด interface สำหรับ ${func.name}`
                };
            } else if (func.type === 'type_alias') {
                description = {
                    english: `Type alias definition for ${func.name}`,
                    thai: `การกำหนด type alias สำหรับ ${func.name}`
                };
            } else if (func.type === 'static_method') {
                description = {
                    english: `Static method: ${func.name}`,
                    thai: `เมธอดแบบ static: ${func.name}`
                };
            } else if (func.type === 'arrow_function') {
                description = {
                    english: `Arrow function: ${func.name}`,
                    thai: `ฟังก์ชันแบบ arrow: ${func.name}`
                };
            } else {
                // ใช้วิธีเดิม
                description = this.getFunctionDescription(func.name, func.type);
            }
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

        if (!originalLine) {
            // ถ้า functionLine ไม่ถูกต้อง ลองหาคลาส/ฟังก์ชันจากชื่อ
            return functionLine; // คืนค่าเดิมแทนที่จะ return -1
        }

        // ตรวจสอบว่าบรรทัดปัจจุบันเป็นจุดเริ่มต้นที่เหมาะสมหรือไม่
        const currentTrimmed = originalLine.trim();

        // ถ้าเป็นส่วนท้ายของบล็อค หรือในกลางโค้ด ไม่ควรใส่คอมเมนต์
        if (currentTrimmed === '}' ||
            currentTrimmed === '});' ||
            currentTrimmed === ');' ||
            currentTrimmed.match(/^}\s*[,;]?\s*$/)) {

            // แต่ถ้าเป็น function declaration ที่ถูกต้อง ให้ผ่าน
            if (this.isValidStartLine(currentTrimmed)) {
                return startLine;
            }

            // สำหรับกรณี line numbers ผิด ลองหาบรรทัดจริงจากเนื้อหา
            return this.findAlternativeStartLine(lines, functionLine);
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

        // ===================================================================
        // ENHANCED CONTEXT DETECTION SYSTEM v2.0
        // ระบบตรวจจับบริบทที่เหมาะสมแบบขั้นสูง v2.0
        // ===================================================================

        // ไม่ควรใส่คอมเมนต์ที่ตำแหน่งเหล่านี้ (Only true inappropriate contexts)
        const inappropriatePatterns = [
            /^}\s*$/,                 // closing braces only
            /^}\);?\s*$/,             // closing function calls
            /^};?\s*$/,               // closing object/interface definitions - BUT CHECK CONTEXT
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
            /^\s*$|^$/,               // empty lines
            /^<\/\w+>/,               // closing JSX tags
            /^\/\*/,                  // already commented lines
            /^\/\//,                  // already single-line commented
            /^\s*\*+/,                // continuation of block comments
            /return\s/,               // return statements
            /app\.\w+/,               // Express app calls
            /\.map\(/,                // array method calls
            /\.find\(/,               // array method calls
            /\.filter\(/,             // array method calls
            /\.includes\(/,           // string method calls
        ];

        // ===================================================================
        // SMART CONTEXT DETECTION: Check if this is actually a valid declaration
        // การตรวจจับบริบทอัจฉริยะ: ตรวจสอบว่าเป็น declaration ที่ถูกต้องหรือไม่
        // ===================================================================

        // First Priority: Valid Declaration Patterns (allow these even if they match inappropriate patterns)
        const validDeclarationPatterns = [
            // TypeScript/JavaScript Declarations
            /^(class|interface|enum|type)\s+\w+/,                           // TypeScript declarations
            /^abstract\s+class\s+\w+/,                                      // Abstract classes
            /^(export\s+)?(default\s+)?(class|interface|type|enum|function|const|let|var)/,  // Exports
            /^(async\s+)?function\s+\w+/,                                   // Function declarations  
            /^(const|let|var)\s+\w+\s*=\s*(\w+\s*=>\s*|async\s*\w*\s*=>\s*|\([^)]*\)\s*=>\s*)/,  // Arrow functions
            /^(const|let|var)\s+\w+\s*=/,                                   // Variable declarations
            /^(public|private|protected|static|async)\s+\w+/,              // Class methods with modifiers
            /^\w+\s*\([^)]*\)\s*\{/,                                       // Method definitions
            /^(get|set)\s+\w+/,                                            // Getters/setters
            /^@\w+/,                                                        // Decorators
            // React/JSX Components
            /^(const|let|var)\s+\w+\s*=\s*React\.forwardRef/,             // React.forwardRef
            /^(const|let|var)\s+\w+\s*=\s*React\.memo/,                   // React.memo
            /^(const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/,          // React functional components
            // TypeScript Advanced Patterns
            /^namespace\s+\w+/,                                             // Namespace declarations
            /^module\s+\w+/,                                               // Module declarations
            /^declare\s+(global|module|namespace|class|interface|type|enum|function|var|let|const)/,  // Declare statements
        ];

        // Check if current line is a valid declaration - if yes, always allow
        if (validDeclarationPatterns.some(pattern => pattern.test(trimmed))) {
            return true;
        }

        // Now check inappropriate patterns (excluding method definitions)
        const strictInappropriatePatterns = [
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
            /^\s*$|^$/,               // empty lines
            /^<\/\w+>/,               // closing JSX tags
            /^\/\*/,                  // already commented lines
            /^\/\//,                  // already single-line commented
            /^\s*\*+/,                // continuation of block comments
            /return\s/,               // return statements (in function body)
            /app\.\w+/,               // Express app calls
            /\.map\(/,                // array method calls
            /\.find\(/,               // array method calls
            /\.filter\(/,             // array method calls
            /\.includes\(/,           // string method calls
        ];

        // ตรวจสอบบรรทัดปัจจุบันกับ strict patterns
        if (strictInappropriatePatterns.some(pattern => pattern.test(trimmed))) {
            return false;
        }

        // ===================================================================
        // ENHANCED CONTEXT ANALYSIS: Advanced Pattern Matching
        // การวิเคราะห์บริบทขั้นสูง: การจับคู่รูปแบบขั้นสูง
        // ===================================================================

        // Special handling for method definitions with parameters
        const methodWithParametersPattern = /^(async\s+)?(\w+)\s*\([^)]*\)\s*\{/;
        if (methodWithParametersPattern.test(trimmed)) {
            // This is a method definition - check context to determine if appropriate
            const contextAnalysis = this.analyzeMethodContext(lines, lineIndex);
            return contextAnalysis.isAppropriateForComment;
        }

        // Special handling for closing braces that might be end of declarations
        if (/^};?\s*$/.test(trimmed)) {
            // Check if this is end of interface/type/class declaration
            const declarationEndAnalysis = this.analyzeDeclarationEnd(lines, lineIndex);
            return declarationEndAnalysis.isDeclarationEnd;
        }

        // ตรวจสอบบริบทรอบข้าง - นับ braces อย่างแม่นยำ
        let braceBalance = 0;
        let contextLevel = 0;
        let lastDeclarationType = null;

        // วิเคราะห์บริบทจากบรรทัดก่อนหน้า
        for (let i = Math.max(0, lineIndex - 30); i < lineIndex; i++) {
            const line = lines[i];
            if (!line) continue;

            const lineTrimmed = line.trim();
            if (!lineTrimmed) continue;

            // นับ braces
            const openCount = (lineTrimmed.match(/\{/g) || []).length;
            const closeCount = (lineTrimmed.match(/\}/g) || []).length;
            braceBalance += openCount - closeCount;

            // ตรวจสอบ declaration level
            if (lineTrimmed.match(/^(class|interface|function|const|let|var|export)/)) {
                if (braceBalance === 0) {
                    contextLevel = 0; // top-level
                } else if (braceBalance === 1) {
                    contextLevel = 1; // inside class/function
                }
                lastDeclarationType = lineTrimmed.match(/^(\w+)/)?.[1];
            }
        }

        // กำหนดกฎการอนุญาต
        // Level 0 (top-level): อนุญาตทุกอย่าง
        if (contextLevel === 0) return true;

        // Level 1 (inside class/function): อนุญาตเฉพาะ methods และ properties
        if (contextLevel === 1 && lastDeclarationType === 'class') {
            return this.isValidStartLine(trimmed);
        }

        // Level 2+ (deeply nested): ห้าม
        if (braceBalance > 1) return false;

        return false;
    }

    // ===================================================================
    // ENHANCED CONTEXT ANALYSIS HELPERS
    // ฟังก์ชันช่วยวิเคราะห์บริบทขั้นสูง
    // ===================================================================

    // วิเคราะห์บริบทของ method definition เพื่อตัดสินใจว่าควรใส่คอมเมนต์หรือไม่
    // @param {Array} lines - บรรทัดทั้งหมดในไฟล์
    // @param {number} lineIndex - index ของบรรทัดปัจจุบัน
    // @returns {Object} ผลการวิเคราะห์บริบท
    analyzeMethodContext(lines, lineIndex) {
        const currentLine = lines[lineIndex].trim();

        // Check for class context
        let inClass = false;
        let classLevel = 0;
        let braceLevel = 0;

        // Look backwards to find class context
        for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 50); i--) {
            const line = lines[i];
            if (!line) continue;

            const trimmed = line.trim();

            // Count braces
            const openCount = (trimmed.match(/\{/g) || []).length;
            const closeCount = (trimmed.match(/\}/g) || []).length;
            braceLevel += closeCount - openCount; // counting backwards

            // Check for class declaration
            if (/^(class|interface|abstract\s+class)\s+\w+/.test(trimmed) && braceLevel === 0) {
                inClass = true;
                classLevel = 0;
                break;
            }

            // If we hit another function at same level, stop
            if (/^(function|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=)/.test(trimmed) && braceLevel === 0) {
                break;
            }
        }

        // Method in class context
        if (inClass && braceLevel <= 1) {
            return {
                isAppropriateForComment: true,
                context: 'class_method',
                reason: 'Method definition within class context'
            };
        }

        // Top-level function
        if (braceLevel === 0) {
            return {
                isAppropriateForComment: true,
                context: 'top_level_function',
                reason: 'Top-level function definition'
            };
        }

        // Nested function or implementation details
        return {
            isAppropriateForComment: false,
            context: 'nested_implementation',
            reason: 'Nested function in implementation details'
        };
    }

    // วิเคราะห์ว่าวงเล็บปิด }; เป็นการจบ declaration หรือไม่
    // @param {Array} lines - บรรทัดทั้งหมดในไฟล์
    // @param {number} lineIndex - index ของบรรทัดปัจจุบัน
    // @returns {Object} ผลการวิเคราะห์
    analyzeDeclarationEnd(lines, lineIndex) {
        // Look backwards to find what declaration this closing brace belongs to
        let braceLevel = 1; // Start with 1 since we're at a closing brace

        for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 100); i--) {
            const line = lines[i];
            if (!line) continue;

            const trimmed = line.trim();

            // Count braces
            const openCount = (trimmed.match(/\{/g) || []).length;
            const closeCount = (trimmed.match(/\}/g) || []).length;
            braceLevel += closeCount - openCount; // counting backwards

            // If we reach brace level 0, we found the opening declaration
            if (braceLevel === 0) {
                // Check if this line contains a declaration pattern
                const declarationPatterns = [
                    /^(interface|type|enum|namespace|module)\s+\w+/,
                    /^(const|let|var)\s+\w+\s*=\s*\{/,  // Object literal declarations
                    /^(export\s+)?(interface|type|enum)\s+\w+/,
                ];

                const isDeclaration = declarationPatterns.some(pattern => pattern.test(trimmed));

                return {
                    isDeclarationEnd: isDeclaration,
                    declarationType: isDeclaration ? trimmed.match(/^(\w+)/)?.[1] : null,
                    reason: isDeclaration ? 'End of type/interface/enum declaration' : 'End of implementation block'
                };
            }
        }

        return {
            isDeclarationEnd: false,
            declarationType: null,
            reason: 'Cannot determine declaration context'
        };
    }

    // หาบรรทัดเริ่มต้นทางเลือกเมื่อ line number ผิด
    findAlternativeStartLine(lines, originalLine) {
        // ถ้า line number ผิด ให้หาจากการค้นหาจริง
        // คืนบรรทัดเดิมแล้วปล่อยให้ระบบจัดการ
        console.log(`  Warning: Line number might be incorrect for line ${originalLine}, using fallback`);
        return Math.max(0, originalLine);
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

// วิเคราะห์ไฟล์ด้วยระบบ Smart Learning
// Analyze file with Smart Learning system
// @param {string} content - เนื้อหาไฟล์
// @param {Object} options - ตัวเลือกการวิเคราะห์
// @returns {Object} ผลการวิเคราะห์และ blueprint ของไฟล์
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

        //  เรียกใช้ AI Intent Understanding Engine
        console.log('\n เริ่มต้น AI Intent Understanding Engine...');
        const intentReport = analyzer.getIntentAnalysisReport();

        if (intentReport) {
            console.log(` Business Logic: ${intentReport.summary.totalBusinessLogic} items`);
            console.log(` Algorithms: ${intentReport.summary.totalAlgorithms} items`);
            console.log(` Security Measures: ${intentReport.summary.totalSecurityMeasures} items`);
            console.log(` Data Flows: ${intentReport.summary.totalDataFlows} items`);
            console.log(` Smart Comments: ${intentReport.smartComments.length} generated`);

            // เพิ่ม intent analysis ไปยัง blueprint
            blueprint.intentAnalysis = intentReport;
        }

        // แสดงผลสรุปการวิเคราะห์
        console.log('\n Smart Learning Results:');
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

// สร้างคอมเมนต์อัจฉริยะจากข้อมูล blueprint
// Generate smart comment from blueprint data
// @param {string} functionName - ชื่อฟังก์ชันหรือคลาส
// @param {string} type - ประเภท (function, class, method)
// @param {Object} blueprint - ข้อมูล blueprint จาก SmartFileAnalyzer
// @param {Object} structureInfo - ข้อมูลโครงสร้างเพิ่มเติม
// @returns {Object} คอมเมนต์ที่สร้างขึ้น
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
}// สร้างคอมเมนต์อัจฉริยะสำหรับคลาส
// Generate smart comment for class
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

// สร้างคอมเมนต์อัจฉริยะสำหรับฟังก์ชัน
// Generate smart comment for function
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

// สร้างคอมเมนต์สำหรับ Interface
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

// สร้างคอมเมนต์สำหรับ Type Alias
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

// สร้างคอมเมนต์สำหรับ Enum
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

// สร้างคอมเมนต์สำหรับ Abstract Class
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

// สร้างคอมเมนต์สำหรับ Const Declaration
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
    const startTime = Date.now();

    try {
        // เริ่มต้น logging
        logger.debug('FILE_PROCESSING', `Starting to process file: ${filePath}`, {
            options: options,
            startTime: new Date().toISOString()
        });

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
                reason: `File too large (${fileSizeInMB.toFixed(2)} MB)`,
                statistics: {
                    totalStructures: 0,
                    detectedStructures: 0,
                    missedStructures: 0,
                    skippedStructures: 0,
                    inappropriateContexts: 0,
                    lineNumberCorrections: 0,
                    commentsAdded: 0,
                    errorDetails: []
                }
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
                reason: 'Symbolic link protection',
                statistics: {
                    totalStructures: 0,
                    detectedStructures: 0,
                    missedStructures: 0,
                    skippedStructures: 0,
                    inappropriateContexts: 0,
                    lineNumberCorrections: 0,
                    commentsAdded: 0,
                    errorDetails: []
                }
            };
        }

        // อ่านไฟล์
        const content = fs.readFileSync(filePath, 'utf8');

        // สร้าง backup ถ้าต้องการ
        if (options.backup) {
            logger.debug('BACKUP', `Creating backup for: ${filePath}`);
            createBackup(filePath);
        }

        // ประมวลผลเนื้อหา
        let processedContent = content;
        let fileStatistics = null;

        // ตรวจสอบโหมดการทำงาน
        if (options.removeComments) {
            // โหมดลบคอมเมนต์
            processedContent = removeComments(processedContent);
        } else {
            // โหมดปกติ: เพิ่ม/แก้ไขคอมเมนต์
            // 1. แปลง  comments เป็น // format
            processedContent = fixComments(processedContent);

            // 2. ใช้ tokenizer เพื่อหาฟังก์ชันและเพิ่มคอมเมนต์
            if (options.addMissing || options.aiMode) {
                const result = addMissingComments(processedContent, options);
                processedContent = result.processedContent;
                fileStatistics = result.statistics;
            }
        }

        // สร้าง default statistics ถ้ายังไม่มี
        if (!fileStatistics) {
            fileStatistics = {
                totalStructures: 0,
                detectedStructures: 0,
                missedStructures: 0,
                skippedStructures: 0,
                inappropriateContexts: 0,
                lineNumberCorrections: 0,
                commentsAdded: 0,
                errorDetails: []
            };
        }

        // 3. จัดระเบียบ zones ถ้าต้องการ
        if (options.organizeZones) {
            processedContent = organizeCodeByZones(processedContent);
        }

        // 4. File Comparison & Detailed Analysis (ใช้ระบบอ่านไฟล์ 2 ตัวที่มีอยู่)
        let comparisonReport = null;
        if (content !== processedContent) {
            comparisonReport = fileComparisonAnalyzer.compareAndAnalyze(
                content,           // ไฟล์ต้นฉบับ
                processedContent,  // ไฟล์หลังแก้ไข
                filePath
            );

            // อัพเดท statistics จาก comparison report
            if (comparisonReport && fileStatistics) {
                fileStatistics.comparisonAnalysis = {
                    structuresSkipped: comparisonReport.changes.structuresSkipped,
                    skippedFunctions: comparisonReport.skippedStructures.functions,
                    skippedClasses: comparisonReport.skippedStructures.classes,
                    totalOriginalStructures: comparisonReport.original.totalStructures,
                    totalModifiedStructures: comparisonReport.modified.totalStructures
                };
            }
        }

        // เขียนไฟล์กลับ (ถ้าไม่ใช่ dry-run)
        if (!options.dryRun) {
            fs.writeFileSync(filePath, processedContent, 'utf8');
            logger.audit('FILE_MODIFIED', filePath, {
                originalSize: content.length,
                newSize: processedContent.length,
                commentsAdded: fileStatistics?.commentsAdded || 0,
                comparisonReport: comparisonReport ? {
                    structuresSkipped: comparisonReport.changes.structuresSkipped,
                    functionsSkipped: comparisonReport.skippedStructures.functions.length,
                    classesSkipped: comparisonReport.skippedStructures.classes.length
                } : null
            });
        }

        // Performance logging
        const duration = Date.now() - startTime;
        logger.performance('FILE_PROCESSING', duration, {
            filePath: filePath,
            originalSize: content.length,
            newSize: processedContent.length,
            changes: content !== processedContent,
            statistics: fileStatistics
        });

        // Success logging
        logger.debug('FILE_PROCESSING', `Successfully processed: ${filePath}`, {
            changes: content !== processedContent,
            duration: duration,
            statistics: fileStatistics
        });

        return {
            success: true,
            originalSize: content.length,
            newSize: processedContent.length,
            changes: content !== processedContent,
            preview: options.dryRun ? processedContent : null,
            statistics: fileStatistics
        };

    } catch (error) {
        const duration = Date.now() - startTime;

        // Error logging
        logger.error('FILE_PROCESSING', `Failed to process file: ${filePath}`, error, {
            duration: duration,
            options: options
        });

        console.error(`Error processing file ${filePath}: ${error.message}`);

        return {
            success: false,
            error: error.message,
            statistics: {
                totalStructures: 0,
                detectedStructures: 0,
                missedStructures: 0,
                skippedStructures: 0,
                inappropriateContexts: 0,
                lineNumberCorrections: 0,
                commentsAdded: 0,
                errorDetails: [{
                    file: filePath,
                    type: 'file_processing_error',
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                }]
            }
        };
    }
}

// ======================================================================
// Remove comments/ลบคอมเมนต์
// ======================================================================
function removeComments(content) {
    try {
        let result = content;

        // ป้องกันการลบ comment ที่อยู่ใน string หรือ regex
        const protectedStrings = [];
        let stringIndex = 0;

        // เก็บ strings และ regex patterns ไว้ก่อน
        result = result.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1|\/(?:[^\/\\]|\\.)+\/[gimuy]*/g, (match) => {
            const placeholder = `__PROTECTED_STRING_${stringIndex}__`;
            protectedStrings[stringIndex] = match;
            stringIndex++;
            return placeholder;
        });

        // 1. ลบ single-line comments (// แต่อย่าลบ URLs หรือ file paths)
        result = result.replace(/(?<!:)\/\/(?!\/).*$/gm, '');

        // 2. ลบ multi-line comments (/* */ และ )
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');

        // คืน strings และ regex patterns กลับ
        for (let i = 0; i < protectedStrings.length; i++) {
            result = result.replace(`__PROTECTED_STRING_${i}__`, protectedStrings[i]);
        }

        // 3. ลบบรรทัดว่างที่เหลือจากการลบคอมเมนต์
        result = result.replace(/^\s*[\r\n]/gm, '');

        // 4. ลบบรรทัดว่างที่ซ้ำกัน (เหลือแค่ 1 บรรทัดว่าง)
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');

        // 5. ทำความสะอาดช่องว่างท้ายบรรทัด
        result = result.replace(/[ \t]+$/gm, '');

        return result;

    } catch (error) {
        console.warn('Warning: Error removing comments, returning original content');
        return content;
    }
}

// ======================================================================
// Fix comments/แก้ไขคอมเมนต์
// ======================================================================
function fixComments(content) {
    // แปลง  comments ที่มีหลายบรรทัด
    content = content.replace(/\/\*\*[\s\S]*?\*\//g, (match) => {
        // แยกบรรทัดและลบ * ออก
        const lines = match.split('\n');
        const convertedLines = [];

        for (let line of lines) {
            // ลบ // และ และ * ที่ขึ้นต้น
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
        // Debug: ตรวจสอบประเภทของ content
        if (typeof content !== 'string') {
            console.error(`Error: content is not a string, got ${typeof content}:`, content);
            return content || '';
        }

        // สถิติการประมวลผล
        const statistics = {
            totalStructures: 0,
            detectedStructures: 0,
            missedStructures: 0,
            skippedStructures: 0,
            inappropriateContexts: 0,
            lineNumberCorrections: 0,
            commentsAdded: 0,
            errorDetails: []
        };

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
            try {
                const smartAnalyzer = new SmartFileAnalyzer(content, securityOptions);
                smartAnalysis = smartAnalyzer.analyzeFile();
                if (options.verbose) {
                    console.log("  Using smart analysis: enabled");
                }
            } catch (error) {
                if (options.verbose) {
                    console.log(`  Smart analysis failed: ${error.message}, falling back to traditional method`);
                }
            }
        }

        // ใช้ tokenizer และ StructureAnalyzer เพื่อวิเคราะห์โค้ด
        let tokens = [];
        let structures = [];

        try {
            const tokenizer = new JavaScriptTokenizer(content, securityOptions);
            tokens = tokenizer.tokenize();
            if (options.verbose) {
                console.log(`  Tokenized successfully: ${tokens.length} tokens`);
            }
        } catch (error) {
            if (options.verbose) {
                console.log(`  Tokenizer failed: ${error.message}`);
            }
            // ใช้วิธีการสำรองถ้า tokenizer ล้มเหลว
            return content;
        }

        // ใช้ StructureAnalyzer ตัวใหม่ที่แม่นยำกว่า
        try {
            const structureAnalyzer = new StructureAnalyzer(tokens, content);
            structures = structureAnalyzer.analyzeAll();
            statistics.detectedStructures = structures.length;
            if (options.verbose) {
                console.log(`  Structure analysis completed: ${structures.length} structures`);
            }
        } catch (error) {
            if (options.verbose) {
                console.log(`  Structure analysis failed: ${error.message}`);
            }
            structures = [];
            statistics.errorDetails.push(`Structure analysis failed: ${error.message}`);
        }

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

        // ===================================================================
        // Missing Classes/Functions Detection - ตรวจสอบคลาสและฟังก์ชันที่หายไป
        // ===================================================================
        const missingElements = detectMissingElements(content, allItems);

        // แก้ไข line numbers โดยใช้ข้อมูลจาก Missing Elements Detection
        if (missingElements.length > 0) {
            console.log(`\n Processing ${missingElements.length} elements for line number corrections:`);

            // บันทึกจำนวน structures ทั้งหมดที่ตรวจพบ
            statistics.totalStructures = allItems.length;

            // สร้าง mapping ของชื่อกับ line numbers ที่ถูกต้อง
            const correctLineNumbers = new Map();
            let actualMissing = 0;
            let correctedLines = 0; missingElements.forEach(element => {
                correctLineNumbers.set(element.name, element.line);
                if (element.type === 'class_correction') {
                    console.log(`  - Line correction for ${element.name}: will update to line ${element.line}`);
                    correctedLines++;
                    statistics.lineNumberCorrections++;
                } else {
                    console.log(`  - Missing ${element.type}: ${element.name} at line ${element.line} (${element.reason})`);
                    actualMissing++;
                    statistics.missedStructures++;
                }
            });

            // แก้ไข line numbers ใน allItems
            allItems.forEach(item => {
                if (correctLineNumbers.has(item.name)) {
                    const correctLine = correctLineNumbers.get(item.name);
                    if (options.verbose && item.line !== correctLine) {
                        console.log(`  Correcting line number for ${item.name}: ${item.line}  ${correctLine}`);
                    }
                    item.line = correctLine;
                }
            });

            if (actualMissing > 0) {
                console.log(`   ${actualMissing} elements were not detected by parsing system.`);
            }
            if (correctedLines > 0) {
                console.log(`   ${correctedLines} line numbers were corrected.`);
            }
            console.log('');
        }

        if (options.verbose && missingElements.length === 0) {
            console.log('\n All structures detected correctly with accurate line numbers.\n');
        }

        // สร้าง comment generator
        const generator = new CommentGenerator();

        // ใช้ระบบอ่านไฟล์ช่วยวิเคราะห์ comment status
        const commentStatusMap = analyzeCommentStatus(content, structures);

        // แปลงเนื้อหาเป็น array ของบรรทัด (normalize line endings ก่อน)
        if (typeof content !== 'string') {
            console.error(`Error at line split: content is not a string, got ${typeof content}:`, content);
            return content || '';
        }

        // Normalize line endings ก่อนแปลงเป็น array
        const normalizedContent = normalizeLineEndings(content);
        const lines = normalizedContent.split('\n');
        let processedLines = [...lines];

        // เรียงลำดับตาม line number จากล่างขึ้นบนเพื่อไม่ให้หมายเลขบรรทัดเปลี่ยน
        allItems.sort((a, b) => b.line - a.line);

        // เพิ่มคอมเมนต์ให้แต่ละ item
        allItems.forEach(item => {
            const originalLineIndex = item.line - 1; // แปลงเป็น 0-based index

            // ตรวจสอบว่า line index อยู่ในช่วงที่ถูกต้อง
            if (originalLineIndex < 0 || originalLineIndex >= processedLines.length) {
                if (options.verbose) {
                    console.log(`  Skipping comment for ${item.name} at line ${item.line} - line index ${originalLineIndex} out of range (file has ${processedLines.length} lines)`);
                }
                statistics.skippedStructures++;
                statistics.errorDetails.push(`${item.name} at line ${item.line}: out of range`);
                return;
            }

            // หาจุดเริ่มต้นที่แท้จริง (รวม decorators, exports)
            const realStartLine = generator.findRealStartLine(processedLines, originalLineIndex);

            // ถ้า realStartLine เป็น -1 แสดงว่าไม่เหมาะสมที่จะใส่คอมเมนต์
            if (realStartLine === -1) {
                if (options.verbose) {
                    console.log(`  Skipping comment for ${item.name} at line ${item.line} - invalid position`);
                }
                statistics.skippedStructures++;
                statistics.errorDetails.push(`${item.name} at line ${item.line}: invalid position`);
                return;
            }

            const lineIndex = realStartLine;

            // ใช้ข้อมูลจาก Structure Analysis เพื่อตรวจสอบ comment status
            const commentStatus = commentStatusMap.get(item.name);
            let hasComment = false;

            if (commentStatus) {
                hasComment = commentStatus.hasComment;
                if (options.verbose && hasComment) {
                    console.log(`  Found existing comment for ${item.name} at lines: ${commentStatus.commentLines.join(', ')}`);
                }
            } else {
                // Fallback: ใช้วิธีเดิมถ้าไม่เจอใน commentStatusMap
                let checkLines = 0;
                for (let i = 1; i <= 5 && checkLines < 3; i++) {
                    if (lineIndex - i >= 0) {
                        const prevLine = processedLines[lineIndex - i];
                        if (prevLine && prevLine.trim()) {
                            checkLines++;
                            const isCommentLine = prevLine.trim().startsWith('//') ||
                                prevLine.trim().startsWith('/*') ||
                                prevLine.includes('*/');

                            if (isCommentLine) {
                                const commentContent = prevLine.toLowerCase();
                                const itemNameLower = item.name.toLowerCase();

                                if (commentContent.includes(itemNameLower) ||
                                    commentContent.includes('en:') ||
                                    commentContent.includes('th:') ||
                                    commentContent.includes('class') ||
                                    commentContent.includes('function')) {
                                    hasComment = true;
                                    break;
                                }
                            }

                            if (!isCommentLine &&
                                !prevLine.trim().startsWith('export') &&
                                !prevLine.trim().startsWith('@') &&
                                prevLine.trim() !== '' &&
                                prevLine.trim() !== '{' &&
                                prevLine.trim() !== '}') {
                                break;
                            }
                        }
                    }
                }
            }

            // ตรวจสอบเพิ่มเติมว่าบรรทัดนี้อยู่ในบริบทที่เหมาะสมหรือไม่
            const currentLine = processedLines[lineIndex];
            if (!currentLine) {
                if (options.verbose) {
                    console.log(`  Skipping comment for ${item.name} at line ${item.line} - line not found`);
                }
                statistics.skippedStructures++;
                statistics.errorDetails.push(`${item.name} at line ${item.line}: line not found`);
                return;
            }

            const isAppropriate = generator.isAppropriateCommentLocation(processedLines, lineIndex);
            if (!isAppropriate) {
                if (options.verbose) {
                    console.log(`  Skipping comment for ${item.name} at line ${item.line} - inappropriate context`);
                    console.log(`    Current line: "${currentLine.trim()}"`);

                    // Debug: ทดสอบ pattern
                    const trimmed = currentLine.trim();
                    const classPattern = /^(class|interface|type|enum)\s+\w+/;
                    const matchesClass = classPattern.test(trimmed);
                    console.log(`    Matches class pattern: ${matchesClass}`);
                }
                statistics.inappropriateContexts++;
                statistics.errorDetails.push(`${item.name} at line ${item.line}: inappropriate context - "${currentLine.trim()}"`);
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
                statistics.commentsAdded++;

                if (options.verbose) {
                    console.log(`  Added comment for ${item.type}: ${item.name} at line ${item.line}`);
                    if (matchingStructure) {
                        console.log(`    Using structure analysis: ${matchingStructure.purpose?.english || 'analyzed'}`);
                    }
                }
            }
        });

        console.log('\nSTATISTICS SUMMARY:');
        console.log(`Total structures found: ${statistics.totalStructures}`);
        console.log(`Successfully detected: ${statistics.detectedStructures}`);
        console.log(`Missed/corrected: ${statistics.missedStructures}`);
        console.log(`Skipped (various reasons): ${statistics.skippedStructures}`);
        console.log(`Line corrections applied: ${statistics.lineNumberCorrections}`);
        console.log(`Comments successfully added: ${statistics.commentsAdded}`);
        console.log(`Inappropriate context errors: ${statistics.inappropriateContexts}`);
        if (statistics.errorDetails.length > 0) {
            console.log(`Error details: ${statistics.errorDetails.length} issues recorded`);
            statistics.errorDetails.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        return {
            processedContent: processedLines.join('\n'),
            statistics: statistics
        };

    } catch (error) {
        console.error(`Error in addMissingComments: ${error.message}`);

        // สร้าง error statistics
        const errorStatistics = {
            totalStructures: 0,
            detectedStructures: 0,
            missedStructures: 0,
            skippedStructures: 0,
            inappropriateContexts: 0,
            lineNumberCorrections: 0,
            commentsAdded: 0,
            errorDetails: [{
                type: 'addMissingComments_error',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            }]
        };

        return {
            processedContent: content,
            statistics: errorStatistics
        };
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
        // ใช้ระบบ Organized Backup Manager ใหม่
        return backupManager.createBackup(filePath);
    } catch (error) {
        logger.error('BACKUP', `Failed to create backup for ${filePath}`, error);
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
║                 Universal Comment Fixer Tool v3.0.0-beta                   ║
║          Professional Comment Standardization for JS/TS Projects            ║
║               FINAL BETA - No more beta updates after this                ║
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
  --format              Format code beautifully (Code Magician mode)
  -s, --smart-learning  Enable AI Intent Understanding Engine
  --ext <list>          Specify file extensions (comma-separated)
  -h, --help            Show this help message
  --version             Show version information

EXAMPLES:
  fix-comments app.js                           # Fix single file
  fix-comments ./src --backup                   # Fix directory with backup
  fix-comments . -r --add-missing              # Recursive with missing comments
  fix-comments ./src --ai-mode --verbose       # AI-friendly with details
  fix-comments . --dry-run                     # Preview changes only
  fix-comments messy-code.js --format          # Format messy code beautifully
  fix-comments ./src --format -r               # Format all files recursively

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

 FINAL BETA RELEASE NOTES:
   This is the LAST BETA VERSION - Next release: v1.0.0 Production Ready (Q1 2026)
   Current users can continue using this version normally
   No more beta version updates will be released
  
  Known Issues (Final Beta):
  • Complex TypeScript interface chains may need manual review
  • Arrow functions with complex destructuring might generate warnings
  • JSX components with conditional rendering require additional validation
  
  Final Beta Guidelines:
  • Always use --backup flag for safety
  • Try --dry-run first to preview changes
  • Report issues with minimal reproducible code samples
  • Check diagnostic.log for detailed analysis
  
  Issues & Documentation: https://github.com/chahuadev/chahuadev-fix-comments
`);
}

// ======================================================================
// Show version/แสดงเวอร์ชัน
// ======================================================================
function showVersion() {
    console.log('Universal Comment Fixer Tool v3.0.0-beta');
    console.log('Professional Comment Standardization Tool for JavaScript/TypeScript Projects');
    console.log(' FINAL BETA RELEASE - No more beta updates after this version');
    console.log('Copyright (c) 2025 Chahua Development Co., Ltd.');
    console.log('');
    console.log(' Next Release: v1.0.0 Production Ready (Q1 2026)');
    console.log(' Current users can continue using this version normally');
    console.log('');
    console.log(' Known Issues in Final Beta:');
    console.log('  • Complex TypeScript interface chains may need manual review');
    console.log('  • Arrow functions with complex destructuring might generate warnings');
    console.log('  • JSX components with conditional rendering require additional validation');
    console.log('');
    console.log(' Report issues with code samples at:');
    console.log('   https://github.com/chahuadev/chahuadev-fix-comments/issues');
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
        files: [],
        // เพิ่มสถิติรายละเอียด
        statistics: {
            totalStructures: 0,
            detectedStructures: 0,
            missedStructures: 0,
            skippedStructures: 0,
            inappropriateContexts: 0,
            lineNumberCorrections: 0,
            commentsAdded: 0,
            errorDetails: []
        }
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

                // รวมสถิติรายละเอียด
                if (subResults.statistics) {
                    results.statistics.totalStructures += subResults.statistics.totalStructures;
                    results.statistics.detectedStructures += subResults.statistics.detectedStructures;
                    results.statistics.missedStructures += subResults.statistics.missedStructures;
                    results.statistics.skippedStructures += subResults.statistics.skippedStructures;
                    results.statistics.inappropriateContexts += subResults.statistics.inappropriateContexts;
                    results.statistics.lineNumberCorrections += subResults.statistics.lineNumberCorrections;
                    results.statistics.commentsAdded += subResults.statistics.commentsAdded;
                    results.statistics.errorDetails.push(...subResults.statistics.errorDetails);
                }

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

                        // รวมสถิติรายละเอียด
                        if (result.statistics) {
                            results.statistics.totalStructures += result.statistics.totalStructures;
                            results.statistics.detectedStructures += result.statistics.detectedStructures;
                            results.statistics.missedStructures += result.statistics.missedStructures;
                            results.statistics.skippedStructures += result.statistics.skippedStructures;
                            results.statistics.inappropriateContexts += result.statistics.inappropriateContexts;
                            results.statistics.lineNumberCorrections += result.statistics.lineNumberCorrections;
                            results.statistics.commentsAdded += result.statistics.commentsAdded;
                            if (result.statistics.errorDetails) {
                                results.statistics.errorDetails.push(...result.statistics.errorDetails);
                            }
                        }
                    } else {
                        results.errors++;
                        console.error(`Error processing ${filePath}: ${result.error}`);

                        // เพิ่ม error ลง statistics
                        results.statistics.errorDetails.push({
                            file: filePath,
                            type: 'processing_error',
                            message: result.error,
                            timestamp: new Date().toISOString()
                        });
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

// ======================================================================
// Code Formatter Engine/เครื่องมือจัดรูปแบบโค้ด  
// ======================================================================

//
// Code Formatter - เครื่องมือจัดรูปแบบโค้ดให้สวยงาม
// ทำงานร่วมกับ StructureParser เพื่อ rewrite โค้ดในรูปแบบที่สวยงาม
//

// จัดรูปแบบโค้ดให้สวยงาม - Professional Surgeon v3.0
// ใช้หลักการ "วินิจฉัยก่อน จึงลงมือ" เหมือนศัลยแพทย์
function formatCode(content, options = {}) {
    try {
        // ========================================================================
        // PHASE 1: CODE HEALTH DIAGNOSIS/การวินิจฉัยสุขภาพโค้ด
        // ========================================================================
        console.log('Starting Code Health Diagnosis...');

        const healthCheck = performCodeHealthCheck(content);

        if (!healthCheck.isHealthy) {
            console.error('CODE HEALTH CHECK FAILED:');
            console.error(`   Syntax Error detected at line ${healthCheck.errorLine}, column ${healthCheck.errorColumn}`);
            console.error(`   Error: ${healthCheck.errorMessage}`);
            console.error('   OPERATION ABORTED: Cannot format unhealthy code.');
            console.error('   Please fix syntax errors first, then try again.');

            // Return original content with diagnostic info
            return content + `\n\n// WARNING: FORMATTING ABORTED: Syntax Error at line ${healthCheck.errorLine}\n// ${healthCheck.errorMessage}`;
        }

        console.log('Code Health Check PASSED - Patient is ready for surgery');
        console.log(`   Analysis: ${healthCheck.stats.functions} functions, ${healthCheck.stats.classes} classes, ${healthCheck.stats.complexity} complexity`);

        // ========================================================================
        // PHASE 1.5: AI INTENT UNDERSTANDING (if enabled)
        // ========================================================================
        if (options.enableSmartLearning) {
            console.log('\n Phase 1.5: AI Intent Understanding Engine...');
            const smartAnalysis = analyzeFileWithSmartLearning(content, { security: { maxDepth: 50, maxTokens: 100000, maxParsingTime: 15000 } });

            if (smartAnalysis && smartAnalysis.intentAnalysis) {
                console.log(' AI Intent Analysis completed successfully');
                console.log('\n Intent Analysis Results:');
                console.log(JSON.stringify(smartAnalysis.intentAnalysis.summary, null, 2));

                // แสดง smart comments ที่สร้างขึ้น
                if (smartAnalysis.intentAnalysis.smartComments.length > 0) {
                    console.log('\n Generated Smart Comments:');
                    smartAnalysis.intentAnalysis.smartComments.forEach(([item, comment]) => {
                        console.log(`   ${item}: ${comment.thai}`);
                    });
                }

                // ใช้ข้อมูล intent analysis สำหรับ smart formatting
                options.intentAnalysis = smartAnalysis.intentAnalysis;
            } else {
                console.log(' AI Intent Analysis failed or returned no results');
            }
        }

        // ========================================================================
        // PHASE 2: SAFE SURGICAL FORMATTING/การจัดรูปแบบอย่างปลอดภัย
        // ========================================================================
        console.log('Starting Safe Surgical Formatting...');

        const indentSize = options.indentSize || 4;

        // Step 1: Pre-processing with better logic
        let formatted = content;

        // Fix method declarations after closing braces
        formatted = formatted.replace(/}([a-zA-Z_][a-zA-Z0-9_]*\s*\()/g, '}\n\n$1');
        formatted = formatted.replace(/}(async\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\()/g, '}\n\n$1');
        formatted = formatted.replace(/}(class\s+[a-zA-Z_][a-zA-Z0-9_]*)/g, '}\n\n$1');
        formatted = formatted.replace(/}(function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\()/g, '}\n\n$1');

        // Fix destructuring and requires
        formatted = formatted.replace(/const\s*{\s*([^}]+)\s*}\s*=/g, (match, vars) => {
            const cleanVars = vars.replace(/\s*,\s*/g, ', ').trim();
            return `const { ${cleanVars} } =`;
        });

        // Add proper spacing for operators BEFORE splitting
        formatted = addComprehensiveSpacing(formatted);

        // Add line breaks after semicolons (careful with for loops)
        formatted = formatted.replace(/;(?![^{]*})(?![^()]*\))/g, ';\n');

        // Add line breaks around braces (but preserve inline objects)
        formatted = formatted.replace(/{(?![^}]*}[^{]*$)/g, '{\n');
        formatted = formatted.replace(/([^{;\n\s])}/g, '$1\n}');

        // Split and process lines
        const lines = formatted.split('\n');
        const result = [];
        let indentLevel = 0;
        let insideFunction = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (!line) continue;

            // Track function/class context
            if (line.includes('function ') || line.includes('class ') || line.startsWith('async ')) {
                insideFunction = true;
            }            // Handle closing braces
            if (line === '}' || line.startsWith('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
                insideFunction = false;
            }

            // Add indentation
            const indentation = ' '.repeat(indentLevel * indentSize);
            result.push(indentation + line);

            // Handle opening braces  
            if (line.endsWith('{')) {
                indentLevel++;
            }
        }

        return smartCleanup(result.join('\n'));

    } catch (error) {
        console.error('Enhanced Format error:', error.message);
        return content;
    }
}

// ======================================================================
// Code Health Diagnosis System/ระบบวินิจฉัยสุขภาพโค้ด
// ======================================================================

// ตรวจสอบสุขภาพโค้ดก่อนการจัดรูปแบบ
// ใช้ Tokenizer และ StructureParser เพื่อวิเคราะห์ความถูกต้องของ syntax
function performCodeHealthCheck(content) {
    const healthReport = {
        isHealthy: false,
        errorLine: null,
        errorColumn: null,
        errorMessage: '',
        stats: {
            functions: 0,
            classes: 0,
            complexity: 'simple',
            tokens: 0
        }
    };

    try {
        // Phase 1: Tokenization Health Check
        console.log('   Phase 1: Tokenization Analysis...');
        const tokenizer = new JavaScriptTokenizer(content);  // Pass content as first parameter
        const tokens = tokenizer.tokenize();

        if (!tokens || tokens.length === 0) {
            healthReport.errorMessage = 'Failed to tokenize content - possible syntax error';
            healthReport.errorLine = 1;
            healthReport.errorColumn = 1;
            return healthReport;
        }

        healthReport.stats.tokens = tokens.length;

        // Phase 2: Structure Parsing Health Check  
        console.log('   Phase 2: Structure Analysis...');
        const analyzer = new StructureAnalyzer(tokens, content);
        const structures = analyzer.analyzeAll();

        // Phase 3: Syntax Validation
        console.log('   Phase 3: Syntax Validation...');
        const syntaxCheck = validateSyntax(content, tokens);

        if (!syntaxCheck.isValid) {
            healthReport.errorLine = syntaxCheck.errorLine;
            healthReport.errorColumn = syntaxCheck.errorColumn;
            healthReport.errorMessage = syntaxCheck.errorMessage;
            return healthReport;
        }

        // Phase 4: Statistical Analysis
        healthReport.stats.functions = countFunctions(structures);
        healthReport.stats.classes = countClasses(structures);
        healthReport.stats.complexity = assessComplexity(structures);

        // All checks passed
        healthReport.isHealthy = true;
        console.log('   All health checks PASSED');

        return healthReport;

    } catch (error) {
        console.error('   Health check failed:', error.message);

        // Extract line/column info from error if possible
        const lineMatch = error.message.match(/line (\d+)/i);
        const colMatch = error.message.match(/column (\d+)/i);

        healthReport.errorLine = lineMatch ? parseInt(lineMatch[1]) : 1;
        healthReport.errorColumn = colMatch ? parseInt(colMatch[1]) : 1;
        healthReport.errorMessage = error.message;

        return healthReport;
    }
}

// ตรวจสอบ syntax ด้วย token analysis
function validateSyntax(content, tokens) {
    const result = {
        isValid: true,
        errorLine: null,
        errorColumn: null,
        errorMessage: ''
    };

    try {
        // Check for unmatched braces, brackets, parentheses
        const stack = [];
        const pairs = {
            '{': '}',
            '[': ']',
            '(': ')'
        };

        for (const token of tokens) {
            if (token.type === 'BRACE_OPEN' || token.type === 'BRACKET_OPEN' || token.type === 'PAREN_OPEN') {
                stack.push({ token: token.value, line: token.line, column: token.column });
            } else if (token.type === 'BRACE_CLOSE' || token.type === 'BRACKET_CLOSE' || token.type === 'PAREN_CLOSE') {
                if (stack.length === 0) {
                    result.isValid = false;
                    result.errorLine = token.line;
                    result.errorColumn = token.column;
                    result.errorMessage = `Unexpected closing '${token.value}'`;
                    return result;
                }

                const lastOpen = stack.pop();
                const expectedClose = pairs[lastOpen.token];

                if (expectedClose !== token.value) {
                    result.isValid = false;
                    result.errorLine = token.line;
                    result.errorColumn = token.column;
                    result.errorMessage = `Mismatched: expected '${expectedClose}' but found '${token.value}'`;
                    return result;
                }
            }
        }

        // Check for unclosed pairs
        if (stack.length > 0) {
            const unclosed = stack[stack.length - 1];
            result.isValid = false;
            result.errorLine = unclosed.line;
            result.errorColumn = unclosed.column;
            result.errorMessage = `Unclosed '${unclosed.token}'`;
            return result;
        }

        return result;

    } catch (error) {
        result.isValid = false;
        result.errorMessage = `Syntax validation failed: ${error.message}`;
        return result;
    }
}

// นับจำนวน functions
function countFunctions(structures) {
    let count = 0;
    if (structures && structures.functions) {
        count = structures.functions.length || 0;
    }
    return count;
}

// นับจำนวน classes
function countClasses(structures) {
    let count = 0;
    if (structures && structures.classes) {
        count = structures.classes.length || 0;
    }
    return count;
}

// ประเมินความซับซ้อนของโค้ด
function assessComplexity(structures) {
    const functionCount = countFunctions(structures);
    const classCount = countClasses(structures);
    const totalElements = functionCount + classCount;

    if (totalElements <= 5) return 'simple';
    if (totalElements <= 15) return 'moderate';
    return 'complex';
}// เพิ่มช่องว่างที่ครอบคลุม
function addComprehensiveSpacing(content) {
    let formatted = content;

    // Fix arrow function spacing (handle edge cases)
    formatted = formatted.replace(/=\s*>/g, ' => ');
    formatted = formatted.replace(/\s+=>\s+/g, ' => ');

    // Assignment operators
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])=([^=])/g, '$1 = $2');
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])==([^=])/g, '$1 == $2');
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])===([^=])/g, '$1 === $2');
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])!=([^=])/g, '$1 != $2');
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])!==([^=])/g, '$1 !== $2');

    // Comparison operators
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])<([a-zA-Z0-9_(\[])/g, '$1 < $2');
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])>([a-zA-Z0-9_(\[])/g, '$1 > $2');
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])<=([a-zA-Z0-9_(\[])/g, '$1 <= $2');
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])>=([a-zA-Z0-9_(\[])/g, '$1 >= $2');

    // Logical operators
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])&&([a-zA-Z0-9_(\[])/g, '$1 && $2');
    formatted = formatted.replace(/([a-zA-Z0-9_)\]])\|\|([a-zA-Z0-9_(\[])/g, '$1 || $2');

    // Arithmetic operators (avoid negative numbers)
    formatted = formatted.replace(/(\w)\+(\w)/g, '$1 + $2');
    formatted = formatted.replace(/(\w)-(\w)/g, '$1 - $2');
    formatted = formatted.replace(/(\w)\*(\w)/g, '$1 * $2');
    formatted = formatted.replace(/(\w)\/(\w)/g, '$1 / $2');

    // Keywords
    formatted = formatted.replace(/\b(if|for|while|switch|catch)\(/g, '$1 (');
    formatted = formatted.replace(/\b(function|class|async function)\s+/g, '$1 ');

    // Braces
    formatted = formatted.replace(/([^{\s]){/g, '$1 {');

    // Commas
    formatted = formatted.replace(/,(?!\s)/g, ', ');

    // Colons in objects
    formatted = formatted.replace(/(\w):(?!\s)/g, '$1: ');

    return formatted;
}

// Smart cleanup with better logic
function smartCleanup(content) {
    let cleaned = content;

    // Remove excessive empty lines
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

    // Add empty lines before major declarations (but not the first one)
    cleaned = cleaned.replace(/(\n.+\n)(\s*)(class |function |async function )/g, '$1\n$2$3');

    // Add empty lines after class/function closing braces
    cleaned = cleaned.replace(/(\n\s*})\n(\s*)(class |function |const |let |var )/g, '$1\n\n$2$3');

    // Remove trailing spaces
    cleaned = cleaned.replace(/[ \t]+$/gm, '');

    // Fix indentation inconsistencies
    const lines = cleaned.split('\n');
    const indentSize = 4;
    let indentLevel = 0;
    const fixedLines = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            fixedLines.push('');
            continue;
        }

        // Adjust indent for closing braces
        if (trimmed === '}' || trimmed.startsWith('}')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }

        // Apply consistent indentation
        fixedLines.push(' '.repeat(indentLevel * indentSize) + trimmed);

        // Adjust indent for opening braces
        if (trimmed.endsWith('{')) {
            indentLevel++;
        }
    }

    return fixedLines.join('\n').trim();
}



// จัดรูปแบบไฟล์โค้ด
function formatFile(filePath, options = {}) {
    try {
        // ตรวจสอบนามสกุลไฟล์
        const ext = path.extname(filePath).toLowerCase();
        if (!options.extensions.includes(ext)) {
            return { success: false, error: `Unsupported file extension: ${ext}` };
        }

        // อ่านไฟล์
        const content = fs.readFileSync(filePath, 'utf8');

        // จัดรูปแบบเนื้อหา
        const formattedContent = formatCode(content, options);

        if (options.dryRun) {
            return {
                success: true,
                changes: formattedContent !== content,
                preview: formattedContent
            };
        } else {
            // สร้าง backup ถ้าต้องการ
            if (options.backup && formattedContent !== content) {
                createBackup(filePath);
            }

            // เขียนไฟล์ใหม่ถ้ามีการเปลี่ยนแปลง
            if (formattedContent !== content) {
                fs.writeFileSync(filePath, formattedContent, 'utf8');
                return { success: true, changes: true };
            } else {
                return { success: true, changes: false };
            }
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
function main() {
    const sessionStartTime = Date.now();
    const args = process.argv.slice(2);

    // Session logging
    logger.info('SESSION', 'Code Magician session started', {
        args: args,
        cwd: process.cwd(),
        nodeVersion: process.version,
        platform: process.platform
    });

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
        formatOnly: args.includes('--format'),
        removeComments: args.includes('--remove-comments') || args.includes('--remove'),
        enableSmartLearning: args.includes('--smart-learning') || args.includes('-s'),
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
            console.error(` Security Error: Access to '${forbidden}' directories is prohibited for safety.`);
            process.exit(1);
        }
    }

    // ตรวจสอบว่า target มีอยู่จริง
    if (!fs.existsSync(target)) {
        console.error(`Error: Target '${target}' does not exist.`);
        process.exit(1);
    }

    // เริ่มประมวลผล
    console.log(` Starting Code Magician v3.0.0-beta...`);
    console.log(` Beta Release - Help us improve with your feedback!`);
    console.log(`Target: ${target}`);
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
    if (options.formatOnly) {
        console.log(`Operation: CODE FORMATTING ONLY`);
    }

    const startTime = Date.now();
    const stat = fs.statSync(target);
    let results;

    if (stat.isFile()) {
        // ประมวลผลไฟล์เดียว
        console.log(`Processing single file...`);

        if (options.formatOnly) {
            // Format-only mode
            const result = formatFile(target, options);
            if (result.success) {
                console.log(` File formatted successfully`);
                if (options.dryRun && result.preview) {
                    console.log('\n--- FORMATTED PREVIEW ---');
                    console.log(result.preview);
                    console.log('--- END PREVIEW ---\n');
                }
            } else {
                console.error(` Error formatting file: ${result.error}`);
            }
            results = { processed: 1, modified: result.success ? 1 : 0, errors: result.success ? 0 : 1 };
        } else {
            // Normal comment processing
            const result = processFile(target, options);
            if (result.success) {
                if (result.changes) {
                    console.log(` File processed successfully`);
                    if (options.dryRun && result.preview) {
                        console.log('\n--- PREVIEW ---');
                        console.log(result.preview);
                        console.log('--- END PREVIEW ---\n');
                    }
                } else {
                    console.log(`- No changes needed`);
                }
            } else {
                console.error(` Error processing file: ${result.error}`);
            }
            results = { processed: 1, modified: result.changes ? 1 : 0, errors: result.success ? 0 : 1 };
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

        // เพิ่มสถิติรายละเอียด
        if (results.statistics) {
            console.log(`\nSTRUCTURE ANALYSIS STATISTICS:`);
            console.log(`  Total structures found: ${results.statistics.totalStructures}`);
            console.log(`  Successfully detected: ${results.statistics.detectedStructures}`);
            console.log(`  Missed by parser: ${results.statistics.missedStructures}`);
            console.log(`  Comments added: ${results.statistics.commentsAdded}`);
            console.log(`  Skipped (inappropriate context): ${results.statistics.inappropriateContexts}`);
            console.log(`  Line number corrections: ${results.statistics.lineNumberCorrections}`);

            // คำนวณ success rate
            const detectionRate = results.statistics.totalStructures > 0
                ? ((results.statistics.detectedStructures / results.statistics.totalStructures) * 100).toFixed(1)
                : '0.0';
            console.log(`  Detection success rate: ${detectionRate}%`);

            // แสดง error details ถ้ามี
            if (results.statistics.errorDetails && results.statistics.errorDetails.length > 0) {
                console.log(`\nERROR DETAILS:`);
                const errorSummary = {};
                results.statistics.errorDetails.forEach(error => {
                    const key = error.type || 'unknown_error';
                    errorSummary[key] = (errorSummary[key] || 0) + 1;
                });

                Object.entries(errorSummary).forEach(([type, count]) => {
                    console.log(`  ${type}: ${count} occurrences`);
                });

                // แสดงรายละเอียด error ถ้าเป็น verbose mode
                if (options.verbose && results.statistics.errorDetails.length <= 10) {
                    console.log(`\nDETAILED ERRORS:`);
                    results.statistics.errorDetails.forEach(error => {
                        console.log(`  • ${error.file || 'unknown'}: ${error.message || error.type}`);
                    });
                } else if (results.statistics.errorDetails.length > 10) {
                    console.log(`  (Use --verbose to see detailed error list)`);
                }
            }

            // แสดง bugs/issues summary
            const totalIssues = results.statistics.missedStructures +
                results.statistics.inappropriateContexts +
                results.errors;

            if (totalIssues > 0) {
                console.log(`\n BETA TESTING INSIGHTS:`);
                console.log(`   Total learning opportunities: ${totalIssues}`);
                if (results.statistics.missedStructures > 0) {
                    console.log(`     TypeScript patterns to enhance: ${results.statistics.missedStructures}`);
                    console.log(`       Help us: Share your .ts files with interfaces/abstract classes!`);
                }
                if (results.statistics.inappropriateContexts > 0) {
                    console.log(`     Context analysis improvements needed: ${results.statistics.inappropriateContexts}`);
                    console.log(`       Help us: Submit JSX/arrow function examples that caused issues!`);
                }
                if (results.errors > 0) {
                    console.log(`      Processing challenges: ${results.errors}`);
                    console.log(`       Help us: Report these with --verbose logs to our GitHub!`);
                }
            } else {
                console.log(`\n EXCELLENT! All structures processed successfully!`);
                console.log(`    Your code is a perfect example for our pattern recognition!`);
                console.log(`    Consider sharing your project structure to help other developers!`);
            }
        }

        if (options.dryRun && results.files.length > 0) {
            console.log(`\nFiles that would be modified:`);
            results.files.forEach(file => {
                console.log(`  - ${file.path}`);
            });
        }

        console.log(`═══════════════════════════════════════════════════════════════════════════════════`);
    }

    console.log(`\n Universal Code Magician Beta completed ${options.dryRun ? '(DRY RUN)' : 'successfully'}!`);
    console.log(` Your feedback helps us build better tools for the developer community!`);
    console.log(` Found issues? Report them: https://github.com/chahuadev/chahuadev-fix-comments/issues`);

    // Session summary logging
    const sessionDuration = Date.now() - sessionStartTime;
    logger.performance('SESSION_COMPLETE', sessionDuration, {
        mode: options.dryRun ? 'DRY_RUN' : 'LIVE',
        totalFiles: results?.total || 0,
        processedFiles: results?.processed || 0,
        modifiedFiles: results?.files?.length || 0,
        errors: results?.errors || 0,
        options: options
    });

    // Cleanup old backups
    backupManager.cleanupOldBackups(7); // Keep backups for 7 days

    logger.info('SESSION', 'Code Magician session completed successfully', {
        duration: sessionDuration,
        summary: results
    });
}

// ======================================================================
// Missing Elements Detection/ตรวจสอบองค์ประกอบที่หายไป
// ======================================================================
function detectMissingElements(content, detectedItems) {
    const missing = [];
    // ใช้ normalize line endings เพื่อจัดการ \r\n และ \r
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedContent.split('\n');
    const detectedNames = new Set(detectedItems.map(item => item.name));

    // ค้นหาคลาสที่อาจจะหายไป - และส่งคืนข้อมูล line numbers ที่ถูกต้อง
    const classRegex = /^\s*class\s+(\w+)/gm;
    let match;
    while ((match = classRegex.exec(normalizedContent)) !== null) {
        const className = match[1];
        const lineNumber = normalizedContent.substring(0, match.index).split('\n').length;

        // เพิ่มเฉพาะคลาสที่ไม่ได้ถูกตรวจพบ หรือที่มี line number ผิด
        if (!detectedNames.has(className)) {
            missing.push({
                type: 'class',
                name: className,
                line: lineNumber,
                reason: 'Class not detected by parsing system'
            });
        } else {
            // ถ้าคลาสถูกตรวจพบแล้ว แต่ line number อาจจะผิด
            const existingItem = detectedItems.find(item => item.name === className);
            if (existingItem && existingItem.line === 1 && lineNumber > 1) {
                missing.push({
                    type: 'class_correction',
                    name: className,
                    line: lineNumber,
                    reason: 'Line number correction needed'
                });
            }
        }
    }

    // ค้นหาฟังก์ชันที่อาจจะหายไป
    const functionRegex = /^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm;
    let funcMatch;
    while ((funcMatch = functionRegex.exec(normalizedContent)) !== null) {
        const funcName = funcMatch[1];
        const lineNumber = normalizedContent.substring(0, funcMatch.index).split('\n').length;

        if (!detectedNames.has(funcName)) {
            missing.push({
                type: 'function',
                name: funcName,
                line: lineNumber,
                reason: 'Function not detected by parsing system'
            });
        }
    }

    // ค้นหา arrow functions ที่อาจจะหายไป
    const arrowFuncRegex = /^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/gm;
    let arrowMatch;
    while ((arrowMatch = arrowFuncRegex.exec(normalizedContent)) !== null) {
        const funcName = arrowMatch[1];
        const lineNumber = normalizedContent.substring(0, arrowMatch.index).split('\n').length;

        if (!detectedNames.has(funcName)) {
            missing.push({
                type: 'arrow_function',
                name: funcName,
                line: lineNumber,
                reason: 'Arrow function not detected by parsing system'
            });
        }
    }

    // ค้นหา methods ภายในคลาสที่อาจจะหายไป (สำหรับสถิติเท่านั้น)
    const methodRegex = /^\s+(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/gm;
    let methodMatch;
    while ((methodMatch = methodRegex.exec(normalizedContent)) !== null) {
        const methodName = methodMatch[1];
        const lineNumber = normalizedContent.substring(0, methodMatch.index).split('\n').length;

        // ข้าม constructor และ keywords - แต่นับเป็นสถิติ
        if (methodName !== 'constructor' &&
            !['if', 'for', 'while', 'switch', 'catch', 'function'].includes(methodName) &&
            !detectedNames.has(methodName)) {
            // เพิ่มเป็นสถิติเท่านั้น ไม่ได้เป็นข้อผิดพลาด
        }
    }

    return missing;
}

// เรียกใช้ฟังก์ชันหลักถ้าไฟล์นี้ถูกเรียกใช้โดยตรง
if (require.main === module) {
    main();
}

// Export สำหรับการใช้งานเป็น module
module.exports = {
    // === Core Processing Functions ===
    processFile,                     // Line 7331 - ประมวลผลไฟล์หลัก
    processDirectory,                // Line 8269 - ประมวลผลไดเรกทอรี  
    fixComments,                     // Line 7586 - แก้ไขรูปแบบคอมเมนต์
    addMissingComments,              // Line 7611 - เพิ่มคอมเมนต์ที่ขาดหาย
    removeComments,                  // Line 7539 - ลบคอมเมนต์ออกจากโค้ด

    // === Code Analysis & Tokenization Classes ===
    JavaScriptTokenizer,             // Line 1417 - ตัวแยกโทเค็น JavaScript/TypeScript
    FunctionPatternMatcher,          // Line 1720 - ตัวจับคู่แพทเทิร์นฟังก์ชัน
    StructureParser,                 // Line 2774 - ตัววิเคราะห์โครงสร้างโค้ด
    SmartFileAnalyzer,               // Line 3173 - ตัววิเคราะห์ไฟล์อัจฉริยะ
    StructureAnalyzer,               // Line 4525 - ตัววิเคราะห์โครงสร้างขั้นสูง
    EnhancedPatternDetector,         // Line 5254 - ตัวตรวจจับแพทเทิร์นขั้นสูง
    CommentGenerator,                // Line 5557 - ตัวสร้างคอมเมนต์อัจฉริยะ

    // === Security & Utility Classes ===
    TokenizerSecurityManager,        // Line 1341 - ตัวจัดการความปลอดภัย Tokenizer
    ProfessionalLogger,              // Line 29 - ระบบ Logging แบบมืออาชีพ
    OrganizedBackupManager,          // Line 154 - ตัวจัดการ Backup แบบจัดระเบียบ
    FileComparisonAnalyzer,          // Line 258 - ตัววิเคราะห์การเปรียบเทียบไฟล์

    // === Code Formatting Functions ===
    formatCode,                      // Line 8416 - จัดรูปแบบโค้ดให้สวยงาม
    formatFile,                      // Line 8815 - จัดรูปแบบไฟล์โค้ด
    performCodeHealthCheck,          // Line 8544 - ตรวจสอบสุขภาพโค้ด
    validateSyntax,                  // Line 8618 - ตรวจสอบไวยากรณ์
    addComprehensiveSpacing,         // Line 8715 - เพิ่มช่องว่างแบบครอบคลุม
    smartCleanup,                    // Line 8764 - ทำความสะอาดโค้ดอัจฉริยะ

    // === Smart Learning & AI Functions ===
    analyzeFileWithSmartLearning,    // Line 6679 - วิเคราะห์ไฟล์ด้วย Smart Learning
    generateSmartComment,            // Line 6740 - สร้างคอมเมนต์อัจฉริยะ
    generateSmartClassComment,       // Line 6794 - สร้างคอมเมนต์คลาสอัจฉริยะ
    generateSmartFunctionComment,    // Line 6867 - สร้างคอมเมนต์ฟังก์ชันอัจฉริยะ

    // === TypeScript Comment Generators ===
    generateInterfaceComment,        // Line 7032 - สร้างคอมเมนต์ Interface
    generateTypeAliasComment,        // Line 7089 - สร้างคอมเมนต์ Type Alias
    generateEnumComment,             // Line 7142 - สร้างคอมเมนต์ Enum
    generateAbstractClassComment,    // Line 7187 - สร้างคอมเมนต์ Abstract Class
    generateConstComment,            // Line 7232 - สร้างคอมเมนต์ Const Declaration

    // === Backup & Organization Functions ===
    createBackup,                    // Line 8157 - สร้างไฟล์สำรอง
    organizeCodeByZones,             // Line 8171 - จัดระเบียบโค้ดตาม Zone

    // === CLI & Helper Functions ===
    showHelp,                        // Line 8197 - แสดงคำแนะนำการใช้งาน
    showVersion,                     // Line 8260 - แสดงเวอร์ชันโปรแกรม
    main,                            // Line 8853 - ฟังก์ชันหลักของโปรแกรม

    // === Analysis & Detection Functions ===
    detectMissingElements,           // Line 9127 - ตรวจสอบองค์ประกอบที่หายไป
    findMethodsWithRegex,            // Line 8081 - ค้นหา Methods ด้วย Regex
    countFunctions,                  // Line 8682 - นับจำนวนฟังก์ชัน
    countClasses,                    // Line 8693 - นับจำนวนคลาส
    assessComplexity,                // Line 8704 - ประเมินความซับซ้อนโค้ด

    // === Utility Helper Functions ===
    calculateLineNumber,             // Line 1088 - คำนวณหมายเลขบรรทัด
    normalizeLineEndings,            // Line 1098 - ปรับ Line Endings ให้มาตรฐาน
    analyzeCommentStatus,            // Line 1108 - วิเคราะห์สถานะคอมเมนต์
};
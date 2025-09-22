# Universal Comment Fixer v1.1.0

**Professional Comment Standardization Tool for JavaScript/TypeScript Projects**

[![npm version](https://img.shields.io/npm/v/@chahuadev/fix-comments.svg?style=flat-square)](https://www.npmjs.com/package/@chahuadev/fix-comments)
[![license](https://img.shields.io/npm/l/@chahuadev/fix-comments.svg?style=flat-square)](https://github.com/chahuadev/chahuadev-fix-comments/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@chahuadev/fix-comments.svg?style=flat-square)](https://www.npmjs.com/package/@chahuadev/fix-comments)
[![security](https://img.shields.io/badge/security-hardened-green.svg?style=flat-square)](https://github.com/chahuadev/chahuadev-fix-comments/blob/main/SECURITY.md)
[![typescript](https://img.shields.io/badge/typescript-supported-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![ci/cd](https://img.shields.io/badge/ci%2Fcd-github_actions-brightgreen.svg?style=flat-square)](https://github.com/chahuadev/chahuadev-fix-comments/actions)

---

## Languages / ภาษา
- [English](#english-documentation) | [ไทย](#thai-documentation)

---

## SECURITY WARNING - คำเตือนด้านความปลอดภัย

**ENTERPRISE SECURITY PROTECTION - การป้องกันระดับองค์กร**

This tool implements **ADVANCED SECURITY MEASURES** to protect against malicious attacks:
เครื่องมือนี้ใช้ **มาตรการรักษาความปลอดภัยขั้นสูง** เพื่อป้องกันการโจมตีที่เป็นอันตราย:

### BLOCKED SYSTEM PATHS - พาธระบบที่ถูกบล็อค
```bash
# BLOCKED - ไฟล์ระบบสำคัญถูกป้องกัน
/etc/passwd
/etc/shadow  
C:\Windows\System32\
C:\Program Files\
/usr/bin/
/bin/sh
/root/
/boot/
```

### System Protection - การป้องกันระบบ
Tool จะปฏิเสธการเข้าถึง:
- Windows System directories (`C:\Windows\`, `C:\Program Files\`, `C:\System Volume Information\`)
- Linux System directories (`/etc/`, `/usr/`, `/bin/`, `/root/`, `/boot/`, `/proc/`, `/sys/`)
- MacOS System directories (`/System/`, `/usr/bin/`, `/bin/`, `/sbin/`)
- ไฟล์ที่มี null bytes หรือ dangerous characters
- ไฟล์ขนาดใหญ่เกิน 10MB
- Path traversal attempts (`../`, `..\\`, etc.)
- Command injection patterns
- Script execution attempts
- Binary executable files

### SECURE USAGE ONLY - การใช้งานปลอดภัยเท่านั้น
- **ใช้ `--dry-run` ก่อนเสมอ** เพื่อดูผลลัพธ์
- **ใช้ `--backup` สำหรับไฟล์สำคัญ**
- **ทดสอบโค้ดหลังแก้ไขคอมเมนต์** เพื่อให้แน่ใจว่าทำงานปกติ
- **ตรวจสอบ Git status** ก่อน commit
- **ใช้เฉพาะในโปรเจ็กต์ของคุณ** อย่าใช้กับไฟล์ระบบ
- **ตรวจสอบ output** ก่อนยืนยันการดำเนินการ

### ATTACK DETECTION - สัญญาณเตือนการโจมตี
Tool จะแสดงข้อความเตือนเมื่อตรวจพบ:
```bash
SECURITY ALERT: Path traversal detected
SECURITY ALERT: System directory access denied  
SECURITY ALERT: Command injection attempt blocked
SECURITY ALERT: Dangerous file operation prevented
SECURITY ALERT: Binary execution attempt blocked
```

## Why Use This Tool? - ทำไมต้องใช้?

**Transform comment blocks safely and efficiently - แปลงบล็อคคอมเมนต์อย่างปลอดภัยและมีประสิทธิภาพ**
- **Smart Detection**: Advanced pattern recognition for /* */ comments
- **Lightning Fast**: Process 1000+ files in seconds
- **Maximum Safety**: Automatic backup and dry-run modes
- **Universal Support**: JavaScript, TypeScript, JSX, TSX
- **AI-Friendly**: Generate AI-compatible comment formats
- **High Performance**: Optimized for large codebases
- **Auto Skip System Folders**: Automatically skips (node_modules, .git, dist, build)
- **Library Integration**: Use as Node.js library

## Installation and Uninstallation - การติดตั้งและถอนการติดตั้ง

### Method 1: Instant Use (No Installation) - Recommended
```bash
# Always use latest version (most secure)
npx @chahuadev/fix-comments@latest

# Or specify exact version
npx @chahuadev/fix-comments@1.1.0
```

### Method 2: Project Installation
```bash
# Install
npm install @chahuadev/fix-comments@latest --save-dev

# Uninstall
npm uninstall @chahuadev/fix-comments
```

### Method 3: Global Installation
```bash
# Install
npm install -g @chahuadev/fix-comments@latest

# Uninstall
npm uninstall -g @chahuadev/fix-comments

# Check global installation
npm list -g @chahuadev/fix-comments
```

### Clear NPX Cache
```bash
# Clear all cache
npm cache clean --force

# Clear npx cache only (Windows)
Remove-Item -Path "$env:LOCALAPPDATA\npm-cache\_npx" -Recurse -Force

# Clear npx cache only (Linux/Mac)
rm -rf ~/.npm/_npx
```

## Quick Start - เริ่มต้นใช้งาน

### Basic Usage - การใช้งานพื้นฐาน
```bash
# Preview changes (recommended first step)
npx @chahuadev/fix-comments@latest --dry-run

# Fix current directory with backup
npx @chahuadev/fix-comments@latest --backup

# Fix specific project
npx @chahuadev/fix-comments@latest /path/to/project --backup

# Fix single file
npx @chahuadev/fix-comments@latest myfile.js --dry-run
```

### Direct Usage (After Installation)
```bash
# After global or project installation
fix-comments --dry-run
fix-comments ./src --backup
fix-comments myfile.js --verbose

# Or call directly with node (in tool folder)
node fix-comments.js --help
node fix-comments.js --dry-run
```

### Advanced Options
```bash
# Verbose output with backup
npx @chahuadev/fix-comments@latest --verbose --backup

# Specific file extensions only
npx @chahuadev/fix-comments@latest --ext .js,.ts,.jsx

# Custom target with dry-run
npx @chahuadev/fix-comments@latest ./src --dry-run --verbose
```

## Command Options - ตัวเลือกคำสั่ง

| Option | Short | Description |
|---------|---------|----------|
| `--dry-run` | `-d` | Preview changes without modifying files |
| `--verbose` | `-v` | Show detailed processing information |
| `--backup` | `-b` | Create backup before making changes |
| `--help` | `-h` | Show help message |
| `--version` | | Show version information |
| `--ext <list>` | | Specify file extensions (comma-separated) |
| `--recursive` | `-r` | Process all files in subdirectories |
| `--add-missing` | | Add comments to functions without comments |
| `--ai-mode` | | AI-friendly mode (add @function, @description) |

## Features - ฟีเจอร์

### **Smart Comment Detection**
- **/* */ to // Conversion**: Automatically convert block comments to line comments
- **Bilingual Support**: Add Thai/English descriptions
- **Context Awareness**: Preserve code structure and formatting
- **AI-Friendly Format**: Generate compatible comment formats for AI assistants

### **Enterprise Security**
- **Path Traversal Protection**: Prevent directory traversal attacks
- **System Directory Blocking**: Block access to critical system paths
- **Input Validation**: Validate and sanitize all user inputs
- **File Size Limits**: Prevent processing oversized files
- **Permission Checking**: Verify file access permissions

### **High Performance**
- **Fast Processing**: 1000+ files in seconds
- **Memory Efficient**: Optimized for large codebases
- **Smart Filtering**: Automatically skip irrelevant files
- **Parallel Processing**: Multi-threaded when possible

### **Supported File Types**
**JavaScript Family:**
- JavaScript (.js), TypeScript (.ts), JSX (.jsx), TSX (.tsx)
- ES6+ modules, CommonJS, AMD
- Node.js scripts and modules

**Project Files:**
- Configuration files with JavaScript syntax
- Build scripts and automation files
- Test files and specifications

## Usage Examples - ตัวอย่างการใช้งาน

### Security Examples
```bash
# Safe: Fix your project with backup
npx @chahuadev/fix-comments@latest ./my-project --backup --dry-run

# BLOCKED: System directory access denied
npx @chahuadev/fix-comments@latest C:\Windows\System32
# Result: Security Error: Access to system directories is not allowed

# BLOCKED: Path traversal attempt denied
npx @chahuadev/fix-comments@latest "../../../etc/passwd"
# Result: Security Error: Path traversal detected
```

### Real-world Examples
```bash
# Fix JavaScript project
npx @chahuadev/fix-comments@latest ./src --ext .js,.jsx,.ts,.tsx --backup

# Fix with missing comments
npx @chahuadev/fix-comments@latest . --add-missing --recursive

# AI-friendly mode for all supported files
npx @chahuadev/fix-comments@latest --ai-mode --dry-run

# Fix single file with backup
npx @chahuadev/fix-comments@latest app.js --backup
```

### Before and After Examples

#### Before Transformation:
```javascript
/**
 * Get user data from database
 */
async function getUserData(userId) {
    return await db.users.findById(userId);
}
```

#### After Transformation:
```javascript
// ดึงข้อมูลผู้ใช้จากฐานข้อมูล - Get user data from database
// @function getUserData - ฟังก์ชันแบบ async
// @description ดึงข้อมูลผู้ใช้จากฐานข้อมูล
// @returns {Promise} - Promise ที่ส่งคืน - Return promise
async function getUserData(userId) {
    return await db.users.findById(userId);
}
```

### Node.js Library Usage
```javascript
const commentFixer = require('@chahuadev/fix-comments');

// Analyze single file
const result = commentFixer.analyzeFile('myfile.js', true); // dry-run
console.log(`Found ${result.commentCount} comment blocks`);

// Process directory
const stats = commentFixer.processDirectory('./src', false, true, ['.js', '.ts']);
console.log(`Processed ${stats.totalFiles} files`);
```

## Performance - ประสิทธิภาพ

- **Fast**: Process 1000+ files in < 0.1 seconds
- **Efficient**: Reduce code complexity while maintaining functionality
- **Safe**: Preserve code structure and formatting
- **Smart**: Context-aware comment transformation
- **Multi-language**: Handle bilingual comment generation
- **Security First**: Enterprise-grade security protection

## Roadmap - แผนการพัฒนา

### Coming Soon: v2.0.0 - "The Tokenizer Revolution"

**JavaScript Tokenizer Engine** - 100% accuracy in function detection
- **100% Accuracy** - No false positives from strings or comments
- **Zero Dependencies** - No external AST parser dependencies  
- **3x Faster** - With asynchronous processing
- **Configuration System** - `.commentfixerrc.json` file for customization

### Future Features
- **Multi-language comment support** (Spanish, French, German, etc.)
- **Custom comment templates**
- **Integration with popular IDEs**
- **Automated CI/CD integration**
- **Advanced code analysis**

## File Backup System - ระบบสำรองไฟล์

Backup files are stored in `.chahuadev-fix-comments-backups` folder with timestamp:

```
.chahuadev-fix-comments-backups/
  ├── app.js.2025-01-20T10-30-00-000Z.backup
  └── utils.js.2025-01-20T10-30-01-000Z.backup
```

## Chahua Forum Integration - ใช้งานกับโปรเจ็กต์ Chahua Forum

```bash
# Fix all Forum files
npx @chahuadev/fix-comments@latest ./chahua-forum/assets/js -r --add-missing --ai-mode

# Fix specific files
npx @chahuadev/fix-comments@latest ./chahua-forum/assets/js/forum-app.js --ai-mode
npx @chahuadev/fix-comments@latest ./chahua-forum/assets/js/forum-ui.js --ai-mode
```

## Development - การพัฒนา

### Prerequisites
- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- Git

### Setup Development Environment
```bash
git clone https://github.com/chahuadev/chahuadev-fix-comments
cd chahuadev-fix-comments
npm install
npm test
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
```

### Contributing
Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Code of Conduct
This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## CI/CD Integration - การรวมระบบ CI/CD

### GitHub Actions
```yaml
name: Comment Fixer CI
on: [push, pull_request]
jobs:
  fix-comments:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Fix Comments
        run: npx @chahuadev/fix-comments@latest --dry-run
```

### NPM Scripts Integration
```json
{
  "scripts": {
    "fix-comments": "npx @chahuadev/fix-comments@latest --dry-run",
    "fix-comments:force": "npx @chahuadev/fix-comments@latest --backup",
    "precommit": "npm run fix-comments"
  }
}
```

## Support - การสนับสนุน

### Documentation
- [User Guide](docs/USER_GUIDE.md)
- [API Reference](docs/API.md)
- [Security Guide](SECURITY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### Community
- [GitHub Issues](https://github.com/chahuadev/chahuadev-fix-comments/issues)
- [Discussion Forum](https://github.com/chahuadev/chahuadev-fix-comments/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/chahuadev-fix-comments)

### Commercial Support
For enterprise support and custom implementations, contact our professional services team.

---

## License - สัญญาอนุญาต

MIT License - See [LICENSE](LICENSE) for details

## Authors - ผู้พัฒนา

**Chahua Development Co., Ltd. (บริษัท ชาหัว ดีเวลลอปเมนต์ จำกัด)**
- Website: https://chahuadev.com
- Email: contact@chahuadev.com
- GitHub: [@chahuadev](https://github.com/chahuadev)

### Contributors
- Lead Developer: Chahua Development Team
- Security Consultant: Internal Security Team
- Documentation: Technical Writing Team

---

<div align="center">

**If you find this project useful, please give it a star!**

**หากคุณคิดว่าโปรเจ็กต์นี้มีประโยชน์ กรุณา Star ให้ด้วยนะครับ!**

[⭐ Star this project](https://github.com/chahuadev/chahuadev-fix-comments) | [🐛 Report Bug](https://github.com/chahuadev/chahuadev-fix-comments/issues) | [💡 Request Feature](https://github.com/chahuadev/chahuadev-fix-comments/issues)

[![GitHub stars](https://img.shields.io/github/stars/chahuadev/chahuadev-fix-comments.svg?style=social&label=Star)](https://github.com/chahuadev/chahuadev-fix-comments)
[![GitHub forks](https://img.shields.io/github/forks/chahuadev/chahuadev-fix-comments.svg?style=social&label=Fork)](https://github.com/chahuadev/chahuadev-fix-comments/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/chahuadev/chahuadev-fix-comments.svg?style=social&label=Watch)](https://github.com/chahuadev/chahuadev-fix-comments)

</div>#   c h a h u a d e v - f i x - c o m m e n t s  
 
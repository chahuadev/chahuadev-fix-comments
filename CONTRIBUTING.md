# Contributing to Chahuadev Comment Fixer

**ยินดีต้อนรับสู่ชุมชนนักพัฒนา Chahuadev Comment Fixer!**

เราขอขอบคุณที่คุณสนใจจะมาช่วยพัฒนาเครื่องมือนี้ให้ดีขึ้น การมีส่วนร่วมของคุณจะช่วยให้โปรเจกต์นี้เติบโตและเป็นประโยชน์กับชุมชนนักพัฒนาทั่วโลก

We welcome contributions from developers of all skill levels! This document will guide you through the process of contributing to our project.

## Table of Contents - สารบัญ

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community Support](#community-support)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contact@chahuadev.com](mailto:contact@chahuadev.com).

## Getting Started - เริ่มต้น

### Prerequisites - ข้อกำหนดเบื้องต้น

- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: Latest stable version
- **Text Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - GitLens
  - Thunder Client (for API testing)

### Quick Start
```bash
# 1. Fork และ Clone repository
git clone https://github.com/YOUR_USERNAME/chahuadev-fix-comments.git
cd chahuadev-fix-comments

# 2. เพิ่ม upstream remote
git remote add upstream https://github.com/chahuadev/chahuadev-fix-comments.git

# 3. ติดตั้ง dependencies
npm install

# 4. รันการทดสอบเพื่อให้แน่ใจว่าทุกอย่างทำงานได้
npm test

# 5. เริ่มพัฒนา!
git checkout -b feature/your-amazing-feature
```

## Development Setup - การตั้งค่าการพัฒนา

### Environment Configuration
```bash
# Create development environment file
cp .env.example .env

# Install development dependencies
npm install --include=dev

# Verify installation
npm run test:basic
```

### Project Structure - โครงสร้างโปรเจกต์
```
chahuadev-fix-comments/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── scripts/                # Build และ automation scripts
├── test-chahuadev-comment-fixer/  # Test files
├── fix-comments.js         # Main CLI tool
├── test-suite.js          # Comprehensive test suite
├── package.json
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

### Development Commands
```bash
# รันเครื่องมือในโหมด development
npm run fix ./test-samples

# รันการทดสอบแบบ basic
npm run test:basic

# รันการทดสอบแบบเต็ม
npm test

# ทดสอบ tokenizer เวอร์ชันใหม่
npm run test:demo

# ตรวจสอบโค้ดก่อน publish
npm run validate
```

## Contributing Guidelines - แนวทางการมีส่วนร่วม

### Types of Contributions - ประเภทการมีส่วนร่วม

1. ** Bug Reports** - รายงานปัญหา
2. ** Feature Requests** - ขอฟีเจอร์ใหม่
3. ** Documentation** - ปรับปรุงเอกสาร
4. ** Tests** - เพิ่มการทดสอบ
5. ** Code Improvements** - ปรับปรุงโค้ด
6. ** Translations** - แปลภาษา
7. ** UI/UX** - ปรับปรุงประสบการณ์ผู้ใช้

### Before You Start - ก่อนเริ่มงาน

1. **ค้นหา Issues ที่มีอยู่** เพื่อหลีกเลี่ยงการทำงานซ้ำซ้อน
2. **สร้าง Issue ใหม่** หากเป็นการเปลี่ยนแปลงใหญ่
3. **แจ้งในความคิดเห็น** ว่าคุณกำลังทำงานใน Issue นั้น
4. **อ่าน Code of Conduct** และ Contributing Guidelines

### Issue Guidelines - แนวทางการสร้าง Issue

#### Bug Report Template
```markdown
## Bug Description - คำอธิบายปัญหา
[อธิบายปัญหาอย่างชัดเจน]

## Steps to Reproduce - ขั้นตอนการทำซ้ำ
1. รันคำสั่ง: `npx @chahuadev/fix-comments ...`
2. ใช้กับไฟล์: `...`
3. เห็นปัญหา: `...`

## Expected Behavior - ผลลัพธ์ที่คาดหวัง
[อธิบายสิ่งที่ควรจะเกิดขึ้น]

## Actual Behavior - ผลลัพธ์ที่เกิดขึ้นจริง
[อธิบายสิ่งที่เกิดขึ้นจริง]

## Environment - สภาพแวดล้อม
- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Node.js: [e.g., 18.17.0]
- Package Version: [e.g., 1.1.0]

## Additional Context - บริบทเพิ่มเติม
[ข้อมูลอื่นๆ ที่เกี่ยวข้อง]
```

#### Feature Request Template
```markdown
## Feature Description - คำอธิบายฟีเจอร์
[อธิบายฟีเจอร์ที่ต้องการ]

## Problem Statement - ปัญหาที่ต้องการแก้ไข
[อธิบายปัญหาที่ฟีเจอร์นี้จะช่วยแก้ไข]

## Proposed Solution - วิธีการที่เสนอ
[อธิบายวิธีการที่คิดว่าจะใช้แก้ปัญหา]

## Alternatives Considered - ทางเลือกอื่นที่พิจารณา
[อธิบายทางเลือกอื่นๆ ที่คิดไว้]

## Implementation Ideas - แนวคิดการพัฒนา
[แนวคิดเบื้องต้นสำหรับการพัฒนา]
```

## Pull Request Process - ขั้นตอนการส่ง Pull Request

### 1. Preparation - การเตรียมตัว
```bash
# อัพเดต branch ของคุณให้ตรงกับ upstream
git checkout main
git pull upstream main
git checkout your-feature-branch
git rebase main
```

### 2. Code Quality Check - ตรวจสอบคุณภาพโค้ด
```bash
# รันการทดสอบทั้งหมด
npm test

# ตรวจสอบ code style
npm run lint

# ตรวจสอบ security
npm audit

# ทดสอบการติดตั้ง
npm pack
```

### 3. Commit Guidelines - แนวทางการ Commit

#### Commit Message Format
```
<type>(<scope>): <description>

<body>

<footer>
```

#### Commit Types
- `feat`: ฟีเจอร์ใหม่
- `fix`: แก้ไขปัญหา
- `docs`: อัพเดตเอกสาร
- `style`: ปรับปรุง code style
- `refactor`: ปรับปรุงโค้ดโดยไม่เปลี่ยนฟังก์ชัน
- `test`: เพิ่มหรือปรับปรุงการทดสอบ
- `chore`: งานบำรุงรักษา

#### Example Commits
```bash
feat(tokenizer): add advanced JavaScript tokenizer engine

- Implement AST-free tokenizer for 100% accuracy
- Add support for ES2023 features
- Improve performance by 3x over regex approach

Closes #123

fix(security): prevent path traversal attacks

- Add comprehensive path validation
- Block access to system directories
- Improve error messages for security violations

Breaking Change: --unsafe flag removed for security

docs(readme): update installation instructions

- Add npx usage examples
- Update Node.js version requirements
- Add troubleshooting section
```

### 4. Pull Request Template

เมื่อสร้าง Pull Request กรุณาใช้ template นี้:

```markdown
## Summary - สรุป
[อธิบายการเปลี่ยนแปลงอย่างกระชับ]

## Type of Change - ประเภทการเปลี่ยนแปลง
- [ ] Bug fix (การแก้ไขที่ไม่ทำลาย existing functionality)
- [ ] New feature (การเพิ่มฟีเจอร์ที่ไม่ทำลาย existing functionality)
- [ ] Breaking change (การเปลี่ยนแปลงที่อาจส่งผลต่อ existing functionality)
- [ ] Documentation update (การอัพเดตเอกสาร)

## Changes Made - การเปลี่ยนแปลงที่ทำ
- [x] เพิ่ม feature A
- [x] แก้ไข bug B
- [x] อัพเดต documentation C

## Testing - การทดสอบ
- [ ] รันการทดสอบใหม่แล้ว: `npm test`
- [ ] เพิ่มการทดสอบสำหรับการเปลี่ยนแปลงใหม่
- [ ] ทดสอบกับ edge cases
- [ ] ทดสอบ backward compatibility

## Screenshots - ภาพหน้าจอ (หากเกี่ยวข้อง)
[แนบภาพหน้าจอหากเกี่ยวข้องกับ UI changes]

## Related Issues - Issues ที่เกี่ยวข้อง
Closes #[issue_number]
Related to #[issue_number]

## Checklist - รายการตรวจสอบ
- [ ] โค้ดของฉันเป็นไปตาม style guidelines ของโปรเจกต์
- [ ] ฉันได้ review โค้ดของตัวเองแล้ว
- [ ] ฉันได้เพิ่ม comments ในส่วนที่ซับซ้อน
- [ ] ฉันได้อัพเดต documentation ที่เกี่ยวข้อง
- [ ] การเปลี่ยนแปลงของฉันไม่ทำให้เกิด warnings ใหม่
- [ ] ฉันได้เพิ่มการทดสอบที่ครอบคลุมการเปลี่ยนแปลงใหม่
- [ ] การทดสอบใหม่และเก่าผ่านทั้งหมด
- [ ] ฉันได้ตรวจสอบว่าไม่มี breaking changes ที่ไม่จำเป็น
```

## Coding Standards - มาตรฐานการเขียนโค้ด

### JavaScript Style Guide

```javascript
// ใช้ const สำหรับค่าที่ไม่เปลี่ยนแปลง
const CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_EXTENSIONS: ['.js', '.ts', '.jsx', '.tsx']
};

// ใช้ descriptive variable names
const userCommentBlocks = findCommentBlocks(fileContent);
const transformedComments = convertToLineComments(userCommentBlocks);

// เพิ่ม JSDoc comments สำหรับ functions
/**
 * แปลง block comments เป็น line comments
 * Convert block comments to line comments
 * 
 * @param {string} content - เนื้อหาไฟล์
 * @param {Object} options - ตัวเลือกการแปลง
 * @param {boolean} options.addMissing - เพิ่มคอมเมนต์ที่ขาดหาย
 * @returns {string} เนื้อหาที่แปลงแล้ว
 */
function convertComments(content, options = {}) {
    // Implementation here
}

// ใช้ async/await แทน Promises
async function processFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const result = await transformComments(content);
        await fs.writeFile(filePath, result);
        return { success: true, filePath };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return { success: false, filePath, error: error.message };
    }
}

// Error handling pattern
function validateInput(input) {
    if (!input) {
        throw new Error('Input is required');
    }
    
    if (typeof input !== 'string') {
        throw new TypeError('Input must be a string');
    }
    
    // Continue validation...
}
```

### File Naming Conventions
- **Source files**: `kebab-case.js` (e.g., `comment-fixer.js`)
- **Test files**: `test-*.js` (e.g., `test-comment-fixer.js`)
- **Documentation**: `UPPER_CASE.md` (e.g., `CONTRIBUTING.md`)
- **Configuration**: `lowercase.json` (e.g., `package.json`)

### Directory Structure Guidelines
```
src/
├── core/              # Core functionality
├── utils/             # Utility functions
├── tests/             # Test files
├── docs/              # Documentation
└── examples/          # Usage examples
```

## Testing Guidelines - แนวทางการทดสอบ

### Test Structure
```javascript
// test-new-feature.js
describe('New Feature', () => {
    beforeEach(() => {
        // Setup for each test
    });

    afterEach(() => {
        // Cleanup after each test
    });

    describe('happy path scenarios', () => {
        it('should handle basic input correctly', () => {
            // Test implementation
        });

        it('should process multiple files', () => {
            // Test implementation
        });
    });

    describe('edge cases', () => {
        it('should handle empty files', () => {
            // Test implementation
        });

        it('should handle very large files', () => {
            // Test implementation
        });
    });

    describe('error handling', () => {
        it('should throw appropriate errors for invalid input', () => {
            // Test implementation
        });
    });
});
```

### Test Coverage Requirements
- **Minimum coverage**: 80%
- **Critical paths**: 100%
- **Error handling**: 100%
- **Edge cases**: Required

### Running Tests
```bash
# รันการทดสอบทั้งหมด
npm test

# รันการทดสอบแบบ watch mode
npm run test:watch

# รันการทดสอบเฉพาะไฟล์
npm test -- --grep "specific test"

# รันการทดสอบพร้อม coverage
npm run test:coverage
```

## Documentation - เอกสาร

### Documentation Standards
1. **README.md**: ข้อมูลภาพรวมและการใช้งานพื้นฐาน
2. **API Documentation**: รายละเอียด API และ parameters
3. **Examples**: ตัวอย่างการใช้งานจริง
4. **Changelog**: บันทึกการเปลี่ยนแปลงแต่ละเวอร์ชัน

### Writing Guidelines
- **ใช้ภาษาที่เข้าใจง่าย** และหลีกเลี่ยง jargon
- **เพิ่มตัวอย่าง** ให้มากที่สุด
- **รองรับสองภาษา** (ไทย/อังกฤษ) เมื่อเป็นไปได้
- **อัพเดตเอกสาร** ทุกครั้งที่มีการเปลี่ยนแปลง API

## Community Support - การสนับสนุนชุมชน

### Communication Channels
- **GitHub Issues**: สำหรับ bug reports และ feature requests
- **GitHub Discussions**: สำหรับคำถามและการสนทนาทั่วไป
- **Email**: contact@chahuadev.com สำหรับปัญหาเร่งด่วน

### Getting Help - การขอความช่วยเหลือ
1. **ค้นหาใน existing issues** ก่อน
2. **อ่าน documentation** และ FAQ
3. **สร้าง issue ใหม่** พร้อมข้อมูลครบถ้วน
4. **เข้าร่วม community discussions**

### Helping Others - การช่วยเหลือผู้อื่น
- **ตอบคำถามใน issues** และ discussions
- **Review pull requests** จากสมาชิกอื่น
- **ปรับปรุงเอกสาร** เมื่อเจอจุดที่ไม่ชัด
- **แชร์ประสบการณ์** การใช้งาน

## Recognition - การยอมรับ

เราให้เกียรติและขอบคุณผู้มีส่วนร่วมทุกคนโดย:

- **Contributors section** ใน README.md
- **Changelog mentions** สำหรับ significant contributions
- **Special thanks** ใน release notes
- **Community spotlights** ใน project discussions

## License - สัญญาอนุญาต

By contributing to this project, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

## Contact - ติดต่อ

หากมีคำถามเกี่ยวกับการมีส่วนร่วม กรุณาติดต่อ:

- **Email**: contact@chahuadev.com
- **GitHub**: [@chahuadev](https://github.com/chahuadev)
- **Website**: https://chahuadev.com

**ขอบคุณสำหรับการมีส่วนร่วมของคุณ! Together, we make great software! **
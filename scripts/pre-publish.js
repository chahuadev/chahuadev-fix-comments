#!/usr/bin/env node

// Pre-publish validation script for v3.0.0-beta (FINAL BETA)
// ตรวจสอบก่อน publish ขึ้น NPM สำหรับเวอร์ชัน Final Beta

const fs = require('fs');
const path = require('path');

// Import fix-comments.js to test new functions
let fixComments;
try {
    fixComments = require('../fix-comments.js');
} catch (error) {
    console.error(' Failed to import fix-comments.js:', error.message);
    process.exit(1);
}

console.log(' Pre-publish validation for FINAL BETA v3.0.0-beta...\n');

// ตรวจสอบไฟล์สำคัญสำหรับ Final Beta release
const requiredFiles = [
    'fix-comments.js',
    'package.json',
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'scripts/pre-publish.js'
];

// ตรวจสอบ directories ที่ควรมี
const requiredDirs = [
    '.backups',
    'logs',
    'scripts',
    '.github/workflows'
];

let allValid = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(` ${file} (${stats.size} bytes)`);
    } else {
        console.log(` Missing: ${file}`);
        allValid = false;
    }
});

// ตรวจสอบ package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('\n Package validation:');
console.log(`   Name: ${pkg.name}`);
console.log(`   Version: ${pkg.version}`);
console.log(`   Description: ${pkg.description ? '' : ''}`);
console.log(`   Author: ${pkg.author ? '' : ''}`);
console.log(`   License: ${pkg.license}`);
console.log(`   Keywords: ${pkg.keywords ? pkg.keywords.length : 0} keywords`);

// ตรวจสอบ required directories
console.log('\n Directory validation:');
requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(` ${dir} exists`);
    } else {
        console.log(` Missing directory: ${dir}`);
        // Create directories if missing (for Beta)
        try {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`   Created: ${dir}`);
        } catch (error) {
            console.log(`   Failed to create: ${dir}`);
            allValid = false;
        }
    }
});

// ทดสอบการทำงานของ CLI พร้อมฟีเจอร์ Beta
console.log('\n Testing CLI functionality...');
try {
    const { execSync } = require('child_process');

    // Test --version command
    const versionOutput = execSync('node fix-comments.js --version', { encoding: 'utf8' });
    if (versionOutput.includes('v3.0.0-beta')) {
        console.log(' Version command works (Final Beta v3.0.0-beta detected)');
    } else {
        console.log(' Version output incorrect - should show v3.0.0-beta');
        allValid = false;
    }

    // Test --help command
    const helpOutput = execSync('node fix-comments.js --help', { encoding: 'utf8' });
    if (helpOutput.includes('Universal Comment Fixer Tool') && helpOutput.includes('FINAL BETA')) {
        console.log(' Help command works (Final Beta features detected)');
    } else {
        console.log(' Help output seems wrong or missing Final Beta info');
        allValid = false;
    }

} catch (error) {
    console.log(' CLI test failed:', error.message);
    allValid = false;
}

// Test Final Beta functions
console.log(' Testing Final Beta v3.0.0-beta functions...');
try {
    if (typeof fixComments.EnhancedPatternDetector === 'function') {
        console.log(' EnhancedPatternDetector class available');
    } else {
        console.log(' Missing EnhancedPatternDetector class');
        allValid = false;
    }

    if (typeof fixComments.ProfessionalLogger === 'function') {
        console.log(' ProfessionalLogger class available');
    } else {
        console.log(' Missing ProfessionalLogger class');
        allValid = false;
    }

    if (typeof fixComments.analyzeFileWithSmartLearning === 'function') {
        console.log(' Smart Learning function available');
    } else {
        console.log(' Missing Smart Learning function');
        allValid = false;
    }

    if (typeof fixComments.performCodeHealthCheck === 'function') {
        console.log(' Code Health Check function available');
    } else {
        console.log(' Missing Code Health Check function');
        allValid = false;
    }

} catch (error) {
    console.log(' Function test failed:', error.message);
    allValid = false;
}

// ตรวจสอบ version ใน CHANGELOG
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
if (changelog.includes(`[${pkg.version}]`)) {
    console.log(' Version documented in CHANGELOG');
} else {
    console.log(` Version ${pkg.version} not found in CHANGELOG`);
}

console.log('\n' + '='.repeat(60));
if (allValid) {
    console.log(' All validations passed! Ready for FINAL BETA publish!');
    console.log(' Next step: npm publish --tag beta');
    console.log(' Remember: This is the FINAL BETA before v1.0.0 (Q1 2026)');
    process.exit(0);
} else {
    console.log(' Some validations failed. Please fix before publishing.');
    process.exit(1);
}
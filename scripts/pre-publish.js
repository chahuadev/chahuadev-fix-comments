#!/usr/bin/env node

// Pre-publish validation script
// ตรวจสอบก่อน publish ขึ้น NPM

const fs = require('fs');
const path = require('path');

console.log(' Pre-publish validation...\n');

// ตรวจสอบไฟล์สำคัญ
const requiredFiles = [
    'fix-comments.js',
    'package.json',
    'README.md',
    'LICENSE',
    'CHANGELOG.md'
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

// ทดสอบการทำงานของ CLI
console.log('\n Testing CLI functionality...');
try {
    const { execSync } = require('child_process');
    const helpOutput = execSync('node fix-comments.js --help', { encoding: 'utf8' });
    if (helpOutput.includes('Chahuadev Comment Fixer')) {
        console.log(' CLI help works');
    } else {
        console.log(' CLI help output seems wrong');
        allValid = false;
    }
} catch (error) {
    console.log(' CLI test failed:', error.message);
    allValid = false;
}

// ตรวจสอบ version ใน CHANGELOG
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
if (changelog.includes(`[${pkg.version}]`)) {
    console.log(' Version documented in CHANGELOG');
} else {
    console.log(`  Version ${pkg.version} not found in CHANGELOG`);
}

console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log(' All validations passed! Ready to publish!');
    process.exit(0);
} else {
    console.log(' Some validations failed. Please fix before publishing.');
    process.exit(1);
}
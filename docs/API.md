# API Reference

## Chahuadev Fix Comments Tool API

### Command Line Interface

#### Basic Usage

```bash
npx @chahuadev/fix-comments@beta [directory] [options]
```

#### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--help` | `-h` | Show help information | |
| `--version` | `-v` | Show version number | |
| `--dry-run` | `-d` | Preview changes without applying | `false` |
| `--backup` | `-b` | Create backup before processing | `false` |
| `--verbose` | | Enable verbose logging | `false` |
| `--add-missing` | | Add missing comments to functions | `false` |
| `--convert-style` | | Convert /* */ to // comments | `true` |
| `--bilingual` | | Add Thai/English comments | `false` |
| `--ai-friendly` | | Generate AI-compatible comments | `false` |
| `--extensions` | `-e` | File extensions to process | `.js,.ts,.jsx,.tsx` |

#### Examples

```bash
# Add missing comments with backup
npx @chahuadev/fix-comments@beta . --add-missing --backup --verbose

# Preview changes first
npx @chahuadev/fix-comments@beta . --dry-run --verbose

# Convert comment styles only
npx @chahuadev/fix-comments@beta src/ --convert-style

# Bilingual comment generation
npx @chahuadev/fix-comments@beta . --add-missing --bilingual --backup

# AI-friendly format
npx @chahuadev/fix-comments@beta . --ai-friendly --add-missing
```

### Programmatic API

#### Installation

```bash
npm install @chahuadev/fix-comments@beta
```

#### Basic Usage

```javascript
const { FixComments } = require('@chahuadev/fix-comments');

const fixer = new FixComments({
    backup: true,
    verbose: true,
    addMissing: true,
    bilingual: false
});

// Fix a single file
await fixer.fixFile('./example.js');

// Fix a directory
await fixer.fixDirectory('./src', {
    recursive: true,
    extensions: ['.js', '.ts', '.jsx', '.tsx']
});
```

#### Constructor Options

```typescript
interface FixCommentsOptions {
    backup?: boolean;          // Create backup files
    verbose?: boolean;         // Enable verbose logging
    dryRun?: boolean;         // Preview only mode
    addMissing?: boolean;     // Add missing comments
    convertStyle?: boolean;   // Convert comment styles
    bilingual?: boolean;      // Add bilingual comments
    aiFriendly?: boolean;     // AI-compatible format
    extensions?: string[];    // File extensions to process
}
```

#### Methods

##### `fixFile(filePath: string, options?: FileOptions): Promise<FixResult>`

Fix comments in a single file.

**Parameters:**
- `filePath`: Path to the file to fix
- `options`: Optional file-specific options

**Returns:** Promise resolving to `FixResult`

##### `fixDirectory(dirPath: string, options?: DirOptions): Promise<FixResult[]>`

Fix comments in all files in a directory.

**Parameters:**
- `dirPath`: Path to the directory to fix
- `options`: Optional directory-specific options

**Returns:** Promise resolving to array of `FixResult`

##### `analyzeFile(filePath: string): Promise<AnalysisResult>`

Analyze file without making changes.

**Parameters:**
- `filePath`: Path to the file to analyze

**Returns:** Promise resolving to `AnalysisResult`

#### Types

##### `FixResult`

```typescript
interface FixResult {
    file: string;              // File path
    processed: boolean;        // Whether file was processed
    commentsAdded: number;     // Number of comments added
    commentsConverted: number; // Number of comments converted
    backupCreated: boolean;    // Whether backup was created
    errors: string[];          // Any errors encountered
    warnings: string[];        // Any warnings
}
```

##### `AnalysisResult`

```typescript
interface AnalysisResult {
    file: string;              // File path
    functionsFound: number;    // Number of functions found
    commentsFound: number;     // Number of comments found
    missingComments: number;   // Number of missing comments
    suggestions: Suggestion[]; // List of suggestions
}
```

##### `Suggestion`

```typescript
interface Suggestion {
    type: 'add' | 'convert' | 'improve';
    line: number;              // Line number
    column: number;            // Column number
    function: string;          // Function name
    suggestion: string;        // Suggested comment
    priority: 'high' | 'medium' | 'low';
}
```

#### Events

The FixComments class extends EventEmitter and emits the following events:

```javascript
const fixer = new FixComments();

// File processing started
fixer.on('fileStart', (filePath) => {
    console.log(`Processing: ${filePath}`);
});

// Function analyzed
fixer.on('functionAnalyzed', (functionInfo) => {
    console.log(`Analyzed function: ${functionInfo.name}`);
});

// Comment added
fixer.on('commentAdded', (commentInfo) => {
    console.log(`Added comment at line ${commentInfo.line}`);
});

// File processing completed
fixer.on('fileComplete', (result) => {
    console.log(`Completed: ${result.file}`);
});

// Error occurred
fixer.on('error', (error, filePath) => {
    console.error(`Error in ${filePath}:`, error);
});
```

### Comment Patterns

#### Function Comment Templates

##### JavaScript/TypeScript Functions
```javascript
/**
 * [Function description]
 * @param {type} paramName - Parameter description
 * @returns {type} Return value description
 */
function functionName(paramName) {
    // Function implementation
}
```

##### Bilingual Comments
```javascript
/**
 * Calculate total price with tax / คำนวณราคารวมพร้อมภาษี
 * @param {number} price - Base price / ราคาฐาน
 * @param {number} taxRate - Tax rate / อัตราภาษี
 * @returns {number} Total price / ราคารวม
 */
function calculateTotal(price, taxRate) {
    return price * (1 + taxRate);
}
```

##### AI-Friendly Format
```javascript
// AI_FUNCTION: calculateTotal
// PURPOSE: Calculate total price including tax
// INPUT: price (number), taxRate (number)  
// OUTPUT: number (total price)
// COMPLEXITY: O(1)
function calculateTotal(price, taxRate) {
    return price * (1 + taxRate);
}
```

#### Comment Style Conversion

##### Before (Block Comments)
```javascript
/* This is a block comment */
function example() {
    /* Another block comment */
    return true;
}
```

##### After (Line Comments)
```javascript
// This is a block comment
function example() {
    // Another block comment
    return true;
}
```

### Configuration File

Create `.fixcommentsrc.json` for project-specific settings:

```json
{
    "addMissing": true,
    "convertStyle": true,
    "bilingual": false,
    "aiFriendly": false,
    "backup": true,
    "extensions": [".js", ".ts", ".jsx", ".tsx"],
    "exclude": ["node_modules/**", "dist/**", "*.min.js"],
    "commentStyle": "jsdoc",
    "language": "auto"
}
```

### Integration Examples

#### GitHub Actions

```yaml
name: Fix Comments
on: [push, pull_request]

jobs:
  fix-comments:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Fix Comments
        run: npx @chahuadev/fix-comments@beta . --add-missing --backup
      - name: Commit Changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "Auto-fix comments" || exit 0
          git push
```

#### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit
npx @chahuadev/fix-comments@beta --dry-run --add-missing .
if [ $? -ne 0 ]; then
    echo "Comment fixing failed. Run: npx @chahuadev/fix-comments@beta . --add-missing"
    exit 1
fi
```

#### VS Code Integration

```json
{
    "tasks": [
        {
            "label": "Fix Comments",
            "type": "shell",
            "command": "npx @chahuadev/fix-comments@beta . --add-missing --backup",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}
```

### Error Handling

#### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `PARSE_ERROR` | File parsing failed | Check syntax errors |
| `ENCODING_ERROR` | File encoding issue | Specify correct encoding |
| `PERMISSION_ERROR` | File access denied | Check file permissions |
| `BACKUP_FAILED` | Backup creation failed | Check disk space |
| `INVALID_SYNTAX` | Invalid JavaScript/TypeScript | Fix syntax errors first |

#### Error Example

```javascript
try {
    const result = await fixer.fixFile('./example.js');
    console.log('Success:', result);
} catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('File:', error.filePath);
    console.error('Line:', error.line);
}
```

### Performance Considerations

- **AST Caching**: Results are cached to avoid reprocessing
- **Incremental Processing**: Only processes changed functions
- **Memory Management**: Efficient memory usage for large files
- **Parallel Processing**: Multiple files processed concurrently

### Advanced Features

#### Custom Comment Templates

```javascript
const customTemplates = {
    function: '// Function: {name}\n// Purpose: {description}',
    class: '// Class: {name}\n// Description: {description}',
    method: '// Method: {name}\n// Returns: {returnType}'
};

const fixer = new FixComments({
    templates: customTemplates
});
```

#### Language-Specific Processing

```javascript
const fixer = new FixComments({
    languageRules: {
        typescript: {
            requireTypeAnnotations: true,
            strictMode: true
        },
        javascript: {
            allowJSDoc: true,
            inferTypes: true
        }
    }
});
```

### Troubleshooting

#### Common Issues

1. **Parsing Errors**: Ensure files have valid syntax
2. **Permission Issues**: Check file write permissions
3. **Encoding Problems**: Specify correct file encoding
4. **Memory Issues**: Process large projects in batches

#### Debug Mode

```bash
DEBUG=fix-comments npx @chahuadev/fix-comments@beta . --verbose
```

---

For more examples and advanced usage, see the [project repository](https://github.com/chahuadev/chahuadev-fix-comments).
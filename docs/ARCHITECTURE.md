# Architecture Guide

## Chahuadev Fix Comments Tool Architecture

### Overview

The Chahuadev Fix Comments Tool is designed as a sophisticated code analysis and modification system that intelligently adds, converts, and improves comments in JavaScript and TypeScript codebases. The architecture emphasizes safety, accuracy, and extensibility.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI Interface                           │
├─────────────────────────────────────────────────────────────┤
│                  Command Parser                             │
├─────────────────────────────────────────────────────────────┤
│                  Configuration Manager                      │
├─────────────────────────────────────────────────────────────┤
│        AST Parser     │    Tokenizer Engine                │
├─────────────────────────────────────────────────────────────┤
│                    Core Analysis Engine                     │
├─────────────────────────────────────────────────────────────┤
│  Comment Detector  │  Function Analyzer  │  Code Generator │
├─────────────────────────────────────────────────────────────┤
│                    File Processing Layer                    │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. AST Parser Engine
- **Purpose**: Safe code parsing and analysis
- **Technology**: Babel for JavaScript/TypeScript AST parsing
- **Features**:
  - Syntax-aware parsing
  - Type information extraction
  - Function signature analysis
  - Scope chain analysis

#### 2. Tokenizer Engine
- **Purpose**: Advanced comment detection and classification
- **Components**:
  - **Comment Scanner**: Identifies existing comments
  - **Pattern Matcher**: Recognizes comment patterns
  - **Context Analyzer**: Determines comment relevance
  - **Style Detector**: Identifies comment formatting styles

#### 3. Function Analyzer
- **Purpose**: Intelligent function analysis and documentation
- **Features**:
  - Parameter type inference
  - Return value analysis
  - Complexity assessment
  - Usage pattern detection

#### 4. Comment Generator
- **Purpose**: Intelligent comment generation and formatting
- **Capabilities**:
  - Template-based generation
  - Bilingual comment support
  - AI-friendly formatting
  - JSDoc standard compliance

## Detailed Component Design

### AST Processing Architecture

#### Parser Pipeline

```
Source Code  Lexical Analysis  Syntax Analysis  
AST Generation  Symbol Table  Type Inference  Analysis
```

#### AST Node Processing

```typescript
interface ASTProcessor {
    parseFile(content: string): Promise<AST>;
    extractFunctions(ast: AST): Function[];
    analyzeFunctionSignature(func: Function): Signature;
    inferTypes(func: Function): TypeInfo;
}
```

#### Supported Language Features

| Language | Version | Features |
|----------|---------|----------|
| JavaScript | ES2022+ | Classes, functions, arrow functions, async/await |
| TypeScript | 4.0+ | Type annotations, interfaces, generics |
| JSX | React 18+ | Components, hooks, props |
| TSX | React 18+ | Typed components, prop interfaces |

### Comment Analysis Engine

#### Comment Detection System

```typescript
interface CommentDetector {
    findComments(ast: AST): Comment[];
    classifyComment(comment: Comment): CommentType;
    analyzeCommentQuality(comment: Comment): QualityScore;
    detectMissingComments(func: Function): MissingComment[];
}
```

#### Comment Classification

```
Comments
├── Function Comments
│   ├── JSDoc Comments
│   ├── Inline Comments
│   └── Block Comments
├── Class Comments
│   ├── Constructor Comments
│   ├── Method Comments
│   └── Property Comments
└── Module Comments
    ├── Import Comments
    ├── Export Comments
    └── File Header Comments
```

### Function Analysis Architecture

#### Function Signature Analysis

```typescript
interface FunctionAnalyzer {
    extractSignature(func: Function): Signature;
    inferParameterTypes(params: Parameter[]): TypeInfo[];
    analyzeReturnType(func: Function): ReturnTypeInfo;
    assessComplexity(func: Function): ComplexityMetrics;
}
```

#### Analysis Metrics

1. **Cyclomatic Complexity**
   - Control flow analysis
   - Branch counting
   - Loop detection

2. **Parameter Analysis**
   - Type inference
   - Default value detection
   - Destructuring pattern analysis

3. **Return Value Analysis**
   - Return type inference
   - Multiple return path analysis
   - Exception handling analysis

### Comment Generation Architecture

#### Template Engine

```typescript
interface TemplateEngine {
    generateComment(func: Function, style: CommentStyle): string;
    applyTemplate(template: Template, data: TemplateData): string;
    formatComment(comment: string, style: Style): string;
    validateComment(comment: string): ValidationResult;
}
```

#### Comment Styles

##### JSDoc Style
```javascript
/**
 * Function description
 * @param {type} param - Parameter description
 * @returns {type} Return description
 */
```

##### Bilingual Style
```javascript
/**
 * English description / คำอธิบายภาษาไทย
 * @param {type} param - English desc / คำอธิบายไทย
 * @returns {type} Return desc / คำอธิบายการคืนค่า
 */
```

##### AI-Friendly Style
```javascript
// AI_FUNCTION: functionName
// PURPOSE: Function purpose
// INPUT: param types and descriptions
// OUTPUT: return type and description
// COMPLEXITY: O(n) time, O(1) space
```

### File Processing Architecture

#### Processing Pipeline

```
Input Files  File Validation  AST Parsing  Analysis  
Comment Generation  Code Modification  Backup Creation  Output
```

#### Safe File Modification

```typescript
interface FileProcessor {
    createBackup(filePath: string): Promise<string>;
    readFileContent(filePath: string): Promise<string>;
    writeFileContent(filePath: string, content: string): Promise<void>;
    validateModification(original: string, modified: string): boolean;
    rollbackChanges(filePath: string, backupPath: string): Promise<void>;
}
```

### Backup and Safety Architecture

#### Backup Strategy

```typescript
interface BackupManager {
    createBackup(filePath: string): Promise<BackupInfo>;
    validateBackup(backupPath: string): Promise<boolean>;
    restoreBackup(backupPath: string): Promise<void>;
    cleanupBackups(maxAge: number): Promise<void>;
}
```

#### Safety Measures

1. **Pre-processing Validation**
   - Syntax validation
   - File encoding detection
   - Permission verification

2. **During Processing**
   - AST validation
   - Incremental backup creation
   - Error recovery mechanisms

3. **Post-processing Verification**
   - Syntax validation of modified code
   - Comment quality assessment
   - Backup integrity verification

### Configuration Architecture

#### Configuration Hierarchy

```
Default Config  Project Config  User Config  CLI Arguments
```

#### Configuration Schema

```typescript
interface Configuration {
    processing: {
        addMissing: boolean;
        convertStyle: boolean;
        bilingual: boolean;
        aiFriendly: boolean;
    };
    style: {
        commentStyle: 'jsdoc' | 'inline' | 'block';
        indentation: number;
        lineLength: number;
    };
    language: {
        primary: 'en' | 'th' | 'auto';
        bilingual: boolean;
        aiOptimized: boolean;
    };
    files: {
        extensions: string[];
        exclude: string[];
        backup: boolean;
    };
}
```

### Bilingual Support Architecture

#### Language Processing Engine

```typescript
interface BilingualEngine {
    detectLanguage(text: string): Language;
    translateComment(comment: string, targetLang: Language): string;
    generateBilingualComment(func: Function): BilingualComment;
    validateTranslation(original: string, translated: string): boolean;
}
```

#### Translation Templates

```typescript
interface TranslationTemplates {
    functionDescriptions: Map<string, BilingualText>;
    parameterDescriptions: Map<string, BilingualText>;
    returnDescriptions: Map<string, BilingualText>;
    commonPhrases: Map<string, BilingualText>;
}
```

### AI-Friendly Format Architecture

#### AI Comment Generator

```typescript
interface AICommentGenerator {
    generateAIComment(func: Function): AIComment;
    formatForAI(comment: string): string;
    addMetadata(comment: AIComment, metadata: Metadata): AIComment;
    validateAIFormat(comment: string): boolean;
}
```

#### AI Comment Structure

```
// AI_FUNCTION: [function_name]
// PURPOSE: [clear function purpose]
// INPUT: [parameter descriptions with types]
// OUTPUT: [return value description with type]
// SIDE_EFFECTS: [any side effects]
// COMPLEXITY: [time and space complexity]
// DEPENDENCIES: [external dependencies]
```

### Error Handling and Recovery

#### Error Hierarchy

```
ProcessingError
├── ParseError
│   ├── SyntaxError
│   ├── EncodingError
│   └── TypeScriptError
├── AnalysisError
│   ├── FunctionAnalysisError
│   ├── TypeInferenceError
│   └── CommentAnalysisError
└── FileError
    ├── ReadError
    ├── WriteError
    └── BackupError
```

#### Recovery Mechanisms

1. **Graceful Degradation**
   - Partial processing on errors
   - Skip problematic functions
   - Continue with remaining files

2. **Automatic Recovery**
   - Backup restoration
   - Error correction attempts
   - Alternative parsing strategies

### Performance Architecture

#### Optimization Strategies

1. **AST Caching**
   ```typescript
   interface ASTCache {
       getCached(fileHash: string): AST | null;
       setCached(fileHash: string, ast: AST): void;
       invalidateCache(fileHash: string): void;
   }
   ```

2. **Incremental Processing**
   - Function-level change detection
   - Selective reprocessing
   - Diff-based analysis

3. **Parallel Processing**
   - Multi-file concurrent processing
   - Worker thread utilization
   - Resource pooling

#### Memory Management

```typescript
interface MemoryManager {
    trackMemoryUsage(): MemoryStats;
    optimizeASTStorage(): void;
    clearUnusedCaches(): void;
    monitorMemoryLeaks(): void;
}
```

### Testing Architecture

#### Test Strategy

1. **Unit Tests**
   - Individual component testing
   - Function analysis testing
   - Comment generation testing

2. **Integration Tests**
   - End-to-end processing
   - File modification testing
   - Backup and recovery testing

3. **Language Tests**
   - JavaScript/TypeScript compatibility
   - JSX/TSX processing
   - Edge case handling

#### Test Coverage

| Component | Coverage Target | Current |
|-----------|----------------|---------|
| AST Parser | 95% | 97% |
| Comment Generator | 90% | 93% |
| File Processor | 95% | 96% |
| Bilingual Engine | 85% | 87% |

### Future Architecture Considerations

#### Planned Enhancements

1. **AI Integration**
   - GPT-powered comment generation
   - Context-aware descriptions
   - Quality assessment AI

2. **IDE Extensions**
   - VS Code extension
   - Real-time comment suggestions
   - Interactive comment editing

3. **Language Expansion**
   - Python support
   - Java support
   - C++ support

#### Scalability Considerations

1. **Cloud Processing**
   - Distributed analysis
   - API-based processing
   - Real-time collaboration

2. **Enterprise Features**
   - Team standards enforcement
   - Code review integration
   - Compliance reporting

---

This architecture guide provides a comprehensive overview of the system design and implementation details. For specific implementation examples, see the [API Reference](API.md).
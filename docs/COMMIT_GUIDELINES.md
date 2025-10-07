# Commit Guidelines

## Professional Commit Message Standards

This document outlines the commit message standards for the Chahuadev Fix Comments Tool project. Following these guidelines ensures clear project history and facilitates automated tooling.

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(generator): add bilingual comment support` |
| `fix` | Bug fix | `fix(parser): handle async function comments` |
| `docs` | Documentation only | `docs(api): update comment template examples` |
| `style` | Code style changes | `style(format): fix indentation consistency` |
| `refactor` | Code refactoring | `refactor(analyzer): improve function detection` |
| `perf` | Performance improvement | `perf(ast): optimize parsing performance` |
| `test` | Adding/updating tests | `test(bilingual): add translation tests` |
| `chore` | Maintenance tasks | `chore(deps): update babel dependencies` |
| `ci` | CI/CD changes | `ci(actions): add comment quality checks` |
| `build` | Build system changes | `build(webpack): optimize bundle size` |
| `revert` | Revert previous commit | `revert: remove experimental feature` |

### Scope

The scope should indicate the part of the codebase affected:

| Scope | Description |
|-------|-------------|
| `cli` | Command line interface |
| `parser` | AST parsing and analysis |
| `generator` | Comment generation engine |
| `analyzer` | Function and code analysis |
| `bilingual` | Bilingual comment features |
| `ai` | AI-friendly formatting |
| `templates` | Comment templates |
| `config` | Configuration management |
| `docs` | Documentation |
| `tests` | Test files |
| `build` | Build configuration |

### Subject

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Maximum 50 characters

### Body

- Wrap at 72 characters
- Explain the what and why, not how
- Use imperative mood
- Separate from subject with blank line

### Footer

- Reference issues and breaking changes
- Format: `Closes #123` or `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Feature Addition

```
feat(bilingual): add Thai language support for comments

Add comprehensive Thai language support for bilingual comment
generation. Includes translation templates for common programming
patterns and automatic language detection.

Features include:
- Thai translation templates for functions and methods
- Automatic language detection based on existing comments
- Bilingual JSDoc format with English/Thai descriptions
- Configuration options for language preferences

This enables Thai developers to maintain code documentation
in both languages, improving code accessibility and team
collaboration.

Closes #67
```

### Bug Fix

```
fix(parser): correctly handle TypeScript generic functions

Fix AST parsing issue where TypeScript generic function signatures
were not properly analyzed, causing missing type information in
generated comments.

The fix includes:
- Improved generic parameter detection
- Proper constraint parsing for bounded generics
- Type inference for complex generic expressions

Before: Generic functions were parsed as regular functions
After: Full generic signature analysis with type constraints

Fixes #89
```

### Breaking Change

```
feat(generator): update comment template format

Change default comment template format to improve readability
and maintain consistency with modern JSDoc standards.

New features:
- Standardized parameter descriptions
- Improved return value documentation
- Better example code formatting
- Enhanced type information display

BREAKING CHANGE: Default comment template format changed from
custom format to standard JSDoc. Users with custom templates
may need to update their configuration.

Migration guide available in MIGRATION.md

Closes #45
```

### Documentation Update

```
docs(templates): add bilingual comment examples

Add comprehensive examples for bilingual comment generation
including various function patterns and use cases.

Examples include:
- Simple function documentation
- Complex generic functions
- React component documentation
- Node.js API documentation
- Error handling patterns

Improves developer onboarding and reduces configuration time.
```

### Performance Improvement

```
perf(ast): optimize function analysis performance

Implement caching strategy for AST analysis, reducing processing
time by 60% for large codebases with many functions.

Optimizations include:
- Function signature caching based on content hash
- Incremental analysis for modified files only
- Memory-efficient AST node storage
- Parallel processing for independent functions

Benchmark results show 60% improvement in processing time
for projects with 1000+ functions.

Closes #112
```

### Test Addition

```
test(bilingual): add comprehensive translation tests

Add test suite covering Thai-English bilingual comment generation
across various function types and complexity levels.

Test coverage includes:
- Simple function translations
- Complex generic function translations  
- React component comment translations
- Error handling and edge cases
- Template customization scenarios

Increases bilingual feature test coverage to 95%.
```

## Commit Message Best Practices

### Do's

- ✅ Keep commits atomic (one logical change per commit)
- ✅ Write clear, descriptive subject lines
- ✅ Explain the reasoning behind changes in the body
- ✅ Reference relevant issues and pull requests
- ✅ Use consistent formatting and terminology
- ✅ Write commit messages for future maintainers

### Don'ts

- ❌ Don't write vague messages like "fix stuff" or "update code"
- ❌ Don't include file names in the subject (use scope instead)
- ❌ Don't exceed character limits (50 for subject, 72 for body)
- ❌ Don't commit unrelated changes together
- ❌ Don't use past tense ("fixed" instead of "fix")
- ❌ Don't commit commented-out code or debug logs

## Git Workflow Integration

### Commit Hooks

We recommend setting up commit hooks to enforce these standards:

```bash
# Install commitizen for guided commit messages
npm install -g commitizen cz-conventional-changelog

# Set up the adapter
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```

### Usage with Commitizen

```bash
# Use commitizen for guided commits
git cz
```

### Automated Validation

Our CI pipeline includes commit message validation:

```yaml
# .github/workflows/validate-commits.yml
- name: Validate Commit Messages
  uses: wagoid/commitlint-github-action@v4
```

## Release Notes Generation

Following these guidelines enables automated release notes:

```bash
# Generate changelog from commits
conventional-changelog -p angular -i CHANGELOG.md -s
```

## Semantic Versioning Impact

Commit types automatically determine version bumps:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `fix` | PATCH (3.0.1-beta) | Bug fixes |
| `feat` | MINOR (3.1.0-beta) | New features |
| `BREAKING CHANGE` | MAJOR (4.0.0-beta) | Breaking changes |

## Examples by Project Area

### Parser-Related Commits

```
fix(parser): handle arrow functions in class methods
feat(parser): add support for TypeScript decorators
perf(parser): optimize AST traversal performance
```

### Comment Generation Commits

```
feat(generator): add AI-friendly comment format
fix(generator): improve parameter description inference
docs(generator): update template customization guide
```

### Bilingual Feature Commits

```
feat(bilingual): add automatic language detection
fix(bilingual): handle mixed-language existing comments
test(bilingual): add translation accuracy tests
```

## Tooling Support

### IDE Integration

Many IDEs support commit message templates:

```bash
# Set Git commit template
git config commit.template ~/.gitmessage
```

### VS Code Extensions

Recommended extensions:
- Conventional Commits
- GitLens
- Git Graph

### Command Line Tools

```bash
# Install helpful CLI tools
npm install -g @commitlint/cli @commitlint/config-conventional
```

## Review Process

During code review, commit messages are evaluated for:

1. **Clarity**: Is the change purpose clear?
2. **Completeness**: Does it explain what and why?
3. **Standards Compliance**: Does it follow our format?
4. **Technical Accuracy**: Does it accurately describe the change?

## Training and Resources

### Internal Resources

- [Commit Message Workshop Recording](internal-link)
- [Interactive Commit Message Tool](internal-link)
- [Project Style Guide](internal-link)

### External Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Commit Best Practices](https://chris.beams.io/posts/git-commit/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)

---

Following these guidelines helps maintain a professional, clear, and useful project history. For questions about commit message standards, please contact the development team at chahuadev@gmail.com.
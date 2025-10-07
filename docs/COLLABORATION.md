# Collaboration Guidelines

## Open Source Collaboration Guidelines

This document provides guidelines for effective collaboration on the Chahuadev Fix Comments Tool project. Our goal is to create an inclusive, productive, and welcoming environment for all contributors, with special attention to our bilingual and international community.

## Communication Standards

### Professional Communication
- **Respectful Language**: Use professional, respectful language in all communications
- **Constructive Feedback**: Provide specific, actionable feedback
- **Active Listening**: Consider others' perspectives and ideas
- **Clear Expression**: Communicate ideas clearly and concisely
- **Cultural Sensitivity**: Respect different cultural backgrounds and communication styles

### Multilingual Communication

#### Language Support
- **Primary Language**: English for main project communication
- **Secondary Language**: Thai for Thai-speaking contributors
- **Translation Support**: Machine translation acceptable with human verification
- **Code Comments**: Bilingual examples encouraged in documentation

#### Communication Channels

#### GitHub Issues
- **Bug Reports**: Detailed issue descriptions with reproduction steps
- **Feature Requests**: Clear requirements and use cases
- **Language Issues**: Translation problems and suggestions
- **Questions**: Technical questions and clarifications

#### GitHub Discussions
- **General Discussion**: Project direction and community topics
- **Help and Support**: User assistance and troubleshooting
- **Ideas and Feedback**: Brainstorming and suggestions
- **Bilingual Features**: Discussion about translation features

#### Email Communication
- **Formal Issues**: chahuadev@gmail.com for formal concerns
- **Language Coordination**: Bilingual feature coordination
- **Governance Matters**: Project governance and leadership topics

### Response Expectations
- **Issues**: Response within 48-72 hours
- **Pull Requests**: Initial review within 1 week
- **Language Issues**: Response within 3-5 days (may require translation time)
- **General Questions**: Response within 1 week

## Contribution Workflow

### Getting Started

#### 1. Project Setup
```bash
# Fork and clone the repository
git clone https://github.com/your-username/chahuadev-fix-comments.git
cd chahuadev-fix-comments

# Install dependencies
npm install

# Run tests to ensure setup is correct
npm test
```

#### 2. Development Environment
- **Node.js**: Version 16 or higher
- **Git**: Latest stable version
- **Editor**: Any editor with JavaScript/TypeScript support
- **Optional**: VS Code for enhanced development experience

### Development Process

#### 1. Issue Selection
- Browse open issues in the GitHub repository
- Look for issues labeled `good first issue` for beginners
- Check `bilingual` label for translation-related work
- Comment on issues you'd like to work on
- Wait for assignment or approval before starting work

#### 2. Branch Creation
```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/descriptive-name

# For bilingual features
git checkout -b feature/bilingual-thai-support

# For bug fixes
git checkout -b fix/issue-description
```

#### 3. Development Guidelines
- Follow existing code style and conventions
- Write clear, self-documenting code
- Add appropriate comments (bilingual examples encouraged)
- Include unit tests for new functionality
- Update documentation as needed
- Test bilingual features with both languages

#### 4. Testing Requirements
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:bilingual
npm run test:templates
```

#### 5. Code Quality Checks
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking (TypeScript)
npm run type-check

# Security audit
npm audit
```

### Pull Request Process

#### 1. Pre-submission Checklist
- [ ] All tests pass
- [ ] Code follows project style guidelines
- [ ] Documentation updated if needed
- [ ] Commit messages follow guidelines
- [ ] Changes are focused and atomic
- [ ] Bilingual features tested with both languages
- [ ] Translation quality verified (if applicable)

#### 2. Pull Request Template
```markdown
## Description
Brief description of changes and motivation

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Bilingual enhancement
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Existing tests pass
- [ ] New tests added for new functionality
- [ ] Bilingual features tested
- [ ] Manual testing performed

## Language Considerations
- [ ] English documentation updated
- [ ] Thai translations added (if applicable)
- [ ] Translation quality verified
- [ ] Language templates updated

## Documentation
- [ ] Code comments updated
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Bilingual examples added

## Related Issues
Closes #issue-number
```

#### 3. Review Process
1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Initial Review**: Maintainer provides initial feedback
3. **Language Review**: Native speaker review for translations
4. **Iterative Improvement**: Address feedback and update PR
5. **Final Review**: Final approval and merge
6. **Post-merge**: Monitor for any issues

## Code Style and Standards

### JavaScript/TypeScript Standards
- **ES6+ Features**: Use modern JavaScript features
- **Async/Await**: Prefer async/await over callbacks
- **Error Handling**: Comprehensive error handling
- **Type Safety**: Use TypeScript for type safety

### Code Formatting
```javascript
// Use consistent indentation (2 spaces)
function analyzeFunction(functionNode) {
  try {
    const signature = extractSignature(functionNode);
    return generateComment(signature);
  } catch (error) {
    logger.error('Failed to analyze function:', error);
    throw error;
  }
}

// Use descriptive variable names
const functionNodes = ast.body.filter(node => node.type === 'FunctionDeclaration');
const commentTemplate = getTemplate('jsdoc');

// Add meaningful comments (bilingual examples encouraged)
/**
 * Generate bilingual comment for function / สร้างคอมเมนต์สองภาษาสำหรับฟังก์ชัน
 * @param {Function} func - Function to analyze / ฟังก์ชันที่จะวิเคราะห์
 * @returns {string} Generated comment / คอมเมนต์ที่สร้างขึ้น
 */
function generateBilingualComment(func) {
  // Implementation details...
}
```

### Documentation Standards
- **JSDoc Comments**: For all public functions and classes
- **README Updates**: Keep README current with changes
- **API Documentation**: Document all public APIs
- **Bilingual Examples**: Provide examples in both languages when applicable

## Bilingual Development Guidelines

### Translation Standards
- **Accuracy**: Ensure accurate translations
- **Consistency**: Use consistent terminology
- **Cultural Appropriateness**: Respect cultural context
- **Technical Accuracy**: Maintain technical precision

### Language-Specific Contributions

#### English Contributions
- Primary documentation language
- Technical specifications
- API documentation
- Code comments

#### Thai Contributions
- Thai language templates
- Translation verification
- Cultural context input
- Local community engagement

#### Bilingual Contributions
- Template development
- Translation quality assurance
- Bilingual documentation examples
- Cross-language testing

### Translation Workflow

#### 1. Translation Requests
- Create issue with `translation` label
- Specify source text and target language
- Provide context and technical requirements
- Request review from native speakers

#### 2. Translation Process
```bash
# Create translation branch
git checkout -b translation/thai-function-templates

# Add translations to appropriate files
# templates/thai.json
# docs/examples-th.md

# Test translations
npm run test:bilingual

# Verify translation quality
npm run verify:translations
```

#### 3. Translation Review
- Native speaker review required
- Technical accuracy verification
- Cultural appropriateness check
- Integration testing

## Testing Guidelines

### Test Coverage Requirements
- **Unit Tests**: 90% minimum coverage for new code
- **Integration Tests**: Cover main user workflows
- **Bilingual Tests**: Test all language combinations
- **Template Tests**: Verify template rendering

### Test Writing Standards
```javascript
// Descriptive test names
describe('BilingualCommentGenerator', () => {
  describe('generateComment', () => {
    it('should generate English comment for simple function', async () => {
      // Test implementation
    });
    
    it('should generate Thai comment for simple function', async () => {
      // Test implementation
    });
    
    it('should generate bilingual comment with both languages', async () => {
      // Test implementation
    });
  });
});
```

### Bilingual Testing
- **Language Switching**: Test language switching functionality
- **Template Rendering**: Test all language templates
- **Translation Accuracy**: Verify translation quality
- **Character Encoding**: Test Unicode handling

## Community Guidelines

### Inclusive Environment
- **Welcome Newcomers**: Help new contributors get started
- **Language Support**: Support contributors in their preferred language
- **Diverse Perspectives**: Value different cultural viewpoints
- **Accessibility**: Consider accessibility in all aspects

### Knowledge Sharing
- **Documentation**: Share knowledge through documentation
- **Code Reviews**: Use reviews as learning opportunities
- **Mentoring**: Mentor new contributors when possible
- **Best Practices**: Share language-specific best practices

### Recognition and Attribution
- **Contributor Recognition**: Recognize all types of contributions
- **Translation Credits**: Credit translators and reviewers
- **Cultural Contributions**: Recognize cultural insights
- **Community Building**: Appreciate community building efforts

## Conflict Resolution

### Collaborative Problem Solving
1. **Direct Communication**: Address issues directly when possible
2. **Cultural Mediation**: Consider cultural differences in conflicts
3. **Language Barriers**: Provide translation support if needed
4. **Escalation**: Escalate to governance team if necessary

### Common Conflict Scenarios
- **Technical Disagreements**: Focus on technical merits
- **Translation Disputes**: Consult native speakers
- **Cultural Differences**: Respect different perspectives
- **Language Preferences**: Support multilingual communication

## Tools and Resources

### Development Tools
- **Git**: Version control and collaboration
- **GitHub**: Issue tracking and pull requests
- **npm**: Package management and distribution
- **Babel**: AST parsing and transformation

### Translation Tools
- **Translation Memory**: Maintain consistency across translations
- **Terminology Management**: Standardize technical terms
- **Quality Assurance**: Translation verification tools
- **Collaborative Translation**: Online translation platforms

### Learning Resources
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference**: [API.md](API.md)
- **Bilingual Examples**: [examples/bilingual/](examples/bilingual/)

## Continuous Improvement

### Feedback Collection
- **Regular Surveys**: Community feedback surveys
- **Language-Specific Feedback**: Feedback from language communities
- **Translation Quality**: Regular translation quality assessments
- **Process Iteration**: Continuously improve processes

### Process Updates
- **Community Input**: Gather input on process improvements
- **Cultural Considerations**: Include cultural perspectives
- **Language Support**: Improve language support processes
- **Documentation**: Update documentation with process changes

## Getting Help

### Technical Help
- **Documentation**: Check existing documentation first
- **GitHub Discussions**: Ask questions in discussions
- **Issues**: Create issues for bugs or unclear behavior
- **Maintainers**: Reach out to maintainers for complex issues

### Language Help
- **Translation Issues**: Contact language maintainers
- **Cultural Questions**: Ask for cultural context
- **Native Speaker Review**: Request native speaker verification
- **Terminology**: Clarify technical terminology

### Emergency Contacts
- **Technical Emergencies**: Create high-priority GitHub issue
- **Language Emergencies**: chahuadev@gmail.com (specify language needs)
- **Code of Conduct**: chahuadev@gmail.com (conduct violations)

---

These collaboration guidelines help ensure productive, respectful, and effective collaboration on the Chahuadev Fix Comments Tool project while supporting our diverse, multilingual community. For questions or suggestions about these guidelines, please contact chahuadev@gmail.com.
---
layout: default
title: Contributing
nav_order: 16
---

# Contributing

Guide for contributing to prestruct.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch

```bash
git clone https://github.com/YOUR_USERNAME/prestruct.git
cd prestruct
git checkout -b feature/your-feature
```

## Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build locally
npm run build
```

## Code Style

- Use **ESLint** for JavaScript
- Use **Prettier** for formatting
- Follow existing patterns in the codebase

```bash
# Lint
npm run lint

# Format
npm run format
```

## Pull Request Process

### Before Submitting

1. **Test locally** - Ensure build passes
2. **Lint** - No errors
3. **Update docs** - If changing behavior

```bash
npm run build && npm run lint
```

### PR Guidelines

- Use clear, descriptive title
- Link related issues
- Include context in description
- Keep changes focused

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS, etc.)

### Feature Requests

Describe:
- Problem you're solving
- Proposed solution
- Alternatives considered

## Code of Conduct

Be respectful and constructive. This project follows the Contributor Covenant.

## Commit Messages

Use conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: restructure code
chore: maintenance tasks
```

## Release Process

Maintainers handle releases:
1. Update changelog
2. Bump version
3. Create release tag
4. Publish to npm

## License

By contributing, you agree that your contributions will be licensed under MIT.
# Linting and Formatting Guide

This project uses ESLint and Prettier to enforce code quality and consistency.

## Setup

The configuration is already set up in the project. The key files are:

- `.prettierrc.json` - Prettier configuration
- `eslint.config.mjs` - ESLint configuration
- `.vscode/settings.json` - VSCode integration settings

## Usage

### Finding and Fixing Unused Variables

To find and fix unused variables across the codebase, run:

```bash
npm run clean:unused
```

This will automatically fix all unused variables in TypeScript files by:
- Prefixing unused variables with underscore (`_`)
- Removing completely unused imports

### Linting

To check for linting issues:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

### Formatting

To format all files using Prettier:

```bash
npm run format
```

## VSCode Integration

If you're using VSCode, the settings are configured to:

1. Format files on save using Prettier
2. Fix ESLint issues on save
3. Use the project's TypeScript version

Make sure you have these extensions installed:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

## Rules for Unused Variables

The project follows these rules for handling unused variables:

1. Variables prefixed with underscore (`_`) are ignored by the linter
2. Destructured properties with rest siblings are ignored (e.g., `const { used, ...unused } = obj`)
3. Unused function parameters after used ones are ignored

## Best Practices

- Don't disable ESLint rules using comments unless absolutely necessary
- If you need to keep an unused variable temporarily, prefix it with an underscore
- Run `npm run lint:fix` before committing changes
- If ESLint and Prettier conflict, Prettier's formatting will take precedence 
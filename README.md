# KabuhayanDB Backend

Backend API repository for KabuhayanDB.

## Deployment Status

- Locally hosted
- **Task**: Deploy on Render

## Table of Contents

- [Deployment Status](#deployment-status)
- [Setup](#setup)
- [Development](#development)
- [Testing & Code Quality](#testing--code-quality)
- [Development Workflow](#development-workflow)
  - [Branch Strategy](#branch-strategy)
  - [Commit Guidelines](#commit-guidelines)

## Setup

1. Clone the repo from `main`

```bash
git clone https://github.com/cssweng-skmlhoai/kabuhayandb-backend.git
cd kabuhayandb-backend
```

2. Install dependencies

```bash
npm install
```

3. Copy `.env.example` and create a `.env` file with the correct variables

## Development

- Continuous run during development:

```bash
npm run dev
```

- Install dev dependcies:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional @eslint/eslintrc @eslint/js eslint eslint-config-prettier globals husky lint-staged prettier supertest vitest
```

## Testing & Code Quality

- local testing, linting, and formatting:

```bash
npm run lint
npm run lint:fix
npm run format
npm run test
```

- run tests on watch mode

```bash
npm run test:watch
```

## Development Workflow

1. Create a new branch from `main` branch:

```bash
git checkout -b feature/feature-name
```

2. Create features/changes/fixes/etc. to the branch

3. Lint, format, and test changes (pre-commit hook may cover this):

```bash
npm run lint
npm run lint:fix
npm run format
npm run test
```

4. Stage changes and commit using [conventional_commits](#commit-guidelines)

> [!NOTE]
> Committing (`git commit`) will trigger `.husky` pre-commit hook
> Flow: linters, formatters, and test runs --> commitlint checks --> if passes, commit succeeds

5. Push changes to branch and create pull request

6. Ensure Continuous Integration passes
7. Merge to `main` branch

### Branch Strategy

- `main`: Production releases
- Feature branches: `feature/*`
- Bug fixes: `fix/*`
- Build branches: `build/*`
- Documentation branches: `docs/*`

### Commit Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/). Git commits must follow the format specified:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Changes to build process or auxiliary tools

Examples:

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login validation issue"
git commit -m "docs: update API documentation"
git commit -m "style: format user controller"
```

# KabuhayanDB Backend

Backend API repository for KabuhayanDB.

## Deployment Status

- Locally hosted
- **Task**: Deploy on Render

## Table of Contents

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
npm run test
npm run lint
npm run lint:fix
npm run format
```

- run tests on watch mode

```bash
npm run test:watch
```

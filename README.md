# E2E-Test-Suite

A monorepo containing an Angular panel application and a Playwright end-to-end test suite.

## Project Structure

```
E2E-Test-Suite/
├── apps/
│   └── panel/          # Angular application (TypeScript)
├── packages/
│   └── e2e/            # Playwright test suite
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Run the Angular app

```bash
cd apps/panel
pnpm start
```

The app will be available at `http://localhost:4200`.

### Run E2E tests

Make sure the app is running, then in a separate terminal:

```bash
cd packages/e2e
pnpm test
```

Or run both together from the root:

```bash
pnpm --filter panel start &
pnpm --filter e2e test
```

## Apps

### `apps/panel`

Angular standalone application with:
- **Talent List** (`/talents`) — browsable talent cards with multi-select
- **Profile Management** (`/profiles`) — create, edit, and persist talent profiles

State management uses Angular Signals. Styling is done with Tailwind CSS.

### `packages/e2e`

Playwright test suite covering:

| Test file | Scenario |
|-----------|----------|
| `talent-selection.spec.ts` | Multi-select checkboxes and toolbar count |
| `profile-management.spec.ts` | Profile creation, photo upload, edit, and persistence |

Tests use `data-testid` attributes for element selection via `getByTestId()`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm --filter panel start` | Start the Angular dev server |
| `pnpm --filter panel build` | Build the Angular app |
| `pnpm --filter e2e test` | Run all Playwright tests |
| `pnpm --filter e2e test --ui` | Run Playwright tests with UI mode |

## Tech Stack

- **Frontend:** Angular 17, TypeScript, Tailwind CSS, Angular Signals
- **Testing:** Playwright
- **Package manager:** pnpm workspaces

# Project Structure

## Repository Layout

```
roo-code/
├── src/                    # Main VS Code extension source
├── webview-ui/            # React-based webview UI
├── apps/                  # Application packages
├── packages/              # Shared libraries
├── examples/              # Example code and demos
├── tests/                 # Integration tests
├── docs/                  # Documentation
├── locales/               # i18n translations (17+ languages)
├── scripts/               # Build and utility scripts
└── .roo/                  # Roo Code agent configuration
```

## Main Extension (`src/`)

```
src/
├── extension.ts           # Extension entry point
├── activate/              # Extension activation logic
├── api/                   # External API integrations
├── core/                  # Core functionality
├── extension/             # Extension-specific code
├── i18n/                  # Internationalization
├── integrations/          # Third-party integrations
├── services/              # Business logic services
├── shared/                # Shared utilities and types
├── utils/                 # Helper functions
├── webview-ui/            # Webview UI components
├── workers/               # Background workers
├── __mocks__/             # Test mocks
└── __tests__/             # Unit tests
```

## Webview UI (`webview-ui/`)

React-based UI built with Vite, separate from main extension code. Communicates with extension via message passing.

## Packages (`packages/`)

Shared libraries used across the monorepo:

- `build/` - Build utilities and configurations
- `cloud/` - Cloud service integrations
- `config-eslint/` - Shared ESLint configuration
- `config-typescript/` - Shared TypeScript configuration
- `evals/` - Evaluation framework and benchmarks
- `ipc/` - Inter-process communication
- `quantum-*` - Quantum computing related packages (experimental features)
- `telemetry/` - Analytics and telemetry
- `types/` - Shared TypeScript types

## Apps (`apps/`)

- `vscode-e2e/` - End-to-end tests
- `vscode-nightly/` - Nightly build configuration
- `web-evals/` - Web-based evaluation tools
- `web-roo-code/` - Web version of Roo Code

## Configuration Files

### Root Level
- `package.json` - Root package configuration and scripts
- `pnpm-workspace.yaml` - Monorepo workspace definition
- `turbo.json` - Turborepo task configuration
- `tsconfig.json` - Root TypeScript configuration

### Extension Level (`src/`)
- `package.json` - Extension manifest and dependencies
- `esbuild.mjs` - Bundling configuration
- `vitest.config.ts` - Test configuration
- `eslint.config.mjs` - Linting rules

## Special Directories

### `.roo/`
Roo Code agent configuration including:
- `commands/` - Custom commands
- `rules/` - Agent behavior rules
- `rules-*` - Mode-specific rules (code, docs-extractor, issue-fixer, etc.)
- `roomotes.yml` - Roomote configuration

### `locales/`
Internationalization files for 17+ languages (ca, de, es, fr, hi, id, it, ja, ko, nl, pl, pt-BR, ru, tr, vi, zh-CN, zh-TW)

### `.github/`
GitHub workflows, issue templates, and CI/CD configuration

## Build Artifacts

- `dist/` - Compiled extension code
- `out/` - Additional build outputs
- `bin/` - VSIX packages
- `.turbo/` - Turborepo cache
- `node_modules/` - Dependencies

## Key Conventions

1. **Workspace Protocol**: Internal packages use `workspace:^` for dependencies
2. **Monorepo Tasks**: Use Turborepo for coordinated builds across packages
3. **Extension Structure**: Main extension code in `src/`, UI in `webview-ui/`
4. **i18n**: All user-facing strings use i18next with locale files
5. **Testing**: Vitest for unit tests, separate e2e app for integration tests
6. **Type Safety**: Shared types in `@roo-code/types` package

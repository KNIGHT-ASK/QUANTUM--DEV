# Technology Stack

## Build System

- **Package Manager**: pnpm (v10.8.1) - workspace-based monorepo
- **Build Tool**: Turborepo for monorepo task orchestration
- **Bundler**: esbuild for fast compilation
- **Node Version**: 20.19.2 (specified in .nvmrc and engines)

## Core Technologies

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20.19.2
- **Extension Platform**: VS Code Extension API (^1.84.0)
- **UI Framework**: React (in webview-ui)
- **Build Tool**: Vite (for webview)

## Key Libraries & Frameworks

### AI/LLM Integration
- `@anthropic-ai/sdk` - Anthropic Claude API
- `@anthropic-ai/bedrock-sdk` - AWS Bedrock integration
- `@anthropic-ai/vertex-sdk` - Google Vertex AI
- `@google/genai` - Google Gemini
- `openai` - OpenAI API
- `ollama` - Local LLM support
- `@mistralai/mistralai` - Mistral AI
- `@lmstudio/sdk` - LM Studio integration
- `@modelcontextprotocol/sdk` - MCP protocol

### Code Analysis & Processing
- `web-tree-sitter` - Syntax tree parsing
- `tree-sitter-wasms` - Tree-sitter language grammars
- `diff` - Text diffing
- `tiktoken` - Token counting
- `fzf` - Fuzzy search

### VS Code Integration
- `@vscode/codicons` - VS Code icon library
- `monaco-vscode-textmate-theme-converter` - Theme conversion

### Utilities
- `axios` - HTTP client
- `cheerio` - HTML parsing
- `puppeteer-core` - Browser automation
- `simple-git` - Git operations
- `chokidar` - File watching
- `yaml` - YAML parsing
- `zod` - Schema validation
- `i18next` - Internationalization

## Monorepo Structure

Workspace packages defined in `pnpm-workspace.yaml`:
- `src/` - Main VS Code extension
- `webview-ui/` - React-based webview interface
- `apps/*` - Application packages (vscode-e2e, vscode-nightly, web-evals, web-roo-code)
- `packages/*` - Shared libraries (build, cloud, config-eslint, config-typescript, evals, ipc, quantum-*, telemetry, types)

## Common Commands

### Development
```bash
# Install dependencies
pnpm install

# Run extension in debug mode
# Press F5 in VS Code (opens Extension Development Host)

# Watch mode for TypeScript
pnpm watch:tsc

# Watch mode for bundling
pnpm watch:bundle
```

### Building
```bash
# Build all packages
pnpm build

# Bundle extension
pnpm bundle

# Create VSIX package
pnpm vsix

# Build and install VSIX
pnpm install:vsix
```

### Quality Checks
```bash
# Lint all packages
pnpm lint

# Type checking
pnpm check-types

# Run tests
pnpm test

# Format code
pnpm format

# Check for unused dependencies
pnpm knip
```

### Cleaning
```bash
# Clean build artifacts
pnpm clean
```

## Code Style & Linting

- **Linter**: ESLint 9.x with flat config
- **Formatter**: Prettier 3.x
- **Pre-commit**: Husky + lint-staged (auto-format on commit)
- **Config**: Shared configs in `@roo-code/config-eslint` and `@roo-code/config-typescript`

## Testing

- **Test Framework**: Vitest 3.x
- **VS Code Testing**: `@vscode/test-electron`
- **Mocking**: nock for HTTP mocking

## Versioning & Publishing

- **Versioning**: Changesets for version management
- **Publishing**: `@vscode/vsce` for VS Code Marketplace, `ovsx` for Open VSX
- **Nightly Builds**: Separate nightly build pipeline

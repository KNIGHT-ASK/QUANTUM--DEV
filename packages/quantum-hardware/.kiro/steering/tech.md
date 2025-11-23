# Technology Stack

## Language & Runtime

- **TypeScript 5.3+**: Primary language with strict type checking enabled
- **Node.js**: Target ES2020, CommonJS modules
- **Build System**: TypeScript compiler (tsc)

## Core Dependencies

- **axios**: HTTP client for provider API communication
- **mathjs**: Mathematical operations for optimization algorithms
- **ws**: WebSocket support for real-time device updates

## Development Tools

- **vitest**: Testing framework
- **eslint**: Code linting with TypeScript support
- **prettier**: Code formatting
- **ts-node**: TypeScript execution for examples
- **rimraf**: Cross-platform file cleanup

## Build & Development Commands

```bash
# Build the project
npm run build

# Run tests
npm run test

# Clean build artifacts
npm run clean

# Run example
npm run example

# Lint code
npm run lint

# Format code
npm run format
```

## TypeScript Configuration

- Strict mode enabled
- Declaration files generated automatically
- Source maps for debugging
- Module resolution: Node
- Output: `dist/` directory
- Source: `src/` directory

## Package Distribution

- Main entry: `dist/index.js`
- Type definitions: `dist/index.d.ts`
- Published as: `@quantum-dev/hardware`
- License: MIT

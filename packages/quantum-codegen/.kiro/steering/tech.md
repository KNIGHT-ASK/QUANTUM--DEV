---
inclusion: always
---

# Technology Stack

## Language & Runtime
- TypeScript 5.0+ with strict mode enabled
- Node.js 20+ (ES2020 target)
- CommonJS module system

## Build System
- TypeScript compiler (`tsc`) for compilation
- Output: `dist/` directory with declaration files
- Source: `src/` directory

## Testing
- Vitest for unit testing
- Test files: `tests/*.test.ts`

## Dependencies
Workspace packages (monorepo):
- `@quantum-dev/physics-core` - Core physics primitives
- `@quantum-dev/knowledge-base` - Research knowledge
- `@quantum-dev/hardware` - Hardware specifications

## Common Commands

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode (for development)
npm test -- --watch
```

## Code Generation Targets
Generated code is Python for:
- Qiskit (IBM Quantum)
- Cirq (Google Quantum)
- PennyLane (Xanadu)

## TypeScript Configuration
- Strict type checking enabled
- Declaration maps for debugging
- ES module interop enabled
- Skip lib check for faster compilation

---
inclusion: always
---

# Project Structure

## Directory Layout

```
src/                          # Source code
├── index.ts                  # Main exports and public API
├── QuantumIR.ts             # Core IR types and builder
├── *Generator.ts            # Framework-specific generators
│   ├── QiskitGenerator.ts
│   ├── CirqGenerator.ts
│   └── PennyLaneGenerator.ts
└── *CodeGenerator.ts        # Feature modules
    ├── PhysicsValidation.ts
    ├── ErrorMitigation.ts
    ├── HamiltonianSimulation.ts
    ├── VariationalAlgorithms.ts
    ├── NoiseModeling.ts
    ├── StatePreparation.ts
    ├── MeasurementOptimization.ts
    └── CircuitOptimization.ts

templates/                    # Algorithm templates
├── vqe/
├── qaoa/
├── qft/
├── qpe/
└── grover/

tests/                        # Test files
dist/                         # Compiled output (generated)
```

## Architecture Patterns

### Three-Layer Architecture

1. **IR Layer** (`QuantumIR.ts`)
   - Framework-agnostic intermediate representation
   - Builder pattern for constructing quantum programs
   - Type definitions for gates, measurements, Hamiltonians, noise models

2. **Code Generation Modules** (`*CodeGenerator.ts`)
   - Specialized generators for specific features
   - Each module is independent and composable
   - Generate framework-agnostic code snippets

3. **Framework Generators** (`*Generator.ts`)
   - Orchestrate code generation modules
   - Produce complete, executable Python code
   - Handle framework-specific syntax and imports

### Key Design Principles

- **Physics-first**: All code generation preserves physical properties
- **Composability**: Modules can be mixed and matched
- **Research-backed**: Implementations based on arXiv papers
- **Type safety**: Strict TypeScript with comprehensive interfaces
- **Template fallback**: Use templates when available, generate otherwise

## Naming Conventions

- Classes: PascalCase (e.g., `QiskitGenerator`)
- Interfaces: PascalCase (e.g., `QuantumGate`)
- Types: PascalCase (e.g., `GateType`)
- Files: PascalCase matching primary export
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE

## Module Organization

Each code generation module follows this pattern:
- Single class with descriptive name ending in `CodeGenerator`
- Methods named `generate*` that return code strings
- Framework parameter to customize output
- Comprehensive JSDoc comments with physics explanations

## Export Strategy

`index.ts` serves as the single entry point, exporting:
- Core IR types and builder
- All framework generators
- All code generation modules
- Type definitions for public API

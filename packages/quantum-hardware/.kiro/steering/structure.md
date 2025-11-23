# Project Structure

## Directory Organization

```
src/
├── core/                    # Core system components
│   ├── DeviceRegistry.ts    # Device discovery and management
│   └── CalibrationManager.ts # Calibration data handling
├── providers/               # Quantum hardware provider integrations
│   ├── ProviderInterfaces.ts # Unified provider abstractions
│   ├── GoogleQuantumProvider.ts
│   ├── AWSBraketProvider.ts
│   └── AzureQuantumProvider.ts
├── analysis/                # Circuit and device analysis
│   ├── CircuitMatcher.ts    # Circuit-device compatibility
│   ├── FidelityEstimator.ts # Fidelity prediction
│   └── CostAnalyzer.ts      # Cost estimation
├── optimization/            # Circuit optimization algorithms
│   ├── QubitMapper.ts       # Qubit mapping and SWAP insertion
│   └── GateScheduler.ts     # Gate parallelization
├── integration/             # High-level integrations
│   ├── UnifiedQuantumInterface.ts # Main API facade
│   └── PennyLaneAdapter.ts  # PennyLane integration
├── examples/                # Usage examples
│   └── basic-usage.ts
├── DeviceCharacterization.ts # Device data structures
├── ErrorMitigation.ts       # Error mitigation techniques
├── QuantumHardwareManager.ts # Hardware management
└── index.ts                 # Public API exports
```

## Architecture Layers

The system follows a layered architecture from bottom to top:

1. **Provider Layer**: Platform-specific integrations (IBM, Google, AWS, Azure, etc.)
2. **Characterization Layer**: Device registry, calibration management, topology analysis
3. **Analysis Layer**: Circuit matching, fidelity estimation, cost analysis
4. **Optimization Layer**: Qubit mapping, gate scheduling, pulse optimization
5. **Integration Layer**: Unified interface, PennyLane adapter, error mitigation
6. **Application Layer**: User-facing API and examples

## Key Design Patterns

- **Facade Pattern**: `UnifiedQuantumInterface` provides simplified access to complex subsystems
- **Strategy Pattern**: Different optimization strategies (qubit mapping, gate scheduling)
- **Registry Pattern**: `DeviceRegistry` for centralized device management
- **Adapter Pattern**: `PennyLaneAdapter` for framework integration
- **Factory Functions**: `createQuantumInterface()`, `createPennyLaneAdapter()`

## Module Exports

All public APIs are exported through `src/index.ts`. Internal implementation details remain private. Users interact with the system through:
- Factory functions for creating instances
- Interface types for TypeScript support
- Core classes for advanced usage

## File Naming Conventions

- PascalCase for class files (e.g., `DeviceRegistry.ts`)
- Interfaces defined in same file as implementation or in dedicated `*Interfaces.ts` files
- Examples use kebab-case (e.g., `basic-usage.ts`)
- Test files use `*.test.ts` suffix (excluded from build)

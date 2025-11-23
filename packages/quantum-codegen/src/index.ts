/**
 * @quantum-dev/code-generator
 * 
 * Revolutionary Multi-Framework Quantum Code Generation
 * Physics-first approach with expert-level features:
 * - Advanced error mitigation (ZNE, DD, PEC, REM)
 * - Hamiltonian simulation (Trotter, fermion mappings)
 * - Variational algorithms (VQE, QAOA, ADAPT)
 * - Noise modeling and fidelity estimation
 * - State preparation and measurement optimization
 * - Circuit optimization and hardware-aware compilation
 * 
 * Supports: Qiskit, Cirq, PennyLane
 */

// Core IR and builders
export {
	QuantumIR,
	QuantumIRBuilder,
	QuantumAlgorithmTemplates,
	type GateType,
	type QuantumGate,
	type Measurement,
	type Symmetry,
	type Observable,
	type Complex,
	type HamiltonianTerm,
	type PauliOperator,
	type NoiseChannel,
	type DeviceTopology,
	type CrosstalkModel
} from './QuantumIR';

// Framework generators
export { QiskitGenerator } from './QiskitGenerator';
export { CirqGenerator } from './CirqGenerator';
export { PennyLaneGenerator } from './PennyLaneGenerator';

// Code generation modules
export { PhysicsValidationCodeGenerator } from './PhysicsValidation';
export { ErrorMitigationCodeGenerator } from './ErrorMitigation';
export { HamiltonianSimulationCodeGenerator } from './HamiltonianSimulation';
export { VariationalAlgorithmsCodeGenerator } from './VariationalAlgorithms';
export { NoiseModelingCodeGenerator } from './NoiseModeling';
export { StatePreparationCodeGenerator } from './StatePreparation';
export { MeasurementOptimizationCodeGenerator } from './MeasurementOptimization';
export { CircuitOptimizationCodeGenerator } from './CircuitOptimization';

// Template-based generation (Revolutionary!)
export { PhysicsValidatedCodeGenerator, generateQuantumCode } from './PhysicsValidatedCodeGenerator';
export { TemplateSelector } from './TemplateSelector';
export { CorePhysicsValidator } from './CorePhysicsValidator';

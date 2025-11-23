/**
 * @quantum-dev/physics-core
 * 
 * Physics-First Quantum Computing Intelligence
 * The foundation of Quantum Dev - our revolutionary quantum development platform
 * 
 * Implements the 17 Fundamental Physics Pillars
 * 
 * THE REVOLUTION:
 * Not a coding tool that knows physics.
 * Not an AI that generates quantum circuits.
 * But a physics reasoning engine that happens to output quantum algorithms.
 * 
 * The physics is primary. The code is derivative.
 */

// ========== CORE PHYSICS ENGINE ==========
export { PhysicsCore, QuantumDevIntelligence, quantumDev, type PhysicsAnalysis } from './PhysicsCore';

// ========== FOUNDATION PILLARS (1-3) ==========
export { HilbertSpace, type QuantumState, type HilbertSpaceAnalysis } from './HilbertSpace';
export { Hamiltonian, type HamiltonianMatrix, type HamiltonianAnalysis } from './Hamiltonian';
export { EnhancedHamiltonian, SymmetryType, HamiltonianType, type ConservationLaw } from './EnhancedHamiltonian';
export { QuantumInformation, type EntanglementMeasures, type QuantumChannel } from './QuantumInformation';
export { MolecularHamiltonian, type MoleculeSpec, type MolecularHamiltonianData } from './MolecularHamiltonian';
export { ValidationEngine, type ValidationResult, type ComprehensiveValidation } from './ValidationEngine';

// ========== NUMERICAL METHODS & ALGORITHMS ==========
export { NumericalMethods, type EigenResult, type SVDResult, type QRResult } from './NumericalMethods';
export { HamiltonianAnalyzer, type SpectralAnalysis, type Symmetry, type ConservedQuantity } from './HamiltonianAnalyzer';
export { QuantumInformationTheory, InvalidQuantumStateError as QITInvalidQuantumStateError, type EntropyResult } from './QuantumInformationTheory';
export { DensityMatrixOperations, InvalidQuantumStateError as DMInvalidQuantumStateError, type DensityMatrixValidation } from './DensityMatrixOperations';
export { TensorOperations, TensorOperationError, type TensorProductResult, type EmbeddingConfig } from './TensorOperations';
export { TimeEvolutionOperator, type TimeEvolutionConfig, type EvolutionResult } from './TimeEvolutionOperator';
export { VQE, type VQEConfig, type VQEResult, type Ansatz } from './VQE';
export { NoiseModels, type NoiseParameters, type NoiseChannel } from './NoiseModels';
export {
	QAOA,
	QuantumPhaseEstimation,
	GroverSearch,
	QuantumAnnealing,
	type QAOAConfig,
	type QAOAResult,
	type QPEConfig,
	type QPEResult,
	type GroverConfig,
	type GroverResult,
	type AnnealingConfig,
	type AnnealingResult,
} from './QuantumAlgorithms';

// ========== ADVANCED PILLARS (4-17) ==========
export * from './QuantumFieldTheory';
export * from './DifferentialGeometry';
export * from './RelativisticQuantumMechanics';
export * from './BarrenPlateaus';
export * from './LDPCCodes';
export * from './GreensFunction';
export { ADAPTVQE, type ADAPTVQEResult } from './ADAPTVE';
export * from './ManyBodyPhysics';
export * from './AdvancedAnsatze';
export * from './QuantumErrorCorrection';
export * from './QuantumThermodynamics';
export * from './QuantumMetrology';
export * from './QuantumSimulationTheory';
export * from './QuantumGravityHolography';
export * from './LatticeGaugeTheory';
export * from './TopologicalQuantumComputing';
export * from './QuantumComplexityTheory';
export * from './MathematicalPhysicsStructures';

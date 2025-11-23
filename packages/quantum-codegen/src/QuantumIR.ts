/**
 * Quantum Intermediate Representation (IR)
 * 
 * Abstract representation of quantum algorithms
 * Independent of framework (Qiskit/Cirq/PennyLane)
 * Physics-first: preserves Hamiltonian, symmetries, expected outcomes
 * 
 * Enhanced with advanced error mitigation, noise modeling, and optimization
 */

// import { HilbertSpace, Hamiltonian } from '@quantum-dev/physics-core';
// TODO: Re-enable after workspace is properly linked

export type GateType = 
	| 'H' | 'X' | 'Y' | 'Z' 
	| 'RX' | 'RY' | 'RZ' 
	| 'CNOT' | 'CZ' | 'SWAP'
	| 'T' | 'S' | 'Tdg' | 'Sdg'
	| 'U3' | 'U2' | 'U1'
	| 'TOFFOLI' | 'FREDKIN'
	| 'RXX' | 'RYY' | 'RZZ';

export interface Complex {
	real: number;
	imag: number;
}

export interface QuantumGate {
	type: GateType;
	qubits: number[];
	parameters?: number[];
	label?: string;
	// Enhanced metadata
	executionTime?: number;  // nanoseconds
	errorRate?: number;
	commutesWithNext?: boolean;
	preservesSymmetries?: string[];
}

export interface Measurement {
	qubits: number[];
	basis: 'computational' | 'X' | 'Y' | 'Z' | 'custom';
	classicalBits?: number[];
	// Enhanced measurement options
	shots?: number;
	mitigation?: 'readout' | 'none';
}

export interface Symmetry {
	operator: string;
	eigenvalue: number;
	description: string;
	tolerance?: number;  // numerical tolerance for validation
}

export interface Observable {
	name: string;
	operator: string; // e.g., "Z0 Z1" for two-qubit Pauli Z
	expectedValue?: number;
	variance?: number;
	weight?: number;  // for weighted measurements
}

// Hamiltonian term representation
export interface HamiltonianTerm {
	coefficient: number | Complex;
	pauliString: string;  // e.g., "XZIY" for X⊗Z⊗I⊗Y
	qubits: number[];
}

// Pauli operator for measurements
export interface PauliOperator {
	pauli: 'I' | 'X' | 'Y' | 'Z';
	qubit: number;
	coefficient?: number | Complex;
}

// Noise channel representation
export interface NoiseChannel {
	type: 'depolarizing' | 'amplitude_damping' | 'phase_damping' | 'thermal' | 'pauli';
	parameters: number[];
	qubits: number[];
}

// Device topology for hardware-aware compilation
export interface DeviceTopology {
	numQubits: number;
	connectivity: [number, number][];  // qubit pairs that can interact
	nativeGates: GateType[];
	gateErrors: Map<string, number>;
	t1Times?: number[];  // per qubit
	t2Times?: number[];  // per qubit
}

// Crosstalk model
export interface CrosstalkModel {
	adjacencyMatrix: number[][];
	crosstalkCoefficients: number[][];
}

/**
 * Enhanced QuantumIR: Framework-agnostic quantum algorithm representation
 * with advanced error mitigation, noise modeling, and optimization
 */
export interface QuantumIR {
	// Physics metadata
	hilbertSpace: {
		numQubits: number;
		dimension: number;
	};
	
	// Enhanced Hamiltonian specification
	hamiltonian?: {
		type: 'pauli_sum' | 'fermionic' | 'molecular' | 'ising' | 'custom';
		description: string;
		terms?: HamiltonianTerm[];
		eigenvalues?: number[];
		groundStateEnergy?: number;
		fermionMapping?: 'jordan_wigner' | 'bravyi_kitaev' | 'parity';
		couplingConstants?: number[];
	};
	
	initialState: {
		type: 'zero' | 'plus' | 'custom' | 'thermal' | 'ghz' | 'w';
		amplitudes?: Complex[];
		temperature?: number;  // for thermal states
		fidelityTarget?: number;  // for approximate preparation
	};
	
	// Circuit description
	gates: QuantumGate[];
	measurements: Measurement[];
	
	// Noise model (optional)
	noiseModel?: {
		gateErrors: Map<GateType, NoiseChannel[]>;
		t1Times?: number[];  // per qubit (microseconds)
		t2Times?: number[];  // per qubit (microseconds)
		readoutErrors?: number[][];  // confusion matrix
		crosstalk?: CrosstalkModel;
		thermalPopulation?: number[];  // per qubit
	};
	
	// Error mitigation strategy
	errorMitigation?: {
		techniques: ('zne' | 'pec' | 'dd' | 'rem' | 'cdr')[];
		zneConfig?: {
			scalingFactors: number[];
			extrapolation: 'linear' | 'polynomial' | 'exponential';
			order?: number;
		};
		ddConfig?: {
			sequence: 'xy4' | 'cpmg' | 'ur' | 'kdd';
			idleThreshold: number;  // nanoseconds
		};
		pecConfig?: {
			samplingOverhead: number;
			quasiProbDecomposition?: 'optimal' | 'greedy';
		};
		remConfig?: {
			calibrationShots: number;
			inversionMethod: 'direct' | 'least_squares' | 'iterative';
		};
	};
	
	// Optimization configuration
	optimization?: {
		ansatzType?: 'hardware_efficient' | 'uccsd' | 'qaoa' | 'custom' | 'adaptive';
		entanglementPattern?: 'linear' | 'full' | 'circular' | 'star';
		optimizer: {
			name: 'cobyla' | 'lbfgsb' | 'spsa' | 'adam' | 'natural_gradient' | 'nesterov';
			maxIterations: number;
			tolerance: number;
			learningRate?: number;
			adaptiveStrategy?: boolean;
			momentumFactor?: number;
		};
		initializationStrategy: 'random' | 'identity' | 'physics_informed' | 'layer_wise';
		gradientMethod?: 'parameter_shift' | 'finite_diff' | 'adjoint' | 'spsa';
		barrenPlateauMitigation?: boolean;
	};
	
	// Measurement strategy
	measurementStrategy?: {
		type: 'computational' | 'pauli_grouping' | 'classical_shadows' | 'weak' | 'adaptive';
		observables?: Observable[];
		shotAllocation?: 'uniform' | 'variance_optimal' | 'adaptive';
		groupingStrategy?: 'commuting' | 'qubit_wise' | 'tensor_product';
		shadowConfig?: {
			numShadows: number;
			randomSeed?: number;
		};
		weakMeasurementStrength?: number;
	};
	
	// Validation constraints
	validationConstraints?: {
		maxCircuitDepth?: number;
		maxTwoQubitGates?: number;
		requiredFidelity?: number;
		symmetryTolerance: number;
		energyTolerance?: number;
	};
	
	// Device targeting (optional)
	targetDevice?: {
		name: string;
		topology?: DeviceTopology;
		calibrationDate?: Date;
	};
	
	// Physics validation metadata
	physicsMetadata: {
		symmetries: Symmetry[];
		conservedQuantities: Observable[];
		expectedOutcome?: {
			state?: Complex[];
			energy?: number;
			fidelity?: number;
		};
		algorithm: {
			name: string;
			type: 'VQE' | 'QAOA' | 'QPE' | 'Grover' | 'HHL' | 'Shor' | 'Custom';
			parameters: Record<string, any>;
			references?: string[];  // scientific papers
		};
		entanglementStructure?: {
			bipartitions: number[][];
			expectedEntropy: number[];
		};
	};
}

/**
 * Enhanced QuantumIR Builder with advanced features
 */
export class QuantumIRBuilder {
	private ir: Partial<QuantumIR> = {
		gates: [],
		measurements: [],
		physicsMetadata: {
			symmetries: [],
			conservedQuantities: [],
			algorithm: {
				name: 'Custom',
				type: 'Custom',
				parameters: {}
			}
		}
	};

	setHilbertSpace(numQubits: number): this {
		this.ir.hilbertSpace = {
			numQubits,
			dimension: Math.pow(2, numQubits)
		};
		return this;
	}

	setHamiltonian(
		type: 'pauli_sum' | 'fermionic' | 'molecular' | 'ising' | 'custom',
		description: string,
		options?: {
			terms?: HamiltonianTerm[];
			eigenvalues?: number[];
			fermionMapping?: 'jordan_wigner' | 'bravyi_kitaev' | 'parity';
			couplingConstants?: number[];
		}
	): this {
		this.ir.hamiltonian = {
			type,
			description,
			terms: options?.terms,
			eigenvalues: options?.eigenvalues,
			groundStateEnergy: options?.eigenvalues ? Math.min(...options.eigenvalues) : undefined,
			fermionMapping: options?.fermionMapping,
			couplingConstants: options?.couplingConstants
		};
		return this;
	}

	setInitialState(
		type: 'zero' | 'plus' | 'custom' | 'thermal' | 'ghz' | 'w',
		options?: {
			amplitudes?: Complex[];
			temperature?: number;
			fidelityTarget?: number;
		}
	): this {
		this.ir.initialState = {
			type,
			amplitudes: options?.amplitudes,
			temperature: options?.temperature,
			fidelityTarget: options?.fidelityTarget
		};
		return this;
	}

	addGate(gate: QuantumGate): this {
		this.ir.gates!.push(gate);
		return this;
	}

	addMeasurement(measurement: Measurement): this {
		this.ir.measurements!.push(measurement);
		return this;
	}

	addSymmetry(symmetry: Symmetry): this {
		this.ir.physicsMetadata!.symmetries.push(symmetry);
		return this;
	}

	addConservedQuantity(observable: Observable): this {
		this.ir.physicsMetadata!.conservedQuantities.push(observable);
		return this;
	}

	setAlgorithm(
		name: string,
		type: QuantumIR['physicsMetadata']['algorithm']['type'],
		parameters: Record<string, any>,
		references?: string[]
	): this {
		this.ir.physicsMetadata!.algorithm = { name, type, parameters, references };
		return this;
	}

	setNoiseModel(noiseModel: QuantumIR['noiseModel']): this {
		this.ir.noiseModel = noiseModel;
		return this;
	}

	setErrorMitigation(errorMitigation: QuantumIR['errorMitigation']): this {
		this.ir.errorMitigation = errorMitigation;
		return this;
	}

	setOptimization(optimization: QuantumIR['optimization']): this {
		this.ir.optimization = optimization;
		return this;
	}

	setMeasurementStrategy(strategy: QuantumIR['measurementStrategy']): this {
		this.ir.measurementStrategy = strategy;
		return this;
	}

	setValidationConstraints(constraints: QuantumIR['validationConstraints']): this {
		this.ir.validationConstraints = constraints;
		return this;
	}

	setTargetDevice(device: QuantumIR['targetDevice']): this {
		this.ir.targetDevice = device;
		return this;
	}

	setExpectedOutcome(outcome: QuantumIR['physicsMetadata']['expectedOutcome']): this {
		this.ir.physicsMetadata!.expectedOutcome = outcome;
		return this;
	}

	setEntanglementStructure(structure: QuantumIR['physicsMetadata']['entanglementStructure']): this {
		this.ir.physicsMetadata!.entanglementStructure = structure;
		return this;
	}

	build(): QuantumIR {
		if (!this.ir.hilbertSpace) {
			throw new Error('Hilbert space must be set');
		}
		if (!this.ir.initialState) {
			this.ir.initialState = { type: 'zero' };
		}
		if (!this.ir.validationConstraints) {
			this.ir.validationConstraints = {
				symmetryTolerance: 1e-10
			};
		}
		return this.ir as QuantumIR;
	}
}

/**
 * Common quantum algorithm templates
 */
export class QuantumAlgorithmTemplates {
	/**
	 * VQE (Variational Quantum Eigensolver) template
	 */
	static VQE(numQubits: number, depth: number): QuantumIR {
		const builder = new QuantumIRBuilder()
			.setHilbertSpace(numQubits)
			.setInitialState('zero')
			.setAlgorithm('VQE', 'VQE', { depth, optimizer: 'COBYLA' });

		// Hardware-efficient ansatz
		for (let layer = 0; layer < depth; layer++) {
			// Single-qubit rotations
			for (let q = 0; q < numQubits; q++) {
				builder.addGate({ type: 'RY', qubits: [q], parameters: [0] });
				builder.addGate({ type: 'RZ', qubits: [q], parameters: [0] });
			}
			
			// Entangling layer
			for (let q = 0; q < numQubits - 1; q++) {
				builder.addGate({ type: 'CNOT', qubits: [q, q + 1] });
			}
		}

		// Measurement in computational basis
		builder.addMeasurement({
			qubits: Array.from({ length: numQubits }, (_, i) => i),
			basis: 'computational'
		});

		return builder.build();
	}

	/**
	 * QAOA (Quantum Approximate Optimization Algorithm) template
	 */
	static QAOA(numQubits: number, layers: number): QuantumIR {
		const builder = new QuantumIRBuilder()
			.setHilbertSpace(numQubits)
			.setInitialState('plus')
			.setAlgorithm('QAOA', 'QAOA', { layers, optimizer: 'COBYLA' });

		// Initial superposition
		for (let q = 0; q < numQubits; q++) {
			builder.addGate({ type: 'H', qubits: [q] });
		}

		// QAOA layers: problem Hamiltonian + mixer
		for (let layer = 0; layer < layers; layer++) {
			// Problem Hamiltonian evolution (placeholder - needs problem specifics)
			for (let q = 0; q < numQubits - 1; q++) {
				builder.addGate({ type: 'CNOT', qubits: [q, q + 1] });
				builder.addGate({ type: 'RZ', qubits: [q + 1], parameters: [0] }); // gamma parameter
				builder.addGate({ type: 'CNOT', qubits: [q, q + 1] });
			}
			
			// Mixer Hamiltonian (X rotations)
			for (let q = 0; q < numQubits; q++) {
				builder.addGate({ type: 'RX', qubits: [q], parameters: [0] }); // beta parameter
			}
		}

		builder.addMeasurement({
			qubits: Array.from({ length: numQubits }, (_, i) => i),
			basis: 'computational'
		});

		return builder.build();
	}

	/**
	 * Bell state preparation
	 */
	static BellState(): QuantumIR {
		const builder = new QuantumIRBuilder()
			.setHilbertSpace(2)
			.setInitialState('zero')
			.setAlgorithm('Bell State', 'Custom', {})
			.addSymmetry({
				operator: 'Z⊗Z',
				eigenvalue: 1,
				description: 'Parity symmetry'
			});

		builder
			.addGate({ type: 'H', qubits: [0] })
			.addGate({ type: 'CNOT', qubits: [0, 1] })
			.addMeasurement({ qubits: [0, 1], basis: 'computational' });

		return builder.build();
	}

	/**
	 * Quantum Fourier Transform
	 */
	static QFT(numQubits: number): QuantumIR {
		const builder = new QuantumIRBuilder()
			.setHilbertSpace(numQubits)
			.setInitialState('zero')
			.setAlgorithm('QFT', 'Custom', { numQubits });

		// QFT circuit
		for (let j = 0; j < numQubits; j++) {
			builder.addGate({ type: 'H', qubits: [j] });
			
			for (let k = j + 1; k < numQubits; k++) {
				const angle = Math.PI / Math.pow(2, k - j);
				builder.addGate({ 
					type: 'U1', 
					qubits: [k], 
					parameters: [angle],
					label: `CP(π/2^${k-j})`
				});
			}
		}

		// SWAP gates for bit reversal
		for (let j = 0; j < Math.floor(numQubits / 2); j++) {
			builder.addGate({ 
				type: 'SWAP', 
				qubits: [j, numQubits - 1 - j] 
			});
		}

		return builder.build();
	}
}

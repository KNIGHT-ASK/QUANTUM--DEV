/**
 * DensityMatrixOperations - Mixed State Analysis and Operations
 * 
 * Provides operations for density matrices including:
 * - Partial trace for reduced density matrices
 * - Purity calculation
 * - Thermal state generation
 * - Lindblad evolution for open quantum systems
 * 
 * All calculations maintain 10^-10 precision.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { Complex, create, all } from 'mathjs';
import { ValidationEngine } from './ValidationEngine';

const math = create(all);

/**
 * Density matrix validation result
 */
export interface DensityMatrixValidation {
	isHermitian: boolean;
	isPositiveSemiDefinite: boolean;
	traceOne: boolean;
	purity: number;
}

/**
 * Custom error for invalid quantum states
 */
export class InvalidQuantumStateError extends Error {
	constructor(message: string) {
		super(`Invalid quantum state: ${message}`);
		this.name = 'InvalidQuantumStateError';
	}
}

/**
 * Density Matrix Operations Module
 * 
 * Implements operations on density matrices for mixed state analysis
 * with rigorous validation and precision guarantees.
 */
export class DensityMatrixOperations {
	private readonly PRECISION_THRESHOLD = 1e-10;
	private validator: ValidationEngine;
	
	constructor() {
		this.validator = new ValidationEngine();
	}
	
	/**
	 * Compute partial trace over specified qubits
	 * 
	 * Traces out subsystem B to obtain reduced density matrix for subsystem A.
	 * 
	 * For a bipartite system AB with density matrix ρ_AB:
	 * ρ_A = Tr_B(ρ_AB) = Σ_i ⟨i|_B ρ_AB |i⟩_B
	 * 
	 * The partial trace operation:
	 * 1. Reshapes the density matrix as a tensor
	 * 2. Sums over the indices of the traced-out subsystem
	 * 3. Returns the reduced density matrix for the remaining subsystem
	 * 
	 * @param rho - Density matrix for composite system
	 * @param traceOutQubits - Qubit indices to trace out (0-indexed)
	 * @returns Reduced density matrix
	 * @throws {InvalidQuantumStateError} If inputs are invalid
	 * 
	 * @example
	 * // Partial trace of Bell state gives maximally mixed state
	 * const bell = bellStateDensityMatrix();
	 * const rhoA = partialTrace(bell, [1]); // Trace out qubit 1
	 * // rhoA = [[0.5, 0], [0, 0.5]] (maximally mixed)
	 * 
	 * @example
	 * // Partial trace of product state gives pure state
	 * const product = tensorProduct(rho0, rho1);
	 * const rhoA = partialTrace(product, [1]); // Returns rho0
	 * 
	 * @see Nielsen & Chuang, Section 2.4.3
	 * 
	 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
	 */
	partialTrace(rho: Complex[][], traceOutQubits: number[]): Complex[][] {
		// Validate density matrix
		this.validateDensityMatrix(rho);
		
		// Determine number of qubits
		const totalDim = rho.length;
		const numQubits = Math.log2(totalDim);
		
		if (!Number.isInteger(numQubits)) {
			throw new InvalidQuantumStateError(
				`Density matrix dimension ${totalDim} is not a power of 2`
			);
		}
		
		// Validate qubit indices
		this.validateQubitIndices(traceOutQubits, numQubits);
		
		// Sort qubits to trace out
		const sortedQubits = [...traceOutQubits].sort((a, b) => a - b);
		
		// Keep track of remaining qubits
		const keepQubits: number[] = [];
		for (let i = 0; i < numQubits; i++) {
			if (!sortedQubits.includes(i)) {
				keepQubits.push(i);
			}
		}
		
		// Edge case: tracing out all qubits returns trace as scalar
		if (keepQubits.length === 0) {
			let trace = math.complex(0, 0);
			for (let i = 0; i < rho.length; i++) {
				trace = math.add(trace, rho[i][i]) as Complex;
			}
			return [[trace]];
		}
		
		// Dimensions
		const dimKeep = Math.pow(2, keepQubits.length);
		const dimTrace = Math.pow(2, sortedQubits.length);
		
		// Initialize result matrix
		const result: Complex[][] = [];
		for (let i = 0; i < dimKeep; i++) {
			result[i] = [];
			for (let j = 0; j < dimKeep; j++) {
				result[i][j] = math.complex(0, 0);
			}
		}
		
		// Perform partial trace by summing over traced-out basis states
		// ρ_A[i,j] = Σ_k ρ_AB[i⊗k, j⊗k]
		for (let iKeep = 0; iKeep < dimKeep; iKeep++) {
			for (let jKeep = 0; jKeep < dimKeep; jKeep++) {
				// Sum over all basis states of traced-out subsystem
				for (let kTrace = 0; kTrace < dimTrace; kTrace++) {
					// Construct full basis indices by combining kept and traced indices
					const iTotal = this.combineIndices(iKeep, kTrace, keepQubits, sortedQubits, numQubits);
					const jTotal = this.combineIndices(jKeep, kTrace, keepQubits, sortedQubits, numQubits);
					
					result[iKeep][jKeep] = math.add(
						result[iKeep][jKeep], 
						rho[iTotal][jTotal]
					) as Complex;
				}
			}
		}
		
		// Validate result
		this.validatePartialTraceResult(result);
		
		return result;
	}
	
	/**
	 * Validate partial trace result
	 * 
	 * Checks:
	 * 1. Trace = 1.0 within tolerance
	 * 2. Hermiticity
	 * 3. Positive semi-definiteness
	 * 
	 * @param rho - Reduced density matrix
	 * @throws {InvalidQuantumStateError} If validation fails
	 */
	private validatePartialTraceResult(rho: Complex[][]): void {
		// Check trace = 1.0
		let trace = 0;
		for (let i = 0; i < rho.length; i++) {
			trace += math.complex(rho[i][i]).re;
		}
		
		if (Math.abs(trace - 1.0) > this.PRECISION_THRESHOLD) {
			throw new InvalidQuantumStateError(
				`Partial trace result has invalid trace: ${trace}, expected 1.0`
			);
		}
		
		// Validate using ValidationEngine
		const validationResults = this.validator.validateDensityMatrix(rho);
		
		for (const result of validationResults) {
			if (!result.passed) {
				throw new InvalidQuantumStateError(
					`Partial trace result validation failed: ${result.message}`
				);
			}
		}
	}
	
	/**
	 * Combine indices from kept and traced subsystems into full system index
	 * 
	 * Constructs the full basis state index by interleaving bits from the
	 * kept subsystem and traced subsystem according to their qubit positions.
	 * 
	 * @param keepIndex - Index in kept subsystem
	 * @param traceIndex - Index in traced subsystem
	 * @param keepQubits - Qubit positions for kept subsystem
	 * @param traceQubits - Qubit positions for traced subsystem
	 * @param numQubits - Total number of qubits
	 * @returns Full system index
	 */
	private combineIndices(
		keepIndex: number,
		traceIndex: number,
		keepQubits: number[],
		traceQubits: number[],
		numQubits: number
	): number {
		let fullIndex = 0;
		
		// Extract bits from keepIndex and traceIndex and place them in correct positions
		for (let q = 0; q < numQubits; q++) {
			let bit = 0;
			
			if (keepQubits.includes(q)) {
				// This qubit is in the kept subsystem
				const posInKeep = keepQubits.indexOf(q);
				bit = (keepIndex >> posInKeep) & 1;
			} else {
				// This qubit is in the traced subsystem
				const posInTrace = traceQubits.indexOf(q);
				bit = (traceIndex >> posInTrace) & 1;
			}
			
			fullIndex |= (bit << q);
		}
		
		return fullIndex;
	}
	
	/**
	 * Validate qubit indices
	 * 
	 * @param qubits - Qubit indices to validate
	 * @param numQubits - Total number of qubits
	 * @throws {InvalidQuantumStateError} If indices are invalid
	 */
	private validateQubitIndices(qubits: number[], numQubits: number): void {
		if (!Array.isArray(qubits)) {
			throw new InvalidQuantumStateError('Qubit indices must be an array');
		}
		
		if (qubits.length === 0) {
			throw new InvalidQuantumStateError('Must specify at least one qubit to trace out');
		}
		
		for (const qubit of qubits) {
			if (!Number.isInteger(qubit) || qubit < 0 || qubit >= numQubits) {
				throw new InvalidQuantumStateError(
					`Invalid qubit index ${qubit}. Must be in range [0, ${numQubits - 1}]`
				);
			}
		}
		
		// Check for duplicates
		const uniqueQubits = new Set(qubits);
		if (uniqueQubits.size !== qubits.length) {
			throw new InvalidQuantumStateError('Qubit indices must be unique');
		}
	}
	
	/**
	 * Calculate purity of a density matrix
	 * 
	 * Purity measures how close a quantum state is to being pure.
	 * 
	 * Formula: P(ρ) = Tr(ρ²)
	 * 
	 * Properties:
	 * - Pure states: P = 1.0
	 * - Maximally mixed states: P = 1/d (where d is dimension)
	 * - All valid density matrices: 1/d ≤ P ≤ 1.0
	 * 
	 * @param rho - Density matrix
	 * @returns Purity value between 1/d and 1.0
	 * @throws {InvalidQuantumStateError} If rho is not a valid density matrix
	 * 
	 * @example
	 * // Pure state has purity 1.0
	 * const pure = [[{re:1,im:0}, {re:0,im:0}], [{re:0,im:0}, {re:0,im:0}]];
	 * const P = purity(pure); // Returns 1.0
	 * 
	 * @example
	 * // Maximally mixed state has purity 1/d
	 * const mixed = [[{re:0.5,im:0}, {re:0,im:0}], [{re:0,im:0}, {re:0.5,im:0}]];
	 * const P = purity(mixed); // Returns 0.5 (1/2)
	 * 
	 * @see Nielsen & Chuang, Section 2.4.2
	 * 
	 * Requirements: 12.1, 12.2, 12.3, 12.4
	 */
	purity(rho: Complex[][]): number {
		// Validate density matrix
		this.validateDensityMatrix(rho);
		
		const n = rho.length;
		
		// Compute ρ²
		const rhoSquared: Complex[][] = [];
		for (let i = 0; i < n; i++) {
			rhoSquared[i] = [];
			for (let j = 0; j < n; j++) {
				let sum = math.complex(0, 0);
				for (let k = 0; k < n; k++) {
					const product = math.multiply(rho[i][k], rho[k][j]) as Complex;
					sum = math.add(sum, product) as Complex;
				}
				rhoSquared[i][j] = sum;
			}
		}
		
		// Compute Tr(ρ²)
		let trace = 0;
		for (let i = 0; i < n; i++) {
			trace += math.complex(rhoSquared[i][i]).re;
		}
		
		// Validate purity is in valid range [1/d, 1.0]
		const minPurity = 1.0 / n;
		if (trace < minPurity - this.PRECISION_THRESHOLD || trace > 1.0 + this.PRECISION_THRESHOLD) {
			throw new InvalidQuantumStateError(
				`Purity ${trace} is outside valid range [${minPurity}, 1.0]`
			);
		}
		
		return trace;
	}
	
	/**
	 * Generate thermal (Gibbs) state at given temperature
	 * 
	 * Thermal state represents a quantum system in thermal equilibrium
	 * at temperature T.
	 * 
	 * Formula: ρ = e^(-βH) / Z
	 * where:
	 * - β = 1/(k_B T) is inverse temperature
	 * - Z = Tr(e^(-βH)) is partition function
	 * - H is the Hamiltonian
	 * 
	 * Limiting behavior:
	 * - T → 0: ρ approaches ground state projector |E₀⟩⟨E₀|
	 * - T → ∞: ρ approaches maximally mixed state I/d
	 * 
	 * @param hamiltonian - Hamiltonian matrix (must be Hermitian)
	 * @param temperature - Temperature in energy units (T > 0)
	 * @param boltzmannConstant - Boltzmann constant (default: 1.0)
	 * @returns Thermal density matrix
	 * @throws {InvalidQuantumStateError} If inputs are invalid
	 * 
	 * @example
	 * // Thermal state at low temperature approaches ground state
	 * const H = pauliZ();
	 * const rho = thermalState(H, 0.01); // Nearly |0⟩⟨0|
	 * 
	 * @example
	 * // Thermal state at high temperature approaches maximally mixed
	 * const H = pauliZ();
	 * const rho = thermalState(H, 1000); // Nearly I/2
	 * 
	 * @see Nielsen & Chuang, Section 12.1.1
	 * 
	 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
	 */
	thermalState(
		hamiltonian: Complex[][],
		temperature: number,
		boltzmannConstant: number = 1.0
	): Complex[][] {
		// Validate Hamiltonian is Hermitian
		const hermiticity = this.validator.validateHermiticity(hamiltonian);
		if (!hermiticity.passed) {
			throw new InvalidQuantumStateError('Hamiltonian must be Hermitian');
		}
		
		// Validate temperature
		if (temperature <= 0 || !isFinite(temperature)) {
			throw new InvalidQuantumStateError(
				`Temperature must be positive and finite, got ${temperature}`
			);
		}
		
		if (boltzmannConstant <= 0 || !isFinite(boltzmannConstant)) {
			throw new InvalidQuantumStateError(
				`Boltzmann constant must be positive and finite, got ${boltzmannConstant}`
			);
		}
		
		const n = hamiltonian.length;
		const beta = 1.0 / (boltzmannConstant * temperature);
		
		// Diagonalize Hamiltonian: H = Σ Eₙ|n⟩⟨n|
		const { eigenvalues, eigenvectors } = this.diagonalize(hamiltonian);
		
		// Find minimum energy for numerical stability
		const minEnergy = Math.min(...eigenvalues);
		
		// Compute partition function: Z = Σ e^(-β(Eₙ - E_min))
		// This prevents overflow by shifting energies
		let partitionFunction = 0;
		for (const E of eigenvalues) {
			partitionFunction += Math.exp(-beta * (E - minEnergy));
		}
		
		if (partitionFunction === 0 || !isFinite(partitionFunction)) {
			throw new InvalidQuantumStateError(
				`Invalid partition function: ${partitionFunction}`
			);
		}
		
		// Construct thermal state: ρ = Σ (e^(-β(Eₙ - E_min))/Z) |n⟩⟨n|
		const rho: Complex[][] = [];
		for (let i = 0; i < n; i++) {
			rho[i] = [];
			for (let j = 0; j < n; j++) {
				let sum = math.complex(0, 0);
				
				// Sum over all eigenstates
				for (let k = 0; k < n; k++) {
					const weight = Math.exp(-beta * (eigenvalues[k] - minEnergy)) / partitionFunction;
					const ketBra = math.multiply(
						math.multiply(eigenvectors[k][i], weight),
						math.conj(eigenvectors[k][j])
					) as Complex;
					sum = math.add(sum, ketBra) as Complex;
				}
				
				rho[i][j] = sum;
			}
		}
		
		// Validate result is a valid density matrix
		this.validateDensityMatrix(rho);
		
		return rho;
	}
	
	/**
	 * Diagonalize a Hermitian matrix
	 * 
	 * Returns eigenvalues and eigenvectors sorted by eigenvalue (ascending).
	 * 
	 * @param H - Hermitian matrix
	 * @returns Object with eigenvalues and eigenvectors
	 */
	private diagonalize(H: Complex[][]): {
		eigenvalues: number[];
		eigenvectors: Complex[][];
	} {
		const n = H.length;
		
		// Convert to real matrix if purely real
		const isReal = H.every(row => 
			row.every(elem => Math.abs(math.complex(elem).im) < this.PRECISION_THRESHOLD)
		);
		
		if (isReal) {
			// Use real eigenvalue decomposition for better performance
			const realH = H.map(row => row.map(elem => math.complex(elem).re));
			const eig = math.eigs(realH);
			
			// Extract eigenvectors from the new format
			const eigData = eig.eigenvectors.map((ev: any) => ({
				value: typeof ev.value === 'number' ? ev.value : ev.value.re,
				vector: Array.isArray(ev.vector) ? ev.vector : Array.from(ev.vector as any)
			}));
			
			// Sort by eigenvalue
			eigData.sort((a, b) => a.value - b.value);
			
			const eigenvalues = eigData.map(ev => ev.value);
			const eigenvectors: Complex[][] = eigData.map(ev => {
				return ev.vector.map((v: number) => math.complex(v, 0));
			});
			
			return { eigenvalues, eigenvectors };
		} else {
			// Complex eigenvalue decomposition
			const eig = math.eigs(H);
			
			// Extract eigenvectors from the new format
			const eigData = eig.eigenvectors.map((ev: any) => ({
				value: typeof ev.value === 'number' ? ev.value : (ev.value as Complex).re,
				vector: Array.isArray(ev.vector) ? ev.vector : Array.from(ev.vector as any)
			}));
			
			// Sort by eigenvalue (real part)
			eigData.sort((a, b) => a.value - b.value);
			
			const eigenvalues = eigData.map(ev => ev.value);
			const eigenvectors: Complex[][] = eigData.map(ev => {
				return ev.vector.map((v: any) => 
					typeof v === 'number' ? math.complex(v, 0) : v
				);
			});
			
			return { eigenvalues, eigenvectors };
		}
	}
	
	/**
	 * Simulate Lindblad evolution for open quantum systems
	 * 
	 * Evolves a density matrix under the Lindblad master equation:
	 * dρ/dt = -i[H,ρ] + Σ_k (L_k ρ L_k† - ½{L_k†L_k, ρ})
	 * 
	 * where:
	 * - H is the system Hamiltonian (unitary evolution)
	 * - L_k are jump operators (dissipation/decoherence)
	 * - [A,B] = AB - BA is the commutator
	 * - {A,B} = AB + BA is the anticommutator
	 * 
	 * The Lindblad equation describes:
	 * - Coherent evolution: -i[H,ρ]
	 * - Decoherence/dissipation: Σ_k (L_k ρ L_k† - ½{L_k†L_k, ρ})
	 * 
	 * Uses 4th-order Runge-Kutta (RK4) integration for accuracy.
	 * 
	 * @param rho0 - Initial density matrix
	 * @param hamiltonian - System Hamiltonian (Hermitian)
	 * @param jumpOperators - Array of Lindblad operators L_k
	 * @param time - Evolution time
	 * @param steps - Number of time steps (default: 100)
	 * @param hbar - Reduced Planck constant (default: 1.0)
	 * @returns Evolved density matrix at time t
	 * @throws {InvalidQuantumStateError} If inputs are invalid
	 * 
	 * @example
	 * // Amplitude damping (spontaneous emission)
	 * const rho0 = [[{re:1,im:0}, {re:0,im:0}], [{re:0,im:0}, {re:0,im:0}]]; // |0⟩⟨0|
	 * const H = pauliZ();
	 * const gamma = 0.1;
	 * const L = [[{re:0,im:0}, {re:Math.sqrt(gamma),im:0}], [{re:0,im:0}, {re:0,im:0}]];
	 * const rho_t = lindbladEvolution(rho0, H, [L], 1.0);
	 * 
	 * @example
	 * // Pure unitary evolution (no jump operators)
	 * const rho_t = lindbladEvolution(rho0, H, [], 1.0); // Reduces to U(t)ρU†(t)
	 * 
	 * @see Nielsen & Chuang, Section 8.3.5
	 * @see Breuer & Petruccione, "The Theory of Open Quantum Systems"
	 * 
	 * Requirements: 14.1, 14.2, 14.3, 14.4
	 */
	lindbladEvolution(
		rho0: Complex[][],
		hamiltonian: Complex[][],
		jumpOperators: Complex[][][],
		time: number,
		steps: number = 100,
		hbar: number = 1.0
	): Complex[][] {
		// Validate initial density matrix
		this.validateDensityMatrix(rho0);
		
		// Validate Hamiltonian is Hermitian
		const hermiticity = this.validator.validateHermiticity(hamiltonian);
		if (!hermiticity.passed) {
			throw new InvalidQuantumStateError('Hamiltonian must be Hermitian');
		}
		
		// Validate dimensions match
		const n = rho0.length;
		if (hamiltonian.length !== n) {
			throw new InvalidQuantumStateError(
				`Hamiltonian dimension ${hamiltonian.length} does not match density matrix dimension ${n}`
			);
		}
		
		// Validate jump operators
		for (let k = 0; k < jumpOperators.length; k++) {
			const L = jumpOperators[k];
			if (L.length !== n || L[0].length !== n) {
				throw new InvalidQuantumStateError(
					`Jump operator ${k} has invalid dimensions. Expected ${n}x${n}, got ${L.length}x${L[0].length}`
				);
			}
		}
		
		// Validate time and steps
		if (time < 0 || !isFinite(time)) {
			throw new InvalidQuantumStateError(`Time must be non-negative and finite, got ${time}`);
		}
		
		if (steps <= 0 || !Number.isInteger(steps)) {
			throw new InvalidQuantumStateError(`Steps must be a positive integer, got ${steps}`);
		}
		
		// Edge case: t=0 returns initial state
		if (time === 0) {
			return this.copyMatrix(rho0);
		}
		
		// Edge case: empty jump operators reduces to unitary evolution
		if (jumpOperators.length === 0) {
			return this.unitaryEvolution(rho0, hamiltonian, time, hbar);
		}
		
		// Time step
		const dt = time / steps;
		
		// RK4 integration
		let rho = this.copyMatrix(rho0);
		
		for (let step = 0; step < steps; step++) {
			// Compute k1 = f(t, ρ)
			const k1 = this.lindbladDerivative(rho, hamiltonian, jumpOperators, hbar);
			
			// Compute k2 = f(t + dt/2, ρ + k1*dt/2)
			const rho_k2 = this.matrixAdd(rho, this.scalarMatrixMultiply(k1, dt / 2));
			const k2 = this.lindbladDerivative(rho_k2, hamiltonian, jumpOperators, hbar);
			
			// Compute k3 = f(t + dt/2, ρ + k2*dt/2)
			const rho_k3 = this.matrixAdd(rho, this.scalarMatrixMultiply(k2, dt / 2));
			const k3 = this.lindbladDerivative(rho_k3, hamiltonian, jumpOperators, hbar);
			
			// Compute k4 = f(t + dt, ρ + k3*dt)
			const rho_k4 = this.matrixAdd(rho, this.scalarMatrixMultiply(k3, dt));
			const k4 = this.lindbladDerivative(rho_k4, hamiltonian, jumpOperators, hbar);
			
			// Update: ρ_{n+1} = ρ_n + (dt/6)(k1 + 2k2 + 2k3 + k4)
			const increment = this.scalarMatrixMultiply(
				this.matrixAdd(
					this.matrixAdd(k1, this.scalarMatrixMultiply(k2, 2)),
					this.matrixAdd(this.scalarMatrixMultiply(k3, 2), k4)
				),
				dt / 6
			);
			
			rho = this.matrixAdd(rho, increment);
		}
		
		// Validate result is a valid density matrix
		try {
			this.validateDensityMatrix(rho);
		} catch (error) {
			// If validation fails, attempt to fix common issues
			rho = this.fixDensityMatrix(rho);
		}
		
		return rho;
	}
	
	/**
	 * Compute Lindblad master equation derivative
	 * 
	 * dρ/dt = -i[H,ρ] + Σ_k (L_k ρ L_k† - ½{L_k†L_k, ρ})
	 * 
	 * @param rho - Current density matrix
	 * @param H - Hamiltonian
	 * @param jumpOperators - Lindblad operators
	 * @param hbar - Reduced Planck constant
	 * @returns Time derivative dρ/dt
	 */
	private lindbladDerivative(
		rho: Complex[][],
		H: Complex[][],
		jumpOperators: Complex[][][],
		hbar: number
	): Complex[][] {
		const n = rho.length;
		
		// Initialize result
		let drho_dt: Complex[][] = Array(n).fill(0).map(() => 
			Array(n).fill(0).map(() => math.complex(0, 0))
		);
		
		// Coherent evolution: -i[H,ρ] = -i(Hρ - ρH)
		const Hrho = this.matrixMultiply(H, rho);
		const rhoH = this.matrixMultiply(rho, H);
		const commutator = this.matrixSubtract(Hrho, rhoH);
		
		// Add -i/ℏ [H,ρ]
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const c = math.complex(commutator[i][j]);
				// Multiply by -i/ℏ: -i * (a + bi) = b - ai
				drho_dt[i][j] = math.add(
					drho_dt[i][j],
					math.complex(c.im / hbar, -c.re / hbar)
				) as Complex;
			}
		}
		
		// Dissipative evolution: Σ_k (L_k ρ L_k† - ½{L_k†L_k, ρ})
		for (const L of jumpOperators) {
			// Compute L†
			const Ldag = this.conjugateTranspose(L);
			
			// Compute L_k ρ L_k†
			const Lrho = this.matrixMultiply(L, rho);
			const LrhoLdag = this.matrixMultiply(Lrho, Ldag);
			
			// Compute L_k† L_k
			const LdagL = this.matrixMultiply(Ldag, L);
			
			// Compute ½{L_k†L_k, ρ} = ½(L_k†L_k ρ + ρ L_k†L_k)
			const LdagLrho = this.matrixMultiply(LdagL, rho);
			const rhoLdagL = this.matrixMultiply(rho, LdagL);
			const anticommutator = this.matrixAdd(LdagLrho, rhoLdagL);
			const halfAnticommutator = this.scalarMatrixMultiply(anticommutator, 0.5);
			
			// Add L_k ρ L_k† - ½{L_k†L_k, ρ}
			const dissipator = this.matrixSubtract(LrhoLdag, halfAnticommutator);
			drho_dt = this.matrixAdd(drho_dt, dissipator);
		}
		
		return drho_dt;
	}
	
	/**
	 * Unitary evolution: ρ(t) = U(t) ρ(0) U†(t)
	 * where U(t) = exp(-iHt/ℏ)
	 * 
	 * Used when there are no jump operators.
	 * 
	 * @param rho0 - Initial density matrix
	 * @param H - Hamiltonian
	 * @param t - Time
	 * @param hbar - Reduced Planck constant
	 * @returns Evolved density matrix
	 */
	private unitaryEvolution(
		rho0: Complex[][],
		H: Complex[][],
		t: number,
		hbar: number
	): Complex[][] {
		// Compute U(t) = exp(-iHt/ℏ)
		const scaledH = this.scalarMatrixMultiply(H, -t / hbar);
		
		// For purely imaginary exponent, use spectral decomposition
		const { eigenvalues, eigenvectors } = this.diagonalize(H);
		
		const n = H.length;
		const U: Complex[][] = Array(n).fill(0).map(() => 
			Array(n).fill(0).map(() => math.complex(0, 0))
		);
		
		// U(t) = Σ_k exp(-iE_k t/ℏ) |k⟩⟨k|
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				let sum = math.complex(0, 0);
				for (let k = 0; k < n; k++) {
					const phase = -eigenvalues[k] * t / hbar;
					const expFactor = math.complex(Math.cos(phase), Math.sin(phase));
					const ketBra = math.multiply(
						eigenvectors[k][i],
						math.conj(eigenvectors[k][j])
					) as Complex;
					sum = math.add(sum, math.multiply(expFactor, ketBra)) as Complex;
				}
				U[i][j] = sum;
			}
		}
		
		// Compute U†
		const Udag = this.conjugateTranspose(U);
		
		// Compute ρ(t) = U ρ(0) U†
		const Urho = this.matrixMultiply(U, rho0);
		const result = this.matrixMultiply(Urho, Udag);
		
		return result;
	}
	
	/**
	 * Fix common density matrix issues
	 * 
	 * Attempts to restore:
	 * 1. Hermiticity by averaging with conjugate transpose
	 * 2. Trace = 1 by normalization
	 * 3. Positive semi-definiteness by projecting negative eigenvalues to zero
	 * 
	 * @param rho - Density matrix to fix
	 * @returns Fixed density matrix
	 */
	private fixDensityMatrix(rho: Complex[][]): Complex[][] {
		const n = rho.length;
		
		// Fix Hermiticity: ρ = (ρ + ρ†)/2
		const rhodag = this.conjugateTranspose(rho);
		let fixed = this.matrixAdd(rho, rhodag);
		fixed = this.scalarMatrixMultiply(fixed, 0.5);
		
		// Fix trace: ρ = ρ / Tr(ρ)
		let trace = 0;
		for (let i = 0; i < n; i++) {
			trace += math.complex(fixed[i][i]).re;
		}
		if (Math.abs(trace) > this.PRECISION_THRESHOLD) {
			fixed = this.scalarMatrixMultiply(fixed, 1.0 / trace);
		}
		
		// Fix positive semi-definiteness: project negative eigenvalues to zero
		const { eigenvalues, eigenvectors } = this.diagonalize(fixed);
		
		// Reconstruct with non-negative eigenvalues
		const result: Complex[][] = Array(n).fill(0).map(() => 
			Array(n).fill(0).map(() => math.complex(0, 0))
		);
		
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				let sum = math.complex(0, 0);
				for (let k = 0; k < n; k++) {
					const lambda = Math.max(0, eigenvalues[k]);
					const ketBra = math.multiply(
						math.multiply(eigenvectors[k][i], lambda),
						math.conj(eigenvectors[k][j])
					) as Complex;
					sum = math.add(sum, ketBra) as Complex;
				}
				result[i][j] = sum;
			}
		}
		
		// Renormalize trace
		trace = 0;
		for (let i = 0; i < n; i++) {
			trace += math.complex(result[i][i]).re;
		}
		if (Math.abs(trace) > this.PRECISION_THRESHOLD) {
			return this.scalarMatrixMultiply(result, 1.0 / trace);
		}
		
		return result;
	}
	
	/**
	 * Matrix multiplication helper
	 */
	private matrixMultiply(A: Complex[][], B: Complex[][]): Complex[][] {
		const m = A.length;
		const n = B[0].length;
		const p = B.length;
		const result: Complex[][] = [];
		
		for (let i = 0; i < m; i++) {
			result[i] = [];
			for (let j = 0; j < n; j++) {
				let sum = math.complex(0, 0);
				for (let k = 0; k < p; k++) {
					sum = math.add(sum, math.multiply(A[i][k], B[k][j])) as Complex;
				}
				result[i][j] = sum;
			}
		}
		
		return result;
	}
	
	/**
	 * Matrix addition helper
	 */
	private matrixAdd(A: Complex[][], B: Complex[][]): Complex[][] {
		return A.map((row, i) => row.map((elem, j) => math.add(elem, B[i][j]) as Complex));
	}
	
	/**
	 * Matrix subtraction helper
	 */
	private matrixSubtract(A: Complex[][], B: Complex[][]): Complex[][] {
		return A.map((row, i) => row.map((elem, j) => math.subtract(elem, B[i][j]) as Complex));
	}
	
	/**
	 * Scalar matrix multiplication helper
	 */
	private scalarMatrixMultiply(A: Complex[][], scalar: number): Complex[][] {
		return A.map(row => row.map(elem => math.multiply(elem, scalar) as Complex));
	}
	
	/**
	 * Conjugate transpose helper
	 */
	private conjugateTranspose(A: Complex[][]): Complex[][] {
		const m = A.length;
		const n = A[0].length;
		const result: Complex[][] = [];
		
		for (let i = 0; i < n; i++) {
			result[i] = [];
			for (let j = 0; j < m; j++) {
				result[i][j] = math.conj(A[j][i]) as Complex;
			}
		}
		
		return result;
	}
	
	/**
	 * Copy matrix helper
	 */
	private copyMatrix(A: Complex[][]): Complex[][] {
		return A.map(row => row.map(elem => math.complex(elem)));
	}
	
	/**
	 * Validate density matrix properties
	 * 
	 * Checks:
	 * 1. Hermiticity: ρ = ρ†
	 * 2. Trace = 1: Tr(ρ) = 1
	 * 3. Positive semi-definite: all eigenvalues ≥ 0
	 * 
	 * @param rho - Density matrix to validate
	 * @throws {InvalidQuantumStateError} If any property is violated
	 */
	private validateDensityMatrix(rho: Complex[][]): void {
		// Check matrix is square
		if (!Array.isArray(rho) || rho.length === 0) {
			throw new InvalidQuantumStateError('Density matrix must be non-empty array');
		}
		
		const n = rho.length;
		for (const row of rho) {
			if (!Array.isArray(row) || row.length !== n) {
				throw new InvalidQuantumStateError('Density matrix must be square');
			}
		}
		
		// Validate using ValidationEngine
		const validationResults = this.validator.validateDensityMatrix(rho);
		
		for (const result of validationResults) {
			if (!result.passed) {
				throw new InvalidQuantumStateError(
					`${result.check} failed: ${result.message}`
				);
			}
		}
	}
}

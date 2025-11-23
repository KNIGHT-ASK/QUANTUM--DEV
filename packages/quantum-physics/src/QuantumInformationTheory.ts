/**
 * QuantumInformationTheory - Entropy and Entanglement Measures
 * 
 * Provides quantum information theory tools including:
 * - Von Neumann entropy for density matrices
 * - Entanglement measures (entropy, negativity, concurrence)
 * - Quantum mutual information
 * 
 * All calculations maintain 10^-10 precision.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { Complex, create, all } from 'mathjs';
import { NumericalMethods } from './NumericalMethods';
import { ValidationEngine } from './ValidationEngine';

const math = create(all);

/**
 * Entropy calculation result with metadata
 */
export interface EntropyResult {
	entropy: number;              // In bits
	eigenvalues: number[];        // Of density matrix
	rank: number;                 // Number of non-zero eigenvalues
}

/**
 * Entanglement analysis result
 */
export interface EntanglementAnalysis {
	vonNeumannEntropy: number;
	negativity: number;
	concurrence?: number;         // Only for 2-qubit systems
	isPureState: boolean;
	isSeparable: boolean;
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
 * Quantum Information Theory Module
 * 
 * Implements entropy calculations and entanglement measures
 * with rigorous validation and precision guarantees.
 */
export class QuantumInformationTheory {
	private readonly PRECISION_THRESHOLD = 1e-10;
	private numericalMethods: NumericalMethods;
	private validator: ValidationEngine;
	
	constructor() {
		this.numericalMethods = new NumericalMethods();
		this.validator = new ValidationEngine();
	}
	
	/**
	 * Compute von Neumann entropy of a density matrix
	 * 
	 * The von Neumann entropy quantifies the quantum information content
	 * and mixedness of a quantum state. For pure states S=0, for maximally
	 * mixed states S=log₂(d).
	 * 
	 * Formula: S(ρ) = -Tr(ρ log₂ ρ) = -Σᵢ λᵢ log₂(λᵢ)
	 * 
	 * @param rho - Density matrix (must be Hermitian, positive semidefinite, Tr(ρ)=1)
	 * @returns Entropy in bits (0 ≤ S ≤ log₂(d))
	 * @throws {InvalidQuantumStateError} If ρ is not a valid density matrix
	 * 
	 * @example
	 * // Pure state has zero entropy
	 * const pure = [[{re:1,im:0}, {re:0,im:0}], [{re:0,im:0}, {re:0,im:0}]];
	 * const S = vonNeumannEntropy(pure); // Returns 0.0
	 * 
	 * @example
	 * // Maximally mixed state
	 * const mixed = [[{re:0.5,im:0}, {re:0,im:0}], [{re:0,im:0}, {re:0.5,im:0}]];
	 * const S = vonNeumannEntropy(mixed); // Returns 1.0
	 * 
	 * @see {@link https://en.wikipedia.org/wiki/Von_Neumann_entropy}
	 * @see Nielsen & Chuang, "Quantum Computation and Quantum Information", Section 11.3
	 * 
	 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
	 */
	vonNeumannEntropy(rho: Complex[][]): number {
		// Validate density matrix properties
		this.validateDensityMatrix(rho);
		
		// Diagonalize density matrix to get eigenvalues
		const eigenResult = this.numericalMethods.jacobiEigenvalues(rho);
		
		if (!eigenResult.converged) {
			throw new InvalidQuantumStateError(
				`Eigendecomposition failed to converge after ${eigenResult.iterations} iterations`
			);
		}
		
		// Compute S = -Σᵢ λᵢ log₂(λᵢ)
		// Only include eigenvalues above threshold (treat smaller as zero)
		let entropy = 0;
		for (const lambda of eigenResult.eigenvalues) {
			if (lambda > this.PRECISION_THRESHOLD) {
				// S += -λ log₂(λ)
				entropy -= lambda * Math.log2(lambda);
			}
		}
		
		// Ensure non-negative (numerical errors might give tiny negative values)
		entropy = Math.max(0, entropy);
		
		return entropy;
	}
	
	/**
	 * Compute entanglement entropy for a bipartite pure state
	 * 
	 * For a pure state |ψ⟩_AB, the entanglement entropy is the von Neumann
	 * entropy of the reduced density matrix: S(ρ_A) where ρ_A = Tr_B(|ψ⟩⟨ψ|)
	 * 
	 * This quantifies the amount of entanglement between subsystems A and B.
	 * - S = 0: Product state (no entanglement)
	 * - S = log₂(d): Maximally entangled state
	 * 
	 * Formula: S(ρ_A) = -Tr(ρ_A log₂ ρ_A)
	 * 
	 * @param psi - Pure state vector for the composite system
	 * @param subsystemA - Qubit indices for subsystem A (0-indexed)
	 * @returns Entanglement entropy in bits
	 * @throws {InvalidQuantumStateError} If inputs are invalid
	 * 
	 * @example
	 * // Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 has 1 bit of entanglement
	 * const bell = [
	 *   math.complex(1/Math.sqrt(2), 0),
	 *   math.complex(0, 0),
	 *   math.complex(0, 0),
	 *   math.complex(1/Math.sqrt(2), 0)
	 * ];
	 * const S = qit.entanglementEntropy(bell, [0]); // Returns 1.0
	 * 
	 * @see Nielsen & Chuang, Section 11.3.4
	 * 
	 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
	 */
	entanglementEntropy(psi: Complex[], subsystemA: number[]): number {
		// Validate state vector
		this.validateStateVector(psi);
		
		// Determine number of qubits
		const totalDim = psi.length;
		const numQubits = Math.log2(totalDim);
		
		if (!Number.isInteger(numQubits)) {
			throw new InvalidQuantumStateError(
				`State vector dimension ${totalDim} is not a power of 2`
			);
		}
		
		// Validate subsystem indices
		this.validateSubsystemIndices(subsystemA, numQubits);
		
		// Convert pure state to density matrix: ρ = |ψ⟩⟨ψ|
		const rho = this.pureStateToDensityMatrix(psi);
		
		// Compute partial trace to get reduced density matrix for subsystem A
		const subsystemB = this.getComplementarySubsystem(subsystemA, numQubits);
		const rhoA = this.partialTrace(rho, subsystemB, numQubits);
		
		// Compute von Neumann entropy of reduced state
		return this.vonNeumannEntropy(rhoA);
	}
	
	/**
	 * Compute quantum mutual information
	 * 
	 * Measures total correlations (classical + quantum) between subsystems A and B.
	 * 
	 * Formula: I(A:B) = S(ρ_A) + S(ρ_B) - S(ρ_AB)
	 * 
	 * Properties:
	 * - I(A:B) ≥ 0 (non-negative)
	 * - I(A:B) = 0 for independent subsystems
	 * - I(A:B) > 0 for correlated subsystems
	 * 
	 * @param rho - Density matrix for the composite system AB
	 * @param subsystemA - Qubit indices for subsystem A
	 * @param subsystemB - Qubit indices for subsystem B
	 * @returns Mutual information in bits
	 * @throws {InvalidQuantumStateError} If inputs are invalid
	 * 
	 * @example
	 * // Independent subsystems have I(A:B) = 0
	 * const product = tensorProduct(rhoA, rhoB);
	 * const I = qit.quantumMutualInformation(product, [0], [1]); // Returns 0.0
	 * 
	 * @see Nielsen & Chuang, Section 11.3.5
	 * 
	 * Requirements: 5.1, 5.2, 5.3, 5.4
	 */
	quantumMutualInformation(
		rho: Complex[][], 
		subsystemA: number[], 
		subsystemB: number[]
	): number {
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
		
		// Validate subsystem indices
		this.validateSubsystemIndices(subsystemA, numQubits);
		this.validateSubsystemIndices(subsystemB, numQubits);
		
		// Check for overlap between subsystems
		const overlap = subsystemA.filter(q => subsystemB.includes(q));
		if (overlap.length > 0) {
			throw new InvalidQuantumStateError(
				`Subsystems A and B must be disjoint. Overlapping qubits: ${overlap}`
			);
		}
		
		// Compute reduced density matrices
		const complementA = this.getComplementarySubsystem(subsystemA, numQubits);
		const complementB = this.getComplementarySubsystem(subsystemB, numQubits);
		
		const rhoA = this.partialTrace(rho, complementA, numQubits);
		const rhoB = this.partialTrace(rho, complementB, numQubits);
		
		// Compute entropies
		const SA = this.vonNeumannEntropy(rhoA);
		const SB = this.vonNeumannEntropy(rhoB);
		const SAB = this.vonNeumannEntropy(rho);
		
		// I(A:B) = S(A) + S(B) - S(AB)
		const mutualInfo = SA + SB - SAB;
		
		// Ensure non-negative (numerical errors might give tiny negative values)
		return Math.max(0, mutualInfo);
	}
	
	/**
	 * Compute negativity for mixed states
	 * 
	 * Negativity is an entanglement measure for mixed states based on the
	 * partial transpose criterion. A state is separable if and only if its
	 * partial transpose is positive semidefinite.
	 * 
	 * Formula: N(ρ) = (||ρ^{T_A}||₁ - 1) / 2
	 * where ||M||₁ = Tr(√(M†M)) is the trace norm
	 * 
	 * Properties:
	 * - N(ρ) = 0 for separable states
	 * - N(ρ) > 0 for entangled states
	 * - 0 ≤ N(ρ) ≤ (d-1)/2 where d is dimension
	 * 
	 * @param rho - Density matrix for the composite system
	 * @param partition - Qubit indices for subsystem A (to transpose)
	 * @returns Negativity value
	 * @throws {InvalidQuantumStateError} If inputs are invalid
	 * 
	 * @example
	 * // Separable state has negativity = 0
	 * const separable = tensorProduct(rhoA, rhoB);
	 * const N = qit.negativity(separable, [0]); // Returns 0.0
	 * 
	 * @example
	 * // Bell state has positive negativity
	 * const bell = bellStateDensityMatrix();
	 * const N = qit.negativity(bell, [0]); // Returns 0.5
	 * 
	 * @see Peres-Horodecki criterion (PPT criterion)
	 * @see Vidal & Werner, Phys. Rev. A 65, 032314 (2002)
	 * 
	 * Requirements: 6.1, 6.2, 6.3, 6.4
	 */
	negativity(rho: Complex[][], partition: number[]): number {
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
		
		// Validate partition indices
		this.validateSubsystemIndices(partition, numQubits);
		
		// Compute partial transpose with respect to subsystem A
		const rhoTA = this.partialTranspose(rho, partition, numQubits);
		
		// Compute trace norm: ||M||₁ = Tr(√(M†M))
		// For Hermitian matrices: ||M||₁ = Σ|λᵢ|
		const traceNorm = this.computeTraceNorm(rhoTA);
		
		// Negativity: N = (||ρ^{T_A}||₁ - 1) / 2
		const negativity = (traceNorm - 1.0) / 2.0;
		
		// Ensure non-negative (numerical errors might give tiny negative values)
		return Math.max(0, negativity);
	}
	
	/**
	 * Compute concurrence for two-qubit systems
	 * 
	 * Concurrence is an entanglement measure specifically for two-qubit
	 * density matrices. It ranges from 0 (separable) to 1 (maximally entangled).
	 * 
	 * Formula: C(ρ) = max(0, √λ₁ - √λ₂ - √λ₃ - √λ₄)
	 * where λᵢ are eigenvalues (in descending order) of ρ(σʸ⊗σʸ)ρ*(σʸ⊗σʸ)
	 * 
	 * Properties:
	 * - C(ρ) = 0 for separable states
	 * - C(ρ) = 1 for maximally entangled Bell states
	 * - 0 ≤ C(ρ) ≤ 1
	 * 
	 * @param rho - Two-qubit density matrix (4×4)
	 * @returns Concurrence value
	 * @throws {InvalidQuantumStateError} If not a two-qubit system
	 * 
	 * @example
	 * // Bell state has concurrence = 1
	 * const bell = bellStateDensityMatrix();
	 * const C = qit.concurrence(bell); // Returns 1.0
	 * 
	 * @example
	 * // Separable state has concurrence = 0
	 * const separable = tensorProduct(rhoA, rhoB);
	 * const C = qit.concurrence(separable); // Returns 0.0
	 * 
	 * @see Wootters, Phys. Rev. Lett. 80, 2245 (1998)
	 * 
	 * Requirements: 7.1, 7.2, 7.3, 7.4
	 */
	concurrence(rho: Complex[][]): number {
		// Validate density matrix
		this.validateDensityMatrix(rho);
		
		// Check dimension is 4×4 (two qubits)
		if (rho.length !== 4) {
			throw new InvalidQuantumStateError(
				`Concurrence requires a two-qubit system (4×4 matrix). Got ${rho.length}×${rho.length}`
			);
		}
		
		// Pauli Y matrix: σʸ = [[0, -i], [i, 0]]
		const pauliY: Complex[][] = [
			[math.complex(0, 0), math.complex(0, -1)],
			[math.complex(0, 1), math.complex(0, 0)]
		];
		
		// Compute σʸ ⊗ σʸ
		const spinFlip = this.tensorProduct(pauliY, pauliY);
		
		// Compute ρ* (complex conjugate, not Hermitian conjugate)
		const rhoConj = this.complexConjugate(rho);
		
		// Compute R = ρ (σʸ⊗σʸ) ρ* (σʸ⊗σʸ)
		const temp1 = this.matrixMultiply(rho, spinFlip);
		const temp2 = this.matrixMultiply(temp1, rhoConj);
		const R = this.matrixMultiply(temp2, spinFlip);
		
		// R should be Hermitian, but numerical errors might make it slightly non-Hermitian
		// Symmetrize it: R_sym = (R + R†)/2
		const RHermitian = this.symmetrizeMatrix(R);
		
		// Compute eigenvalues of R
		const eigenResult = this.numericalMethods.jacobiEigenvalues(RHermitian);
		
		if (!eigenResult.converged) {
			// If Jacobi fails, try computing eigenvalues directly from characteristic polynomial
			// For 4×4 matrices, we can use a more robust approach
			throw new InvalidQuantumStateError(
				`Eigendecomposition failed to converge for concurrence calculation after ${eigenResult.iterations} iterations`
			);
		}
		
		// Sort eigenvalues in descending order
		const eigenvalues = [...eigenResult.eigenvalues].sort((a, b) => b - a);
		
		// Take square roots (ensure non-negative due to numerical errors)
		const sqrtEigenvalues = eigenvalues.map(lambda => Math.sqrt(Math.max(0, lambda)));
		
		// C = max(0, √λ₁ - √λ₂ - √λ₃ - √λ₄)
		const concurrence = Math.max(
			0,
			sqrtEigenvalues[0] - sqrtEigenvalues[1] - sqrtEigenvalues[2] - sqrtEigenvalues[3]
		);
		
		return concurrence;
	}
	
	/**
	 * Compute partial transpose with respect to specified subsystem
	 * 
	 * The partial transpose is obtained by transposing only the indices
	 * corresponding to the specified subsystem.
	 * 
	 * @param rho - Density matrix
	 * @param transposeQubits - Qubit indices to transpose
	 * @param numQubits - Total number of qubits
	 * @returns Partially transposed density matrix
	 */
	private partialTranspose(
		rho: Complex[][],
		transposeQubits: number[],
		numQubits: number
	): Complex[][] {
		const dim = rho.length;
		const result: Complex[][] = [];
		
		// Initialize result matrix
		for (let i = 0; i < dim; i++) {
			result[i] = [];
			for (let j = 0; j < dim; j++) {
				result[i][j] = math.complex(0, 0);
			}
		}
		
		// Perform partial transpose
		for (let i = 0; i < dim; i++) {
			for (let j = 0; j < dim; j++) {
				// Convert indices to binary representation
				const iBits = this.indexToBits(i, numQubits);
				const jBits = this.indexToBits(j, numQubits);
				
				// Swap bits for transposed qubits
				const iTransposed = [...iBits];
				const jTransposed = [...jBits];
				
				for (const qubit of transposeQubits) {
					const temp = iTransposed[qubit];
					iTransposed[qubit] = jTransposed[qubit];
					jTransposed[qubit] = temp;
				}
				
				// Convert back to indices
				const iNew = this.bitsToIndex(iTransposed);
				const jNew = this.bitsToIndex(jTransposed);
				
				// Copy element with transposed indices
				result[iNew][jNew] = rho[i][j];
			}
		}
		
		return result;
	}
	
	/**
	 * Compute trace norm of a matrix: ||M||₁ = Tr(√(M†M))
	 * 
	 * For Hermitian matrices: ||M||₁ = Σ|λᵢ|
	 */
	private computeTraceNorm(M: Complex[][]): number {
		// For Hermitian matrices, trace norm is sum of absolute eigenvalues
		const eigenResult = this.numericalMethods.jacobiEigenvalues(M);
		
		if (!eigenResult.converged) {
			throw new InvalidQuantumStateError(
				`Eigendecomposition failed to converge for trace norm calculation`
			);
		}
		
		// Sum absolute values of eigenvalues
		let traceNorm = 0;
		for (const lambda of eigenResult.eigenvalues) {
			traceNorm += Math.abs(lambda);
		}
		
		return traceNorm;
	}
	
	/**
	 * Compute tensor product of two matrices: A ⊗ B
	 */
	private tensorProduct(A: Complex[][], B: Complex[][]): Complex[][] {
		const m = A.length;
		const n = B.length;
		const result: Complex[][] = [];
		
		for (let i = 0; i < m * n; i++) {
			result[i] = [];
			for (let j = 0; j < m * n; j++) {
				const iA = Math.floor(i / n);
				const iB = i % n;
				const jA = Math.floor(j / n);
				const jB = j % n;
				
				result[i][j] = math.multiply(A[iA][jA], B[iB][jB]) as Complex;
			}
		}
		
		return result;
	}
	
	/**
	 * Compute complex conjugate of a matrix (not Hermitian conjugate)
	 */
	private complexConjugate(M: Complex[][]): Complex[][] {
		const result: Complex[][] = [];
		
		for (let i = 0; i < M.length; i++) {
			result[i] = [];
			for (let j = 0; j < M[i].length; j++) {
				result[i][j] = math.conj(M[i][j]) as Complex;
			}
		}
		
		return result;
	}
	
	/**
	 * Matrix multiplication
	 */
	private matrixMultiply(A: Complex[][], B: Complex[][]): Complex[][] {
		const m = A.length;
		const n = B[0].length;
		const p = B.length;
		
		const result: Complex[][] = [];
		
		for (let i = 0; i < m; i++) {
			result[i] = [];
			for (let j = 0; j < n; j++) {
				result[i][j] = math.complex(0, 0);
				
				for (let k = 0; k < p; k++) {
					result[i][j] = math.add(
						result[i][j],
						math.multiply(A[i][k], B[k][j])
					) as Complex;
				}
			}
		}
		
		return result;
	}
	
	/**
	 * Symmetrize a matrix to ensure it's Hermitian: M_sym = (M + M†)/2
	 */
	private symmetrizeMatrix(M: Complex[][]): Complex[][] {
		const n = M.length;
		const result: Complex[][] = [];
		
		for (let i = 0; i < n; i++) {
			result[i] = [];
			for (let j = 0; j < n; j++) {
				// M_sym[i][j] = (M[i][j] + conj(M[j][i])) / 2
				const sum = math.add(M[i][j], math.conj(M[j][i])) as Complex;
				result[i][j] = math.divide(sum, 2) as Complex;
			}
		}
		
		return result;
	}
	
	/**
	 * Convert index to binary representation
	 */
	private indexToBits(index: number, numBits: number): number[] {
		const bits: number[] = [];
		for (let i = 0; i < numBits; i++) {
			bits.push((index >> i) & 1);
		}
		return bits;
	}
	
	/**
	 * Convert binary representation to index
	 */
	private bitsToIndex(bits: number[]): number {
		let index = 0;
		for (let i = 0; i < bits.length; i++) {
			index |= (bits[i] << i);
		}
		return index;
	}
	
	/**
	 * Compute partial trace over specified qubits
	 * 
	 * Traces out subsystem B to obtain reduced density matrix for subsystem A.
	 * 
	 * For a bipartite system AB with density matrix ρ_AB:
	 * ρ_A = Tr_B(ρ_AB) = Σ_i ⟨i|_B ρ_AB |i⟩_B
	 * 
	 * @param rho - Density matrix for composite system
	 * @param traceOutQubits - Qubit indices to trace out (0-indexed)
	 * @param numQubits - Total number of qubits
	 * @returns Reduced density matrix
	 * 
	 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
	 */
	private partialTrace(
		rho: Complex[][], 
		traceOutQubits: number[], 
		numQubits: number
	): Complex[][] {
		// Sort qubits to trace out
		const sortedQubits = [...traceOutQubits].sort((a, b) => a - b);
		
		// Keep track of remaining qubits
		const keepQubits = [];
		for (let i = 0; i < numQubits; i++) {
			if (!sortedQubits.includes(i)) {
				keepQubits.push(i);
			}
		}
		
		// If tracing out all qubits, return trace as scalar
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
		for (let iKeep = 0; iKeep < dimKeep; iKeep++) {
			for (let jKeep = 0; jKeep < dimKeep; jKeep++) {
				// Sum over all basis states of traced-out subsystem
				for (let kTrace = 0; kTrace < dimTrace; kTrace++) {
					// Construct full basis indices
					const iTotal = this.combineIndices(iKeep, kTrace, keepQubits, sortedQubits, numQubits);
					const jTotal = this.combineIndices(jKeep, kTrace, keepQubits, sortedQubits, numQubits);
					
					result[iKeep][jKeep] = math.add(
						result[iKeep][jKeep], 
						rho[iTotal][jTotal]
					) as Complex;
				}
			}
		}
		
		return result;
	}
	
	/**
	 * Combine indices from kept and traced subsystems into full system index
	 */
	private combineIndices(
		keepIndex: number,
		traceIndex: number,
		keepQubits: number[],
		traceQubits: number[],
		numQubits: number
	): number {
		let fullIndex = 0;
		
		// Extract bits from keepIndex and traceIndex
		for (let q = 0; q < numQubits; q++) {
			let bit = 0;
			
			if (keepQubits.includes(q)) {
				const posInKeep = keepQubits.indexOf(q);
				bit = (keepIndex >> posInKeep) & 1;
			} else {
				const posInTrace = traceQubits.indexOf(q);
				bit = (traceIndex >> posInTrace) & 1;
			}
			
			fullIndex |= (bit << q);
		}
		
		return fullIndex;
	}
	
	/**
	 * Convert pure state vector to density matrix
	 */
	private pureStateToDensityMatrix(psi: Complex[]): Complex[][] {
		const n = psi.length;
		const rho: Complex[][] = [];
		
		for (let i = 0; i < n; i++) {
			rho[i] = [];
			for (let j = 0; j < n; j++) {
				// ρ[i][j] = ψ[i] * conj(ψ[j])
				rho[i][j] = math.multiply(
					psi[i],
					math.conj(psi[j])
				) as Complex;
			}
		}
		
		return rho;
	}
	
	/**
	 * Validate state vector
	 */
	private validateStateVector(psi: Complex[]): void {
		if (!Array.isArray(psi) || psi.length === 0) {
			throw new InvalidQuantumStateError('State vector must be non-empty array');
		}
		
		// Check normalization
		let norm = 0;
		for (const amp of psi) {
			const absSquared = amp.re * amp.re + amp.im * amp.im;
			norm += absSquared;
		}
		
		if (Math.abs(norm - 1.0) > this.PRECISION_THRESHOLD) {
			throw new InvalidQuantumStateError(
				`State vector not normalized: ||ψ||² = ${norm}, expected 1.0`
			);
		}
	}
	
	/**
	 * Validate subsystem indices
	 */
	private validateSubsystemIndices(subsystem: number[], numQubits: number): void {
		if (!Array.isArray(subsystem) || subsystem.length === 0) {
			throw new InvalidQuantumStateError('Subsystem indices must be non-empty array');
		}
		
		for (const qubit of subsystem) {
			if (!Number.isInteger(qubit) || qubit < 0 || qubit >= numQubits) {
				throw new InvalidQuantumStateError(
					`Invalid qubit index ${qubit}. Must be in range [0, ${numQubits - 1}]`
				);
			}
		}
		
		// Check for duplicates
		const uniqueQubits = new Set(subsystem);
		if (uniqueQubits.size !== subsystem.length) {
			throw new InvalidQuantumStateError('Subsystem indices must be unique');
		}
	}
	
	/**
	 * Get complementary subsystem
	 */
	private getComplementarySubsystem(subsystem: number[], numQubits: number): number[] {
		const complement = [];
		for (let i = 0; i < numQubits; i++) {
			if (!subsystem.includes(i)) {
				complement.push(i);
			}
		}
		return complement;
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

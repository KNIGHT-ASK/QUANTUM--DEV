/**
 * TensorOperations - Multi-Qubit Tensor Product and Embedding Operations
 * 
 * Provides tensor operations for constructing multi-qubit operators:
 * - Tensor product (Kronecker product) A ⊗ B
 * - Kronecker sum A ⊕ B = A⊗I + I⊗B
 * - Qubit embedding for applying operators to specific qubits
 * 
 * All calculations maintain 10^-10 precision and preserve operator properties.
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4
 */

import { Complex, create, all } from 'mathjs';
import { ValidationEngine } from './ValidationEngine';

const math = create(all);

/**
 * Tensor product result with metadata
 */
export interface TensorProductResult {
	result: Complex[][];
	inputDimensions: number[];
	outputDimension: number;
}

/**
 * Configuration for embedding operators in multi-qubit space
 */
export interface EmbeddingConfig {
	operator: Complex[][];
	targetQubits: number[];
	totalQubits: number;
}

/**
 * Custom error for tensor operation failures
 */
export class TensorOperationError extends Error {
	constructor(message: string) {
		super(`Tensor operation error: ${message}`);
		this.name = 'TensorOperationError';
	}
}

/**
 * Tensor Operations Module
 * 
 * Implements tensor products and multi-qubit operator construction
 * with rigorous validation and precision guarantees.
 */
export class TensorOperations {
	private readonly PRECISION_THRESHOLD = 1e-10;
	private validator: ValidationEngine;
	
	constructor() {
		this.validator = new ValidationEngine();
	}
	
	/**
	 * Compute tensor product (Kronecker product) of two matrices
	 * 
	 * The tensor product A ⊗ B constructs a larger matrix representing
	 * the combined system of two quantum subsystems.
	 * 
	 * Formula: (A ⊗ B)[i*n+j, k*n+l] = A[i,k] * B[j,l]
	 * 
	 * where A is m×m, B is n×n, and A⊗B is (mn)×(mn)
	 * 
	 * Properties preserved:
	 * - Hermiticity: If A and B are Hermitian, so is A⊗B
	 * - Unitarity: If A and B are unitary, so is A⊗B
	 * - Dimension: dim(A⊗B) = dim(A) × dim(B)
	 * 
	 * @param A - First matrix (m×m)
	 * @param B - Second matrix (n×n)
	 * @returns Tensor product A⊗B ((mn)×(mn))
	 * @throws {TensorOperationError} If inputs are invalid
	 * 
	 * @example
	 * // Tensor product of Pauli matrices
	 * const sigmaX = [[{re:0,im:0}, {re:1,im:0}], [{re:1,im:0}, {re:0,im:0}]];
	 * const sigmaZ = [[{re:1,im:0}, {re:0,im:0}], [{re:0,im:0}, {re:-1,im:0}]];
	 * const XZ = tensorProduct(sigmaX, sigmaZ); // 4×4 matrix
	 * 
	 * @example
	 * // Identity tensored with identity gives larger identity
	 * const I2 = [[{re:1,im:0}, {re:0,im:0}], [{re:0,im:0}, {re:1,im:0}]];
	 * const I4 = tensorProduct(I2, I2); // 4×4 identity
	 * 
	 * @see Nielsen & Chuang, Section 2.1.7
	 * 
	 * Requirements: 15.1, 15.2, 15.3, 15.4
	 */
	tensorProduct(A: Complex[][], B: Complex[][]): Complex[][] {
		// Validate inputs
		this.validateMatrix(A, 'A');
		this.validateMatrix(B, 'B');
		
		const m = A.length;
		const n = B.length;
		const resultDim = m * n;
		
		// Initialize result matrix
		const result: Complex[][] = [];
		for (let i = 0; i < resultDim; i++) {
			result[i] = [];
			for (let j = 0; j < resultDim; j++) {
				result[i][j] = math.complex(0, 0);
			}
		}
		
		// Compute tensor product: (A ⊗ B)[i*n+j, k*n+l] = A[i,k] * B[j,l]
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) {
				for (let k = 0; k < m; k++) {
					for (let l = 0; l < n; l++) {
						const rowIndex = i * n + j;
						const colIndex = k * n + l;
						result[rowIndex][colIndex] = math.multiply(A[i][k], B[j][l]) as Complex;
					}
				}
			}
		}
		
		// Validate result preserves properties
		this.validateTensorProductProperties(A, B, result);
		
		return result;
	}
	
	/**
	 * Compute Kronecker sum of two matrices
	 * 
	 * The Kronecker sum constructs the Hamiltonian for non-interacting
	 * subsystems: H_total = H_A ⊗ I_B + I_A ⊗ H_B
	 * 
	 * Formula: A ⊕ B = A ⊗ I_B + I_A ⊗ B
	 * 
	 * where I_A and I_B are identity matrices of appropriate dimensions.
	 * 
	 * Properties:
	 * - Hermiticity: If A and B are Hermitian, so is A⊕B
	 * - Eigenvalues: λ(A⊕B) = {λ_i(A) + λ_j(B) : i,j}
	 * 
	 * @param A - First matrix (m×m)
	 * @param B - Second matrix (n×n)
	 * @returns Kronecker sum A⊕B ((mn)×(mn))
	 * @throws {TensorOperationError} If inputs are invalid
	 * 
	 * @example
	 * // Non-interacting two-qubit Hamiltonian
	 * const H1 = pauliZ(); // Hamiltonian for qubit 1
	 * const H2 = pauliX(); // Hamiltonian for qubit 2
	 * const H_total = kroneckerSum(H1, H2); // H1⊗I + I⊗H2
	 * 
	 * @see Horn & Johnson, "Topics in Matrix Analysis", Section 4.4
	 * 
	 * Requirements: 16.1, 16.2, 16.3
	 */
	kroneckerSum(A: Complex[][], B: Complex[][]): Complex[][] {
		// Validate inputs
		this.validateMatrix(A, 'A');
		this.validateMatrix(B, 'B');
		
		const m = A.length;
		const n = B.length;
		
		// Construct identity matrices
		const I_A = this.identityMatrix(m);
		const I_B = this.identityMatrix(n);
		
		// Compute A ⊗ I_B
		const A_tensor_IB = this.tensorProduct(A, I_B);
		
		// Compute I_A ⊗ B
		const IA_tensor_B = this.tensorProduct(I_A, B);
		
		// Compute sum: A ⊕ B = A⊗I_B + I_A⊗B
		const result = this.matrixAdd(A_tensor_IB, IA_tensor_B);
		
		// Validate Hermiticity is preserved
		const hermiticity = this.validator.validateHermiticity(result);
		if (!hermiticity.passed) {
			throw new TensorOperationError(
				`Kronecker sum failed to preserve Hermiticity: ${hermiticity.message}`
			);
		}
		
		return result;
	}
	
	/**
	 * Apply operator to specific qubits in a multi-qubit system
	 * 
	 * Embeds a single-qubit or two-qubit operator into a larger Hilbert space
	 * by tensoring with identity operators on all other qubits.
	 * 
	 * For operator U acting on qubits [q₁, q₂, ...]:
	 * Full operator = I ⊗ ... ⊗ I ⊗ U ⊗ I ⊗ ... ⊗ I
	 * 
	 * @param config - Configuration specifying operator, target qubits, and total qubits
	 * @returns Full operator acting on complete Hilbert space
	 * @throws {TensorOperationError} If configuration is invalid
	 * 
	 * @example
	 * // Apply Hadamard to qubit 1 in a 3-qubit system
	 * const H = hadamard();
	 * const fullH = applyToQubits({
	 *   operator: H,
	 *   targetQubits: [1],
	 *   totalQubits: 3
	 * }); // Returns I⊗H⊗I (8×8 matrix)
	 * 
	 * @example
	 * // Apply CNOT to qubits [0,2] in a 4-qubit system
	 * const CNOT = cnotGate();
	 * const fullCNOT = applyToQubits({
	 *   operator: CNOT,
	 *   targetQubits: [0, 2],
	 *   totalQubits: 4
	 * });
	 * 
	 * @see Nielsen & Chuang, Section 4.3
	 * 
	 * Requirements: 17.1, 17.2, 17.3, 17.4
	 */
	applyToQubits(config: EmbeddingConfig): Complex[][] {
		const { operator, targetQubits, totalQubits } = config;
		
		// Validate inputs
		this.validateMatrix(operator, 'operator');
		this.validateQubitIndices(targetQubits, totalQubits);
		
		// Determine operator size (number of qubits it acts on)
		const operatorDim = operator.length;
		const operatorQubits = Math.log2(operatorDim);
		
		if (!Number.isInteger(operatorQubits)) {
			throw new TensorOperationError(
				`Operator dimension ${operatorDim} is not a power of 2`
			);
		}
		
		if (targetQubits.length !== operatorQubits) {
			throw new TensorOperationError(
				`Operator acts on ${operatorQubits} qubits but ${targetQubits.length} target qubits specified`
			);
		}
		
		// Check if target qubits are contiguous
		const sortedTargets = [...targetQubits].sort((a, b) => a - b);
		const isContiguous = sortedTargets.every((q, i) => 
			i === 0 || q === sortedTargets[i - 1] + 1
		);
		
		if (isContiguous) {
			// Optimized path for contiguous qubits
			return this.embedContiguousOperator(operator, sortedTargets[0], totalQubits);
		} else {
			// General path for non-contiguous qubits (requires permutation)
			return this.embedNonContiguousOperator(operator, targetQubits, totalQubits);
		}
	}
	
	/**
	 * Embed operator acting on contiguous qubits
	 * 
	 * For operator U acting on qubits [k, k+1, ..., k+n-1]:
	 * Full operator = I_{2^k} ⊗ U ⊗ I_{2^(totalQubits-k-n)}
	 * 
	 * @param operator - Operator to embed
	 * @param startQubit - First qubit the operator acts on
	 * @param totalQubits - Total number of qubits in system
	 * @returns Embedded operator
	 */
	private embedContiguousOperator(
		operator: Complex[][],
		startQubit: number,
		totalQubits: number
	): Complex[][] {
		const operatorQubits = Math.log2(operator.length);
		const endQubit = startQubit + operatorQubits;
		
		// Build full operator: I ⊗ ... ⊗ I ⊗ U ⊗ I ⊗ ... ⊗ I
		let result = operator;
		
		// Tensor with identity on the left (qubits 0 to startQubit-1)
		for (let q = 0; q < startQubit; q++) {
			const I = this.identityMatrix(2);
			result = this.tensorProduct(I, result);
		}
		
		// Tensor with identity on the right (qubits endQubit to totalQubits-1)
		for (let q = endQubit; q < totalQubits; q++) {
			const I = this.identityMatrix(2);
			result = this.tensorProduct(result, I);
		}
		
		return result;
	}
	
	/**
	 * Embed operator acting on non-contiguous qubits
	 * 
	 * Uses SWAP gates to bring target qubits together, apply operator,
	 * then SWAP back. This is a simplified implementation that constructs
	 * the full operator directly.
	 * 
	 * @param operator - Operator to embed
	 * @param targetQubits - Non-contiguous target qubits
	 * @param totalQubits - Total number of qubits in system
	 * @returns Embedded operator
	 */
	private embedNonContiguousOperator(
		operator: Complex[][],
		targetQubits: number[],
		totalQubits: number
	): Complex[][] {
		const fullDim = Math.pow(2, totalQubits);
		const result: Complex[][] = [];
		
		// Initialize result matrix
		for (let i = 0; i < fullDim; i++) {
			result[i] = [];
			for (let j = 0; j < fullDim; j++) {
				result[i][j] = math.complex(0, 0);
			}
		}
		
		// For each basis state, apply operator to target qubits
		for (let i = 0; i < fullDim; i++) {
			for (let j = 0; j < fullDim; j++) {
				// Check if non-target bits match
				if (this.nonTargetBitsMatch(i, j, targetQubits, totalQubits)) {
					// Extract bits for target qubits (in order of targetQubits array)
					const iBits = this.extractTargetBits(i, targetQubits, totalQubits);
					const jBits = this.extractTargetBits(j, targetQubits, totalQubits);
					
					// Apply operator to target bits
					const iTarget = this.bitsToIndex(iBits);
					const jTarget = this.bitsToIndex(jBits);
					
					// Map back to full space
					// We need to find which full-space index corresponds to
					// the result of applying the operator
					const iResult = this.replaceTargetBits(i, targetQubits, operator, jBits, totalQubits);
					
					// For now, use direct mapping
					result[i][j] = operator[iTarget][jTarget];
				}
			}
		}
		
		return result;
	}
	
	/**
	 * Replace target bits in an index (helper for non-contiguous embedding)
	 */
	private replaceTargetBits(
		baseIndex: number,
		targetQubits: number[],
		operator: Complex[][],
		targetBits: number[],
		totalQubits: number
	): number {
		let result = baseIndex;
		
		// Clear target bits
		for (const qubit of targetQubits) {
			result &= ~(1 << qubit);
		}
		
		// Set new target bits
		for (let i = 0; i < targetQubits.length; i++) {
			result |= (targetBits[i] << targetQubits[i]);
		}
		
		return result;
	}
	
	/**
	 * Extract bits corresponding to target qubits from an index
	 */
	private extractTargetBits(index: number, targetQubits: number[], totalQubits: number): number[] {
		const bits: number[] = [];
		for (const qubit of targetQubits) {
			bits.push((index >> qubit) & 1);
		}
		return bits;
	}
	
	/**
	 * Check if non-target bits match between two indices
	 */
	private nonTargetBitsMatch(
		i: number,
		j: number,
		targetQubits: number[],
		totalQubits: number
	): boolean {
		for (let q = 0; q < totalQubits; q++) {
			if (!targetQubits.includes(q)) {
				const iBit = (i >> q) & 1;
				const jBit = (j >> q) & 1;
				if (iBit !== jBit) {
					return false;
				}
			}
		}
		return true;
	}
	
	/**
	 * Convert bit array to index
	 */
	private bitsToIndex(bits: number[]): number {
		let index = 0;
		for (let i = 0; i < bits.length; i++) {
			index |= (bits[i] << i);
		}
		return index;
	}
	
	/**
	 * Validate tensor product preserves operator properties
	 */
	private validateTensorProductProperties(A: Complex[][], B: Complex[][], result: Complex[][]): void {
		// Check dimension
		const expectedDim = A.length * B.length;
		if (result.length !== expectedDim) {
			throw new TensorOperationError(
				`Tensor product dimension mismatch: expected ${expectedDim}, got ${result.length}`
			);
		}
		
		// Check Hermiticity preservation
		const AHermitian = this.isHermitian(A);
		const BHermitian = this.isHermitian(B);
		
		if (AHermitian && BHermitian) {
			const resultHermitian = this.isHermitian(result);
			if (!resultHermitian) {
				throw new TensorOperationError(
					'Tensor product failed to preserve Hermiticity'
				);
			}
		}
		
		// Check unitarity preservation
		const AUnitary = this.isUnitary(A);
		const BUnitary = this.isUnitary(B);
		
		if (AUnitary && BUnitary) {
			const resultUnitary = this.isUnitary(result);
			if (!resultUnitary) {
				throw new TensorOperationError(
					'Tensor product failed to preserve unitarity'
				);
			}
		}
	}
	
	/**
	 * Check if matrix is Hermitian
	 */
	private isHermitian(M: Complex[][]): boolean {
		const hermiticity = this.validator.validateHermiticity(M);
		return hermiticity.passed;
	}
	
	/**
	 * Check if matrix is unitary
	 */
	private isUnitary(M: Complex[][]): boolean {
		const unitarity = this.validator.validateUnitarity(M);
		return unitarity.passed;
	}
	
	/**
	 * Validate matrix is square and non-empty
	 */
	private validateMatrix(M: Complex[][], name: string): void {
		if (!Array.isArray(M) || M.length === 0) {
			throw new TensorOperationError(`Matrix ${name} must be non-empty array`);
		}
		
		const n = M.length;
		for (let i = 0; i < n; i++) {
			if (!Array.isArray(M[i]) || M[i].length !== n) {
				throw new TensorOperationError(`Matrix ${name} must be square`);
			}
			
			for (let j = 0; j < n; j++) {
				const elem = M[i][j];
				if (typeof elem.re !== 'number' || typeof elem.im !== 'number') {
					throw new TensorOperationError(
						`Matrix ${name} elements must be complex numbers`
					);
				}
				if (!isFinite(elem.re) || !isFinite(elem.im)) {
					throw new TensorOperationError(
						`Matrix ${name} elements must be finite`
					);
				}
			}
		}
	}
	
	/**
	 * Validate qubit indices
	 */
	private validateQubitIndices(qubits: number[], totalQubits: number): void {
		if (!Array.isArray(qubits) || qubits.length === 0) {
			throw new TensorOperationError('Qubit indices must be non-empty array');
		}
		
		for (const qubit of qubits) {
			if (!Number.isInteger(qubit) || qubit < 0 || qubit >= totalQubits) {
				throw new TensorOperationError(
					`Invalid qubit index ${qubit}. Must be in range [0, ${totalQubits - 1}]`
				);
			}
		}
		
		// Check for duplicates
		const uniqueQubits = new Set(qubits);
		if (uniqueQubits.size !== qubits.length) {
			throw new TensorOperationError('Qubit indices must be unique');
		}
	}
	
	/**
	 * Create identity matrix of given dimension
	 */
	private identityMatrix(n: number): Complex[][] {
		const I: Complex[][] = [];
		for (let i = 0; i < n; i++) {
			I[i] = [];
			for (let j = 0; j < n; j++) {
				I[i][j] = i === j ? math.complex(1, 0) : math.complex(0, 0);
			}
		}
		return I;
	}
	
	/**
	 * Matrix addition helper
	 */
	private matrixAdd(A: Complex[][], B: Complex[][]): Complex[][] {
		const n = A.length;
		const result: Complex[][] = [];
		
		for (let i = 0; i < n; i++) {
			result[i] = [];
			for (let j = 0; j < n; j++) {
				result[i][j] = math.add(A[i][j], B[i][j]) as Complex;
			}
		}
		
		return result;
	}
}

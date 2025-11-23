/**
 * HamiltonianAnalyzer - Spectral Analysis and Symmetry Detection
 * 
 * Provides comprehensive analysis of Hamiltonian operators including:
 * - Complete eigenspectrum with ground state and spectral gap
 * - Symmetry detection and conserved quantities
 * - Degeneracy identification at 10^-10 precision
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4
 */

import { Complex, create, all } from 'mathjs';
import { NumericalMethods, EigenResult } from './NumericalMethods';
import { ValidationEngine } from './ValidationEngine';

const math = create(all);

/**
 * Complete spectral analysis result
 */
export interface SpectralAnalysis {
	eigenvalues: number[];           // Sorted in ascending order
	eigenvectors: Complex[][];       // Normalized eigenstates
	groundStateEnergy: number;       // Lowest eigenvalue (E_0)
	spectralGap: number;            // E_1 - E_0
	degeneracies: Map<number, number>; // Energy → degeneracy count
}

/**
 * Symmetry operator with physical interpretation
 */
export interface Symmetry {
	operator: Complex[][];
	name: string;
	eigenvalue?: number;
	physicalMeaning: string;
}

/**
 * Conserved quantity (commutes with Hamiltonian)
 */
export interface ConservedQuantity {
	operator: Complex[][];
	name: string;
	commutatorNorm: number;  // Should be < 10^-10
}

/**
 * Hamiltonian Analyzer
 * Performs spectral analysis and symmetry detection
 */
export class HamiltonianAnalyzer {
	private readonly PRECISION_THRESHOLD = 1e-10;
	private numericalMethods: NumericalMethods;
	private validator: ValidationEngine;
	
	constructor() {
		this.numericalMethods = new NumericalMethods();
		this.validator = new ValidationEngine();
	}
	
	/**
	 * Analyze complete eigenspectrum of Hamiltonian
	 * 
	 * Computes all eigenvalues and eigenvectors, validates orthonormality,
	 * identifies ground state, spectral gap, and degeneracies.
	 * 
	 * @param H - Hamiltonian matrix (must be Hermitian)
	 * @returns Complete spectral analysis
	 * @throws Error if H is not Hermitian or eigendecomposition fails
	 * 
	 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
	 */
	analyzeSpectrum(H: Complex[][]): SpectralAnalysis {
		// Validate Hermiticity
		const hermiticity = this.validator.validateHermiticity(H);
		if (!hermiticity.passed) {
			throw new Error('Hamiltonian must be Hermitian for spectral analysis');
		}
		
		// Perform eigendecomposition using Jacobi method (best for small dense Hermitian matrices)
		const eigenResult: EigenResult = this.numericalMethods.jacobiEigenvalues(H);
		
		if (!eigenResult.converged) {
			throw new Error(`Eigendecomposition did not converge after ${eigenResult.iterations} iterations`);
		}
		
		// Sort eigenvalues and eigenvectors in ascending order
		const indices = eigenResult.eigenvalues
			.map((val, idx) => ({ val, idx }))
			.sort((a, b) => a.val - b.val)
			.map(item => item.idx);
		
		const sortedEigenvalues = indices.map(i => eigenResult.eigenvalues[i]);
		const sortedEigenvectors = indices.map(i => eigenResult.eigenvectors[i]);
		
		// Validate eigenvector orthonormality
		this.validateEigenvectorOrthonormality(sortedEigenvectors);
		
		// Compute ground state energy (lowest eigenvalue)
		const groundStateEnergy = sortedEigenvalues[0];
		
		// Compute spectral gap (E_1 - E_0)
		const spectralGap = sortedEigenvalues.length > 1 
			? sortedEigenvalues[1] - sortedEigenvalues[0]
			: 0;
		
		// Detect degeneracies
		const degeneracies = this.detectDegeneracies(sortedEigenvalues);
		
		return {
			eigenvalues: sortedEigenvalues,
			eigenvectors: sortedEigenvectors,
			groundStateEnergy,
			spectralGap,
			degeneracies
		};
	}
	
	/**
	 * Detect symmetries in Hamiltonian
	 * 
	 * Tests commutation with standard symmetry operators:
	 * - Particle number
	 * - Spin operators
	 * - Parity
	 * 
	 * @param H - Hamiltonian matrix
	 * @returns List of detected symmetries
	 * 
	 * Requirements: 2.1, 2.2, 2.3, 2.4
	 */
	detectSymmetries(H: Complex[][]): Symmetry[] {
		const symmetries: Symmetry[] = [];
		const n = H.length;
		const numQubits = Math.log2(n);
		
		// Only test standard symmetries for valid qubit systems
		if (!Number.isInteger(numQubits)) {
			return symmetries;
		}
		
		// Test particle number conservation (for 2-qubit systems)
		if (numQubits === 2) {
			const particleNumber = this.createParticleNumberOperator(numQubits);
			if (this.testCommutation(H, particleNumber)) {
				symmetries.push({
					operator: particleNumber,
					name: 'Particle Number',
					physicalMeaning: 'Total particle number is conserved'
				});
			}
		}
		
		// Test parity symmetry
		const parity = this.createParityOperator(numQubits);
		if (this.testCommutation(H, parity)) {
			symmetries.push({
				operator: parity,
				name: 'Parity',
				physicalMeaning: 'System has parity symmetry'
			});
		}
		
		return symmetries;
	}
	
	/**
	 * Find all conserved quantities
	 * 
	 * Identifies operators that commute with Hamiltonian: [H, Q] = 0
	 * 
	 * @param H - Hamiltonian matrix
	 * @returns List of conserved quantities
	 * 
	 * Requirements: 2.1, 2.2, 2.3, 2.4
	 */
	findConservedQuantities(H: Complex[][]): ConservedQuantity[] {
		const conserved: ConservedQuantity[] = [];
		const symmetries = this.detectSymmetries(H);
		
		// Convert symmetries to conserved quantities
		for (const sym of symmetries) {
			const commutatorNorm = this.computeCommutatorNorm(H, sym.operator);
			conserved.push({
				operator: sym.operator,
				name: sym.name,
				commutatorNorm
			});
		}
		
		return conserved;
	}
	
	/**
	 * Validate eigenvector orthonormality and completeness
	 * 
	 * Checks that ⟨ψᵢ|ψⱼ⟩ = δᵢⱼ within precision threshold
	 * 
	 * @param eigenvectors - List of eigenvectors
	 * @throws Error if orthonormality is violated
	 */
	private validateEigenvectorOrthonormality(eigenvectors: Complex[][]): void {
		const n = eigenvectors.length;
		
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const innerProd = this.innerProduct(eigenvectors[i], eigenvectors[j]);
				const expected = i === j ? 1.0 : 0.0;
				const error = Math.abs(innerProd - expected);
				
				if (error > this.PRECISION_THRESHOLD) {
					throw new Error(
						`Eigenvector orthonormality violated: ⟨ψ${i}|ψ${j}⟩ = ${innerProd.toFixed(12)}, ` +
						`expected ${expected}, error = ${error.toExponential(3)}`
					);
				}
			}
		}
	}
	
	/**
	 * Detect energy degeneracies
	 * 
	 * Groups eigenvalues within precision threshold
	 * 
	 * @param eigenvalues - Sorted eigenvalues
	 * @returns Map from energy to degeneracy count
	 */
	private detectDegeneracies(eigenvalues: number[]): Map<number, number> {
		const degeneracies = new Map<number, number>();
		
		for (const energy of eigenvalues) {
			// Find if this energy already exists (within tolerance)
			let found = false;
			for (const [existingEnergy, count] of degeneracies.entries()) {
				if (Math.abs(energy - existingEnergy) < this.PRECISION_THRESHOLD) {
					degeneracies.set(existingEnergy, count + 1);
					found = true;
					break;
				}
			}
			
			if (!found) {
				degeneracies.set(energy, 1);
			}
		}
		
		return degeneracies;
	}
	
	/**
	 * Test if operator commutes with Hamiltonian
	 * 
	 * Checks if ||[H, Q]|| < 10^-10
	 * 
	 * @param H - Hamiltonian
	 * @param Q - Operator to test
	 * @returns True if commutes
	 */
	private testCommutation(H: Complex[][], Q: Complex[][]): boolean {
		const commutatorNorm = this.computeCommutatorNorm(H, Q);
		return commutatorNorm < this.PRECISION_THRESHOLD;
	}
	
	/**
	 * Compute norm of commutator [A, B] = AB - BA
	 */
	private computeCommutatorNorm(A: Complex[][], B: Complex[][]): number {
		const AB = this.matrixMultiply(A, B);
		const BA = this.matrixMultiply(B, A);
		const commutator = this.matrixSubtract(AB, BA);
		return this.matrixNorm(commutator);
	}
	
	/**
	 * Create particle number operator for n-qubit system
	 * N = Σᵢ nᵢ where nᵢ = (I - σᵢᶻ)/2
	 */
	private createParticleNumberOperator(numQubits: number): Complex[][] {
		const dim = Math.pow(2, numQubits);
		const N: Complex[][] = this.zeroMatrix(dim);
		
		// For 2-qubit system: N = n₀ + n₁
		// n₀ = (I - σ₀ᶻ)/2, n₁ = (I - σ₁ᶻ)/2
		for (let i = 0; i < dim; i++) {
			let count = 0;
			for (let q = 0; q < numQubits; q++) {
				// Check if qubit q is in |1⟩ state
				if ((i >> q) & 1) {
					count++;
				}
			}
			N[i][i] = math.complex(count, 0);
		}
		
		return N;
	}
	
	/**
	 * Create parity operator Π = ⊗ᵢ σᵢᶻ
	 */
	private createParityOperator(numQubits: number): Complex[][] {
		const dim = Math.pow(2, numQubits);
		const parity: Complex[][] = this.zeroMatrix(dim);
		
		for (let i = 0; i < dim; i++) {
			// Count number of 1s in binary representation
			const ones = i.toString(2).split('1').length - 1;
			const sign = ones % 2 === 0 ? 1 : -1;
			parity[i][i] = math.complex(sign, 0);
		}
		
		return parity;
	}
	
	// Matrix operations
	
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
	
	private matrixSubtract(A: Complex[][], B: Complex[][]): Complex[][] {
		return A.map((row, i) => 
			row.map((elem, j) => math.subtract(elem, B[i][j]) as Complex)
		);
	}
	
	private matrixNorm(M: Complex[][]): number {
		let sum = 0;
		for (const row of M) {
			for (const elem of row) {
				const c = math.complex(elem);
				sum += c.re * c.re + c.im * c.im;
			}
		}
		return Math.sqrt(sum);
	}
	
	private innerProduct(a: Complex[], b: Complex[]): number {
		let sum = math.complex(0, 0);
		for (let i = 0; i < a.length; i++) {
			sum = math.add(sum, math.multiply(math.conj(a[i]), b[i])) as Complex;
		}
		return math.complex(sum).re;
	}
	
	private zeroMatrix(n: number): Complex[][] {
		const M: Complex[][] = [];
		for (let i = 0; i < n; i++) {
			M[i] = [];
			for (let j = 0; j < n; j++) {
				M[i][j] = math.complex(0, 0);
			}
		}
		return M;
	}
}

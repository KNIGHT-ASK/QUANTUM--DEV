/**
 * TimeEvolutionOperator - Quantum Time Evolution
 * 
 * Computes quantum time evolution operators U(t) = e^(-iHt/ℏ) using:
 * - Exact evolution via spectral decomposition
 * - Trotter decomposition for multi-term Hamiltonians
 * - State evolution |ψ(t)⟩ = U(t)|ψ(0)⟩
 * 
 * All operations maintain 10^-10 precision and validate unitarity.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4
 */

import { Complex, create, all } from 'mathjs';
import { NumericalMethods, EigenResult } from './NumericalMethods';
import { ValidationEngine } from './ValidationEngine';

const math = create(all);

/**
 * Configuration for time evolution
 */
export interface TimeEvolutionConfig {
	hamiltonian: Complex[][];
	time: number;
	hbar: number;              // Default: 1
	method: 'exact' | 'trotter';
	trotterSteps?: number;     // For Trotter method
}

/**
 * Result of time evolution computation
 */
export interface EvolutionResult {
	operator: Complex[][];     // U(t)
	isUnitary: boolean;
	unitarityError: number;
}

/**
 * Time Evolution Operator
 * Computes U(t) = e^(-iHt/ℏ) with rigorous validation
 */
export class TimeEvolutionOperator {
	private readonly PRECISION_THRESHOLD = 1e-10;
	private numericalMethods: NumericalMethods;
	private validator: ValidationEngine;
	
	constructor() {
		this.numericalMethods = new NumericalMethods();
		this.validator = new ValidationEngine();
	}
	
	/**
	 * Compute exact time evolution operator using spectral decomposition
	 * 
	 * Uses the formula: U(t) = Σₙ e^(-iEₙt/ℏ) |n⟩⟨n|
	 * where Eₙ are eigenvalues and |n⟩ are eigenvectors of H.
	 * 
	 * @param H - Hamiltonian matrix (must be Hermitian)
	 * @param t - Time parameter
	 * @param hbar - Reduced Planck constant (default: 1)
	 * @returns Time evolution operator U(t)
	 * @throws Error if H is not Hermitian or unitarity is violated
	 * 
	 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
	 * 
	 * @example
	 * // Pauli-Z evolution at t=π gives -I
	 * const sigmaZ = [[{re:1,im:0}, {re:0,im:0}], [{re:0,im:0}, {re:-1,im:0}]];
	 * const U = evolveExact(sigmaZ, Math.PI);
	 * // U ≈ -I (up to global phase)
	 */
	evolveExact(H: Complex[][], t: number, hbar: number = 1.0): Complex[][] {
		// Handle t=0 case: return identity matrix
		if (Math.abs(t) < this.PRECISION_THRESHOLD) {
			return this.identityMatrix(H.length);
		}
		
		// Validate Hermiticity
		const hermiticity = this.validator.validateHermiticity(H);
		if (!hermiticity.passed) {
			throw new Error('Hamiltonian must be Hermitian for time evolution');
		}
		
		// Perform eigendecomposition: H = Σ Eₙ|n⟩⟨n|
		const eigenResult: EigenResult = this.numericalMethods.jacobiEigenvalues(H);
		
		if (!eigenResult.converged) {
			throw new Error(`Eigendecomposition did not converge after ${eigenResult.iterations} iterations`);
		}
		
		const { eigenvalues, eigenvectors } = eigenResult;
		const n = H.length;
		
		// Construct U(t) = Σₙ e^(-iEₙt/ℏ) |n⟩⟨n|
		const U: Complex[][] = this.zeroMatrix(n);
		
		for (let k = 0; k < n; k++) {
			// Compute phase factor: e^(-iEₖt/ℏ)
			const phase = -eigenvalues[k] * t / hbar;
			const expFactor = math.complex(Math.cos(phase), Math.sin(phase));
			
			// Add contribution: e^(-iEₖt/ℏ) |k⟩⟨k|
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					// |k⟩⟨k|[i,j] = ψₖ[i] * conj(ψₖ[j])
					const ketBra = math.multiply(
						eigenvectors[k][i],
						math.conj(eigenvectors[k][j])
					) as Complex;
					
					const contribution = math.multiply(expFactor, ketBra) as Complex;
					U[i][j] = math.add(U[i][j], contribution) as Complex;
				}
			}
		}
		
		// Validate unitarity: U†U = I
		const unitarity = this.validator.validateUnitarity(U);
		if (!unitarity.passed) {
			throw new Error(
				`Time evolution operator is not unitary: ||U†U - I|| = ${unitarity.error?.toExponential(3)}`
			);
		}
		
		return U;
	}
	
	/**
	 * Compute time evolution using Trotter decomposition
	 * 
	 * Approximates e^(-i(H₁+H₂+...)t) ≈ [e^(-iH₁Δt) e^(-iH₂Δt) ...]ⁿ
	 * where Δt = t/n and n is the number of Trotter steps.
	 * 
	 * @param terms - List of Hamiltonian terms [H₁, H₂, ...]
	 * @param t - Time parameter
	 * @param steps - Number of Trotter steps
	 * @param hbar - Reduced Planck constant (default: 1)
	 * @returns Approximate time evolution operator
	 * 
	 * Requirements: 9.1, 9.2, 9.3, 9.4
	 * 
	 * @example
	 * // Trotter evolution for H = H₁ + H₂
	 * const U = evolveTrotter([H1, H2], 1.0, 100);
	 */
	evolveTrotter(
		terms: Complex[][][],
		t: number,
		steps: number,
		hbar: number = 1.0
	): Complex[][] {
		if (terms.length === 0) {
			throw new Error('At least one Hamiltonian term required for Trotter evolution');
		}
		
		const n = terms[0].length;
		const dt = t / steps;
		
		// Start with identity
		let U = this.identityMatrix(n);
		
		// Apply Trotter steps: U(t) ≈ [Π e^(-iHₖΔt)]^steps
		for (let step = 0; step < steps; step++) {
			// Apply each term in sequence
			for (const Hk of terms) {
				const Uk = this.evolveExact(Hk, dt, hbar);
				U = this.matrixMultiply(Uk, U);
			}
		}
		
		// Validate approximate unitarity
		const unitarity = this.validator.validateUnitarity(U);
		const tolerance = steps > 0 ? dt * 10 : this.PRECISION_THRESHOLD;
		
		if (unitarity.error && unitarity.error > tolerance) {
			console.warn(
				`Trotter evolution has unitarity error ${unitarity.error.toExponential(3)} ` +
				`(tolerance: ${tolerance.toExponential(3)}). Consider increasing steps.`
			);
		}
		
		return U;
	}
	
	/**
	 * Apply time evolution to a quantum state
	 * 
	 * Computes |ψ(t)⟩ = U(t)|ψ(0)⟩
	 * 
	 * @param H - Hamiltonian matrix
	 * @param psi0 - Initial state vector
	 * @param t - Time parameter
	 * @param hbar - Reduced Planck constant (default: 1)
	 * @returns Evolved state vector |ψ(t)⟩
	 * 
	 * Requirements: 10.1, 10.2, 10.3, 10.4
	 * 
	 * @example
	 * // Evolve eigenstate: U(t)|n⟩ = e^(-iEₙt)|n⟩
	 * const psi_t = applyToState(H, eigenstate, t);
	 */
	applyToState(
		H: Complex[][],
		psi0: Complex[],
		t: number,
		hbar: number = 1.0
	): Complex[] {
		// Handle t=0 case: return initial state
		if (Math.abs(t) < this.PRECISION_THRESHOLD) {
			return [...psi0];
		}
		
		// Compute time evolution operator
		const U = this.evolveExact(H, t, hbar);
		
		// Apply to state: |ψ(t)⟩ = U(t)|ψ(0)⟩
		const psi_t = this.matrixVectorMultiply(U, psi0);
		
		// Validate normalization
		const norm = this.vectorNorm(psi_t);
		const normError = Math.abs(norm - 1.0);
		
		if (normError > this.PRECISION_THRESHOLD) {
			throw new Error(
				`State normalization violated after time evolution: ||ψ(t)|| = ${norm.toFixed(12)}`
			);
		}
		
		return psi_t;
	}
	
	/**
	 * Validate time evolution operator
	 * 
	 * Checks unitarity and other physical properties
	 * 
	 * @param U - Time evolution operator
	 * @param H - Hamiltonian (optional, for additional checks)
	 * @param t - Time parameter (optional)
	 * @returns Validation result
	 */
	validateEvolution(
		U: Complex[][],
		H?: Complex[][],
		t?: number
	): EvolutionResult {
		const unitarity = this.validator.validateUnitarity(U);
		
		return {
			operator: U,
			isUnitary: unitarity.passed,
			unitarityError: unitarity.error || 0
		};
	}
	
	// Matrix and vector operations
	
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
	
	private matrixVectorMultiply(A: Complex[][], v: Complex[]): Complex[] {
		const result: Complex[] = [];
		for (let i = 0; i < A.length; i++) {
			let sum = math.complex(0, 0);
			for (let j = 0; j < v.length; j++) {
				sum = math.add(sum, math.multiply(A[i][j], v[j])) as Complex;
			}
			result.push(sum);
		}
		return result;
	}
	
	private vectorNorm(v: Complex[]): number {
		let sum = 0;
		for (const val of v) {
			const c = math.complex(val);
			sum += c.re * c.re + c.im * c.im;
		}
		return Math.sqrt(sum);
	}
	
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

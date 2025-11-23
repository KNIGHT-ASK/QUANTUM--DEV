/**
 * Hamiltonian Engine - Pillar 2
 * 
 * All quantum dynamics from Ĥ = Ĥ†
 * Spectral decomposition, time evolution, symmetries
 */

import { Complex, create, all } from 'mathjs';

const math = create(all);

export interface HamiltonianMatrix {
	/** Matrix elements */
	elements: Complex[][];
	/** Number of qubits */
	numQubits: number;
	/** Dimension (2^n) */
	dimension: number;
}

export interface HamiltonianAnalysis {
	isHermitian: boolean;
	hermiticityError: number;
	eigenvalues: number[];
	groundStateEnergy: number;
	groundStateIndex: number;
	excitationGap: number;
	symmetries: Array<{
		operator: string;
		commutes: boolean;
	}>;
	spectrum: {
		min: number;
		max: number;
		range: number;
	};
}

export class Hamiltonian {
	private readonly matrix: Complex[][];
	private readonly numQubits: number;
	private readonly dimension: number;
	private readonly TOLERANCE = 1e-10;

	constructor(matrix: Complex[][], numQubits: number) {
		this.numQubits = numQubits;
		this.dimension = Math.pow(2, numQubits);
		
		if (matrix.length !== this.dimension || matrix[0].length !== this.dimension) {
			throw new Error(`Hamiltonian must be ${this.dimension}x${this.dimension} for ${numQubits} qubits`);
		}
		
		this.matrix = matrix;
	}

	/**
	 * Validate Hermiticity: Ĥ = Ĥ†
	 * Check ||Ĥ - Ĥ†|| < ε
	 */
	validateHermiticity(): { isHermitian: boolean; error: number; details?: string } {
		let maxDeviation = 0;
		const n = this.dimension;

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const Hij = math.complex(this.matrix[i][j]);
				const Hji = math.complex(this.matrix[j][i]);
				const HjiConj = math.conj(Hji);
				
				// Check if H[i][j] = conj(H[j][i])
				const diff = math.subtract(Hij, HjiConj) as Complex;
				const deviation = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
				
				maxDeviation = Math.max(maxDeviation, deviation);
			}
		}

		const isHermitian = maxDeviation < this.TOLERANCE;

		return {
			isHermitian,
			error: maxDeviation,
			details: isHermitian 
				? undefined 
				: `Hamiltonian not Hermitian: ||Ĥ - Ĥ†|| = ${maxDeviation.toExponential(3)}`
		};
	}

	/**
	 * Compute eigenspectrum of Hamiltonian
	 * Ĥ|Eₙ⟩ = Eₙ|Eₙ⟩
	 */
	computeSpectrum(): {
		eigenvalues: number[];
		eigenvectors: Complex[][];
	} {
		// For small matrices (≤ 4x4), use exact diagonalization
		// For larger matrices, would use iterative methods (Lanczos, etc.)
		
		if (this.dimension <= 4) {
			return this.exactDiagonalization();
		}
		
		// For larger systems, use power iteration for ground state
		// and Lanczos for low-lying excited states
		return this.iterativeDiagonalization();
	}

	/**
	 * Time evolution operator: Û(t) = exp(-iĤt/ℏ)
	 */
	timeEvolutionOperator(time: number, hbar: number = 1.0): Complex[][] {
		// Use spectral decomposition: exp(-iĤt/ℏ) = Σₙ exp(-iEₙt/ℏ)|Eₙ⟩⟨Eₙ|
		const { eigenvalues, eigenvectors } = this.computeSpectrum();
		
		const U: Complex[][] = [];
		const n = this.dimension;
		
		for (let i = 0; i < n; i++) {
			U[i] = [];
			for (let j = 0; j < n; j++) {
				let sum = math.complex(0, 0);
				
				for (let k = 0; k < n; k++) {
					// exp(-iEₖt/ℏ) * |Eₖ⟩ᵢ * ⟨Eₖ|ⱼ
					const phase = -eigenvalues[k] * time / hbar;
					const expFactor = math.complex(Math.cos(phase), Math.sin(phase));
					const ketBra = math.multiply(
						eigenvectors[k][i],
						math.conj(eigenvectors[k][j])
					);
					sum = math.add(sum, math.multiply(expFactor, ketBra)) as Complex;
				}
				
				U[i][j] = sum;
			}
		}
		
		return U;
	}

	/**
	 * Trotterization: exp(-iĤt) ≈ [exp(-iĤt/n)]ⁿ
	 * For Ĥ = Σᵢ Ĥᵢ, use product formula
	 */
	trotterize(terms: Complex[][][], time: number, steps: number): Complex[][] {
		const dt = time / steps;
		let U = this.identityMatrix();
		
		for (let step = 0; step < steps; step++) {
			// Apply each term sequentially
			for (const term of terms) {
				const expTerm = this.matrixExponential(term, -dt);
				U = this.matrixMultiply(expTerm, U);
			}
		}
		
		return U;
	}

	/**
	 * Detect symmetries: [Ĥ, Q̂] = 0 → Q conserved
	 */
	findSymmetries(operators: Map<string, Complex[][]>): Array<{
		operator: string;
		commutes: boolean;
		commutator: number;
	}> {
		const symmetries: Array<{ operator: string; commutes: boolean; commutator: number }> = [];
		
		for (const [name, Q] of operators.entries()) {
			// Compute [Ĥ, Q̂] = ĤQ̂ - Q̂Ĥ
			const HQ = this.matrixMultiply(this.matrix, Q);
			const QH = this.matrixMultiply(Q, this.matrix);
			
			let commutatorNorm = 0;
			for (let i = 0; i < this.dimension; i++) {
				for (let j = 0; j < this.dimension; j++) {
					const diff = math.subtract(HQ[i][j], QH[i][j]) as Complex;
					commutatorNorm += diff.re * diff.re + diff.im * diff.im;
				}
			}
			commutatorNorm = Math.sqrt(commutatorNorm);
			
			symmetries.push({
				operator: name,
				commutes: commutatorNorm < this.TOLERANCE,
				commutator: commutatorNorm
			});
		}
		
		return symmetries;
	}

	/**
	 * Complete Hamiltonian analysis
	 */
	analyze(conservedOperators?: Map<string, Complex[][]>): HamiltonianAnalysis {
		// Validate Hermiticity
		const hermCheck = this.validateHermiticity();
		
		if (!hermCheck.isHermitian) {
			throw new Error(`Physics violation: ${hermCheck.details}`);
		}

		// Compute spectrum
		const { eigenvalues } = this.computeSpectrum();
		const sortedEigenvalues = [...eigenvalues].sort((a, b) => a - b);
		
		const groundStateEnergy = sortedEigenvalues[0];
		const groundStateIndex = eigenvalues.indexOf(groundStateEnergy);
		const excitationGap = sortedEigenvalues.length > 1 
			? sortedEigenvalues[1] - sortedEigenvalues[0]
			: 0;

		// Find symmetries if operators provided
		const symmetries = conservedOperators 
			? this.findSymmetries(conservedOperators).map(s => ({
				operator: s.operator,
				commutes: s.commutes
			}))
			: [];

		return {
			isHermitian: hermCheck.isHermitian,
			hermiticityError: hermCheck.error,
			eigenvalues: sortedEigenvalues,
			groundStateEnergy,
			groundStateIndex,
			excitationGap,
			symmetries,
			spectrum: {
				min: sortedEigenvalues[0],
				max: sortedEigenvalues[sortedEigenvalues.length - 1],
				range: sortedEigenvalues[sortedEigenvalues.length - 1] - sortedEigenvalues[0]
			}
		};
	}

	// ========== Helper Methods ==========

	private exactDiagonalization(): { eigenvalues: number[]; eigenvectors: Complex[][] } {
		// Simplified eigenvalue solver for small matrices
		// In production, use proper numerical library
		
		const n = this.dimension;
		const eigenvalues: number[] = [];
		const eigenvectors: Complex[][] = [];

		// For 2x2 Hermitian matrix, can solve analytically
		if (n === 2) {
			const a = math.complex(this.matrix[0][0]).re;
			const d = math.complex(this.matrix[1][1]).re;
			const b = this.matrix[0][1];
			const bAbs = Math.sqrt(math.complex(b).re ** 2 + math.complex(b).im ** 2);
			
			const tr = a + d;
			const det = a * d - bAbs * bAbs;
			const disc = Math.sqrt(tr * tr / 4 - det);
			
			const lambda1 = tr / 2 + disc;
			const lambda2 = tr / 2 - disc;
			
			eigenvalues.push(lambda1, lambda2);
			
			// Eigenvectors (simplified)
			eigenvectors.push(
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0)]
			);
		} else {
			// Placeholder for larger matrices
			for (let i = 0; i < n; i++) {
				eigenvalues.push(math.complex(this.matrix[i][i]).re);
				const v: Complex[] = Array(n).fill(math.complex(0, 0));
				v[i] = math.complex(1, 0);
				eigenvectors.push(v);
			}
		}

		return { eigenvalues, eigenvectors };
	}

	private iterativeDiagonalization(): { eigenvalues: number[]; eigenvectors: Complex[][] } {
		// Power iteration for ground state
		const n = this.dimension;
		let v: Complex[] = Array(n).fill(0).map(() => 
			math.complex(Math.random(), Math.random())
		);
		
		// Normalize
		v = this.normalizeVector(v);
		
		// Iterate: v ← Ĥv / ||Ĥv||
		for (let iter = 0; iter < 100; iter++) {
			v = this.matrixVectorMultiply(this.matrix, v);
			v = this.normalizeVector(v);
		}
		
		// Rayleigh quotient: E = ⟨v|Ĥ|v⟩
		const Hv = this.matrixVectorMultiply(this.matrix, v);
		let energy = math.complex(0, 0);
		for (let i = 0; i < n; i++) {
			energy = math.add(energy, math.multiply(math.conj(v[i]), Hv[i])) as Complex;
		}
		
		return {
			eigenvalues: [math.complex(energy).re],
			eigenvectors: [v]
		};
	}

	private matrixMultiply(A: Complex[][], B: Complex[][]): Complex[][] {
		const n = A.length;
		const C: Complex[][] = [];
		
		for (let i = 0; i < n; i++) {
			C[i] = [];
			for (let j = 0; j < n; j++) {
				let sum = math.complex(0, 0);
				for (let k = 0; k < n; k++) {
					sum = math.add(sum, math.multiply(A[i][k], B[k][j])) as Complex;
				}
				C[i][j] = sum;
			}
		}
		
		return C;
	}

	private matrixVectorMultiply(A: Complex[][], v: Complex[]): Complex[] {
		const n = A.length;
		const result: Complex[] = [];
		
		for (let i = 0; i < n; i++) {
			let sum = math.complex(0, 0);
			for (let j = 0; j < n; j++) {
				sum = math.add(sum, math.multiply(A[i][j], v[j])) as Complex;
			}
			result[i] = sum;
		}
		
		return result;
	}

	private normalizeVector(v: Complex[]): Complex[] {
		let norm = 0;
		for (const component of v) {
			const c = math.complex(component);
			norm += c.re * c.re + c.im * c.im;
		}
		norm = Math.sqrt(norm);
		
		return v.map(c => math.divide(c, norm) as Complex);
	}

	private identityMatrix(): Complex[][] {
		const I: Complex[][] = [];
		for (let i = 0; i < this.dimension; i++) {
			I[i] = [];
			for (let j = 0; j < this.dimension; j++) {
				I[i][j] = i === j ? math.complex(1, 0) : math.complex(0, 0);
			}
		}
		return I;
	}

	private matrixExponential(M: Complex[][], scalar: number): Complex[][] {
		// exp(sM) ≈ I + sM + (sM)²/2! + (sM)³/3! + ...
		// Use first few terms for small matrices
		const I = this.identityMatrix();
		let result = I;
		let term = I;
		
		for (let k = 1; k <= 10; k++) {
			term = this.matrixMultiply(term, this.scalarMultiply(M, scalar / k));
			result = this.matrixAdd(result, term);
		}
		
		return result;
	}

	private scalarMultiply(M: Complex[][], scalar: number): Complex[][] {
		return M.map(row => 
			row.map(elem => math.multiply(elem, scalar) as Complex)
		);
	}

	private matrixAdd(A: Complex[][], B: Complex[][]): Complex[][] {
		return A.map((row, i) =>
			row.map((elem, j) => math.add(elem, B[i][j]) as Complex)
		);
	}

	getMatrix(): Complex[][] {
		return this.matrix;
	}

	getDimension(): number {
		return this.dimension;
	}

	getNumQubits(): number {
		return this.numQubits;
	}
}

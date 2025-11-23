/**
 * Quantum Information Theory - Pillar 3
 * 
 * Information measures, entanglement quantification, quantum channels
 * Essential for understanding quantum correlations and processing
 */

import { Complex, create, all } from 'mathjs';
import { HilbertSpace } from './HilbertSpace';

const math = create(all);

export interface QuantumChannel {
	name: string;
	krausOperators: Complex[][][]; // Array of matrices
	isTracePreserving: boolean;
	isCompletelyPositive: boolean;
}

export interface EntanglementMeasures {
	vonNeumannEntropy: number;
	negativity: number;
	concurrence?: number; // For 2-qubit systems
	logarithmicNegativity: number;
}

/**
 * Quantum Information Theory toolkit
 */
export interface EntanglementMeasuresComplete {
	vonNeumannEntropy: number;
	negativity: number;
	concurrence: number;
	logarithmicNegativity: number;
	squashedEntanglement?: number;
}

export interface QuantumChannelCapacity {
	classicalCapacity: number;
	quantumCapacity?: number;
	holevoBound: number;
}

export class QuantumInformation {
	private readonly TOLERANCE = 1e-10;

	/**
	 * Quantum Mutual Information: I(A:B) = S(A) + S(B) - S(AB)
	 * Measures total correlations (classical + quantum)
	 */
	quantumMutualInformation(
		rhoAB: Complex[][],
		dimA: number,
		dimB: number
	): number {
		const hilbert = new HilbertSpace(Math.log2(dimA * dimB));
		
		// S(AB) - Total system entropy
		const SAB = hilbert.calculateVonNeumannEntropy(rhoAB);
		
		// S(A) - Reduced density matrix for subsystem A
		const rhoA = this.partialTrace(rhoAB, dimA, dimB, 'B');
		const SA = hilbert.calculateVonNeumannEntropy(rhoA);
		
		// S(B) - Reduced density matrix for subsystem B
		const rhoB = this.partialTrace(rhoAB, dimA, dimB, 'A');
		const SB = hilbert.calculateVonNeumannEntropy(rhoB);
		
		// I(A:B) = S(A) + S(B) - S(AB)
		return SA + SB - SAB;
	}

	/**
	 * Entanglement Negativity: N(ρ) = ||ρ^T_B||₁ - 1
	 * Computable entanglement measure, zero for separable states
	 */
	calculateNegativity(
		rhoAB: Complex[][],
		dimA: number,
		dimB: number
	): number {
		// Perform partial transpose with respect to B
		const rhoTB = this.partialTranspose(rhoAB, dimA, dimB, 'B');
		
		// Calculate trace norm ||ρ^T_B||₁
		const traceNorm = this.traceNorm(rhoTB);
		
		// Negativity N = (||ρ^T_B||₁ - 1) / 2
		return (traceNorm - 1) / 2;
	}

	/**
	 * Logarithmic Negativity: E_N = log₂(||ρ^T_B||₁)
	 * Upper bound on distillable entanglement
	 */
	logarithmicNegativity(
		rhoAB: Complex[][],
		dimA: number,
		dimB: number
	): number {
		const rhoTB = this.partialTranspose(rhoAB, dimA, dimB, 'B');
		const traceNorm = this.traceNorm(rhoTB);
		
		return Math.log2(traceNorm);
	}

	/**
	 * Concurrence for 2-qubit states
	 * C(ρ) = max{0, λ₁-λ₂-λ₃-λ₄}
	 * where λᵢ are eigenvalues of √(√ρ ρ̃ √ρ) in decreasing order
	 * ρ̃ = (σʸ⊗σʸ)ρ*(σʸ⊗σʸ)
	 * C(ρ) ∈ [0,1], with C=1 for maximally entangled Bell states
	 */
	calculateConcurrence(rho22: Complex[][]): number {
		if (rho22.length !== 4 || rho22[0].length !== 4) {
			throw new Error('Concurrence only defined for 2-qubit (4×4) density matrices');
		}

		// Spin-flip operator σ_y ⊗ σ_y
		const sigmaY = [
			[math.complex(0, 0), math.complex(0, -1)],
			[math.complex(0, 1), math.complex(0, 0)]
		];
		
		const sysy = this.tensorProduct(sigmaY, sigmaY);
		
		// ρ̃ = (σ_y ⊗ σ_y) ρ* (σ_y ⊗ σ_y)
		const rhoConj = this.complexConjugate(rho22);
		const temp = this.matrixMultiply(sysy, rhoConj);
		const rhoTilde = this.matrixMultiply(temp, sysy);
		
		// R = √(√ρ ρ̃ √ρ)
		// In practice, compute eigenvalues of ρ ρ̃
		const rhoRhoTilde = this.matrixMultiply(rho22, rhoTilde);
		const eigenvalues = this.getEigenvalues(rhoRhoTilde);
		
		// Sort eigenvalues in descending order
		const sortedLambdas = eigenvalues.map(Math.sqrt).sort((a, b) => b - a);
		
		// C = max(0, λ₁ - λ₂ - λ₃ - λ₄)
		const concurrence = Math.max(
			0,
			sortedLambdas[0] - sortedLambdas[1] - sortedLambdas[2] - sortedLambdas[3]
		);
		
		return concurrence;
	}

	/**
	 * Calculate von Neumann entropy (wrapper for HilbertSpace compatibility)
	 */
	calculateVonNeumannEntropy(densityMatrix: Complex[][]): number {
		const hilbert = new HilbertSpace(Math.log2(densityMatrix.length));
		return hilbert.calculateVonNeumannEntropy(densityMatrix);
	}
	
	/**
	 * Complete entanglement characterization
	 */
	analyzeEntanglement(
		rhoAB: Complex[][],
		dimA: number,
		dimB?: number
	): EntanglementMeasures {
		// If dimB not provided, assume equal split
		if (!dimB) {
			const totalDim = rhoAB.length;
			dimA = Math.floor(Math.sqrt(totalDim));
			dimB = totalDim / dimA;
		}
		const hilbert = new HilbertSpace(Math.log2(dimA * dimB));
		
		const measures: EntanglementMeasures = {
			vonNeumannEntropy: hilbert.calculateVonNeumannEntropy(rhoAB),
			negativity: this.calculateNegativity(rhoAB, dimA, dimB),
			logarithmicNegativity: this.logarithmicNegativity(rhoAB, dimA, dimB)
		};

		// Add concurrence for 2-qubit systems
		if (dimA === 2 && dimB === 2) {
			measures.concurrence = this.calculateConcurrence(rhoAB);
		}

		return measures;
	}

	/**
	 * Quantum Fisher Information Matrix
	 * Used for parameter estimation and quantum metrology
	 */
	quantumFisherInformation(
		rho: Complex[][],
		generator: Complex[][]
	): number {
		// For pure states |ψ(θ)⟩: F = 4 Var(H) where H is generator
		// For mixed states: More complex calculation
		
		// Simplified for pure states: F = 4⟨ψ|H²|ψ⟩ - 4⟨ψ|H|ψ⟩²
		const H2 = this.matrixMultiply(generator, generator);
		
		const expH = this.expectationValue(rho, generator);
		const expH2 = this.expectationValue(rho, H2);
		
		return 4 * (expH2 - expH * expH);
	}

	/**
	 * Validate quantum channel properties
	 * Must be completely positive and trace preserving (CPTP)
	 */
	validateQuantumChannel(channel: QuantumChannel): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		// Check trace preservation: Σᵢ Kᵢ† Kᵢ = I
		const identity = this.identityMatrix(channel.krausOperators[0].length);
		let sum = this.zerosMatrix(identity.length);
		
		for (const K of channel.krausOperators) {
			const Kdag = this.conjugateTranspose(K);
			const KdagK = this.matrixMultiply(Kdag, K);
			sum = this.matrixAdd(sum, KdagK);
		}
		
		const traceError = this.matrixNorm(this.matrixSubtract(sum, identity));
		
		if (traceError > this.TOLERANCE) {
			errors.push(`Not trace preserving: ||Σ Kᵢ†Kᵢ - I|| = ${traceError.toExponential(3)}`);
			channel.isTracePreserving = false;
		} else {
			channel.isTracePreserving = true;
		}

		// Complete positivity is guaranteed by Kraus representation
		channel.isCompletelyPositive = true;

		return {
			isValid: errors.length === 0,
			errors
		};
	}

	// ========== Helper Methods ==========

	/**
	 * Partial trace: Tr_B(ρ_AB) or Tr_A(ρ_AB)
	 */
	private partialTrace(
		rhoAB: Complex[][],
		dimA: number,
		dimB: number,
		traceOut: 'A' | 'B'
	): Complex[][] {
		if (traceOut === 'B') {
			// Trace out B, return ρ_A
			const rhoA: Complex[][] = [];
			for (let i = 0; i < dimA; i++) {
				rhoA[i] = [];
				for (let j = 0; j < dimA; j++) {
					let sum = math.complex(0, 0);
					for (let k = 0; k < dimB; k++) {
						const idx1 = i * dimB + k;
						const idx2 = j * dimB + k;
						sum = math.add(sum, rhoAB[idx1][idx2]) as Complex;
					}
					rhoA[i][j] = sum;
				}
			}
			return rhoA;
		} else {
			// Trace out A, return ρ_B
			const rhoB: Complex[][] = [];
			for (let i = 0; i < dimB; i++) {
				rhoB[i] = [];
				for (let j = 0; j < dimB; j++) {
					let sum = math.complex(0, 0);
					for (let k = 0; k < dimA; k++) {
						const idx1 = k * dimB + i;
						const idx2 = k * dimB + j;
						sum = math.add(sum, rhoAB[idx1][idx2]) as Complex;
					}
					rhoB[i][j] = sum;
				}
			}
			return rhoB;
		}
	}

	/**
	 * Partial transpose: (ρ_AB)^T_B
	 */
	private partialTranspose(
		rhoAB: Complex[][],
		dimA: number,
		dimB: number,
		transposeSubsystem: 'A' | 'B'
	): Complex[][] {
		const n = dimA * dimB;
		const rhoTB: Complex[][] = [];

		for (let i = 0; i < n; i++) {
			rhoTB[i] = [];
			for (let j = 0; j < n; j++) {
				const iA = Math.floor(i / dimB);
				const iB = i % dimB;
				const jA = Math.floor(j / dimB);
				const jB = j % dimB;

				if (transposeSubsystem === 'B') {
					// Transpose indices of B
					const newIdx = iA * dimB + jB;
					const newJdx = jA * dimB + iB;
					rhoTB[i][j] = rhoAB[newIdx][newJdx];
				} else {
					// Transpose indices of A
					const newIdx = jA * dimB + iB;
					const newJdx = iA * dimB + jB;
					rhoTB[i][j] = rhoAB[newIdx][newJdx];
				}
			}
		}

		return rhoTB;
	}

	/**
	 * Trace norm ||A||₁ = Tr(√(A†A))
	 */
	private traceNorm(matrix: Complex[][]): number {
		const Adag = this.conjugateTranspose(matrix);
		const AdagA = this.matrixMultiply(Adag, matrix);
		const eigenvalues = this.getEigenvalues(AdagA);
		
		return eigenvalues.reduce((sum, lambda) => sum + Math.sqrt(Math.abs(lambda)), 0);
	}

	private tensorProduct(A: Complex[][], B: Complex[][]): Complex[][] {
		const mA = A.length;
		const nA = A[0].length;
		const mB = B.length;
		const nB = B[0].length;
		
		const result: Complex[][] = [];
		for (let i = 0; i < mA * mB; i++) {
			result[i] = [];
			for (let j = 0; j < nA * nB; j++) {
				const iA = Math.floor(i / mB);
				const iB = i % mB;
				const jA = Math.floor(j / nB);
				const jB = j % nB;
				
				result[i][j] = math.multiply(A[iA][jA], B[iB][jB]) as Complex;
			}
		}
		
		return result;
	}

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

	private matrixAdd(A: Complex[][], B: Complex[][]): Complex[][] {
		return A.map((row, i) => row.map((elem, j) => math.add(elem, B[i][j]) as Complex));
	}

	private matrixSubtract(A: Complex[][], B: Complex[][]): Complex[][] {
		return A.map((row, i) => row.map((elem, j) => math.subtract(elem, B[i][j]) as Complex));
	}

	private conjugateTranspose(matrix: Complex[][]): Complex[][] {
		const m = matrix.length;
		const n = matrix[0].length;
		const result: Complex[][] = [];

		for (let i = 0; i < n; i++) {
			result[i] = [];
			for (let j = 0; j < m; j++) {
				result[i][j] = math.conj(matrix[j][i]) as Complex;
			}
		}

		return result;
	}

	private complexConjugate(matrix: Complex[][]): Complex[][] {
		return matrix.map(row => row.map(elem => math.conj(elem) as Complex));
	}

	private expectationValue(rho: Complex[][], observable: Complex[][]): number {
		// Tr(ρ O)
		const product = this.matrixMultiply(rho, observable);
		let trace = 0;
		for (let i = 0; i < product.length; i++) {
			const elem = math.complex(product[i][i]);
			trace += elem.re;
		}
		return trace;
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

	private zerosMatrix(n: number): Complex[][] {
		const Z: Complex[][] = [];
		for (let i = 0; i < n; i++) {
			Z[i] = [];
			for (let j = 0; j < n; j++) {
				Z[i][j] = math.complex(0, 0);
			}
		}
		return Z;
	}

	private matrixNorm(matrix: Complex[][]): number {
		// Frobenius norm
		let sum = 0;
		for (const row of matrix) {
			for (const elem of row) {
				const c = math.complex(elem);
				sum += c.re * c.re + c.im * c.im;
			}
		}
		return Math.sqrt(sum);
	}

	private getEigenvalues(matrix: Complex[][]): number[] {
		// Simplified eigenvalue calculation
		// In production, use proper numerical library
		const n = matrix.length;
		const eigenvalues: number[] = [];
		
		// For now, return diagonal elements as approximation
		for (let i = 0; i < n; i++) {
			eigenvalues.push(math.complex(matrix[i][i]).re);
		}
		
		return eigenvalues;
	}
}

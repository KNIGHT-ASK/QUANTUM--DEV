/**
 * Unit Tests for DensityMatrixOperations
 * 
 * Tests partial trace implementation with:
 * - Bell states (maximally entangled)
 * - Product states (separable)
 * - Trace preservation
 * - Hermiticity and positive semidefiniteness
 * - Edge cases
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 19.1, 19.2, 19.3
 */

import { describe, test, expect } from 'vitest';
import { Complex, create, all } from 'mathjs';
import { DensityMatrixOperations, InvalidQuantumStateError } from './DensityMatrixOperations';

const math = create(all);

describe('DensityMatrixOperations', () => {
	const ops = new DensityMatrixOperations();
	const PRECISION = 10; // Decimal places for toBeCloseTo
	
	/**
	 * Helper: Create Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
	 */
	function createBellStateDensityMatrix(): Complex[][] {
		const psi: Complex[] = [
			math.complex(1 / Math.sqrt(2), 0),
			math.complex(0, 0),
			math.complex(0, 0),
			math.complex(1 / Math.sqrt(2), 0)
		];
		
		// ρ = |ψ⟩⟨ψ|
		const rho: Complex[][] = [];
		for (let i = 0; i < 4; i++) {
			rho[i] = [];
			for (let j = 0; j < 4; j++) {
				rho[i][j] = math.multiply(psi[i], math.conj(psi[j])) as Complex;
			}
		}
		
		return rho;
	}
	
	/**
	 * Helper: Create product state density matrix ρ = ρ_A ⊗ ρ_B
	 * 
	 * Convention: Qubit 0 is LSB (rightmost), qubit 1 is MSB (leftmost)
	 * Basis ordering: |00⟩, |01⟩, |10⟩, |11⟩
	 * Index i: qubit0 = i & 1, qubit1 = (i >> 1) & 1
	 */
	function createProductStateDensityMatrix(): Complex[][] {
		// ρ_A = |0⟩⟨0| (pure state on qubit 0)
		const rhoA: Complex[][] = [
			[math.complex(1, 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(0, 0)]
		];
		
		// ρ_B = |+⟩⟨+| where |+⟩ = (|0⟩ + |1⟩)/√2
		const rhoB: Complex[][] = [
			[math.complex(0.5, 0), math.complex(0.5, 0)],
			[math.complex(0.5, 0), math.complex(0.5, 0)]
		];
		
		// Tensor product ρ_A ⊗ ρ_B
		// Using convention: qubit 0 is LSB, qubit 1 is MSB
		const rho: Complex[][] = [];
		for (let i = 0; i < 4; i++) {
			rho[i] = [];
			for (let j = 0; j < 4; j++) {
				const i0 = i & 1;        // qubit 0 of i
				const i1 = (i >> 1) & 1; // qubit 1 of i
				const j0 = j & 1;        // qubit 0 of j
				const j1 = (j >> 1) & 1; // qubit 1 of j
				
				rho[i][j] = math.multiply(rhoA[i0][j0], rhoB[i1][j1]) as Complex;
			}
		}
		
		return rho;
	}
	
	/**
	 * Helper: Compute trace of a matrix
	 */
	function trace(M: Complex[][]): number {
		let tr = 0;
		for (let i = 0; i < M.length; i++) {
			tr += math.complex(M[i][i]).re;
		}
		return tr;
	}
	
	/**
	 * Helper: Check if matrix is Hermitian
	 */
	function isHermitian(M: Complex[][], tolerance: number = 1e-10): boolean {
		const n = M.length;
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const Mij = math.complex(M[i][j]);
				const MjiConj = math.conj(M[j][i]) as Complex;
				
				const diff = Math.sqrt(
					Math.pow(Mij.re - MjiConj.re, 2) + 
					Math.pow(Mij.im - MjiConj.im, 2)
				);
				
				if (diff > tolerance) {
					return false;
				}
			}
		}
		return true;
	}
	
	/**
	 * Helper: Check if matrix is positive semidefinite (all eigenvalues ≥ 0)
	 * Simplified check: diagonal elements should be non-negative for density matrices
	 */
	function isPositiveSemidefinite(M: Complex[][], tolerance: number = 1e-10): boolean {
		// For density matrices, check diagonal elements are non-negative
		for (let i = 0; i < M.length; i++) {
			if (math.complex(M[i][i]).re < -tolerance) {
				return false;
			}
		}
		return true;
	}
	
	describe('partialTrace', () => {
		test('partial trace of Bell state gives maximally mixed state', () => {
			// Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
			const bell = createBellStateDensityMatrix();
			
			// Trace out qubit 1 (second qubit)
			const rhoA = ops.partialTrace(bell, [1]);
			
			// Should give maximally mixed state: [[0.5, 0], [0, 0.5]]
			expect(rhoA.length).toBe(2);
			expect(rhoA[0].length).toBe(2);
			
			expect(math.complex(rhoA[0][0]).re).toBeCloseTo(0.5, PRECISION);
			expect(math.complex(rhoA[0][0]).im).toBeCloseTo(0, PRECISION);
			
			expect(math.complex(rhoA[0][1]).re).toBeCloseTo(0, PRECISION);
			expect(math.complex(rhoA[0][1]).im).toBeCloseTo(0, PRECISION);
			
			expect(math.complex(rhoA[1][0]).re).toBeCloseTo(0, PRECISION);
			expect(math.complex(rhoA[1][0]).im).toBeCloseTo(0, PRECISION);
			
			expect(math.complex(rhoA[1][1]).re).toBeCloseTo(0.5, PRECISION);
			expect(math.complex(rhoA[1][1]).im).toBeCloseTo(0, PRECISION);
		});
		
		test('partial trace of product state gives pure state', () => {
			// Product state ρ = |0⟩⟨0| ⊗ |+⟩⟨+|
			const product = createProductStateDensityMatrix();
			
			// Trace out qubit 1 should give back |0⟩⟨0|
			const rhoA = ops.partialTrace(product, [1]);
			
			expect(rhoA.length).toBe(2);
			
			// Should be |0⟩⟨0| = [[1, 0], [0, 0]]
			expect(math.complex(rhoA[0][0]).re).toBeCloseTo(1.0, PRECISION);
			expect(math.complex(rhoA[0][1]).re).toBeCloseTo(0, PRECISION);
			expect(math.complex(rhoA[1][0]).re).toBeCloseTo(0, PRECISION);
			expect(math.complex(rhoA[1][1]).re).toBeCloseTo(0, PRECISION);
			
			// Trace out qubit 0 should give back |+⟩⟨+|
			const rhoB = ops.partialTrace(product, [0]);
			
			expect(rhoB.length).toBe(2);
			
			// Should be |+⟩⟨+| = [[0.5, 0.5], [0.5, 0.5]]
			expect(math.complex(rhoB[0][0]).re).toBeCloseTo(0.5, PRECISION);
			expect(math.complex(rhoB[0][1]).re).toBeCloseTo(0.5, PRECISION);
			expect(math.complex(rhoB[1][0]).re).toBeCloseTo(0.5, PRECISION);
			expect(math.complex(rhoB[1][1]).re).toBeCloseTo(0.5, PRECISION);
		});
		
		test('trace preservation: Tr(ρ_A) = 1.0', () => {
			// Test with Bell state
			const bell = createBellStateDensityMatrix();
			const rhoA = ops.partialTrace(bell, [1]);
			
			const tr = trace(rhoA);
			expect(tr).toBeCloseTo(1.0, PRECISION);
			
			// Test with product state
			const product = createProductStateDensityMatrix();
			const rhoB = ops.partialTrace(product, [0]);
			
			const trB = trace(rhoB);
			expect(trB).toBeCloseTo(1.0, PRECISION);
		});
		
		test('Hermiticity of result', () => {
			// Test with Bell state
			const bell = createBellStateDensityMatrix();
			const rhoA = ops.partialTrace(bell, [1]);
			
			expect(isHermitian(rhoA)).toBe(true);
			
			// Test with product state
			const product = createProductStateDensityMatrix();
			const rhoB = ops.partialTrace(product, [0]);
			
			expect(isHermitian(rhoB)).toBe(true);
		});
		
		test('positive semidefiniteness of result', () => {
			// Test with Bell state
			const bell = createBellStateDensityMatrix();
			const rhoA = ops.partialTrace(bell, [1]);
			
			expect(isPositiveSemidefinite(rhoA)).toBe(true);
			
			// Test with product state
			const product = createProductStateDensityMatrix();
			const rhoB = ops.partialTrace(product, [0]);
			
			expect(isPositiveSemidefinite(rhoB)).toBe(true);
		});
		
		test('tracing out all qubits returns trace of original matrix', () => {
			const bell = createBellStateDensityMatrix();
			
			// Trace out both qubits
			const result = ops.partialTrace(bell, [0, 1]);
			
			// Should return 1×1 matrix with trace value
			expect(result.length).toBe(1);
			expect(result[0].length).toBe(1);
			expect(math.complex(result[0][0]).re).toBeCloseTo(1.0, PRECISION);
		});
		
		test('partial trace is symmetric: Tr_A(ρ) and Tr_B(ρ) for Bell state', () => {
			const bell = createBellStateDensityMatrix();
			
			// Trace out qubit 0
			const rhoB = ops.partialTrace(bell, [0]);
			
			// Trace out qubit 1
			const rhoA = ops.partialTrace(bell, [1]);
			
			// For Bell state, both should give maximally mixed state
			expect(math.complex(rhoA[0][0]).re).toBeCloseTo(math.complex(rhoB[0][0]).re, PRECISION);
			expect(math.complex(rhoA[1][1]).re).toBeCloseTo(math.complex(rhoB[1][1]).re, PRECISION);
		});
		
		test('three-qubit system: partial trace over middle qubit', () => {
			// Create GHZ state |GHZ⟩ = (|000⟩ + |111⟩)/√2
			const psi: Complex[] = Array(8).fill(math.complex(0, 0));
			psi[0] = math.complex(1 / Math.sqrt(2), 0); // |000⟩
			psi[7] = math.complex(1 / Math.sqrt(2), 0); // |111⟩
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 8; i++) {
				rho[i] = [];
				for (let j = 0; j < 8; j++) {
					rho[i][j] = math.multiply(psi[i], math.conj(psi[j])) as Complex;
				}
			}
			
			// Trace out qubit 1 (middle qubit)
			const rhoReduced = ops.partialTrace(rho, [1]);
			
			// Result should be 4×4 matrix
			expect(rhoReduced.length).toBe(4);
			expect(rhoReduced[0].length).toBe(4);
			
			// Check trace = 1
			const tr = trace(rhoReduced);
			expect(tr).toBeCloseTo(1.0, PRECISION);
			
			// Check Hermiticity
			expect(isHermitian(rhoReduced)).toBe(true);
		});
		
		test('invalid input: non-square matrix throws error', () => {
			const invalid: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0)]
			];
			
			expect(() => ops.partialTrace(invalid, [0])).toThrow(InvalidQuantumStateError);
		});
		
		test('invalid input: non-power-of-2 dimension throws error', () => {
			const invalid: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)]
			];
			
			expect(() => ops.partialTrace(invalid, [0])).toThrow(InvalidQuantumStateError);
		});
		
		test('invalid input: out-of-range qubit index throws error', () => {
			const bell = createBellStateDensityMatrix();
			
			expect(() => ops.partialTrace(bell, [2])).toThrow(InvalidQuantumStateError);
			expect(() => ops.partialTrace(bell, [-1])).toThrow(InvalidQuantumStateError);
		});
		
		test('invalid input: duplicate qubit indices throws error', () => {
			const bell = createBellStateDensityMatrix();
			
			expect(() => ops.partialTrace(bell, [0, 0])).toThrow(InvalidQuantumStateError);
		});
		
		test('invalid input: empty qubit list throws error', () => {
			const bell = createBellStateDensityMatrix();
			
			expect(() => ops.partialTrace(bell, [])).toThrow(InvalidQuantumStateError);
		});
		
		test('partial trace preserves purity for product states', () => {
			const product = createProductStateDensityMatrix();
			const rhoA = ops.partialTrace(product, [1]);
			
			// Compute purity: Tr(ρ²)
			// First compute ρ²
			const rho2: Complex[][] = [];
			for (let i = 0; i < rhoA.length; i++) {
				rho2[i] = [];
				for (let j = 0; j < rhoA.length; j++) {
					rho2[i][j] = math.complex(0, 0);
					for (let k = 0; k < rhoA.length; k++) {
						rho2[i][j] = math.add(
							rho2[i][j],
							math.multiply(rhoA[i][k], rhoA[k][j])
						) as Complex;
					}
				}
			}
			
			// Then compute trace
			let purity = 0;
			for (let i = 0; i < rho2.length; i++) {
				purity += math.complex(rho2[i][i]).re;
			}
			
			// For pure state, purity should be 1.0
			expect(purity).toBeCloseTo(1.0, PRECISION);
		});
		
		test('partial trace reduces purity for entangled states', () => {
			const bell = createBellStateDensityMatrix();
			const rhoA = ops.partialTrace(bell, [1]);
			
			// Compute purity: Tr(ρ²)
			// First compute ρ²
			const rho2: Complex[][] = [];
			for (let i = 0; i < rhoA.length; i++) {
				rho2[i] = [];
				for (let j = 0; j < rhoA.length; j++) {
					rho2[i][j] = math.complex(0, 0);
					for (let k = 0; k < rhoA.length; k++) {
						rho2[i][j] = math.add(
							rho2[i][j],
							math.multiply(rhoA[i][k], rhoA[k][j])
						) as Complex;
					}
				}
			}
			
			// Then compute trace
			let purity = 0;
			for (let i = 0; i < rho2.length; i++) {
				purity += math.complex(rho2[i][i]).re;
			}
			
			// For maximally mixed state, purity should be 0.5 (= 1/d where d=2)
			expect(purity).toBeCloseTo(0.5, PRECISION);
		});
	});
	
	describe('purity', () => {
		test('pure state has purity of 1.0', () => {
			// Pure state |0⟩⟨0|
			const pure: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0)]
			];
			
			const P = ops.purity(pure);
			expect(P).toBeCloseTo(1.0, PRECISION);
		});
		
		test('maximally mixed state has purity of 1/d', () => {
			// Maximally mixed state for d=2: [[0.5, 0], [0, 0.5]]
			const mixed: Complex[][] = [
				[math.complex(0.5, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0.5, 0)]
			];
			
			const P = ops.purity(mixed);
			expect(P).toBeCloseTo(0.5, PRECISION); // 1/2
		});
		
		test('maximally mixed state for d=4 has purity of 1/4', () => {
			// Maximally mixed state for d=4: I/4
			const mixed: Complex[][] = [
				[math.complex(0.25, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0.25, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0.25, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0.25, 0)]
			];
			
			const P = ops.purity(mixed);
			expect(P).toBeCloseTo(0.25, PRECISION); // 1/4
		});
		
		test('purity is between 1/d and 1.0 for all valid density matrices', () => {
			// Test with reduced density matrix from Bell state
			const bell = createBellStateDensityMatrix();
			const rhoA = ops.partialTrace(bell, [1]);
			
			const P = ops.purity(rhoA);
			const d = rhoA.length;
			
			expect(P).toBeGreaterThanOrEqual(1.0 / d - 1e-10);
			expect(P).toBeLessThanOrEqual(1.0 + 1e-10);
		});
		
		test('purity of Bell state reduced density matrix is 0.5', () => {
			const bell = createBellStateDensityMatrix();
			const rhoA = ops.partialTrace(bell, [1]);
			
			const P = ops.purity(rhoA);
			expect(P).toBeCloseTo(0.5, PRECISION);
		});
		
		test('purity of product state reduced density matrix is 1.0', () => {
			const product = createProductStateDensityMatrix();
			const rhoA = ops.partialTrace(product, [1]);
			
			const P = ops.purity(rhoA);
			expect(P).toBeCloseTo(1.0, PRECISION);
		});
		
		test('purity throws error for invalid density matrix', () => {
			// Non-Hermitian matrix
			const invalid: Complex[][] = [
				[math.complex(1, 0), math.complex(1, 0)],
				[math.complex(0, 0), math.complex(0, 0)]
			];
			
			expect(() => ops.purity(invalid)).toThrow(InvalidQuantumStateError);
		});
	});
	
	describe('thermalState', () => {
		/**
		 * Helper: Create Pauli Z matrix
		 */
		function pauliZ(): Complex[][] {
			return [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(-1, 0)]
			];
		}
		
		/**
		 * Helper: Create Pauli X matrix
		 */
		function pauliX(): Complex[][] {
			return [
				[math.complex(0, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(0, 0)]
			];
		}
		
		test('thermal state at T→0 approaches ground state projector', () => {
			// Use Pauli Z with eigenvalues [-1, 1]
			// Ground state is |1⟩ with energy -1
			const H = pauliZ();
			const T = 0.001; // Very low temperature
			
			const rho = ops.thermalState(H, T);
			
			// At T→0, ρ should approach |1⟩⟨1| = [[0, 0], [0, 1]]
			expect(math.complex(rho[0][0]).re).toBeCloseTo(0, 5); // Less precision for low T
			expect(math.complex(rho[1][1]).re).toBeCloseTo(1, 5);
			expect(math.complex(rho[0][1]).re).toBeCloseTo(0, 5);
			expect(math.complex(rho[1][0]).re).toBeCloseTo(0, 5);
		});
		
		test('thermal state at T→∞ approaches maximally mixed state', () => {
			const H = pauliZ();
			const T = 1000; // Very high temperature
			
			const rho = ops.thermalState(H, T);
			
			// At T→∞, ρ should approach I/2 = [[0.5, 0], [0, 0.5]]
			expect(math.complex(rho[0][0]).re).toBeCloseTo(0.5, 2); // Less precision for high T
			expect(math.complex(rho[1][1]).re).toBeCloseTo(0.5, 2);
			expect(math.complex(rho[0][1]).re).toBeCloseTo(0, 2);
			expect(math.complex(rho[1][0]).re).toBeCloseTo(0, 2);
		});
		
		test('thermal state has trace = 1.0', () => {
			const H = pauliZ();
			const T = 1.0;
			
			const rho = ops.thermalState(H, T);
			
			const tr = trace(rho);
			expect(tr).toBeCloseTo(1.0, PRECISION);
		});
		
		test('thermal state is Hermitian', () => {
			const H = pauliZ();
			const T = 1.0;
			
			const rho = ops.thermalState(H, T);
			
			expect(isHermitian(rho)).toBe(true);
		});
		
		test('thermal state is positive semidefinite', () => {
			const H = pauliZ();
			const T = 1.0;
			
			const rho = ops.thermalState(H, T);
			
			expect(isPositiveSemidefinite(rho)).toBe(true);
		});
		
		test('thermal state at intermediate temperature', () => {
			const H = pauliZ();
			const T = 1.0;
			const beta = 1.0 / T;
			
			const rho = ops.thermalState(H, T);
			
			// Analytical result for Pauli Z:
			// Pauli Z has eigenvalues: +1 for |0⟩, -1 for |1⟩
			// At temperature T, β = 1/T
			// Z = e^(-β*1) + e^(-β*(-1)) = e^(-β) + e^β
			// ρ_00 = e^(-β*1) / Z = e^(-β) / Z (population of |0⟩, energy +1)
			// ρ_11 = e^(-β*(-1)) / Z = e^β / Z (population of |1⟩, energy -1, ground state)
			const Z = Math.exp(-beta) + Math.exp(beta);
			const rho00_expected = Math.exp(-beta) / Z;
			const rho11_expected = Math.exp(beta) / Z;
			
			expect(math.complex(rho[0][0]).re).toBeCloseTo(rho00_expected, PRECISION);
			expect(math.complex(rho[1][1]).re).toBeCloseTo(rho11_expected, PRECISION);
			expect(math.complex(rho[0][1]).re).toBeCloseTo(0, PRECISION);
			expect(math.complex(rho[1][0]).re).toBeCloseTo(0, PRECISION);
		});
		
		test('thermal state for Pauli X Hamiltonian', () => {
			const H = pauliX();
			const T = 1.0;
			
			const rho = ops.thermalState(H, T);
			
			// Should be valid density matrix
			expect(trace(rho)).toBeCloseTo(1.0, PRECISION);
			expect(isHermitian(rho)).toBe(true);
			expect(isPositiveSemidefinite(rho)).toBe(true);
		});
		
		test('thermal state with custom Boltzmann constant', () => {
			const H = pauliZ();
			const T = 1.0;
			const kB = 2.0;
			
			const rho = ops.thermalState(H, T, kB);
			
			// Should still be valid density matrix
			expect(trace(rho)).toBeCloseTo(1.0, PRECISION);
			expect(isHermitian(rho)).toBe(true);
		});
		
		test('thermal state throws error for non-Hermitian Hamiltonian', () => {
			const invalid: Complex[][] = [
				[math.complex(1, 0), math.complex(1, 0)],
				[math.complex(0, 0), math.complex(1, 0)]
			];
			
			expect(() => ops.thermalState(invalid, 1.0)).toThrow(InvalidQuantumStateError);
		});
		
		test('thermal state throws error for negative temperature', () => {
			const H = pauliZ();
			
			expect(() => ops.thermalState(H, -1.0)).toThrow(InvalidQuantumStateError);
		});
		
		test('thermal state throws error for zero temperature', () => {
			const H = pauliZ();
			
			expect(() => ops.thermalState(H, 0)).toThrow(InvalidQuantumStateError);
		});
		
		test('thermal state throws error for invalid Boltzmann constant', () => {
			const H = pauliZ();
			
			expect(() => ops.thermalState(H, 1.0, 0)).toThrow(InvalidQuantumStateError);
			expect(() => ops.thermalState(H, 1.0, -1)).toThrow(InvalidQuantumStateError);
		});
		
		test('thermal state for 4x4 Hamiltonian', () => {
			// Two-qubit Hamiltonian: H = Z⊗I + I⊗Z
			const H: Complex[][] = [
				[math.complex(2, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(-2, 0)]
			];
			
			const T = 1.0;
			const rho = ops.thermalState(H, T);
			
			// Should be valid density matrix
			expect(rho.length).toBe(4);
			expect(trace(rho)).toBeCloseTo(1.0, PRECISION);
			expect(isHermitian(rho)).toBe(true);
			expect(isPositiveSemidefinite(rho)).toBe(true);
		});
	});
});

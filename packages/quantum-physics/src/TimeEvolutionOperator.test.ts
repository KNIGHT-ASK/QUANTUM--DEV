/**
 * Unit Tests for TimeEvolutionOperator
 * 
 * Tests exact time evolution, Trotter decomposition, and state evolution
 * with 10^-10 precision validation.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 19.1, 19.2, 19.3
 */

import { describe, test, expect } from 'vitest';
import { Complex, create, all } from 'mathjs';
import { TimeEvolutionOperator } from './TimeEvolutionOperator';

const math = create(all);

describe('TimeEvolutionOperator', () => {
	const timeEvolution = new TimeEvolutionOperator();
	const PRECISION = 1e-10;
	
	// Helper: Create Pauli matrices
	const createPauliZ = (): Complex[][] => [
		[math.complex(1, 0), math.complex(0, 0)],
		[math.complex(0, 0), math.complex(-1, 0)]
	];
	
	const createPauliX = (): Complex[][] => [
		[math.complex(0, 0), math.complex(1, 0)],
		[math.complex(1, 0), math.complex(0, 0)]
	];
	
	const createPauliY = (): Complex[][] => [
		[math.complex(0, 0), math.complex(0, -1)],
		[math.complex(0, 1), math.complex(0, 0)]
	];
	
	const createHadamard = (): Complex[][] => {
		const inv_sqrt2 = 1 / Math.sqrt(2);
		return [
			[math.complex(inv_sqrt2, 0), math.complex(inv_sqrt2, 0)],
			[math.complex(inv_sqrt2, 0), math.complex(-inv_sqrt2, 0)]
		];
	};
	
	// Helper: Create identity matrix
	const createIdentity = (n: number): Complex[][] => {
		const I: Complex[][] = [];
		for (let i = 0; i < n; i++) {
			I[i] = [];
			for (let j = 0; j < n; j++) {
				I[i][j] = i === j ? math.complex(1, 0) : math.complex(0, 0);
			}
		}
		return I;
	};
	
	// Helper: Matrix norm
	const matrixNorm = (M: Complex[][]): number => {
		let sum = 0;
		for (const row of M) {
			for (const elem of row) {
				const c = math.complex(elem);
				sum += c.re * c.re + c.im * c.im;
			}
		}
		return Math.sqrt(sum);
	};
	
	// Helper: Matrix subtraction
	const matrixSubtract = (A: Complex[][], B: Complex[][]): Complex[][] => {
		return A.map((row, i) => 
			row.map((elem, j) => math.subtract(elem, B[i][j]) as Complex)
		);
	};
	
	// Helper: Check unitarity
	const isUnitary = (U: Complex[][]): boolean => {
		const n = U.length;
		const Udag = conjugateTranspose(U);
		const UdagU = matrixMultiply(Udag, U);
		const I = createIdentity(n);
		const error = matrixNorm(matrixSubtract(UdagU, I));
		return error < PRECISION;
	};
	
	// Helper: Conjugate transpose
	const conjugateTranspose = (M: Complex[][]): Complex[][] => {
		const rows = M.length;
		const cols = M[0].length;
		const result: Complex[][] = [];
		
		for (let i = 0; i < cols; i++) {
			result[i] = [];
			for (let j = 0; j < rows; j++) {
				result[i][j] = math.conj(M[j][i]) as Complex;
			}
		}
		
		return result;
	};
	
	// Helper: Matrix multiply
	const matrixMultiply = (A: Complex[][], B: Complex[][]): Complex[][] => {
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
	};
	
	// Helper: Vector norm
	const vectorNorm = (v: Complex[]): number => {
		let sum = 0;
		for (const val of v) {
			const c = math.complex(val);
			sum += c.re * c.re + c.im * c.im;
		}
		return Math.sqrt(sum);
	};
	
	describe('evolveExact', () => {
		test('t=0 returns identity matrix', () => {
			const H = createPauliZ();
			const U = timeEvolution.evolveExact(H, 0);
			
			const I = createIdentity(2);
			const error = matrixNorm(matrixSubtract(U, I));
			
			expect(error).toBeLessThan(PRECISION);
		});
		
		test('unitarity of U(t) for various times', () => {
			const H = createPauliZ();
			const times = [0.1, 0.5, 1.0, Math.PI, 2 * Math.PI];
			
			for (const t of times) {
				const U = timeEvolution.evolveExact(H, t);
				expect(isUnitary(U)).toBe(true);
			}
		});
		
		test('eigenstate evolution: U(t)|n⟩ = e^(-iEₙt)|n⟩', () => {
			// Pauli-Z has eigenstates |0⟩ (E=+1) and |1⟩ (E=-1)
			const H = createPauliZ();
			const t = 1.0;
			
			// Eigenstate |0⟩ with eigenvalue E = +1
			const psi0: Complex[] = [math.complex(1, 0), math.complex(0, 0)];
			const U = timeEvolution.evolveExact(H, t);
			
			// U(t)|0⟩ should be e^(-i·1·t)|0⟩ = e^(-it)|0⟩
			const psi_t: Complex[] = [];
			for (let i = 0; i < 2; i++) {
				let sum = math.complex(0, 0);
				for (let j = 0; j < 2; j++) {
					sum = math.add(sum, math.multiply(U[i][j], psi0[j])) as Complex;
				}
				psi_t.push(sum);
			}
			
			// Expected: e^(-it)|0⟩
			const phase = -t;
			const expected: Complex[] = [
				math.complex(Math.cos(phase), Math.sin(phase)),
				math.complex(0, 0)
			];
			
			// Compare (up to global phase)
			const error0 = math.abs(math.subtract(psi_t[0], expected[0]) as Complex);
			const error1 = math.abs(math.subtract(psi_t[1], expected[1]) as Complex);
			
			expect(error0).toBeLessThan(PRECISION);
			expect(error1).toBeLessThan(PRECISION);
		});
		
		test('time evolution preserves state normalization', () => {
			const H = createPauliZ();
			const t = 1.5;
			
			// Superposition state
			const inv_sqrt2 = 1 / Math.sqrt(2);
			const psi0: Complex[] = [
				math.complex(inv_sqrt2, 0),
				math.complex(inv_sqrt2, 0)
			];
			
			const psi_t = timeEvolution.applyToState(H, psi0, t);
			const norm = vectorNorm(psi_t);
			
			expect(Math.abs(norm - 1.0)).toBeLessThan(PRECISION);
		});
		
		test('Pauli-Z evolution at t=π gives -I (up to global phase)', () => {
			const H = createPauliZ();
			const t = Math.PI;
			const U = timeEvolution.evolveExact(H, t);
			
			// For Pauli-Z with eigenvalues ±1:
			// U(π) = e^(-i·1·π)|0⟩⟨0| + e^(-i·(-1)·π)|1⟩⟨1|
			//      = e^(-iπ)|0⟩⟨0| + e^(iπ)|1⟩⟨1|
			//      = -|0⟩⟨0| - |1⟩⟨1| = -I
			
			const minusI = [
				[math.complex(-1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(-1, 0)]
			];
			
			const error = matrixNorm(matrixSubtract(U, minusI));
			expect(error).toBeLessThan(PRECISION);
		});
		
		test('Hadamard evolution maintains unitarity', () => {
			const H = createHadamard();
			const times = [0.1, 0.5, 1.0, 2.0];
			
			for (const t of times) {
				const U = timeEvolution.evolveExact(H, t);
				expect(isUnitary(U)).toBe(true);
			}
		});
		
		test('throws error for non-Hermitian matrix', () => {
			// Non-Hermitian matrix
			const nonHermitian = [
				[math.complex(1, 0), math.complex(1, 1)],
				[math.complex(0, 0), math.complex(1, 0)]
			];
			
			expect(() => {
				timeEvolution.evolveExact(nonHermitian, 1.0);
			}).toThrow('Hermitian');
		});
	});
	
	describe('evolveTrotter', () => {
		test('Trotter evolution converges to exact evolution as steps increase', () => {
			const H1 = createPauliX();
			const H2 = createPauliZ();
			const t = 0.5;
			
			// Exact evolution for H = H1 + H2
			const H_total = [
				[math.complex(1, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(-1, 0)]
			];
			const U_exact = timeEvolution.evolveExact(H_total, t);
			
			// Trotter with increasing steps
			const steps_list = [10, 50, 100];
			const errors: number[] = [];
			
			for (const steps of steps_list) {
				const U_trotter = timeEvolution.evolveTrotter([H1, H2], t, steps);
				const error = matrixNorm(matrixSubtract(U_trotter, U_exact));
				errors.push(error);
			}
			
			// Errors should decrease as steps increase
			expect(errors[1]).toBeLessThan(errors[0]);
			expect(errors[2]).toBeLessThan(errors[1]);
		});
		
		test('approximate unitarity within step-size-dependent tolerance', () => {
			const H1 = createPauliX();
			const H2 = createPauliZ();
			const t = 1.0;
			const steps = 50;
			
			const U = timeEvolution.evolveTrotter([H1, H2], t, steps);
			
			// Check approximate unitarity
			const n = U.length;
			const Udag = conjugateTranspose(U);
			const UdagU = matrixMultiply(Udag, U);
			const I = createIdentity(n);
			const error = matrixNorm(matrixSubtract(UdagU, I));
			
			// Tolerance proportional to step size
			const dt = t / steps;
			const tolerance = dt * 10;
			
			expect(error).toBeLessThan(tolerance);
		});
		
		test('Trotter for Hamiltonian with two non-commuting terms', () => {
			// H = σˣ + σᶻ (non-commuting)
			const H1 = createPauliX();
			const H2 = createPauliZ();
			const t = 0.5;
			const steps = 100;
			
			const U = timeEvolution.evolveTrotter([H1, H2], t, steps);
			
			// Should be approximately unitary
			expect(isUnitary(U)).toBe(true);
		});
		
		test('throws error for empty Hamiltonian terms', () => {
			expect(() => {
				timeEvolution.evolveTrotter([], 1.0, 10);
			}).toThrow('At least one Hamiltonian term required');
		});
		
		test('performance for large step counts', () => {
			const H1 = createPauliX();
			const H2 = createPauliZ();
			const t = 1.0;
			const largeSteps = 1000;
			
			const startTime = performance.now();
			const U = timeEvolution.evolveTrotter([H1, H2], t, largeSteps);
			const endTime = performance.now();
			const duration = endTime - startTime;
			
			// Should complete in reasonable time (< 1000ms for 1000 steps on 2x2 matrices)
			expect(duration).toBeLessThan(1000);
			
			// Result should still be approximately unitary
			expect(isUnitary(U)).toBe(true);
			
			// Should converge closer to exact evolution than with fewer steps
			const H_total = [
				[math.complex(1, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(-1, 0)]
			];
			const U_exact = timeEvolution.evolveExact(H_total, t);
			const error = matrixNorm(matrixSubtract(U, U_exact));
			
			// With 1000 steps, error should be reasonably small (< 0.01)
			// Note: Trotter error scales as O(dt^2) for first-order splitting
			expect(error).toBeLessThan(0.01);
		});
	});
	
	describe('applyToState', () => {
		test('t=0 returns initial state unchanged', () => {
			const H = createPauliZ();
			const psi0: Complex[] = [
				math.complex(0.6, 0),
				math.complex(0.8, 0)
			];
			
			const psi_t = timeEvolution.applyToState(H, psi0, 0);
			
			for (let i = 0; i < psi0.length; i++) {
				const error = math.abs(math.subtract(psi_t[i], psi0[i]) as Complex);
				expect(error).toBeLessThan(PRECISION);
			}
		});
		
		test('evolved state normalization preserved', () => {
			const H = createPauliZ();
			const times = [0.1, 0.5, 1.0, 2.0];
			
			const inv_sqrt2 = 1 / Math.sqrt(2);
			const psi0: Complex[] = [
				math.complex(inv_sqrt2, 0),
				math.complex(inv_sqrt2, 0)
			];
			
			for (const t of times) {
				const psi_t = timeEvolution.applyToState(H, psi0, t);
				const norm = vectorNorm(psi_t);
				expect(Math.abs(norm - 1.0)).toBeLessThan(PRECISION);
			}
		});
		
		test('eigenstate evolution produces phase factor', () => {
			// Pauli-Z eigenstate |1⟩ with eigenvalue E = -1
			const H = createPauliZ();
			const psi0: Complex[] = [math.complex(0, 0), math.complex(1, 0)];
			const t = 0.5;
			
			const psi_t = timeEvolution.applyToState(H, psi0, t);
			
			// Expected: e^(-i·(-1)·t)|1⟩ = e^(it)|1⟩
			const phase = t;
			const expected: Complex[] = [
				math.complex(0, 0),
				math.complex(Math.cos(phase), Math.sin(phase))
			];
			
			const error0 = math.abs(math.subtract(psi_t[0], expected[0]) as Complex);
			const error1 = math.abs(math.subtract(psi_t[1], expected[1]) as Complex);
			
			expect(error0).toBeLessThan(PRECISION);
			expect(error1).toBeLessThan(PRECISION);
		});
		
		test('superposition state evolution', () => {
			const H = createPauliZ();
			const t = 1.0;
			
			// Superposition: (|0⟩ + |1⟩)/√2
			const inv_sqrt2 = 1 / Math.sqrt(2);
			const psi0: Complex[] = [
				math.complex(inv_sqrt2, 0),
				math.complex(inv_sqrt2, 0)
			];
			
			const psi_t = timeEvolution.applyToState(H, psi0, t);
			
			// |0⟩ evolves with phase e^(-it), |1⟩ with phase e^(it)
			// Result: (e^(-it)|0⟩ + e^(it)|1⟩)/√2
			const phase0 = -t;
			const phase1 = t;
			const expected: Complex[] = [
				math.complex(inv_sqrt2 * Math.cos(phase0), inv_sqrt2 * Math.sin(phase0)),
				math.complex(inv_sqrt2 * Math.cos(phase1), inv_sqrt2 * Math.sin(phase1))
			];
			
			const error0 = math.abs(math.subtract(psi_t[0], expected[0]) as Complex);
			const error1 = math.abs(math.subtract(psi_t[1], expected[1]) as Complex);
			
			expect(error0).toBeLessThan(PRECISION);
			expect(error1).toBeLessThan(PRECISION);
		});
	});
	
	describe('validateEvolution', () => {
		test('validates unitary operator', () => {
			const H = createPauliZ();
			const U = timeEvolution.evolveExact(H, 1.0);
			
			const result = timeEvolution.validateEvolution(U, H, 1.0);
			
			expect(result.isUnitary).toBe(true);
			expect(result.unitarityError).toBeLessThan(PRECISION);
		});
		
		test('detects non-unitary operator', () => {
			// Create non-unitary matrix
			const nonUnitary = [
				[math.complex(2, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0)]
			];
			
			const result = timeEvolution.validateEvolution(nonUnitary);
			
			expect(result.isUnitary).toBe(false);
			expect(result.unitarityError).toBeGreaterThan(PRECISION);
		});
	});
});

/**
 * Unit Tests for TensorOperations Module
 * 
 * Tests tensor product operations with focus on:
 * - Correct dimension calculation
 * - Preservation of Hermiticity
 * - Preservation of unitarity
 * - Identity tensor products
 * - Pauli matrix tensor products
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 19.1, 19.2, 19.3
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { Complex, create, all } from 'mathjs';
import { TensorOperations, TensorOperationError } from './TensorOperations';

const math = create(all);
const PRECISION = 1e-10;

describe('TensorOperations', () => {
	let tensorOps: TensorOperations;
	
	// Helper function to create complex number
	const c = (re: number, im: number = 0): Complex => math.complex(re, im);
	
	// Helper function to check if two matrices are equal within tolerance
	const matricesEqual = (A: Complex[][], B: Complex[][], tol: number = PRECISION): boolean => {
		if (A.length !== B.length || A[0].length !== B[0].length) {
			return false;
		}
		
		for (let i = 0; i < A.length; i++) {
			for (let j = 0; j < A[i].length; j++) {
				const diff = math.subtract(A[i][j], B[i][j]) as Complex;
				const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
				if (error > tol) {
					return false;
				}
			}
		}
		
		return true;
	};
	
	// Helper to check if matrix is Hermitian
	const isHermitian = (M: Complex[][], tol: number = PRECISION): boolean => {
		const n = M.length;
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const Mij = M[i][j];
				const Mji_conj = math.conj(M[j][i]) as Complex;
				const diff = math.subtract(Mij, Mji_conj) as Complex;
				const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
				if (error > tol) {
					return false;
				}
			}
		}
		return true;
	};
	
	// Helper to check if matrix is unitary
	const isUnitary = (U: Complex[][], tol: number = PRECISION): boolean => {
		const n = U.length;
		
		// Compute U†U
		const UdagU: Complex[][] = [];
		for (let i = 0; i < n; i++) {
			UdagU[i] = [];
			for (let j = 0; j < n; j++) {
				let sum = c(0, 0);
				for (let k = 0; k < n; k++) {
					const Uki_conj = math.conj(U[k][i]) as Complex;
					const product = math.multiply(Uki_conj, U[k][j]) as Complex;
					sum = math.add(sum, product) as Complex;
				}
				UdagU[i][j] = sum;
			}
		}
		
		// Check if UdagU is identity
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const expected = i === j ? c(1, 0) : c(0, 0);
				const diff = math.subtract(UdagU[i][j], expected) as Complex;
				const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
				if (error > tol) {
					return false;
				}
			}
		}
		
		return true;
	};
	
	// Pauli matrices
	const pauliI = (): Complex[][] => [
		[c(1, 0), c(0, 0)],
		[c(0, 0), c(1, 0)]
	];
	
	const pauliX = (): Complex[][] => [
		[c(0, 0), c(1, 0)],
		[c(1, 0), c(0, 0)]
	];
	
	const pauliY = (): Complex[][] => [
		[c(0, 0), c(0, -1)],
		[c(0, 1), c(0, 0)]
	];
	
	const pauliZ = (): Complex[][] => [
		[c(1, 0), c(0, 0)],
		[c(0, 0), c(-1, 0)]
	];
	
	const hadamard = (): Complex[][] => {
		const s = 1 / Math.sqrt(2);
		return [
			[c(s, 0), c(s, 0)],
			[c(s, 0), c(-s, 0)]
		];
	};
	
	beforeEach(() => {
		tensorOps = new TensorOperations();
	});
	
	describe('tensorProduct', () => {
		test('2×2 ⊗ 2×2 produces 4×4 matrix', () => {
			const A = pauliX();
			const B = pauliZ();
			
			const result = tensorOps.tensorProduct(A, B);
			
			// Check dimension
			expect(result.length).toBe(4);
			expect(result[0].length).toBe(4);
			
			// Verify it's a valid 4×4 matrix
			for (let i = 0; i < 4; i++) {
				expect(result[i].length).toBe(4);
				for (let j = 0; j < 4; j++) {
					expect(result[i][j]).toHaveProperty('re');
					expect(result[i][j]).toHaveProperty('im');
					expect(isFinite(result[i][j].re)).toBe(true);
					expect(isFinite(result[i][j].im)).toBe(true);
				}
			}
		});
		
		test('tensor product of Pauli X and Z', () => {
			const X = pauliX();
			const Z = pauliZ();
			
			const XZ = tensorOps.tensorProduct(X, Z);
			
			// X ⊗ Z should be:
			// [0  0  1  0]
			// [0  0  0 -1]
			// [1  0  0  0]
			// [0 -1  0  0]
			const expected: Complex[][] = [
				[c(0), c(0), c(1), c(0)],
				[c(0), c(0), c(0), c(-1)],
				[c(1), c(0), c(0), c(0)],
				[c(0), c(-1), c(0), c(0)]
			];
			
			expect(matricesEqual(XZ, expected)).toBe(true);
		});
		
		test('tensor product of Pauli Y and Y', () => {
			const Y = pauliY();
			
			const YY = tensorOps.tensorProduct(Y, Y);
			
			// Y ⊗ Y should be:
			// [0  0  0 -1]
			// [0  0  1  0]
			// [0  1  0  0]
			// [-1 0  0  0]
			const expected: Complex[][] = [
				[c(0), c(0), c(0), c(-1)],
				[c(0), c(0), c(1), c(0)],
				[c(0), c(1), c(0), c(0)],
				[c(-1), c(0), c(0), c(0)]
			];
			
			expect(matricesEqual(YY, expected)).toBe(true);
		});
		
		test('tensor product preserves Hermiticity', () => {
			const H1 = pauliX(); // Hermitian
			const H2 = pauliZ(); // Hermitian
			
			const result = tensorOps.tensorProduct(H1, H2);
			
			// Result should be Hermitian
			expect(isHermitian(result)).toBe(true);
		});
		
		test('tensor product preserves unitarity', () => {
			const U1 = pauliX(); // Unitary
			const U2 = hadamard(); // Unitary
			
			const result = tensorOps.tensorProduct(U1, U2);
			
			// Result should be unitary
			expect(isUnitary(result)).toBe(true);
		});
		
		test('identity tensored with identity gives larger identity', () => {
			const I2 = pauliI();
			
			const I4 = tensorOps.tensorProduct(I2, I2);
			
			// Should be 4×4 identity
			const expected: Complex[][] = [
				[c(1), c(0), c(0), c(0)],
				[c(0), c(1), c(0), c(0)],
				[c(0), c(0), c(1), c(0)],
				[c(0), c(0), c(0), c(1)]
			];
			
			expect(matricesEqual(I4, expected)).toBe(true);
		});
		
		test('identity tensored with Pauli X', () => {
			const I = pauliI();
			const X = pauliX();
			
			const IX = tensorOps.tensorProduct(I, X);
			
			// I ⊗ X should be:
			// [0 1 0 0]
			// [1 0 0 0]
			// [0 0 0 1]
			// [0 0 1 0]
			const expected: Complex[][] = [
				[c(0), c(1), c(0), c(0)],
				[c(1), c(0), c(0), c(0)],
				[c(0), c(0), c(0), c(1)],
				[c(0), c(0), c(1), c(0)]
			];
			
			expect(matricesEqual(IX, expected)).toBe(true);
		});
		
		test('Pauli X tensored with identity', () => {
			const X = pauliX();
			const I = pauliI();
			
			const XI = tensorOps.tensorProduct(X, I);
			
			// X ⊗ I should be:
			// [0 0 1 0]
			// [0 0 0 1]
			// [1 0 0 0]
			// [0 1 0 0]
			const expected: Complex[][] = [
				[c(0), c(0), c(1), c(0)],
				[c(0), c(0), c(0), c(1)],
				[c(1), c(0), c(0), c(0)],
				[c(0), c(1), c(0), c(0)]
			];
			
			expect(matricesEqual(XI, expected)).toBe(true);
		});
		
		test('three-way tensor product', () => {
			const X = pauliX();
			const Y = pauliY();
			const Z = pauliZ();
			
			// Compute X ⊗ Y ⊗ Z
			const XY = tensorOps.tensorProduct(X, Y);
			const XYZ = tensorOps.tensorProduct(XY, Z);
			
			// Should be 8×8 matrix
			expect(XYZ.length).toBe(8);
			expect(XYZ[0].length).toBe(8);
			
			// Should be Hermitian (all Pauli matrices are Hermitian)
			expect(isHermitian(XYZ)).toBe(true);
			
			// Should be unitary (all Pauli matrices are unitary)
			expect(isUnitary(XYZ)).toBe(true);
		});
		
		test('tensor product with complex matrix', () => {
			const H = hadamard();
			const Y = pauliY();
			
			const HY = tensorOps.tensorProduct(H, Y);
			
			// Should be 4×4
			expect(HY.length).toBe(4);
			
			// Should preserve Hermiticity
			expect(isHermitian(HY)).toBe(true);
			
			// Should preserve unitarity
			expect(isUnitary(HY)).toBe(true);
		});
		
		test('throws error for non-square matrix', () => {
			const nonSquare: Complex[][] = [
				[c(1), c(0)],
				[c(0), c(1)],
				[c(0), c(0)]
			];
			const B = pauliX();
			
			expect(() => tensorOps.tensorProduct(nonSquare, B)).toThrow(TensorOperationError);
		});
		
		test('throws error for empty matrix', () => {
			const empty: Complex[][] = [];
			const B = pauliX();
			
			expect(() => tensorOps.tensorProduct(empty, B)).toThrow(TensorOperationError);
		});
		
		test('throws error for matrix with non-finite elements', () => {
			const invalid: Complex[][] = [
				[c(1), c(Infinity)],
				[c(0), c(1)]
			];
			const B = pauliX();
			
			expect(() => tensorOps.tensorProduct(invalid, B)).toThrow(TensorOperationError);
		});
	});
	
	describe('kroneckerSum', () => {
		test('Kronecker sum of Hermitian matrices is Hermitian', () => {
			const A = pauliX();
			const B = pauliZ();
			
			const result = tensorOps.kroneckerSum(A, B);
			
			expect(isHermitian(result)).toBe(true);
		});
		
		test('Kronecker sum of multiple Hermitian matrices preserves Hermiticity', () => {
			// Test with different Hermitian matrices
			const testCases = [
				[pauliX(), pauliY()],
				[pauliY(), pauliZ()],
				[pauliZ(), pauliX()],
				[hadamard(), pauliZ()]
			];
			
			for (const [A, B] of testCases) {
				const result = tensorOps.kroneckerSum(A, B);
				expect(isHermitian(result)).toBe(true);
			}
		});
		
		test('Kronecker sum dimension', () => {
			const A = pauliX(); // 2×2
			const B = pauliZ(); // 2×2
			
			const result = tensorOps.kroneckerSum(A, B);
			
			// Should be 4×4
			expect(result.length).toBe(4);
			expect(result[0].length).toBe(4);
		});
		
		test('Kronecker sum formula: A⊕B = A⊗I + I⊗B', () => {
			const A = pauliX();
			const B = pauliZ();
			
			const result = tensorOps.kroneckerSum(A, B);
			
			// Manually compute A⊗I + I⊗B
			const I = pauliI();
			const AI = tensorOps.tensorProduct(A, I);
			const IB = tensorOps.tensorProduct(I, B);
			
			const expected: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				expected[i] = [];
				for (let j = 0; j < 4; j++) {
					expected[i][j] = math.add(AI[i][j], IB[i][j]) as Complex;
				}
			}
			
			expect(matricesEqual(result, expected)).toBe(true);
		});
	});
	
	describe('applyToQubits', () => {
		test('single-qubit gate on qubit 0 in 2-qubit system', () => {
			const X = pauliX();
			
			const result = tensorOps.applyToQubits({
				operator: X,
				targetQubits: [0],
				totalQubits: 2
			});
			
			// Should be X ⊗ I
			const I = pauliI();
			const expected = tensorOps.tensorProduct(X, I);
			
			expect(matricesEqual(result, expected)).toBe(true);
		});
		
		test('single-qubit gate on qubit 1 in 2-qubit system', () => {
			const X = pauliX();
			
			const result = tensorOps.applyToQubits({
				operator: X,
				targetQubits: [1],
				totalQubits: 2
			});
			
			// Should be I ⊗ X
			const I = pauliI();
			const expected = tensorOps.tensorProduct(I, X);
			
			expect(matricesEqual(result, expected)).toBe(true);
		});
		
		test('single-qubit gate embedding in 3-qubit system - qubit 0', () => {
			const H = hadamard();
			
			const result = tensorOps.applyToQubits({
				operator: H,
				targetQubits: [0],
				totalQubits: 3
			});
			
			// Should be H ⊗ I ⊗ I (8×8 matrix)
			expect(result.length).toBe(8);
			expect(result[0].length).toBe(8);
			
			// Should be unitary
			expect(isUnitary(result)).toBe(true);
			
			// Verify structure: H ⊗ I ⊗ I
			const I = pauliI();
			const HI = tensorOps.tensorProduct(H, I);
			const HII = tensorOps.tensorProduct(HI, I);
			expect(matricesEqual(result, HII)).toBe(true);
		});
		
		test('single-qubit gate embedding in 3-qubit system - qubit 1', () => {
			const H = hadamard();
			
			const result = tensorOps.applyToQubits({
				operator: H,
				targetQubits: [1],
				totalQubits: 3
			});
			
			// Should be I ⊗ H ⊗ I (8×8 matrix)
			expect(result.length).toBe(8);
			expect(result[0].length).toBe(8);
			
			// Should be unitary
			expect(isUnitary(result)).toBe(true);
		});
		
		test('single-qubit gate embedding in 3-qubit system - qubit 2', () => {
			const X = pauliX();
			
			const result = tensorOps.applyToQubits({
				operator: X,
				targetQubits: [2],
				totalQubits: 3
			});
			
			// Should be I ⊗ I ⊗ X (8×8 matrix)
			expect(result.length).toBe(8);
			expect(result[0].length).toBe(8);
			
			// Should be unitary
			expect(isUnitary(result)).toBe(true);
			
			// Verify structure: I ⊗ I ⊗ X
			const I = pauliI();
			const II = tensorOps.tensorProduct(I, I);
			const IIX = tensorOps.tensorProduct(II, X);
			expect(matricesEqual(result, IIX)).toBe(true);
		});
		
		test('two-qubit gate embedding in 4-qubit system - qubits [0,1]', () => {
			const CNOT: Complex[][] = [
				[c(1), c(0), c(0), c(0)],
				[c(0), c(1), c(0), c(0)],
				[c(0), c(0), c(0), c(1)],
				[c(0), c(0), c(1), c(0)]
			];
			
			const result = tensorOps.applyToQubits({
				operator: CNOT,
				targetQubits: [0, 1],
				totalQubits: 4
			});
			
			// Should be CNOT ⊗ I ⊗ I (16×16 matrix)
			expect(result.length).toBe(16);
			expect(result[0].length).toBe(16);
			
			// Should be unitary
			expect(isUnitary(result)).toBe(true);
		});
		
		test('two-qubit gate embedding in 4-qubit system - qubits [1,2]', () => {
			const CNOT: Complex[][] = [
				[c(1), c(0), c(0), c(0)],
				[c(0), c(1), c(0), c(0)],
				[c(0), c(0), c(0), c(1)],
				[c(0), c(0), c(1), c(0)]
			];
			
			const result = tensorOps.applyToQubits({
				operator: CNOT,
				targetQubits: [1, 2],
				totalQubits: 4
			});
			
			// Should be I ⊗ CNOT ⊗ I (16×16 matrix)
			expect(result.length).toBe(16);
			expect(result[0].length).toBe(16);
			
			// Should be unitary
			expect(isUnitary(result)).toBe(true);
		});
		
		test('two-qubit gate embedding in 4-qubit system - qubits [2,3]', () => {
			const CNOT: Complex[][] = [
				[c(1), c(0), c(0), c(0)],
				[c(0), c(1), c(0), c(0)],
				[c(0), c(0), c(0), c(1)],
				[c(0), c(0), c(1), c(0)]
			];
			
			const result = tensorOps.applyToQubits({
				operator: CNOT,
				targetQubits: [2, 3],
				totalQubits: 4
			});
			
			// Should be I ⊗ I ⊗ CNOT (16×16 matrix)
			expect(result.length).toBe(16);
			expect(result[0].length).toBe(16);
			
			// Should be unitary
			expect(isUnitary(result)).toBe(true);
		});
		
		test('embedded operator only affects target qubit', () => {
			const X = pauliX();
			
			const fullX = tensorOps.applyToQubits({
				operator: X,
				targetQubits: [1],
				totalQubits: 3
			});
			
			// Should be I ⊗ X ⊗ I
			const I = pauliI();
			const IX = tensorOps.tensorProduct(I, X);
			const IXI = tensorOps.tensorProduct(IX, I);
			
			// Verify the embedded operator matches I⊗X⊗I
			expect(matricesEqual(fullX, IXI)).toBe(true);
		});
		
		test('embedded operator affects only target qubits - verify with state application', () => {
			const X = pauliX();
			
			// Apply X to qubit 1 in 3-qubit system
			const fullX = tensorOps.applyToQubits({
				operator: X,
				targetQubits: [1],
				totalQubits: 3
			});
			
			// Create state |010⟩ (qubit 1 is |1⟩)
			const state010: Complex[] = [
				c(0), c(0), c(1), c(0), c(0), c(0), c(0), c(0)
			];
			
			// Apply X to qubit 1: should give |000⟩
			const result: Complex[] = [];
			for (let i = 0; i < 8; i++) {
				let sum = c(0);
				for (let j = 0; j < 8; j++) {
					sum = math.add(sum, math.multiply(fullX[i][j], state010[j])) as Complex;
				}
				result[i] = sum;
			}
			
			// Expected: |000⟩
			const expected: Complex[] = [
				c(1), c(0), c(0), c(0), c(0), c(0), c(0), c(0)
			];
			
			for (let i = 0; i < 8; i++) {
				const diff = math.subtract(result[i], expected[i]) as Complex;
				const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
				expect(error).toBeLessThan(PRECISION);
			}
		});
		
		test('identity construction for qubit at position 0', () => {
			const I = pauliI();
			
			const result = tensorOps.applyToQubits({
				operator: I,
				targetQubits: [0],
				totalQubits: 3
			});
			
			// Should be I ⊗ I ⊗ I (8×8 identity)
			expect(result.length).toBe(8);
			
			// Check it's identity
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					const expected = i === j ? c(1) : c(0);
					const diff = math.subtract(result[i][j], expected) as Complex;
					const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
					expect(error).toBeLessThan(PRECISION);
				}
			}
		});
		
		test('identity construction for qubit at position 1', () => {
			const I = pauliI();
			
			const result = tensorOps.applyToQubits({
				operator: I,
				targetQubits: [1],
				totalQubits: 3
			});
			
			// Should be I ⊗ I ⊗ I (8×8 identity)
			expect(result.length).toBe(8);
			
			// Check it's identity
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					const expected = i === j ? c(1) : c(0);
					const diff = math.subtract(result[i][j], expected) as Complex;
					const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
					expect(error).toBeLessThan(PRECISION);
				}
			}
		});
		
		test('identity construction for qubit at position 2', () => {
			const I = pauliI();
			
			const result = tensorOps.applyToQubits({
				operator: I,
				targetQubits: [2],
				totalQubits: 3
			});
			
			// Should be I ⊗ I ⊗ I (8×8 identity)
			expect(result.length).toBe(8);
			
			// Check it's identity
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					const expected = i === j ? c(1) : c(0);
					const diff = math.subtract(result[i][j], expected) as Complex;
					const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
					expect(error).toBeLessThan(PRECISION);
				}
			}
		});
		
		test('throws error for invalid qubit index', () => {
			const X = pauliX();
			
			expect(() => tensorOps.applyToQubits({
				operator: X,
				targetQubits: [3],
				totalQubits: 2
			})).toThrow(TensorOperationError);
		});
		
		test('throws error for duplicate qubit indices', () => {
			const X = pauliX();
			
			expect(() => tensorOps.applyToQubits({
				operator: X,
				targetQubits: [1, 1],
				totalQubits: 3
			})).toThrow(TensorOperationError);
		});
		
		test('throws error for operator size mismatch', () => {
			const CNOT: Complex[][] = [
				[c(1), c(0), c(0), c(0)],
				[c(0), c(1), c(0), c(0)],
				[c(0), c(0), c(0), c(1)],
				[c(0), c(0), c(1), c(0)]
			];
			
			// CNOT is 2-qubit gate but only 1 target specified
			expect(() => tensorOps.applyToQubits({
				operator: CNOT,
				targetQubits: [0],
				totalQubits: 3
			})).toThrow(TensorOperationError);
		});
	});
	
	describe('precision and edge cases', () => {
		test('maintains 10^-10 precision for tensor products', () => {
			const H = hadamard();
			
			const HH = tensorOps.tensorProduct(H, H);
			
			// Check unitarity with high precision
			expect(isUnitary(HH, PRECISION)).toBe(true);
		});
		
		test('handles identity matrices correctly', () => {
			const I = pauliI();
			
			// I ⊗ I ⊗ I should be 8×8 identity
			const II = tensorOps.tensorProduct(I, I);
			const III = tensorOps.tensorProduct(II, I);
			
			expect(III.length).toBe(8);
			
			// Check it's identity
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					const expected = i === j ? c(1) : c(0);
					const diff = math.subtract(III[i][j], expected) as Complex;
					const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
					expect(error).toBeLessThan(PRECISION);
				}
			}
		});
		
		test('tensor product is associative', () => {
			const X = pauliX();
			const Y = pauliY();
			const Z = pauliZ();
			
			// (X ⊗ Y) ⊗ Z
			const XY = tensorOps.tensorProduct(X, Y);
			const XYZ1 = tensorOps.tensorProduct(XY, Z);
			
			// X ⊗ (Y ⊗ Z)
			const YZ = tensorOps.tensorProduct(Y, Z);
			const XYZ2 = tensorOps.tensorProduct(X, YZ);
			
			// Should be equal
			expect(matricesEqual(XYZ1, XYZ2)).toBe(true);
		});
	});
});

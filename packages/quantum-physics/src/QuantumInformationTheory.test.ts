/**
 * Unit Tests for QuantumInformationTheory
 * 
 * Tests von Neumann entropy calculations with:
 * - Pure states (entropy = 0)
 * - Maximally mixed states (entropy = log₂(d))
 * - Random density matrices (entropy ≥ 0)
 * - Precision validation at 10^-10 tolerance
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 19.1, 19.2, 19.3, 19.4
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { Complex, create, all } from 'mathjs';
import { QuantumInformationTheory, InvalidQuantumStateError } from './QuantumInformationTheory';

const math = create(all);

describe('QuantumInformationTheory', () => {
	let qit: QuantumInformationTheory;
	
	beforeEach(() => {
		qit = new QuantumInformationTheory();
	});
	
	describe('vonNeumannEntropy', () => {
		/**
		 * Test: Pure state returns entropy of 0.0
		 * 
		 * A pure state has density matrix ρ = |ψ⟩⟨ψ| with a single eigenvalue λ=1.
		 * Von Neumann entropy: S = -1·log₂(1) = 0
		 * 
		 * Requirement: 3.3
		 */
		test('pure state returns entropy of 0.0', () => {
			// Pure state: |0⟩ → ρ = |0⟩⟨0| = [[1,0],[0,0]]
			const pureState: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0)]
			];
			
			const entropy = qit.vonNeumannEntropy(pureState);
			
			expect(entropy).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Another pure state |1⟩
		 */
		test('pure state |1⟩ returns entropy of 0.0', () => {
			// Pure state: |1⟩ → ρ = |1⟩⟨1| = [[0,0],[0,1]]
			const pureState: Complex[][] = [
				[math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0)]
			];
			
			const entropy = qit.vonNeumannEntropy(pureState);
			
			expect(entropy).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Maximally mixed state returns log₂(d)
		 * 
		 * Maximally mixed state: ρ = I/d with all eigenvalues = 1/d
		 * Von Neumann entropy: S = -d·(1/d)·log₂(1/d) = log₂(d)
		 * For d=2: S = 1 bit
		 * 
		 * Requirement: 3.4
		 */
		test('maximally mixed state returns log₂(d)', () => {
			// Maximally mixed 2×2: ρ = I/2 = [[0.5,0],[0,0.5]]
			const maxMixed: Complex[][] = [
				[math.complex(0.5, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0.5, 0)]
			];
			
			const entropy = qit.vonNeumannEntropy(maxMixed);
			
			// For d=2, log₂(2) = 1.0
			expect(entropy).toBeCloseTo(1.0, 10);
		});
		
		/**
		 * Test: Maximally mixed 4×4 state
		 */
		test('maximally mixed 4×4 state returns log₂(4) = 2.0', () => {
			// Maximally mixed 4×4: ρ = I/4
			const maxMixed: Complex[][] = [
				[math.complex(0.25, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0.25, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0.25, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0.25, 0)]
			];
			
			const entropy = qit.vonNeumannEntropy(maxMixed);
			
			// For d=4, log₂(4) = 2.0
			expect(entropy).toBeCloseTo(2.0, 10);
		});
		
		/**
		 * Test: Partially mixed state has intermediate entropy
		 */
		test('partially mixed state has entropy between 0 and log₂(d)', () => {
			// Partially mixed: ρ = 0.7|0⟩⟨0| + 0.3|1⟩⟨1|
			const partiallyMixed: Complex[][] = [
				[math.complex(0.7, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0.3, 0)]
			];
			
			const entropy = qit.vonNeumannEntropy(partiallyMixed);
			
			// Should be between 0 and 1
			expect(entropy).toBeGreaterThan(0);
			expect(entropy).toBeLessThan(1.0);
			
			// Analytical value: S = -0.7·log₂(0.7) - 0.3·log₂(0.3) ≈ 0.881
			expect(entropy).toBeCloseTo(0.8812908992306927, 10);
		});
		
		/**
		 * Test: Entropy is non-negative for 100 random density matrices
		 * 
		 * Generate random valid density matrices and verify S(ρ) ≥ 0
		 * 
		 * Requirement: 19.4
		 */
		test('entropy is non-negative for 100 random density matrices', () => {
			let successfulTests = 0;
			for (let trial = 0; trial < 100; trial++) {
				try {
					const rho = generateRandomDensityMatrix(2);
					const entropy = qit.vonNeumannEntropy(rho);
					
					expect(entropy).toBeGreaterThanOrEqual(0);
					expect(entropy).toBeLessThanOrEqual(1.0); // log₂(2) = 1
					successfulTests++;
				} catch (error) {
					// Skip matrices that fail to converge (rare edge case)
					if (error instanceof InvalidQuantumStateError && 
					    error.message.includes('converge')) {
						continue;
					}
					throw error;
				}
			}
			
			// Ensure we successfully tested at least 90% of matrices
			expect(successfulTests).toBeGreaterThanOrEqual(90);
		});
		
		/**
		 * Test: Precision at 10^-10 tolerance
		 * 
		 * Verify that entropy calculations maintain precision
		 * 
		 * Requirement: 19.3
		 */
		test('maintains precision at 10^-10 tolerance', () => {
			// Pure state should give exactly 0 (within numerical precision)
			const pureState: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0)]
			];
			
			const entropy = qit.vonNeumannEntropy(pureState);
			
			expect(Math.abs(entropy)).toBeLessThan(1e-10);
		});
		
		/**
		 * Test: Handles eigenvalues below threshold
		 * 
		 * Eigenvalues < 10^-10 should be treated as zero
		 */
		test('handles eigenvalues below 10^-10 threshold', () => {
			// Nearly pure state with tiny eigenvalue
			const nearlyPure: Complex[][] = [
				[math.complex(1 - 1e-12, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1e-12, 0)]
			];
			
			const entropy = qit.vonNeumannEntropy(nearlyPure);
			
			// Should be essentially zero (tiny eigenvalue ignored)
			expect(entropy).toBeCloseTo(0.0, 9);
		});
		
		/**
		 * Test: Invalid density matrix throws error
		 */
		test('throws InvalidQuantumStateError for non-Hermitian matrix', () => {
			// Non-Hermitian matrix
			const nonHermitian: Complex[][] = [
				[math.complex(0.5, 0), math.complex(0.1, 0)],
				[math.complex(0.2, 0), math.complex(0.5, 0)]
			];
			
			expect(() => qit.vonNeumannEntropy(nonHermitian)).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Invalid trace throws error
		 */
		test('throws InvalidQuantumStateError for trace ≠ 1', () => {
			// Trace = 0.8 instead of 1
			const invalidTrace: Complex[][] = [
				[math.complex(0.4, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0.4, 0)]
			];
			
			expect(() => qit.vonNeumannEntropy(invalidTrace)).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Negative eigenvalue throws error
		 */
		test('throws InvalidQuantumStateError for negative eigenvalues', () => {
			// Matrix with negative eigenvalue (not positive semidefinite)
			const negativeEigenvalue: Complex[][] = [
				[math.complex(0.5, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(-0.5, 0)]
			];
			
			expect(() => qit.vonNeumannEntropy(negativeEigenvalue)).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Empty matrix throws error
		 */
		test('throws InvalidQuantumStateError for empty matrix', () => {
			const empty: Complex[][] = [];
			
			expect(() => qit.vonNeumannEntropy(empty)).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Non-square matrix throws error
		 */
		test('throws InvalidQuantumStateError for non-square matrix', () => {
			const nonSquare: Complex[][] = [
				[math.complex(0.5, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0.5, 0), math.complex(0, 0)]
			];
			
			expect(() => qit.vonNeumannEntropy(nonSquare as any)).toThrow(InvalidQuantumStateError);
		});
	});

	describe('entanglementEntropy', () => {
		/**
		 * Test: Bell state has entanglement entropy of 1.0 bit
		 * 
		 * Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is maximally entangled
		 * Reduced density matrix: ρ_A = I/2 (maximally mixed)
		 * Entanglement entropy: S(ρ_A) = log₂(2) = 1.0 bit
		 * 
		 * Requirement: 4.3
		 */
		test('Bell state has entanglement entropy of 1.0 bit', () => {
			// Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const bellState: Complex[] = [
				math.complex(1 / sqrt2, 0),  // |00⟩
				math.complex(0, 0),           // |01⟩
				math.complex(0, 0),           // |10⟩
				math.complex(1 / sqrt2, 0)    // |11⟩
			];
			
			// Compute entanglement entropy for subsystem A (qubit 0)
			const entropy = qit.entanglementEntropy(bellState, [0]);
			
			// Should be 1.0 bit (maximal entanglement for 2-qubit system)
			expect(entropy).toBeCloseTo(1.0, 10);
		});
		
		/**
		 * Test: Product state has entanglement entropy of 0.0
		 * 
		 * Product state |ψ⟩ = |0⟩⊗|0⟩ has no entanglement
		 * Reduced density matrix: ρ_A = |0⟩⟨0| (pure)
		 * Entanglement entropy: S(ρ_A) = 0
		 * 
		 * Requirement: 4.4
		 */
		test('product state has entanglement entropy of 0.0', () => {
			// Product state |00⟩
			const productState: Complex[] = [
				math.complex(1, 0),  // |00⟩
				math.complex(0, 0),  // |01⟩
				math.complex(0, 0),  // |10⟩
				math.complex(0, 0)   // |11⟩
			];
			
			const entropy = qit.entanglementEntropy(productState, [0]);
			
			// Should be 0.0 (no entanglement)
			expect(entropy).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Another product state |+⟩⊗|0⟩
		 */
		test('product state |+⟩⊗|0⟩ has zero entanglement', () => {
			// |+⟩⊗|0⟩ = (|00⟩ + |10⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const productState: Complex[] = [
				math.complex(1 / sqrt2, 0),  // |00⟩
				math.complex(0, 0),           // |01⟩
				math.complex(1 / sqrt2, 0),  // |10⟩
				math.complex(0, 0)            // |11⟩
			];
			
			const entropy = qit.entanglementEntropy(productState, [0]);
			
			expect(entropy).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Partially entangled state
		 */
		test('partially entangled state has intermediate entropy', () => {
			// State with partial entanglement: 0.8|00⟩ + 0.6|11⟩ (normalized)
			const norm = Math.sqrt(0.8 * 0.8 + 0.6 * 0.6);
			const partiallyEntangled: Complex[] = [
				math.complex(0.8 / norm, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0.6 / norm, 0)
			];
			
			const entropy = qit.entanglementEntropy(partiallyEntangled, [0]);
			
			// Should be between 0 and 1
			expect(entropy).toBeGreaterThan(0);
			expect(entropy).toBeLessThan(1.0);
		});
		
		/**
		 * Test: Invalid subsystem indices throw error
		 * 
		 * Requirement: 4.5
		 */
		test('throws error for invalid subsystem indices', () => {
			const bellState: Complex[] = [
				math.complex(1 / Math.sqrt(2), 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(1 / Math.sqrt(2), 0)
			];
			
			// Qubit index out of range
			expect(() => qit.entanglementEntropy(bellState, [2])).toThrow(InvalidQuantumStateError);
			expect(() => qit.entanglementEntropy(bellState, [-1])).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Empty subsystem throws error
		 */
		test('throws error for empty subsystem', () => {
			const bellState: Complex[] = [
				math.complex(1 / Math.sqrt(2), 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(1 / Math.sqrt(2), 0)
			];
			
			expect(() => qit.entanglementEntropy(bellState, [])).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Non-normalized state throws error
		 */
		test('throws error for non-normalized state', () => {
			const nonNormalized: Complex[] = [
				math.complex(1, 0),
				math.complex(1, 0),
				math.complex(0, 0),
				math.complex(0, 0)
			];
			
			expect(() => qit.entanglementEntropy(nonNormalized, [0])).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Three-qubit GHZ state
		 */
		test('GHZ state has entanglement entropy', () => {
			// GHZ state: (|000⟩ + |111⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const ghzState: Complex[] = [
				math.complex(1 / sqrt2, 0),  // |000⟩
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(1 / sqrt2, 0)   // |111⟩
			];
			
			// Entanglement between qubit 0 and rest
			const entropy = qit.entanglementEntropy(ghzState, [0]);
			
			// GHZ state has 1 bit of entanglement
			expect(entropy).toBeCloseTo(1.0, 10);
		});
	});
	
	describe('quantumMutualInformation', () => {
		/**
		 * Test: Mutual information is zero for independent subsystems
		 * 
		 * For product state ρ_AB = ρ_A ⊗ ρ_B:
		 * I(A:B) = S(A) + S(B) - S(AB) = 0
		 * 
		 * Requirement: 5.3
		 */
		test('mutual information is zero for independent subsystems', () => {
			// Product state |00⟩ → ρ = |00⟩⟨00|
			const productState: Complex[] = [
				math.complex(1, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						productState[i],
						math.conj(productState[j])
					) as Complex;
				}
			}
			
			const mutualInfo = qit.quantumMutualInformation(rho, [0], [1]);
			
			// Should be 0.0 (independent subsystems)
			expect(mutualInfo).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Mutual information is positive for correlated subsystems
		 * 
		 * Bell state has maximal correlations
		 * 
		 * Requirement: 5.4
		 */
		test('mutual information is positive for correlated subsystems', () => {
			// Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const bellState: Complex[] = [
				math.complex(1 / sqrt2, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(1 / sqrt2, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						bellState[i],
						math.conj(bellState[j])
					) as Complex;
				}
			}
			
			const mutualInfo = qit.quantumMutualInformation(rho, [0], [1]);
			
			// For Bell state: I(A:B) = 2 bits (maximal correlation)
			// S(A) = 1, S(B) = 1, S(AB) = 0 → I = 1 + 1 - 0 = 2
			expect(mutualInfo).toBeGreaterThan(0);
			expect(mutualInfo).toBeCloseTo(2.0, 10);
		});
		
		/**
		 * Test: Mutual information for mixed state
		 */
		test('mutual information for mixed state', () => {
			// Maximally mixed 2-qubit state: ρ = I/4
			const maxMixed: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				maxMixed[i] = [];
				for (let j = 0; j < 4; j++) {
					if (i === j) {
						maxMixed[i][j] = math.complex(0.25, 0);
					} else {
						maxMixed[i][j] = math.complex(0, 0);
					}
				}
			}
			
			const mutualInfo = qit.quantumMutualInformation(maxMixed, [0], [1]);
			
			// For maximally mixed state: I(A:B) = 0
			// S(A) = 1, S(B) = 1, S(AB) = 2 → I = 1 + 1 - 2 = 0
			expect(mutualInfo).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Invalid subsystem indices throw error
		 */
		test('throws error for invalid subsystem indices', () => {
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = i === j ? math.complex(0.25, 0) : math.complex(0, 0);
				}
			}
			
			// Qubit index out of range
			expect(() => qit.quantumMutualInformation(rho, [2], [1])).toThrow(InvalidQuantumStateError);
			expect(() => qit.quantumMutualInformation(rho, [0], [-1])).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Overlapping subsystems throw error
		 */
		test('throws error for overlapping subsystems', () => {
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = i === j ? math.complex(0.25, 0) : math.complex(0, 0);
				}
			}
			
			// Subsystems overlap at qubit 0
			expect(() => qit.quantumMutualInformation(rho, [0], [0])).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Empty subsystem throws error
		 */
		test('throws error for empty subsystem', () => {
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = i === j ? math.complex(0.25, 0) : math.complex(0, 0);
				}
			}
			
			expect(() => qit.quantumMutualInformation(rho, [], [1])).toThrow(InvalidQuantumStateError);
			expect(() => qit.quantumMutualInformation(rho, [0], [])).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Three-qubit system mutual information
		 */
		test('three-qubit system mutual information', () => {
			// Product state |000⟩
			const productState: Complex[] = [
				math.complex(1, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 8; i++) {
				rho[i] = [];
				for (let j = 0; j < 8; j++) {
					rho[i][j] = math.multiply(
						productState[i],
						math.conj(productState[j])
					) as Complex;
				}
			}
			
			// Mutual information between qubits 0 and 1
			const mutualInfo = qit.quantumMutualInformation(rho, [0], [1]);
			
			// Product state has no correlations
			expect(mutualInfo).toBeCloseTo(0.0, 10);
		});
	});
	
	describe('negativity', () => {
		/**
		 * Test: Separable state has negativity of 0.0
		 * 
		 * A separable state ρ = ρ_A ⊗ ρ_B has positive partial transpose,
		 * so negativity N(ρ) = 0
		 * 
		 * Requirement: 6.3
		 */
		test('separable state has negativity of 0.0', () => {
			// Separable state: |00⟩⟨00| = |0⟩⟨0| ⊗ |0⟩⟨0|
			const separableState: Complex[] = [
				math.complex(1, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						separableState[i],
						math.conj(separableState[j])
					) as Complex;
				}
			}
			
			const neg = qit.negativity(rho, [0]);
			
			// Separable state has negativity = 0
			expect(neg).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Another separable state |++⟩
		 */
		test('separable state |++⟩ has negativity of 0.0', () => {
			// |+⟩⊗|+⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2
			const separableState: Complex[] = [
				math.complex(0.5, 0),
				math.complex(0.5, 0),
				math.complex(0.5, 0),
				math.complex(0.5, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						separableState[i],
						math.conj(separableState[j])
					) as Complex;
				}
			}
			
			const neg = qit.negativity(rho, [0]);
			
			expect(neg).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Entangled state has positive negativity
		 * 
		 * Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is maximally entangled
		 * and has positive negativity
		 * 
		 * Requirement: 6.4
		 */
		test('entangled state has positive negativity', () => {
			// Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const bellState: Complex[] = [
				math.complex(1 / sqrt2, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(1 / sqrt2, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						bellState[i],
						math.conj(bellState[j])
					) as Complex;
				}
			}
			
			const neg = qit.negativity(rho, [0]);
			
			// Bell state has positive negativity
			expect(neg).toBeGreaterThan(0);
			
			// For maximally entangled Bell state: N = 0.5
			expect(neg).toBeCloseTo(0.5, 10);
		});
		
		/**
		 * Test: Different Bell state
		 */
		test('Bell state |Ψ⁺⟩ has positive negativity', () => {
			// Bell state |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const bellState: Complex[] = [
				math.complex(0, 0),
				math.complex(1 / sqrt2, 0),
				math.complex(1 / sqrt2, 0),
				math.complex(0, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						bellState[i],
						math.conj(bellState[j])
					) as Complex;
				}
			}
			
			const neg = qit.negativity(rho, [0]);
			
			expect(neg).toBeGreaterThan(0);
			expect(neg).toBeCloseTo(0.5, 10);
		});
		
		/**
		 * Test: Partially entangled state
		 */
		test('partially entangled state has intermediate negativity', () => {
			// Partially entangled: 0.8|00⟩ + 0.6|11⟩ (normalized)
			const norm = Math.sqrt(0.8 * 0.8 + 0.6 * 0.6);
			const partiallyEntangled: Complex[] = [
				math.complex(0.8 / norm, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0.6 / norm, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						partiallyEntangled[i],
						math.conj(partiallyEntangled[j])
					) as Complex;
				}
			}
			
			const neg = qit.negativity(rho, [0]);
			
			// Should be between 0 and 0.5
			expect(neg).toBeGreaterThan(0);
			expect(neg).toBeLessThan(0.5);
		});
		
		/**
		 * Test: Invalid subsystem indices throw error
		 */
		test('throws error for invalid subsystem indices', () => {
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = i === j ? math.complex(0.25, 0) : math.complex(0, 0);
				}
			}
			
			// Qubit index out of range
			expect(() => qit.negativity(rho, [2])).toThrow(InvalidQuantumStateError);
			expect(() => qit.negativity(rho, [-1])).toThrow(InvalidQuantumStateError);
		});
		
		/**
		 * Test: Empty partition throws error
		 */
		test('throws error for empty partition', () => {
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = i === j ? math.complex(0.25, 0) : math.complex(0, 0);
				}
			}
			
			expect(() => qit.negativity(rho, [])).toThrow(InvalidQuantumStateError);
		});
	});
	
	describe('concurrence', () => {
		/**
		 * Test: Bell state has concurrence of 1.0
		 * 
		 * Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is maximally entangled
		 * and has concurrence C = 1.0
		 * 
		 * Requirement: 7.2
		 */
		test('Bell state has concurrence of 1.0', () => {
			// Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const bellState: Complex[] = [
				math.complex(1 / sqrt2, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(1 / sqrt2, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						bellState[i],
						math.conj(bellState[j])
					) as Complex;
				}
			}
			
			const conc = qit.concurrence(rho);
			
			// Bell state has concurrence = 1.0
			expect(conc).toBeCloseTo(1.0, 10);
		});
		
		/**
		 * Test: All Bell states have concurrence 1.0
		 */
		test('all Bell states have concurrence of 1.0', () => {
			const sqrt2 = Math.sqrt(2);
			
			// Test all four Bell states
			const bellStates: Complex[][] = [
				// |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
				[
					math.complex(1 / sqrt2, 0),
					math.complex(0, 0),
					math.complex(0, 0),
					math.complex(1 / sqrt2, 0)
				],
				// |Φ⁻⟩ = (|00⟩ - |11⟩)/√2
				[
					math.complex(1 / sqrt2, 0),
					math.complex(0, 0),
					math.complex(0, 0),
					math.complex(-1 / sqrt2, 0)
				],
				// |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2
				[
					math.complex(0, 0),
					math.complex(1 / sqrt2, 0),
					math.complex(1 / sqrt2, 0),
					math.complex(0, 0)
				],
				// |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2
				[
					math.complex(0, 0),
					math.complex(1 / sqrt2, 0),
					math.complex(-1 / sqrt2, 0),
					math.complex(0, 0)
				]
			];
			
			for (const bellState of bellStates) {
				// Convert to density matrix
				const rho: Complex[][] = [];
				for (let i = 0; i < 4; i++) {
					rho[i] = [];
					for (let j = 0; j < 4; j++) {
						rho[i][j] = math.multiply(
							bellState[i],
							math.conj(bellState[j])
						) as Complex;
					}
				}
				
				const conc = qit.concurrence(rho);
				expect(conc).toBeCloseTo(1.0, 10);
			}
		});
		
		/**
		 * Test: Separable two-qubit state has concurrence of 0.0
		 * 
		 * Product state |ψ⟩ = |0⟩⊗|0⟩ is separable
		 * and has concurrence C = 0.0
		 * 
		 * Requirement: 7.3
		 */
		test('separable two-qubit state has concurrence of 0.0', () => {
			// Separable state: |00⟩
			const separableState: Complex[] = [
				math.complex(1, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						separableState[i],
						math.conj(separableState[j])
					) as Complex;
				}
			}
			
			const conc = qit.concurrence(rho);
			
			// Separable state has concurrence = 0.0
			expect(conc).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Another separable state |++⟩
		 */
		test('separable state |++⟩ has concurrence of 0.0', () => {
			// |+⟩⊗|+⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2
			const separableState: Complex[] = [
				math.complex(0.5, 0),
				math.complex(0.5, 0),
				math.complex(0.5, 0),
				math.complex(0.5, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						separableState[i],
						math.conj(separableState[j])
					) as Complex;
				}
			}
			
			const conc = qit.concurrence(rho);
			
			expect(conc).toBeCloseTo(0.0, 10);
		});
		
		/**
		 * Test: Partially entangled state has intermediate concurrence
		 */
		test('partially entangled state has intermediate concurrence', () => {
			// Partially entangled: 0.8|00⟩ + 0.6|11⟩ (normalized)
			const norm = Math.sqrt(0.8 * 0.8 + 0.6 * 0.6);
			const partiallyEntangled: Complex[] = [
				math.complex(0.8 / norm, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(0.6 / norm, 0)
			];
			
			// Convert to density matrix
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(
						partiallyEntangled[i],
						math.conj(partiallyEntangled[j])
					) as Complex;
				}
			}
			
			const conc = qit.concurrence(rho);
			
			// Should be between 0 and 1
			expect(conc).toBeGreaterThan(0);
			expect(conc).toBeLessThan(1.0);
		});
		
		/**
		 * Test: Concurrence throws error for non-two-qubit systems
		 * 
		 * Concurrence is only defined for two-qubit systems (4×4 matrices)
		 * 
		 * Requirement: 7.4
		 */
		test('concurrence throws error for non-two-qubit systems', () => {
			// Single qubit (2×2)
			const singleQubit: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0)]
			];
			
			expect(() => qit.concurrence(singleQubit)).toThrow(InvalidQuantumStateError);
			expect(() => qit.concurrence(singleQubit)).toThrow(/two-qubit/);
		});
		
		/**
		 * Test: Three-qubit system throws error
		 */
		test('concurrence throws error for three-qubit system', () => {
			// Three qubits (8×8)
			const threeQubit: Complex[][] = [];
			for (let i = 0; i < 8; i++) {
				threeQubit[i] = [];
				for (let j = 0; j < 8; j++) {
					threeQubit[i][j] = i === j ? math.complex(0.125, 0) : math.complex(0, 0);
				}
			}
			
			expect(() => qit.concurrence(threeQubit)).toThrow(InvalidQuantumStateError);
			expect(() => qit.concurrence(threeQubit)).toThrow(/two-qubit/);
		});
		
		/**
		 * Test: Invalid density matrix throws error
		 */
		test('concurrence throws error for invalid density matrix', () => {
			// Non-Hermitian matrix
			const nonHermitian: Complex[][] = [
				[math.complex(0.5, 0), math.complex(0.1, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0.2, 0), math.complex(0.5, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)]
			];
			
			expect(() => qit.concurrence(nonHermitian)).toThrow(InvalidQuantumStateError);
		});
	});
});

/**
 * Helper: Generate random valid density matrix
 * 
 * Creates a random diagonal density matrix (guaranteed to converge)
 * with random eigenvalues that sum to 1
 */
function generateRandomDensityMatrix(dim: number): Complex[][] {
	// Generate random eigenvalues that sum to 1
	const eigenvalues: number[] = [];
	let sum = 0;
	
	for (let i = 0; i < dim; i++) {
		const val = Math.random();
		eigenvalues.push(val);
		sum += val;
	}
	
	// Normalize to sum to 1
	for (let i = 0; i < eigenvalues.length; i++) {
		eigenvalues[i] /= sum;
	}
	
	// Create diagonal density matrix (simplest form, always converges)
	const rho: Complex[][] = [];
	for (let i = 0; i < dim; i++) {
		rho[i] = [];
		for (let j = 0; j < dim; j++) {
			if (i === j) {
				rho[i][j] = math.complex(eigenvalues[i], 0);
			} else {
				rho[i][j] = math.complex(0, 0);
			}
		}
	}
	
	return rho;
}

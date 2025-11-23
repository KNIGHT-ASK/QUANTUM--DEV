/**
 * Unit Tests for HamiltonianAnalyzer
 * 
 * Tests spectral analysis functionality including:
 * - Pauli-Z eigenspectrum
 * - Hadamard eigenspectrum
 * - Degenerate Hamiltonians (identity matrix)
 * - Eigenvector normalization precision
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 19.1, 19.2, 19.3
 */

import { describe, test, expect } from 'vitest';
import { HamiltonianAnalyzer } from './HamiltonianAnalyzer';
import { Complex, create, all } from 'mathjs';

const math = create(all);

describe('HamiltonianAnalyzer', () => {
	const analyzer = new HamiltonianAnalyzer();
	const PRECISION = 1e-10;
	
	describe('analyzeSpectrum', () => {
		test('Pauli-Z eigenspectrum has eigenvalues [-1, 1] and gap = 2', () => {
			// Pauli-Z matrix: [[1, 0], [0, -1]]
			const pauliZ: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(-1, 0)]
			];
			
			const analysis = analyzer.analyzeSpectrum(pauliZ);
			
			// Check eigenvalues are [-1, 1] (sorted ascending)
			expect(analysis.eigenvalues).toHaveLength(2);
			expect(analysis.eigenvalues[0]).toBeCloseTo(-1, 10);
			expect(analysis.eigenvalues[1]).toBeCloseTo(1, 10);
			
			// Check ground state energy
			expect(analysis.groundStateEnergy).toBeCloseTo(-1, 10);
			
			// Check spectral gap = E_1 - E_0 = 1 - (-1) = 2
			expect(analysis.spectralGap).toBeCloseTo(2, 10);
			
			// Check eigenvectors exist and are normalized
			expect(analysis.eigenvectors).toHaveLength(2);
			for (const eigenvector of analysis.eigenvectors) {
				let norm2 = 0;
				for (const amp of eigenvector) {
					const c = math.complex(amp);
					norm2 += c.re * c.re + c.im * c.im;
				}
				expect(norm2).toBeCloseTo(1.0, 10);
			}
			
			// Check no degeneracies (each energy appears once)
			expect(analysis.degeneracies.size).toBe(2);
			for (const [energy, count] of analysis.degeneracies.entries()) {
				expect(count).toBe(1);
			}
		});
		
		test('Hadamard eigenspectrum has eigenvalues [-1, 1]', () => {
			// Hadamard matrix: (1/√2) * [[1, 1], [1, -1]]
			const sqrt2 = Math.sqrt(2);
			const hadamard: Complex[][] = [
				[math.complex(1/sqrt2, 0), math.complex(1/sqrt2, 0)],
				[math.complex(1/sqrt2, 0), math.complex(-1/sqrt2, 0)]
			];
			
			const analysis = analyzer.analyzeSpectrum(hadamard);
			
			// Check eigenvalues are [-1, 1]
			expect(analysis.eigenvalues).toHaveLength(2);
			expect(analysis.eigenvalues[0]).toBeCloseTo(-1, 10);
			expect(analysis.eigenvalues[1]).toBeCloseTo(1, 10);
			
			// Check ground state energy
			expect(analysis.groundStateEnergy).toBeCloseTo(-1, 10);
			
			// Check spectral gap
			expect(analysis.spectralGap).toBeCloseTo(2, 10);
			
			// Check eigenvector normalization
			for (const eigenvector of analysis.eigenvectors) {
				let norm2 = 0;
				for (const amp of eigenvector) {
					const c = math.complex(amp);
					norm2 += c.re * c.re + c.im * c.im;
				}
				expect(norm2).toBeCloseTo(1.0, 10);
			}
		});
		
		test('Degenerate Hamiltonian (identity matrix) has all eigenvalues equal', () => {
			// Identity matrix: all eigenvalues = 1
			const identity: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0)]
			];
			
			const analysis = analyzer.analyzeSpectrum(identity);
			
			// Check all eigenvalues are 1
			expect(analysis.eigenvalues).toHaveLength(2);
			expect(analysis.eigenvalues[0]).toBeCloseTo(1, 10);
			expect(analysis.eigenvalues[1]).toBeCloseTo(1, 10);
			
			// Check ground state energy
			expect(analysis.groundStateEnergy).toBeCloseTo(1, 10);
			
			// Check spectral gap is 0 (degenerate)
			expect(analysis.spectralGap).toBeCloseTo(0, 10);
			
			// Check degeneracy detection: energy 1 appears twice
			expect(analysis.degeneracies.size).toBe(1);
			const degeneracy = Array.from(analysis.degeneracies.values())[0];
			expect(degeneracy).toBe(2);
		});
		
		test('Eigenvector normalization precision at 10^-10 tolerance', () => {
			// Test with a more complex Hermitian matrix
			const H: Complex[][] = [
				[math.complex(2, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(3, 0)]
			];
			
			const analysis = analyzer.analyzeSpectrum(H);
			
			// Verify each eigenvector is normalized to precision 10^-10
			for (const eigenvector of analysis.eigenvectors) {
				let norm2 = 0;
				for (const amp of eigenvector) {
					const c = math.complex(amp);
					norm2 += c.re * c.re + c.im * c.im;
				}
				const error = Math.abs(norm2 - 1.0);
				expect(error).toBeLessThan(PRECISION);
			}
			
			// Verify orthogonality between eigenvectors
			const v0 = analysis.eigenvectors[0];
			const v1 = analysis.eigenvectors[1];
			let innerProd = math.complex(0, 0);
			for (let i = 0; i < v0.length; i++) {
				innerProd = math.add(
					innerProd,
					math.multiply(math.conj(v0[i]), v1[i])
				) as Complex;
			}
			const orthogonalityError = Math.abs(math.complex(innerProd).re);
			expect(orthogonalityError).toBeLessThan(PRECISION);
		});
		
		test('4x4 Hamiltonian spectral analysis', () => {
			// Test with a 4x4 Hermitian matrix (2-qubit system)
			const H: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(2, 0), math.complex(0.5, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0.5, 0), math.complex(2, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(3, 0)]
			];
			
			const analysis = analyzer.analyzeSpectrum(H);
			
			// Check we get 4 eigenvalues
			expect(analysis.eigenvalues).toHaveLength(4);
			
			// Check eigenvalues are sorted ascending
			for (let i = 1; i < analysis.eigenvalues.length; i++) {
				expect(analysis.eigenvalues[i]).toBeGreaterThanOrEqual(
					analysis.eigenvalues[i-1] - PRECISION
				);
			}
			
			// Check ground state is the minimum
			expect(analysis.groundStateEnergy).toBe(analysis.eigenvalues[0]);
			
			// Check spectral gap is positive
			expect(analysis.spectralGap).toBeGreaterThanOrEqual(0);
			
			// Check all eigenvectors are normalized
			for (const eigenvector of analysis.eigenvectors) {
				let norm2 = 0;
				for (const amp of eigenvector) {
					const c = math.complex(amp);
					norm2 += c.re * c.re + c.im * c.im;
				}
				expect(Math.abs(norm2 - 1.0)).toBeLessThan(PRECISION);
			}
		});
		
		test('Throws error for non-Hermitian matrix', () => {
			// Non-Hermitian matrix
			const nonHermitian: Complex[][] = [
				[math.complex(1, 0), math.complex(2, 0)],
				[math.complex(3, 0), math.complex(4, 0)]
			];
			
			expect(() => {
				analyzer.analyzeSpectrum(nonHermitian);
			}).toThrow('Hamiltonian must be Hermitian');
		});
		
		test('Degeneracy detection with multiple degenerate levels', () => {
			// Matrix with degeneracies: eigenvalues [0, 0, 1, 1]
			const H: Complex[][] = [
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(1, 0)]
			];
			
			const analysis = analyzer.analyzeSpectrum(H);
			
			// Should detect two energy levels with degeneracy 2 each
			expect(analysis.degeneracies.size).toBe(2);
			
			// Check degeneracies
			let foundZero = false;
			let foundOne = false;
			for (const [energy, count] of analysis.degeneracies.entries()) {
				if (Math.abs(energy - 0) < PRECISION) {
					expect(count).toBe(2);
					foundZero = true;
				} else if (Math.abs(energy - 1) < PRECISION) {
					expect(count).toBe(2);
					foundOne = true;
				}
			}
			expect(foundZero).toBe(true);
			expect(foundOne).toBe(true);
		});
	});
	
	describe('detectSymmetries', () => {
		test('Particle number conservation for number-conserving Hamiltonian', () => {
			// Create a 2-qubit Hamiltonian that conserves particle number
			// Example: H = |01⟩⟨01| + |10⟩⟨10| + 2|11⟩⟨11|
			// This conserves total particle number
			const H: Complex[][] = [
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)], // |00⟩
				[math.complex(0, 0), math.complex(1, 0), math.complex(0, 0), math.complex(0, 0)], // |01⟩
				[math.complex(0, 0), math.complex(0, 0), math.complex(1, 0), math.complex(0, 0)], // |10⟩
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(2, 0)]  // |11⟩
			];
			
			const symmetries = analyzer.detectSymmetries(H);
			
			// Should detect particle number conservation
			const particleNumberSym = symmetries.find(s => s.name === 'Particle Number');
			expect(particleNumberSym).toBeDefined();
			if (particleNumberSym) {
				expect(particleNumberSym.physicalMeaning).toContain('particle number');
				expect(particleNumberSym.operator).toBeDefined();
				expect(particleNumberSym.operator.length).toBe(4);
			}
		});
		
		test('Particle number NOT conserved for non-number-conserving Hamiltonian', () => {
			// Create a 2-qubit Hamiltonian that does NOT conserve particle number
			// Example: H with off-diagonal terms that change particle number
			const H: Complex[][] = [
				[math.complex(1, 0), math.complex(0.5, 0), math.complex(0, 0), math.complex(0, 0)], // |00⟩
				[math.complex(0.5, 0), math.complex(2, 0), math.complex(0, 0), math.complex(0, 0)], // |01⟩
				[math.complex(0, 0), math.complex(0, 0), math.complex(2, 0), math.complex(0.5, 0)], // |10⟩
				[math.complex(0, 0), math.complex(0, 0), math.complex(0.5, 0), math.complex(3, 0)]  // |11⟩
			];
			
			const symmetries = analyzer.detectSymmetries(H);
			
			// Should NOT detect particle number conservation
			const particleNumberSym = symmetries.find(s => s.name === 'Particle Number');
			expect(particleNumberSym).toBeUndefined();
		});
		
		test('Parity conservation for symmetric Hamiltonian', () => {
			// Create a Hamiltonian with parity symmetry
			// Diagonal Hamiltonian automatically has parity symmetry
			const H: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(2, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(2, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(3, 0)]
			];
			
			const symmetries = analyzer.detectSymmetries(H);
			
			// Should detect parity symmetry
			const paritySym = symmetries.find(s => s.name === 'Parity');
			expect(paritySym).toBeDefined();
			if (paritySym) {
				expect(paritySym.physicalMeaning).toContain('parity');
				expect(paritySym.operator).toBeDefined();
			}
		});
		
		test('Parity NOT conserved for non-symmetric Hamiltonian', () => {
			// Create a Hamiltonian that breaks parity symmetry
			// Use X operator which flips parity: σˣ = |0⟩⟨1| + |1⟩⟨0|
			// For 2-qubit: X₁ = σˣ ⊗ I
			const H: Complex[][] = [
				[math.complex(0, 0), math.complex(0, 0), math.complex(1, 0), math.complex(0, 0)], // X on first qubit
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0), math.complex(0, 0), math.complex(0, 0)]
			];
			
			const symmetries = analyzer.detectSymmetries(H);
			
			// Should NOT detect parity symmetry (X operator anti-commutes with Z)
			const paritySym = symmetries.find(s => s.name === 'Parity');
			expect(paritySym).toBeUndefined();
		});
		
		test('Systems with no symmetries return empty list', () => {
			// Create a generic 2-qubit Hamiltonian with no symmetries
			const H: Complex[][] = [
				[math.complex(1.0, 0), math.complex(0.2, 0.1), math.complex(0.3, -0.1), math.complex(0.1, 0)],
				[math.complex(0.2, -0.1), math.complex(1.5, 0), math.complex(0.15, 0), math.complex(0.25, 0.05)],
				[math.complex(0.3, 0.1), math.complex(0.15, 0), math.complex(2.0, 0), math.complex(0.2, -0.05)],
				[math.complex(0.1, 0), math.complex(0.25, -0.05), math.complex(0.2, 0.05), math.complex(2.5, 0)]
			];
			
			const symmetries = analyzer.detectSymmetries(H);
			
			// Should return empty list
			expect(Array.isArray(symmetries)).toBe(true);
			expect(symmetries.length).toBe(0);
		});
		
		test('Single qubit system detects parity symmetry', () => {
			// Single qubit diagonal Hamiltonian
			const H: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(2, 0)]
			];
			
			const symmetries = analyzer.detectSymmetries(H);
			
			// Should detect parity symmetry for single qubit
			const paritySym = symmetries.find(s => s.name === 'Parity');
			expect(paritySym).toBeDefined();
		});
		
		test('Identity matrix has all symmetries', () => {
			// Identity matrix commutes with everything
			const H: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(1, 0)]
			];
			
			const symmetries = analyzer.detectSymmetries(H);
			
			// Identity should have both particle number and parity symmetries
			expect(symmetries.length).toBeGreaterThan(0);
			
			const particleNumberSym = symmetries.find(s => s.name === 'Particle Number');
			const paritySym = symmetries.find(s => s.name === 'Parity');
			
			expect(particleNumberSym).toBeDefined();
			expect(paritySym).toBeDefined();
		});
		
		test('Validates commutator norm is below precision threshold', () => {
			// Create a Hamiltonian with known symmetry
			const H: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(1, 0)]
			];
			
			const conserved = analyzer.findConservedQuantities(H);
			
			// All conserved quantities should have commutator norm < 10^-10
			for (const quantity of conserved) {
				expect(quantity.commutatorNorm).toBeLessThan(PRECISION);
				expect(quantity.name).toBeDefined();
				expect(quantity.operator).toBeDefined();
			}
		});
	});
	
	describe('findConservedQuantities', () => {
		test('Finds conserved quantities for symmetric Hamiltonian', () => {
			// Identity matrix commutes with everything
			const H: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0)]
			];
			
			const conserved = analyzer.findConservedQuantities(H);
			
			// Should return list of conserved quantities
			expect(Array.isArray(conserved)).toBe(true);
			
			// Each conserved quantity should have commutator norm < 10^-10
			for (const quantity of conserved) {
				expect(quantity.commutatorNorm).toBeLessThan(PRECISION);
			}
		});
	});
});

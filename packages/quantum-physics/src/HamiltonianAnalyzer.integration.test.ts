/**
 * Integration Tests for HamiltonianAnalyzer
 * 
 * Tests integration with ValidationEngine and NumericalMethods
 */

import { describe, test, expect } from 'vitest';
import { HamiltonianAnalyzer } from './HamiltonianAnalyzer';
import { ValidationEngine } from './ValidationEngine';
import { Complex, create, all } from 'mathjs';

const math = create(all);

describe('HamiltonianAnalyzer Integration', () => {
	const analyzer = new HamiltonianAnalyzer();
	const validator = new ValidationEngine();
	const PRECISION = 1e-10;
	
	test('Integration with ValidationEngine for Hermiticity check', () => {
		// Create a simple real Hermitian matrix
		const H: Complex[][] = [
			[math.complex(1, 0), math.complex(0.5, 0)],
			[math.complex(0.5, 0), math.complex(2, 0)]
		];
		
		// Validate Hermiticity using ValidationEngine
		const hermiticity = validator.validateHermiticity(H);
		expect(hermiticity.passed).toBe(true);
		
		// Analyze spectrum should succeed
		const analysis = analyzer.analyzeSpectrum(H);
		expect(analysis.eigenvalues).toHaveLength(2);
		expect(analysis.groundStateEnergy).toBeLessThanOrEqual(analysis.eigenvalues[1]);
	});
	
	test('Complete physics analysis pipeline', () => {
		// Create a physical Hamiltonian (Pauli-X)
		const pauliX: Complex[][] = [
			[math.complex(0, 0), math.complex(1, 0)],
			[math.complex(1, 0), math.complex(0, 0)]
		];
		
		// Step 1: Validate Hermiticity
		const hermiticity = validator.validateHermiticity(pauliX);
		expect(hermiticity.passed).toBe(true);
		
		// Step 2: Analyze spectrum
		const analysis = analyzer.analyzeSpectrum(pauliX);
		expect(analysis.eigenvalues[0]).toBeCloseTo(-1, 10);
		expect(analysis.eigenvalues[1]).toBeCloseTo(1, 10);
		
		// Step 3: Check symmetries
		const symmetries = analyzer.detectSymmetries(pauliX);
		expect(Array.isArray(symmetries)).toBe(true);
		
		// Step 4: Find conserved quantities
		const conserved = analyzer.findConservedQuantities(pauliX);
		expect(Array.isArray(conserved)).toBe(true);
	});
	
	test('Validates eigenvector properties match ValidationEngine standards', () => {
		const H: Complex[][] = [
			[math.complex(3, 0), math.complex(1, 0)],
			[math.complex(1, 0), math.complex(2, 0)]
		];
		
		const analysis = analyzer.analyzeSpectrum(H);
		
		// Each eigenvector should pass normalization validation
		for (const eigenvector of analysis.eigenvectors) {
			let norm2 = 0;
			for (const amp of eigenvector) {
				const c = math.complex(amp);
				norm2 += c.re * c.re + c.im * c.im;
			}
			
			// Should match ValidationEngine precision standards
			expect(Math.abs(norm2 - 1.0)).toBeLessThan(PRECISION);
		}
	});
});

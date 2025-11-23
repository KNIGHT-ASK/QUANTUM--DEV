/**
 * HamiltonianAnalyzer Demo
 * 
 * Demonstrates spectral analysis and symmetry detection capabilities
 */

import { HamiltonianAnalyzer } from '../src/HamiltonianAnalyzer';
import { Complex, create, all } from 'mathjs';

const math = create(all);

console.log('=== HAMILTONIAN ANALYZER DEMO ===\n');

const analyzer = new HamiltonianAnalyzer();

// Example 1: Pauli-Z Hamiltonian
console.log('1. Pauli-Z Hamiltonian Analysis');
console.log('   H = [[1, 0], [0, -1]]');
const pauliZ: Complex[][] = [
	[math.complex(1, 0), math.complex(0, 0)],
	[math.complex(0, 0), math.complex(-1, 0)]
];

const pauliZAnalysis = analyzer.analyzeSpectrum(pauliZ);
console.log(`   Eigenvalues: [${pauliZAnalysis.eigenvalues.map(e => e.toFixed(6)).join(', ')}]`);
console.log(`   Ground State Energy: ${pauliZAnalysis.groundStateEnergy.toFixed(6)}`);
console.log(`   Spectral Gap: ${pauliZAnalysis.spectralGap.toFixed(6)}`);
console.log(`   Degeneracies: ${pauliZAnalysis.degeneracies.size} distinct energy levels\n`);

// Example 2: Hadamard Hamiltonian
console.log('2. Hadamard Hamiltonian Analysis');
console.log('   H = (1/√2) * [[1, 1], [1, -1]]');
const sqrt2 = Math.sqrt(2);
const hadamard: Complex[][] = [
	[math.complex(1/sqrt2, 0), math.complex(1/sqrt2, 0)],
	[math.complex(1/sqrt2, 0), math.complex(-1/sqrt2, 0)]
];

const hadamardAnalysis = analyzer.analyzeSpectrum(hadamard);
console.log(`   Eigenvalues: [${hadamardAnalysis.eigenvalues.map(e => e.toFixed(6)).join(', ')}]`);
console.log(`   Ground State Energy: ${hadamardAnalysis.groundStateEnergy.toFixed(6)}`);
console.log(`   Spectral Gap: ${hadamardAnalysis.spectralGap.toFixed(6)}\n`);

// Example 3: Degenerate Hamiltonian (Identity)
console.log('3. Degenerate Hamiltonian (Identity Matrix)');
console.log('   H = [[1, 0], [0, 1]]');
const identity: Complex[][] = [
	[math.complex(1, 0), math.complex(0, 0)],
	[math.complex(0, 0), math.complex(1, 0)]
];

const identityAnalysis = analyzer.analyzeSpectrum(identity);
console.log(`   Eigenvalues: [${identityAnalysis.eigenvalues.map(e => e.toFixed(6)).join(', ')}]`);
console.log(`   Ground State Energy: ${identityAnalysis.groundStateEnergy.toFixed(6)}`);
console.log(`   Spectral Gap: ${identityAnalysis.spectralGap.toFixed(6)} (degenerate!)`);
console.log(`   Degeneracies:`);
for (const [energy, count] of identityAnalysis.degeneracies.entries()) {
	console.log(`     Energy ${energy.toFixed(6)}: degeneracy ${count}`);
}
console.log();

// Example 4: 2-qubit Hamiltonian
console.log('4. Two-Qubit Hamiltonian Analysis');
console.log('   H = [[1, 0, 0, 0], [0, 2, 0.5, 0], [0, 0.5, 2, 0], [0, 0, 0, 3]]');
const twoQubit: Complex[][] = [
	[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
	[math.complex(0, 0), math.complex(2, 0), math.complex(0.5, 0), math.complex(0, 0)],
	[math.complex(0, 0), math.complex(0.5, 0), math.complex(2, 0), math.complex(0, 0)],
	[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(3, 0)]
];

const twoQubitAnalysis = analyzer.analyzeSpectrum(twoQubit);
console.log(`   Eigenvalues: [${twoQubitAnalysis.eigenvalues.map(e => e.toFixed(6)).join(', ')}]`);
console.log(`   Ground State Energy: ${twoQubitAnalysis.groundStateEnergy.toFixed(6)}`);
console.log(`   Spectral Gap: ${twoQubitAnalysis.spectralGap.toFixed(6)}`);
console.log(`   Number of eigenstates: ${twoQubitAnalysis.eigenvectors.length}\n`);

// Example 5: Symmetry Detection
console.log('5. Symmetry Detection');
console.log('   Testing Pauli-Z for symmetries...');
const symmetries = analyzer.detectSymmetries(pauliZ);
if (symmetries.length > 0) {
	console.log(`   Found ${symmetries.length} symmetries:`);
	for (const sym of symmetries) {
		console.log(`     - ${sym.name}: ${sym.physicalMeaning}`);
	}
} else {
	console.log('   No standard symmetries detected');
}
console.log();

// Example 6: Conserved Quantities
console.log('6. Conserved Quantities');
console.log('   Finding conserved quantities for identity matrix...');
const conserved = analyzer.findConservedQuantities(identity);
if (conserved.length > 0) {
	console.log(`   Found ${conserved.length} conserved quantities:`);
	for (const quantity of conserved) {
		console.log(`     - ${quantity.name}: commutator norm = ${quantity.commutatorNorm.toExponential(3)}`);
	}
} else {
	console.log('   No conserved quantities found');
}
console.log();

// Example 7: Precision Validation
console.log('7. Precision Validation (10^-10 tolerance)');
const testH: Complex[][] = [
	[math.complex(2, 0), math.complex(1, 0)],
	[math.complex(1, 0), math.complex(3, 0)]
];
const precisionAnalysis = analyzer.analyzeSpectrum(testH);
console.log('   Checking eigenvector orthonormality...');
for (let i = 0; i < precisionAnalysis.eigenvectors.length; i++) {
	let norm2 = 0;
	for (const amp of precisionAnalysis.eigenvectors[i]) {
		const c = math.complex(amp);
		norm2 += c.re * c.re + c.im * c.im;
	}
	const error = Math.abs(norm2 - 1.0);
	console.log(`   Eigenvector ${i}: ||ψ||² = ${norm2.toFixed(12)}, error = ${error.toExponential(3)}`);
}

console.log('\n=== DEMO COMPLETE ===');

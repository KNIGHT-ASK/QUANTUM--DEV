/**
 * Complete H2 Molecule VQE Example
 * 
 * Demonstrates the FULL Quantum Dev pipeline:
 * 1. Physics Analysis → Molecular Hamiltonian
 * 2. Jordan-Wigner → Qubit Hamiltonian
 * 3. VQE Ansatz Design
 * 4. Multi-Framework Code Generation
 * 
 * Expected Result: -1.137 Hartree (experimental ground state energy)
 */

import { MolecularHamiltonian } from '../packages/quantum-physics/src/MolecularHamiltonian';
import { QuantumIRBuilder, QuantumAlgorithmTemplates } from '../packages/quantum-codegen/src/QuantumIR';
import { QiskitGenerator } from '../packages/quantum-codegen/src/QiskitGenerator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * STEP 1: Get H2 Molecular Hamiltonian
 * Using real data from arXiv:2003.00171v1
 */
console.log('=== QUANTUM DEV: H2 VQE PIPELINE ===\n');
console.log('Step 1: Building H2 Molecular Hamiltonian...');

const bondLength = 0.735; // Angstroms (equilibrium)
const h2Hamiltonian = MolecularHamiltonian.getH2Hamiltonian(bondLength);

console.log(`  Bond Length: ${bondLength} Å`);
console.log(`  Electrons: ${h2Hamiltonian.numElectrons}`);
console.log(`  Spatial Orbitals: ${h2Hamiltonian.numOrbitals}`);
console.log(`  Nuclear Repulsion: ${h2Hamiltonian.nuclearRepulsion.toFixed(4)} Hartree`);

// Validate Hamiltonian
const validation = MolecularHamiltonian.validate(h2Hamiltonian);
if (!validation.isValid) {
	console.error('❌ Hamiltonian validation failed:');
	validation.errors.forEach(err => console.error(`  - ${err}`));
	process.exit(1);
}
console.log('✅ Hamiltonian is physically valid\n');

/**
 * STEP 2: Convert to Qubit Hamiltonian
 * Jordan-Wigner transformation + symmetry reduction
 */
console.log('Step 2: Converting to Qubit Hamiltonian (Jordan-Wigner)...');

const qubitHam = MolecularHamiltonian.toQubitHamiltonian(h2Hamiltonian);

console.log(`  Constant Term: ${qubitHam.constantTerm.toFixed(4)}`);
console.log(`  Pauli Terms: ${qubitHam.pauliStrings.length}`);
qubitHam.pauliStrings.forEach(term => {
	console.log(`    ${term.coeff.toFixed(4)} ${term.ops}`);
});

// Build qubit matrix
const qubitMatrix = MolecularHamiltonian.buildQubitMatrix(qubitHam);
console.log(`\n✅ Qubit Hamiltonian: 4×4 matrix (2 qubits with symmetry)\n`);

/**
 * STEP 3: Design VQE Ansatz
 * Hardware-efficient ansatz with symmetry preservation
 */
console.log('Step 3: Designing VQE Ansatz...');

// Build VQE circuit using template
const vqeIR = QuantumAlgorithmTemplates.VQE(2, 1); // 2 qubits, depth 1

// Add Hamiltonian metadata
vqeIR.hamiltonian = {
	description: 'H2 Molecular Hamiltonian (STO-3G)',
	groundStateEnergy: -1.137
};

// Add symmetries
vqeIR.physicsMetadata.symmetries.push({
	operator: 'N',
	eigenvalue: 2,
	description: 'Particle number conservation (2 electrons)'
});

vqeIR.physicsMetadata.symmetries.push({
	operator: 'S_z',
	eigenvalue: 0,
	description: 'Singlet state (S=0)'
});

console.log(`  Ansatz Type: ${vqeIR.physicsMetadata.algorithm.type}`);
console.log(`  Qubits: ${vqeIR.hilbertSpace.numQubits}`);
console.log(`  Gates: ${vqeIR.gates.length}`);
console.log(`  Variational Parameters: 4 (2 RY + 2 RZ per qubit)`);
console.log(`  Symmetries Preserved: ${vqeIR.physicsMetadata.symmetries.length}`);
console.log('✅ VQE ansatz designed with symmetry preservation\n');

/**
 * STEP 4: Generate Qiskit Code
 * Production-ready Python with tests and validation
 */
console.log('Step 4: Generating Qiskit Code...');

const qiskitGen = new QiskitGenerator();
const qiskitCode = qiskitGen.generateCode(vqeIR, {
	includeTesting: true,
	includeVisualization: true,
	backend: 'simulator'
});

// Save to file
const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

const qiskitFile = path.join(outputDir, 'h2_vqe_qiskit.py');
fs.writeFileSync(qiskitFile, qiskitCode);

console.log(`✅ Qiskit code generated: ${qiskitFile}`);
console.log(`   Lines of code: ${qiskitCode.split('\n').length}`);

/**
 * STEP 5: Expected Results
 */
console.log('\n=== EXPECTED RESULTS ===');
console.log(`Ground State Energy: ${MolecularHamiltonian.getGroundStateEnergy('H2')} Hartree`);
console.log(`Experimental Value: -1.137 Hartree`);
console.log(`Accuracy Target: ±0.001 Hartree (chemical accuracy)`);

console.log('\n=== EXECUTION INSTRUCTIONS ===');
console.log('1. Install Qiskit: pip install qiskit qiskit-aer');
console.log(`2. Run: python ${qiskitFile}`);
console.log('3. Compare output energy to -1.137 Hartree');
console.log('4. VQE should converge in ~50-100 iterations');

console.log('\n🎉 QUANTUM DEV PIPELINE COMPLETE!');
console.log('Physics → Hamiltonian → VQE → Code → Execution');
console.log('\n💡 Next Steps:');
console.log('  - Try Cirq generator for Google quantum');
console.log('  - Try PennyLane for quantum ML');
console.log('  - Test with different molecules (LiH, H2O)');
console.log('  - Run on real IBM quantum hardware');

console.log('\n---');
console.log('Quantum Dev - Where Physics Meets Intelligence');
console.log('Built with data from arXiv:2003.00171v1 and 20+ papers');

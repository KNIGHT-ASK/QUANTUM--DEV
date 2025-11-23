/**
 * Bell State Generation - Simplest Entanglement Example
 * 
 * Creates maximally entangled Bell state: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
 * Demonstrates multi-framework code generation
 */

import { QuantumAlgorithmTemplates } from '../packages/quantum-codegen/src/QuantumIR';
import { QiskitGenerator } from '../packages/quantum-codegen/src/QiskitGenerator';
import { CirqGenerator } from '../packages/quantum-codegen/src/CirqGenerator';
import { PennyLaneGenerator } from '../packages/quantum-codegen/src/PennyLaneGenerator';
import * as fs from 'fs';
import * as path from 'path';

console.log('=== Bell State Generation - Quantum Dev ===\n');

// Create Bell state circuit using template
const bellIR = QuantumAlgorithmTemplates.BellState();

console.log('Bell State: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2');
console.log('Properties:');
console.log('  - Maximally entangled');
console.log('  - Schmidt coefficients: [1/√2, 1/√2]');
console.log('  - Von Neumann entropy: 1 bit');
console.log('  - Violation of Bell inequality\n');

console.log('Circuit:');
console.log('  |0⟩ ──H──●──M');
console.log('  |0⟩ ─────X──M\n');

// Generate code for all 3 frameworks
const outputDir = path.join(__dirname, '../output/bell');
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating multi-framework code...\n');

// Qiskit
const qiskitGen = new QiskitGenerator();
const qiskitCode = qiskitGen.generateCode(bellIR, {
	includeTesting: true,
	includeVisualization: true,
	backend: 'simulator'
});
fs.writeFileSync(path.join(outputDir, 'bell_state_qiskit.py'), qiskitCode);
console.log('✓ Qiskit code generated');

// Cirq
const cirqGen = new CirqGenerator();
const cirqCode = cirqGen.generateCode(bellIR, {
	includeTesting: true,
	includeVisualization: true,
	simulator: 'simulator'
});
fs.writeFileSync(path.join(outputDir, 'bell_state_cirq.py'), cirqCode);
console.log('✓ Cirq code generated');

// PennyLane
const pennylaneGen = new PennyLaneGenerator();
const pennylaneCode = pennylaneGen.generateCode(bellIR, {
	includeTesting: true,
	device: 'default.qubit'
});
fs.writeFileSync(path.join(outputDir, 'bell_state_pennylane.py'), pennylaneCode);
console.log('✓ PennyLane code generated');

console.log('\n🎉 Bell state examples ready!');
console.log('📁 Output directory: ' + outputDir);
console.log('\nQuantum Dev - Where Physics Meets Intelligence');

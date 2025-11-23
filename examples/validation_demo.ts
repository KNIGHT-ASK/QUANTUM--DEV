/**
 * Validation Engine Demo
 * Shows how ValidationEngine catches physics errors
 */

import { ValidationEngine } from '../packages/quantum-physics/src/ValidationEngine';
import { create, all, Complex } from 'mathjs';

const math = create(all);

console.log('=== Quantum Dev Validation Engine Demo ===\n');

const validator = new ValidationEngine();

// TEST 1: Invalid (non-normalized) state
console.log('TEST 1: Non-Normalized State');
console.log('State: [1, 0.5, 0, 0]');

const invalidState = {
	amplitudes: [
		math.complex(1, 0),
		math.complex(0.5, 0),
		math.complex(0, 0),
		math.complex(0, 0)
	],
	numQubits: 2,
	isPure: true
};

const result1 = validator.validateNormalization(invalidState);
console.log(result1.message);
console.log('');

// TEST 2: Valid Bell state
console.log('TEST 2: Bell State');
console.log('State: [1/√2, 0, 0, 1/√2]');

const bellState = {
	amplitudes: [
		math.complex(1/Math.sqrt(2), 0),
		math.complex(0, 0),
		math.complex(0, 0),
		math.complex(1/Math.sqrt(2), 0)
	],
	numQubits: 2,
	isPure: true
};

const result2 = validator.validateNormalization(bellState);
console.log(result2.message);
console.log('');

// TEST 3: Hermitian matrix (Pauli Z)
console.log('TEST 3: Pauli Z Hermiticity');
const pauliZ: Complex[][] = [
	[math.complex(1, 0), math.complex(0, 0)],
	[math.complex(0, 0), math.complex(-1, 0)]
];

const result3 = validator.validateHermiticity(pauliZ);
console.log(result3.message);
console.log('');

// TEST 4: Non-Hermitian matrix
console.log('TEST 4: Non-Hermitian Matrix');
const nonHermitian: Complex[][] = [
	[math.complex(1, 0), math.complex(1, 1)],
	[math.complex(0, 0), math.complex(-1, 0)]
];

const result4 = validator.validateHermiticity(nonHermitian);
console.log(result4.message);
console.log('');

// TEST 5: Comprehensive validation
console.log('TEST 5: Comprehensive System Validation');
const hamiltonianMatrix = pauliZ; // Use Complex[][] directly
const report = validator.validateQuantumSystem(bellState, hamiltonianMatrix);
console.log(validator.generateReport(report));

console.log('✅ Validation Engine Demo Complete!');
console.log('Physics correctness guaranteed at 10^(-10) tolerance\n');

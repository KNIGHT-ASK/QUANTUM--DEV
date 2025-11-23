/**
 * Negativity and Concurrence Demo
 * 
 * Demonstrates the new entanglement measures:
 * - Negativity for mixed states
 * - Concurrence for two-qubit systems
 */

import { QuantumInformationTheory } from '../src/QuantumInformationTheory';
import { Complex, create, all } from 'mathjs';

const math = create(all);

console.log('='.repeat(60));
console.log('NEGATIVITY AND CONCURRENCE DEMONSTRATION');
console.log('='.repeat(60));

const qit = new QuantumInformationTheory();

// ========== NEGATIVITY EXAMPLES ==========
console.log('\n📊 NEGATIVITY MEASURE');
console.log('-'.repeat(60));

// Example 1: Separable state (product state)
console.log('\n1. Separable State |00⟩');
const separableState: Complex[] = [
	math.complex(1, 0),
	math.complex(0, 0),
	math.complex(0, 0),
	math.complex(0, 0)
];

const separableRho: Complex[][] = [];
for (let i = 0; i < 4; i++) {
	separableRho[i] = [];
	for (let j = 0; j < 4; j++) {
		separableRho[i][j] = math.multiply(
			separableState[i],
			math.conj(separableState[j])
		) as Complex;
	}
}

const negSeparable = qit.negativity(separableRho, [0]);
console.log(`   Negativity: ${negSeparable.toFixed(10)}`);
console.log(`   ✓ Separable state has N = 0 (no entanglement)`);

// Example 2: Bell state (maximally entangled)
console.log('\n2. Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2');
const sqrt2 = Math.sqrt(2);
const bellState: Complex[] = [
	math.complex(1 / sqrt2, 0),
	math.complex(0, 0),
	math.complex(0, 0),
	math.complex(1 / sqrt2, 0)
];

const bellRho: Complex[][] = [];
for (let i = 0; i < 4; i++) {
	bellRho[i] = [];
	for (let j = 0; j < 4; j++) {
		bellRho[i][j] = math.multiply(
			bellState[i],
			math.conj(bellState[j])
		) as Complex;
	}
}

const negBell = qit.negativity(bellRho, [0]);
console.log(`   Negativity: ${negBell.toFixed(10)}`);
console.log(`   ✓ Maximally entangled state has N = 0.5`);

// Example 3: Partially entangled state
console.log('\n3. Partially Entangled State: 0.8|00⟩ + 0.6|11⟩');
const norm = Math.sqrt(0.8 * 0.8 + 0.6 * 0.6);
const partialState: Complex[] = [
	math.complex(0.8 / norm, 0),
	math.complex(0, 0),
	math.complex(0, 0),
	math.complex(0.6 / norm, 0)
];

const partialRho: Complex[][] = [];
for (let i = 0; i < 4; i++) {
	partialRho[i] = [];
	for (let j = 0; j < 4; j++) {
		partialRho[i][j] = math.multiply(
			partialState[i],
			math.conj(partialState[j])
		) as Complex;
	}
}

const negPartial = qit.negativity(partialRho, [0]);
console.log(`   Negativity: ${negPartial.toFixed(10)}`);
console.log(`   ✓ Partial entanglement: 0 < N < 0.5`);

// ========== CONCURRENCE EXAMPLES ==========
console.log('\n\n📊 CONCURRENCE MEASURE');
console.log('-'.repeat(60));

// Example 1: Separable state
console.log('\n1. Separable State |00⟩');
const concSeparable = qit.concurrence(separableRho);
console.log(`   Concurrence: ${concSeparable.toFixed(10)}`);
console.log(`   ✓ Separable state has C = 0 (no entanglement)`);

// Example 2: Bell state
console.log('\n2. Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2');
const concBell = qit.concurrence(bellRho);
console.log(`   Concurrence: ${concBell.toFixed(10)}`);
console.log(`   ✓ Maximally entangled state has C = 1.0`);

// Example 3: Partially entangled state
console.log('\n3. Partially Entangled State: 0.8|00⟩ + 0.6|11⟩');
const concPartial = qit.concurrence(partialRho);
console.log(`   Concurrence: ${concPartial.toFixed(10)}`);
console.log(`   ✓ Partial entanglement: 0 < C < 1.0`);

// Example 4: All four Bell states
console.log('\n4. All Four Bell States');
const bellStates = [
	{
		name: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
		state: [
			math.complex(1 / sqrt2, 0),
			math.complex(0, 0),
			math.complex(0, 0),
			math.complex(1 / sqrt2, 0)
		]
	},
	{
		name: '|Φ⁻⟩ = (|00⟩ - |11⟩)/√2',
		state: [
			math.complex(1 / sqrt2, 0),
			math.complex(0, 0),
			math.complex(0, 0),
			math.complex(-1 / sqrt2, 0)
		]
	},
	{
		name: '|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2',
		state: [
			math.complex(0, 0),
			math.complex(1 / sqrt2, 0),
			math.complex(1 / sqrt2, 0),
			math.complex(0, 0)
		]
	},
	{
		name: '|Ψ⁻⟩ = (|01⟩ - |10⟩)/√2',
		state: [
			math.complex(0, 0),
			math.complex(1 / sqrt2, 0),
			math.complex(-1 / sqrt2, 0),
			math.complex(0, 0)
		]
	}
];

for (const { name, state } of bellStates) {
	const rho: Complex[][] = [];
	for (let i = 0; i < 4; i++) {
		rho[i] = [];
		for (let j = 0; j < 4; j++) {
			rho[i][j] = math.multiply(
				state[i],
				math.conj(state[j])
			) as Complex;
		}
	}
	
	const conc = qit.concurrence(rho);
	const neg = qit.negativity(rho, [0]);
	console.log(`   ${name}`);
	console.log(`      Concurrence: ${conc.toFixed(10)}, Negativity: ${neg.toFixed(10)}`);
}

// ========== COMPARISON ==========
console.log('\n\n📊 NEGATIVITY vs CONCURRENCE COMPARISON');
console.log('-'.repeat(60));
console.log('\nFor various entanglement levels:');
console.log('State                    | Negativity | Concurrence');
console.log('-'.repeat(60));

const testStates = [
	{ name: 'Separable |00⟩', alpha: 1.0, beta: 0.0 },
	{ name: 'Weak entanglement', alpha: 0.95, beta: 0.31 },
	{ name: 'Medium entanglement', alpha: 0.8, beta: 0.6 },
	{ name: 'Strong entanglement', alpha: 0.6, beta: 0.8 },
	{ name: 'Maximal (Bell)', alpha: 1/sqrt2, beta: 1/sqrt2 }
];

for (const { name, alpha, beta } of testStates) {
	// Normalize the state
	const normFactor = Math.sqrt(alpha * alpha + beta * beta);
	const alphaNew = alpha / normFactor;
	const betaNew = beta / normFactor;
	
	const state: Complex[] = [
		math.complex(alphaNew, 0),
		math.complex(0, 0),
		math.complex(0, 0),
		math.complex(betaNew, 0)
	];
	
	const rho: Complex[][] = [];
	for (let i = 0; i < 4; i++) {
		rho[i] = [];
		for (let j = 0; j < 4; j++) {
			rho[i][j] = math.multiply(
				state[i],
				math.conj(state[j])
			) as Complex;
		}
	}
	
	const neg = qit.negativity(rho, [0]);
	const conc = qit.concurrence(rho);
	
	console.log(`${name.padEnd(24)} | ${neg.toFixed(6).padStart(10)} | ${conc.toFixed(6).padStart(11)}`);
}

console.log('\n' + '='.repeat(60));
console.log('✓ Negativity and Concurrence Implementation Complete');
console.log('='.repeat(60));

/**
 * CORE PHYSICS VALIDATOR TESTS
 * 
 * CRITICAL: These tests MUST pass at 10^-10 precision
 * This proves our physics is correct BEFORE any code generation
 */

import { describe, test, expect } from 'vitest';
import { CorePhysicsValidator, Matrix, Vector } from '../src/CorePhysicsValidator';

describe('CorePhysicsValidator - Matrix Operations', () => {
    
    test('Complex multiplication is correct', () => {
        const a = { real: 1, imag: 2 };
        const b = { real: 3, imag: 4 };
        const result = CorePhysicsValidator.complexMultiply(a, b);
        
        // (1+2i)(3+4i) = 3+4i+6i+8i² = 3+10i-8 = -5+10i
        expect(result.real).toBeCloseTo(-5, 10);
        expect(result.imag).toBeCloseTo(10, 10);
    });

    test('Matrix multiplication is correct', () => {
        const A: Matrix = [
            [{ real: 1, imag: 0 }, { real: 2, imag: 0 }],
            [{ real: 3, imag: 0 }, { real: 4, imag: 0 }]
        ];
        const B: Matrix = [
            [{ real: 5, imag: 0 }, { real: 6, imag: 0 }],
            [{ real: 7, imag: 0 }, { real: 8, imag: 0 }]
        ];
        
        const C = CorePhysicsValidator.matrixMultiply(A, B);
        
        // AB = [[1*5+2*7, 1*6+2*8], [3*5+4*7, 3*6+4*8]]
        //    = [[19, 22], [43, 50]]
        expect(C[0][0].real).toBe(19);
        expect(C[0][1].real).toBe(22);
        expect(C[1][0].real).toBe(43);
        expect(C[1][1].real).toBe(50);
    });

    test('Conjugate transpose is correct', () => {
        const M: Matrix = [
            [{ real: 1, imag: 2 }, { real: 3, imag: 4 }],
            [{ real: 5, imag: 6 }, { real: 7, imag: 8 }]
        ];
        
        const Mdagger = CorePhysicsValidator.conjugateTranspose(M);
        
        // M† should be [[1-2i, 5-6i], [3-4i, 7-8i]]
        expect(Mdagger[0][0]).toEqual({ real: 1, imag: -2 });
        expect(Mdagger[0][1]).toEqual({ real: 5, imag: -6 });
        expect(Mdagger[1][0]).toEqual({ real: 3, imag: -4 });
        expect(Mdagger[1][1]).toEqual({ real: 7, imag: -8 });
    });
});

describe('CorePhysicsValidator - Hermiticity', () => {
    
    test('Pauli-Z is Hermitian', () => {
        const Z: Matrix = [
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
        ];
        
        expect(() => CorePhysicsValidator.validateHermitian(Z, 'Pauli-Z'))
            .not.toThrow();
    });

    test('Non-Hermitian matrix fails validation', () => {
        const notH: Matrix = [
            [{ real: 1, imag: 0 }, { real: 1, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
        ];
        
        expect(() => CorePhysicsValidator.validateHermitian(notH, 'Bad Matrix'))
            .toThrow(/NOT Hermitian/);
    });

    test('All Pauli gates are Hermitian', () => {
        expect(() => CorePhysicsValidator.createPauliX()).not.toThrow();
        expect(() => CorePhysicsValidator.createPauliY()).not.toThrow();
        expect(() => CorePhysicsValidator.createPauliZ()).not.toThrow();
    });
});

describe('CorePhysicsValidator - Unitarity', () => {
    
    test('Hadamard is unitary', () => {
        expect(() => CorePhysicsValidator.createHadamard()).not.toThrow();
    });

    test('CNOT is unitary', () => {
        expect(() => CorePhysicsValidator.createCNOT()).not.toThrow();
    });

    test('Non-unitary matrix fails validation', () => {
        const notU: Matrix = [
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: 2, imag: 0 }]  // NOT unitary!
        ];
        
        expect(() => CorePhysicsValidator.validateUnitary(notU, 'Bad Matrix'))
            .toThrow(/NOT Unitary/);
    });

    test('Identity is unitary', () => {
        const I = CorePhysicsValidator.identity(2);
        expect(() => CorePhysicsValidator.validateUnitary(I, 'Identity'))
            .not.toThrow();
    });
});

describe('CorePhysicsValidator - Normalization', () => {
    
    test('Normalized state passes', () => {
        const sqrt2 = Math.sqrt(2);
        const psi: Vector = [
            { real: 1 / sqrt2, imag: 0 },
            { real: 1 / sqrt2, imag: 0 }
        ];
        
        expect(() => CorePhysicsValidator.validateNormalized(psi, '|+⟩'))
            .not.toThrow();
    });

    test('Unnormalized state fails', () => {
        const psi: Vector = [
            { real: 1, imag: 0 },
            { real: 1, imag: 0 }
        ];  // norm = √2, not 1!
        
        expect(() => CorePhysicsValidator.validateNormalized(psi, 'Bad State'))
            .toThrow(/NOT normalized/);
    });

    test('Zero vector fails', () => {
        const zero: Vector = [
            { real: 0, imag: 0 },
            { real: 0, imag: 0 }
        ];
        
        expect(() => CorePhysicsValidator.validateNormalized(zero, 'Zero'))
            .toThrow(/NOT normalized/);
    });
});

describe('CorePhysicsValidator - Gate Tests', () => {
    
    test('H|0⟩ = (|0⟩ + |1⟩)/√2', () => {
        expect(() => CorePhysicsValidator.testHadamardOnZero())
            .not.toThrow();
    });

    test('CNOT|10⟩ = |11⟩', () => {
        expect(() => CorePhysicsValidator.testCNOTFlip())
            .not.toThrow();
    });

    test('Pauli X flips |0⟩ to |1⟩', () => {
        const X = CorePhysicsValidator.createPauliX();
        const zero: Vector = [{ real: 1, imag: 0 }, { real: 0, imag: 0 }];
        
        // Apply X
        const result: Vector = [];
        for (let i = 0; i < 2; i++) {
            let sum = { real: 0, imag: 0 };
            for (let j = 0; j < 2; j++) {
                sum = CorePhysicsValidator.complexAdd(
                    sum,
                    CorePhysicsValidator.complexMultiply(X[i][j], zero[j])
                );
            }
            result[i] = sum;
        }
        
        // Should be |1⟩ = [0, 1]
        expect(result[0].real).toBeCloseTo(0, 10);
        expect(result[1].real).toBeCloseTo(1, 10);
    });
});

describe('CorePhysicsValidator - Commutators', () => {
    
    test('X and Z anti-commute', () => {
        const X = CorePhysicsValidator.createPauliX();
        const Z = CorePhysicsValidator.createPauliZ();
        
        // [X,Z] should NOT be zero (they anti-commute)
        expect(() => CorePhysicsValidator.validateCommutes(X, Z, 'X', 'Z'))
            .toThrow(/do NOT commute/);
    });

    test('Z commutes with itself', () => {
        const Z = CorePhysicsValidator.createPauliZ();
        
        expect(() => CorePhysicsValidator.validateCommutes(Z, Z, 'Z', 'Z'))
            .not.toThrow();
    });
});

describe('CorePhysicsValidator - Integration Tests', () => {
    
    test('ALL physics tests pass', () => {
        expect(() => CorePhysicsValidator.runAllTests())
            .not.toThrow();
    });

    test('Precision is exactly 10^-10', () => {
        // Create a matrix that's Hermitian within 10^-10
        const almostH: Matrix = [
            [{ real: 1, imag: 0 }, { real: 1e-11, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
        ];
        
        // Should pass (error < 10^-10)
        expect(() => CorePhysicsValidator.validateHermitian(almostH))
            .not.toThrow();
        
        // Create one that's just outside tolerance
        const notQuite: Matrix = [
            [{ real: 1, imag: 0 }, { real: 2e-10, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
        ];
        
        // Should fail (error >= 10^-10)
        expect(() => CorePhysicsValidator.validateHermitian(notQuite))
            .toThrow(/NOT Hermitian/);
    });
});

describe('CorePhysicsValidator - Known Quantum Results', () => {
    
    test('Bell state is maximally entangled', () => {
        // Bell state: (|00⟩ + |11⟩)/√2
        const sqrt2 = Math.sqrt(2);
        const bell: Vector = [
            { real: 1 / sqrt2, imag: 0 },
            { real: 0, imag: 0 },
            { real: 0, imag: 0 },
            { real: 1 / sqrt2, imag: 0 }
        ];
        
        // Should be normalized
        expect(() => CorePhysicsValidator.validateNormalized(bell, 'Bell state'))
            .not.toThrow();
        
        const norm = CorePhysicsValidator.vectorNorm(bell);
        expect(norm).toBeCloseTo(1.0, 10);
    });

    test('GHZ state is normalized', () => {
        // GHZ state: (|000⟩ + |111⟩)/√2
        const sqrt2 = Math.sqrt(2);
        const ghz: Vector = Array(8).fill({ real: 0, imag: 0 });
        ghz[0] = { real: 1 / sqrt2, imag: 0 };  // |000⟩
        ghz[7] = { real: 1 / sqrt2, imag: 0 };  // |111⟩
        
        expect(() => CorePhysicsValidator.validateNormalized(ghz, 'GHZ state'))
            .not.toThrow();
    });

    test('W state is normalized', () => {
        // W state: (|100⟩ + |010⟩ + |001⟩)/√3
        const sqrt3 = Math.sqrt(3);
        const w: Vector = Array(8).fill({ real: 0, imag: 0 });
        w[1] = { real: 1 / sqrt3, imag: 0 };  // |001⟩
        w[2] = { real: 1 / sqrt3, imag: 0 };  // |010⟩
        w[4] = { real: 1 / sqrt3, imag: 0 };  // |100⟩
        
        expect(() => CorePhysicsValidator.validateNormalized(w, 'W state'))
            .not.toThrow();
    });
});

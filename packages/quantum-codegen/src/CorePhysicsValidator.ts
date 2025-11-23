/**
 * CORE PHYSICS VALIDATOR
 * 
 * THIS IS THE FIX - Real physics validation with actual math!
 * 
 * NO string matching, NO heuristics, ACTUAL mathematics at 10^-10 precision
 * 
 * This runs BEFORE code generation to ensure physics correctness
 */

export interface ComplexNumber {
    real: number;
    imag: number;
}

export type Matrix = ComplexNumber[][];
export type Vector = ComplexNumber[];

export class CorePhysicsValidator {
    private static readonly TOLERANCE = 1e-10;

    // ========================================================================
    // MATRIX OPERATIONS (The foundation)
    // ========================================================================

    /**
     * Complex number operations
     */
    static complexAdd(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
        return { real: a.real + b.real, imag: a.imag + b.imag };
    }

    static complexMultiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
        return {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real
        };
    }

    static complexConjugate(z: ComplexNumber): ComplexNumber {
        return { real: z.real, imag: -z.imag };
    }

    static complexAbs(z: ComplexNumber): number {
        return Math.sqrt(z.real * z.real + z.imag * z.imag);
    }

    /**
     * Matrix transpose
     */
    static transpose(M: Matrix): Matrix {
        const rows = M.length;
        const cols = M[0].length;
        const result: Matrix = [];

        for (let j = 0; j < cols; j++) {
            result[j] = [];
            for (let i = 0; i < rows; i++) {
                result[j][i] = M[i][j];
            }
        }

        return result;
    }

    /**
     * Conjugate transpose (dagger)
     */
    static conjugateTranspose(M: Matrix): Matrix {
        const rows = M.length;
        const cols = M[0].length;
        const result: Matrix = [];

        for (let j = 0; j < cols; j++) {
            result[j] = [];
            for (let i = 0; i < rows; i++) {
                result[j][i] = this.complexConjugate(M[i][j]);
            }
        }

        return result;
    }

    /**
     * Matrix multiplication
     */
    static matrixMultiply(A: Matrix, B: Matrix): Matrix {
        const rowsA = A.length;
        const colsA = A[0].length;
        const rowsB = B.length;
        const colsB = B[0].length;

        if (colsA !== rowsB) {
            throw new Error(`Matrix dimensions incompatible: (${rowsA}x${colsA}) × (${rowsB}x${colsB})`);
        }

        const result: Matrix = [];
        for (let i = 0; i < rowsA; i++) {
            result[i] = [];
            for (let j = 0; j < colsB; j++) {
                let sum: ComplexNumber = { real: 0, imag: 0 };
                for (let k = 0; k < colsA; k++) {
                    sum = this.complexAdd(sum, this.complexMultiply(A[i][k], B[k][j]));
                }
                result[i][j] = sum;
            }
        }

        return result;
    }

    /**
     * Identity matrix
     */
    static identity(n: number): Matrix {
        const I: Matrix = [];
        for (let i = 0; i < n; i++) {
            I[i] = [];
            for (let j = 0; j < n; j++) {
                I[i][j] = { real: i === j ? 1 : 0, imag: 0 };
            }
        }
        return I;
    }

    /**
     * Matrix norm (Frobenius norm)
     */
    static matrixNorm(M: Matrix): number {
        let sum = 0;
        for (let i = 0; i < M.length; i++) {
            for (let j = 0; j < M[i].length; j++) {
                sum += this.complexAbs(M[i][j]) ** 2;
            }
        }
        return Math.sqrt(sum);
    }

    /**
     * Vector norm
     */
    static vectorNorm(v: Vector): number {
        let sum = 0;
        for (const component of v) {
            sum += this.complexAbs(component) ** 2;
        }
        return Math.sqrt(sum);
    }

    // ========================================================================
    // PHYSICS VALIDATIONS (10^-10 precision)
    // ========================================================================

    /**
     * VALIDATE HERMITICITY: H = H†
     * 
     * A Hermitian operator must satisfy H_{ij} = H*_{ji}
     * This is REQUIRED for all Hamiltonians (energy observables)
     */
    static validateHermitian(H: Matrix, name: string = 'Operator'): void {
        const n = H.length;

        // Check square
        if (H.some(row => row.length !== n)) {
            throw new Error(`${name} is not square`);
        }

        // Compute H†
        const Hdagger = this.conjugateTranspose(H);

        // Compute ||H - H†||
        const diff: Matrix = [];
        for (let i = 0; i < n; i++) {
            diff[i] = [];
            for (let j = 0; j < n; j++) {
                diff[i][j] = {
                    real: H[i][j].real - Hdagger[i][j].real,
                    imag: H[i][j].imag - Hdagger[i][j].imag
                };
            }
        }

        const hermError = this.matrixNorm(diff);

        if (hermError >= this.TOLERANCE) {
            throw new Error(
                `❌ ${name} is NOT Hermitian!\n` +
                `   ||H - H†|| = ${hermError.toExponential(2)} >= ${this.TOLERANCE.toExponential(2)}\n` +
                `   Hermiticity violated at precision 10^-10`
            );
        }

        console.log(`✅ ${name} Hermiticity: ||H - H†|| = ${hermError.toExponential(2)} < 10^-10`);
    }

    /**
     * VALIDATE UNITARITY: U†U = I
     * 
     * A unitary operator must satisfy U†U = UU† = I
     * This is REQUIRED for all quantum gates (evolution operators)
     */
    static validateUnitary(U: Matrix, name: string = 'Operator'): void {
        const n = U.length;

        // Check square
        if (U.some(row => row.length !== n)) {
            throw new Error(`${name} is not square`);
        }

        // Compute U†
        const Udagger = this.conjugateTranspose(U);

        // Compute U†U
        const UdaggerU = this.matrixMultiply(Udagger, U);

        // Compute identity
        const I = this.identity(n);

        // Compute ||U†U - I||
        const diff: Matrix = [];
        for (let i = 0; i < n; i++) {
            diff[i] = [];
            for (let j = 0; j < n; j++) {
                diff[i][j] = {
                    real: UdaggerU[i][j].real - I[i][j].real,
                    imag: UdaggerU[i][j].imag - I[i][j].imag
                };
            }
        }

        const unitError = this.matrixNorm(diff);

        if (unitError >= this.TOLERANCE) {
            throw new Error(
                `❌ ${name} is NOT Unitary!\n` +
                `   ||U†U - I|| = ${unitError.toExponential(2)} >= ${this.TOLERANCE.toExponential(2)}\n` +
                `   Unitarity violated at precision 10^-10`
            );
        }

        console.log(`✅ ${name} Unitarity: ||U†U - I|| = ${unitError.toExponential(2)} < 10^-10`);
    }

    /**
     * VALIDATE NORMALIZATION: ||ψ|| = 1
     * 
     * A quantum state must be normalized: <ψ|ψ> = 1
     */
    static validateNormalized(psi: Vector, name: string = 'State'): void {
        const norm = this.vectorNorm(psi);
        const normError = Math.abs(norm - 1.0);

        if (normError >= this.TOLERANCE) {
            throw new Error(
                `❌ ${name} is NOT normalized!\n` +
                `   ||ψ|| = ${norm.toFixed(15)} ≠ 1.0\n` +
                `   |norm - 1| = ${normError.toExponential(2)} >= ${this.TOLERANCE.toExponential(2)}`
            );
        }

        console.log(`✅ ${name} Normalization: ||ψ|| = ${norm.toFixed(15)}, error = ${normError.toExponential(2)}`);
    }

    /**
     * VALIDATE COMMUTATOR: [A, B] = 0
     * 
     * Check if two operators commute (for conservation laws)
     */
    static validateCommutes(A: Matrix, B: Matrix, nameA: string = 'A', nameB: string = 'B'): void {
        const n = A.length;

        // Compute AB
        const AB = this.matrixMultiply(A, B);

        // Compute BA
        const BA = this.matrixMultiply(B, A);

        // Compute [A,B] = AB - BA
        const commutator: Matrix = [];
        for (let i = 0; i < n; i++) {
            commutator[i] = [];
            for (let j = 0; j < n; j++) {
                commutator[i][j] = {
                    real: AB[i][j].real - BA[i][j].real,
                    imag: AB[i][j].imag - BA[i][j].imag
                };
            }
        }

        const commError = this.matrixNorm(commutator);

        if (commError >= this.TOLERANCE) {
            throw new Error(
                `❌ [${nameA}, ${nameB}] ≠ 0!\n` +
                `   ||[A,B]|| = ${commError.toExponential(2)} >= ${this.TOLERANCE.toExponential(2)}\n` +
                `   Operators do NOT commute`
            );
        }

        console.log(`✅ [${nameA}, ${nameB}] = 0: ||[A,B]|| = ${commError.toExponential(2)} < 10^-10`);
    }

    // ========================================================================
    // GATE VALIDATIONS (Test against known results)
    // ========================================================================

    /**
     * Create Hadamard gate and validate
     */
    static createHadamard(): Matrix {
        const sqrt2 = Math.sqrt(2);
        const H: Matrix = [
            [{ real: 1 / sqrt2, imag: 0 }, { real: 1 / sqrt2, imag: 0 }],
            [{ real: 1 / sqrt2, imag: 0 }, { real: -1 / sqrt2, imag: 0 }]
        ];

        this.validateUnitary(H, 'Hadamard');
        this.validateHermitian(H, 'Hadamard'); // H is also Hermitian
        return H;
    }

    /**
     * Create Pauli-X gate and validate
     */
    static createPauliX(): Matrix {
        const X: Matrix = [
            [{ real: 0, imag: 0 }, { real: 1, imag: 0 }],
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }]
        ];

        this.validateUnitary(X, 'Pauli-X');
        this.validateHermitian(X, 'Pauli-X');
        return X;
    }

    /**
     * Create Pauli-Y gate and validate
     */
    static createPauliY(): Matrix {
        const Y: Matrix = [
            [{ real: 0, imag: 0 }, { real: 0, imag: -1 }],
            [{ real: 0, imag: 1 }, { real: 0, imag: 0 }]
        ];

        this.validateUnitary(Y, 'Pauli-Y');
        this.validateHermitian(Y, 'Pauli-Y');
        return Y;
    }

    /**
     * Create Pauli-Z gate and validate
     */
    static createPauliZ(): Matrix {
        const Z: Matrix = [
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
        ];

        this.validateUnitary(Z, 'Pauli-Z');
        this.validateHermitian(Z, 'Pauli-Z');
        return Z;
    }

    /**
     * Create CNOT gate and validate
     */
    static createCNOT(): Matrix {
        const CNOT: Matrix = [
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 1, imag: 0 }, { real: 0, imag: 0 }]
        ];

        this.validateUnitary(CNOT, 'CNOT');
        return CNOT;
    }

    /**
     * Test Hadamard on |0⟩ should give (|0⟩ + |1⟩)/√2
     */
    static testHadamardOnZero(): void {
        const H = this.createHadamard();
        const zero: Vector = [{ real: 1, imag: 0 }, { real: 0, imag: 0 }];

        // H|0⟩
        const result: Vector = [];
        for (let i = 0; i < 2; i++) {
            let sum: ComplexNumber = { real: 0, imag: 0 };
            for (let j = 0; j < 2; j++) {
                sum = this.complexAdd(sum, this.complexMultiply(H[i][j], zero[j]));
            }
            result[i] = sum;
        }

        // Expected: (|0⟩ + |1⟩)/√2 = [1/√2, 1/√2]
        const sqrt2 = Math.sqrt(2);
        const expected: Vector = [
            { real: 1 / sqrt2, imag: 0 },
            { real: 1 / sqrt2, imag: 0 }
        ];

        // Check match
        for (let i = 0; i < 2; i++) {
            const diff = this.complexAbs({
                real: result[i].real - expected[i].real,
                imag: result[i].imag - expected[i].imag
            });
            if (diff >= this.TOLERANCE) {
                throw new Error(`H|0⟩ test FAILED! Component ${i} differs by ${diff}`);
            }
        }

        console.log('✅ H|0⟩ = (|0⟩ + |1⟩)/√2 ✓');
    }

    /**
     * Test CNOT on |10⟩ should give |11⟩
     */
    static testCNOTFlip(): void {
        const CNOT = this.createCNOT();
        const state10: Vector = [
            { real: 0, imag: 0 }, // |00⟩
            { real: 0, imag: 0 }, // |01⟩
            { real: 1, imag: 0 }, // |10⟩
            { real: 0, imag: 0 }  // |11⟩
        ];

        // CNOT|10⟩
        const result: Vector = [];
        for (let i = 0; i < 4; i++) {
            let sum: ComplexNumber = { real: 0, imag: 0 };
            for (let j = 0; j < 4; j++) {
                sum = this.complexAdd(sum, this.complexMultiply(CNOT[i][j], state10[j]));
            }
            result[i] = sum;
        }

        // Expected: |11⟩
        const expected: Vector = [
            { real: 0, imag: 0 },
            { real: 0, imag: 0 },
            { real: 0, imag: 0 },
            { real: 1, imag: 0 }
        ];

        // Check match
        for (let i = 0; i < 4; i++) {
            const diff = this.complexAbs({
                real: result[i].real - expected[i].real,
                imag: result[i].imag - expected[i].imag
            });
            if (diff >= this.TOLERANCE) {
                throw new Error(`CNOT|10⟩ test FAILED! Component ${i} differs by ${diff}`);
            }
        }

        console.log('✅ CNOT|10⟩ = |11⟩ ✓');
    }

    /**
     * RUN ALL VALIDATION TESTS
     */
    static runAllTests(): void {
        console.log('\n' + '='.repeat(60));
        console.log('CORE PHYSICS VALIDATION - RUNNING ALL TESTS');
        console.log('='.repeat(60) + '\n');

        try {
            console.log('Testing Pauli gates...');
            this.createPauliX();
            this.createPauliY();
            this.createPauliZ();
            console.log('');

            console.log('Testing Hadamard gate...');
            this.createHadamard();
            this.testHadamardOnZero();
            console.log('');

            console.log('Testing CNOT gate...');
            this.createCNOT();
            this.testCNOTFlip();
            console.log('');

            console.log('='.repeat(60));
            console.log('✅ ALL TESTS PASSED - Physics is CORRECT at 10^-10 precision!');
            console.log('='.repeat(60) + '\n');

        } catch (error) {
            console.error('\n' + '='.repeat(60));
            console.error('❌ TEST FAILED - Physics validation error:');
            console.error('='.repeat(60));
            console.error(error);
            console.error('');
            throw error;
        }
    }
}

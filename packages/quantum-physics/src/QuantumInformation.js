"use strict";
/**
 * Quantum Information Theory - Pillar 3
 *
 * Information measures, entanglement quantification, quantum channels
 * Essential for understanding quantum correlations and processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumInformation = void 0;
const mathjs_1 = require("mathjs");
const HilbertSpace_1 = require("./HilbertSpace");
const math = (0, mathjs_1.create)(mathjs_1.all);
class QuantumInformation {
    TOLERANCE = 1e-10;
    /**
     * Quantum Mutual Information: I(A:B) = S(A) + S(B) - S(AB)
     * Measures total correlations (classical + quantum)
     */
    quantumMutualInformation(rhoAB, dimA, dimB) {
        const hilbert = new HilbertSpace_1.HilbertSpace(Math.log2(dimA * dimB));
        // S(AB) - Total system entropy
        const SAB = hilbert.calculateVonNeumannEntropy(rhoAB);
        // S(A) - Reduced density matrix for subsystem A
        const rhoA = this.partialTrace(rhoAB, dimA, dimB, 'B');
        const SA = hilbert.calculateVonNeumannEntropy(rhoA);
        // S(B) - Reduced density matrix for subsystem B
        const rhoB = this.partialTrace(rhoAB, dimA, dimB, 'A');
        const SB = hilbert.calculateVonNeumannEntropy(rhoB);
        // I(A:B) = S(A) + S(B) - S(AB)
        return SA + SB - SAB;
    }
    /**
     * Entanglement Negativity: N(ρ) = ||ρ^T_B||₁ - 1
     * Computable entanglement measure, zero for separable states
     */
    calculateNegativity(rhoAB, dimA, dimB) {
        // Perform partial transpose with respect to B
        const rhoTB = this.partialTranspose(rhoAB, dimA, dimB, 'B');
        // Calculate trace norm ||ρ^T_B||₁
        const traceNorm = this.traceNorm(rhoTB);
        // Negativity N = (||ρ^T_B||₁ - 1) / 2
        return (traceNorm - 1) / 2;
    }
    /**
     * Logarithmic Negativity: E_N = log₂(||ρ^T_B||₁)
     * Upper bound on distillable entanglement
     */
    logarithmicNegativity(rhoAB, dimA, dimB) {
        const rhoTB = this.partialTranspose(rhoAB, dimA, dimB, 'B');
        const traceNorm = this.traceNorm(rhoTB);
        return Math.log2(traceNorm);
    }
    /**
     * Concurrence for 2-qubit states
     * C(ρ) = max{0, λ₁-λ₂-λ₃-λ₄}
     * where λᵢ are eigenvalues of √(√ρ ρ̃ √ρ) in decreasing order
     * ρ̃ = (σʸ⊗σʸ)ρ*(σʸ⊗σʸ)
     * C(ρ) ∈ [0,1], with C=1 for maximally entangled Bell states
     */
    calculateConcurrence(rho22) {
        if (rho22.length !== 4 || rho22[0].length !== 4) {
            throw new Error('Concurrence only defined for 2-qubit (4×4) density matrices');
        }
        // Spin-flip operator σ_y ⊗ σ_y
        const sigmaY = [
            [math.complex(0, 0), math.complex(0, -1)],
            [math.complex(0, 1), math.complex(0, 0)]
        ];
        const sysy = this.tensorProduct(sigmaY, sigmaY);
        // ρ̃ = (σ_y ⊗ σ_y) ρ* (σ_y ⊗ σ_y)
        const rhoConj = this.complexConjugate(rho22);
        const temp = this.matrixMultiply(sysy, rhoConj);
        const rhoTilde = this.matrixMultiply(temp, sysy);
        // R = √(√ρ ρ̃ √ρ)
        // In practice, compute eigenvalues of ρ ρ̃
        const rhoRhoTilde = this.matrixMultiply(rho22, rhoTilde);
        const eigenvalues = this.getEigenvalues(rhoRhoTilde);
        // Sort eigenvalues in descending order
        const sortedLambdas = eigenvalues.map(Math.sqrt).sort((a, b) => b - a);
        // C = max(0, λ₁ - λ₂ - λ₃ - λ₄)
        const concurrence = Math.max(0, sortedLambdas[0] - sortedLambdas[1] - sortedLambdas[2] - sortedLambdas[3]);
        return concurrence;
    }
    /**
     * Complete entanglement characterization
     */
    analyzeEntanglement(rhoAB, dimA, dimB) {
        const hilbert = new HilbertSpace_1.HilbertSpace(Math.log2(dimA * dimB));
        const measures = {
            vonNeumannEntropy: hilbert.calculateVonNeumannEntropy(rhoAB),
            negativity: this.calculateNegativity(rhoAB, dimA, dimB),
            logarithmicNegativity: this.logarithmicNegativity(rhoAB, dimA, dimB)
        };
        // Add concurrence for 2-qubit systems
        if (dimA === 2 && dimB === 2) {
            measures.concurrence = this.calculateConcurrence(rhoAB);
        }
        return measures;
    }
    /**
     * Quantum Fisher Information Matrix
     * Used for parameter estimation and quantum metrology
     */
    quantumFisherInformation(rho, generator) {
        // For pure states |ψ(θ)⟩: F = 4 Var(H) where H is generator
        // For mixed states: More complex calculation
        // Simplified for pure states: F = 4⟨ψ|H²|ψ⟩ - 4⟨ψ|H|ψ⟩²
        const H2 = this.matrixMultiply(generator, generator);
        const expH = this.expectationValue(rho, generator);
        const expH2 = this.expectationValue(rho, H2);
        return 4 * (expH2 - expH * expH);
    }
    /**
     * Validate quantum channel properties
     * Must be completely positive and trace preserving (CPTP)
     */
    validateQuantumChannel(channel) {
        const errors = [];
        // Check trace preservation: Σᵢ Kᵢ† Kᵢ = I
        const identity = this.identityMatrix(channel.krausOperators[0].length);
        let sum = this.zerosMatrix(identity.length);
        for (const K of channel.krausOperators) {
            const Kdag = this.conjugateTranspose(K);
            const KdagK = this.matrixMultiply(Kdag, K);
            sum = this.matrixAdd(sum, KdagK);
        }
        const traceError = this.matrixNorm(this.matrixSubtract(sum, identity));
        if (traceError > this.TOLERANCE) {
            errors.push(`Not trace preserving: ||Σ Kᵢ†Kᵢ - I|| = ${traceError.toExponential(3)}`);
            channel.isTracePreserving = false;
        }
        else {
            channel.isTracePreserving = true;
        }
        // Complete positivity is guaranteed by Kraus representation
        channel.isCompletelyPositive = true;
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // ========== Helper Methods ==========
    /**
     * Partial trace: Tr_B(ρ_AB) or Tr_A(ρ_AB)
     */
    partialTrace(rhoAB, dimA, dimB, traceOut) {
        if (traceOut === 'B') {
            // Trace out B, return ρ_A
            const rhoA = [];
            for (let i = 0; i < dimA; i++) {
                rhoA[i] = [];
                for (let j = 0; j < dimA; j++) {
                    let sum = math.complex(0, 0);
                    for (let k = 0; k < dimB; k++) {
                        const idx1 = i * dimB + k;
                        const idx2 = j * dimB + k;
                        sum = math.add(sum, rhoAB[idx1][idx2]);
                    }
                    rhoA[i][j] = sum;
                }
            }
            return rhoA;
        }
        else {
            // Trace out A, return ρ_B
            const rhoB = [];
            for (let i = 0; i < dimB; i++) {
                rhoB[i] = [];
                for (let j = 0; j < dimB; j++) {
                    let sum = math.complex(0, 0);
                    for (let k = 0; k < dimA; k++) {
                        const idx1 = k * dimB + i;
                        const idx2 = k * dimB + j;
                        sum = math.add(sum, rhoAB[idx1][idx2]);
                    }
                    rhoB[i][j] = sum;
                }
            }
            return rhoB;
        }
    }
    /**
     * Partial transpose: (ρ_AB)^T_B
     */
    partialTranspose(rhoAB, dimA, dimB, transposeSubsystem) {
        const n = dimA * dimB;
        const rhoTB = [];
        for (let i = 0; i < n; i++) {
            rhoTB[i] = [];
            for (let j = 0; j < n; j++) {
                const iA = Math.floor(i / dimB);
                const iB = i % dimB;
                const jA = Math.floor(j / dimB);
                const jB = j % dimB;
                if (transposeSubsystem === 'B') {
                    // Transpose indices of B
                    const newIdx = iA * dimB + jB;
                    const newJdx = jA * dimB + iB;
                    rhoTB[i][j] = rhoAB[newIdx][newJdx];
                }
                else {
                    // Transpose indices of A
                    const newIdx = jA * dimB + iB;
                    const newJdx = iA * dimB + jB;
                    rhoTB[i][j] = rhoAB[newIdx][newJdx];
                }
            }
        }
        return rhoTB;
    }
    /**
     * Trace norm ||A||₁ = Tr(√(A†A))
     */
    traceNorm(matrix) {
        const Adag = this.conjugateTranspose(matrix);
        const AdagA = this.matrixMultiply(Adag, matrix);
        const eigenvalues = this.getEigenvalues(AdagA);
        return eigenvalues.reduce((sum, lambda) => sum + Math.sqrt(Math.abs(lambda)), 0);
    }
    tensorProduct(A, B) {
        const mA = A.length;
        const nA = A[0].length;
        const mB = B.length;
        const nB = B[0].length;
        const result = [];
        for (let i = 0; i < mA * mB; i++) {
            result[i] = [];
            for (let j = 0; j < nA * nB; j++) {
                const iA = Math.floor(i / mB);
                const iB = i % mB;
                const jA = Math.floor(j / nB);
                const jB = j % nB;
                result[i][j] = math.multiply(A[iA][jA], B[iB][jB]);
            }
        }
        return result;
    }
    matrixMultiply(A, B) {
        const m = A.length;
        const n = B[0].length;
        const p = B.length;
        const result = [];
        for (let i = 0; i < m; i++) {
            result[i] = [];
            for (let j = 0; j < n; j++) {
                let sum = math.complex(0, 0);
                for (let k = 0; k < p; k++) {
                    sum = math.add(sum, math.multiply(A[i][k], B[k][j]));
                }
                result[i][j] = sum;
            }
        }
        return result;
    }
    matrixAdd(A, B) {
        return A.map((row, i) => row.map((elem, j) => math.add(elem, B[i][j])));
    }
    matrixSubtract(A, B) {
        return A.map((row, i) => row.map((elem, j) => math.subtract(elem, B[i][j])));
    }
    conjugateTranspose(matrix) {
        const m = matrix.length;
        const n = matrix[0].length;
        const result = [];
        for (let i = 0; i < n; i++) {
            result[i] = [];
            for (let j = 0; j < m; j++) {
                result[i][j] = math.conj(matrix[j][i]);
            }
        }
        return result;
    }
    complexConjugate(matrix) {
        return matrix.map(row => row.map(elem => math.conj(elem)));
    }
    expectationValue(rho, observable) {
        // Tr(ρ O)
        const product = this.matrixMultiply(rho, observable);
        let trace = 0;
        for (let i = 0; i < product.length; i++) {
            const elem = math.complex(product[i][i]);
            trace += elem.re;
        }
        return trace;
    }
    identityMatrix(n) {
        const I = [];
        for (let i = 0; i < n; i++) {
            I[i] = [];
            for (let j = 0; j < n; j++) {
                I[i][j] = i === j ? math.complex(1, 0) : math.complex(0, 0);
            }
        }
        return I;
    }
    zerosMatrix(n) {
        const Z = [];
        for (let i = 0; i < n; i++) {
            Z[i] = [];
            for (let j = 0; j < n; j++) {
                Z[i][j] = math.complex(0, 0);
            }
        }
        return Z;
    }
    matrixNorm(matrix) {
        // Frobenius norm
        let sum = 0;
        for (const row of matrix) {
            for (const elem of row) {
                const c = math.complex(elem);
                sum += c.re * c.re + c.im * c.im;
            }
        }
        return Math.sqrt(sum);
    }
    getEigenvalues(matrix) {
        // Simplified eigenvalue calculation
        // In production, use proper numerical library
        const n = matrix.length;
        const eigenvalues = [];
        // For now, return diagonal elements as approximation
        for (let i = 0; i < n; i++) {
            eigenvalues.push(math.complex(matrix[i][i]).re);
        }
        return eigenvalues;
    }
}
exports.QuantumInformation = QuantumInformation;
//# sourceMappingURL=QuantumInformation.js.map
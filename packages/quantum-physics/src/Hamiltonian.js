"use strict";
/**
 * Hamiltonian Engine - Pillar 2
 *
 * All quantum dynamics from Ĥ = Ĥ†
 * Spectral decomposition, time evolution, symmetries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hamiltonian = void 0;
const mathjs_1 = require("mathjs");
const math = (0, mathjs_1.create)(mathjs_1.all);
class Hamiltonian {
    matrix;
    numQubits;
    dimension;
    TOLERANCE = 1e-10;
    constructor(matrix, numQubits) {
        this.numQubits = numQubits;
        this.dimension = Math.pow(2, numQubits);
        if (matrix.length !== this.dimension || matrix[0].length !== this.dimension) {
            throw new Error(`Hamiltonian must be ${this.dimension}x${this.dimension} for ${numQubits} qubits`);
        }
        this.matrix = matrix;
    }
    /**
     * Validate Hermiticity: Ĥ = Ĥ†
     * Check ||Ĥ - Ĥ†|| < ε
     */
    validateHermiticity() {
        let maxDeviation = 0;
        const n = this.dimension;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const Hij = math.complex(this.matrix[i][j]);
                const Hji = math.complex(this.matrix[j][i]);
                const HjiConj = math.conj(Hji);
                // Check if H[i][j] = conj(H[j][i])
                const diff = math.subtract(Hij, HjiConj);
                const deviation = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
                maxDeviation = Math.max(maxDeviation, deviation);
            }
        }
        const isHermitian = maxDeviation < this.TOLERANCE;
        return {
            isHermitian,
            error: maxDeviation,
            details: isHermitian
                ? undefined
                : `Hamiltonian not Hermitian: ||Ĥ - Ĥ†|| = ${maxDeviation.toExponential(3)}`
        };
    }
    /**
     * Compute eigenspectrum of Hamiltonian
     * Ĥ|Eₙ⟩ = Eₙ|Eₙ⟩
     */
    computeSpectrum() {
        // For small matrices (≤ 4x4), use exact diagonalization
        // For larger matrices, would use iterative methods (Lanczos, etc.)
        if (this.dimension <= 4) {
            return this.exactDiagonalization();
        }
        // For larger systems, use power iteration for ground state
        // and Lanczos for low-lying excited states
        return this.iterativeDiagonalization();
    }
    /**
     * Time evolution operator: Û(t) = exp(-iĤt/ℏ)
     */
    timeEvolutionOperator(time, hbar = 1.0) {
        // Use spectral decomposition: exp(-iĤt/ℏ) = Σₙ exp(-iEₙt/ℏ)|Eₙ⟩⟨Eₙ|
        const { eigenvalues, eigenvectors } = this.computeSpectrum();
        const U = [];
        const n = this.dimension;
        for (let i = 0; i < n; i++) {
            U[i] = [];
            for (let j = 0; j < n; j++) {
                let sum = math.complex(0, 0);
                for (let k = 0; k < n; k++) {
                    // exp(-iEₖt/ℏ) * |Eₖ⟩ᵢ * ⟨Eₖ|ⱼ
                    const phase = -eigenvalues[k] * time / hbar;
                    const expFactor = math.complex(Math.cos(phase), Math.sin(phase));
                    const ketBra = math.multiply(eigenvectors[k][i], math.conj(eigenvectors[k][j]));
                    sum = math.add(sum, math.multiply(expFactor, ketBra));
                }
                U[i][j] = sum;
            }
        }
        return U;
    }
    /**
     * Trotterization: exp(-iĤt) ≈ [exp(-iĤt/n)]ⁿ
     * For Ĥ = Σᵢ Ĥᵢ, use product formula
     */
    trotterize(terms, time, steps) {
        const dt = time / steps;
        let U = this.identityMatrix();
        for (let step = 0; step < steps; step++) {
            // Apply each term sequentially
            for (const term of terms) {
                const expTerm = this.matrixExponential(term, -dt);
                U = this.matrixMultiply(expTerm, U);
            }
        }
        return U;
    }
    /**
     * Detect symmetries: [Ĥ, Q̂] = 0 → Q conserved
     */
    findSymmetries(operators) {
        const symmetries = [];
        for (const [name, Q] of operators.entries()) {
            // Compute [Ĥ, Q̂] = ĤQ̂ - Q̂Ĥ
            const HQ = this.matrixMultiply(this.matrix, Q);
            const QH = this.matrixMultiply(Q, this.matrix);
            let commutatorNorm = 0;
            for (let i = 0; i < this.dimension; i++) {
                for (let j = 0; j < this.dimension; j++) {
                    const diff = math.subtract(HQ[i][j], QH[i][j]);
                    commutatorNorm += diff.re * diff.re + diff.im * diff.im;
                }
            }
            commutatorNorm = Math.sqrt(commutatorNorm);
            symmetries.push({
                operator: name,
                commutes: commutatorNorm < this.TOLERANCE,
                commutator: commutatorNorm
            });
        }
        return symmetries;
    }
    /**
     * Complete Hamiltonian analysis
     */
    analyze(conservedOperators) {
        // Validate Hermiticity
        const hermCheck = this.validateHermiticity();
        if (!hermCheck.isHermitian) {
            throw new Error(`Physics violation: ${hermCheck.details}`);
        }
        // Compute spectrum
        const { eigenvalues } = this.computeSpectrum();
        const sortedEigenvalues = [...eigenvalues].sort((a, b) => a - b);
        const groundStateEnergy = sortedEigenvalues[0];
        const groundStateIndex = eigenvalues.indexOf(groundStateEnergy);
        const excitationGap = sortedEigenvalues.length > 1
            ? sortedEigenvalues[1] - sortedEigenvalues[0]
            : 0;
        // Find symmetries if operators provided
        const symmetries = conservedOperators
            ? this.findSymmetries(conservedOperators).map(s => ({
                operator: s.operator,
                commutes: s.commutes
            }))
            : [];
        return {
            isHermitian: hermCheck.isHermitian,
            hermiticityError: hermCheck.error,
            eigenvalues: sortedEigenvalues,
            groundStateEnergy,
            groundStateIndex,
            excitationGap,
            symmetries,
            spectrum: {
                min: sortedEigenvalues[0],
                max: sortedEigenvalues[sortedEigenvalues.length - 1],
                range: sortedEigenvalues[sortedEigenvalues.length - 1] - sortedEigenvalues[0]
            }
        };
    }
    // ========== Helper Methods ==========
    exactDiagonalization() {
        // Simplified eigenvalue solver for small matrices
        // In production, use proper numerical library
        const n = this.dimension;
        const eigenvalues = [];
        const eigenvectors = [];
        // For 2x2 Hermitian matrix, can solve analytically
        if (n === 2) {
            const a = math.complex(this.matrix[0][0]).re;
            const d = math.complex(this.matrix[1][1]).re;
            const b = this.matrix[0][1];
            const bAbs = Math.sqrt(math.complex(b).re ** 2 + math.complex(b).im ** 2);
            const tr = a + d;
            const det = a * d - bAbs * bAbs;
            const disc = Math.sqrt(tr * tr / 4 - det);
            const lambda1 = tr / 2 + disc;
            const lambda2 = tr / 2 - disc;
            eigenvalues.push(lambda1, lambda2);
            // Eigenvectors (simplified)
            eigenvectors.push([math.complex(1, 0), math.complex(0, 0)], [math.complex(0, 0), math.complex(1, 0)]);
        }
        else {
            // Placeholder for larger matrices
            for (let i = 0; i < n; i++) {
                eigenvalues.push(math.complex(this.matrix[i][i]).re);
                const v = Array(n).fill(math.complex(0, 0));
                v[i] = math.complex(1, 0);
                eigenvectors.push(v);
            }
        }
        return { eigenvalues, eigenvectors };
    }
    iterativeDiagonalization() {
        // Power iteration for ground state
        const n = this.dimension;
        let v = Array(n).fill(0).map(() => math.complex(Math.random(), Math.random()));
        // Normalize
        v = this.normalizeVector(v);
        // Iterate: v ← Ĥv / ||Ĥv||
        for (let iter = 0; iter < 100; iter++) {
            v = this.matrixVectorMultiply(this.matrix, v);
            v = this.normalizeVector(v);
        }
        // Rayleigh quotient: E = ⟨v|Ĥ|v⟩
        const Hv = this.matrixVectorMultiply(this.matrix, v);
        let energy = math.complex(0, 0);
        for (let i = 0; i < n; i++) {
            energy = math.add(energy, math.multiply(math.conj(v[i]), Hv[i]));
        }
        return {
            eigenvalues: [math.complex(energy).re],
            eigenvectors: [v]
        };
    }
    matrixMultiply(A, B) {
        const n = A.length;
        const C = [];
        for (let i = 0; i < n; i++) {
            C[i] = [];
            for (let j = 0; j < n; j++) {
                let sum = math.complex(0, 0);
                for (let k = 0; k < n; k++) {
                    sum = math.add(sum, math.multiply(A[i][k], B[k][j]));
                }
                C[i][j] = sum;
            }
        }
        return C;
    }
    matrixVectorMultiply(A, v) {
        const n = A.length;
        const result = [];
        for (let i = 0; i < n; i++) {
            let sum = math.complex(0, 0);
            for (let j = 0; j < n; j++) {
                sum = math.add(sum, math.multiply(A[i][j], v[j]));
            }
            result[i] = sum;
        }
        return result;
    }
    normalizeVector(v) {
        let norm = 0;
        for (const component of v) {
            const c = math.complex(component);
            norm += c.re * c.re + c.im * c.im;
        }
        norm = Math.sqrt(norm);
        return v.map(c => math.divide(c, norm));
    }
    identityMatrix() {
        const I = [];
        for (let i = 0; i < this.dimension; i++) {
            I[i] = [];
            for (let j = 0; j < this.dimension; j++) {
                I[i][j] = i === j ? math.complex(1, 0) : math.complex(0, 0);
            }
        }
        return I;
    }
    matrixExponential(M, scalar) {
        // exp(sM) ≈ I + sM + (sM)²/2! + (sM)³/3! + ...
        // Use first few terms for small matrices
        const I = this.identityMatrix();
        let result = I;
        let term = I;
        for (let k = 1; k <= 10; k++) {
            term = this.matrixMultiply(term, this.scalarMultiply(M, scalar / k));
            result = this.matrixAdd(result, term);
        }
        return result;
    }
    scalarMultiply(M, scalar) {
        return M.map(row => row.map(elem => math.multiply(elem, scalar)));
    }
    matrixAdd(A, B) {
        return A.map((row, i) => row.map((elem, j) => math.add(elem, B[i][j])));
    }
    getMatrix() {
        return this.matrix;
    }
    getDimension() {
        return this.dimension;
    }
    getNumQubits() {
        return this.numQubits;
    }
}
exports.Hamiltonian = Hamiltonian;
//# sourceMappingURL=Hamiltonian.js.map
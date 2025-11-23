"use strict";
/**
 * Hilbert Space Analysis - Pillar 1
 *
 * Operates natively in quantum state spaces ℋ = ℂ^(2^n)
 * Understands density matrices ρ, operator algebra, tensor products, partial traces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HilbertSpace = void 0;
const mathjs_1 = require("mathjs");
const math = (0, mathjs_1.create)(mathjs_1.all);
class HilbertSpace {
    numQubits;
    dimension;
    TOLERANCE = 1e-10;
    constructor(numQubits) {
        if (numQubits < 1) {
            throw new Error('Number of qubits must be at least 1');
        }
        this.numQubits = numQubits;
        this.dimension = Math.pow(2, numQubits);
    }
    /**
     * Validate that a state vector is properly normalized
     * ||ψ||² = Σᵢ|αᵢ|² = 1
     */
    validateNormalization(state) {
        if (state.length !== this.dimension) {
            return {
                isValid: false,
                norm: 0,
                error: `State vector dimension ${state.length} does not match Hilbert space dimension ${this.dimension}`
            };
        }
        // Calculate norm: ||ψ||² = Σᵢ|αᵢ|²
        let normSquared = 0;
        for (const amplitude of state) {
            const amp = math.complex(amplitude);
            normSquared += Math.pow(amp.re, 2) + Math.pow(amp.im, 2);
        }
        const norm = Math.sqrt(normSquared);
        const isValid = Math.abs(norm - 1.0) < this.TOLERANCE;
        return {
            isValid,
            norm,
            error: isValid ? undefined : `State not normalized: ||ψ|| = ${norm}, deviation = ${Math.abs(norm - 1.0)}`
        };
    }
    /**
     * Calculate von Neumann entropy: S(ρ) = -Tr(ρ log ρ)
     * For pure state: S = 0
     * For maximally mixed: S = log₂(d)
     */
    calculateVonNeumannEntropy(densityMatrix) {
        // Get eigenvalues of density matrix
        const eigenvalues = this.getEigenvalues(densityMatrix);
        // S = -Σᵢ λᵢ log₂(λᵢ)
        let entropy = 0;
        for (const lambda of eigenvalues) {
            const lambdaVal = typeof lambda === 'number' ? lambda : lambda.re;
            if (lambdaVal > this.TOLERANCE) {
                entropy -= lambdaVal * Math.log2(lambdaVal);
            }
        }
        return entropy;
    }
    /**
     * Calculate purity: Tr(ρ²)
     * For pure state: Tr(ρ²) = 1
     * For maximally mixed: Tr(ρ²) = 1/d
     */
    calculatePurity(densityMatrix) {
        const rhoSquared = this.matrixMultiply(densityMatrix, densityMatrix);
        return this.trace(rhoSquared);
    }
    /**
     * Schmidt decomposition for bipartite entanglement
     * |ψ⟩ = Σᵢ √λᵢ |iₐ⟩⊗|iᵦ⟩
     */
    schmidtDecomposition(state, subsystemAQubits) {
        if (subsystemAQubits >= this.numQubits) {
            throw new Error('Subsystem A must have fewer qubits than total system');
        }
        const dimA = Math.pow(2, subsystemAQubits);
        const dimB = Math.pow(2, this.numQubits - subsystemAQubits);
        // Reshape state vector into matrix
        const matrix = [];
        for (let i = 0; i < dimA; i++) {
            matrix[i] = [];
            for (let j = 0; j < dimB; j++) {
                matrix[i][j] = state[i * dimB + j];
            }
        }
        // Perform SVD to get Schmidt coefficients
        const singularValues = this.singularValueDecomposition(matrix);
        // Schmidt coefficients are singular values
        const coefficients = singularValues.map(Math.abs);
        // Check if entangled: more than one non-zero Schmidt coefficient
        const nonZeroCoeffs = coefficients.filter(c => c > this.TOLERANCE);
        const isEntangled = nonZeroCoeffs.length > 1;
        // Entanglement entropy: S = -Σᵢ λᵢ² log₂(λᵢ²)
        let entanglementEntropy = 0;
        for (const coeff of coefficients) {
            const lambdaSquared = coeff * coeff;
            if (lambdaSquared > this.TOLERANCE) {
                entanglementEntropy -= lambdaSquared * Math.log2(lambdaSquared);
            }
        }
        return {
            coefficients,
            isEntangled,
            entanglementEntropy
        };
    }
    /**
     * Analyze full Hilbert space structure
     */
    analyze(state) {
        // Validate normalization
        const normCheck = this.validateNormalization(state.amplitudes);
        // Calculate density matrix if not provided
        const densityMatrix = state.densityMatrix || this.stateToDensityMatrix(state.amplitudes);
        // Calculate entropy and purity
        const entropy = this.calculateVonNeumannEntropy(densityMatrix);
        const purity = this.calculatePurity(densityMatrix);
        // Perform Schmidt decomposition for entanglement analysis
        // Default: split system in half
        const midpoint = Math.floor(this.numQubits / 2);
        const schmidt = midpoint > 0
            ? this.schmidtDecomposition(state.amplitudes, midpoint)
            : { coefficients: [1], isEntangled: false, entanglementEntropy: 0 };
        // Detect symmetries (placeholder for now)
        const symmetries = [];
        if (purity > 1 - this.TOLERANCE) {
            symmetries.push('pure_state');
        }
        if (entropy < this.TOLERANCE) {
            symmetries.push('zero_entropy');
        }
        return {
            dimension: this.dimension,
            numQubits: this.numQubits,
            isNormalized: normCheck.isValid,
            norm: normCheck.norm,
            entropy,
            purity,
            isEntangled: schmidt.isEntangled,
            entanglementEntropy: schmidt.entanglementEntropy,
            schmidtCoefficients: schmidt.coefficients,
            symmetries
        };
    }
    // ========== Helper Methods ==========
    stateToDensityMatrix(state) {
        const n = state.length;
        const rho = [];
        for (let i = 0; i < n; i++) {
            rho[i] = [];
            for (let j = 0; j < n; j++) {
                // ρᵢⱼ = αᵢ αⱼ*
                const alphaI = math.complex(state[i]);
                const alphaJ = math.complex(state[j]);
                const diff = math.subtract(alphaI, math.conj(alphaJ));
                const diffValue = typeof diff === 'number' ? diff : diff.re || 0;
                const magnitude = Math.abs(diffValue);
                rho[i][j] = math.complex(magnitude);
            }
        }
        return rho;
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
    trace(matrix) {
        let tr = 0;
        for (let i = 0; i < matrix.length; i++) {
            const element = matrix[i][i];
            const complexElem = typeof element === 'object' && 're' in element ? element : math.complex(element);
            tr += complexElem.re; // Trace is real for Hermitian matrices
        }
        return tr;
    }
    getEigenvalues(matrix) {
        // Simplified eigenvalue calculation for density matrices
        // In production, use proper numerical library
        // For now, return approximate eigenvalues based on trace and determinant
        const tr = this.trace(matrix);
        const n = matrix.length;
        // For 2x2 case, can calculate exactly
        if (n === 2) {
            const a = math.complex(matrix[0][0]).re;
            const d = math.complex(matrix[1][1]).re;
            const bc = math.multiply(matrix[0][1], matrix[1][0]);
            const bcValue = typeof bc === 'number' ? bc : bc.re || 0;
            const det = a * d - bcValue;
            const lambda1 = (tr + Math.sqrt(tr * tr - 4 * det)) / 2;
            const lambda2 = (tr - Math.sqrt(tr * tr - 4 * det)) / 2;
            return [Math.max(lambda1, 0), Math.max(lambda2, 0)];
        }
        // For larger matrices, return uniform distribution (placeholder)
        return Array(n).fill(tr / n);
    }
    singularValueDecomposition(matrix) {
        // Simplified SVD - returns singular values
        // In production, use proper numerical library (e.g., numeric.js)
        const m = matrix.length;
        const n = matrix[0].length;
        // Calculate A†A
        const ATA = [];
        for (let i = 0; i < n; i++) {
            ATA[i] = [];
            for (let j = 0; j < n; j++) {
                let sum = 0;
                for (let k = 0; k < m; k++) {
                    const elemI = math.complex(matrix[k][i]);
                    const elemJ = math.complex(matrix[k][j]);
                    sum += (elemI.re * elemJ.re + elemI.im * elemJ.im);
                }
                ATA[i][j] = sum;
            }
        }
        // Eigenvalues of A†A give singular values squared
        // Simplified calculation for small matrices
        if (n === 2) {
            const a = ATA[0][0];
            const d = ATA[1][1];
            const b = ATA[0][1];
            const tr = a + d;
            const det = a * d - b * b;
            const lambda1 = (tr + Math.sqrt(tr * tr - 4 * det)) / 2;
            const lambda2 = (tr - Math.sqrt(tr * tr - 4 * det)) / 2;
            return [Math.sqrt(Math.max(lambda1, 0)), Math.sqrt(Math.max(lambda2, 0))];
        }
        // For larger matrices, return placeholder
        return Array(Math.min(m, n)).fill(1 / Math.sqrt(Math.min(m, n)));
    }
    getDimension() {
        return this.dimension;
    }
    getNumQubits() {
        return this.numQubits;
    }
}
exports.HilbertSpace = HilbertSpace;
//# sourceMappingURL=HilbertSpace.js.map
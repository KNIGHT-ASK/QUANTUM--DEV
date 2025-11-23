"use strict";
/**
 * PILLAR 5: Differential Geometry of Quantum States
 *
 * Quantum state space is a **complex projective manifold** with rich geometric structure.
 *
 * Mathematical Foundation:
 * - Projective Hilbert Space: 𝒫(ℋ) = (ℋ \ {0})/~ where |ψ⟩ ~ e^(iφ)|ψ⟩
 * - Fubini-Study metric: ds² = 4 d⟨ψ|dψ⟩ - 4|⟨ψ|dψ⟩|²
 * - Berry Phase: γ = i∮⟨ψ(R)|∇_R|ψ(R)⟩·dR
 * - Natural Gradient: Riemannian gradient on parameter manifold
 *
 * Research Foundation:
 * - Berry (1984) - Quantal phase factors
 * - Pancharatnam (1956) - Generalized theory of interference
 * - Amari (1998) - Natural gradient works efficiently
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifferentialGeometry = void 0;
const mathjs_1 = require("mathjs");
const math = (0, mathjs_1.create)(mathjs_1.all);
/**
 * Differential Geometry of Quantum States
 *
 * Ultimate Physics Focus: Treats quantum circuits as curves on Riemannian manifolds
 */
class DifferentialGeometry {
    nQubits;
    tolerance = 1e-10;
    constructor(nQubits) {
        this.nQubits = nQubits;
    }
    /**
     * Fubini-Study Metric on Projective Hilbert Space
     *
     * For pure states: ds² = 4(d⟨ψ|dψ⟩ - |⟨ψ|dψ⟩|²)
     *
     * This is the natural Riemannian metric on quantum state space
     */
    fubiniStudyMetric(psi, dpsi) {
        // ⟨ψ|dψ⟩
        const inner = math.multiply(math.conj(math.transpose(psi)), dpsi);
        const innerValue = math.abs(inner.get([0, 0]));
        // ⟨dψ|dψ⟩
        const norm = math.multiply(math.conj(math.transpose(dpsi)), dpsi);
        const normValue = math.abs(norm.get([0, 0]));
        // ds² = 4(⟨dψ|dψ⟩ - |⟨ψ|dψ⟩|²)
        return 4 * (normValue - innerValue * innerValue);
    }
    /**
     * Berry Phase Calculation
     *
     * γ = i∮⟨ψ(R)|∇_R|ψ(R)⟩·dR
     *
     * Geometric phase acquired during adiabatic evolution
     */
    berryPhase(stateFunction, parameterPath) {
        let gamma = 0;
        // Integrate along parameter path
        for (let i = 0; i < parameterPath.length - 1; i++) {
            const R = parameterPath[i];
            const dR = parameterPath[i + 1].map((val, idx) => val - R[idx]);
            const psi = stateFunction(R);
            const psiNext = stateFunction(parameterPath[i + 1]);
            // Finite difference: |∇_R ψ⟩ ≈ (|ψ(R+dR)⟩ - |ψ(R)⟩)/|dR|
            const dpsi = math.subtract(psiNext, psi);
            // ⟨ψ|∇_R ψ⟩·dR
            const inner = math.multiply(math.conj(math.transpose(psi)), dpsi);
            const contribution = inner.get([0, 0]);
            gamma += math.im(contribution);
        }
        return {
            gamma,
            berryCurvature: math.zeros([this.nQubits, this.nQubits]),
            geometricPhase: math.complex(0, gamma)
        };
    }
    /**
     * Quantum Metric Tensor (Real part of Fubini-Study)
     *
     * g_ij = Re⟨∂_i ψ|∂_j ψ⟩ - ⟨∂_i ψ|ψ⟩⟨ψ|∂_j ψ⟩
     *
     * This is the quantum Fisher information matrix
     */
    quantumMetricTensor(stateFunction, params) {
        const nParams = params.length;
        const g = math.zeros([nParams, nParams]);
        const epsilon = 1e-6;
        const psi = stateFunction(params);
        for (let i = 0; i < nParams; i++) {
            for (let j = 0; j < nParams; j++) {
                // Compute ∂_i ψ by finite difference
                const params_i = [...params];
                params_i[i] += epsilon;
                const psi_i = stateFunction(params_i);
                const dpsi_i = math.divide(math.subtract(psi_i, psi), epsilon);
                // Compute ∂_j ψ
                const params_j = [...params];
                params_j[j] += epsilon;
                const psi_j = stateFunction(params_j);
                const dpsi_j = math.divide(math.subtract(psi_j, psi), epsilon);
                // g_ij = Re⟨∂_i ψ|∂_j ψ⟩ - ⟨∂_i ψ|ψ⟩⟨ψ|∂_j ψ⟩
                const term1 = math.multiply(math.conj(math.transpose(dpsi_i)), dpsi_j);
                const term2a = math.multiply(math.conj(math.transpose(dpsi_i)), psi);
                const term2b = math.multiply(math.conj(math.transpose(psi)), dpsi_j);
                const term2 = math.multiply(term2a, term2b);
                const gij = math.re(math.subtract(term1, term2));
                g.set([i, j], gij);
            }
        }
        return g;
    }
    /**
     * Natural Gradient Descent
     *
     * Uses Fisher information metric for Riemannian optimization
     * ∇̃f = F^(-1) ∇f where F is the Fisher information matrix
     *
     * This is provably more efficient than standard gradient descent
     */
    naturalGradient(costGradient, stateFunction, params) {
        // Compute Fisher information matrix (quantum metric tensor)
        const F = this.quantumMetricTensor(stateFunction, params);
        // Natural gradient: ∇̃ = F^(-1) ∇
        const F_inv = math.inv(F);
        const gradient_vec = math.matrix(costGradient.map(g => [g]));
        const naturalGrad = math.multiply(F_inv, gradient_vec);
        // Extract as array
        const naturalGradArray = [];
        for (let i = 0; i < params.length; i++) {
            naturalGradArray.push(naturalGrad.get([i, 0]));
        }
        // Condition number of Fisher matrix
        const eigenvalues = math.eigs(F).values;
        const conditionNumber = Math.max(...eigenvalues) / Math.min(...eigenvalues.filter(v => Math.abs(v) > this.tolerance));
        return {
            gradient: naturalGradArray,
            fisherMatrix: F,
            conditionNumber
        };
    }
    /**
     * Fidelity Susceptibility
     *
     * χ_F = ∂²F(θ,θ')/∂θ'²|_(θ'=θ)
     * where F = |⟨ψ(θ)|ψ(θ')⟩|²
     *
     * Measures sensitivity of quantum state to parameter changes
     */
    fidelitySusceptibility(stateFunction, params) {
        const epsilon = 1e-6;
        const psi = stateFunction(params);
        // Compute fidelity derivatives
        let chi = 0;
        for (let i = 0; i < params.length; i++) {
            const params_plus = [...params];
            params_plus[i] += epsilon;
            const psi_plus = stateFunction(params_plus);
            const params_minus = [...params];
            params_minus[i] -= epsilon;
            const psi_minus = stateFunction(params_minus);
            // Fidelity: F = |⟨ψ|ψ'⟩|²
            const F_plus = math.abs(math.multiply(math.conj(math.transpose(psi)), psi_plus));
            const F_minus = math.abs(math.multiply(math.conj(math.transpose(psi)), psi_minus));
            // Second derivative
            const d2F = (F_plus - 2 + F_minus) / (epsilon * epsilon);
            chi += d2F;
        }
        const quantumMetric = this.quantumMetricTensor(stateFunction, params);
        return {
            chi,
            quantumMetric
        };
    }
    /**
     * Geodesic on Fubini-Study Manifold
     *
     * Shortest path between two quantum states
     * Used for optimal quantum control
     */
    geodesicDistance(psi1, psi2) {
        // Fidelity: F = |⟨ψ₁|ψ₂⟩|²
        const overlap = math.multiply(math.conj(math.transpose(psi1)), psi2);
        const fidelity = math.abs(overlap.get([0, 0])) ** 2;
        // Geodesic distance: d = arccos(√F)
        return Math.acos(Math.sqrt(Math.min(1, fidelity)));
    }
    /**
     * Bures Metric for Density Matrices
     *
     * d_B(ρ,σ)² = 2(1 - √F(ρ,σ))
     * F(ρ,σ) = (Tr√(√ρ σ √ρ))²
     *
     * Generalization of Fubini-Study to mixed states
     */
    buresDistance(rho1, rho2) {
        // Simplified calculation (exact requires matrix square roots)
        // For now, use trace distance as approximation
        const diff = math.subtract(rho1, rho2);
        const traceDist = 0.5 * math.trace(math.abs(diff));
        return Math.sqrt(2 * traceDist);
    }
}
exports.DifferentialGeometry = DifferentialGeometry;
//# sourceMappingURL=DifferentialGeometry.js.map
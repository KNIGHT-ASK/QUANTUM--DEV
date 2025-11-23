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
import { Complex, Matrix } from 'mathjs';
export interface BerryPhaseResult {
    gamma: number;
    berryCurvature: Matrix;
    geometricPhase: Complex;
}
export interface FidelitySusceptibility {
    chi: number;
    quantumMetric: Matrix;
}
export interface NaturalGradientResult {
    gradient: number[];
    fisherMatrix: Matrix;
    conditionNumber: number;
}
/**
 * Differential Geometry of Quantum States
 *
 * Ultimate Physics Focus: Treats quantum circuits as curves on Riemannian manifolds
 */
export declare class DifferentialGeometry {
    private nQubits;
    private tolerance;
    constructor(nQubits: number);
    /**
     * Fubini-Study Metric on Projective Hilbert Space
     *
     * For pure states: ds² = 4(d⟨ψ|dψ⟩ - |⟨ψ|dψ⟩|²)
     *
     * This is the natural Riemannian metric on quantum state space
     */
    fubiniStudyMetric(psi: Matrix, dpsi: Matrix): number;
    /**
     * Berry Phase Calculation
     *
     * γ = i∮⟨ψ(R)|∇_R|ψ(R)⟩·dR
     *
     * Geometric phase acquired during adiabatic evolution
     */
    berryPhase(stateFunction: (param: number[]) => Matrix, parameterPath: number[][]): BerryPhaseResult;
    /**
     * Quantum Metric Tensor (Real part of Fubini-Study)
     *
     * g_ij = Re⟨∂_i ψ|∂_j ψ⟩ - ⟨∂_i ψ|ψ⟩⟨ψ|∂_j ψ⟩
     *
     * This is the quantum Fisher information matrix
     */
    quantumMetricTensor(stateFunction: (params: number[]) => Matrix, params: number[]): Matrix;
    /**
     * Natural Gradient Descent
     *
     * Uses Fisher information metric for Riemannian optimization
     * ∇̃f = F^(-1) ∇f where F is the Fisher information matrix
     *
     * This is provably more efficient than standard gradient descent
     */
    naturalGradient(costGradient: number[], stateFunction: (params: number[]) => Matrix, params: number[]): NaturalGradientResult;
    /**
     * Fidelity Susceptibility
     *
     * χ_F = ∂²F(θ,θ')/∂θ'²|_(θ'=θ)
     * where F = |⟨ψ(θ)|ψ(θ')⟩|²
     *
     * Measures sensitivity of quantum state to parameter changes
     */
    fidelitySusceptibility(stateFunction: (params: number[]) => Matrix, params: number[]): FidelitySusceptibility;
    /**
     * Geodesic on Fubini-Study Manifold
     *
     * Shortest path between two quantum states
     * Used for optimal quantum control
     */
    geodesicDistance(psi1: Matrix, psi2: Matrix): number;
    /**
     * Bures Metric for Density Matrices
     *
     * d_B(ρ,σ)² = 2(1 - √F(ρ,σ))
     * F(ρ,σ) = (Tr√(√ρ σ √ρ))²
     *
     * Generalization of Fubini-Study to mixed states
     */
    buresDistance(rho1: Matrix, rho2: Matrix): number;
}
//# sourceMappingURL=DifferentialGeometry.d.ts.map
/**
 * Quantum Information Theory - Pillar 3
 *
 * Information measures, entanglement quantification, quantum channels
 * Essential for understanding quantum correlations and processing
 */
import { Complex } from 'mathjs';
export interface QuantumChannel {
    name: string;
    krausOperators: Complex[][][];
    isTracePreserving: boolean;
    isCompletelyPositive: boolean;
}
export interface EntanglementMeasures {
    vonNeumannEntropy: number;
    negativity: number;
    concurrence?: number;
    logarithmicNegativity: number;
}
/**
 * Quantum Information Theory toolkit
 */
export interface EntanglementMeasuresComplete {
    vonNeumannEntropy: number;
    negativity: number;
    concurrence: number;
    logarithmicNegativity: number;
    squashedEntanglement?: number;
}
export interface QuantumChannelCapacity {
    classicalCapacity: number;
    quantumCapacity?: number;
    holevoBound: number;
}
export declare class QuantumInformation {
    private readonly TOLERANCE;
    /**
     * Quantum Mutual Information: I(A:B) = S(A) + S(B) - S(AB)
     * Measures total correlations (classical + quantum)
     */
    quantumMutualInformation(rhoAB: Complex[][], dimA: number, dimB: number): number;
    /**
     * Entanglement Negativity: N(ρ) = ||ρ^T_B||₁ - 1
     * Computable entanglement measure, zero for separable states
     */
    calculateNegativity(rhoAB: Complex[][], dimA: number, dimB: number): number;
    /**
     * Logarithmic Negativity: E_N = log₂(||ρ^T_B||₁)
     * Upper bound on distillable entanglement
     */
    logarithmicNegativity(rhoAB: Complex[][], dimA: number, dimB: number): number;
    /**
     * Concurrence for 2-qubit states
     * C(ρ) = max{0, λ₁-λ₂-λ₃-λ₄}
     * where λᵢ are eigenvalues of √(√ρ ρ̃ √ρ) in decreasing order
     * ρ̃ = (σʸ⊗σʸ)ρ*(σʸ⊗σʸ)
     * C(ρ) ∈ [0,1], with C=1 for maximally entangled Bell states
     */
    calculateConcurrence(rho22: Complex[][]): number;
    /**
     * Complete entanglement characterization
     */
    analyzeEntanglement(rhoAB: Complex[][], dimA: number, dimB: number): EntanglementMeasures;
    /**
     * Quantum Fisher Information Matrix
     * Used for parameter estimation and quantum metrology
     */
    quantumFisherInformation(rho: Complex[][], generator: Complex[][]): number;
    /**
     * Validate quantum channel properties
     * Must be completely positive and trace preserving (CPTP)
     */
    validateQuantumChannel(channel: QuantumChannel): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Partial trace: Tr_B(ρ_AB) or Tr_A(ρ_AB)
     */
    private partialTrace;
    /**
     * Partial transpose: (ρ_AB)^T_B
     */
    private partialTranspose;
    /**
     * Trace norm ||A||₁ = Tr(√(A†A))
     */
    private traceNorm;
    private tensorProduct;
    private matrixMultiply;
    private matrixAdd;
    private matrixSubtract;
    private conjugateTranspose;
    private complexConjugate;
    private expectationValue;
    private identityMatrix;
    private zerosMatrix;
    private matrixNorm;
    private getEigenvalues;
}
//# sourceMappingURL=QuantumInformation.d.ts.map
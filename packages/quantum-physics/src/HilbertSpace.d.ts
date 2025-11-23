/**
 * Hilbert Space Analysis - Pillar 1
 *
 * Operates natively in quantum state spaces ℋ = ℂ^(2^n)
 * Understands density matrices ρ, operator algebra, tensor products, partial traces
 */
import { Complex } from 'mathjs';
export interface QuantumState {
    /** State vector amplitudes */
    amplitudes: Complex[];
    /** Number of qubits */
    numQubits: number;
    /** Whether this is a pure state */
    isPure: boolean;
    /** Density matrix (for mixed states) */
    densityMatrix?: Complex[][];
}
export interface HilbertSpaceAnalysis {
    dimension: number;
    numQubits: number;
    isNormalized: boolean;
    norm: number;
    entropy: number;
    purity: number;
    isEntangled: boolean;
    entanglementEntropy?: number;
    schmidtCoefficients?: number[];
    symmetries: string[];
}
export declare class HilbertSpace {
    private readonly numQubits;
    private readonly dimension;
    private readonly TOLERANCE;
    constructor(numQubits: number);
    /**
     * Validate that a state vector is properly normalized
     * ||ψ||² = Σᵢ|αᵢ|² = 1
     */
    validateNormalization(state: Complex[]): {
        isValid: boolean;
        norm: number;
        error?: string;
    };
    /**
     * Calculate von Neumann entropy: S(ρ) = -Tr(ρ log ρ)
     * For pure state: S = 0
     * For maximally mixed: S = log₂(d)
     */
    calculateVonNeumannEntropy(densityMatrix: Complex[][]): number;
    /**
     * Calculate purity: Tr(ρ²)
     * For pure state: Tr(ρ²) = 1
     * For maximally mixed: Tr(ρ²) = 1/d
     */
    calculatePurity(densityMatrix: Complex[][]): number;
    /**
     * Schmidt decomposition for bipartite entanglement
     * |ψ⟩ = Σᵢ √λᵢ |iₐ⟩⊗|iᵦ⟩
     */
    schmidtDecomposition(state: Complex[], subsystemAQubits: number): {
        coefficients: number[];
        isEntangled: boolean;
        entanglementEntropy: number;
    };
    /**
     * Analyze full Hilbert space structure
     */
    analyze(state: QuantumState): HilbertSpaceAnalysis;
    private stateToDensityMatrix;
    private matrixMultiply;
    private trace;
    private getEigenvalues;
    private singularValueDecomposition;
    getDimension(): number;
    getNumQubits(): number;
}
//# sourceMappingURL=HilbertSpace.d.ts.map
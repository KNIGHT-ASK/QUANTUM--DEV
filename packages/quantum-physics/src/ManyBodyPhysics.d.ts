/**
 * Many-Body Physics Module - Pillar 6 (Task 13)
 *
 * Tensor network states: MPS, PEPS, MERA
 * Area law entanglement, quantum phase transitions
 * DMRG integration for ground state search
 *
 * Research Sources:
 * - Tensor networks: Modern overview papers
 * - DMRG: White 1992, Schollwöck 2005
 * - Area law: Eisert et al. 2010
 */
import { Complex } from 'mathjs';
export interface TensorNetworkState {
    /** Type of tensor network */
    type: 'MPS' | 'PEPS' | 'MERA' | 'TTN';
    /** Bond dimensions */
    bondDimensions: number[];
    /** Tensor data */
    tensors: any[];
    /** System size */
    systemSize: number;
}
export interface MPSState extends TensorNetworkState {
    type: 'MPS';
    /** Left-canonical form flag */
    leftCanonical: boolean;
    /** Right-canonical form flag */
    rightCanonical: boolean;
    /** Orthogonality center */
    center: number;
}
export interface DMRGConfig {
    /** Number of DMRG sweeps */
    numSweeps: number;
    /** Bond dimension */
    bondDimension: number;
    /** Convergence tolerance */
    tolerance: number;
    /** Two-site or single-site DMRG */
    twoSite: boolean;
}
export interface EntanglementSpectrum {
    /** Schmidt values λ_α */
    schmidtValues: number[];
    /** Entanglement entropy S = -Σ λ²log(λ²) */
    entropy: number;
    /** Partition: sites [0, cut) vs [cut, N) */
    cut: number;
}
/**
 * Many-Body Physics Engine
 * Implements tensor networks and DMRG for many-body systems
 */
export declare class ManyBodyPhysics {
    /**
     * Create Matrix Product State (MPS)
     * Efficient representation for 1D systems: |ψ⟩ = Σ A¹ A² ... Aᴺ |i₁i₂...iₙ⟩
     */
    createMPS(systemSize: number, bondDimension: number, physicalDimension?: number): MPSState;
    /**
     * DMRG Ground State Search
     * Density Matrix Renormalization Group algorithm
     */
    dmrgGroundState(hamiltonian: Complex[][], // Matrix product operator (MPO)
    initialMPS: MPSState, config?: DMRGConfig): Promise<{
        groundState: MPSState;
        energy: number;
        convergenceHistory: number[];
    }>;
    /**
     * Compute Entanglement Spectrum
     * Schmidt decomposition across bipartition
     */
    computeEntanglementSpectrum(mps: MPSState, cut: number): EntanglementSpectrum;
    /**
     * Check Area Law Entanglement
     * For 1D systems: S ~ log(L) (critical) or S ~ const (gapped)
     */
    checkAreaLaw(mps: MPSState): {
        satisfiesAreaLaw: boolean;
        maxEntropy: number;
        scaling: 'constant' | 'logarithmic' | 'volume';
    };
    /**
     * Detect Quantum Phase Transition
     * Using entanglement entropy, correlation length, or order parameters
     */
    detectPhaseTransition(hamiltonianFamily: (parameter: number) => Complex[][], parameterRange: number[], bondDimension?: number): {
        transitionPoint: number | null;
        orderParameter: number[];
        entanglementEntropy: number[];
    };
    /**
     * Time Evolution with MPS
     * TEBD (Time-Evolving Block Decimation) algorithm
     */
    timeEvolution(initialState: MPSState, hamiltonian: Complex[][], time: number, timeSteps: number, maxBondDimension?: number): Promise<MPSState[]>;
    /**
     * Compute Correlation Function
     * ⟨O_i O_j⟩ - ⟨O_i⟩⟨O_j⟩
     */
    computeCorrelationFunction(mps: MPSState, operator: Complex[][], distance: number): number[];
    /**
     * Canonical Form Conversion
     * Convert MPS to left/right canonical form for stability
     */
    convertToLeftCanonical(mps: MPSState): MPSState;
    /**
     * Private helper methods
     */
    private dmrgOptimizeSite;
    private computeExpectationValue;
    private computeSchmidtValues;
    private findMaxDerivative;
    private applyTwoSiteGate;
    private trotterGate;
    private twoPointCorrelation;
    private onePointExpectation;
    private qrDecomposition;
    private contractTensors;
    /**
     * Create PEPS (Projected Entangled Pair State)
     * 2D generalization of MPS
     */
    createPEPS(width: number, height: number, bondDimension: number): TensorNetworkState;
    /**
     * Create MERA (Multi-scale Entanglement Renormalization Ansatz)
     * Tree tensor network for critical systems
     */
    createMERA(systemSize: number, bondDimension: number): TensorNetworkState;
}
//# sourceMappingURL=ManyBodyPhysics.d.ts.map
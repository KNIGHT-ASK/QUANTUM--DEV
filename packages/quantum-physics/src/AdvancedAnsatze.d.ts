/**
 * Advanced Ansätze Module - Task 14
 *
 * UCCSD (Unitary Coupled Cluster Singles and Doubles)
 * ADAPT-VQE (Adaptive Derivative-Assembled Pseudo-Trotter)
 * Hardware-efficient ansätze
 * Symmetry-preserving circuits
 *
 * Research Sources:
 * - UCCSD: Quantum chemistry standard
 * - ADAPT-VQE: arXiv:1812.11173
 * - Hardware-efficient: Kandala et al. 2017
 */
import { Complex } from 'mathjs';
export interface AnsatzConfig {
    /** Type of ansatz */
    type: 'UCCSD' | 'ADAPT' | 'HardwareEfficient' | 'SymmetryPreserving' | 'QubitADAPT';
    /** Number of qubits */
    nQubits: number;
    /** Number of parameters */
    nParameters: number;
    /** Operator pool (for ADAPT) */
    operatorPool?: Complex[][][];
}
export interface UCCSDOperator {
    /** Excitation type */
    type: 'single' | 'double' | 'triple' | 'quadruple';
    /** Occupied orbitals */
    occupied: number[];
    /** Virtual orbitals */
    virtual: number[];
    /** Pauli string representation */
    pauliString: Array<{
        index: number;
        pauli: 'I' | 'X' | 'Y' | 'Z';
    }>;
    /** Parameter index */
    parameterIndex: number;
}
export interface ADAPTVQEResult {
    /** Final ansatz (selected operators) */
    selectedOperators: UCCSDOperator[];
    /** Optimal parameters */
    parameters: number[];
    /** Ground state energy */
    energy: number;
    /** Convergence history */
    convergenceHistory: Array<{
        iteration: number;
        energy: number;
        gradient: number[];
        operatorAdded: number;
    }>;
}
/**
 * Advanced Ansätze Engine
 * Implements state-of-the-art variational ansätze for VQE
 */
export declare class AdvancedAnsatze {
    /**
     * Generate UCCSD Ansatz
     * Unitary Coupled Cluster Singles and Doubles
     *
     * |ψ(θ)⟩ = exp(T - T†)|HF⟩
     * where T = T₁ + T₂ (singles + doubles)
     */
    generateUCCSD(nElectrons: number, nSpinOrbitals: number): {
        operators: UCCSDOperator[];
        parameters: number[];
        circuit: any;
    };
    /**
     * ADAPT-VQE Algorithm
     * Adaptive ansatz construction
     *
     * Algorithm:
     * 1. Start with reference state
     * 2. Compute gradients of all operators in pool
     * 3. Add operator with largest gradient
     * 4. Optimize parameters
     * 5. Repeat until convergence
     */
    adaptVQE(hamiltonian: Complex[][], referenceState: Complex[], operatorPool: UCCSDOperator[], tolerance?: number, maxIterations?: number): Promise<ADAPTVQEResult>;
    /**
     * Hardware-Efficient Ansatz
     * Parameterized circuit with native gates
     *
     * Structure: [RY layer] [entangling layer] × depth
     */
    generateHardwareEfficientAnsatz(nQubits: number, depth: number, entanglingPattern?: 'linear' | 'circular' | 'all-to-all'): AnsatzConfig;
    /**
     * Symmetry-Preserving Ansatz
     * Respects particle number, spin, spatial symmetries
     */
    generateSymmetryPreservingAnsatz(nQubits: number, conservedQuantities: {
        particleNumber?: number;
        totalSpin?: number;
        pointGroup?: string;
    }): AnsatzConfig;
    /**
     * Qubit-ADAPT-VQE
     * ADAPT-VQE with Pauli operator pool instead of fermionic
     */
    generateQubitADAPTPool(nQubits: number): Complex[][][];
    /**
     * k-UpCCGSD
     * Generalized unitary coupled cluster
     */
    generateKUpCCGSD(nQubits: number, k: number): UCCSDOperator[];
    /**
     * Private helper methods
     */
    private excitationToPauli;
    private buildUCCSDCircuit;
    private computeGradients;
    private parameterShiftGradient;
    private evaluateEnergy;
    private applyAnsatz;
    private applyPauliRotation;
    private computeExpectation;
    private findMaxGradient;
    private optimizeParameters;
    private numericGradient;
    private pauliOperator;
    private twoQubitPauli;
}
//# sourceMappingURL=AdvancedAnsatze.d.ts.map
/**
 * Hamiltonian Engine - Pillar 2
 *
 * All quantum dynamics from Ĥ = Ĥ†
 * Spectral decomposition, time evolution, symmetries
 */
import { Complex } from 'mathjs';
export interface HamiltonianMatrix {
    /** Matrix elements */
    elements: Complex[][];
    /** Number of qubits */
    numQubits: number;
    /** Dimension (2^n) */
    dimension: number;
}
export interface HamiltonianAnalysis {
    isHermitian: boolean;
    hermiticityError: number;
    eigenvalues: number[];
    groundStateEnergy: number;
    groundStateIndex: number;
    excitationGap: number;
    symmetries: Array<{
        operator: string;
        commutes: boolean;
    }>;
    spectrum: {
        min: number;
        max: number;
        range: number;
    };
}
export declare class Hamiltonian {
    private readonly matrix;
    private readonly numQubits;
    private readonly dimension;
    private readonly TOLERANCE;
    constructor(matrix: Complex[][], numQubits: number);
    /**
     * Validate Hermiticity: Ĥ = Ĥ†
     * Check ||Ĥ - Ĥ†|| < ε
     */
    validateHermiticity(): {
        isHermitian: boolean;
        error: number;
        details?: string;
    };
    /**
     * Compute eigenspectrum of Hamiltonian
     * Ĥ|Eₙ⟩ = Eₙ|Eₙ⟩
     */
    computeSpectrum(): {
        eigenvalues: number[];
        eigenvectors: Complex[][];
    };
    /**
     * Time evolution operator: Û(t) = exp(-iĤt/ℏ)
     */
    timeEvolutionOperator(time: number, hbar?: number): Complex[][];
    /**
     * Trotterization: exp(-iĤt) ≈ [exp(-iĤt/n)]ⁿ
     * For Ĥ = Σᵢ Ĥᵢ, use product formula
     */
    trotterize(terms: Complex[][][], time: number, steps: number): Complex[][];
    /**
     * Detect symmetries: [Ĥ, Q̂] = 0 → Q conserved
     */
    findSymmetries(operators: Map<string, Complex[][]>): Array<{
        operator: string;
        commutes: boolean;
        commutator: number;
    }>;
    /**
     * Complete Hamiltonian analysis
     */
    analyze(conservedOperators?: Map<string, Complex[][]>): HamiltonianAnalysis;
    private exactDiagonalization;
    private iterativeDiagonalization;
    private matrixMultiply;
    private matrixVectorMultiply;
    private normalizeVector;
    private identityMatrix;
    private matrixExponential;
    private scalarMultiply;
    private matrixAdd;
    getMatrix(): Complex[][];
    getDimension(): number;
    getNumQubits(): number;
}
//# sourceMappingURL=Hamiltonian.d.ts.map
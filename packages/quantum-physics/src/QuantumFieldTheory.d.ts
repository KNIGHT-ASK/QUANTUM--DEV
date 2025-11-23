/**
 * Quantum Field Theory Module - Pillar 4 (Task 11)
 *
 * Second quantization formalism for quantum simulation
 * Fermion-to-qubit mappings: Jordan-Wigner, Bravyi-Kitaev
 * Lattice QCD and gauge theory operators
 *
 * Research Sources:
 * - Bravyi-Kitaev: arXiv:1208.5986
 * - Jordan-Wigner: Standard fermionic algebra
 * - Gauge theories: Lattice formulations
 */
import { Complex } from 'mathjs';
export interface FermionOperator {
    /** Fermionic creation/annihilation operators */
    terms: Array<{
        coefficient: Complex;
        operators: Array<{
            index: number;
            type: 'creation' | 'annihilation';
        }>;
    }>;
    /** Number of fermionic modes */
    nModes: number;
}
export interface QubitOperator {
    /** Pauli string representation */
    terms: Array<{
        coefficient: Complex;
        paulis: Array<{
            index: number;
            pauli: 'I' | 'X' | 'Y' | 'Z';
        }>;
    }>;
    /** Number of qubits */
    nQubits: number;
}
export interface LatticeGaugeField {
    /** Lattice dimensions */
    dimensions: number[];
    /** Gauge group (U(1), SU(2), SU(3)) */
    gaugeGroup: 'U(1)' | 'SU(2)' | 'SU(3)';
    /** Link variables (gauge fields on edges) */
    links: Complex[][][];
    /** Coupling constant */
    coupling: number;
}
/**
 * Quantum Field Theory Engine
 * Implements second quantization and fermion-qubit mappings
 */
export declare class QuantumFieldTheory {
    /**
     * Jordan-Wigner Transformation
     * Maps fermion operators to qubit operators with O(n) locality
     *
     * c_j = (1/2)(X_j - iY_j) ⊗ Z_{j-1} ⊗ ... ⊗ Z_0
     * c_j† = (1/2)(X_j + iY_j) ⊗ Z_{j-1} ⊗ ... ⊗ Z_0
     */
    jordanWignerTransform(fermionOp: FermionOperator): QubitOperator;
    /**
     * Bravyi-Kitaev Transformation
     * More efficient mapping with O(log n) locality
     * Based on arXiv:1208.5986
     *
     * Key advantages:
     * - Logarithmic scaling of operator weight
     * - Better for quantum simulation
     * - Preserves locality of Hamiltonian terms
     */
    bravyiKitaevTransform(fermionOp: FermionOperator): QubitOperator;
    /**
     * Parity Transformation
     * Alternative mapping preserving particle number
     */
    parityTransform(fermionOp: FermionOperator): QubitOperator;
    /**
     * Create Fermionic Hamiltonian from second quantization
     * H = Σ_{ij} h_{ij} c_i† c_j + (1/2) Σ_{ijkl} h_{ijkl} c_i† c_j† c_k c_l
     */
    createFermionicHamiltonian(oneBodyTerms: number[][], // h_ij
    twoBodyTerms?: number[][][][]): FermionOperator;
    /**
     * Lattice QCD Hamiltonian
     * Wilson action on discrete spacetime lattice
     */
    createLatticeQCDHamiltonian(lattice: LatticeGaugeField, fermionMass: number, hopperParameter?: number): FermionOperator;
    /**
     * Gauge Theory Operators
     * Wilson loops, plaquettes for lattice gauge theory
     */
    createWilsonLoop(lattice: LatticeGaugeField, path: Array<{
        site: number[];
        direction: number;
    }>): QubitOperator;
    /**
     * Plaquette Operator
     * Elementary gauge field strength on lattice
     */
    createPlaquette(lattice: LatticeGaugeField, site: number[], plane: [number, number]): QubitOperator;
    /**
     * Helper: Convert single fermion term to Jordan-Wigner
     */
    private fermionTermToJW;
    /**
     * Helper: Build Bravyi-Kitaev binary tree
     */
    private buildBravyiKitaevTree;
    private computeUpdateSet;
    private computeParitySet;
    private computeFlipSet;
    /**
     * Helper: Convert fermion term to Bravyi-Kitaev
     */
    private fermionTermToBK;
    /**
     * Helper: Convert fermion term to Parity basis
     */
    private fermionTermToParity;
    /**
     * Helper: Simplify qubit operator by combining like terms
     */
    private simplifyQubitOperator;
    private pauliStringToKey;
    private keyToPauliString;
    private fermionIndex;
    private estimateQubitsForGauge;
    /**
     * Validate fermionic anticommutation relations
     * {c_i, c_j†} = δ_ij, {c_i, c_j} = 0
     */
    validateAnticommutation(fermionOp: FermionOperator): {
        valid: boolean;
        violations: string[];
    };
}
//# sourceMappingURL=QuantumFieldTheory.d.ts.map
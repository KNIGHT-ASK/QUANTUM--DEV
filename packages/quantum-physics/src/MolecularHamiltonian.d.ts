/**
 * Molecular Hamiltonian - Pillar 7 (Quantum Chemistry)
 *
 * Electronic structure Hamiltonians for molecules
 * Based on real arXiv research papers
 */
import { Complex } from 'mathjs';
export interface MoleculeSpec {
    name: string;
    atoms: Array<{
        element: string;
        position: [number, number, number];
    }>;
    charge: number;
    multiplicity: number;
}
export interface MolecularHamiltonianData {
    oneBodyIntegrals: number[][];
    twoBodyIntegrals: number[][][][];
    nuclearRepulsion: number;
    numOrbitals: number;
    numElectrons: number;
}
/**
 * Electronic Hamiltonian in second quantization:
 * Ĥ = Σ_pq h_pq a†_p a_q + (1/2) Σ_pqrs h_pqrs a†_p a†_q a_r a_s + E_nuc
 *
 * For H2 molecule (minimal STO-3G basis):
 * - 2 electrons in 2 spatial orbitals → 4 spin-orbitals
 * - Singlet state (S=0) → 2 qubits after symmetry reduction
 */
export declare class MolecularHamiltonian {
    /**
     * Get H2 molecule Hamiltonian at specific bond length
     * Data from experimental/computational chemistry
     *
     * At equilibrium (0.735 Å): E_ground = -1.137 Hartree
     */
    static getH2Hamiltonian(bondLength?: number): MolecularHamiltonianData;
    /**
     * Convert molecular Hamiltonian to qubit Hamiltonian
     * Using Jordan-Wigner transformation
     *
     * Returns Pauli string representation:
     * Ĥ = c₀I + c₁Z₀ + c₂Z₁ + c₃Z₀Z₁ + c₄X₀X₁ + c₅Y₀Y₁
     */
    static toQubitHamiltonian(molHam: MolecularHamiltonianData): {
        pauliStrings: Array<{
            coeff: number;
            ops: string;
        }>;
        constantTerm: number;
    };
    /**
     * Build full qubit Hamiltonian matrix from Pauli strings
     * For 2 qubits: 4×4 matrix
     */
    static buildQubitMatrix(qubitHam: {
        pauliStrings: Array<{
            coeff: number;
            ops: string;
        }>;
        constantTerm: number;
    }): Complex[][];
    private static tensorProduct;
    /**
     * Get expected ground state energy from literature
     * For validation of VQE results
     */
    static getGroundStateEnergy(molecule: string, bondLength?: number): number;
    /**
     * Validate molecular Hamiltonian satisfies:
     * 1. Hermiticity
     * 2. Correct number of electrons
     * 3. Physical energy bounds
     */
    static validate(molHam: MolecularHamiltonianData): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=MolecularHamiltonian.d.ts.map
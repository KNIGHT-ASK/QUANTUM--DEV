/**
 * PILLAR 13: Quantum Gravity and Holography
 *
 * AdS/CFT correspondence, Ryu-Takayanagi formula, SYK model
 *
 * @packageDocumentation
 */
import { Matrix } from 'mathjs';
export declare class QuantumGravityHolography {
    /**
     * Ryu-Takayanagi formula: S_A = Area(γ_A)/(4G_N)
     * Relates entanglement entropy to minimal surface area in AdS
     */
    ryuTakayanagiEntropy(area: number, newtonConstant: number): number;
    /**
     * SYK model: Hamiltonian with random all-to-all interactions
     * H = Σᵢⱼₖₗ Jᵢⱼₖₗ ψᵢψⱼψₖψₗ
     *
     * Exhibits emergent conformal symmetry and quantum chaos
     */
    sykHamiltonian(nMajoranas: number, couplings: number[][][][]): Matrix;
    /**
     * Holographic entanglement entropy scaling
     * Boundary CFT: S ~ (c/3) log(l/ε)
     * where c is central charge, l is length, ε is UV cutoff
     */
    holographicEntanglementScaling(centralCharge: number, length: number, uvCutoff: number): number;
}
//# sourceMappingURL=QuantumGravityHolography.d.ts.map
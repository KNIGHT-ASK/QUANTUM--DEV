/**
 * PILLAR 14: Lattice Gauge Theory
 *
 * Wilson loops, Kogut-Susskind Hamiltonian, quantum link models
 *
 * @packageDocumentation
 */
import { Complex, Matrix } from 'mathjs';
export interface LatticeConfig {
    dimensions: number[];
    gaugeGroup: 'U(1)' | 'SU(2)' | 'SU(3)';
    coupling: number;
}
export declare class LatticeGaugeTheory {
    private config;
    constructor(config: LatticeConfig);
    /**
     * Wilson loop: W(C) = Tr[U_C]
     * Expectation value ⟨W(C)⟩ measures confinement
     */
    wilsonLoop(path: number[][]): Complex;
    /**
     * Kogut-Susskind Hamiltonian for U(1) gauge theory
     * H = g²/2 Σ_n E_n² + 1/(2g²) Σ_plaq (1 - cos(θ_plaq))
     */
    kogutSusskindHamiltonian(): Matrix;
    /**
     * Gauss law constraint: (∇·E)(n) = ψ†(n)ψ(n) - ψ†(n+μ)ψ(n+μ)
     * Must be satisfied in physical subspace
     */
    gaussLawConstraint(site: number[]): number;
}
//# sourceMappingURL=LatticeGaugeTheory.d.ts.map
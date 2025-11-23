/**
 * PILLAR 10: Quantum Metrology and Sensing
 *
 * Quantum Cramér-Rao bound, Heisenberg limit, GHZ/NOON states
 *
 * @packageDocumentation
 */
import { Matrix } from 'mathjs';
export declare class QuantumMetrology {
    private nQubits;
    constructor(nQubits: number);
    /**
     * Quantum Fisher Information: F_Q
     * Quantum Cramér-Rao bound: Δθ ≥ 1/√(νF_Q)
     */
    quantumFisherInformation(rho: Matrix, generator: Matrix): number;
    /**
     * Create GHZ state: |GHZ⟩ = (|0...0⟩ + |1...1⟩)/√2
     * Optimal for phase estimation at Heisenberg limit
     */
    createGHZState(): Matrix;
    /**
     * Heisenberg limit: Δφ ∝ 1/N vs SQL ∝ 1/√N
     */
    heisenbergLimit(nParticles: number, measurements: number): number;
}
//# sourceMappingURL=QuantumMetrology.d.ts.map
/**
 * PILLAR 11: Quantum Simulation Theory
 *
 * Hamiltonian simulation, product formulas, quantum signal processing
 *
 * @packageDocumentation
 */
import { Matrix } from 'mathjs';
export declare class QuantumSimulationTheory {
    /**
     * Trotter-Suzuki decomposition
     * exp(-iHt) ≈ [exp(-iH₁t/n)exp(-iH₂t/n)...exp(-iHₖt/n)]ⁿ
     */
    trotterDecomposition(hamiltonianTerms: Matrix[], time: number, steps: number, order?: number): Matrix[];
    /**
     * Product formula error: O(t²/n) for 1st order, O(t³/n²) for 2nd order
     */
    trotterError(time: number, steps: number, order: number): number;
    private matrixExponential;
}
//# sourceMappingURL=QuantumSimulationTheory.d.ts.map
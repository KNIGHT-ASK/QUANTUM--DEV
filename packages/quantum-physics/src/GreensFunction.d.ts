/**
 * PILLAR 6 EXPANSION: Green's Functions for Many-Body Physics
 *
 * Critical for spectral properties and dynamics
 */
import { Complex, Matrix } from 'mathjs';
export interface GreensFunctionResult {
    retarded: Complex[][];
    advanced: Complex[][];
    spectralFunction: number[][];
    densityOfStates: number[];
}
export declare class GreensFunction {
    /**
     * Retarded Green's Function
     * G^R(x,t;x',t') = -iθ(t-t')⟨{ψ(x,t), ψ†(x',t')}⟩
     */
    computeRetardedGF(hamiltonian: Matrix, energy: number, eta?: number): Matrix;
    /**
     * Spectral Function
     * A(ω) = -1/π Im[G^R(ω)]
     */
    computeSpectralFunction(hamiltonian: Matrix, energies: number[]): number[];
    /**
     * Local Density of States
     * ρ(E) = -1/π Im[Tr(G^R(E))]
     */
    computeDOS(hamiltonian: Matrix, energies: number[]): number[];
}
//# sourceMappingURL=GreensFunction.d.ts.map
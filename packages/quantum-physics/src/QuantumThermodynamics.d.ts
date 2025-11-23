/**
 * PILLAR 9: Quantum Thermodynamics and Open Systems
 *
 * Lindblad master equation, quantum heat engines, fluctuation theorems
 *
 * @packageDocumentation
 */
import { Matrix } from 'mathjs';
export interface LindbladOperator {
    operator: Matrix;
    rate: number;
    label: string;
}
export interface OpenSystemDynamics {
    hamiltonian: Matrix;
    lindbladOperators: LindbladOperator[];
    temperature?: number;
}
export declare class QuantumThermodynamics {
    private dimension;
    constructor(dimension: number);
    /**
     * Lindblad master equation: dρ/dt = -i[H,ρ] + Σᵢ(LᵢρLᵢ† - ½{Lᵢ†Lᵢ,ρ})
     */
    lindbladEvolution(rho: Matrix, dynamics: OpenSystemDynamics, dt: number): Matrix;
    /**
     * Thermal state: ρ_th = exp(-βH) / Z
     */
    thermalState(hamiltonian: Matrix, temperature: number): Matrix;
}
//# sourceMappingURL=QuantumThermodynamics.d.ts.map
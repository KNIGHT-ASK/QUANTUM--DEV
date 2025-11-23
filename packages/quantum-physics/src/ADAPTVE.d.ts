/**
 * PILLAR 7 EXPANSION: ADAPT-VQE Algorithm
 *
 * Adaptive Derivative-Assembled Pseudo-Trotter VQE
 * State-of-the-art quantum chemistry algorithm
 */
import { Matrix } from 'mathjs';
export interface ADAPTVQEResult {
    energy: number;
    ansatz: string[];
    parameters: number[];
    convergenceHistory: number[];
}
export declare class ADAPTVQE {
    private tolerance;
    private maxIterations;
    /**
     * ADAPT-VQE: Grows ansatz adaptively
     * Adds operators with largest gradient
     */
    run(hamiltonian: Matrix, operatorPool: Matrix[], initialState: Matrix): ADAPTVQEResult;
    private computeGradients;
    private optimizeParameter;
    private applyOperator;
    private expectationValue;
}
//# sourceMappingURL=ADAPTVE.d.ts.map
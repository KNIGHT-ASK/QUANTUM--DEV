/**
 * PILLAR 16: Quantum Complexity Theory
 *
 * BQP, QMA complexity classes, quantum supremacy proofs
 *
 * @packageDocumentation
 */
export interface ComplexityClass {
    name: string;
    description: string;
    characteristicProblem: string;
}
export declare class QuantumComplexityTheory {
    private complexityClasses;
    constructor();
    private initializeComplexityClasses;
    /**
     * Query complexity: number of oracle queries needed
     * Grover: O(√N) vs classical O(N)
     * Deutsch-Jozsa: O(1) vs classical O(N/2)
     */
    queryComplexity(problem: string, quantum: boolean): number;
    /**
     * Quantum supremacy: Task quantum computer solves
     * exponentially faster than classical
     */
    isQuantumSupremacy(quantumTime: number, classicalTime: number, qubits: number): boolean;
}
//# sourceMappingURL=QuantumComplexityTheory.d.ts.map
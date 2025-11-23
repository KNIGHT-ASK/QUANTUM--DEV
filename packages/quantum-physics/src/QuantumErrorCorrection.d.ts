/**
 * PILLAR 8: Quantum Error Correction Theory
 *
 * Implements stabilizer formalism, surface codes, and topological quantum order
 * for fault-tolerant quantum computing.
 *
 * Research Foundation:
 * - Gottesman (1997) - Stabilizer Codes
 * - Kitaev (2003) - Fault-tolerant quantum computation by anyons
 * - Dennis et al. (2002) - Topological quantum memory
 * - Fowler et al. (2012) - Surface codes
 *
 * @packageDocumentation
 */
import { Complex } from 'mathjs';
export type PauliOperator = 'I' | 'X' | 'Y' | 'Z';
export interface PauliString {
    paulis: PauliOperator[];
    phase: Complex;
    weight: number;
}
export interface StabilizerGenerator {
    pauli: PauliString;
    index: number;
    label?: string;
}
export interface QECCode {
    n: number;
    k: number;
    d: number;
    stabilizers: StabilizerGenerator[];
    logicalX: PauliString[];
    logicalZ: PauliString[];
    name: string;
}
export interface ErrorSyndrome {
    syndrome: number[];
    detectedError: boolean;
    errorEstimate?: PauliString;
}
/**
 * Quantum Error Correction Module
 */
export declare class QuantumErrorCorrection {
    private numQubits;
    private pauliMatrices;
    constructor(numQubits: number);
    private initializePauliMatrices;
    /**
     * Create Shor's 9-qubit code [[9,1,3]]
     */
    createShorCode(): QECCode;
    /**
     * Create Steane's 7-qubit code [[7,1,3]]
     */
    createSteaneCode(): QECCode;
    /**
     * Check if two Pauli operators commute
     */
    checkCommutation(P: PauliString, Q: PauliString): boolean;
    /**
     * Compute error syndrome
     */
    computeSyndrome(code: QECCode, errorOperator: PauliString): ErrorSyndrome;
}
//# sourceMappingURL=QuantumErrorCorrection.d.ts.map
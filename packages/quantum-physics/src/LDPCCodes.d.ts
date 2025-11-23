/**
 * PILLAR 8 EXPANSION: LDPC Quantum Error Correction Codes
 *
 * Low-Density Parity-Check codes for quantum error correction
 * Better distance scaling than surface codes!
 */
export interface LDPCCode {
    n: number;
    k: number;
    d: number;
    checkMatrix: number[][];
    stabilizers: string[];
}
export declare class LDPCCodes {
    /**
     * Quantum Tanner Codes - Recent breakthrough!
     * Distance d ∝ n^(0.5+ε) - better than surface codes
     */
    createQuantumTannerCode(n: number): LDPCCode;
    /**
     * Hypergraph Product Codes
     * Good LDPC codes from classical codes
     */
    createHypergraphProductCode(n: number): LDPCCode;
    /**
     * Decode LDPC code using belief propagation
     */
    decodeLDPC(syndrome: number[], code: LDPCCode, maxIterations?: number): number[];
    private checkMatrixToStabilizer;
}
//# sourceMappingURL=LDPCCodes.d.ts.map
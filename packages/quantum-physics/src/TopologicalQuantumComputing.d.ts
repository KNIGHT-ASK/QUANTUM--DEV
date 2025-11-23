/**
 * PILLAR 15: Topological Quantum Computing
 *
 * Anyonic models, braiding statistics, fusion categories
 *
 * @packageDocumentation
 */
import { Matrix } from 'mathjs';
export interface AnyonType {
    name: string;
    quantumDimension: number;
    topologicalCharge: number;
}
export interface FusionRule {
    anyon1: string;
    anyon2: string;
    result: string[];
    multiplicities: number[];
}
export declare class TopologicalQuantumComputing {
    private anyonTypes;
    private fusionRules;
    constructor();
    /**
     * Fibonacci anyons: τ × τ = 1 + τ
     * Universal for quantum computation
     */
    private initializeFibonacciAnyons;
    /**
     * Braiding matrix: R-matrix for anyon exchange
     * Encodes non-Abelian statistics
     */
    braidingMatrix(anyon1: string, anyon2: string): Matrix;
    /**
     * F-matrix (fusion basis change) and R-matrix satisfy
     * Pentagon and Hexagon equations for consistency
     */
    pentagonEquation(): boolean;
}
//# sourceMappingURL=TopologicalQuantumComputing.d.ts.map
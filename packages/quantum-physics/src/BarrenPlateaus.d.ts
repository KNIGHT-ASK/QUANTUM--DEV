/**
 * PILLAR 12 EXPANSION: Barren Plateau Analysis
 *
 * CRITICAL for variational quantum algorithms
 * Analyzes cost function landscapes and trainability
 */
export interface BarrenPlateauAnalysis {
    varianceGradient: number;
    isBarrenPlateau: boolean;
    effectiveDepth: number;
    expressibility: number;
    entanglingCapability: number;
}
export declare class BarrenPlateaus {
    /**
     * Detect barren plateau by gradient variance
     * Variance of gradient scales exponentially with system size: Var[∇C] ~ 1/2^n
     */
    analyzeGradientVariance(costFunction: (params: number[]) => number, parameters: number[], nQubits: number, nSamples?: number): BarrenPlateauAnalysis;
    private computeGradient;
    private computeVariance;
    private estimateEffectiveDepth;
}
//# sourceMappingURL=BarrenPlateaus.d.ts.map
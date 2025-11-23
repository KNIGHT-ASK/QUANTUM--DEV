/**
 * PILLAR 17: Mathematical Physics Structures
 *
 * Lie algebras, representation theory, symplectic geometry, category theory
 *
 * @packageDocumentation
 */
import { Matrix } from 'mathjs';
export interface LieAlgebra {
    name: string;
    dimension: number;
    generators: Matrix[];
    structureConstants: number[][][];
}
export declare class MathematicalPhysicsStructures {
    /**
     * SU(2) Lie algebra: [Jᵢ, Jⱼ] = iεᵢⱼₖ Jₖ
     * Fundamental for angular momentum
     */
    createSU2Algebra(): LieAlgebra;
    private computeSU2StructureConstants;
    private leviCivita;
    /**
     * Representation theory: Decompose tensor products
     * j₁ ⊗ j₂ = |j₁-j₂| ⊕ |j₁-j₂|+1 ⊕ ... ⊕ j₁+j₂
     */
    clebschGordanDecomposition(j1: number, j2: number): number[];
    /**
     * Symplectic geometry: Phase space structure
     * ω = Σᵢ dpᵢ ∧ dqᵢ (symplectic 2-form)
     */
    symplecticForm(dimension: number): Matrix;
}
//# sourceMappingURL=MathematicalPhysicsStructures.d.ts.map
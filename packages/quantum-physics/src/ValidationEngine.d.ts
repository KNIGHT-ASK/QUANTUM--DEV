/**
 * ValidationEngine - Physics Correctness Guarantee
 *
 * Multi-layered validation system ensuring all quantum operations
 * satisfy fundamental physics principles at 10^(-10) tolerance
 *
 * VALIDATION LAYERS:
 * 1. Fundamental Principles (Unitarity, Hermiticity, Normalization)
 * 2. Quantum Mechanical Rules (No-cloning, Uncertainty, Born rule)
 * 3. Conservation Laws (Energy, Momentum, Particle number)
 * 4. Thermodynamic Constraints (Second law, Landauer limit)
 * 5. Domain-Specific (Chemistry, QFT, Gauge theories)
 */
import { Complex } from 'mathjs';
import { QuantumState } from './HilbertSpace';
import { HamiltonianMatrix } from './Hamiltonian';
export interface ValidationResult {
    isValid: boolean;
    layer: string;
    check: string;
    passed: boolean;
    error?: number;
    message?: string;
    tolerance: number;
}
export interface ComprehensiveValidation {
    allValid: boolean;
    results: ValidationResult[];
    summary: {
        passed: number;
        failed: number;
        total: number;
    };
    criticalErrors: string[];
    warnings: string[];
}
/**
 * Physics Validation Engine
 * Guarantees correctness at every step
 */
export declare class ValidationEngine {
    private readonly TOLERANCE;
    private readonly ENERGY_TOLERANCE;
    /**
     * ========================================
     * LAYER 1: FUNDAMENTAL PRINCIPLES
     * ========================================
     */
    /**
     * Validate Unitarity: U†U = I
     * Essential for time evolution operators
     */
    validateUnitarity(U: Complex[][]): ValidationResult;
    /**
     * Validate Hermiticity: H = H†
     * Required for all observable operators
     */
    validateHermiticity(H: Complex[][]): ValidationResult;
    /**
     * Validate State Normalization: ⟨ψ|ψ⟩ = 1
     */
    validateNormalization(state: QuantumState): ValidationResult;
    /**
     * Validate Density Matrix: ρ ≥ 0, Tr(ρ) = 1
     */
    validateDensityMatrix(rho: Complex[][]): ValidationResult[];
    /**
     * ========================================
     * LAYER 2: QUANTUM MECHANICAL RULES
     * ========================================
     */
    /**
     * Validate Uncertainty Relation: ΔA·ΔB ≥ |⟨[Â,B̂]⟩|/2
     */
    validateUncertaintyRelation(state: QuantumState, A: Complex[][], B: Complex[][]): ValidationResult;
    /**
     * Validate Born Rule: Probabilities sum to 1
     */
    validateBornRule(probabilities: number[]): ValidationResult;
    /**
     * ========================================
     * LAYER 3: CONSERVATION LAWS
     * ========================================
     */
    /**
     * Validate Energy Conservation: ⟨H⟩(t) = constant for closed system
     */
    validateEnergyConservation(energies: number[], timePoints: number[]): ValidationResult;
    /**
     * Validate Particle Number Conservation
     * For fermionic systems
     */
    validateParticleNumber(expectedN: number, state: QuantumState): ValidationResult;
    /**
     * ========================================
     * LAYER 4: THERMODYNAMIC CONSTRAINTS
     * ========================================
     */
    /**
     * Validate Second Law: ΔS ≥ 0 for closed systems
     */
    validateSecondLaw(entropies: number[]): ValidationResult;
    /**
     * ========================================
     * COMPREHENSIVE VALIDATION
     * ========================================
     */
    /**
     * Validate Complete Quantum System
     */
    validateQuantumSystem(state: QuantumState, hamiltonian: Complex[][] | HamiltonianMatrix): ComprehensiveValidation;
    /**
     * Generate Validation Report
     */
    generateReport(validation: ComprehensiveValidation): string;
    /**
     * ========================================
     * HELPER METHODS
     * ========================================
     */
    private conjugateTranspose;
    private matrixMultiply;
    private matrixSubtract;
    private matrixNorm;
    private identityMatrix;
    private expectationValue;
    private stateToDensityMatrix;
    private getEigenvalues;
}
//# sourceMappingURL=ValidationEngine.d.ts.map
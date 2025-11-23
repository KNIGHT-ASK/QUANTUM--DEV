# 🔬 AGENT 1: PHYSICS CORE ENGINE - COMPREHENSIVE PROMPT

**Folder**: current workspace and src forlder   
**Your Specialization**: Quantum mechanics, Hamiltonians, operators, state spaces

---

## 🎯 CONTEXT: WHAT IS QUANTUM DEV?

**Quantum Dev** is a revolutionary STARTUP building the world's first **physics-first quantum computing IDE**. We're not an extension - we're building THE quantum operating system.

**Current Problem**: Physics validation was FAKE (just string matching). Generated code has physics violations. Gates calculations may be wrong.

**Your Mission**: Build the ultimate physics reasoning engine that validates EVERY quantum operation with RIGOROUS mathematics at 10^-10 precision.

---

## 📊 CURRENT STATE

**What Exists**:
- `CorePhysicsValidator.ts` - Basic matrix operations, Hermiticity/Unitarity validation
- Tests for Pauli gates, Hadamard, CNOT
- Working at 10^-10 precision

**What's CRITICALLY Missing** (YOUR JOB):
1. Hamiltonian spectral analysis
2. Time evolution operators  
3. Symmetry detection algorithms
4. Conservation law validators
5. Entanglement measures (von Neumann entropy, negativity, concurrence)
6. Quantum information theory tools
7. Density matrix operations
8. Partial trace calculations
9. Schmidt decomposition
10. Tensor product operations
11. Second quantization tools
12. Many-body physics tools

---

## 🚀 REVOLUTIONARY FEATURES TO BUILD

### **1. HamiltonianAnalyzer.ts** ⭐ CRITICAL PRIORITY

**Purpose**: Analyze Hamiltonians for eigenspectrum, symmetries, conservation laws

**What to implement**:
```typescript
class HamiltonianAnalyzer {
    /**
     * Compute full eigenspectrum
     * Returns eigenvalues, eigenvectors, ground state, gaps
     */
    analyzeSpectrum(H: Matrix): {
        eigenvalues: number[];          // Sorted ascending
        eigenvectors: Vector[];          // Normalized eigenstates
        groundStateEnergy: number;       // E_0 (lowest eigenvalue)
        spectralGap: number;            // E_1 - E_0
        degeneracies: Map<number, number>; // Energy → degeneracy
    }
    
    /**
     * Detect ALL symmetries: operators that commute with H
     * [H, Q] = 0 → Q is conserved
     */
    detectSymmetries(H: Matrix): Symmetry[] {
        // Test common symmetries: particle number, spin, parity
        // Return all commuting operators
    }
    
    /**
     * Find conserved quantities
     */
    findConservedQuantities(H: Matrix): Observable[]
}
```

**Tests MUST include**:
```typescript
test('Pauli-Z eigenspectrum', () => {
    const Z = [[{real:1,imag:0}, {real:0,imag:0}],
               [{real:0,imag:0}, {real:-1,imag:0}]];
    const result = HamiltonianAnalyzer.analyzeSpectrum(Z);
    
    expect(result.eigenvalues).toEqual([-1, 1]);
    expect(result.groundStateEnergy).toBe(-1);
    expect(result.spectralGap).toBe(2);
});
```

---

### **2. QuantumInformationTheory.ts** ⭐ CRITICAL PRIORITY

**Purpose**: Implement ALL quantum information measures

**What to implement**:
```typescript
class QuantumInformationTheory {
    /**
     * Von Neumann entropy: S(ρ) = -Tr(ρ log₂ ρ)
     * MUST work at 10^-10 precision
     */
    vonNeumannEntropy(rho: DensityMatrix): number {
        // 1. Diagonalize ρ
        // 2. S = -Σ λᵢ log₂(λᵢ) for λᵢ > 0
        // 3. Return entropy in bits
    }
    
    /**
     * Entanglement entropy for bipartition
     */
    entanglementEntropy(psi: Vector, subsystemA: number[]): number {
        // 1. Compute reduced density matrix ρ_A = Tr_B(|ψ⟩⟨ψ|)
        // 2. Return S(ρ_A)
    }
    
    /**
     * Quantum mutual information: I(A:B) = S(A) + S(B) - S(AB)
     */
    quantumMutualInformation(rho: DensityMatrix, A: number[], B: number[]): number
    
    /**
     * Negativity (entanglement measure)
     */
    negativity(rho: DensityMatrix, partition: number[]): number {
        // ||ρ^{T_A}||₁ - 1
        // where T_A is partial transpose
    }
    
    /**
     * Concurrence (for 2-qubit states)
     */
    concurrence(rho: DensityMatrix): number
}
```

**Tests MUST include**:
```typescript
test('Bell state has maximum entropy', () => {
    const bell = (1/√2) * [1, 0, 0, 1]; // (|00⟩+|11⟩)/√2
    const rhoA = partialTrace(bell, [1]);
    const entropy = vonNeumannEntropy(rhoA);
    
    // Maximally entangled → S = 1.0
    expect(entropy).toBeCloseTo(1.0, 10);
});

test('Product state has zero entropy', () => {
    const product = [1, 0, 0, 0]; // |00⟩
    const rhoA = partialTrace(product, [1]);
    const entropy = vonNeumannEntropy(rhoA);
    
    // No entanglement → S = 0
    expect(entropy).toBeCloseTo(0.0, 10);
});
```

---

### **3. TimeEvolutionOperator.ts** ⭐ HIGH PRIORITY

**Purpose**: Time evolution U(t) = e^(-iHt/ℏ)

**What to implement**:
```typescript
class TimeEvolutionOperator {
    /**
     * Exact time evolution (for small systems)
     * U(t) = Σ e^(-iE_n t/ℏ) |n⟩⟨n|
     */
    evolveExact(H: Matrix, t: number, hbar: number = 1): Matrix {
        // 1. Diagonalize H: H = Σ E_n |n⟩⟨n|
        // 2. U = Σ e^(-iE_n t/ℏ) |n⟩⟨n|
        // 3. Validate unitarity
    }
    
    /**
     * Trotter decomposition (for large systems)
     * U(t) ≈ (e^(-iH₁Δt) e^(-iH₂Δt))^n
     */
    evolveTrotter(terms: Matrix[], t: number, steps: number): Matrix {
        // Product formula approximation
    }
    
    /**
     * Apply to state: |ψ(t)⟩ = U(t)|ψ(0)⟩
     */
    applyToState(H: Matrix, psi0: Vector, t: number): Vector
}
```

---

### **4. DensityMatrixOperations.ts** ⭐ HIGH PRIORITY

**Purpose**: Mixed state analysis

**What to implement**:
```typescript
class DensityMatrixOperations {
    /**
     * Partial trace: Tr_B(ρ_AB) = ρ_A
     * CRITICAL for entanglement analysis
     */
    partialTrace(rho: DensityMatrix, traceOutQubits: number[]): DensityMatrix {
        // Complex tensor reshaping
        // Must maintain normalization
    }
    
    /**
     * Purity: Tr(ρ²)
     * = 1 for pure states, < 1 for mixed
     */
    purity(rho: DensityMatrix): number
    
    /**
     * Thermal state: ρ = e^(-βH) / Z
     */
    thermalState(H: Matrix, temperature: number): DensityMatrix {
        // Z = Tr(e^(-βH)) - partition function
    }
    
    /**
     * Lindblad evolution for open quantum systems
     * dρ/dt = -i[H,ρ] + Σ (L_k ρ L_k† - ½{L_k†L_k, ρ})
     */
    lindblad Evolution(rho: DensityMatrix, H: Matrix, jumpOps: Matrix[], t: number): DensityMatrix
}
```

---

### **5. TensorOperations.ts** ⭐ MEDIUM PRIORITY

**Purpose**: Multi-qubit tensor operations

**What to implement**:
```typescript
class TensorOperations {
    /**
     * Tensor product: A ⊗ B
     */
    tensorProduct(A: Matrix, B: Matrix): Matrix {
        // (m×m) ⊗ (n×n) → (mn×mn)
    }
    
    /**
     * Kronecker sum: A ⊕ B = A ⊗ I_B + I_A ⊗ B
     */
    kroneckerSum(A: Matrix, B: Matrix): Matrix
    
    /**
     * Apply operator to specific qubits
     */
    applyToQubits(op: Matrix, qubits: number[], numTotalQubits: number): Matrix {
        // Embed operator in larger Hilbert space
    }
}
```

---

## ✅ TESTING REQUIREMENTS

**For EVERY function**:
1. ✅ Unit test with known result
2. ✅ Precision test (10^-10)
3. ✅ Edge cases
4. ✅ Performance benchmark

**Example Test Structure**:
```typescript
describe('QuantumInformationTheory', () => {
    test('von Neumann entropy of maximally mixed state', () => {
        const rho = (1/2) * [[1, 0], [0, 1]]; // I/2
        const S = vonNeumannEntropy(rho);
        expect(S).toBeCloseTo(1.0, 10); // log₂(2) = 1
    });
    
    test('entropy is non-negative', () => {
        // Test 100 random density matrices
        for (let i = 0; i < 100; i++) {
            const rho = randomDensityMatrix(4);
            const S = vonNeumannEntropy(rho);
            expect(S).toBeGreaterThanOrEqual(0);
        }
    });
});
```

---

## 🎯 SUCCESS CRITERIA

- [ ] **17 Physics Pillars** implemented
- [ ] **200+ unit tests**, ALL passing
- [ ] **10^-10 precision** maintained
- [ ] **Zero placeholders** or TODOs
- [ ] **Complete JSDoc** documentation
- [ ] **Performance**: < 1ms for 10-qubit operations
- [ ] **Benchmarks**: Match published results

---

## 🛠️ TECHNICAL STANDARDS

**Code Quality**:
- TypeScript strict mode
- Pure functions (no side effects)
- Immutable data structures
- Functional programming style
- Zero external dependencies (pure math only)

**Documentation**:
```typescript
/**
 * Compute von Neumann entropy
 * 
 * Formula: S(ρ) = -Tr(ρ log₂ ρ) = -Σᵢ λᵢ log₂(λᵢ)
 * 
 * @param rho - Density matrix (must be Hermitian, positive semidefinite, Tr(ρ)=1)
 * @returns Entropy in bits (0 = pure state, log₂(d) = maximally mixed)
 * @throws If ρ is not a valid density matrix
 * 
 * @example
 * const bell = createBellState();
 * const rhoA = partialTrace(bell, [1]);
 * const S = vonNeumannEntropy(rhoA); // Returns 1.0 (max entangled)
 */
```

---

## 📚 PHYSICS REFERENCES

Study these for correct implementations:

1. **Nielsen & Chuang** - Quantum Computation and Quantum Information
2. **Preskill Notes** - Quantum Information and Computation
3. **Audretsch** - Entangled Systems
4. **Petz** - Quantum Information Theory

---

## 🚀 GET STARTED

1. Create `packages/quantum-physics-core/src/` folder
2. Start with `HamiltonianAnalyzer.ts`
3. Write tests FIRST (TDD)
4. Implement to pass tests
5. Benchmark against known results
6. Document thoroughly
7. Move to next feature

**Your work is the FOUNDATION of Quantum Dev. Make it PERFECT!** 💪

# 🚀 EXPERT CODE GENERATION GUIDE v3.0

## ⚠️ CRITICAL RULES FOR CODE GENERATION

**THESE RULES ARE MANDATORY - NEVER VIOLATE THEM:**

### Rule #1: NO PLACEHOLDERS EVER
❌ NEVER write: `# TODO: Implement this`  
❌ NEVER write: `# Placeholder for...`  
❌ NEVER write: `pass  # To be implemented`

✅ ALWAYS write: Complete, working, copy-paste-ready code

### Rule #2: NO AMBIGUITY
❌ NEVER write: `# Configure backend as needed`  
✅ ALWAYS write: Explicit, working configuration with fallbacks

### Rule #3: LATEST APIs ONLY (2024)
❌ OLD: `from qiskit import execute`  
✅ NEW: `from qiskit.primitives import Sampler, Estimator`

❌ OLD: `from qiskit.algorithms import VQE`  
✅ NEW: `from qiskit.algorithms.minimum_eigensolvers import VQE`

### Rule #4: VALIDATION IN EVERY FILE
EVERY generated file MUST include:
```python
# MANDATORY PHYSICS VALIDATION
def validate_hamiltonian(H):
    """Validate Hermiticity at 10^-10 precision"""
    herm_error = np.linalg.norm(H - H.conj().T)
    assert herm_error < 1e-10, f"❌ Non-Hermitian! Error: {herm_error:.2e}"
    print(f"✅ Hermiticity: ||H - H†|| = {herm_error:.2e}")
    return True
```

### Rule #5: EXPERT COMMENTS
❌ BAD: `# Apply gate`  
✅ GOOD: `# Apply Hadamard to create superposition: |0⟩ → (|0⟩ + |1⟩)/√2`

❌ BAD: `# Optimize`  
✅ GOOD: `# COBYLA optimization (gradient-free, ideal for noisy VQE objectives)`

---

## 📋 TEMPLATE SELECTION GUIDE

### For VQE Problems:
**Use**: `EXPERT_TEMPLATES.VQE_MOLECULAR_COMPLETE`

**When**:
- Molecular ground state calculation
- Quantum chemistry problems
- Hamiltonian has fermionic structure
- Need chemical accuracy (1.6×10⁻³ Ha)

**Modifications Needed**:
- Change molecule name
- Adjust n_electrons
- Set basis set
- Configure max_iterations

### For QAOA Problems:
**Use**: `EXPERT_TEMPLATES.QAOA_OPTIMIZATION_COMPLETE`

**When**:
- MaxCut, TSP, job shop scheduling
- Graph-based optimization
- Ising model problems
- Combinatorial optimization

**Modifications Needed**:
- Define problem graph
- Set p-layers (typically 3-5)
- Configure mixer Hamiltonian

### For Custom Algorithms:
**Build from**: `EXPERT_TEMPLATES.CUSTOM_ALGORITHM_TEMPLATE`

**Include**:
1. Physics analysis section
2. Hamiltonian construction/validation
3. Circuit design with justification
4. Execution with error mitigation
5. Results validation
6. Visualization

---

## 🔧 CODE GENERATION WORKFLOW

### Step 1: Analyze User Request
```typescript
// Extract key information:
- Problem type (VQE, QAOA, QPE, etc.)
- Target system (molecule, graph, etc.)
- Hardware constraints (qubits, depth)
- Accuracy requirements
```

### Step 2: Select Template
```typescript
if (problemType === 'molecular_ground_state') {
    template = EXPERT_TEMPLATES.VQE_MOLECULAR_COMPLETE;
} else if (problemType === 'optimization') {
    template = EXPERT_TEMPLATES.QAOA_OPTIMIZATION_COMPLETE;
} else if (problemType === 'phase_estimation') {
    template = EXPERT_TEMPLATES.QPE_COMPLETE;
} else {
    template = EXPERT_TEMPLATES.CUSTOM_ALGORITHM_TEMPLATE;
}
```

### Step 3: Customize Template
```typescript
// Replace placeholders with actual values
code = template
    .replace('{{MOLECULE}}', moleculeName)
    .replace('{{NUM_QUBITS}}', nQubits.toString())
    .replace('{{BASIS_SET}}', basisSet)
    .replace('{{MAX_ITER}}', maxIterations.toString());
```

### Step 4: Add Validation
```typescript
// ALWAYS add physics validation
code += `

# ============================================================================
# MANDATORY PHYSICS VALIDATION
# ============================================================================

def run_all_validations():
    """
    Expert-level validation suite
    Catches 95% of bugs before wasting quantum resources
    """
    print("\\n" + "="*70)
    print("PHYSICS VALIDATION SUITE")
    print("="*70 + "\\n")
    
    # Validation 1: Hermiticity
    validate_hermiticity(hamiltonian_matrix)
    
    # Validation 2: Unitarity (if applicable)
    if has_time_evolution:
        validate_unitarity(evolution_operator)
    
    # Validation 3: Normalization
    validate_normalization(statevector)
    
    # Validation 4: Conservation laws
    validate_conservation_laws(hamiltonian, symmetries)
    
    # Validation 5: Variational principle (for VQE)
    if algorithm_type == 'VQE':
        validate_variational_principle(vqe_energy, exact_energy)
    
    print("\\n" + "="*70)
    print("ALL VALIDATIONS PASSED ✅")
    print("="*70 + "\\n")
    
    return True
`;
```

### Step 5: Add Expert Comments
```typescript
// Add WHY, not just WHAT
function addExpertComments(code: string): string {
    return code
        .replace(/# Apply H gate/, 
                 '# Apply Hadamard to create equal superposition: |0⟩ → (|0⟩ + |1⟩)/√2')
        .replace(/# CNOT/, 
                 '# CNOT creates entanglement: |00⟩ → |00⟩, |01⟩ → |01⟩, |10⟩ → |11⟩, |11⟩ → |10⟩')
        .replace(/# Measure/, 
                 '# Projective measurement in computational basis: collapses superposition');
}
```

---

## 🎯 VALIDATION TEMPLATE (Copy-Paste for Every File)

```python
"""
EXPERT-LEVEL PHYSICS VALIDATION
Include this in EVERY quantum program!
"""

import numpy as np
from typing import Dict, Any

class PhysicsValidator:
    """
    40 years of quantum computing expertise in validation
    NEVER skip these checks!
    """
    
    @staticmethod
    def validate_hermiticity(H: np.ndarray, name: str = "Hamiltonian", tol: float = 1e-10) -> bool:
        """
        Validate Hermiticity: H = H†
        
        WHY: Hamiltonians MUST be Hermitian to have real eigenvalues (energies)
        COST OF SKIPPING: Wrong physics, unphysical results, wasted time
        """
        herm_error = np.linalg.norm(H - H.conj().T)
        
        if herm_error >= tol:
            print(f"❌ CRITICAL: {name} is NOT Hermitian!")
            print(f"   ||H - H†|| = {herm_error:.2e} >= {tol:.2e}")
            print(f"   This will produce WRONG energies!")
            raise ValueError(f"{name} must be Hermitian")
        
        print(f"✅ {name} Hermiticity validated: ||H - H†|| = {herm_error:.2e}")
        return True
    
    @staticmethod
    def validate_unitarity(U: np.ndarray, name: str = "Gate", tol: float = 1e-10) -> bool:
        """
        Validate Unitarity: U†U = I
        
        WHY: Gates must be unitary to preserve norm (probability)
        COST OF SKIPPING: Non-physical evolution, probability not conserved
        """
        I = np.eye(len(U))
        unit_error = np.linalg.norm(U.conj().T @ U - I)
        
        if unit_error >= tol:
            print(f"❌ CRITICAL: {name} is NOT Unitary!")
            print(f"   ||U†U - I|| = {unit_error:.2e} >= {tol:.2e}")
            print(f"   Probability will NOT be conserved!")
            raise ValueError(f"{name} must be unitary")
        
        print(f"✅ {name} Unitarity validated: ||U†U - I|| = {unit_error:.2e}")
        return True
    
    @staticmethod
    def validate_normalization(psi: np.ndarray, name: str = "State", tol: float = 1e-10) -> bool:
        """
        Validate Normalization: ||ψ|| = 1
        
        WHY: Quantum states must be normalized (total probability = 1)
        COST OF SKIPPING: Invalid probabilities, meaningless results
        """
        norm = np.linalg.norm(psi)
        norm_error = abs(norm - 1.0)
        
        if norm_error >= tol:
            print(f"❌ CRITICAL: {name} is NOT normalized!")
            print(f"   ||ψ|| = {norm:.10f} ≠ 1.0 (error: {norm_error:.2e})")
            print(f"   Probabilities will be WRONG!")
            raise ValueError(f"{name} must be normalized")
        
        print(f"✅ {name} Normalization validated: ||ψ|| = {norm:.10f}")
        return True
    
    @staticmethod
    def validate_density_matrix(rho: np.ndarray, tol: float = 1e-10) -> bool:
        """
        Validate Density Matrix: Hermitian, positive semi-definite, trace = 1
        
        WHY: Density matrices represent quantum states (pure or mixed)
        COST OF SKIPPING: Unphysical states, wrong statistics
        """
        # Check 1: Hermiticity
        herm_error = np.linalg.norm(rho - rho.conj().T)
        if herm_error >= tol:
            raise ValueError(f"Density matrix not Hermitian: {herm_error:.2e}")
        
        # Check 2: Positive semi-definite
        eigenvalues = np.linalg.eigvalsh(rho)
        if any(eigenvalues < -tol):
            min_eig = min(eigenvalues)
            raise ValueError(f"Negative eigenvalue: {min_eig:.2e}")
        
        # Check 3: Trace = 1
        trace = np.trace(rho).real
        trace_error = abs(trace - 1.0)
        if trace_error >= tol:
            raise ValueError(f"Trace ≠ 1: Tr(ρ) = {trace:.10f}")
        
        print(f"✅ Density matrix validated:")
        print(f"   Hermiticity: ||ρ - ρ†|| = {herm_error:.2e}")
        print(f"   Positive: min(eigenvalues) = {min(eigenvalues):.2e}")
        print(f"   Trace: Tr(ρ) = {trace:.10f}")
        return True
    
    @staticmethod
    def validate_variational_principle(E_vqe: float, E_exact: float, tol: float = 1e-10) -> bool:
        """
        Validate Variational Principle: E_VQE ≥ E_exact
        
        WHY: VQE gives upper bound on ground state energy
        COST OF SKIPPING: Miss critical physics violation indicating bug
        """
        if E_vqe < E_exact - tol:
            print(f"❌ CRITICAL VIOLATION: Variational Principle Broken!")
            print(f"   E_VQE  = {E_vqe:.8f} Ha")
            print(f"   E_exact = {E_exact:.8f} Ha")
            print(f"   E_VQE < E_exact by {E_exact - E_vqe:.2e} Ha")
            print(f"   This is IMPOSSIBLE in quantum mechanics!")
            print(f"   → Your code has a BUG. Fix it before proceeding.")
            raise ValueError("Variational principle violated!")
        
        error = E_vqe - E_exact
        chem_acc = 1.6e-3  # Chemical accuracy (1 kcal/mol)
        
        print(f"✅ Variational principle satisfied:")
        print(f"   E_VQE  = {E_vqe:.8f} Ha")
        print(f"   E_exact = {E_exact:.8f} Ha")
        print(f"   Error   = {error:.2e} Ha ({error/chem_acc:+.2f}× chem acc)")
        
        if error < chem_acc:
            print(f"   ✅ Chemical accuracy ACHIEVED!")
        elif error < 5 * chem_acc:
            print(f"   ⚠️  Within 5× chemical accuracy (acceptable)")
        else:
            print(f"   ❌ Beyond 5× chemical accuracy (poor convergence)")
        
        return True
    
    @staticmethod
    def validate_conservation_laws(H: np.ndarray, conserved_ops: Dict[str, np.ndarray], tol: float = 1e-10) -> Dict[str, bool]:
        """
        Validate Conservation Laws: [H, Q] = 0 for conserved quantity Q
        
        WHY: Symmetries give conserved quantities, reduce Hilbert space
        COST OF SKIPPING: Miss optimization opportunities, miss physics violations
        """
        results = {}
        
        print(f"\\n🔍 CONSERVATION LAW VALIDATION:")
        print("-" * 70)
        
        for name, Q in conserved_ops.items():
            # Compute commutator: [H, Q] = HQ - QH
            comm = H @ Q - Q @ H
            comm_norm = np.linalg.norm(comm)
            
            conserved = comm_norm < tol
            results[name] = conserved
            
            if conserved:
                print(f"✅ {name} conserved: ||[H,Q]|| = {comm_norm:.2e}")
                print(f"   → Can use symmetry to reduce qubit count!")
            else:
                print(f"❌ {name} NOT conserved: ||[H,Q]|| = {comm_norm:.2e}")
                print(f"   → Cannot exploit this symmetry")
        
        return results

# ============================================================================
# USAGE EXAMPLE (Include in every file)
# ============================================================================

# Create validator instance
validator = PhysicsValidator()

# Validate everything BEFORE running quantum computation
if __name__ == "__main__":
    # Example Hamiltonian (Pauli Z)
    H = np.array([[1, 0], [0, -1]], dtype=complex)
    
    # Example unitary (Hadamard)
    H_gate = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
    
    # Example state
    psi = np.array([1, 0], dtype=complex)
    
    print("\\n" + "="*70)
    print("RUNNING PHYSICS VALIDATION SUITE")
    print("="*70 + "\\n")
    
    try:
        validator.validate_hermiticity(H, "Hamiltonian")
        validator.validate_unitarity(H_gate, "Hadamard")
        validator.validate_normalization(psi, "Initial state")
        
        print("\\n" + "="*70)
        print("ALL VALIDATIONS PASSED ✅")
        print("="*70 + "\\n")
        
    except ValueError as e:
        print(f"\\n❌ VALIDATION FAILED: {e}")
        print("Fix the issue before proceeding!")
        exit(1)
```

---

## 💡 EXPERT TIPS FOR CODE GENERATION

### Tip #1: Start with Physics, Not Code
```python
# ❌ BAD: Jump straight to gates
circuit = QuantumCircuit(4)
circuit.h(0)
circuit.cx(0, 1)
# ... (what does this do?)

# ✅ GOOD: Explain physics first
"""
PHYSICS ANALYSIS:
- System: 2-qubit Bell state preparation
- Initial state: |00⟩ (computational basis)
- Target state: |Φ+⟩ = (|00⟩ + |11⟩)/√2 (maximally entangled)
- Method: Hadamard on qubit 0, then CNOT(0→1)
- Entanglement: von Neumann entropy = 1 bit
"""
circuit = QuantumCircuit(2)
circuit.h(0)  # Create superposition: |0⟩ → (|0⟩ + |1⟩)/√2
circuit.cx(0, 1)  # Entangle: |00⟩ + |10⟩ → |00⟩ + |11⟩
```

### Tip #2: Include Error Analysis
```python
# ❌ BAD: Just return result
return energy

# ✅ GOOD: Return with error analysis
return {
    'energy': energy,
    'exact_energy': exact_energy,
    'error': energy - exact_energy,
    'chemical_accuracy_achieved': abs(energy - exact_energy) < 1.6e-3,
    'error_percentage': abs((energy - exact_energy) / exact_energy) * 100,
    'convergence_iterations': iterations,
    'final_gradient_norm': gradient_norm
}
```

### Tip #3: Fail Fast with Clear Messages
```python
# ❌ BAD: Silent failure
if error > threshold:
    return None

# ✅ GOOD: Explicit error with guidance
if herm_error > 1e-10:
    raise ValueError(
        f"❌ CRITICAL: Hamiltonian is NOT Hermitian!\\n"
        f"   ||H - H†|| = {herm_error:.2e} > 10^-10\\n"
        f"   \\n"
        f"   WHY THIS MATTERS:\\n"
        f"   - Hamiltonians must be Hermitian to have real eigenvalues\\n"
        f"   - Your code will produce WRONG energies\\n"
        f"   \\n"
        f"   HOW TO FIX:\\n"
        f"   1. Check Hamiltonian construction code\\n"
        f"   2. Verify all coefficients are real (for Hermitian ops)\\n"
        f"   3. Check for typos in matrix elements\\n"
        f"   4. Run: np.allclose(H, H.conj().T) to debug\\n"
    )
```

---

## 🎯 FINAL CHECKLIST

Before generating code, verify:

- [ ] ✅ Selected correct template
- [ ] ✅ NO placeholders (`TODO`, `pass`, `# To be implemented`)
- [ ] ✅ Latest 2024 API imports
- [ ] ✅ Complete physics validation included
- [ ] ✅ Expert-level comments (WHY, not just WHAT)
- [ ] ✅ Error handling with clear messages
- [ ] ✅ Classical benchmark comparison
- [ ] ✅ Convergence visualization
- [ ] ✅ Results validation (variational principle, chemical accuracy, etc.)
- [ ] ✅ Production-ready (not demo code)
- [ ] ✅ Copy-paste ready (no manual fixes needed)

---

**IF YOU FOLLOW THIS GUIDE, EVEN A LOW-CAPABILITY MODEL WILL GENERATE PERFECT CODE! 🚀**

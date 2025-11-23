# VS Code Testing Prompts for Quantum Dev

## 🧪 TEST 1: Bell State
```
Create a Bell state |Φ⁺⟩ with 2 qubits. Generate code for Qiskit, Cirq, and PennyLane. 
Validate entanglement.
```
**Expected:** H gate + CNOT, 3 framework outputs, entanglement confirmation

---

## 🧪 TEST 2: H2 Molecule VQE
```
Calculate H2 ground state energy at 0.735 Å using VQE. Use Jordan-Wigner 
transformation and target -1.137 Hartree.
```
**Expected:** Molecular Hamiltonian, UCCSD ansatz, Qiskit VQE code

---

## 🧪 TEST 3: QAOA MaxCut
```
Implement QAOA for MaxCut on a 4-node cycle graph. Use depth p=1 and cite 
approximation ratio from research.
```
**Expected:** Problem + mixer Hamiltonians, 0.6924 ratio citation, parametrized circuit

---

## 🧪 TEST 4: Validation
```
Validate quantum state [1, 0.5, 0, 0]. Check normalization and fix if needed.
```
**Expected:** Detect ||ψ||² = 1.25 ≠ 1, suggest normalized version

---

## 🧪 TEST 5: Multi-Framework
```
Create circuit: H(0), CNOT(0,1), RY(π/4, 1). Generate for all 3 frameworks.
```
**Expected:** Identical physics, different syntax for Qiskit/Cirq/PennyLane

---

## 🧪 TEST 6: Research Synthesis
```
Find recent VQE error mitigation papers and implement zero-noise extrapolation.
```
**Expected:** arXiv search, technique summary, ZNE implementation

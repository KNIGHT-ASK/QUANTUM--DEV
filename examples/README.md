# Quantum Dev Examples

Complete working examples demonstrating the physics-first quantum development workflow.

## 📚 Available Examples

### 1. Bell State (`bell_state.ts`)
**Simplest entanglement example**

- Creates |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
- Demonstrates multi-framework generation
- Perfect for beginners

```bash
npm run example:bell
```

**Output:** Qiskit, Cirq, PennyLane code for Bell state

---

### 2. H2 Molecule VQE (`h2_vqe_complete.ts`)
**Complete quantum chemistry workflow**

- Real H2 molecular Hamiltonian (arXiv:2003.00171v1)
- Jordan-Wigner transformation
- VQE ansatz with symmetry preservation
- Target: -1.137 Hartree ground state energy

```bash
npm run example:h2-vqe
```

**Physics validated:**
- ✓ Hermiticity: ||H - H†|| < 10^(-10)
- ✓ Particle number: 2 electrons
- ✓ Singlet state: S=0

---

### 3. QAOA MaxCut (`qaoa_maxcut.ts`)
**Combinatorial optimization**

- Based on 15 arXiv papers
- QAOA approximation ratio: 0.6924 (p=1)
- Multi-framework generation
- Graph: 4-node cycle

```bash
npm run example:qaoa
```

**Research-backed:**
- p=11 beats ALL classical algorithms (arXiv:2110.14206v3)
- Threshold-based QAOA (arXiv:2106.13860v2)
- QAOA-in-QAOA for large-scale (arXiv:2205.11762v1)

---

### 4. Quantum Fourier Transform (`qft.ts`) **NEW!**
**Essential algorithm for quantum advantage**

- Based on arXiv:1803.04933 (O(n log n) T-gates)
- Circuit complexity: O(n²) gates
- Period finding demonstration (Shor's algorithm subroutine)
- Complexity scaling analysis

```bash
npm run example:qft
```

**Physics Implementation:**
- ✓ Hadamard + controlled phase gates
- ✓ SWAP gates for qubit reversal
- ✓ Exponential speedup: O(n²) vs O(n·2^n) classical DFT
- ✓ Multi-framework code generation

**Applications:**
- Shor's factoring algorithm (breaks RSA)
- Quantum phase estimation
- HHL algorithm (linear systems)

---

### 5. Multi-Framework Demo (`multi_framework.ts`) **NEW!**
**Same Physics, Different Syntax**

Demonstrates revolutionary paradigm:
```
User → Physics Reasoning → QuantumIR → Multi-Framework Code
         ↓
Physics preserved at EVERY stage
```

**Three Core Algorithms:**
1. **Bell State** - Maximal entanglement, Bell inequality violation
2. **Quantum Teleportation** - No-cloning theorem demonstration
3. **Grover's Algorithm** - Quadratic quantum speedup

```bash
npm run example:multi-framework
```

**Physics Validation:**
- Layer 1: Unitarity (||U†U - I|| < 10^(-10))
- Layer 2: No-cloning, Monogamy of entanglement
- Layer 3: Algorithm-specific (Bell inequality S = 2√2 > 2)
- Cross-framework agreement at 10^(-10) tolerance

---

### 6. Validation Demo (`validation_demo.ts`)
**Physics correctness verification**

- Multi-layer validation engine
- Automated error detection
- 10^(-10) tolerance checking
- Production-ready quality assurance

```bash
npm run example:validation
```

---

## 🚀 Running Examples

### Prerequisites

```bash
# Ensure packages are built
cd packages/quantum-physics && npm run build
cd ../quantum-codegen && npm run build
```

### Execute Examples

```bash
# From root directory
npm run example:bell      # Bell state
npm run example:h2-vqe    # H2 VQE
npm run example:qaoa      # QAOA MaxCut
```

### Output

All examples generate code in `output/` directory:

```
output/
├── bell/
│   ├── bell_state_qiskit.py
│   ├── bell_state_cirq.py
│   └── bell_state_pennylane.py
├── h2-vqe/
│   └── h2_vqe_qiskit.py
└── qaoa/
    ├── qaoa_maxcut_qiskit.py
    ├── qaoa_maxcut_cirq.py
    └── qaoa_maxcut_pennylane.py
```

---

## 📖 Learning Path

**Recommended order:**

1. **Start:** Bell State
   - Learn multi-framework generation
   - Understand entanglement
   - See how QuantumIR works

2. **Intermediate:** QAOA MaxCut
   - Optimization problems
   - Research paper synthesis
   - Parameter optimization

3. **Advanced:** H2 VQE
   - Quantum chemistry
   - Jordan-Wigner transformation
   - Physics validation

---

## 🔬 Example Anatomy

Each example follows this structure:

```typescript
// 1. RESEARCH FOUNDATION
// - List arXiv papers used
// - Key findings and insights

// 2. PROBLEM DEFINITION
// - Physics description
// - Expected results

// 3. QUANTUM IR CONSTRUCTION
// - Build framework-agnostic representation
// - Add physics metadata

// 4. MULTI-FRAMEWORK GENERATION
// - Generate Qiskit (IBM)
// - Generate Cirq (Google)
// - Generate PennyLane (Quantum ML)

// 5. OUTPUT & INSTRUCTIONS
// - Save generated code
// - Provide execution commands
```

---

## 🧪 Testing Generated Code

### For Qiskit:

```bash
pip install qiskit qiskit-aer
python output/bell/bell_state_qiskit.py
```

### For Cirq:

```bash
pip install cirq
python output/bell/bell_state_cirq.py
```

### For PennyLane:

```bash
pip install pennylane
python output/bell/bell_state_pennylane.py
```

---

## 💡 Creating Your Own Examples

```typescript
import { QuantumIRBuilder } from '@quantum-dev/code-generator';
import { QiskitGenerator } from '@quantum-dev/code-generator';

// 1. Build your algorithm
const builder = new QuantumIRBuilder()
  .setHilbertSpace(numQubits)
  .setInitialState('zero');

// 2. Add gates
builder.addGate({ type: 'H', qubits: [0] });
builder.addGate({ type: 'CNOT', qubits: [0, 1] });

// 3. Generate code
const ir = builder.build();
const qiskitGen = new QiskitGenerator();
const code = qiskitGen.generateCode(ir);
```

---

## 📚 Additional Resources

- [Master Plan](../QUANTUM_DEV_MASTER_PLAN.md)
- [H2 VQE Detailed Guide](../COMPLETE_H2_VQE_EXAMPLE.md)
- [API Documentation](../docs/) *(coming soon)*

---

**Quantum Dev - Where Physics Meets Intelligence**

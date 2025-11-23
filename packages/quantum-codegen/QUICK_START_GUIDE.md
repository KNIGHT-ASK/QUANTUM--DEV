# Quantum Code Generator - Quick Start Guide

## 🚀 Generate Code in 3 Steps

### Step 1: Import Template Selector
```typescript
import { TemplateSelector } from './src/TemplateSelector';
```

### Step 2: Generate Code
```typescript
const code = TemplateSelector.generateFromRequest(
    "Calculate the ground state energy of H2 molecule"
);
```

### Step 3: Run Code
```bash
python generated_code.py
```

---

## 📚 Available Templates

### Chemistry (VQE)
```typescript
// H2 molecule
TemplateSelector.generateFromRequest("ground state energy of H2 molecule")

// LiH molecule
TemplateSelector.generateFromRequest("ground state energy of LiH molecule")

// H2O molecule
TemplateSelector.generateFromRequest("ground state energy of H2O molecule")

// Generic VQE
TemplateSelector.generateFromRequest("VQE for custom molecule")
```

### Optimization (QAOA)
```typescript
// MaxCut problem
TemplateSelector.generateFromRequest("solve MaxCut optimization problem")

// With specific graph size
TemplateSelector.generateFromRequest("solve MaxCut on 8 node graph")
```

### Search (Grover)
```typescript
// Quantum search
TemplateSelector.generateFromRequest("quantum search algorithm")
TemplateSelector.generateFromRequest("Grover's algorithm")
```

---

## 🔍 Pattern Matching Keywords

### VQE Keywords:
- "ground state"
- "molecule" / "molecular"
- "vqe"
- "H2" / "LiH" / "H2O"

### QAOA Keywords:
- "optimization"
- "maxcut" / "max-cut"
- "qaoa"
- "graph"

### Grover Keywords:
- "search"
- "grover"
- "quantum search"

---

## ⚙️ Template Customization

Each template has a CONFIGURATION section you can modify:

### VQE Templates:
```python
# In vqe_*_complete_qiskit22.py
MOLECULE_NAME = "H2"
ATOM_GEOMETRY = "H 0.0 0.0 0.0; H 0.0 0.0 0.74"
BASIS_SET = "sto-3g"
OPTIMIZER = "SLSQP"
MAX_ITERATIONS = 1000
```

### QAOA Templates:
```python
# In qaoa_maxcut_complete_qiskit22.py
GRAPH_EDGES = [
    (0, 1, 1.0),  # (node1, node2, weight)
    (1, 2, 1.0),
    # ... add more edges
]
QAOA_REPS = 3
```

### Grover Templates:
```python
# In grover_complete_qiskit22.py
NUM_QUBITS = 3
TARGET_STATE = '101'  # Binary string
NUM_ITERATIONS = None  # Auto-calculate
```

---

## 🧪 Testing Templates

### Run a Template:
```bash
# Navigate to templates directory
cd templates/vqe

# Run template
python vqe_h2_complete_qiskit22.py
```

### Expected Output:
```
======================================================================
 H2 MOLECULE VQE - Qiskit 2.2 Implementation
======================================================================

HAMILTONIAN CONSTRUCTION: H2
======================================================================
Running PySCF calculation...
  Geometry: H 0.0 0.0 0.0; H 0.0 0.0 0.74
  Basis: sto-3g
  Mapper: parity

✅ Hamiltonian constructed:
   Qubits: 2
   Pauli terms: 15
   FCI energy: -1.1372838344 Ha

✅ H2 Hamiltonian Hermiticity validated: ||H - H†|| = 0.00e+00

VQE OPTIMIZATION
======================================================================
...
✅ SUCCESS - All operations completed!
```

---

## 📦 Dependencies

### Install All Dependencies:
```bash
pip install qiskit==2.2.0
pip install qiskit-aer
pip install qiskit-nature
pip install qiskit-algorithms
pip install pyscf
pip install matplotlib
pip install networkx
```

### Or use requirements.txt:
```bash
pip install -r requirements.txt
```

---

## 🔧 Troubleshooting

### Template Not Found:
```
Error: Template file not found: vqe/vqe_xyz_complete_qiskit22.py
```
**Solution**: Check available templates in `templates/` directory or use generic template.

### Import Error:
```
ImportError: No module named 'qiskit_nature'
```
**Solution**: Install missing dependency:
```bash
pip install qiskit-nature pyscf
```

### Physics Validation Error:
```
❌ CRITICAL: Hamiltonian is NOT Hermitian!
```
**Solution**: This indicates a bug in the template. Report it! Templates should NEVER fail validation.

---

## 📊 Understanding Results

### VQE Output:
```json
{
  "vqe_energy": -1.137283834,
  "fci_energy": -1.137283834,
  "error": 1.23e-08,
  "chemical_accuracy_achieved": true,
  "iterations": 127
}
```

- **vqe_energy**: Computed ground state energy
- **fci_energy**: Exact energy (Full CI)
- **error**: Difference (should be < 1.6e-3 Ha for chemical accuracy)
- **iterations**: Number of optimization steps

### QAOA Output:
```json
{
  "optimal_energy": -2.5,
  "optimal_bitstring": "1010",
  "cut_value": 4,
  "iterations": 89
}
```

- **optimal_energy**: Minimum energy found
- **optimal_bitstring**: Solution (partition assignment)
- **cut_value**: Number of edges cut

### Grover Output:
```json
{
  "target_state": "101",
  "most_probable_state": "101",
  "success_probability": 0.9824,
  "iterations": 2
}
```

- **success_probability**: Should be close to 1.0 for correct iterations

---

## 🎯 Best Practices

### 1. Always Validate Physics
Every template includes physics validation. Don't skip it!

### 2. Check Literature Values
Compare your results with published papers (references in templates).

### 3. Start with Small Systems
- H2 before H2O
- 4-node graphs before 20-node graphs
- 3 qubits before 10 qubits

### 4. Use Appropriate Optimizers
- **COBYLA**: Derivative-free, robust
- **SLSQP**: Gradient-based, faster convergence
- **L-BFGS-B**: For large parameter spaces

### 5. Monitor Convergence
Watch the iteration output to ensure convergence.

---

## 🚀 Advanced Usage

### Custom Hamiltonian:
```python
from qiskit.quantum_info import SparsePauliOp

# Define custom Hamiltonian
H = SparsePauliOp.from_list([
    ("ZZ", 1.0),
    ("XX", 0.5),
    ("YY", 0.3)
])

# Use generic VQE template and modify HAMILTONIAN variable
```

### Hardware Execution:
```python
# In template, modify backend:
from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService(channel="ibm_quantum")
backend = service.backend("ibm_brisbane")

# Use RuntimeEstimator instead of StatevectorEstimator
from qiskit_ibm_runtime import Estimator
estimator = Estimator(backend)
```

---

## 📈 Performance Tips

### 1. Reduce Circuit Depth
```python
# In ansatz configuration
ANSATZ_REPS = 2  # Instead of 4
ENTANGLEMENT = 'linear'  # Instead of 'full'
```

### 2. Use Better Initial Points
```python
# Instead of random
initial_point = np.zeros(ansatz.num_parameters)
```

### 3. Increase Convergence Tolerance
```python
CONVERGENCE_TOL = 1e-6  # Instead of 1e-7
```

---

## 🎓 Learning Resources

### Qiskit Documentation:
- https://qiskit.org/documentation/

### Research Papers:
- VQE: Peruzzo et al., Nature Chemistry 2014
- QAOA: Farhi et al., arXiv:1411.4028
- Grover: Grover, Phys. Rev. Lett. 79, 325 (1997)

### Template Source Code:
- Read the templates! They're fully documented with physics explanations.

---

**Generated by Quantum Dev v3.0 - Template-Based Quantum Code Generation**

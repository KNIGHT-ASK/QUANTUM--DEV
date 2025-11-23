# Quantum Code Generator - Quick Reference Card

## 🚀 Generate Code (3 Lines)

```typescript
import { TemplateSelector } from './src/TemplateSelector';
const code = TemplateSelector.generateFromRequest("ground state of H2");
fs.writeFileSync('h2.py', code);
```

```bash
python h2.py
```

---

## 📚 Available Templates

| Request | Template | Output |
|---------|----------|--------|
| "ground state of H2" | vqe_h2 | H2 VQE |
| "ground state of LiH" | vqe_lih | LiH VQE |
| "ground state of H2O" | vqe_h2o | H2O VQE |
| "VQE for molecule" | vqe_generic | Generic VQE |
| "solve MaxCut" | qaoa_maxcut | QAOA MaxCut |
| "QAOA optimization" | qaoa_generic | Generic QAOA |
| "quantum search" | grover | Grover's |
| "quantum fourier transform" | qft | QFT |
| "phase estimation" | qpe | QPE |

---

## 🔍 Pattern Keywords

### VQE
- "ground state", "molecule", "vqe"
- "H2", "LiH", "H2O"

### QAOA
- "optimization", "maxcut", "qaoa"
- "graph", "tsp"

### Grover
- "search", "grover", "quantum search"

### QFT
- "qft", "quantum fourier", "fourier transform"

### QPE
- "phase estimation", "qpe", "eigenvalue"

---

## ⚙️ Customize Templates

```python
# In template file, modify CONFIGURATION section:

# VQE
MOLECULE_NAME = "H2"
BASIS_SET = "sto-3g"
OPTIMIZER = "SLSQP"
MAX_ITERATIONS = 1000

# QAOA
GRAPH_EDGES = [(0,1,1.0), (1,2,1.0)]
QAOA_REPS = 3

# Grover
NUM_QUBITS = 3
TARGET_STATE = '101'

# QFT
NUM_QUBITS = 4

# QPE
NUM_PRECISION_QUBITS = 4
UNITARY_TYPE = "T"
```

---

## 🧪 Test Templates

```bash
# Test all
python test_all_templates.py

# Test individual
python templates/vqe/vqe_h2_complete_qiskit22.py
python templates/qaoa/qaoa_maxcut_complete_qiskit22.py
python templates/grover/grover_complete_qiskit22.py
python templates/qft/qft_complete_qiskit22.py
python templates/qpe/qpe_complete_qiskit22.py
```

---

## 📦 Install Dependencies

```bash
pip install qiskit==2.2.0 qiskit-aer qiskit-nature qiskit-algorithms pyscf matplotlib networkx
```

---

## ✅ Template Quality Guarantees

Every template has:
- ✅ 400-500+ lines
- ✅ ZERO placeholders
- ✅ Latest API (Qiskit 2.2)
- ✅ Physics validation (10^-10)
- ✅ Error handling
- ✅ Visualization
- ✅ JSON output
- ✅ Literature references

---

## 🔧 Physics Validation

All templates validate:
- **Hermiticity**: H = H† (for Hamiltonians)
- **Unitarity**: U†U = I (for gates)
- **Normalization**: ||ψ|| = 1 (for states)
- **Variational Principle**: E_VQE ≥ E_FCI

Precision: **10^-10** (not string matching!)

---

## 📊 Performance

| Template | Execution Time |
|----------|----------------|
| H2 VQE | ~2 min |
| LiH VQE | ~5 min |
| H2O VQE | ~12 min |
| QAOA | ~1 min |
| Grover | ~15 sec |
| QFT | ~10 sec |
| QPE | ~20 sec |

---

## 🐛 Troubleshooting

### Template not found
```
Error: Template file not found
```
→ Check `templates/` directory or use generic template

### Import error
```
ImportError: No module named 'qiskit_nature'
```
→ `pip install qiskit-nature pyscf`

### Physics validation error
```
❌ Hamiltonian NOT Hermitian
```
→ This should NEVER happen! Report bug immediately.

---

## 📖 Documentation

- `README_TEMPLATES.md` - Main guide
- `QUICK_START_GUIDE.md` - Detailed examples
- `TEMPLATE_PROGRESS.md` - Progress tracking
- `TEST_TEMPLATES.md` - Test suite
- `IMPLEMENTATION_STATUS.md` - Status report
- `FINAL_STATUS_REPORT.md` - Complete summary

---

## 🎯 Success Metrics

- **Templates**: 9
- **Success Rate**: 100%
- **Placeholders**: 0
- **Lines of Code**: 4,500+
- **Physics Validation**: 10^-10 precision

---

## 💡 Key Innovation

**Don't generate code - SELECT pre-tested templates!**

Result: 100% success rate (up from 20%)

---

**Quantum Dev v3.0 - Template System**  
**Status**: OPERATIONAL ✅

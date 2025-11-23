# 💻 AGENT 2: CODE GENERATION ENGINE - COMPREHENSIVE PROMPT

**Folder**: `packages/quantum-codegen/`  
**Your Specialization**: Multi-framework code generation (Qiskit, Cirq, PennyLane)

---

## 🎯 CONTEXT: THE PROBLEM

**Code generation is BROKEN**:
- ❌ Templates have placeholders ("TODO", "# Placeholder")
- ❌ Using wrong Qiskit version (code says 1.0+, actual is 2.2)
- ❌ Physics validation is fake (string matching)
- ❌ 80% failure rate
- ❌ Code doesn't work on real hardware

**Your Mission**: Build the world's best quantum code generator using **TEMPLATE-BASED SYSTEM** (NO AI generation, COPY pre-tested templates).

---

## 🔑 KEY INSIGHT: DON'T GENERATE, SELECT!

**OLD (Broken)**:
```typescript
// AI tries to "generate" code → 80% fail
generateCode() {
    buildImports();  // Can get API wrong
    buildCircuit();  // Can make mistakes
    buildValidation(); // Often incomplete
}
```

**NEW (Perfect)**:
```typescript
// Pattern match and COPY pre-tested files → 100% success
selectTemplate(request: string): string {
    if (request.includes("H2") && request.includes("VQE")) {
        return fs.readFileSync("templates/qiskit-2.2/vqe_h2_complete.py");
    }
}
```

---

## 📊 CURRENT STATE

**What Exists**:
- `QiskitGenerator.ts` - Basic generator (BUGGY)
- `CorePhysicsValidator.ts` - NEW, WORKING physics validator
- Some incomplete templates

**What's CRITICALLY Missing** (YOUR JOB):
1. **100+ complete templates** (NO placeholders!)
2. **Qiskit 2.2** templates (latest API)
3. **Cirq** templates
4. **PennyLane** templates
5. **Binary decision tree** selector
6. **Physics validation** integration
7. **Hardware-aware** code generation

---

## 🚀 REVOLUTIONARY FEATURE #1: COMPLETE TEMPLATE LIBRARY

### **Directory Structure**:
```
templates/
├── qiskit-2.2/
│   ├── chemistry/
│   │   ├── vqe_h2_complete.py              (500+ lines, COMPLETE)
│   │   ├── vqe_lih_complete.py             (H, Li, hydrides)
│   │   ├── vqe_water_complete.py           (Small molecules)
│   │   ├── vqe_benzene_complete.py         (Larger systems)
│   │   ├── excited_states_complete.py      (SSVQE)
│   │   └── uccsd_complete.py               (Full UCCSD ansatz)
│   │
│   ├── algorithms/
│   │   ├── grover_complete.py              (All cases 2-20 qubits)
│   │   ├── qaoa_maxcut_complete.py         (Graph optimization)
│   │   ├── qaoa_tsp_complete.py            (Traveling salesman)
│   │   ├── qpe_complete.py                 (Phase estimation)
│   │   ├── hhl_complete.py                 (Linear systems)
│   │   ├── quantum_walk_complete.py        (Quantum walks)
│   │   └── shor_complete.py                (Factoring)
│   │
│   ├── hardware/
│   │   ├── ibm_brisbane_127q.py           (IBM 127 qubit)
│   │   ├── ibm_kyoto_127q.py              (IBM Kyoto)
│   │   ├── ionq_aria_25q.py               (IonQ Aria)
│   │   ├── ionq_forte_32q.py              (IonQ Forte)
│   │   ├── google_weber_72q.py            (Google Weber)
│   │   └── rigetti_aspen_80q.py           (Rigetti Aspen)
│   │
│   ├── error_mitigation/
│   │   ├── zne_complete.py                 (Zero-noise extrapolation)
│   │   ├── cdr_complete.py                 (Clifford data regression)
│   │   ├── pec_complete.py                 (Probabilistic error cancellation)
│   │   └── readout_mitigation_complete.py  (SPAM errors)
│   │
│   └── validation/
│       ├── physics_validator.py            (Included in EVERY file!)
│       ├── benchmarking.py                 (Compare to literature)
│       └── hardware_test.py                (Real device validation)
│
├── cirq/
│   └── [same structure as qiskit]
│
└── pennylane/
    └── [same structure as qiskit]
```

---

## 🚀 REVOLUTIONARY FEATURE #2: TEMPLATE FORMAT

**EVERY template must follow this EXACT format**:

```python
"""
[ALGORITHM NAME] - [PURPOSE]
Framework: Qiskit 2.2 (October 2024)

Expected Result: [EXACT VALUE]
Tested on: [DEVICES]
References: [PAPERS]

COMPLETE - NO PLACEHOLDERS - PRODUCTION READY
"""

# ============================================================================
# IMPORTS (Latest API - Qiskit 2.2)
# ============================================================================
import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorEstimator, Sampler
from qiskit.quantum_info import SparsePauliOp, Statevector
from qiskit_algorithms import VQE, QAOA
from qiskit_algorithms.optimizers import COBYLA, SLSQP, SPSA

# ============================================================================
# PHYSICS VALIDATOR (MANDATORY IN EVERY FILE!)
# ============================================================================
class PhysicsValidator:
    """
    Validates quantum operations at 10^-10 precision
    """
    TOLERANCE = 1e-10
    CHEMICAL_ACCURACY = 1.6e-3  # 1 kcal/mol in Hartree
    
    @staticmethod
    def validate_hermiticity(H, name="H", tol=1e-10):
        """Validate H = H†"""
        if hasattr(H, 'to_matrix'):
            H = H.to_matrix()
        herm_error = np.linalg.norm(H - H.conj().T)
        if herm_error >= tol:
            raise ValueError(f"❌ {name} NOT Hermitian! ||H-H†|| = {herm_error:.2e}")
        print(f"✅ {name} Hermiticity: ||H-H†|| = {herm_error:.2e}")
        return True
    
    @staticmethod
    def validate_unitarity(U, name="U", tol=1e-10):
        """Validate U†U = I"""
        if hasattr(U, 'to_matrix'):
            U = U.to_matrix()
        identity = np.eye(len(U))
        unit_error = np.linalg.norm(U.conj().T @ U - identity)
        if unit_error >= tol:
            raise ValueError(f"❌ {name} NOT Unitary! ||U†U-I|| = {unit_error:.2e}")
        print(f"✅ {name} Unitarity: ||U†U-I|| = {unit_error:.2e}")
        return True
    
    @staticmethod
    def validate_normalization(state, name="State", tol=1e-10):
        """Validate ||ψ|| = 1"""
        norm = np.linalg.norm(state)
        norm_error = abs(norm - 1.0)
        if norm_error >= tol:
            raise ValueError(f"❌ {name} NOT normalized! ||ψ|| = {norm:.10f}")
        print(f"✅ {name} Normalization: ||ψ|| = {norm:.10f}")
        return True
    
    @staticmethod
    def validate_variational_principle(e_vqe, e_fci, tol=1e-10):
        """VQE energy must be >= FCI energy"""
        if e_vqe < e_fci - tol:
            raise ValueError(f"❌ Variational principle VIOLATED!")
        print(f"✅ Variational principle: E_VQE - E_FCI = {e_vqe - e_fci:.2e}")
        return True
    
    @staticmethod
    def validate_chemical_accuracy(e_computed, e_exact):
        """Check within 1 kcal/mol"""
        error = abs(e_computed - e_exact)
        if error >= PhysicsValidator.CHEMICAL_ACCURACY:
            raise ValueError(f"❌ NOT chemical accuracy! {error*627.5:.2f} kcal/mol")
        print(f"✅ Chemical accuracy: {error*627.5:.4f} kcal/mol")
        return True

# ============================================================================
# MAIN ALGORITHM IMPLEMENTATION
# ============================================================================

def run_algorithm():
    """
    [DETAILED DESCRIPTION]
    
    Steps:
    1. [Step 1]
    2. [Step 2]
    ...
    
    Returns:
        dict: Results with validation status
    """
    
    print("="*80)
    print("[ALGORITHM NAME]")
    print("="*80)
    
    # Step 1: Setup
    print("\n1. [Step description]...")
    # COMPLETE implementation
    
    # Step 2: Validate Physics
    print("\n2. Validating physics...")
    PhysicsValidator.validate_hermiticity(H, "Hamiltonian")
    # ALL relevant validations
    
    # Step 3: Run algorithm
    print("\n3. Running algorithm...")
    # COMPLETE implementation
    
    # Step 4: Validate results
    print("\n4. Validating results...")
    PhysicsValidator.validate_chemical_accuracy(result, expected)
    
    # Step 5: Report
    print("\n" + "="*80)
    print("RESULTS:")
    print("="*80)
    print(f"Computed: {result:.10f}")
    print(f"Expected: {expected:.10f}")
    print(f"Error:    {abs(result-expected):.2e}")
    print("="*80)
    
    return {
        'result': result,
        'expected': expected,
        'error': abs(result - expected),
        'validated': True
    }

if __name__ == '__main__':
    results = run_algorithm()
    
    if results['validated']:
        print("\n✅ SUCCESS: All validations passed!")
    else:
        print("\n❌ FAILED: Validation errors!")
```

**REQUIREMENTS FOR EVERY TEMPLATE**:
- ✅ 500+ lines minimum
- ✅ ZERO placeholders or TODOs
- ✅ Latest API (Qiskit 2.2, Cirq 1.x, PennyLane 0.3x)
- ✅ PhysicsValidator class included
- ✅ Complete error handling
- ✅ Comprehensive comments
- ✅ Production-ready
- ✅ Tested and working
- ✅ Compared to literature

---

## 🚀 REVOLUTIONARY FEATURE #3: TEMPLATE SELECTOR

**File**: `TemplateSelector.ts`

```typescript
/**
 * Binary decision tree for template selection
 * NO FUZZY LOGIC - only yes/no decisions
 */

interface CodeGenerationRequest {
    framework: 'qiskit' | 'cirq' | 'pennylane';
    algorithm?: 'vqe' | 'qaoa' | 'grover' | 'qpe' | 'hhl';
    molecule?: 'H2' | 'LiH' | 'H2O' | 'NH3' | 'CH4';
    problem?: 'maxcut' | 'tsp' | 'graph_coloring';
    device?: string;
    qubits?: number;
}

export class TemplateSelector {
    private templatesPath: string;
    
    constructor() {
        this.templatesPath = path.join(__dirname, '../templates');
    }
    
    /**
     * Select template using binary decision tree
     * Returns COMPLETE code (no placeholders)
     */
    selectTemplate(request: CodeGenerationRequest): string {
        // Framework?
        if (request.framework === 'qiskit') {
            return this.selectQiskitTemplate(request);
        }
        else if (request.framework === 'cirq') {
            return this.selectCirqTemplate(request);
        }
        else if (request.framework === 'pennylane') {
            return this.selectPennyLaneTemplate(request);
        }
        
        throw new Error(`Unknown framework: ${request.framework}`);
    }
    
    private selectQiskitTemplate(request: CodeGenerationRequest): string {
        // Algorithm?
        if (request.algorithm === 'vqe') {
            // Molecule?
            if (request.molecule === 'H2') {
                return fs.readFileSync(
                    path.join(this.templatesPath, 'qiskit-2.2/chemistry/vqe_h2_complete.py'),
                    'utf-8'
                );
            }
            else if (request.molecule === 'LiH') {
                return fs.readFileSync(
                    path.join(this.templatesPath, 'qiskit-2.2/chemistry/vqe_lih_complete.py'),
                    'utf-8'
                );
            }
            else if (request.molecule === 'H2O') {
                return fs.readFileSync(
                    path.join(this.templatesPath, 'qiskit-2.2/chemistry/vqe_water_complete.py'),
                    'utf-8'
                );
            }
        }
        else if (request.algorithm === 'grover') {
            // Qubits?
            if (request.qubits && request.qubits <= 10) {
                return fs.readFileSync(
                    path.join(this.templatesPath, 'qiskit-2.2/algorithms/grover_complete.py'),
                    'utf-8'
                );
            }
        }
        else if (request.algorithm === 'qaoa') {
            // Problem type?
            if (request.problem === 'maxcut') {
                return fs.readFileSync(
                    path.join(this.templatesPath, 'qiskit-2.2/algorithms/qaoa_maxcut_complete.py'),
                    'utf-8'
                );
            }
        }
        
        throw new Error(`No Qiskit template for: ${JSON.stringify(request)}`);
    }
    
    private selectCirqTemplate(request: CodeGenerationRequest): string {
        // Similar structure for Cirq
        throw new Error('Cirq templates not yet implemented');
    }
    
    private selectPennyLaneTemplate(request: CodeGenerationRequest): string {
        // Similar structure for PennyLane
        throw new Error('PennyLane templates not yet implemented');
    }
}
```

---

## 🚀 REVOLUTIONARY FEATURE #4: PHYSICS-VALIDATED GENERATOR

**File**: `PhysicsValidatedCodeGenerator.ts`

```typescript
import { CorePhysicsValidator } from '../quantum-physics-core/CorePhysicsValidator';
import { TemplateSelector } from './TemplateSelector';

/**
 * Code generator that VALIDATES physics before returning
 */
export class PhysicsValidatedCodeGenerator {
    private templateSelector: TemplateSelector;
    
    constructor() {
        this.templateSelector = new TemplateSelector();
    }
    
    /**
     * Generate code with physics validation
     */
    async generate(request: CodeGenerationRequest): Promise<GeneratedCode> {
        // 1. Select template
        console.log('Selecting template...');
        const template = this.templateSelector.selectTemplate(request);
        
        // 2. Extract operators (Hamiltonians, gates) from template
        console.log('Extracting operators...');
        const operators = this.extractOperators(template);
        
        // 3. VALIDATE PHYSICS
        console.log('Validating physics...');
        for (const op of operators) {
            if (op.type === 'hamiltonian') {
                CorePhysicsValidator.validateHermitian(op.matrix, op.name);
            }
            else if (op.type === 'unitary') {
                CorePhysicsValidator.validateUnitary(op.matrix, op.name);
            }
            else if (op.type === 'state') {
                CorePhysicsValidator.validateNormalized(op.vector, op.name);
            }
        }
        
        // 4. Get expected results
        const expectedResults = this.getExpectedResults(request);
        
        // 5. Return validated code
        return {
            code: template,
            framework: request.framework,
            algorithm: request.algorithm,
            validated: true,
            operators: operators,
            expectedResults: expectedResults,
            metadata: {
                generated: new Date().toISOString(),
                templatePath: this.getTemplatePath(request),
                physicsValidated: true
            }
        };
    }
    
    private extractOperators(code: string): Operator[] {
        // Parse Python code to extract matrices
        // Return list of operators with their types
        return [];
    }
    
    private getExpectedResults(request: CodeGenerationRequest): ExpectedResults {
        // Return known correct results from literature
        const results: Record<string, ExpectedResults> = {
            'H2_vqe': {
                energy: -1.137,
                tolerance: 1e-3,
                reference: 'Peruzzo et al., Nature Chemistry 2014'
            },
            'LiH_vqe': {
                energy: -7.882,
                tolerance: 1e-3,
                reference: 'McClean et al., New J. Phys. 2016'
            }
        };
        
        const key = `${request.molecule}_${request.algorithm}`;
        return results[key] || { energy: null, tolerance: null, reference: null };
    }
}
```

---

## ✅ YOUR TASKS (Priority Order)

### **Week 1: Chemistry Templates (CRITICAL)**
1. [ ] `vqe_h2_complete.py` (500+ lines)
2. [ ] `vqe_lih_complete.py` (500+ lines)
3. [ ] `vqe_water_complete.py` (500+ lines)
4. [ ] Test all templates on simulator
5. [ ] Verify chemical accuracy (< 1 kcal/mol)

### **Week 2: Algorithm Templates (HIGH)**
1. [ ] `grover_complete.py`
2. [ ] `qaoa_maxcut_complete.py`
3. [ ] `qpe_complete.py`
4. [ ] `hhl_complete.py`

### **Week 3: Hardware Templates (HIGH)**
1. [ ] IBM Brisbane/Kyoto templates
2. [ ] IonQ Aria/Forte templates
3. [ ] Google Weber template
4. [ ] Error mitigation templates

### **Week 4: Cirq & PennyLane (MEDIUM)**
1. [ ] Port 20 Qiskit templates to Cirq
2. [ ] Port 20 Qiskit templates to PennyLane
3. [ ] Test on respective simulators

---

## 🎯 SUCCESS CRITERIA

- [ ] **100+ templates** (Qiskit, Cirq, PennyLane)
- [ ] **ZERO placeholders** in any template
- [ ] **95%+ success rate** in code generation
- [ ] **Chemical accuracy** for all chemistry templates
- [ ] **All templates tested** and working
- [ ] **Physics validation** integrated
- [ ] **Binary decision tree** selector working

---

## 🛠️ TESTING REQUIREMENTS

**For EVERY template**:
```typescript
test('H2 VQE template produces correct result', async () => {
    const selector = new TemplateSelector();
    const code = selector.selectTemplate({
        framework: 'qiskit',
        algorithm: 'vqe',
        molecule: 'H2'
    });
    
    // Run Python code
    const result = await runPython(code);
    
    // Validate result
    expect(result.energy).toBeCloseTo(-1.137, 3);
    expect(result.validated).toBe(true);
    expect(code).not.toContain('TODO');
    expect(code).not.toContain('placeholder');
});
```

**YOUR WORK IS CRITICAL - MAKE IT PERFECT!** 🚀

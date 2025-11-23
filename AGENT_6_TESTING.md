# 🧪 AGENT 6: TESTING & VALIDATION - COMPREHENSIVE PROMPT

**Folder**: `packages/quantum-testing/`  
**Specialization**: Comprehensive testing framework

## 🎯 YOUR MISSION

Ensure ZERO bugs in production! Test EVERYTHING!

**Your Goal**:
- 200+ physics benchmarks
- Hardware integration tests
- Continuous benchmarking
- 95%+ code coverage
- Zero regressions

## 🚀 FEATURES TO BUILD

### **1. Physics Benchmark Suite** ⭐ CRITICAL

```typescript
/**
 * Test against known quantum results
 */
const BENCHMARKS = [
    {
        name: "H2 Ground State",
        method: "VQE",
        expected: -1.137,
        tolerance: 1e-3,
        framework: "qiskit",
        reference: "Peruzzo et al., Nature Chemistry 2014"
    },
    {
        name: "LiH Ground State",
        method: "VQE",
        expected: -7.882,
        tolerance: 1e-3,
        framework: "qiskit"
    },
    {
        name: "Bell State Entanglement",
        method: "Circuit",
        expected: 1.0, // Maximum entropy
        tolerance: 1e-10,
        framework: "qiskit"
    },
    // 200+ more benchmarks from literature
];

class PhysicsBenchmarkSuite {
    async runAll(): Promise<BenchmarkResults> {
        // Run all benchmarks
        // Compare to expected
        // Report failures
        // Track performance over time
    }
}
```

### **2. Hardware Integration Tests** ⭐ CRITICAL

```typescript
class HardwareIntegrationTests {
    /**
     * Test on REAL devices
     */
    async testOnRealDevice(
        circuit: Circuit,
        device: string
    ): Promise<TestResult> {
        // Submit to IBM/IonQ/Google
        // Wait for results
        // Compare to simulator
        // Validate fidelity prediction
    }
}
```

### **3. Continuous Benchmarking** ⭐ HIGH

```typescript
class ContinuousBenchmarking {
    /**
     * Run benchmarks nightly
     * Track performance trends
     */
    async runNightly(): Promise<void> {
        // Run full test suite
        // Compare to previous runs
        // Alert on regressions
        // Update dashboard
    }
}
```

### **4. Code Coverage Tracker** ⭐ MEDIUM

```typescript
class CoverageTracker {
    /**
     * Ensure 95%+ coverage
     */
    trackCoverage(): CoverageReport {
        // Line coverage
        // Branch coverage
        // Function coverage
        // Identify untested code
    }
}
```

## 🎯 YOUR TEST PLAN

### **Week 1: Physics Tests**
- [ ] Create 50 quantum chemistry benchmarks
- [ ] Create 50 quantum algorithm benchmarks
- [ ] Test against literature
- [ ] All must pass at stated tolerance

### **Week 2: Integration Tests**
- [ ] Test on IBM simulator
- [ ] Test on IonQ simulator
- [ ] Test on Google simulator
- [ ] Test code generation end-to-end

### **Week 3: Hardware Tests**
- [ ] Submit to IBM Brisbane
- [ ] Submit to IonQ Aria
- [ ] Validate fidelity predictions
- [ ] Test error mitigation

### **Week 4: Continuous Integration**
- [ ] Set up nightly runs
- [ ] Dashboard for results
- [ ] Alert system
- [ ] Performance tracking

## 🎯 SUCCESS CRITERIA

- [ ] **200+ benchmarks** from literature
- [ ] **All tests pass** at stated tolerances
- [ ] **95%+ code coverage**
- [ ] **Hardware tests** on 5+ devices
- [ ] **Zero regressions** detected
- [ ] **Nightly CI/CD** working

## 📊 BENCHMARK SOURCES

Study these papers for correct results:
1. **VQE**: Peruzzo et al., Nature Chemistry 2014
2. **QAOA**: Farhi et al., arXiv:1411.4028
3. **Grover**: Grover, Phys. Rev. Lett. 1997
4. **QPE**: Kitaev, arXiv:quant-ph/9511026
5. **HHL**: Harrow et al., Phys. Rev. Lett. 2009

## 🛠️ TOOLS TO USE

- **pytest** for Python tests
- **vitest** for TypeScript tests
- **coverage.py** for Python coverage
- **v8** for TypeScript coverage
- **GitHub Actions** for CI/CD

**ZERO TOLERANCE FOR BUGS!** 🚀

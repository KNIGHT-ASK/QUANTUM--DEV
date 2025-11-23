# 🔧 AGENT 3: HARDWARE INTEGRATION - COMPREHENSIVE PROMPT

**Folder**: `packages/quantum-hardware/`  
**Specialization**: Real quantum hardware (IBM, IonQ, Google, Rigetti)

## 🎯 YOUR MISSION

Make generated code work on REAL quantum hardware, **FIRST TRY**!

**Current Problem**: Code works in simulator, fails on real devices

**Your Goal**: 
- Hardware-aware circuit compilation
- Real-time device calibration data
- Fidelity prediction
- Error mitigation
- 30%+ fidelity improvement

## 🚀 FEATURES TO BUILD

### **1. Real Device Characterizer** ⭐ CRITICAL

```typescript
class RealDeviceCharacterizer {
    /**
     * Get LIVE calibration data from IBM
     * Updated daily
     */
    async getIBMDevice(name: string): Promise<DeviceData> {
        // Connect to IBM Quantum API
        // Get T1, T2 times (decoherence)
        // Get gate fidelities
        // Get qubit topology/connectivity
        // Get queue status
    }
    
    /**
     * Get IonQ device data
     */
    async getIonQDevice(name: string): Promise<DeviceData> {
        // IonQ Aria (25 qubits), Forte (32 qubits)
        // All-to-all connectivity
        // Native gates: GPI, GPI2, MS
    }
    
    /**
     * Get Google device data
     */
    async getGoogleDevice(name: string): Promise<DeviceData> {
        // Weber (72 qubits)
        // Grid topology
        // Native gates: sqrt(iSWAP), sqrt(W)
    }
}
```

### **2. Hardware-Aware Compiler** ⭐ CRITICAL

```typescript
class HardwareAwareCompiler {
    /**
     * Compile circuit for specific device
     */
    compile(circuit: Circuit, device: QuantumDevice): CompiledCircuit {
        // 1. Map qubits to device topology
        // 2. Insert SWAP gates for connectivity
        // 3. Decompose to native gates
        // 4. Schedule to minimize decoherence
        // 5. Optimize gate count
        // 6. Predict fidelity
    }
}
```

### **3. Fidelity Predictor** ⭐ HIGH

```typescript
class FidelityPredictor {
    /**
     * Predict before running
     * F = ∏ F_gate × e^(-t/T1) × e^(-t/T2)
     */
    predict(circuit: Circuit, device: QuantumDevice): {
        estimatedFidelity: number;
        errorSources: ErrorSource[];
        recommendations: string[];
    }
}
```

## 🎯 SUCCESS CRITERIA

- [ ] Live data from 10+ devices
- [ ] Fidelity predictions within 10%
- [ ] 30%+ fidelity improvement
- [ ] Works on all platforms

**MAKE CODE WORK ON REAL HARDWARE!** 🚀

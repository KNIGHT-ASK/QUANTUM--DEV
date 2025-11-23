# Hardware Integration Guide

Complete guide to using the Hardware Integration module for running quantum circuits on real quantum hardware.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [API Credentials](#api-credentials)
4. [Basic Usage](#basic-usage)
5. [Advanced Features](#advanced-features)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

## Overview

The Hardware Integration module provides three core components:

1. **RealDeviceCharacterizer**: Fetches live calibration data from quantum hardware
2. **HardwareAwareCompiler**: Compiles circuits for specific devices
3. **FidelityPredictor**: Predicts circuit fidelity before execution

### Why Use Hardware Integration?

- **Avoid Failed Runs**: Predict fidelity before spending credits
- **Optimize Automatically**: Get 30%+ fidelity improvement
- **Save Time**: No manual qubit mapping or gate decomposition
- **Multi-Provider**: Works with IBM, IonQ, Rigetti, Google

## Getting Started

### Installation

```bash
npm install @quantum-dev/hardware
```

### Quick Example

```typescript
import {
  createRealDeviceCharacterizer,
  createHardwareCompiler,
  createFidelityPredictor
} from '@quantum-dev/hardware';

// 1. Connect to hardware
const characterizer = createRealDeviceCharacterizer({
  ibmToken: process.env.IBM_QUANTUM_TOKEN
});

// 2. Get device
const device = await characterizer.getIBMDevice('ibm_heron');

// 3. Create circuit
const circuit = {
  qubits: 3,
  gates: [
    { type: 'H', qubits: [0] },
    { type: 'CNOT', qubits: [0, 1] }
  ],
  measurements: [{ qubit: 0 }, { qubit: 1 }]
};

// 4. Compile and predict
const compiler = createHardwareCompiler(device);
const compiled = compiler.compile(circuit);

const predictor = createFidelityPredictor(device);
const prediction = predictor.predict(circuit, compiled.compiledGates);

console.log(`Fidelity: ${(prediction.estimatedFidelity * 100).toFixed(2)}%`);
```

## API Credentials

### IBM Quantum

**Sign Up**: https://quantum-computing.ibm.com/

**Get Token**:
1. Log in to IBM Quantum
2. Go to Account Settings
3. Copy your API token
4. Set environment variable:
   ```bash
   export IBM_QUANTUM_TOKEN="your_token_here"
   ```

**Available Devices**:
- `ibm_heron` - 133 qubits, heavy-hex topology
- `ibm_condor` - 1121 qubits, heavy-hex topology
- `ibm_kyoto` - 127 qubits
- `ibm_brisbane` - 127 qubits

### IonQ

**Sign Up**: https://cloud.ionq.com/

**Get API Key**:
1. Log in to IonQ Cloud
2. Navigate to API Keys
3. Generate new key
4. Set environment variable:
   ```bash
   export IONQ_API_KEY="your_key_here"
   ```

**Available Devices**:
- `ionq_forte` - 32 qubits, all-to-all connectivity
- `ionq_aria` - 25 qubits, all-to-all connectivity

### Rigetti

**Sign Up**: https://qcs.rigetti.com/

**Get API Key**:
1. Log in to Rigetti QCS
2. Access API credentials
3. Set environment variable:
   ```bash
   export RIGETTI_API_KEY="your_key_here"
   ```

**Available Devices**:
- `rigetti_ankaa3` - 84 qubits, octagonal topology

### Google Quantum

**Note**: Requires Google Cloud service account

**Setup**:
1. Create Google Cloud project
2. Enable Quantum Engine API
3. Create service account
4. Download service account key
5. Set credentials:
   ```typescript
   const device = await characterizer.getGoogleDevice('google_sycamore');
   ```

## Basic Usage

### 1. Fetching Device Data

```typescript
const characterizer = createRealDeviceCharacterizer({
  ibmToken: process.env.IBM_QUANTUM_TOKEN,
  ionqApiKey: process.env.IONQ_API_KEY
});

// Get IBM device
const ibmDevice = await characterizer.getIBMDevice('ibm_heron');
console.log(`${ibmDevice.name}: ${ibmDevice.qubits} qubits`);
console.log(`Queue: ${ibmDevice.queueInfo.estimatedWaitTime} min`);

// Get IonQ device
const ionqDevice = await characterizer.getIonQDevice('ionq_forte');
console.log(`Topology: ${ionqDevice.topology.type}`);
console.log(`T2: ${ionqDevice.coherenceTimes.T2[0]} μs`);
```

### 2. Compiling Circuits

```typescript
const compiler = createHardwareCompiler(device);

const compiled = compiler.compile(circuit, {
  optimizationLevel: 3,      // 0-3 (aggressive)
  maxSwaps: 50,              // Maximum SWAP gates
  targetFidelity: 0.85       // Target fidelity
});

console.log(`Original gates: ${circuit.gates.length}`);
console.log(`Compiled gates: ${compiled.compiledGates.length}`);
console.log(`SWAP count: ${compiled.swapCount}`);
console.log(`Depth: ${compiled.estimatedDepth}`);
```

### 3. Predicting Fidelity

```typescript
const predictor = createFidelityPredictor(device);

const prediction = predictor.predict(circuit, compiled.compiledGates);

console.log(`Fidelity: ${(prediction.estimatedFidelity * 100).toFixed(2)}%`);
console.log(`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);

// Error breakdown
console.log('Breakdown:');
console.log(`  Gate: ${(prediction.breakdown.gateFidelity * 100).toFixed(2)}%`);
console.log(`  Decoherence: ${(prediction.breakdown.decoherenceFidelity * 100).toFixed(2)}%`);
console.log(`  Readout: ${(prediction.breakdown.readoutFidelity * 100).toFixed(2)}%`);

// Recommendations
prediction.recommendations.forEach(rec => {
  console.log(`💡 ${rec}`);
});
```

## Advanced Features

### Multi-Device Comparison

```typescript
const devices = [
  await characterizer.getIBMDevice('ibm_heron'),
  await characterizer.getIonQDevice('ionq_forte'),
  await characterizer.getRigettiDevice('rigetti_ankaa3')
];

const predictor = createFidelityPredictor(devices[0]);
const comparisons = predictor.comparePredictions(circuit, devices);

console.log('Device Rankings:');
comparisons.forEach((result, i) => {
  console.log(`${i + 1}. ${result.device.name}`);
  console.log(`   Fidelity: ${(result.prediction.estimatedFidelity * 100).toFixed(2)}%`);
  console.log(`   Queue: ${result.device.queueInfo.estimatedWaitTime} min`);
  console.log(`   Cost: ${result.device.pricing?.costPerShot || 'N/A'}`);
});
```

### Custom Qubit Mapping

```typescript
// Let compiler find optimal mapping
const compiled = compiler.compile(circuit);

// View mapping
console.log('Qubit Mapping (logical → physical):');
compiled.qubitMapping.forEach((physical, logical) => {
  const t1 = device.coherenceTimes.T1[physical];
  const t2 = device.coherenceTimes.T2[physical];
  console.log(`  ${logical} → ${physical} (T1: ${t1.toFixed(1)}μs, T2: ${t2.toFixed(1)}μs)`);
});
```

### Error Analysis

```typescript
const prediction = predictor.predict(circuit, compiled.compiledGates);

// Analyze error sources
console.log('Error Sources:');
prediction.errorSources.forEach(source => {
  console.log(`${source.type}:`);
  console.log(`  Contribution: ${(source.contribution * 100).toFixed(2)}%`);
  console.log(`  Severity: ${source.severity}`);
  console.log(`  Description: ${source.description}`);
  if (source.affectedQubits.length > 0) {
    console.log(`  Affected qubits: ${source.affectedQubits.join(', ')}`);
  }
});

// Per-gate analysis
console.log('\nGate Contributions:');
prediction.breakdown.gateContributions.forEach((error, gateType) => {
  console.log(`  ${gateType}: ${(error * 100).toFixed(3)}% error`);
});

// Per-qubit analysis
console.log('\nQubit Contributions:');
prediction.breakdown.qubitContributions.forEach((error, qubit) => {
  console.log(`  Qubit ${qubit}: ${(error * 100).toFixed(3)}% error`);
});
```

### Optimization Levels

```typescript
// Level 0: No optimization
const level0 = compiler.compile(circuit, { optimizationLevel: 0 });

// Level 1: Cancel inverse gates
const level1 = compiler.compile(circuit, { optimizationLevel: 1 });

// Level 2: Merge rotations
const level2 = compiler.compile(circuit, { optimizationLevel: 2 });

// Level 3: Commute gates (aggressive)
const level3 = compiler.compile(circuit, { optimizationLevel: 3 });

console.log('Optimization Comparison:');
console.log(`Level 0: ${level0.compiledGates.length} gates`);
console.log(`Level 1: ${level1.compiledGates.length} gates`);
console.log(`Level 2: ${level2.compiledGates.length} gates`);
console.log(`Level 3: ${level3.compiledGates.length} gates`);
```

### Caching

```typescript
// Device data is cached for 1 hour by default
const device1 = await characterizer.getIBMDevice('ibm_heron'); // API call
const device2 = await characterizer.getIBMDevice('ibm_heron'); // From cache

// View cached devices
const cached = characterizer.getCachedDevices();
console.log(`Cached devices: ${cached.length}`);

// Clear cache
characterizer.clearCache();
```

## Best Practices

### 1. Always Predict Before Running

```typescript
// ❌ Bad: Run without prediction
await provider.submitJob(circuit, device, shots);

// ✅ Good: Predict first
const prediction = predictor.predict(circuit, compiled.compiledGates);
if (prediction.estimatedFidelity < 0.7) {
  console.warn('Low fidelity predicted. Consider optimization.');
}
```

### 2. Use Appropriate Optimization Level

```typescript
// For quick prototyping
const compiled = compiler.compile(circuit, { optimizationLevel: 1 });

// For production runs
const compiled = compiler.compile(circuit, { optimizationLevel: 3 });
```

### 3. Check Device Queue

```typescript
const device = await characterizer.getIBMDevice('ibm_heron');

if (device.queueInfo.estimatedWaitTime > 120) {
  console.log('Long queue. Consider alternative device.');
  
  // Try another device
  const altDevice = await characterizer.getIBMDevice('ibm_kyoto');
  if (altDevice.queueInfo.estimatedWaitTime < device.queueInfo.estimatedWaitTime) {
    console.log(`Using ${altDevice.name} instead (shorter queue)`);
  }
}
```

### 4. Monitor Calibration Freshness

```typescript
const device = await characterizer.getIBMDevice('ibm_heron');

const age = Date.now() - device.calibrationTimestamp.getTime();
const ageInHours = age / (1000 * 60 * 60);

if (ageInHours > 24) {
  console.warn('Calibration data is old. Predictions may be less accurate.');
}
```

### 5. Handle Compilation Warnings

```typescript
const compiled = compiler.compile(circuit);

if (compiled.warnings.length > 0) {
  console.log('Compilation Warnings:');
  compiled.warnings.forEach(warning => {
    console.log(`  ⚠️  ${warning}`);
  });
  
  // Decide whether to proceed
  if (compiled.swapCount > 20) {
    console.log('High SWAP count. Consider circuit redesign.');
  }
}
```

## Troubleshooting

### Issue: API Authentication Failed

**Error**: `IBM API error: 401 Unauthorized`

**Solution**:
1. Verify API token is correct
2. Check token hasn't expired
3. Ensure environment variable is set:
   ```bash
   echo $IBM_QUANTUM_TOKEN
   ```

### Issue: Device Not Found

**Error**: `Device ibm_xyz not found`

**Solution**:
1. Check device name spelling
2. Verify device is available in your account
3. List available devices:
   ```typescript
   const devices = await provider.getAvailableDevices();
   console.log(devices.map(d => d.name));
   ```

### Issue: Low Fidelity Prediction

**Problem**: Predicted fidelity is very low

**Solutions**:
1. Reduce circuit depth
2. Use fewer qubits
3. Avoid qubits with poor coherence
4. Increase optimization level
5. Consider error mitigation

```typescript
// Check recommendations
const prediction = predictor.predict(circuit);
prediction.recommendations.forEach(rec => {
  console.log(`💡 ${rec}`);
});
```

### Issue: High SWAP Count

**Problem**: Compiler inserts many SWAP gates

**Solutions**:
1. Redesign circuit for device topology
2. Use device with better connectivity (e.g., IonQ all-to-all)
3. Reduce circuit connectivity requirements

```typescript
// Check topology
console.log(`Topology: ${device.topology.type}`);
console.log(`Connectivity: ${device.topology.edges.length} edges`);
```

### Issue: Compilation Takes Too Long

**Problem**: Compilation is slow for large circuits

**Solutions**:
1. Reduce optimization level
2. Set `maxSwaps` limit
3. Use simpler circuit

```typescript
const compiled = compiler.compile(circuit, {
  optimizationLevel: 1,  // Faster
  maxSwaps: 20           // Limit SWAP insertion
});
```

## API Reference

### RealDeviceCharacterizer

```typescript
class RealDeviceCharacterizer {
  constructor(credentials: ProviderCredentials);
  
  async getIBMDevice(name: string): Promise<LiveDeviceData>;
  async getIonQDevice(name: string): Promise<LiveDeviceData>;
  async getGoogleDevice(name: string): Promise<LiveDeviceData>;
  async getRigettiDevice(name: string): Promise<LiveDeviceData>;
  
  clearCache(): void;
  getCachedDevices(): LiveDeviceData[];
}
```

### HardwareAwareCompiler

```typescript
class HardwareAwareCompiler {
  constructor(device: QuantumDevice);
  
  compile(
    circuit: Circuit,
    options?: CompilationOptions
  ): CompiledCircuit;
}

interface CompilationOptions {
  optimizationLevel?: 0 | 1 | 2 | 3;
  allowApproximation?: boolean;
  maxSwaps?: number;
  targetFidelity?: number;
  preserveStructure?: boolean;
}

interface CompiledCircuit {
  originalCircuit: Circuit;
  compiledGates: Gate[];
  qubitMapping: Map<number, number>;
  swapCount: number;
  estimatedDepth: number;
  estimatedFidelity: number;
  nativeGateCount: Map<GateType, number>;
  compilationTime: number;
  warnings: string[];
}
```

### FidelityPredictor

```typescript
class FidelityPredictor {
  constructor(device: QuantumDevice);
  
  predict(
    circuit: Circuit,
    compiledGates?: Gate[]
  ): FidelityPrediction;
  
  comparePredictions(
    circuit: Circuit,
    devices: QuantumDevice[]
  ): Array<{
    device: QuantumDevice;
    prediction: FidelityPrediction;
  }>;
}

interface FidelityPrediction {
  estimatedFidelity: number;
  errorSources: ErrorSource[];
  recommendations: string[];
  breakdown: FidelityBreakdown;
  confidence: number;
}
```

## Examples

See [examples directory](../src/examples/) for complete working examples:

- [hardware-integration-demo.ts](../src/examples/hardware-integration-demo.ts) - Full demo
- [basic-usage.ts](../src/examples/basic-usage.ts) - Simple usage

## Support

- **Documentation**: https://docs.quantum-dev.io
- **Issues**: https://github.com/quantum-dev/hardware/issues
- **Discord**: https://discord.gg/quantum-dev

## License

MIT License - see [LICENSE](../LICENSE) for details.

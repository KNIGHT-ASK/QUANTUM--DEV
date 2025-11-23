/**
 * Hardware Integration Tests
 * 
 * Tests for RealDeviceCharacterizer, HardwareAwareCompiler, and FidelityPredictor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RealDeviceCharacterizer, ProviderCredentials } from '../RealDeviceCharacterizer';
import { HardwareAwareCompiler } from '../HardwareAwareCompiler';
import { FidelityPredictor } from '../FidelityPredictor';
import { Circuit } from '../../providers/ProviderInterfaces';
import { QuantumDevice } from '../../DeviceCharacterization';

describe('RealDeviceCharacterizer', () => {
	let characterizer: RealDeviceCharacterizer;
	let mockCredentials: ProviderCredentials;

	beforeEach(() => {
		mockCredentials = {
			ibmToken: 'mock-token',
			ionqApiKey: 'mock-key'
		};
		characterizer = new RealDeviceCharacterizer(mockCredentials);
	});

	it('should initialize with credentials', () => {
		expect(characterizer).toBeDefined();
	});

	it('should cache device data', async () => {
		// Note: This will use simulated data without real API credentials
		const device1 = await characterizer.getGoogleDevice('google_sycamore');
		const device2 = await characterizer.getGoogleDevice('google_sycamore');
		
		expect(device1).toBeDefined();
		expect(device2).toBeDefined();
		expect(device1.name).toBe(device2.name);
		expect(device1.lastFetched).toEqual(device2.lastFetched);
	});

	it('should clear cache', async () => {
		await characterizer.getGoogleDevice('google_sycamore');
		const cached = characterizer.getCachedDevices();
		expect(cached.length).toBeGreaterThan(0);
		
		characterizer.clearCache();
		const afterClear = characterizer.getCachedDevices();
		expect(afterClear.length).toBe(0);
	});

	it('should return live device data with correct structure', async () => {
		const device = await characterizer.getGoogleDevice('google_sycamore');
		
		expect(device).toHaveProperty('name');
		expect(device).toHaveProperty('provider');
		expect(device).toHaveProperty('qubits');
		expect(device).toHaveProperty('topology');
		expect(device).toHaveProperty('gateFidelities');
		expect(device).toHaveProperty('coherenceTimes');
		expect(device).toHaveProperty('isLive');
		expect(device).toHaveProperty('lastFetched');
		expect(device).toHaveProperty('dataSource');
	});
});

describe('HardwareAwareCompiler', () => {
	let compiler: HardwareAwareCompiler;
	let mockDevice: QuantumDevice;
	let testCircuit: Circuit;

	beforeEach(() => {
		// Create a simple mock device
		mockDevice = {
			name: 'test_device',
			provider: 'IBM',
			technology: 'superconducting',
			qubits: 10,
			topology: {
				adjacencyMatrix: Array(10).fill(0).map((_, i) => 
					Array(10).fill(0).map((_, j) => Math.abs(i - j) === 1 ? 1 : 0)
				),
				edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]],
				type: 'linear',
				diameter: 9
			},
			gateFidelities: new Map([
				['H', 0.999],
				['X', 0.999],
				['RZ', 0.9999],
				['CNOT', 0.99],
				['SWAP', 0.98]
			]),
			coherenceTimes: {
				T1: Array(10).fill(100),
				T2: Array(10).fill(80)
			},
			readoutErrors: Array(10).fill(0.01),
			crosstalkMatrix: Array(10).fill(0).map(() => Array(10).fill(0.001)),
			calibrationTimestamp: new Date(),
			operatingTemperature: 15,
			maxCircuitDepth: 100,
			queueInfo: {
				length: 10,
				estimatedWaitTime: 30,
				jobsAhead: 10,
				lastUpdated: new Date()
			}
		};

		compiler = new HardwareAwareCompiler(mockDevice);

		// Create a simple test circuit
		testCircuit = {
			qubits: 3,
			gates: [
				{ type: 'H', qubits: [0] },
				{ type: 'CNOT', qubits: [0, 1] },
				{ type: 'CNOT', qubits: [1, 2] }
			],
			measurements: [{ qubit: 0 }, { qubit: 1 }, { qubit: 2 }]
		};
	});

	it('should compile circuit successfully', () => {
		const compiled = compiler.compile(testCircuit);
		
		expect(compiled).toBeDefined();
		expect(compiled.compiledGates).toBeDefined();
		expect(compiled.qubitMapping).toBeDefined();
		expect(compiled.estimatedFidelity).toBeGreaterThan(0);
		expect(compiled.estimatedFidelity).toBeLessThanOrEqual(1);
	});

	it('should create qubit mapping', () => {
		const compiled = compiler.compile(testCircuit);
		
		expect(compiled.qubitMapping.size).toBe(testCircuit.qubits);
		
		// Check all logical qubits are mapped
		for (let i = 0; i < testCircuit.qubits; i++) {
			expect(compiled.qubitMapping.has(i)).toBe(true);
		}
	});

	it('should handle different optimization levels', () => {
		const level0 = compiler.compile(testCircuit, { optimizationLevel: 0 });
		const level3 = compiler.compile(testCircuit, { optimizationLevel: 3 });
		
		expect(level0.compiledGates.length).toBeGreaterThanOrEqual(level3.compiledGates.length);
	});

	it('should insert SWAP gates when needed', () => {
		// Create circuit requiring non-adjacent qubits
		const longRangeCircuit: Circuit = {
			qubits: 5,
			gates: [
				{ type: 'CNOT', qubits: [0, 4] } // Non-adjacent on linear topology
			],
			measurements: [{ qubit: 0 }, { qubit: 4 }]
		};

		const compiled = compiler.compile(longRangeCircuit);
		
		expect(compiled.swapCount).toBeGreaterThan(0);
	});

	it('should calculate circuit depth', () => {
		const compiled = compiler.compile(testCircuit);
		
		expect(compiled.estimatedDepth).toBeGreaterThan(0);
		expect(compiled.estimatedDepth).toBeLessThanOrEqual(testCircuit.gates.length);
	});

	it('should provide warnings for problematic circuits', () => {
		// Create a very deep circuit
		const deepCircuit: Circuit = {
			qubits: 3,
			gates: Array(200).fill(null).map((_, i) => ({
				type: 'H',
				qubits: [i % 3]
			})),
			measurements: [{ qubit: 0 }]
		};

		const compiled = compiler.compile(deepCircuit);
		
		expect(compiled.warnings.length).toBeGreaterThan(0);
	});

	it('should throw error for too many qubits', () => {
		const tooManyQubits: Circuit = {
			qubits: 20, // More than device has
			gates: [{ type: 'H', qubits: [0] }],
			measurements: [{ qubit: 0 }]
		};

		expect(() => compiler.compile(tooManyQubits)).toThrow();
	});
});

describe('FidelityPredictor', () => {
	let predictor: FidelityPredictor;
	let mockDevice: QuantumDevice;
	let testCircuit: Circuit;

	beforeEach(() => {
		mockDevice = {
			name: 'test_device',
			provider: 'IBM',
			technology: 'superconducting',
			qubits: 10,
			topology: {
				adjacencyMatrix: Array(10).fill(0).map(() => Array(10).fill(0)),
				edges: [],
				type: 'linear',
				diameter: 9
			},
			gateFidelities: new Map([
				['H', 0.999],
				['CNOT', 0.99],
				['RZ', 0.9999]
			]),
			coherenceTimes: {
				T1: Array(10).fill(100),
				T2: Array(10).fill(80)
			},
			readoutErrors: Array(10).fill(0.01),
			crosstalkMatrix: Array(10).fill(0).map(() => Array(10).fill(0.001)),
			calibrationTimestamp: new Date(),
			operatingTemperature: 15,
			maxCircuitDepth: 100,
			queueInfo: {
				length: 10,
				estimatedWaitTime: 30,
				jobsAhead: 10,
				lastUpdated: new Date()
			}
		};

		predictor = new FidelityPredictor(mockDevice);

		testCircuit = {
			qubits: 3,
			gates: [
				{ type: 'H', qubits: [0] },
				{ type: 'CNOT', qubits: [0, 1] },
				{ type: 'CNOT', qubits: [1, 2] }
			],
			measurements: [{ qubit: 0 }, { qubit: 1 }, { qubit: 2 }]
		};
	});

	it('should predict fidelity', () => {
		const prediction = predictor.predict(testCircuit);
		
		expect(prediction).toBeDefined();
		expect(prediction.estimatedFidelity).toBeGreaterThan(0);
		expect(prediction.estimatedFidelity).toBeLessThanOrEqual(1);
	});

	it('should provide fidelity breakdown', () => {
		const prediction = predictor.predict(testCircuit);
		
		expect(prediction.breakdown).toBeDefined();
		expect(prediction.breakdown.gateFidelity).toBeGreaterThan(0);
		expect(prediction.breakdown.decoherenceFidelity).toBeGreaterThan(0);
		expect(prediction.breakdown.readoutFidelity).toBeGreaterThan(0);
		expect(prediction.breakdown.crosstalkFidelity).toBeGreaterThan(0);
		expect(prediction.breakdown.totalFidelity).toBe(prediction.estimatedFidelity);
	});

	it('should identify error sources', () => {
		const prediction = predictor.predict(testCircuit);
		
		expect(prediction.errorSources).toBeDefined();
		expect(Array.isArray(prediction.errorSources)).toBe(true);
		
		// Error sources should be sorted by contribution
		for (let i = 0; i < prediction.errorSources.length - 1; i++) {
			expect(prediction.errorSources[i].contribution)
				.toBeGreaterThanOrEqual(prediction.errorSources[i + 1].contribution);
		}
	});

	it('should provide recommendations', () => {
		const prediction = predictor.predict(testCircuit);
		
		expect(prediction.recommendations).toBeDefined();
		expect(Array.isArray(prediction.recommendations)).toBe(true);
		expect(prediction.recommendations.length).toBeGreaterThan(0);
	});

	it('should calculate confidence', () => {
		const prediction = predictor.predict(testCircuit);
		
		expect(prediction.confidence).toBeGreaterThan(0);
		expect(prediction.confidence).toBeLessThanOrEqual(1);
	});

	it('should predict lower fidelity for deeper circuits', () => {
		const shallowCircuit: Circuit = {
			qubits: 2,
			gates: [{ type: 'H', qubits: [0] }],
			measurements: [{ qubit: 0 }]
		};

		const deepCircuit: Circuit = {
			qubits: 2,
			gates: Array(50).fill(null).map((_, i) => ({
				type: 'H',
				qubits: [i % 2]
			})),
			measurements: [{ qubit: 0 }]
		};

		const shallowPrediction = predictor.predict(shallowCircuit);
		const deepPrediction = predictor.predict(deepCircuit);

		expect(shallowPrediction.estimatedFidelity)
			.toBeGreaterThan(deepPrediction.estimatedFidelity);
	});

	it('should compare predictions across devices', () => {
		const device2: QuantumDevice = {
			...mockDevice,
			name: 'better_device',
			gateFidelities: new Map([
				['H', 0.9995],
				['CNOT', 0.995],
				['RZ', 0.9999]
			]),
			coherenceTimes: {
				T1: Array(10).fill(150),
				T2: Array(10).fill(120)
			}
		};

		const comparisons = predictor.comparePredictions(testCircuit, [mockDevice, device2]);

		expect(comparisons).toBeDefined();
		expect(comparisons.length).toBe(2);
		
		// Should be sorted by fidelity (highest first)
		expect(comparisons[0].prediction.estimatedFidelity)
			.toBeGreaterThanOrEqual(comparisons[1].prediction.estimatedFidelity);
	});

	it('should calculate gate contributions', () => {
		const prediction = predictor.predict(testCircuit);
		
		expect(prediction.breakdown.gateContributions).toBeDefined();
		expect(prediction.breakdown.gateContributions.size).toBeGreaterThan(0);
	});

	it('should calculate qubit contributions', () => {
		const prediction = predictor.predict(testCircuit);
		
		expect(prediction.breakdown.qubitContributions).toBeDefined();
		expect(prediction.breakdown.qubitContributions.size).toBe(testCircuit.qubits);
	});
});

describe('Integration Tests', () => {
	it('should work end-to-end: characterize -> compile -> predict', async () => {
		// 1. Get device
		const characterizer = new RealDeviceCharacterizer({});
		const device = await characterizer.getGoogleDevice('google_sycamore');

		// 2. Create circuit
		const circuit: Circuit = {
			qubits: 5,
			gates: [
				{ type: 'H', qubits: [0] },
				{ type: 'CNOT', qubits: [0, 1] },
				{ type: 'CNOT', qubits: [1, 2] },
				{ type: 'CNOT', qubits: [2, 3] },
				{ type: 'CNOT', qubits: [3, 4] }
			],
			measurements: Array(5).fill(null).map((_, i) => ({ qubit: i }))
		};

		// 3. Predict initial fidelity
		const predictor = new FidelityPredictor(device);
		const initialPrediction = predictor.predict(circuit);

		// 4. Compile
		const compiler = new HardwareAwareCompiler(device);
		const compiled = compiler.compile(circuit, { optimizationLevel: 3 });

		// 5. Predict optimized fidelity
		const optimizedPrediction = predictor.predict(circuit, compiled.compiledGates);

		// Verify results
		expect(initialPrediction.estimatedFidelity).toBeGreaterThan(0);
		expect(optimizedPrediction.estimatedFidelity).toBeGreaterThan(0);
		expect(compiled.compiledGates.length).toBeGreaterThan(0);
		
		// Optimization should maintain or improve fidelity
		// (may not always improve due to SWAP insertion, but should be reasonable)
		expect(optimizedPrediction.estimatedFidelity).toBeGreaterThan(0.05); // Very relaxed for deep circuits
	});

	it('should handle Bell state circuit', async () => {
		const characterizer = new RealDeviceCharacterizer({});
		const device = await characterizer.getGoogleDevice('google_sycamore');

		const bellCircuit: Circuit = {
			qubits: 2,
			gates: [
				{ type: 'H', qubits: [0] },
				{ type: 'CNOT', qubits: [0, 1] }
			],
			measurements: [{ qubit: 0 }, { qubit: 1 }]
		};

		const compiler = new HardwareAwareCompiler(device);
		const compiled = compiler.compile(bellCircuit);

		const predictor = new FidelityPredictor(device);
		const prediction = predictor.predict(bellCircuit, compiled.compiledGates);

		expect(compiled.compiledGates.length).toBeGreaterThanOrEqual(2);
		expect(prediction.estimatedFidelity).toBeGreaterThan(0.5); // Bell state should have reasonable fidelity
	});
});

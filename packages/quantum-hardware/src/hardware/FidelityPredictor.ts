/**
 * Fidelity Predictor
 * 
 * Predicts circuit fidelity BEFORE running on real hardware
 * Formula: F = ∏ F_gate × e^(-t/T1) × e^(-t/T2) × F_readout
 * 
 * Provides:
 * - Estimated fidelity
 * - Error source breakdown
 * - Optimization recommendations
 * 
 * Goal: 30%+ fidelity improvement through informed decisions
 */

import { QuantumDevice, GateType } from '../DeviceCharacterization';
import { Circuit, Gate } from '../providers/ProviderInterfaces';

export interface FidelityPrediction {
	estimatedFidelity: number;
	errorSources: ErrorSource[];
	recommendations: string[];
	breakdown: FidelityBreakdown;
	confidence: number; // 0-1, how confident we are in prediction
}

export interface ErrorSource {
	type: 'gate_error' | 'decoherence' | 'readout_error' | 'crosstalk' | 'leakage';
	contribution: number; // Error contribution (0-1)
	affectedQubits: number[];
	description: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FidelityBreakdown {
	gateFidelity: number;
	decoherenceFidelity: number;
	readoutFidelity: number;
	crosstalkFidelity: number;
	totalFidelity: number;
	gateContributions: Map<GateType, number>;
	qubitContributions: Map<number, number>;
}

export interface OptimizationRecommendation {
	type: 'qubit_mapping' | 'gate_reduction' | 'circuit_depth' | 'error_mitigation';
	priority: 'low' | 'medium' | 'high';
	description: string;
	expectedImprovement: number; // Expected fidelity improvement
	implementation: string;
}

/**
 * Fidelity Predictor
 */
export class FidelityPredictor {
	private device: QuantumDevice;

	constructor(device: QuantumDevice) {
		this.device = device;
	}

	/**
	 * Predict circuit fidelity before execution
	 */
	predict(circuit: Circuit, compiledGates?: Gate[]): FidelityPrediction {
		const gates = compiledGates ?? circuit.gates;

		// Calculate individual fidelity components
		const gateFidelity = this.calculateGateFidelity(gates);
		const decoherenceFidelity = this.calculateDecoherenceFidelity(gates, circuit.qubits);
		const readoutFidelity = this.calculateReadoutFidelity(circuit.qubits);
		const crosstalkFidelity = this.calculateCrosstalkFidelity(gates);

		// Total fidelity
		const totalFidelity = gateFidelity * decoherenceFidelity * readoutFidelity * crosstalkFidelity;

		// Identify error sources
		const errorSources = this.identifyErrorSources(
			gates,
			circuit.qubits,
			gateFidelity,
			decoherenceFidelity,
			readoutFidelity,
			crosstalkFidelity
		);

		// Generate recommendations
		const recommendations = this.generateRecommendations(errorSources, gates, circuit.qubits);

		// Calculate gate and qubit contributions
		const gateContributions = this.calculateGateContributions(gates);
		const qubitContributions = this.calculateQubitContributions(gates, circuit.qubits);

		// Confidence based on calibration freshness and device stability
		const confidence = this.calculateConfidence();

		return {
			estimatedFidelity: totalFidelity,
			errorSources,
			recommendations,
			breakdown: {
				gateFidelity,
				decoherenceFidelity,
				readoutFidelity,
				crosstalkFidelity,
				totalFidelity,
				gateContributions,
				qubitContributions
			},
			confidence
		};
	}

	/**
	 * Calculate gate fidelity contribution
	 * F_gate = ∏ F_i for all gates
	 */
	private calculateGateFidelity(gates: Gate[]): number {
		let fidelity = 1.0;

		for (const gate of gates) {
			const gateFidelity = this.device.gateFidelities.get(gate.type);
			
			if (gateFidelity) {
				fidelity *= gateFidelity;
			} else {
				// Unknown gate, use conservative estimate
				fidelity *= gate.qubits.length === 1 ? 0.999 : 0.99;
			}
		}

		return fidelity;
	}

	/**
	 * Calculate decoherence fidelity
	 * F_decoherence = e^(-t/T1) × e^(-t/T2)
	 */
	private calculateDecoherenceFidelity(gates: Gate[], numQubits: number): number {
		// Estimate circuit execution time
		const circuitTime = this.estimateCircuitTime(gates);

		// Calculate per-qubit decoherence
		let totalDecoherence = 1.0;

		for (let q = 0; q < numQubits; q++) {
			const T1 = this.device.coherenceTimes.T1[q];
			const T2 = this.device.coherenceTimes.T2[q];

			// Decoherence factor for this qubit
			const t1Factor = Math.exp(-circuitTime / T1);
			const t2Factor = Math.exp(-circuitTime / T2);

			totalDecoherence *= t1Factor * t2Factor;
		}

		return totalDecoherence;
	}

	/**
	 * Estimate circuit execution time (microseconds)
	 */
	private estimateCircuitTime(gates: Gate[]): number {
		// Gate time estimates (microseconds)
		const gateTimes: { [key: string]: number } = {
			// Single-qubit gates
			'X': 0.02, 'Y': 0.02, 'Z': 0.0, // Z is virtual
			'H': 0.02, 'S': 0.0, 'T': 0.0, // Phase gates are virtual
			'RX': 0.02, 'RY': 0.02, 'RZ': 0.0,
			'SX': 0.02,
			
			// Two-qubit gates
			'CNOT': 0.3, 'CZ': 0.3, 'CX': 0.3,
			'SWAP': 0.6, // 3 CNOTs
			'ISWAP': 0.3,
			
			// Measurement
			'MEASURE': 1.0
		};

		// Calculate circuit depth (parallel execution)
		const depth = this.calculateCircuitDepth(gates);
		
		// Estimate time per layer
		let totalTime = 0;
		const layerGates = new Map<number, Gate[]>();

		// Group gates by layer
		for (const gate of gates) {
			const layer = gate.layer ?? 0;
			if (!layerGates.has(layer)) {
				layerGates.set(layer, []);
			}
			layerGates.get(layer)!.push(gate);
		}

		// Calculate time for each layer (max gate time in layer)
		for (const [_, gatesInLayer] of layerGates) {
			const layerTime = Math.max(
				...gatesInLayer.map(g => gateTimes[g.type] ?? 0.1)
			);
			totalTime += layerTime;
		}

		return totalTime;
	}

	/**
	 * Calculate circuit depth
	 */
	private calculateCircuitDepth(gates: Gate[]): number {
		if (gates.length === 0) return 0;

		// If gates already have layers, use max layer
		if (gates[0].layer !== undefined) {
			return Math.max(...gates.map(g => g.layer ?? 0));
		}

		// Otherwise, calculate depth by tracking qubit usage
		const qubitLastLayer = new Map<number, number>();
		let maxLayer = 0;

		for (const gate of gates) {
			let gateLayer = 0;
			
			// Find latest layer of involved qubits
			for (const qubit of gate.qubits) {
				gateLayer = Math.max(gateLayer, qubitLastLayer.get(qubit) ?? 0);
			}
			
			gateLayer++; // Place in next layer
			
			// Update qubit layers
			for (const qubit of gate.qubits) {
				qubitLastLayer.set(qubit, gateLayer);
			}
			
			maxLayer = Math.max(maxLayer, gateLayer);
		}

		return maxLayer;
	}

	/**
	 * Calculate readout fidelity
	 * F_readout = ∏ (1 - ε_readout_i)
	 */
	private calculateReadoutFidelity(numQubits: number): number {
		let fidelity = 1.0;

		for (let q = 0; q < numQubits; q++) {
			const readoutError = this.device.readoutErrors[q];
			fidelity *= (1 - readoutError);
		}

		return fidelity;
	}

	/**
	 * Calculate crosstalk fidelity
	 * Crosstalk between simultaneous gates on nearby qubits
	 */
	private calculateCrosstalkFidelity(gates: Gate[]): number {
		let fidelity = 1.0;

		// Group gates by layer
		const layerGates = new Map<number, Gate[]>();
		for (const gate of gates) {
			const layer = gate.layer ?? 0;
			if (!layerGates.has(layer)) {
				layerGates.set(layer, []);
			}
			layerGates.get(layer)!.push(gate);
		}

		// Calculate crosstalk for each layer
		for (const [_, gatesInLayer] of layerGates) {
			if (gatesInLayer.length < 2) continue;

			// Check all pairs of gates in this layer
			for (let i = 0; i < gatesInLayer.length; i++) {
				for (let j = i + 1; j < gatesInLayer.length; j++) {
					const g1 = gatesInLayer[i];
					const g2 = gatesInLayer[j];

					// Calculate crosstalk between these gates
					const crosstalk = this.calculatePairwiseCrosstalk(g1, g2);
					fidelity *= (1 - crosstalk);
				}
			}
		}

		return fidelity;
	}

	/**
	 * Calculate crosstalk between two gates
	 */
	private calculatePairwiseCrosstalk(g1: Gate, g2: Gate): number {
		let maxCrosstalk = 0;

		// Check crosstalk between all qubit pairs
		for (const q1 of g1.qubits) {
			for (const q2 of g2.qubits) {
				if (q1 !== q2) {
					const crosstalk = this.device.crosstalkMatrix[q1][q2];
					maxCrosstalk = Math.max(maxCrosstalk, crosstalk);
				}
			}
		}

		return maxCrosstalk;
	}

	/**
	 * Identify major error sources
	 */
	private identifyErrorSources(
		gates: Gate[],
		numQubits: number,
		gateFidelity: number,
		decoherenceFidelity: number,
		readoutFidelity: number,
		crosstalkFidelity: number
	): ErrorSource[] {
		const sources: ErrorSource[] = [];

		// Gate errors
		if (gateFidelity < 0.95) {
			const errorContribution = 1 - gateFidelity;
			sources.push({
				type: 'gate_error',
				contribution: errorContribution,
				affectedQubits: Array.from({ length: numQubits }, (_, i) => i),
				description: `Gate errors contribute ${(errorContribution * 100).toFixed(1)}% to total error`,
				severity: errorContribution > 0.1 ? 'critical' : errorContribution > 0.05 ? 'high' : 'medium'
			});
		}

		// Decoherence
		if (decoherenceFidelity < 0.9) {
			const errorContribution = 1 - decoherenceFidelity;
			
			// Find qubits with worst coherence
			const worstQubits = Array.from({ length: numQubits }, (_, i) => ({
				qubit: i,
				coherence: this.device.coherenceTimes.T2[i]
			}))
			.sort((a, b) => a.coherence - b.coherence)
			.slice(0, 5)
			.map(x => x.qubit);

			sources.push({
				type: 'decoherence',
				contribution: errorContribution,
				affectedQubits: worstQubits,
				description: `Decoherence contributes ${(errorContribution * 100).toFixed(1)}% to total error. Circuit may be too deep.`,
				severity: errorContribution > 0.15 ? 'critical' : errorContribution > 0.1 ? 'high' : 'medium'
			});
		}

		// Readout errors
		if (readoutFidelity < 0.95) {
			const errorContribution = 1 - readoutFidelity;
			
			// Find qubits with worst readout
			const worstQubits = Array.from({ length: numQubits }, (_, i) => ({
				qubit: i,
				error: this.device.readoutErrors[i]
			}))
			.sort((a, b) => b.error - a.error)
			.slice(0, 5)
			.map(x => x.qubit);

			sources.push({
				type: 'readout_error',
				contribution: errorContribution,
				affectedQubits: worstQubits,
				description: `Readout errors contribute ${(errorContribution * 100).toFixed(1)}% to total error`,
				severity: errorContribution > 0.1 ? 'high' : errorContribution > 0.05 ? 'medium' : 'low'
			});
		}

		// Crosstalk
		if (crosstalkFidelity < 0.98) {
			const errorContribution = 1 - crosstalkFidelity;
			sources.push({
				type: 'crosstalk',
				contribution: errorContribution,
				affectedQubits: [],
				description: `Crosstalk between parallel gates contributes ${(errorContribution * 100).toFixed(1)}% to total error`,
				severity: errorContribution > 0.05 ? 'high' : errorContribution > 0.02 ? 'medium' : 'low'
			});
		}

		// Sort by contribution (highest first)
		return sources.sort((a, b) => b.contribution - a.contribution);
	}

	/**
	 * Generate optimization recommendations
	 */
	private generateRecommendations(
		errorSources: ErrorSource[],
		gates: Gate[],
		numQubits: number
	): string[] {
		const recommendations: string[] = [];

		for (const source of errorSources) {
			switch (source.type) {
				case 'gate_error':
					if (source.severity === 'critical' || source.severity === 'high') {
						recommendations.push('Reduce gate count through circuit optimization');
						recommendations.push('Use native gates to avoid decomposition overhead');
						recommendations.push('Consider error mitigation techniques (ZNE, CDR)');
					}
					break;

				case 'decoherence':
					if (source.severity === 'critical' || source.severity === 'high') {
						recommendations.push('Reduce circuit depth through gate parallelization');
						recommendations.push('Avoid qubits with poor coherence times: ' + source.affectedQubits.slice(0, 3).join(', '));
						recommendations.push('Consider circuit splitting or dynamical decoupling');
					}
					break;

				case 'readout_error':
					if (source.severity === 'high') {
						recommendations.push('Apply readout error mitigation');
						recommendations.push('Avoid qubits with high readout errors: ' + source.affectedQubits.slice(0, 3).join(', '));
						recommendations.push('Increase shot count for better statistics');
					}
					break;

				case 'crosstalk':
					if (source.severity === 'high') {
						recommendations.push('Reduce gate parallelization to minimize crosstalk');
						recommendations.push('Space out simultaneous operations on nearby qubits');
					}
					break;
			}
		}

		// General recommendations
		if (recommendations.length === 0) {
			recommendations.push('Circuit fidelity is good. Consider running on hardware.');
		}

		return recommendations;
	}

	/**
	 * Calculate per-gate-type fidelity contributions
	 */
	private calculateGateContributions(gates: Gate[]): Map<GateType, number> {
		const contributions = new Map<GateType, number>();

		for (const gate of gates) {
			const fidelity = this.device.gateFidelities.get(gate.type) ?? 0.99;
			const error = 1 - fidelity;
			
			contributions.set(
				gate.type,
				(contributions.get(gate.type) ?? 0) + error
			);
		}

		return contributions;
	}

	/**
	 * Calculate per-qubit fidelity contributions
	 */
	private calculateQubitContributions(gates: Gate[], numQubits: number): Map<number, number> {
		const contributions = new Map<number, number>();

		// Initialize all qubits
		for (let q = 0; q < numQubits; q++) {
			contributions.set(q, 0);
		}

		// Add gate errors
		for (const gate of gates) {
			const fidelity = this.device.gateFidelities.get(gate.type) ?? 0.99;
			const error = 1 - fidelity;
			
			for (const qubit of gate.qubits) {
				contributions.set(qubit, (contributions.get(qubit) ?? 0) + error);
			}
		}

		// Add readout errors
		for (let q = 0; q < numQubits; q++) {
			const readoutError = this.device.readoutErrors[q];
			contributions.set(q, (contributions.get(q) ?? 0) + readoutError);
		}

		return contributions;
	}

	/**
	 * Calculate prediction confidence
	 */
	private calculateConfidence(): number {
		// Confidence based on calibration freshness
		const calibrationAge = Date.now() - this.device.calibrationTimestamp.getTime();
		const ageInDays = calibrationAge / (1000 * 60 * 60 * 24);
		
		let confidence = 1.0;
		
		// Reduce confidence for old calibration data
		if (ageInDays > 7) {
			confidence *= 0.7;
		} else if (ageInDays > 3) {
			confidence *= 0.85;
		} else if (ageInDays > 1) {
			confidence *= 0.95;
		}

		return confidence;
	}

	/**
	 * Compare fidelity predictions for different devices
	 */
	comparePredictions(circuit: Circuit, devices: QuantumDevice[]): Array<{
		device: QuantumDevice;
		prediction: FidelityPrediction;
	}> {
		const results = devices.map(device => {
			const predictor = new FidelityPredictor(device);
			return {
				device,
				prediction: predictor.predict(circuit)
			};
		});

		// Sort by estimated fidelity (highest first)
		return results.sort((a, b) => 
			b.prediction.estimatedFidelity - a.prediction.estimatedFidelity
		);
	}
}

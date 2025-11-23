/**
 * Fidelity Estimator - Circuit execution fidelity prediction
 */

import { DeviceSpec, Circuit, Gate } from '../providers/ProviderInterfaces';
import { GateType } from '../DeviceCharacterization';

export interface FidelityEstimate {
	totalFidelity: number;
	gateErrorContribution: number;
	decoherenceContribution: number;
	readoutErrorContribution: number;
	crosstalkContribution: number;
	confidenceInterval: [number, number];
	bottlenecks: ErrorBottleneck[];
}

export interface ErrorBottleneck {
	type: 'gate' | 'decoherence' | 'readout' | 'crosstalk';
	location: string;
	errorRate: number;
	impact: number;
	recommendation: string;
}

export interface FidelityComparison {
	devices: { deviceId: string; fidelity: number; rank: number }[];
	bestDevice: string;
	worstDevice: string;
	fidelityRange: [number, number];
}

export class FidelityEstimator {
	/**
	 * Estimate circuit fidelity
	 */
	estimateCircuitFidelity(circuit: Circuit, device: DeviceSpec): FidelityEstimate {
		const gateError = this.estimateGateFidelity(circuit.gates, device);
		const decoherenceError = this.estimateDecoherenceError(circuit, device);
		const readoutError = this.estimateReadoutError(circuit.measurements.map(m => m.qubit), device);
		const crosstalkError = this.estimateCrosstalkError(circuit, device);

		// Combined fidelity (multiplicative errors)
		const totalFidelity = gateError * decoherenceError * readoutError * crosstalkError;

		// Calculate contributions
		const gateErrorContribution = 1 - gateError;
		const decoherenceContribution = 1 - decoherenceError;
		const readoutErrorContribution = 1 - readoutError;
		const crosstalkContribution = 1 - crosstalkError;

		// Confidence interval (±10% typical uncertainty)
		const confidenceInterval: [number, number] = [
			Math.max(0, totalFidelity * 0.9),
			Math.min(1, totalFidelity * 1.1)
		];

		// Identify bottlenecks
		const bottlenecks = this.identifyErrorBottlenecks(circuit, device);

		return {
			totalFidelity,
			gateErrorContribution,
			decoherenceContribution,
			readoutErrorContribution,
			crosstalkContribution,
			confidenceInterval,
			bottlenecks
		};
	}

	/**
	 * Estimate gate fidelity
	 */
	estimateGateFidelity(gates: Gate[], device: DeviceSpec): number {
		let fidelity = 1.0;

		for (const gate of gates) {
			const gateFidelity = device.gateFidelities.get(gate.type as GateType);
			if (gateFidelity) {
				fidelity *= gateFidelity;
			} else {
				// Default fidelity for unknown gates
				fidelity *= gate.qubits.length === 1 ? 0.999 : 0.99;
			}
		}

		return fidelity;
	}

	/**
	 * Estimate decoherence error
	 */
	estimateDecoherenceError(circuit: Circuit, device: DeviceSpec): number {
		// Calculate circuit depth
		const depth = circuit.gates.length > 0 
			? Math.max(...circuit.gates.map(g => g.layer || 0)) + 1 
			: 0;

		// Average T2 time
		const avgT2 = device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / device.coherenceTimes.T2.length;

		// Estimate gate time (typical: 50ns single-qubit, 200ns two-qubit)
		const avgGateTime = 0.1; // μs
		const totalTime = depth * avgGateTime;

		// Decoherence factor: exp(-t/T2)
		const decoherenceFactor = Math.exp(-totalTime / avgT2);

		return decoherenceFactor;
	}

	/**
	 * Estimate readout error
	 */
	estimateReadoutError(qubits: number[], device: DeviceSpec): number {
		let fidelity = 1.0;

		for (const qubit of qubits) {
			if (qubit < device.readoutErrors.length) {
				const readoutFidelity = 1 - device.readoutErrors[qubit];
				fidelity *= readoutFidelity;
			}
		}

		return fidelity;
	}

	/**
	 * Estimate crosstalk error
	 */
	estimateCrosstalkError(circuit: Circuit, device: DeviceSpec): number {
		let fidelity = 1.0;

		// Group gates by layer
		const layers = new Map<number, Gate[]>();
		circuit.gates.forEach(gate => {
			const layer = gate.layer || 0;
			if (!layers.has(layer)) {
				layers.set(layer, []);
			}
			layers.get(layer)!.push(gate);
		});

		// Calculate crosstalk for each layer
		layers.forEach(layerGates => {
			if (layerGates.length > 1) {
				// Check all pairs of gates in the layer
				for (let i = 0; i < layerGates.length; i++) {
					for (let j = i + 1; j < layerGates.length; j++) {
						const gate1 = layerGates[i];
						const gate2 = layerGates[j];

						// Calculate crosstalk between gate qubits
						for (const q1 of gate1.qubits) {
							for (const q2 of gate2.qubits) {
								if (q1 < device.qubits && q2 < device.qubits) {
									const crosstalk = device.crosstalkMatrix[q1][q2];
									fidelity *= (1 - crosstalk);
								}
							}
						}
					}
				}
			}
		});

		return fidelity;
	}

	/**
	 * Identify error bottlenecks
	 */
	identifyErrorBottlenecks(circuit: Circuit, device: DeviceSpec): ErrorBottleneck[] {
		const bottlenecks: ErrorBottleneck[] = [];

		// Check gate errors
		const gateErrors = new Map<string, number>();
		circuit.gates.forEach((gate, idx) => {
			const gateFidelity = device.gateFidelities.get(gate.type as GateType) || 0.99;
			const errorRate = 1 - gateFidelity;
			if (errorRate > 0.01) { // 1% threshold
				gateErrors.set(`gate_${idx}`, errorRate);
			}
		});

		// Find worst gates
		const sortedGateErrors = Array.from(gateErrors.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3);

		sortedGateErrors.forEach(([location, errorRate]) => {
			bottlenecks.push({
				type: 'gate',
				location,
				errorRate,
				impact: errorRate / 0.1, // Normalize to 10% max
				recommendation: 'Consider gate decomposition or pulse optimization'
			});
		});

		// Check decoherence
		const depth = circuit.gates.length > 0 
			? Math.max(...circuit.gates.map(g => g.layer || 0)) + 1 
			: 0;
		const avgT2 = device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / device.coherenceTimes.T2.length;
		const avgGateTime = 0.1;
		const totalTime = depth * avgGateTime;

		if (totalTime > avgT2 * 0.3) {
			const decoherenceError = 1 - Math.exp(-totalTime / avgT2);
			bottlenecks.push({
				type: 'decoherence',
				location: 'circuit_depth',
				errorRate: decoherenceError,
				impact: decoherenceError / 0.5,
				recommendation: 'Reduce circuit depth or use shorter coherence time qubits'
			});
		}

		// Check readout errors
		const maxReadoutError = Math.max(...device.readoutErrors);
		if (maxReadoutError > 0.03) {
			bottlenecks.push({
				type: 'readout',
				location: `qubit_${device.readoutErrors.indexOf(maxReadoutError)}`,
				errorRate: maxReadoutError,
				impact: maxReadoutError / 0.1,
				recommendation: 'Apply readout error mitigation'
			});
		}

		return bottlenecks.sort((a, b) => b.impact - a.impact);
	}

	/**
	 * Calculate confidence interval
	 */
	calculateConfidenceInterval(estimate: FidelityEstimate): [number, number] {
		return estimate.confidenceInterval;
	}

	/**
	 * Compare fidelity across devices
	 */
	compareFidelityAcrossDevices(circuit: Circuit, devices: DeviceSpec[]): FidelityComparison {
		const fidelities = devices.map(device => ({
			deviceId: device.id,
			fidelity: this.estimateCircuitFidelity(circuit, device).totalFidelity,
			rank: 0
		}));

		// Sort by fidelity
		fidelities.sort((a, b) => b.fidelity - a.fidelity);

		// Assign ranks
		fidelities.forEach((item, index) => {
			item.rank = index + 1;
		});

		const fidelityValues = fidelities.map(f => f.fidelity);

		return {
			devices: fidelities,
			bestDevice: fidelities[0].deviceId,
			worstDevice: fidelities[fidelities.length - 1].deviceId,
			fidelityRange: [Math.min(...fidelityValues), Math.max(...fidelityValues)]
		};
	}
}

/**
 * Circuit Matcher - Circuit-device compatibility analysis
 */

import { DeviceSpec, Circuit, Gate } from '../providers/ProviderInterfaces';
import { GateType } from '../DeviceCharacterization';

export interface CompatibilityReport {
	compatible: boolean;
	score: number;
	issues: Issue[];
	recommendations: Recommendation[];
	estimatedFidelity: number;
}

export interface Issue {
	severity: 'critical' | 'warning' | 'info';
	category: 'qubits' | 'connectivity' | 'gates' | 'depth' | 'coherence';
	message: string;
	details?: any;
}

export interface Recommendation {
	priority: 'high' | 'medium' | 'low';
	action: string;
	expectedImprovement?: string;
}

export interface ValidationResult {
	valid: boolean;
	message: string;
	details?: any;
}

export class CircuitMatcher {
	/**
	 * Check circuit-device compatibility
	 */
	checkCompatibility(circuit: Circuit, device: DeviceSpec): CompatibilityReport {
		const issues: Issue[] = [];
		const recommendations: Recommendation[] = [];

		// Validate qubit count
		const qubitValidation = this.validateQubitCount(circuit, device);
		if (!qubitValidation.valid) {
			issues.push({
				severity: 'critical',
				category: 'qubits',
				message: qubitValidation.message,
				details: qubitValidation.details
			});
		}

		// Validate connectivity
		const connectivityValidation = this.validateConnectivity(circuit, device);
		if (!connectivityValidation.valid) {
			issues.push({
				severity: 'warning',
				category: 'connectivity',
				message: connectivityValidation.message,
				details: connectivityValidation.details
			});
			recommendations.push({
				priority: 'high',
				action: 'Use qubit mapping with SWAP insertion',
				expectedImprovement: 'Enable execution on this device'
			});
		}

		// Validate gate set
		const gateValidation = this.validateGateSet(circuit, device);
		if (!gateValidation.valid) {
			issues.push({
				severity: 'warning',
				category: 'gates',
				message: gateValidation.message,
				details: gateValidation.details
			});
			recommendations.push({
				priority: 'medium',
				action: 'Apply gate decomposition',
				expectedImprovement: 'Convert unsupported gates to native gates'
			});
		}

		// Validate depth
		const depthValidation = this.validateDepth(circuit, device);
		if (!depthValidation.valid) {
			issues.push({
				severity: 'warning',
				category: 'depth',
				message: depthValidation.message,
				details: depthValidation.details
			});
			recommendations.push({
				priority: 'high',
				action: 'Reduce circuit depth or use error mitigation',
				expectedImprovement: 'Improve result fidelity'
			});
		}

		// Calculate compatibility score
		const score = this.calculateCompatibilityScore(circuit, device);

		// Estimate fidelity
		const estimatedFidelity = this.estimateFidelity(circuit, device);

		// Add general recommendations
		if (score < 0.7) {
			recommendations.push({
				priority: 'high',
				action: 'Consider alternative devices',
				expectedImprovement: 'Better compatibility and performance'
			});
		}

		return {
			compatible: issues.filter(i => i.severity === 'critical').length === 0,
			score,
			issues,
			recommendations,
			estimatedFidelity
		};
	}

	/**
	 * Find compatible devices
	 */
	findCompatibleDevices(circuit: Circuit, devices: DeviceSpec[]): DeviceSpec[] {
		return devices.filter(device => {
			const report = this.checkCompatibility(circuit, device);
			return report.compatible;
		});
	}

	/**
	 * Calculate compatibility score
	 */
	calculateCompatibilityScore(circuit: Circuit, device: DeviceSpec): number {
		let score = 1.0;

		// Qubit count factor
		if (circuit.qubits > device.qubits) {
			return 0; // Incompatible
		}
		const qubitMargin = (device.qubits - circuit.qubits) / device.qubits;
		const qubitScore = Math.min(1, 0.5 + qubitMargin);

		// Connectivity factor
		const connectivityScore = this.calculateConnectivityScore(circuit, device);

		// Gate set factor
		const gateScore = this.calculateGateSetScore(circuit, device);

		// Depth factor
		const circuitDepth = this.estimateCircuitDepth(circuit);
		const depthScore = circuitDepth <= device.maxCircuitDepth ? 1.0 : device.maxCircuitDepth / circuitDepth;

		// Coherence factor
		const avgT2 = device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / device.coherenceTimes.T2.length;
		const coherenceScore = Math.min(1, avgT2 / 100); // Normalize to 100μs

		// Weighted combination
		score = (
			qubitScore * 0.25 +
			connectivityScore * 0.25 +
			gateScore * 0.20 +
			depthScore * 0.15 +
			coherenceScore * 0.15
		);

		return Math.max(0, Math.min(1, score));
	}

	/**
	 * Rank devices by compatibility
	 */
	rankDevicesByCompatibility(circuit: Circuit, devices: DeviceSpec[]): Array<{ device: DeviceSpec; score: number; rank: number }> {
		const ranked = devices
			.map(device => ({
				device,
				score: this.calculateCompatibilityScore(circuit, device),
				rank: 0
			}))
			.sort((a, b) => b.score - a.score);

		ranked.forEach((item, index) => {
			item.rank = index + 1;
		});

		return ranked;
	}

	/**
	 * Validate qubit count
	 */
	validateQubitCount(circuit: Circuit, device: DeviceSpec): ValidationResult {
		if (circuit.qubits > device.qubits) {
			return {
				valid: false,
				message: `Circuit requires ${circuit.qubits} qubits, but device only has ${device.qubits}`,
				details: {
					required: circuit.qubits,
					available: device.qubits,
					shortage: circuit.qubits - device.qubits
				}
			};
		}

		return {
			valid: true,
			message: `Sufficient qubits available (${device.qubits} >= ${circuit.qubits})`,
			details: {
				required: circuit.qubits,
				available: device.qubits,
				margin: device.qubits - circuit.qubits
			}
		};
	}

	/**
	 * Validate connectivity
	 */
	validateConnectivity(circuit: Circuit, device: DeviceSpec): ValidationResult {
		const twoQubitGates = circuit.gates.filter(gate => gate.qubits.length === 2);
		const missingConnections: [number, number][] = [];

		for (const gate of twoQubitGates) {
			const [q1, q2] = gate.qubits;
			if (q1 >= device.qubits || q2 >= device.qubits) continue;

			if (device.topology.adjacencyMatrix[q1][q2] === 0) {
				missingConnections.push([q1, q2]);
			}
		}

		if (missingConnections.length > 0) {
			return {
				valid: false,
				message: `${missingConnections.length} two-qubit gates require non-adjacent qubits`,
				details: {
					missingConnections,
					swapsNeeded: missingConnections.length
				}
			};
		}

		return {
			valid: true,
			message: 'All two-qubit gates can be executed on adjacent qubits',
			details: {
				twoQubitGates: twoQubitGates.length
			}
		};
	}

	/**
	 * Validate gate set
	 */
	validateGateSet(circuit: Circuit, device: DeviceSpec): ValidationResult {
		const usedGates = new Set(circuit.gates.map(g => g.type));
		const unsupportedGates: string[] = [];

		usedGates.forEach(gate => {
			if (!device.nativeGateSet.includes(gate as GateType)) {
				// Check if gate can be decomposed
				if (!this.isDecomposable(gate as GateType, device.nativeGateSet)) {
					unsupportedGates.push(gate);
				}
			}
		});

		if (unsupportedGates.length > 0) {
			return {
				valid: false,
				message: `${unsupportedGates.length} gate types are not supported`,
				details: {
					unsupportedGates,
					nativeGates: device.nativeGateSet
				}
			};
		}

		return {
			valid: true,
			message: 'All gates are natively supported or decomposable',
			details: {
				usedGates: Array.from(usedGates),
				nativeGates: device.nativeGateSet
			}
		};
	}

	/**
	 * Validate circuit depth
	 */
	validateDepth(circuit: Circuit, device: DeviceSpec): ValidationResult {
		const depth = this.estimateCircuitDepth(circuit);
		const avgT2 = device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / device.coherenceTimes.T2.length;
		
		// Estimate gate time (typical: 50ns for single-qubit, 200ns for two-qubit)
		const avgGateTime = 0.1; // μs
		const totalTime = depth * avgGateTime;

		if (depth > device.maxCircuitDepth) {
			return {
				valid: false,
				message: `Circuit depth ${depth} exceeds device limit ${device.maxCircuitDepth}`,
				details: {
					circuitDepth: depth,
					maxDepth: device.maxCircuitDepth,
					excess: depth - device.maxCircuitDepth
				}
			};
		}

		if (totalTime > avgT2 * 0.5) {
			return {
				valid: false,
				message: `Circuit execution time (${totalTime.toFixed(1)}μs) exceeds coherence budget (${(avgT2 * 0.5).toFixed(1)}μs)`,
				details: {
					executionTime: totalTime,
					coherenceTime: avgT2,
					coherenceBudget: avgT2 * 0.5
				}
			};
		}

		return {
			valid: true,
			message: `Circuit depth ${depth} is within device limits`,
			details: {
				circuitDepth: depth,
				maxDepth: device.maxCircuitDepth,
				executionTime: totalTime,
				coherenceTime: avgT2
			}
		};
	}

	/**
	 * Calculate connectivity score
	 */
	private calculateConnectivityScore(circuit: Circuit, device: DeviceSpec): number {
		if (device.topology.type === 'all_to_all') {
			return 1.0; // Perfect connectivity
		}

		const twoQubitGates = circuit.gates.filter(gate => gate.qubits.length === 2);
		if (twoQubitGates.length === 0) return 1.0;

		let connectedGates = 0;
		for (const gate of twoQubitGates) {
			const [q1, q2] = gate.qubits;
			if (q1 < device.qubits && q2 < device.qubits) {
				if (device.topology.adjacencyMatrix[q1][q2] === 1) {
					connectedGates++;
				}
			}
		}

		return connectedGates / twoQubitGates.length;
	}

	/**
	 * Calculate gate set score
	 */
	private calculateGateSetScore(circuit: Circuit, device: DeviceSpec): number {
		const usedGates = new Set(circuit.gates.map(g => g.type));
		let supportedCount = 0;

		usedGates.forEach(gate => {
			if (device.nativeGateSet.includes(gate as GateType) || 
			    this.isDecomposable(gate as GateType, device.nativeGateSet)) {
				supportedCount++;
			}
		});

		return usedGates.size > 0 ? supportedCount / usedGates.size : 1.0;
	}

	/**
	 * Estimate circuit depth
	 */
	private estimateCircuitDepth(circuit: Circuit): number {
		if (circuit.gates.length === 0) return 0;

		// Find maximum layer
		const maxLayer = Math.max(...circuit.gates.map(g => g.layer || 0));
		return maxLayer + 1;
	}

	/**
	 * Check if gate is decomposable
	 */
	private isDecomposable(gate: GateType, nativeGates: GateType[]): boolean {
		// Common decompositions
		const decompositions: { [key: string]: GateType[] } = {
			'CNOT': ['CZ', 'H'],
			'CZ': ['CNOT', 'H'],
			'SWAP': ['CNOT'],
			'CCX': ['CNOT', 'H', 'T'],
			'H': ['RX', 'RZ'],
			'T': ['RZ'],
			'S': ['RZ']
		};

		const decomp = decompositions[gate];
		if (!decomp) return true; // Assume decomposable if not in list

		return decomp.some(g => nativeGates.includes(g));
	}

	/**
	 * Estimate circuit fidelity
	 */
	private estimateFidelity(circuit: Circuit, device: DeviceSpec): number {
		let fidelity = 1.0;

		// Gate fidelity contribution
		for (const gate of circuit.gates) {
			const gateFidelity = device.gateFidelities.get(gate.type as GateType) || 0.95;
			fidelity *= gateFidelity;
		}

		// Decoherence contribution
		const depth = this.estimateCircuitDepth(circuit);
		const avgT2 = device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / device.coherenceTimes.T2.length;
		const avgGateTime = 0.1; // μs
		const totalTime = depth * avgGateTime;
		const decoherenceFactor = Math.exp(-totalTime / avgT2);
		fidelity *= decoherenceFactor;

		// Readout contribution
		const avgReadoutFidelity = 1 - (device.readoutErrors.reduce((a, b) => a + b, 0) / device.readoutErrors.length);
		fidelity *= Math.pow(avgReadoutFidelity, circuit.qubits);

		return Math.max(0, Math.min(1, fidelity));
	}
}

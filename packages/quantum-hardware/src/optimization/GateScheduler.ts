/**
 * Gate Scheduler - Parallel gate execution optimization
 */

import { DeviceSpec, Circuit, Gate } from '../providers/ProviderInterfaces';

export interface ScheduledCircuit {
	circuit: Circuit;
	layers: GateLayer[];
	depth: number;
	parallelizationFactor: number;
}

export interface GateLayer {
	layerIndex: number;
	gates: Gate[];
	parallelGates: number;
}

export interface ScheduleVisualization {
	layers: GateLayer[];
	depth: number;
	totalGates: number;
	parallelizationFactor: number;
	criticalPath: number[];
}

export class GateScheduler {
	/**
	 * Schedule gates for parallel execution
	 */
	scheduleGates(circuit: Circuit, device: DeviceSpec): ScheduledCircuit {
		const layers = this.identifyParallelGates(circuit, device);
		const depth = layers.length;
		const totalGates = circuit.gates.length;
		const parallelGates = layers.reduce((sum, layer) => sum + layer.gates.length, 0);
		const parallelizationFactor = totalGates > 0 ? parallelGates / totalGates : 1;

		// Update gate layers
		const newGates = circuit.gates.map(gate => {
			const layer = layers.findIndex(l => l.gates.some(g => g === gate));
			return { ...gate, layer: layer >= 0 ? layer : 0 };
		});

		return {
			circuit: { ...circuit, gates: newGates },
			layers,
			depth,
			parallelizationFactor
		};
	}

	/**
	 * Identify parallel gates
	 */
	identifyParallelGates(circuit: Circuit, device: DeviceSpec): GateLayer[] {
		const layers: GateLayer[] = [];
		const scheduled = new Set<number>();
		const qubitLastUsed = new Map<number, number>();

		while (scheduled.size < circuit.gates.length) {
			const currentLayer: Gate[] = [];
			const usedQubits = new Set<number>();

			for (let i = 0; i < circuit.gates.length; i++) {
				if (scheduled.has(i)) continue;

				const gate = circuit.gates[i];
				
				// Check if gate can be added to current layer
				if (this.canAddToLayer(gate, usedQubits, device, currentLayer)) {
					currentLayer.push(gate);
					scheduled.add(i);
					gate.qubits.forEach(q => {
						usedQubits.add(q);
						qubitLastUsed.set(q, layers.length);
					});
				}
			}

			if (currentLayer.length === 0) break; // Safety check

			layers.push({
				layerIndex: layers.length,
				gates: currentLayer,
				parallelGates: currentLayer.length
			});
		}

		return layers;
	}

	/**
	 * Check topology constraints
	 */
	respectTopologyConstraints(gates: Gate[], device: DeviceSpec): boolean {
		for (const gate of gates) {
			if (gate.qubits.length === 2) {
				const [q1, q2] = gate.qubits;
				if (q1 >= device.qubits || q2 >= device.qubits) return false;
				if (device.topology.adjacencyMatrix[q1][q2] === 0) return false;
			}
		}
		return true;
	}

	/**
	 * Check crosstalk constraints
	 */
	respectCrosstalkConstraints(gates: Gate[], device: DeviceSpec): boolean {
		// Check all pairs of gates in the layer
		for (let i = 0; i < gates.length; i++) {
			for (let j = i + 1; j < gates.length; j++) {
				const gate1 = gates[i];
				const gate2 = gates[j];

				// Check crosstalk between gate qubits
				for (const q1 of gate1.qubits) {
					for (const q2 of gate2.qubits) {
						if (q1 < device.qubits && q2 < device.qubits) {
							const crosstalk = device.crosstalkMatrix[q1][q2];
							if (crosstalk > 0.01) { // Threshold
								return false;
							}
						}
					}
				}
			}
		}
		return true;
	}

	/**
	 * Minimize circuit depth
	 */
	minimizeDepth(circuit: Circuit, device: DeviceSpec): Circuit {
		const scheduled = this.scheduleGates(circuit, device);
		return scheduled.circuit;
	}

	/**
	 * Balance parallelization
	 */
	balanceParallelization(circuit: Circuit, device: DeviceSpec): Circuit {
		// First schedule normally
		let scheduled = this.scheduleGates(circuit, device);
		
		// Try to redistribute gates for better balance
		const avgGatesPerLayer = circuit.gates.length / scheduled.layers.length;
		
		// Merge small layers
		const balancedLayers: GateLayer[] = [];
		let currentLayer: Gate[] = [];
		
		for (const layer of scheduled.layers) {
			if (currentLayer.length + layer.gates.length <= avgGatesPerLayer * 1.5) {
				currentLayer.push(...layer.gates);
			} else {
				if (currentLayer.length > 0) {
					balancedLayers.push({
						layerIndex: balancedLayers.length,
						gates: currentLayer,
						parallelGates: currentLayer.length
					});
				}
				currentLayer = [...layer.gates];
			}
		}
		
		if (currentLayer.length > 0) {
			balancedLayers.push({
				layerIndex: balancedLayers.length,
				gates: currentLayer,
				parallelGates: currentLayer.length
			});
		}

		return {
			...circuit,
			gates: circuit.gates.map(gate => {
				const layer = balancedLayers.findIndex(l => l.gates.includes(gate));
				return { ...gate, layer: layer >= 0 ? layer : 0 };
			})
		};
	}

	/**
	 * Calculate depth reduction
	 */
	calculateDepthReduction(originalCircuit: Circuit, scheduledCircuit: Circuit): number {
		const originalDepth = this.getCircuitDepth(originalCircuit);
		const scheduledDepth = this.getCircuitDepth(scheduledCircuit);
		
		if (originalDepth === 0) return 0;
		return (originalDepth - scheduledDepth) / originalDepth;
	}

	/**
	 * Calculate parallelization factor
	 */
	calculateParallelizationFactor(circuit: Circuit): number {
		const depth = this.getCircuitDepth(circuit);
		const totalGates = circuit.gates.length;
		
		if (depth === 0) return 1;
		return totalGates / depth;
	}

	/**
	 * Generate schedule visualization
	 */
	generateScheduleVisualization(scheduledCircuit: ScheduledCircuit): ScheduleVisualization {
		const criticalPath = this.findCriticalPath(scheduledCircuit);
		
		return {
			layers: scheduledCircuit.layers,
			depth: scheduledCircuit.depth,
			totalGates: scheduledCircuit.circuit.gates.length,
			parallelizationFactor: scheduledCircuit.parallelizationFactor,
			criticalPath
		};
	}

	/**
	 * Check if gate can be added to current layer
	 */
	private canAddToLayer(gate: Gate, usedQubits: Set<number>, device: DeviceSpec, currentLayer: Gate[]): boolean {
		// Check if any qubit is already used
		for (const qubit of gate.qubits) {
			if (usedQubits.has(qubit)) return false;
		}

		// Check topology constraints for two-qubit gates
		if (gate.qubits.length === 2) {
			const [q1, q2] = gate.qubits;
			if (q1 >= device.qubits || q2 >= device.qubits) return false;
			if (device.topology.adjacencyMatrix[q1][q2] === 0) return false;
		}

		// Check crosstalk with other gates in layer
		for (const existingGate of currentLayer) {
			if (!this.respectCrosstalkConstraints([gate, existingGate], device)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Get circuit depth
	 */
	private getCircuitDepth(circuit: Circuit): number {
		if (circuit.gates.length === 0) return 0;
		return Math.max(...circuit.gates.map(g => g.layer || 0)) + 1;
	}

	/**
	 * Find critical path through circuit
	 */
	private findCriticalPath(scheduledCircuit: ScheduledCircuit): number[] {
		const path: number[] = [];
		
		// Find longest dependency chain
		const dependencies = new Map<number, number[]>();
		
		scheduledCircuit.circuit.gates.forEach((gate, idx) => {
			dependencies.set(idx, []);
			
			// Find gates that must execute before this one
			for (let i = 0; i < idx; i++) {
				const prevGate = scheduledCircuit.circuit.gates[i];
				const hasSharedQubit = gate.qubits.some(q => prevGate.qubits.includes(q));
				
				if (hasSharedQubit) {
					dependencies.get(idx)!.push(i);
				}
			}
		});

		// Find longest path
		let maxLength = 0;
		let endGate = 0;
		
		dependencies.forEach((deps, gate) => {
			const length = this.getPathLength(gate, dependencies);
			if (length > maxLength) {
				maxLength = length;
				endGate = gate;
			}
		});

		// Reconstruct path
		let current = endGate;
		while (current >= 0) {
			path.unshift(current);
			const deps = dependencies.get(current) || [];
			current = deps.length > 0 ? deps[deps.length - 1] : -1;
		}

		return path;
	}

	/**
	 * Get path length for dependency chain
	 */
	private getPathLength(gate: number, dependencies: Map<number, number[]>): number {
		const deps = dependencies.get(gate) || [];
		if (deps.length === 0) return 1;
		
		return 1 + Math.max(...deps.map(d => this.getPathLength(d, dependencies)));
	}
}

/**
 * Hardware-Aware Compiler
 * 
 * Compiles quantum circuits for specific hardware devices
 * - Maps qubits to device topology
 * - Inserts SWAP gates for connectivity
 * - Decomposes to native gates
 * - Schedules to minimize decoherence
 * - Optimizes gate count
 * - Predicts fidelity
 * 
 * MAKES CODE WORK ON REAL HARDWARE!
 */

import { QuantumDevice, GateType } from '../DeviceCharacterization';
import { Circuit, Gate } from '../providers/ProviderInterfaces';

export interface CompiledCircuit {
	originalCircuit: Circuit;
	compiledGates: Gate[];
	qubitMapping: Map<number, number>; // logical -> physical
	swapCount: number;
	estimatedDepth: number;
	estimatedFidelity: number;
	nativeGateCount: Map<GateType, number>;
	compilationTime: number;
	warnings: string[];
}

export interface CompilationOptions {
	optimizationLevel?: 0 | 1 | 2 | 3; // 0=none, 3=aggressive
	allowApproximation?: boolean;
	maxSwaps?: number;
	targetFidelity?: number;
	preserveStructure?: boolean;
}

/**
 * Hardware-Aware Compiler
 */
export class HardwareAwareCompiler {
	private device: QuantumDevice;

	constructor(device: QuantumDevice) {
		this.device = device;
	}

	/**
	 * Compile circuit for the target device
	 */
	compile(circuit: Circuit, options: CompilationOptions = {}): CompiledCircuit {
		const startTime = Date.now();
		const warnings: string[] = [];

		// Set default options
		const opts = {
			optimizationLevel: options.optimizationLevel ?? 2,
			allowApproximation: options.allowApproximation ?? false,
			maxSwaps: options.maxSwaps ?? 100,
			targetFidelity: options.targetFidelity ?? 0.8,
			preserveStructure: options.preserveStructure ?? false
		};

		// Step 1: Validate circuit fits on device
		if (circuit.qubits > this.device.qubits) {
			throw new Error(`Circuit requires ${circuit.qubits} qubits, device has ${this.device.qubits}`);
		}

		// Step 2: Find optimal qubit mapping
		const qubitMapping = this.findOptimalQubitMapping(circuit);
		
		// Step 3: Apply qubit mapping
		let mappedGates = this.applyQubitMapping(circuit.gates, qubitMapping);

		// Step 4: Insert SWAP gates for connectivity
		const { gates: routedGates, swapCount } = this.routeCircuit(mappedGates, qubitMapping);
		mappedGates = routedGates;

		if (swapCount > opts.maxSwaps) {
			warnings.push(`High SWAP count (${swapCount}). Consider different qubit mapping.`);
		}

		// Step 5: Decompose to native gates
		const nativeGates = this.decomposeToNativeGates(mappedGates);

		// Step 6: Optimize gate sequence
		const optimizedGates = opts.optimizationLevel > 0 
			? this.optimizeGateSequence(nativeGates, opts.optimizationLevel)
			: nativeGates;

		// Step 7: Schedule gates to minimize decoherence
		const scheduledGates = this.scheduleGates(optimizedGates);

		// Step 8: Calculate metrics
		const estimatedDepth = this.calculateCircuitDepth(scheduledGates);
		const estimatedFidelity = this.estimateFidelity(scheduledGates, estimatedDepth);
		const nativeGateCount = this.countGates(scheduledGates);

		if (estimatedFidelity < opts.targetFidelity) {
			warnings.push(`Estimated fidelity ${estimatedFidelity.toFixed(3)} below target ${opts.targetFidelity}`);
		}

		if (estimatedDepth > this.device.maxCircuitDepth) {
			warnings.push(`Circuit depth ${estimatedDepth} exceeds device limit ${this.device.maxCircuitDepth}`);
		}

		const compilationTime = Date.now() - startTime;

		return {
			originalCircuit: circuit,
			compiledGates: scheduledGates,
			qubitMapping,
			swapCount,
			estimatedDepth,
			estimatedFidelity,
			nativeGateCount,
			compilationTime,
			warnings
		};
	}

	/**
	 * Find optimal qubit mapping using device topology and calibration
	 */
	private findOptimalQubitMapping(circuit: Circuit): Map<number, number> {
		const mapping = new Map<number, number>();
		
		// Analyze circuit connectivity
		const circuitGraph = this.buildCircuitConnectivity(circuit.gates);
		
		// Find best qubits based on:
		// 1. Coherence times (T1, T2)
		// 2. Gate fidelities
		// 3. Readout errors
		// 4. Topology match
		
		const qubitScores = this.scorePhysicalQubits(circuitGraph);
		const sortedQubits = Array.from(qubitScores.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([qubit]) => qubit);

		// Assign logical qubits to best physical qubits
		for (let logical = 0; logical < circuit.qubits; logical++) {
			mapping.set(logical, sortedQubits[logical]);
		}

		return mapping;
	}

	/**
	 * Build circuit connectivity graph
	 */
	private buildCircuitConnectivity(gates: Gate[]): Map<number, Set<number>> {
		const graph = new Map<number, Set<number>>();

		gates.forEach(gate => {
			if (gate.qubits.length === 2) {
				const [q1, q2] = gate.qubits;
				
				if (!graph.has(q1)) graph.set(q1, new Set());
				if (!graph.has(q2)) graph.set(q2, new Set());
				
				graph.get(q1)!.add(q2);
				graph.get(q2)!.add(q1);
			}
		});

		return graph;
	}

	/**
	 * Score physical qubits based on quality metrics
	 */
	private scorePhysicalQubits(circuitGraph: Map<number, Set<number>>): Map<number, number> {
		const scores = new Map<number, number>();

		for (let i = 0; i < this.device.qubits; i++) {
			let score = 0;

			// Coherence time score (40% weight)
			const t1 = this.device.coherenceTimes.T1[i];
			const t2 = this.device.coherenceTimes.T2[i];
			const avgT1 = this.device.coherenceTimes.T1.reduce((a, b) => a + b, 0) / this.device.qubits;
			const avgT2 = this.device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / this.device.qubits;
			score += 0.4 * ((t1 / avgT1 + t2 / avgT2) / 2);

			// Readout error score (30% weight)
			const readoutError = this.device.readoutErrors[i];
			const avgReadoutError = this.device.readoutErrors.reduce((a, b) => a + b, 0) / this.device.qubits;
			score += 0.3 * (1 - readoutError / avgReadoutError);

			// Connectivity score (30% weight)
			const connectivity = this.device.topology.adjacencyMatrix[i].reduce((a, b) => a + b, 0);
			const maxConnectivity = Math.max(...this.device.topology.adjacencyMatrix.map(row => row.reduce((a, b) => a + b, 0)));
			score += 0.3 * (connectivity / maxConnectivity);

			scores.set(i, score);
		}

		return scores;
	}

	/**
	 * Apply qubit mapping to gates
	 */
	private applyQubitMapping(gates: Gate[], mapping: Map<number, number>): Gate[] {
		return gates.map(gate => ({
			...gate,
			qubits: gate.qubits.map(q => mapping.get(q) ?? q)
		}));
	}

	/**
	 * Route circuit by inserting SWAP gates for connectivity
	 */
	private routeCircuit(gates: Gate[], initialMapping: Map<number, number>): { gates: Gate[]; swapCount: number } {
		const routedGates: Gate[] = [];
		let swapCount = 0;
		const currentMapping = new Map(initialMapping);

		for (const gate of gates) {
			if (gate.qubits.length === 1) {
				// Single-qubit gates don't need routing
				routedGates.push(gate);
			} else if (gate.qubits.length === 2) {
				const [q1, q2] = gate.qubits;

				// Check if qubits are connected
				if (this.areConnected(q1, q2)) {
					routedGates.push(gate);
				} else {
					// Need to insert SWAPs
					const path = this.findShortestPath(q1, q2);
					
					if (!path) {
						throw new Error(`No path found between qubits ${q1} and ${q2}`);
					}

					// Insert SWAP gates along path
					for (let i = 0; i < path.length - 1; i++) {
						routedGates.push({
							type: 'SWAP',
							qubits: [path[i], path[i + 1]]
						});
						swapCount++;
					}

					// Now qubits are adjacent, apply gate
					routedGates.push(gate);
				}
			}
		}

		return { gates: routedGates, swapCount };
	}

	/**
	 * Check if two qubits are connected in device topology
	 */
	private areConnected(q1: number, q2: number): boolean {
		return this.device.topology.adjacencyMatrix[q1][q2] === 1;
	}

	/**
	 * Find shortest path between qubits using BFS
	 */
	private findShortestPath(source: number, target: number): number[] | null {
		if (source === target) return [source];

		const queue: [number, number[]][] = [[source, [source]]];
		const visited = new Set<number>([source]);

		while (queue.length > 0) {
			const [current, path] = queue.shift()!;

			for (let neighbor = 0; neighbor < this.device.qubits; neighbor++) {
				if (this.device.topology.adjacencyMatrix[current][neighbor] === 1) {
					if (neighbor === target) {
						return [...path, neighbor];
					}

					if (!visited.has(neighbor)) {
						visited.add(neighbor);
						queue.push([neighbor, [...path, neighbor]]);
					}
				}
			}
		}

		return null;
	}

	/**
	 * Decompose gates to device native gate set
	 */
	private decomposeToNativeGates(gates: Gate[]): Gate[] {
		const nativeGates: Gate[] = [];
		const deviceNativeGates = Array.from(this.device.gateFidelities.keys());

		for (const gate of gates) {
			if (deviceNativeGates.includes(gate.type)) {
				// Already native
				nativeGates.push(gate);
			} else {
				// Decompose to native gates
				const decomposed = this.decomposeGate(gate, deviceNativeGates);
				nativeGates.push(...decomposed);
			}
		}

		return nativeGates;
	}

	/**
	 * Decompose a single gate to native gates
	 */
	private decomposeGate(gate: Gate, nativeGates: GateType[]): Gate[] {
		// Common decompositions
		switch (gate.type) {
			case 'H':
				// H = RZ(π) RY(π/2)
				if (nativeGates.includes('RZ') && nativeGates.includes('RY')) {
					return [
						{ type: 'RZ', qubits: gate.qubits, parameters: [Math.PI] },
						{ type: 'RY', qubits: gate.qubits, parameters: [Math.PI / 2] }
					];
				}
				break;

			case 'CNOT':
				// CNOT decomposition depends on native 2-qubit gate
				if (nativeGates.includes('CZ')) {
					// CNOT = H(target) CZ H(target)
					return [
						{ type: 'H', qubits: [gate.qubits[1]] },
						{ type: 'CZ', qubits: gate.qubits },
						{ type: 'H', qubits: [gate.qubits[1]] }
					];
				}
				break;

			case 'T':
				// T = RZ(π/4)
				if (nativeGates.includes('RZ')) {
					return [{ type: 'RZ', qubits: gate.qubits, parameters: [Math.PI / 4] }];
				}
				break;

			case 'S':
				// S = RZ(π/2)
				if (nativeGates.includes('RZ')) {
					return [{ type: 'RZ', qubits: gate.qubits, parameters: [Math.PI / 2] }];
				}
				break;
		}

		// If no decomposition found, return original gate
		return [gate];
	}

	/**
	 * Optimize gate sequence
	 */
	private optimizeGateSequence(gates: Gate[], level: number): Gate[] {
		let optimized = [...gates];

		if (level >= 1) {
			// Level 1: Cancel adjacent inverse gates
			optimized = this.cancelInverseGates(optimized);
		}

		if (level >= 2) {
			// Level 2: Merge rotation gates
			optimized = this.mergeRotations(optimized);
		}

		if (level >= 3) {
			// Level 3: Commute gates for better parallelization
			optimized = this.commuteGates(optimized);
		}

		return optimized;
	}

	/**
	 * Cancel adjacent inverse gates (e.g., X X = I)
	 */
	private cancelInverseGates(gates: Gate[]): Gate[] {
		const optimized: Gate[] = [];
		let i = 0;

		while (i < gates.length) {
			if (i < gates.length - 1) {
				const g1 = gates[i];
				const g2 = gates[i + 1];

				// Check if gates are inverses
				if (this.areInverseGates(g1, g2)) {
					i += 2; // Skip both gates
					continue;
				}
			}

			optimized.push(gates[i]);
			i++;
		}

		return optimized;
	}

	/**
	 * Check if two gates are inverses
	 */
	private areInverseGates(g1: Gate, g2: Gate): boolean {
		if (g1.type !== g2.type) return false;
		if (g1.qubits.length !== g2.qubits.length) return false;
		if (!g1.qubits.every((q, i) => q === g2.qubits[i])) return false;

		// Self-inverse gates
		const selfInverse = ['X', 'Y', 'Z', 'H', 'CNOT', 'SWAP'];
		return selfInverse.includes(g1.type);
	}

	/**
	 * Merge adjacent rotation gates
	 */
	private mergeRotations(gates: Gate[]): Gate[] {
		const optimized: Gate[] = [];
		let i = 0;

		while (i < gates.length) {
			if (i < gates.length - 1) {
				const g1 = gates[i];
				const g2 = gates[i + 1];

				// Merge RZ gates on same qubit
				if (g1.type === 'RZ' && g2.type === 'RZ' && 
					g1.qubits[0] === g2.qubits[0] &&
					g1.parameters && g2.parameters) {
					const angle = g1.parameters[0] + g2.parameters[0];
					optimized.push({
						type: 'RZ',
						qubits: g1.qubits,
						parameters: [angle]
					});
					i += 2;
					continue;
				}
			}

			optimized.push(gates[i]);
			i++;
		}

		return optimized;
	}

	/**
	 * Commute gates for better parallelization
	 */
	private commuteGates(gates: Gate[]): Gate[] {
		// Simple commutation: move single-qubit gates earlier if they don't conflict
		const optimized = [...gates];
		
		for (let i = 1; i < optimized.length; i++) {
			if (optimized[i].qubits.length === 1) {
				// Try to move this gate earlier
				let j = i - 1;
				while (j >= 0 && this.canCommute(optimized[j], optimized[i])) {
					// Swap gates
					[optimized[j], optimized[j + 1]] = [optimized[j + 1], optimized[j]];
					j--;
				}
			}
		}

		return optimized;
	}

	/**
	 * Check if two gates can commute
	 */
	private canCommute(g1: Gate, g2: Gate): boolean {
		// Gates on different qubits always commute
		const qubits1 = new Set(g1.qubits);
		const qubits2 = new Set(g2.qubits);
		
		for (const q of qubits1) {
			if (qubits2.has(q)) return false;
		}

		return true;
	}

	/**
	 * Schedule gates to minimize decoherence
	 */
	private scheduleGates(gates: Gate[]): Gate[] {
		// Assign layer numbers for parallel execution
		const scheduled = gates.map(gate => ({ ...gate, layer: 0 }));
		const qubitLastLayer = new Map<number, number>();

		for (const gate of scheduled) {
			// Find latest layer of qubits involved
			let maxLayer = 0;
			for (const qubit of gate.qubits) {
				maxLayer = Math.max(maxLayer, qubitLastLayer.get(qubit) ?? 0);
			}

			// Assign gate to next layer
			gate.layer = maxLayer + 1;

			// Update qubit last layers
			for (const qubit of gate.qubits) {
				qubitLastLayer.set(qubit, gate.layer);
			}
		}

		return scheduled;
	}

	/**
	 * Calculate circuit depth (number of layers)
	 */
	private calculateCircuitDepth(gates: Gate[]): number {
		return Math.max(...gates.map(g => g.layer ?? 0), 0);
	}

	/**
	 * Estimate circuit fidelity
	 * F = ∏ F_gate × e^(-t/T1) × e^(-t/T2)
	 */
	private estimateFidelity(gates: Gate[], depth: number): number {
		let fidelity = 1.0;

		// Gate fidelity contribution
		for (const gate of gates) {
			const gateFidelity = this.device.gateFidelities.get(gate.type) ?? 0.95;
			fidelity *= gateFidelity;
		}

		// Decoherence contribution
		const avgT1 = this.device.coherenceTimes.T1.reduce((a, b) => a + b, 0) / this.device.qubits;
		const avgT2 = this.device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / this.device.qubits;
		
		// Estimate time per layer (rough approximation)
		const timePerLayer = 0.1; // microseconds
		const totalTime = depth * timePerLayer;
		
		const decoherenceFactor = Math.exp(-totalTime / avgT1) * Math.exp(-totalTime / avgT2);
		fidelity *= decoherenceFactor;

		// Readout fidelity
		const avgReadoutFidelity = 1 - (this.device.readoutErrors.reduce((a, b) => a + b, 0) / this.device.qubits);
		fidelity *= avgReadoutFidelity;

		return Math.max(0, Math.min(1, fidelity));
	}

	/**
	 * Count gates by type
	 */
	private countGates(gates: Gate[]): Map<GateType, number> {
		const counts = new Map<GateType, number>();

		for (const gate of gates) {
			counts.set(gate.type, (counts.get(gate.type) ?? 0) + 1);
		}

		return counts;
	}
}

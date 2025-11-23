/**
 * Qubit Mapper - Optimal qubit mapping with SWAP optimization
 */

import { DeviceSpec, Circuit, Gate } from '../providers/ProviderInterfaces';
import { GateType } from '../DeviceCharacterization';

export interface QubitMapping {
	logicalToPhysical: Map<number, number>;
	physicalToLogical: Map<number, number>;
	swapGates: Gate[];
	quality: number;
}

export interface MappingMetrics {
	swapOverhead: number;
	fidelityImpact: number;
	depthIncrease: number;
}

export class QubitMapper {
	/**
	 * Generate initial qubit mapping
	 */
	generateInitialMapping(circuit: Circuit, device: DeviceSpec): QubitMapping {
		const logicalToPhysical = new Map<number, number>();
		const physicalToLogical = new Map<number, number>();

		if (device.topology.type === 'all_to_all') {
			// Simple 1:1 mapping for all-to-all connectivity
			for (let i = 0; i < circuit.qubits; i++) {
				logicalToPhysical.set(i, i);
				physicalToLogical.set(i, i);
			}
		} else {
			// Use graph-based initial mapping
			const mapping = this.graphBasedMapping(circuit, device);
			mapping.forEach((physical, logical) => {
				logicalToPhysical.set(logical, physical);
				physicalToLogical.set(physical, logical);
			});
		}

		return {
			logicalToPhysical,
			physicalToLogical,
			swapGates: [],
			quality: this.calculateMappingQuality({ logicalToPhysical, physicalToLogical, swapGates: [], quality: 0 }, circuit, device)
		};
	}

	/**
	 * Optimize qubit mapping
	 */
	optimizeMapping(mapping: QubitMapping, circuit: Circuit, device: DeviceSpec): QubitMapping {
		let currentMapping = { ...mapping };
		let bestMapping = { ...mapping };
		let bestQuality = this.calculateMappingQuality(mapping, circuit, device);

		// Iterative improvement
		const maxIterations = 100;
		for (let iter = 0; iter < maxIterations; iter++) {
			// Try swapping pairs of qubits
			const improved = this.trySwapImprovement(currentMapping, circuit, device);
			
			if (improved.quality > bestQuality) {
				bestMapping = improved;
				bestQuality = improved.quality;
				currentMapping = improved;
			} else {
				break; // No improvement found
			}
		}

		return bestMapping;
	}

	/**
	 * Insert SWAP gates for non-adjacent operations
	 */
	insertSwaps(circuit: Circuit, mapping: QubitMapping, device: DeviceSpec): Circuit {
		const newGates: Gate[] = [];
		const currentMapping = new Map(mapping.logicalToPhysical);

		for (const gate of circuit.gates) {
			if (gate.qubits.length === 2) {
				const [logical1, logical2] = gate.qubits;
				let physical1 = currentMapping.get(logical1)!;
				let physical2 = currentMapping.get(logical2)!;

				// Check if qubits are adjacent
				if (device.topology.adjacencyMatrix[physical1][physical2] === 0) {
					// Need to insert SWAPs
					const path = this.findShortestPath(device, physical1, physical2);
					
					// Insert SWAP gates along the path
					for (let i = 0; i < path.length - 1; i++) {
						newGates.push({
							type: 'SWAP',
							qubits: [path[i], path[i + 1]],
							layer: gate.layer
						});

						// Update mapping
						const temp = currentMapping.get(logical1)!;
						currentMapping.set(logical1, path[i + 1]);
						// Update reverse mapping as needed
					}

					physical1 = currentMapping.get(logical1)!;
					physical2 = currentMapping.get(logical2)!;
				}

				// Add the actual gate with physical qubits
				newGates.push({
					...gate,
					qubits: [physical1, physical2]
				});
			} else {
				// Single-qubit gate
				const logical = gate.qubits[0];
				const physical = currentMapping.get(logical)!;
				newGates.push({
					...gate,
					qubits: [physical]
				});
			}
		}

		return {
			...circuit,
			gates: newGates
		};
	}

	/**
	 * Minimize SWAP count
	 */
	minimizeSwapCount(circuit: Circuit, device: DeviceSpec): Circuit {
		// Generate initial mapping
		let mapping = this.generateInitialMapping(circuit, device);
		
		// Optimize mapping
		mapping = this.optimizeMapping(mapping, circuit, device);
		
		// Insert SWAPs with optimized mapping
		return this.insertSwaps(circuit, mapping, device);
	}

	/**
	 * Fidelity-aware mapping
	 */
	mapWithFidelityWeights(circuit: Circuit, device: DeviceSpec): QubitMapping {
		const logicalToPhysical = new Map<number, number>();
		const physicalToLogical = new Map<number, number>();

		// Build fidelity-weighted graph
		const fidelityWeights = this.buildFidelityWeights(device);

		// Assign qubits based on gate fidelities
		const twoQubitGates = circuit.gates.filter(g => g.qubits.length === 2);
		const qubitPairs = new Map<string, number>();

		// Count qubit pair interactions
		twoQubitGates.forEach(gate => {
			const [q1, q2] = gate.qubits.sort();
			const key = `${q1}-${q2}`;
			qubitPairs.set(key, (qubitPairs.get(key) || 0) + 1);
		});

		// Sort pairs by interaction frequency
		const sortedPairs = Array.from(qubitPairs.entries())
			.sort((a, b) => b[1] - a[1]);

		// Assign high-interaction pairs to high-fidelity connections
		const usedPhysical = new Set<number>();
		
		for (const [pairKey, count] of sortedPairs) {
			const [l1, l2] = pairKey.split('-').map(Number);
			
			if (!logicalToPhysical.has(l1) && !logicalToPhysical.has(l2)) {
				// Find best physical pair
				const bestPair = this.findBestPhysicalPair(device, fidelityWeights, usedPhysical);
				if (bestPair) {
					logicalToPhysical.set(l1, bestPair[0]);
					logicalToPhysical.set(l2, bestPair[1]);
					physicalToLogical.set(bestPair[0], l1);
					physicalToLogical.set(bestPair[1], l2);
					usedPhysical.add(bestPair[0]);
					usedPhysical.add(bestPair[1]);
				}
			}
		}

		// Assign remaining qubits
		for (let logical = 0; logical < circuit.qubits; logical++) {
			if (!logicalToPhysical.has(logical)) {
				for (let physical = 0; physical < device.qubits; physical++) {
					if (!usedPhysical.has(physical)) {
						logicalToPhysical.set(logical, physical);
						physicalToLogical.set(physical, logical);
						usedPhysical.add(physical);
						break;
					}
				}
			}
		}

		return {
			logicalToPhysical,
			physicalToLogical,
			swapGates: [],
			quality: this.calculateMappingQuality({ logicalToPhysical, physicalToLogical, swapGates: [], quality: 0 }, circuit, device)
		};
	}

	/**
	 * Calculate SWAP overhead
	 */
	calculateSwapOverhead(originalCircuit: Circuit, mappedCircuit: Circuit): number {
		const originalGateCount = originalCircuit.gates.length;
		const swapCount = mappedCircuit.gates.filter(g => g.type === 'SWAP').length;
		
		return swapCount / originalGateCount;
	}

	/**
	 * Calculate mapping quality
	 */
	calculateMappingQuality(mapping: QubitMapping, circuit: Circuit, device: DeviceSpec): number {
		let quality = 1.0;

		// Penalty for SWAPs
		const swapPenalty = mapping.swapGates.length * 0.01;
		quality -= swapPenalty;

		// Reward for high-fidelity connections
		const twoQubitGates = circuit.gates.filter(g => g.qubits.length === 2);
		let totalFidelity = 0;

		for (const gate of twoQubitGates) {
			const [l1, l2] = gate.qubits;
			const p1 = mapping.logicalToPhysical.get(l1);
			const p2 = mapping.logicalToPhysical.get(l2);

			if (p1 !== undefined && p2 !== undefined) {
				// Check if connected
				if (device.topology.adjacencyMatrix[p1][p2] === 1) {
					const gateFidelity = device.gateFidelities.get(gate.type as GateType) || 0.95;
					totalFidelity += gateFidelity;
				}
			}
		}

		if (twoQubitGates.length > 0) {
			quality *= totalFidelity / twoQubitGates.length;
		}

		return Math.max(0, Math.min(1, quality));
	}

	/**
	 * Graph-based initial mapping
	 */
	private graphBasedMapping(circuit: Circuit, device: DeviceSpec): Map<number, number> {
		const mapping = new Map<number, number>();

		// Build circuit interaction graph
		const interactions = new Map<number, Set<number>>();
		for (let i = 0; i < circuit.qubits; i++) {
			interactions.set(i, new Set());
		}

		circuit.gates.filter(g => g.qubits.length === 2).forEach(gate => {
			const [q1, q2] = gate.qubits;
			interactions.get(q1)!.add(q2);
			interactions.get(q2)!.add(q1);
		});

		// Find most connected qubit in circuit
		let maxConnections = 0;
		let mostConnected = 0;
		interactions.forEach((connections, qubit) => {
			if (connections.size > maxConnections) {
				maxConnections = connections.size;
				mostConnected = qubit;
			}
		});

		// Find most connected qubit in device
		let maxDeviceConnections = 0;
		let mostConnectedDevice = 0;
		for (let i = 0; i < device.qubits; i++) {
			const connections = device.topology.adjacencyMatrix[i].reduce((sum, val) => sum + val, 0);
			if (connections > maxDeviceConnections) {
				maxDeviceConnections = connections;
				mostConnectedDevice = i;
			}
		}

		// Start mapping from most connected qubits
		mapping.set(mostConnected, mostConnectedDevice);

		// BFS to map remaining qubits
		const queue = [mostConnected];
		const visited = new Set([mostConnected]);
		const usedPhysical = new Set([mostConnectedDevice]);

		while (queue.length > 0 && visited.size < circuit.qubits) {
			const logical = queue.shift()!;
			const physical = mapping.get(logical)!;

			// Map neighbors
			interactions.get(logical)!.forEach(neighbor => {
				if (!visited.has(neighbor)) {
					// Find adjacent physical qubit
					for (let p = 0; p < device.qubits; p++) {
						if (!usedPhysical.has(p) && device.topology.adjacencyMatrix[physical][p] === 1) {
							mapping.set(neighbor, p);
							usedPhysical.add(p);
							visited.add(neighbor);
							queue.push(neighbor);
							break;
						}
					}
				}
			});
		}

		// Map any remaining unmapped qubits
		for (let logical = 0; logical < circuit.qubits; logical++) {
			if (!mapping.has(logical)) {
				for (let physical = 0; physical < device.qubits; physical++) {
					if (!usedPhysical.has(physical)) {
						mapping.set(logical, physical);
						usedPhysical.add(physical);
						break;
					}
				}
			}
		}

		return mapping;
	}

	/**
	 * Try swap improvement
	 */
	private trySwapImprovement(mapping: QubitMapping, circuit: Circuit, device: DeviceSpec): QubitMapping {
		let bestMapping = mapping;
		let bestQuality = this.calculateMappingQuality(mapping, circuit, device);

		// Try swapping each pair of physical qubits
		const physicalQubits = Array.from(mapping.logicalToPhysical.values());
		
		for (let i = 0; i < physicalQubits.length; i++) {
			for (let j = i + 1; j < physicalQubits.length; j++) {
				const p1 = physicalQubits[i];
				const p2 = physicalQubits[j];

				// Create new mapping with swap
				const newMapping = this.swapPhysicalQubits(mapping, p1, p2);
				const quality = this.calculateMappingQuality(newMapping, circuit, device);

				if (quality > bestQuality) {
					bestMapping = newMapping;
					bestQuality = quality;
				}
			}
		}

		return bestMapping;
	}

	/**
	 * Swap physical qubits in mapping
	 */
	private swapPhysicalQubits(mapping: QubitMapping, p1: number, p2: number): QubitMapping {
		const newL2P = new Map(mapping.logicalToPhysical);
		const newP2L = new Map(mapping.physicalToLogical);

		const l1 = mapping.physicalToLogical.get(p1);
		const l2 = mapping.physicalToLogical.get(p2);

		if (l1 !== undefined && l2 !== undefined) {
			newL2P.set(l1, p2);
			newL2P.set(l2, p1);
			newP2L.set(p1, l2);
			newP2L.set(p2, l1);
		}

		return {
			logicalToPhysical: newL2P,
			physicalToLogical: newP2L,
			swapGates: mapping.swapGates,
			quality: 0
		};
	}

	/**
	 * Find shortest path between qubits
	 */
	private findShortestPath(device: DeviceSpec, start: number, end: number): number[] {
		const queue: number[][] = [[start]];
		const visited = new Set([start]);

		while (queue.length > 0) {
			const path = queue.shift()!;
			const current = path[path.length - 1];

			if (current === end) {
				return path;
			}

			for (let next = 0; next < device.qubits; next++) {
				if (device.topology.adjacencyMatrix[current][next] === 1 && !visited.has(next)) {
					visited.add(next);
					queue.push([...path, next]);
				}
			}
		}

		return [start, end]; // Fallback
	}

	/**
	 * Build fidelity weights for device connections
	 */
	private buildFidelityWeights(device: DeviceSpec): Map<string, number> {
		const weights = new Map<string, number>();

		for (let i = 0; i < device.qubits; i++) {
			for (let j = i + 1; j < device.qubits; j++) {
				if (device.topology.adjacencyMatrix[i][j] === 1) {
					// Use average two-qubit gate fidelity
					const fidelity = Array.from(device.gateFidelities.values())
						.filter((_, idx) => idx > 3) // Skip single-qubit gates
						.reduce((a, b) => a + b, 0) / 3;
					
					weights.set(`${i}-${j}`, fidelity);
				}
			}
		}

		return weights;
	}

	/**
	 * Find best physical qubit pair
	 */
	private findBestPhysicalPair(
		device: DeviceSpec,
		fidelityWeights: Map<string, number>,
		usedPhysical: Set<number>
	): [number, number] | null {
		let bestPair: [number, number] | null = null;
		let bestFidelity = 0;

		for (let i = 0; i < device.qubits; i++) {
			if (usedPhysical.has(i)) continue;
			
			for (let j = i + 1; j < device.qubits; j++) {
				if (usedPhysical.has(j)) continue;
				
				if (device.topology.adjacencyMatrix[i][j] === 1) {
					const fidelity = fidelityWeights.get(`${i}-${j}`) || 0;
					if (fidelity > bestFidelity) {
						bestFidelity = fidelity;
						bestPair = [i, j];
					}
				}
			}
		}

		return bestPair;
	}
}

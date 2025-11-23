/**
 * Device Registry - Central repository for quantum device specifications
 */

import { DeviceSpec, ProviderType, Circuit } from '../providers/ProviderInterfaces';

export interface DeviceSearchCriteria {
	minQubits?: number;
	maxQubits?: number;
	providers?: ProviderType[];
	technologies?: string[];
	minFidelity?: number;
	maxWaitTime?: number;
	topologyTypes?: string[];
	nativeGates?: string[];
}

export interface RankingCriteria {
	fidelityWeight?: number;
	coherenceWeight?: number;
	connectivityWeight?: number;
	queueWeight?: number;
	costWeight?: number;
}

export interface RankedDevice {
	device: DeviceSpec;
	score: number;
	rank: number;
	reasons: string[];
}

export class DeviceRegistry {
	private devices: Map<string, DeviceSpec> = new Map();
	private devicesByProvider: Map<ProviderType, Set<string>> = new Map();
	private devicesByTechnology: Map<string, Set<string>> = new Map();

	/**
	 * Register a new device
	 */
	registerDevice(device: DeviceSpec): void {
		this.devices.set(device.id, device);
		
		// Index by provider
		const providerType = device.provider as ProviderType;
		if (!this.devicesByProvider.has(providerType)) {
			this.devicesByProvider.set(providerType, new Set());
		}
		this.devicesByProvider.get(providerType)!.add(device.id);
		
		// Index by technology
		if (!this.devicesByTechnology.has(device.technology)) {
			this.devicesByTechnology.set(device.technology, new Set());
		}
		this.devicesByTechnology.get(device.technology)!.add(device.id);
	}

	/**
	 * Update device specifications
	 */
	updateDevice(deviceId: string, updates: Partial<DeviceSpec>): void {
		const device = this.devices.get(deviceId);
		if (!device) {
			throw new Error(`Device ${deviceId} not found`);
		}
		
		Object.assign(device, updates);
		this.devices.set(deviceId, device);
	}

	/**
	 * Remove a device from registry
	 */
	removeDevice(deviceId: string): void {
		const device = this.devices.get(deviceId);
		if (!device) return;
		
		this.devices.delete(deviceId);
		this.devicesByProvider.get(device.provider as ProviderType)?.delete(deviceId);
		this.devicesByTechnology.get(device.technology)?.delete(deviceId);
	}

	/**
	 * Get device by ID
	 */
	getDevice(deviceId: string): DeviceSpec | undefined {
		return this.devices.get(deviceId);
	}

	/**
	 * Get all registered devices
	 */
	getAllDevices(): DeviceSpec[] {
		return Array.from(this.devices.values());
	}

	/**
	 * Get devices by provider
	 */
	getDevicesByProvider(provider: ProviderType): DeviceSpec[] {
		const deviceIds = this.devicesByProvider.get(provider);
		if (!deviceIds) return [];
		
		return Array.from(deviceIds)
			.map(id => this.devices.get(id))
			.filter((d): d is DeviceSpec => d !== undefined);
	}

	/**
	 * Get devices by technology
	 */
	getDevicesByTechnology(technology: string): DeviceSpec[] {
		const deviceIds = this.devicesByTechnology.get(technology);
		if (!deviceIds) return [];
		
		return Array.from(deviceIds)
			.map(id => this.devices.get(id))
			.filter((d): d is DeviceSpec => d !== undefined);
	}

	/**
	 * Find devices matching criteria
	 */
	findDevices(criteria: DeviceSearchCriteria): DeviceSpec[] {
		return this.getAllDevices().filter(device => {
			// Qubit count filter
			if (criteria.minQubits && device.qubits < criteria.minQubits) return false;
			if (criteria.maxQubits && device.qubits > criteria.maxQubits) return false;
			
			// Provider filter
			if (criteria.providers && !criteria.providers.includes(device.provider as ProviderType)) return false;
			
			// Technology filter
			if (criteria.technologies && !criteria.technologies.includes(device.technology)) return false;
			
			// Fidelity filter
			if (criteria.minFidelity) {
				const avgFidelity = this.calculateAverageFidelity(device);
				if (avgFidelity < criteria.minFidelity) return false;
			}
			
			// Wait time filter
			if (criteria.maxWaitTime && device.queueInfo.estimatedWaitTime > criteria.maxWaitTime) return false;
			
			// Topology filter
			if (criteria.topologyTypes && !criteria.topologyTypes.includes(device.topology.type)) return false;
			
			// Native gates filter
			if (criteria.nativeGates) {
				const hasAllGates = criteria.nativeGates.every(gate => 
					device.nativeGateSet.includes(gate as any)
				);
				if (!hasAllGates) return false;
			}
			
			return true;
		});
	}

	/**
	 * Rank devices for a specific circuit
	 */
	rankDevices(circuit: Circuit, criteria: RankingCriteria = {}): RankedDevice[] {
		const weights = {
			fidelity: criteria.fidelityWeight || 0.4,
			coherence: criteria.coherenceWeight || 0.3,
			connectivity: criteria.connectivityWeight || 0.15,
			queue: criteria.queueWeight || 0.1,
			cost: criteria.costWeight || 0.05
		};

		const rankedDevices = this.getAllDevices()
			.filter(device => device.qubits >= circuit.qubits)
			.map(device => {
				const score = this.calculateDeviceScore(device, circuit, weights);
				const reasons = this.generateRankingReasons(device, circuit);
				
				return {
					device,
					score,
					rank: 0,
					reasons
				};
			})
			.sort((a, b) => b.score - a.score);

		// Assign ranks
		rankedDevices.forEach((item, index) => {
			item.rank = index + 1;
		});

		return rankedDevices;
	}

	/**
	 * Calculate device score for ranking
	 */
	private calculateDeviceScore(
		device: DeviceSpec,
		circuit: Circuit,
		weights: { fidelity: number; coherence: number; connectivity: number; queue: number; cost: number }
	): number {
		// Fidelity score
		const avgFidelity = this.calculateAverageFidelity(device);
		const fidelityScore = avgFidelity;

		// Coherence score
		const avgT2 = device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / device.coherenceTimes.T2.length;
		const coherenceScore = Math.min(1, avgT2 / 100); // Normalize to 100μs

		// Connectivity score
		const connectivityScore = (device.topology.connectivity || device.topology.edges.length / device.qubits) / device.qubits;

		// Queue score
		const queueScore = Math.max(0, 1 - device.queueInfo.estimatedWaitTime / 300); // Normalize to 5 hours

		// Cost score (lower cost = higher score)
		const costScore = device.pricing ? Math.max(0, 1 - device.pricing.costPerShot / 0.001) : 0.5;

		return (
			fidelityScore * weights.fidelity +
			coherenceScore * weights.coherence +
			connectivityScore * weights.connectivity +
			queueScore * weights.queue +
			costScore * weights.cost
		);
	}

	/**
	 * Calculate average gate fidelity
	 */
	private calculateAverageFidelity(device: DeviceSpec): number {
		const fidelities = Array.from(device.gateFidelities.values());
		if (fidelities.length === 0) return 0;
		
		return fidelities.reduce((a, b) => a + b, 0) / fidelities.length;
	}

	/**
	 * Generate ranking reasons
	 */
	private generateRankingReasons(device: DeviceSpec, circuit: Circuit): string[] {
		const reasons: string[] = [];

		// Qubit advantage
		const qubitMargin = device.qubits - circuit.qubits;
		if (qubitMargin > 50) {
			reasons.push(`Large qubit count (${device.qubits} qubits, ${qubitMargin} more than needed)`);
		} else if (qubitMargin > 0) {
			reasons.push(`Sufficient qubits (${device.qubits} qubits)`);
		}

		// Fidelity
		const avgFidelity = this.calculateAverageFidelity(device);
		if (avgFidelity > 0.995) {
			reasons.push(`High gate fidelity (${(avgFidelity * 100).toFixed(2)}%)`);
		}

		// Coherence
		const avgT2 = device.coherenceTimes.T2.reduce((a, b) => a + b, 0) / device.coherenceTimes.T2.length;
		if (avgT2 > 100) {
			reasons.push(`Long coherence time (T2 = ${avgT2.toFixed(1)}μs)`);
		}

		// Topology
		if (device.topology.type === 'all_to_all') {
			reasons.push('All-to-all connectivity (no SWAP gates needed)');
		} else if ((device.topology.connectivity || 0) > 3) {
			reasons.push(`High connectivity (avg ${(device.topology.connectivity || 0).toFixed(1)} connections per qubit)`);
		}

		// Queue
		if (device.queueInfo.estimatedWaitTime < 30) {
			reasons.push(`Short queue time (${device.queueInfo.estimatedWaitTime} minutes)`);
		}

		// Cost
		if (device.pricing && device.pricing.costPerShot < 0.0003) {
			reasons.push(`Low cost ($${device.pricing.costPerShot.toFixed(5)} per shot)`);
		}

		return reasons;
	}

	/**
	 * Get registry statistics
	 */
	getStatistics(): {
		totalDevices: number;
		devicesByProvider: { [provider: string]: number };
		devicesByTechnology: { [technology: string]: number };
		totalQubits: number;
		averageQubits: number;
	} {
		const devices = this.getAllDevices();
		
		const devicesByProvider: { [provider: string]: number } = {};
		const devicesByTechnology: { [technology: string]: number } = {};
		
		devices.forEach(device => {
			devicesByProvider[device.provider] = (devicesByProvider[device.provider] || 0) + 1;
			devicesByTechnology[device.technology] = (devicesByTechnology[device.technology] || 0) + 1;
		});

		const totalQubits = devices.reduce((sum, device) => sum + device.qubits, 0);

		return {
			totalDevices: devices.length,
			devicesByProvider,
			devicesByTechnology,
			totalQubits,
			averageQubits: devices.length > 0 ? totalQubits / devices.length : 0
		};
	}
}

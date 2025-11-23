/**
 * Unified Quantum Interface - High-level API for quantum hardware optimization
 */

import { DeviceSpec, Circuit, ProviderType, JobId, JobResults } from '../providers/ProviderInterfaces';
import { DeviceRegistry } from '../core/DeviceRegistry';
import { CalibrationManager } from '../core/CalibrationManager';
import { CircuitMatcher } from '../analysis/CircuitMatcher';
import { FidelityEstimator } from '../analysis/FidelityEstimator';
import { CostAnalyzer } from '../analysis/CostAnalyzer';
import { QubitMapper } from '../optimization/QubitMapper';
import { GateScheduler } from '../optimization/GateScheduler';

export interface Constraints {
	maxCost?: number;
	maxWaitTime?: number;
	minFidelity?: number;
	preferredProviders?: ProviderType[];
	requiredTopology?: string;
}

export interface OptimizationOptions {
	enableQubitMapping?: boolean;
	enableGateScheduling?: boolean;
	enablePulseOptimization?: boolean;
	optimizationLevel?: 'basic' | 'standard' | 'aggressive';
}

export interface OptimizedCircuit {
	circuit: Circuit;
	originalCircuit: Circuit;
	optimizations: string[];
	metrics: {
		swapOverhead: number;
		depthReduction: number;
		estimatedFidelity: number;
	};
}

export interface CircuitAnalysis {
	requiredQubits: number;
	circuitDepth: number;
	gateCount: number;
	twoQubitGateCount: number;
	estimatedExecutionTime: number;
	compatibleDevices: number;
	recommendedDevices: DeviceSpec[];
}

export interface CostEstimate {
	device: DeviceSpec;
	totalCost: number;
	costPerShot: number;
	shots: number;
	queueTime: number;
	executionTime: number;
	totalTime: number;
	estimatedFidelity: number;
}

export interface DeviceComparison {
	devices: Array<{
		device: DeviceSpec;
		compatibilityScore: number;
		fidelityEstimate: number;
		cost: number;
		waitTime: number;
		rank: number;
		pros: string[];
		cons: string[];
	}>;
	recommendation: string;
}

export class UnifiedQuantumInterface {
	private deviceRegistry: DeviceRegistry;
	private calibrationManager: CalibrationManager;
	private circuitMatcher: CircuitMatcher;
	private fidelityEstimator: FidelityEstimator;
	private costAnalyzer: CostAnalyzer;
	private qubitMapper: QubitMapper;
	private gateScheduler: GateScheduler;

	constructor() {
		this.deviceRegistry = new DeviceRegistry();
		this.calibrationManager = new CalibrationManager();
		this.circuitMatcher = new CircuitMatcher();
		this.fidelityEstimator = new FidelityEstimator();
		this.costAnalyzer = new CostAnalyzer();
		this.qubitMapper = new QubitMapper();
		this.gateScheduler = new GateScheduler();
	}

	/**
	 * Discover devices from all providers
	 */
	async discoverDevices(providers?: ProviderType[]): Promise<DeviceSpec[]> {
		if (providers) {
			const devices: DeviceSpec[] = [];
			for (const provider of providers) {
				const providerDevices = this.deviceRegistry.getDevicesByProvider(provider);
				devices.push(...providerDevices);
			}
			return devices;
		}
		
		return this.deviceRegistry.getAllDevices();
	}

	/**
	 * Select optimal device for circuit
	 */
	selectOptimalDevice(circuit: Circuit, constraints?: Constraints): DeviceSpec {
		// Get all devices
		let devices = this.deviceRegistry.getAllDevices();

		// Apply constraints
		if (constraints) {
			devices = devices.filter(device => {
				if (constraints.maxWaitTime && device.queueInfo.estimatedWaitTime > constraints.maxWaitTime) {
					return false;
				}
				if (constraints.preferredProviders && !constraints.preferredProviders.includes(device.provider as ProviderType)) {
					return false;
				}
				if (constraints.requiredTopology && device.topology.type !== constraints.requiredTopology) {
					return false;
				}
				return true;
			});
		}

		// Rank devices
		const ranked = this.deviceRegistry.rankDevices(circuit, {
			fidelityWeight: 0.4,
			coherenceWeight: 0.3,
			connectivityWeight: 0.2,
			queueWeight: 0.1
		});

		if (ranked.length === 0) {
			throw new Error('No compatible devices found');
		}

		return ranked[0].device;
	}

	/**
	 * Optimize circuit for device
	 */
	optimizeCircuit(circuit: Circuit, device: DeviceSpec, options?: OptimizationOptions): OptimizedCircuit {
		const opts = {
			enableQubitMapping: true,
			enableGateScheduling: true,
			enablePulseOptimization: false,
			optimizationLevel: 'standard' as const,
			...options
		};

		let optimizedCircuit = { ...circuit };
		const optimizations: string[] = [];
		const originalCircuit = { ...circuit };

		// Qubit mapping
		if (opts.enableQubitMapping) {
			const mapping = this.qubitMapper.generateInitialMapping(circuit, device);
			const optimizedMapping = this.qubitMapper.optimizeMapping(mapping, circuit, device);
			optimizedCircuit = this.qubitMapper.insertSwaps(optimizedCircuit, optimizedMapping, device);
			optimizations.push('Qubit mapping with SWAP optimization');
		}

		// Gate scheduling
		if (opts.enableGateScheduling) {
			const scheduled = this.gateScheduler.scheduleGates(optimizedCircuit, device);
			optimizedCircuit = scheduled.circuit;
			optimizations.push('Gate scheduling for parallelization');
		}

		// Calculate metrics
		const swapOverhead = this.qubitMapper.calculateSwapOverhead(originalCircuit, optimizedCircuit);
		const depthReduction = this.gateScheduler.calculateDepthReduction(originalCircuit, optimizedCircuit);
		const estimatedFidelity = this.fidelityEstimator.estimateCircuitFidelity(optimizedCircuit, device).totalFidelity;

		return {
			circuit: optimizedCircuit,
			originalCircuit,
			optimizations,
			metrics: {
				swapOverhead,
				depthReduction,
				estimatedFidelity
			}
		};
	}

	/**
	 * Execute circuit on device
	 */
	async executeCircuit(circuit: Circuit, device: DeviceSpec, shots: number): Promise<JobResults> {
		// This would integrate with actual provider
		throw new Error('Execution requires provider integration');
	}

	/**
	 * Analyze circuit
	 */
	analyzeCircuit(circuit: Circuit, devices?: DeviceSpec[]): CircuitAnalysis {
		const targetDevices = devices || this.deviceRegistry.getAllDevices();

		// Calculate circuit properties
		const requiredQubits = circuit.qubits;
		const circuitDepth = circuit.gates.length > 0 
			? Math.max(...circuit.gates.map(g => g.layer || 0)) + 1 
			: 0;
		const gateCount = circuit.gates.length;
		const twoQubitGateCount = circuit.gates.filter(g => g.qubits.length === 2).length;

		// Find compatible devices
		const compatibleDevices = this.circuitMatcher.findCompatibleDevices(circuit, targetDevices);

		// Rank devices
		const ranked = this.circuitMatcher.rankDevicesByCompatibility(circuit, compatibleDevices);
		const recommendedDevices = ranked.slice(0, 3).map(r => r.device);

		// Estimate execution time
		const estimatedExecutionTime = compatibleDevices.length > 0
			? this.costAnalyzer.estimateExecutionTime(circuit, compatibleDevices[0])
			: 0;

		return {
			requiredQubits,
			circuitDepth,
			gateCount,
			twoQubitGateCount,
			estimatedExecutionTime,
			compatibleDevices: compatibleDevices.length,
			recommendedDevices
		};
	}

	/**
	 * Estimate cost
	 */
	estimateCost(circuit: Circuit, device: DeviceSpec, shots: number): CostEstimate {
		const cost = this.costAnalyzer.calculateExecutionCost(circuit, device, shots);
		const queueTime = this.costAnalyzer.estimateQueueTime(device);
		const executionTime = this.costAnalyzer.estimateExecutionTime(circuit, device);
		const totalTime = this.costAnalyzer.estimateTotalTime(circuit, device);
		const estimatedFidelity = this.fidelityEstimator.estimateCircuitFidelity(circuit, device).totalFidelity;

		return {
			device,
			totalCost: cost.totalCost,
			costPerShot: cost.costPerShot,
			shots,
			queueTime,
			executionTime,
			totalTime,
			estimatedFidelity
		};
	}

	/**
	 * Compare devices
	 */
	compareDevices(circuit: Circuit, devices: DeviceSpec[]): DeviceComparison {
		const comparisons = devices.map(device => {
			const compatibilityScore = this.circuitMatcher.calculateCompatibilityScore(circuit, device);
			const fidelityEstimate = this.fidelityEstimator.estimateCircuitFidelity(circuit, device).totalFidelity;
			const cost = this.costAnalyzer.calculateExecutionCost(circuit, device, 1000).totalCost;
			const waitTime = device.queueInfo.estimatedWaitTime;

			const pros: string[] = [];
			const cons: string[] = [];

			// Analyze pros
			if (compatibilityScore > 0.8) pros.push('High compatibility');
			if (fidelityEstimate > 0.9) pros.push('High fidelity');
			if (cost < 1.0) pros.push('Low cost');
			if (waitTime < 30) pros.push('Short queue');
			if (device.topology.type === 'all_to_all') pros.push('All-to-all connectivity');

			// Analyze cons
			if (compatibilityScore < 0.5) cons.push('Low compatibility');
			if (fidelityEstimate < 0.7) cons.push('Low fidelity');
			if (cost > 5.0) cons.push('High cost');
			if (waitTime > 120) cons.push('Long queue');
			if (device.qubits < circuit.qubits * 1.5) cons.push('Limited qubit headroom');

			return {
				device,
				compatibilityScore,
				fidelityEstimate,
				cost,
				waitTime,
				rank: 0,
				pros,
				cons
			};
		});

		// Sort by overall score
		comparisons.sort((a, b) => {
			const scoreA = a.compatibilityScore * 0.4 + a.fidelityEstimate * 0.4 - a.cost * 0.1 - a.waitTime / 300 * 0.1;
			const scoreB = b.compatibilityScore * 0.4 + b.fidelityEstimate * 0.4 - b.cost * 0.1 - b.waitTime / 300 * 0.1;
			return scoreB - scoreA;
		});

		// Assign ranks
		comparisons.forEach((item, index) => {
			item.rank = index + 1;
		});

		// Generate recommendation
		const best = comparisons[0];
		const recommendation = `Recommended: ${best.device.name} - ${best.pros.join(', ')}`;

		return {
			devices: comparisons,
			recommendation
		};
	}

	/**
	 * Get device registry
	 */
	getDeviceRegistry(): DeviceRegistry {
		return this.deviceRegistry;
	}

	/**
	 * Get calibration manager
	 */
	getCalibrationManager(): CalibrationManager {
		return this.calibrationManager;
	}
}

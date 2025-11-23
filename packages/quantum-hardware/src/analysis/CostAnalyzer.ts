/**
 * Cost Analyzer - Execution cost and resource analysis
 */

import { DeviceSpec, Circuit } from '../providers/ProviderInterfaces';

export interface Cost {
	totalCost: number;
	costPerShot: number;
	shots: number;
	currency: string;
	breakdown: CostBreakdown;
}

export interface CostBreakdown {
	executionCost: number;
	queueCost: number;
	overheadCost: number;
}

export interface ExecutionPlan {
	device: DeviceSpec;
	shots: number;
	estimatedCost: number;
	estimatedAccuracy: number;
	estimatedTime: number;
	score: number;
}

export interface DeviceRecommendation {
	device: DeviceSpec;
	reason: string;
	costSavings?: number;
	timeSavings?: number;
	accuracyImprovement?: number;
}

export interface CostReport {
	circuit: Circuit;
	devices: Array<{
		device: DeviceSpec;
		cost: Cost;
		time: number;
		accuracy: number;
	}>;
	recommendations: string[];
	optimalDevice: string;
}

export interface CostConstraints {
	maxCost?: number;
	maxTime?: number;
	minAccuracy?: number;
}

export class CostAnalyzer {
	/**
	 * Calculate execution cost
	 */
	calculateExecutionCost(circuit: Circuit, device: DeviceSpec, shots: number): Cost {
		const costPerShot = this.calculateCostPerShot(device);
		const totalCost = costPerShot * shots;

		const breakdown: CostBreakdown = {
			executionCost: totalCost * 0.9,
			queueCost: totalCost * 0.05,
			overheadCost: totalCost * 0.05
		};

		return {
			totalCost,
			costPerShot,
			shots,
			currency: device.pricing?.currency || 'USD',
			breakdown
		};
	}

	/**
	 * Calculate cost per shot
	 */
	calculateCostPerShot(device: DeviceSpec): number {
		if (device.pricing) {
			return device.pricing.costPerShot;
		}

		// Default pricing based on provider
		const defaultPricing: { [provider: string]: number } = {
			'IBM': 0.0,
			'Google': 0.0001,
			'IonQ': 0.00035,
			'Rigetti': 0.0003,
			'AWS_Braket': 0.00035,
			'Azure_Quantum': 0.00035
		};

		return defaultPricing[device.provider] || 0.0001;
	}

	/**
	 * Estimate queue time
	 */
	estimateQueueTime(device: DeviceSpec): number {
		return device.queueInfo.estimatedWaitTime;
	}

	/**
	 * Estimate execution time
	 */
	estimateExecutionTime(circuit: Circuit, device: DeviceSpec): number {
		// Calculate circuit depth
		const depth = circuit.gates.length > 0 
			? Math.max(...circuit.gates.map(g => g.layer || 0)) + 1 
			: 0;

		// Estimate gate time
		const avgGateTime = 0.1; // μs
		const circuitTime = depth * avgGateTime;

		// Add measurement time
		const measurementTime = circuit.measurements.length * 1; // μs per measurement

		// Add overhead (initialization, etc.)
		const overhead = 10; // μs

		return (circuitTime + measurementTime + overhead) / 1000; // Convert to ms
	}

	/**
	 * Estimate total time
	 */
	estimateTotalTime(circuit: Circuit, device: DeviceSpec): number {
		const queueTime = this.estimateQueueTime(device);
		const executionTime = this.estimateExecutionTime(circuit, device);
		
		return queueTime + executionTime / 60; // Convert execution time to minutes
	}

	/**
	 * Optimize cost-accuracy tradeoff
	 */
	optimizeCostAccuracyTradeoff(circuit: Circuit, budget: number): ExecutionPlan[] {
		// This would typically take a list of devices
		// For now, return empty array as placeholder
		return [];
	}

	/**
	 * Suggest alternative devices
	 */
	suggestAlternativeDevices(circuit: Circuit, constraints: CostConstraints): DeviceRecommendation[] {
		// Placeholder - would need device registry
		return [];
	}

	/**
	 * Generate cost report
	 */
	generateCostReport(circuit: Circuit, devices: DeviceSpec[]): CostReport {
		const deviceAnalysis = devices.map(device => {
			const shots = 1000; // Default
			const cost = this.calculateExecutionCost(circuit, device, shots);
			const time = this.estimateTotalTime(circuit, device);
			const accuracy = this.estimateAccuracy(circuit, device, shots);

			return {
				device,
				cost,
				time,
				accuracy
			};
		});

		// Find optimal device (best accuracy per dollar)
		let optimalDevice = devices[0]?.id || '';
		let bestScore = 0;

		deviceAnalysis.forEach(analysis => {
			const score = analysis.accuracy / (analysis.cost.totalCost + 0.01);
			if (score > bestScore) {
				bestScore = score;
				optimalDevice = analysis.device.id;
			}
		});

		// Generate recommendations
		const recommendations: string[] = [];
		
		// Find cheapest option
		const cheapest = deviceAnalysis.reduce((min, curr) => 
			curr.cost.totalCost < min.cost.totalCost ? curr : min
		);
		recommendations.push(`Cheapest option: ${cheapest.device.name} at $${cheapest.cost.totalCost.toFixed(4)}`);

		// Find fastest option
		const fastest = deviceAnalysis.reduce((min, curr) => 
			curr.time < min.time ? curr : min
		);
		recommendations.push(`Fastest option: ${fastest.device.name} at ${fastest.time.toFixed(1)} minutes`);

		// Find most accurate option
		const mostAccurate = deviceAnalysis.reduce((max, curr) => 
			curr.accuracy > max.accuracy ? curr : max
		);
		recommendations.push(`Most accurate: ${mostAccurate.device.name} at ${(mostAccurate.accuracy * 100).toFixed(2)}% fidelity`);

		return {
			circuit,
			devices: deviceAnalysis,
			recommendations,
			optimalDevice
		};
	}

	/**
	 * Estimate accuracy based on shots and device fidelity
	 */
	private estimateAccuracy(circuit: Circuit, device: DeviceSpec, shots: number): number {
		// Base fidelity from device
		const avgFidelity = Array.from(device.gateFidelities.values())
			.reduce((a, b) => a + b, 0) / device.gateFidelities.size;

		// Statistical accuracy from shots
		const statisticalAccuracy = 1 - 1 / Math.sqrt(shots);

		// Combined accuracy
		return avgFidelity * statisticalAccuracy;
	}

	/**
	 * Calculate cost-effectiveness score
	 */
	calculateCostEffectiveness(cost: number, accuracy: number, time: number): number {
		// Weighted score: accuracy is most important, then cost, then time
		const accuracyScore = accuracy;
		const costScore = Math.max(0, 1 - cost / 10); // Normalize to $10
		const timeScore = Math.max(0, 1 - time / 300); // Normalize to 5 hours

		return accuracyScore * 0.5 + costScore * 0.3 + timeScore * 0.2;
	}
}

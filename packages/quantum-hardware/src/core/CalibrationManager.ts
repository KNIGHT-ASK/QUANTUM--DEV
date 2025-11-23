/**
 * Calibration Manager - Real-time calibration data management
 */

import { CalibrationData } from '../DeviceCharacterization';
import { ProviderType, QuantumProvider } from '../providers/ProviderInterfaces';

export interface QualityScore {
	overall: number;
	stability: number;
	recency: number;
	completeness: number;
}

export interface DriftAnalysis {
	hasDrift: boolean;
	driftMagnitude: number;
	affectedQubits: number[];
	affectedGates: string[];
	trend: 'improving' | 'degrading' | 'stable';
	recommendations: string[];
}

export interface ComparisonReport {
	fidelityChanges: { [gate: string]: number };
	coherenceChanges: { T1: number; T2: number };
	overallChange: number;
	significantChanges: string[];
}

export class CalibrationManager {
	private calibrationCache: Map<string, CalibrationData> = new Map();
	private calibrationHistory: Map<string, CalibrationData[]> = new Map();
	private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
	private providers: Map<ProviderType, QuantumProvider> = new Map();

	/**
	 * Register a provider for calibration fetching
	 */
	registerProvider(provider: QuantumProvider): void {
		this.providers.set(provider.providerType, provider);
	}

	/**
	 * Fetch calibration data from provider
	 */
	async fetchCalibration(deviceId: string, provider: ProviderType): Promise<CalibrationData> {
		const providerInstance = this.providers.get(provider);
		if (!providerInstance) {
			throw new Error(`Provider ${provider} not registered`);
		}

		try {
			const calibration = await providerInstance.getCalibrationData(deviceId);
			this.storeCalibration(deviceId, calibration);
			return calibration;
		} catch (error) {
			throw new Error(`Failed to fetch calibration for ${deviceId}: ${error}`);
		}
	}

	/**
	 * Schedule automatic calibration updates
	 */
	scheduleAutoUpdate(deviceId: string, intervalMinutes: number): void {
		// Clear existing interval if any
		const existingInterval = this.updateIntervals.get(deviceId);
		if (existingInterval) {
			clearInterval(existingInterval);
		}

		// Schedule new interval
		const interval = setInterval(async () => {
			try {
				// Determine provider from device ID
				const provider = this.determineProvider(deviceId);
				await this.fetchCalibration(deviceId, provider);
			} catch (error) {
				console.error(`Auto-update failed for ${deviceId}:`, error);
			}
		}, intervalMinutes * 60 * 1000);

		this.updateIntervals.set(deviceId, interval);
	}

	/**
	 * Stop automatic updates for a device
	 */
	stopAutoUpdate(deviceId: string): void {
		const interval = this.updateIntervals.get(deviceId);
		if (interval) {
			clearInterval(interval);
			this.updateIntervals.delete(deviceId);
		}
	}

	/**
	 * Store calibration data
	 */
	storeCalibration(deviceId: string, calibration: CalibrationData): void {
		// Store in cache
		this.calibrationCache.set(deviceId, calibration);

		// Add to history
		if (!this.calibrationHistory.has(deviceId)) {
			this.calibrationHistory.set(deviceId, []);
		}
		
		const history = this.calibrationHistory.get(deviceId)!;
		history.push(calibration);

		// Keep only last 90 days of history (keep last 100 entries)
		if (history.length > 100) {
			history.splice(0, history.length - 100);
		}
		
		this.calibrationHistory.set(deviceId, history);
	}

	/**
	 * Get latest calibration data
	 */
	getLatestCalibration(deviceId: string): CalibrationData | undefined {
		return this.calibrationCache.get(deviceId);
	}

	/**
	 * Get calibration history
	 */
	getCalibrationHistory(deviceId: string, days: number): CalibrationData[] {
		const history = this.calibrationHistory.get(deviceId);
		if (!history) return [];

		// Return last N entries based on days (approximate)
		const entriesToReturn = Math.min(days * 2, history.length); // ~2 entries per day
		return history.slice(-entriesToReturn);
	}

	/**
	 * Calculate calibration quality score
	 */
	calculateCalibrationQuality(calibration: CalibrationData): QualityScore {
		// Recency score - assume recent if no timestamp
		const recency = 0.8; // Default good recency

		// Stability score (based on measurement errors)
		let totalMeasurements = 0;
		let totalError = 0;

		calibration.coherenceData.T1_measurements.forEach(m => {
			totalMeasurements++;
			totalError += m.error / m.value;
		});

		calibration.coherenceData.T2_measurements.forEach(m => {
			totalMeasurements++;
			totalError += m.error / m.value;
		});

		const stability = totalMeasurements > 0 ? Math.max(0, 1 - totalError / totalMeasurements) : 0.5;

		// Completeness score (how much data is available)
		let dataPoints = 0;
		dataPoints += Object.keys(calibration.singleQubitFidelities).length;
		dataPoints += Object.keys(calibration.twoQubitFidelities).length;
		dataPoints += calibration.coherenceData.T1_measurements.length;
		dataPoints += calibration.coherenceData.T2_measurements.length;

		const completeness = Math.min(1, dataPoints / 100); // Normalize to 100 data points

		// Overall score
		const overall = (recency * 0.3 + stability * 0.5 + completeness * 0.2);

		return {
			overall,
			stability,
			recency,
			completeness
		};
	}

	/**
	 * Detect calibration drift
	 */
	detectCalibrationDrift(deviceId: string): DriftAnalysis {
		const history = this.getCalibrationHistory(deviceId, 30);
		
		if (history.length < 2) {
			return {
				hasDrift: false,
				driftMagnitude: 0,
				affectedQubits: [],
				affectedGates: [],
				trend: 'stable',
				recommendations: ['Insufficient history for drift analysis']
			};
		}

		const latest = history[history.length - 1];
		const baseline = history[0];

		// Analyze T1 drift
		const t1Drifts: number[] = [];
		latest.coherenceData.T1_measurements.forEach((latestM, idx) => {
			const baselineM = baseline.coherenceData.T1_measurements[idx];
			if (baselineM) {
				const drift = (latestM.value - baselineM.value) / baselineM.value;
				t1Drifts.push(drift);
			}
		});

		// Analyze T2 drift
		const t2Drifts: number[] = [];
		latest.coherenceData.T2_measurements.forEach((latestM, idx) => {
			const baselineM = baseline.coherenceData.T2_measurements[idx];
			if (baselineM) {
				const drift = (latestM.value - baselineM.value) / baselineM.value;
				t2Drifts.push(drift);
			}
		});

		const avgDrift = [...t1Drifts, ...t2Drifts].reduce((a, b) => a + Math.abs(b), 0) / (t1Drifts.length + t2Drifts.length);
		const hasDrift = avgDrift > 0.1; // 10% threshold

		// Identify affected qubits
		const affectedQubits: number[] = [];
		t1Drifts.forEach((drift, qubit) => {
			if (Math.abs(drift) > 0.15) affectedQubits.push(qubit);
		});

		// Determine trend
		let trend: 'improving' | 'degrading' | 'stable' = 'stable';
		const avgChange = [...t1Drifts, ...t2Drifts].reduce((a, b) => a + b, 0) / (t1Drifts.length + t2Drifts.length);
		if (avgChange > 0.05) trend = 'improving';
		else if (avgChange < -0.05) trend = 'degrading';

		// Generate recommendations
		const recommendations: string[] = [];
		if (hasDrift) {
			recommendations.push('Significant calibration drift detected');
			if (trend === 'degrading') {
				recommendations.push('Device performance is degrading - consider recalibration');
				recommendations.push('Avoid using affected qubits for critical operations');
			}
			if (affectedQubits.length > 0) {
				recommendations.push(`Focus on qubits: ${affectedQubits.join(', ')}`);
			}
		}

		return {
			hasDrift,
			driftMagnitude: avgDrift,
			affectedQubits,
			affectedGates: [],
			trend,
			recommendations
		};
	}

	/**
	 * Compare two calibrations
	 */
	compareCalibrations(cal1: CalibrationData, cal2: CalibrationData): ComparisonReport {
		const fidelityChanges: { [gate: string]: number } = {};
		const significantChanges: string[] = [];

		// Compare single-qubit fidelities
		Object.entries(cal1.singleQubitFidelities).forEach(([qubitStr, gates]) => {
			const qubit = parseInt(qubitStr);
			const cal2Gates = cal2.singleQubitFidelities[qubit];
			if (cal2Gates) {
				Object.entries(gates).forEach(([gate, fidelity]) => {
					const newFidelity = cal2Gates[gate];
					if (newFidelity !== undefined) {
						const change = newFidelity - fidelity;
						fidelityChanges[`q${qubit}_${gate}`] = change;
						
						if (Math.abs(change) > 0.01) {
							significantChanges.push(`Qubit ${qubit} ${gate}: ${(change * 100).toFixed(2)}%`);
						}
					}
				});
			}
		});

		// Compare coherence times
		const t1Changes = cal2.coherenceData.T1_measurements.map((m2, idx) => {
			const m1 = cal1.coherenceData.T1_measurements[idx];
			return m1 ? (m2.value - m1.value) / m1.value : 0;
		});

		const t2Changes = cal2.coherenceData.T2_measurements.map((m2, idx) => {
			const m1 = cal1.coherenceData.T2_measurements[idx];
			return m1 ? (m2.value - m1.value) / m1.value : 0;
		});

		const avgT1Change = t1Changes.reduce((a, b) => a + b, 0) / t1Changes.length;
		const avgT2Change = t2Changes.reduce((a, b) => a + b, 0) / t2Changes.length;

		// Overall change
		const allChanges = Object.values(fidelityChanges);
		const overallChange = allChanges.length > 0 
			? allChanges.reduce((a, b) => a + b, 0) / allChanges.length 
			: 0;

		return {
			fidelityChanges,
			coherenceChanges: {
				T1: avgT1Change,
				T2: avgT2Change
			},
			overallChange,
			significantChanges
		};
	}

	/**
	 * Determine provider from device ID
	 */
	private determineProvider(deviceId: string): ProviderType {
		if (deviceId.includes('ibm')) return 'IBM';
		if (deviceId.includes('google')) return 'Google';
		if (deviceId.includes('ionq')) return 'IonQ';
		if (deviceId.includes('rigetti')) return 'Rigetti';
		if (deviceId.includes('braket')) return 'AWS_Braket';
		if (deviceId.includes('azure')) return 'Azure_Quantum';
		return 'IBM'; // Default
	}

	/**
	 * Cleanup resources
	 */
	cleanup(): void {
		// Stop all auto-update intervals
		this.updateIntervals.forEach(interval => clearInterval(interval));
		this.updateIntervals.clear();
	}
}

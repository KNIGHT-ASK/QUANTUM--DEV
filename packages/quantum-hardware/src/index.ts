/**
 * Quantum Hardware Optimization System
 * Main entry point
 */

// Core exports
export { DeviceRegistry, DeviceSearchCriteria, RankingCriteria, RankedDevice } from './core/DeviceRegistry';
export { CalibrationManager, QualityScore, DriftAnalysis, ComparisonReport } from './core/CalibrationManager';

// Provider exports
export * from './providers/ProviderInterfaces';
export { GoogleQuantumProvider } from './providers/GoogleQuantumProvider';
export { AWSBraketProvider } from './providers/AWSBraketProvider';
export { AzureQuantumProvider } from './providers/AzureQuantumProvider';

// Analysis exports
export { CircuitMatcher, CompatibilityReport, Issue, Recommendation, ValidationResult } from './analysis/CircuitMatcher';
export { FidelityEstimator, FidelityEstimate, ErrorBottleneck, FidelityComparison } from './analysis/FidelityEstimator';
export { CostAnalyzer, Cost, CostBreakdown, ExecutionPlan, DeviceRecommendation, CostReport, CostConstraints } from './analysis/CostAnalyzer';

// Optimization exports
export { QubitMapper, QubitMapping, MappingMetrics } from './optimization/QubitMapper';
export { GateScheduler, ScheduledCircuit, GateLayer, ScheduleVisualization } from './optimization/GateScheduler';

// Integration exports
export { UnifiedQuantumInterface, Constraints, OptimizationOptions, OptimizedCircuit, CircuitAnalysis, CostEstimate, DeviceComparison } from './integration/UnifiedQuantumInterface';
export { PennyLaneAdapter, PennyLaneDeviceInfo, PennyLaneCircuit, PennyLaneOperation, Optimization } from './integration/PennyLaneAdapter';

// Device characterization exports
export { DeviceCharacterization, QuantumDevice, DeviceTopology, GateType, QueueStatus, CalibrationData } from './DeviceCharacterization';

// Error mitigation exports
export { ErrorMitigation, MitigationResult, ZNEConfig, CDRConfig } from './ErrorMitigation';

// Quantum Hardware Manager exports
export { QuantumHardwareManager, QubitTopology, QubitCalibration, GateCalibration } from './QuantumHardwareManager';

// Hardware Integration exports (AGENT 3)
export { RealDeviceCharacterizer, LiveDeviceData, ProviderCredentials } from './hardware/RealDeviceCharacterizer';
export { HardwareAwareCompiler, CompiledCircuit, CompilationOptions } from './hardware/HardwareAwareCompiler';
export { FidelityPredictor, FidelityPrediction, ErrorSource, FidelityBreakdown, OptimizationRecommendation } from './hardware/FidelityPredictor';

// Import classes for factory functions
import { UnifiedQuantumInterface } from './integration/UnifiedQuantumInterface';
import { PennyLaneAdapter } from './integration/PennyLaneAdapter';
import { RealDeviceCharacterizer, ProviderCredentials } from './hardware/RealDeviceCharacterizer';
import { HardwareAwareCompiler } from './hardware/HardwareAwareCompiler';
import { FidelityPredictor } from './hardware/FidelityPredictor';

/**
 * Create a new unified quantum interface instance
 */
export function createQuantumInterface(): UnifiedQuantumInterface {
	return new UnifiedQuantumInterface();
}

/**
 * Create a new PennyLane adapter instance
 */
export function createPennyLaneAdapter(): PennyLaneAdapter {
	return new PennyLaneAdapter();
}

/**
 * Create a new real device characterizer with API credentials
 */
export function createRealDeviceCharacterizer(credentials: ProviderCredentials): RealDeviceCharacterizer {
	return new RealDeviceCharacterizer(credentials);
}

/**
 * Create a hardware-aware compiler for a specific device
 */
export function createHardwareCompiler(device: any): HardwareAwareCompiler {
	return new HardwareAwareCompiler(device);
}

/**
 * Create a fidelity predictor for a specific device
 */
export function createFidelityPredictor(device: any): FidelityPredictor {
	return new FidelityPredictor(device);
}

/**
 * Version information
 */
export const VERSION = '1.0.0';
export const SUPPORTED_PROVIDERS = ['IBM', 'Google', 'IonQ', 'Rigetti', 'AWS_Braket', 'Azure_Quantum', 'PennyLane'] as const;

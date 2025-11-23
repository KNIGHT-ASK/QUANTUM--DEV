/**
 * Provider Interfaces - Unified abstraction for quantum hardware providers
 * Supports IBM, Google, IonQ, Rigetti, AWS Braket, Azure Quantum, PennyLane
 */

import { QuantumDevice, CalibrationData, GateType } from '../DeviceCharacterization';

export type ProviderType = 'IBM' | 'Google' | 'IonQ' | 'Rigetti' | 'AWS_Braket' | 'Azure_Quantum' | 'PennyLane';

export interface DeviceSpec extends QuantumDevice {
	id: string;
	nativeGateSet: GateType[];
	pulseCapabilities?: PulseCapabilities;
	pricing?: PricingInfo;
}

export interface PulseCapabilities {
	supportsPulseControl: boolean;
	pulseFramework?: 'Qiskit_Pulse' | 'Quil_T' | 'Custom';
	maxPulseAmplitude: number;
	pulseDurationRange: [number, number];
}

export interface PricingInfo {
	costPerShot: number;
	currency: string;
	minimumShots: number;
	billingUnit: 'shot' | 'task' | 'minute';
}

export interface JobId {
	id: string;
	provider: ProviderType;
}

export interface JobStatus {
	id: JobId;
	status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
	queuePosition?: number;
	estimatedStartTime?: Date;
	startTime?: Date;
	endTime?: Date;
	error?: string;
}

export interface JobResults {
	id: JobId;
	counts: { [state: string]: number };
	executionTime: number;
	metadata?: any;
}

export interface Circuit {
	qubits: number;
	gates: Gate[];
	measurements: Measurement[];
	metadata?: CircuitMetadata;
}

export interface Gate {
	type: GateType;
	qubits: number[];
	parameters?: number[];
	layer?: number;
}


export interface Measurement {
	qubit: number;
	classicalBit?: number;
}

export interface CircuitMetadata {
	name?: string;
	description?: string;
	author?: string;
	createdAt?: Date;
}

// Base provider interface
export interface QuantumProvider {
	readonly providerType: ProviderType;
	authenticate(credentials: any): Promise<void>;
	getAvailableDevices(): Promise<DeviceSpec[]>;
	getDeviceProperties(deviceId: string): Promise<DeviceSpec>;
	getCalibrationData(deviceId: string): Promise<CalibrationData>;
	submitJob(circuit: Circuit, deviceId: string, shots: number): Promise<JobId>;
	getJobStatus(jobId: JobId): Promise<JobStatus>;
	getJobResults(jobId: JobId): Promise<JobResults>;
	cancelJob(jobId: JobId): Promise<void>;
}

// IBM Quantum Provider
export interface IBMQuantumProvider extends QuantumProvider {
	providerType: 'IBM';
	authenticate(apiToken: string): Promise<void>;
	getBackends(): Promise<DeviceSpec[]>;
	getBackendProperties(backendName: string): Promise<any>;
	getPulseDefaults(backendName: string): Promise<any>;
}

// Google Quantum Provider
export interface GoogleQuantumProvider extends QuantumProvider {
	providerType: 'Google';
	authenticate(credentials: GoogleCredentials): Promise<void>;
	getProcessors(): Promise<DeviceSpec[]>;
	getProcessorCalibration(processorId: string): Promise<CalibrationData>;
}

export interface GoogleCredentials {
	projectId: string;
	serviceAccountKey: string;
}

// IonQ Provider
export interface IonQProvider extends QuantumProvider {
	providerType: 'IonQ';
	authenticate(apiKey: string): Promise<void>;
	getDevices(): Promise<DeviceSpec[]>;
}

// Rigetti Provider
export interface RigettiProvider extends QuantumProvider {
	providerType: 'Rigetti';
	authenticate(credentials: RigettiCredentials): Promise<void>;
	getQuantumProcessors(): Promise<DeviceSpec[]>;
	getISA(qpuId: string): Promise<InstructionSetArchitecture>;
}

export interface RigettiCredentials {
	userId: string;
	apiKey: string;
}

export interface InstructionSetArchitecture {
	qubits: number;
	edges: [number, number][];
	nativeGates: string[];
}

// AWS Braket Provider
export interface AWSBraketProvider extends QuantumProvider {
	providerType: 'AWS_Braket';
	authenticate(credentials: AWSCredentials): Promise<void>;
	searchDevices(filters?: DeviceFilters): Promise<DeviceSpec[]>;
	getDevice(deviceArn: string): Promise<DeviceSpec>;
	createQuantumTask(circuit: Circuit, deviceArn: string, shots: number): Promise<string>;
}

export interface AWSCredentials {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
}

export interface DeviceFilters {
	types?: string[];
	statuses?: string[];
	providerNames?: string[];
}

// Azure Quantum Provider
export interface AzureQuantumProvider extends QuantumProvider {
	providerType: 'Azure_Quantum';
	authenticate(credentials: AzureCredentials): Promise<void>;
	listTargets(workspaceId: string): Promise<DeviceSpec[]>;
	getTarget(workspaceId: string, targetId: string): Promise<DeviceSpec>;
}

export interface AzureCredentials {
	subscriptionId: string;
	resourceGroup: string;
	workspaceName: string;
	tenantId: string;
	clientId: string;
	clientSecret: string;
}

// PennyLane Provider
export interface PennyLaneProvider extends QuantumProvider {
	providerType: 'PennyLane';
	getDevicePlugins(): Promise<DevicePlugin[]>;
	createDevice(deviceName: string, wires: number, config: DeviceConfig): any;
}

export interface DevicePlugin {
	name: string;
	shortName: string;
	version: string;
	author: string;
	capabilities: string[];
}

export interface DeviceConfig {
	shots?: number;
	[key: string]: any;
}

/**
 * QUANTUM HARDWARE MANAGER
 *
 * THE MISSING PIECE - Real hardware awareness!
 *
 * This module knows about:
 * - Real quantum device topologies (IBM, IonQ, Rigetti, etc.)
 * - Qubit connectivity graphs
 * - Native gate sets
 * - Error rates and calibration data
 * - T1/T2 coherence times
 *
 * NO MORE GENERATING CODE THAT CAN'T RUN ON REAL HARDWARE!
 */
/**
 * Qubit topology - which qubits are physically connected
 */
export interface QubitTopology {
    deviceName: string;
    provider: 'IBM' | 'IonQ' | 'Rigetti' | 'Google' | 'AWS';
    numQubits: number;
    connectivity: Map<number, number[]>;
    couplingMap: [number, number][];
    nativeGates: string[];
    basisGates: string[];
}
/**
 * Calibration data for a single qubit
 */
export interface QubitCalibration {
    qubitId: number;
    t1: number;
    t2: number;
    frequency: number;
    anharmonicity: number;
    gateErrors: Map<string, number>;
    readoutError: number;
    readoutAssignmentError: [number, number];
}
/**
 * Gate error data
 */
export interface GateCalibration {
    gateName: string;
    qubits: number[];
    errorRate: number;
    gateTime: number;
    date: Date;
}
/**
 * Complete device specification
 */
export interface QuantumDevice {
    name: string;
    provider: string;
    topology: QubitTopology;
    qubitCalibrations: Map<number, QubitCalibration>;
    gateCalibrations: Map<string, GateCalibration>;
    maxCircuitDepth: number;
    maxExperimentTime: number;
    processorType: 'superconducting' | 'ion_trap' | 'photonic' | 'neutral_atom';
    lastCalibrated: Date;
}
export declare class QuantumHardwareManager {
    private devices;
    private currentDevice;
    constructor();
    /**
     * Load real device specifications
     */
    private loadPredefinedDevices;
    /**
     * IBM Brisbane - Heavy-hex lattice topology
     */
    private createIBMBrisbane;
    /**
     * IBM Kyoto - Similar to Brisbane
     */
    private createIBMKyoto;
    /**
     * IonQ Aria - All-to-all connectivity!
     */
    private createIonQAria;
    /**
     * Rigetti Aspen-M-3 - Octagonal topology
     */
    private createRigettiAspenM3;
    /**
     * Google Sycamore - Grid topology
     */
    private createGoogleSycamore;
    /**
     * Set the target device for code generation
     */
    setDevice(deviceName: string): boolean;
    /**
     * Get current device
     */
    getCurrentDevice(): QuantumDevice | null;
    /**
     * Check if two qubits are physically connected
     */
    areQubitsConnected(q1: number, q2: number): boolean;
    /**
     * Find shortest path between two qubits (for SWAP insertion)
     */
    findShortestPath(source: number, target: number): number[] | null;
    /**
     * Get estimated fidelity for a circuit
     */
    estimateCircuitFidelity(gates: {
        name: string;
        qubits: number[];
    }[]): number;
    /**
     * Get list of available devices
     */
    getAvailableDevices(): string[];
    /**
     * Get device information
     */
    getDeviceInfo(deviceName: string): QuantumDevice | undefined;
    /**
     * Suggest optimal qubit mapping
     */
    suggestQubitMapping(numQubitsNeeded: number): number[];
}
//# sourceMappingURL=QuantumHardwareManager.d.ts.map
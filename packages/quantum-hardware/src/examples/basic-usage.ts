/**
 * Basic Usage Example - Quantum Hardware Optimization System
 */

import {
	createQuantumInterface,
	Circuit,
	DeviceSpec,
	GoogleQuantumProvider,
	AWSBraketProvider,
	AzureQuantumProvider
} from '../index';

async function main() {
	// Create unified interface
	const quantumInterface = createQuantumInterface();
	const registry = quantumInterface.getDeviceRegistry();
	const calibrationManager = quantumInterface.getCalibrationManager();

	// Initialize providers
	const googleProvider = new GoogleQuantumProvider();
	const awsProvider = new AWSBraketProvider();
	const azureProvider = new AzureQuantumProvider();

	// Authenticate (use environment variables in production)
	try {
		await googleProvider.authenticate({
			projectId: process.env.GOOGLE_PROJECT_ID || '',
			serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''
		});
		console.log('✓ Google Quantum authenticated');
	} catch (error) {
		console.log('✗ Google Quantum authentication failed');
	}

	try {
		await awsProvider.authenticate({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
			region: process.env.AWS_REGION || 'us-east-1'
		});
		console.log('✓ AWS Braket authenticated');
	} catch (error) {
		console.log('✗ AWS Braket authentication failed');
	}

	// Register providers with calibration manager
	calibrationManager.registerProvider(googleProvider);
	calibrationManager.registerProvider(awsProvider);
	calibrationManager.registerProvider(azureProvider);

	// Discover devices
	console.log('\n=== Discovering Devices ===');
	try {
		const googleDevices = await googleProvider.getAvailableDevices();
		googleDevices.forEach(device => registry.registerDevice(device));
		console.log(`Found ${googleDevices.length} Google Quantum devices`);
	} catch (error) {
		console.log('Could not fetch Google devices');
	}

	try {
		const awsDevices = await awsProvider.getAvailableDevices();
		awsDevices.forEach(device => registry.registerDevice(device));
		console.log(`Found ${awsDevices.length} AWS Braket devices`);
	} catch (error) {
		console.log('Could not fetch AWS devices');
	}

	// Get registry statistics
	const stats = registry.getStatistics();
	console.log('\n=== Device Registry Statistics ===');
	console.log(`Total devices: ${stats.totalDevices}`);
	console.log(`Total qubits: ${stats.totalQubits}`);
	console.log(`Average qubits per device: ${stats.averageQubits.toFixed(1)}`);
	console.log('Devices by provider:', stats.devicesByProvider);
	console.log('Devices by technology:', stats.devicesByTechnology);

	// Create a sample circuit
	const circuit: Circuit = {
		qubits: 5,
		gates: [
			{ type: 'H', qubits: [0], layer: 0 },
			{ type: 'CNOT', qubits: [0, 1], layer: 1 },
			{ type: 'CNOT', qubits: [1, 2], layer: 2 },
			{ type: 'CNOT', qubits: [2, 3], layer: 3 },
			{ type: 'CNOT', qubits: [3, 4], layer: 4 },
			{ type: 'H', qubits: [4], layer: 5 }
		],
		measurements: [
			{ qubit: 0 },
			{ qubit: 1 },
			{ qubit: 2 },
			{ qubit: 3 },
			{ qubit: 4 }
		]
	};

	console.log('\n=== Circuit Analysis ===');
	const analysis = quantumInterface.analyzeCircuit(circuit);
	console.log(`Required qubits: ${analysis.requiredQubits}`);
	console.log(`Circuit depth: ${analysis.circuitDepth}`);
	console.log(`Total gates: ${analysis.gateCount}`);
	console.log(`Two-qubit gates: ${analysis.twoQubitGateCount}`);
	console.log(`Compatible devices: ${analysis.compatibleDevices}`);
	console.log(`Recommended devices: ${analysis.recommendedDevices.map((d: DeviceSpec) => d.name).join(', ')}`);

	// Select optimal device
	console.log('\n=== Device Selection ===');
	try {
		const optimalDevice = quantumInterface.selectOptimalDevice(circuit, {
			maxWaitTime: 60,
			minFidelity: 0.9
		});
		console.log(`Selected device: ${optimalDevice.name}`);
		console.log(`Provider: ${optimalDevice.provider}`);
		console.log(`Qubits: ${optimalDevice.qubits}`);
		console.log(`Topology: ${optimalDevice.topology.type}`);
		console.log(`Queue time: ${optimalDevice.queueInfo.estimatedWaitTime} minutes`);

		// Optimize circuit for device
		console.log('\n=== Circuit Optimization ===');
		const optimized = quantumInterface.optimizeCircuit(circuit, optimalDevice, {
			enableQubitMapping: true,
			enableGateScheduling: true,
			optimizationLevel: 'standard'
		});

		console.log('Applied optimizations:');
		optimized.optimizations.forEach((opt: string) => console.log(`  - ${opt}`));
		console.log('\nOptimization metrics:');
		console.log(`  SWAP overhead: ${(optimized.metrics.swapOverhead * 100).toFixed(2)}%`);
		console.log(`  Depth reduction: ${(optimized.metrics.depthReduction * 100).toFixed(2)}%`);
		console.log(`  Estimated fidelity: ${(optimized.metrics.estimatedFidelity * 100).toFixed(2)}%`);

		// Cost estimation
		console.log('\n=== Cost Estimation ===');
		const costEstimate = quantumInterface.estimateCost(optimized.circuit, optimalDevice, 1000);
		console.log(`Total cost: $${costEstimate.totalCost.toFixed(4)}`);
		console.log(`Cost per shot: $${costEstimate.costPerShot.toFixed(6)}`);
		console.log(`Queue time: ${costEstimate.queueTime} minutes`);
		console.log(`Execution time: ${costEstimate.executionTime.toFixed(2)} ms`);
		console.log(`Total time: ${costEstimate.totalTime.toFixed(1)} minutes`);
		console.log(`Estimated fidelity: ${(costEstimate.estimatedFidelity * 100).toFixed(2)}%`);

		// Device comparison
		console.log('\n=== Device Comparison ===');
		const comparison = quantumInterface.compareDevices(circuit, analysis.recommendedDevices);
		console.log(comparison.recommendation);
		console.log('\nTop 3 devices:');
		comparison.devices.slice(0, 3).forEach((item: any) => {
			console.log(`\n${item.rank}. ${item.device.name}`);
			console.log(`   Compatibility: ${(item.compatibilityScore * 100).toFixed(1)}%`);
			console.log(`   Fidelity: ${(item.fidelityEstimate * 100).toFixed(2)}%`);
			console.log(`   Cost: $${item.cost.toFixed(4)}`);
			console.log(`   Wait time: ${item.waitTime} min`);
			console.log(`   Pros: ${item.pros.join(', ')}`);
			if (item.cons.length > 0) {
				console.log(`   Cons: ${item.cons.join(', ')}`);
			}
		});

	} catch (error) {
		console.log(`Error: ${error}`);
	}

	// Cleanup
	calibrationManager.cleanup();
	console.log('\n=== Complete ===');
}

// Run example
if (require.main === module) {
	main().catch(console.error);
}

export { main };

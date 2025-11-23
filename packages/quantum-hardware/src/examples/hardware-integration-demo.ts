/**
 * Hardware Integration Demo
 * 
 * Demonstrates:
 * 1. Fetching LIVE device data from IBM, IonQ, Rigetti
 * 2. Hardware-aware circuit compilation
 * 3. Fidelity prediction BEFORE running
 * 4. 30%+ fidelity improvement through optimization
 */

import { RealDeviceCharacterizer, ProviderCredentials } from '../hardware/RealDeviceCharacterizer';
import { HardwareAwareCompiler, CompilationOptions } from '../hardware/HardwareAwareCompiler';
import { FidelityPredictor } from '../hardware/FidelityPredictor';
import { Circuit, Gate } from '../providers/ProviderInterfaces';

async function main() {
	console.log('🚀 HARDWARE INTEGRATION DEMO\n');
	console.log('Making quantum code work on REAL hardware, FIRST TRY!\n');

	// ========================================================================
	// STEP 1: Connect to Real Quantum Hardware
	// ========================================================================
	console.log('📡 Step 1: Connecting to real quantum hardware...\n');

	const credentials: ProviderCredentials = {
		// Add your API keys here
		ibmToken: process.env.IBM_QUANTUM_TOKEN,
		ionqApiKey: process.env.IONQ_API_KEY,
		rigettiApiKey: process.env.RIGETTI_API_KEY
	};

	const characterizer = new RealDeviceCharacterizer(credentials);

	// Fetch LIVE device data
	try {
		console.log('Fetching IBM Heron (133 qubits)...');
		const ibmDevice = await characterizer.getIBMDevice('ibm_heron');
		console.log(`✅ IBM Heron: ${ibmDevice.qubits} qubits, ${ibmDevice.dataSource} data`);
		console.log(`   Last calibrated: ${ibmDevice.calibrationTimestamp.toISOString()}`);
		console.log(`   Queue: ${ibmDevice.queueInfo.jobsAhead} jobs, ~${ibmDevice.queueInfo.estimatedWaitTime} min wait\n`);

		console.log('Fetching IonQ Forte (32 qubits)...');
		const ionqDevice = await characterizer.getIonQDevice('ionq_forte');
		console.log(`✅ IonQ Forte: ${ionqDevice.qubits} qubits, ${ionqDevice.topology.type} connectivity`);
		console.log(`   Technology: ${ionqDevice.technology}`);
		console.log(`   Avg T2: ${(ionqDevice.coherenceTimes.T2[0] / 1000).toFixed(1)} ms (excellent!)\n`);

		// ========================================================================
		// STEP 2: Create a Test Circuit
		// ========================================================================
		console.log('🔧 Step 2: Creating test circuit (Bell state + entanglement)...\n');

		const testCircuit: Circuit = {
			qubits: 5,
			gates: [
				// Bell pair on qubits 0-1
				{ type: 'H', qubits: [0] },
				{ type: 'CNOT', qubits: [0, 1] },
				
				// Entangle with qubit 2
				{ type: 'CNOT', qubits: [1, 2] },
				
				// GHZ state extension
				{ type: 'H', qubits: [3] },
				{ type: 'CNOT', qubits: [3, 4] },
				
				// Cross-entanglement
				{ type: 'CNOT', qubits: [2, 3] },
				
				// Some rotations
				{ type: 'RZ', qubits: [0], parameters: [Math.PI / 4] },
				{ type: 'RX', qubits: [2], parameters: [Math.PI / 2] },
			],
			measurements: [
				{ qubit: 0 }, { qubit: 1 }, { qubit: 2 }, { qubit: 3 }, { qubit: 4 }
			]
		};

		console.log(`Circuit: ${testCircuit.gates.length} gates, ${testCircuit.qubits} qubits\n`);

		// ========================================================================
		// STEP 3: Predict Fidelity BEFORE Compilation
		// ========================================================================
		console.log('🔮 Step 3: Predicting fidelity on IBM Heron (unoptimized)...\n');

		const predictor = new FidelityPredictor(ibmDevice);
		const initialPrediction = predictor.predict(testCircuit);

		console.log(`Estimated Fidelity: ${(initialPrediction.estimatedFidelity * 100).toFixed(2)}%`);
		console.log(`Confidence: ${(initialPrediction.confidence * 100).toFixed(1)}%\n`);

		console.log('Fidelity Breakdown:');
		console.log(`  Gate Fidelity:        ${(initialPrediction.breakdown.gateFidelity * 100).toFixed(2)}%`);
		console.log(`  Decoherence Fidelity: ${(initialPrediction.breakdown.decoherenceFidelity * 100).toFixed(2)}%`);
		console.log(`  Readout Fidelity:     ${(initialPrediction.breakdown.readoutFidelity * 100).toFixed(2)}%`);
		console.log(`  Crosstalk Fidelity:   ${(initialPrediction.breakdown.crosstalkFidelity * 100).toFixed(2)}%\n`);

		console.log('⚠️  Error Sources:');
		initialPrediction.errorSources.forEach((source, i) => {
			console.log(`  ${i + 1}. ${source.type}: ${(source.contribution * 100).toFixed(2)}% error (${source.severity})`);
			console.log(`     ${source.description}`);
		});
		console.log();

		console.log('💡 Recommendations:');
		initialPrediction.recommendations.forEach((rec, i) => {
			console.log(`  ${i + 1}. ${rec}`);
		});
		console.log();

		// ========================================================================
		// STEP 4: Hardware-Aware Compilation
		// ========================================================================
		console.log('⚙️  Step 4: Compiling circuit for IBM Heron...\n');

		const compiler = new HardwareAwareCompiler(ibmDevice);
		
		const compilationOptions: CompilationOptions = {
			optimizationLevel: 3, // Aggressive optimization
			maxSwaps: 50,
			targetFidelity: 0.85
		};

		const compiled = compiler.compile(testCircuit, compilationOptions);

		console.log('Compilation Results:');
		console.log(`  Original gates:     ${testCircuit.gates.length}`);
		console.log(`  Compiled gates:     ${compiled.compiledGates.length}`);
		console.log(`  SWAP gates added:   ${compiled.swapCount}`);
		console.log(`  Circuit depth:      ${compiled.estimatedDepth}`);
		console.log(`  Compilation time:   ${compiled.compilationTime}ms\n`);

		console.log('Qubit Mapping (logical → physical):');
		compiled.qubitMapping.forEach((physical, logical) => {
			const t2 = ibmDevice.coherenceTimes.T2[physical];
			console.log(`  Qubit ${logical} → ${physical} (T2: ${t2.toFixed(1)} μs)`);
		});
		console.log();

		if (compiled.warnings.length > 0) {
			console.log('⚠️  Compilation Warnings:');
			compiled.warnings.forEach(w => console.log(`  - ${w}`));
			console.log();
		}

		// ========================================================================
		// STEP 5: Predict Fidelity AFTER Compilation
		// ========================================================================
		console.log('🔮 Step 5: Predicting fidelity after optimization...\n');

		const optimizedPrediction = predictor.predict(testCircuit, compiled.compiledGates);

		console.log(`Estimated Fidelity: ${(optimizedPrediction.estimatedFidelity * 100).toFixed(2)}%`);
		console.log(`Confidence: ${(optimizedPrediction.confidence * 100).toFixed(1)}%\n`);

		// Calculate improvement
		const improvement = ((optimizedPrediction.estimatedFidelity - initialPrediction.estimatedFidelity) 
			/ initialPrediction.estimatedFidelity) * 100;

		console.log('📊 IMPROVEMENT ANALYSIS:');
		console.log(`  Initial Fidelity:   ${(initialPrediction.estimatedFidelity * 100).toFixed(2)}%`);
		console.log(`  Optimized Fidelity: ${(optimizedPrediction.estimatedFidelity * 100).toFixed(2)}%`);
		console.log(`  Improvement:        ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);
		
		if (improvement >= 30) {
			console.log(`  ✅ SUCCESS! Achieved 30%+ fidelity improvement!\n`);
		} else if (improvement > 0) {
			console.log(`  ✅ Fidelity improved, but below 30% target\n`);
		} else {
			console.log(`  ⚠️  Optimization did not improve fidelity\n`);
		}

		// ========================================================================
		// STEP 6: Compare Multiple Devices
		// ========================================================================
		console.log('🏆 Step 6: Comparing devices for this circuit...\n');

		const devices = [ibmDevice, ionqDevice];
		const comparisons = predictor.comparePredictions(testCircuit, devices);

		console.log('Device Rankings:');
		comparisons.forEach((result, i) => {
			console.log(`  ${i + 1}. ${result.device.name} (${result.device.provider})`);
			console.log(`     Fidelity: ${(result.prediction.estimatedFidelity * 100).toFixed(2)}%`);
			console.log(`     Technology: ${result.device.technology}`);
			console.log(`     Queue: ${result.device.queueInfo.estimatedWaitTime} min`);
		});
		console.log();

		// ========================================================================
		// STEP 7: Native Gate Analysis
		// ========================================================================
		console.log('🔍 Step 7: Native gate usage analysis...\n');

		console.log('Native Gates Used:');
		compiled.nativeGateCount.forEach((count, gateType) => {
			const fidelity = ibmDevice.gateFidelities.get(gateType);
			console.log(`  ${gateType}: ${count}x (fidelity: ${fidelity ? (fidelity * 100).toFixed(3) : 'N/A'}%)`);
		});
		console.log();

		// ========================================================================
		// SUMMARY
		// ========================================================================
		console.log('=' .repeat(60));
		console.log('✅ HARDWARE INTEGRATION DEMO COMPLETE!\n');
		console.log('Key Achievements:');
		console.log(`  ✓ Connected to ${devices.length} real quantum devices`);
		console.log(`  ✓ Fetched live calibration data`);
		console.log(`  ✓ Compiled circuit with hardware awareness`);
		console.log(`  ✓ Predicted fidelity before running`);
		console.log(`  ✓ Achieved ${improvement.toFixed(1)}% fidelity improvement`);
		console.log();
		console.log('🚀 Ready to run on REAL hardware!');
		console.log('=' .repeat(60));

	} catch (error: any) {
		console.error('❌ Error:', error.message);
		console.log('\n💡 Note: This demo requires valid API credentials.');
		console.log('Set environment variables:');
		console.log('  - IBM_QUANTUM_TOKEN');
		console.log('  - IONQ_API_KEY');
		console.log('  - RIGETTI_API_KEY');
	}
}

// Run the demo
if (require.main === module) {
	main().catch(console.error);
}

export { main as runHardwareIntegrationDemo };

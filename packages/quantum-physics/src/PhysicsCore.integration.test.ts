/**
 * PhysicsCore Integration Tests
 * 
 * Tests the complete physics analysis pipeline with all modules:
 * - HamiltonianAnalyzer for spectral analysis
 * - QuantumInformationTheory for entropy and entanglement
 * - TimeEvolutionOperator for quantum dynamics
 * - DensityMatrixOperations for mixed states
 * - TensorOperations for multi-qubit systems
 * 
 * Requirements: 19.1, 19.2, 19.3
 */

import { describe, test, expect } from 'vitest';
import { Complex, create, all } from 'mathjs';
import { PhysicsCore } from './PhysicsCore';
import { QuantumState } from './HilbertSpace';

const math = create(all);

describe('PhysicsCore Integration Tests', () => {
	
	describe('Complete Physics Analysis Pipeline', () => {
		
		test('analyzes single-qubit system with Pauli-Z Hamiltonian', async () => {
			const core = new PhysicsCore(1);
			
			// Prepare |0⟩ state
			const state: QuantumState = {
				amplitudes: [math.complex(1, 0), math.complex(0, 0)],
				numQubits: 1,
				isPure: true
			};
			
			// Pauli-Z Hamiltonian
			const hamiltonian: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(-1, 0)]
			];
			
			const analysis = await core.analyzePhysics(state, hamiltonian);
			
			// Verify Hilbert space analysis
			expect(analysis.hilbertSpace.dimension).toBe(2);
			
			// Verify Hamiltonian spectral analysis
			expect(analysis.hamiltonian.spectrum.eigenvalues).toHaveLength(2);
			expect(analysis.hamiltonian.spectrum.eigenvalues[0]).toBeCloseTo(-1, 10);
			expect(analysis.hamiltonian.spectrum.eigenvalues[1]).toBeCloseTo(1, 10);
			
			// Verify spectral gap
			expect(analysis.advancedPhysics.spectralGap).toBeCloseTo(2, 10);
			expect(analysis.advancedPhysics.groundStateEnergy).toBeCloseTo(-1, 10);
			
			// Verify information theory measures
			expect(analysis.information.vonNeumannEntropy).toBeCloseTo(0, 10); // Pure state
			expect(analysis.information.entanglementMeasures.purity).toBeCloseTo(1, 10);
			
			// Verify validation
			expect(analysis.validation.isPhysical).toBe(true);
		});
		
		test('analyzes two-qubit Bell state with entanglement', async () => {
			const core = new PhysicsCore(2);
			
			// Prepare Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const state: QuantumState = {
				amplitudes: [
					math.complex(1/sqrt2, 0),
					math.complex(0, 0),
					math.complex(0, 0),
					math.complex(1/sqrt2, 0)
				],
				numQubits: 2,
				isPure: true
			};
			
			// Identity Hamiltonian (for simplicity)
			const hamiltonian: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(1, 0)]
			];
			
			const analysis = await core.analyzePhysics(state, hamiltonian);
			
			// Verify entanglement entropy (should be 1 bit for Bell state)
			expect(analysis.information.entanglementMeasures.entanglementEntropy).toBeCloseTo(1, 10);
			
			// Verify pure state properties
			expect(analysis.information.vonNeumannEntropy).toBeCloseTo(0, 10);
			expect(analysis.information.entanglementMeasures.purity).toBeCloseTo(1, 10);
			
			// Verify validation
			expect(analysis.validation.isPhysical).toBe(true);
		});
		
		test('analyzes system with symmetries', async () => {
			const core = new PhysicsCore(2);
			
			// Product state |00⟩
			const state: QuantumState = {
				amplitudes: [
					math.complex(1, 0),
					math.complex(0, 0),
					math.complex(0, 0),
					math.complex(0, 0)
				],
				numQubits: 2,
				isPure: true
			};
			
			// Hamiltonian with Z-parity symmetry: H = Z⊗Z
			const hamiltonian: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(-1, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(-1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(1, 0)]
			];
			
			const analysis = await core.analyzePhysics(state, hamiltonian);
			
			// Verify symmetries detected
			expect(analysis.hamiltonian.symmetries.length).toBeGreaterThan(0);
			
			// Verify spectral analysis
			expect(analysis.advancedPhysics.groundStateEnergy).toBeDefined();
			expect(analysis.advancedPhysics.spectralGap).toBeDefined();
			
			// Verify validation
			expect(analysis.validation.isPhysical).toBe(true);
		});
	});
	
	describe('Validation Integration Across Modules', () => {
		
		test('validates time evolution preserves unitarity', () => {
			const core = new PhysicsCore(1);
			
			// Pauli-X Hamiltonian
			const hamiltonian: Complex[][] = [
				[math.complex(0, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(0, 0)]
			];
			
			// Evolve for time t = π/2
			const U = core.getTimeEvolutionOperator(hamiltonian, Math.PI / 2);
			
			// Verify unitarity: U†U = I
			const Udag: Complex[][] = [];
			for (let i = 0; i < U.length; i++) {
				Udag[i] = [];
				for (let j = 0; j < U[i].length; j++) {
					Udag[i][j] = math.conj(U[j][i]) as Complex;
				}
			}
			
			const UdagU: Complex[][] = [];
			for (let i = 0; i < U.length; i++) {
				UdagU[i] = [];
				for (let j = 0; j < U.length; j++) {
					let sum = math.complex(0, 0);
					for (let k = 0; k < U.length; k++) {
						sum = math.add(sum, math.multiply(Udag[i][k], U[k][j])) as Complex;
					}
					UdagU[i][j] = sum;
				}
			}
			
			// Check diagonal elements are 1
			expect(math.abs(UdagU[0][0])).toBeCloseTo(1, 10);
			expect(math.abs(UdagU[1][1])).toBeCloseTo(1, 10);
			
			// Check off-diagonal elements are 0
			expect(math.abs(UdagU[0][1])).toBeCloseTo(0, 10);
			expect(math.abs(UdagU[1][0])).toBeCloseTo(0, 10);
		});
		
		test('validates state evolution preserves normalization', () => {
			const core = new PhysicsCore(1);
			
			// Pauli-Z Hamiltonian
			const hamiltonian: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(-1, 0)]
			];
			
			// Initial state |+⟩ = (|0⟩ + |1⟩)/√2
			const sqrt2 = Math.sqrt(2);
			const initialState: Complex[] = [
				math.complex(1/sqrt2, 0),
				math.complex(1/sqrt2, 0)
			];
			
			// Evolve for time t = 1.0
			const evolvedState = core.evolveState(hamiltonian, initialState, 1.0);
			
			// Verify normalization preserved
			let norm = 0;
			for (const amp of evolvedState) {
				norm += math.abs(amp) ** 2;
			}
			expect(norm).toBeCloseTo(1, 10);
		});
		
		test('validates partial trace produces valid density matrix', () => {
			const core = new PhysicsCore(2);
			
			// Bell state density matrix
			const sqrt2 = Math.sqrt(2);
			const psi = [
				math.complex(1/sqrt2, 0),
				math.complex(0, 0),
				math.complex(0, 0),
				math.complex(1/sqrt2, 0)
			];
			
			// Create density matrix |ψ⟩⟨ψ|
			const rho: Complex[][] = [];
			for (let i = 0; i < 4; i++) {
				rho[i] = [];
				for (let j = 0; j < 4; j++) {
					rho[i][j] = math.multiply(psi[i], math.conj(psi[j])) as Complex;
				}
			}
			
			// Trace out second qubit
			const rhoA = core.partialTrace(rho, [1]);
			
			// Verify trace = 1
			let trace = math.complex(0, 0);
			for (let i = 0; i < rhoA.length; i++) {
				trace = math.add(trace, rhoA[i][i]) as Complex;
			}
			expect(math.abs(trace)).toBeCloseTo(1, 10);
			
			// Verify Hermiticity
			for (let i = 0; i < rhoA.length; i++) {
				for (let j = 0; j < rhoA.length; j++) {
					const diff = math.subtract(rhoA[i][j], math.conj(rhoA[j][i])) as Complex;
					expect(math.abs(diff)).toBeCloseTo(0, 10);
				}
			}
		});
		
		test('validates tensor product preserves operator properties', () => {
			const core = new PhysicsCore(2);
			
			// Pauli-X operator
			const X: Complex[][] = [
				[math.complex(0, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(0, 0)]
			];
			
			// Compute X ⊗ X
			const XX = core.tensorProduct(X, X);
			
			// Verify dimension
			expect(XX.length).toBe(4);
			expect(XX[0].length).toBe(4);
			
			// Verify Hermiticity (X is Hermitian, so X⊗X should be too)
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					const diff = math.subtract(XX[i][j], math.conj(XX[j][i])) as Complex;
					expect(math.abs(diff)).toBeCloseTo(0, 10);
				}
			}
		});
	});
	
	describe('Error Propagation from Modules to PhysicsCore', () => {
		
		test('propagates invalid density matrix error', async () => {
			const core = new PhysicsCore(1);
			
			// Invalid state (not normalized)
			const state: QuantumState = {
				amplitudes: [math.complex(2, 0), math.complex(0, 0)],
				numQubits: 1,
				isPure: true
			};
			
			// Should throw error due to invalid normalization
			await expect(async () => {
				await core.analyzePhysics(state);
			}).rejects.toThrow();
		});
		
		test('handles non-Hermitian Hamiltonian gracefully', async () => {
			const core = new PhysicsCore(1);
			
			const state: QuantumState = {
				amplitudes: [math.complex(1, 0), math.complex(0, 0)],
				numQubits: 1,
				isPure: true
			};
			
			// Non-Hermitian matrix
			const hamiltonian: Complex[][] = [
				[math.complex(1, 0), math.complex(1, 1)],
				[math.complex(0, 0), math.complex(-1, 0)]
			];
			
			// Should throw error or report validation failure
			await expect(async () => {
				await core.analyzePhysics(state, hamiltonian);
			}).rejects.toThrow();
		});
	});
	
	describe('PhysicsCore with Various Quantum Systems', () => {
		
		test('analyzes ground state of harmonic oscillator', async () => {
			const core = new PhysicsCore(2);
			
			// Approximate ground state of 2-qubit system
			const state: QuantumState = {
				amplitudes: [
					math.complex(1, 0),
					math.complex(0, 0),
					math.complex(0, 0),
					math.complex(0, 0)
				],
				numQubits: 2,
				isPure: true
			};
			
			// Simple diagonal Hamiltonian
			const hamiltonian: Complex[][] = [
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(1, 0), math.complex(0, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(2, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(3, 0)]
			];
			
			const analysis = await core.analyzePhysics(state, hamiltonian);
			
			// Verify ground state energy
			expect(analysis.advancedPhysics.groundStateEnergy).toBeCloseTo(0, 10);
			
			// Verify spectral gap
			expect(analysis.advancedPhysics.spectralGap).toBeCloseTo(1, 10);
			
			// Verify no entanglement in product state
			expect(analysis.information.entanglementMeasures.entanglementEntropy).toBeCloseTo(0, 10);
		});
		
		test('analyzes thermal state at finite temperature', () => {
			const core = new PhysicsCore(1);
			
			// Pauli-Z Hamiltonian
			const hamiltonian: Complex[][] = [
				[math.complex(1, 0), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(-1, 0)]
			];
			
			// Generate thermal state at T = 1.0
			const thermalState = core.thermalState(hamiltonian, 1.0);
			
			// Verify trace = 1
			let trace = math.complex(0, 0);
			for (let i = 0; i < thermalState.length; i++) {
				trace = math.add(trace, thermalState[i][i]) as Complex;
			}
			expect(math.abs(trace)).toBeCloseTo(1, 10);
			
			// Verify Hermiticity
			for (let i = 0; i < thermalState.length; i++) {
				for (let j = 0; j < thermalState.length; j++) {
					const diff = math.subtract(thermalState[i][j], math.conj(thermalState[j][i])) as Complex;
					expect(math.abs(diff)).toBeCloseTo(0, 10);
				}
			}
		});
		
		test('applies single-qubit gate to multi-qubit system', () => {
			const core = new PhysicsCore(3);
			
			// Pauli-X gate
			const X: Complex[][] = [
				[math.complex(0, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(0, 0)]
			];
			
			// Apply X to qubit 1 in 3-qubit system
			const fullOperator = core.applyToQubits(X, [1], 3);
			
			// Verify dimension is 8×8
			expect(fullOperator.length).toBe(8);
			expect(fullOperator[0].length).toBe(8);
			
			// Verify Hermiticity preserved
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					const diff = math.subtract(fullOperator[i][j], math.conj(fullOperator[j][i])) as Complex;
					expect(math.abs(diff)).toBeCloseTo(0, 10);
				}
			}
		});
		
		test('computes time evolution with Trotter decomposition', () => {
			const core = new PhysicsCore(1);
			
			// Pauli-X Hamiltonian
			const hamiltonian: Complex[][] = [
				[math.complex(0, 0), math.complex(1, 0)],
				[math.complex(1, 0), math.complex(0, 0)]
			];
			
			// Initial state |0⟩
			const initialState: Complex[] = [
				math.complex(1, 0),
				math.complex(0, 0)
			];
			
			// Evolve with Trotter method
			const evolvedState = core.evolveState(hamiltonian, initialState, 1.0, 'trotter', 100);
			
			// Verify normalization
			let norm = 0;
			for (const amp of evolvedState) {
				norm += math.abs(amp) ** 2;
			}
			expect(norm).toBeCloseTo(1, 8); // Slightly relaxed tolerance for Trotter
		});
	});
});

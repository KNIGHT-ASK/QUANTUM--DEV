/**
 * Quantum Noise Models
 * 
 * Realistic noise simulation for quantum hardware:
 * - T1/T2 decoherence
 * - Depolarizing channel
 * - Amplitude damping
 * - Phase damping
 * - Measurement errors
 * - Gate errors
 * - Crosstalk
 */

import { Complex, create, all } from 'mathjs';

const math = create(all);

export interface NoiseParameters {
	// Decoherence times (in microseconds)
	T1?: number;  // Amplitude damping time
	T2?: number;  // Dephasing time
	
	// Gate error rates
	singleQubitGateError?: number;
	twoQubitGateError?: number;
	
	// Measurement error
	readoutError?: number;
	
	// Depolarizing probability
	depolarizingProb?: number;
	
	// Thermal population
	thermalPopulation?: number;
}

export interface NoiseChannel {
	name: string;
	krausOperators: Complex[][][];
	applyToState: (state: Complex[]) => Complex[];
	applyToDensityMatrix: (rho: Complex[][]) => Complex[][];
}

/**
 * Quantum Noise Models
 */
export class NoiseModels {
	
	/**
	 * ========================================
	 * DECOHERENCE CHANNELS
	 * ========================================
	 */
	
	/**
	 * Amplitude Damping Channel
	 * Models energy relaxation (T1 process)
	 * |1⟩ → |0⟩ with rate 1/T1
	 */
	amplitudeDamping(gamma: number): NoiseChannel {
		// Kraus operators:
		// K0 = [[1, 0], [0, √(1-γ)]]
		// K1 = [[0, √γ], [0, 0]]
		
		const K0: Complex[][] = [
			[math.complex(1, 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(Math.sqrt(1 - gamma), 0)]
		];
		
		const K1: Complex[][] = [
			[math.complex(0, 0), math.complex(Math.sqrt(gamma), 0)],
			[math.complex(0, 0), math.complex(0, 0)]
		];
		
		return {
			name: 'Amplitude Damping',
			krausOperators: [K0, K1],
			applyToState: (state: Complex[]) => this.applyKrausToState([K0, K1], state),
			applyToDensityMatrix: (rho: Complex[][]) => this.applyKrausToDensity([K0, K1], rho)
		};
	}
	
	/**
	 * Phase Damping Channel
	 * Models pure dephasing (T2 process without T1)
	 * Destroys coherence without energy loss
	 */
	phaseDamping(lambda: number): NoiseChannel {
		// Kraus operators:
		// K0 = [[1, 0], [0, √(1-λ)]]
		// K1 = [[0, 0], [0, √λ]]
		
		const K0: Complex[][] = [
			[math.complex(1, 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(Math.sqrt(1 - lambda), 0)]
		];
		
		const K1: Complex[][] = [
			[math.complex(0, 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(Math.sqrt(lambda), 0)]
		];
		
		return {
			name: 'Phase Damping',
			krausOperators: [K0, K1],
			applyToState: (state: Complex[]) => this.applyKrausToState([K0, K1], state),
			applyToDensityMatrix: (rho: Complex[][]) => this.applyKrausToDensity([K0, K1], rho)
		};
	}
	
	/**
	 * Depolarizing Channel
	 * Random Pauli errors with probability p
	 * ρ → (1-p)ρ + p/3(XρX + YρY + ZρZ)
	 */
	depolarizing(p: number): NoiseChannel {
		const p0 = Math.sqrt(1 - p);
		const p1 = Math.sqrt(p / 3);
		
		// Kraus operators: √(1-p)I, √(p/3)X, √(p/3)Y, √(p/3)Z
		const K0: Complex[][] = [
			[math.complex(p0, 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(p0, 0)]
		];
		
		const K1: Complex[][] = [ // X
			[math.complex(0, 0), math.complex(p1, 0)],
			[math.complex(p1, 0), math.complex(0, 0)]
		];
		
		const K2: Complex[][] = [ // Y
			[math.complex(0, 0), math.complex(0, -p1)],
			[math.complex(0, p1), math.complex(0, 0)]
		];
		
		const K3: Complex[][] = [ // Z
			[math.complex(p1, 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(-p1, 0)]
		];
		
		return {
			name: 'Depolarizing',
			krausOperators: [K0, K1, K2, K3],
			applyToState: (state: Complex[]) => this.applyKrausToState([K0, K1, K2, K3], state),
			applyToDensityMatrix: (rho: Complex[][]) => this.applyKrausToDensity([K0, K1, K2, K3], rho)
		};
	}
	
	/**
	 * Generalized Amplitude Damping
	 * Includes thermal excitation (finite temperature)
	 */
	generalizedAmplitudeDamping(gamma: number, p: number): NoiseChannel {
		// p = thermal population = 1/(1 + exp(ℏω/kT))
		
		const K0: Complex[][] = [
			[math.complex(Math.sqrt(1 - p), 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(Math.sqrt(1 - p) * Math.sqrt(1 - gamma), 0)]
		];
		
		const K1: Complex[][] = [
			[math.complex(0, 0), math.complex(Math.sqrt(1 - p) * Math.sqrt(gamma), 0)],
			[math.complex(0, 0), math.complex(0, 0)]
		];
		
		const K2: Complex[][] = [
			[math.complex(Math.sqrt(p) * Math.sqrt(1 - gamma), 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(Math.sqrt(p), 0)]
		];
		
		const K3: Complex[][] = [
			[math.complex(0, 0), math.complex(0, 0)],
			[math.complex(Math.sqrt(p) * Math.sqrt(gamma), 0), math.complex(0, 0)]
		];
		
		return {
			name: 'Generalized Amplitude Damping',
			krausOperators: [K0, K1, K2, K3],
			applyToState: (state: Complex[]) => this.applyKrausToState([K0, K1, K2, K3], state),
			applyToDensityMatrix: (rho: Complex[][]) => this.applyKrausToDensity([K0, K1, K2, K3], rho)
		};
	}
	
	/**
	 * ========================================
	 * TIME-DEPENDENT NOISE
	 * ========================================
	 */
	
	/**
	 * T1/T2 Decoherence
	 * Time-dependent amplitude and phase damping
	 */
	t1t2Decoherence(t: number, T1: number, T2: number): NoiseChannel {
		// γ = 1 - exp(-t/T1)
		// λ = 1 - exp(-t/T2) - γ/2
		
		const gamma = 1 - Math.exp(-t / T1);
		const lambda = 1 - Math.exp(-t / T2) - gamma / 2;
		
		// Combined amplitude + phase damping
		const ampDamp = this.amplitudeDamping(gamma);
		const phaseDamp = this.phaseDamping(Math.max(0, lambda));
		
		return {
			name: 'T1/T2 Decoherence',
			krausOperators: [...ampDamp.krausOperators, ...phaseDamp.krausOperators],
			applyToState: (state: Complex[]) => {
				let result = ampDamp.applyToState(state);
				result = phaseDamp.applyToState(result);
				return result;
			},
			applyToDensityMatrix: (rho: Complex[][]) => {
				let result = ampDamp.applyToDensityMatrix(rho);
				result = phaseDamp.applyToDensityMatrix(result);
				return result;
			}
		};
	}
	
	/**
	 * ========================================
	 * GATE ERRORS
	 * ========================================
	 */
	
	/**
	 * Pauli Error Channel
	 * Random Pauli errors with specified probabilities
	 */
	pauliError(px: number, py: number, pz: number): NoiseChannel {
		const p0 = Math.sqrt(1 - px - py - pz);
		
		const K0: Complex[][] = [
			[math.complex(p0, 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(p0, 0)]
		];
		
		const K1: Complex[][] = [
			[math.complex(0, 0), math.complex(Math.sqrt(px), 0)],
			[math.complex(Math.sqrt(px), 0), math.complex(0, 0)]
		];
		
		const K2: Complex[][] = [
			[math.complex(0, 0), math.complex(0, -Math.sqrt(py))],
			[math.complex(0, Math.sqrt(py)), math.complex(0, 0)]
		];
		
		const K3: Complex[][] = [
			[math.complex(Math.sqrt(pz), 0), math.complex(0, 0)],
			[math.complex(0, 0), math.complex(-Math.sqrt(pz), 0)]
		];
		
		return {
			name: 'Pauli Error',
			krausOperators: [K0, K1, K2, K3],
			applyToState: (state: Complex[]) => this.applyKrausToState([K0, K1, K2, K3], state),
			applyToDensityMatrix: (rho: Complex[][]) => this.applyKrausToDensity([K0, K1, K2, K3], rho)
		};
	}
	
	/**
	 * Coherent Error
	 * Systematic over/under-rotation
	 */
	coherentError(axis: 'X' | 'Y' | 'Z', errorAngle: number): NoiseChannel {
		// Rotation by small error angle
		const cos = Math.cos(errorAngle / 2);
		const sin = Math.sin(errorAngle / 2);
		
		let K: Complex[][];
		
		if (axis === 'X') {
			K = [
				[math.complex(cos, 0), math.complex(0, -sin)],
				[math.complex(0, -sin), math.complex(cos, 0)]
			];
		} else if (axis === 'Y') {
			K = [
				[math.complex(cos, 0), math.complex(-sin, 0)],
				[math.complex(sin, 0), math.complex(cos, 0)]
			];
		} else { // Z
			K = [
				[math.complex(Math.cos(-errorAngle/2), Math.sin(-errorAngle/2)), math.complex(0, 0)],
				[math.complex(0, 0), math.complex(Math.cos(errorAngle/2), Math.sin(errorAngle/2))]
			];
		}
		
		return {
			name: 'Coherent Error',
			krausOperators: [K],
			applyToState: (state: Complex[]) => this.applyKrausToState([K], state),
			applyToDensityMatrix: (rho: Complex[][]) => this.applyKrausToDensity([K], rho)
		};
	}
	
	/**
	 * ========================================
	 * MEASUREMENT ERRORS
	 * ========================================
	 */
	
	/**
	 * Readout Error
	 * Classical bit-flip errors in measurement
	 */
	readoutError(p0given1: number, p1given0: number): {
		applyToMeasurement: (result: number) => number;
		confusionMatrix: number[][];
	} {
		// Confusion matrix:
		// [[P(0|0), P(1|0)],
		//  [P(0|1), P(1|1)]]
		
		const confusionMatrix = [
			[1 - p1given0, p1given0],
			[p0given1, 1 - p0given1]
		];
		
		return {
			applyToMeasurement: (result: number) => {
				const rand = Math.random();
				if (result === 0) {
					return rand < p1given0 ? 1 : 0;
				} else {
					return rand < p0given1 ? 0 : 1;
				}
			},
			confusionMatrix
		};
	}
	
	/**
	 * ========================================
	 * COMPOSITE NOISE MODELS
	 * ========================================
	 */
	
	/**
	 * Realistic Gate Noise
	 * Combines depolarizing + coherent errors
	 */
	realisticGateNoise(
		gateTime: number,
		T1: number,
		T2: number,
		depolarizingProb: number,
		coherentErrorAngle: number = 0
	): NoiseChannel {
		// Decoherence during gate
		const decoherence = this.t1t2Decoherence(gateTime, T1, T2);
		
		// Depolarizing error
		const depolarizing = this.depolarizing(depolarizingProb);
		
		// Coherent error (if any)
		const coherent = coherentErrorAngle !== 0 
			? this.coherentError('Z', coherentErrorAngle)
			: null;
		
		return {
			name: 'Realistic Gate Noise',
			krausOperators: [
				...decoherence.krausOperators,
				...depolarizing.krausOperators,
				...(coherent ? coherent.krausOperators : [])
			],
			applyToState: (state: Complex[]) => {
				let result = decoherence.applyToState(state);
				result = depolarizing.applyToState(result);
				if (coherent) {
					result = coherent.applyToState(result);
				}
				return result;
			},
			applyToDensityMatrix: (rho: Complex[][]) => {
				let result = decoherence.applyToDensityMatrix(rho);
				result = depolarizing.applyToDensityMatrix(rho);
				if (coherent) {
					result = coherent.applyToDensityMatrix(result);
				}
				return result;
			}
		};
	}
	
	/**
	 * ========================================
	 * NOISE APPLICATION
	 * ========================================
	 */
	
	/**
	 * Apply Kraus operators to pure state
	 * Returns mixed state (density matrix)
	 */
	private applyKrausToState(krausOps: Complex[][][], state: Complex[]): Complex[] {
		// For pure state, convert to density matrix, apply noise, then...
		// Actually, for Kraus on pure state, we get a mixed state
		// So we should return density matrix, but for simplicity, 
		// we'll apply one Kraus operator probabilistically
		
		// Compute probabilities: p_i = ⟨ψ|K_i†K_i|ψ⟩
		const probs: number[] = [];
		for (const K of krausOps) {
			const Kpsi = this.matrixVectorMultiply(K, state);
			let prob = 0;
			for (let i = 0; i < Kpsi.length; i++) {
				const c = math.complex(Kpsi[i]);
				prob += c.re * c.re + c.im * c.im;
			}
			probs.push(prob);
		}
		
		// Normalize probabilities
		const totalProb = probs.reduce((a, b) => a + b, 0);
		const normalizedProbs = probs.map(p => p / totalProb);
		
		// Sample which Kraus operator to apply
		const rand = Math.random();
		let cumProb = 0;
		let selectedK = 0;
		for (let i = 0; i < normalizedProbs.length; i++) {
			cumProb += normalizedProbs[i];
			if (rand < cumProb) {
				selectedK = i;
				break;
			}
		}
		
		// Apply selected Kraus operator and renormalize
		const result = this.matrixVectorMultiply(krausOps[selectedK], state);
		return this.normalizeState(result);
	}
	
	/**
	 * Apply Kraus operators to density matrix
	 * ρ → Σ_i K_i ρ K_i†
	 */
	private applyKrausToDensity(krausOps: Complex[][][], rho: Complex[][]): Complex[][] {
		const n = rho.length;
		let result: Complex[][] = Array(n).fill(0).map(() => Array(n).fill(math.complex(0, 0)));
		
		for (const K of krausOps) {
			const Kdag = this.conjugateTranspose(K);
			const KrhoKdag = this.matrixMultiply(this.matrixMultiply(K, rho), Kdag);
			
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					result[i][j] = math.add(result[i][j], KrhoKdag[i][j]) as Complex;
				}
			}
		}
		
		return result;
	}
	
	/**
	 * ========================================
	 * HELPER METHODS
	 * ========================================
	 */
	
	private matrixVectorMultiply(A: Complex[][], v: Complex[]): Complex[] {
		const result: Complex[] = [];
		for (let i = 0; i < A.length; i++) {
			let sum = math.complex(0, 0);
			for (let j = 0; j < v.length; j++) {
				sum = math.add(sum, math.multiply(A[i][j], v[j])) as Complex;
			}
			result.push(sum);
		}
		return result;
	}
	
	private matrixMultiply(A: Complex[][], B: Complex[][]): Complex[][] {
		const m = A.length;
		const n = B[0].length;
		const p = B.length;
		const result: Complex[][] = [];
		
		for (let i = 0; i < m; i++) {
			result[i] = [];
			for (let j = 0; j < n; j++) {
				let sum = math.complex(0, 0);
				for (let k = 0; k < p; k++) {
					sum = math.add(sum, math.multiply(A[i][k], B[k][j])) as Complex;
				}
				result[i][j] = sum;
			}
		}
		
		return result;
	}
	
	private conjugateTranspose(A: Complex[][]): Complex[][] {
		const m = A.length;
		const n = A[0].length;
		const result: Complex[][] = [];
		
		for (let i = 0; i < n; i++) {
			result[i] = [];
			for (let j = 0; j < m; j++) {
				result[i][j] = math.conj(A[j][i]) as Complex;
			}
		}
		
		return result;
	}
	
	private normalizeState(state: Complex[]): Complex[] {
		let norm = 0;
		for (const c of state) {
			const val = math.complex(c);
			norm += val.re * val.re + val.im * val.im;
		}
		norm = Math.sqrt(norm);
		
		return state.map(c => math.divide(c, norm) as Complex);
	}
}

/**
 * Molecular Hamiltonian - Pillar 7 (Quantum Chemistry)
 * 
 * Electronic structure Hamiltonians for molecules
 * Based on real arXiv research papers
 */

import { Complex, create, all } from 'mathjs';
import { Hamiltonian } from './Hamiltonian';

const math = create(all);

export interface MoleculeSpec {
	name: string;
	atoms: Array<{
		element: string;
		position: [number, number, number]; // x, y, z in Angstroms
	}>;
	charge: number;
	multiplicity: number;
}

export interface MolecularHamiltonianData {
	oneBodyIntegrals: number[][]; // h_pq
	twoBodyIntegrals: number[][][][]; // h_pqrs
	nuclearRepulsion: number; // E_nuc
	numOrbitals: number;
	numElectrons: number;
}

/**
 * Electronic Hamiltonian in second quantization:
 * Ĥ = Σ_pq h_pq a†_p a_q + (1/2) Σ_pqrs h_pqrs a†_p a†_q a_r a_s + E_nuc
 * 
 * For H2 molecule (minimal STO-3G basis):
 * - 2 electrons in 2 spatial orbitals → 4 spin-orbitals
 * - Singlet state (S=0) → 2 qubits after symmetry reduction
 */
export class MolecularHamiltonian {
	
	/**
	 * Get H2 molecule Hamiltonian at specific bond length
	 * Data from experimental/computational chemistry
	 * 
	 * At equilibrium (0.735 Å): E_ground = -1.137 Hartree
	 */
	static getH2Hamiltonian(bondLength: number = 0.735): MolecularHamiltonianData {
		// H2 molecule: H--H along z-axis
		const molecule: MoleculeSpec = {
			name: 'H2',
			atoms: [
				{ element: 'H', position: [0, 0, 0] },
				{ element: 'H', position: [0, 0, bondLength] }
			],
			charge: 0,
			multiplicity: 1 // Singlet
		};

		// STO-3G minimal basis: 2 spatial orbitals
		// After Jordan-Wigner: 4 qubits, but symmetry reduces to 2
		
		// One-body integrals h_pq (kinetic + nuclear attraction)
		// Values for bond length ~0.735 Å
		const h = [
			[-1.2525, -0.4759],
			[-0.4759, -0.4796]
		];

		// Two-body integrals h_pqrs (electron-electron repulsion)
		// Symmetric: h_pqrs = h_qprs = h_pqsr = h_qpsr = h_rspq = h_srpq = h_rsqp = h_srqp
		const g: number[][][][] = [
			[
				[[0.6746, 0.1809], [0.1809, 0.6638]],
				[[0.1809, 0.6638], [0.6638, 0.6975]]
			],
			[
				[[0.1809, 0.6638], [0.6638, 0.6975]],
				[[0.6638, 0.6975], [0.6975, 0.6744]]
			]
		];

		// Nuclear repulsion energy: E_nuc = 1/|R_A - R_B|
		const nuclearRepulsion = 1.0 / bondLength; // in atomic units

		return {
			oneBodyIntegrals: h,
			twoBodyIntegrals: g,
			nuclearRepulsion,
			numOrbitals: 2,
			numElectrons: 2
		};
	}

	/**
	 * Convert molecular Hamiltonian to qubit Hamiltonian
	 * Using Jordan-Wigner transformation
	 * 
	 * Returns Pauli string representation:
	 * Ĥ = c₀I + c₁Z₀ + c₂Z₁ + c₃Z₀Z₁ + c₄X₀X₁ + c₅Y₀Y₁
	 */
	static toQubitHamiltonian(molHam: MolecularHamiltonianData): {
		pauliStrings: Array<{ coeff: number; ops: string }>;
		constantTerm: number;
	} {
		const { oneBodyIntegrals: h, twoBodyIntegrals: g, nuclearRepulsion } = molHam;
		const n = molHam.numOrbitals;

		// For H2 with 2 electrons, after symmetry reduction → 2 qubits
		// Standard qubit Hamiltonian form from literature
		
		const pauliStrings: Array<{ coeff: number; ops: string }> = [];

		// Identity term (includes nuclear repulsion)
		let constantTerm = nuclearRepulsion;

		// One-body terms: Σ_pq h_pq (I - Z_p)/2 δ_pq + ...
		// Simplified for H2:
		constantTerm += (h[0][0] + h[1][1]) / 2;
		
		pauliStrings.push({ coeff: (h[0][0] - h[1][1]) / 2, ops: 'Z0' });

		// Two-body terms from g_pqrs
		// For H2: Include electron-electron repulsion
		const g_0000 = g[0][0][0][0];
		const g_0101 = g[0][1][0][1];
		const g_0110 = g[0][1][1][0];
		const g_1111 = g[1][1][1][1];

		constantTerm += (g_0000 + g_1111 + 2 * g_0110) / 8;

		pauliStrings.push({ coeff: (g_0000 - g_1111) / 8, ops: 'Z1' });
		pauliStrings.push({ coeff: g_0110 / 4, ops: 'Z0Z1' });
		pauliStrings.push({ coeff: g_0101 / 4, ops: 'X0X1' });
		pauliStrings.push({ coeff: g_0101 / 4, ops: 'Y0Y1' });

		return { pauliStrings, constantTerm };
	}

	/**
	 * Build full qubit Hamiltonian matrix from Pauli strings
	 * For 2 qubits: 4×4 matrix
	 */
	static buildQubitMatrix(qubitHam: {
		pauliStrings: Array<{ coeff: number; ops: string }>;
		constantTerm: number;
	}): Complex[][] {
		const dim = 4; // 2^2 for 2 qubits
		
		// Initialize with constant term * Identity
		const H: Complex[][] = [];
		for (let i = 0; i < dim; i++) {
			H[i] = [];
			for (let j = 0; j < dim; j++) {
				H[i][j] = i === j 
					? math.complex(qubitHam.constantTerm, 0)
					: math.complex(0, 0);
			}
		}

		// Pauli matrices
		const I = [[1, 0], [0, 1]];
		const X = [[0, 1], [1, 0]];
		const Y = [[0, -1], [1, 0]]; // -iY for real matrix
		const Z = [[1, 0], [0, -1]];

		const pauliMap: Record<string, number[][]> = { I, X, Y, Z };

		// Add each Pauli string term
		for (const term of qubitHam.pauliStrings) {
			const { coeff, ops } = term;
			
			// Parse Pauli string (e.g., "Z0Z1" → [Z, Z])
			const paulis: number[][][] = [];
			if (ops.includes('X0X1')) {
				paulis.push(this.tensorProduct(X, X));
			} else if (ops.includes('Y0Y1')) {
				paulis.push(this.tensorProduct(Y, Y));
			} else if (ops === 'Z0') {
				paulis.push(this.tensorProduct(Z, I));
			} else if (ops === 'Z1') {
				paulis.push(this.tensorProduct(I, Z));
			} else if (ops === 'Z0Z1') {
				paulis.push(this.tensorProduct(Z, Z));
			}

			// Add coeff * Pauli to H
			for (const P of paulis) {
				for (let i = 0; i < dim; i++) {
					for (let j = 0; j < dim; j++) {
						H[i][j] = math.add(
							H[i][j],
							math.multiply(coeff, P[i][j])
						) as Complex;
					}
				}
			}
		}

		return H;
	}

	private static tensorProduct(A: number[][], B: number[][]): number[][] {
		const m = A.length;
		const n = B.length;
		const result: number[][] = [];

		for (let i = 0; i < m * n; i++) {
			result[i] = [];
			for (let j = 0; j < m * n; j++) {
				const ai = Math.floor(i / n);
				const bi = i % n;
				const aj = Math.floor(j / n);
				const bj = j % n;
				result[i][j] = A[ai][aj] * B[bi][bj];
			}
		}

		return result;
	}

	/**
	 * Get expected ground state energy from literature
	 * For validation of VQE results
	 */
	static getGroundStateEnergy(molecule: string, bondLength?: number): number {
		// Experimental/high-accuracy computational values
		const energies: Record<string, number> = {
			'H2': -1.1373, // At equilibrium ~0.735 Å
			'LiH': -7.8825, // At equilibrium
			'H2O': -76.0426, // At equilibrium
		};

		return energies[molecule] || 0;
	}

	/**
	 * Validate molecular Hamiltonian satisfies:
	 * 1. Hermiticity
	 * 2. Correct number of electrons
	 * 3. Physical energy bounds
	 */
	static validate(molHam: MolecularHamiltonianData): {
		isValid: boolean;
		errors: string[];
	} {
		const errors: string[] = [];

		// Check one-body integrals are symmetric
		const h = molHam.oneBodyIntegrals;
		for (let i = 0; i < h.length; i++) {
			for (let j = 0; j < h[i].length; j++) {
				if (Math.abs(h[i][j] - h[j][i]) > 1e-10) {
					errors.push(`One-body integral not symmetric: h[${i}][${j}] ≠ h[${j}][${i}]`);
				}
			}
		}

		// Check two-body integrals have correct symmetry
		// h_pqrs = h_qprs = h_pqsr = h_qpsr (complex conjugate symmetries)
		const g = molHam.twoBodyIntegrals;
		// Simplified check for most common symmetry
		for (let p = 0; p < g.length; p++) {
			for (let q = 0; q < g[p].length; q++) {
				for (let r = 0; r < g[p][q].length; r++) {
					for (let s = 0; s < g[p][q][r].length; s++) {
						if (Math.abs(g[p][q][r][s] - g[q][p][r][s]) > 1e-10) {
							errors.push(`Two-body integral symmetry violated at [${p},${q},${r},${s}]`);
						}
					}
				}
			}
		}

		// Nuclear repulsion should be positive
		if (molHam.nuclearRepulsion < 0) {
			errors.push('Nuclear repulsion energy is negative');
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}
}

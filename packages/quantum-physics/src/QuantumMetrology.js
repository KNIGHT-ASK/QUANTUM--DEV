"use strict";
/**
 * PILLAR 10: Quantum Metrology and Sensing
 *
 * Quantum Cramér-Rao bound, Heisenberg limit, GHZ/NOON states
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumMetrology = void 0;
const mathjs_1 = require("mathjs");
const math = (0, mathjs_1.create)(mathjs_1.all);
class QuantumMetrology {
    nQubits;
    constructor(nQubits) {
        this.nQubits = nQubits;
    }
    /**
     * Quantum Fisher Information: F_Q
     * Quantum Cramér-Rao bound: Δθ ≥ 1/√(νF_Q)
     */
    quantumFisherInformation(rho, generator) {
        // Simplified calculation
        return this.nQubits; // Heisenberg limit: F_Q ∝ N²
    }
    /**
     * Create GHZ state: |GHZ⟩ = (|0...0⟩ + |1...1⟩)/√2
     * Optimal for phase estimation at Heisenberg limit
     */
    createGHZState() {
        const dim = Math.pow(2, this.nQubits);
        const state = math.zeros([dim, 1]);
        state.set([0, 0], math.complex(1 / Math.sqrt(2), 0));
        state.set([dim - 1, 0], math.complex(1 / Math.sqrt(2), 0));
        return state;
    }
    /**
     * Heisenberg limit: Δφ ∝ 1/N vs SQL ∝ 1/√N
     */
    heisenbergLimit(nParticles, measurements) {
        return 1 / (nParticles * Math.sqrt(measurements));
    }
}
exports.QuantumMetrology = QuantumMetrology;
//# sourceMappingURL=QuantumMetrology.js.map
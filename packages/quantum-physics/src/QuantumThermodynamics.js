"use strict";
/**
 * PILLAR 9: Quantum Thermodynamics and Open Systems
 *
 * Lindblad master equation, quantum heat engines, fluctuation theorems
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumThermodynamics = void 0;
const mathjs_1 = require("mathjs");
const math = (0, mathjs_1.create)(mathjs_1.all);
class QuantumThermodynamics {
    dimension;
    constructor(dimension) {
        this.dimension = dimension;
    }
    /**
     * Lindblad master equation: dρ/dt = -i[H,ρ] + Σᵢ(LᵢρLᵢ† - ½{Lᵢ†Lᵢ,ρ})
     */
    lindbladEvolution(rho, dynamics, dt) {
        // Unitary part: -i[H,ρ]
        const commutator = math.subtract(math.multiply(dynamics.hamiltonian, rho), math.multiply(rho, dynamics.hamiltonian));
        const unitaryPart = math.multiply(math.complex(0, -1), commutator);
        // Dissipative part
        let dissipativePart = math.zeros([this.dimension, this.dimension]);
        for (const lindblad of dynamics.lindbladOperators) {
            const L = lindblad.operator;
            const Ldag = math.transpose(math.conj(L));
            const term1 = math.multiply(math.multiply(L, rho), Ldag);
            const LdagL = math.multiply(Ldag, L);
            const term2 = math.multiply(0.5, math.add(math.multiply(LdagL, rho), math.multiply(rho, LdagL)));
            dissipativePart = math.add(dissipativePart, math.multiply(lindblad.rate, math.subtract(term1, term2)));
        }
        const drho = math.add(unitaryPart, dissipativePart);
        return math.add(rho, math.multiply(dt, drho));
    }
    /**
     * Thermal state: ρ_th = exp(-βH) / Z
     */
    thermalState(hamiltonian, temperature) {
        const beta = 1 / temperature;
        // Simplified - in production would diagonalize H
        return math.identity(this.dimension);
    }
}
exports.QuantumThermodynamics = QuantumThermodynamics;
//# sourceMappingURL=QuantumThermodynamics.js.map
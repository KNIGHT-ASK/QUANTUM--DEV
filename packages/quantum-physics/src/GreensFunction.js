"use strict";
/**
 * PILLAR 6 EXPANSION: Green's Functions for Many-Body Physics
 *
 * Critical for spectral properties and dynamics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreensFunction = void 0;
const mathjs_1 = require("mathjs");
const math = (0, mathjs_1.create)(mathjs_1.all);
class GreensFunction {
    /**
     * Retarded Green's Function
     * G^R(x,t;x',t') = -iθ(t-t')⟨{ψ(x,t), ψ†(x',t')}⟩
     */
    computeRetardedGF(hamiltonian, energy, eta = 0.01) {
        const n = hamiltonian.size()[0];
        const identity = math.identity(n);
        // G^R(E) = 1/(E + iη - H)
        const zMatrix = math.multiply(math.complex(energy, eta), identity);
        const denominator = math.subtract(zMatrix, hamiltonian);
        return math.inv(denominator);
    }
    /**
     * Spectral Function
     * A(ω) = -1/π Im[G^R(ω)]
     */
    computeSpectralFunction(hamiltonian, energies) {
        const spectralFunc = [];
        for (const E of energies) {
            const GR = this.computeRetardedGF(hamiltonian, E);
            const trace = math.trace(GR);
            const imagPart = typeof trace === 'number' ? 0 : math.im(trace);
            spectralFunc.push(-imagPart / Math.PI);
        }
        return spectralFunc;
    }
    /**
     * Local Density of States
     * ρ(E) = -1/π Im[Tr(G^R(E))]
     */
    computeDOS(hamiltonian, energies) {
        return this.computeSpectralFunction(hamiltonian, energies);
    }
}
exports.GreensFunction = GreensFunction;
//# sourceMappingURL=GreensFunction.js.map
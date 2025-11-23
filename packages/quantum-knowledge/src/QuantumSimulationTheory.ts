/**
 * QUANTUM SIMULATION THEORY KNOWLEDGE
 * 
 * Simulating quantum systems on quantum computers
 * 
 * Sources:
 * - Feynman's original vision
 * - Trotter-based simulation
 * - Product formulas
 * - 100+ simulation papers
 */

export const QUANTUM_SIMULATION_THEORY = {
  
  /**
   * FEYNMAN'S VISION
   */
  origin: {
    feynman1982: "Nature isn't classical, simulate it quantum mechanically",
    motivation: "Classical computers struggle with quantum systems",
    exponential: "Hilbert space grows exponentially",
    solution: "Use quantum computer to simulate quantum physics",
    impact: "Foundation of quantum computing field"
  },

  /**
   * ANALOG VS DIGITAL
   */
  approaches: {
    analog: {
      method: "Direct physical simulation",
      example: "Trapped ions, cold atoms, optical lattices",
      advantage: "Natural evolution, fewer gates",
      limitation: "Limited control, specific systems"
    },
    
    digital: {
      method: "Gate-based quantum circuits",
      advantage: "Universal, programmable",
      challenge: "Gate overhead, errors",
      dominant: "Focus of this knowledge base"
    }
  },

  /**
   * CORE PROBLEM
   */
  problem: {
    hamiltonian: "H describes quantum system",
    evolution: "U(t) = e^(-iHt) time evolution operator",
    challenge: "Implement U(t) on quantum computer",
    exponential: "General case exponentially hard classically"
  },

  /**
   * SIMULATION METHODS
   */
  methods: {
    productFormulas: {
      trotter: "Most common NISQ approach",
      gates: "O(t²||H||²/ε) for error ε",
      practical: "First/second order commonly used"
    },
    
    taylorSeries: {
      method: "Truncate Taylor expansion",
      gates: "O(t||H||log(t||H||/ε))",
      advantage: "Better asymptotic scaling"
    },
    
    qsp: {
      name: "Quantum Signal Processing",
      gates: "O(t||H||log(1/ε))",
      optimal: "Near-optimal",
      complexity: "Requires advanced techniques"
    },
    
    qdrift: {
      method: "Randomized Trotter",
      gates: "O(t²||H||²log(||H||/ε)/ε)",
      advantage: "Simple, parallelizable"
    }
  },

  /**
   * APPLICATIONS
   */
  applications: {
    chemistry: {
      molecules: "Electronic structure",
      reactions: "Reaction dynamics",
      accuracy: "Chemical accuracy possible"
    },
    
    condensedMatter: {
      hubbard: "Hubbard model",
      phases: "Quantum phase transitions",
      superconductivity: "High-Tc materials"
    },
    
    highenergy: {
      qcd: "Lattice gauge theory",
      parton: "Parton distribution functions",
      scattering: "Scattering amplitudes"
    }
  },

  /**
   * SIMULATION COMPLEXITY
   */
  complexity: {
    general: {
      problem: "Simulate n-qubit system for time t",
      classical: "Exponential in n (requires ~2^n storage)",
      quantum: "Polynomial resources",
      advantage: "Exponential quantum speedup"
    },
    
    local: {
      hamiltonian: "Local k-body interactions",
      gates: "poly(n,t,1/ε) for error ε",
      efficient: "Polynomial in all parameters",
      practical: "Basis for quantum advantage"
    },
    
    sampling: {
      problem: "Sample from quantum distribution",
      classical: "Exponentially hard in general",
      quantum: "Natural on quantum computer",
      supremacy: "Demonstrated experimentally"
    }
  },

  /**
   * ERROR ANALYSIS
   */
  errorAnalysis: {
    trotterError: {
      firstOrder: "Error ~ O(t²||H||²/n)",
      secondOrder: "Error ~ O(t³||H||³/n²)",
      higherOrder: "Better scaling, more gates",
      tradeoff: "Accuracy vs circuit depth"
    },
    
    gateError: {
      model: "Each gate has error rate p",
      total: "Total error ~ p × (gate count)",
      nisq: "p ~ 10^-3 limits depth",
      ftqc: "p < 10^-4 with error correction"
    },
    
    measurementError: {
      shots: "Statistical error ~ 1/√shots",
      readout: "SPAM errors ~ 1-5%",
      mitigation: "Can improve with post-processing"
    }
  }
};

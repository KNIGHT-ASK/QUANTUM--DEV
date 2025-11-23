/**
 * VARIATIONAL ALGORITHMS - ADVANCED KNOWLEDGE
 * 
 * Deep dive: barren plateaus, optimization, ansatz design, NISQ challenges
 * 
 * Sources:
 * - VQA Introduction (Michał Stęchły) - 65 pages comprehensive guide
 * - Job Shop Scheduling with VQA (Cambridge Quantum)
 * - Filtering VQE (F-VQE) paper
 * - 100+ VQA research papers
 */

export const VARIATIONAL_ALGORITHMS_ADVANCED = {
  
  /**
   * BARREN PLATEAUS
   * The curse of trainability
   */
  barrenPlateaus: {
    problem: "Gradients vanish exponentially with circuit depth/qubits",
    
    discovery: {
      paper: "McClean et al. 2018",
      observation: "Random circuit initialization → flat cost landscape",
      scaling: "Variance of gradient ~ exp(-poly(n))",
      consequence: "Cannot train deep circuits"
    },
    
    causes: {
      expressiveness: "Too expressive ansatz explores too much",
      entanglement: "Global entanglement spreads information",
      initialization: "Random parameters sample uniformly",
      costFunction: "Global cost functions more susceptible"
    },
    
    mitigation: {
      localCost: {
        method: "Use local cost functions (measure few qubits)",
        advantage: "Gradients don't vanish",
        application: "Chemistry, local Hamiltonians"
      },
      
      layerwise: {
        method: "Train layer-by-layer",
        procedure: "Fix shallow layers, train next layer",
        advantage: "Avoid deep random circuits",
        challenge: "May not reach optimal"
      },
      
      problemInspired: {
        method: "Design ansatz based on problem structure",
        examples: ["UCCSD for chemistry", "QAOA for optimization"],
        advantage: "Start near solution",
        requirement: "Domain knowledge"
      },
      
      correlateParameters: {
        method: "Initialize with correlated parameters",
        advantage: "Avoid uniform sampling",
        paper: "Grant et al. 2019"
      }
    },
    
    traps: {
      discovery: "Barren plateaus contain many local minima",
      paper: "Anschuetz & Kiani 2022",
      impact: "Even if gradient non-zero, optimizer gets stuck",
      severity: "Makes problem even harder than thought"
    }
  },

  /**
   * ANSATZ DESIGN
   * Art and science of circuit design
   */
  ansatzDesign: {
    hardwareEfficient: {
      description: "Match native gate set and topology",
      structure: "Alternating single-qubit rotations + entangling gates",
      advantages: ["Shallow circuits", "Easy to implement"],
      disadvantages: ["May not reach target state", "Barren plateaus"],
      
      example: {
        gates: "RY(θ) on all qubits, then CNOTs on pairs",
        repeat: "Multiple layers",
        parameters: "3n per layer for n qubits"
      }
    },
    
    problemInspired: {
      chemistry: {
        uccsd: "Unitary Coupled Cluster Singles Doubles",
        inspiration: "Classical coupled cluster theory",
        advantage: "Guaranteed to reach FCI with enough excitations",
        challenge: "Deep circuits"
      },
      
      adaptVQE: {
        innovation: "Grow ansatz adaptively",
        algorithm: "Add operators that maximize gradient",
        advantage: "Minimal circuit for given accuracy",
        cost: "Multiple VQE runs per iteration"
      },
      
      qaoa: {
        inspiration: "Adiabatic quantum computation",
        structure: "Alternating problem and mixer Hamiltonians",
        advantage: "Natural for combinatorial optimization",
        depth: "Performance improves with depth p"
      }
    },
    
    expressiveness: {
      measure: "What fraction of Hilbert space can ansatz reach?",
      tooLittle: "Cannot represent target state",
      tooMuch: "Barren plateaus, hard to optimize",
      sweet: "Just expressive enough for problem"
    }
  },

  /**
   * F-VQE - FILTERING VARIATIONAL QUANTUM EIGENSOLVER
   */
  fvqe: {
    innovation: "Modified VQE with filtering",
    inventors: "Cambridge Quantum Computing",
    paper: "arXiv:2109.03745v2",
    
    motivation: {
      vqe: "Standard VQE can converge slowly",
      qaoa: "QAOA requires deep circuits",
      goal: "Faster convergence, hardware-efficient"
    },
    
    method: {
      filter: "Apply filtering operator to enhance low-energy states",
      iteration: "Iteratively filter and optimize",
      objective: "Modified cost function with filtering",
      advantage: "Converges faster than VQE/QAOA"
    },
    
    results: {
      jobShop: "Solved 23-qubit job shop scheduling",
      comparison: "20× faster than VQE, better than QAOA",
      hardware: "IBM quantum processors",
      scalability: "Demonstrated on industrial problem"
    }
  },

  /**
   * OPTIMIZATION CHALLENGES
   */
  optimization: {
    optimizers: {
      gradientFree: {
        examples: ["COBYLA", "Nelder-Mead", "Powell"],
        advantage: "No gradient computation needed",
        disadvantage: "Slow, many function evaluations",
        usage: "Default choice for VQA"
      },
      
      gradientBased: {
        examples: ["Adam", "SGD", "L-BFGS"],
        advantage: "Faster convergence if gradients available",
        gradient: "Parameter-shift rule for quantum circuits",
        cost: "2 circuit evaluations per parameter"
      },
      
      naturalGradient: {
        method: "Use quantum Fisher information metric",
        advantage: "Faster convergence, avoids plateaus",
        cost: "Expensive to compute metric",
        paper: "Stokes et al. 2020"
      }
    },
    
    shotNoise: {
      problem: "Measurements are probabilistic",
      variance: "Expectation value estimates have noise",
      mitigation: ["More shots", "Improved sampling", "Variance reduction"],
      tradeoff: "Accuracy vs computational cost"
    },
    
    localMinima: {
      problem: "Cost landscape has many local minima",
      cause: "Non-convex optimization",
      mitigation: ["Multiple random starts", "Warm-starting", "Simulated annealing"],
      reality: "No guarantee of global optimum"
    }
  },

  /**
   * MEASUREMENT STRATEGIES
   */
  measurements: {
    grouping: {
      problem: "Hamiltonian has many terms",
      naive: "Measure each term separately",
      smart: "Group commuting terms",
      savings: "Can reduce measurements exponentially",
      methods: ["Greedy coloring", "Sorted insertion", "Qubit-wise commuting"]
    },
    
    cvar: {
      name: "Conditional Value at Risk",
      formula: "CVaR_α = E[E | E ≤ F^(-1)(α)]",
      interpretation: "Average of lowest α fraction of energies",
      advantage: "Focuses on low-energy states",
      usage: "Combinatorial optimization"
    },
    
    adaptive: {
      method: "Adapt measurement strategy based on results",
      advantage: "Focus measurements on important terms",
      challenge: "Overhead of adaptation"
    }
  },

  /**
   * PRACTICAL CONSIDERATIONS
   */
  implementation: {
    initialization: {
      random: "Standard but suffers from barren plateaus",
      classical: "Use classical solution as starting point",
      problemBased: "Initialize based on problem structure",
      recommendation: "Problem-inspired whenever possible"
    },
    
    compilation: {
      importance: "Circuit compilation critical for performance",
      optimization: "Reduce gate count and depth",
      noise: "Noise-aware compilation",
      example: "30% improvement from better compilation"
    },
    
    errorMitigation: {
      necessity: "Essential for NISQ devices",
      methods: ["ZNE", "CDR", "Readout mitigation"],
      impact: "Can improve results by orders of magnitude"
    }
  },

  /**
   * APPLICATIONS
   */
  applications: {
    chemistry: {
      vqe: "Ground state energy of molecules",
      accuracy: "Chemical accuracy (~1 kcal/mol) achievable",
      molecules: ["H₂", "LiH", "H₂O demonstrated"],
      future: "Drug discovery, materials"
    },
    
    optimization: {
      qaoa: "Combinatorial optimization problems",
      problems: ["MaxCut", "TSP", "Portfolio optimization", "Job scheduling"],
      advantage: "Polynomial performance guarantees for some problems",
      reality: "Quantum advantage not yet demonstrated"
    },
    
    machineLearning: {
      qml: "Quantum neural networks",
      kernels: "Quantum kernel methods",
      challenge: "Classical ML very strong",
      potential: "Niche applications possible"
    }
  }
};

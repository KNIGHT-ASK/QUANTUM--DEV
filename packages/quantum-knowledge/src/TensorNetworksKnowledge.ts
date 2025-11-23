/**
 * TENSOR NETWORKS KNOWLEDGE BASE
 * 
 * MPS, PEPS, MERA, DMRG for many-body quantum systems
 * 
 * Sources:
 * - Matrix Product States theory
 * - DMRG algorithm
 * - Entanglement area law
 * - 100+ tensor network papers
 */

export const TENSOR_NETWORKS_KNOWLEDGE = {
  
  /**
   * FOUNDATIONS
   * Efficient representation of quantum many-body states
   */
  motivation: {
    exponential: "Hilbert space dimension 2^N - exponential in system size",
    storage: "Cannot store general state for N > 40",
    entanglement: "Physical states have limited entanglement",
    areaLaw: "Entanglement entropy scales with boundary, not volume",
    efficiency: "Tensor networks exploit structure"
  },

  /**
   * MATRIX PRODUCT STATES (MPS)
   * 1D chain representation
   */
  mps: {
    description: "Efficient representation for 1D quantum states",
    
    structure: {
      form: "|ψ⟩ = Σ_{i₁...iₙ} A^[i₁]A^[i₂]...A^[iₙ]|i₁i₂...iₙ⟩",
      matrices: "A^[i] are χ×χ matrices (bond dimension χ)",
      indices: "Physical indices i ∈ {0,1,...,d-1}",
      contraction: "Matrix multiplication contracts virtual bonds"
    },
    
    bondDimension: {
      χ: "Controls approximation quality",
      exactState: "χ = 2^(N/2) for general state",
      truncation: "Keep χ finite → efficient approximation",
      entanglement: "χ ~ exp(S) where S is entanglement entropy"
    },
    
    areaLaw: {
      groundStates: "Gapped Hamiltonians have area-law entanglement",
      scaling: "S ~ const (boundary) not ~ N (volume)",
      mps: "MPS with polynomial χ represent area-law states",
      efficiency: "Polynomial representation for exponential space"
    }
  },

  /**
   * DMRG - DENSITY MATRIX RENORMALIZATION GROUP
   * Algorithm to find ground states
   */
  dmrg: {
    description: "Iterative algorithm to optimize MPS",
    invention: "Steven White (1992) - revolutionized condensed matter",
    
    algorithm: {
      sweep: "Sweep left-to-right, right-to-left through chain",
      local: "Optimize two sites at a time",
      truncation: "Keep χ largest singular values",
      convergence: "Iterate until energy converges"
    },
    
    applications: {
      groundState: "Find ground state of 1D Hamiltonian",
      excitations: "Excited states via targeting",
      dynamics: "Time evolution (limited time)",
      finiteT: "Finite temperature via purification"
    },
    
    performance: {
      gapped: "Excellent for gapped systems",
      critical: "Harder for critical systems (large entanglement)",
      size: "Can handle 100-1000 sites",
      accuracy: "10^-10 energy precision achievable"
    }
  },

  /**
   * PROJECTED ENTANGLED PAIR STATES (PEPS)
   * 2D generalization of MPS
   */
  peps: {
    description: "Tensor network for 2D lattices",
    structure: "Tensor at each site, bonds connect neighbors",
    
    difficulty: {
      contraction: "Exponentially hard to contract 2D network",
      approximation: "Various approximation schemes needed",
      cost: "Computationally expensive",
      scaling: "Limited to ~10×10 lattices currently"
    },
    
    applications: [
      "2D quantum magnetism",
      "Frustrated systems",
      "Topological order",
      "Quantum phase transitions"
    ]
  },

  /**
   * MERA - MULTISCALE ENTANGLEMENT RENORMALIZATION
   * Hierarchical tensor network
   */
  mera: {
    description: "Tree-like hierarchical structure",
    layers: "Disentangle and coarse-grain iteratively",
    
    advantages: {
      critical: "Efficient for critical systems",
      longRange: "Captures long-range correlations",
      scaling: "Polylogarithmic entanglement entropy",
      holography: "Connection to AdS/CFT"
    },
    
    holography: {
      ads: "MERA ~ discrete AdS geometry",
      ryu: "Entanglement entropy ~ area (Ryu-Takayanagi)",
      emergence: "Space emerges from entanglement",
      physics: "Toy model for holographic duality"
    }
  },

  /**
   * QUANTUM CIRCUITS AS TENSOR NETWORKS
   */
  quantumCircuits: {
    representation: "Quantum circuit = tensor network contraction",
    gates: "Each gate is a tensor",
    contraction: "Circuit execution = tensor contraction",
    
    simulation: {
      general: "Exponentially hard to simulate",
      structured: "Efficient for low-entanglement circuits",
      mps: "Can use MPS to simulate circuits",
      limit: "Entanglement growth limits simulation"
    }
  },

  /**
   * APPLICATIONS IN QUANTUM COMPUTING
   */
  applications: {
    circuitSimulation: "Classical simulation of quantum circuits",
    compression: "Compress quantum states for storage",
    initialization: "Prepare initial states efficiently",
    optimization: "Optimize variational circuits"
  },

  /**
   * ADVANCED TECHNIQUES
   */
  advancedMethods: {
    contractingNetworks: {
      problem: "Optimal contraction order NP-hard",
      heuristics: ["Greedy", "Simulated annealing", "Tree decomposition"],
      cost: "Determines computational complexity",
      tools: "opt_einsum, cotengra"
    },
    
    beliefPropagation: {
      method: "Message passing on tensor network",
      advantage: "Polynomial for tree-like networks",
      approximate: "Approximate for loopy networks",
      application: "Decoding quantum error correction"
    },
    
    autoRegressive: {
      ansatz: "Sequential conditional generation",
      sampling: "Generate samples efficiently",
      example: "Neural network quantum states",
      advantage: "Exact sampling possible"
    }
  },

  /**
   * ENTANGLEMENT STRUCTURE
   */
  entanglementProperties: {
    areaLaw: {
      statement: "S(A) ~ |∂A| (boundary size)",
      groundStates: "Gapped local Hamiltonians",
      violation: "Critical systems: S ~ log(|A|)",
      implication: "Efficient tensor network representation"
    },
    
    bondDimension: {
      meaning: "Dimension of virtual indices",
      entanglement: "χ ~ exp(S) where S is entanglement entropy",
      scaling: "Determines computational cost",
      truncation: "Controlled approximation"
    },
    
    cornerTransfer: {
      method: "Compute 2D partition functions",
      ctmrg: "Corner Transfer Matrix Renormalization Group",
      infinite: "For infinite 2D systems",
      application: "Classical statistical mechanics"
    }
  },

  /**
   * QUANTUM CHEMISTRY APPLICATIONS
   */
  chemistry: {
    molecularHamiltonian: {
      mapping: "Map to 1D chain via ordering",
      dmrg: "Gold standard for 1D systems",
      accuracy: "Can reach chemical accuracy",
      molecules: "Linear molecules ideal"
    },
    
    activeSpace: {
      selection: "Choose important orbitals",
      dmrgScf: "DMRG + SCF iteration",
      large: "Handle larger active spaces than CI",
      benchmark: "Chromium dimer, polyenes"
    }
  }
};

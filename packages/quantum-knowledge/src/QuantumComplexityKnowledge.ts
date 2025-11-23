/**
 * QUANTUM COMPLEXITY THEORY KNOWLEDGE BASE
 * 
 * BQP, QMA, QCMA, quantum advantage, complexity classes
 * 
 * Sources:
 * - Bravyi-Kitaev transformation paper
 * - VQA comprehensive introduction
 * - Web: Complexity theory resources
 * - 100+ complexity theory papers
 */

export const QUANTUM_COMPLEXITY_KNOWLEDGE = {
  
  /**
   * COMPLEXITY CLASSES
   */
  complexityClasses: {
    p: {
      name: "P (Polynomial time)",
      model: "Deterministic Turing machine",
      time: "Polynomial",
      examples: ["Sorting", "Graph connectivity", "Linear programming"]
    },
    
    np: {
      name: "NP (Nondeterministic Polynomial)",
      model: "Nondeterministic Turing machine",
      verification: "Polynomial time verification",
      examples: ["SAT", "Graph coloring", "TSP"],
      openQuestion: "P = NP?"
    },
    
    bpp: {
      name: "BPP (Bounded-error Probabilistic Polynomial)",
      model: "Probabilistic Turing machine",
      error: "≤ 1/3 error probability",
      amplification: "Can reduce error exponentially",
      belief: "BPP = P"
    },
    
    bqp: {
      name: "BQP (Bounded-error Quantum Polynomial)",
      model: "Quantum Turing machine",
      definition: "Quantum algorithm runs in poly time, error ≤ 1/3",
      
      complete: {
        problems: ["Approximating Jones polynomial", "Quantum circuit simulation"],
        meaning: "If you can solve these, you can solve all BQP"
      },
      
      relationships: {
        contains: "P ⊆ BQP",
        contained: "BQP ⊆ PSPACE",
        vs_np: "BQP vs NP - independent (neither contains the other)",
        factoring: "Factoring ∈ BQP (Shor's algorithm)"
      },
      
      examples: ["Factoring", "Discrete log", "Quantum simulation"]
    },
    
    qma: {
      name: "QMA (Quantum Merlin-Arthur)",
      description: "Quantum analog of NP",
      witness: "Quantum witness (quantum state)",
      verifier: "Polynomial-time quantum verifier",
      
      complete: {
        localHamiltonian: "Local Hamiltonian problem",
        description: "Is ground state energy below threshold?",
        importance: "Central problem in quantum complexity"
      },
      
      relationships: {
        contains: "NP ⊆ QMA",
        power: "QMA more powerful than NP (conjectured)",
        vs_qma1: "QMA vs QMA(1) - open problem"
      }
    },
    
    qcma: {
      name: "QCMA (Quantum Classical Merlin-Arthur)",
      witness: "Classical witness",
      verifier: "Quantum verifier",
      relationship: "NP ⊆ QCMA ⊆ QMA"
    }
  },

  /**
   * QUANTUM ADVANTAGE
   */
  quantumAdvantage: {
    definition: "Quantum computer solves problem faster than any classical",
    
    candidates: {
      shors: {
        problem: "Integer factorization",
        quantum: "Polynomial time",
        classical: "Sub-exponential (best known)",
        caveat: "Assumes no better classical algorithm exists"
      },
      
      grovers: {
        problem: "Unstructured search",
        quantum: "O(√N)",
        classical: "O(N)",
        advantage: "Quadratic speedup (provable)"
      },
      
      simulation: {
        problem: "Quantum system simulation",
        quantum: "Polynomial",
        classical: "Exponential",
        natural: "Most natural application"
      }
    },
    
    supremacy: {
      google: "Random circuit sampling (2019)",
      jiuzhang: "Boson sampling (2020)",
      zuchongzhi: "Random circuit sampling (2021)",
      challenge: "Classical algorithms keep improving"
    }
  },

  /**
   * IMPORTANT PROBLEMS
   */
  problems: {
    localHamiltonian: {
      name: "Local Hamiltonian problem",
      input: "k-local Hamiltonian H, thresholds a, b",
      question: "Is ground state energy ≤ a or ≥ b?",
      complexity: "QMA-complete",
      classical: "NP-hard special cases",
      importance: "Foundation of quantum complexity"
    },
    
    simulation: {
      name: "Quantum circuit simulation",
      problem: "Compute output of quantum circuit",
      exact: "BQP-complete",
      approximate: "Can use tensor networks",
      limit: "Exponential cost in general"
    }
  },

  /**
   * FERMION SIMULATION
   */
  fermionMethods: {
    jordanWigner: {
      description: "Standard fermion-to-qubit mapping",
      locality: "Non-local (string of Z operators)",
      cost: "O(n) gates per fermion operator",
      usage: "Most common in quantum chemistry"
    },
    
    bravyiKitaev: {
      description: "Improved fermion-to-qubit mapping",
      innovation: "Better locality properties",
      cost: "O(log n) gates per fermion operator",
      advantage: "Asymptotically superior to Jordan-Wigner",
      paper: "Bravyi & Kitaev 2002",
      
      improvement: {
        h2: "30% fewer gates than Jordan-Wigner",
        scaling: "Logarithmic vs linear",
        chemistry: "Significant for large molecules"
      }
    }
  },

  /**
   * NISQ ERA CHALLENGES
   */
  nisqComplexity: {
    vqa: {
      algorithms: ["VQE", "QAOA"],
      complexity: "Unknown - heuristic algorithms",
      advantage: "Not proven",
      issues: ["Barren plateaus", "Local minima", "Shot noise"]
    },
    
    barrenPlateaus: {
      problem: "Gradients vanish exponentially with system size",
      cause: "Random circuit initialization",
      impact: "Cannot train deep circuits",
      mitigation: ["Local cost functions", "Problem-inspired ansätze"]
    }
  },

  /**
   * QUANTUM ADVANTAGE
   */
  quantumAdvantageDetailed: {
    superdenseEncoding: {
      problem: "Communicate 2 classical bits",
      quantum: "1 qubit + shared entanglement",
      advantage: "Factor of 2",
      caveat: "Requires pre-shared entanglement"
    },
    
    quantumTeleportation: {
      task: "Transfer quantum state",
      classical: "Infinite bits (continuous state)",
      quantum: "2 classical bits + entanglement",
      significance: "Foundational for quantum communication"
    },
    
    simonsProblem: {
      problem: "Find period s of function f(x⊕s)=f(x)",
      classical: "Exponential queries",
      quantum: "O(n) queries",
      advantage: "Exponential speedup",
      importance: "Inspired Shor's algorithm"
    },
    
    deutschJozsa: {
      problem: "Determine if function is constant or balanced",
      classical: "O(2^(n-1)) queries worst-case",
      quantum: "1 query",
      advantage: "Exponential",
      caveat: "Promise problem, limited practical use"
    }
  },

  /**
   * COMPLEXITY SEPARATIONS
   */
  separations: {
    pVsNp: {
      question: "P = NP?",
      belief: "P ≠ NP",
      status: "Unsolved millennium problem",
      quantumImpact: "If P=NP, some quantum advantages collapse"
    },
    
    bqpVsNp: {
      relation: "BQP vs NP - independent",
      factoring: "Factoring ∈ BQP ∩ NP",
      oracles: "Oracle separations exist",
      openQuestion: "Relationship in real world unknown"
    },
    
    bqpVsPspace: {
      containment: "BQP ⊆ PSPACE",
      method: "Simulate quantum computer classically in poly space",
      tight: "Likely not tight bound",
      implication: "Quantum computers don't solve all hard problems"
    }
  }
};

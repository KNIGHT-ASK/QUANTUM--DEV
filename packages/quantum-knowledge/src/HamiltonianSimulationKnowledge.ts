/**
 * HAMILTONIAN SIMULATION KNOWLEDGE BASE
 * 
 * Time evolution, Trotter decomposition, product formulas
 * 
 * Sources:
 * - AQFT paper (IonQ/Maryland)
 * - Quantum simulation fundamentals
 * - Trotter-Suzuki formulas
 * - 100+ Hamiltonian simulation papers
 */

export const HAMILTONIAN_SIMULATION_KNOWLEDGE = {
  
  /**
   * FUNDAMENTALS
   */
  fundamentals: {
    problem: "Implement U(t) = e^(-iHt) on quantum computer",
    motivation: "Quantum systems evolve via Schrödinger equation",
    challenge: "General Hamiltonian → exponentially many terms",
    solution: "Decompose H into sum of simple terms"
  },

  /**
   * TROTTER-SUZUKI DECOMPOSITION
   */
  trotterSuzuki: {
    principle: "Approximate e^(A+B) using products of e^A and e^B",
    
    firstOrder: {
      formula: "e^((A+B)t) ≈ (e^(At/r) e^(Bt/r))^r",
      error: "O(t²/r) per step",
      totalError: "O(t²/r)",
      usage: "Most common for NISQ"
    },
    
    secondOrder: {
      formula: "e^((A+B)t) ≈ (e^(At/2r) e^(Bt/r) e^(At/2r))^r",
      error: "O(t³/r²)",
      advantage: "Better accuracy per step",
      cost: "More gates"
    },
    
    higherOrder: {
      recursive: "Construct order-2k from order-2(k-1)",
      formula: "Complex nested structure",
      advantage: "Much better error scaling",
      disadvantage: "Exponential gate overhead"
    }
  },

  /**
   * QUANTUM FOURIER TRANSFORM
   */
  qft: {
    definition: "QFT|j⟩ = 1/√N Σₖ e^(2πijk/N)|k⟩",
    importance: "Critical subroutine for many algorithms",
    
    applications: {
      shors: "Integer factorization",
      phaseEstimation: "Extract eigenphases",
      hhl: "Linear systems solver",
      chemistry: "Molecular simulation"
    },
    
    approximate: {
      aqft: "Remove small-angle rotations",
      error: "Controllable approximation error",
      gates: "O(n log n) instead of O(n²)",
      
      improvement: {
        standard: "O(n log² n) T gates",
        advanced: "O(n log n) T gates (Nam et al.)",
        method: "Reuse phase gradient state",
        advantage: "Factor log(n) improvement"
      }
    }
  },

  /**
   * PRODUCT FORMULAS
   */
  productFormulas: {
    lieProduct: "e^(A+B) = lim_{n→∞} (e^(A/n) e^(B/n))^n",
    
    commutatorExpansion: {
      bcH: "Baker-Campbell-Hausdorff formula",
      formula: "log(e^A e^B) = A + B + [A,B]/2 + ...",
      error: "Controlled by commutators",
      application: "Error analysis"
    },
    
    randomized: {
      method: "Randomly sample from product formulas",
      advantage: "Can improve scaling",
      paper: "Campbell 2019"
    }
  },

  /**
   * APPLICATIONS
   */
  applications: {
    chemistry: {
      problem: "Simulate molecular dynamics",
      hamiltonian: "Electronic structure Hamiltonian",
      method: "Trotter simulate time evolution",
      accuracy: "Chemical accuracy achievable"
    },
    
    condensedMatter: {
      problem: "Study quantum phase transitions",
      models: "Hubbard, Ising, Heisenberg",
      method: "Time evolution + measurements",
      goal: "Phase diagrams, critical points"
    },
    
    phaseEstimation: {
      problem: "Find eigenvalues of unitary",
      method: "Controlled time evolution",
      application: "Ground state energy",
      requirement: "Accurate Hamiltonian simulation"
    }
  }
};

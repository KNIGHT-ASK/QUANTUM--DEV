/**
 * QUANTUM ALGORITHMS - ADVANCED KNOWLEDGE
 * 
 * Comprehensive coverage: Shor, Grover, QFT, Phase Estimation, HHL
 * 
 * Sources:
 * - Lecture Notes (524 pages - Chalmers)
 * - AQFT optimization
 * - Grover amplitude amplification
 * - 100+ algorithm papers
 */

export const QUANTUM_ALGORITHMS_ADVANCED = {
  
  /**
   * GROVER'S ALGORITHM
   */
  grover: {
    problem: "Search unstructured database of N items",
    classical: "O(N) queries required",
    quantum: "O(√N) queries - quadratic speedup",
    optimal: "Provably optimal (Bennett et al. 1997)",
    
    algorithm: {
      initialization: "|s⟩ = 1/√N Σ|x⟩ (uniform superposition)",
      oracle: "O|x⟩ = (-1)^f(x)|x⟩ marks solution",
      diffusion: "D = 2|s⟩⟨s| - I (inversion about average)",
      iteration: "(DO)^k for k ≈ π√N/4 times",
      measurement: "Measure to get solution with high probability"
    },
    
    geometricView: {
      state: "Lives in 2D subspace",
      vectors: ["|α⟩ (non-solutions)", "|β⟩ (solutions)"],
      rotation: "Each iteration rotates by ~2θ where sin²θ = M/N",
      target: "Rotate to |β⟩"
    },
    
    amplitudeAmplification: {
      generalization: "Works for any amplitude amplification task",
      success: "Amplify success probability from ε to O(1)",
      iterations: "O(1/√ε)",
      applications: ["Monte Carlo", "Optimization", "Learning"]
    },
    
    variations: {
      fixedPoint: "Modified to avoid over-rotation",
      amplitude: "General amplitude amplification",
      multiple: "Search for multiple solutions"
    }
  },

  /**
   * QUANTUM FOURIER TRANSFORM
   */
  quantumFourierTransform: {
    definition: "QFT|j⟩ = 1/√N Σₖ ω^(jk)|k⟩ where ω = e^(2πi/N)",
    gates: "O(n²) for exact QFT",
    
    circuit: {
      structure: "Hadamard + controlled phase rotations",
      gates: ["H", "CRₖ where Rₖ = diag(1, e^(2πi/2^k))"],
      swap: "Final SWAP gates for bit reversal",
      depth: "O(n²)"
    },
    
    approximation: {
      aqft: "Remove small-angle rotations",
      gates: "O(n log n) - nearly linear!",
      error: "Controllable, small",
      improvement: "O(n log n) T-gates (Nam et al. 2019)"
    },
    
    applications: {
      shor: "Period finding → factoring",
      phaseEstimation: "Extract eigenphase",
      hhl: "Quantum linear systems",
      simulation: "Hamiltonian simulation"
    }
  },

  /**
   * SHOR'S ALGORITHM
   */
  shorsAlgorithm: {
    problem: "Factor integer N = pq",
    classical: "Sub-exponential (best known)",
    quantum: "Polynomial time!",
    impact: "Breaks RSA cryptography",
    
    reduction: {
      factoring: "Factor N",
      orderFinding: "Find order r of a mod N",
      periodFinding: "Find period of f(x) = a^x mod N",
      quantum: "QFT extracts period"
    },
    
    algorithm: {
      step1: "Choose random a < N",
      step2: "Quantum: find period r of a^x mod N",
      step3: "Classical: compute gcd(a^(r/2)±1, N)",
      step4: "Factors are gcd results (with probability)",
      repeat: "If fail, try again with new a"
    },
    
    quantumSubroutine: {
      registers: "Two registers: x and f(x)",
      superposition: "Create Σ|x⟩|f(x)⟩",
      measure: "Measure f(x) → collapse to period",
      qft: "Apply QFT to first register",
      extract: "Measurement gives multiple of N/r"
    },
    
    resources: {
      qubits: "~2n for n-bit number",
      gates: "O(n³) using standard multiplication",
      improvement: "O(n² log n log log n) possible",
      tGates: "O(n³) currently"
    }
  },

  /**
   * PHASE ESTIMATION
   */
  phaseEstimation: {
    problem: "Given unitary U and eigenstate |ψ⟩, find phase φ in U|ψ⟩ = e^(2πiφ)|ψ⟩",
    precision: "n bits of φ",
    
    algorithm: {
      prepare: "n ancilla qubits in |+⟩",
      controlled: "Apply controlled-U^(2^k) for k=0..n-1",
      qft: "Inverse QFT on ancilla",
      measure: "Ancilla measurement gives φ approximation"
    },
    
    applications: {
      chemistry: "Ground state energy",
      optimization: "Find minimum eigenvalue",
      hhl: "Invert matrix via eigenvalue manipulation",
      shor: "Period finding"
    },
    
    iterative: {
      ipea: "Iterative Phase Estimation Algorithm",
      advantage: "Only 1 ancilla qubit needed",
      tradeoff: "More circuit repetitions",
      nisq: "Better for NISQ devices"
    }
  },

  /**
   * HHL ALGORITHM
   */
  hhl: {
    problem: "Solve Ax = b for x",
    classical: "O(N³) for dense N×N matrix",
    quantum: "O(log N) in special cases!",
    caveat: "Outputs quantum state |x⟩, not classical x",
    
    algorithm: {
      encode: "Encode b as quantum state |b⟩",
      phaseEstimation: "Estimate eigenvalues of A",
      rotation: "Rotate ancilla by 1/λ for each eigenvalue λ",
      uncompute: "Inverse phase estimation",
      extract: "Measure or use |x⟩ quantum"
    },
    
    requirements: {
      sparse: "A must be sparse (s-sparse)",
      conditioned: "Condition number κ not too large",
      efficiency: "O(log(N)s²κ² / ε) where ε is precision",
      state: "Output is quantum state |x⟩"
    },
    
    applications: {
      ml: "Quantum machine learning",
      optimization: "Interior point methods",
      differential: "Solving PDEs",
      limitations: "Reading out full x is exponential"
    }
  },

  /**
   * QUANTUM SIMULATION
   */
  quantumSimulation: {
    trotter: "Product formula simulation",
    gates: "O(t²n²/ε) for Hamiltonian simulation",
    optimal: "Near-optimal scaling achieved",
    
    methods: {
      trotter: "First/second-order Trotter",
      qsp: "Quantum signal processing",
      lcu: "Linear combination of unitaries",
      qdrift: "Randomized product formulas"
    }
  }
};

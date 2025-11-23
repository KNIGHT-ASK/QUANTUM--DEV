/**
 * QUANTUM METROLOGY KNOWLEDGE BASE
 * 
 * Quantum-enhanced sensing and measurement
 * 
 * Sources:
 * - Research papers on quantum metrology
 * - Heisenberg limit theory
 * - Quantum Fisher information
 * - 100+ metrology papers
 * - Experimental demonstrations
 */

export const QUANTUM_METROLOGY_KNOWLEDGE = {
  
  /**
   * FOUNDATIONS
   */
  foundations: {
    goal: "Achieve precision beyond classical limits",
    
    heisenbergLimit: {
      classical: "Standard Quantum Limit (SQL): Δθ ~ 1/√N",
      quantum: "Heisenberg Limit: Δθ ~ 1/N",
      advantage: "Quadratic improvement in precision",
      achievable: "Using entangled states",
      fundamental: "Ultimate quantum limit from uncertainty"
    },
    
    quantumFisherInformation: {
      definition: "F_Q measures sensitivity of state to parameter",
      formula: "F_Q[ρ] = Tr[ρL²] where [L, ρ] = ∂_θ ρ",
      cramérRao: "Var(θ) ≥ 1/(M·F_Q) for M measurements",
      optimal: "Saturated by optimal measurement",
      importance: "Fundamental bound on precision",
      monotonicity: "Cannot increase under CPTP maps"
    },
    
    quantumCramérRao: {
      bound: "δθ² ≥ 1/(νF_Q)",
      ν: "Number of repetitions",
      saturation: "Achievable with optimal POVM",
      multiparameter: "Generalizes to quantum Fisher information matrix"
    }
  },

  /**
   * PRECISION BOUNDS
   */
  precisionBounds: {
    standardQuantumLimit: {
      scaling: "1/√N where N is number of particles/photons",
      origin: "Independent particles/photons",
      example: "Laser interferometry, atomic clocks",
      variance: "Δθ² = 1/N for product states",
      coherentLight: "Poisson statistics → shot noise"
    },
    
    heisenbergLimit: {
      scaling: "1/N",
      requirement: "Entangled probe states",
      factor: "√N improvement over SQL",
      ultimate: "Fundamental quantum limit",
      achievability: "GHZ, NOON, spin-squeezed states",
      challenge: "Fragile to decoherence"
    },
    
    fisherInformation: {
      classical: "F_C for separable states",
      quantum: "F_Q ≥ F_C for entangled states",
      saturation: "Achieved by optimal POVM",
      pure: "F_Q = 4Var(H) for phase estimation",
      mixed: "More complex formula involving eigenvalues"
    },
    
    noiseModels: {
      lossless: "Heisenberg limit achievable",
      photonLoss: "Δθ ~ 1/(η√N) where η is transmission",
      dephasing: "Degrades to SQL for large N",
      practical: "Trade-off between N and coherence time"
    }
  },

  /**
   * ENTANGLED PROBE STATES
   */
  entangledProbes: {
    ghzStates: {
      state: "|GHZ⟩ = (|0...0⟩ + |1...1⟩)/√2",
      advantage: "Heisenberg-limited phase sensing",
      fragility: "Sensitive to decoherence",
      application: "Optical interferometry",
      fisherInfo: "F_Q = N² for phase estimation",
      parity: "Parity measurement optimal"
    },
    
    noonStates: {
      state: "|NOON⟩ = (|N,0⟩ + |0,N⟩)/√2",
      photons: "N photons in superposition of paths",
      precision: "λ/2N fringe spacing",
      challenge: "Hard to generate for large N",
      fisherInfo: "F_Q = N²",
      superResolution: "N-fold enhancement"
    },
    
    squeezedStates: {
      variance: "Reduced variance in one quadrature",
      advantage: "Beat SQL, robust to loss",
      practical: "Easier to generate than NOON/GHZ",
      ligo: "Used in gravitational wave detection",
      squeezing: "ξ² < 1 for quantum enhancement",
      numberSqueezing: "ΔN² < N for atomic ensembles"
    },
    
    spinSqueezed: {
      atoms: "Collective spin of atomic ensemble",
      squeezing: "One spin component variance reduced",
      generation: "Cavity QED, one-axis twisting",
      advantage: "Δθ ~ ξ/√N where ξ < 1",
      experiments: "Demonstrated in atomic clocks"
    },
    
    twinFock: {
      state: "Equal photon/atom number in two modes",
      variance: "Number difference variance = 0",
      application: "Two-mode interferometry",
      generation: "Parametric down-conversion"
    }
  },

  /**
   * MEASUREMENT STRATEGIES
   */
  measurements: {
    homodyne: {
      type: "Quadrature measurement",
      classical: "Standard for coherent states",
      quantum: "Can measure squeezing",
      efficiency: "Near-optimal for Gaussian states"
    },
    
    photonCounting: {
      type: "Number-resolving detection",
      advantage: "Direct photon statistics",
      challenge: "Detector efficiency",
      optimal: "For NOON states"
    },
    
    parity: {
      observable: "(-1)^N",
      optimal: "For GHZ states in phase estimation",
      oscillation: "N times faster than classical",
      readout: "Can use dispersive coupling"
    },
    
    adaptiveMeasurement: {
      concept: "Update measurement based on outcomes",
      advantage: "Can approach Heisenberg limit faster",
      examples: ["Adaptive phase estimation", "Bayesian inference"],
      challenge: "Real-time feedback required"
    }
  },

  /**
   * APPLICATIONS
   */
  applications: {
    atomicClocks: {
      current: "Best precision ~10^-18 fractional frequency",
      entanglement: "Can improve by factor √N",
      challenge: "Decoherence, control",
      spinSqueezing: "Demonstrated improvements",
      future: "Nuclear clocks, 10^-19 precision",
      applications: ["GPS", "Fundamental physics tests"]
    },
    
    gravitationalWaves: {
      ligo: "Uses squeezed light since 2019",
      improvement: "3dB sensitivity improvement",
      future: "Frequency-dependent squeezing",
      challenge: "Optical losses limit improvement",
      cosmicExplorer: "Next-generation detectors",
      science: "Binary mergers, cosmology"
    },
    
    magnetometry: {
      nvCenters: "Nitrogen-vacancy centers in diamond",
      entangled: "Entangled NV ensembles",
      sensitivity: "fT/√Hz achievable",
      applications: ["Brain imaging", "Material characterization"],
      spinEcho: "Dynamical decoupling extends coherence",
      quantum: "Quantum advantage demonstrated"
    },
    
    imaging: {
      superResolution: "Beat diffraction limit",
      quantumIllumination: "Detect low-reflectivity objects",
      ghostImaging: "Image with correlated photons",
      advantage: "Better SNR than classical"
    },
    
    sensing: {
      electric: "Rydberg atoms for E-field sensing",
      rotation: "Atom interferometry for gyroscopes",
      acceleration: "Quantum accelerometers",
      force: "Optomechanical sensors"
    }
  },

  /**
   * QUANTUM PARAMETER ESTIMATION
   */
  parameterEstimation: {
    single: {
      parameter: "θ",
      optimal: "Maximize quantum Fisher information",
      measurement: "Eigenbasis of symmetric logarithmic derivative",
      estimator: "Maximum likelihood or Bayesian"
    },
    
    multiparameter: {
      parameters: "Multiple θ_i simultaneously",
      fisherMatrix: "Quantum Fisher information matrix",
      tradeoff: "Cannot estimate all optimally",
      compatible: "Commuting generators allows simultaneous saturation",
      incompatible: "Uncertainty relations limit precision"
    },
    
    frequentist: {
      approach: "Parameters are fixed unknowns",
      estimator: "Maximum likelihood",
      uncertainty: "From Fisher information"
    },
    
    bayesian: {
      approach: "Prior distribution on parameters",
      update: "Posterior from Bayes' rule",
      advantage: "Incorporates prior knowledge",
      adaptive: "Natural framework for adaptive measurements"
    }
  },

  /**
   * PRACTICAL CONSIDERATIONS
   */
  practical: {
    decoherence: {
      challenge: "Entanglement fragile to noise",
      timescale: "Must measure before decoherence",
      mitigation: ["Dynamical decoupling", "Error correction", "Robust states"]
    },
    
    losses: {
      photonLoss: "Reduces advantage, approaches SQL",
      atomLoss: "Similar effect in atomic ensembles",
      threshold: "Loss rate vs entanglement benefit"
    },
    
    statePreparation: {
      difficulty: "Generating highly entangled states",
      scalability: "Harder for large N",
      approaches: ["Cavity QED", "Parametric processes", "Quantum logic"]
    },
    
    readout: {
      efficiency: "Detection efficiency critical",
      numberResolving: "Required for some protocols",
      classical: "Classical noise floor",
      quantum: "Spin-echo, dynamical decoupling"
    }
  }
};

/**
 * QUANTUM THERMODYNAMICS KNOWLEDGE BASE
 * 
 * Complete encyclopedia of open quantum systems, Lindblad dynamics, thermalization
 * 
 * Sources:
 * - Lindblad equation fundamentals
 * - Open quantum systems theory
 * - Quantum heat engines
 * - 100+ quantum thermodynamics papers
 */

export const QUANTUM_THERMODYNAMICS_KNOWLEDGE = {
  
  /**
   * FUNDAMENTALS
   * Thermodynamics meets quantum mechanics
   */
  foundations: {
    motivation: {
      closed: "Schrödinger equation for isolated systems",
      reality: "All quantum systems interact with environment",
      open: "Need formalism for open quantum systems",
      applications: "Decoherence, dissipation, thermalization"
    },
    
    environment: {
      bath: "Large system with many degrees of freedom",
      coupling: "System-bath interaction Hamiltonian",
      markovian: "Bath has no memory (short correlation time)",
      weak: "System-bath coupling weak compared to system energy"
    }
  },

  /**
   * LINDBLAD MASTER EQUATION
   * The fundamental equation for open quantum systems
   */
  lindbladEquation: {
    description: "Most general form of Markovian master equation",
    
    equation: {
      form: "dρ/dt = -i[H,ρ]/ℏ + Σₖ γₖ(LₖρLₖ† - ½{Lₖ†Lₖ,ρ})",
      
      terms: {
        unitary: "-i[H,ρ]/ℏ - Unitary evolution from Hamiltonian",
        dissipator: "Σₖ D[Lₖ](ρ) - Non-unitary evolution from environment",
        lindbladian: "L(ρ) = -i[H,ρ]/ℏ + Σₖ D[Lₖ](ρ)"
      },
      
      lindbladOperators: {
        name: "Jump operators Lₖ",
        physical: "Represent different dissipation channels",
        rates: "γₖ ≥ 0 are dissipation rates",
        example: "Lₖ = σ⁻ for spontaneous emission"
      }
    },
    
    properties: {
      tracePreserving: "Tr(ρ) = 1 maintained at all times",
      positivity: "ρ remains positive semi-definite",
      hermiticity: "ρ = ρ† always",
      cptp: "Completely Positive Trace-Preserving map"
    },
    
    derivation: {
      gorini: "Gorini-Kossakowski-Sudarshan-Lindblad theorem (1976)",
      assumption: "Markovian dynamics",
      result: "Most general form preserving physicality",
      proof: "Ensures CPTP evolution"
    }
  },

  /**
   * COMMON DISSIPATION MECHANISMS
   */
  dissipationChannels: {
    amplitudeDamping: {
      physical: "Energy loss to environment (spontaneous emission)",
      qubit: "Excited state |1⟩ → ground state |0⟩",
      lindblad: "L = √γ σ⁻ where σ⁻ = |0⟩⟨1|",
      rate: "γ = 1/T₁ (inverse of energy relaxation time)",
      
      effect: {
        pure: "|1⟩ → √(1-γt)|1⟩ + √(γt)|0⟩ (for small t)",
        steady: "ρ_∞ = |0⟩⟨0| (ground state)",
        time: "Exponential decay: ⟨σz⟩(t) = e^(-γt)"
      }
    },
    
    phaseDamping: {
      physical: "Dephasing without energy loss",
      mechanism: "Random phase kicks from environment",
      lindblad: "L = √γ_φ σz",
      rate: "γ_φ = 1/T₂* (pure dephasing rate)",
      
      effect: {
        coherence: "Off-diagonal terms decay: ρ₀₁(t) = ρ₀₁(0)e^(-γ_φt)",
        populations: "Diagonal terms unchanged",
        steady: "Classical mixture: ρ_∞ = diag(p₀, p₁)"
      }
    },
    
    depolarizing: {
      physical: "Uniform noise on all Pauli directions",
      channel: "ρ → (1-p)ρ + p(I/2) with probability p",
      lindblad: "Lₖ ∈ {σx, σy, σz} with equal rates",
      rate: "γ for all three Pauli channels",
      
      effect: {
        mixing: "All states → maximally mixed I/2",
        isotropy: "No preferred direction",
        steady: "ρ_∞ = I/d (completely random)"
      }
    },
    
    thermalBath: {
      physical: "Equilibration with finite-temperature bath",
      temperature: "Characterized by β = 1/(k_B T)",
      lindblad: {
        excitation: "L₊ = √γ(n̄+1) σ⁺ (heating)",
        deexcitation: "L₋ = √γn̄ σ⁻ (cooling)",
        balance: "n̄ = 1/(e^(βℏω)-1) (Bose-Einstein)"
      },
      
      steady: {
        state: "ρ_∞ = e^(-βH)/Z (thermal Gibbs state)",
        populations: "Boltzmann distribution",
        temperature: "Set by bath temperature T"
      }
    }
  },

  /**
   * QUANTUM MASTER EQUATIONS
   */
  masterEquations: {
    redfield: {
      name: "Redfield equation",
      regime: "Weak coupling, Born approximation",
      secular: "Secular approximation removes fast oscillations",
      limitation: "Not always CPTP (can violate positivity)"
    },
    
    lindblad: {
      name: "Lindblad equation",
      regime: "Markovian limit",
      guarantee: "Always CPTP",
      usage: "Most commonly used in quantum computing"
    },
    
    nakajima: {
      name: "Nakajima-Zwanzig equation",
      type: "Non-Markovian master equation",
      memory: "Includes memory kernel K(t-t')",
      complexity: "More accurate but computationally expensive"
    }
  },

  /**
   * DECOHERENCE
   */
  decoherence: {
    definition: "Loss of quantum coherence due to environment",
    
    timescales: {
      t1: {
        name: "Energy relaxation time T₁",
        process: "Population decay |1⟩ → |0⟩",
        typical: "10-100 μs for superconducting qubits",
        formula: "⟨σz⟩(t) = e^(-t/T₁)"
      },
      
      t2: {
        name: "Dephasing time T₂",
        process: "Phase coherence loss",
        relation: "1/T₂ = 1/(2T₁) + 1/T₂*",
        typical: "T₂ < 2T₁ always",
        formula: "ρ₀₁(t) = e^(-t/T₂)"
      },
      
      t2Star: {
        name: "Pure dephasing time T₂*",
        process: "Dephasing without energy loss",
        causes: "Noise, fluctuations",
        mitigation: "Spin-echo, dynamical decoupling"
      }
    },
    
    environment: {
      measurement: "Continuous measurement by environment",
      einselection: "Environment-induced superselection",
      pointer: "Pointer states emerge (energy eigenstates)",
      classical: "Quantum → classical transition"
    }
  },

  /**
   * QUANTUM HEAT ENGINES
   */
  quantumEngines: {
    carnot: {
      name: "Quantum Carnot engine",
      cycle: ["Isothermal expansion", "Adiabatic expansion", "Isothermal compression", "Adiabatic compression"],
      efficiency: "η = 1 - T_cold/T_hot (Carnot efficiency)",
      working: "Two-level system, spin-1/2",
      quantum: "Coherence can affect performance"
    },
    
    otto: {
      name: "Quantum Otto engine",
      cycle: ["Isochoric heating", "Adiabatic expansion", "Isochoric cooling", "Adiabatic compression"],
      strokes: "Two adiabatic + two isochoric",
      efficiency: "η = 1 - ω₁/ω₂ (frequency ratio)",
      advantage: "Simpler to implement than Carnot"
    },
    
    refrigerator: {
      name: "Quantum refrigerator",
      purpose: "Cool system below bath temperature",
      cop: "Coefficient of performance: Q_cold/W",
      limit: "COP ≤ T_cold/(T_hot - T_cold)",
      application: "Qubit cooling, ground state preparation"
    }
  },

  /**
   * THERMALIZATION
   */
  thermalization: {
    approach: {
      mechanism: "System reaches thermal equilibrium with bath",
      timescale: "Thermalization time τ_th",
      steady: "ρ_∞ = e^(-βH)/Z",
      condition: "Requires system-bath energy exchange"
    },
    
    quantum: {
      eigenstate: "Eigenstate thermalization hypothesis (ETH)",
      chaos: "Quantum chaos leads to thermalization",
      mbl: "Many-body localization prevents thermalization",
      integrability: "Integrable systems don't fully thermalize"
    }
  },

  /**
   * QUANTUM ENTROPY PRODUCTION
   */
  entropy: {
    vonNeumann: {
      definition: "S = -Tr(ρ ln ρ)",
      pure: "S = 0 for pure states",
      mixed: "S > 0 for mixed states",
      maximum: "S = ln(d) for maximally mixed state"
    },
    
    secondLaw: {
      classical: "ΔS ≥ 0 for isolated systems",
      quantum: "⟨ΔS⟩ ≥ 0 on average",
      fluctuations: "Negative entropy production possible temporarily",
      jarzynski: "Fluctuation theorems govern statistics"
    },
    
    production: {
      rate: "dS/dt ≥ 0 for master equation",
      irreversibility: "Entropy production measures irreversibility",
      efficiency: "Related to thermodynamic efficiency"
    }
  },

  /**
   * APPLICATIONS IN QUANTUM COMPUTING
   */
  applicationsQC: {
    errorModeling: {
      usage: "Model noise in NISQ devices",
      amplitude: "Amplitude damping from T1",
      phase: "Phase damping from T2",
      realistic: "Combination of multiple channels",
      calibration: "Extract noise parameters from experiments"
    },
    
    quantumSimulation: {
      openSystems: "Simulate dissipative quantum dynamics",
      chemistry: "Chemical reactions in solution",
      biology: "Photosynthesis, energy transfer",
      methods: "Quantum trajectories, master equations"
    },
    
    quantumCooling: {
      goal: "Cool qubits to ground state",
      techniques: "Algorithmic cooling, reservoir engineering",
      limit: "Cannot cool below environment temperature (classical)",
      groundStatePreparation: "Essential for algorithms"
    }
  }
};

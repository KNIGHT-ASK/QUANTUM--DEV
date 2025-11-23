/**
 * TOPOLOGICAL QUANTUM COMPUTING KNOWLEDGE BASE
 * 
 * Anyons, braiding, topological protection
 * 
 * Sources:
 * - Web: Majorana zero modes review
 * - Topological phases of matter
 * - Braiding-based quantum computation
 * - 100+ topological QC papers
 */

export const TOPOLOGICAL_QUANTUM_KNOWLEDGE = {
  
  /**
   * FOUNDATIONS
   * Why topology for quantum computing
   */
  foundations: {
    motivation: {
      nisq: "Standard qubits extremely fragile",
      decoherence: "Local perturbations cause errors",
      topological: "Information stored non-locally",
      protection: "Robust against local noise"
    },
    
    topology: {
      global: "Depends on global properties, not local details",
      invariants: "Topological invariants unchanged by perturbations",
      groundState: "Degenerate ground states encode information",
      gap: "Protected by energy gap"
    }
  },

  /**
   * ANYONS
   * Quasi-particles in 2D
   */
  anyons: {
    statistics: {
      fermions: "Ψ(r₁,r₂) = -Ψ(r₂,r₁) in 3D",
      bosons: "Ψ(r₁,r₂) = Ψ(r₂,r₁) in 3D",
      anyons: "Ψ(r₁,r₂) = e^(iθ)Ψ(r₂,r₁) in 2D (arbitrary phase)",
      dimension: "Only possible in 2D"
    },
    
    abelian: {
      description: "Phase accumulated θ (single number)",
      exchange: "Commutative: exchange order doesn't matter",
      example: "Fractional quantum Hall at ν=1/3",
      limitation: "Not sufficient for universal quantum computing"
    },
    
    nonAbelian: {
      description: "Exchange described by unitary matrices",
      braiding: "Braid group representations",
      universal: "Can perform universal quantum computation",
      examples: ["Ising anyons", "Fibonacci anyons", "Majorana zero modes"]
    }
  },

  /**
   * MAJORANA ZERO MODES
   */
  majorana: {
    description: "Fermion that is its own antiparticle",
    splitting: "Dirac fermion → 2 Majorana modes γ₁, γ₂",
    algebra: "{γᵢ, γⱼ} = 2δᵢⱼ",
    
    implementation: {
      nanowire: "Semiconductor nanowire + superconductor + magnetic field",
      platforms: ["InAs/InSb nanowires", "Fe chains on Pb", "Quantum Hall edges"],
      signature: "Zero-bias conductance peak",
      status: "Experimental evidence, not yet definitive"
    },
    
    qubit: {
      encoding: "One qubit from pair of Majoranas",
      states: "|0⟩, |1⟩ encode fermion parity",
      nonlocal: "Information stored non-locally",
      protection: "Protected by topological gap"
    },
    
    braiding: {
      operation: "Move Majoranas around each other",
      gate: "Implements quantum gate",
      clifford: "Braiding gives only Clifford gates",
      magic: "Need magic state distillation for universality"
    }
  },

  /**
   * FRACTIONAL QUANTUM HALL
   */
  fqh: {
    effect: "Quantized Hall conductance at fractional filling",
    state5_2: {
      filling: "ν = 5/2 Landau level filling",
      anyons: "Non-abelian anyons (Ising or Fibonacci)",
      quasiparticles: "Excitations are anyons",
      braiding: "Can braid to perform quantum gates"
    },
    
    challenge: {
      temperature: "Requires ultra-low temperature (mK)",
      mobility: "High-mobility 2D electron gas needed",
      braiding: "Complex experimental setup for braiding",
      measurement: "Difficult to confirm non-abelian statistics"
    }
  },

  /**
   * SURFACE CODES (TOPOLOGICAL)
   */
  surfaceCodes: {
    toricCode: {
      lattice: "Qubits on edges of 2D square lattice",
      stabilizers: "Vertex (X) and plaquette (Z) stabilizers",
      logical: "Two logical qubits (on torus)",
      distance: "Code distance d = L (linear size)",
      threshold: "~1% error threshold"
    },
    
    braidingDefects: {
      anyons: "Logical operations by braiding defects",
      creation: "Create anyons by stabilizer measurements",
      braiding: "Move anyons through measurement sequences",
      fusion: "Fuse anyons to measure logical operators"
    }
  },

  /**
   * ADVANTAGES
   */
  advantages: {
    protection: "Topologically protected from local noise",
    scalability: "Inherently fault-tolerant",
    gates: "Gates via adiabatic braiding (no precise timing)",
    measurement: "Topological measurements robust"
  },

  /**
   * CHALLENGES
   */
  challenges: {
    realization: "Creating and manipulating anyons is extremely difficult",
    universality: "Some anyon models not universal (need magic states)",
    experimentalComplexity: "Requires ultra-low temperatures, clean systems",
    scalability: "Building large-scale topological quantum computers"
  },

  /**
   * EXPERIMENTAL PROGRESS
   */
  experiments: {
    majorana: {
      platform: "Superconductor-semiconductor nanowires",
      evidence: "Zero-bias conductance peaks",
      challenge: "Distinguishing from other effects",
      status: "Active research, debates ongoing"
    },
    
    fractionalQHE: {
      system: "2D electron gas in high magnetic field",
      ν52: "ν=5/2 state shows non-abelian statistics",
      interferometry: "Fabry-Perot interferometry",
      braiding: "Attempts to demonstrate braiding"
    },
    
    opticalLattices: {
      approach: "Cold atoms in optical lattices",
      advantage: "High control, tunability",
      simulation: "Simulate topological models",
      status: "Proof-of-concept demonstrations"
    }
  },

  /**
   * THEORETICAL FOUNDATIONS
   */
  theory: {
    categoricalFramework: {
      modularTensor: "Modular tensor categories",
      fusionRules: "Define particle fusion",
      Fmatrices: "Associativity of fusion",
      braidingMatrices: "Particle exchange"
    },
    
    conformalFieldTheory: {
      connection: "CFT describes edge states",
      chirality: "Chiral edge modes",
      centralCharge: "Related to thermal Hall effect"
    },
    
    topologicalInvariants: {
      chern: "Chern number",
      z2: "Z₂ invariant for time-reversal",
      witten: "Witten invariant from Chern-Simons"
    }
  }
};

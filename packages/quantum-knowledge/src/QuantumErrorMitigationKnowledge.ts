/**
 * QUANTUM ERROR MITIGATION KNOWLEDGE BASE
 * 
 * Complete catalog of error mitigation techniques for NISQ devices
 * 
 * Sources:
 * - arXiv:2011.01157 - Unified approach to data-driven error mitigation
 * - Zero-noise extrapolation (ZNE)
 * - Clifford Data Regression (CDR)
 * - Variable-noise CDR (vnCDR)
 * - 100+ error mitigation papers
 */

export const QUANTUM_ERROR_MITIGATION_KNOWLEDGE = {
  
  /**
   * FUNDAMENTALS
   * Why we need error mitigation on NISQ devices
   */
  motivation: {
    nisq: "Noisy Intermediate-Scale Quantum devices",
    limitations: {
      qubits: "50-1000 qubits available",
      fidelity: "Gate fidelities 99-99.9% (not enough for QEC)",
      coherence: "Limited T1, T2 times",
      connectivity: "Limited qubit connectivity"
    },
    
    errorCorrection: {
      requirement: "Requires 1000s of physical qubits per logical qubit",
      overhead: "Too expensive for current devices",
      timeline: "10-20 years away from large-scale QEC"
    },
    
    errorMitigation: {
      approach: "Classical post-processing to reduce errors",
      advantage: "No additional qubits needed",
      limitation: "Cannot eliminate all errors, only mitigate",
      status: "Essential for near-term quantum advantage"
    }
  },

  /**
   * ZERO-NOISE EXTRAPOLATION (ZNE)
   * Extrapolate to zero-noise limit
   */
  zne: {
    description: "Run circuits at different noise levels, extrapolate to zero",
    inventors: ["Temme et al. 2017", "Li & Benjamin 2017"],
    type: "Data-driven post-processing",
    
    principle: {
      assumption: "Observable ⟨O⟩(ϵ) depends smoothly on noise parameter ϵ",
      polynomial: "⟨O⟩(ϵ) = a₀ + a₁ϵ + a₂ϵ² + ...",
      goal: "Estimate a₀ = ⟨O⟩(ϵ=0) from measurements at ϵ > 0"
    },
    
    procedure: {
      step1: {
        name: "Choose noise levels",
        detail: "C = {c₀, c₁, ..., cₙ} where c₀ = 1",
        example: "c = {1, 2, 3} means baseline, 2×, 3× noise"
      },
      
      step2: {
        name: "Amplify noise",
        methods: {
          gateStretching: "Increase gate time → more decoherence",
          identityInsertion: "Add CNOT pairs (identity but noisy)",
          pulseTuning: "Adjust pulse parameters to increase errors"
        },
        practical: "Identity insertion most hardware-agnostic"
      },
      
      step3: {
        name: "Measure at each noise level",
        data: "Get ⟨O⟩̂ⱼ for each cⱼ from quantum device"
      },
      
      step4: {
        name: "Extrapolate to zero",
        richardsonExtrapolation: {
          formula: "⟨O⟩̂ = Σⱼ γⱼ⟨O⟩̂ⱼ",
          constraints: [
            "Σⱼ γⱼ = 1",
            "Σⱼ γⱼcⱼᵏ = 0 for k=1,...,n"
          ],
          order: "Cancels errors up to O(ϵⁿ⁺¹)"
        },
        
        polynomialFit: {
          method: "Fit polynomial p(c) to data points",
          prediction: "⟨O⟩̂ ≈ p(0)",
          degree: "Linear, quadratic, or exponential fits common"
        }
      }
    },
    
    identityInsertion: {
      fiim: {
        name: "Fixed Identity Insertion Method",
        procedure: "Insert 2 CNOTs for every CNOT in circuit",
        noiseLevels: "c = 1, 3, 5, 7, ... (odd multiples)",
        advantage: "Hardware agnostic"
      },
      
      example: {
        original: "U = CNOT₁₂ · Rz₁(θ) · H₂",
        c1: "U (baseline noise)",
        c2: "CNOT₁₂ · CNOT₁₂ · CNOT₁₂ · Rz₁(θ) · H₂ (3× noise on CNOT)",
        c3: "5× noise version with 5 CNOTs"
      }
    },
    
    advantages: [
      "Simple to implement",
      "No additional qubits needed",
      "Model-independent"
    ],
    
    limitations: {
      extrapolation: "Unreliable if noise structure changes",
      overhead: "Requires multiple circuit runs",
      highNoise: "Extrapolation fails if baseline too noisy",
      structure: "Assumes noise polynomial in amplification factor"
    },
    
    performance: {
      typical: "2-10× error reduction",
      bestCase: "Up to 100× for simple noise models",
      failing: "Can make errors worse with bad extrapolation"
    }
  },

  /**
   * CLIFFORD DATA REGRESSION (CDR)
   * Learn from near-Clifford training circuits
   */
  cdr: {
    description: "Train on classically simulable Clifford circuits",
    innovation: "Use circuit similarity rather than noise amplification",
    inventors: ["Czarnik et al. 2021"],
    
    cliffordCircuits: {
      definition: "Circuits composed of Clifford gates",
      cliffordGates: ["H (Hadamard)", "S (Phase)", "CNOT", "Pauli gates"],
      property: "Map Pauli operators to Pauli operators",
      simulation: "Efficiently simulable classically (Gottesman-Knill theorem)",
      complexity: "O(n²) for n qubits using stabilizer formalism"
    },
    
    procedure: {
      step1: {
        name: "Choose training circuits",
        method: "Select near-Clifford circuits similar to target",
        nearClifford: "Clifford + few T gates removed",
        example: "For VQE circuit, replace RY(θ) gates with nearby Clifford rotations"
      },
      
      step2: {
        name: "Generate training data",
        classical: "Simulate training circuits classically → noise-free results",
        quantum: "Run training circuits on quantum device → noisy results",
        pairs: "(noisy, noiseFree) training pairs"
      },
      
      step3: {
        name: "Train ansatz",
        model: "Linear regression: noiseFree ≈ a₁·noisy + a₂",
        parameters: "Find a₁, a₂ by least squares",
        formula: "(a₁, a₂) = argmin Σᵢ[yᵢ - (a₁xᵢ + a₂)]²"
      },
      
      step4: {
        name: "Predict on target circuit",
        measure: "Run target circuit on quantum device → noisy result",
        mitigate: "Apply learned function: mitigated = a₁·noisy + a₂"
      }
    },
    
    ansatz: {
      linear: "f(x) = a₁x + a₂",
      motivation: "Global depolarizing noise exactly linear",
      depolarizing: "ρ → (1-ϵ)ρ + ϵI/d",
      exactRecovery: "Linear ansatz perfectly removes global depolarizing"
    },
    
    advantages: [
      "Learns circuit-specific noise",
      "No noise amplification needed",
      "Scalable classical simulation"
    ],
    
    limitations: {
      similarity: "Requires good Clifford approximations",
      overhead: "Many training circuits needed",
      assumption: "Assumes noise similar across training and target"
    },
    
    performance: {
      typical: "5-20× error reduction",
      molecules: "Demonstrated for VQE on H₂, LiH",
      qaoa: "Effective for QAOA circuits"
    }
  },

  /**
   * VARIABLE-NOISE CDR (vnCDR)
   * Unified approach combining ZNE and CDR
   */
  vnCDR: {
    description: "CDR with training data at multiple noise levels",
    innovation: "Combines benefits of ZNE and CDR",
    inventors: ["Lowe, Gordon, et al. 2020"],
    breakthrough: "Significantly outperforms both ZNE and CDR",
    
    concept: {
      unification: "Use both circuit similarity (CDR) and noise amplification (ZNE)",
      dataAugmentation: "Generate more training data by varying noise",
      features: "Both circuit structure and noise level inform regression"
    },
    
    procedure: {
      step1: {
        name: "Generate near-Clifford training circuits",
        same: "Same as CDR - approximate target with Clifford circuits"
      },
      
      step2: {
        name: "Amplify noise in training circuits",
        method: "Run each training circuit at multiple noise levels c₁, c₂, ..., cₙ",
        result: "Larger training set with noise as additional feature"
      },
      
      step3: {
        name: "Generate augmented training data",
        classical: "Simulate all training circuits → noise-free",
        quantum: "Run all training circuits at all noise levels → noisy",
        size: "m training circuits × n noise levels = m×n data points"
      },
      
      step4: {
        name: "Train extended ansatz",
        model: "f(x, c) = b₀ + b₁c + b₂c² + ... + coefficients for circuit",
        parameters: "Optimize all b coefficients by least squares",
        hyperplane: "Fit in (noisy value, noise level) space"
      },
      
      step5: {
        name: "Predict at zero noise",
        evaluate: "Set noise level c = 1 for target circuit",
        extrapolate: "Use trained model to predict c = 0 (zero noise)"
      }
    },
    
    ansatz: {
      formula: "noiseFree ≈ b₀ + Σₖ bₖ·cᵏ + a₁·noisy + a₂",
      interpretation: {
        b_terms: "Encode noise level dependence (like ZNE)",
        a_terms: "Encode circuit similarity (like CDR)"
      },
      
      motivation: {
        richardsonExtrap: "Richardson extrapolation inspires polynomial in c",
        depolarizing: "Linear in noisy value removes global depolarizing",
        unified: "Combines both mitigation strategies"
      }
    },
    
    performance: {
      ising8Qubit: {
        task: "8-qubit transverse Ising model energy",
        unmitigated: "Baseline error",
        zne: "20× improvement over baseline",
        cdr: "18× improvement",
        vnCDR: "33× improvement (best!)"
      },
      
      randomCircuits64Qubits: {
        task: "Random quantum circuits, 64 qubits",
        zne: "2.7× worse than vnCDR",
        cdr: "1.5× worse than vnCDR",
        vnCDR: "Best performance"
      },
      
      general: "vnCDR consistently outperforms ZNE and CDR individually"
    },
    
    insights: {
      complementary: "ZNE and CDR address different error sources",
      synergy: "Combined approach captures both",
      dataAugmentation: "More training data improves regression",
      robustness: "Works even when ZNE or CDR alone fail"
    }
  },

  /**
   * OTHER ERROR MITIGATION TECHNIQUES
   */
  otherMethods: {
    probabilisticErrorCancellation: {
      name: "Probabilistic Error Cancellation (PEC)",
      method: "Represent noisy circuit as sum of noiseless circuits",
      sampling: "Sample from quasi-probability distribution",
      advantage: "Unbiased estimator",
      cost: "Exponential sampling overhead"
    },
    
    virtualDistillation: {
      name: "Virtual Distillation",
      method: "Use multiple copies of circuit to distill purer state",
      copies: "Requires 2-5 copies typically",
      advantage: "Mitigates coherent errors",
      application: "Quantum simulation, VQE"
    },
    
    symmetryVerification: {
      name: "Symmetry Verification",
      method: "Project results onto correct symmetry subspace",
      examples: ["Particle number conservation", "Spin symmetry"],
      advantage: "Enforces physical constraints",
      application: "Quantum chemistry, many-body physics"
    },
    
    postSelection: {
      name: "Post-selection",
      method: "Discard measurement outcomes that violate constraints",
      advantage: "Simple to implement",
      disadvantage: "Reduces effective data (shots wasted)",
      application: "Chemistry calculations with fixed particle number"
    },
    
    dynamicalDecoupling: {
      name: "Dynamical Decoupling",
      method: "Insert spin-echo pulse sequences during idle time",
      advantage: "Reduces decoherence",
      application: "Long-idle-time circuits, quantum memory"
    }
  },

  /**
   * PRACTICAL RECOMMENDATIONS
   */
  bestPractices: {
    selection: {
      simple: "ZNE for quick mitigation without training",
      structured: "CDR when good Clifford approximations exist",
      best: "vnCDR when computational resources allow",
      combination: "Can combine multiple methods"
    },
    
    implementation: {
      calibration: "Characterize device noise regularly",
      validation: "Test mitigation on known cases first",
      overhead: "Balance shots vs circuit repetitions",
      iteration: "Refine training sets based on results"
    },
    
    challenges: {
      extrapolationFailure: "Monitor if ZNE diverges",
      trainingSetQuality: "Ensure Clifford circuits are similar enough",
      computationalCost: "Classical simulation time for CDR/vnCDR",
      noiseModel: "Real noise more complex than assumed models"
    }
  },

  /**
   * FUTURE DIRECTIONS
   */
  outlook: {
    nearTerm: [
      "Automated mitigation selection",
      "Better training set generation",
      "Hybrid mitigation strategies",
      "Real-time adaptive mitigation"
    ],
    
    longTerm: [
      "Quantum error correction integration",
      "Error mitigation for fault-tolerant era",
      "Mitigation-aware algorithm design",
      "Hardware-software co-design"
    ],
    
    openQuestions: [
      "Theoretical limits of error mitigation?",
      "Optimal mitigation for specific noise models?",
      "Scalability to 100+ qubits?",
      "Integration with quantum advantage experiments?"
    ]
  }
};

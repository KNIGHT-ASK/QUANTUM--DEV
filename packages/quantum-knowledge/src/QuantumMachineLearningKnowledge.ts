/**
 * QUANTUM MACHINE LEARNING KNOWLEDGE BASE
 * 
 * Complete encyclopedia of QML algorithms, quantum neural networks, kernel methods
 * 
 * Sources:
 * - Web: Quantum ML overview, PennyLane tutorials, Nature Communications
 * - arXiv QML papers
 * - Variational quantum circuits for ML
 * - 100+ QML research papers
 */

export const QUANTUM_MACHINE_LEARNING_KNOWLEDGE = {
  
  /**
   * FOUNDATIONS
   * Why quantum computers for machine learning
   */
  foundations: {
    motivation: {
      classical: "ML bottleneck: matrix operations, kernel computations",
      quantum: "Quantum parallelism, entanglement, interference for speedup",
      promise: "Exponential speedup for specific tasks",
      reality: "Advantages still being discovered"
    },
    
    quantumAdvantages: {
      hilbertSpace: {
        size: "Exponentially large: 2^n for n qubits",
        encoding: "Encode exponential data in linear qubits",
        challenge: "Efficient data loading still open problem"
      },
      
      entanglement: {
        property: "Correlations classical models cannot capture",
        expressiveness: "Quantum models more expressive in some cases",
        example: "Quantum kernels access features classical kernels cannot"
      },
      
      interference: {
        mechanism: "Amplify correct solutions, cancel incorrect",
        analogy: "Similar to quantum algorithms (Grover, Shor)",
        application: "Optimization landscapes in QML"
      }
    },
    
    challenges: {
      nisq: "Current devices noisy, limited qubits",
      dataLoading: "Quantum state preparation expensive",
      measurement: "Sampling overhead for expectation values",
      barrenPlateaus: "Optimization landscapes often flat",
      advantage: "Classical ML very strong - hard to beat"
    }
  },

  /**
   * VARIATIONAL QUANTUM CIRCUITS (VQC)
   * Core building block of QML
   */
  variationalCircuits: {
    description: "Parameterized quantum circuits optimized via classical loop",
    architecture: {
      dataEncoding: {
        name: "Feature map / embedding",
        purpose: "Encode classical data x into quantum state |ψ(x)⟩",
        
        methods: {
          basis: {
            type: "Basis encoding",
            formula: "x → |x⟩ where x is binary string",
            qubits: "log₂(N) for N datapoints",
            limitation: "Only binary data, no features"
          },
          
          amplitude: {
            type: "Amplitude encoding", 
            formula: "x → |ψ⟩ = Σᵢ xᵢ|i⟩/||x||",
            qubits: "log₂(d) for d-dimensional data",
            advantage: "Exponential compression",
            challenge: "State preparation complexity"
          },
          
          angle: {
            type: "Angle encoding",
            formula: "x → RY(xᵢ)|0⟩ for each feature",
            qubits: "d qubits for d features",
            advantage: "Simple, widely used",
            example: "VQC for classification"
          },
          
          iqp: {
            type: "IQP (Instantaneous Quantum Polynomial) encoding",
            formula: "U(x) = e^(iΣᵢ xᵢZᵢ) e^(iΣᵢⱼ xᵢxⱼZᵢZⱼ)",
            advantage: "Hard to simulate classically",
            application: "Quantum kernel methods"
          }
        }
      },
      
      variationalLayer: {
        name: "Trainable quantum circuit",
        structure: "Alternating rotation and entanglement layers",
        
        rotation: {
          gates: ["RX(θ)", "RY(θ)", "RZ(θ)"],
          parameters: "θ trained by gradient descent",
          purpose: "Introduce expressiveness"
        },
        
        entanglement: {
          gates: ["CNOT", "CZ", "CRZ"],
          pattern: ["Linear", "Circular", "All-to-all"],
          purpose: "Create correlations between qubits"
        },
        
        depth: "Repeat layers p times",
        parameters: "O(p·n) for n qubits, p layers"
      },
      
      measurement: {
        observable: "Measure Pauli operators (X, Y, Z, combinations)",
        expectation: "⟨ψ(θ)|O|ψ(θ)⟩ gives prediction",
        classification: "Sign of expectation → class label",
        regression: "Expectation value → continuous output"
      }
    },
    
    training: {
      costFunction: "Mean squared error, cross-entropy, etc.",
      
      gradients: {
        parameterShift: {
          name: "Parameter-shift rule",
          formula: "∂⟨O⟩/∂θ = [⟨O⟩(θ+π/2) - ⟨O⟩(θ-π/2)]/2",
          advantage: "Exact gradients from measurements",
          cost: "2 circuit evaluations per parameter"
        },
        
        finiteDifference: {
          name: "Finite difference",
          formula: "∂⟨O⟩/∂θ ≈ [⟨O⟩(θ+ε) - ⟨O⟩(θ-ε)]/(2ε)",
          advantage: "Simple",
          disadvantage: "Approximate, sensitive to ε"
        }
      },
      
      optimizers: {
        adam: "Adaptive learning rate, momentum",
        lbfgs: "Quasi-Newton method",
        spsa: "Simultaneous perturbation stochastic approximation",
        quantumNatural: "Quantum natural gradient (Fubini-Study metric)"
      },
      
      barrenPlateaus: {
        problem: "Gradients vanish exponentially with qubits",
        cause: "Random parameter initialization",
        mitigation: [
          "Local cost functions",
          "Layer-wise training",
          "Problem-inspired initialization",
          "Correlate parameters"
        ]
      }
    },
    
    applications: {
      classification: "Binary and multi-class classification",
      regression: "Continuous value prediction",
      generativeModeling: "Quantum GANs, quantum Boltzmann machines",
      reinforcement: "Quantum reinforcement learning"
    }
  },

  /**
   * QUANTUM KERNELS
   * Use quantum computers to compute kernel functions
   */
  quantumKernels: {
    concept: "Quantum feature space yields quantum kernel",
    
    theory: {
      classicalKernel: "K(x, x') = ⟨φ(x), φ(x')⟩ in feature space",
      quantumKernel: "K_quantum(x, x') = |⟨ψ(x)|ψ(x')⟩|²",
      featureMap: "Unitary U(x) maps data to quantum state",
      computation: "Measure overlap between quantum states"
    },
    
    procedure: {
      step1: "Prepare |ψ(x)⟩ = U(x)|0⟩",
      step2: "Prepare |ψ(x')⟩ = U(x')|0⟩",
      step3: "Compute overlap: |⟨ψ(x)|ψ(x')⟩|²",
      step4: "Use kernel matrix K in classical SVM or kernel method",
      
      overlap: {
        swap: "Use SWAP test to measure |⟨ψ|φ⟩|²",
        destructive: "Measure destructive interference",
        circuit: "Involves controlled operations"
      }
    },
    
    featureMaps: {
      zz: {
        name: "ZZ feature map",
        formula: "U(x) = H^⊗n · Π_i exp(ixᵢZᵢ) · Π_ij exp(i(π-xᵢ)(π-xⱼ)ZᵢZⱼ)",
        advantage: "Hard to simulate classically",
        application: "Quantum kernel SVM"
      },
      
      pauliExpansion: {
        name: "Pauli expansion",
        formula: "U(x) = exp(iΣ_s c_s P_s(x))",
        flexibility: "Pauli strings P_s arbitrary",
        design: "Problem-dependent choices"
      }
    },
    
    advantages: {
      featureSpace: "Access to exponentially large feature space",
      hardness: "Some kernels provably hard classically",
      expressiveness: "Can capture complex patterns"
    },
    
    applications: {
      qsvm: "Quantum Support Vector Machine",
      clustering: "Quantum k-means",
      regression: "Quantum kernel ridge regression"
    }
  },

  /**
   * QUANTUM NEURAL NETWORKS (QNN)
   */
  quantumNeuralNetworks: {
    types: {
      variational: {
        name: "Variational Quantum Circuit as NN",
        architecture: "Data encoding + variational layers",
        training: "Classical backpropagation with quantum gradients",
        example: "Standard VQC for classification"
      },
      
      dissipative: {
        name: "Dissipative QNN",
        mechanism: "Open quantum systems with environment",
        training: "Adjust system-environment coupling",
        advantage: "Natural loss landscapes"
      },
      
      postVariational: {
        name: "Post-variational QNN",
        innovation: "Classical post-processing of quantum measurements",
        advantage: "Reduce quantum circuit depth",
        method: "Train classical NN on quantum features"
      }
    },
    
    architectures: {
      feedforward: {
        structure: "Input → Encoding → VQC layers → Measurement",
        depth: "Number of VQC layers",
        width: "Number of qubits"
      },
      
      convolutional: {
        name: "Quantum Convolutional Neural Network (QCNN)",
        structure: "Local unitaries + pooling (trace out qubits)",
        hierarchy: "Build features hierarchically",
        application: "Image classification, phase recognition"
      },
      
      recurrent: {
        name: "Quantum Recurrent Neural Network",
        mechanism: "Feed quantum state back into circuit",
        application: "Time series, sequential data"
      }
    },
    
    expressiveness: {
      universalApproximation: "Can approximate any function (with enough qubits)",
      barrenPlateaus: "Deep circuits suffer from vanishing gradients",
      entanglement: "Key resource for expressiveness"
    }
  },

  /**
   * SPECIFIC QML ALGORITHMS
   */
  algorithms: {
    qpca: {
      name: "Quantum Principal Component Analysis",
      method: "Quantum phase estimation on density matrix",
      speedup: "Exponential for low-rank matrices",
      requirement: "Quantum RAM (QRAM)",
      application: "Dimensionality reduction",
      paper: "Lloyd et al. 2014"
    },
    
    qsvm: {
      name: "Quantum Support Vector Machine",
      method: "Use quantum kernel for SVM",
      advantage: "Quantum feature space",
      challenge: "Kernel estimation sampling overhead",
      demonstrated: "IBM, Google quantum computers"
    },
    
    qgan: {
      name: "Quantum Generative Adversarial Network",
      generator: "Variational quantum circuit",
      discriminator: "Classical or quantum",
      application: "Generate quantum states, distributions",
      challenge: "Training instability"
    },
    
    qbm: {
      name: "Quantum Boltzmann Machine",
      model: "Transverse-field Ising model",
      training: "Quantum annealing or adiabatic evolution",
      application: "Unsupervised learning",
      hardware: "D-Wave quantum annealer"
    },
    
    qrl: {
      name: "Quantum Reinforcement Learning",
      agent: "VQC as policy network",
      advantage: "Explore superposition of actions",
      challenge: "Measurement collapses superposition",
      status: "Early research stage"
    }
  },

  /**
   * NEAR-TERM APPLICATIONS
   */
  applications: {
    classification: {
      datasets: ["Iris", "MNIST", "Fashion-MNIST", "Medical imaging"],
      performance: "Competitive with classical on small datasets",
      challenge: "Scaling to large datasets"
    },
    
    quantumChemistry: {
      task: "Predict molecular properties from structure",
      method: "VQC trained on simulation data",
      advantage: "Natural quantum-quantum interface",
      example: "Predict ground state energies, reaction barriers"
    },
    
    finance: {
      tasks: ["Portfolio optimization", "Risk analysis", "Fraud detection"],
      method: "Quantum kernels for complex patterns",
      advantage: "Capture quantum-like correlations in markets",
      status: "Active industry research"
    },
    
    drugDiscovery: {
      task: "Predict drug-protein binding",
      method: "Quantum graph neural networks",
      advantage: "Molecular graphs natural for quantum",
      impact: "Accelerate screening process"
    }
  },

  /**
   * THEORETICAL FOUNDATIONS
   */
  theory: {
    learningBounds: {
      pac: "Probably Approximately Correct learning theory",
      quantum: "Quantum PAC learning",
      sampleComplexity: "Number of examples needed to learn",
      quantumAdvantage: "Potential reduction in sample complexity"
    },
    
    expressiveness: {
      universality: "VQCs are universal function approximators",
      depth: "Depth requirements for specific functions",
      entanglement: "Measures of expressiveness"
    },
    
    kernelAlignment: {
      concept: "How well kernel aligns with target function",
      quantum: "Geometric differences between quantum and classical kernels",
      hardToCompute: "Some quantum kernels provably hard classically"
    }
  },

  /**
   * PRACTICAL IMPLEMENTATION
   */
  implementation: {
    frameworks: {
      pennylane: {
        description: "Differentiable quantum programming",
        features: ["Auto-differentiation", "PyTorch/TF integration", "Hybrid models"],
        strength: "Best for QML research"
      },
      
      qiskit: {
        description: "IBM's quantum framework",
        ml: "Qiskit Machine Learning module",
        features: ["VQC", "Quantum kernels", "Neural networks"]
      },
      
      tensorflow: {
        description: "TensorFlow Quantum",
        integration: "Seamless TF integration",
        application: "Hybrid classical-quantum models"
      },
      
      cirq: {
        description: "Google's quantum framework",
        features: "Integration with deep learning frameworks"
      }
    },
    
    bestPractices: {
      dataPreprocessing: "Normalize features, reduce dimensions first classically",
      initialization: "Problem-aware parameter initialization",
      hybridModels: "Combine quantum and classical layers",
      errorMitigation: "Essential for NISQ devices",
      benchmarking: "Compare to classical baselines fairly"
    }
  },

  /**
   * FUTURE DIRECTIONS
   */
  future: {
    faultTolerant: "QML on error-corrected devices",
    hybridClassical: "Tight integration with classical ML",
    newApplications: "Discovery of quantum-native problems",
    theory: "Better understanding of quantum advantage"
  },

  /**
   * GRADIENT-BASED TRAINING
   */
  gradientMethods: {
    parameterShift: {
      method: "Shift parameter by ±π/2",
      formula: "∂⟨O⟩/∂θ = (⟨O⟩(θ+π/2) - ⟨O⟩(θ-π/2))/2",
      cost: "2 circuit evaluations per parameter",
      exact: "Exact gradients for quantum circuits"
    },
    
    finiteDifference: {
      method: "Numerical differentiation",
      formula: "∂f/∂θ ≈ (f(θ+ε) - f(θ))/ε",
      advantage: "Simple to implement",
      disadvantage: "Approximate, sensitive to ε"
    },
    
    naturalGradient: {
      metric: "Quantum geometric tensor (QGT)",
      update: "θ → θ - η·QGT⁻¹·∇E",
      advantage: "Faster convergence, avoids plateaus",
      cost: "Expensive to compute QGT"
    },
    
    adam: {
      type: "Adaptive moment estimation",
      moments: "Track first and second moments",
      advantage: "Works well in practice",
      usage: "Popular for QML training"
    }
  },

  /**
   * CHALLENGES SPECIFIC TO QML
   */
  qmlChallenges: {
    barrenPlateaus: {
      problem: "Gradients vanish exponentially",
      cause: "Random circuit initialization",
      impact: "Cannot train deep QNNs",
      mitigation: "Local cost, problem-inspired ansatz"
    },
    
    dataloading: {
      problem: "Encoding classical data into quantum state",
      cost: "Can be exponentially expensive",
      solutions: ["Amplitude encoding", "Angle encoding", "Kernel methods"],
      bottleneck: "Often limits quantum advantage"
    },
    
    readout: {
      problem: "Need many measurements",
      shots: "Variance ~ 1/√shots",
      mitigation: ["Grouping observables", "Importance sampling"],
      cost: "Limits training speed"
    },
    
    classicalCompetition: {
      reality: "Classical ML very strong",
      challenge: "Hard to find quantum advantage",
      niche: "May exist for specific problems",
      caution: "Don't oversell quantum ML"
    }
  }
};

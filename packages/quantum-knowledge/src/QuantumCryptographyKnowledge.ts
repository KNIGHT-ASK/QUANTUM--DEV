/**
 * QUANTUM CRYPTOGRAPHY & COMMUNICATION KNOWLEDGE BASE
 * 
 * Complete encyclopedia of quantum cryptography, QKD, quantum communication
 * 
 * Sources:
 * - BB84 protocol (Bennett & Brassard 1984)
 * - E91 protocol (Ekert 1991)
 * - Wikipedia: BB84, Quantum Key Distribution
 * - arXiv quantum cryptography papers
 * - 100+ QKD and quantum communication papers
 */

export const QUANTUM_CRYPTOGRAPHY_KNOWLEDGE = {
  
  /**
   * QUANTUM KEY DISTRIBUTION (QKD)
   * Unconditionally secure communication using quantum mechanics
   */
  fundamentals: {
    motivation: {
      classical: "RSA, ECC vulnerable to quantum computers (Shor's algorithm)",
      postQuantum: "Mathematical assumptions may be broken",
      quantum: "Security from laws of physics, not computational complexity",
      unconditional: "Information-theoretic security - unbreakable even with infinite computing power"
    },
    
    quantumAdvantages: {
      noCloning: {
        theorem: "Cannot clone unknown quantum state perfectly",
        implication: "Eavesdropper cannot copy qubits without detection",
        security: "Foundation of QKD security"
      },
      
      measurement: {
        disturbance: "Measuring quantum state disturbs it irreversibly",
        detection: "Eavesdropping leaves detectable traces",
        principle: "Heisenberg uncertainty principle prevents simultaneous measurement"
      },
      
      entanglement: {
        property: "Non-local correlations stronger than classical",
        epr: "Einstein-Podolsky-Rosen paradox",
        bell: "Bell inequality violations prove quantum correlations",
        application: "E91 protocol uses entanglement for QKD"
      }
    }
  },

  /**
   * BB84 PROTOCOL
   * The first and most famous QKD protocol
   */
  bb84: {
    inventors: ["Charles Bennett", "Gilles Brassard"],
    year: 1984,
    type: "Prepare-and-measure QKD protocol",
    
    description: {
      encoding: "Photon polarization states encode bits",
      bases: {
        rectilinear: {
          name: "Rectilinear (+) basis",
          states: {
            horizontal: "|0⟩ = |→⟩ encodes bit 0",
            vertical: "|1⟩ = |↑⟩ encodes bit 1"
          },
          angle: "0° and 90°"
        },
        
        diagonal: {
          name: "Diagonal (×) basis",
          states: {
            diagonal: "|+⟩ = (|→⟩ + |↑⟩)/√2 encodes bit 0",
            antiDiagonal: "|−⟩ = (|→⟩ - |↑⟩)/√2 encodes bit 1"
          },
          angle: "45° and 135°"
        }
      },
      
      nonOrthogonality: "States from different bases are not orthogonal - key to security"
    },
    
    protocol: {
      step1: {
        name: "Alice prepares and sends qubits",
        procedure: [
          "Alice randomly chooses bit value (0 or 1)",
          "Alice randomly chooses basis (+ or ×)",
          "Alice prepares photon in corresponding state",
          "Alice sends photon to Bob through quantum channel"
        ],
        repeat: "For each bit in raw key"
      },
      
      step2: {
        name: "Bob measures qubits",
        procedure: [
          "Bob randomly chooses measurement basis (+ or ×)",
          "Bob measures photon in chosen basis",
          "Bob records measurement result and basis used"
        ],
        probability: "50% chance Bob chooses correct basis"
      },
      
      step3: {
        name: "Basis reconciliation",
        procedure: [
          "Alice and Bob publicly announce which bases they used",
          "They keep bits where bases matched (sifted key)",
          "Discard bits where bases differed"
        ],
        publicChannel: "Classical authenticated channel",
        keyRate: "~50% of transmitted bits become sifted key"
      },
      
      step4: {
        name: "Error estimation",
        procedure: [
          "Alice and Bob compare subset of sifted key bits publicly",
          "Calculate quantum bit error rate (QBER)",
          "If QBER too high, abort (eavesdropper detected)"
        ],
        threshold: "Typical threshold QBER < 11%",
        tradeoff: "Sacrificed bits for security check"
      },
      
      step5: {
        name: "Error correction",
        method: "Classical error correction codes (Cascade, LDPC)",
        purpose: "Correct errors from noise and potential eavesdropping",
        channel: "Classical authenticated public channel"
      },
      
      step6: {
        name: "Privacy amplification",
        method: "Hash remaining key to shorter final key",
        purpose: "Remove any information Eve might have",
        technique: "Universal hash functions",
        output: "Final secure key"
      }
    },
    
    security: {
      eavesdropping: {
        intercept: {
          strategy: "Eve intercepts photons, measures them, resends",
          detection: "Eve's measurement disturbs states",
          error: "Introduces ~25% error rate in random basis",
          qber: "Alice and Bob detect high QBER and abort"
        },
        
        pns: {
          attack: "Photon Number Splitting attack",
          vulnerability: "Multi-photon pulses in practical implementations",
          mitigation: "Decoy states (added random intensity variations)",
          status: "Decoy states make BB84 secure against PNS"
        }
      },
      
      provenSecurity: {
        unconditional: "Provably secure against any attack allowed by quantum mechanics",
        assumption: "Authenticated classical channel (prevent man-in-the-middle)",
        theorem: "Security proven using quantum information theory",
        references: [
          "Mayers 2001 - Unconditional security proof",
          "Shor & Preskill 2000 - Simple proof using entanglement"
        ]
      }
    },
    
    practicalImplementation: {
      photons: {
        source: "Attenuated laser or single-photon source",
        wavelength: "850 nm, 1310 nm, 1550 nm (telecom bands)",
        detector: "Avalanche photodiodes (APDs) or superconducting nanowire"
      },
      
      channel: {
        fiber: "Optical fiber - up to 100-200 km",
        freeSpace: "Free-space line-of-sight - satellite to ground",
        loss: "Main limitation - exponential attenuation with distance",
        noise: "Background light, dark counts, detector inefficiency"
      },
      
      keyRates: {
        metro: "1-10 Mbps at 10-20 km",
        longDistance: "1-100 kbps at 50-100 km",
        satellite: "1-10 kbps ground to satellite"
      },
      
      realizations: [
        "Commercial QKD systems (ID Quantique, Toshiba)",
        "Chinese Micius satellite (2016)",
        "DARPA Quantum Network (2004-2007)",
        "European quantum networks (SECOQC)"
      ]
    }
  },

  /**
   * E91 PROTOCOL
   * Entanglement-based QKD
   */
  e91: {
    inventor: "Artur Ekert",
    year: 1991,
    type: "Entanglement-based QKD protocol",
    innovation: "Uses EPR pairs instead of single photons",
    
    description: {
      source: "Produces entangled photon pairs",
      distribution: "One photon to Alice, one to Bob",
      state: "|Ψ⁻⟩ = (|01⟩ - |10⟩)/√2 - Bell singlet state",
      
      measurement: {
        alice: "Measures in one of 3 randomly chosen bases",
        bob: "Measures in one of 3 randomly chosen bases",
        correlation: "Perfect anti-correlation when same basis"
      }
    },
    
    security: {
      bellTest: {
        purpose: "Verify entanglement quality and detect eavesdropping",
        method: "Compute Bell inequality (CHSH inequality)",
        quantum: "S_quantum ≤ 2√2 ≈ 2.828",
        classical: "S_classical ≤ 2",
        violation: "If S > 2, proves genuine entanglement",
        security: "Eavesdropping reduces Bell violation"
      },
      
      deviceIndependent: {
        concept: "Security without trusting devices",
        proof: "Bell violation certifies quantum correlations",
        advantage: "Immune to device imperfections and side-channels",
        status: "Experimentally demonstrated"
      }
    },
    
    advantages: [
      "Device-independent security possible",
      "Natural for quantum repeaters",
      "Bell test provides intrinsic security check"
    ],
    
    disadvantages: [
      "Requires entangled photon source",
      "Lower key rates than BB84",
      "More complex experimental setup"
    ]
  },

  /**
   * ADVANCED QKD PROTOCOLS
   */
  advancedProtocols: {
    b92: {
      name: "Bennett 1992",
      innovation: "Only 2 non-orthogonal states (simplified BB84)",
      states: "|0⟩ and |+⟩",
      security: "Equivalent to BB84 but simpler"
    },
    
    sixState: {
      name: "Six-state protocol",
      innovation: "3 mutually unbiased bases",
      bases: ["{|0⟩, |1⟩}", "{|+⟩, |−⟩}", "{|i+⟩, |i−⟩}"],
      advantage: "More robust against certain attacks"
    },
    
    cov: {
      name: "Continuous Variable QKD",
      encoding: "Gaussian modulation of coherent states",
      measurement: "Homodyne/heterodyne detection",
      advantage: "Compatible with standard telecom equipment",
      distance: "Limited to ~25 km currently"
    },
    
    mdi: {
      name: "Measurement-Device-Independent QKD",
      innovation: "Immune to all detector side-channels",
      method: "Untrusted relay performs Bell measurement",
      security: "Only source needs to be trusted",
      status: "Experimentally demonstrated over 400 km"
    },
    
    twin: {
      name: "Twin-Field QKD",
      breakthrough: "Overcomes fundamental rate-loss limit",
      method: "Phase-matching of weak coherent states",
      achievement: "Key rate scaling ~η instead of ~√η",
      distance: "Demonstrated over 500+ km",
      impact: "Major advance for long-distance QKD"
    }
  },

  /**
   * QUANTUM NETWORKS
   */
  quantumNetworks: {
    architecture: {
      trusted: {
        type: "Trusted node network",
        method: "Point-to-point QKD links",
        nodes: "Nodes are trusted relay points",
        security: "Compromised node compromises all traffic",
        status: "Currently deployed networks"
      },
      
      quantum: {
        type: "All-quantum network",
        method: "Quantum repeaters extend range",
        entanglement: "End-to-end entanglement distribution",
        security: "Unconditional security maintained",
        challenge: "Quantum memory and repeater technology"
      }
    },
    
    quantumRepeaters: {
      purpose: "Extend QKD beyond attenuation limit",
      
      generations: {
        gen1: {
          method: "Heralded entanglement generation + purification",
          swapping: "Bell state measurement connects segments",
          memory: "Quantum memory stores entanglement",
          status: "Laboratory demonstrations"
        },
        
        gen2: {
          method: "Add error correction to gen1",
          advantage: "Error correction on quantum states",
          requirement: "High-quality quantum error correction"
        },
        
        gen3: {
          method: "Fault-tolerant quantum computation at nodes",
          capability: "Full quantum network layer",
          timeline: "Long-term goal (20-30 years)"
        }
      }
    },
    
    applications: [
      "Secure communication for government/military",
      "Financial transactions",
      "Critical infrastructure protection",
      "Distributed quantum computation",
      "Quantum clock synchronization",
      "Quantum sensor networks"
    ]
  },

  /**
   * QUANTUM RANDOM NUMBER GENERATION
   */
  qrng: {
    motivation: "True randomness from quantum measurements",
    principle: "Quantum measurement outcomes are fundamentally random",
    
    methods: {
      photonArrival: "Measure photon arrival time",
      beamSplitter: "Photon path after 50-50 beamsplitter",
      vacuumFluctuations: "Measure quantum vacuum fluctuations",
      entanglement: "Measurement outcomes of entangled pairs"
    },
    
    certification: {
      deviceIndependent: "Certify randomness using Bell violations",
      semiDeviceIndependent: "Partial characterization of device",
      advantage: "Provably random against quantum adversary"
    },
    
    applications: [
      "Cryptographic key generation",
      "Monte Carlo simulations",
      "Gambling and lotteries",
      "Scientific simulations"
    ]
  },

  /**
   * POST-QUANTUM CRYPTOGRAPHY COMPARISON
   */
  postQuantumVsQuantum: {
    postQuantum: {
      type: "Classical cryptography resistant to quantum attacks",
      examples: ["Lattice-based", "Code-based", "Hash-based", "Multivariate"],
      security: "Computational - based on hard math problems",
      advantage: "Works with existing infrastructure",
      disadvantage: "May be broken by new algorithms",
      status: "NIST standardization ongoing"
    },
    
    quantumCrypto: {
      type: "Uses quantum mechanics for security",
      examples: ["QKD", "Quantum signatures", "Quantum money"],
      security: "Information-theoretic - laws of physics",
      advantage: "Provably secure against any attack",
      disadvantage: "Requires quantum hardware and channels",
      status: "Commercially available QKD systems"
    },
    
    hybrid: {
      approach: "Use both quantum and post-quantum",
      benefit: "Best of both worlds",
      deployment: "QKD + PQC for defense-in-depth",
      future: "Likely combined approach for maximum security"
    }
  }
};

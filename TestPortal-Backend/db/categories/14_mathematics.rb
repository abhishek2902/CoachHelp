def mathematics_categories
  {
    'Mathematics' => {
      children: [
        { name: 'Pure Mathematics', children: [
          { name: 'Algebra', children: [
            { name: 'Elementary Algebra', children: [
              { name: 'Linear Equations' }, { name: 'Quadratic Equations' }, { name: 'Polynomials' },
              { name: 'Factoring' }, { name: 'Rational Expressions' }
            ]},
            { name: 'Abstract Algebra', children: [
              { name: 'Group Theory' }, { name: 'Ring Theory' }, { name: 'Field Theory' },
              { name: 'Linear Algebra' }, { name: 'Vector Spaces' }
            ]},
            { name: 'Number Theory', children: [
              { name: 'Elementary Number Theory' }, { name: 'Analytic Number Theory' },
              { name: 'Algebraic Number Theory' }, { name: 'Cryptography' }
            ]}
          ]},
          { name: 'Geometry', children: [
            { name: 'Euclidean Geometry', children: [
              { name: 'Plane Geometry' }, { name: 'Solid Geometry' }, { name: 'Coordinate Geometry' },
              { name: 'Trigonometry' }
            ]},
            { name: 'Non-Euclidean Geometry', children: [
              { name: 'Spherical Geometry' }, { name: 'Hyperbolic Geometry' }, { name: 'Projective Geometry' }
            ]},
            { name: 'Differential Geometry', children: [
              { name: 'Curves and Surfaces' }, { name: 'Manifolds' }, { name: 'Riemannian Geometry' }
            ]},
            { name: 'Algebraic Geometry', children: [
              { name: 'Varieties' }, { name: 'Schemes' }, { name: 'Cohomology' }
            ]}
          ]},
          { name: 'Analysis', children: [
            { name: 'Real Analysis', children: [
              { name: 'Calculus' }, { name: 'Limits and Continuity' }, { name: 'Differentiation' },
              { name: 'Integration' }, { name: 'Series and Sequences' }
            ]},
            { name: 'Complex Analysis', children: [
              { name: 'Complex Functions' }, { name: 'Contour Integration' }, { name: 'Residue Theory' },
              { name: 'Conformal Mappings' }
            ]},
            { name: 'Functional Analysis', children: [
              { name: 'Banach Spaces' }, { name: 'Hilbert Spaces' }, { name: 'Operators' }
            ]},
            { name: 'Harmonic Analysis', children: [
              { name: 'Fourier Analysis' }, { name: 'Wavelets' }, { name: 'Signal Processing' }
            ]}
          ]},
          { name: 'Topology', children: [
            { name: 'Point-Set Topology', children: [
              { name: 'Topological Spaces' }, { name: 'Continuity' }, { name: 'Compactness' },
              { name: 'Connectedness' }
            ]},
            { name: 'Algebraic Topology', children: [
              { name: 'Homology' }, { name: 'Cohomology' }, { name: 'Fundamental Group' }
            ]},
            { name: 'Differential Topology', children: [
              { name: 'Manifolds' }, { name: 'Differential Forms' }, { name: 'De Rham Cohomology' }
            ]}
          ]}
        ]},
        { name: 'Applied Mathematics', children: [
          { name: 'Statistics', children: [
            { name: 'Descriptive Statistics', children: [
              { name: 'Measures of Central Tendency' }, { name: 'Measures of Dispersion' },
              { name: 'Data Visualization' }, { name: 'Correlation' }
            ]},
            { name: 'Inferential Statistics', children: [
              { name: 'Hypothesis Testing' }, { name: 'Confidence Intervals' }, { name: 'Regression Analysis' },
              { name: 'ANOVA' }
            ]},
            { name: 'Probability Theory', children: [
              { name: 'Probability Distributions' }, { name: 'Random Variables' }, { name: 'Stochastic Processes' },
              { name: 'Markov Chains' }
            ]},
            { name: 'Bayesian Statistics', children: [
              { name: 'Bayesian Inference' }, { name: 'Prior and Posterior Distributions' },
              { name: 'Bayesian Networks' }
            ]}
          ]},
          { name: 'Mathematical Physics', children: [
            { name: 'Classical Mechanics', children: [
              { name: 'Lagrangian Mechanics' }, { name: 'Hamiltonian Mechanics' }, { name: 'Rigid Body Dynamics' }
            ]},
            { name: 'Quantum Mechanics', children: [
              { name: 'Wave Functions' }, { name: 'Operators' }, { name: 'Quantum States' }
            ]},
            { name: 'Electromagnetism', children: [
              { name: 'Maxwell\'s Equations' }, { name: 'Electromagnetic Fields' }, { name: 'Wave Propagation' }
            ]},
            { name: 'Relativity', children: [
              { name: 'Special Relativity' }, { name: 'General Relativity' }, { name: 'Tensor Calculus' }
            ]}
          ]},
          { name: 'Mathematical Biology', children: [
            { name: 'Population Dynamics', children: [
              { name: 'Predator-Prey Models' }, { name: 'Logistic Growth' }, { name: 'Epidemiological Models' }
            ]},
            { name: 'Neuroscience', children: [
              { name: 'Neural Networks' }, { name: 'Brain Modeling' }, { name: 'Signal Processing' }
            ]},
            { name: 'Genetics', children: [
              { name: 'Population Genetics' }, { name: 'Evolutionary Dynamics' }, { name: 'Gene Networks' }
            ]}
          ]},
          { name: 'Financial Mathematics', children: [
            { name: 'Quantitative Finance', children: [
              { name: 'Option Pricing' }, { name: 'Risk Management' }, { name: 'Portfolio Theory' }
            ]},
            { name: 'Stochastic Calculus', children: [
              { name: 'Brownian Motion' }, { name: 'Ito\'s Lemma' }, { name: 'Stochastic Differential Equations' }
            ]},
            { name: 'Actuarial Science', children: [
              { name: 'Life Insurance' }, { name: 'Pension Plans' }, { name: 'Risk Assessment' }
            ]}
          ]}
        ]},
        { name: 'Computational Mathematics', children: [
          { name: 'Numerical Analysis', children: [
            { name: 'Numerical Methods', children: [
              { name: 'Root Finding' }, { name: 'Integration Methods' }, { name: 'Differential Equations' },
              { name: 'Interpolation' }
            ]},
            { name: 'Linear Algebra Computations', children: [
              { name: 'Matrix Operations' }, { name: 'Eigenvalue Problems' }, { name: 'Linear Systems' }
            ]},
            { name: 'Optimization', children: [
              { name: 'Linear Programming' }, { name: 'Nonlinear Programming' }, { name: 'Convex Optimization' }
            ]}
          ]},
          { name: 'Scientific Computing', children: [
            { name: 'High Performance Computing', children: [
              { name: 'Parallel Computing' }, { name: 'Distributed Computing' }, { name: 'GPU Computing' }
            ]},
            { name: 'Computational Fluid Dynamics', children: [
              { name: 'Finite Element Methods' }, { name: 'Finite Difference Methods' }, { name: 'Spectral Methods' }
            ]},
            { name: 'Computational Geometry', children: [
              { name: 'Algorithms' }, { name: 'Geometric Modeling' }, { name: 'Computer Graphics' }
            ]}
          ]},
          { name: 'Mathematical Software', children: [
            { name: 'Programming Languages', children: [
              { name: 'MATLAB' }, { name: 'Python (NumPy, SciPy)' }, { name: 'R' }, { name: 'Julia' }
            ]},
            { name: 'Computer Algebra Systems', children: [
              { name: 'Mathematica' }, { name: 'Maple' }, { name: 'SageMath' }
            ]}
          ]}
        ]},
        { name: 'Discrete Mathematics', children: [
          { name: 'Combinatorics', children: [
            { name: 'Enumeration', children: [
              { name: 'Counting Principles' }, { name: 'Permutations and Combinations' }, { name: 'Generating Functions' }
            ]},
            { name: 'Graph Theory', children: [
              { name: 'Graph Properties' }, { name: 'Graph Algorithms' }, { name: 'Network Theory' }
            ]},
            { name: 'Design Theory', children: [
              { name: 'Block Designs' }, { name: 'Latin Squares' }, { name: 'Finite Geometries' }
            ]}
          ]},
          { name: 'Logic', children: [
            { name: 'Mathematical Logic', children: [
              { name: 'Propositional Logic' }, { name: 'Predicate Logic' }, { name: 'Set Theory' }
            ]},
            { name: 'Model Theory', children: [
              { name: 'First-Order Logic' }, { name: 'Model Constructions' }, { name: 'Completeness' }
            ]},
            { name: 'Proof Theory', children: [
              { name: 'Formal Proofs' }, { name: 'Proof Systems' }, { name: 'Consistency' }
            ]}
          ]},
          { name: 'Theoretical Computer Science', children: [
            { name: 'Algorithms', children: [
              { name: 'Algorithm Design' }, { name: 'Complexity Analysis' }, { name: 'Data Structures' }
            ]},
            { name: 'Computability Theory', children: [
              { name: 'Turing Machines' }, { name: 'Computable Functions' }, { name: 'Undecidability' }
            ]},
            { name: 'Complexity Theory', children: [
              { name: 'P vs NP' }, { name: 'NP-Complete Problems' }, { name: 'Space Complexity' }
            ]}
          ]}
        ]},
        { name: 'Mathematical Education', children: [
          { name: 'K-12 Mathematics', children: [
            { name: 'Elementary Mathematics' }, { name: 'Middle School Mathematics' }, { name: 'High School Mathematics' }
          ]},
          { name: 'University Mathematics', children: [
            { name: 'Calculus' }, { name: 'Linear Algebra' }, { name: 'Abstract Algebra' }, { name: 'Real Analysis' }
          ]},
          { name: 'Mathematical Pedagogy', children: [
            { name: 'Teaching Methods' }, { name: 'Curriculum Development' }, { name: 'Assessment' }
          ]}
        ]}
      ]
    }
  }
end 
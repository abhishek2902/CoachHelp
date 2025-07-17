def olympiad_categories
  {
    'Olympiad Competitions' => {
      children: [
        { name: 'Mathematics Olympiads', children: [
          { name: 'International Mathematical Olympiad (IMO)', children: [
            { name: 'Algebra' }, { name: 'Geometry' }, { name: 'Number Theory' },
            { name: 'Combinatorics' }, { name: 'Problem Solving' }
          ]},
          { name: 'Regional Mathematics Olympiads', children: [
            { name: 'Asian Pacific Mathematics Olympiad (APMO)' },
            { name: 'European Girls\' Mathematical Olympiad (EGMO)' },
            { name: 'Balkan Mathematical Olympiad' }
          ]},
          { name: 'National Mathematics Olympiads', children: [
            { name: 'USA Mathematical Olympiad (USAMO)' },
            { name: 'British Mathematical Olympiad (BMO)' },
            { name: 'Indian National Mathematical Olympiad (INMO)' },
            { name: 'Canadian Mathematical Olympiad (CMO)' }
          ]}
        ]},
        { name: 'Science Olympiads', children: [
          { name: 'Physics Olympiads', children: [
            { name: 'International Physics Olympiad (IPhO)', children: [
              { name: 'Mechanics' }, { name: 'Thermodynamics' }, { name: 'Electromagnetism' },
              { name: 'Optics' }, { name: 'Modern Physics' }
            ]},
            { name: 'Asian Physics Olympiad (APhO)' },
            { name: 'European Physics Olympiad (EuPhO)' }
          ]},
          { name: 'Chemistry Olympiads', children: [
            { name: 'International Chemistry Olympiad (IChO)', children: [
              { name: 'Physical Chemistry' }, { name: 'Organic Chemistry' }, { name: 'Inorganic Chemistry' },
              { name: 'Analytical Chemistry' }
            ]},
            { name: 'Asian Chemistry Olympiad' }
          ]},
          { name: 'Biology Olympiads', children: [
            { name: 'International Biology Olympiad (IBO)', children: [
              { name: 'Cell Biology' }, { name: 'Genetics' }, { name: 'Ecology' },
              { name: 'Human Physiology' }, { name: 'Plant Biology' }
            ]},
            { name: 'Asian Biology Olympiad' }
          ]},
          { name: 'Astronomy Olympiads', children: [
            { name: 'International Astronomy Olympiad (IAO)', children: [
              { name: 'Astrophysics' }, { name: 'Celestial Mechanics' }, { name: 'Observational Astronomy' }
            ]},
            { name: 'Asian Astronomy Olympiad' }
          ]}
        ]},
        { name: 'Informatics Olympiads', children: [
          { name: 'International Olympiad in Informatics (IOI)', children: [
            { name: 'Algorithms' }, { name: 'Data Structures' }, { name: 'Dynamic Programming' },
            { name: 'Graph Theory' }, { name: 'Computational Geometry' }
          ]},
          { name: 'Central European Olympiad in Informatics (CEOI)' },
          { name: 'Baltic Olympiad in Informatics (BOI)' }
        ]},
        { name: 'Linguistics Olympiads', children: [
          { name: 'International Linguistics Olympiad (IOL)', children: [
            { name: 'Morphology' }, { name: 'Syntax' }, { name: 'Phonetics' },
            { name: 'Semantics' }, { name: 'Language Families' }
          ]},
          { name: 'North American Computational Linguistics Olympiad (NACLO)' }
        ]},
        { name: 'Philosophy Olympiads', children: [
          { name: 'International Philosophy Olympiad (IPO)', children: [
            { name: 'Ethics' }, { name: 'Metaphysics' }, { name: 'Epistemology' },
            { name: 'Logic' }, { name: 'Political Philosophy' }
          ]}
        ]},
        { name: 'Geography Olympiads', children: [
          { name: 'International Geography Olympiad (iGeo)', children: [
            { name: 'Physical Geography' }, { name: 'Human Geography' }, { name: 'Geographic Information Systems' }
          ]}
        ]},
        { name: 'Economics Olympiads', children: [
          { name: 'International Economics Olympiad (IEO)', children: [
            { name: 'Microeconomics' }, { name: 'Macroeconomics' }, { name: 'Financial Literacy' },
            { name: 'Economic Policy' }
          ]}
        ]},
        { name: 'Earth Science Olympiads', children: [
          { name: 'International Earth Science Olympiad (IESO)', children: [
            { name: 'Geology' }, { name: 'Meteorology' }, { name: 'Oceanography' },
            { name: 'Astronomy' }
          ]}
        ]},
        { name: 'Junior Science Olympiads', children: [
          { name: 'International Junior Science Olympiad (IJSO)', children: [
            { name: 'Physics' }, { name: 'Chemistry' }, { name: 'Biology' }
          ]},
          { name: 'Asian Junior Science Olympiad' }
        ]}
      ]
    }
  }
end 
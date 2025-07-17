def school_categories
  {
    'School Education' => {
      children: [
        { name: 'Primary Education (Grades 1-5)', children: [
          { name: 'Mathematics', children: [
            { name: 'Basic Arithmetic' }, { name: 'Number Sense' }, { name: 'Geometry' },
            { name: 'Measurement' }, { name: 'Data Handling' }, { name: 'Problem Solving' }
          ]},
          { name: 'English Language', children: [
            { name: 'Reading' }, { name: 'Writing' }, { name: 'Grammar' },
            { name: 'Vocabulary' }, { name: 'Comprehension' }, { name: 'Spelling' }
          ]},
          { name: 'Science', children: [
            { name: 'General Science' }, { name: 'Environmental Studies' }, { name: 'Basic Physics' },
            { name: 'Basic Chemistry' }, { name: 'Basic Biology' }
          ]},
          { name: 'Social Studies', children: [
            { name: 'History' }, { name: 'Geography' }, { name: 'Civics' },
            { name: 'Economics' }
          ]}
        ]},
        { name: 'Middle School (Grades 6-8)', children: [
          { name: 'Mathematics', children: [
            { name: 'Algebra' }, { name: 'Geometry' }, { name: 'Statistics' },
            { name: 'Number Theory' }, { name: 'Ratio & Proportion' }, { name: 'Percentages' }
          ]},
          { name: 'English', children: [
            { name: 'Literature' }, { name: 'Grammar & Composition' }, { name: 'Creative Writing' },
            { name: 'Reading Comprehension' }, { name: 'Vocabulary Building' }
          ]},
          { name: 'Science', children: [
            { name: 'Physics', children: [
              { name: 'Motion' }, { name: 'Force & Energy' }, { name: 'Light' },
              { name: 'Sound' }, { name: 'Electricity' }
            ]},
            { name: 'Chemistry', children: [
              { name: 'Matter' }, { name: 'Atoms & Molecules' }, { name: 'Chemical Reactions' },
              { name: 'Acids & Bases' }
            ]},
            { name: 'Biology', children: [
              { name: 'Cell Biology' }, { name: 'Human Body' }, { name: 'Plants' },
              { name: 'Animals' }, { name: 'Ecology' }
            ]}
          ]},
          { name: 'Social Studies', children: [
            { name: 'History', children: [
              { name: 'Ancient Civilizations' }, { name: 'Medieval Period' }, { name: 'Modern History' }
            ]},
            { name: 'Geography', children: [
              { name: 'Physical Geography' }, { name: 'Human Geography' }, { name: 'World Geography' }
            ]},
            { name: 'Civics', children: [
              { name: 'Government' }, { name: 'Democracy' }, { name: 'Rights & Duties' }
            ]}
          ]}
        ]},
        { name: 'High School (Grades 9-12)', children: [
          { name: 'Mathematics', children: [
            { name: 'Algebra I & II', children: [
              { name: 'Linear Equations' }, { name: 'Quadratic Equations' }, { name: 'Functions' },
              { name: 'Polynomials' }, { name: 'Complex Numbers' }
            ]},
            { name: 'Geometry', children: [
              { name: 'Euclidean Geometry' }, { name: 'Coordinate Geometry' }, { name: 'Trigonometry' },
              { name: 'Circles' }, { name: 'Polygons' }
            ]},
            { name: 'Calculus', children: [
              { name: 'Limits' }, { name: 'Derivatives' }, { name: 'Integration' },
              { name: 'Applications' }
            ]},
            { name: 'Statistics & Probability', children: [
              { name: 'Descriptive Statistics' }, { name: 'Probability' }, { name: 'Inferential Statistics' }
            ]}
          ]},
          { name: 'English', children: [
            { name: 'Literature', children: [
              { name: 'British Literature' }, { name: 'American Literature' }, { name: 'World Literature' },
              { name: 'Poetry' }, { name: 'Drama' }, { name: 'Novels' }
            ]},
            { name: 'Language Arts', children: [
              { name: 'Grammar' }, { name: 'Composition' }, { name: 'Research Writing' },
              { name: 'Creative Writing' }
            ]}
          ]},
          { name: 'Science', children: [
            { name: 'Physics', children: [
              { name: 'Mechanics' }, { name: 'Thermodynamics' }, { name: 'Waves' },
              { name: 'Electromagnetism' }, { name: 'Modern Physics' }
            ]},
            { name: 'Chemistry', children: [
              { name: 'Physical Chemistry' }, { name: 'Organic Chemistry' }, { name: 'Inorganic Chemistry' },
              { name: 'Analytical Chemistry' }
            ]},
            { name: 'Biology', children: [
              { name: 'Cell Biology' }, { name: 'Genetics' }, { name: 'Evolution' },
              { name: 'Ecology' }, { name: 'Human Physiology' }
            ]}
          ]},
          { name: 'Social Studies', children: [
            { name: 'History', children: [
              { name: 'World History' }, { name: 'US History' }, { name: 'European History' },
              { name: 'Asian History' }
            ]},
            { name: 'Geography', children: [
              { name: 'Physical Geography' }, { name: 'Human Geography' }, { name: 'Economic Geography' }
            ]},
            { name: 'Political Science', children: [
              { name: 'Political Theory' }, { name: 'International Relations' }, { name: 'Comparative Politics' }
            ]},
            { name: 'Economics', children: [
              { name: 'Microeconomics' }, { name: 'Macroeconomics' }, { name: 'Economic Systems' }
            ]}
          ]}
        ]},
        { name: 'International Curricula', children: [
          { name: 'IB (International Baccalaureate)', children: [
            { name: 'IB Primary Years Programme (PYP)' }, { name: 'IB Middle Years Programme (MYP)' },
            { name: 'IB Diploma Programme (DP)' }
          ]},
          { name: 'Cambridge International', children: [
            { name: 'Cambridge Primary' }, { name: 'Cambridge Lower Secondary' },
            { name: 'Cambridge IGCSE' }, { name: 'Cambridge AS & A Level' }
          ]},
          { name: 'American Curriculum', children: [
            { name: 'Common Core Standards' }, { name: 'AP (Advanced Placement)' },
            { name: 'SAT/ACT Preparation' }
          ]},
          { name: 'British Curriculum', children: [
            { name: 'Key Stage 1' }, { name: 'Key Stage 2' }, { name: 'Key Stage 3' },
            { name: 'GCSE' }, { name: 'A-Levels' }
          ]}
        ]}
      ]
    }
  }
end 
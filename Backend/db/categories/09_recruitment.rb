def recruitment_categories
  {
    'Recruitment & Hiring' => {
      children: [
        { name: 'Technical Recruitment', children: [
          { name: 'Software Development', children: [
            { name: 'Frontend Development' }, { name: 'Backend Development' }, { name: 'Full Stack Development' },
            { name: 'Mobile Development' }, { name: 'DevOps Engineering' }, { name: 'Data Engineering' }
          ]},
          { name: 'Data Science & Analytics', children: [
            { name: 'Data Scientist' }, { name: 'Machine Learning Engineer' }, { name: 'Data Analyst' },
            { name: 'Business Intelligence Analyst' }, { name: 'Quantitative Analyst' }
          ]},
          { name: 'IT Infrastructure', children: [
            { name: 'System Administrator' }, { name: 'Network Engineer' }, { name: 'Security Engineer' },
            { name: 'Cloud Architect' }, { name: 'Database Administrator' }
          ]},
          { name: 'Product & Design', children: [
            { name: 'Product Manager' }, { name: 'UX/UI Designer' }, { name: 'Product Designer' },
            { name: 'Technical Product Manager' }
          ]}
        ]},
        { name: 'Corporate Recruitment', children: [
          { name: 'Finance & Accounting', children: [
            { name: 'Financial Analyst' }, { name: 'Accountant' }, { name: 'Auditor' },
            { name: 'Investment Banker' }, { name: 'Risk Manager' }
          ]},
          { name: 'Marketing & Sales', children: [
            { name: 'Marketing Manager' }, { name: 'Sales Representative' }, { name: 'Digital Marketing Specialist' },
            { name: 'Brand Manager' }, { name: 'Market Research Analyst' }
          ]},
          { name: 'Human Resources', children: [
            { name: 'HR Generalist' }, { name: 'Recruiter' }, { name: 'HR Manager' },
            { name: 'Compensation & Benefits Specialist' }, { name: 'Learning & Development Specialist' }
          ]},
          { name: 'Operations & Supply Chain', children: [
            { name: 'Operations Manager' }, { name: 'Supply Chain Analyst' }, { name: 'Logistics Coordinator' },
            { name: 'Project Manager' }, { name: 'Business Analyst' }
          ]}
        ]},
        { name: 'Healthcare Recruitment', children: [
          { name: 'Medical Professionals', children: [
            { name: 'Physician' }, { name: 'Nurse' }, { name: 'Pharmacist' },
            { name: 'Medical Technologist' }, { name: 'Radiologist' }
          ]},
          { name: 'Healthcare Administration', children: [
            { name: 'Healthcare Administrator' }, { name: 'Medical Office Manager' },
            { name: 'Health Information Manager' }
          ]}
        ]},
        { name: 'Education Recruitment', children: [
          { name: 'Teaching Positions', children: [
            { name: 'Primary School Teacher' }, { name: 'Secondary School Teacher' },
            { name: 'University Professor' }, { name: 'Special Education Teacher' }
          ]},
          { name: 'Educational Administration', children: [
            { name: 'School Principal' }, { name: 'Dean' }, { name: 'Educational Coordinator' }
          ]}
        ]},
        { name: 'Legal Recruitment', children: [
          { name: 'Legal Professionals', children: [
            { name: 'Attorney' }, { name: 'Paralegal' }, { name: 'Legal Assistant' },
            { name: 'Corporate Counsel' }
          ]}
        ]},
        { name: 'Assessment Methods', children: [
          { name: 'Technical Assessments', children: [
            { name: 'Coding Tests' }, { name: 'System Design Interviews' }, { name: 'Algorithm Challenges' },
            { name: 'Take-home Projects' }, { name: 'Technical Presentations' }
          ]},
          { name: 'Behavioral Assessments', children: [
            { name: 'Behavioral Interviews' }, { name: 'Case Studies' }, { name: 'Group Discussions' },
            { name: 'Personality Tests' }, { name: 'Situational Judgement Tests' }
          ]},
          { name: 'Aptitude Tests', children: [
            { name: 'Numerical Reasoning' }, { name: 'Verbal Reasoning' }, { name: 'Logical Reasoning' },
            { name: 'Abstract Reasoning' }, { name: 'Mechanical Reasoning' }
          ]}
        ]},
        { name: 'Interview Preparation', children: [
          { name: 'Technical Interview Prep', children: [
            { name: 'Data Structures & Algorithms' }, { name: 'System Design' }, { name: 'Database Design' },
            { name: 'Web Technologies' }, { name: 'Mobile Development' }
          ]},
          { name: 'Behavioral Interview Prep', children: [
            { name: 'STAR Method' }, { name: 'Leadership Examples' }, { name: 'Conflict Resolution' },
            { name: 'Teamwork Scenarios' }, { name: 'Problem-solving Examples' }
          ]},
          { name: 'Resume & Portfolio', children: [
            { name: 'Resume Writing' }, { name: 'Portfolio Development' }, { name: 'LinkedIn Optimization' },
            { name: 'Cover Letter Writing' }
          ]}
        ]}
      ]
    }
  }
end 
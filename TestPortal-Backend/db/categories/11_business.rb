def business_categories
  {
    'Business & Management' => {
      children: [
        { name: 'Business Fundamentals', children: [
          { name: 'Business Strategy', children: [
            { name: 'Strategic Planning' }, { name: 'Competitive Analysis' }, { name: 'Market Analysis' },
            { name: 'Business Model Canvas' }, { name: 'SWOT Analysis' }
          ]},
          { name: 'Business Operations', children: [
            { name: 'Operations Management' }, { name: 'Supply Chain Management' }, { name: 'Quality Management' },
            { name: 'Process Improvement' }, { name: 'Lean Management' }
          ]},
          { name: 'Business Ethics', children: [
            { name: 'Corporate Social Responsibility' }, { name: 'Ethical Decision Making' },
            { name: 'Sustainability' }, { name: 'Corporate Governance' }
          ]}
        ]},
        { name: 'Finance & Accounting', children: [
          { name: 'Financial Management', children: [
            { name: 'Financial Planning' }, { name: 'Budgeting' }, { name: 'Cash Flow Management' },
            { name: 'Investment Analysis' }, { name: 'Risk Management' }
          ]},
          { name: 'Accounting', children: [
            { name: 'Financial Accounting' }, { name: 'Managerial Accounting' }, { name: 'Cost Accounting' },
            { name: 'Auditing' }, { name: 'Tax Accounting' }
          ]},
          { name: 'Corporate Finance', children: [
            { name: 'Capital Budgeting' }, { name: 'Capital Structure' }, { name: 'Dividend Policy' },
            { name: 'Mergers & Acquisitions' }, { name: 'Valuation' }
          ]}
        ]},
        { name: 'Marketing & Sales', children: [
          { name: 'Marketing Strategy', children: [
            { name: 'Market Research' }, { name: 'Consumer Behavior' }, { name: 'Brand Management' },
            { name: 'Product Management' }, { name: 'Pricing Strategy' }
          ]},
          { name: 'Digital Marketing', children: [
            { name: 'Social Media Marketing' }, { name: 'Content Marketing' }, { name: 'Email Marketing' },
            { name: 'SEO & SEM' }, { name: 'Digital Analytics' }
          ]},
          { name: 'Sales Management', children: [
            { name: 'Sales Strategy' }, { name: 'Sales Techniques' }, { name: 'Customer Relationship Management' },
            { name: 'Sales Analytics' }, { name: 'Sales Training' }
          ]}
        ]},
        { name: 'Human Resources', children: [
          { name: 'HR Management', children: [
            { name: 'Recruitment & Selection' }, { name: 'Training & Development' }, { name: 'Performance Management' },
            { name: 'Compensation & Benefits' }, { name: 'Employee Relations' }
          ]},
          { name: 'Organizational Behavior', children: [
            { name: 'Leadership' }, { name: 'Motivation' }, { name: 'Team Dynamics' },
            { name: 'Organizational Culture' }, { name: 'Change Management' }
          ]},
          { name: 'Workplace Psychology', children: [
            { name: 'Industrial Psychology' }, { name: 'Employee Engagement' }, { name: 'Work-Life Balance' },
            { name: 'Diversity & Inclusion' }
          ]}
        ]},
        { name: 'Entrepreneurship', children: [
          { name: 'Startup Management', children: [
            { name: 'Business Planning' }, { name: 'Funding & Investment' }, { name: 'Product Development' },
            { name: 'Market Entry Strategy' }, { name: 'Scaling Up' }
          ]},
          { name: 'Innovation Management', children: [
            { name: 'Innovation Strategy' }, { name: 'Design Thinking' }, { name: 'Product Innovation' },
            { name: 'Service Innovation' }, { name: 'Business Model Innovation' }
          ]},
          { name: 'Small Business Management', children: [
            { name: 'Small Business Operations' }, { name: 'Family Business Management' },
            { name: 'Franchise Management' }
          ]}
        ]},
        { name: 'International Business', children: [
          { name: 'Global Strategy', children: [
            { name: 'International Market Entry' }, { name: 'Global Supply Chain' }, { name: 'Cross-cultural Management' },
            { name: 'International Trade' }, { name: 'Global Marketing' }
          ]},
          { name: 'International Finance', children: [
            { name: 'Foreign Exchange' }, { name: 'International Banking' }, { name: 'Global Investment' },
            { name: 'International Taxation' }
          ]}
        ]},
        { name: 'Business Analytics', children: [
          { name: 'Data Analytics', children: [
            { name: 'Business Intelligence' }, { name: 'Predictive Analytics' }, { name: 'Descriptive Analytics' },
            { name: 'Prescriptive Analytics' }, { name: 'Big Data Analytics' }
          ]},
          { name: 'Business Statistics', children: [
            { name: 'Statistical Analysis' }, { name: 'Regression Analysis' }, { name: 'Time Series Analysis' },
            { name: 'Hypothesis Testing' }
          ]},
          { name: 'Business Intelligence Tools', children: [
            { name: 'Tableau' }, { name: 'Power BI' }, { name: 'SAS' },
            { name: 'R for Business' }, { name: 'Python for Business' }
          ]}
        ]},
        { name: 'Project Management', children: [
          { name: 'Project Planning', children: [
            { name: 'Project Scope Management' }, { name: 'Project Time Management' }, { name: 'Project Cost Management' },
            { name: 'Project Risk Management' }, { name: 'Project Quality Management' }
          ]},
          { name: 'Agile & Scrum', children: [
            { name: 'Agile Methodology' }, { name: 'Scrum Framework' }, { name: 'Kanban' },
            { name: 'Sprint Planning' }, { name: 'User Stories' }
          ]},
          { name: 'Project Management Tools', children: [
            { name: 'Microsoft Project' }, { name: 'Jira' }, { name: 'Asana' },
            { name: 'Trello' }, { name: 'Monday.com' }
          ]}
        ]},
        { name: 'Business Law', children: [
          { name: 'Corporate Law', children: [
            { name: 'Business Formation' }, { name: 'Corporate Governance' }, { name: 'Mergers & Acquisitions Law' },
            { name: 'Securities Law' }, { name: 'Bankruptcy Law' }
          ]},
          { name: 'Contract Law', children: [
            { name: 'Contract Formation' }, { name: 'Contract Performance' }, { name: 'Contract Breach' },
            { name: 'Commercial Contracts' }
          ]},
          { name: 'Employment Law', children: [
            { name: 'Labor Law' }, { name: 'Workplace Safety' }, { name: 'Discrimination Law' },
            { name: 'Employee Benefits Law' }
          ]}
        ]}
      ]
    }
  }
end 
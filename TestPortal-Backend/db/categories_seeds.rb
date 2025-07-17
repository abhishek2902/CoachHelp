# db/seeds/categories_seeds.rb

# frozen_string_literal: true

ALL_DOMAINS = [
  "Medical",
  "Engineering",
  "Graduate & Study Abroad",
  "Law",
  "Government & Public Services",
  "IT, Programming & Tech",
  "School",
  "Olympiad",
  "Recruitment",
  "Language",
  "Business",
  "Arts",
  "History",
  "Science",
  "Mathematics",
  "Religion & Philosophy"
  # Add more as you grow!
]

DOMAIN_CATEGORY_MAP = {
  "Medical" => [
    :medical_entrance_exams_categories
  ],
  "Engineering" => [
    :engineering_entrance_exams_categories
  ],
  "Graduate & Study Abroad" => [
    :graduate_study_abroad_tests_categories
  ],
  "Law" => [
    :law_admission_tests_categories
  ],
  "Government & Public Services" => [
    :government_public_services_categories
  ],
  "IT, Programming & Tech" => [
    :it_programming_tech_categories
  ],
  "School" => [
    :school_categories
  ],
  "Olympiad" => [
    :olympiad_categories
  ],
  "Recruitment" => [
    :recruitment_categories
  ],
  "Language" => [
    :language_categories
  ],
  "Business" => [
    :business_categories
  ],
  "Arts" => [
    :arts_categories
  ],
  "History" => [
    :history_categories
  ],
  "Science" => [
    :science_categories
  ],
  "Mathematics" => [
    :mathematics_categories
  ],
  "Religion & Philosophy" => [
    :religion_categories
  ]
  # Add more domain-category mappings as needed
}

puts '🌍 Seeding COMPLETE world categories with deep nesting...'

def create_category(name, test_domain, parent: nil, children: [])
  # Make slug unique by including the full ancestry path
  slug_name = parent ? "#{parent.slug}-#{name.parameterize(preserve_case: false, separator: '-')}" : name.parameterize(preserve_case: false, separator: '-')
  original_slug = slug_name
  counter = 2
  # Ensure uniqueness of slug for the same parent and test_domain
  while test_domain.categories.exists?(slug: slug_name, parent: parent)
    slug_name = "#{original_slug}-#{counter}"
    counter += 1
  end
  category = test_domain.categories.find_or_initialize_by(slug: slug_name, parent: parent)
  category.name = name
  category.save!
  children.each do |child_data|
    create_category(
      child_data[:name],
      test_domain,
      parent: category,
      children: child_data.fetch(:children, [])
    )
  end
end

def exam_categories
  {
    'Exams & Admissions' => {
      children: [
        { name: 'India', children: [
          { name: 'NEET-UG' }, { name: 'NEET-PG' }, { name: 'JEE Main' }, { name: 'JEE Advanced' },
          { name: 'GATE', children: [
            { name: 'Computer Science & IT' }, { name: 'Mechanical Engineering' },
            { name: 'Electronics & Communication (ECE)' }, { name: 'Electrical Engineering (EE)' },
            { name: 'Civil Engineering' }, { name: 'Chemical Engineering' }, { name: 'Biotechnology' },
            { name: 'Physics' }, { name: 'Chemistry' }, { name: 'Mathematics' }, { name: 'Life Sciences' }
          ]},
          { name: 'UPSC Civil Services' }, { name: 'SSC Exams (CGL, CHSL)' }, { name: 'Banking Exams (IBPS, SBI)' },
          { name: 'Railway Exams' }, { name: 'Teaching Exams (CTET, TET)' }, { name: 'State PSC Exams' },
          { name: 'Defense Exams', children: [
            { name: 'NDA & NA Exam' }, { name: 'CDS Exam' }, { name: 'AFCAT Exam' }, { name: 'CAPF Exam' }
          ]},
          { name: 'Design Exams', children: [
            { name: 'UCEED & CEED' }, { name: 'NID Design Aptitude Test (DAT)' }, { name: 'NATA & JEE Main (B.Arch)' }
          ]},
          { name: 'Law Exams', children: [
            { name: 'CLAT' }, { name: 'AILET' }, { name: 'LSAT India' }
          ]},
          { name: 'Medical Exams', children: [
            { name: 'AIIMS' }, { name: 'JIPMER' }, { name: 'PGIMER' }
          ]}
        ]},
        { name: 'USA', children: [
          { name: 'MCAT' }, { name: 'SAT / ACT' }, { name: 'GRE' }, { name: 'GMAT' }, { name: 'LSAT' },
          { name: 'USMLE' }, { name: 'Bar Exam' }, { name: 'CPA Exam' }, { name: 'PMP Exam' }
        ]},
        { name: 'UK', children: [
          { name: 'A-Levels' }, { name: 'UCAT / BMAT' }, { name: 'Civil Service Test' }, { name: 'GAMSAT' }
        ]},
        { name: 'Canada', children: [
          { name: 'MCAT' }, { name: 'LSAT' }, { name: 'GMAT' }, { name: 'GRE' }
        ]},
        { name: 'Australia', children: [
          { name: 'GAMSAT' }, { name: 'UCAT' }, { name: 'LSAT' }
        ]},
        { name: 'Germany', children: [
          { name: 'TestAS' }, { name: 'DSH' }, { name: 'TestDaF' }
        ]},
        { name: 'France', children: [
          { name: 'TCF' }, { name: 'DELF/DALF' }, { name: 'TEF' }
        ]},
        { name: 'Japan', children: [
          { name: 'JLPT' }, { name: 'EJU' }, { name: 'JFT-Basic' }
        ]},
        { name: 'China', children: [
          { name: 'HSK' }, { name: 'HSKK' }, { name: 'BCT' }
        ]},
        { name: 'South Korea', children: [
          { name: 'TOPIK' }, { name: 'KLAT' }
        ]},
        { name: 'Singapore', children: [
          { name: 'GCE A-Levels' }, { name: 'PSLE' }
        ]},
        { name: 'International', children: [
          { name: 'IB (International Baccalaureate)' }, { name: 'Cambridge International' }
        ]}
      ]
    }
  }
end

def language_categories
  {
    'Languages' => {
      children: [
        { name: 'English', children: [
          { name: 'TOEFL' }, { name: 'IELTS' }, { name: 'Cambridge English' }, { name: 'PTE Academic' },
          { name: 'Grammar' }, { name: 'Vocabulary' }, { name: 'Pronunciation' }, { name: 'Business English' },
          { name: 'Academic English' }, { name: 'English Literature' }, { name: 'Creative Writing' }
        ]},
        { name: 'Mandarin Chinese', children: [
          { name: 'HSK' }, { name: 'HSKK' }, { name: 'BCT' }, { name: 'YCT' }, { name: 'Chinese Characters' },
          { name: 'Chinese Grammar' }, { name: 'Chinese Literature' }
        ]},
        { name: 'Spanish', children: [
          { name: 'DELE' }, { name: 'SIELE' }, { name: 'Spanish Grammar' }, { name: 'Spanish Literature' }
        ]},
        { name: 'French', children: [
          { name: 'DELF/DALF' }, { name: 'TCF' }, { name: 'TEF' }, { name: 'French Grammar' }, { name: 'French Literature' }
        ]},
        { name: 'German', children: [
          { name: 'Goethe' }, { name: 'TestDaF' }, { name: 'DSH' }, { name: 'German Grammar' }, { name: 'German Literature' }
        ]},
        { name: 'Japanese', children: [
          { name: 'JLPT' }, { name: 'JFT-Basic' }, { name: 'Japanese Grammar' }, { name: 'Japanese Literature' }
        ]},
        { name: 'Korean', children: [
          { name: 'TOPIK' }, { name: 'KLAT' }, { name: 'Korean Grammar' }, { name: 'Korean Literature' }
        ]},
        { name: 'Hindi', children: [
          { name: 'Muhavare' }, { name: 'Vyakaran' }, { name: 'Hindi Literature' }, { name: 'Sanskrit' }
        ]},
        { name: 'Arabic', children: [
          { name: 'Arabic Grammar' }, { name: 'Arabic Literature' }, { name: 'Quranic Arabic' }
        ]},
        { name: 'Russian', children: [
          { name: 'TORFL' }, { name: 'Russian Grammar' }, { name: 'Russian Literature' }
        ]},
        { name: 'Portuguese', children: [
          { name: 'CELPE-Bras' }, { name: 'Portuguese Grammar' }, { name: 'Portuguese Literature' }
        ]},
        { name: 'Italian', children: [
          { name: 'CILS' }, { name: 'CELI' }, { name: 'Italian Grammar' }, { name: 'Italian Literature' }
        ]},
        { name: 'Dutch', children: [
          { name: 'NT2' }, { name: 'Dutch Grammar' }, { name: 'Dutch Literature' }
        ]},
        { name: 'Swedish', children: [
          { name: 'SFI' }, { name: 'Swedish Grammar' }, { name: 'Swedish Literature' }
        ]},
        { name: 'Norwegian', children: [
          { name: 'Norwegian Grammar' }, { name: 'Norwegian Literature' }
        ]},
        { name: 'Danish', children: [
          { name: 'Danish Grammar' }, { name: 'Danish Literature' }
        ]},
        { name: 'Finnish', children: [
          { name: 'Finnish Grammar' }, { name: 'Finnish Literature' }
        ]},
        { name: 'Polish', children: [
          { name: 'Polish Grammar' }, { name: 'Polish Literature' }
        ]},
        { name: 'Czech', children: [
          { name: 'Czech Grammar' }, { name: 'Czech Literature' }
        ]},
        { name: 'Hungarian', children: [
          { name: 'Hungarian Grammar' }, { name: 'Hungarian Literature' }
        ]},
        { name: 'Turkish', children: [
          { name: 'TÖMER' }, { name: 'Turkish Grammar' }, { name: 'Turkish Literature' }
        ]},
        { name: 'Greek', children: [
          { name: 'Greek Grammar' }, { name: 'Greek Literature' }, { name: 'Ancient Greek' }
        ]},
        { name: 'Latin', children: [
          { name: 'Latin Grammar' }, { name: 'Latin Literature' }
        ]},
        { name: 'Hebrew', children: [
          { name: 'Hebrew Grammar' }, { name: 'Hebrew Literature' }
        ]},
        { name: 'Persian', children: [
          { name: 'Persian Grammar' }, { name: 'Persian Literature' }
        ]},
        { name: 'Urdu', children: [
          { name: 'Urdu Grammar' }, { name: 'Urdu Literature' }
        ]},
        { name: 'Bengali', children: [
          { name: 'Bengali Grammar' }, { name: 'Bengali Literature' }
        ]},
        { name: 'Tamil', children: [
          { name: 'Tamil Grammar' }, { name: 'Tamil Literature' }
        ]},
        { name: 'Telugu', children: [
          { name: 'Telugu Grammar' }, { name: 'Telugu Literature' }
        ]},
        { name: 'Kannada', children: [
          { name: 'Kannada Grammar' }, { name: 'Kannada Literature' }
        ]},
        { name: 'Malayalam', children: [
          { name: 'Malayalam Grammar' }, { name: 'Malayalam Literature' }
        ]},
        { name: 'Marathi', children: [
          { name: 'Marathi Grammar' }, { name: 'Marathi Literature' }
        ]},
        { name: 'Gujarati', children: [
          { name: 'Gujarati Grammar' }, { name: 'Gujarati Literature' }
        ]},
        { name: 'Punjabi', children: [
          { name: 'Punjabi Grammar' }, { name: 'Punjabi Literature' }
        ]},
        { name: 'Thai', children: [
          { name: 'Thai Grammar' }, { name: 'Thai Literature' }
        ]},
        { name: 'Vietnamese', children: [
          { name: 'Vietnamese Grammar' }, { name: 'Vietnamese Literature' }
        ]},
        { name: 'Indonesian', children: [
          { name: 'Indonesian Grammar' }, { name: 'Indonesian Literature' }
        ]},
        { name: 'Malay', children: [
          { name: 'Malay Grammar' }, { name: 'Malay Literature' }
        ]},
        { name: 'Filipino', children: [
          { name: 'Filipino Grammar' }, { name: 'Filipino Literature' }
        ]},
        { name: 'Sign Languages', children: [
          { name: 'American Sign Language (ASL)' }, { name: 'British Sign Language (BSL)' },
          { name: 'International Sign Language' }
        ]}
      ]
    }
  }
end

def religion_categories
  {
    'Religion & Mythology' => {
      children: [
        { name: 'Christianity', children: [
          { name: 'Catholicism' }, { name: 'Protestantism' }, { name: 'Orthodox Christianity' },
          { name: 'Bible Studies' }, { name: 'Church History' }, { name: 'Theology' }
        ]},
        { name: 'Islam', children: [
          { name: 'Sunni Islam' }, { name: 'Shia Islam' }, { name: 'Sufism' },
          { name: 'Quran Studies' }, { name: 'Hadith Studies' }, { name: 'Islamic Law (Sharia)' }
        ]},
        { name: 'Hinduism', children: [
          { name: 'Vedas' }, { name: 'Upanishads' }, { name: 'Bhagavad Gita' },
          { name: 'Yoga Philosophy' }, { name: 'Tantra' }, { name: 'Hindu Mythology' }
        ]},
        { name: 'Buddhism', children: [
          { name: 'Theravada Buddhism' }, { name: 'Mahayana Buddhism' }, { name: 'Vajrayana Buddhism' },
          { name: 'Zen Buddhism' }, { name: 'Buddhist Philosophy' }, { name: 'Meditation' }
        ]},
        { name: 'Judaism', children: [
          { name: 'Orthodox Judaism' }, { name: 'Conservative Judaism' }, { name: 'Reform Judaism' },
          { name: 'Torah Studies' }, { name: 'Talmud Studies' }, { name: 'Kabbalah' }
        ]},
        { name: 'Sikhism', children: [
          { name: 'Guru Granth Sahib' }, { name: 'Sikh History' }, { name: 'Sikh Philosophy' }
        ]},
        { name: 'Jainism', children: [
          { name: 'Jain Philosophy' }, { name: 'Jain Scriptures' }, { name: 'Jain History' }
        ]},
        { name: 'Baháʼí Faith', children: [
          { name: 'Baháʼí Writings' }, { name: 'Baháʼí History' }, { name: 'Baháʼí Administration' }
        ]},
        { name: 'Shinto', children: [
          { name: 'Shinto Rituals' }, { name: 'Shinto Mythology' }, { name: 'Shinto History' }
        ]},
        { name: 'Taoism', children: [
          { name: 'Tao Te Ching' }, { name: 'Taoist Philosophy' }, { name: 'Taoist Practices' }
        ]},
        { name: 'Confucianism', children: [
          { name: 'Analects' }, { name: 'Confucian Philosophy' }, { name: 'Confucian Ethics' }
        ]},
        { name: 'Zoroastrianism', children: [
          { name: 'Avesta' }, { name: 'Zoroastrian Philosophy' }, { name: 'Zoroastrian History' }
        ]},
        { name: 'Mythology', children: [
          { name: 'Greek Mythology' }, { name: 'Roman Mythology' }, { name: 'Norse Mythology' },
          { name: 'Egyptian Mythology' }, { name: 'Celtic Mythology' }, { name: 'Hindu Mythology' },
          { name: 'Chinese Mythology' }, { name: 'Japanese Mythology' }, { name: 'Korean Mythology' },
          { name: 'Maya Mythology' }, { name: 'Aztec Mythology' }, { name: 'Inca Mythology' },
          { name: 'African Mythology' }, { name: 'Native American Mythology' }, { name: 'Australian Aboriginal Mythology' }
        ]},
        { name: 'Ancient Religions', children: [
          { name: 'Sumerian Religion' }, { name: 'Babylonian Religion' }, { name: 'Assyrian Religion' },
          { name: 'Phoenician Religion' }, { name: 'Canaanite Religion' }
        ]},
        { name: 'New Religious Movements', children: [
          { name: 'Mormonism' }, { name: 'Jehovah\'s Witnesses' }, { name: 'Seventh-day Adventists' },
          { name: 'Unification Church' }, { name: 'Scientology' }
        ]},
        { name: 'Atheism & Agnosticism', children: [
          { name: 'Secular Humanism' }, { name: 'Rationalism' }, { name: 'Skepticism' }
        ]}
      ]
    }
  }
end

def science_categories
  {
    'Science & Mathematics' => {
      children: [
        { name: 'Physics', children: [
          { name: 'Classical Mechanics' }, { name: 'Quantum Mechanics' }, { name: 'Thermodynamics' },
          { name: 'Electromagnetism' }, { name: 'Optics' }, { name: 'Acoustics' },
          { name: 'Nuclear Physics' }, { name: 'Particle Physics' }, { name: 'Astrophysics' },
          { name: 'Plasma Physics' }, { name: 'Condensed Matter Physics' }, { name: 'Biophysics' }
        ]},
        { name: 'Chemistry', children: [
          { name: 'Organic Chemistry' }, { name: 'Inorganic Chemistry' }, { name: 'Physical Chemistry' },
          { name: 'Analytical Chemistry' }, { name: 'Biochemistry' }, { name: 'Polymer Chemistry' },
          { name: 'Nuclear Chemistry' }, { name: 'Environmental Chemistry' }, { name: 'Computational Chemistry' },
          { name: 'Medicinal Chemistry' }, { name: 'Materials Chemistry' }, { name: 'Electrochemistry' }
        ]},
        { name: 'Biology', children: [
          { name: 'Botany' }, { name: 'Zoology' }, { name: 'Microbiology' }, { name: 'Genetics' },
          { name: 'Ecology' }, { name: 'Evolutionary Biology' }, { name: 'Cell Biology' },
          { name: 'Molecular Biology' }, { name: 'Immunology' }, { name: 'Neuroscience' },
          { name: 'Physiology' }, { name: 'Anatomy' }, { name: 'Biotechnology' },
          { name: 'Bioinformatics' }, { name: 'Systems Biology' }, { name: 'Synthetic Biology' }
        ]},
        { name: 'Mathematics', children: [
          { name: 'Algebra' }, { name: 'Geometry' }, { name: 'Calculus' }, { name: 'Statistics' },
          { name: 'Trigonometry' }, { name: 'Number Theory' }, { name: 'Linear Algebra' },
          { name: 'Abstract Algebra' }, { name: 'Topology' }, { name: 'Analysis' },
          { name: 'Differential Equations' }, { name: 'Probability Theory' }, { name: 'Combinatorics' },
          { name: 'Graph Theory' }, { name: 'Set Theory' }, { name: 'Logic' },
          { name: 'Mathematical Modeling' }, { name: 'Numerical Analysis' }, { name: 'Optimization' }
        ]},
        { name: 'Earth Science', children: [
          { name: 'Geology' }, { name: 'Meteorology' }, { name: 'Oceanography' }, { name: 'Astronomy' },
          { name: 'Paleontology' }, { name: 'Mineralogy' }, { name: 'Petrology' },
          { name: 'Stratigraphy' }, { name: 'Geophysics' }, { name: 'Geochemistry' },
          { name: 'Hydrology' }, { name: 'Atmospheric Science' }, { name: 'Climatology' },
          { name: 'Planetary Science' }, { name: 'Space Science' }
        ]},
        { name: 'Computer Science', children: [
          { name: 'Algorithms' }, { name: 'Data Structures' }, { name: 'Programming Languages' },
          { name: 'Software Engineering' }, { name: 'Database Systems' }, { name: 'Computer Networks' },
          { name: 'Operating Systems' }, { name: 'Computer Architecture' }, { name: 'Artificial Intelligence' },
          { name: 'Machine Learning' }, { name: 'Computer Graphics' }, { name: 'Human-Computer Interaction' },
          { name: 'Cybersecurity' }, { name: 'Distributed Systems' }, { name: 'Parallel Computing' },
          { name: 'Theory of Computation' }, { name: 'Information Theory' }, { name: 'Computational Biology' }
        ]},
        { name: 'Engineering', children: [
          { name: 'Mechanical Engineering' }, { name: 'Electrical Engineering' }, { name: 'Civil Engineering' },
          { name: 'Chemical Engineering' }, { name: 'Computer Engineering' }, { name: 'Aerospace Engineering' },
          { name: 'Biomedical Engineering' }, { name: 'Environmental Engineering' }, { name: 'Industrial Engineering' },
          { name: 'Materials Engineering' }, { name: 'Nuclear Engineering' }, { name: 'Petroleum Engineering' },
          { name: 'Agricultural Engineering' }, { name: 'Mining Engineering' }, { name: 'Marine Engineering' }
        ]},
        { name: 'Medicine & Health Sciences', children: [
          { name: 'Anatomy' }, { name: 'Physiology' }, { name: 'Pathology' }, { name: 'Pharmacology' },
          { name: 'Immunology' }, { name: 'Microbiology' }, { name: 'Epidemiology' },
          { name: 'Public Health' }, { name: 'Nutrition' }, { name: 'Dentistry' },
          { name: 'Nursing' }, { name: 'Pharmacy' }, { name: 'Veterinary Medicine' },
          { name: 'Medical Imaging' }, { name: 'Clinical Research' }, { name: 'Medical Ethics' }
        ]},
        { name: 'Psychology', children: [
          { name: 'Clinical Psychology' }, { name: 'Cognitive Psychology' }, { name: 'Developmental Psychology' },
          { name: 'Social Psychology' }, { name: 'Behavioral Psychology' }, { name: 'Neuropsychology' },
          { name: 'Industrial-Organizational Psychology' }, { name: 'Educational Psychology' },
          { name: 'Forensic Psychology' }, { name: 'Health Psychology' }, { name: 'Sports Psychology' }
        ]},
        { name: 'Environmental Science', children: [
          { name: 'Ecology' }, { name: 'Conservation Biology' }, { name: 'Environmental Chemistry' },
          { name: 'Climate Science' }, { name: 'Sustainability' }, { name: 'Renewable Energy' },
          { name: 'Waste Management' }, { name: 'Air Quality' }, { name: 'Water Resources' }
        ]}
      ]
    }
  }
end

# Add more category methods here as needed
# def technology_categories
# def business_categories
# def arts_categories
# etc.

# Require all category files
require_relative 'categories/01_medical_entrance_exams'
require_relative 'categories/02_engineering_entrance_exams'
require_relative 'categories/03_graduate_study_abroad_tests'
require_relative 'categories/05_law_admission_tests'
require_relative 'categories/06_government_public_services'
require_relative 'categories/04_it_programming_tech'
require_relative 'categories/07_school'
require_relative 'categories/08_olympiad'
require_relative 'categories/09_recruitment'
require_relative 'categories/10_language'
require_relative 'categories/11_business'
require_relative 'categories/12_arts'
require_relative 'categories/13_history'
require_relative 'categories/14_mathematics'

# Main execution
DOMAIN_CATEGORY_MAP.each do |domain_name, category_methods|
  test_domain = TestDomain.find_or_create_by!(name: domain_name)
  category_methods.each do |method_name|
    send(method_name).each do |main_name, data|
      create_category(main_name, test_domain, children: data[:children])
    end
  end
end

puts '✅ All categories seeded successfully!'
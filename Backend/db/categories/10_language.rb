def language_categories
  {
    'Language Learning' => {
      children: [
        { name: 'Modern Languages', children: [
          { name: 'English', children: [
            { name: 'General English' }, { name: 'Business English' }, { name: 'Academic English' },
            { name: 'English for Specific Purposes' }, { name: 'English Literature' }, { name: 'Creative Writing' }
          ]},
          { name: 'Spanish', children: [
            { name: 'Spanish for Beginners' }, { name: 'Intermediate Spanish' }, { name: 'Advanced Spanish' },
            { name: 'Spanish Literature' }, { name: 'Spanish for Business' }
          ]},
          { name: 'French', children: [
            { name: 'French for Beginners' }, { name: 'Intermediate French' }, { name: 'Advanced French' },
            { name: 'French Literature' }, { name: 'French for Business' }
          ]},
          { name: 'German', children: [
            { name: 'German for Beginners' }, { name: 'Intermediate German' }, { name: 'Advanced German' },
            { name: 'German Literature' }, { name: 'German for Business' }
          ]},
          { name: 'Chinese (Mandarin)', children: [
            { name: 'Mandarin for Beginners' }, { name: 'Intermediate Mandarin' }, { name: 'Advanced Mandarin' },
            { name: 'Chinese Characters' }, { name: 'Chinese Literature' }
          ]},
          { name: 'Japanese', children: [
            { name: 'Japanese for Beginners' }, { name: 'Intermediate Japanese' }, { name: 'Advanced Japanese' },
            { name: 'Kanji' }, { name: 'Japanese Literature' }
          ]},
          { name: 'Korean', children: [
            { name: 'Korean for Beginners' }, { name: 'Intermediate Korean' }, { name: 'Advanced Korean' },
            { name: 'Hangul' }, { name: 'Korean Literature' }
          ]},
          { name: 'Arabic', children: [
            { name: 'Arabic for Beginners' }, { name: 'Intermediate Arabic' }, { name: 'Advanced Arabic' },
            { name: 'Arabic Script' }, { name: 'Arabic Literature' }
          ]},
          { name: 'Russian', children: [
            { name: 'Russian for Beginners' }, { name: 'Intermediate Russian' }, { name: 'Advanced Russian' },
            { name: 'Cyrillic Script' }, { name: 'Russian Literature' }
          ]},
          { name: 'Portuguese', children: [
            { name: 'Portuguese for Beginners' }, { name: 'Intermediate Portuguese' }, { name: 'Advanced Portuguese' },
            { name: 'Portuguese Literature' }
          ]},
          { name: 'Italian', children: [
            { name: 'Italian for Beginners' }, { name: 'Intermediate Italian' }, { name: 'Advanced Italian' },
            { name: 'Italian Literature' }
          ]}
        ]},
        { name: 'Classical Languages', children: [
          { name: 'Latin', children: [
            { name: 'Latin Grammar' }, { name: 'Latin Literature' }, { name: 'Classical Latin' },
            { name: 'Ecclesiastical Latin' }
          ]},
          { name: 'Ancient Greek', children: [
            { name: 'Greek Grammar' }, { name: 'Greek Literature' }, { name: 'Classical Greek' },
            { name: 'Biblical Greek' }
          ]},
          { name: 'Sanskrit', children: [
            { name: 'Sanskrit Grammar' }, { name: 'Sanskrit Literature' }, { name: 'Vedic Sanskrit' },
            { name: 'Classical Sanskrit' }
          ]},
          { name: 'Hebrew', children: [
            { name: 'Biblical Hebrew' }, { name: 'Modern Hebrew' }, { name: 'Hebrew Grammar' },
            { name: 'Hebrew Literature' }
          ]}
        ]},
        { name: 'Language Skills', children: [
          { name: 'Speaking & Pronunciation', children: [
            { name: 'Phonetics' }, { name: 'Accent Reduction' }, { name: 'Public Speaking' },
            { name: 'Conversation Skills' }, { name: 'Pronunciation Practice' }
          ]},
          { name: 'Listening & Comprehension', children: [
            { name: 'Listening Skills' }, { name: 'Audio Comprehension' }, { name: 'Note-taking' },
            { name: 'Understanding Accents' }
          ]},
          { name: 'Reading & Writing', children: [
            { name: 'Reading Comprehension' }, { name: 'Writing Skills' }, { name: 'Grammar' },
            { name: 'Vocabulary Building' }, { name: 'Essay Writing' }
          ]},
          { name: 'Translation & Interpretation', children: [
            { name: 'Translation Skills' }, { name: 'Simultaneous Interpretation' }, { name: 'Consecutive Interpretation' },
            { name: 'Technical Translation' }
          ]}
        ]},
        { name: 'Language Proficiency Tests', children: [
          { name: 'English Proficiency', children: [
            { name: 'TOEFL' }, { name: 'IELTS' }, { name: 'Cambridge English' },
            { name: 'PTE Academic' }, { name: 'Duolingo English Test' }
          ]},
          { name: 'Other Language Tests', children: [
            { name: 'DELE (Spanish)' }, { name: 'DELF/DALF (French)' }, { name: 'Goethe (German)' },
            { name: 'JLPT (Japanese)' }, { name: 'HSK (Chinese)' }, { name: 'TOPIK (Korean)' }
          ]}
        ]},
        { name: 'Language Teaching', children: [
          { name: 'Teaching Methods', children: [
            { name: 'Communicative Language Teaching' }, { name: 'Task-Based Learning' },
            { name: 'Content-Based Instruction' }, { name: 'Grammar-Translation Method' }
          ]},
          { name: 'Language Assessment', children: [
            { name: 'Assessment Design' }, { name: 'Rubric Development' }, { name: 'Error Analysis' }
          ]},
          { name: 'Technology in Language Learning', children: [
            { name: 'Language Learning Apps' }, { name: 'Online Language Platforms' },
            { name: 'Virtual Reality in Language Learning' }, { name: 'AI in Language Teaching' }
          ]}
        ]}
      ]
    }
  }
end 
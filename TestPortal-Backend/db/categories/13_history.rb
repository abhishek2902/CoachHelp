def history_categories
  {
    'History' => {
      children: [
        { name: 'Ancient History', children: [
          { name: 'Ancient Civilizations', children: [
            { name: 'Mesopotamia' }, { name: 'Ancient Egypt' }, { name: 'Ancient Greece' },
            { name: 'Ancient Rome' }, { name: 'Ancient China' }, { name: 'Ancient India' },
            { name: 'Persian Empire' }, { name: 'Phoenicia' }, { name: 'Carthage' }
          ]},
          { name: 'Classical Period', children: [
            { name: 'Greek Classical Period' }, { name: 'Roman Republic' }, { name: 'Roman Empire' },
            { name: 'Hellenistic Period' }, { name: 'Parthian Empire' }
          ]},
          { name: 'Ancient Americas', children: [
            { name: 'Maya Civilization' }, { name: 'Aztec Empire' }, { name: 'Inca Empire' },
            { name: 'Olmec Civilization' }, { name: 'Moche Civilization' }
          ]}
        ]},
        { name: 'Medieval History', children: [
          { name: 'Early Middle Ages', children: [
            { name: 'Byzantine Empire' }, { name: 'Islamic Golden Age' }, { name: 'Carolingian Empire' },
            { name: 'Viking Age' }, { name: 'Anglo-Saxon England' }
          ]},
          { name: 'High Middle Ages', children: [
            { name: 'Crusades' }, { name: 'Medieval Europe' }, { name: 'Mongol Empire' },
            { name: 'Medieval Japan' }, { name: 'Medieval India' }
          ]},
          { name: 'Late Middle Ages', children: [
            { name: 'Hundred Years\' War' }, { name: 'Black Death' }, { name: 'Renaissance' },
            { name: 'Ottoman Empire' }, { name: 'Ming Dynasty' }
          ]}
        ]},
        { name: 'Early Modern History', children: [
          { name: 'Age of Discovery', children: [
            { name: 'Portuguese Exploration' }, { name: 'Spanish Exploration' }, { name: 'Columbian Exchange' },
            { name: 'European Colonization' }
          ]},
          { name: 'Reformation', children: [
            { name: 'Protestant Reformation' }, { name: 'Counter-Reformation' }, { name: 'Religious Wars' }
          ]},
          { name: 'Enlightenment', children: [
            { name: 'Scientific Revolution' }, { name: 'Age of Reason' }, { name: 'Enlightenment Thinkers' }
          ]}
        ]},
        { name: 'Modern History', children: [
          { name: 'Industrial Revolution', children: [
            { name: 'First Industrial Revolution' }, { name: 'Second Industrial Revolution' },
            { name: 'Industrialization' }, { name: 'Urbanization' }
          ]},
          { name: 'Age of Revolutions', children: [
            { name: 'American Revolution' }, { name: 'French Revolution' }, { name: 'Haitian Revolution' },
            { name: 'Latin American Revolutions' }
          ]},
          { name: '19th Century', children: [
            { name: 'Napoleonic Wars' }, { name: 'Unification of Germany' }, { name: 'Unification of Italy' },
            { name: 'American Civil War' }, { name: 'Meiji Restoration' }
          ]}
        ]},
        { name: 'Contemporary History', children: [
          { name: 'World War I', children: [
            { name: 'Causes of WWI' }, { name: 'Major Battles' }, { name: 'Treaty of Versailles' },
            { name: 'Russian Revolution' }
          ]},
          { name: 'Interwar Period', children: [
            { name: 'Great Depression' }, { name: 'Rise of Fascism' }, { name: 'Spanish Civil War' }
          ]},
          { name: 'World War II', children: [
            { name: 'Causes of WWII' }, { name: 'European Theater' }, { name: 'Pacific Theater' },
            { name: 'Holocaust' }, { name: 'Atomic Bomb' }
          ]},
          { name: 'Cold War', children: [
            { name: 'Origins of Cold War' }, { name: 'Korean War' }, { name: 'Vietnam War' },
            { name: 'Space Race' }, { name: 'Cuban Missile Crisis' }, { name: 'Fall of Berlin Wall' }
          ]},
          { name: 'Post-Cold War', children: [
            { name: 'Globalization' }, { name: 'War on Terror' }, { name: 'Arab Spring' },
            { name: 'Digital Revolution' }
          ]}
        ]},
        { name: 'Regional History', children: [
          { name: 'European History', children: [
            { name: 'British History' }, { name: 'French History' }, { name: 'German History' },
            { name: 'Italian History' }, { name: 'Spanish History' }, { name: 'Russian History' }
          ]},
          { name: 'Asian History', children: [
            { name: 'Chinese History' }, { name: 'Japanese History' }, { name: 'Korean History' },
            { name: 'Indian History' }, { name: 'Southeast Asian History' }
          ]},
          { name: 'African History', children: [
            { name: 'Ancient Africa' }, { name: 'Medieval Africa' }, { name: 'Colonial Africa' },
            { name: 'Post-Colonial Africa' }
          ]},
          { name: 'American History', children: [
            { name: 'Pre-Columbian America' }, { name: 'Colonial America' }, { name: 'United States History' },
            { name: 'Canadian History' }, { name: 'Latin American History' }
          ]},
          { name: 'Middle Eastern History', children: [
            { name: 'Ancient Middle East' }, { name: 'Islamic History' }, { name: 'Ottoman History' },
            { name: 'Modern Middle East' }
          ]}
        ]},
        { name: 'Military History', children: [
          { name: 'Ancient Warfare', children: [
            { name: 'Greek Warfare' }, { name: 'Roman Warfare' }, { name: 'Mongol Warfare' }
          ]},
          { name: 'Medieval Warfare', children: [
            { name: 'Knights and Chivalry' }, { name: 'Castles and Sieges' }, { name: 'Crusades' }
          ]},
          { name: 'Modern Warfare', children: [
            { name: 'Napoleonic Warfare' }, { name: 'World War I' }, { name: 'World War II' },
            { name: 'Cold War Conflicts' }
          ]}
        ]},
        { name: 'Social History', children: [
          { name: 'Women\'s History', children: [
            { name: 'Women\'s Rights Movement' }, { name: 'Women in Ancient Societies' },
            { name: 'Women in Medieval Times' }, { name: 'Modern Women\'s History' }
          ]},
          { name: 'Labor History', children: [
            { name: 'Industrial Revolution' }, { name: 'Labor Movements' }, { name: 'Trade Unions' }
          ]},
          { name: 'Cultural History', children: [
            { name: 'Art History' }, { name: 'Literature History' }, { name: 'Music History' },
            { name: 'Fashion History' }
          ]}
        ]},
        { name: 'Economic History', children: [
          { name: 'Trade History', children: [
            { name: 'Silk Road' }, { name: 'Age of Exploration' }, { name: 'Industrial Revolution' },
            { name: 'Globalization' }
          ]},
          { name: 'Financial History', children: [
            { name: 'Banking History' }, { name: 'Stock Markets' }, { name: 'Economic Crises' }
          ]}
        ]}
      ]
    }
  }
end 
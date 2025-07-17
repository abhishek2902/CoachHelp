def arts_categories
  {
    'Arts & Creative' => {
      children: [
        { name: 'Visual Arts', children: [
          { name: 'Drawing', children: [
            { name: 'Pencil Drawing' }, { name: 'Charcoal Drawing' }, { name: 'Ink Drawing' },
            { name: 'Figure Drawing' }, { name: 'Landscape Drawing' }, { name: 'Still Life Drawing' }
          ]},
          { name: 'Painting', children: [
            { name: 'Oil Painting' }, { name: 'Watercolor Painting' }, { name: 'Acrylic Painting' },
            { name: 'Gouache Painting' }, { name: 'Pastel Painting' }, { name: 'Digital Painting' }
          ]},
          { name: 'Sculpture', children: [
            { name: 'Clay Sculpture' }, { name: 'Stone Sculpture' }, { name: 'Metal Sculpture' },
            { name: 'Wood Sculpture' }, { name: 'Mixed Media Sculpture' }
          ]},
          { name: 'Photography', children: [
            { name: 'Digital Photography' }, { name: 'Film Photography' }, { name: 'Portrait Photography' },
            { name: 'Landscape Photography' }, { name: 'Street Photography' }, { name: 'Macro Photography' },
            { name: 'Architectural Photography' }, { name: 'Event Photography' }
          ]},
          { name: 'Printmaking', children: [
            { name: 'Etching' }, { name: 'Lithography' }, { name: 'Screen Printing' },
            { name: 'Woodcut' }, { name: 'Linocut' }
          ]}
        ]},
        { name: 'Digital Arts', children: [
          { name: 'Digital Design', children: [
            { name: 'Graphic Design' }, { name: 'UI/UX Design' }, { name: 'Web Design' },
            { name: 'Logo Design' }, { name: 'Typography' }, { name: 'Brand Identity Design' }
          ]},
          { name: '3D Modeling & Animation', children: [
            { name: '3D Modeling' }, { name: 'Character Animation' }, { name: 'Motion Graphics' },
            { name: 'Visual Effects (VFX)' }, { name: 'Game Art' }, { name: 'Architectural Visualization' }
          ]},
          { name: 'Digital Illustration', children: [
            { name: 'Vector Illustration' }, { name: 'Digital Painting' }, { name: 'Concept Art' },
            { name: 'Character Design' }, { name: 'Storyboarding' }
          ]}
        ]},
        { name: 'Performing Arts', children: [
          { name: 'Theater', children: [
            { name: 'Acting' }, { name: 'Directing' }, { name: 'Playwriting' },
            { name: 'Stage Design' }, { name: 'Costume Design' }, { name: 'Lighting Design' },
            { name: 'Sound Design' }
          ]},
          { name: 'Dance', children: [
            { name: 'Ballet' }, { name: 'Contemporary Dance' }, { name: 'Jazz Dance' },
            { name: 'Hip Hop Dance' }, { name: 'Tap Dance' }, { name: 'Folk Dance' },
            { name: 'Ballroom Dance' }
          ]},
          { name: 'Music', children: [
            { name: 'Instrumental Music', children: [
              { name: 'Piano' }, { name: 'Guitar' }, { name: 'Violin' }, { name: 'Drums' },
              { name: 'Flute' }, { name: 'Saxophone' }, { name: 'Trumpet' }, { name: 'Cello' }
            ]},
            { name: 'Vocal Music', children: [
              { name: 'Classical Singing' }, { name: 'Jazz Singing' }, { name: 'Pop Singing' },
              { name: 'Opera' }, { name: 'Choral Music' }
            ]},
            { name: 'Music Theory', children: [
              { name: 'Harmony' }, { name: 'Counterpoint' }, { name: 'Composition' },
              { name: 'Arrangement' }, { name: 'Music History' }
            ]},
            { name: 'Music Production', children: [
              { name: 'Recording' }, { name: 'Mixing' }, { name: 'Mastering' },
              { name: 'Digital Audio Workstations (DAW)' }, { name: 'Sound Design' }
            ]}
          ]}
        ]},
        { name: 'Literary Arts', children: [
          { name: 'Creative Writing', children: [
            { name: 'Fiction Writing' }, { name: 'Poetry' }, { name: 'Creative Nonfiction' },
            { name: 'Screenwriting' }, { name: 'Playwriting' }, { name: 'Short Story Writing' }
          ]},
          { name: 'Professional Writing', children: [
            { name: 'Technical Writing' }, { name: 'Business Writing' }, { name: 'Academic Writing' },
            { name: 'Journalism' }, { name: 'Copywriting' }, { name: 'Content Writing' }
          ]},
          { name: 'Literature', children: [
            { name: 'Classical Literature' }, { name: 'Modern Literature' }, { name: 'World Literature' },
            { name: 'Poetry Analysis' }, { name: 'Literary Criticism' }
          ]}
        ]},
        { name: 'Crafts & Applied Arts', children: [
          { name: 'Textile Arts', children: [
            { name: 'Weaving' }, { name: 'Knitting' }, { name: 'Crochet' },
            { name: 'Embroidery' }, { name: 'Quilting' }, { name: 'Fashion Design' }
          ]},
          { name: 'Ceramics & Pottery', children: [
            { name: 'Wheel Throwing' }, { name: 'Hand Building' }, { name: 'Glazing' },
            { name: 'Kiln Firing' }, { name: 'Ceramic Sculpture' }
          ]},
          { name: 'Jewelry Making', children: [
            { name: 'Metalworking' }, { name: 'Beading' }, { name: 'Wire Wrapping' },
            { name: 'Stone Setting' }, { name: 'Enameling' }
          ]},
          { name: 'Woodworking', children: [
            { name: 'Furniture Making' }, { name: 'Carpentry' }, { name: 'Wood Carving' },
            { name: 'Woodturning' }, { name: 'Marquetry' }
          ]}
        ]},
        { name: 'Art History & Theory', children: [
          { name: 'Art History', children: [
            { name: 'Ancient Art' }, { name: 'Medieval Art' }, { name: 'Renaissance Art' },
            { name: 'Modern Art' }, { name: 'Contemporary Art' }, { name: 'Non-Western Art' }
          ]},
          { name: 'Art Theory', children: [
            { name: 'Aesthetics' }, { name: 'Art Criticism' }, { name: 'Color Theory' },
            { name: 'Composition' }, { name: 'Art Philosophy' }
          ]},
          { name: 'Museum Studies', children: [
            { name: 'Curatorial Studies' }, { name: 'Art Conservation' }, { name: 'Exhibition Design' },
            { name: 'Museum Education' }
          ]}
        ]},
        { name: 'Film & Media Arts', children: [
          { name: 'Film Production', children: [
            { name: 'Cinematography' }, { name: 'Film Editing' }, { name: 'Sound Design' },
            { name: 'Film Directing' }, { name: 'Screenwriting' }, { name: 'Film History' }
          ]},
          { name: 'Video Production', children: [
            { name: 'Video Editing' }, { name: 'Documentary Filmmaking' }, { name: 'Commercial Production' },
            { name: 'Music Video Production' }
          ]},
          { name: 'New Media', children: [
            { name: 'Interactive Art' }, { name: 'Video Art' }, { name: 'Installation Art' },
            { name: 'Performance Art' }, { name: 'Digital Art' }
          ]}
        ]}
      ]
    }
  }
end 
import React, { useState } from 'react';
import { 
  Lightbulb, 
  X, 
  MessageSquare, 
  FileText, 
  Code, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Target,
  Clock,
  Users,
  Star
} from 'lucide-react';

const ConversationalHint = ({ onClose, onUseExample }) => {
  const [expandedSections, setExpandedSections] = useState(new Set(['basic', 'structure']));

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const samplePrompts = [
    {
      category: "Basic Test Creation",
      examples: [
        "Create a 10-question math test for 8th grade students",
        "Generate a 15-question science quiz about photosynthesis",
        "Make a 20-question English grammar test for high school"
      ]
    },
    {
      category: "Structured Tests",
      examples: [
        "Create a test with 3 sections: Reading (10 questions), Writing (5 questions), and Grammar (5 questions)",
        "Generate a test with multiple choice questions and essay questions",
        "Make a test with different difficulty levels: Easy (5), Medium (10), Hard (5)"
      ]
    },
    {
      category: "Specific Topics",
      examples: [
        "Create a test about JavaScript programming with 15 questions",
        "Generate a history quiz about World War II",
        "Make a biology test focusing on cell structure and function"
      ]
    },
    {
      category: "Advanced Features",
      examples: [
        "Create a test with time limits: 30 minutes total, 2 minutes per question",
        "Generate a test with scoring: 2 points for correct, -1 for incorrect",
        "Make a test with prerequisites: students must complete a pre-test first"
      ]
    }
  ];

  const testStructure = {
    title: "Sample Test Structure",
    description: "A typical test includes these components:",
    sections: [
      {
        name: "Test Information",
        items: ["Title", "Description", "Duration", "Total Questions", "Passing Score"]
      },
      {
        name: "Sections",
        items: ["Section Name", "Question Count", "Time Limit", "Instructions"]
      },
      {
        name: "Questions",
        items: ["Question Text", "Question Type", "Options (for MCQ)", "Correct Answer", "Points"]
      },
      {
        name: "Settings",
        items: ["Randomize Questions", "Show Results", "Allow Review", "Time Tracking"]
      }
    ]
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-yellow-600" size={20} />
          <h3 className="font-semibold text-gray-900">💡 How to Create Tests with AI</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Quick Start */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="text-blue-600" size={16} />
            <h4 className="font-medium text-gray-900">Quick Start</h4>
          </div>
          <p className="text-gray-700 text-sm mb-3">
            Simply describe the test you want to create. The AI will understand your requirements and generate a complete test structure.
          </p>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <p className="text-gray-600 mb-2">Try saying:</p>
            <p className="font-medium text-gray-900">"Create a 15-question math test for 10th grade students covering algebra and geometry"</p>
          </div>
        </div>

        {/* Sample Prompts */}
        <div className="bg-white rounded-lg border border-blue-100">
          <button
            onClick={() => toggleSection('prompts')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="text-blue-600" size={16} />
              <h4 className="font-medium text-gray-900">Sample Prompts</h4>
            </div>
            {expandedSections.has('prompts') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.has('prompts') && (
            <div className="px-4 pb-4 space-y-3">
              {samplePrompts.map((category, idx) => (
                <div key={idx} className="border-l-2 border-blue-200 pl-3">
                  <h5 className="font-medium text-gray-800 mb-2">{category.category}</h5>
                  <div className="space-y-2">
                    {category.examples.map((example, exampleIdx) => (
                      <div key={exampleIdx} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-50 rounded p-2 text-sm text-gray-700">
                          "{example}"
                        </div>
                        <button
                          onClick={() => onUseExample(example)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => copyToClipboard(example)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Structure */}
        <div className="bg-white rounded-lg border border-blue-100">
          <button
            onClick={() => toggleSection('structure')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <Code className="text-blue-600" size={16} />
              <h4 className="font-medium text-gray-900">Test Structure</h4>
            </div>
            {expandedSections.has('structure') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.has('structure') && (
            <div className="px-4 pb-4">
              <p className="text-gray-700 text-sm mb-3">{testStructure.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testStructure.sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-50 rounded p-3">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
                      <Target size={14} />
                      {section.name}
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-lg border border-blue-100">
          <button
            onClick={() => toggleSection('tips')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <Star className="text-blue-600" size={16} />
              <h4 className="font-medium text-gray-900">Pro Tips</h4>
            </div>
            {expandedSections.has('tips') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expandedSections.has('tips') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">Be Specific</p>
                  <p className="text-gray-600 text-sm">Include details like grade level, subject, number of questions, and time limits.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users size={14} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">Consider Your Audience</p>
                  <p className="text-gray-600 text-sm">Mention the target audience (students, professionals, etc.) for better customization.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={14} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">Upload Documents</p>
                  <p className="text-gray-600 text-sm">Upload PDFs, Word docs, or text files to auto-generate questions from your content.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationalHint; 
import React, { useState } from 'react';
import { Copy, Download, Eye, EyeOff, CheckCircle, AlertCircle, Info } from 'lucide-react';

const JsonStructureViewer = ({ testData, conversationId, onExport }) => {
  const [copied, setCopied] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(testData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(testData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_structure_${conversationId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateStructure = (data) => {
    const errors = [];
    const warnings = [];

    if (!data.title) errors.push('Missing test title');
    if (!data.description) warnings.push('Missing test description');
    if (!data.duration) errors.push('Missing test duration');

    if (!data.sections || data.sections.length === 0) {
      errors.push('No sections defined');
    } else {
      data.sections.forEach((section, sectionIndex) => {
        if (!section.name) errors.push(`Section ${sectionIndex + 1}: Missing name`);
        if (!section.duration) errors.push(`Section ${sectionIndex + 1}: Missing duration`);
        
        if (!section.questions || section.questions.length === 0) {
          warnings.push(`Section "${section.name}": No questions defined`);
        } else {
          section.questions.forEach((question, questionIndex) => {
            if (!question.content) errors.push(`Section "${section.name}" Question ${questionIndex + 1}: Missing content`);
            if (!question.question_type) errors.push(`Section "${section.name}" Question ${questionIndex + 1}: Missing question type`);
            if (!question.marks) warnings.push(`Section "${section.name}" Question ${questionIndex + 1}: Missing marks`);
            if (!question.duration) warnings.push(`Section "${section.name}" Question ${questionIndex + 1}: Missing duration`);

            if (question.question_type === 'MCQ') {
              if (!question.options || question.options.length !== 4) {
                errors.push(`Section "${section.name}" Question ${questionIndex + 1}: MCQ must have exactly 4 options`);
              }
              if (!question.correct_answer) {
                errors.push(`Section "${section.name}" Question ${questionIndex + 1}: MCQ missing correct answer`);
              }
            } else if (question.question_type === 'MSQ') {
              if (!question.options || question.options.length < 4 || question.options.length > 6) {
                errors.push(`Section "${section.name}" Question ${questionIndex + 1}: MSQ must have 4-6 options`);
              }
              if (!question.correct_answers || question.correct_answers.length === 0) {
                errors.push(`Section "${section.name}" Question ${questionIndex + 1}: MSQ missing correct answers`);
              }
            }
          });
        }
      });
    }

    return { errors, warnings };
  };

  const { errors, warnings } = validateStructure(testData);
  const isValid = errors.length === 0;

  const schema = {
    title: "string - The title of the test",
    description: "string - A description of what the test covers",
    test_type: "string - The type of test (e.g., 'Technical Assessment', 'General Knowledge')",
    duration: "string - Total test duration (e.g., '120 minutes')",
    sections: [
      {
        name: "string - Section name",
        duration: "number - Section duration in minutes",
        questions: [
          {
            question_type: "string - 'MCQ', 'MSQ', or 'theoretical'",
            content: "string - The question text",
            options: "array - For MCQ/MSQ: array of option strings",
            correct_answer: "string - For MCQ: 'A', 'B', 'C', or 'D'",
            correct_answers: "array - For MSQ: array of correct option letters",
            marks: "number - Points for this question",
            duration: "number - Time in minutes for this question"
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Structured JSON Output</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-generated structured data from natural language conversation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSchema(!showSchema)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            title="Toggle schema view"
          >
            {showSchema ? <EyeOff size={16} /> : <Eye size={16} />}
            Schema
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            title="Copy JSON to clipboard"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            title="Download JSON file"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {/* Validation Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {isValid ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className={`font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {isValid ? 'Valid Structure' : 'Validation Errors Found'}
          </span>
        </div>
        
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Errors ({errors.length})</h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Warnings ({warnings.length})</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Schema View */}
      {showSchema && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-blue-600" />
            <h4 className="font-medium text-blue-800 dark:text-blue-200">JSON Schema</h4>
          </div>
          <pre className="text-sm text-blue-700 dark:text-blue-300 overflow-x-auto">
            <code>{JSON.stringify(schema, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* Structure Overview */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Structure Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{testData.sections?.length || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sections</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {testData.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{testData.duration || 'N/A'}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      {testData.sections && testData.sections.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sections</h4>
          <div className="flex flex-wrap gap-2">
            {testData.sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setSelectedSection(selectedSection === index ? null : index)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSection === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {section.name} ({section.questions?.length || 0} questions)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Section Details */}
      {selectedSection !== null && testData.sections?.[selectedSection] && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Section: {testData.sections[selectedSection].name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {testData.sections[selectedSection].duration} minutes
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Questions:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {testData.sections[selectedSection].questions?.length || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* JSON Display */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Raw JSON</h4>
        <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
          <code>{JSON.stringify(testData, null, 2)}</code>
        </pre>
      </div>

      {/* Information about GenAI JSON Generation */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">About Structured JSON Generation</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
          This JSON structure was generated from natural language conversation using advanced GenAI techniques:
        </p>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>Prompt Engineering:</strong> Carefully crafted system prompts guide the AI to produce consistent JSON</li>
          <li>• <strong>Schema Validation:</strong> Built-in validation ensures the output follows the required structure</li>
          <li>• <strong>Error Handling:</strong> Robust parsing with fallback mechanisms for incomplete responses</li>
          <li>• <strong>Context Awareness:</strong> The AI maintains conversation context while updating the structure</li>
        </ul>
      </div>
    </div>
  );
};

export default JsonStructureViewer; 
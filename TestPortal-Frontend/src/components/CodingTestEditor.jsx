import React, { useState } from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import RichEditor from './RichEditor';

export default function CodingTestEditor({ 
  codingTest, 
  idx, 
  sectionId, 
  onChange, 
  onRemove, 
  saving 
}) {
  const [showTestCases, setShowTestCases] = useState(false);

  const handleChange = (field, value) => {
    onChange(sectionId, idx, field, value);
  };

  const addTestCase = () => {
    const currentTestCases = codingTest.test_cases || [];
    const newTestCase = {
      id: Date.now(),
      input: '',
      expected_output: ''
    };
    handleChange('test_cases', [...currentTestCases, newTestCase]);
  };

  const updateTestCase = (testCaseIndex, field, value) => {
    const currentTestCases = [...(codingTest.test_cases || [])];
    currentTestCases[testCaseIndex] = {
      ...currentTestCases[testCaseIndex],
      [field]: value
    };
    handleChange('test_cases', currentTestCases);
  };

  const removeTestCase = (testCaseIndex) => {
    const currentTestCases = [...(codingTest.test_cases || [])];
    currentTestCases.splice(testCaseIndex, 1);
    handleChange('test_cases', currentTestCases);
  };

  const difficulties = [
    { value: 0, label: 'Easy' },
    { value: 1, label: 'Medium' },
    { value: 2, label: 'Hard' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Coding Test {idx + 1}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(sectionId, idx)}
          disabled={saving}
          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
          title="Remove coding test"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={codingTest.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter coding test title"
            disabled={saving}
          />
        </div>

        {/* Marks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marks <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={codingTest.marks || ''}
            onChange={(e) => handleChange('marks', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter marks"
            min="1"
            disabled={saving}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select
            value={codingTest.difficulty || 0}
            onChange={(e) => handleChange('difficulty', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          >
            {difficulties.map((diff) => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <RichEditor
          value={codingTest.description || ''}
          onChange={(value) => handleChange('description', value)}
          placeholder="Describe the coding problem..."
          disabled={saving}
        />
      </div>

      {/* Boilerplate Code */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Boilerplate Code
        </label>
        <textarea
          value={codingTest.boilerplate_code || ''}
          onChange={(e) => handleChange('boilerplate_code', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          rows="6"
          placeholder="// Write your function here&#10;function solution() {&#10;  // Your code here&#10;}"
          disabled={saving}
        />
      </div>

      {/* Test Cases */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Test Cases <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowTestCases(!showTestCases)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showTestCases ? 'Hide' : 'Show'} Test Cases
          </button>
        </div>

        {showTestCases && (
          <div className="space-y-3">
            {(codingTest.test_cases || []).map((testCase, testCaseIndex) => (
              <div key={testCase.id || testCaseIndex} className="border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Test Case {testCaseIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTestCase(testCaseIndex)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove test case"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Input
                    </label>
                    <textarea
                      value={testCase.input || ''}
                      onChange={(e) => updateTestCase(testCaseIndex, 'input', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                      rows="2"
                      placeholder="Enter test input"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Expected Output
                    </label>
                    <textarea
                      value={testCase.expected_output || ''}
                      onChange={(e) => updateTestCase(testCaseIndex, 'expected_output', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                      rows="2"
                      placeholder="Enter expected output"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTestCase}
              disabled={saving}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <FaPlus className="w-3 h-3" />
              Add Test Case
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
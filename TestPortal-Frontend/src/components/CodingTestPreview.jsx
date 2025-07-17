import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaCode, FaPlay, FaCheck, FaTimes, FaEye, FaEyeSlash, FaSearch } from 'react-icons/fa';
import { LoaderCircle, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import Editor from '@monaco-editor/react';

const CodingTestPreview = ({ 
  codingTests, 
  currentTestIndex, 
  onTestChange, 
  onCodeChange, 
  onRunTest, 
  onSubmit,
  isRunning = false,
  results = null,
  selectedLanguage = 'python',
  onLanguageChange = () => {},
  isPreviewMode = false,
  hasFinalSubmission = false
}) => {
  // State management
  const [code, setCode] = useState('');
  const [showTestCases, setShowTestCases] = useState(true);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'output'
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized values for performance
  const currentTest = useMemo(() => codingTests[currentTestIndex], [codingTests, currentTestIndex]);
  
  const getTestResults = useCallback(() => {
    if (!results) return [];
    // Handle the case where results might be an object with test_results or be the test_results array itself
    if (Array.isArray(results)) return results;
    if (results.test_results && Array.isArray(results.test_results)) return results.test_results;
    return [];
  }, [results]);

  const getPassedTestsCount = useCallback(() => {
    if (results?.passed_tests !== undefined) return results.passed_tests;
    const testResults = getTestResults();
    if (!Array.isArray(testResults)) return 0;
    return testResults.filter(r => r.passed).length;
  }, [results, getTestResults]);

  const getFailedTestsCount = useCallback(() => {
    if (results?.failed_tests !== undefined) return results.failed_tests;
    const testResults = getTestResults();
    if (!Array.isArray(testResults)) return 0;
    return testResults.filter(r => !r.passed).length;
  }, [results, getTestResults]);

  const getTotalTestsCount = useCallback(() => {
    if (results?.total_tests !== undefined) return results.total_tests;
    const testResults = getTestResults();
    if (!Array.isArray(testResults)) return 0;
    return testResults.length;
  }, [results, getTestResults]);

  // Check if editing is allowed (no final submission)
  const isEditingAllowed = useMemo(() => {
    return !hasFinalSubmission && !isPreviewMode;
  }, [hasFinalSubmission, isPreviewMode]);

  const getSuccessRate = useCallback(() => {
    if (results?.success_rate !== undefined) return results.success_rate;
    const total = getTotalTestsCount();
    if (total === 0) return 0;
    return Math.round((getPassedTestsCount() / total) * 100);
  }, [results, getTotalTestsCount, getPassedTestsCount]);

  // Extended language options with more languages
  const languageOptions = useMemo(() => [
    { value: 'python', label: 'Python', icon: '🐍', monacoLanguage: 'python' },
    { value: 'javascript', label: 'JavaScript', icon: '🟨', monacoLanguage: 'javascript' },
    { value: 'java', label: 'Java', icon: '☕', monacoLanguage: 'java' },
    { value: 'cpp', label: 'C++', icon: '⚡', monacoLanguage: 'cpp' },
    { value: 'c', label: 'C', icon: '🔧', monacoLanguage: 'c' },
    { value: 'ruby', label: 'Ruby', icon: '💎', monacoLanguage: 'ruby' },
    { value: 'php', label: 'PHP', icon: '🐘', monacoLanguage: 'php' },
    { value: 'go', label: 'Go', icon: '🐹', monacoLanguage: 'go' },
    { value: 'rust', label: 'Rust', icon: '🦀', monacoLanguage: 'rust' },
    { value: 'swift', label: 'Swift', icon: '🍎', monacoLanguage: 'swift' },
    { value: 'kotlin', label: 'Kotlin', icon: '🟦', monacoLanguage: 'kotlin' },
    { value: 'scala', label: 'Scala', icon: '🔴', monacoLanguage: 'scala' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷', monacoLanguage: 'typescript' },
    { value: 'csharp', label: 'C#', icon: '💜', monacoLanguage: 'csharp' },
    { value: 'dart', label: 'Dart', icon: '🎯', monacoLanguage: 'dart' },
    { value: 'r', label: 'R', icon: '📊', monacoLanguage: 'r' },
    { value: 'matlab', label: 'MATLAB', icon: '📈', monacoLanguage: 'matlab' },
    { value: 'perl', label: 'Perl', icon: '🐪', monacoLanguage: 'perl' },
    { value: 'haskell', label: 'Haskell', icon: 'λ', monacoLanguage: 'haskell' },
    { value: 'lua', label: 'Lua', icon: '🌙', monacoLanguage: 'lua' },
    { value: 'bash', label: 'Bash', icon: '🐚', monacoLanguage: 'shell' },
    { value: 'powershell', label: 'PowerShell', icon: '💻', monacoLanguage: 'powershell' },
    { value: 'sql', label: 'SQL', icon: '🗄️', monacoLanguage: 'sql' },
    { value: 'html', label: 'HTML', icon: '🌐', monacoLanguage: 'html' },
    { value: 'css', label: 'CSS', icon: '🎨', monacoLanguage: 'css' },
    { value: 'json', label: 'JSON', icon: '📄', monacoLanguage: 'json' },
    { value: 'xml', label: 'XML', icon: '📋', monacoLanguage: 'xml' },
    { value: 'yaml', label: 'YAML', icon: '📝', monacoLanguage: 'yaml' },
    { value: 'markdown', label: 'Markdown', icon: '📝', monacoLanguage: 'markdown' }
  ], []);

  // Filtered language options based on search
  const filteredLanguageOptions = useMemo(() => {
    if (!languageSearchTerm) return languageOptions;
    return languageOptions.filter(lang => 
      lang.label.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
      lang.value.toLowerCase().includes(languageSearchTerm.toLowerCase())
    );
  }, [languageOptions, languageSearchTerm]);

  // Get current language info
  const currentLanguageInfo = useMemo(() => 
    languageOptions.find(l => l.value === selectedLanguage), 
    [languageOptions, selectedLanguage]
  );

  // Effects
  useEffect(() => {
    // Close language dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showLanguageDropdown && !event.target.closest('.language-dropdown')) {
        setShowLanguageDropdown(false);
        setLanguageSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageDropdown]);

  // Always update code when currentTestIndex or results.code changes
  useEffect(() => {
    if (results?.code !== undefined) {
      setCode(results.code);
    } else if (currentTest?.boilerplate_code) {
      setCode(currentTest.boilerplate_code);
    } else {
      setCode('');
    }
    setError(null);
  }, [currentTestIndex, results?.code, currentTest?.boilerplate_code]);

  // Event handlers
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode || '');
    onCodeChange(currentTestIndex, newCode || '');
    setError(null); // Clear error when user starts typing
  }, [currentTestIndex, onCodeChange]);

  const handleRunTest = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code before running the test');
      return;
    }

    setError(null);
    try {
      await onRunTest(currentTestIndex, code);
    } catch (err) {
      setError('Failed to run test. Please try again.');
      console.error('Test run error:', err);
    }
  }, [code, currentTestIndex, onRunTest]);

  const handleSubmit = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code before submitting');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit(currentTestIndex, code);
    } catch (err) {
      setError('Failed to submit solution. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, currentTestIndex, onSubmit]);

  const handlePrevTest = useCallback(() => {
    if (currentTestIndex > 0) {
      onTestChange(currentTestIndex - 1);
    }
  }, [currentTestIndex, onTestChange]);

  const handleNextTest = useCallback(() => {
    if (currentTestIndex < codingTests.length - 1) {
      onTestChange(currentTestIndex + 1);
    }
  }, [currentTestIndex, codingTests.length, onTestChange]);

  const handleLanguageChange = useCallback((language) => {
    onLanguageChange(language);
    setShowLanguageDropdown(false);
    setLanguageSearchTerm('');
  }, [onLanguageChange]);

  // Monaco Editor options
  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 16,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: true,
    readOnly: isRunning || isSubmitting || isPreviewMode || !isEditingAllowed,
    automaticLayout: true,
    wordWrap: 'on',
    theme: 'vs-dark',
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    matchBrackets: 'always',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    wordBasedSuggestions: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    cursorStyle: 'line',
    multiCursorModifier: 'alt',
    renderLineHighlight: 'all',
    selectOnLineNumbers: true,
    glyphMargin: true,
    useTabStops: false,
    parameterHints: {
      enabled: true,
      cycle: true
    },
    suggest: {
      insertMode: 'replace',
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showColors: true,
      showFiles: true,
      showReferences: true,
      showFolders: true,
      showTypeParameters: true,
      showWords: true,
      showUsers: true,
      showIssues: true
    }
  }), [isRunning, isSubmitting, isPreviewMode, isEditingAllowed]);

  // Early return for no test
  if (!currentTest) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FaCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No coding test available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentTest.title}
            </h2>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {currentTest.marks} marks
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              currentTest.difficulty === 0 ? 'bg-green-100 text-green-800' :
              currentTest.difficulty === 1 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentTest.difficulty === 0 ? 'Easy' : 
               currentTest.difficulty === 1 ? 'Medium' : 'Hard'}
            </span>
            {hasFinalSubmission && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center space-x-1">
                <FaCheck className="w-3 h-3" />
                <span>Submitted</span>
              </span>
            )}
          </div>
          
          {/* Enhanced Language Selector with Search */}
          <div className="relative language-dropdown">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <span className="text-lg">{currentLanguageInfo?.icon}</span>
              <span className="text-sm font-medium">
                {currentLanguageInfo?.label}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-96 overflow-hidden">
                {/* Search Input */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search languages..."
                      value={languageSearchTerm}
                      onChange={(e) => setLanguageSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>
                
                {/* Language Options */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredLanguageOptions.length > 0 ? (
                    filteredLanguageOptions.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => handleLanguageChange(lang.value)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                          selectedLanguage === lang.value ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <span className="text-lg">{lang.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-medium">{lang.label}</span>
                          <span className="text-xs text-gray-500 capitalize">{lang.value}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No languages found matching "{languageSearchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrevTest}
              disabled={currentTestIndex === 0}
              className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <span className="text-sm text-gray-500">
              {currentTestIndex + 1} of {codingTests.length}
            </span>
            
            <button
              onClick={handleNextTest}
              disabled={currentTestIndex === codingTests.length - 1}
              className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTestCases(!showTestCases)}
              className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showTestCases ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              <span>{showTestCases ? 'Hide' : 'Show'} Test Cases</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <FaTimes className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Question */}
        <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {currentTest.title}
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: currentTest.description }}
                  />
                </div>
              </div>

              {/* Test Cases Preview */}
              {currentTest.test_cases && currentTest.test_cases.length > 0 && showTestCases && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Sample Test Cases</h4>
                  <div className="space-y-2">
                    {currentTest.test_cases.slice(0, 2).map((testCase, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Test Case {idx + 1}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div><strong>Input:</strong> {testCase.input}</div>
                          <div><strong>Expected Output:</strong> {testCase.expected_output}</div>
                        </div>
                      </div>
                    ))}
                    {currentTest.test_cases.length > 2 && (
                      <div className="text-xs text-gray-500 italic">
                        +{currentTest.test_cases.length - 2} more test cases
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Code Editor and Output */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'editor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaCode className="w-4 h-4 inline mr-2" />
                Code Editor
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'output'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaPlay className="w-4 h-4 inline mr-2" />
                Test Results
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'editor' ? (
              /* Enhanced Code Editor with Monaco */
              <div className="h-full flex flex-col">
                {isPreviewMode && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>Preview Mode:</strong> Code execution and submission are disabled in preview mode to prevent unnecessary data creation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Monaco Editor */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={currentLanguageInfo?.monacoLanguage || 'plaintext'}
                    value={code}
                    onChange={handleCodeChange}
                    options={editorOptions}
                    placeholder={currentTest.boilerplate_code || `// Write your ${selectedLanguage} code here...`}
                    theme="vs-dark"
                    onMount={(editor) => {
                      // Set initial code if available and no existing code
                      if (currentTest.boilerplate_code && !code.trim()) {
                        const initialCode = currentTest.boilerplate_code;
                        setCode(initialCode);
                        onCodeChange(currentTestIndex, initialCode);
                        // Set cursor to end of the code
                        const lineCount = editor.getModel().getLineCount();
                        const lastLineLength = editor.getModel().getLineLength(lineCount);
                        editor.setPosition({ lineNumber: lineCount, column: lastLineLength + 1 });
                        editor.focus();
                      } else if (code.trim()) {
                        // If there's existing code, set cursor to end
                        const lineCount = editor.getModel().getLineCount();
                        const lastLineLength = editor.getModel().getLineLength(lineCount);
                        editor.setPosition({ lineNumber: lineCount, column: lastLineLength + 1 });
                        editor.focus();
                      }
                    }}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="bg-white border-t border-gray-200 p-3">
                  {hasFinalSubmission && (
                    <div className="mb-3 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md border-l-4 border-green-500">
                      <strong>Final submission made</strong> - No further changes or test runs allowed
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                                              <button
                          onClick={handleRunTest}
                          disabled={isRunning || isSubmitting || isPreviewMode || !code.trim() || !isEditingAllowed}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                        {isRunning ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaPlay className="w-4 h-4" />
                        )}
                        <span>{isRunning ? 'Running...' : isPreviewMode ? 'Run Test (Preview)' : 'Run Test'}</span>
                      </button>
                      
                      <button
                        onClick={handleSubmit}
                        disabled={isRunning || isSubmitting || isPreviewMode || !code.trim() || !isEditingAllowed}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {isSubmitting ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaCheck className="w-4 h-4" />
                        )}
                        <span>{isSubmitting ? 'Submitting...' : isPreviewMode ? 'Submit (Preview)' : 'Submit'}</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{code.length} chars</span>
                      <span>•</span>
                      <span>{code.split('\n').length} lines</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <span>{currentLanguageInfo?.icon}</span>
                        <span>{currentLanguageInfo?.label}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Test Results */
              <div className="h-full p-6 overflow-y-auto">
                {!results ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FaPlay className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Run your code to see test results</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Results</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{getPassedTestsCount()}</div>
                          <div className="text-sm text-gray-500">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{getFailedTestsCount()}</div>
                          <div className="text-sm text-gray-500">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{getTotalTestsCount()}</div>
                          <div className="text-sm text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{getSuccessRate()}%</div>
                          <div className="text-sm text-gray-500">Success Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Individual Test Results */}
                    {getTestResults().map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.passed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">
                            Test Case {index + 1}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {result.passed ? (
                              <FaCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <FaTimes className="w-4 h-4 text-red-600" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                result.passed ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Input:</div>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                              {result.input}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Expected Output:</div>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                              {result.expected_output}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Actual Output:</div>
                            <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                              {result.actual_output || 'No output'}
                            </div>
                          </div>
                        </div>
                        
                        {result.errors && (
                          <div className="mt-3">
                            <div className="font-medium text-red-700 mb-1">Errors:</div>
                            <div className="bg-red-100 p-2 rounded text-xs text-red-800">
                              {Array.isArray(result.errors) 
                                ? result.errors.join('\n') 
                                : result.errors.toString()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingTestPreview; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, Play, Database, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

const AdminAiMockTestGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [generationStatus, setGenerationStatus] = useState({});
  const [recentTests, setRecentTests] = useState([]);
  const [apiConnected, setApiConnected] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [questionCount, setQuestionCount] = useState(10);

  const baseUrl = import.meta.env.VITE_API_BASE_URL2;

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.full_path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCategories();
    fetchRecentTests();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.relative')) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCategories.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCategories.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCategories[highlightedIndex]) {
          const category = filteredCategories[highlightedIndex];
          setSelectedCategory(category.id);
          setSearchTerm(category.name);
          setShowDropdown(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/ai_mock_tests/leaf_categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    }
  };

  const fetchRecentTests = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/ai_mock_tests/recent_tests`);
      setRecentTests(response.data.tests || []);
    } catch (error) {
      console.error('Error fetching recent tests:', error);
    }
  };

  const testApiConnection = async () => {
    setApiTestLoading(true);
    setError('');
    try {
      const response = await axios.get(`${baseUrl}/api/v1/ai_mock_tests/test_api`);
      setApiConnected(response.data.connected);
      if (response.data.connected) {
        setError('');
      } else {
        setError('API connection failed');
      }
    } catch (error) {
      setApiConnected(false);
      setError('API connection failed');
    } finally {
      setApiTestLoading(false);
    }
  };

  const generateForAllCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${baseUrl}/api/v1/ai_mock_tests/generate_all`);
      setGenerationStatus(response.data);
      fetchRecentTests();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate tests');
    } finally {
      setLoading(false);
    }
  };

  const generateForCategory = async () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${baseUrl}/api/v1/ai_mock_tests/generate_category`, {
        category_id: selectedCategory,
        question_count: questionCount
      });
      setGenerationStatus(response.data);
      fetchRecentTests();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate test');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Mock Test Generator</h1>
            <p className="text-gray-600">Generate AI-powered mock tests for all categories</p>
          </div>
        </div>
        
        {/* API Connection Status */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">API Status:</span>
            {apiConnected === null ? (
              <span className="text-sm text-gray-500">Not tested</span>
            ) : apiConnected ? (
              <span className="flex items-center space-x-1 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Connected</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Disconnected</span>
              </span>
            )}
          </div>
          <button
            onClick={testApiConnection}
            disabled={apiTestLoading}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {apiTestLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Test Connection</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Generation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate for All Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Generate for All Categories</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Generate AI mock tests for all available leaf categories. This will create 10 questions per category with improved, specific content.
          </p>
          <button
            onClick={generateForAllCategories}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>{loading ? 'Generating...' : 'Generate All Tests'}</span>
          </button>
        </div>

        {/* Generate for Specific Category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Generate for Specific Category</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Category
              </label>
              
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <div
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSearchTerm(category.name);
                          setShowDropdown(false);
                          setHighlightedIndex(-1);
                        }}
                        className={`px-4 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                          index === highlightedIndex 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.full_path}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No categories found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}

              {/* Selected Category Display */}
              {selectedCategory && !showDropdown && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm font-medium text-blue-900">
                    Selected: {categories.find(c => c.id === selectedCategory)?.name}
                  </div>
                </div>
              )}
            </div>

            {/* Question Count Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions (5-20)
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => (
                  <option key={num} value={num}>
                    {num} questions
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={generateForCategory}
              disabled={loading || !selectedCategory}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span>{loading ? 'Generating...' : 'Generate Test'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generation Status */}
      {Object.keys(generationStatus).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(generationStatus).map(([key, value]) => (
              <div key={key} className={`p-3 border rounded-md ${getStatusColor(value.status)}`}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(value.status)}
                  <span className="font-medium">{key}</span>
                </div>
                <p className="text-sm mt-1">{value.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent AI-Generated Tests */}
      {recentTests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent AI-Generated Tests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {test.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.question_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(test.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiMockTestGenerator; 
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Play, CheckCircle, XCircle, AlertCircle, Loader2, BarChart3, List, Zap } from 'lucide-react';

const AiMockTestGenerator = () => {
  const [status, setStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetchStatus();
    fetchCategories();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axiosInstance.get('/ai_mock_tests/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to fetch status');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/ai_mock_tests/leaf_categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    }
  };

  const testApiConnection = async () => {
    try {
      setApiStatus('testing');
      const response = await axiosInstance.get('/ai_mock_tests/test_api');
      setApiStatus(response.data.status);
      if (response.data.status === 'connected') {
        setError(null);
      }
    } catch (err) {
      console.error('Error testing API:', err);
      setApiStatus('failed');
      setError('API connection failed');
    }
  };

  const generateAllTests = async () => {
    if (!window.confirm('This will generate mock tests for all categories without questions. This may take a while and consume API tokens. Continue?')) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress({ message: 'Starting generation...' });

    try {
      const response = await axiosInstance.post('/ai_mock_tests/generate_all');
      setGenerationProgress({
        message: 'Generation completed!',
        results: response.data.results,
        summary: response.data.summary
      });
      
      // Refresh data
      fetchStatus();
      fetchCategories();
    } catch (err) {
      console.error('Error generating tests:', err);
      setError(err.response?.data?.error || 'Failed to generate tests');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateForCategory = async (categoryId) => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress({ message: 'Generating test for category...' });

    try {
      const response = await axiosInstance.post(`/ai_mock_tests/generate_for_category/${categoryId}`);
      setGenerationProgress({
        message: response.data.message,
        testTitle: response.data.test_title,
        testId: response.data.test_id
      });
      
      // Refresh data
      fetchStatus();
      fetchCategories();
    } catch (err) {
      console.error('Error generating test for category:', err);
      setError(err.response?.data?.error || 'Failed to generate test for category');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage >= 50) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Mock Test Generator</h2>
            <p className="text-gray-600 mt-1">
              Automatically generate mock tests for all leaf categories using AI
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-500">Powered by AI</span>
            </div>
            <button
              onClick={testApiConnection}
              disabled={apiStatus === 'testing'}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {apiStatus === 'testing' ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              {apiStatus === 'testing' ? 'Testing...' : 'Test API'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      {status && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status Overview</h3>
            <button
              onClick={fetchStatus}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <List className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Total Categories</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {status.summary.total_leaf_categories}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-600">With Questions</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {status.summary.categories_with_questions}
              </p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-600">Without Questions</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {status.summary.categories_without_questions}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-600">Completion</span>
              </div>
              <div className="flex items-center mt-1">
                {getStatusIcon(status.summary.completion_percentage)}
                <p className="text-2xl font-bold text-blue-900 ml-2">
                  {status.summary.completion_percentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{status.summary.completion_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  status.summary.completion_percentage >= 80
                    ? 'bg-green-600'
                    : status.summary.completion_percentage >= 50
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${status.summary.completion_percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Generation Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Mock Tests</h3>
        
        <div className="space-y-4">
          {/* Generate All Button */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Generate for All Categories</h4>
              <p className="text-sm text-gray-600">
                Generate mock tests for all categories without questions
              </p>
            </div>
            <button
              onClick={generateAllTests}
              disabled={isGenerating || !status?.can_generate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Generate All
            </button>
          </div>

          {/* Individual Category Generation */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Generate for Specific Category</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories
                .filter(cat => !cat.has_questions)
                .slice(0, 9)
                .map(category => (
                                     <div
                     key={category.id}
                     className="p-3 border rounded-lg hover:bg-gray-50"
                   >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {category.test_domain}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateForCategory(category.id);
                        }}
                        disabled={isGenerating}
                        className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            {categories.filter(cat => !cat.has_questions).length > 9 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing first 9 categories. Use "Generate All" for complete coverage.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      {generationProgress && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Progress</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-gray-900">{generationProgress.message}</span>
            </div>
            
            {generationProgress.results && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {generationProgress.results.success}
                  </p>
                  <p className="text-sm text-gray-600">Success</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {generationProgress.results.skipped}
                  </p>
                  <p className="text-sm text-gray-600">Skipped</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {generationProgress.results.failed}
                  </p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            )}
            
            {generationProgress.testTitle && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Created:</strong> {generationProgress.testTitle}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent AI Tests */}
      {status?.recent_ai_tests?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI-Generated Tests</h3>
          
          <div className="space-y-3">
            {status.recent_ai_tests.map(test => (
              <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{test.title}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(test.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    test.status === 'published' ? 'bg-green-100 text-green-800' :
                    test.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {test.status}
                  </span>
                  <span className="text-sm text-gray-500">{test.total_marks} marks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiMockTestGenerator; 
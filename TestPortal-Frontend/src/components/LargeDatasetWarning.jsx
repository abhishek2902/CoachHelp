import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, Clock, Database } from 'lucide-react';

const LargeDatasetWarning = ({ testData }) => {
  const [isLargeDataset, setIsLargeDataset] = useState(false);
  const [datasetStats, setDatasetStats] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (testData) {
      const stats = calculateDatasetStats(testData);
      setDatasetStats(stats);
      setIsLargeDataset(stats.isLargeDataset);
    }
  }, [testData]);

  const calculateDatasetStats = (data) => {
    if (!data?.sections) return { isLargeDataset: false };

    const sections = data.sections;
    const totalQuestions = sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
    const totalSections = sections.length;
    const averageQuestionsPerSection = totalSections > 0 ? (totalQuestions / totalSections).toFixed(1) : 0;
    
    const largestSection = sections.reduce((largest, section) => {
      const questionCount = section.questions?.length || 0;
      return questionCount > (largest.questions?.length || 0) ? section : largest;
    }, {});

    return {
      totalSections,
      totalQuestions,
      averageQuestionsPerSection,
      largestSectionName: largestSection.name,
      largestSectionQuestions: largestSection.questions?.length || 0,
      isLargeDataset: totalQuestions > 30 || totalSections > 5
    };
  };

  if (!isLargeDataset || !datasetStats) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
              Large Dataset Detected
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Your test has {datasetStats.totalQuestions} questions across {datasetStats.totalSections} sections. 
              Large datasets may take longer to process and could hit context limits.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  {datasetStats.totalSections}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  {datasetStats.totalQuestions}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  {datasetStats.averageQuestionsPerSection}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">Avg/Section</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  {datasetStats.largestSectionQuestions}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">Largest Section</div>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 font-medium flex items-center gap-1"
            >
              {showDetails ? 'Hide' : 'Show'} optimization tips
              <Info size={14} />
            </button>

            {showDetails && (
              <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Tips for Working with Large Datasets:
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 text-green-600" />
                    <span>Be specific about which section you want to modify</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 text-green-600" />
                    <span>Add questions in smaller batches (5-10 at a time)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 text-green-600" />
                    <span>Use section names instead of "section 1, section 2"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 text-green-600" />
                    <span>Break large modifications into smaller, focused requests</span>
                  </li>
                </ul>

                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Database size={14} className="mt-0.5 text-blue-600" />
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>System Note:</strong> The AI will automatically optimize context for large datasets, 
                      showing only relevant sections while preserving all your data.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LargeDatasetWarning; 
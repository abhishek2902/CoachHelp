import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestAttemptContext } from '../context/TestAttemptContext';
import { LoaderCircle } from 'lucide-react';
import TrainingCardLoaderGrid from './CardLoaderGrid';

const ResultsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [aggregatedResults, setAggregatedResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const { attemptData, loading } = useContext(TestAttemptContext);

  useEffect(() => {
    if (attemptData && !loading) {
      setAttempts(attemptData);
      aggregateResults(attemptData);
    }
  }, [attemptData, loading]);

  const aggregateResults = (attempts) => {
    const grouped = {};

    attempts.forEach((attempt) => {
      const testId = attempt.test.id;
      if (!grouped[testId]) {
        grouped[testId] = {
          test: attempt.test,
          totalAttempts: attempt.total_attempts || 0,
          totalMarks: 0,
        };
      }

      if (attempt.average_score !== null) {
        grouped[testId].totalMarks = attempt.average_score * attempt.total_attempts;
      }
    });

    const resultArray = Object.values(grouped).map((entry) => ({
      test: entry.test,
      totalAttempts: entry.totalAttempts,
      averageScore: entry.totalMarks / entry.totalAttempts,
    }));

    setAggregatedResults(resultArray);
  };

  const filteredResults = aggregatedResults.filter((result) => {
    // Filter by test type
    const matchesCategory =
      !selectedCategory || result.test.test_type.includes(selectedCategory);

    // Filter by search query in title or description
    const matchesSearch =
      result.test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.test.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (!attempts) {
    return (
      <div className="p-6 text-center text-red-500">
        Unable to load attempt data.
      </div>
    );
  }

  return (
    <div className=" md:ml-50 min-h-screen pt-15 md:pt-4 px-4 py-3">
      <h1 className="text-xl font-bold mb-6 ">Results</h1>

      <div className="flex flex-wrap justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 justify-between w-71">
          <label className="font-medium">Search</label>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border outline-none border-gray-300 rounded px-3 py-2 text-sm w-52"
          />
        </div>
      </div>

              {loading ? (
        <div className="flex flex-wrap gap-4 mt-6">
          <TrainingCardLoaderGrid n={6}/>
        </div>
      ) : (
        <>

      {filteredResults.length === 0 ? (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
          <p className="text-gray-600 text-lg">
            🔍 No results found at the moment.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {filteredResults
            .sort((a, b) => new Date(b.test.created_at) - new Date(a.test.created_at))
            .map((result, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-md p-4 w-full sm:w-[48%] lg:w-[31%] flex flex-col justify-between bg-gradient-to-r from-gray-50 via-white to-gray-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Created: {new Date(result.test.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="font-semibold text-gray-800 text-md mb-2 line-clamp-2">
                  {result.test.title}
                </h2>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{result.test.description}</p>
                <div className="flex items-center text-sm text-gray-600 mb-3 gap-4">
                  <span>{result.averageScore.toFixed(2)} avg. score</span>
                  <span>{result.totalAttempts} attempts</span>
                </div>
                <div className="flex flex-row-reverse justify-between items-center">
                  <button
                    onClick={() => navigate(`/result/${result.test.id}`)}
                    className="text-sm inline-block text-white bg-gray-600 hover:bg-gray-700 py-1 px-2 rounded"
                  >
                    View Results
                  </button>
                  <span className="text-xs font-medium text-gray-800 bg-gray-100 rounded px-2 py-1">
                    {result.test.test_type}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default ResultsPage;


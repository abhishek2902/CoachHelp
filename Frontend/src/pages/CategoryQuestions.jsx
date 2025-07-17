import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { LoaderCircle, CheckCircle, ArrowLeft, ArrowRight, ListCheckIcon, Copy } from 'lucide-react';
import Swal from 'sweetalert2';

const CategoryQuestions = () => {
  const { categorySlug } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [review, setReview] = useState({});
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/categories/${categorySlug}/master_questions`);
        setQuestions(response.data);
      } catch (err) {
        console.error('Error fetching master questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchQuestions();
    }
  }, [categorySlug]);

  const handleMarkReview = (qid) => {
    setReview({ ...review, [qid]: !review[qid] });
  };

  const goToQuestion = (idx) => setCurrentIndex(idx);
  const prevQuestion = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const nextQuestion = () => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  // Section info (mocked for now)
  const sectionName = questions[0]?.section_name || 'Section';
  const sectionDuration = '30 mins';
  const categoryName = questions[0]?.category_name || 'Category';

  const handleClone = async () => {
    // Add confirmation alert
    const confirmed = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will clone all questions in this category (and its nested categories) into a new test.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, clone it!',
      cancelButtonText: 'Cancel',
    });

    if (!confirmed) {
      return;
    }

    try {
      setCloning(true);
      const response = await axiosInstance.post(`/categories/${categorySlug}/clone`);
      if (response.status == 201) {
        Swal.fire({
          icon: 'success',
          title: 'Cloned!',
          text: 'Category cloned successfully.',
        });
        // Optionally redirect to the cloned category
        // window.location.href = `/categories/${response.data.cloned_id}/questions`;
      }
    } catch (err) {
      console.error('Error cloning category:', err);
      Swal.fire({
        icon: 'error',
        title: 'Clone Failed',
        text: 'Something went wrong while cloning. Please try again.',
      });
    } finally {
      setCloning(false);
    }
  };

  // Helper to format question type
  const formatQuestionType = (type) => {
    if (!type) return 'Unknown';
    switch (type.toLowerCase()) {
      case 'mcq': return 'MCQ';
      case 'msq': return 'MSQ';
      case 'theoretical': return 'Theoretical';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500 bg-gray-100">
        <LoaderCircle className="animate-spin mr-2" />
        Loading questions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-gray-100 min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-100 min-h-screen flex items-center justify-center">
        No questions found for this category.
      </div>
    );
  }

  const q = questions[currentIndex];
  const isReview = review[q.id];

  // Status for navigator
  const getStatus = (qid) => {
    if (review[qid]) return 'review';
    return 'not-answered';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gray-50 shadow-md fixed top-0 left-0 z-50 px-2 sm:px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate" title={categoryName}>
            {categoryName.length > 20 ? categoryName.slice(0, 30) + "..." : categoryName}
          </h2>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            Duration: {sectionDuration}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClone}
            disabled={cloning}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded flex items-center gap-2 disabled:opacity-50 transition-colors text-sm sm:text-base"
          >
            <Copy className="w-4 h-4" />
            {cloning ? 'Cloning...' : 'Clone Test'}
          </button>
        </div>
      </div>

      {/* Main Content: Question Navigator and Question Card */}
      <div className="md:pt-[50px] lg:pt-[90px] pt-[60px] px-1 sm:px-2 flex flex-col lg:flex-row gap-4 sm:gap-6 mx-auto w-full max-w-screen-xl min-w-0">
        {/* Sidebar: Question Navigator */}
        <div className="sticky top-[102px] w-full lg:w-1/4 min-w-0 max-w-full lg:max-w-xs bg-white rounded-2xl shadow-2xl p-3 sm:p-5 flex flex-col justify-between mt-20 lg:mt-0 overflow-x-auto lg:overflow-visible">
          <div className="flex items-center gap-2 border-b border-gray-500 pb-3 justify-center">
            <ListCheckIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-md font-bold text-gray-800">Question Navigator</h2>
          </div>
          <div className="mt-2 pt-1 flex-1 overflow-y-auto px-1 space-y-2">
            <div className="flex flex-wrap justify-center gap-1 py-1 bg-white">
              {questions.map((ques, idx) => {
                const status = getStatus(ques.id);
                let color = "bg-gray-600";
                if (status === 'answered') color = "bg-green-500";
                if (status === 'not-answered') color = "bg-gray-600";
                if (status === 'review') color = "bg-blue-500";
                if (status === 'answered-review') color = "bg-purple-500";
                const isCurrent = idx === currentIndex;
                return (
                  <div key={ques.id} className="flex flex-col items-center space-y-0.5">
                    <button
                      onClick={() => goToQuestion(idx)}
                      className={`w-9 h-9 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 ${color} border-white`}
                    >
                      {idx + 1}
                    </button>
                    <div className={`w-6 h-1 rounded-full ${isCurrent ? "bg-yellow-500" : "bg-transparent"}`}></div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Instructions */}
          <div className="mt-2 border-t border-gray-500 pt-4">
            <h3 className="text-sm font-semibold text-center text-gray-600 mb-2">Instructions</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-600"></div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                <span>To Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-500"></div>
                <span>Answered + Review</span>
              </div>
            </div>
          </div>
        </div>
        {/* Main Question Card: Responsive */}
        <div className="flex flex-col justify-between w-full lg:w-3/4 min-w-0 bg-white shadow-xl rounded-xl p-2 sm:p-4 md:p-6 space-y-6 lg:min-h-[82vh] overflow-y-auto mt-20 lg:mt-0">
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-indigo-600 truncate" title={sectionName}>
              Section: {sectionName.length > 40 ? sectionName.slice(0, 40) + "..." : sectionName}
            </h3>
            <div className="flex flex-col md:flex-row justify-between font-semibold text-lg text-gray-800 break-words gap-2">
              <div className="question-content md:max-w-[63vw]">
                <span className="mr-2">Q{currentIndex + 1}.</span>
                <span>{q.content}</span>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Type: {q.question_type ? formatQuestionType(q.question_type) : 'N/A'}</p>
                <p>Marks: {q.marks !== undefined && q.marks !== null ? q.marks : 'N/A'}</p>
              </div>
            </div>
            {q.code_snippet && (
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-3">
                <code>{q.code_snippet}</code>
              </pre>
            )}
            {(q.question_type === 'MCQ' || q.question_type === 'MSQ') ? (
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[1, 2, 3, 4].map((opt) => (
                <div
                  key={opt}
                  className="flex items-center border rounded px-3 py-2 bg-gray-100 cursor-not-allowed opacity-70"
                >
                  <span className="font-medium">Option {String.fromCharCode(64 + opt)}.</span>
                  <span className="ml-2">{q[`option_${opt}`]}</span>
                </div>
              ))}
            </form>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
                <textarea
                  className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed opacity-70"
                  value={q.correct_answer}
                  readOnly
                />
              </div>
            )}
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              <ArrowLeft className="inline-block w-5 h-5 mr-1" /> Previous
            </button>
            <button
              onClick={nextQuestion}
              disabled={currentIndex === questions.length - 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next <ArrowRight className="inline-block w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryQuestions; 
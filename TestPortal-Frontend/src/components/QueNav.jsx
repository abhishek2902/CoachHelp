import React, { useState } from "react";

const QuestionNav = ({ test, currentIndex, setCurrentIndex, answers, setAnswers }) => {
  const handleQuestionClick = (index) => {
    setCurrentIndex(index); // Navigate to the clicked question
  };

  const handleQuestionReview = (index) => {
    const updatedAnswers = { ...answers };
    updatedAnswers[index] = updatedAnswers[index] || "review"; // Mark as reviewed if not attempted
    setAnswers(updatedAnswers); // Update answers state
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {test.questions.map((q, idx) => {
        let circleColor = "bg-white"; // Default color (not attempted)
        if (answers[idx] && answers[idx] !== "review") {
          circleColor = "bg-green-500"; // Color when attempted
        } else if (answers[idx] === "review") {
          circleColor = "bg-blue-500"; // Color for reviewed questions
        }

        return (
          <div key={idx} className="relative">
            <button
              onClick={() => handleQuestionClick(idx)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${circleColor} border-2 border-gray-300`}
            >
              {idx + 1}
            </button>
            <button
              onClick={() => handleQuestionReview(idx)}
              className="absolute top-0 right-0 text-xs text-blue-500"
            >
              Review
            </button>
          </div>
        );
      })}
    </div>
  );
};

const AttemptTest = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const test = { // Example test data, replace with actual data
    questions: [
      { id: 1, content: "Question 1?" },
      { id: 2, content: "Question 2?" },
      { id: 3, content: "Question 3?" },
      { id: 4, content: "Question 4?" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h2 className="text-xl font-bold mb-4">Test: Attempt Questions</h2>
      <QuestionNav
        test={test}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        answers={answers}
        setAnswers={setAnswers}
      />
      {/* The rest of your test display code here */}
      <div className="w-full md:w-3xl bg-white shadow-xl rounded-xl p-6 space-y-6">
        {/* QUESTION DISPLAY */}
        <div className="space-y-3">
          <p className="font-semibold text-lg">
            Q{currentIndex + 1}. {test.questions[currentIndex].content}
          </p>
          {/* Add your question options and navigation here */}
        </div>
      </div>
    </div>
  );
};

export default AttemptTest;

import React, { useState, useEffect } from "react";
import { ListCheckIcon } from "lucide-react";

const TestFullPreview = ({ test }) => {
  const [flatQuestions, setFlatQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    if (test?.sections?.length > 0 && test.sections[currentSectionIndex]) {
      const section = test.sections[currentSectionIndex];
      const questions = section.questions?.map((q) => ({
        ...q,
        section_name: section.name
      })) || [];
      console.log('TestFullPreview - Current section questions:', questions);
      questions.forEach((q, idx) => {
        console.log(`Question ${idx + 1} data:`, {
          content: q.content,
          question_type: q.question_type,
          options: q.options,
          option_1: q.option_1,
          option_2: q.option_2,
          option_3: q.option_3,
          option_4: q.option_4,
          correct_answer: q.correct_answer
        });
      });
      setFlatQuestions(questions);
      setCurrentIndex(0);
    }
  }, [test, currentSectionIndex]);

  const handleQuestionClick = (index) => {
    setCurrentIndex(index);
  };

  const currentQuestion = flatQuestions[currentIndex];

  if (!test) {
    return (
      <div className="text-center mt-10 text-gray-500 text-lg">
        Test not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-evenly p-2 md:p-4">
      {/* Header */}
      <div className="w-full bg-gray-50 shadow px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 rounded-t-xl">
        <div className="flex-1 text-center md:text-left min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate" title={test.title}>
            {test.title?.length > 20 ? test.title.slice(0, 30) + "..." : test.title}
          </h2>
          <div className="flex items-center gap-2 text-xs md:justify-start justify-center md:text-sm text-gray-600 min-w-0">
            Duration: {test.duration} min
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-4 flex flex-col lg:flex-row-reverse gap-6 w-full">
        {/* Question Box */}
        <div className="flex flex-col justify-between w-full bg-white shadow rounded-xl p-4 space-y-6 min-h-[40vh] overflow-y-auto">
          {currentQuestion && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-indigo-600 truncate" title={currentQuestion.section_name}>
                Section: {currentQuestion.section_name?.length > 40 ? currentQuestion.section_name.slice(0, 40) + "..." : currentQuestion.section_name}
              </h3>
              <div className="flex justify-between font-semibold text-lg text-gray-800 break-words min-h-[64px]">
                <div className="question-content max-w-full">
                  <span className="mr-2">Q{currentIndex + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: currentQuestion.content }} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type: {currentQuestion.question_type}</p>
                  <p className="text-sm text-gray-500">Marks: {currentQuestion.marks}</p>
                </div>
              </div>
              {currentQuestion.correct_answer && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Correct Answer: </span>
                  {Array.isArray(currentQuestion.correct_answer) ? (
                    <span>{currentQuestion.correct_answer.join(', ')}</span>
                  ) : (
                    <span dangerouslySetInnerHTML={{ __html: currentQuestion.correct_answer }} />
                  )}
                </div>
              )}
              {(["MCQ", "MSQ", "mcq", "msq"].includes(currentQuestion.question_type)) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Handle both old format (option_1, option_2, etc.) and new format (options array) */}
                  {(currentQuestion.options || [
                    currentQuestion.option_1,
                    currentQuestion.option_2,
                    currentQuestion.option_3,
                    currentQuestion.option_4
                  ])
                    .filter(Boolean)
                    .map((option, idx) => {
                      const optionLabel = ["A", "B", "C", "D", "E", "F"][idx];
                      console.log(`Rendering option ${optionLabel}:`, option);
                      return (
                        <div key={idx} className="flex flex-col sm:flex-row items-start gap-2 text-left py-2 px-3 border rounded-md bg-gray-50 border-gray-300 w-full">
                          <span className="font-medium">{`Option ${optionLabel}.`}</span>
                          <span dangerouslySetInnerHTML={{ __html: option }} className="break-words max-w-full" />
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-4 border border-gray-300 rounded bg-gray-50 text-sm text-gray-700 italic">
                  Theoretical Answer Placeholder
                </div>
              )}
            </div>
          )}
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(flatQuestions.length - 1, prev + 1))}
              disabled={currentIndex === flatQuestions.length - 1}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        {/* Question Palette + Legend */}
        <div className="sticky top-[102px] min-w-0 max-w-[17vw] w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 flex flex-col justify-between min-h-[30vh] max-h-[300px] lg:max-h-[82vh]">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-gray-500 pb-3 justify-center">
            <ListCheckIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-md font-bold text-gray-800">Question Navigator</h2>
          </div>
          {/* Palette */}
          <div className="mt-2 pt-1 flex-1 overflow-y-auto px-1 space-y-2 max-h-[300px] lg:max-h-[80vh]">
            {test.sections?.map((section, sectionIdx) => {
              const isActiveSection = sectionIdx === currentSectionIndex;
              return (
                <div key={section.id || `section-${sectionIdx}`} className="rounded-lg overflow-hidden border border-gray-300">
                  {/* Section Header */}
                  <div
                    onClick={() => {
                      setCurrentSectionIndex(sectionIdx);
                    }}
                    className={`flex flex-col justify-between items-center cursor-pointer px-5 py-2 transition-colors ${isActiveSection ? "bg-blue-100" : "bg-gray-200"}`}
                  >
                    <h2 className="text-xs font-semibold text-gray-800">
                      {section.name.length > 20 ? section.name.slice(0, 20) + "..." : section.name}
                      {isActiveSection && (
                        <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-700 font-medium text-xs">Duration: {section.duration} mins</p>
                  </div>
                  {/* Show Questions only if this section is active */}
                  {isActiveSection && (
                    <div className="flex flex-wrap justify-center gap-1 py-2 px-2 bg-white transition-all duration-300">
                      {section.questions?.map((q, idx) => {
                        const isCurrent = idx === currentIndex;
                        return (
                          <div key={q.id || `question-${sectionIdx}-${idx}`} className="flex flex-col items-center space-y-0.5">
                            <button
                              onClick={() => handleQuestionClick(idx)}
                              className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 bg-gray-600 border-gray-600 active:scale-95 transition-transform ${isCurrent ? "ring-2 ring-yellow-500" : ""}`}
                            >
                              {idx + 1}
                            </button>
                            <div className={`w-6 h-1 rounded-full ${isCurrent ? "bg-yellow-500" : "bg-transparent"}`}></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFullPreview; 
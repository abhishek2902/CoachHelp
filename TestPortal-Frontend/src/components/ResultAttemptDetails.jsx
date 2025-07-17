import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ListCheckIcon, LoaderCircle, MailIcon, Loader2, FileSpreadsheet, Code } from "lucide-react";
import { showErrorAlert, showSuccessAlert } from "../utils/sweetAlert";
import * as XLSX from 'xlsx';

const SendResponseButton = ({ attemptId, attemptData }) => {
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${base}/test_attempts/${attemptId}/send_response_email`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSuccessAlert("Send","Email sent successfully.")
      attemptData.response_email_sent=true
    } catch (err) {
      console.error(err);
      showErrorAlert("Soory","Failed to send email.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendEmail}
      disabled={loading || attemptData.response_email_sent}
      className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 disabled:cursor-not-allowed"
    >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : attemptData.response_email_sent ? (
          <>
            <MailIcon className="w-5 h-5" />
            Email Sent
          </>
        ) : (
          <>
            <MailIcon className="w-5 h-5" />
            Send Response Email
          </>
        )}
    </button>
  );
};

const exportAttemptToExcel = (attemptData) => {
  if (!attemptData) return;
  
  // Regular questions data
  const allQuestions = attemptData?.sections?.flatMap((section) =>
    section.questions?.map((q) => ({
      ...q,
      section_name: section.name,
    }))
  );
  
  const questionsData = allQuestions.map((q, idx) => {
    const selectedAnswer = attemptData.responses?.[q.id] || '';
    const correctAnswer = q.correct_answer || '';
    const marksInfo = attemptData.question_wise_marks?.find((entry) => entry.question_id === q.id);
    const max_marks = marksInfo?.max_marks ?? 0;
    const marksAwarded = marksInfo?.marks_awarded ?? 0;
    return {
      'S.No': idx + 1,
      'Type': 'Question',
      'Section': q.section_name,
      'Question': q.content?.replace(/<[^>]+>/g, ''),
      'Question Type': q.question_type,
      'Option 1': q.option_1 ? q.option_1.replace(/<[^>]+>/g, '') : '',
      'Option 2': q.option_2 ? q.option_2.replace(/<[^>]+>/g, '') : '',
      'Option 3': q.option_3 ? q.option_3.replace(/<[^>]+>/g, '') : '',
      'Option 4': q.option_4 ? q.option_4.replace(/<[^>]+>/g, '') : '',
      'Selected Answer': selectedAnswer,
      'Correct Answer': correctAnswer?.replace(/<[^>]+>/g, ''),
      'Marks Awarded': marksAwarded,
      'Max Marks': max_marks,
    };
  });

  // Coding tests data
  const codingTestsData = attemptData?.sections?.flatMap((section) =>
    section.coding_tests?.map((ct, idx) => {
      const submission = attemptData.coding_test_submissions?.find(s => s.coding_test_id === ct.id);
      const testRuns = attemptData.coding_test_submissions?.filter(s => 
        s.coding_test_id === ct.id && s.submission_type === 'test_running'
      ).length || 0;
      
      return {
        'S.No': questionsData.length + idx + 1,
        'Type': 'Coding Test',
        'Section': section.name,
        'Question': ct.title,
        'Description': ct.description?.replace(/<[^>]+>/g, ''),
        'Language': submission?.language || 'N/A',
        'Test Runs': testRuns,
        'Final Score': submission?.score || 0,
        'Max Marks': ct.marks,
        'Solution Code': submission?.solution_code || 'Not submitted',
        'Test Results': submission?.test_results ? JSON.stringify(submission.test_results) : 'N/A',
      };
    })
  ) || [];

  const data = [...questionsData, ...codingTestsData];
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attempt Details');
  const filename = `attempt-details-${attemptData.attempt_id}.xlsx`;
  XLSX.writeFile(wb, filename);
};

const AttemptDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tpuser = JSON.parse(localStorage.getItem("tpuser"));
  const currentUserId = tpuser?.user?.id;

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      const token = localStorage.getItem("token");
      const base = import.meta.env.VITE_API_BASE_URL;
      try {
        const response = await axios.get(`${base}/test_attempts/${id}/attempt_details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttemptData(response.data);
      } catch (err) {
        console.error("Error fetching attempt details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttemptDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        <LoaderCircle className="animate-spin mr-2" />
        Loading attempt details...
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className="p-6 text-center text-red-500">
        Unable to load attempt data.
      </div>
    );
  }

  // Combine regular questions and coding tests
  const allItems = attemptData?.sections?.flatMap((section) => {
    const questions = section.questions?.map((q) => ({
      ...q,
      section_name: section.name,
      type: 'question',
      section_id: section.id
    })) || [];
    
    const codingTests = section.coding_tests?.map((ct) => ({
      ...ct,
      section_name: section.name,
      type: 'coding_test',
      section_id: section.id
    })) || [];
    
    return [...questions, ...codingTests];
  }) || [];

  const currentItem = allItems[currentIndex] || {};
  const isCodingTest = currentItem.type === 'coding_test';

  // For regular questions
  const selectedAnswer = !isCodingTest ? attemptData.responses?.[currentItem.id] : null;
  const correctAnswer = !isCodingTest ? currentItem.correct_answer : null;
  const marksInfo = !isCodingTest ? attemptData.question_wise_marks?.find(
    (entry) => entry.question_id === currentItem.id
  ) : null;
  const max_marks = !isCodingTest ? (marksInfo?.max_marks ?? 0) : currentItem.marks;
  const marksAwarded = !isCodingTest ? (marksInfo?.marks_awarded ?? 0) : 0;

  // For coding tests
  const codingTestSubmission = isCodingTest ? attemptData.coding_test_submissions?.find(
    s => s.coding_test_id === currentItem.id
  ) : null;
  const testRuns = isCodingTest ? attemptData.coding_test_submissions?.filter(
    s => s.coding_test_id === currentItem.id && s.submission_type === 'test_running'
  ).length || 0 : 0;
  const finalSubmission = isCodingTest ? attemptData.coding_test_submissions?.find(
    s => s.coding_test_id === currentItem.id && s.submission_type === 'submit'
  ) : null;

  const handleQuestionClick = (index) => {
    setCurrentIndex(index);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const renderCodingTestContent = () => {
    if (!isCodingTest) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Description:</h4>
          <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: currentItem.description }} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Test Runs (before submit):</span>
            <span className="ml-2 text-blue-600">{testRuns}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Final Submission:</span>
            <span className={`ml-2 font-semibold ${finalSubmission ? 'text-green-700' : 'text-red-700'}`}>{finalSubmission ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Score Awarded:</span>
            <span className="ml-2 text-green-600">{finalSubmission?.score ?? 0}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Max Marks:</span>
            <span className="ml-2 text-gray-800">{currentItem.marks}</span>
          </div>
        </div>

        {finalSubmission && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-700 mb-2">Final Submission:</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
              <pre>{finalSubmission.solution_code}</pre>
            </div>
            {finalSubmission.test_results && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-green-700 mb-1">Test Cases:</h5>
                <div className="space-y-2">
                  {finalSubmission.test_results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">Test Case {idx + 1}</span>
                        <span className={`font-bold ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <div className="text-xs">
                        <div><span className="font-medium">Input:</span> <span className="font-mono">{result.input}</span></div>
                        <div><span className="font-medium">Expected Output:</span> <span className="font-mono">{result.expected_output}</span></div>
                        <div><span className="font-medium">Actual Output:</span> <span className="font-mono">{result.actual_output ?? 'No output'}</span></div>
                        {result.errors && (
                          <div className="text-red-700 mt-1">
                            <span className="font-medium">Error:</span> {Array.isArray(result.errors) ? result.errors.join(', ') : result.errors}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {codingTestSubmission && !finalSubmission && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-700 mb-2">Latest Test Run:</h4>
            <div className="bg-gray-900 text-yellow-400 p-3 rounded text-sm font-mono overflow-x-auto">
              <pre>{codingTestSubmission.solution_code}</pre>
            </div>
            <p className="text-xs text-yellow-600 mt-2">No final submission made</p>
          </div>
        )}

        {!codingTestSubmission && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-sm text-red-700">No submission made for this coding test</p>
          </div>
        )}
      </div>
    );
  };

  const renderRegularQuestionContent = () => {
    if (isCodingTest) return null;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Response:</h4>
          {selectedAnswer ? (
            <p className="text-sm text-blue-600">{selectedAnswer}</p>
          ) : (
            <p className="text-sm italic text-gray-400">Not Answered</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Correct Answer:</h4>
          <div className="text-sm text-green-600" dangerouslySetInnerHTML={{ __html: correctAnswer }} />
        </div>

        {["MCQ", "MSQ", "mcq", "msq"].includes(currentItem.question_type) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {[currentItem.option_1, currentItem.option_2, currentItem.option_3, currentItem.option_4]
              .filter(Boolean)
              .map((option, idx) => {
                const label = ["1", "2", "3", "4"][idx];
                const isSelected = selectedAnswer === label;
                const isCorrect = correctAnswer?.includes(label);

                let optionClass = "bg-white border-gray-300"; // default

                if (isSelected && isCorrect) {
                  optionClass = "bg-green-100 border-green-500"; // selected & correct
                } else if (isSelected && !isCorrect) {
                  optionClass = "bg-red-100 border-red-500"; // selected & wrong
                } else if (!isSelected && isCorrect) {
                  optionClass = "bg-white border-green-500"; // correct but not selected (optional)
                }

                return (
                  <div
                    key={idx}
                    className={`py-2 px-3 rounded border ${optionClass}`}
                  >
                    <strong className="mr-2">{`Option ${label}.`}</strong>
                    <span dangerouslySetInnerHTML={{ __html: option }} />
                  </div>
                );
              })}
            </div>
        ) : (
          <div className="p-4 mt-4 border border-gray-300 rounded bg-gray-50 text-sm text-gray-700 italic">
            {selectedAnswer || "No Answer Submitted"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-evenly md:p-4">
      {/* Header */}
      <div className="w-full bg-gray-50 shadow-md fixed top-0 left-0 z-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate" title={attemptData.test_title}>
            {attemptData.test_title.length > 20 ? attemptData.test_title.slice(0, 30) + "..." : attemptData.test_title}
          </h2>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            Marks Obtained: {attemptData.marks} / {attemptData.total_marks}
          </div>
        </div>

        {currentUserId === attemptData.test_creator_id && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 hover:text-black transition duration-200 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => exportAttemptToExcel(attemptData)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Export Excel
            </button>
            <SendResponseButton
              attemptId={attemptData.attempt_id}
              attemptData={attemptData}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="md:pt-[50px] lg:pt-[90px] pt-[60px] px-4 flex flex-col lg:flex-row-reverse gap-6 mx-auto">

        {/* Question Display Box */}
        <div className="flex flex-col justify-between w-full lg:min-w-[75vw] lg:max-w-[75vw] min-w-[90vw] bg-white shadow-xl rounded-xl p-6 space-y-6 lg:min-h-[82vh] overflow-y-auto mt-20 lg:mt-0">
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-indigo-600 truncate" title={currentItem.section_name}>
              Section:{currentItem.section_name.length > 40 ? currentItem.section_name.slice(0, 40) + "..." : currentItem.section_name}
            </h3>

            <div className="flex justify-between font-semibold text-lg text-gray-800 break-words">
              <div className="question-content lg:max-w-[63vw]">
                <span className="mr-2">
                  {isCodingTest ? (
                    (() => {
                      const section = attemptData.sections.find(sec => sec.id === currentItem.section_id);
                      const ctIndex = section?.coding_tests?.findIndex(ct => ct.id === currentItem.id) ?? -1;
                      return <><Code className="inline w-4 h-4 mr-1" />CT{ctIndex + 1}.</>;
                    })()
                  ) : (
                    <>
                      Q
                      {
                        attemptData.sections
                          ?.find((section) =>
                            section.questions?.some((q) => q.id === currentItem.id)
                          )
                          ?.questions?.findIndex((q) => q.id === currentItem.id) + 1
                      }.
                    </>
                  )}
                </span>
                <span dangerouslySetInnerHTML={{ __html: isCodingTest ? currentItem.title : currentItem.content }} />
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Type: {isCodingTest ? 'Coding Test' : currentItem.question_type}</p>
                <p>Marks: {max_marks}</p>
                <p>Scored: {isCodingTest ? (finalSubmission?.score || 0) : marksAwarded}</p>
              </div>
            </div>

            {renderRegularQuestionContent()}
            {renderCodingTestContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {/* Prev */}
            <button
              onClick={() => {
                const newIndex = Math.max(0, currentIndex - 1);
                setCurrentIndex(newIndex);

                const newItem = allItems[newIndex];
                const sectionIdx = attemptData.sections.findIndex(section =>
                  section.questions?.some(q => q.id === newItem.id) || section.coding_tests?.some(ct => ct.id === newItem.id)
                );
                setCurrentSectionIndex(sectionIdx);
              }}
              disabled={currentIndex === 0}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {/* Next */}
            <button
              onClick={() => {
                const newIndex = Math.min(allItems.length - 1, currentIndex + 1);
                setCurrentIndex(newIndex);

                const newItem = allItems[newIndex];
                const sectionIdx = attemptData.sections.findIndex(section =>
                  section.questions?.some(q => q.id === newItem.id) || section.coding_tests?.some(ct => ct.id === newItem.id)
                );
                setCurrentSectionIndex(sectionIdx);
              }}
              disabled={currentIndex === allItems.length - 1}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Navigator */}
        <div className="sticky top-[102px] lg:min-w-0 lg:max-w-[17vw] min-w-[90vw] w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 flex flex-col justify-between lg:min-h-[70vh] max-h-[300px] lg:max-h-[82vh]">
          <div className="flex items-center gap-2 border-b border-gray-500 pb-3 justify-center">
            <ListCheckIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-md font-bold text-gray-800">Question Navigator</h2>
          </div>

          <div className="mt-2 pt-1 flex-1 overflow-y-auto px-1 space-y-2">
            {attemptData.sections.map((section, sectionIdx) => {
              const sectionQuestions = section.questions || [];
              const sectionCodingTests = section.coding_tests || [];
              const isActive = sectionIdx === currentSectionIndex;

              return (
                <div key={section.id} className="border rounded-lg border-gray-300 overflow-hidden">
                  <div
                    onClick={() => {
                      setCurrentSectionIndex(sectionIdx);
                      const firstIndex = attemptData.sections
                        .slice(0, sectionIdx)
                        .reduce((acc, s) => acc + (s.questions?.length || 0) + (s.coding_tests?.length || 0), 0);
                      setCurrentIndex(firstIndex);
                    }}
                    className={`cursor-pointer px-5 py-2 ${isActive ? "bg-blue-100" : "bg-gray-200"}`}
                  >
                    <h2 className="text-xs font-semibold text-gray-800 truncate">
                      {section.name.length > 20 ? section.name.slice(0, 20) + "..." : section.name}
                      {isActive && (
                        <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </h2>
                  </div>

                  {isActive && (
                    <div className="flex flex-wrap justify-center gap-1 py-1 bg-white">
                      {/* Regular Questions */}
                      {sectionQuestions.map((q, idx) => {
                        const globalIndex = attemptData.sections
                          .slice(0, sectionIdx)
                          .reduce((acc, s) => acc + (s.questions?.length || 0) + (s.coding_tests?.length || 0), 0) + idx;
                        const ans = attemptData.responses?.[q.id];
                        const isCorrect = attemptData.question_wise_marks?.find((m) => m.question_id === q.id)?.marks_awarded > 0;

                        let color = "bg-gray-600";
                        if (ans) color = isCorrect ? "bg-green-500" : "bg-red-500";
                        const isCurrent = globalIndex === currentIndex;

                        return (
                          <div key={q.id} className="flex flex-col items-center space-y-0.5">
                            <button
                              onClick={() => handleQuestionClick(globalIndex)}
                              className={`w-9 h-9 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 ${color} border-white`}
                            >
                              {idx + 1}
                            </button>
                            <div className={`w-6 h-1 rounded-full ${isCurrent ? "bg-yellow-500" : "bg-transparent"}`}></div>
                          </div>
                        );
                      })}
                      
                      {/* Coding Tests */}
                      {sectionCodingTests.map((ct, idx) => {
                        const globalIndex = attemptData.sections
                          .slice(0, sectionIdx)
                          .reduce((acc, s) => acc + (s.questions?.length || 0) + (s.coding_tests?.length || 0), 0) + sectionQuestions.length + idx;
                        const submission = attemptData.coding_test_submissions?.find(s => s.coding_test_id === ct.id);
                        const finalSubmission = attemptData.coding_test_submissions?.find(s => s.coding_test_id === ct.id && s.submission_type === 'submit');
                        
                        let color = "bg-gray-600";
                        if (submission) {
                          if (finalSubmission) {
                            color = finalSubmission.score > 0 ? "bg-green-500" : "bg-red-500";
                          } else {
                            color = "bg-blue-500"; // Test runs but no final submission
                          }
                        }
                        const isCurrent = globalIndex === currentIndex;

                        return (
                          <div key={ct.id} className="flex flex-col items-center space-y-0.5">
                            <button
                              onClick={() => handleQuestionClick(globalIndex)}
                              className={`w-9 h-9 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 ${color} border-white`}
                              title={`${ct.title} - ${finalSubmission ? `Final Score: ${finalSubmission.score}` : submission ? 'Test runs only' : 'Not attempted'}`}
                            >
                              <Code className="w-4 h-4" />
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

          {/* Instructions */}
          <div className="mt-2 border-t border-gray-500 pt-4">
            <h3 className="text-sm font-semibold text-center text-gray-600 mb-2">Instructions</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-600"></div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500"></div>
                <span>Wrong</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Code className="w-3 h-3 text-white" />
                </div>
                <span>Coding Test</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptDetails;
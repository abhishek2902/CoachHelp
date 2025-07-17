import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { grabTabAttention, showSuccessAlert, showWarningAlert } from "../utils/sweetAlert";
import Swal from "sweetalert2";
import { ListCheckIcon} from "lucide-react";
import { FaCode } from "react-icons/fa";
import TestWithFaceDetection from "../components/TestWithFaceDetection";
import CodingTestPreview from "../components/CodingTestPreview";
import { useLoading } from "../context/LoadingContext";

const AttemptTest = () => {
  const { attemptId } = useParams();
  const { guest_token } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [reviewque,setreviewque]=useState({});  
  const timerRef = useRef(null);
  const [flatQuestions, setFlatQuestions] = useState([]);
  const [isSubmit,setIsSubmit]=useState(0);
  const [allQuestionsForSubmission, setAllQuestionsForSubmission] = useState([]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionTimeLeft, setSectionTimeLeft] = useState(null);
  const sectionTimerRef = useRef(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [codingTestResults, setCodingTestResults] = useState({});
  const [isRunningCodingTest, setIsRunningCodingTest] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  //for security
  const tabSwitchCountRef = useRef(0);
  const exitFullScreenCountRef = useRef(0);
  const [cheatCount,setCheatCount] =useState(0);
  const handleSubmitRef = useRef();
  const hasWarnedRef = useRef(false);

  const testWithFaceDetectionRef = useRef();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const handleQuestionClick = (index) => {
    setCurrentIndex(index); // Navigate to the clicked question
  };

  const handleQuestionReview = (index) => {
    const updatedReviewque = { ...reviewque };
    if (updatedReviewque[index] === "review") {
      // If already marked for review, remove it from review
      delete updatedReviewque[index];
    } else {
      // Otherwise, mark it as review
      updatedReviewque[index] = "review";
    }
    setreviewque(updatedReviewque); // Update review state
  };

  // Coding test handling functions
  const handleCodingTestCodeChange = (testIndex, code) => {
    // Get the current coding test from flatQuestions to use its ID for unique key
    const currentCodingTest = flatQuestions[testIndex];
    if (!currentCodingTest || !currentCodingTest.is_coding_test) return;
    
    const uniqueKey = `coding_test_${currentCodingTest.id}`;
    setCodingTestResults(prev => ({
      ...prev,
      [uniqueKey]: { ...prev[uniqueKey], code }
    }));
  };

  const handleRunCodingTest = async (testIndex, code) => {
    setIsRunningCodingTest(true);
    startLoading('coding-test-run');
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const currentCodingTest = flatQuestions[testIndex];
      if (!currentCodingTest || !currentCodingTest.is_coding_test) return;

      const response = await axios.post(`${base}/coding_tests/${currentCodingTest.id}/submit_solution`, {
        solution_code: code,
        language: selectedLanguage,
        submitted_by: 'test_attempt_user',
        test_attempt_id: attemptId,
        submission_type: 'test_running'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'guest_token': guest_token,
        },
        params: {
          guest_token: guest_token,
        },
      });

      const uniqueKey = `coding_test_${currentCodingTest.id}`;
      setCodingTestResults(prev => ({
        ...prev,
        [uniqueKey]: { 
          ...prev[uniqueKey], 
          results: response.data,
          code,
          language: selectedLanguage
        }
      }));
    } catch (error) {
      console.error('Error running coding test:', error);
      const currentCodingTest = flatQuestions[testIndex];
      if (!currentCodingTest || !currentCodingTest.is_coding_test) return;
      
      const uniqueKey = `coding_test_${currentCodingTest.id}`;
      setCodingTestResults(prev => ({
        ...prev,
        [uniqueKey]: { 
          ...prev[uniqueKey], 
          error: 'Failed to run test',
          code,
          language: selectedLanguage
        }
      }));
    } finally {
      setIsRunningCodingTest(false);
      stopLoading('coding-test-run');
    }
  };

  const handleSubmitCodingTest = async (testIndex, code) => {
    startLoading('coding-test-submit');
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const currentCodingTest = flatQuestions[testIndex];
      if (!currentCodingTest || !currentCodingTest.is_coding_test) return;

      const response = await axios.post(`${base}/coding_tests/${currentCodingTest.id}/submit_solution`, {
        solution_code: code,
        language: selectedLanguage,
        submitted_by: 'test_attempt_user',
        submission_type: 'submit',
        test_attempt_id: attemptId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'guest_token': guest_token,
        },
        params: {
          guest_token: guest_token,
        },
      });

      const uniqueKey = `coding_test_${currentCodingTest.id}`;
      setCodingTestResults(prev => ({
        ...prev,
        [uniqueKey]: { 
          ...prev[uniqueKey], 
          submission: response.data,
          code,
          language: selectedLanguage,
          hasFinalSubmission: true
        }
      }));
    } catch (error) {
      console.error('Error submitting coding test:', error);
    } finally {
      stopLoading('coding-test-submit');
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // Function to check submission status for coding tests
  const checkCodingTestSubmissionStatus = async (codingTestId) => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${base}/coding_tests/${codingTestId}/submission_status`, {
        headers: {
          'Content-Type': 'application/json',
          'guest_token': guest_token,
        },
        params: {
          test_attempt_id: attemptId,
          guest_token: guest_token,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error checking submission status:', error);
      return null;
    }
  };

  // Function to load existing coding test submissions
  const loadExistingCodingTestSubmissions = async () => {
    if (!test || !test.sections) return;

    startLoading('load-submissions');
    const submissions = {};
    
    try {
      for (let sectionIndex = 0; sectionIndex < test.sections.length; sectionIndex++) {
        const section = test.sections[sectionIndex];
        if (section.is_coding_test && section.coding_tests) {
          for (let testIndex = 0; testIndex < section.coding_tests.length; testIndex++) {
            const codingTest = section.coding_tests[testIndex];
            const status = await checkCodingTestSubmissionStatus(codingTest.id);
            
            if (status) {
              const uniqueKey = `coding_test_${codingTest.id}`;
              submissions[uniqueKey] = {
                hasFinalSubmission: status.has_final_submission,
                latestTestRun: status.latest_test_run,
                finalSubmission: status.final_submission,
                code: status.latest_test_run?.solution_code || status.final_submission?.solution_code || '',
                language: status.latest_test_run?.language || status.final_submission?.language || selectedLanguage
              };
            }
          }
        }
      }
      
      setCodingTestResults(submissions);
    } finally {
      stopLoading('load-submissions');
    }
  };

  useEffect(() => {
    let interval;

    const startTestAndFetch = async () => {
      try {
        startLoading('test-initialization');
        const base = import.meta.env.VITE_API_BASE_URL;

        // Step 1: Call /start_test
        await axios.post(`${base}/test_attempts/${attemptId}/start_test`, {}, {
          headers: {
            'Content-Type': 'application/json',
            'guest_token': guest_token,
          },
          params: {
            guest_token: guest_token,
          },
        });

        // Step 2: Fetch updated attempt data
        const res = await axios.get(`${base}/test_attempts/${attemptId}`, {
          headers: {
            'Content-Type': 'application/json',
            'guest_token': guest_token,
          },
          params: {
            guest_token: guest_token,
          },
        });

        const testData = res.data.test;
        setAnswers(res.data.answers);
        setTest(testData);

        // Flatten questions for navigation
        const questions = [];
        testData.sections.forEach((section) => {
          if (section.is_coding_test) {
            // For coding test sections, add coding tests to questions array
            section.coding_tests?.forEach((ct) => {
              questions.push({ ...ct, section_name: section.name, is_coding_test: true });
            });
          } else {
            // For regular sections, add questions
            section.questions.forEach((q) => {
              questions.push({ ...q, section_name: section.name, is_coding_test: false });
            });
          }
        });
        setFlatQuestions(questions);
        setAllQuestionsForSubmission(questions);

        // Load existing coding test submissions
        await loadExistingCodingTestSubmissions();

        const endTime = res.data.end_at;

        interval = setInterval(() => {
          const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining <= 0) {
            clearInterval(interval);
            handleSubmitRef.current?.(true);
          }
        }, 1000);
        timerRef.current = interval;
      } catch (err) {
        Swal.fire(`${err.response?.data?.errors?.join(', ') || 'Something went wrong'}`);
      } finally {
        setLoading(false);
        stopLoading('test-initialization');
      }
    };

    startTestAndFetch();

    return () => clearInterval(interval);
  }, []);

useEffect(() => {
  if (!test || !test.sections?.length) return;

  const section = test.sections[currentSectionIndex];
  if (!section) return;

  const durationSeconds = section.duration* 60;
  // const durationSeconds = 15;
  setSectionTimeLeft(durationSeconds);

  if (sectionTimerRef.current) clearInterval(sectionTimerRef.current);

  let isTransitioning = false; // flag to prevent double increment

  sectionTimerRef.current = setInterval(() => {
    setSectionTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(sectionTimerRef.current);

        if (!isTransitioning) {
          isTransitioning = true;

          setCurrentSectionIndex((prevIndex) => {
            if (prevIndex < test.sections.length - 1) {
              return prevIndex + 1;
            } else {
              handleSubmitRef.current?.(true);
              return prevIndex;
            }
          });
        }

        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    clearInterval(sectionTimerRef.current);
  };
}, [test, currentSectionIndex]);


useEffect(() => {
  if (test) {
    const section = test.sections[currentSectionIndex];
    
    if (section.is_coding_test) {
      // For coding test sections, use coding tests
      const codingTests = section.coding_tests?.map((ct) => ({
        ...ct,
        section_name: section.name,
        is_coding_test: true
      })) || [];
      setFlatQuestions(codingTests);
    } else {
      // For regular sections, use questions
      const questions = section.questions.map((q) => ({
        ...q,
        section_name: section.name,
        is_coding_test: false
      }));
      setFlatQuestions(questions);
    }
    
    setCurrentIndex(0); // reset to first question of section
    setreviewque({})
  }
}, [test, currentSectionIndex]);

  //Safety Methods
  // Auto-submit on reload
  const handleBeforeUnload = () => {
    handleSubmitRef.current?.(true, false);
  };
  
  // Detect tab switch via visibilitychange
  const handleVisibilityChange = () => {
    if (document.hidden) {
      tabSwitchCountRef.current += 1;

      if (tabSwitchCountRef.current === 1) {
        grabTabAttention({
          title: "Return to the test!",
          duration: 4000,
          favicon: "/images/warning-icon.png",
        });
        showWarningAlert(
          "Warning!",
          "Please stay on this tab to avoid test submission."
        );
      }

      if (tabSwitchCountRef.current > 1) {
        handleSubmitRef.current?.(true);
      }
    }
  };
  const enterFullscreen = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) {
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }
  };
  
  // Blur + right-click + dev tools prevention
  const handleTabSwitch = () => {
    tabSwitchCountRef.current += 1;
    showWarningAlert(
      "Warning!",
      "Please stay on this app to avoid test submission. This is the last warning"
    );

    if (tabSwitchCountRef.current > 1) {
      handleSubmitRef.current?.(true);
    }
  };
  const handleBlur = () => {
    handleTabSwitch();
  };
  const disableRightClick = (e) => e.preventDefault();
  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    if (
      (e.ctrlKey && ["c", "v", "x", "u"].includes(key)) ||
      (e.ctrlKey && e.shiftKey && ["i", "j"].includes(key)) ||
      e.key === "F12"
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  //to enter fullscreen
  useEffect(() => {
    Swal.fire({
      title: "Please don't exit fullscreen",
      text: "This test must be taken in fullscreen mode. Click below to continue or cancel to exit.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Continue Test",
      cancelButtonText: "Exit Test",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        enterFullscreen();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        handleSubmitRef.current?.(true);
      }
    });

    const handleResizeOrExitFullscreen = () => {
      const isFullscreen = document.fullscreenElement;
  
      if (!isFullscreen) {
        exitFullScreenCountRef.current += 1;

        if (exitFullScreenCountRef.current > 1) {
          // Don't show modal again, just auto-submit
          handleSubmitRef.current?.(true);
          return;
        }

        Swal.fire({
          title: "Please enter fullscreen",
          text: "This test must be taken in fullscreen mode. Click below to continue or cancel to exit. This is the last warning",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Enter Fullscreen",
          cancelButtonText: "Exit Test",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: true,
        }).then((result) => {
          if (result.isConfirmed) {
            enterFullscreen();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            handleSubmitRef.current?.(true);
          }
        });
      }
    };
  
    document.addEventListener("fullscreenchange", handleResizeOrExitFullscreen);
    document.addEventListener("webkitfullscreenchange", handleResizeOrExitFullscreen); // Safari
  
    return () => {
      document.removeEventListener("fullscreenchange", handleResizeOrExitFullscreen);
      document.removeEventListener("webkitfullscreenchange", handleResizeOrExitFullscreen);
    };
  }, []);

  //Handle Answer Change and handle Submit
  const handleAnswerChange = (questionId, value, questionType) => {
    if (questionType === "MSQ"||questionType ==="msq") {
      setAnswers((prev) => {
        const prevAnswers = prev[questionId] || [];
        const updatedAnswers = prevAnswers.includes(value)
          ? prevAnswers.filter((v) => v !== value)
          : [...prevAnswers, value];
        return { ...prev, [questionId]: updatedAnswers };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmit = async (auto = false, submission = true) => {
    startLoading('global');
    try {
      // Capture end screenshot before submitting
      if (testWithFaceDetectionRef.current && testWithFaceDetectionRef.current.uploadEndScreenshot) {
        await testWithFaceDetectionRef.current.uploadEndScreenshot();
      }
      const compiledAnswers = {};
      allQuestionsForSubmission.forEach((q) => {
        const answer = answers[q.id];
        // Check if it's a coding test (no question_type) or regular question
        if (q.is_coding_test) {
          // For coding tests, store the code as a string
          compiledAnswers[q.id] = typeof answer === "string" ? answer : "";
        } else if (q.question_type && q.question_type.toUpperCase() === "MSQ") {
          // For MSQ questions, join multiple answers with comma
          compiledAnswers[q.id] = Array.isArray(answer)
            ? answer.sort().join(",")
            : "";
        } else {
          // For other question types, store as string
          compiledAnswers[q.id] = typeof answer === "string" ? answer : "";
        }
      });

      const base = import.meta.env.VITE_API_BASE_URL;
      await axios.put(
        `${base}/test_attempts/${attemptId}`,
        {
          test_attempt: {
            answers: compiledAnswers, // <-- now using object with question ids
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            guest_token: guest_token,
          },
          params: {
            guest_token: guest_token,
            submission: submission,
          },
        }
      );

      localStorage.removeItem(`test_end_time_${attemptId}`);
      navigate(`/dashboard/${attemptId}/${guest_token}`, { replace: true });
      setIsSubmit(1);
    } catch (err) {
      console.error("Error submitting test:", err);
      showWarningAlert(
        "Submission Failed",
        "There was an error submitting your test. Please try again."
      );
    } finally {
      stopLoading('global');
    }
  };

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const currentQuestion = flatQuestions[currentIndex];
  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-lg font-semibold text-gray-700">Loading Test...</div>
        <div className="text-sm text-gray-500">Please wait while we prepare your test</div>
      </div>
    </div>
  );
  if (isSubmit) return <div className="text-center mt-10">Test Submitted, Close the tab</div>;
  if (!test) return <div className="text-center mt-10">Test not found or alredy submitted.</div>;

  return (
    <TestWithFaceDetection handleSubmitRef={handleSubmitRef} ref={testWithFaceDetectionRef}>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-evenly md:p-4">
        {/* Static Responsive Header */}
        <div className="w-full bg-gray-50 shadow-md fixed top-0 left-0 z-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          {/* Left: Title + Description */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <h2
              className="text-lg md:text-xl font-bold text-gray-800 truncate"
              title={test.title}
            >
              {test.title}
            </h2>
            <p
              className="text-xs md:text-sm text-gray-600 truncate"
              title={test.description}
            >
              {test.description}
            </p>
          </div>

          {/* Right: Timer + Submit Button */}
          <div className="flex items-center justify-center md:justify-end gap-2">
            <div className="flex flex-col gap-0.5">
              <div className="bg-red-600 text-white text-xs md:text-sm py-1 px-3 rounded-full font-semibold shadow">
                Section Time Left:
                <span className="ml-1">
                  {String(Math.floor(sectionTimeLeft / 3600)).padStart(2, "0")}:
                  {String(Math.floor((sectionTimeLeft % 3600)/60)).padStart(2, "0")}:
                  {String(sectionTimeLeft % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="bg-indigo-600 text-white text-xs md:text-sm py-0.5 px-3 rounded-full font-semibold shadow">
                Marks: {test.total_marks} 
              </div>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isLoading('global')}
                className={`font-semibold py-1.5 px-3 md:px-4 rounded text-xs md:text-sm active:scale-95 transition ${
                  isLoading('global') 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading('global') ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* === Main Content === */}
        <div className="lg:pt-[90px] md:pt-[0px] pt-[60px] px-4 flex flex-col lg:flex-row-reverse gap-6 mx-auto">
          {/* === Question Display Box === */}
          <div className="flex flex-col justify-between w-full lg:min-w-[75vw] lg:max-w-[75vw] min-w-[90vw] bg-white shadow-xl rounded-xl overflow-hidden lg:min-h-[82vh] mt-20 lg:mt-0">
            {currentQuestion && currentQuestion.is_coding_test ? (
              /* Coding Test Display */
              <div className="h-full">
                <CodingTestPreview
                  codingTests={flatQuestions}
                  currentTestIndex={currentIndex}
                  onTestChange={setCurrentIndex}
                  onCodeChange={handleCodingTestCodeChange}
                  onRunTest={handleRunCodingTest}
                  onSubmit={handleSubmitCodingTest}
                  isRunning={isRunningCodingTest}
                  results={{
                    ...codingTestResults[`coding_test_${currentQuestion.id}`]?.results,
                    code: codingTestResults[`coding_test_${currentQuestion.id}`]?.code
                  }}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                  hasFinalSubmission={codingTestResults[`coding_test_${currentQuestion.id}`]?.hasFinalSubmission || false}
                />
              </div>
            ) : (
              /* Regular Question Display */
              <div className="p-6 space-y-6 h-full overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-indigo-600">
                   Section: {currentQuestion.section_name}
                  </h3>
                  <div className="flex justify-between font-semibold text-lg text-gray-800 break-words min-h-[64px] md:min-h-[60px] lg:min-h-[66px]">
                    <div className="question-content lg:max-w-[60vw]">
                      <span className="mr-2">Q{currentIndex + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: currentQuestion.content }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type: {currentQuestion.is_coding_test ? 'Coding Test' : currentQuestion.question_type}</p>
                      <p className="text-sm text-gray-500">Marks: {currentQuestion.marks}</p>
                    </div>
                  </div>

                  {["MCQ", "MSQ","msq","mcq"].includes(currentQuestion.question_type) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[currentQuestion.option_1, currentQuestion.option_2, currentQuestion.option_3, currentQuestion.option_4]
                        .filter(Boolean)
                        .map((option, idx) => {
                          const optionLabel = ["1", "2", "3", "4"][idx];
                          const isMSQ = currentQuestion.question_type ==="MSQ" || currentQuestion.question_type ==="msq";
                          const isChecked = isMSQ
                            ? (answers[currentQuestion.id] || []).includes(optionLabel)
                            : answers[currentQuestion.id] === optionLabel;
                            const isSelected = answers[currentQuestion.id]&&answers[currentQuestion.id].includes(optionLabel);
                          return (
                            <label
                              key={idx}
                              className={`flex flex-col sm:flex-row items-start  gap-2 text-left py-2 px-3 border rounded-md transition-all ${
                                isSelected
                                  ? "bg-green-100 border-green-600 font-semibold"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type={isMSQ ? "checkbox" : "radio"}
                                name={`question-${currentQuestion.id}`}
                                value={optionLabel}
                                checked={isChecked}
                                onChange={() =>
                                  handleAnswerChange(
                                    currentQuestion.id,
                                    optionLabel,
                                    currentQuestion.question_type
                                  )
                                }
                                className="accent-blue-600  sm:mt-1.5"
                              />
                              <div className="flex flex-col sm:flex-row flex-wrap gap-1 text-sm sm:text-base text-gray-700">
                                <span className="font-medium">{`Option ${optionLabel}`}. </span>
                                <div className="prose max-w-full">
                              <span dangerouslySetInnerHTML={{ __html: option }} />
                            </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  ) : (
                    <textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400
                        ${answers[currentQuestion.id]&&"bg-green-100 border-green-600 font-semibold"}
                        `}
                      rows={3}
                      placeholder="Type your answer here..."
                    />
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons - Only for regular questions */}
            {currentQuestion && !currentQuestion.is_coding_test && (
              <div className="flex flex-wrap justify-between items-center md:gap-2 pt-4">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 active:scale-95"
                >
                  Prev
                </button>
                <button
                  onClick={() => handleQuestionReview(currentIndex)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2 rounded active:scale-95"
                >
                  {reviewque[currentIndex] === "review" ? "Remove Review" : "Mark for Review"}
                </button>
                <button
                  disabled={currentIndex === flatQuestions.length - 1}
                  onClick={() => setCurrentIndex((i) => Math.min(i + 1, flatQuestions.length - 1))}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded active:scale-95 disabled:hidden disabled:opacity-50 disabled:active:scale-100 disabled:hover:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* === Question Navigator === */}
          <div className="sticky top-[102px] lg:min-w-0 lg:max-w-[17vw] min-w-[90vw] w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 flex flex-col justify-between lg:min-h-[70vh] max-h-[300px] lg:max-h-[82vh]">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-gray-500 pb-3 justify-center">
              <ListCheckIcon className="h-6 w-6 text-gray-600" />
              <h2 className="text-md font-bold text-gray-800">Question Navigator</h2>
            </div>
            {/* Palette */}
            <div className="mt-2 pt-1 flex-1 overflow-y-auto px-1 space-y-2 max-h-[300px] lg:max-h-[80vh]">
              {test.sections.map((section, sectionIdx) => {
                const isActive = sectionIdx === activeSectionIndex;
                const isActiveSection=sectionIdx === currentSectionIndex;

                return (
                  <div key={section.id} className="rounded-lg overflow-hidden border border-gray-300">
                    {/* Section Header */}
                    <div
                      onClick={() => setActiveSectionIndex(sectionIdx)}
                      className={`flex flex-col justify-between items-center cursor-pointer px-5 py-2 transition-colors ${
                        isActiveSection ? "bg-blue-100" : "bg-gray-200"
                      }`}
                    >
                      <h2 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                        {section.is_coding_test && (
                          <FaCode className="w-3 h-3 text-green-600" />
                        )}
                        {section.name.length > 20 ? section.name.slice(0, 20) + "..." : section.name}
                        {isActiveSection && (
                          <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </h2>
                      <p className="text-gray-700 font-medium text-xs">Duration: {section.duration} mins</p>
                    </div>

                    {/* Show Questions/Coding Tests only if this section is active */}
                    {isActiveSection && (
                      <div className="flex flex-wrap justify-center gap-1 py-2 px-2 bg-white transition-all duration-300">
                        {section.is_coding_test ? (
                          // Coding Tests
                          section.coding_tests?.map((ct, idx) => {
                            let circleColor = "bg-gray-600";
                            let borderColor = "border-gray-600";

                            const uniqueKey = `coding_test_${ct.id}`;
                            if (codingTestResults[uniqueKey]?.submission) {
                              circleColor = "bg-green-500";
                              borderColor = "border-green-500";
                            } else if (codingTestResults[uniqueKey]?.results) {
                              circleColor = "bg-blue-400";
                              borderColor = "border-blue-400";
                            }

                            const isCurrent = idx === currentIndex;

                            return (
                              <div key={ct.id} className="flex flex-col items-center space-y-0.5">
                                <button
                                  onClick={() => handleQuestionClick(idx)}
                                  className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 ${circleColor} ${borderColor} active:scale-95 transition-transform`}
                                >
                                  {idx + 1}
                                </button>
                                <div className={`w-6 h-1 rounded-full ${isCurrent ? "bg-yellow-500" : "bg-transparent"}`}></div>
                              </div>
                            );
                          })
                        ) : (
                          // Regular Questions
                          section.questions?.map((q, idx) => {
                            let circleColor = "bg-gray-600";
                            let borderColor = "border-gray-600";

                            if (answers[q.id] != null) {
                              circleColor = "bg-green-500";
                              borderColor = reviewque[idx] === "review" ? "border-blue-400" : "border-green-500";
                            } else if (reviewque[idx] === "review") {
                              circleColor = "bg-blue-400";
                              borderColor = "border-blue-400";
                            }

                            const isCurrent = idx === currentIndex;

                            return (
                              <div key={q.id} className="flex flex-col items-center space-y-0.5">
                                <button
                                  onClick={() => handleQuestionClick(idx)}
                                  className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 ${circleColor} ${borderColor} active:scale-95 transition-transform`}
                                >
                                  {idx + 1}
                                </button>
                                <div className={`w-6 h-1 rounded-full ${isCurrent ? "bg-yellow-500" : "bg-transparent"}`}></div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>


            {currentSectionIndex < test.sections.length - 1 && (
              <button
                onClick={() => {
                  Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to return to this section.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, move to next section'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      startLoading('section-transition');
                      clearInterval(sectionTimerRef.current);
                      setCurrentSectionIndex((prev) => prev + 1);
                      // Stop loading after a short delay to allow the transition
                      setTimeout(() => {
                        stopLoading('section-transition');
                      }, 1000);
                    }
                  });
                }}
                disabled={isLoading('section-transition')}
                className={`mt-4 px-4 py-2 rounded transition ${
                  isLoading('section-transition')
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {isLoading('section-transition') ? 'Loading...' : 'Next Section'}
              </button>
            )}
            
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
                  <div className="w-5 h-5 rounded-full bg-blue-400"></div>
                  <span>To Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 border-4 border-blue-400"></div>
                  <span>Answered + Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TestWithFaceDetection>
  );
};

export default AttemptTest;
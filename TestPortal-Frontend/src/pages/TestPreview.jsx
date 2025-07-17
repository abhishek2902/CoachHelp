import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ListCheckIcon, Pencil, Trash2, Plus } from "lucide-react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { Navigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { FaCode } from "react-icons/fa";
import CodingTestPreview from "../components/CodingTestPreview";

const TestPreview = () => {
  const { slug } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flatQuestions, setFlatQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewque,setreviewque]=useState({});
  const [copied, setCopied] = useState(false);
  const navigate=useNavigate()
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [addingSection, setAddingSection] = useState(false);
  const [categoryPath, setCategoryPath] = useState([]);
  const [codingTestResults, setCodingTestResults] = useState({});
  const [isRunningCodingTest, setIsRunningCodingTest] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  const handleCopy = () => {
    navigator.clipboard.writeText(test.test_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const base = import.meta.env.VITE_API_BASE_URL;

    axios
      .get(`${base}/tests/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const fetchedTest = res.data;
        setTest(fetchedTest);
        // Flatten sections to single array of questions
        const questions = [];
        fetchedTest.sections?.forEach((section) => {
          section.questions.forEach((q) => {
            questions.push({ ...q, section_name: section.name });
          });
        });
        setFlatQuestions(questions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching test:", err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (test?.sections?.length > 0 && test.sections[currentSectionIndex]) {
        const section = test.sections[currentSectionIndex];
        
        if (section.is_coding_test) {
          // For coding test sections, use coding tests
          const codingTests = section.coding_tests?.map((ct) => ({
            ...ct,
            section_name: section.name
          })) || [];
          setFlatQuestions([]);
        } else {
          // For regular sections, use questions
          const questions = section.questions?.map((q) => ({
            ...q,
            section_name: section.name
          })) || [];
          setFlatQuestions(questions);
        }
        
        setCurrentIndex(0);
        setreviewque({});
      }
    }, [test, currentSectionIndex]);
  

  const handleQuestionClick = (index) => {
    setCurrentIndex(index);
  };

  const handleCodingTestChange = (testIndex) => {
    setCurrentIndex(testIndex);
  };

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
    try {
      const token = localStorage.getItem("token");
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
    }
  };

  const handleSubmitCodingTest = async (testIndex, code) => {
    try {
      const token = localStorage.getItem("token");
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
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const currentQuestion = flatQuestions[currentIndex];
  const currentSection = test?.sections?.[currentSectionIndex];
  const isCodingTestSection = currentSection?.is_coding_test;
  const currentCodingTests = currentSection?.coding_tests || [];

  // Fetch categories on modal open
  useEffect(() => {
    if (showAddSectionModal) {
      const fetchCategories = async () => {
        try {
          const res = await axiosInstance.get("/test_domains");
          setCategories(res.data.flatMap(domain => domain.categories || []));
        } catch (err) {
          setCategories([]);
        }
      };
      fetchCategories();
      setCategoryPath([]);
    }
  }, [showAddSectionModal]);

  // Helper to get children for the current path
  const getCurrentChildren = () => {
    if (categoryPath.length === 0) return categories;
    let current = categoryPath[categoryPath.length - 1];
    return current.children || [];
  };

  // The currently selected (deepest) category
  const selectedCategory = categoryPath[categoryPath.length - 1];
  const isLeaf = selectedCategory && (!selectedCategory.children || selectedCategory.children.length === 0);

  const handleCategorySelect = (level, selectedId) => {
    let newPath = categoryPath.slice(0, level);
    const options = level === 0 ? categories : categoryPath[level - 1].children || [];
    const selected = options.find(cat => cat.id === Number(selectedId));
    if (selected) {
      newPath[level] = selected;
      setCategoryPath(newPath);
    }
  };

  const handleCloneCategorySection = async () => {
    if (!isLeaf) return;
    setAddingSection(true);
    try {
      await axiosInstance.post(`/tests/${test.id}/clone_category_section`, { category_id: selectedCategory.id });
      // Refresh test data
      const res = await axiosInstance.get(`/tests/${slug}`);
      setTest(res.data);
      setShowAddSectionModal(false);
    } catch (err) {
      alert("Failed to add section: " + (err.response?.data?.error || err.message));
    } finally {
      setAddingSection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <LoaderCircle className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center mt-10 text-gray-500 text-lg">
        Test not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-evenly md:p-4">
      {/* Header */}
      <div className="w-full bg-gray-50 shadow-md fixed top-0 left-0 z-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <div className="flex-1 text-center md:text-left min-w-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate" title={test.title}>
          {test.title.length > 20 ? test.title.slice(0, 30) + "..." : test.title}
        </h2>
        {/* <p className="text-xs md:text-sm text-gray-600 truncate" title={test.description}>
          {test.description}
        </p> */}
        <div className="flex items-center gap-2 text-xs md:justify-start justify-center md:text-sm text-gray-600 min-w-0">
          Total Marks: {test.total_marks} 
        </div>
        {!(test.status=="unpublish") &&
        <div className="flex items-center gap-2 text-xs md:justify-start justify-center md:text-sm text-gray-600 min-w-0">
          <span className="truncate" title={test.test_code ? test.test_code : "Please publish to get code"}>
            Code: {test.test_code ? test.test_code : "Please publish to get code"}
          </span>
          {test.test_code && (
            <button onClick={handleCopy} className="hover:text-indigo-600 transition-colors">
              {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            </button>
          )}
        </div>
        }
      </div>
        <div className="flex flex-col sm:flex-col-reverse items-center justify-center md:justify-end gap-0.5 text-xs">
          <div className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs md:text-sm py-1 px-3 rounded-full font-semibold shadow-md">
            ⏱ Duration: {test.duration} min
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 hover:text-black transition duration-200 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {!(test.status=="unpublish") &&
              <button
                onClick={() => {
                  if (test.status === "pending") {
                    localStorage.setItem("testId", test.slug); // or test.id
                    navigate("/newtest");
                  } else {
                    navigate(`/edittest/${test.slug}`);
                  }
                }}
                className="ml-2 flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition duration-200 text-sm font-medium shadow-sm"
              >
                <Pencil className="w-4 h-4" /> {/* Optional icon */}
                <span>Edit</span>
              </button>
            }
            {test.status!="published" &&
            <button
              onClick={async () => {
                const confirmDelete = window.confirm("Are you sure you want to delete this test?");
                if (!confirmDelete) return;

                try {
                  const token = localStorage.getItem("token");
                  const base = import.meta.env.VITE_API_BASE_URL;

                  await axios.delete(`${base}/tests/${test.slug}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  navigate("/test");
                } catch (err) {
                  console.error(err);
                  showErrorAlert("Oops!", "Failed to delete test.");
                }
              }}
              className="ml-2 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-2 py-2 rounded-lg shadow-sm transition duration-200 font-medium"
            >
              <Trash2 className="w-4 h-4" /> {/* Optional icon */}
              <span>Delete</span>
            </button>
            }
          </div>
        </div>
      </div>

      {/* === Main Content === */}
      <div className="md:pt-[50px] lg:pt-[90px] pt-[60px] px-4 flex flex-col lg:flex-row-reverse gap-6 mx-auto">

        {/* Main Content Area */}
        <div className="w-full lg:min-w-[75vw] lg:max-w-[75vw] min-w-[90vw] bg-white shadow-xl rounded-xl overflow-hidden lg:min-h-[82vh] mt-20 lg:mt-0">
          {isCodingTestSection ? (
            /* Coding Test Preview */
            <div className="h-full">
              <CodingTestPreview
                codingTests={currentCodingTests}
                currentTestIndex={currentIndex}
                onTestChange={handleCodingTestChange}
                onCodeChange={handleCodingTestCodeChange}
                onRunTest={handleRunCodingTest}
                onSubmit={handleSubmitCodingTest}
                isRunning={isRunningCodingTest}
                results={codingTestResults[`coding_test_${currentCodingTests[currentIndex]?.id}`]?.results}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                isPreviewMode={true}
                hasFinalSubmission={false} // In preview mode, no final submissions are allowed
              />
            </div>
          ) : (
            /* Regular Question Preview */
            <div className="flex flex-col justify-between p-6 space-y-6 h-full overflow-y-auto">
              {currentQuestion && (
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-indigo-600 truncate" title={currentQuestion.section_name}>
                    Section:{currentQuestion.section_name.length > 40 ? currentQuestion.section_name.slice(0, 40) + "..." : currentQuestion.section_name}
                  </h3>

                  <div className="flex justify-between font-semibold text-lg text-gray-800 break-words min-h-[64px] md:min-h-[80px] lg:min-h-[96px]">
                    <div className="question-content lg:max-w-[63vw]">
                      <span className="mr-2">Q{currentIndex + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: currentQuestion.content }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type: {currentQuestion.question_type}</p>
                      <p className="text-sm text-gray-500">Marks: {currentQuestion.marks}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Answer: 
                    <div
                      className="text-sm text-gray-500"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.correct_answer }}
                    ></div>
                  </p>
                  

                  {["MCQ", "MSQ", "mcq", "msq"].includes(currentQuestion.question_type) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[currentQuestion.option_1, currentQuestion.option_2, currentQuestion.option_3, currentQuestion.option_4]
                        .filter(Boolean)
                        .map((option, idx) => {
                          const optionLabel = ["A", "B", "C", "D"][idx];
                          const isSelected = answers[currentQuestion.id] === optionLabel;

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setAnswers((prev) => ({
                                  ...prev,
                                  [currentQuestion.id]: optionLabel,
                                }));
                              }}
                              className={`cursor-pointer flex flex-col sm:flex-row items-start gap-2 text-left py-2 px-3 border rounded-md transition-all w-full ${
                                isSelected
                                  ? "bg-green-100 border-green-600 font-semibold"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                            <div className="flex flex-col sm:flex-row flex-wrap gap-1 text-sm sm:text-base text-gray-700 w-full">
                              <span className="font-medium">{`Option ${optionLabel}.`}</span>
                              <span
                                dangerouslySetInnerHTML={{ __html: option }}
                                className="break-words max-w-full"
                              />
                            </div>
                          </button>
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
          )}
        </div>

       {/* === Question Palette + Legend === */}
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
                      // onClick={() => setActiveSectionIndex(sectionIdx)}
                      onClick={() => {
                        setCurrentSectionIndex(sectionIdx);
                        setActiveSectionIndex(sectionIdx); // Reset index on section change
                      }}
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
                                  onClick={() => handleCodingTestChange(idx)}
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
            {/* Add Section Button at the very bottom */}
            <div className="mt-6">
              <button
                onClick={() => setShowAddSectionModal(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 w-full font-semibold"
                type="button"
                title="Add Section"
              >
                <Plus className="w-4 h-4" />
                Clone Section
              </button>
            </div>
        </div>
        
      </div>

      {/* Modal for Add Section */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex justify-center items-center">
          <div className="w-full max-w-md p-6 rounded-2xl relative bg-white shadow-2xl animate-fade-in">
            <button
              onClick={() => setShowAddSectionModal(false)}
              className="absolute top-4 right-4 bg-gray-800 text-white rounded-full shadow p-2 z-20 hover:bg-gray-900 focus:outline-none"
              aria-label="Close"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-bold mb-4">Add Section from Category</h2>
            {/* Multi-level dropdowns */}
            {[...Array(categoryPath.length + 1)].map((_, level) => {
              const options = level === 0 ? categories : categoryPath[level - 1]?.children || [];
              if (!options || options.length === 0) {
                // If this is not the first dropdown and there are no options, show a message
                if (level > 0) {
                  return (
                    <div className="mb-4 text-green-700 font-semibold flex items-center gap-2" key={level}>
                      <span>✓</span> No subcategories. This is a leaf category.
                    </div>
                  );
                }
                return null;
              }
              return (
                <div className="mb-4" key={level}>
                  <label className="block text-sm font-medium mb-1">
                    {level === 0 ? "Parent Category" : `Subcategory (Level ${level})`}
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={categoryPath[level]?.id || ""}
                    onChange={e => handleCategorySelect(level, e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {options.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              );
            })}
            {isLeaf && selectedCategory && (
              <div className="mb-2 text-green-700 font-semibold flex items-center gap-2">
                <span>✓</span> Leaf category selected: <span className="font-bold">{selectedCategory.name}</span>
              </div>
            )}
            <button
              onClick={handleCloneCategorySection}
              disabled={!isLeaf || addingSection}
              className={`w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold mt-2 ${(!isLeaf || addingSection) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            >
              {addingSection ? "Adding..." : "Add Section"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPreview;
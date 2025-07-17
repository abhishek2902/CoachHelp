import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ListCheckIcon, ArrowDown, ArrowBigDown, CheckIcon, CopyIcon,ArrowLeft } from "lucide-react";
import PdfViewer from "../components/PdfViewer";
import { handleUnauthorized } from '../utils/handleUnauthorized';
import { LoaderCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainingById, setAnswer } from '../redux/trainingSlice';
import Lottie from "lottie-react";
import loaderAnimation from "../assets/loader.json";
import VideoViewer from "../components/VideoViewer";

const TrainingPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const [training, setTraining] = useState(null);
  // const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  // const [loading, setLoading] = useState(true);
  const [flatQuestions, setFlatQuestions] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  // const [res,setRes]= useState(null);
  const [activeSidebar, setActiveSidebar] = useState('content');
  const [contentIndex, setContentIndex] = useState(0);
  const handleQuestionClick = (index) => setCurrentIndex(index);
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  const { training, res, answers, loading } = useSelector(state => state.training);
  const [currentSectionContent, setCurrentSectionContent] = useState(null);

  const base = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // useEffect(() => {
  //   const startTrainingAndFetch = async () => {
  //     try {
  //       const res = await axios.get(`${base}/trainings/${id}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       const trainingData = res.data;
  //       setTraining(trainingData);
  //       setRes(res.data)

  //       const questions = [];
  //       trainingData.training_sections?.forEach((section) => {
  //         section.training_questions.forEach((q) => {
  //           questions.push({ ...q, section_name: section.name });
  //         });
  //       });
  //       setFlatQuestions(questions);
  //     }
  //     catch (err) {
  //       if (err.response?.status === 401) {
  //         handleUnauthorized();
  //       } else {
  //         console.error(err);
  //       }
  //     }
  //      finally {
  //       setLoading(false);
  //     }
  //   };

  //   startTrainingAndFetch();
  // }, []);

  // useEffect(() => {
  //   dispatch(fetchTrainingById(id));
  // }, [id]);
  useEffect(() => {
    if (!training || String(training.slug) !== String(id)) {
      dispatch(fetchTrainingById(id));
    }
  }, [dispatch, id, training?.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(training.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDeleteTraining = async (id) => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the training.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${base}/trainings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Training has been deleted.',
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(`/my-trainings`)

      // Refresh list or remove from local state
      // setTrainings(prev => prev.filter(training => training.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'There was an issue deleting the training.',
      });
    }
  };

  useEffect(() => {
    if (training && activeSidebar==="question") {
      const section = training.training_sections[currentSectionIndex];
      const questions = section.training_questions.map((q) => ({
        ...q,
        section_name: section.name
      }));
      setFlatQuestions(questions);
      setCurrentIndex(0); // reset to first question of section
    }
  }, [training, currentSectionIndex]);

  const contentItems = [
    {
      type: "html",
      content: training?.content_html || "<p>No Content Available</p>",
    },
    ...(training?.pdf_file_urls || []).map((url) => ({
      type: "pdf",
      url,
    })),
    ...(training?.video_files || []).map((file) => ({
      type: "video",
      url: file.url,
    })),
  ];

  const currentQuestion = flatQuestions[currentIndex];

  if (loading || !res ) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Lottie animationData={loaderAnimation} loop={true} className="w-44 h-44" />
      </div>
    );
  }

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-evenly md:p-4">
        {/* Static Responsive Header */}
        <div className="w-full bg-gray-50 shadow-md fixed top-0 left-0 z-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <Link to="/my-trainings"
            title="Changes will be discarded"
            className="max-w-24 absolute sm:relative inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl shadow-sm transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex-1 text-center md:text-left min-w-0">
            <h2
              className="text-lg md:text-xl font-bold text-gray-800 truncate"
              title={training.title}
            >
              {training.title}
            </h2>
            {!(training.status=="unpublish") &&
                <div className="flex items-center gap-2 text-xs md:justify-start justify-center md:text-sm text-gray-600 min-w-0">
                <span className="truncate" title={training.code ? training.code : "Please publish to get code"}>
                    Code: {training.code ? training.code : "Please publish to get code"}
                </span>
                {training.code && (
                    <button onClick={handleCopy} className="hover:text-indigo-600 transition-colors">
                    {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                )}
                </div>
            }
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2">
            <div className="flex flex-row gap-0.5">
              {/* <div className="bg-indigo-600 text-white text-xs md:text-sm py-0.5 px-3 rounded-full font-semibold shadow">
                Marks: {training.total_marks} 
              </div> */}
              <button
                onClick={() => handleDeleteTraining(training.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 md:px-4 rounded text-xs md:text-sm active:scale-95 transition"
              >
                Delete
              </button>
              <button
                onClick={()=>navigate(`/training/edit/${id}`)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 md:px-4 rounded text-xs md:text-sm active:scale-95 transition"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* === Main Content === */}
        <div className="lg:pt-[90px] md:pt-[0px] pt-[60px] px-4 flex flex-col lg:flex-row-reverse gap-6 mx-auto">
          {/* === Question Display Box === */}
          {activeSidebar==="content"&&
          <div className="flex flex-col justify-between w-full lg:min-w-[75vw] lg:max-w-[75vw] min-w-[90vw] bg-white shadow-xl rounded-xl p-6 space-y-6 min-h-[82vh] overflow-y-auto mt-20 lg:mt-0">
            {contentItems.length > 0 && (
              <>
                <div className="space-y-2">
                  <h3 className="text-md font-semibold text-indigo-600">
                    Readings {contentIndex+1}
                  </h3>
                   {contentItems[contentIndex].type === "html" ? (
                      <div
                        className="prose max-w-full text-gray-700"
                        dangerouslySetInnerHTML={{ __html: contentItems[contentIndex].content }}
                      />
                    ) : contentItems[contentIndex].type === "pdf" ? (
                      <div className="flex flex-col items-center">
                        <PdfViewer pdfUrl={contentItems[contentIndex].url} />
                      </div>
                    ) : contentItems[contentIndex].type === "video" ? (
                      <div className="flex flex-col items-center">
                        <VideoViewer
                          key={contentItems[contentIndex].url} 
                          videoUrl={contentItems[contentIndex].url} 
                        />
                        </div>
                    ) : null}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-">
                  <button
                    onClick={() => setContentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={contentIndex === 0}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() =>
                      setContentIndex((prev) => Math.min(prev + 1, contentItems.length - 1))
                    }
                    disabled={contentIndex === contentItems.length - 1}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
          }
          {activeSidebar==="question"&&
          <div className="flex flex-col justify-between w-full lg:min-w-[75vw] lg:max-w-[75vw] min-w-[90vw] bg-white shadow-xl rounded-xl p-6 space-y-6 lg:min-h-[82vh] overflow-y-auto mt-20 lg:mt-0">
            {currentSectionContent?<div className="space-y-4">
              <h3 className="text-md font-semibold text-indigo-600">
                Reading
              </h3><span dangerouslySetInnerHTML={{ __html: currentSectionContent }} /></div>:
              (currentQuestion && (
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
                      <p className="text-sm text-gray-500">Type: {currentQuestion.question_type}</p>
                      <p className="text-sm text-gray-500">Marks: {currentQuestion.marks}</p>
                    </div>
                  </div>
                  <div>Correct Answer: {currentQuestion.correct_answer}</div>

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
                      <div className="p-4 border border-gray-300 rounded bg-gray-50 text-sm text-gray-700 italic">
                        Theoretical Answer Placeholder
                      </div>
                  )}
                </div>
              ))
            }

            {currentSectionContent &&
              <div className="flex flex-wrap justify-between items-center md:gap-2 pt-4">
                <button
                  onClick={
                    () => {
                      setCurrentSectionContent(null)
                      setCurrentIndex(0)
                    }
                  }
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 active:scale-95"
                >
                  Move to Questions
                </button>
              </div>
            }

            {/* Navigation Buttons */}
            {!currentSectionContent &&
              <div className="flex flex-wrap justify-between items-center md:gap-2 pt-4">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 active:scale-95"
                >
                  Prev
                </button>
                <button
                  disabled={currentIndex === flatQuestions.length - 1}
                  onClick={() => {
                    setCurrentIndex((i) => Math.min(i + 1, flatQuestions.length - 1))
                    setCurrentSectionContent(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:opacity-50"
                >
                  Next
                </button>
              </div>
            }
          </div>
          }

          {/* === Question Navigator === */}
          <div className="sticky top-[102px] lg:min-w-0 lg:max-w-[17vw] min-w-[90vw] w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 flex flex-col justify-between lg:min-h-[70vh] max-h-[300px] lg:max-h-[82vh]">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-gray-500 pb-3 justify-center">
              <ListCheckIcon className="h-6 w-6 text-gray-600" />
              <h2 className="text-md font-bold text-gray-800">Training Navigator</h2>
            </div>
            {/* Palette */}
            <div className="mt-2 pt-1 flex-1 overflow-y-auto px-1 space-y-2 max-h-[300px] lg:max-h-[80vh]">
              <div  className="rounded-lg overflow-hidden border border-gray-300">
                {/* Section Header */}
                <div
                  onClick={() => {
                    setActiveSidebar("content");
                    setCurrentSectionIndex(-1);
                  }}
                  className={`flex flex-col justify-between items-center cursor-pointer px-5 py-2 transition-colors ${
                    activeSidebar==="content" ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  <h2 className="text-xs font-semibold text-gray-800 flex">
                    {/* {section.name.length > 20 ? section.name.slice(0, 20) + "..." : section.name} */}
                    <span>Reading</span>
                    {activeSidebar==="content" && (
                      <span className=" ml-2 text-xs font-medium text-green-600 bg-green-100 px-0 py-0 rounded-full">
                        Active
                      </span>
                    )}
                  </h2>
                </div>

                {/* Show Questions only if this section is active */}
                {activeSidebar === "content" && (
                  <div className="flex flex-wrap justify-center gap-1 py-2 px-2 bg-white transition-all duration-300">
                    {contentItems.map((item, idx) => {
                      const isCurrent = idx === contentIndex;
                      return (
                        <div key={idx} className="flex flex-col items-center space-y-0.5">
                          <button
                            onClick={() => {
                              setContentIndex(idx)
                            }}
                            className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4
                              ${isCurrent ? "bg-gray-600 border-gray-600" : "bg-gray-600 border-gray-600"} active:scale-95 transition-transform`}
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
              {training.training_sections.map((section, sectionIdx) => {
                const isActiveSection=sectionIdx === currentSectionIndex;

                return (
                  <div key={section.id} className="rounded-lg overflow-hidden border border-gray-300">
                    {/* Section Header */}
                    <div
                      onClick={() => {
                        setCurrentSectionIndex(sectionIdx);
                        setActiveSidebar("question");
                        const currentSection = training?.training_sections?.[sectionIdx];
                        const currentSecContent = currentSection?.content_html || '';
                        setCurrentSectionContent(currentSecContent);
                        setCurrentIndex(-1)
                      }}
                      className={`flex flex-col justify-between items-center cursor-pointer px-5 py-2 transition-colors ${
                        isActiveSection ? "bg-blue-100" : "bg-gray-200"
                      }`}
                    >
                      <h2 className="text-xs font-semibold text-gray-800">
                        {section.name.length > 20 ? section.name.slice(0, 20) + "..." : section.name}
                        {isActiveSection && (
                          <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Show Questions only if this section is active */}
                    {isActiveSection && (
                      <div className="flex flex-wrap justify-center gap-1 py-2 px-2 bg-white transition-all duration-300">
                        <div className="flex flex-col items-center space-y-0.5">
                          <button
                            onClick={() => {
                              const currentSection = training?.training_sections?.[sectionIdx];
                              const currentSecContent = currentSection?.content_html || '';
                              setCurrentSectionContent(currentSecContent);
                              setCurrentIndex(-1)
                            }}
                            className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 bg-gray-600 border-gray-600 active:scale-95 transition-transform`}
                          >
                            C
                          </button>
                          <div className={`w-6 h-1 rounded-full ${currentSectionContent ? "bg-yellow-500" : "bg-transparent"}`}></div>
                        </div>
                        {section.training_questions?.map((q, idx) => {
                          const globalIndex = training.training_sections
                            .slice(0, sectionIdx)
                            .reduce((acc, sec) => acc + sec.training_questions.length, 0) + idx;

                          let circleColor = "bg-gray-600";
                          let borderColor = "border-gray-600";
                          const isCurrent = idx === currentIndex;

                          return (
                            <div key={q.id} className="flex flex-col items-center space-y-0.5">
                              <button
                                onClick={() => {
                                  handleQuestionClick(idx)
                                  setCurrentSectionContent(null)
                                }}
                                className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 ${circleColor} ${borderColor} active:scale-95 transition-transform`}
                              >
                                {idx + 1}
                              </button>
                              <div className={`w-6 h-1 rounded-full ${!currentSectionContent && isCurrent ? "bg-yellow-500" : "bg-transparent"}`}></div>
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

export default TrainingPreview;

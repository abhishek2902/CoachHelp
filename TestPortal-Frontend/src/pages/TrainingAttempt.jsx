import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ListCheckIcon, ArrowDown, ArrowBigDown, AlertCircle, AlertCircleIcon, ArrowLeft, ChevronDown, BookOpen, PlayCircle, FileCheck, Trophy, Clock, Repeat, Lock, ClockArrowUp, ClockArrowDown, CalendarClock } from "lucide-react";
import PdfViewer from "../components/PdfViewer";
import { handleUnauthorized } from '../utils/handleUnauthorized';
import { LoaderCircle } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { showErrorAlert, showWarningAlert } from "../utils/sweetAlert";
import { format } from 'date-fns';
const COLORS = ['#a5b4fc', '#c4b5fd', '#f9a8d4', '#fcd34d'];

import Lottie from "lottie-react";
import loaderAnimation from "../assets/loader.json";
import VideoViewer from "../components/VideoViewer";
import { motion } from 'framer-motion';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Confetti from "react-confetti";
import { Howl } from "howler";
import { useSpring, animated } from '@react-spring/web';
import clsx from "clsx";

const TrainingAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flatQuestions, setFlatQuestions] = useState([]);
  const [reviewque, setReviewque] = useState({});
  const [allQuestionsForSubmission, setAllQuestionsForSubmission] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [res,setRes]= useState(null);
  const [activeSidebar, setActiveSidebar] = useState('status');
  const [contentIndex, setContentIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const handleQuestionClick = (index) => setCurrentIndex(index);
  const [error, setError] = useState(null);
  const [currentSectionContent, setCurrentSectionContent] = useState(null);

  const [account, setAccount] = useState(null);
  const base = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [accountRes] = await Promise.all([
        axios.get(`${base}/accounts/give`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setAccount(accountRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  const startTrainingAndFetch = async () => {
    try {
      const res = await axios.get(`${base}/training_enrollments/attempt/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const trainingData = res.data.training;

      // 🔒 Check if link has expired
      if (trainingData.link_expires_date) {
        const linkExpiryDate = new Date(trainingData.link_expires_date);
        const today = new Date();
        linkExpiryDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (linkExpiryDate < today) {
          await Swal.fire({
            icon: 'error',
            title: 'Training Expired',
            text: 'This training link has expired and can no longer be accessed.',
          });
          navigate('/enrolled-trainings', { replace: true });
          return;
        }
      }

      setTraining(trainingData);
      setRes(res.data);

      const enrollment = res.data;
      setAnswers(enrollment.responses_json || {});

      const questions = [];
      trainingData.training_sections.forEach((section) => {
        section.training_questions.forEach((q) => {
          questions.push({ ...q, section_name: section.name });
        });
      });

      setFlatQuestions(questions);
      setAllQuestionsForSubmission(questions);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
      } else {
        console.error(err.response.data.error);
        setError(err.response.data.error)
      }
    } finally {
      setLoading(false);
    }
  };

  startTrainingAndFetch();
  }, []);

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
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", handleKeyDown);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.warn("Failed to exit fullscreen:", err);
        });
      }
    };
  }, []);

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

  //to enter fullscreen
  useEffect(() => {
    // enterFullscreen();
    const swalOptions = {
      icon: "info",
      iconColor: "#6366f1",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: true,
      showCancelButton: true,
      confirmButtonText: "Continue Training",
      cancelButtonText: "Exit Training",
      customClass: {
        title: "text-indigo-600 font-bold text-lg",        // Title color and style
        htmlContainer: "text-slate-700 text-sm",
        confirmButton: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold py-1.5 px-1 md:px-3 rounded text-xs md:text-sm active:scale-95 transition cursor-pointer m-2",
        cancelButton: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold py-1.5 px-1 md:px-3 rounded text-xs md:text-sm active:scale-95 transition cursor-pointer",
        popup: "rounded-lg px-4 py-3",
      },
      buttonsStyling: false, // important to apply Tailwind classes
    };

    Swal.fire({
      title: "Please don't exit fullscreen",
      text: "This training must be taken in fullscreen mode. Click below to continue or cancel to exit.",
      ...swalOptions,
    }).then((result) => {
      if (result.isConfirmed) {
        enterFullscreen();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        navigate("/enrolled-trainings");
      }
    });

    const handleResizeOrExitFullscreen = () => {
      const isFullscreen = document.fullscreenElement;

      if (!isFullscreen) {
        Swal.fire({
          title: "Please enter fullscreen",
          text: "This training must be taken in fullscreen mode. Click below to continue or cancel to exit. This is the last warning",
          confirmButtonText: "Enter Fullscreen",
          cancelButtonText: "Exit Training",
          ...swalOptions,
        }).then((result) => {
          if (result.isConfirmed) {
            enterFullscreen();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigate("/enrolled-trainings");
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

  function formatDateTime(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy • h:mm a');
  }

  function getTrainingEndTime(startedAt, durationHours) {
    if (!startedAt || !durationHours) return '—';
    const end = new Date(new Date(startedAt).getTime() + durationHours * 60 * 60000); // convert hours to milliseconds
    return format(end, 'MMM d, yyyy • h:mm a');
  }

  const handleAnswerChange = (questionId, value, questionType) => {
    setAnswers((prev) => {
      if (questionType.toUpperCase() === "MSQ") {
        const prevAnswers = prev[questionId] || [];
        const updatedAnswers = prevAnswers.includes(value)
          ? prevAnswers.filter((v) => v !== value)
          : [...prevAnswers, value];
        return { ...prev, [questionId]: updatedAnswers };
      } else {
        return { ...prev, [questionId]: value };
      }
    });
  };

  const markContentAsRead = (index) => {
    setAnswers((prev) => ({
      ...prev,
      [`reading${index + 1}`]: true,
    }));
  };

  const marksectionContentAsRead = (index) => {
    setAnswers((prev) => ({
      ...prev,
      [`sreading${index + 1}`]: true,
    }));
  };

  const handleSubmit = async (auto = false,status) => {
    try {
      const compiledAnswers = {};
      allQuestionsForSubmission.forEach((q) => {
        const answer = answers[q.id];
        if (q.question_type?.toUpperCase() === "MSQ") {
          compiledAnswers[q.id] = Array.isArray(answer)
            ? answer.sort().join(",")
            : "";
        } else {
          compiledAnswers[q.id] = typeof answer === "string" ? answer : "";
        }
      });
      Object.entries(answers).forEach(([key, value]) => {
        if (!(key in compiledAnswers)) {
          compiledAnswers[key] = value;
        }
      });

      const base = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");

      await axios.put(
        `${base}/training_enrollments/${res.id}/${status}`,
        {
          answers: compiledAnswers
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      Swal.fire({
        icon: "success",
        title: `${status}`,
        text: "Your training has been successfully submitted!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(`/enrolled-trainings`, { replace: true }); // customize route
    } catch (err) {
      console.error("Error submitting training:", err);
      showErrorAlert("Warning!",err.response.data.error)
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
    ...(training?.video_files || []).map((url) => ({
      type: "video",
      url,
    })),
  ];

  const currentQuestion = flatQuestions[currentIndex];

  if (!loading && !res && error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
      <AlertCircleIcon className="w-16 h-16 text-slate-500 mb-4" />
      <h1 className="text-2xl font-semibold text-slate-700 mb-2">Training Not Found</h1>
      <p className="text-slate-500 mb-4">{error || "Sorry, we couldn’t find what you were looking for."}</p>

      <a
        href="/enrolled-trainings"
        className="px-4 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-md transition"
      >
        Go Home
      </a>
    </div>
    );
  }

  if (loading ||!account || !res ) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Lottie animationData={loaderAnimation} loop={true} className="w-44 h-44" />
      </div>
    );
  }
  
  const attempted = Object.values(answers).filter((val) => {
    if (Array.isArray(val)) return val.length > 0;           // For MSQ
    return val !== null && val !== undefined && val !== ""; // For MCQ / theoretical
  }).length;
  const total = res.total_questions+contentItems?.length || 1; // default 1 to prevent division by 0
  const questionsCompleted = Object.entries(answers).filter(([key, val]) => {
    if (!/^\d+$/.test(key)) return false; // Only numeric question IDs
    if (Array.isArray(val)) return val.length > 0; // MSQ
    return val !== null && val !== undefined && val !== ""; // MCQ / Theoretical
  }).length;

  const readingsCompleted = Object.entries(answers).filter(([key, val]) => {
    return (key.startsWith("reading") || key.startsWith("sreading")) && val === true;
  }).length;

  const totalQuestions = res.total_questions || 1;
  const totalReadings = (contentItems?.length || 0) + (training?.training_sections?.length || 0);

  const questionProgressPercent = Math.min((questionsCompleted / totalQuestions) * 100, 100);
  const readingProgressPercent = Math.min((readingsCompleted / totalReadings) * 100, 100);
  const progressPercent = Math.min(((questionsCompleted+readingsCompleted) / (totalQuestions+totalReadings)) * 100, 100);


  const chartData = [
    { name: 'Completed', value: readingsCompleted },
    { name: 'Remaining', value: totalReadings - readingsCompleted },
  ];

  return (
      <div className="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-purple-50 flex flex-col items-center justify-evenly md:p-4">
        {/* Static Responsive Header1 */}
        <div className="w-full bg-slate-50 shadow-md fixed top-0 left-0 z-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <Link
            to="/enrolled-trainings"
            title="Discard changes and go back"
            className="hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 max-w-10 absolute top-0 sm:relative md:inline-flex items-center justify-center p-2 rounded-full bg-white/70 hover:bg-white shadow transition-all duration-200 border border-slate-200 hover:border-slate-300 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 text-center md:text-left min-w-0">
            <h2
              className="text-lg md:text-xl font-bold text-slate-800 truncate"
              title={training.title}
            >
              {/* {training.title} */}
              {training.title?.split(" ").slice(0, 10).join(" ") + (training.title?.split(" ").length > 10 ? "..." : "")}
            </h2>
          </div>

          {res.completed_at ?
           <div className="flex flex-row gap-4 justify-center">
              <Link
                to="/enrolled-trainings"
                title="Discard changes and go back"
                className="md:hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 max-w-10 inline-flex items-center justify-center px-1 rounded-full bg-white/70 hover:bg-white shadow transition-all duration-200 border border-slate-200 hover:border-slate-300 text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="flex items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-gray-500 text-white font-semibold py-1.5 px-3 md:px-4 rounded text-xs md:text-sm max-w-30"
                >
                <Lock className="w-3 h-3 mr-1" /> Completed
              </div>
            </div>
            :
            <div className="flex items-center justify-center md:justify-end gap-2">
              <div className="flex flex-row gap-0.5">
                {/* <div className="bg-indigo-600 text-white text-xs md:text-sm py-0.5 px-3 rounded-full font-semibold shadow">
                  Marks: {training.total_marks} 
                </div> */}
                <Link
                  to="/enrolled-trainings"
                  title="Discard changes and go back"
                  className="md:hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 max-w-10 inline-flex items-center justify-center px-1 rounded-full bg-white/70 hover:bg-white shadow transition-all duration-200 border border-slate-200 hover:border-slate-300 text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleSubmit(false,"save")}
                  className="flex gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold py-1.5 px-1 md:px-3 rounded text-xs md:text-sm active:scale-95 transition cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-white" /> Save Responses
                </button>
                <button
                  onClick={() => handleSubmit(false,"submit")}
                  className="flex gap-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold py-1.5 px-1 md:px-3 rounded text-xs md:text-sm active:scale-95 transition cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-white-500" />Complete Training
                </button>
              </div>
            </div>
          }
        </div>

        {/* === Main Content === */}
        <div className="lg:pt-[90px] md:pt-[0px] pt-[60px] px-4 flex flex-col lg:flex-row-reverse gap-6 mx-auto">
          {/* === Question Display Box === */}
          {activeSidebar==="status"&&<>
            <TrainingGameUI
              account={account}
              training={training}
              res={res}
              questionsCompleted={questionsCompleted}
              totalQuestions={totalQuestions}
              readingsCompleted={readingsCompleted}
              totalReadings={totalReadings}
              readingProgressPercent={readingProgressPercent}
              progressPercent={progressPercent}
              code={<TrainingPath
                training={training}
                activeSidebar={activeSidebar}
                currentSectionIndex={currentSectionIndex}
                answers={answers}
                setActiveSidebar={setActiveSidebar}
                setCurrentSectionIndex={setCurrentSectionIndex}
                setCurrentSectionContent={setCurrentSectionContent}
                setCurrentIndex={setCurrentIndex}
              />}
            />
          </>
          }
          {activeSidebar==="content"&&
          <div className="flex flex-col justify-between w-full lg:min-w-[75vw] lg:max-w-[75vw] min-w-[90vw] bg-gradient-to-br from-white via-indigo-50 to-purple-50 shadow-xl rounded-xl p-6 space-y-6 min-h-[82vh] overflow-y-auto mt-20 lg:mt-0">
            {contentItems.length > 0 && (
              <>
                <div className="space-y-2">
                  <h3 className="text-md font-semibold text-indigo-600">
                    Readings {contentIndex + 1}
                  </h3>

                  {contentItems[contentIndex].type === "html" && (
                    <div
                      className="prose max-w-full text-slate-700"
                      dangerouslySetInnerHTML={{ __html: contentItems[contentIndex].content }}
                      onMouseEnter={() => markContentAsRead(contentIndex)}
                    />
                  )}

                  {contentItems[contentIndex].type === "pdf" && (
                    <div className="flex flex-col items-center">
                      <PdfViewer
                        pdfUrl={contentItems[contentIndex].url}
                        onLoad={() => markContentAsRead(contentIndex)}
                      />
                    </div>
                  )}

                  {contentItems[contentIndex].type === "video" && (
                    <div className="w-full flex justify-center">
                      <VideoViewer 
                      key={contentItems[contentIndex].url} 
                      videoUrl={contentItems[contentIndex].url} 
                      onLoad={() => markContentAsRead(contentIndex)}/>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-">
                  <button
                    onClick={() => setContentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={contentIndex === 0}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white  font-semibold py-2 px-4 rounded disabled:opacity-100"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() =>
                      setContentIndex((prev) => Math.min(prev + 1, contentItems.length - 1))
                    }
                    disabled={contentIndex === contentItems.length - 1}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 bg-slate-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-100"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
          }
          {activeSidebar==="question"&&
          <div className="flex flex-col justify-between w-full lg:min-w-[75vw] lg:max-w-[75vw] min-w-[90vw] bg-gradient-to-br from-white via-indigo-50 to-purple-50 shadow-xl rounded-xl p-6 space-y-6 lg:min-h-[82vh] overflow-y-auto mt-20 lg:mt-0">
            {currentSectionContent?<div className="space-y-4">
              <h3 className="text-md font-semibold text-indigo-600">
                Reading
              </h3><span className="text-slate-700" onMouseEnter={() => marksectionContentAsRead(currentSectionIndex)}  dangerouslySetInnerHTML={{ __html: currentSectionContent }} /></div>:
              (currentQuestion && (
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-indigo-600">
                  Section: {currentQuestion.section_name}
                  </h3>
                  <div className="flex justify-between font-semibold text-lg text-slate-700 break-words min-h-[64px] md:min-h-[60px] lg:min-h-[66px]">
                    <div className="question-content lg:max-w-[60vw]">
                      <span className="mr-2">Q{currentIndex + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: currentQuestion.content }} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Type: {currentQuestion.question_type}</p>
                      <p className="text-sm text-slate-500">Marks: {currentQuestion.marks}</p>
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
                                  : "bg-gradient-to-br from-white via-indigo-50 to-purple-50 border-slate-300 hover:bg-slate-50"
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
                              <div className="flex flex-col sm:flex-row flex-wrap gap-1 text-sm sm:text-base text-slate-700">
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
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value,currentQuestion.question_type)}
                        className={`w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400
                          ${answers[currentQuestion.id]&&"bg-green-100 border-green-600 font-semibold"}
                          `}
                        rows={3}
                        placeholder="Type your answer here..."
                      />
                  )}
                </div>
              ))
            }

            {currentSectionContent  &&
              <div className="flex flex-wrap justify-between items-center md:gap-2">
                <button
                  onClick={
                    () => {
                      setCurrentSectionContent(null)
                      setCurrentIndex(0)
                    }
                  }
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-100 active:scale-95"
                >
                  Move to Questions
                </button>
              </div>
            }

            {/* Navigation Buttons */}
            {!currentSectionContent  && 
              <div className="flex flex-wrap justify-between items-center md:gap-2 pt-4">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-100 active:scale-95"
                >
                  Prev
                </button>
                <button
                  disabled={currentIndex === flatQuestions.length - 1}
                  onClick={() => setCurrentIndex((i) => Math.min(i + 1, flatQuestions.length - 1))}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white  font-semibold py-2 px-4 rounded active:scale-95 disabled:opacity-100 disabled:active:scale-100 disabled:hover:opacity-100"
                >
                  Next
                </button>
              </div>
            }
          </div>
          }

          {/* === Question Navigator === */}
          <div className="sticky top-[102px] lg:min-w-0 lg:max-w-[17vw] min-w-[90vw] w-full max-w-md bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-2xl shadow-2xl p-5 flex flex-col justify-between lg:min-h-[70vh] max-h-[300px] lg:max-h-[82vh]">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-gray-500 pb-3 justify-center">
              <ListCheckIcon className="h-6 w-6 text-indigo-700" />
              <h2 className="text-md font-bold text-indigo-700">Training Navigator</h2>
            </div>
            {/* Palette */}
            <div className="mt-2 pt-1 flex-1 overflow-y-auto px-1 space-y-2 max-h-[300px] lg:max-h-[80vh]">
              <div  className="rounded-lg overflow-hidden border border-slate-300">
                <div
                  onClick={() => {
                    setActiveSidebar("status");
                    setCurrentSectionIndex(-1);
                  }}
                  className={`flex flex-col justify-between items-center cursor-pointer px-5 py-2 transition-colors bg-gradient-to-r hover:from-indigo-600 hover:via-purple-500 hover:to-gray-600" ${
                    activeSidebar==="status" ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-gray-500" : "bg-gray-300"
                  }`}
                >
                  <h2 className="text-xs font-semibold text-slate-800 flex">
                    <span>Training Status</span>
                  </h2>
                </div>
              </div>
              <div  className="rounded-lg overflow-hidden border border-slate-300">
                {/* Section Header */}
                <div
                  onClick={() => {
                    setActiveSidebar("content");
                    setCurrentSectionIndex(-1);
                  }}
                  className={`flex flex-col justify-between items-center cursor-pointer px-2 py-2 transition-colors bg-gradient-to-r hover:from-indigo-600 hover:via-purple-500 hover:to-gray-600" ${
                    activeSidebar==="content" ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-gray-500" : "bg-gray-300"
                  }`}
                >
                  <h2 className="text-xs font-semibold text-slate-800 flex">
                    <span>Training Main Content</span>
                  </h2>
                </div>

                {/* Show Questions only if this section is active */}
                {activeSidebar === "content" && (
                  <div className="flex flex-wrap justify-center gap-1 py-2 px-2 bg-gradient-to-br from-white via-indigo-50 to-purple-50 transition-all duration-300">
                    {contentItems.map((item, idx) => {
                      const isCurrent = idx === contentIndex;
                      const isRead = answers[`reading${idx + 1}`] === true;

                      // Determine colors
                      let circleColor = "bg-violet-600";
                      let borderColor = "border-violet-600";

                      if (isRead) {
                        circleColor = "bg-green-500";
                        borderColor = "border-green-500";
                      }

                      return (
                        <div key={idx} className="flex flex-col items-center space-y-0.5">
                          <button
                            onClick={() => setContentIndex(idx)}
                            className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4
                              ${circleColor} ${borderColor} active:scale-95 transition-transform`}
                          >
                            {idx + 1}
                          </button>
                          <div className={`w-6 h-1 rounded-full ${isCurrent ? "bg-amber-400" : "bg-transparent"}`}></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {training.training_sections.map((section, sectionIdx) => {
                const isActiveSection=sectionIdx === currentSectionIndex;

                return (
                  <div key={section.id} className="rounded-lg overflow-hidden border border-slate-300">
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
                      className={`flex flex-col justify-between items-center cursor-pointer px-3 py-2 transition-colors  bg-gradient-to-r hover:from-indigo-600 hover:via-purple-500 hover:to-gray-600" ${
                        isActiveSection ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-gray-500" : "bg-gray-300"
                      }`}
                    >
                      <h2 className="text-xs font-semibold text-slate-800" title={section.name}>
                        {section.name.length > 30 ? section.name.slice(0, 30) + "..." : section.name}
                      </h2>
                    </div>

                    {/* Show Questions only if this section is active */}
                    {isActiveSection && (
                      <div className="flex flex-wrap justify-center gap-1 py-2 px-2 bg-gradient-to-br from-white via-indigo-50 to-purple-50 transition-all duration-300">
                        <div className="flex flex-col items-center space-y-0.5">
                          {(() => {
                            const isReadSection = answers[`sreading${sectionIdx + 1}`] === true;
                            const contentCircleColor = isReadSection ? "bg-green-500" : "bg-violet-600";
                            const contentBorderColor = isReadSection ? "border-green-500" : "border-violet-600";

                            return (
                              <>
                                <button
                                  onClick={() => {
                                    const currentSection = training?.training_sections?.[sectionIdx];
                                    const currentSecContent = currentSection?.content_html || '';
                                    setCurrentSectionContent(currentSecContent);
                                    setCurrentIndex(-1);
                                  }}
                                  className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 ${contentCircleColor} ${contentBorderColor} active:scale-95 transition-transform`}
                                >
                                  <BookOpen/>
                                </button>
                                <div className={`w-6 h-1 rounded-full ${currentSectionContent ? "bg-amber-400" : "bg-transparent"}`}></div>
                              </>
                            );
                          })()}
                        </div>
                        {section.training_questions?.map((q, idx) => {
                          const globalIndex = training.training_sections
                            .slice(0, sectionIdx)
                            .reduce((acc, sec) => acc + sec.training_questions.length, 0) + idx;

                          let circleColor = "bg-violet-600";
                          let borderColor = "border-violet-600";

                          if (answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "" && answers[q.id].length) {
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
                                onClick={() => {
                                  handleQuestionClick(idx)
                                  setCurrentSectionContent(null)
                                }}
                                className={`w-7 h-7 rounded-full font-semibold text-sm flex items-center justify-center text-white border-4 ${circleColor} ${borderColor} active:scale-95 transition-transform`}
                              >
                                {idx + 1}
                              </button>
                              <div className={`w-6 h-1 rounded-full ${!currentSectionContent && isCurrent ? "bg-amber-400" : "bg-transparent"}`}></div>
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
            <div className="mt-2 border-t border-gray-500 pt-2">
              <h3 className="text-sm font-semibold text-center text-gray-600 mb-2">Instructions</h3>
              <div className="flex flex-wrap gap-4 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500"></div>
                  <span>Answered / Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-violet-600"></div>
                  <span>Not Answered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TrainingAttempt;

function FancyProgressBar({ progressPercent, profileImg, user }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 100);
    return () => clearTimeout(timeout);
  }, [progressPercent]);

  return (
    <div className="relative w-full h-28 flex items-end justify-center">
      {/* Progress Bar Background */}
      <div className="relative w-full bg-gradient-to-r from-gray-100 via-white to-gray-200 h-5 rounded-full shadow-inner overflow-hidden backdrop-blur-sm border border-purple-200">
        {/* Animated Progress Fill */}
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-sky-300 to-gray-500 transition-all duration-700 ease-in-out rounded-full shadow-md"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      {/* Floating Avatar with Bounce and Glow */}
      <div
        className="absolute flex flex-col items-center bottom-[1.7rem] z-20 transition-all duration-700 ease-in-out"
        style={{ left: `calc(${animatedProgress}% - 24px)` }}
      >
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 shadow-lg bg-gradient-to-br from-white via-gray-100 to-gray-200 border-indigo-400 flex items-center justify-center transition-transform duration-300 hover:scale-105 ring-2 ring-indigo-300 ring-offset-2 ring-offset-white">
          <ProfileAvatar profileImg={profileImg} user={user} />

          {/* Ping Animation */}
          <span className="absolute inset-0 rounded-full border-2 border-indigo-300 opacity-30"></span>

          {/* Down Arrow */}
          <div className="absolute -bottom-4 text-indigo-500 animate-bounce-slow">
            <ChevronDown className="w-5 h-5 sm:w-4 sm:h-4 drop-shadow" />
          </div>
        </div>

        {/* Label */}
        <div className="mt-2 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold shadow">
          You're Here
        </div>
      </div>
    </div>
  );
}

function ProfileAvatar({ profileImg, user }) {
  const [imageError, setImageError] = useState(false);

  const showFallback = imageError || !profileImg;

  return showFallback ? (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
      {'You'}
    </div>
  ) : (
    <img
      src={profileImg}
      alt="Profile"
      className="object-cover rounded-full shadow-md"
      onError={() => setImageError(true)}
    />
  );
}

function CountUp({ target,speed=200,restartKey }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 30);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [target,restartKey]);

  return <span>{count}</span>;
}

const TrainingGameUI = ({
  account,
  training,
  res,
  questionsCompleted,
  totalQuestions,
  readingsCompleted,
  totalReadings,
  readingProgressPercent,
  progressPercent,
  code
}) => {
  const userInitial = account.user?.first_name?.charAt(0).toUpperCase() || 'U';

  const [showConfetti, setShowConfetti] = useState(false);
  const [audio] = useState(
    new Howl({
      src: ["/sounds/progress-pop.mp3"], // Place this in public/sounds
      volume: 0.5
    })
  );
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (progressPercent >= 100 || readingProgressPercent >= 100) {
      setShowConfetti(true);
      audio.play();
      setTimeout(() => setShowConfetti(false), 6000);
    }
  }, [progressPercent, readingProgressPercent]);

    function formatDateTime(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy • h:mm a');
  }

  function getTrainingEndTime(startedAt, durationHours) {
    if (!startedAt || !durationHours) return '—';
    const end = new Date(new Date(startedAt).getTime() + durationHours * 60 * 60000); // convert hours to milliseconds
    return format(end, 'MMM d, yyyy • h:mm a');
  }

  return (
      <div
        className="flex flex-col items-center justify-start bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#1e3c72] p-4 text-white font-sans w-full lg:min-w-[75vw] lg:max-w-[75vw] min-w-[90vw] shadow-2xl rounded-2xl space-y-4 min-h-[82vh] overflow-y-auto mt-20 lg:mt-0 transition-all duration-300"
        style={{ fontFamily: "'Baloo 2', cursive" }}
      >
        <div className="">
          {showConfetti && <Confetti className="lg:min-w-[40vw] lg:max-w-[65vw] min-w-[60vw]" recycle={false} numberOfPieces={100} />}
        </div>
        {/* Header */}
        <motion.div
          className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-10 mb-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          <div className="w-full flex-col md:flex-row justify-between items-center gap-10 mb-6 flex flex-1 text-left  bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-3xl shadow-xl pt-4 px-8 sm:p-8  max-w-6xl space-y-4">
            <motion.div
              className="flex-1 text-left space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >

              <div className="text-center sm:text-left space-y-1 sm:space-y-2">
                <div className="text-3xl text-orange-500 font-bold leading-snug">
                  Hi {account.user?.first_name}, welcome to your training!
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-700 drop-shadow-sm">
                  {training.title}
                </h1>
                {training.description && (
                  <p className="text-sm sm:text-base font-medium text-slate-700 max-w-xl">
                    {training.description}
                  </p>
                )}
                  <p className="text-sm text-slate-700">
                    {training.duration} hrs •{" "}
                    {res.completed_at ? (
                      <span className="text-green-600">Completed</span>
                    ) : (
                      <span className="text-orange-500 inline-flex items-center">
                        In Progress
                        <Lottie
                          animationData={loaderAnimation}
                          loop
                          className="w-10 h-8"
                        />
                      </span>
                    )}
                  </p>
              </div>

            </motion.div>

            {/* Right Side: Character / Profile Image */}
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >

              <div className="flex justify-center sm:justify-start">
                {account.user?.profile_picture_url ? (
                  <img
                    // src={account.user.profile_picture_url}
                    src="/training/boy.png"
                    className="w-full max-w-sm drop-shadow-xl"
                    alt="Profile"
                  />
                ) : (
                  <img
                    src="/training/boy.png"
                    className="w-full max-w-sm drop-shadow-xl"
                    alt="Profile"
                  />
                )}
              </div>

            </motion.div>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-3xl shadow-xl p-8 w-full max-w-6xl space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <motion.div
              className="relative rounded-2xl p-0.5 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => setRestartKey(prev => prev + 1)}
            >
              <div className="bg-black bg-opacity-30 rounded-2xl p-6 flex flex-col items-center -translate-y-1 will-change-transform transition-all duration-300 ease-in-out">
                <AnimatedProgressBar
                  targetPercent={readingProgressPercent}
                  color="#38bdf8"
                  label="Reading Progress"
                  restartKey={restartKey}
                />
              </div>
            </motion.div>

            <motion.div
              className="relative rounded-2xl p-0.5 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => setRestartKey(prev => prev + 1)}
            >
              <div className="bg-black bg-opacity-30 rounded-2xl p-6 flex flex-col items-center -translate-y-1 will-change-transform transition-all duration-300 ease-in-out">
                <AnimatedProgressBar
                  targetPercent={progressPercent}
                  color="#facc15"
                  label="Overall Progress"
                  restartKey={restartKey}
                />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" onMouseEnter={() => setRestartKey(prev => prev + 1)}>
            <StatCard
              icon={<Trophy />} 
              title="Questions" 
              value={
                <span>
                  <CountUp target={questionsCompleted} restartKey={restartKey}/> / {totalQuestions}
                </span>
              }
              color="from-green-400 to-green-600"
             />
            <StatCard 
              icon={<BookOpen />} 
              title="Readings" 
              value={
                <span>
                  <CountUp target={readingsCompleted} restartKey={restartKey}/> / {totalReadings}
                </span>
              }
              color="from-sky-400 to-blue-600" 
            />
            <StatCard 
              icon={<Clock />} 
              title="Duration" 
              value={`${training.duration} hrs`} 
              color="from-rose-400 to-pink-600" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6" onMouseEnter={() => setRestartKey(prev => prev + 1)}>
            <StatCard
              icon={<ClockArrowUp className="w-6 h-6" />}
              title="Started At"
              value={formatDateTime(res.started_at)}
              color="from-indigo-400 to-indigo-600"
            />

            {res.completed_at ? (
              <StatCard
                icon={<ClockArrowDown className="w-6 h-6" />}
                title="Completed On"
                value={formatDateTime(res.completed_at)}
                color="from-emerald-400 to-emerald-600"
              />
            ) : (
              <StatCard
                icon={<CalendarClock className="w-6 h-6" />}
                title="Ends At"
                value={getTrainingEndTime(res.started_at, training.duration)}
                color="from-rose-400 to-rose-600"
              />
            )}

            {res.completed_at && (
              <StatCard
                icon={<Trophy className="w-6 h-6" />}
                title="Marks"
                value={
                  <span>
                    <CountUp target={res.score} restartKey={restartKey}/> / {res.marks}
                  </span>
                }
                color="from-yellow-400 to-yellow-600"
              />
            )}
          </div>

          <FancyProgressBar progressPercent={progressPercent} profileImg={account.user.profile_picture_url} user={account.user} />

          <div className="flex justify-center">{code}  </div>
        </motion.div>
      </div>
  );
};

// const StatCard = ({ icon, title, value, color }) => (
//   <motion.div
//     className={`rounded-2xl p-4 text-white font-semibold shadow-xl bg-gradient-to-br ${color} flex items-center gap-4`}
//     whileHover={{ scale: 1.05 }}
//   >
//     <div className="w-12 h-12 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
//       {icon}
//     </div>
//     <div>
//       <div className="text-sm uppercase tracking-wide">{title}</div>
//       <div className="text-sm font-bold">{value}</div>
//     </div>
//   </motion.div>
// );
const StatCard = ({ icon, title, value, color }) => (
  <motion.div
    className="relative rounded-2xl bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#1e3c72] p-0.5 shadow-[0_0_25px_rgba(0,0,0,0.1)]"
    whileHover={{ scale: 1.05 }}
  >
    {/* Inner lifted card */}
    <div
      className={`rounded-2xl p-4 text-white font-semibold flex items-center gap-4 bg-gradient-to-br ${color} -translate-y-1 will-change-transform transition-all duration-300 ease-in-out`}
    >
      <div className="w-12 h-12 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm uppercase tracking-wide">{title}</div>
        <div className="text-sm font-bold">{value}</div>
      </div>
    </div>
  </motion.div>
);

function AnimatedProgressBar({ targetPercent, color = '#38bdf8', label = 'Reading Progress', restartKey }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let current = 0;

    const step = 4;
    const intervalUp = setInterval(() => {
      current += step;
      if (current >= 100) {
        current = 100;
        clearInterval(intervalUp);

        const intervalDown = setInterval(() => {
          current -= 2;
          if (current <= targetPercent) {
            setAnimatedValue(targetPercent);
            clearInterval(intervalDown);
          } else {
            setAnimatedValue(current);
          }
        }, 20);
      }
      setAnimatedValue(current);
    }, 15);

    return () => clearInterval(intervalUp);
  }, [targetPercent, restartKey]);

  return (
    <CircularProgressbarWithChildren
      value={animatedValue}
      styles={buildStyles({
        pathColor: color,
        trailColor: '#1e293b',
        strokeLinecap: 'round',
      })}
      className="w-36 h-36"
    >
      <div className="text-center text-xl font-bold" style={{ color }}>
        {Math.round(animatedValue)}%
      </div>
      <div className="text-xs text-slate-300">{label}</div>
    </CircularProgressbarWithChildren>
  );
}

const TrainingPath = ({
  training,
  currentSectionIndex,
  activeSidebar,
  answers,
  setActiveSidebar,
  setCurrentSectionIndex,
  setCurrentSectionContent,
  setCurrentIndex
}) => {
  const sections = training?.training_sections || [];

  const pathNodes = [
    {
      id: "main-content",
      label: "Main Content",
      icon: <BookOpen className="w-5 h-5" />,
      completed: Object.keys(answers || {}).some(k => k.startsWith("reading")),
      onClick: () => {
        setActiveSidebar("content");
        setCurrentSectionIndex(-1);
      },
      active: activeSidebar === "content",
    },
    ...sections.map((section, idx) => {
      const isRead = answers?.[`sreading${idx + 1}`] === true;

      return {
        id: `section-${idx}`,
        label: section.name,
        icon: <Trophy className="w-5 h-5" />,
        completed: isRead,
        onClick: () => {
          setActiveSidebar("question");
          setCurrentSectionIndex(idx);
          setCurrentIndex(-1);
          setCurrentSectionContent(section.content_html || "");
        },
        active: currentSectionIndex === idx,
      };
    }),
  ];

  return (
    <div className="relative flex items-center space-x-8 sm:space-x-10 overflow-x-auto py-8 px-">
      {pathNodes.map((node, idx) => (
        <motion.div
          key={node.id}
          className={clsx(
            "relative flex flex-col items-center",
            node.active && "z-10"
          )}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          {/* Horizontal Line Connector */}
          {idx > 0 && (
            <div className="absolute -left-8 sm:-left-10 top-1/3 transform -translate-y-1/2 w-8 sm:w-10 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full" />
          )}

          {/* Node Button */}
          <button
            onClick={node.onClick}
            className={clsx(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center border-4 transition-all duration-300",
              node.completed ? "bg-green-500 border-green-400" : "bg-violet-500 border-violet-400",
              node.active && "scale-110 ring-4 ring-yellow-300 animate-bounce-slow"
            )}
          >
            {node.icon}
          </button>

          {/* Label Below */}
          <div  className="text-[10px] sm:text-xs mt-2 text-center text-gray-700 font-semibold max-w-[100px] truncate">
            {node.label.length > 20 ? node.label.slice(0, 18) + "..." : node.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

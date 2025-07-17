import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { showErrorAlert } from "../utils/sweetAlert";
import {  FaTrash, FaInfoCircle } from 'react-icons/fa';
import TestSidebarMain from "../components/TestSidebarMain";
import QuestionEditor from '../components/QuestionEditor';
import ChatWidget from "../components/ChatWidget";
import Joyride from 'react-joyride';
import NewTestHeader from "../components/NewTestHeader";
import Swal from "sweetalert2";
import { LoaderCircle } from 'lucide-react';
import RichEditor from "../components/RichEditor";
import { FileText, X } from 'lucide-react';

export default function NewTraining() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link_expires_date, setlink_expires_date] = useState("");
  const [duration, setDuration] = useState("");
  const [webcamRequired, setWebcamRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Section Management
  const [sections, setSections] = useState([]); // [{id, name}]
  const [sectionQuestions, setSectionQuestions] = useState({}); // {sectionId: [questions]}
  const [activeSidebar, setActiveSidebar] = useState('details'); // 'details' or section.id
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDuration, setNewSectionDuration] = useState(null);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const scrollContainerRef = useRef(null);
  const questionRefs = useRef([]);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [sidebaropen, setSidebarOpen] = useState(false);
  const [testStatus, setTestStatus] = useState("pending");
  const tpuser = JSON.parse(localStorage.getItem("tpuser")) || { user: { subscription: false } };

  //for training
  const [contentHtml, setContentHtml] = useState("");
  const [code, setCode] = useState("");
  const [allowRetries, setAllowRetries] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [pdfFiles, setPdfFiles] = useState([]);
  const navigate = useNavigate();
  const [localSectionContentHtml, setLocalSectionContentHtml] = useState("");
  const [videoFiles, setVideoFiles] = useState([]);

  useEffect(() => {
    const current = sections.find(sec => sec.id === activeSidebar);
    if (current) {
      setLocalSectionContentHtml(current.content_html || "");
    }
  }, [activeSidebar, sections]);

  const handleSidebarChange = (newSidebarId) => {
    // Save the current section's content before switching
    setSections(prev =>
      prev.map(sec =>
        sec.id === activeSidebar
          ? { ...sec, content_html: localSectionContentHtml }
          : sec
      )
    );
    // Now change the sidebar
    setActiveSidebar(newSidebarId);
  };

  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setPdfFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Remove section
  const handleRemoveSection = (sectionId) => {
    const updatedSections = sections.filter(s => s.id !== sectionId);
    setSections(updatedSections);

    setSectionQuestions(prev => {
      const q = { ...prev };
      delete q[sectionId];
      return q;
    });

    if (activeSidebar === sectionId) setActiveSidebar('details');

    const totalDuration = updatedSections.reduce((acc, section) => {
      return acc + parseInt(section.duration || 0, 10);
    }, 0);
    setDuration(totalDuration.toString());
  };

  // Add question to a section
  const handleAddQuestion = (sectionId) => {
    setSectionQuestions(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        {
          id: Date.now(),
          content: "",
          question_type: "MCQ",
          option_1: "",
          option_2: "",
          option_3: "",
          option_4: "",
          correct_answer: "",
          marks: "",
          tags: "",
          validation:false
        }
      ]
    }));
    setTimeout(() => {
      const newQuestionIndex = sectionQuestions[sectionId].length - 1;
      scrollToQuestion(newQuestionIndex+1); // Pass index of newly added question
    }, 100);
  };

  const handleQuestionChange = (sectionId, qIdx, field, value) => {
    setSectionQuestions(prev => {
      const updatedQuestions = prev[sectionId].map((q, idx) => {
        if (idx !== qIdx) return q;

        // Apply the updated field
        const updatedQuestion = { ...q, [field]: value };

        // Inline validation logic
        const isContentValid = updatedQuestion.content?.trim();
        const isTypeValid = !!updatedQuestion.question_type;
        const isMarksValid = !!updatedQuestion.marks;

        let isOptionsValid = true;
        let isCorrectAnswerValid = true;

        if (updatedQuestion.question_type !== 'theoretical') {
          isOptionsValid =
            updatedQuestion.option_1?.trim() &&
            updatedQuestion.option_2?.trim() &&
            updatedQuestion.option_3?.trim() &&
            updatedQuestion.option_4?.trim();

          isCorrectAnswerValid = !!updatedQuestion.correct_answer;
        }

        const isValid =
          isContentValid &&
          isTypeValid &&
          isMarksValid &&
          isOptionsValid &&
          isCorrectAnswerValid;

        return { ...updatedQuestion, validation: isValid };
      });

      return {
        ...prev,
        [sectionId]: updatedQuestions
      };
    });
  };

  // Remove question from a section
  const handleRemoveQuestion = (sectionId, qIdx) => {
    setSectionQuestions(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].filter((_, idx) => idx !== qIdx)
    }));
  };

  // Save/Create Test (status: draft or published)
  const handleSubmit = async (status = 'published') => {
  // ✅ Always validate basic test info

    const missingFields = [];

    if (!title.trim()) missingFields.push('Title');
    if (!description.trim()) missingFields.push('Description');
    if (!contentHtml.trim()) missingFields.push('Content');
    if (!duration) missingFields.push('Duration');

    if (missingFields.length > 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Test Info',
        text: `Please fill in the following: ${missingFields.join(', ')}.`,
      });
    }

    // ✅ If publishing, enforce full validation
    if (status === 'published') {
        if (!tpuser.user.subscription) {
          Swal.fire({
            icon: 'warning',
            title: 'Subscription Required',
            text: 'You need an active subscription to publish a test.',
            confirmButtonText: 'Save as draft and view plans'
          }).then((result) => {
            if (result.isConfirmed) {
              handleSubmit("draft")
            }
          });
          return; // Stop further execution
        }

      if (sections.length === 0) {
        return Swal.fire({
          icon: 'warning',
          title: 'No Sections',
          text: 'Please add at least one section before publishing.',
        });
      }

      for (const section of sections) {
        if (!section.name.trim()) {
          return Swal.fire({
            icon: 'warning',
            title: 'Incomplete Section',
            text: 'Each section must have a name .',
          });
        }

        const questions = sectionQuestions[section.id] || [];
        if (questions.length === 0) {
          return Swal.fire({
            icon: 'warning',
            title: 'No Questions',
            text: `Section "${section.name}" has no questions.`,
          });
        }

        for (const question of questions) {
          const missingFields = [];

          if (!question.content?.trim()) missingFields.push('content');
          if (!question.question_type) missingFields.push('question type');
          if (!question.marks) missingFields.push('marks');

          if (missingFields.length > 0) {
            return Swal.fire({
              icon: 'warning',
              title: 'Incomplete Question',
              text: `Question in section "${section.name}" is missing the following: ${missingFields.join(', ')}.`,
            });
          }

          if (question.question_type !== 'theoretical') {
            const missingOptions = [];

            if (!question.option_1?.trim()) missingOptions.push('Option 1');
            if (!question.option_2?.trim()) missingOptions.push('Option 2');
            if (!question.option_3?.trim()) missingOptions.push('Option 3');
            if (!question.option_4?.trim()) missingOptions.push('Option 4');
            if (!question.correct_answer) missingOptions.push('Correct answer');

            if (missingOptions.length > 0) {
              return Swal.fire({
                icon: 'warning',
                title: 'Incomplete MCQ/MSQ Question',
                text: `Question in section "${section.name}" is missing the following: ${missingOptions.join(', ')}.`,
              });
            }
          }
        }

      }
    }

    let totalMarks = 0;
    sections.forEach(section => {
      const questions = sectionQuestions[section.id] || [];
      questions.forEach(q => {
        const marks = parseFloat(q.marks);
        if (!isNaN(marks)) totalMarks += marks;
      });
    });

    // ✅ Proceed with submission if validation passes
    setSaving(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_BASE_URL;
      const formData = new FormData();

      formData.append("training[title]", title);
      formData.append("training[description]", description);
      formData.append("training[content_html]", contentHtml);
      formData.append("training[duration]", duration);
      formData.append("training[status]", status);
      formData.append("training[link_expires_date]", link_expires_date);
      pdfFiles.forEach((file, idx) => {
        formData.append(`training[pdf_files][]`, file);
      });
      videoFiles.forEach((file, idx) => {
        formData.append(`training[video_files][]`, file);
      });

      let sectionIndex = 0;
      let questionIndex = 0;

      sections.forEach(section => {
        formData.append(`training[training_sections_attributes][${sectionIndex}][name]`, section.name);
        formData.append(`training[training_sections_attributes][${sectionIndex}][content_html]`, section.content_html);

        (sectionQuestions[section.id] || []).forEach(question => {
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][content]`, question.content);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][question_type]`, question.question_type);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][option_1]`, question.option_1);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][option_2]`, question.option_2);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][option_3]`, question.option_3);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][option_4]`, question.option_4);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][correct_answer]`, question.correct_answer?.toUpperCase() || "");
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][marks]`, question.marks);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][tags]`, question.tags);
          questionIndex++;
        });

        sectionIndex++;
        questionIndex = 0;
      });

      const response = await axios.post(`${base}/trainings`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (status === 'published') {
        Swal.fire({ icon: 'success', title: 'Published!', text: 'Your test has been published.', timer: 1500, showConfirmButton: false });
        navigate('/my-trainings');
      } else {
        Swal.fire({ icon: 'success', title: `Saved as ${status}!. ${!tpuser.user.subscription&&"To publish your test, please buy a plan."}`, text: 'Your changes have been saved.', timer: tpuser.user.subscription?1500:5000, showConfirmButton: !tpuser.user.subscription });
      }

      if (!tpuser.user.subscription) {
        navigate('/subscribe')
      }
      else{
        navigate('/my-trainings');
      }
    } catch (err) {
      showErrorAlert("Oops!", err.response?.data?.errors?.[0] || "Failed to save test.");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleSubmit2 = async (e) => {

    try {
      
      const response = await axios.post(`${base}/api/v1/trainings`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      Swal.fire({ icon: 'success', title: 'Training Created!', text: 'Your training has been created.', timer: 1500, showConfirmButton: false });
      navigate('/trainings');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.errors?.[0] || "Failed to create training." });
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const visibleIndex = Number(visibleEntries[0].target.dataset.index);
          setCurrentScrollIndex(visibleIndex);
        }
      },
      { root: null, threshold: 0.5 }
    );

    questionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [activeSidebar,sectionQuestions]);
  
  const scrollToQuestion = (index) => {
    const ref = questionRefs.current[index];
    if (ref && ref.scrollIntoView) {
      ref.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setCurrentScrollIndex(index);
    }
  };

  // Main content area
  const renderMainContent = () => {
    if (activeSidebar === 'details') {
      return (
        <div className="shadow-2xl p-6 ml-10 sm:ml-20 lg:ml-80 mt-18 h-[calc(100vh-80px)] w-[calc(100vw-50px)] sm:w-[calc(100vw-100px)] max-w-4xl lg:w-[calc(100vw-350px)] overflow-y-auto bg-gray-50 rounded-2xl ">
          <div className="mb-6" data-tour-id="test-details">
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); }}>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-0">Title<span className="text-red-600">*</span></label>
                <div className="text-sm text-gray-500 text-right">{250 - title.length} characters left</div>
                <input className="w-full rounded-md border-2 border-gray-300 bg-white px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out" value={title} onChange={e => setTitle(e.target.value)} required maxLength={250}/>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">Description</label>
                <div className="text-sm text-gray-500 text-right">{250 - description.length} characters left</div>
                <textarea className="w-full rounded-md border-2 border-gray-300 bg-white px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out" value={description} onChange={e => setDescription(e.target.value)} rows={1} maxLength={250}/>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Content <span className="text-red-500">*</span></label>
                <RichEditor value={contentHtml} onChange={setContentHtml} placeholder="Enter training content..." />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">PDF Files (optional)</label>

                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-blue-500 bg-white rounded-lg p-4 text-center cursor-pointer transition-colors"
                >
                  <p className="text-sm text-gray-600">Click or drag and drop PDFs here</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* File List */}
                {pdfFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {pdfFiles.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-sm bg-gray-100 px-3 py-2 rounded-md shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span>{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(idx)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6">
                  <label className="block text-base font-semibold text-gray-700 mb-2">Video Files (optional)</label>
                  <VideoUploader videoFiles={videoFiles} setVideoFiles={setVideoFiles}/>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
                  <div>
                    <label className="block text-base font-semibold text-gray-700">Duration (in hours) <span className="text-red-500">*</span></label>
                    <input className="w-full mt-2 rounded-md border-2 border-gray-300 bg-white px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out" type="number" value={duration} 
                      placeholder="max 6000"
                      onChange={(e) => {
                          const value = e.target.value;
                          if (value <= 6000) {
                            setDuration(value)
                          }
                        }}
                    required />
                  </div>
                  <div>
                    <div>
                      <label className="block text-base font-semibold text-gray-700">Training Expiry Date</label>
                      <input
                        type="date"
                        className="w-full mt-2 rounded-md border-2 border-gray-300 bg-white px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                        value={link_expires_date}
                        onChange={e => setlink_expires_date(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    }
    // Section questions
    const section = sections.find(s => s.id === activeSidebar);
    if (!section) return null;

    const handleNextScroll = () => {
      const refs = questionRefs.current;
      if (refs[currentScrollIndex + 1]) {
        refs[currentScrollIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentScrollIndex(currentScrollIndex + 1);
      }
    };

    const handleNext = () => {
      const nextIndex = currentScrollIndex + 1;
      if (nextIndex < (sectionQuestions[section.id]?.length || 0)) {
        scrollToQuestion(nextIndex);
      }
    };

    const handlePrev = () => {
      const prevIndex = currentScrollIndex - 1;
      if (prevIndex >= 0) {
        scrollToQuestion(prevIndex);
      }
    };

    return (
      <div className="z-0 fixed shadow-2xl px-4 py-2 lg:ml-80 ml-10 sm:ml-20 mt-18 min-h-[calc(100vh-80px)] w-[calc(100vw-50px)] sm:w-[calc(100vw-100px)] lg:w-[calc(100vw-350px)] bg-gray-50 rounded-2xl flex flex-col">
        
        {/* Header and Buttons */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <h2 className="text-xs sm:text-xl font-bold text-gray-600 truncate">
            Content and Questions for Section: {section.name}
          </h2>
          <div className="flex gap-2 items-center">
            {/* Add Question Button */}
            <button
              type="button"
              onClick={() => handleAddQuestion(section.id)}
              className="text-xs bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white px-3 py-1.5 md:text-sm rounded-lg font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              data-tour-id="add-question"
            >
              <svg className="hidden sm:block w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Add <span className="hidden sm:block">Question </span>
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              disabled={currentScrollIndex === 0}
              className={`text-xs px-3 py-1.5 sm:text-sm rounded-lg font-semibold flex items-center gap-1 transition-all duration-200 shadow-md hover:shadow-lg ${
                currentScrollIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 hover:scale-[1.03] active:scale-[0.97]'
              }`}
            >
              <svg className="hidden sm:block w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextScroll}
              className="text-xs bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 text-white px-3 py-1.5 sm:text-sm rounded-lg font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              Next
              <svg className="hidden sm:block w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>


        </div>

        {/* Scrollable QuestionEditor Container */}
        <div
          className="space-y-8 overflow-y-auto pr-2"
          style={{ maxHeight: 'calc(100vh - 170px)' }}
          ref={scrollContainerRef}
        >
          <div
            onBlur={() => {
                setSections(prev =>
                  prev.map(sec =>
                    sec.id === activeSidebar
                      ? { ...sec, content_html: localSectionContentHtml }
                      : sec
                  )
                );
              }}
          >
            <label className="block text-base font-semibold text-gray-700 mb-2">Content <span className="text-red-500">*</span></label>
            <RichEditor 
              value={localSectionContentHtml}
              onChange={(value) => {
                setLocalSectionContentHtml(value);
              }}
              placeholder="Enter training section content..." 
            />
          </div>
          {(sectionQuestions[section.id] || []).map((q, idx) => (
            // <div key={q.id || idx} ref={(el) => (questionRefs.current[idx] = el)}>
            <div
              key={q.id || idx}
              ref={(el) => (questionRefs.current[idx] = el)}
              data-index={idx}
              className="min-w-full md:w-[calc(100vw-480px)] snap-start"
            >
              <QuestionEditor
                question={q}
                idx={idx}
                sectionId={section.id}
                onChange={handleQuestionChange}
                onRemove={handleRemoveQuestion}
                saving={saving}
              />
            </div>
          ))}
          <div className="fixed bottom-4 right-20 bg-gray-100 p-1 rounded shadow">
            Viewing: Question {currentScrollIndex + 1}
          </div>
        </div>

      </div>
      );

  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <LoaderCircle className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NewTestHeader 
        title={title} 
        description={description} 
        duration={duration}
        handleSubmit={handleSubmit}
        saving={saving}
        sidebaropen={sidebaropen}
        setSidebarOpen={setSidebarOpen}
        testStatus="draft"
        to="/my-trainings"
        from="training"
        />
      <TestSidebarMain 
        heading="Training Details"
        sections={sections.filter(section => !section._destroy)}
        activeSidebar={activeSidebar}
        setActiveSidebar={handleSidebarChange}
        newSectionName={newSectionName}
        newSectionDuration={newSectionDuration}
        setNewSectionName={setNewSectionName}
        setNewSectionDuration={setNewSectionDuration}
        handleRemoveSection={handleRemoveSection}
        showSectionModal={showSectionModal}
        setShowSectionModal={setShowSectionModal}
        sectionQuestions={sectionQuestions}
        currentScrollIndex={currentScrollIndex}
        scrollToQuestion={scrollToQuestion}
        sidebaropen={sidebaropen}
        setSidebarOpen={setSidebarOpen}
      />
      {renderMainContent()}

      {showSectionModal && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Manage Sections</h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {sections.map((section, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg flex gap-2 items-start relative">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                    <input
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter section name"
                      value={section.name}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[index].name = e.target.value;
                        setSections(updated);
                      }}
                      maxLength={250}
                    />
                  </div>
                  {/* <div className="w-40">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (in days)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="max 600"
                      value={section.duration}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value <= 600) {
                          const updated = [...sections];
                          updated[index].duration = value;
                          setSections(updated);
                        }
                      }}
                    />
                  </div> */}
                  <span
                    className="ml-2 text-red-600 hover:text-red-400"
                    title="Remove section"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSection(section.id);
                    }}
                  >
                    <FaTrash />
                  </span>
                </div>
              ))}

              <button
                onClick={() =>
                  setSections([
                    ...sections,
                    { id: Date.now().toString() + Math.random().toString(36).substring(2, 6), name: '', duration: '', content_html: '' } // 🧠 Add unique ID
                  ])
                }
                className="text-blue-600 text-sm hover:underline"
              >
                + Add More Section
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => {
                  const hasInvalid = sections.some(
                    section => !section.name.trim()
                  );

                  if (hasInvalid) {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Missing Info',
                      text: 'Please fill in all section names before proceeding.',
                    });
                    return;
                  }

                  // ✅ Calculate total test duration from all section durations
                  // const totalDuration = sections.reduce((acc, section) => {
                  //   return acc + parseInt(section.duration || 0, 10);
                  // }, 0);

                  //setDuration(totalDuration.toString()); // assuming duration is string, adjust if needed
                  setActiveSidebar(sections[sections.length - 1].id);
                  setShowSectionModal(false);
                }}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// import { useRef, useState } from 'react';
import { FileVideo } from 'lucide-react';

function VideoUploader({ videoFiles, setVideoFiles }) {
  const videoInputRef = useRef();

  const handleVideoChange = (e) => {
    const newVideos = Array.from(e.target.files);
    setVideoFiles((prev) => [...prev, ...newVideos]);
  };

  const handleRemoveVideo = (index) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full mt-3">
      {/* Upload Box */}
      <div
        onClick={() => videoInputRef.current.click()}
        className="border-2 border-dashed border-gray-300 hover:border-blue-500 bg-white rounded-lg p-4 text-center cursor-pointer transition-colors"
      >
        <p className="text-sm text-gray-600">Click or drag and drop video files here</p>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoChange}
          className="hidden"
        />
      </div>

      {/* Video List */}
      {videoFiles.length > 0 && (
        <ul className="mt-3 space-y-2">
          {videoFiles.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between text-sm bg-gray-100 px-3 py-2 rounded-md shadow-sm"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <FileVideo className="w-4 h-4 text-gray-500" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
              </div>
              <button
                onClick={() => handleRemoveVideo(idx)}
                className="text-red-500 hover:text-red-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

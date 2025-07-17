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
import { LoaderCircle, VideoIcon } from 'lucide-react';
import RichEditor from "../components/RichEditor";
import { FileText, X } from 'lucide-react';
import { useParams } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux';
import { fetchTrainingById,clear } from '../redux/trainingSlice';

export default function EditTraining() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link_expires_date, setlink_expires_date] = useState("");
  const [duration, setDuration] = useState("");
  const [webcamRequired, setWebcamRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading2, setLoading2] = useState(false);

  // Section Management
  const [sections, setSections] = useState([]); // [{id, name, duration, _destroy}]
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
  const fileInputRef = useRef();
	const [existingFiles, setExistingFiles] = useState([]); // files from backend
	const [newFiles, setNewFiles] = useState([]); // files selected via input
  const [localSectionContentHtml, setLocalSectionContentHtml] = useState("");
  const [videoFiles, setVideoFiles] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [newVideos, setNewVideos] = useState([]);


	// useEffect(() => {
	// 	const fetchTraining = async () => {
	// 		const token = localStorage.getItem('token');
	// 		const base = import.meta.env.VITE_API_BASE_URL;

	// 		try {
	// 			const res = await axios.get(`${base}/trainings/${id}`, {
	// 				headers: { Authorization: `Bearer ${token}` }
	// 			});

	// 			const training = res.data;

	// 			setTitle(training.title || "");
	// 			setDescription(training.description || "");
	// 			setContentHtml(training.content_html || "");
	// 			setDuration(training.duration?.toString() || "");
  //       setlink_expires_date(training.link_expires_date);

	// 			setIsActive(training.is_active);
	// 			setAllowRetries(training.allow_retries);
	// 			    // Set existing PDFs from backend
	// 			const existingPdfs = training.pdf_files.map(file => ({
	// 				attachment_id: file.attachment_id,
	// 				name: file.filename,
	// 				url: file.url,
	// 				signed_id: file.signed_id,
	// 				existing: true,
	// 				markedForDelete: false
	// 			}));

	// 			setExistingFiles(existingPdfs);

	// 			// Parse sections and questions
	// 			const sectionsData = training.training_sections || [];
	// 			setSections(sectionsData);

	// 			const questionMap = {};
	// 			sectionsData.forEach(section => {
	// 				questionMap[section.id] = section.training_questions || [];
	// 			});
	// 			setSectionQuestions(questionMap);

	// 		} catch (err) {
	// 			showErrorAlert("Failed to load training", err.response?.data?.message || "Unknown error");
	// 		}
	// 	};

	// 	fetchTraining();
	// }, [id]);


  const dispatch = useDispatch();
  const { training, loading, error } = useSelector((state) => state.training);

  // useEffect(() => {
  //   dispatch(fetchTrainingById(id));
  // }, [id]);
  useEffect(() => {
    if (!training || String(training.slug) !== String(id)) {
      dispatch(fetchTrainingById(id));
    }
  }, [dispatch, id, training?.id]);

  useEffect(() => {
    if (training) {
      setTitle(training.title || "");
      setDescription(training.description || "");
      setContentHtml(training.content_html || "");
      setDuration(training.duration?.toString() || "");
      setlink_expires_date(training.link_expires_date);
      setIsActive(training.is_active);
      setAllowRetries(training.allow_retries);

      const existingPdfs = training.pdf_files.map(file => ({
        attachment_id: file.attachment_id,
        name: file.filename,
        url: file.url,
        signed_id: file.signed_id,
        existing: true,
        markedForDelete: false
      }));
      setExistingFiles(existingPdfs);

      const existingVideos = training.video_files?.map(file => ({
        attachment_id: file.attachment_id,
        name: file.filename,
        url: file.url,
        signed_id: file.signed_id,
        existing: true,
        _destroy: false,
      })) || [];

      setExistingVideos(existingVideos);

      const sectionsData = training.training_sections || [];
      setSections(sectionsData);

      const questionMap = {};
      sectionsData.forEach(section => {
        questionMap[section.id] = section.training_questions || [];
      });
      setSectionQuestions(questionMap);
    }
  }, [training]);

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

	const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

	const handleRemoveExistingFile = (index) => {
		setExistingFiles(prev => {
			const updated = [...prev];
			updated[index]._destroy = true; // mark for deletion
			return updated;
		});
	};

	const handleRemoveNewFile = (index) => {
		setNewFiles(prev => prev.filter((_, i) => i !== index));
	};

  const handleRemoveSection = (sectionId) => {
    setSections(prevSections => {
      return prevSections.filter(section => {
        if (section.id === sectionId) {
          // If it's a new section, remove it completely
          return section.persisted; // or use !section.isNew if you're using that
        }
        return true;
      }).map(section => {
        // Mark only existing section as _destroy
        if (section.id === sectionId && section.persisted) {
          return { ...section, _destroy: true };
        }
        return section;
      });
    });

    // Remove or mark questions under the section as _destroy
    setSectionQuestions(prev => {
      const updated = { ...prev };
      if (updated[sectionId]) {
        // Same logic: remove if section is new, else mark as _destroy
        updated[sectionId] = updated[sectionId].filter(q => q.persisted)
          .map(q => ({ ...q, _destroy: true }));
      }
      return updated;
    });

    if (activeSidebar === sectionId) setActiveSidebar('details');
  };

  // Add question to a section
  const handleAddQuestion = (sectionId) => {
    setSectionQuestions(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        {
          id: undefined,
          content: "",
          question_type: "MCQ",
          option_1: "",
          option_2: "",
          option_3: "",
          option_4: "",
          correct_answer: "",
          marks: "",
          tags: "",
          validation: false,
          _destroy: false
        }
      ]
    }));
    setTimeout(() => {
      const newQuestionIndex = (sectionQuestions[sectionId]?.filter(q => !q._destroy).length || 0);
      scrollToQuestion(newQuestionIndex); // Pass index of newly added question
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

        return { ...updatedQuestion, validation: false };
      });

      return {
        ...prev,
        [sectionId]: updatedQuestions
      };
    });
  };

  // Remove question from a section (soft delete with _destroy)
  const handleRemoveQuestion = (sectionId, qIdx) => {
    setSectionQuestions(prev => {
      const updated = { ...prev };
      updated[sectionId] = updated[sectionId].map((q, idx) =>
        idx === qIdx
          ? (q.id ? { ...q, _destroy: true } : null)
          : q
      ).filter(Boolean);
      return updated;
    });
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
				if (section._destroy) continue;

        if (!section.name.trim()) {
          return Swal.fire({
            icon: 'warning',
            title: 'Incomplete Section',
            text: 'Each section must have a name.',
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
					 if (question._destroy) continue;
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
    setLoading2(true);
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

			newFiles.forEach(file => {
				formData.append("training[new_files][]", file);
			});

			// Existing files
			existingFiles.forEach(file => {
				formData.append("training[existing_files_attributes][][attachment_id]", file.attachment_id);
				formData.append("training[existing_files_attributes][][signed_id]", file.signed_id);
				formData.append("training[existing_files_attributes][][_destroy]", file._destroy ? "1" : "0");
			});

      // New Video Files
      newVideos.forEach(file => {
        formData.append("training[new_video_files][]", file);
      });

      // Existing Video Files
      existingVideos.forEach(file => {
        formData.append("training[existing_video_files_attributes][][attachment_id]", file.attachment_id);
        formData.append("training[existing_video_files_attributes][][signed_id]", file.signed_id);
        formData.append("training[existing_video_files_attributes][][_destroy]", file._destroy ? "1" : "0");
      });

      let sectionIndex = 0;
      let questionIndex = 0;

      sections.forEach(section => {
        if (section.id && typeof section.id === "number") {
          formData.append(`training[training_sections_attributes][${sectionIndex}][id]`, section.id);
        }
        formData.append(`training[training_sections_attributes][${sectionIndex}][name]`, section.name);
        formData.append(`training[training_sections_attributes][${sectionIndex}][content_html]`, section.content_html);
        if (section._destroy) {
          formData.append(`training[training_sections_attributes][${sectionIndex}][_destroy]`, "1");
          sectionIndex++;
          return; // Skip processing its questions
        }
        (sectionQuestions[section.id] || []).forEach(question => {
          if (question.id && typeof question.id === "number") {
            formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][id]`, question.id);
          }
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][content]`, question.content);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][question_type]`, question.question_type);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][option_1]`, question.option_1);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][option_2]`, question.option_2);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][option_3]`, question.option_3);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][option_4]`, question.option_4);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][correct_answer]`, question.correct_answer?.toUpperCase() || "");
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][marks]`, question.marks);
          formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][tags]`, question.tags);
          if (question._destroy) {
            formData.append(`training[training_sections_attributes][${sectionIndex}][training_questions_attributes][${questionIndex}][_destroy]`, "1");
          }
          questionIndex++;
        });
        sectionIndex++;
        questionIndex = 0;
      });

			const response = await axios.put(`${base}/trainings/${training.id}`, formData, {
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
      dispatch(clear());
    } catch (err) {
      showErrorAlert("Oops!", err.response?.data?.errors?.[0] || "Failed to save test.");
    } finally {
      setSaving(false);
      setLoading2(false);
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
                <label className="block text-base font-semibold text-gray-700 my-4">Content <span className="text-red-500">*</span></label>
                <RichEditor value={contentHtml} onChange={setContentHtml} placeholder="Enter training content..." />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 my-4">PDF Files (optional)</label>

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

								{/* EXISTING FILES (from backend) */}
                {existingFiles.filter(file => !file._destroy).length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {existingFiles.map((file, idx) => (
                      file._destroy ? null : (
                        <li
                          key={`existing-${idx}`}
                          className="flex items-center justify-between text-sm bg-gray-100 px-3 py-2 rounded-md shadow-sm"
                        >
                          <div className="flex items-center gap-2 text-gray-700">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                              Existing File #{idx + 1}
                            </span>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {file.name}
                            </a>
                          </div>
                          <button
                            onClick={() => handleRemoveExistingFile(idx)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      )
                    ))}
                  </ul>
                )}

                {/* NEW FILES (uploaded via input) */}
                {newFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {newFiles.map((file, idx) => (
                      <li
                        key={`new-${idx}`}
                        className="flex items-center justify-between text-sm bg-gray-100 px-3 py-2 rounded-md shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            New File #{idx + 1}
                          </span>
                          <span>{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveNewFile(idx)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-6">
                <label className="block text-base font-semibold text-gray-700 mb-2">Video Files (optional)</label>
                <VideoUploader videoFiles={videoFiles} setVideoFiles={setVideoFiles} existingVideos={existingVideos} setExistingVideos={setExistingVideos} newVideos={newVideos} setNewVideos={setNewVideos}/>
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
                  <label className="block text-base font-semibold text-gray-700">Traning Expiry Date</label>
                  <input
                    type="date"
                    className="w-full mt-2 rounded-md border-2 border-gray-300 bg-white px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    value={link_expires_date}
                    onChange={e => setlink_expires_date(e.target.value)}
                  />
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
					{(sectionQuestions[section.id] || []).map((q, idx) => !q._destroy && (
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

  if (loading || loading2) {
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
              {sections.filter(section => !section._destroy).map((section, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg flex gap-2 items-start relative">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                    <input
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter section name"
                      value={section.name}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[index] = { ...updated[index], name: e.target.value }; // clone object before updating
                        setSections(updated);
                      }}
                      maxLength={250}
                    />
                  </div>
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

import { FileVideo } from 'lucide-react';

function VideoUploader({ videoFiles, setVideoFiles,existingVideos,setExistingVideos,newVideos,setNewVideos }) {
  const videoInputRef = useRef();

  const handleRemoveVideo = (index) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    setNewVideos(prev => [...prev, ...files]);
  };

  const handleRemoveExistingVideo = (index) => {
    setExistingVideos(prev => {
      const updated = [...prev];
      updated[index]._destroy = true;
      return updated;
    });
  };

  const handleRemoveNewVideo = (index) => {
    setNewVideos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full mt-3">
      {/* Upload Box */}
      <div
        onClick={() => videoInputRef.current.click()}
        className="border-2 border-dashed border-gray-300 hover:border-blue-500 bg-white rounded-lg p-4 text-center cursor-pointer transition-colors"
      >
        <p className="text-sm text-gray-600">Click or drag and drop videos here</p>
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
      {existingVideos.filter(v => !v._destroy).length > 0 && (
        <ul className="mt-3 space-y-2">
          {existingVideos.map((video, idx) =>
            video._destroy ? null : (
              <li key={`video-${idx}`} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md shadow-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <VideoIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    Existing File #{idx + 1}
                  </span>
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {video.name}
                  </a>
                </div>
                <button onClick={() => handleRemoveExistingVideo(idx)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </li>
            )
          )}
        </ul>
      )}

      {/* New Videos Preview */}
      {newVideos.length > 0 && (
        <ul className="mt-3 space-y-2">
          {newVideos.map((video, idx) => (
            <li key={`new-video-${idx}`} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md shadow-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <VideoIcon className="w-4 h-4 text-gray-500" />
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  New File #{idx + 1}
                </span>
                <span>{video.name}</span>
              </div>
              <button onClick={() => handleRemoveNewVideo(idx)} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
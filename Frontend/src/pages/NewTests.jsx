import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { showErrorAlert } from "../utils/sweetAlert";
import {  FaTrash, FaInfoCircle, FaCode } from 'react-icons/fa';
import TestSidebarMain from "../components/TestSidebarMain";
import QuestionEditor from '../components/QuestionEditor';
import CodingTestEditor from '../components/CodingTestEditor';
import ChatWidget from "../components/ChatWidget";
import Joyride from 'react-joyride';
import NewTestHeader from "../components/NewTestHeader";
import Swal from "sweetalert2";
import { LoaderCircle } from 'lucide-react';
import { useApiLoading } from '../hooks/useApiLoading';

// QuickStartGuide Component
const QuickStartGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-semibold flex items-center">
          <FaInfoCircle className="mr-2" />
          Quick Start Guide
        </h2>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Test Creation */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Manual Test Creation</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Fill in the test details (title, description, type, duration)</li>
                <li>Add sections using the "Add Section" button</li>
                <li>For each section:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Click the section in the sidebar</li>
                    <li>Add questions using "Add Question"</li>
                    <li>Fill in question details and options</li>
                  </ul>
                </li>
                <li>Save as draft or publish when ready</li>
              </ol>
            </div>

            {/* AI-Assisted Creation */}
            <div>
              <h3 className="text-lg font-semibold mb-3">AI-Assisted Creation</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Click the "AI Chat" button in the sidebar</li>
                <li>Describe your test requirements to the AI</li>
                <li>Example prompts:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>"Create a 10-question math test on algebra"</li>
                    <li>"Add a section on current affairs"</li>
                    <li>"Make the questions more difficult"</li>
                  </ul>
                </li>
                <li>Review and edit AI-generated content</li>
                <li>Save or publish when satisfied</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function NewTests() {
  const navigate = useNavigate();
  const { loading: apiLoading, withLoading } = useApiLoading('new-test');
  // Test Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link_expires_date, setlink_expires_date] = useState("");
  const [access_start_time, setaccess_start_time] = useState("");
  const [access_end_time, setaccess_end_time] = useState("");
  const [duration, setDuration] = useState("");
  const [webcamRequired, setWebcamRequired] = useState(false);
  // Section Management
  const [sections, setSections] = useState([]); // [{id, name}]
  const [sectionQuestions, setSectionQuestions] = useState({}); // {sectionId: [questions]}
  const [sectionCodingTests, setSectionCodingTests] = useState({}); // {sectionId: [codingTests]}
  const [activeSidebar, setActiveSidebar] = useState('details'); // 'details' or section.id
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDuration, setNewSectionDuration] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const tourSteps = [
    {
      target: '[data-tour-id="test-details"]',
      content: 'Start by filling in your test details here.',
      placement: 'bottom',
    },
    {
      target: '[data-tour-id="add-section"]',
      content: 'Click here to add a new section to your test.',
      placement: 'top',
    },
    {
      target: '[data-tour-id="sidebar-section"]',
      content: 'Your sections appear here. Click to edit questions for a section.',
      placement: 'right',
    },
    {
      target: '[data-tour-id="ai-chat"]',
      content: 'Use AI Chat to generate or edit your test with the help of AI.',
      placement: 'top',
    },
  ];

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionsToAdd, setSectionsToAdd] = useState([
    { name: '', duration: '' },
  ]);
  const scrollContainerRef = useRef(null);
  const questionRefs = useRef([]);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [sidebaropen, setSidebarOpen] = useState(false);
  const [testStatus, setTestStatus] = useState("pending");
  const [conversationId, setConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hi! I'm your AI Test Assistant. You can create a test by chatting with me or upload a document to autofill questions." }
  ]);
  const tpuser = JSON.parse(localStorage.getItem("tpuser")) || { user: { subscription: false } };
  const [loading, setLoading] = useState(false);

  // Auto-start tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('newTestTourShown');
    if (!hasSeenTour) {
      setTourOpen(true);
      localStorage.setItem('newTestTourShown', 'true');
    }
  }, []);

  // Remove the reset effect since we'll handle it in ChatWidget
  useEffect(() => {
    // Empty effect - we'll handle reset in ChatWidget
  }, []);

  useEffect(() => {
    return () => setConversationId(null); // Reset conversationId on unmount
  }, []);

  const handleAddSection = (name, duration, isCodingTest = false) => {
    if (!(name.trim() && duration)) return;

    const newSectionId = crypto.randomUUID?.() || (Date.now().toString() + Math.random().toString(36).substring(2, 6));

    const newSection = {
      id: newSectionId,
      name: name.trim(),
      duration: duration.toString().trim(),
      is_coding_test: isCodingTest,
    };

    setSections(prev => [...prev, newSection]);

    setSectionQuestions(prev => ({
      ...prev,
      [newSection.id]: [], // ensures a clean, separate array for this section
    }));

    setSectionCodingTests(prev => ({
      ...prev,
      [newSection.id]: [], // ensures a clean, separate array for coding tests
    }));

    setActiveSidebar(newSection.id); // optional if you're activating the section UI
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

    setSectionCodingTests(prev => {
      const c = { ...prev };
      delete c[sectionId];
      return c;
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

  // Add coding test to a section
  const handleAddCodingTest = (sectionId) => {
    setSectionCodingTests(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        {
          id: Date.now(),
          title: "",
          description: "",
          marks: "",
          difficulty: 0,
          boilerplate_code: "",
          test_cases: []
        }
      ]
    }));
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

  const handleCodingTestChange = (sectionId, cIdx, field, value) => {
    setSectionCodingTests(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].map((codingTest, index) =>
        index === cIdx ? { ...codingTest, [field]: value } : codingTest
      )
    }));
  };

  const handleRemoveCodingTest = (sectionId, cIdx) => {
    setSectionCodingTests(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].filter((_, index) => index !== cIdx)
    }));
  };

  // Save/Create Test (status: draft or published)
  const handleSubmit = async (status = 'published') => {
  // ✅ Always validate basic test info
    if (!title.trim() || !description.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Test Info',
        text: 'Please fill in the title, description.',
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
        if (!section.name.trim() || !section.duration) {
          return Swal.fire({
            icon: 'warning',
            title: 'Incomplete Section',
            text: 'Each section must have a name and duration.',
          });
        }

        if (section.duration < 1) {
          return Swal.fire({
            icon: 'warning',
            title: 'Incomplete Section',
            text: `Section "${section.name}" duration is 0. `,
          });
        }

        const questions = sectionQuestions[section.id] || [];
        const codingTests = sectionCodingTests[section.id] || [];
        
        if (section.is_coding_test) {
          if (codingTests.length === 0) {
            return Swal.fire({
              icon: 'warning',
              title: 'No Coding Tests',
              text: `Coding section "${section.name}" has no coding tests.`,
            });
          }
        } else {
          if (questions.length === 0) {
            return Swal.fire({
              icon: 'warning',
              title: 'No Questions',
              text: `Section "${section.name}" has no questions.`,
            });
          }
        }

        // Validate regular questions
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
        }

        // Validate coding tests
        for (const codingTest of codingTests) {
          const missingFields = [];

          if (!codingTest.title?.trim()) missingFields.push('title');
          if (!codingTest.description?.trim()) missingFields.push('description');
          if (!codingTest.marks) missingFields.push('marks');
          if (!codingTest.test_cases || codingTest.test_cases.length === 0) missingFields.push('test cases');

          if (missingFields.length > 0) {
            return Swal.fire({
              icon: 'warning',
              title: 'Incomplete Coding Test',
              text: `Coding test in section "${section.name}" is missing the following: ${missingFields.join(', ')}.`,
            });
          }
        }

        // Validate MCQ/MSQ options
        for (const question of questions) {
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
      const codingTests = sectionCodingTests[section.id] || [];
      
      questions.forEach(q => {
        const marks = parseFloat(q.marks);
        if (!isNaN(marks)) totalMarks += marks;
      });
      
      codingTests.forEach(codingTest => {
        const marks = parseFloat(codingTest.marks);
        if (!isNaN(marks)) totalMarks += marks;
      });
    });

    // ✅ Proceed with submission if validation passes
    setSaving(true);
    
    await withLoading(async () => {
      try {
        const token = localStorage.getItem('token');
        const base = import.meta.env.VITE_API_BASE_URL;
        const formData = new FormData();

      formData.append("test[title]", title);
      formData.append("test[description]", description);
      formData.append("test[link_expires_date]", link_expires_date);
      formData.append("test[access_start_time]", access_start_time);
      formData.append("test[access_end_time]", access_end_time);
      // formData.append("test[test_type]", testType);
      formData.append("test[duration]", duration);
      formData.append("test[status]", status);
      formData.append("test[total_marks]", totalMarks);
      formData.append("test[webcam_required]", webcamRequired);

      let sectionIndex = 0;
      let questionIndex = 0;
      let codingTestIndex = 0;

      sections.forEach(section => {
        formData.append(`test[sections_attributes][${sectionIndex}][name]`, section.name);
        formData.append(`test[sections_attributes][${sectionIndex}][duration]`, section.duration);
        formData.append(`test[sections_attributes][${sectionIndex}][is_coding_test]`, section.is_coding_test || false);

        // Add regular questions
        (sectionQuestions[section.id] || []).forEach(question => {
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][content]`, question.content);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][question_type]`, question.question_type);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][option_1]`, question.option_1);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][option_2]`, question.option_2);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][option_3]`, question.option_3);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][option_4]`, question.option_4);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][correct_answer]`, question.correct_answer?.toUpperCase() || "");
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][marks]`, question.marks);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][tags]`, question.tags);
          questionIndex++;
        });

        // Add coding tests
        (sectionCodingTests[section.id] || []).forEach(codingTest => {
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][title]`, codingTest.title);
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][description]`, codingTest.description);
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][marks]`, codingTest.marks);
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][difficulty]`, parseInt(codingTest.difficulty) || 0);
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][boilerplate_code]`, codingTest.boilerplate_code);
          
          // Add test cases
          (codingTest.test_cases || []).forEach((testCase, testCaseIdx) => {
            formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][test_cases_attributes][${testCaseIdx}][input]`, testCase.input);
            formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][test_cases_attributes][${testCaseIdx}][expected_output]`, testCase.expected_output);
          });
          
          codingTestIndex++;
        });

        sectionIndex++;
        questionIndex = 0;
        codingTestIndex = 0;
      });

      const response = await axios.post(`${base}/tests`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (status === 'published') {
        Swal.fire({ icon: 'success', title: 'Published!', text: 'Your test has been published.', timer: 1500, showConfirmButton: false });
        navigate('/test');
      } else {
        Swal.fire({ icon: 'success', title: `Saved as ${status}!. ${!tpuser.user.subscription&&"To publish your test, please buy a plan."}`, text: 'Your changes have been saved.', timer: tpuser.user.subscription?1500:5000, showConfirmButton: !tpuser.user.subscription });
      }

      if (!tpuser.user.subscription) {
        navigate('/subscribe')
      }
      else{
        navigate('/test');
      }
    } catch (err) {
      showErrorAlert("Oops!", err.response?.data?.errors?.[0] || "Failed to save test.");
    } finally {
      setSaving(false);
    }
    });
  };

  // Convert AI's letter format (A,B,C,D) to number format (1,2,3,4)
  const convertCorrectAnswerFormat = (correctAnswer) => {
    if (!correctAnswer) return "";
    
    // Convert to string and handle different data types
    const answerStr = String(correctAnswer).trim();
    if (!answerStr) return "";
    
    // Handle comma-separated values (for MSQ)
    if (answerStr.includes(',')) {
      return answerStr.split(',').map(ans => {
        const trimmed = ans.trim().toUpperCase();
        return trimmed === 'A' ? '1' : trimmed === 'B' ? '2' : trimmed === 'C' ? '3' : trimmed === 'D' ? '4' : trimmed;
      }).join(',');
    }
    
    // Handle single value (for MCQ)
    const trimmed = answerStr.toUpperCase();
    return trimmed === 'A' ? '1' : trimmed === 'B' ? '2' : trimmed === 'C' ? '3' : trimmed === 'D' ? '4' : trimmed;
  };

  // AI chat update handler
  const handleAIUpdate = (update) => {
    // Debug: log the incoming update
    console.log('AI update received:', update);
    try {
      // Support both 'title' and 'test' for test title
      if (update.title !== undefined) {
        if (typeof update.title === 'object' && update.title !== null && update.title.title) {
          setTitle(update.title.title);
        } else {
          setTitle(update.title);
        }
      }
      if (update.test !== undefined) {
        if (typeof update.test === 'object' && update.test !== null && update.test.title) {
          setTitle(update.test.title);
        } else {
          setTitle(update.test);
        }
      }
      if (update.description !== undefined) setDescription(update.description);
      if (update.duration !== undefined) setDuration(update.duration);

      // Handle sections: map 'title' to 'name' and map question fields
      if (update.sections !== undefined) {
        let mappedSections = update.sections.map((s, i) => ({
          id: s.id || Date.now() + i,
          name: s.name || s.title || `Section ${i + 1}`,
          duration: parseInt(s.duration) || 30, // Convert to integer, default to 30 minutes
          questions: (s.questions || []).map(q => {
            const options = Array.isArray(q.options) ? q.options : [];
            const optionFields = {};
            options.forEach((opt, idx) => {
              optionFields[`option_${idx + 1}`] = opt || "";
            });
            return {
              ...q,
              content: q.content || q.question || "",
              question: q.question || q.content || "",
              options: options,
              correct_answer: convertCorrectAnswerFormat(q.correct_answer || q.answer || ""),
              correct_answers: q.correct_answers || [],
              marks: q.marks !== undefined ? q.marks : "",
              ...optionFields,
            };
          })
        }));

        setSections(mappedSections);
        const newSectionQuestions = {};
        mappedSections.forEach((s) => {
          newSectionQuestions[s.id] = s.questions || [];
        });
        setSectionQuestions(newSectionQuestions);
      }
      if (update.sectionQuestions !== undefined) {
        setSectionQuestions(update.sectionQuestions);
      }
    } catch (err) {
      console.error('Error updating test from AI:', err, update);
    }
  };

  // Handler for manual restart
  const handleRestartConversation = async () => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;
    await axios.post(`${base}/ai_chat/reset`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setChatKey(Date.now()); // Reset chat widget
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
    const section = sections.find(s => s.id === activeSidebar);
    if (section && section.is_coding_test) {
      // For coding tests, just update the index
      setCurrentScrollIndex(index);
    } else {
      // For regular questions, scroll to the element
      const ref = questionRefs.current[index];
      if (ref && ref.scrollIntoView) {
        ref.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        setCurrentScrollIndex(index);
      }
    }
  };

  // Main content area
  const renderMainContent = () => {
    if (activeSidebar === 'details') {
      return (
        <div className="shadow-2xl p-6 ml-10 sm:ml-20 lg:ml-80 mt-18 h-[calc(100vh-80px)] w-[calc(100vw-50px)] sm:w-[calc(100vw-100px)] max-w-4xl lg:w-[calc(100vw-350px)] overflow-y-auto bg-gray-50 rounded-2xl ">        <Joyride
            steps={tourSteps}
            run={tourOpen}
            continuous
            showSkipButton
            showProgress
            scrollToFirstStep
            disableScrolling={true}
            spotlightClicks={true}
            styles={{
              options: { zIndex: 10000 },
              overlay: { zIndex: 9999 },
              tooltip: { zIndex: 10001, maxHeight: 300, overflowY: 'auto' }
            }}
            callback={data => {
              if (data.status === 'finished' || data.status === 'skipped') setTourOpen(false);
            }}
          />
          <QuickStartGuide />
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
                <textarea className="w-full rounded-md border-2 border-gray-300 bg-white px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out" value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={250}/>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">🔒 Expiration Settings</h3>
                <p className="text-sm text-gray-500 mb-4">
                  All three fields are required to set expiration.<br/>
                  If only one field is selected, expiration will not be applied.<br/>
                  If no field is selected, expiration will not be applied.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1">Link Expires Date</label>
                    <input
                      type="date"
                      className="w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                      value={link_expires_date}
                      onChange={e => setlink_expires_date(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1">Access Start Time</label>
                    <input
                      type="time"
                      className="w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                      value={access_start_time}
                      onChange={e => setaccess_start_time(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-1">Access End Time</label>
                    <input
                      type="time"
                      className="w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                      value={access_end_time}
                      onChange={e => setaccess_end_time(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="webcam_required"
                  checked={webcamRequired}
                  onChange={e => setWebcamRequired(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="webcam_required" className="text-gray-700">
                  Require webcam for this test
                </label>
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
      if (section.is_coding_test) {
        const codingTests = sectionCodingTests[section.id] || [];
        const nextIndex = currentScrollIndex + 1;
        if (nextIndex < codingTests.length) {
          setCurrentScrollIndex(nextIndex);
        }
      } else {
        const refs = questionRefs.current;
        if (refs[currentScrollIndex + 1]) {
          refs[currentScrollIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
          setCurrentScrollIndex(currentScrollIndex + 1);
        }
      }
    };

    const handleNext = () => {
      if (section.is_coding_test) {
        const codingTests = sectionCodingTests[section.id] || [];
        const nextIndex = currentScrollIndex + 1;
        if (nextIndex < codingTests.length) {
          setCurrentScrollIndex(nextIndex);
        }
      } else {
        const nextIndex = currentScrollIndex + 1;
        if (nextIndex < (sectionQuestions[section.id]?.length || 0)) {
          scrollToQuestion(nextIndex);
        }
      }
    };

    const handlePrev = () => {
      const prevIndex = currentScrollIndex - 1;
      if (prevIndex >= 0) {
        if (section.is_coding_test) {
          setCurrentScrollIndex(prevIndex);
        } else {
          scrollToQuestion(prevIndex);
        }
      }
    };

    return (
      <div className="z-0 fixed shadow-2xl px-4 py-2 lg:ml-80 ml-10 sm:ml-20 mt-18 min-h-[calc(100vh-80px)] w-[calc(100vw-50px)] sm:w-[calc(100vw-100px)] lg:w-[calc(100vw-350px)] bg-gray-50 rounded-2xl flex flex-col">
        
        {/* Header and Buttons */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <h2 className="text-xs sm:text-xl font-bold text-gray-600 truncate">
            {section.is_coding_test ? 'Coding Tests' : 'Questions'} for Section: {section.name}
          </h2>
          <div className="flex gap-2 items-center">
            {/* Add Question/Coding Test Button */}
            {section.is_coding_test ? (
              <button
                type="button"
                onClick={() => handleAddCodingTest(section.id)}
                className="text-xs bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white px-3 py-1.5 md:text-sm rounded-lg font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                data-tour-id="add-coding-test"
              >
                <FaCode className="hidden sm:block w-4 h-4" />
                Add <span className="hidden sm:block">Coding Test</span>
              </button>
            ) : (
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
            )}

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
              disabled={section.is_coding_test ? 
                currentScrollIndex >= (sectionCodingTests[section.id] || []).length - 1 : 
                currentScrollIndex >= (sectionQuestions[section.id] || []).length - 1
              }
              className={`text-xs px-3 py-1.5 sm:text-sm rounded-lg font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-200 ${
                (section.is_coding_test ? 
                  currentScrollIndex >= (sectionCodingTests[section.id] || []).length - 1 : 
                  currentScrollIndex >= (sectionQuestions[section.id] || []).length - 1)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 text-white hover:scale-[1.03] active:scale-[0.97]'
              }`}
            >
              Next
              <svg className="hidden sm:block w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>


        </div>

        {/* Scrollable Content Container */}
        <div
          className="space-y-8 overflow-y-auto pr-2"
          style={{ maxHeight: 'calc(100vh - 170px)' }}
          ref={scrollContainerRef}
        >
          {section.is_coding_test ? (
            // Render coding tests
            (sectionCodingTests[section.id] || []).map((codingTest, idx) => (
              <div
                key={codingTest.id || idx}
                className={`min-w-full md:w-[calc(100vw-480px)] snap-start ${idx === currentScrollIndex ? 'block' : 'hidden'}`}
              >
                <CodingTestEditor
                  codingTest={codingTest}
                  idx={idx}
                  sectionId={section.id}
                  onChange={handleCodingTestChange}
                  onRemove={handleRemoveCodingTest}
                  saving={saving}
                />
              </div>
            ))
          ) : (
            // Render regular questions
            (sectionQuestions[section.id] || []).map((q, idx) => (
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
            ))
          )}
          <div className="fixed bottom-4 right-20 bg-gray-100 p-1 rounded shadow">
            Viewing: {section.is_coding_test ? 'Coding Test' : 'Question'} {currentScrollIndex + 1} of {section.is_coding_test ? (sectionCodingTests[section.id] || []).length : (sectionQuestions[section.id] || []).length}
          </div>
        </div>

      </div>
      );

  };

  if (apiLoading || loading) {
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
        // testType={testType} 
        duration={duration}
        handleSubmit={handleSubmit}
        saving={saving}
        sidebaropen={sidebaropen}
        setSidebarOpen={setSidebarOpen}
        testStatus="draft"
        />
      <TestSidebarMain 
        // sections={sections}
        sections={sections.filter(section => !section._destroy)}
        activeSidebar={activeSidebar}
        setActiveSidebar={setActiveSidebar}
        newSectionName={newSectionName}
        newSectionDuration={newSectionDuration}
        setNewSectionName={setNewSectionName}
        setNewSectionDuration={setNewSectionDuration}
        handleAddSection={handleAddSection}
        handleRemoveSection={handleRemoveSection}
        showSectionModal={showSectionModal}
        setShowSectionModal={setShowSectionModal}
        // data-tour-id="sidebar-section"
        sectionQuestions={sectionQuestions}
        sectionCodingTests={sectionCodingTests}
        currentScrollIndex={currentScrollIndex}
        scrollToQuestion={scrollToQuestion}
        sidebaropen={sidebaropen}
        setSidebarOpen={setSidebarOpen}
      />
      {renderMainContent()}
      <div data-tour-id="ai-chat" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10 }}>
        <ChatWidget
          conversationId={conversationId}
          setConversationId={setConversationId}
          onAIUpdate={handleAIUpdate}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      </div>

      {showSectionModal && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Manage Sections</h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {sections.map((section, index) => (
                <div key={index} className={`border p-4 rounded-lg flex gap-2 items-start relative ${section.is_coding_test ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <label className="block text-sm font-medium text-gray-700">Section Name</label>
                      {section.is_coding_test && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          <FaCode className="w-3 h-3" />
                          Coding
                        </span>
                      )}
                    </div>
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
                  <div className="w-40">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (in min)</label>
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

              {/* <button
                onClick={() =>
                  setSections([
                    ...sections,
                    { id: Date.now().toString() + Math.random().toString(36).substring(2, 6), name: '', duration: '' } // 🧠 Add unique ID
                  ])
                }
                className="text-blue-600 text-sm hover:underline"
              >
                + Add More Section
              </button> */}
              <button
                onClick={() => {
                  const newSectionId = Date.now().toString() + Math.random().toString(36).substring(2, 6);
                  setSections(prev => [
                    ...prev,
                    { id: newSectionId, name: '', duration: '' }
                  ]);
                  setSectionQuestions(prev => ({
                    ...prev,
                    [newSectionId]: [
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
                        validation: false
                      }
                    ]
                  }));
                  setActiveSidebar(newSectionId);
                }}
                className="text-blue-600 text-sm hover:underline"
              >
                + Add More Section
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setSections([
                      ...sections,
                      { id: Date.now().toString() + Math.random().toString(36).substring(2, 6), name: '', duration: '', is_coding_test: true } // 🧠 Add unique ID
                    ])
                  }
                  className="text-green-600 text-sm hover:underline flex items-center gap-1"
                >
                  <FaCode className="w-3 h-3" />
                  + Add Coding Section
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => {
                  const hasInvalid = sections.some(
                    section => !section.name.trim() || !section.duration || section.duration<1
                  );

                  if (hasInvalid) {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Missing Info',
                      text: 'Please fill in all section names and durations before proceeding.',
                    });
                    return;
                  }

                  // ✅ Calculate total test duration from all section durations
                  const totalDuration = sections.reduce((acc, section) => {
                    return acc + parseInt(section.duration || 0, 10);
                  }, 0);

                  setDuration(totalDuration.toString()); // assuming duration is string, adjust if needed
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
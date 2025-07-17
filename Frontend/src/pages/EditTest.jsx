import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import TestSidebarMain from "../components/TestSidebarMain";
import { HiOutlineDocumentText } from 'react-icons/hi';
import { FaPlus, FaTrash, FaCheckCircle, FaRegCircle, FaRegSquare, FaCode } from 'react-icons/fa';
import QuestionEditor from '../components/QuestionEditor';
import CodingTestEditor from '../components/CodingTestEditor';

import FlashMessage from "../components/FlashMessage";
import { showErrorAlert } from "../utils/sweetAlert";
import { FaInfoCircle } from 'react-icons/fa';
import TestChatSidebar from "../components/TestChatSidebar";
import ChatWidget from "../components/ChatWidget";
import Joyride from 'react-joyride';
import NewTestHeader from "../components/NewTestHeader";
import { LoaderCircle } from 'lucide-react';
import { useApiLoading } from '../hooks/useApiLoading';

export default function EditTest() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { startLoading, stopLoading, isLoading } = useApiLoading();
  
  // Test Details State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link_expires_date, setlink_expires_date] = useState("");
  const [access_start_time, setaccess_start_time] = useState("");
  const [access_end_time, setaccess_end_time] = useState("");
  // const [testType, setTestType] = useState("MCQ");
  const [duration, setDuration] = useState("");
  const [webcamRequired, setWebcamRequired] = useState(true);
  // Section Management
  const [sections, setSections] = useState([]); // [{id, name, icon}]
  const [activeSidebar, setActiveSidebar] = useState('details'); // 'details' or section.id
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDuration, setNewSectionDuration] = useState("");
  const [sectionQuestions, setSectionQuestions] = useState({}); // {sectionId: [questions]}
  const [sectionCodingTests, setSectionCodingTests] = useState({}); // {sectionId: [codingTests]}
  const [saving, setSaving] = useState(false);
  const questionsRef = useRef({}); // For auto-saving questions per section
  const [showSectionModal, setShowSectionModal] = useState(false);
  //new
  const scrollContainerRef = useRef(null);
  const questionRefs = useRef([]);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [sidebaropen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const extractTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [testStatus, setTestStatus] = useState("draft"); // Default to draft
  const tpuser = JSON.parse(localStorage.getItem("tpuser"));

  // Helper to ensure all option fields and correct_answer are always strings
  function normalizeQuestion(q) {
    return {
      id: q.id,
      content: q.content || "",
      question_type: q.question_type || "MCQ",
      option_1: q.option_1 != null ? q.option_1 : "",
      option_2: q.option_2 != null ? q.option_2 : "",
      option_3: q.option_3 != null ? q.option_3 : "",
      option_4: q.option_4 != null ? q.option_4 : "",
      correct_answer: q.correct_answer != null
        ? (typeof q.correct_answer === "string"
            ? q.correct_answer
            : Array.isArray(q.correct_answer)
              ? q.correct_answer.join(",")
              : "")
        : "",
      marks: q.marks != null ? q.marks : "",
      tags: q.tags != null ? q.tags : "",
      figure: q.figure_url,
      _destroy: false
    };
  }

  // Fetch test data
  const fetchTest = async () => {
    try {
      const token = localStorage.getItem("token");
      const base = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.get(`${base}/tests/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const test = res.data;
      setTitle(test.title);
      setDescription(test.description);
      setlink_expires_date(test.link_expires_date);
      setaccess_start_time(extractTime(test.access_start_time));
      setaccess_end_time(extractTime(test.access_end_time));
      setTestStatus(test.status);
      setDuration(test.duration);
      setWebcamRequired(!!test.webcam_required);
      setSections(test.sections.map(s => ({ 
        id: s.id, 
        name: s.name,
        duration: s.duration, 
        is_coding_test: s.is_coding_test || false,
        icon: <HiOutlineDocumentText className="w-5 h-5 text-gray-500" /> 
      })));
      const sq = {};
      const sc = {};
      test.sections.forEach(section => {
        sq[section.id] = (section.questions || []).map(normalizeQuestion);
        sc[section.id] = (section.coding_tests || []).map(codingTest => ({
          id: codingTest.id,
          title: codingTest.title || "",
          description: codingTest.description || "",
          marks: codingTest.marks || "",
          difficulty: codingTest.difficulty || 0,
          boilerplate_code: codingTest.boilerplate_code || "",
          test_cases: codingTest.test_cases || [],
          _destroy: false
        }));
      });
      setSectionQuestions(sq);
      setSectionCodingTests(sc);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed to fetch test', text: 'Unknown error' });
    }
  };

  useEffect(() => {
    fetchTest();
    // eslint-disable-next-line
  }, [slug]);

  // Section logic
  const handleAddSection = () => {
    if (!(newSectionName.trim() && newSectionDuration)) return;
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newSection = {
      id: newId,
      frontend_temp_id: newId,
      name: newSectionName,
      duration: newSectionDuration,
      icon: <HiOutlineDocumentText className="w-5 h-5 text-gray-500" />
    };
    setSections(prev => [...prev, newSection]);
    setSectionQuestions(prev => ({ ...prev, [newId]: [] }));
    setNewSectionName("");
    setNewSectionDuration("");
    setActiveSidebar(newId);
  };

  const handleRemoveSection = (sectionId) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, _destroy: true }
        : section
    );
    setSections(updatedSections);

    // Mark all questions under the section as _destroy: true
    setSectionQuestions(prev => {
      const updated = { ...prev };
      if (updated[sectionId]) {
        updated[sectionId] = updated[sectionId].map(q => ({ ...q, _destroy: true }));
      }
      return updated;
    });

    if (activeSidebar === sectionId) setActiveSidebar('details');

    // Recalculate duration excluding destroyed sections
    const totalDuration = updatedSections.reduce((acc, section) => {
      if (!section._destroy) {
        return acc + parseInt(section.duration || 0, 10);
      }
      return acc;
    }, 0);
    setDuration(totalDuration.toString());
  };

  // Question logic
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
          figure: null,
          _destroy: false
        }
      ]
    }));
  };
  const handleQuestionChange = (sectionId, qIdx, field, value) => {
    setSectionQuestions(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].map((q, idx) => idx === qIdx ? { ...q, [field]: value } : q)
    }));
  };
  const handleRemoveQuestion = (sectionId, qIdx) => {
    setSectionQuestions(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].map((q, idx) => idx === qIdx ? { ...q, _destroy: true } : q)
    }));
  };

  // Coding test logic
  const handleAddCodingTest = (sectionId) => {
    setSectionCodingTests(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        {
          id: undefined,
          title: "",
          description: "",
          marks: "",
          difficulty: 0,
          boilerplate_code: "",
          test_cases: [],
          _destroy: false
        }
      ]
    }));
  };

  const handleCodingTestChange = (sectionId, cIdx, field, value) => {
    setSectionCodingTests(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].map((codingTest, idx) => 
        idx === cIdx ? { ...codingTest, [field]: value } : codingTest
      )
    }));
  };

  const handleRemoveCodingTest = (sectionId, cIdx) => {
    setSectionCodingTests(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].map((codingTest, idx) => 
        idx === cIdx ? { ...codingTest, _destroy: true } : codingTest
      )
    }));
  };

  // Save/Update Test
  const handleSubmit = async (status = 'published') => {

      // --- Draft validation: only title is required
      if (status === 'draft') {
        if (!title.trim()) {
          Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Test title is required for draft.' });
          return;
        }
      }


      // --- Full validation for published
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

        if (!title.trim()) {
          Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Test title is required.' });
          return;
        }
        if (sections.length === 0) {
          return Swal.fire({
            icon: 'warning',
            title: 'No Sections',
            text: 'Please add at least one section before publishing.',
          });
        }
        for (const section of sections) {
          if (section._destroy) continue; // ✅ Skip removed sections

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
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (q._destroy) continue;

            if (!q.content?.trim()) {
              Swal.fire({ icon: 'error', title: 'Validation Error', text: `Section "${section.name}", Question ${i + 1}: Question content is required.` });
              return;
            }

            if (!q.marks || isNaN(q.marks)) {
              Swal.fire({ icon: 'error', title: 'Validation Error', text: `Section "${section.name}", Question ${i + 1}: Marks must be a valid number.` });
              return;
            }

            if (q.question_type === 'MCQ') {
              if (!['1', '2', '3', '4'].includes(q.correct_answer)) {
                Swal.fire({ icon: 'error', title: 'Validation Error', text: `Section "${section.name}", Question ${i + 1}: Please select exactly one correct answer for MCQ.` });
                return;
              }
            }

            if (q.question_type === 'MSQ') {
              const arr = (q.correct_answer || '').split(',').filter(Boolean);
              if (arr.length === 0) {
                Swal.fire({ icon: 'error', title: 'Validation Error', text: `Section "${section.name}", Question ${i + 1}: Please select at least one correct answer for MSQ.` });
                return;
              }
            }
          }

          // Validate coding tests
          for (let i = 0; i < codingTests.length; i++) {
            const codingTest = codingTests[i];
            if (codingTest._destroy) continue;

            if (!codingTest.title?.trim()) {
              Swal.fire({ icon: 'error', title: 'Validation Error', text: `Section "${section.name}", Coding Test ${i + 1}: Title is required.` });
              return;
            }

            if (!codingTest.description?.trim()) {
              Swal.fire({ icon: 'error', title: 'Validation Error', text: `Section "${section.name}", Coding Test ${i + 1}: Description is required.` });
              return;
            }

            if (!codingTest.marks || isNaN(codingTest.marks)) {
              Swal.fire({ icon: 'error', title: 'Validation Error', text: `Section "${section.name}", Coding Test ${i + 1}: Marks must be a valid number.` });
              return;
            }

            if (!codingTest.test_cases || codingTest.test_cases.length === 0) {
              Swal.fire({ icon: 'error', title: 'Validation Error', text: `Section "${section.name}", Coding Test ${i + 1}: At least one test case is required.` });
              return;
            }
          }
        }
      }

    let totalMarks = 0;
    sections.forEach(section => {
      const questions = sectionQuestions[section.id] || [];
      const codingTests = sectionCodingTests[section.id] || [];
      
      questions.forEach(q => {
        if (!q._destroy) {
          const marks = parseFloat(q.marks);
          if (!isNaN(marks)) totalMarks += marks;
        }
      });
      
      codingTests.forEach(codingTest => {
        if (!codingTest._destroy) {
          const marks = parseFloat(codingTest.marks);
          if (!isNaN(marks)) totalMarks += marks;
        }
      });
    });
    setSaving(true);
    setLoading(true);
    startLoading();
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
        if (typeof section.id === 'number') {
          formData.append(`test[sections_attributes][${sectionIndex}][id]`, section.id);
        }
        formData.append(`test[sections_attributes][${sectionIndex}][name]`, section.name);
        formData.append(`test[sections_attributes][${sectionIndex}][duration]`, section.duration);
        formData.append(`test[sections_attributes][${sectionIndex}][is_coding_test]`, section.is_coding_test || false);
         if (section._destroy) {
            formData.append(`test[sections_attributes][${sectionIndex}][_destroy]`, "1");
            sectionIndex++;
            return; // ✅ Skip processing its questions
          }
        
        // Add regular questions
        (sectionQuestions[section.id] || []).forEach(question => {
          if (typeof question.id === 'number') {
            formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][id]`, question.id);
          }
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][content]`, question.content);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][question_type]`, question.question_type);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][option_1]`, question.option_1);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][option_2]`, question.option_2);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][option_3]`, question.option_3);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][option_4]`, question.option_4);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][correct_answer]`, question.correct_answer?.toUpperCase() || "");
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][marks]`, question.marks);
          formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][tags]`, question.tags);
          if (question._destroy) {
            formData.append(`test[sections_attributes][${sectionIndex}][questions_attributes][${questionIndex}][_destroy]`, "1");
          }
          questionIndex++;
        });

        // Add coding tests
        (sectionCodingTests[section.id] || []).forEach(codingTest => {
          if (typeof codingTest.id === 'number') {
            formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][id]`, codingTest.id);
          }
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][title]`, codingTest.title);
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][description]`, codingTest.description);
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][marks]`, codingTest.marks);
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][difficulty]`, parseInt(codingTest.difficulty) || 0);
          formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][boilerplate_code]`, codingTest.boilerplate_code);
          
          // Add test cases
          (codingTest.test_cases || []).forEach((testCase, testCaseIdx) => {
            if (typeof testCase.id === 'number') {
              formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][test_cases_attributes][${testCaseIdx}][id]`, testCase.id);
            }
            formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][test_cases_attributes][${testCaseIdx}][input]`, testCase.input);
            formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][test_cases_attributes][${testCaseIdx}][expected_output]`, testCase.expected_output);
            if (testCase._destroy) {
              formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][test_cases_attributes][${testCaseIdx}][_destroy]`, "1");
            }
          });
          
          if (codingTest._destroy) {
            formData.append(`test[sections_attributes][${sectionIndex}][coding_tests_attributes][${codingTestIndex}][_destroy]`, "1");
          }
          codingTestIndex++;
        });

        sectionIndex++;
        questionIndex = 0;
        codingTestIndex = 0;
      });
      await axios.put(`${base}/tests/${slug}`, formData, {
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
      Swal.fire({ icon: 'error', title: 'Oops!', text: err.response?.data?.error || 'Failed to update test.' });
    } finally {
      setSaving(false);
      setLoading(false);
      stopLoading();
    }
  };

  //new
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

  const handleEnterKeyToAddSection = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newId = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      setSections([
        ...sections,
        { id: newId, name: '', duration: '' }
      ]);
    }
  };

  // Render main content based on active sidebar
  const renderMainContent = () => {
    if (activeSidebar === 'details') {
      return (
        <div className="shadow-2xl p-6 ml-10 sm:ml-20 lg:ml-80 mt-18 h-[calc(100vh-80px)] w-[calc(100vw-50px)] sm:w-[calc(100vw-100px)] max-w-4xl lg:w-[calc(100vw-350px)] overflow-y-auto bg-gray-50 rounded-2xl ">
          <div className="mb-6" data-tour-id="test-details">
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); }}>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">Title<span className="text-red-600">*</span></label>
                <div className="text-sm text-gray-500 text-right">{250 - title.length} characters left</div>
                <input className="w-full rounded-md border-2 border-gray-300 bg-white px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out" value={title} onChange={e => setTitle(e.target.value)} required maxLength={250}/>
              </div>
              {/* <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">Type</label>
                <select className="w-full rounded-md border-2 border-gray-300 bg-white px-3 py-3 text-base shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition duration-150 ease-in-out" value={testType} onChange={e => setTestType(e.target.value)}>
                  <option value="MCQ">MCQ</option>
                  <option value="MSQ">MSQ</option>
                  <option value="Theoretical">Theoretical</option>
                </select>
              </div> */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">Description</label>
                <div className="text-sm text-gray-500 text-right">{250 - title.length} characters left</div>
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

    if (activeSidebar === 'all') {
      return (
        <div className="space-y-10">
          {sections.length === 0 && (
            <div className="text-gray-500 text-center text-lg">No sections available.</div>
          )}
          {sections.map(section => (
            <div key={section.id} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">Section: {section.name}</h2>
              {(sectionQuestions[section.id] || []).length === 0 && (
                <div className="text-gray-400 mb-4">No questions in this section.</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(sectionQuestions[section.id] || []).map((question, idx) => !question._destroy && (
                  <div key={question.id || idx} className="border border-gray-200 rounded-xl shadow p-4 bg-gray-50 flex flex-col min-w-0 max-w-md mx-auto">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-base text-gray-800">Q{idx + 1}:</span>
                    </div>
                    <div className="mb-2 text-gray-700 text-sm" style={{minHeight: '40px'}} dangerouslySetInnerHTML={{ __html: question.content }} />
                    <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                      <div>
                        <span className="font-semibold text-gray-600">Type:</span> {question.question_type}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Marks:</span> {question.marks}
                      </div>
                    </div>
                    {(question.question_type !== 'theoretical' && question.question_type !== 'Theoretical') && (
                      <div className="mb-2">
                        <span className="font-semibold text-xs text-gray-600">Options:</span>
                        <ul className="list-decimal ml-4 mt-1 space-y-1">
                          {[1,2,3,4].map(num => (
                            <li key={num} className="text-gray-700 text-xs" dangerouslySetInnerHTML={{ __html: question[`option_${num}`] }} />
                          ))}
                        </ul>
                        <div className="mt-1 text-xs"><span className="font-semibold text-gray-600">Correct:</span> <span className="text-green-700" dangerouslySetInnerHTML={{ __html: question.correct_answer }} /></div>
                      </div>
                    )}
                    {(question.question_type === 'theoretical' || question.question_type === 'Theoretical') && (
                      <div className="mb-2">
                        <span className="font-semibold text-xs text-gray-600">Expected:</span>
                        <div className="text-gray-700 mt-1 text-xs" dangerouslySetInnerHTML={{ __html: question.correct_answer }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
              className="text-xs sm:text-sm bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              data-tour-id="add-coding-test"
            >
              <FaCode className="hidden sm:block w-4 h-4" />
              Add <span className="hidden sm:block">Coding Test</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleAddQuestion(section.id)}
              className="text-xs sm:text-sm bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              data-tour-id="add-question"
            >
              <svg className=" hidden sm:block w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Add <span className="hidden sm:block">Question </span>
            </button>
          )}

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={currentScrollIndex === 0}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold flex items-center gap-1 transition-all duration-200 shadow-md hover:shadow-lg ${
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
              currentScrollIndex >= (sectionCodingTests[section.id] || []).filter(ct => !ct._destroy).length - 1 : 
              currentScrollIndex >= (sectionQuestions[section.id] || []).filter(q => !q._destroy).length - 1
            }
            className={`text-xs px-3 py-1.5 sm:text-sm rounded-lg font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all duration-200 ${
              (section.is_coding_test ? 
                currentScrollIndex >= (sectionCodingTests[section.id] || []).filter(ct => !ct._destroy).length - 1 : 
                currentScrollIndex >= (sectionQuestions[section.id] || []).filter(q => !q._destroy).length - 1)
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

        <div
          className="space-y-8 overflow-y-auto pr-2"
          style={{ maxHeight: 'calc(100vh - 170px)' }}
          ref={scrollContainerRef}
        >
          {section.is_coding_test ? (
            // Render coding tests
            (sectionCodingTests[section.id] || []).map((codingTest, idx) => !codingTest._destroy && (
              <div
                key={codingTest.id || idx}
                className={`min-w-full md:w-[calc(100vw-480px)] snap-start ${idx === currentScrollIndex ? 'block' : 'hidden'}`}
              >
                <CodingTestEditor
                  key={codingTest.id || idx}
                  codingTest={codingTest}
                  idx={idx}
                  sectionId={section.id}
                  onChange={handleCodingTestChange}
                  onRemove={(sectionId, cIdx) => handleRemoveCodingTest(sectionId, cIdx)}
                  saving={saving}
                />
              </div>
            ))
          ) : (
            // Render regular questions
            (sectionQuestions[section.id] || []).map((q, idx) => !q._destroy && (
              <div
                key={q.id || idx}
                ref={(el) => (questionRefs.current[idx] = el)}
                data-index={idx}
                className="min-w-full md:w-[calc(100vw-480px)] snap-start"
              >
                <QuestionEditor
                  key={q.id || idx}
                  question={q}
                  idx={idx}
                  sectionId={section.id}
                  onChange={handleQuestionChange}
                  onRemove={(sectionId, qIdx) => handleRemoveQuestion(sectionId, qIdx)}
                  saving={saving}
                />
              </div>
            ))
          )}
          <div className="fixed bottom-4 right-20 bg-gray-100 p-1 rounded shadow">
              Viewing: {section.is_coding_test ? 'Coding Test' : 'Question'} {currentScrollIndex + 1} of {section.is_coding_test ? (sectionCodingTests[section.id] || []).filter(ct => !ct._destroy).length : (sectionQuestions[section.id] || []).filter(q => !q._destroy).length}
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
        // testType={testType} 
        duration={duration}
        handleSubmit={handleSubmit}
        saving={saving}
        sidebaropen={sidebaropen}
        setSidebarOpen={setSidebarOpen}
        testStatus={testStatus}
        />
      <TestSidebarMain 
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
        //new
        data-tour-id="sidebar-section"
        sectionQuestions={sectionQuestions}
        sectionCodingTests={sectionCodingTests}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
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

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 6);
                    setSections([
                      ...sections,
                      {
                        id: newId,
                        frontend_temp_id: newId,
                        name: '',
                        duration: '',
                        is_coding_test: false
                      }
                    ]);
                  }}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Add More Section
                </button>
                <button
                  onClick={() => {
                    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 6);
                    setSections([
                      ...sections,
                      {
                        id: newId,
                        frontend_temp_id: newId,
                        name: '',
                        duration: '',
                        is_coding_test: true
                      }
                    ]);
                  }}
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
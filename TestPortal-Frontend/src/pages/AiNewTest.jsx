import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FlashMessage from "../components/FlashMessage";
import { showErrorAlert, showSuccessAlert } from "../utils/sweetAlert";
import { UploadCloud } from "lucide-react";
import { useApiLoading } from "../hooks/useApiLoading";

export default function AiNewTest({ onUploadSuccess }) {
  const [flash, setFlash] = useState();
  const navigate = useNavigate();
  const { startLoading, stopLoading, isLoading } = useApiLoading();

  // Test metadata & questions state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [testType, setTestType] = useState("MCQ");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState("sample");

  // Track loading & upload file
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Utility to convert number to letter for options (1->A etc)
  const tocap = (x) => {
    if (x === 1) return "A";
    else if (x === 2) return "B";
    else if (x === 3) return "C";
    else return "D";
  };

  // Handle change for any question field
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // Add a blank question (default MCQ type)
  const addQuestion = () => {
    const lastId = questions.length ? questions[questions.length - 1].id : 0;
    setQuestions([
      ...questions,
      {
        id: lastId + 1,
        content: "",
        question_type: "MCQ",
        option_1: "",
        option_2: "",
        option_3: "",
        option_4: "",
        correct_answer: "",
        marks: "",
        tags: "",
      },
    ]);
  };

  // Remove question by id
  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Handle file upload and call backend to parse file
  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setUploadedFile(file);
    startLoading();

    try {
      const token = localStorage.getItem("token");
      const base3 = import.meta.env.VITE_API_BASE_URL3;
      const formData = new FormData();
      formData.append("file", file);

      // Assuming your backend POST /tests/upload endpoint parses the file
      const res = await axios.post(`${base3}/extract`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

    const { title, description, duration, questions } = res.data;
      console.log(res.data)
      setTitle(title || "");
      setDescription(description || "");
      setTestType("");
      setDuration(duration || "");
      setQuestions(
        (questions || []).map((q, idx) => ({
          id: q.id || idx + 1,
          content: q.content || "",
          question_type: q.question_type || "MCQ",
          option_1: q.option_1 || "",
          option_2: q.option_2 || "",
          option_3: q.option_3 || "",
          option_4: q.option_4 || "",
          correct_answer: q.correct_answer || "",
          marks: q.marks || "",
          tags: q.tags || ""
        }))
      );
      setFlash({ message: "File parsed successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      showErrorAlert("Upload failed", "Failed to parse the uploaded file.");
    } finally {
      setUploading(false);
      stopLoading();
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setTestType("MCQ");
    setDuration("");
    setQuestions([
      {
        content: "",
        question_type: "MCQ",
        option_1: "",
        option_2: "",
        option_3: "",
        option_4: "",
        correct_answer: "",
        marks: "",
        tags: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();
    try {
      const token = localStorage.getItem("token");
      const base = import.meta.env.VITE_API_BASE_URL;

      const formData = new FormData();
      formData.append("test[title]", title);
      formData.append("test[description]", description);
      formData.append("test[test_type]", testType);
      formData.append("test[duration]", duration);

      const sortedQuestions = [...questions].sort((a, b) => a.id - b.id);

      sortedQuestions.forEach((question, index) => {
        formData.append(`test[questions_attributes][${index}][content]`, question.content);
        formData.append(`test[questions_attributes][${index}][question_type]`, question.question_type);
        formData.append(`test[questions_attributes][${index}][option_1]`, question.option_1);
        formData.append(`test[questions_attributes][${index}][option_2]`, question.option_2);
        formData.append(`test[questions_attributes][${index}][option_3]`, question.option_3);
        formData.append(`test[questions_attributes][${index}][option_4]`, question.option_4);
        formData.append(`test[questions_attributes][${index}][correct_answer]`, question.correct_answer?.toUpperCase() || "");
        formData.append(`test[questions_attributes][${index}][marks]`, question.marks);
        formData.append(`test[questions_attributes][${index}][tags]`, question.tags);
      });

      await axios.post(`${base}/tests`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFlash({ message: "Test saved successfully!", type: "success" });
      navigate("/test");
    } catch (err) {
      console.error(err);
      showErrorAlert("Oops!", "Failed to save test.");
    } finally {
      stopLoading();
    }
  };
  const fileInputRef = useRef(null);
  const uploadExcel = async (file) => {
    setUploading(true);
    const token = localStorage.getItem("token");
    const base = import.meta.env.VITE_API_BASE_URL;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${base}/tests/upload_excel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          showErrorAlert("Validation Failed", data.errors.join("\n"));
        } else {
          showErrorAlert("Oops!", "Failed to upload Excel file.");
        }
        return;
      }
      showSuccessAlert("Upload started", "Your Excel is being processed. Please Check Your Mail");
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      showErrorAlert("Oops!", "Failed to upload Excel file.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadExcel(file);
      e.target.value = null;
    }
  };

  const downloadExcel = async (variant) => {
  const token = localStorage.getItem("token");
  const base = import.meta.env.VITE_API_BASE_URL;

  const pollForFile = async () => {
    try {
      const response = await fetch(`${base}/tests/export_download?variant=${variant}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", variant === "test" ? "sample_test_sheet.xlsx" : "sample_sheet.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showSuccessAlert("Sheet Is Downloaded");
      } else {
        setTimeout(pollForFile, 2000); // Retry after 2s
      }
    } catch (err) {
      console.error("Error polling for file:", err);
      showErrorAlert("Oops!", "Failed to download Excel file.");
    }
  };

  pollForFile();
};


  return (
    <div className="min-h-100 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      {flash && (
        <FlashMessage message={flash.message} type={flash.type} onClose={() => setFlash(null)} />
      )}
      <div className="w-full max-w-4xl bg-white/90 p-8 rounded-2xl shadow-2xl space-y-8 border border-gray-200 sm:p-8 p-3 sm:rounded-2xl rounded-lg sm:space-y-8 space-y-4 sm:max-w-4xl max-w-full relative">
        {/* Modal Close Button - Only one, styled as requested */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2 tracking-tight drop-shadow">Upload Questions File & Create Test</h2>
        <p className="text-base font-medium text-gray-600 text-center mb-4">Supported file: <span className="font-semibold">.xlsx</span></p>
        <div className="flex flex-wrap items-center gap-4 justify-center mb-2">
          <div className="relative flex">
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="sample">Template</option>
              <option value="test">Sample Test</option>
            </select>
            <button
              onClick={() => downloadExcel(selectedVariant)}
              className="px-5 py-2 rounded-r-lg bg-green-600 text-white text-sm font-semibold shadow-lg hover:bg-green-700 transition"
            >
              Download
            </button>
          </div>
          <button
            onClick={handleUploadClick}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-800 text-white text-sm font-semibold rounded-lg shadow-lg cursor-pointer hover:bg-gray-900 transition-all duration-200 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
            disabled={uploading}
          >
            <UploadCloud className="w-5 h-5" />
            {uploading ? "Uploading..." : "Upload Excel to Create Tests"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="text-sm text-white mt-2 text-center font-semibold bg-gray-800 border border-gray-800 rounded p-3">
          <span className="font-bold">Instructions:</span>
          <ul className="list-disc list-inside text-left mt-2 text-white font-normal space-y-1">
            <li>Do <span className="font-bold">not</span> change any column titles or headers in the sheet.</li>
            <li>Update your questions and sections <span className="font-bold">only in the provided rows</span>.</li>
            <li>To add new questions or sections, <span className="font-bold">add them at the end</span> of the existing data.</li>
            <li>Do <span className="font-bold">not</span> add extra rows in the middle or between the start and end of your data.</li>
            <li>Do <span className="font-bold">not</span> leave blank rows anywhere in the sheet.</li>
            <li>Ensure all required fields (like marks, answer, QC) are filled for each question.</li>
            <li>Download and refer to the sample/template for the correct format before uploading.</li>
          </ul>
        </p>
        {/* Show form only if questions loaded */}
        {questions.length > 0 && (
          <form onSubmit={handleSubmit} className="space-y-8 mt-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Only one card for Test Title, remove the second card below */}
              <div className="border border-gray-300 bg-gray-50 px-3 py-3 text-gray-800 rounded-lg flex flex-col shadow-md">
                <label className="text-sm font-semibold text-gray-700 mb-1">Test Title<span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="outline-none px-2 py-2 rounded border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  required
                />
              </div>
            </div>
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-700 flex items-center justify-between mb-2">
                Questions
              </h3>
              {questions.map((q, index) => (
                <div key={index} className="p-6 rounded-2xl space-y-4 bg-white border border-gray-200 shadow-lg sm:p-6 p-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700">Question {index + 1} <span className="text-gray-400 italic text-xs">id:{q.id}</span></label>
                    <select
                      value={q.question_type}
                      onChange={(e) => handleQuestionChange(index, "question_type", e.target.value)}
                      className="text-sm border border-gray-300 bg-gray-200 px-2 py-2 text-gray-700 focus:outline-none rounded"
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="MSQ">MSQ</option>
                      <option value="theoretical">Theoretical</option>
                    </select>
                  </div>
                  <div className="border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 rounded flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Question<span className="text-red-600">*</span></label>
                    <textarea
                      placeholder=""
                      value={q.content}
                      onChange={(e) => handleQuestionChange(index, "content", e.target.value)}
                      className="outline-none px-2 py-2 rounded border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>
                  <div className="border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 rounded flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      {q.question_type === "MCQ" ? "Correct Option" : "Correct Options"}
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={q.question_type === "MCQ" ? "e.g., A " : "e.g., A,C"}
                      value={q.correct_answer}
                      onChange={(e) => handleQuestionChange(index, "correct_answer", e.target.value)}
                      className="outline-none px-2 py-2 rounded border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                  {q.question_type === "theoretical" && (
                    <div className="border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 rounded flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Expected Answer:</label>
                      <textarea
                        type="text"
                        placeholder=""
                        value={q.correct_answer}
                        onChange={(e) => handleQuestionChange(index, "correct_answer", e.target.value)}
                        className="outline-none px-2 py-2 rounded border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 rounded flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Marks<span className="text-red-600">*</span></label>
                      <input
                        type="number"
                        placeholder=""
                        value={q.marks}
                        onChange={(e) => handleQuestionChange(index, "marks", e.target.value)}
                        className="outline-none px-2 py-2 rounded border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                        required
                      />
                    </div>
                    <div className="border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 rounded flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        placeholder="e.g.,React,Ruby,"
                        value={q.tags}
                        onChange={(e) => handleQuestionChange(index, "tags", e.target.value)}
                        className="outline-none px-2 py-2 rounded border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="text-red-500 text-sm hover:underline mt-2"
                  >
                    Remove Question
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-900 shadow w-full sm:w-auto"
                onClick={addQuestion}
              >
                + Add Question
              </button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between mt-8 gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 shadow w-full sm:w-auto"
                title="! delete all questions"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 text-white px-8 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-blue-900 transition w-full sm:w-auto"
              >
                Create Test
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

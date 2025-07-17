import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { LoaderCircle, BookOpen, Clock, User2, FileText, Download } from "lucide-react";

const AdminTrainingShow = () => {
  const { slug } = useParams();
  const [training, setTraining] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const base2 = import.meta.env.VITE_API_BASE_URL2;

    axios
      .get(`${base2}/admin/trainings/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((res) => setTraining(res.data))
      .catch((err) => console.error(err));
  }, [slug]);

  if (!training) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📘 Training Details</h1>

      <div className="bg-white rounded-2xl p-6 shadow border space-y-3 mb-8">
        <p className="text-lg"><strong>Title:</strong> {training.title}</p>
        <p><strong>Status:</strong> {training.status}</p>
        <p><strong>Code:</strong> {training.code || "N/A"}</p>
        <p><strong>Duration:</strong> {training.duration} mins</p>
        <p><strong>Total Marks:</strong> {training.total_marks || "N/A"}</p>
        <p><strong>Allow Retries:</strong> {training.allow_retries ? "Yes" : "No"}</p>
        <p><strong>Link Expiry:</strong> {training.link_expires_date || "N/A"}</p>
        <p><strong>Created By:</strong> {training.user?.email}</p>
        
        <div className="mt-4">
          <span className="font-semibold text-gray-800">Description:</span>
          <p className="text-gray-700 mt-1 text-sm bg-gray-100 p-3 rounded-lg">{training.description || "No description provided."}</p>
        </div>

        <div className="mt-4">
          <span className="font-semibold text-gray-800">Content:</span>
          <div className="text-gray-700 mt-1 text-sm bg-gray-100 p-3 rounded-lg" dangerouslySetInnerHTML={{ __html: training.content_html }} />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">📚 Sections & Questions</h2>

      {training.training_sections?.length > 0 ? (
        training.training_sections.map((section) => (
          <div key={section.id} className="mb-8">
            <h3 className="text-xl font-bold text-gray-700 mb-3">📂 Section: {section.name}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.training_questions?.map((q) => (
                <div key={q.id} className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-900 flex items-start">
                      <BookOpen className="text-blue-500 w-5 h-5 mr-2 mt-1" />
                      <span dangerouslySetInnerHTML={{ __html: q.content }} />
                    </h3>
                  </div>

                  <div className="p-5 space-y-2 text-sm text-gray-700">
                    <p><strong>Type:</strong> {q.question_type}</p>
                    <p><strong>Marks:</strong> {q.marks}</p>
                    {q.option_1 && (
                      <div>
                        <p className="font-semibold">Options:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li dangerouslySetInnerHTML={{ __html: q.option_1 }} />
                          <li dangerouslySetInnerHTML={{ __html: q.option_2 }} />
                          <li dangerouslySetInnerHTML={{ __html: q.option_3 }} />
                          <li dangerouslySetInnerHTML={{ __html: q.option_4 }} />
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600">No sections or questions found.</p>
      )}

      {training.pdf_files?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">📎 Attached PDFs</h2>
          <ul className="list-disc pl-6 space-y-1 text-blue-600">
            {training.pdf_files.map((file, idx) => (
              <li key={idx}>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Download size={16} />
                  {file.filename || `File ${idx + 1}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminTrainingShow;

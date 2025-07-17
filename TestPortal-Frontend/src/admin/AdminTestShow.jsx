import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Circle, ListTodo, Award, CheckCircle2, LoaderCircle } from "lucide-react";

const AdminTestShow = () => {
  const { slug } = useParams();
  const [test, setTest] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    axios
      .get(`${base2}/admin/tests/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((res) => setTest(res.data))
      .catch((err) => console.error(err));
  }, [slug]);

  if (!test) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📄 Test Details</h1>

      <div className="bg-white rounded-2xl p-6 shadow border space-y-3 mb-8">
        <p className="text-lg"><strong>Title:</strong> {test.title}</p>
        <div>
          <span className="font-semibold text-gray-800">Description:</span>
          <p className="text-gray-700 mt-1 text-sm bg-gray-100 p-3 rounded-lg">
            {test.description || "No description provided."}
          </p>
        </div>
        <p><strong>Type:</strong> {test.test_type}</p>
        <p><strong>Duration:</strong> {test.duration} mins</p>
        <p><strong>Created By:</strong> {test.user?.email}</p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">📝 Questions</h2>

        {test.sections?.length > 0 ? (
          test.sections.map((section) => (
            <div key={section.id} className="mb-8">
              <h3 className="text-xl font-bold text-gray-700 mb-3">📚 Section: {section.name}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.questions?.map((q) => (
                  <div
                    key={q.id}
                    className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5 border-b">
                      <h3 className="text-lg font-bold text-gray-900 flex items-start">
                        <Circle className="text-blue-500 w-5 h-5 mr-2 mt-1" />
                        <span dangerouslySetInnerHTML={{ __html: q.content }} />
                      </h3>
                    </div>

                    <div className="p-5 space-y-3 text-sm text-gray-700">
                      <div className="flex items-center">
                        <ListTodo className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="font-semibold text-gray-800">Type:</span> {q.question_type}
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="font-semibold text-gray-800">Marks:</span> {q.marks}
                      </div>

                      {/* Optional: render options if present */}
                      {q.option_1 && (
                        <div>
                          <div className="flex items-center mb-1">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                            <span className="font-semibold text-gray-800">Options:</span>
                          </div>
                          <ul className="list-disc pl-6 space-y-1">
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
    </div>
  );
};

export default AdminTestShow;

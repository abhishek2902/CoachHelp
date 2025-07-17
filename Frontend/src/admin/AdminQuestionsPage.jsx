import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Circle, ListTodo, Award, CheckCircle2, User, Book, LoaderCircle, Search } from 'lucide-react';

const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1 });

  const fetchQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      const response = await axios.get(`${base2}/admin/questions?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = response.data.questions || [];
      setQuestions(data);
      setPagination({
        current_page: response.data.current_page,
        total_pages: response.data.total_pages
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = questions.filter((q) => {
      const tags = q.tags?.toLowerCase() || '';
      const testTitle = q.test?.title?.toLowerCase() || '';
      return (
        q.content?.toLowerCase().includes(query) ||
        q.question_type?.toLowerCase().includes(query) ||
        tags.includes(query) ||
        testTitle.includes(query)
      );
    });
    setFilteredQuestions(filtered);
  }, [searchQuery, questions]);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800">📚 Admin Questions</h2>
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by content, type, tag, or test..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-4 md:p-5 border-b">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-start">
                    <Circle className="text-blue-500 w-4 h-4 md:w-5 md:h-5 mr-2 mt-1" /> {q.content}
                  </h3>
                </div>
                <div className="p-4 md:p-5 space-y-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <ListTodo className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-semibold text-gray-800">Type:</span> {q.question_type}
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="font-semibold text-gray-800">Marks:</span> {q.marks}
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-800">Correct: </span>
                      <span className="text-green-600">{q.correct_answer}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Book className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-gray-800">Test:</span>{" "}
                    <span className="text-blue-600">{q.test?.title || "—"}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-semibold text-gray-800">Author:</span> {q.test?.user?.email || "—"}
                  </div>

                  {q.tags && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {q.tags.split(',').map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => fetchQuestions(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">{pagination.current_page} / {pagination.total_pages}</span>
            <button
              onClick={() => fetchQuestions(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.total_pages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminQuestionsPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import Swal from 'sweetalert2';

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [form, setForm] = useState({ question: "", answer: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const base = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFaqs = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${base}/faqs?page=${pageNumber}`);
      setFaqs(res.data.faqs || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs(page);
  }, [page]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${base}/faqs/${editingId}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      } else {
        await axios.post(`${base}/faqs`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
      setForm({ question: "", answer: "", tags: "" });
      setEditingId(null);
      fetchFaqs();
    } catch (error) {
      console.error("Failed to save FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setForm({ question: faq.question, answer: faq.answer, tags: faq.tags });
    setEditingId(faq.id);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this FAQ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.delete(`${base}/faqs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      await Swal.fire({
        title: 'Deleted!',
        text: 'The FAQ has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      fetchFaqs(page);
    } catch (error) {
      console.error("Failed to delete FAQ:", error);

      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete FAQ. Please try again.',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{editingId ? "Edit FAQ" : "Create New FAQ"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            className="border border-gray-300 p-2 rounded col-span-full"
            name="question"
            value={form.question}
            onChange={handleInput}
            placeholder="Question"
            required
          />
          <input
            className="border border-gray-300 p-2 rounded col-span-full"
            name="tags"
            value={form.tags}
            onChange={handleInput}
            placeholder="Tags (comma-separated)"
          />
          <textarea
            className="border border-gray-300 p-2 rounded col-span-full"
            name="answer"
            value={form.answer}
            onChange={handleInput}
            placeholder="Answer"
            rows={3}
            required
          />
          <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto col-span-full"
          >
            {editingId ? "Update FAQ" : "Create FAQ"}
          </button>
        </form>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-xl font-semibold text-gray-700">All FAQs</h3>
            <input
              type="text"
              placeholder="Search FAQs by question, answer, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="text-gray-500 text-lg">
              <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-200 text-gray-600">
                <tr>
                  <th className="py-2 px-4 text-left">Question</th>
                  <th className="py-2 px-4 text-left">Tags</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="border-t border-gray-200 hover:bg-gray-100">
                    <td className="py-2 px-4">{faq.question}</td>
                    <td className="py-2 px-4">{faq.tags}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredFaqs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-4">
                      No FAQs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {meta.total_pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded disabled:bg-gray-400"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {meta.current_page || page} of {meta.total_pages}
                </span>
                <button
                  onClick={() => setPage(p => (meta.next_page ? p + 1 : p))}
                  disabled={!meta.next_page}
                  className="px-4 py-2 bg-gray-800 text-white rounded disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

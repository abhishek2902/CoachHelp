import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle, Search } from "lucide-react";
import Swal from 'sweetalert2';

const AdminTrainingsPage = () => {
  const [trainings, setTrainings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1 });

  const fetchTrainings = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      const response = await axios.get(`${base2}/admin/trainings?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      setTrainings(response.data.trainings || []);
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
    fetchTrainings();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this training?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      const token = localStorage.getItem('token');

      await axios.delete(`${base2}/admin/trainings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire('Deleted!', 'The training has been deleted.', 'success');
      fetchTrainings(pagination.current_page);
    } catch (err) {
      console.error('Delete error:', err);
      Swal.fire('Error', 'Failed to delete training.', 'error');
    }
  };

  const filteredTrainings = trainings.filter((training) =>
    training.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">🎓 Manage Trainings</h1>
        <div className="w-full md:w-80 relative">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training) => (
              <div
                key={training.id}
                className="border p-5 rounded-xl shadow-md bg-white transition transform hover:scale-[1.02] hover:shadow-lg"
              >
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">📘 {training.title}</h2>
                <p className="text-gray-600 text-sm mb-2">📄 {training.description}</p>
                <p className="text-gray-500 text-sm mb-4">👤 {training.user.email}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/admin/trainings/${training.slug}`)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded text-sm transition"
                  >
                    📄 View
                  </button>
                  <button
                    onClick={() => handleDelete(training.slug)}
                    className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded text-sm transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => fetchTrainings(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">{pagination.current_page} / {pagination.total_pages}</span>
            <button
              onClick={() => fetchTrainings(pagination.current_page + 1)}
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

export default AdminTrainingsPage;

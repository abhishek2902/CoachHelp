import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHelpForm from './AdminHelpForm';
import { Pencil, Trash2, Plus, LoaderCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const emptyForm = { title: '', description: '', video_url: '', slug: '', position: 0 };

export default function AdminHelpManage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [helps, setHelps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const base2 = import.meta.env.VITE_API_BASE_URL2;
  const token = localStorage.getItem('token');
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHelps = async (page = 1) => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.get(`${base2}/admin/helps?page=${page}`, { headers });

    setHelps(Array.isArray(res.data.helps) ? res.data.helps : []);
    setCurrentPage(res.data.current_page);
    setTotalPages(res.data.total_pages);
    setLoading(false);
  };

  useEffect(() => {
    fetchHelps(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const handleEdit = (help) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setForm(help);
    setEditingId(help.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this help entry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${base2}/admin/helps/${id}`, { headers });
      await Swal.fire('Deleted!', 'The help entry has been deleted.', 'success');
      fetchHelps(currentPage);
    } catch (error) {
      console.error('Error deleting help entry:', error);
      Swal.fire('Error', 'Failed to delete help entry.', 'error');
    }
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchHelps();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">{editingId ? 'Edit Help' : 'Create New Help'}</h2>
          <button onClick={handleNew} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Plus className="mr-2" /> New Help
          </button>
        </div>
        {showForm && (
          <div className="mb-6">
            <AdminHelpForm form={form} setForm={setForm} editingId={editingId} onSave={handleSave} />
          </div>
        )}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-xl font-semibold text-gray-700">All Help Entries</h3>
          <input
            type="text"
            placeholder="Search help entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoaderCircle className="animate-spin w-8 h-8 text-gray-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-200 text-gray-600">
                <tr>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Slug</th>
                  <th className="py-2 px-4 text-left">Position</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {helps
                  .filter((help) =>
                    [help.title, help.slug, help.description]
                      .some((field) =>
                        field?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                  )
                  .map((help) => (
                  <tr key={help.id} className="border-t border-gray-200 hover:bg-gray-100">
                    <td className="py-2 px-4">{help.title}</td>
                    <td className="py-2 px-4">{help.slug}</td>
                    <td className="py-2 px-4">{help.position}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button onClick={() => handleEdit(help)} className="text-blue-600 hover:underline flex items-center gap-1"><Pencil size={16}/>Edit</button>
                      <button onClick={() => handleDelete(help.id)} className="text-red-600 hover:underline flex items-center gap-1"><Trash2 size={16}/>Delete</button>
                    </td>
                  </tr>
                ))}
                {helps.filter((help) =>
                  [help.title, help.slug, help.description]
                    .some((field) =>
                      field?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                ).length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-4">
                      No help entries found{searchQuery ? ` for "${searchQuery}"` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

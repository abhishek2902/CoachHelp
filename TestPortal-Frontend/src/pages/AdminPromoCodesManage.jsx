import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus, LoaderCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useApiLoading } from '../hooks/useApiLoading';

const emptyForm = { code: '', discount: '', expires_at: '', active: true, usage_limit: '' };

export default function AdminPromoCodesManage() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const base2 = import.meta.env.VITE_API_BASE_URL2;
  const token = localStorage.getItem('token');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1, current_page: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const { startLoading, stopLoading, isLoading } = useApiLoading();

  const fetchPromoCodes = async (page = 1) => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.get(`${base2}/admin/promo_codes?page=${page}&per_page=10`, { headers });
    setPromoCodes(res.data.promo_codes);
    setPagination({ total_pages: res.data.total_pages, current_page: res.data.current_page });
    setLoading(false);
  };

  useEffect(() => {
    fetchPromoCodes(page);
    // eslint-disable-next-line
  }, [page]);

  const handleEdit = (promo) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setForm({ ...promo, expires_at: promo.expires_at ? promo.expires_at.slice(0, 10) : '' });
    setEditingId(promo.id);
    setShowForm(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPage(newPage);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this promo code?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    startLoading();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${base2}/admin/promo_codes/${id}`, { headers });

      Swal.fire('Deleted!', 'The promo code has been deleted.', 'success');
      fetchPromoCodes();
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire('Error', 'Failed to delete promo code.', 'error');
    } finally {
      stopLoading();
    }
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    startLoading();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (editingId) {
        await axios.put(`${base2}/admin/promo_codes/${editingId}`, { promo_code: form }, { headers });
      } else {
        await axios.post(`${base2}/admin/promo_codes`, { promo_code: form }, { headers });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchPromoCodes();
    } catch (error) {
      console.error('Error saving promo code:', error);
    } finally {
      stopLoading();
    }
  };

  const filteredPromoCodes = promoCodes.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">{editingId ? 'Edit Promo Code' : 'Create New Promo Code'}</h2>
          <button onClick={handleNew} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Plus className="mr-2" /> New Promo Code
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input className="border border-gray-300 p-2 rounded" name="code" value={form.code} onChange={handleChange} placeholder="Code" required />
            <input className="border border-gray-300 p-2 rounded" name="discount" type="number" value={form.discount} onChange={handleChange} placeholder="Discount (%)" required />
            <input className="border border-gray-300 p-2 rounded" name="expires_at" type="date" value={form.expires_at} onChange={handleChange} placeholder="Expires At" />
            <input className="border border-gray-300 p-2 rounded" name="usage_limit" type="number" value={form.usage_limit || ''} onChange={handleChange} placeholder="Usage Limit" />
            <label className="flex items-center gap-2 col-span-full">
              <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} /> Active
            </label>
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto col-span-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </form>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Promo Codes</h3>
          <input
            type="text"
            placeholder="Search by code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  <th className="py-2 px-4 text-left">Code</th>
                  <th className="py-2 px-4 text-left">Discount</th>
                  <th className="py-2 px-4 text-left">Expires At</th>
                  <th className="py-2 px-4 text-left">Active</th>
                  <th className="py-2 px-4 text-left">Usage Limit</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromoCodes.map((promo) => (
                  <tr key={promo.id} className="border-t border-gray-200 hover:bg-gray-100">
                    <td className="py-2 px-4">{promo.code}</td>
                    <td className="py-2 px-4">{promo.discount}%</td>
                    <td className="py-2 px-4">{promo.expires_at ? promo.expires_at.slice(0, 10) : '-'}</td>
                    <td className="py-2 px-4">{promo.active ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-4">{promo.usage_limit || '-'}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button onClick={() => handleEdit(promo)} className="text-blue-600 hover:underline flex items-center gap-1"><Pencil size={16}/>Edit</button>
                      <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:underline flex items-center gap-1"><Trash2 size={16}/>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredPromoCodes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-4">No promo codes available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-center items-center mt-4 gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.total_pages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
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

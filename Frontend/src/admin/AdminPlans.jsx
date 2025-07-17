import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1 });
  const [form, setForm] = useState({
    name: '',
    price: '',
    interval: '',
    description: '',
    features: '',
    tests_allowed:'',
    is_one_time_use: false,
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPlans = async (page = 1) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    try {
      const res = await axios.get(`${base2}/admin/plans?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(res.data.plans || []);
      setPagination({
        current_page: res.data.current_page,
        total_pages: res.data.total_pages,
      });
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(1);
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL2;

    const payload = { ...form };

    if (editingId) {
      await axios.put(`${base2}/admin/plans/${editingId}`, { plan: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`${base2}/admin/plans`, { plan: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    setForm({ name: '', price: '', interval: '', description: '', features: '',tests_allowed: '' });
    setEditingId(null);
    fetchPlans();
    setLoading(false);
  };

  const handleEdit = (plan) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setForm(plan);
    setEditingId(plan.id);
  };

  const handleDeactive = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to deactivate this plan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, deactivate it!'
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      await axios.put(`${base2}/admin/plans/${id}`, { plan: { active: false } }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlans();
      Swal.fire('Deactivated!', 'The plan has been deactivated.', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to deactivate the plan.', 'error');
    }
  };

  const handleActivate = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to activate this plan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, activate it!'
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      await axios.put(`${base2}/admin/plans/${id}`, { plan: { active: true } }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlans();
      Swal.fire('Activated!', 'The plan has been activated.', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to activate the plan.', 'error');
    }
  };

  const filteredPlans = plans.filter((plan) =>
    `${plan.name} ${plan.description}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{editingId ? 'Edit Plan' : 'Create New Plan'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input className="border border-gray-300 p-2 rounded" name="name" value={form.name} onChange={handleInput} placeholder="Plan Name" required />
          <input className="border border-gray-300 p-2 rounded" name="price" value={form.price} onChange={handleInput} placeholder="Price" required />
          <input className="border border-gray-300 p-2 rounded" name="tests_allowed" value={form.tests_allowed} onChange={handleInput} placeholder="Tests allowed" required />
          <input className="border border-gray-300 p-2 rounded" name="interval" value={form.interval} onChange={handleInput} placeholder="Duration (days)" required />
          <input className="border border-gray-300 p-2 rounded col-span-full" name="features" value={form.features} onChange={handleInput} placeholder="Features (comma-separated)" />
          <textarea className="border border-gray-300 p-2 rounded col-span-full" name="description" value={form.description} onChange={handleInput} placeholder="Description" rows={3} />
          {/* is_one_time_use checkbox */}
          <div className="flex items-center col-span-full">
            <input
              type="checkbox"
              id="is_one_time_use"
              name="is_one_time_use"
              checked={form.is_one_time_use}
              onChange={e => setForm(prev => ({ ...prev, is_one_time_use: e.target.checked }))}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
            />
            <label htmlFor="is_one_time_use" className="text-sm text-gray-700 select-none">
              One Time Use Plan
            </label>
          </div>
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto col-span-full">
            {editingId ? 'Update Plan' : 'Create Plan'}
          </button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">All Plans</h3>
          <input
            type="text"
            placeholder="Search by plan name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        { loading ? (
            <div className="flex justify-center items-center h-48">
              <span className="text-gray-500 text-lg"><LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" /></span>
            </div>
          ):(
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-200 text-gray-600">
                <tr>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Duration (days)</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="border-t border-gray-200 hover:bg-gray-100">
                    <td className="py-2 px-4">{plan.name}</td>
                    <td className="py-2 px-4">₹{plan.price}</td>
                    <td className="py-2 px-4">{plan.interval} days</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:underline">Edit</button>
                      { plan.active?
                      <button onClick={() => handleDeactive(plan.id)} className="text-red-600 hover:underline">Deactivate</button>
                      :<button onClick={() => handleActivate(plan.id)} className="text-red-600 hover:underline">Activate</button>
                      }
                    </td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-4">No plans available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
      </div>

      {pagination.total_pages > 1 && (
      <div className="flex justify-center mt-4 gap-4">
        <button
          onClick={() => fetchPlans(pagination.current_page - 1)}
          disabled={pagination.current_page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {pagination.current_page} of {pagination.total_pages}
        </span>
        <button
          onClick={() => fetchPlans(pagination.current_page + 1)}
          disabled={pagination.current_page === pagination.total_pages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
    </div>
  );
};

export default AdminPlans;

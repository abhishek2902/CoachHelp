import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, LoaderCircle, User, Edit } from 'lucide-react';
import { showErrorAlert } from '../utils/sweetAlert';
import Swal from 'sweetalert2';
import { useApiLoading } from '../hooks/useApiLoading';

const AdminUsersDashboard = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    admin: false,
    profile_picture_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { startLoading, stopLoading, isLoading } = useApiLoading();

  const fetchUsers = async (page = 1, query = searchQuery) => {
    try {
      setLoading(true);
      startLoading();
      const token = localStorage.getItem("token");
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      const response = await axios.get(`${base2}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        params: {
          page,
          search: query,
        },
      });

      setUsers(response.data.users || []);
      setPagination({
        current_page: response.data.current_page,
        total_pages: response.data.total_pages,
      });
    } catch {
      showErrorAlert('Error', 'Failed to fetch users. Please try again later.');
      setUsers([]);
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = async (e) => {
    if (e.target.files[0] && editingId) {
      const file = e.target.files[0];
      // Upload to backend
      const token = localStorage.getItem("token");
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      const formData = new FormData();
      formData.append("profile_picture", file);
      const res = await fetch(`${base2}/admin/users/${editingId}/upload_profile_picture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.profile_picture_url) {
        setImagePreview(data.profile_picture_url);
        setForm((prev) => ({ ...prev, profile_picture_url: data.profile_picture_url }));
      }
    }
  };

  const handleEdit = (user) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setForm({
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      admin: user.admin || false,
      profile_picture_url: user?.profile_picture_url || ''
    });
    setEditingId(user.id);
    setImagePreview(user?.profile_picture_url || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    startLoading();
    const token = localStorage.getItem("token");
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    // Only send allowed fields
    const userPayload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      admin: form.admin
    };
    try {
      await axios.put(`${base2}/admin/users/${editingId}`, { user: userPayload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ id: '', first_name: '', last_name: '', email: '', admin: false, profile_picture_url: '' });
      setEditingId(null);
      setImagePreview('');
      fetchUsers();
    } catch {
      showErrorAlert('Error', 'Failed to update user.');
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      startLoading();
      const token = localStorage.getItem("token");
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      await axios.delete(`${base2}/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setUsers(users.filter(u => u.id !== id));

      Swal.fire('Deleted!', 'User has been deleted.', 'success');
    } catch {
      showErrorAlert("Error", "Failed to delete user. Please try again later.");
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (

    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white p-6 rounded-xl shadow">
        <input className="border border-gray-300 p-2 rounded" name="first_name" value={form.first_name} onChange={handleInput} placeholder="First Name" required />
        <input className="border border-gray-300 p-2 rounded" name="last_name" value={form.last_name} onChange={handleInput} placeholder="Last Name" required />
        <input className="border border-gray-300 p-2 rounded" name="email" value={form.email} onChange={handleInput} placeholder="Email" required type="email" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="admin" checked={form.admin} onChange={handleInput} />
          Admin
        </label>
        <div className="col-span-full flex items-center gap-4">
          <label className="block">
            <span className="text-gray-700">Profile Picture</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="block mt-1" />
          </label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow" />
          )}
        </div>
        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto col-span-full">
          {editingId ? 'Update User' : 'Select a user to edit'}
        </button>
      </form>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-800">
          All Users
        </h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="text-gray-500 text-lg"><LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" /></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
                <img
                  src={user?.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'User')}`}
                  alt={user.first_name ? `${user.first_name} ${user.last_name}` : user.email}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow mb-2"
                  onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                />
                <div className="font-bold text-lg text-gray-900 mb-1">{user.first_name} {user.last_name}</div>
                <div className="text-gray-600 mb-2">{user.email}</div>
                <div className="mb-2">
                  {user.admin ? (
                    <span className="px-2 py-1 text-xs font-semibold bg-rose-100 text-rose-800 rounded-lg">Admin</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-lg">User</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="flex items-center space-x-1 text-rose-600 hover:text-rose-800"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center text-gray-500 py-4 col-span-full">No users found.</div>
            )}
          </div>

          {/* Pagination Buttons */}
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => fetchUsers(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">{pagination.current_page} / {pagination.total_pages}</span>
            <button
              onClick={() => fetchUsers(pagination.current_page + 1)}
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

export default AdminUsersDashboard;

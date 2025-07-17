import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoaderCircle, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminOrganizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [form, setForm] = useState({
    id: '',
    name: '',
    show_in_public: false,
    description: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrgs = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      const res = await axios.get(`${base2}/admin/organizations?page=${pageNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle both paginated and non-paginated responses
      if (res.data.organizations) {
        setOrgs(res.data.organizations);
        setMeta(res.data.meta || {});
      } else if (Array.isArray(res.data)) {
        setOrgs(res.data);
        setMeta({});
      } else {
        setOrgs([]);
        setMeta({});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch organizations');
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs(page);
  }, [page]);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (org) => {
    if (!org?.id) {
      setError("Organization has no ID");
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setForm({
      id: org.id,
      name: org.name || '',
      show_in_public: org.show_in_public || false,
      description: org.description || '',
      image_url: org.image_url || ''
    });
    setEditingId(org.id);
    setImagePreview(org.image_url || '');
    setError(null);
  };

  const handleImageChange = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    const orgId = editingId || form.id;

    if (!orgId) {
      setError("Please save the organization before uploading an image");
      return;
    }

    try {
      setLoading(true);
      setImagePreview(URL.createObjectURL(file));

      const token = localStorage.getItem('token');
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(
        `${base2}/admin/organizations/${orgId}/upload_image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data.image_url) {
        setImagePreview(res.data.image_url);
        setForm(prev => ({ ...prev, image_url: res.data.image_url }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed');
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    const orgId = editingId || form.id;

    const orgPayload = {
      name: form.name,
      show_in_public: form.show_in_public,
      description: form.description,
      image_url: form.image_url
    };

    try {
      if (orgId) {
        // Using PUT for update as per your routes
        await axios.put(
          `${base2}/admin/organizations/${orgId}`,
          { organization: orgPayload },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Using POST for create
        await axios.post(
          `${base2}/admin/organizations`,
          { organization: orgPayload },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setForm({ id: '', name: '', show_in_public: false, description: '', image_url: '' });
      setEditingId(null);
      setImagePreview('');
      fetchOrgs(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save organization');
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this organization?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      await axios.delete(`${base2}/admin/organizations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Show success confirmation
      Swal.fire('Deleted!', 'The organization has been deleted.', 'success');

      fetchOrgs(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete organization');
      console.error("Delete error:", err);
      Swal.fire('Error', 'Failed to delete organization.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = orgs.filter((org) => {
    const q = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(q) ||
      (org.description && org.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white p-6 rounded-xl shadow">
        <input
          className="border border-gray-300 p-2 rounded"
          name="name"
          value={form.name}
          onChange={handleInput}
          placeholder="Organization Name"
          required
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="show_in_public"
            checked={form.show_in_public}
            onChange={handleInput}
          />
          Show in Public
        </label>

        <textarea
          className="border border-gray-300 p-2 rounded col-span-full"
          name="description"
          value={form.description}
          onChange={handleInput}
          placeholder="Description (optional)"
          rows={3}
        />

        <div className="col-span-full flex items-center gap-4">
          <label className="block">
            <span className="text-gray-700">Organization Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block mt-1"
              disabled={!editingId && !form.id}
            />
          </label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow" />
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto col-span-full disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : editingId ? 'Update Organization' : 'Create Organization'}
        </button>
      </form>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Organizations</h2>
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrgs.map(org => (
              <div key={org.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
                {org.image_url ? (
                  <img src={org.image_url} alt={org.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow mb-2" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="font-bold text-lg text-gray-900 mb-1">{org.name}</div>
                {org.description && (
                  <div className="text-gray-600 text-center mb-2 line-clamp-2">{org.description}</div>
                )}
                <div className="mb-2">
                  {org.show_in_public ? (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-lg">Public</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-lg">Private</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(org)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
                    className="flex items-center space-x-1 text-rose-600 hover:text-rose-800"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
            {filteredOrgs.length === 0 && (
              <div className="text-center text-gray-500 py-4 col-span-full">No organizations found.</div>
            )}
          </div>

          {meta.total_pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-gray-700 font-medium">
                Page {meta.current_page || page} of {meta.total_pages || "?"}
              </span>

              <button
                onClick={() => setPage(prev => (meta.next_page ? prev + 1 : prev))}
                disabled={!meta.next_page || loading}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrganizations;

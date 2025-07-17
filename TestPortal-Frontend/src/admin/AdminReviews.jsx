import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoaderCircle, Star } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [form, setForm] = useState({
    user_id: '',
    title: '',
    rating: '',
    comment: '',
    show_in_public: false,
    slug: ''
  });
  const [loading, setLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    try {
      const res = await axios.get(`${base2}/admin/reviews?page=${page}&per_page=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data.reviews)) {
        setReviews(res.data.reviews);
        setMeta(res.data.meta || {});
      } else {
        setReviews([]);
        setMeta({});
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviews([]);
      setMeta({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    try {
      const res = await axios.get(`${base2}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      // If the response is an object, try extracting the array
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error("Unexpected users response format:", data);
        setUsers([]); // fallback to empty array
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]); // ensure users is always an array
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchUsers();
  }, []);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    const payload = { ...form };
    if (editingSlug) {
      await axios.put(`${base2}/admin/reviews/${editingSlug}`, { review: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`${base2}/admin/reviews`, { review: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setForm({ user_id: '', title: '', rating: '', comment: '', show_in_public: false, slug: '' });
    setEditingSlug(null);
    fetchReviews();
    setLoading(false);
  };

  const handleEdit = (review) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setForm({
      user_id: review.user_id,
      title: review.title,
      rating: review.rating,
      comment: review.comment,
      show_in_public: review.show_in_public,
      slug: review.slug
    });
    setEditingSlug(review.slug);
  };

  const handleDelete = async (slug) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete this organization?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      await axios.delete(`${base2}/admin/reviews/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
      Swal.fire('Deleted!', 'The review has been deleted.', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      Swal.fire('Error', 'Failed to delete the review.', 'error');
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      review.title?.toLowerCase().includes(searchLower) ||
      review.comment?.toLowerCase().includes(searchLower) ||
      `${review.user?.first_name || ''} ${review.user?.last_name || ''}`.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{editingSlug ? 'Edit Review' : 'Create New Review'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <select className="border border-gray-300 p-2 rounded" name="user_id" value={form.user_id} onChange={handleInput} required>
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>
            ))}
          </select>
          <input className="border border-gray-300 p-2 rounded" name="title" value={form.title} onChange={handleInput} placeholder="Title" required />
          <input className="border border-gray-300 p-2 rounded" name="rating" type="number" min="1" max="5" value={form.rating} onChange={handleInput} placeholder="Rating (1-5)" required />
          <input className="border border-gray-300 p-2 rounded" name="slug" value={form.slug} onChange={handleInput} placeholder="Slug (optional)" />
          <textarea className="border border-gray-300 p-2 rounded col-span-full" name="comment" value={form.comment} onChange={handleInput} placeholder="Comment" rows={3} />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="show_in_public" checked={form.show_in_public} onChange={handleInput} />
            Show in Public
          </label>
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto col-span-full">
            {editingSlug ? 'Update Review' : 'Create Review'}
          </button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">All Reviews</h3>
          <input
            type="text"
            placeholder="Search by title, user, or comment..."
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
                  <th className="py-2 px-4 text-left">User</th>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Rating</th>
                  <th className="py-2 px-4 text-left">Show in Public</th>
                  <th className="py-2 px-4 text-left">Comment</th>
                  <th className="py-2 px-4 text-left">Slug</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.slug} className="border-t border-gray-200 hover:bg-gray-100">
                    <td className="py-2 px-4">{review.user ? `${review.user.first_name} ${review.user.last_name}` : review.user_id}</td>
                    <td className="py-2 px-4">{review.title}</td>
                    <td className="py-2 px-4 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < review.rating ? '#facc15' : 'none'} />
                      ))}
                    </td>
                    <td className="py-2 px-4">{review.show_in_public ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-4">{review.comment}</td>
                    <td className="py-2 px-4">{review.slug}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button onClick={() => handleEdit(review)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(review.slug)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredReviews.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-4">No reviews available</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-4 py-2">
                Page {meta?.current_page || page} of {meta?.total_pages || "?"}
              </span>

              <button
                onClick={() => setPage((prev) => (meta?.next_page ? prev + 1 : prev))}
                disabled={!meta?.next_page}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          )}
      </div>
    </div>
  );
};

export default AdminReviews;

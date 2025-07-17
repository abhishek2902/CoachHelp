import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { LoaderCircle, Pencil, Trash2, Plus, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminDynamicPages = () => {
  const [dynamicPages, setDynamicPages] = useState([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    price: '',
    currency: 'INR',
    active: true,
    schema_data: {}
  });
  const [loading, setLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Ref for scroll detection
  const observerRef = useRef();

  const fetchDynamicPages = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = localStorage.getItem('token');
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      const res = await axios.get(`${base2}/admin/dynamic_pages?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const { dynamic_pages, current_page, total_pages, total_count } = res.data;

      if (append) {
        setDynamicPages(prev => [...prev, ...dynamic_pages]);
      } else {
        setDynamicPages(dynamic_pages);
      }

      setCurrentPage(current_page);
      setTotalPages(total_pages);
      setHasMore(current_page < total_pages);
      setTotalCount(total_count);
    } catch (error) {
      console.error('Error fetching dynamic pages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchDynamicPages(1);
  }, []);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    
    // Auto-generate meta description and OG data when price or currency changes
    if (name === 'price' || name === 'currency') {
      const updatedForm = { ...form, [name]: type === 'checkbox' ? checked : value };
      const generatedMetaDescription = generateMetaDescription(updatedForm);
      const generatedSchemaData = generateSchemaData(updatedForm);
      
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        meta_description: generatedMetaDescription,
        og_description: generatedMetaDescription,
        schema_data: generatedSchemaData
      }));
    }
  };

  const generateMetaDescription = (formData) => {
    if (formData.price && formData.currency) {
      const currencySymbol = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
      }[formData.currency] || '₹';
      
      return `Launch your own test portal website for under ${currencySymbol}${formData.price}. Fast, secure, and feature-rich. Get started with Talenttest.io today!`;
    }
    return formData.title || '';
  };

  const generateSchemaData = (formData) => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": formData.title,
      "image": formData.og_image || "https://talenttest.io/assets/seo-test-portal.jpg",
      "description": generateMetaDescription(formData),
      "brand": {
        "@type": "Brand",
        "name": "Talenttest.io"
      }
    };

    if (formData.price && formData.currency) {
      schema.offers = {
        "@type": "Offer",
        "priceCurrency": formData.currency,
        "price": formData.price,
        "availability": "https://schema.org/InStock",
        "url": formData.canonical_url || `https://talenttest.io/${formData.slug}`
      };
    }

    return schema;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    const payload = { dynamic_page: form };
    
    try {
      if (editingSlug) {
        await axios.put(`${base2}/admin/dynamic_pages/${editingSlug}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${base2}/admin/dynamic_pages`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({
        title: '',
        slug: '',
        content: '',
        meta_description: '',
        og_title: '',
        og_description: '',
        og_image: '',
        canonical_url: '',
        price: '',
        currency: 'INR',
        active: true,
        schema_data: {}
      });
      setEditingSlug(null);
      setShowForm(false);
      // Reset pagination and fetch first page
      setCurrentPage(1);
      setHasMore(true);
      fetchDynamicPages(1, false);
    } catch (error) {
      console.error('Error saving dynamic page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    const formData = {
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      meta_description: page.meta_description || '',
      og_title: page.og_title || '',
      og_description: page.og_description || '',
      og_image: page.og_image || '',
      canonical_url: page.canonical_url || '',
      price: page.price || '',
      currency: page.currency || 'INR',
      active: page.active,
      schema_data: page.schema_data || {}
    };

    // Generate meta description if price and currency are present
    if (formData.price && formData.currency) {
      const generatedMetaDescription = generateMetaDescription(formData);
      const generatedSchemaData = generateSchemaData(formData);
      formData.meta_description = generatedMetaDescription;
      formData.og_description = generatedMetaDescription;
      formData.schema_data = generatedSchemaData;
    }

    setForm(formData);
    setEditingSlug(page.slug);
    setShowForm(true);
  };

  const handleDelete = async (slug) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this dynamic page?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL2;
    try {
      await axios.delete(`${base2}/admin/dynamic_pages/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentPage(1);
      setHasMore(true);
      fetchDynamicPages(1, false);
      await Swal.fire('Deleted!', 'Dynamic page has been deleted.', 'success');
    } catch (error) {
      console.error('Error deleting dynamic page:', error);
      Swal.fire('Error', 'Failed to delete the page.', 'error');
    }
  };

  const handleNew = () => {
    setForm({
      title: '',
      slug: '',
      content: '',
      meta_description: '',
      og_title: '',
      og_description: '',
      og_image: '',
      canonical_url: '',
      price: '',
      currency: 'INR',
      active: true,
      schema_data: {}
    });
    setEditingSlug(null);
    setShowForm(true);
  };

  const handleView = (slug) => {
    window.open(`/${slug}`, '_blank');
  };

  const filteredPages = dynamicPages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {editingSlug ? 'Edit Dynamic Page' : 'Dynamic Pages'}
          </h2>
          <button
            onClick={handleNew}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus className="mr-2" size={16} />
            New Page
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  name="title"
                  value={form.title}
                  onChange={handleInput}
                  placeholder="Page Title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  name="slug"
                  value={form.slug}
                  onChange={handleInput}
                  placeholder="page-slug (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  name="price"
                  value={form.price}
                  onChange={handleInput}
                  placeholder="2000"
                />
                <p className="text-xs text-gray-500 mt-1">Enter price to auto-generate meta description</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  className="w-full border border-gray-300 p-2 rounded"
                  name="currency"
                  value={form.currency}
                  onChange={handleInput}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Select currency to auto-generate meta description</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded"
                  name="content"
                  value={form.content}
                  onChange={handleInput}
                  placeholder="Page content (HTML supported)"
                  rows={6}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                  <span className="text-xs text-gray-500 ml-2">(Auto-generated from price & currency)</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded bg-gray-50"
                  name="meta_description"
                  value={form.meta_description}
                  onChange={handleInput}
                  placeholder="SEO meta description (auto-generated)"
                  rows={2}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OG Title</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  name="og_title"
                  value={form.og_title}
                  onChange={handleInput}
                  placeholder="Open Graph title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OG Image</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  name="og_image"
                  value={form.og_image}
                  onChange={handleInput}
                  placeholder="https://talenttest.io/assets/image.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OG Description
                  <span className="text-xs text-gray-500 ml-2">(Auto-generated from price & currency)</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded bg-gray-50"
                  name="og_description"
                  value={form.og_description}
                  onChange={handleInput}
                  placeholder="Open Graph description (auto-generated)"
                  rows={2}
                  readOnly
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  name="canonical_url"
                  value={form.canonical_url}
                  onChange={handleInput}
                  placeholder="https://talenttest.io/page-slug"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schema Data (JSON-LD)
                  <span className="text-xs text-gray-500 ml-2">(Auto-generated from price & currency)</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded bg-gray-50 font-mono text-xs"
                  value={JSON.stringify(generateSchemaData(form), null, 2)}
                  rows={8}
                  readOnly
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleInput}
                  />
                  Active (Published)
                </label>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                  disabled={loading}
                >
                  {loading ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    editingSlug ? 'Update Page' : 'Create Page'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            All Dynamic Pages
            {totalCount > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({totalCount} total)
              </span>
            )}
          </h3>

          <input
            type="text"
            placeholder="Search by title or slug..."
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
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-200 text-gray-600">
                <tr>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Slug</th>
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, index) => (
                  <tr 
                    key={page.slug} 
                    className="border-t border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-2 px-4 font-medium">{page.title}</td>
                    <td className="py-2 px-4 text-sm text-gray-600">{page.slug}</td>
                    <td className="py-2 px-4">
                      {page.price ? `${page.currency} ${page.price}` : '-'}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        page.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {page.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        onClick={() => handleView(page.slug)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        title="View Page"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        title="Edit Page"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(page.slug)}
                        className="text-red-600 hover:underline flex items-center gap-1"
                        title="Delete Page"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPages.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-4">
                      No dynamic pages available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Buttons */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => fetchDynamicPages(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchDynamicPages(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex justify-center items-center py-4">
                <LoaderCircle className="w-5 h-5 text-gray-500 animate-spin mr-2" />
                <span className="text-gray-500">Loading more pages...</span>
              </div>
            )}
            
            {/* End of results indicator */}
            {!hasMore && dynamicPages.length > 0 && (
              <div className="text-center text-gray-500 py-4 border-t">
                No more pages to load
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDynamicPages;

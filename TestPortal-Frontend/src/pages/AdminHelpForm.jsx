import React from 'react';
import axios from 'axios';
import RichEditor from '../components/RichEditor';
import { useApiLoading } from '../hooks/useApiLoading';

function parameterize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export default function AdminHelpForm({ form, setForm, editingId, onSave }) {
  const base2 = import.meta.env.VITE_API_BASE_URL2;
  const token = localStorage.getItem('token');
  const { startLoading, stopLoading, isLoading } = useApiLoading();

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'title' && !editingId) {
      setForm(f => ({ ...f, title: value, slug: parameterize(value) }));
    } else if (name === 'slug') {
      setForm(f => ({ ...f, slug: parameterize(value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleDescriptionChange = val => setForm(f => ({ ...f, description: val }));

  const handleSubmit = async e => {
    e.preventDefault();
    startLoading();
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (editingId) { // editing
        if (!form.id) {
          console.warn('No id present in form for update!');
          alert('Error: No id present for update. Please refresh and try again.');
          return;
        }
        await axios.put(`${base2}/admin/helps/${form.id}`, { help: form }, { headers });
      } else { // creating
        await axios.post(`${base2}/admin/helps`, { help: form }, { headers });
      }
      onSave && onSave();
    } catch (error) {
      console.error('Error saving help:', error);
    } finally {
      stopLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <input className="border border-gray-300 p-2 rounded" name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
      <input className="border border-gray-300 p-2 rounded" name="video_url" value={form.video_url} onChange={handleChange} placeholder="YouTube or video URL" />
      <input className="border border-gray-300 p-2 rounded" name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (auto-generated from title, can edit)" />
      <input className="border border-gray-300 p-2 rounded" name="position" type="number" value={form.position} onChange={handleChange} placeholder="Position" />
      <div className="col-span-full">
        <RichEditor value={form.description} onChange={handleDescriptionChange} placeholder="Description" />
      </div>
      <button 
        type="submit" 
        disabled={isLoading}
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto col-span-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
} 
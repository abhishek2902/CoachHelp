import React, { useState, useEffect } from 'react';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import { LoaderCircle } from "lucide-react";
import Swal from 'sweetalert2';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ total_pages: 1, current_page: 1 });
  const [page, setPage] = useState(1);
  const base2 = import.meta.env.VITE_API_BASE_URL2;
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${base2}/api/v1/contacts?page=${page}&per_page=6`);
      const data = await response.json();
      setMessages(data.messages);
      setPagination({ total_pages: data.total_pages, current_page: data.current_page });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
    // eslint-disable-next-line
  }, [page]);

  const resolveMessage = async (id) => {
    try {
      const response = await fetch(`${base2}/api/v1/contacts/${id}/resolve`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setMessages(messages.map(msg => msg.id === id ? { ...msg, resolved: !msg.resolved } : msg));
      }
    } catch (error) {
      console.error('Error resolving message:', error);
    }
  };

  const deleteMessage = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete message #${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${base2}/api/v1/contacts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showSuccessAlert("Deleted", `Message ${id} deleted successfully`);
        setMessages(messages.filter(msg => msg.id !== id));
      } else {
        showErrorAlert("Error", `Failed to delete message ${id}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-6 mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">
          Contact Messages
        </h1>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, mobile or message..."
          className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
            {messages
              .filter((message) =>
                [message.name, message.email, message.mobile, message.message]
                  .some(field =>
                    field?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
              )
              .map((message) => (
              <div
                key={message.id}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
              >
                <div className="mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{message.name}</h2>
                  <p className="text-sm text-gray-500">{message.email}</p>
                  <p className="text-sm text-gray-500">{message.mobile}</p>
                </div>
                <p className="text-gray-700 mt-3 whitespace-pre-wrap">{message.message}</p>
                <div className="mt-auto">
                  <p className="mt-4 text-xs text-gray-400">
                    Sent on: {new Date(message.created_at).toLocaleString()}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => resolveMessage(message.id)}
                      className={`px-4 py-2 rounded-md text-white font-medium ${
                        message.resolved
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-800 hover:bg-gray-900'
                      }`}
                    >
                      {message.resolved ? 'Resolved' : 'Unresolved'}
                    </button>
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="bg-red-700 hover:bg-red-800 text-white font-medium px-4 py-2 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {messages.filter((message) =>
              [message.name, message.email, message.mobile, message.message]
                .some(field =>
                  field?.toLowerCase().includes(searchQuery.toLowerCase())
                )
            ).length === 0 && (
              <p className="text-gray-500 text-center col-span-full py-8">No matching messages found.</p>
            )}
          </div>

          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-3">
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
          )}
        </>
      )}
    </div>
  );
};

export default MessagesPage;

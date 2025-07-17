// src/pages/MockTests.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Plus, LoaderCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const MockTests = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const base = import.meta.env.VITE_API_BASE_URL;
    axios
    .get(`${base}/test_domains`)
    .then((res) => {
      setDomains(res.data);
    })
    .catch((err) => {
      Swal.fire({
        icon: "error",
        title: "Error fetching domains",
        text: err,
      });
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar tabb="mock" />
      <div className="flex-1 md:ml-50">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b pb-2 border-gray-200 gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mock Test Topics</h1>
          </div>
          {loading ? (
           <div className="flex flex-col items-center justify-center h-28 mt-4">
            <LoaderCircle className="w-10 h-10 text-gray-500 animate-spin" />
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white shadow-lg rounded-xl p-4 sm:p-5 border border-gray-200 hover:shadow-xl transition duration-200"
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-4">{domain.name}</h2>
                <div className="space-y-1 sm:space-y-2">
                  {domain.categories
                    .filter(cat => !cat.parent_id)
                    .map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/mock-tests/${domain.slug}/category/${cat.slug}`}
                        className="text-gray-800 hover:text-gray-600 cursor-pointer transition duration-150 text-sm sm:text-base block"
                      >
                        ➤ {cat.name}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockTests;
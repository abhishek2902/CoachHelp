import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';

const CategoryDetails = () => {
  const { domainSlug, categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    axios
      .get(`${base}/categories/${categorySlug}`)
      .then((res) => setCategory(res.data))
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Error fetching Details",
          text: err,
        });
        // optionally navigate to a 404 page or show an error
      });
  }, [categorySlug]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar tabb="test" />
      <div className="flex-1 md:ml-50">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4 sm:mb-6 border-b border-gray-700 pb-2">
            {category ? `Category: ${category.name}` : 'Loading category...'}
          </h1>

          {category && (
            <div>
              {/* Show nested categories if any */}
              {category.children && category.children.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-2">Subcategories</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {category.children.map(child => {
                      const isLeaf = !child.children || child.children.length === 0;
                      return (
                        <Link
                          key={child.slug}
                          to={
                            isLeaf
                              ? `/mock-tests/${domainSlug}/${child.slug}`
                              : `/mock-tests/${domainSlug}/category/${child.slug}`
                          }
                          className="block p-4 bg-white rounded shadow hover:bg-gray-100"
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show master questions only if no children */}
              {category.children && category.children.length === 0 && category.master_questions && category.master_questions.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-bold mb-2">Questions in {category.name}</h2>
                  <div className="space-y-4">
                    {category.master_questions.map((q, idx) => (
                      <div key={q.id} className="bg-gray-50 p-4 rounded shadow">
                        <div className="font-semibold mb-2">{idx + 1}. {q.content}</div>
                        {/* Add options/answer display as needed */}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {!category && <p className="text-gray-400"><div className="flex flex-col items-center justify-center h-28 mt-4"><LoaderCircle className="w-10 h-10 text-gray-500 animate-spin" /></div></p>}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;

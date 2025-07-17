import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Menu, X, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const NewTestHeader =({title,description,duration,handleSubmit,saving,sidebaropen,setSidebarOpen,testStatus,to="/test",from}) =>{

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleUnpublish = async () => {
  
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_BASE_URL;
      // debugger
      const response = await axios.patch(`${base}/tests/${slug}/unpublish`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      Swal.fire({
        icon: 'success',
        title: 'Unpublished!',
        text: response.data.message || 'Test has been moved to unpublish.',
        timer: 1500,
        showConfirmButton: false,
      });
  
      // Optionally refetch test or redirect
      navigate('/test');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to unpublish test.',
      });
    }
  };
    return <>
        {/* Static Responsive Header */}
        <div className="w-full bg-gray-100 min-h-15 max-h-15 shadow-md fixed top-0 left-0 z-30 px-4 py-3 flex flex-row items-center justify-between gap-0">
          <Link to={to}
            title="Changes will be discarded"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl shadow-sm transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          {/* Left: Title + Description */}
          
          <div className="flex-1 md:text-left sm:ml-2 min-w-0">
            <h2 className="sm:text-lg md:text-xl font-bold text-gray-800 truncate" title={title}>
              Title: {title.length > 20 ? title.slice(0, 20) + "..." : title}
            </h2>
          </div>

          {/* Right: Timer + Submit Button */}
          <div className="flex items-center gap-2">
          {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Duration Badge */}
              {from==="training"?
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full shadow-sm font-semibold">
                  ⏱
                  {Math.floor(duration / 24)}day {duration % 24}hrs
                </div>
                :
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full shadow-sm font-semibold">
                  ⏱
                  {(() => {
                    const d = parseInt(duration);
                    if (isNaN(d) || d <= 0) return "00:00:00";
                    return `${String(Math.floor(d * 60 / 3600)).padStart(2, "0")}:${String(Math.floor((d * 60 % 3600) / 60)).padStart(2, "0")}:${String(d * 60 % 60).padStart(2, "0")}`;
                  })()}
                </div>                
              }

              {/* Save as Draft */}
              {testStatus === 'published' && (
              <button
                onClick={() => handleUnpublish()}
                disabled={saving}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow transition-all ${
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-zinc-800 text-white hover:bg-zinc-900"
                }`}
              >
                UnPublish
              </button>
              )}
              {testStatus === 'draft' && (
                <>
              <button
                onClick={() => handleSubmit("draft")}
                disabled={saving}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow transition-all ${
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-zinc-800 text-white hover:bg-zinc-900"
                }`}
              >
                💾 Save as Draft
              </button>

              {/* Publish */}
              <button
                onClick={() => handleSubmit("published")}
                disabled={saving}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow transition-all ${
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600"
                }`}
              >
                🚀 Publish
              </button>
              </>
            )}
            {testStatus === 'unpublish' && (
              <span className="text-red-500 font-semibold text-sm">Test Unpublished</span>
            )}
            </div>

            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-black focus:outline-none text-2xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed top-[60px] left-0 right-0 bg-white z-50 shadow-md md:hidden px-4 py-3 flex flex-col gap-2">
          {/* Duration Badge */}
          <div className="bg-gradient-to-r w-40 from-emerald-500 to-green-600 text-white text-sm px-3 py-1.5 rounded-full shadow font-semibold">
            ⏱ Duration: {duration} min
          </div>

          {testStatus === 'published' && (
          <button
            // onClick={() => handleSubmit("unpublish")}
            onClick={() => handleUnpublish()}
            disabled={saving}
            className={`px-3 w-35 py-1.5 rounded-lg text-sm font-semibold shadow transition-all ${
              saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-zinc-800 text-white hover:bg-zinc-900"
            }`}
          >
            UnPublish
          </button>
          )}

          {testStatus === 'draft' && (
                <>
          {/* Save as Draft */}
          <button
            onClick={() => {
              handleSubmit("draft");
              setMobileMenuOpen(false);
            }}
            disabled={saving}
            className={`px-4 w-35 py-2 rounded-lg text-sm font-semibold shadow ${
              saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-zinc-800 text-white hover:bg-zinc-900"
            }`}
          >
            💾 Save as Draft
          </button>

          {/* Publish */}
          <button
            onClick={() => {
              handleSubmit("published");
              setMobileMenuOpen(false);
            }}
            disabled={saving}
            className={`px-4 w-35 py-2 rounded-lg text-sm font-semibold shadow ${
              saving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600"
            }`}
          >
            🚀 Publish
          </button>
          </>
          )}
        </div>
      )}
      {/* Transparent Click-away Area */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-transparent z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
    </>
}


export default NewTestHeader;
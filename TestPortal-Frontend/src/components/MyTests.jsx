import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { BarChart2, BarChart3, CheckIcon, Clock, CopyIcon, DiamondPlus, ListTree, LoaderCircle, MoreVertical, ScanLine, Sparkles, CopyPlus } from 'lucide-react';
import AINewTest from '../pages/AiNewTest.jsx';
import { handleUnauthorized } from '../utils/handleUnauthorized.js';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../utils/sweetAlert.js';
import Swal from 'sweetalert2';
import TrainingCardLoaderGrid from './CardLoaderGrid.jsx';
import { useApiLoading } from '../hooks/useApiLoading';

const TestCard = ({ test, isLast, onLastCardRef, tpuser, selectionMode, toggleSelect,setSelectionMode,selectedTests }) => {
  const navigate = useNavigate();
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(test.test_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const [showMenu, setShowMenu] = useState(false);
  const isSelected = selectedTests?.includes(test.id);
  const toggleMenu = () => setShowMenu(prev => !prev);

  return (
    <div
      ref={isLast ? onLastCardRef : null}
      className="relative bg-white rounded-2xl shadow-md p-4 w-full sm:w-[48%] lg:w-[31%] flex flex-col justify-between bg-gradient-to-r from-gray-50 via-white to-gray-100"
      onClick={() => showMenu && setShowMenu(false)}
    >
      {/* 3-Dot Menu */}
      <div className="absolute top-4 right-3 z-10">
        {selectionMode==="check" ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(test.id)}
            className="w-4 h-4 cursor-pointer accent-gray-500"
          />
        ) : (
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <MoreVertical className="w-5 h-5" />
          </button>
        )}

        {/* Dropdown menu */}
        {selectionMode==="dot" && showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md z-20 border border-gray-200">
            <button
              onClick={() => {
                toggleSelect(test.id);
                setShowMenu(false);
                setSelectionMode("check")
              }}
              className="flex cursor-pointer items-center align-middle w-full gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-gray-700"
            >
              <CheckIcon className="w-4 h-4 pb-0.5 text-gray-700 transition-transform group-hover:scale-110" />
              <span className="font-medium">Select</span>
            </button>
            {(test.status=="published") &&
              <Link
                to={`/result/${test.id}`}
                className="flex cursor-pointer items-center align-middle w-full gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-gray-700"
              >
                <BarChart2 className="w-4 h-5 pb-1 text-gray-700 transition-transform group-hover:scale-110" />
                <span className="font-medium">View Result</span>
              </Link>
            }
            {(test.status=="published") &&
              <div
                className="flex cursor-pointer items-center align-middle w-full gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-gray-700"
                onClick={handleCopy}
              >
                <CopyIcon className="w-4 h-4 pb-1 text-gray-700 transition-transform group-hover:scale-110" />
                <span className="font-medium">Code: {test?.test_code}</span>
              </div>
            }
            <div
                className="flex cursor-pointer items-center align-middle w-full gap-1 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-gray-700"
            >
              <Clock className="w-5 h-5 pb-1 text-gray-500 transition-transform group-hover:scale-110" />
              <span className="font-medium">Created: {test.created_at ? test.created_at.slice(0, 10) : 'N/A'}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mb-2 mr-6">
        <span className="text-xs text-gray-600 font-semibold bg-gray-100 px-2 py-0.5 rounded">
          {test.status}
        </span>
        {/*
        <span className="text-sm text-gray-500">
          Created: {test.created_at ? test.created_at.slice(0, 10) : 'N/A'}
        </span>
         */}
      </div>
      <h2 className="font-semibold text-gray-800 text-md mb-2 line-clamp-2">{test.title}</h2>
      {test.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{test.description}</p>
      )}
      <div className="flex flex-row-reverse justify-between items-center">
        <button
          onClick={() => navigate(`/test/${test.slug}`)}
          className="text-sm inline-block text-white bg-gray-600 hover:bg-gray-700 py-1 px-2 rounded"
        >
          Preview
        </button>
        {test.status=="published" && tpuser.user.subscription &&
        <button
          onClick={() => navigate(`/share-link/${test.slug}`)}
          className="text-sm inline-block text-white bg-gray-600 hover:bg-gray-700 py-1 px-2 rounded"
        >
          Generate Link
        </button>
        }
      </div>
    </div>
  );
};

const MyTests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const [showAINewTestModal, setShowAINewTestModal] = useState(false);
  const [totalTest,setTotalTest]=useState(0);
  const [totalTestRes,setTotalTestRes]=useState({});
  const tpuser = JSON.parse(localStorage.getItem("tpuser"));
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectionMode, setSelectionMode] = useState("dot");
  const { isLoading: isBulkDeleteLoading, startLoading: startBulkDeleteLoading, stopLoading: stopBulkDeleteLoading } = useApiLoading();

  const lastTestElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;
    axios
      .get(`${base}/tests/total_count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTotalTest(res.data.total_count);
        setTotalTestRes(res.data)
      })
      // .catch((err) => console.error(err))
      .catch((err) => {
          console.error(err);
      })
      .finally(() => {
      });
  },[])

  useEffect(() => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;
    setLoading(true);
    axios
      .get(`${base}/tests?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (page === 1) {
          setTests(res.data);
          setFilteredTests(res.data);
        } else {
          setTests(prev => [...prev, ...res.data]);
          setFilteredTests(prev => [...prev, ...res.data]);
        }
        setHasMore(res.data.length === 10);
      })
      // .catch((err) => console.error(err))
      .catch((err) => {
        console.log(err.response?.status)
        if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          console.error(err);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  useEffect(() => {
    filterTests();
  }, [selectedCategory, searchQuery, tests]);

  const filterTests = () => {
    let result = [...tests];

    if (selectedCategory) {
      result = result.filter((test) => test.status && test.status.toLocaleLowerCase() === selectedCategory.toLocaleLowerCase());
    }

    if (searchQuery.trim()) {
      result = result.filter((test) =>
        [test.title, test.description, test.test_code]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTests(result);

    // Update count based on selectedCategory
    if (selectedCategory) {
      const key = `${selectedCategory.toLowerCase()}_count`; // e.g., 'pending_count'
      setTotalTest(totalTestRes[key] || 0); // fallback to 0 if key not found
    } else {
      setTotalTest(totalTestRes.total_count || 0);
    }
  };

  useEffect(() => {
    !selectedTests.length && setSelectionMode("dot");
  }, [selectedTests]);

  const toggleSelect = (testId) => {
    setSelectedTests(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };
  const clearSelection = () => {
    setSelectionMode("dot");
    setSelectedTests([]);
  };

  const handleBulkDelete = async () => {
    const result = await showConfirmAlert({
      title: "Delete Selected Tests?",
      text: "This action will permanently delete all selected tests.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!result.isConfirmed) return;

    startBulkDeleteLoading();
    const token = localStorage.getItem("token");
    const base = import.meta.env.VITE_API_BASE_URL;

    try {
      const res = await axios.post(`${base}/tests/bulk_delete`, { ids: selectedTests }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { deleted_count, skipped_count, skipped_titles } = res.data;
      setSelectedTests([]);
      setPage(1);
      setSelectionMode("dot");
      if (skipped_count > 0 && deleted_count > 0) {
        Swal.fire({
          icon: "info",
          title: "Partial Delete",
          html: `✅ ${deleted_count} test(s) deleted.<br/>❌ ${skipped_count} test(s) not deleted <br/> Published and unpublished tests can't be deleted`,
          confirmButtonColor: "#4f46e5"
        });
      } else if (deleted_count > 0) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `${deleted_count} test(s) deleted successfully.`,
          confirmButtonColor: "#22c55e"
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Nothing Deleted",
          text: "No deletable tests were selected. Published/Unpublished tests can't be deleted.",
          confirmButtonColor: "#f97316"
        });
      }
    } catch (error) {
      console.error("Failed to delete tests:", error);

      showErrorAlert(
        "Failed to Delete",
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      stopBulkDeleteLoading();
    }
  };

  return (
    <>
      <div className="md:ml-50 min-h-screen pt-15 md:pt-4 px-4 py-3">
        {selectionMode ==="check" && (
          <div className="flex items-center justify-between bg-yellow-100 border border-yellow-300 p-3 mb-4 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-yellow-800">
              {selectedTests.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleteLoading}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isBulkDeleteLoading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Selected'
                )}
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-300 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6 ">
          <h1 className="text-xl font-bold">My tests ({totalTest})</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAINewTestModal(true)}
              className="flex items-center !cursor-pointer gap-2 px-4 py-2 bg-gray-800 hover: text-white rounded shadow-lg transition-all duration-300 ease-in-out active:scale-95"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-semibold tracking-wide ">Upload</span>
            </button>
            <Link
              to="/newtest"
              className="flex items-center gap-1 bg-gray-800 text-white px-3 py-2 rounded"
            >
              <DiamondPlus className="w-5 h-5" />
              New test
            </Link>
            <Link
              to="/mock"
              className="flex items-center gap-1 bg-gray-800 text-white px-3 py-2 rounded"
            >
              <CopyPlus className="w-5 h-5" />
              Clone test
            </Link>
          </div>
        </div>

        {showAINewTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
            <div className="w-full max-w-3xl p-6 rounded-2xl relative bg-white shadow-2xl animate-fade-in">
              <button
                onClick={() => setShowAINewTestModal(false)}
                className="absolute top-4 right-4 bg-gray-800 text-white rounded-full shadow p-2 z-20 hover:bg-gray-900 focus:outline-none"
                aria-label="Close"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <AINewTest onUploadSuccess={() => setShowAINewTestModal(false)} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 justify-between w-50">
            <label className="font-medium">Status</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border border-gray-300 rounded outline-none cursor-pointer"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublish">Unpublished</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-center gap-2 justify-between w-71">
            <label className="font-medium">Search</label>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border outline-none border-gray-300 rounded px-3 py-2 text-sm w-52"
            />
          </div>
        </div>

        {loading && page === 1 ? (
          <div className="flex flex-wrap gap-4 mt-6">
            <TrainingCardLoaderGrid n={totalTest !== 0 ? totalTest : 8} />
          </div>
        ) : (
          <>
            {filteredTests.length === 0 ? (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                <p className="text-gray-600 text-lg">
                  🚫 No tests available at the moment.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {filteredTests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((test, idx) => (
                  <TestCard
                    key={idx}
                    test={test}
                    isLast={idx === filteredTests.length - 1}
                    onLastCardRef={lastTestElementRef}
                    tpuser={tpuser}
                    selectionMode={selectionMode}
                    setSelectionMode={setSelectionMode}
                    selectedTests={selectedTests}
                    toggleSelect={toggleSelect}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MyTests;
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, CopyIcon, DiamondPlus, LoaderCircle, Search, Sparkles } from 'lucide-react';
import { handleUnauthorized } from '../utils/handleUnauthorized';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';
import TrainingCardLoaderGrid from '../components/TrainingCardLoaderGrid';

const TrainingCard = ({ training, isLast, onLastCardRef,to,buttonText,from }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(training.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      ref={isLast ? onLastCardRef : null}
      className="bg-white rounded-2xl shadow-md p-4 w-full sm:w-[48%] lg:w-[31%] flex flex-col justify-between bg-gradient-to-r from-gray-50 via-white to-gray-100"
    >
      {from=="create"&&
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-600 font-semibold bg-gray-100 px-2 py-0.5 rounded">
          {training.status}
        </span>
        {(training.status=="published") &&
            <div className="flex items-center gap-2 text-xs md:justify-start justify-center md:text-sm text-gray-600 min-w-0">
            <span className="truncate" title={training.code ? training.code : "Please publish to get code"}>
                {training.code ? training.code : ""}
            </span>
            {training.code && (
                <button onClick={handleCopy} className="hover:text-indigo-600 transition-colors cursor-pointer">
                {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            )}
            </div>
        }
      </div>}
      <h2 className="font-semibold text-gray-800 text-md mb-2 line-clamp-2">{training.title}</h2>
      {training.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{training.description}</p>
      )}
      <div className="flex flex-row justify-between items-center">
        <button
          onClick={() => navigate(to)}
          className="text-sm inline-block text-white bg-gray-600 hover:bg-gray-700 py-1 px-2 rounded cursor-pointer"
        >
          {buttonText}
        </button>
        {from=="create"&& (training.status=="published") &&
          <>
          <button
            onClick={() => navigate(`/training/result/${training.id}`)}
            className="text-sm inline-block text-white bg-gray-600 hover:bg-gray-700 py-1 px-2 rounded cursor-pointer"
          >
            Result
          </button>
          <button
          onClick={() => navigate(`/training/share-link/${training.code}`)}
          className="text-sm inline-block text-white bg-gray-600 hover:bg-gray-700 py-1 px-2 rounded cursor-pointer"
        >
          Send Mail
        </button>
        </>
        }        
      </div>
    </div>
  );
};

const CreatedTrainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const [mode, setMode] = useState('created');

  const lastTrainingElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const token = localStorage.getItem('token');
        const base = import.meta.env.VITE_API_BASE_URL;
        const path =
          mode === 'created'
            ? `/trainings?page=${page}`
            : `/my_trainings/enrolled?page=${page}`; // or your actual route

        const res = await axios.get(`${base}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (page === 1) {
          setTrainings(res.data);
          setFilteredTrainings(res.data);
        } else {
          setTrainings(prev => [...prev, ...res.data]);
          setFilteredTrainings(prev => [...prev, ...res.data]);
        }

        setHasMore(res.data.length === 10);
      } catch (err) {
        if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, [page]);

  return (<>
    <Sidebar  tabb="training"/>
    <div className="md:ml-50 min-h-screen pt-15 md:pt-4 px-4 py-3">
      <TrainingHeader mode={mode} filteredTrainings={filteredTrainings} setFilteredTrainings={setFilteredTrainings} trainings={trainings} from="create"/>
      <div className="bg-white rounded-2xl shadow-md p-4 w-full flex flex-col justify-between bg-gradient-to-r from-gray-100 via-white to-gray-100 mb-5">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Create the Training
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-center">
            <div className="flex gap-4">
                <Link to="/newtraining" 
                  className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition shadow-md disabled:opacity-60"
                  >
                  <DiamondPlus className="w-5 h-5" />
                  New Training
                </Link>
            </div>
          </div>
        </div>

      {loading && page === 1 ? (
        <div className="flex flex-wrap gap-4 mt-6">
          <TrainingCardLoaderGrid n={8}/>
        </div>
      ) : (
        <>
          {filteredTrainings.length === 0 ? (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
              <p className="text-gray-600 text-lg">
                🚫 No trainings available at the moment.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {filteredTrainings
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((training, idx) => (
                  <TrainingCard
                    key={training.id}
                    training={training}
                    isLast={idx === filteredTrainings.length - 1}
                    onLastCardRef={lastTrainingElementRef}
                    from="create"
                    to={`/training/${training.slug}`}
                    buttonText="Preview"
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

const EnrollTraining = () => {
  const [code, setCode] = useState('');
  const [paramscode, setparamsCode] = useState('');
  const [enrolledTrainings, setEnrolledTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageloading, setpageLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_BASE_URL;
  const [mode, setMode] = useState('enrolled');
  const [filteredTrainings, setFilteredTrainings] = useState([]);

  const fetchEnrolledTrainings = async () => {
    try {
      const res = await axios.get(`${base}/training_enrollments/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolledTrainings(res.data);
    } catch (err) {
        if (err.response?.status === 401) {
          handleUnauthorized();
        } else {
          console.error(err);
        }
    } finally{
      setpageLoading(false)
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const trainingCode = searchParams.get('code');
    if (trainingCode) {
      setparamsCode(trainingCode);
      setCode(trainingCode);
      const newPath = location.pathname;
      navigate(newPath, { replace: true });
    }
  }, [location.search]);

  // Enroll if code is preset
  useEffect(() => {
    if (code) {
      handleEnroll();
    }
  }, [paramscode]);


  useEffect(() => {
    fetchEnrolledTrainings();
  }, []);

  const handleEnroll = async () => {
    if (!code.trim()) {
      return Swal.fire('Oops', 'Please enter a training code', 'warning');
    }

    setLoading(true);

    try {
        const token = localStorage.getItem('token');

        // Step 1: Fetch user details
        const userRes = await axios.get(`${base}/accounts/give`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { first_name,last_name, email, mobile_number, organization_id } = userRes.data.user;

        // Step 2: Post enroll request with additional details
        const res = await axios.post(
            `${base}/training_enrollments/enroll`,
            {
              code,
              name:first_name+ " "+last_name,
              email,
              mobile:mobile_number,
              institute:organization_id
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          Swal.fire('Enrolled!', res.data.message || 'Successfully enrolled!', 'success');
          setCode('');
          fetchEnrolledTrainings();
        } catch (err) {
          console.log(err)
          Swal.fire('Error', err.response?.data?.error || 'Invalid or already enrolled', 'error');
        } finally {
          setLoading(false);
        }
  };

  return (<>
    <Sidebar  tabb="training"/>
    <div className="md:ml-50 min-h-screen pt-15 md:pt-4 px-4 py-3">
      <TrainingHeader mode={mode} filteredTrainings={filteredTrainings} setFilteredTrainings={setFilteredTrainings} trainings={enrolledTrainings} from="enroll"/>
        <div className="bg-white rounded-2xl shadow-md p-4 w-full flex flex-col justify-between bg-gradient-to-r from-gray-100 via-white to-gray-100 mb-5">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 flex justify-center items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Enroll in a Training
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-center">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter training code"
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        </div>

        {pageloading ? (
         <div className="flex flex-wrap gap-4 mt-6">
          <TrainingCardLoaderGrid n={8}/>
        </div>
        ) :
          filteredTrainings.length === 0 ? (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <p className="text-gray-600 text-lg">
              🚫 No trainings available at the moment.
            </p>
          </div>):
          <div className="flex flex-wrap gap-4">
            {filteredTrainings
              .map((training, idx) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  from="enroll"
                  to={`/training/attempt/${training.code}`}
                  buttonText={training.completed_at ? (training.status==="expired"?"Expired":"Completed") : "Let's Go"}
                />
              ))}
          </div>
        }
    </div>
    </>
  );
};

export { EnrollTraining };
export default CreatedTrainings;


const TrainingHeader = ({mode,filteredTrainings,setFilteredTrainings,trainings,from}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    filterTrainings();
  }, [selectedCategory, searchQuery, trainings]);

  const filterTrainings = () => {
    let result = [...trainings];

    if (selectedCategory) {
      result = result.filter((training) => training.status?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      result = result.filter((training) =>
        [training.title, training.description, training.code]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTrainings(result);
  };

  return <>
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2 bg-gray-100 p-1 rounded-full shadow-inner border border-gray-300 w-full">
        <button
          onClick={() => navigate("/enrolled-trainings")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 w-1/2
            ${mode === 'enrolled' 
              ? 'bg-gray-600 text-white shadow' 
              : 'text-gray-700 hover:bg-white hover:shadow-sm cursor-pointer'}`}
        >
          Enroll Trainings
        </button>
        <button
          onClick={() => navigate("/my-trainings")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 w-1/2
            ${mode === 'created' 
              ? 'bg-gray-600 text-white shadow' 
              : 'text-gray-700 hover:bg-white hover:shadow-sm cursor-pointer'}`}
        >
          Create Trainings
        </button>
      </div>
    </div>
    <div className="flex flex-wrap sm:justify-between justify-end mb-6 gap-4">
      <div 
      className="flex items-center gap-2 w-full sm:w-72 px-4 py-3 bg-gradient-to-r from-gray-50 via-white to-gray-100 bg-gray-100 p-1 rounded-full shadow-inner border border-gray-300"
      >
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent placeholder-gray-400 text-sm text-gray-800 
                    outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none active:outline-none active:ring-0 focus:bg-white active:bg-white"
        />
      </div>
      {from==="create" ?
      <div 
      className="flex items-center w-full sm:w-72 gap-4 justify-start px-4 py-2 bg-gradient-to-r from-gray-50 via-white to-gray-100 bg-gray-100 p-1 rounded-full shadow-inner border border-gray-300"
      >
        <label className="font-medium text-sm text-gray-700">Status</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-transparent text-sm text-gray-800 px-3 py-1 rounded-md ring-0 outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 cursor-pointer"
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="unpublish">Unpublished</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      :
      <div 
      className="flex items-center w-full sm:w-72 gap-4 justify-start px-4 py-2 bg-gradient-to-r from-gray-50 via-white to-gray-100 bg-gray-100 p-1 rounded-full shadow-inner border border-gray-300"
      >
        <label className="font-medium text-sm text-gray-700">Status</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-transparent text-sm text-gray-800 px-3 py-1 rounded-md ring-0 outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 cursor-pointer"
        >
          <option value="">All</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
          <option value="not_started">Not Started</option>
        </select>
      </div>
      }
    </div>
  </>

}
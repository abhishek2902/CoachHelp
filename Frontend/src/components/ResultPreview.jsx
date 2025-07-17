import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TestAttemptContext } from '../context/TestAttemptContext';

const ResultPreview = () => {
  const { id } = useParams(); // test ID
  const [attempts, setAttempts] = useState([]);
  const navigate = useNavigate();
  const {attemptData,loading} = useContext(TestAttemptContext);

  useEffect(() => {

    if (attemptData && !loading) {
      const filteredAttempts = attemptData.filter(attempt => attempt.test_id === parseInt(id));
      setAttempts(filteredAttempts);
    }

  }, [id, attemptData, loading]);


  const calculateDuration = (start, end) => {
    if (!start || !end) return '—';
    const minutes = Math.floor((new Date(end) - new Date(start)) / 60000);
    const sec=Math.floor((new Date(end) - new Date(start)) /1000)-minutes*60;
    // return `${minutes} min ${sec} sec`;
    return `${minutes<=0?"":minutes+" m:"}${sec < 10 ? '0' + sec : sec} s`;

  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:ml-50 pt-12 md:pt-6">
      <h1 className="text-2xl font-bold mb-4">Test Attempts</h1>
      <div className="mb-5 text-center flex gap-1.5">
          <button
            onClick={() => window.history.back()}
            className="inline-block text-white bg-gray-600 hover:bg-gray-700 font-semibold py-1 px-4 rounded-md"
          >
             Back
          </button>
        </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr className="text-left text-gray-700 text-sm">
              <th className="p-1">Sr. no</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Marks</th>
              <th className="p-3">Responses</th>
              <th className="md:p-2 p-3">Duration</th>
              <th className="md:p-2 p-3">Image</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No attempts found.
                </td>
              </tr>
            ) : (
              attempts.sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0)).map((attempt, idx) => (
                <tr key={attempt.id} className="border-t text-sm text-gray-800 hover:bg-gray-50">
                  <td className="p-1">{idx + 1}</td>
                  <td className="p-3">{attempt.name}</td>
                  <td className="p-3">{attempt.email}</td>
                  <td className="p-3 text-red-500">{attempt.marks ?? '—'}</td>
                  <td className='p-3 '>
                      <button
                        onClick={() => navigate(`/response/${attempt.id}`)}
                        className="text-sm inline-block text-white bg-gray-600 hover:bg-gray-700 py-1 px-1 rounded"
                      >
                        <span>View</span>
                      </button>
                  </td>
                  <td className="p-2">{calculateDuration(attempt.started_at, attempt.completed_at)}</td>
                  <td className="md:p-2 p-3">
                    {attempt.image_urls && attempt.image_urls.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {attempt.image_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline text-xs"
                          >
                            Link {index + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No images</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultPreview;
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Mail, User, Loader2, Send, LoaderCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function ShareTestForm() {
  const { id } = useParams();
  const base = import.meta.env.VITE_API_BASE_URL;

  const [candidates, setCandidates] = useState([{ name: '', email: '' }]);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isTraining = location.pathname.includes("/training");
  const prefix = isTraining ? "trainings" : "tests";

  const addCandidate = () => {
    if (candidates.length < 5) {
      setCandidates([...candidates, { name: '', email: '' }]);
    }
  };

  const removeCandidate = (index) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const updateCandidate = (index, field, value) => {
    const newCandidates = [...candidates];
    newCandidates[index][field] = value;
    setCandidates(newCandidates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    for (const c of candidates) {
      if (!c.name.trim() || !c.email.trim()) {
        setErrorMessage('Please fill in all candidate names and emails.');
        return;
      }
    }

    setLoading(true);

    try {
      // const response = await fetch(`${base}/tests/${id}/share`, {
      const response = await fetch(`${base}/${prefix}/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ candidates }),
      });

      if (response.ok) {
        // setStatusMessage('✅ Test links sent successfully!');
        setStatusMessage(`✅ ${isTraining ? "Training" : "Test"} links sent successfully!`);
        setCandidates([{ name: '', email: '' }]);
      } else {
        const data = await response.json();
        // setErrorMessage(data.error || '❌ Failed to send test links.');
        setErrorMessage(`❌ Failed to send ${isTraining ? "training" : "test"} links.`);
      }
    } catch (error) {
      // setErrorMessage('❌ Network error: Could not send test links.');
      setErrorMessage(`❌ Network error: Could not send ${isTraining ? "training" : "test"} links.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // const response = await fetch(`${base}/tests/${id}/download_candidates_template`, {
      const response = await fetch(`${base}/${prefix}/${id}/download_candidates_template`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'candidates_template.csv');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        setErrorMessage('Failed to download template.');
      }
    } catch (error) {
      setErrorMessage('Error occurred while downloading the template.');
    }
  };

  const handleInstantUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setStatusMessage('');
    setErrorMessage('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // const response = await fetch(`${base}/tests/${id}/upload_candidates_excel`, {
      const response = await fetch(`${base}/${prefix}/${id}/upload_candidates_excel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage(data.message);
      } else {
        setErrorMessage(data.error || '❌ Failed to upload file.');
      }
    } catch (err) {
      setErrorMessage('❌ Failed to upload file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {loading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
        <LoaderCircle className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    )}

    <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-gray-100 min-h-screen">
      <Sidebar />

      <main className="md:ml-64 flex flex-col justify-center items-center w-full p-4 md:p-8">
        <div className="w-full max-w-xl bg-gray-800 dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-10 transition-all space-y-6">
          <button
            // onClick={() => navigate("/test")}
            onClick={() => navigate(isTraining ? "/my-trainings" : "/test")}
            className="mb-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-extrabold text-gray-100 dark:text-white flex items-center gap-3">
            {/* <Send className="w-7 h-7 text-blue-600" /> Share Test Invitation */}
            <Send className="w-7 h-7 text-blue-600" /> {isTraining ? "Share Training Invitation" : "Share Test Invitation"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {candidates.map((candidate, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                <div className="flex-1 w-full">
                  <label htmlFor={`name-${idx}`} className="block text-sm font-semibold text-gray-100 dark:text-gray-300 mb-1">
                    <User className="inline w-4 h-4 mr-1" /> Candidate Name
                  </label>
                  <input
                    id={`name-${idx}`}
                    type="text"
                    value={candidate.name}
                    onChange={(e) => updateCandidate(idx, 'name', e.target.value)}
                    required
                    placeholder="Enter candidate's name"
                    className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex-1 w-full">
                  <label htmlFor={`email-${idx}`} className="block text-sm font-semibold text-gray-100 dark:text-gray-300 mb-1">
                    <Mail className="inline w-4 h-4 mr-1" /> Candidate Email
                  </label>
                  <input
                    id={`email-${idx}`}
                    type="email"
                    value={candidate.email}
                    onChange={(e) => updateCandidate(idx, 'email', e.target.value)}
                    required
                    placeholder="Enter candidate's email"
                    className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {candidates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCandidate(idx)}
                    className="md:mt-7 px-3 py-2 text-red-600 hover:text-red-800 font-semibold"
                    title="Remove this candidate"
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}

            {candidates.length < 5 && (
              <button
                type="button"
                onClick={addCandidate}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                + Add Another Candidate
              </button>
            )}

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl text-white text-base font-medium shadow-sm transition duration-300 ${
                  loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>📨 Send {isTraining ? "Training" : "Test"} Links</>}
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-medium shadow-sm transition duration-300"
              >
                📥 Download Candidate Template
              </button>

              <div>
                <label
                  htmlFor="file-upload"
                  className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-medium shadow-sm transition duration-300 cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>📤 Upload Candidate Excel</>}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleInstantUpload}
                  className="hidden"
                />
              </div>
            </div>
          </form>

          {statusMessage && (
            <div className="text-green-600 font-medium mt-3 text-center">{statusMessage}</div>
          )}
          {errorMessage && (
            <div className="text-red-600 font-medium mt-3 text-center">{errorMessage}</div>
          )}

        </div>
      </main>
    </div>
    </>
  );
}

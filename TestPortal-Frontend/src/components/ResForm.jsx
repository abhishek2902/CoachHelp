// RespondentDetailsForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import FlashMessage from './FlashMessage';
import validatePassword, { validateIndianMobile } from '../utils/validatePassword';
import { showErrorAlert } from '../utils/sweetAlert';
import { AlertTriangle, User, Mail, Phone, Building, CheckCircle, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

const RespondentDetailsForm = () => {
  const [flash, setFlash] = useState(null);
  const { test_id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccessible, setIsAccessible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    institute: '',
    confirm: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.confirm) {
      showErrorAlert("Please confirm your details.");
      return;
    }
    setIsSubmitting(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const attemptRes = await axios.post(`${base}/test_attempts`, {
        test_id: test_id,
        respondent: {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          institute: formData.institute,
        },
      });
      const guest_token = attemptRes.data.guest_token;
      const attemptId = attemptRes.data.test_attempt_id;
      
      // Store the attempt details in localStorage for the face detection page
      localStorage.setItem('current_attempt', JSON.stringify({
        attemptId,
        guest_token,
        testUrl: `/attempt/${attemptId}/${guest_token}`
      }));
      
      // Add a 5-second delay before navigating
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Redirect to face detection setup page
      navigate(`/verify-otp/${attemptId}/${guest_token}`);
    } catch (error) {
      if (error.response?.data?.error) {
        if (
          error.response.data.error === "You have already submitted this test." ||
          error.response.data.message === "You have already submitted this test."
          ) {
          showErrorAlert("This email is already registered for this test.");
      } else {
        showErrorAlert(error.response.data.message || error.response.data.error);
      }
    } else if (error.response?.data?.errors?.email) {
      showErrorAlert("This email is already registered for this test.");
    } else {
      const msg = error.response?.data?.errors || "Something went wrong";
      setFlash({ message: msg, type: 'error' });
    }
  } finally {
    setIsSubmitting(false);
  }
};

useEffect(() => {
  const checkTestAccess = async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.get(`${base}/tests/${test_id}/access_check`);

      if (res.data.accessible) {
        setIsAccessible(true);
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'This test link has expired or is invalid.',
        });
          navigate('/'); // or redirect somewhere else
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.error,
        });
        navigate('/');
      } finally {
        setIsLoading(false); // finish loading
      }
    };

    checkTestAccess();
  }, [test_id, navigate]);

if (isLoading) {
  return <div className="text-center p-8 text-lg">Checking test access...</div>;
}

return isAccessible && (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    {flash && (
      <FlashMessage
        message={flash.message}
        type={flash.type}
        onClose={() => setFlash(null)}
        time={1000}
        />
        )}

    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-2rem)]">
        {/* Instructions Section - 70% width */}
      <div className="md:w-[70%] bg-white rounded-xl shadow-lg p-6 flex flex-col overflow-y-auto thin.scrollbar">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-yellow-500" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Important Instructions</h2>
        </div>

        <div className="space-y-4 flex-grow">
          <div className="bg-gray-800 border-l-4 border-rose-600 p-4 rounded-r-lg">
            <h3 className="font-semibold text-white mb-2">Security & Monitoring</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">•</span>
                <span><strong className="text-white">Camera access is required.</strong> Your webcam will remain active throughout the test.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">•</span>
                <span><strong className="text-white">Tab switching is not allowed</strong> once the test begins.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">•</span>
                <span><strong className="text-white">No external assistance</strong> is allowed. The test is monitored for fairness.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 border-l-4 border-indigo-600 p-4 rounded-r-lg">
            <h3 className="font-semibold text-white mb-2">Setup Checklist</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-400">•</span>
                <span>Test your <strong className="text-white">camera</strong> for clarity.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-400">•</span>
                <span>Check your <strong className="text-white">microphone and earphones</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-400">•</span>
                <span>Ensure a <strong className="text-white">clean background</strong> and quiet space.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 border-l-4 border-amber-600 p-4 rounded-r-lg">
            <h3 className="font-semibold text-white mb-2">Test Guidelines</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">•</span>
                <span>The test has <strong className="text-white">multiple timed sections</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">•</span>
                <span>Manage your <strong className="text-white">time carefully</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">•</span>
                <span><strong className="text-white">Complete in one sitting.</strong></span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 border-l-4 border-emerald-600 p-4 rounded-r-lg">
            <h3 className="font-semibold text-white mb-2">Ready to Begin</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-400">•</span>
                <span>Click "Start Test" when ready — <strong className="text-white">camera will activate</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-400">•</span>
                <span><strong className="text-white">Good luck!</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

          {/* Form Section - 30% width */}
      <div className="md:w-[30%] bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Enter Your Details
          </h2>

          <div className="space-y-4">
              {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="pl-10 w-full border-2 border-gray-200 rounded-lg py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

              {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="pl-10 w-full border-2 border-gray-200 rounded-lg py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

              {/* Mobile */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile Number"
                className="pl-10 w-full border-2 border-gray-200 rounded-lg py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

              {/* Institute */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="institute"
                value={formData.institute}
                onChange={handleChange}
                placeholder="Institute/Organization"
                className="pl-10 w-full border-2 border-gray-200 rounded-lg py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>
          </div>

            {/* Confirm Checkbox */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="confirm"
              checked={formData.confirm}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="confirm">I confirm that the above details are correct</label>
          </div>

            {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-gray-800 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-200 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              Processing...
              </>
              ) : (
              <>
              Continue to Test
              <ArrowRight className="w-5 h-5" />
              </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>  
    );
};

export default RespondentDetailsForm;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import FlashMessage from './FlashMessage';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [flash, setFlash] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const { attemptId, guestToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFlash(null);

    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${base}/test_attempts/${attemptId}/verify_otp`, {
        otp: otp
      }, {
        headers: {
          'guest_token': guestToken
        }
      });

      // Redirect to face detection setup after successful verification
      navigate(`/face-detection-setup/${attemptId}/${guestToken}`);
    } catch (error) {
      const msg = error.response?.data?.error || "Something went wrong";
      setFlash({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${base}/test_attempts/${attemptId}/send_otp`, {}, {
        headers: {
          'guest_token': guestToken
        }
      });
      setTimeLeft(600); // Reset timer
      setFlash({ message: "OTP resent successfully", type: 'success' });
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to resend OTP";
      setFlash({ message: msg, type: 'error' });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-6 border border-gray-200 bg-white rounded-2xl shadow space-y-6">
        {flash && (
          <FlashMessage
            message={flash.message}
            type={flash.type}
            onClose={() => setFlash(null)}
            time={4000}
          />
        )}

        <h2 className="text-2xl font-bold text-center text-gray-700">Email Verification</h2>
        
        <p className="text-center text-gray-600">
          Please enter the OTP sent to your email address
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
              maxLength="6"
              required
            />
          </div>

          <div className="text-center text-sm text-gray-600">
            Time remaining: {formatTime(timeLeft)}
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded text-white font-medium transition duration-200 ${
              isSubmitting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-800'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={timeLeft > 0}
            className={`w-full py-2 rounded text-white font-medium transition duration-200 ${
              timeLeft > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {timeLeft > 0 ? `Resend OTP (${formatTime(timeLeft)})` : 'Resend OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification; 
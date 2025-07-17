import React, { useState } from 'react';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import FlashMessage from './FlashMessage';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [flash, setFlash] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setFlash({ message: 'Please complete the reCAPTCHA.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setFlash(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL2;
      await axios.post(
        `${baseUrl}/password`,
        {
          email,
          recaptcha_token: recaptchaToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }
        }
      );

      setOtpSent(true);
      setEmail('');
      setRecaptchaToken(null);
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || 'Something went wrong. Try again later.';
      setFlash({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-88 p-6 border border-gray-200 bg-white rounded-2xl shadow space-y-6">
        {flash && (
          <FlashMessage
            message={flash.message}
            type={flash.type}
            onClose={() => setFlash(null)}
            time={4000}
          />
        )}

        <h2 className="text-2xl font-bold text-center text-gray-700">Forgot Password</h2>

        {otpSent ? (
          <div className="text-green-600 text-center font-medium">
            ✅ An email with the reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
              theme="light"
            />

            <button
              type="submit"
              className={`cursor-pointer w-full py-2 rounded text-white font-medium transition duration-200 ${
                isSubmitting
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-800'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

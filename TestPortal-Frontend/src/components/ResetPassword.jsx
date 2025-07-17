import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import FlashMessage from './FlashMessage';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('reset_password_token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [flash, setFlash] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setFlash({ message: 'Passwords do not match.', type: 'error' });
      setError(true);
      return;
    }

    setIsSubmitting(true);
    setFlash(null);
    setError(false);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL2}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            reset_password_token: token,
            password,
            password_confirmation: confirmPassword
          }
        })
      });

      if (res.ok) {
        setSuccess(true);
        setPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await res.json();
        const errorMsg = errorData?.errors?.join(', ') || 'Unknown error';
        setFlash({ message: '❌ ' + errorMsg, type: 'error' });
        setError(true);
      }
    } catch {
      setFlash({ message: '❌ Network error. Try again.', type: 'error' });
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-88 p-6 border border-gray-200 bg-white rounded-2xl shadow space-y-6">
        {flash && (
          <FlashMessage
            message={flash.message}
            type={flash.type}
            onClose={() => setFlash(null)}
            time={4000}
          />
        )}

        <h2 className="text-2xl font-bold text-center text-gray-700">Reset Your Password</h2>

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 font-medium">
              🎉 Your password has been reset. You can now log in.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              Go to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              className={`cursor-pointer w-full py-2 rounded text-white font-medium transition duration-200 ${
                isSubmitting
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-800'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {error && !success && (
          <div className="text-center">
            <Link
              to="/login"
              className="inline-block text-sm text-gray-600 hover:underline"
            >
              Back to Login →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

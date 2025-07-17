import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import { useApiLoading } from '../hooks/useApiLoading';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const GitHubLoginButton = ({ iconOnly, setIsAuthenticated, onSuccess, referralCode }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { withLoading } = useApiLoading('github-login');

  const handleGitHubLogin = () => {
    const isCheckout = window.location.pathname === '/checkout';
    const redirect = isCheckout ? '/checkout' : '/account';
    const statePayload = {
      redirectPath: redirect,
      referralCode: referralCode || null,
    };

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email&state=${encodeURIComponent(JSON.stringify(statePayload))}`;
    if (isCheckout && location.state && location.state.plan) {
      localStorage.setItem('checkoutPlan', JSON.stringify(location.state.plan));
    }
    window.location.href = githubAuthUrl;
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const redirectTo = url.searchParams.get('state')
    let referralCode = null;

    try {
      const stateObj = JSON.parse(redirectTo);
      referralCode = stateObj.referralCode || null;
    } catch {
      console.warn('Invalid state JSON, falling back to defaults');
    }

    // Run on any page if code is present
    if (code) {
      setLoading(true);
      withLoading(async () => {
        try {
          const res = await axios.post(`${API_BASE}/auth/github`, { code, referred_by_code: referralCode });
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('email', res.data.user.email);
          localStorage.setItem('tpuser', JSON.stringify(res.data));
          showSuccessAlert('Success!', 'Logged in with GitHub');
          if (typeof onSuccess === 'function') {
            onSuccess(res.data.token, res.data.user, 'Login Successful!');
          }
          if (setIsAuthenticated) setIsAuthenticated(true);
          navigate(redirectTo);
        } catch (err) {
          showErrorAlert('Error', err.response?.data?.error || 'GitHub login failed');
        } finally {
          setLoading(false);
        }
      });
    }
  }, [navigate, location, setIsAuthenticated, onSuccess]);

  if (iconOnly) {
    return (
      <button
        onClick={handleGitHubLogin}
        className="w-12 h-12 flex items-center justify-center bg-gray-800 text-white rounded-full hover:bg-gray-900 transition"
        disabled={loading}
        title="Continue with GitHub"
      >
        {loading ? (
          <LoaderCircle className="w-8 h-8 text-gray-500 animate-spin" />
        ) : (
          <FaGithub size={28} />
        )}
      </button>
    );
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center py-2">
          <LoaderCircle className="w-10 h-10 text-gray-500 animate-spin mr-2" />
          <span>Authorizing with GitHub...</span>
        </div>
      ) : (
        <button
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
        >
          <FaGithub className="mr-2" size={20} />
          Continue with GitHub
        </button>
      )}
    </div>
  );
};

export default GitHubLoginButton; 
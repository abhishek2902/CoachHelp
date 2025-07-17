import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function GitHubCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state') || '/account';
    let redirectTo = '/account';
    let referralCode = null;

    try {
      const stateObj = JSON.parse(state);
      redirectTo = stateObj.redirect || '/account';
      referralCode = stateObj.referralCode || null;
    } catch (err) {
      console.warn('Invalid GitHub OAuth state JSON:', state);
    }


    if (code) {
      // Exchange code for token using the same endpoint as GitHubLoginButton
      axios.post(`${API_BASE}/auth/github`, { code, referred_by_code: referralCode })
        .then(res => {
          const token = res.data.token;
          const user = res.data.user;
          localStorage.setItem('token', token);
          localStorage.setItem('email', user.email);
          localStorage.setItem('tpuser', JSON.stringify(res.data));
          
          // Navigate to the intended destination
          navigate(redirectTo, { replace: true });
        })
        .catch(error => {
          console.error('GitHub callback error:', error);
          // Handle error, redirect to login
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing you in with GitHub...</p>
      </div>
    </div>
  );
} 
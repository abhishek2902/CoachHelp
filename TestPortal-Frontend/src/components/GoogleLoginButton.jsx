import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import LoaderCircle from './LoaderCircle';
import { useApiLoading } from '../hooks/useApiLoading';

const GoogleLoginButton = ({ iconOnly = false, setIsAuthenticated, onSuccess, referralCode }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { withLoading } = useApiLoading('google-login');

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      console.log('Google token response:', tokenResponse);
      
      await withLoading(async () => {
        try {
          let payload = {};
          if (tokenResponse.id_token) {
            payload = { credential: tokenResponse.id_token };
          } else if (tokenResponse.access_token) {
            payload = { access_token: tokenResponse.access_token };
          } else {
            showErrorAlert('Error', 'No valid Google token received.');
            setLoading(false);
            return;
          }

          // 👉 add referral code if present
          if (referralCode) {
            payload.referred_by_code = referralCode;
          }

          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/google`,
            payload
          );
          localStorage.setItem('jwt', res.data.token);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('email', res.data.email);
          localStorage.setItem('tpuser', JSON.stringify(res.data));
          showSuccessAlert('Success!', 'Logged in successfully');
          if (typeof onSuccess === 'function') {
            onSuccess(res.data.token, res.data.user, 'Login Successful!');
          }
          // Test the token with an authenticated request
          try {
            await axios.get(`${import.meta.env.VITE_API_BASE_URL}/accounts/give`, {
              headers: { Authorization: `Bearer ${res.data.token}` }
            });
            showSuccessAlert('Google login', 'Authenticated request succeeded!');
          } catch (err) {
            showErrorAlert('Google login Failed', err.response?.data?.error || 'Authenticated request failed');
          }
          if (setIsAuthenticated) setIsAuthenticated(true);
          // Redirect to the original page after login
          const redirectTo = localStorage.getItem('redirectAfterLogin') || '/account';
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectTo);
        } catch (error) {
          showErrorAlert('Error', error.response?.data?.error || 'Failed to login with Google');
        } finally {
          setLoading(false);
        }
      });
    },
    onError: () => {
      showErrorAlert('Error', 'Google login failed');
    },
    flow: 'implicit',
  });

  const handleLoginClick = () => {
    const isCheckout = window.location.pathname === '/checkout';
    localStorage.setItem('redirectAfterLogin', isCheckout ? '/checkout' : '/account');
    if (isCheckout && location.state && location.state.plan) {
      localStorage.setItem('checkoutPlan', JSON.stringify(location.state.plan));
    }
    login();
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleLoginClick}
        className="w-12 h-12 flex items-center justify-center bg-white border rounded-full shadow hover:bg-gray-100"
        disabled={loading}
        title="Continue with Google"
        type="button"
      >
        {loading ? (
          <LoaderCircle className="w-8 h-8 text-gray-500 animate-spin" />
        ) : (
          <FcGoogle size={28} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLoginClick}
      className="w-full flex items-center justify-center gap-2 bg-white border rounded shadow py-2 hover:bg-gray-100"
      disabled={loading}
      type="button"
    >
      {loading ? (
        <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
      ) : (
        <FcGoogle size={24} />
      )}
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginButton; 
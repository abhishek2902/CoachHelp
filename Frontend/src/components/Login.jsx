import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import FlashMessage from './FlashMessage';
import Swal from 'sweetalert2';
import GoogleLoginButton from './GoogleLoginButton';
import GitHubLoginButton from './GitHubLoginButton';
import Navbar from './Navbar';
import { useApiLoading } from '../hooks/useApiLoading';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [flash, setFlash] = useState(null);
  const { loading, withLoading } = useApiLoading('login');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    await withLoading(async () => {
      try {
        const base2 = import.meta.env.VITE_API_BASE_URL2;
        const response = await axios.post(`${base2}/login`, {
          user: { email, password },
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const token = response.headers.authorization?.split(' ')[1];
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('email', email);
          localStorage.setItem("tpuser", JSON.stringify(response.data));
          navigate('/test');
        } else {
          Swal.fire('Login failed. Token not received.');
        }
      } catch (error) {
        const msg = error.response?.data?.error || error.message || "Something went wrong";
        setFlash({ message: msg, type: 'error' });
      }
    });
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    const error = query.get("error");
    
    if (error) {
      setFlash({ message: "Google authentication failed. Please try again.", type: 'error' });
    } else if (token) {
      localStorage.setItem("token", token);
      navigate('/test');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20">
        {flash && (
          <FlashMessage
            message={flash.message}
            type={flash.type}
            onClose={() => setFlash(null)}
            time={4000}
          />
        )}
        <form
          onSubmit={handleLogin}
          className="min-w-90 w-full max-w-sm mx-auto p-6 border border-gray-200 rounded-2xl shadow space-y-6 bg-white"
        >
          <h2 className="text-2xl font-bold text-gray-700 text-center">Login</h2>

          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
{/**/}
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute top-2.5 right-3 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div className="text-right flex justify-between items-center">
            <Link to="/signup" className="text-sm text-gray-500">
              New user? <span className="underline">Sign up</span>
            </Link>
            <Link to="/forgot-password" className="text-sm text-gray-500 underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="relative text-center text-sm text-gray-400 mt-4 mb-2">
            <span className="bg-white px-2 z-10 relative">Or continue with</span>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200 -z-10"></div>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <GoogleLoginButton iconOnly />
            <GitHubLoginButton iconOnly />
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { getTokenExpiration } from '../utils/jwt';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';

const TokenRefresher = () => {
  const lastActivityRef = useRef(Date.now());
  const lastRefreshTokenRef = useRef(null);
  const intervalRef = useRef(null);
  const location = useLocation();
  const IDLE_LIMIT = (Number(import.meta.env.VITE_IDLE_LIMIT_SECONDS) || 15) * 1000; // 15s idle
  const REFRESH_WINDOW = (Number(import.meta.env.VITE_REFRESH_WINDOW_SECONDS) || 30) * 1000; // 30s before expiry

  const setGlobalAxiosAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    lastActivityRef.current = Date.now(); // treat route change as activity
    // console.log("📌 Route change detected - treated as activity");
  }, [location.pathname]);

  let refreshTimeout = null;
  const handleActivity = () => {
    lastActivityRef.current = Date.now();
    // console.log("📌 Activity detected");

    const token = localStorage.getItem('token');
    const exp = getTokenExpiration(token);
    const now = Date.now();
    const timeLeft = exp - now;

    if (timeLeft > 0 && timeLeft < REFRESH_WINDOW) {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refreshTokenIfNeeded();
      }, 500); // Wait 0.5s
    }
  };

  const refreshTokenIfNeeded = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Only attempt token refresh if not on home page
    if (location.pathname === '/') {
      return;
    }

    const exp = getTokenExpiration(token);
    const now = Date.now();
    const timeLeft = exp - now;
    const idleTime = now - lastActivityRef.current;
    const isActive = idleTime < IDLE_LIMIT;

    // console.log('🔍 Checking token refresh:', {
    //   exp,
    //   now,
    //   timeLeft,  //debugging
    //   idleTime,
    //   isActive,
    // });

    // Already refreshed this token? Skip
    if (lastRefreshTokenRef.current === token) return;

    if (timeLeft > 0 && timeLeft < REFRESH_WINDOW && isActive) {
      try {
        const base = import.meta.env.VITE_API_BASE_URL2;
        const res = await axios.post(`${base}/refresh_token`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          setGlobalAxiosAuthHeader(res.data.token);
          lastRefreshTokenRef.current = res.data.token; // 🚫 prevent repeat refreshes
          // console.log('✅ Token refreshed:', res.data.token);
        }
      } catch (err) {
        console.warn('❌ Failed to refresh token:', err);
        Swal.fire('Something Went Wrong', err);
      }
    }
  };

  useEffect(() => {
    const events = ['click', 'keydown', 'scroll', 'input', 'mousemove'];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    handleActivity();

    const token = localStorage.getItem('token');
    setGlobalAxiosAuthHeader(token);

    intervalRef.current = setInterval(refreshTokenIfNeeded, 10000); // check every 10s

    return () => {
      clearInterval(intervalRef.current);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, []);

  return null;
};

export default TokenRefresher;

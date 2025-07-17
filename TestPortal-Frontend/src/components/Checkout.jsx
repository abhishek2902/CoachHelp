import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, LoaderCircle, Trash2, User, Mail, Lock, Eye, EyeOff, CheckCircle, CreditCard, Phone, Shield, ArrowLeft, Star, Zap, Clock, Globe } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import countryList from 'react-select-country-list';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import GoogleLoginButton from './GoogleLoginButton';
import GitHubLoginButton from './GitHubLoginButton';
import { formatPrice } from '../services/currency';
import { useApiLoading } from '../hooks/useApiLoading';

// --- Configuration & Constants ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL2 = import.meta.env.VITE_API_BASE_URL2;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// --- Helper Functions & Initial State ---

const initialFormState = {
  // Auth view state
  view: 'login', // 'login' or 'signup'
  authError: '',

  // Login fields
  loginEmail: '',
  loginPassword: '',

  // Signup fields
  signupFirstName: '',
  signupLastName: '',
  signupEmail: '',
  signupMobile: '',
  signupPassword: '',
  signupConfirmPassword: '',
  signupOrganization: '',
  signupCountry: 'IN',

  // UI state
  showPassword: {}, // e.g., { password: true, confirmPassword: false }
  isOtherOrgSelected: false,
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_VIEW':
      return { ...state, view: action.view, authError: '' };
    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.error };
    case 'TOGGLE_PASSWORD_VISIBILITY':
      return {
        ...state,
        showPassword: {
          ...state.showPassword,
          [action.field]: !state.showPassword[action.field]
        }
      };
    case 'SET_OTHER_ORG':
      return { ...state, isOtherOrgSelected: action.value, signupOrganization: '' };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Helper to sanitize Razorpay description
function sanitizeDescription(str) {
  // Allow only letters, numbers, spaces, and basic punctuation
  return str.replace(/[^a-zA-Z0-9 .,:;-]/g, '');
}

// --- Main Checkout Component ---

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(() => {
    if (location.state?.plan) return location.state.plan;
    const stored = localStorage.getItem('checkoutPlan');
    if (stored) return JSON.parse(stored);
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));

  // Quick fix: re-check plan and auth state on URL change (e.g., after GitHub OAuth)
  useEffect(() => {
    // Restore plan if missing
    if (!plan) {
      const stored = localStorage.getItem('checkoutPlan');
      if (stored) {
        setPlan(JSON.parse(stored));
        localStorage.removeItem('checkoutPlan');
      }
    }
    // Re-check authentication
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, [location.search]);

  // --- State Management ---
  const [loading, setLoading] = useState(false);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // Stores the full promo object
  const [organizations, setOrganizations] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const { startLoading, stopLoading, isLoading } = useApiLoading();

  // Get tpuser from localStorage for email confirmation warning
  const tpuser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('tpuser'));
    } catch {
      return null;
    }
  }, [isAuthenticated]);

  // --- Memoized Values ---
  const countries = useMemo(() => countryList().getData(), []);

  // --- Effects ---
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/organizations`);
        setOrganizations(response.data);
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      }
    };
    fetchOrganizations();
  }, []);

  // --- Derived State & Calculations ---
  // Determine userCurrency from plan or user context
  const userCurrency = useMemo(() => {
    if (plan?.converted_currency && plan?.converted_currency !== 'INR') {
      return plan.converted_currency;
    }
    let userCountry = '';
    try {
      const tpuser = JSON.parse(localStorage.getItem('tpuser'));
      userCountry = tpuser?.user?.country || tpuser?.country || plan?.userCountry || '';
    } catch {
      userCountry = plan?.userCountry || '';
    }
    // You can expand this mapping as needed
    if (userCountry.trim().toUpperCase() === 'IN') return 'INR';
    if (userCountry.trim().toUpperCase() === 'US') return 'USD';
    return 'INR';
  }, [plan]);

  const orderTotals = useMemo(() => {
    let baseAmount = 0;
    if (userCurrency !== 'INR' && plan?.converted_price) {
      baseAmount = Number(plan.converted_price);
    } else {
      baseAmount = Number(plan?.price || 0);
    }
    const discountPercent = appliedPromo?.discount || 0;
    const discount = baseAmount * (discountPercent / 100);
    const subtotal = baseAmount - discount;
    // GST only for INR
    const gst = userCurrency === 'INR' ? subtotal * 0.18 : 0;
    const total = subtotal + gst;
    return { baseAmount, discount, discountPercent, subtotal, gst, total, gstApplicable: userCurrency === 'INR', userCurrency };
  }, [plan, appliedPromo, userCurrency]);

  // --- Event Handlers ---

  const handleAuthSuccess = (token, userData, message) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', userData.user.email);
    localStorage.setItem('tpuser', JSON.stringify(userData));
    setIsAuthenticated(true);
    Swal.fire({
      icon: 'success',
      title: message,
      text: 'You can now proceed with your purchase.',
      confirmButtonColor: '#3085d6',
    });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    setPromoError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL2}/admin/promo_codes/show`, {
        params: { code: promoCode.trim(), plan_id: plan.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.promo_code) {
        setAppliedPromo(res.data.promo_code);
      } else {
        throw new Error('Invalid or expired promo code');
      }
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err.response?.data?.error || 'Invalid or expired promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoError('');
  };

  const handlePay = async () => {
    if (!isAuthenticated) {
      Swal.fire('Please Login', 'You need to be logged in to make a payment.', 'info');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Fetch public IP
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip_address = ipData.ip;
      const { data } = await axios.post(`${API_BASE_URL}/razorpay/create_order`, {
        amount: Number(orderTotals.total.toFixed(2)),
        plan_id: plan.id,
        promo_code_id: appliedPromo?.id, // Use ID from state
        ip_address // Pass IP to backend
      },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderDetails(data); // Save backend response
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'TestPortal',
        description: sanitizeDescription(`Payment for ${plan.name}`),
        order_id: data.order_id,
        handler: async (response) => {
          setLoading(true); // Keep loading state during verification
          try {
            await axios.post(`${API_BASE_URL}/razorpay/verify_payment`,
              { ...response, plan_id: plan.id, promo_code_id: appliedPromo?.id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            await Swal.fire({
              icon: 'success',
              title: 'Payment Successful!',
              text: 'Your plan has been activated.',
              confirmButtonText: 'Go to My Account'
            });
            navigate('/account');

            // After payment success, show email confirmation prompt if needed
            if (tpuser?.user && tpuser.user.email_confirmed === false) {
              Swal.fire({
                icon: 'info',
                title: 'Confirm Your Email',
                text: 'Please confirm your email address to access your account and all features. Check your inbox for a confirmation link.',
                confirmButtonText: 'OK'
              });
            }
            const tpUser = JSON.parse(localStorage.getItem('tpuser'));
            if (tpUser && tpUser.user) {
              tpUser.user.subscription = true;
              localStorage.setItem('tpuser', JSON.stringify(tpUser));
            }
          } catch (verifyError) {
            await Swal.fire('Verification Failed', verifyError.response?.data?.errors || 'Could not verify payment.', 'error');
          } finally {
            setLoading(false);
          }
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            setLoading(false); // Only stop loading, do NOT redirect or close page
          }
        }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setLoading(false);
      Swal.fire('Payment Failed', err.response?.data?.error || 'Could not initiate payment.', 'error');
    }
  };

  // --- Render Logic ---
  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Plan Selected</h2>
          <p className="text-gray-600 mb-8">Please choose a plan to continue with your purchase.</p>
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            onClick={() => navigate('/pricing')}
          >
            Choose a Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {isAuthenticated && <Sidebar />}

      <div className="flex flex-1 items-start justify-center p-4 lg:p-8 transition-all duration-300 lg:ml-64">
        <div className="w-full max-w-7xl mx-auto">
          {/* Mobile-first grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start mb-6 lg:mb-8">
            {/* Right Side: Authentication or Payment */}
            <div className="order-2 lg:order-1">
              {isAuthenticated ? (
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-gray-100 p-6 lg:p-8">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 lg:p-6 mb-6 border border-purple-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      Promo Code
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white touch-manipulation"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        placeholder="Enter promo code"
                        disabled={applyingPromo || appliedPromo}
                      />
                      {appliedPromo ? (
                        <button
                          onClick={removePromo}
                          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                          onClick={handleApplyPromo}
                          disabled={applyingPromo}
                        >
                          {applyingPromo && <LoaderCircle className="w-4 h-4 animate-spin" />}
                          {applyingPromo ? 'Applying...' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {promoError && (
                      <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {promoError}
                      </p>
                    )}
                    {appliedPromo && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Promo code applied! {appliedPromo.discount}% discount
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-4 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 touch-manipulation"
                    onClick={handlePay}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 lg:w-6 lg:h-6" />
                        Proceed to Payment
                      </>
                    )}
                  </button>

                  <div className="mt-6 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 lg:gap-3 text-xs lg:text-sm text-gray-500 bg-gray-50 rounded-xl py-3 px-4">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure payment powered by Razorpay</span>
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <AuthSection onAuthSuccess={handleAuthSuccess} organizations={organizations} countries={countries} setIsAuthenticated={setIsAuthenticated} />
              )}
            </div>
            {/* Left Side: Plan Details & Order Summary */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-gray-100 overflow-hidden">
                <OrderSummary plan={plan} totals={orderTotals} orderDetails={orderDetails} />
              </div>
            </div>
          </div>

          {/* Bottom Navigation - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6 gap-4">
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              Back to Plans
            </button>
            
            <div className="text-center order-first sm:order-none">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Complete Your Purchase</h2>
              <p className="text-xs lg:text-sm text-gray-500">Secure checkout process</p>
            </div>

            <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
              <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <LoaderCircle className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600 text-sm lg:text-base">Please wait while we securely process your payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---

const AuthSection = ({ onAuthSuccess, organizations, countries, setIsAuthenticated }) => {
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [loading, setLoading] = useState(false);

  const handleApiCall = async (endpoint, payload, successMessage) => {
    setLoading(true);
    dispatch({ type: 'SET_AUTH_ERROR', error: '' });
    try {
      const response = await axios.post(`${API_BASE_URL2}/${endpoint}`, payload, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      const token = response.headers.authorization?.split(' ')[1];
      if (token) {
        // Store session after signup or login
        localStorage.setItem('token', token);
        localStorage.setItem('email', response.data.user?.email || response.data.email);
        localStorage.setItem('tpuser', JSON.stringify(response.data));
        setIsAuthenticated(true);
        onAuthSuccess(token, response.data, successMessage);
      } else {
        throw new Error('Authentication failed. Please try again.');
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.errors?.join(', ') || error.message;
      dispatch({ type: 'SET_AUTH_ERROR', error: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const payload = { user: { email: state.loginEmail, password: state.loginPassword } };
    handleApiCall('login', payload, 'Login Successful!');
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-gray-100 p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-6 lg:mb-8">
        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
        </div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
        <p className="text-gray-600 text-sm lg:text-base">Sign in or create an account to continue</p>
      </div>

      {/* Auth Error */}
      {state.authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{state.authError}</p>
        </div>
      )}

      {/* Auth Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'login' })}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm lg:text-base transition-all duration-200 ${
            state.view === 'login'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'signup' })}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm lg:text-base transition-all duration-200 ${
            state.view === 'signup'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Auth Forms */}
      {state.view === 'login' ? (
        <LoginForm state={state} dispatch={dispatch} onSubmit={handleLogin} loading={loading} />
      ) : (
        <SignupForm 
          onAuthSuccess={onAuthSuccess} 
          organizations={organizations} 
          countries={countries} 
          setIsAuthenticated={setIsAuthenticated} 
          dispatch={dispatch} 
        />
      )}

      {/* Social Login */}
      <div className="mt-6 lg:mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <GoogleLoginButton onSuccess={() => setIsAuthenticated(true)} />
          <GitHubLoginButton onSuccess={() => setIsAuthenticated(true)} />
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ state, dispatch, onSubmit, loading }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">Email Address</label>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full p-3 lg:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
        value={state.loginEmail}
        onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'loginEmail', value: e.target.value })}
        required
      />
    </div>

    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
      <div className="relative">
        <input
          type={state.showPassword.password ? 'text' : 'password'}
          placeholder="Enter your password"
          className="w-full p-3 lg:p-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
          value={state.loginPassword}
          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'loginPassword', value: e.target.value })}
          required
        />
        <button
          type="button"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
          onClick={() => dispatch({ type: 'TOGGLE_PASSWORD_VISIBILITY', field: 'password' })}
        >
          {state.showPassword.password ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>

    <button
      type="submit"
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none touch-manipulation"
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <LoaderCircle className="animate-spin w-5 h-5" />
          Signing In...
        </div>
      ) : (
        'Sign In'
      )}
    </button>
  </form>
);

const SignupForm = ({ onAuthSuccess, organizations, countries, setIsAuthenticated, dispatch }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitState, setSubmitState] = useState('idle');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      organization: '',
      country: 'IN',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      mobile: Yup.string().required('Mobile number is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
      organization: Yup.string().required('Organization is required'),
      country: Yup.string().required('Country is required'),
    }),
    onSubmit: async (values) => {
      setSubmitState('sending');
      try {
        const payload = {
          user: {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            mobile: values.mobile,
            password: values.password,
            password_confirmation: values.confirmPassword,
            organization_id: values.organization === 'other' ? null : values.organization,
            organization_name: values.organization === 'other' ? values.organization : null,
            country: values.country,
          }
        };
        
        const response = await axios.post(`${API_BASE_URL2}/signup`, payload, {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        });
        
        const token = response.headers.authorization?.split(' ')[1];
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('email', response.data.user?.email || response.data.email);
          localStorage.setItem('tpuser', JSON.stringify(response.data));
          setIsAuthenticated(true);
          onAuthSuccess(token, response.data, 'Account Created Successfully!');
        } else {
          // Registration succeeded, but no token (needs email confirmation)
          await Swal.fire({
            icon: 'info',
            title: 'Confirm Your Email',
            text: 'A confirmation link has been sent to your email. Please verify your email and then log in.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          });
          dispatch({ type: 'SET_VIEW', view: 'login' });
        }
      } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.errors?.join(', ') || error.message;
        Swal.fire('Registration Failed', msg, 'error');
      } finally {
        setSubmitState('idle');
      }
    },
  });

  const handleOrganizationChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue('organization', value);
    if (value === 'other') {
      dispatch({ type: 'SET_OTHER_ORG', value: true });
    } else {
      dispatch({ type: 'SET_OTHER_ORG', value: false });
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
            onChange={formik.handleChange}
            value={formik.values.firstName}
            onBlur={formik.handleBlur}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
            onChange={formik.handleChange}
            value={formik.values.lastName}
            onBlur={formik.handleBlur}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700">Mobile Number</label>
        <PhoneInput
          country={'in'}
          value={formik.values.mobile}
          onChange={(phone) => formik.setFieldValue('mobile', phone)}
          inputClass="!w-full !p-3 !border-2 !border-gray-200 !rounded-xl !focus:outline-none !focus:ring-2 !focus:ring-blue-500 !focus:border-transparent !transition-all !duration-200 !bg-gray-50 !focus:bg-white touch-manipulation"
          containerClass="w-full"
          buttonClass="!border-2 !border-gray-200 !rounded-l-xl !bg-gray-50 !focus:bg-white"
        />
        {formik.touched.mobile && formik.errors.mobile && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.mobile}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700">Organization</label>
        <select
          name="organization"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
          value={formik.values.organization}
          onChange={handleOrganizationChange}
          required
        >
          <option value="">Select Organization</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
          <option value="other">Other</option>
        </select>
        {formik.touched.organization && formik.errors.organization && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.organization}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700">Country</label>
        <select
          name="country"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
          value={formik.values.country}
          onChange={formik.handleChange}
          required
        >
          {countries.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700">Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
          onChange={formik.handleChange}
          value={formik.values.email}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
            onChange={formik.handleChange}
            value={formik.values.password}
            onBlur={formik.handleBlur}
          />
          <button
            type="button"
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {formik.touched.password && formik.errors.password && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
            onChange={formik.handleChange}
            value={formik.values.confirmPassword}
            onBlur={formik.handleBlur}
          />
          <button
            type="button"
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'login' })}
          className="text-xs text-gray-600 hover:text-blue-600 touch-manipulation"
        >
          Already have an account? <span className="font-semibold underline">Sign in</span>
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none touch-manipulation"
        disabled={submitState === 'sending'}
      >
        {submitState === 'sending' ? (
          <div className="flex items-center justify-center gap-2">
            <LoaderCircle className="animate-spin w-5 h-5" />
            Creating Account...
          </div>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
};

const OrderSummary = ({ plan, totals, orderDetails }) => {
  // Use the same currency detection logic as the main component
  const userCurrency = orderDetails?.user_currency || totals.userCurrency || 'INR';
  
  return (
    <div className="p-6 lg:p-8">
      {/* Plan Details */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl lg:rounded-3xl p-6 lg:p-8 mb-6 lg:mb-8 border border-blue-100">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{plan.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs lg:text-sm text-gray-600">
                    Valid for {Math.floor(parseInt(plan.interval) / 30)} months
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-base lg:text-lg leading-relaxed">{plan.description}</p>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 lg:px-4 py-2 rounded-full">
              {Math.floor(parseInt(plan.interval) / 30)} months
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            What's Included
          </h3>
          <div className="grid gap-3">
            {(Array.isArray(plan.features) ? plan.features : String(plan.features).split(",")).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-white/50">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 font-medium text-sm lg:text-base">{feature.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-200">
        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
          Order Summary
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium text-sm lg:text-base">Base Price</span>
            <span className="font-semibold text-gray-900 text-sm lg:text-base">
              {orderDetails
                ? formatPrice(orderDetails.base_amount, orderDetails.user_currency)
                : formatPrice(totals.baseAmount, userCurrency)}
            </span>
          </div>

          {/* Promo Code Discount */}
          {(orderDetails ? orderDetails.discount > 0 : totals.discount > 0) && (
            <div className="flex justify-between items-center py-2 bg-green-50 rounded-xl px-4">
              <span className="text-green-700 font-medium text-sm lg:text-base">
                Promo Discount ({orderDetails ? orderDetails.discount_percent : totals.discountPercent}%)
              </span>
              <span className="font-semibold text-green-700 text-sm lg:text-base">
                -{orderDetails
                  ? formatPrice(orderDetails.discount, orderDetails.user_currency)
                  : formatPrice(totals.discount, userCurrency)}
              </span>
            </div>
          )}

          {/* Subtotal after discount */}
          {(orderDetails ? orderDetails.discount > 0 : totals.discount > 0) && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700 font-medium text-sm lg:text-base">Subtotal</span>
              <span className="font-semibold text-gray-900 text-sm lg:text-base">
                {orderDetails
                  ? formatPrice(orderDetails.subtotal || (orderDetails.base_amount - orderDetails.discount), orderDetails.user_currency)
                  : formatPrice(totals.subtotal, userCurrency)}
              </span>
            </div>
          )}

          {(orderDetails ? orderDetails.gst > 0 : totals.gst > 0) && (
            <div className="flex justify-between items-center py-2 bg-blue-50 rounded-xl px-4">
              <span className="text-blue-700 font-medium text-sm lg:text-base">GST (18%)</span>
              <span className="font-semibold text-blue-700 text-sm lg:text-base">
                {orderDetails
                  ? '+' + formatPrice(orderDetails.gst, orderDetails.user_currency)
                  : '+' + formatPrice(totals.gst, userCurrency)}
              </span>
            </div>
          )}

          <div className="border-t-2 border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg lg:text-xl font-bold text-gray-900">Total Amount</span>
              <span className="text-xl lg:text-2xl font-bold text-gray-900">
                {orderDetails
                  ? formatPrice(orderDetails.total, orderDetails.user_currency)
                  : formatPrice(totals.total, userCurrency)}
              </span>
            </div>
            {(orderDetails ? orderDetails.gst > 0 : totals.gst > 0) && (
              <p className="text-right text-xs lg:text-sm text-gray-500 mt-1">(Inclusive of all taxes)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
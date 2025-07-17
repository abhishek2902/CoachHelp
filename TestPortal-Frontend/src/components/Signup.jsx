import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import FlashMessage from './FlashMessage';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css';
import countryList from 'react-select-country-list';
import GoogleLoginButton from './GoogleLoginButton';
import GitHubLoginButton from './GitHubLoginButton';
import Navbar from './Navbar';
import Swal from 'sweetalert2';
import { useApiLoading } from '../hooks/useApiLoading';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [flash, setFlash] = useState(null);
  const [submitState, setSubmitState] = useState('idle');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const referred_by_code = '';
  const [isReferralFromUrl, setIsReferralFromUrl] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { loading, withLoading } = useApiLoading('signup');

  // Fetch organizations on component mount
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${base}/organizations`);
        setOrganizations(response.data);
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      }
    };
    fetchOrganizations();
    // Check URL for referral code
    const params = new URLSearchParams(window.location.search);
    const referral = params.get("referral");

    if (referral) {
      formik.setFieldValue("referred_by_code", referral);
      setIsReferralFromUrl(true);
      setReferralCode(referral); // for auth google and github
    }
  }, []);

  const validationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobile_number: Yup.string()
    .required('Mobile number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Must include an uppercase letter')
      .matches(/[a-z]/, 'Must include a lowercase letter')
      .matches(/[0-9]/, 'Must include a number')
      .matches(/[@$!%*?&]/, 'Must include a special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
    organization: Yup.string().when('isOtherSelected', {
      is: true,
      then: Yup.string().required('Organization name is required')
    }),
    country: Yup.string().required('Country is required'),
  });

  const handleOrganizationChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "Other") {
      setIsOtherSelected(true);
      formik.setFieldValue('organization', ''); // Reset organization field
    } else {
      setIsOtherSelected(false);
      formik.setFieldValue('organization', selectedValue); // Set organization to selected org
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      mobile_number: '',
      organization: '',
      country: 'IN',
      referred_by_code: referred_by_code,
      isOtherSelected: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      await withLoading(async () => {
        try {
          setSubmitState('sending');
          const base2 = import.meta.env.VITE_API_BASE_URL2;
          await axios.post(`${base2}/signup`, {
            user: {
              email: values.email,
              password: values.password,
              first_name: values.first_name,
              last_name: values.last_name,
              mobile_number: values.mobile_number,
              organization: values.organization,
              country: values.country,
              referred_by_code: values.referred_by_code
            }
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          setSubmitState('sent');
           Swal.fire({
            icon: 'success',
            title: 'Signup Successful!',
            text: 'You got a confirmation email. Please confirm your account.',
            confirmButtonText: 'OK'
          });
          navigate('/login');
        } catch (error) {
          setSubmitState('error');
          if (error.toString().includes("422")) {
            setFlash({ message: "Email already exists!", type: 'error' });
          } else {
            setFlash({ message: "Signup failed. Please try again.", type: 'error' });
          }
        }
      });
    }
  });

  const countries = countryList().getData();

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
        <form onSubmit={formik.handleSubmit} className="sm:min-w-90 w-full max-w-sm p-6 border border-gray-300 rounded-2xl shadow space-y-4 bg-white">
          <h2 className="text-2xl font-bold text-gray-700 text-center">Create Your Account</h2>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              className="p-2 border border-gray-300 rounded"
              onChange={formik.handleChange}
              value={formik.values.first_name}
              onBlur={formik.handleBlur}
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              className="p-2 border border-gray-300 rounded"
              onChange={formik.handleChange}
              value={formik.values.last_name}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.first_name && formik.errors.first_name && <p className="text-sm text-red-600">{formik.errors.first_name}</p>}
          {formik.touched.last_name && formik.errors.last_name && <p className="text-sm text-red-600">{formik.errors.last_name}</p>}

          {/* Mobile Number */}
          {/* <input
            type="tel"
            name="mobile_number"
            placeholder="Mobile Number"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={formik.handleChange}
            value={formik.values.mobile_number}
            onBlur={formik.handleBlur}
          /> */}
          <PhoneInput
            country={'in'}
            value={formik.values.mobile_number}
            onChange={(value) => formik.setFieldValue('mobile_number', value)}
            inputClass="!w-full !h-11 !p-3 !text-base !pl-12 !border focus:!border-2 !border-gray-300 !rounded focus:!border-black focus:!outline-none"
            buttonClass="!border-r !border-gray-300"
            placeholder="Mobile Number"
          />
          {formik.touched.mobile_number && formik.errors.mobile_number && <p className="text-sm text-red-600">{formik.errors.mobile_number}</p>}

          {/* organization/Institute */}
          <div>
            <label className="block text-sm font-medium">Organization</label>
            <select
              value={isOtherSelected ? "Other" : formik.values.organization}
              onChange={handleOrganizationChange}
              className="w-full border border-gray-300 rounded px-2 py-2 bg-gray-100 text-gray-800"
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.name}>
                  {org.name}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>

            {isOtherSelected && (
              <input
                type="text"
                name="organization"
                placeholder="Organization Name (Required)"
                className="mt-2 w-full p-2 border border-gray-300 rounded"
                onChange={formik.handleChange}
                value={formik.values.organization}
                onBlur={formik.handleBlur}
              />
            )}
            {formik.touched.organization && formik.errors.organization && <p className="text-sm text-red-600">{formik.errors.organization}</p>}
          </div>

          {/* Country Dropdown */}
          <select
            name="country"
            className="w-full p-2 border border-gray-300 rounded"
            value={formik.values.country}
            onChange={formik.handleChange}
            required
          >
            {countries.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={formik.handleChange}
            value={formik.values.email}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && <p className="text-sm text-red-600">{formik.errors.email}</p>}

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className="w-full p-2 pr-10 border border-gray-300 rounded"
              onChange={formik.handleChange}
              value={formik.values.password}
              onBlur={formik.handleBlur}
            />
            <span
              className="absolute top-2.5 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {formik.touched.password && formik.errors.password && <p className="text-sm text-red-600">{formik.errors.password}</p>}

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-2 pr-10 border border-gray-300 rounded"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              onBlur={formik.handleBlur}
            />
            <span
              className="absolute top-2.5 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-sm text-red-600">{formik.errors.confirmPassword}</p>}
          <div className="relative">
            <input
              type="text"
              name="referred_by_code"
              placeholder="Referral Code"
              className={`w-full p-2 border border-gray-300 rounded ${isReferralFromUrl ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              onChange={formik.handleChange}
              value={formik.values.referred_by_code}
              onBlur={formik.handleBlur}
              disabled={isReferralFromUrl}
            />
          </div>
            {formik.touched.referred_by_code && formik.errors.referred_by_code && <p className="text-sm text-red-600">{formik.errors.referred_by_code}</p>}
          {/* Link to Login */}
          <div className="text-right">
            <Link to="/login" className="text-sm text-gray-500">Already have an account? <span className="underline">Login</span></Link>
          </div>

          {/* <button
            type="submit"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full transition-colors duration-200"
          >
            Sign Up
          </button> */}
          <button
            type="submit"
            className="cursor-pointer bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || submitState === 'sending'}
          >
            {loading || submitState === 'sending' ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="relative text-center text-sm text-gray-400 mt-4 mb-2">
            <span className="bg-white px-2 z-10 relative">Or continue with</span>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200 -z-10"></div>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <GoogleLoginButton iconOnly referralCode={referralCode} />
            <GitHubLoginButton iconOnly referralCode={referralCode} />
          </div>

        </form>
      </div>
    </div>
  );
};

export default Signup;
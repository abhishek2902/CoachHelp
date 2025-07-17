import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Smartphone, UserRound, LoaderCircle } from 'lucide-react';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../utils/sweetAlert';
import { useApiLoading } from '../hooks/useApiLoading';

const UserProfileEdit = ({ setActiveTab, account, setfetchaccountagain, fetchaccountagain, acc_loading }) => {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    gst_number: '',
    organization: '',
    password: '',
    password_confirmation: '',
    login_email_required: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [defaultData, setDefaultData] = useState({});
  const [loading, setLoading] = useState(acc_loading);
  const navigate = useNavigate();
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const { startLoading, stopLoading, isLoading } = useApiLoading();

  useEffect(() => {
    const user = {
      first_name: account.user.first_name || '',
      last_name: account.user.last_name || '',
      email: account.user.email || '',
      mobile_number: account.user.mobile_number || '',
      gst_number: account.user.gst_number || '',
      organization: account.user.organization || '',
      organizations: account.organizations || '',
      password: '',
      password_confirmation: '',
      login_email_required: account.user.login_email_required || false
    };
    setUserData(user);
    setDefaultData(user);
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleOrganizationChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setIsOtherSelected(true);
      setUserData({ ...userData, organization: '' });
    } else {
      setIsOtherSelected(false);
      setUserData({ ...userData, organization: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    startLoading();
    if (userData.password && userData.password !== userData.password_confirmation) {
      showErrorAlert('Oops!', 'Passwords do not match.');
      setLoading(false);
      stopLoading();
      return;
    }

    const updatedFields = {};
    Object.keys(userData).forEach((key) => {
      if (userData[key] && userData[key] !== defaultData[key]) {
        updatedFields[key] = userData[key];
      }
    });

    const token = localStorage.getItem('token');
    const base2 = import.meta.env.VITE_API_BASE_URL;
    axios.put(
        `${base2}/users/${account.user.id}`,
        { user: updatedFields },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        showSuccessAlert('Success!', 'Profile updated successfully.');
        setActiveTab('Overview');
        setfetchaccountagain(!fetchaccountagain);
      })
      .catch((err) => {
        const errorMessages = err.response?.data?.errors;
        if (errorMessages && Array.isArray(errorMessages)) {
          showErrorAlert('Error updating user:\n', errorMessages.join('\n'));
        } else {
          showErrorAlert('Oops!', err.message || 'Unknown error');
        }
      })
      .finally(() => {
        setLoading(false);
        stopLoading();
      });
  };

  const onImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL;

    setLoading(true);
    try {
      const res = await fetch(`${base}/accounts/upload_profile_picture`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      await res.json();
      setActiveTab('Overview');
      setfetchaccountagain(!fetchaccountagain);
    } catch (err) {
      console.error('Failed to upload profile picture', err);
    }
    finally{setLoading(false);}
  };

  const handleDeleteAccount = async () => {
    const result = await showConfirmAlert({
      title: "Are you sure?",
      text: "Are you sure you want to delete your account? This action is irreversible.",
      confirmText: "Yes, delete it",
      cancelText: "Cancel"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    startLoading();
    try {
      const base2 = import.meta.env.VITE_API_BASE_URL2;
      await axios.delete(`${base2}/admin/account`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      localStorage.removeItem('token');
      localStorage.removeItem('email');
      showSuccessAlert('Success!', 'Account deleted successfully.');
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account:', err);
      showErrorAlert('Oops!', err.message || 'Error deleting account. Please try again.');
    }
    finally{
      setLoading(false);
      stopLoading();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircle className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      <ProfileCard account={account} onImageChange={onImageChange} handleDeleteAccount={handleDeleteAccount} />
      <form onSubmit={handleSubmit} className="mt-4 bg-white/90 p-8 rounded-2xl shadow-xl border border-gray-200 w-full max-w-6xl mx-auto backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 tracking-tight">Edit Profile</h2>
        <p className="mb-6 text-gray-500">(Fill only the fields you want to change.)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="First Name" name="first_name" value={userData.first_name} onChange={handleChange} />
          <InputField label="Last Name" name="last_name" value={userData.last_name} onChange={handleChange} />
          <InputField label="Mobile" name="mobile_number" value={userData.mobile_number} onChange={handleChange} type="number" />
          <InputField label="GST Number" name="gst_number" value={userData.gst_number} onChange={handleChange} />
          <div>
            <label className="block text-sm font-medium">Organization</label>
            <select
              value={isOtherSelected ? "Other" : (userData.organization?.name || userData.organization || "")}
              onChange={handleOrganizationChange}
              className="w-full border border-gray-300 rounded px-2 py-2 bg-gray-100 text-gray-800"
            >
              <option value="" disabled>Select an organization</option>
              {userData.organizations?.map((org) => (
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
                value={typeof userData.organization === 'object' ? (userData.organization?.name || '') : (userData.organization || '')}
                onChange={handleChange}
                placeholder="Enter organization name"
                className="mt-2 w-full border border-gray-300 rounded px-2 py-2"
              />
            )}
          </div>
          <InputField label="Email" name="email" value={userData.email} onChange={handleChange} type="email" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 text-gray-800 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition shadow-sm pr-10"
                placeholder="New password"
              />
              <button
                type="button"
                className="absolute top-2.5 right-3 text-gray-500 hover:text-blue-500"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="password_confirmation"
                value={userData.password_confirmation}
                onChange={handleChange}
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 text-gray-800 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition shadow-sm pr-10"
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="absolute top-2.5 right-3 text-gray-500 hover:text-blue-500"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <input
            type="checkbox"
            id="login_email_required"
            name="login_email_required"
            checked={userData.login_email_required}
            onChange={(e) => setUserData({ ...userData, login_email_required: e.target.checked })}
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
          />
          <label htmlFor="login_email_required" className="text-sm text-gray-700 select-none">
            Require email for login
          </label>
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 bg-gray-100 px-3 py-2 text-gray-800 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition shadow-sm"
    />
  </div>
);

function ProfileCard({ account, onImageChange, handleDeleteAccount }) {
  return (
    <div className="flex flex-row items-center justify-between p-6 bg-white/90 rounded-2xl shadow-xl border border-gray-200 w-full max-w-6xl mx-auto mb-4 relative overflow-hidden backdrop-blur-md min-h-[120px]">
      <div className="flex items-center space-x-8 flex-1 min-w-0">
        <div className="relative group flex-shrink-0">
          <img
            src={account.user.profile_picture_url || 'https://freesvg.org/img/abstract-user-flat-3.png'}
            alt="Profile"
            className="w-20 h-20 rounded-2xl object-cover border-4 border-gray-200 shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-transform duration-200"
          />
          <label className="absolute bottom-2 left-14 bg-white p-1.5 rounded-full shadow cursor-pointer hover:bg-blue-100 border border-gray-200 transition-all">
            <ImagePlus className="w-6 h-6 text-blue-600" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        </div>
        <div className="flex flex-col justify-center space-y-1 min-w-0">
          <div className="flex items-center space-x-2 truncate">
            <UserRound className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-semibold text-gray-800 truncate">
              {account.user.first_name + ' ' + account.user.last_name}
            </span>
            <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 rounded-full font-semibold uppercase border border-purple-200">
              {account.user.admin ? 'admin' : 'user'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Smartphone className="w-5 h-5 text-green-500" />
            <span>{account.user.mobile_number}</span>
          </div>
        </div>
      </div>
      <button
        onClick={handleDeleteAccount}
        className=' absolute top-4 right-6'
      >
        <span className=" hidden sm:block sm:bg-gradient-to-r from-red-500 to-red-700 text-white text-sm sm:px-4 px-2 py-2 rounded-lg font-semibold shadow hover:from-red-600 hover:to-red-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200 z-10">Delete Profile</span>
        <span className="text-red-600 sm:hidden hover:text-red-400"><FaTrash /></span>
      </button>
    </div>
  );
}

export default UserProfileEdit;

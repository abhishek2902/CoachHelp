import { useEffect, useRef, useState } from 'react';
import { isLoggedIn } from '../utils/auth';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { X } from "lucide-react";
import { handleUnauthorized } from '../utils/handleUnauthorized.js';
import { User, LogOut } from "lucide-react";
import Swal from 'sweetalert2';
import { useApiLoading } from '../hooks/useApiLoading';

const Navbar = () =>{
  const [isOpen, setIsOpen] = useState(false);
  const [login,setLogin]=useState(isLoggedIn());
  const menuRef = useRef(null);
  const tpuser = JSON.parse(localStorage.getItem("tpuser"));
  const dropdownRef = useRef(null);
  const [account, setAccount] = useState({});
  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  const { loading: logoutLoading, withLoading } = useApiLoading('logout');


  const handleLogout = async () => {
    await withLoading(async () => {
      const token = localStorage.getItem('token');

      try {
        const base2 = import.meta.env.VITE_API_BASE_URL2;
        await axios.delete(`${base2}/logout`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('tpuser');
        setLogin(0);
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Logout failed:', error.response?.data || error.message);
      }
    });
  };

  useEffect(() => {
      const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
          setIsOpen(false);
          setDropdownOpen2(false);
      }
      };
      const handleScroll = () => {
          if (window.innerWidth < 768) {
              setIsOpen(false);
              setDropdownOpen2(false);
          }
      };      
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          window.removeEventListener('scroll', handleScroll);
      };
  }, []);

  useEffect(() => {
  if (login) {
    const base = import.meta.env.VITE_API_BASE_URL;
    axios.get(`${base}/accounts/give`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    .then((res) => setAccount(res.data.user))
    .catch((err) => {
      if (err.response?.status === 401) {
        // Only handle unauthorized if not on home page
        if (window.location.pathname !== '/') {
          handleUnauthorized();
        }
      } else {
        console.error(err);
      }
      console.error("Error fetching account info", err)
    });
  }
  }, [login]);

  return <nav className="bg-gray-900 fixed top-0 left-0 w-full border-gray-200 dark:bg-gray-900 dark:border-gray-700 z-50">
    <div className="max-w-screen-xl  flex flex-wrap items-center justify-between align-center mx-auto p-4  bg-gray-900 dark:bg-gray-900">
      <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/images/tplogo.png" className="h-10" alt="Logo" />
      </Link>
        
        {isOpen ? ( <button
        onClick={() => {
            setIsOpen((prev) => {
              return !prev;
            });
          }}
        type="button"
        className="inline-flex items-center p-1 w-10 h-10 hover:bg-gray-500 justify-center text-sm text-gray-100 rounded-lg md:hidden hover:outline-2  dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        aria-controls="navbar-dropdown"
        aria-expanded={isOpen}
        >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        )
        :
        ( <button
          onClick={() => {
              setIsOpen((prev) => {
                return !prev;
              });
            }}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 hover:bg-gray-500 justify-center text-sm text-gray-100 rounded-lg md:hidden  hover:outline-2 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-dropdown"
          aria-expanded={isOpen}
          >
          <span className="sr-only">Open main menu</span>
            <svg className="w-7 h-7" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
           </svg>
          </button>
          )
        }

      <div ref={menuRef} className={`${isOpen ? '' : 'hidden'} w-full md:block md:w-auto`} id="navbar-dropdown">
        <ul className="flex flex-col font-medium p-4 md:p-0 mt-2 border border-gray-100 rounded-lg  md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-transparent md:dark:bg-transparent dark:border-gray-700">
        <li className="md:hidden w-full flex justify-end"></li>

        <li>
          <Link
            to="/about"
            className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
          >
            <span className="group-hover:scale-105 transition-transform duration-300">About</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
          </Link>
        </li>

        <li>
          <Link
            to="/contact"
            className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
          >
            <span className="group-hover:scale-105 transition-transform duration-300">Contact</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
          </Link>
        </li>

        <li>
          <Link
            to="/ai-conversation-promo"
            className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
          >
            <span className="group-hover:scale-105 transition-transform duration-300">AI Chat</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
          </Link>
        </li>

        <li>
          <Link
            to="/book-demo"
            className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
          >
            <span className="group-hover:scale-105 transition-transform duration-300">Book Demo</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
          </Link>
        </li>
        {login && (
          <li>
            <Link
              to="/test"
              className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
            >
              <span className="group-hover:scale-105 transition-transform duration-300">Tests</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
            </Link>
          </li>
        )}

        {login && (
          <li>
            <Link
              to="/subscribe"
              className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
            >
              <span className="group-hover:scale-105 transition-transform duration-300">Subscribe</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
            </Link>
          </li>
        )}

        {login && (
          tpuser?.user?.admin ? (
            <li>
              <Link
                to="/admin"
                className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
              >
                <span className="group-hover:scale-105 transition-transform duration-300">Admin</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
              </Link>
            </li>
          ) : (
            <li>
              <Link
                to="/account"
                className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
              >
                <span className="group-hover:scale-105 transition-transform duration-300">Account</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
              </Link>
            </li>
          )
        )}

        <li>
          <Link
            to="/faq"
            className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
          >
            <span className="group-hover:scale-105 transition-transform duration-300">FAQ</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
          </Link>
        </li>

        {login && (
          <li>
            <Link
              to="/ai-conversation"
              className="group relative block md:py-0 py-2 px- text-white tracking-wide transition-all duration-300 ease-in-out hover:text-white"
            >
              <span className="group-hover:scale-105 transition-transform duration-300">AI Conversation</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 ease-in-out md:block hidden"></span>
            </Link>
          </li>
        )}


          {login?  
            <div className="relative md:-mt-2 md:-ml-4 " ref={dropdownRef}>
              {!dropdownOpen2 ? (
              account?.profile_picture_url ? (
                <img
                  src={account.profile_picture_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-300 shadow-md"
                  onClick={() => setDropdownOpen2(true)}
                />
              ) : (
                <div
                  className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:from-gray-600 hover:to-gray-400 transition-all duration-300"
                  onClick={() => setDropdownOpen2(true)}
                >
                  {account?.first_name?.charAt(0) || 'U'}
                </div>
              )
            ) : (
                <button
                  onClick={() => setDropdownOpen2(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow-md transition-all"
                  aria-label="Close dropdown"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {dropdownOpen2 && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-2xl shadow-xl z-50 p-5 text-sm font-sans ring-1 ring-gray-200 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                        src={account?.profile_picture_url || "https://freesvg.org/img/abstract-user-flat-3.png"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-300 shadow-md"
                        onClick={() => setDropdownOpen2(true)}
                      />
                    <div>
                      <p className="text-white font-semibold text-base">Hello, {account.first_name || 'User'}</p>
                      <p className="text-white text-xs">Welcome back!</p>
                    </div>
                  </div>

                  <hr className="my-3 border-gray-200" />

                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium tracking-wide hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="flex items-center gap-2 w-full text-left px-4.5 py-2 mt-2 rounded-lg text-red-500 font-medium tracking-wide hover:bg-red-100 hover:text-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" />
                    {logoutLoading ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          :
          <div>
            <div className="flex gap-2 mt-3 md:mt-0">
              <li>
                <Link
                  to="/login"
                  className="text-white font-semibold bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 hover:from-gray-600 hover:to-gray-400 transition-all duration-300 ease-in-out py-2 px-5 rounded shadow-lg hover:scale-105"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-white font-semibold bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 hover:from-gray-600 hover:to-gray-400 transition-all duration-300 ease-in-out py-2 px-5 rounded shadow-lg hover:scale-105"
                >
                  Sign Up
                </Link>
              </li>
            </div>
          </div>
          }
        </ul>
      </div>
    </div>
  </nav>
}

export default Navbar;
import { useState } from 'react';
import { isLoggedIn } from '../utils/auth';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, BotMessageSquare, Menu, X, UserPlus, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useApiLoading } from '../hooks/useApiLoading';

const SidebarAI = ({ tabb, floating, onCollapse }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { loading: logoutLoading, withLoading } = useApiLoading('sidebar-ai-logout');

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
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error.response?.data || error.message);
      }
    });
  };

  // If floating prop is true, render a simplified mobile menu button
  if (floating) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full h-full flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
        aria-label="Open mobile menu"
      >
        <Menu size={24} />
      </button>
    );
  }

  return (
    <>
      <div className="flex fixed bg-gray-50 ">
        <button type="button" className="top-2 left-1 z-11 inline-flex items-center p-2 mt-2 ms-3 text-sm text-white rounded-lg md:hidden bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600" onClick={() => setOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <Menu />
        </button>
      </div>
      <aside
        id="ai-sidebar"
        className="fixed top-0 left-0 z-40 h-full w-20 transition-all duration-300 bg-gray-200 dark:bg-gray-800"
        aria-label="Sidebar"
      >
        {/* Close (X) icon at the top-right */}
        <div className="flex items-center justify-end p-2 border-b border-gray-300 dark:border-gray-700">
          <button
            onClick={onCollapse}
            className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
            title="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>
        <div className="h-full px-3 py-4 overflow-y-auto scrollbar-hide flex flex-col justify-between">
          <div>
            <div className="flex justify-center fixed pr-2">
              <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse ml-1 justify-center">
                <img src="/images/tplogo33.jpeg" className="h-10 filter invert brightness-90 hover:brightness-100 dark:hidden" alt="Logo" />
                <img src="/images/tplogo33.jpeg" className="h-10 filter hover:brightness-100 hidden dark:block" alt="Logo" />
              </Link>
              <button onClick={() => setOpen(false)} className="p-1.5 px-2 bg-gray-400 md:bg-white text-white text-lg font-bold hover:bg-gray-600 transition duration-300 rounded-lg md:hidden focus:outline-none focus:ring-2 focus:ring-gray-200" >
                <ChevronLeft />
              </button>
            </div>
            <ul className="space-y-2 font-medium flex justify-between flex-col h-full mt-20">
              {isLoggedIn() && <>
                <div>
                  <li className='mt-1'>
                    <Link to="/test" className={`flex items-center justify-center p-1 text-gray-900 rounded-lg dark:text-white dark:hover:bg-gray-700 group ${tabb === "test" ? 'bg-gray-400 dark:bg-gray-500' : ''} hover:bg-gray-300`}> 
                      <svg className="w-10 h-10 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                        <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
                      </svg>
                    </Link>
                  </li>
                  <li className="mt-1">
                    <Link to="/ai-conversation" className={`flex items-center justify-center p-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 group ${tabb === "ai-conversation" ? 'bg-gray-400 dark:bg-gray-500' : 'text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white'}`}> 
                      <BotMessageSquare className="text-gray-700 dark:text-gray-100" size={40} />
                    </Link>
                  </li>
                  <li className="mt-1">
                    <Link to="/result" className={`flex items-center justify-center p-1 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group ${tabb === "result" ? 'bg-gray-400 dark:bg-gray-500' : ''}`}> 
                      <svg className="w-10 h-10 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                        <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                        <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
                      </svg>
                    </Link>
                  </li>
                  <li className='mt-1'>
                    <Link to="/account" className={`flex items-center justify-center p-1 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group ${tabb === "account" ? 'bg-gray-400 dark:bg-gray-500' : ''}`}> 
                      <svg className="w-10 h-10 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z" clipRule="evenodd"/>
                      </svg>
                    </Link>
                  </li>
                  <li className="mt-1">
                    <Link to="/analytics" className={`flex items-center justify-center p-1 rounded-lg hover:bg-gray-300 dark:hover:text-white dark:hover:bg-gray-700 group ${tabb === "analytics" ? 'bg-gray-400 dark:bg-gray-500 dark:text-white' : 'text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white'}`}> 
                      <BarChart className="text-gray-700 dark:text-gray-100" size={40} />
                    </Link>
                  </li>
                  <li className="mt-1">
                    <Link to="/referral" className={`flex items-center justify-center p-1 rounded-lg hover:bg-gray-300 dark:hover:text-white dark:hover:bg-gray-700 group ${tabb === "referral" ? 'bg-gray-400 dark:bg-gray-500 dark:text-white' : 'text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white'}`}> 
                      <UserPlus className="text-gray-700 dark:text-gray-100" size={40} />
                    </Link>
                  </li>
                </div>
                <div className='mb-2'>
                  <li>
                    <Link to="/faq" className={`flex items-center justify-center p-1 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group ${tabb === "faq" ? 'bg-gray-400 dark:bg-gray-500' : ''}`}> 
                      <BotMessageSquare className="text-gray-700 dark:text-gray-100" size={40} />
                    </Link>
                  </li>
                  <li className='mt-1'>
                    <Link to="/help" className="flex items-center justify-center p-1 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group">
                      <svg className="w-10 h-10 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z"/>
                      </svg>
                    </Link>
                  </li>
                  <li className='mt-1'>
                    <button 
                      onClick={handleLogout} 
                      disabled={logoutLoading}
                      className="flex items-center justify-center p-1 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group disabled:opacity-50 disabled:cursor-not-allowed"
                      title={logoutLoading ? 'Signing Out...' : 'Sign Out'}
                    >
                      <svg className="w-10 h-10 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
                      </svg>
                    </button>
                  </li>
                </div>
              </>}
            </ul>
          </div>
          {/* Collapse button at the bottom (optional, can remove if only want X at top) */}
        </div>
      </aside>
      {open && (
        <div className="fixed inset-0 bg-transparent z-30 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
};

export default SidebarAI; 
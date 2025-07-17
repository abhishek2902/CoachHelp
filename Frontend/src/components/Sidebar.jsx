import { useState } from 'react';
import { isLoggedIn } from '../utils/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Blocks, BotMessageSquare, Menu, Shapes, X, UserPlus } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useApiLoading } from '../hooks/useApiLoading';

const Sidebar=({tabb})=>{

   const navigate = useNavigate();
   const location = useLocation();
   const [open, setOpen] = useState(false);
   const tab = tabb;
   const { loading: logoutLoading, withLoading } = useApiLoading('sidebar-logout');

   // Hide sidebar on /ai-conversation
   if (location.pathname === '/ai-conversation') {
     return null;
   }

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

    return <>

         <div className="flex fixed bg-gray-50 ">
            {/* <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse ml-1">
               <img src="/images/tplogo.png" className="h-12 pt-2 filter invert brightness-90 hover:brightness-100" alt="Logo" />
            </Link> */}
            <button  type="button" className="top-2 left-1 z-11 inline-flex items-center p-2 mt-2 ms-3 text-sm text-white rounded-lg md:hidden bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600" onClick={() => setOpen(true)}>
               <span className="sr-only">Open sidebar</span>
               <Menu/>
            </button>
         </div>

         <aside 
            id="default-sidebar" 
            className={`  fixed top-0 left-0 z-40 w-50 h-full transition-transform -translate-x-full md:translate-x-0 transform duration-300 
               ${
                  open ? "translate-x-0" : "-translate-x-full"
               } 
               md:translate-x-0
               `} 
            aria-label="Sidebar"
            >

            <div className="h-full px-3 py-4 overflow-y-auto bg-gray-200 dark:bg-gray-800 ">

               <div className="flex justify-between fixed pr-2 ">
                  <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse mr-15 ml-1 ">
                           <img src="/images/tplogo.png" className="h-10 filter invert brightness-90 hover:brightness-100 dark:hidden" alt="Logo" />
                           <img src="/images/tplogo.png" className="h-10 filter  hover:brightness-100 hidden dark:block" alt="Logo" />
                  </Link>
                  <button onClick={() => setOpen(false)} className="p-1.5 px-2 bg-gray-400 md:bg-white text-white text-lg font-bold hover:bg-gray-600 transition duration-300  rounded-lg md:hidden  focus:outline-none focus:ring-2 focus:ring-gray-200" >
                  <X/></button>
               </div>

               <ul className="space-y-2 font-medium flex justify-between flex-col h-full">
                  {/* <% if user_signed_in? %> */}
                  {isLoggedIn() && <>
                     <div>
                        <br />
                        <br />

                        <li className='mt-2'>
                        <Link to="/test" className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white  dark:hover:bg-gray-700 group
                           ${tab === "test"? 'bg-gray-400 dark:bg-gray-500':''}
                           hover:bg-gray-300 `}
                        >
                           <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                              <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
                           </svg>
                           <span className="flex-1 ms-3 whitespace-nowrap">My Tests</span>
                        </Link>                        
                        </li>

                        <li className='mt-2'>
                        <Link to="/mock" className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white  dark:hover:bg-gray-700 group
                           ${tab === "mock"? 'bg-gray-400 dark:bg-gray-500':''}
                           hover:bg-gray-300 `}
                        >
                           <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 2a1 1 0 0 0-1 1v1H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V3a1 1 0 0 0-1-1H9zm1 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 9h6v2H7V9zm0 4h4v2H7v-2z"/>
                         </svg>

                           <span className="flex-1 ms-3 whitespace-nowrap">Mock Tests</span>
                        </Link>                        
                        </li>

                        {/* AI Conversation Link - only show if not on /ai-conversation */}
                        {location.pathname !== '/ai-conversation' && (
                          <li className="mt-2">
                            <Link
                              to="/ai-conversation"
                              className={`flex items-center p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 group
                              ${tab === "ai-conversation" ? 'bg-gray-400 dark:bg-gray-500' : 'text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white'}`}
                            >
                              <span className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                                <BotMessageSquare className="relative bottom-0.5 right-0.5" size={22} />
                              </span>
                              <span className="flex-1 ms-3 ml-3 whitespace-nowrap">
                                AI Test Gen
                              </span>
                            </Link>
                          </li>
                        )}

                        {/* <li>
                           <Link to="/respondants" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                              <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                 <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"/>
                              </svg>
                              <span className="flex-1 ms-3 whitespace-nowrap">Respondants</span>
                           </Link>
                        </li> */}

                        <li className='mt-2' >
                           <Link to="/result" className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group
                           ${tab === "result"? 'bg-gray-400 dark:bg-gray-500':''}
                           `}
                           >
                              <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                 <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                                 <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
                              </svg>
                              <span className="flex-1 ms-3 whitespace-nowrap">Results</span>
                           </Link>
                        </li>

                        <li  className='mt-2'>
                           <Link to="/account" className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group
                           ${tab === "account"? 'bg-gray-400 dark:bg-gray-500':''}
                           `}
                           >
                              <svg className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                 <path fillRule="evenodd" d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z" clipRule="evenodd"/>
                              </svg>
                              <span className="flex-1 ms-3 ml-2 whitespace-nowrap">My account</span>
                           </Link>
                        </li>

                        <li className="mt-2">
                        <Link
                        to="/analytics"
                        className={`flex items-center p-2 rounded-lg hover:bg-gray-300 dark:hover:text-white dark:hover:bg-gray-700 group
                        ${tab === "analytics" ? 'bg-gray-400 dark:bg-gray-500 dark:text-white' : 'text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white'}`}
                        >
                        <BarChart className="relative bottom-0.5 right-0.5 text-gray-700 dark:text-gray-100 " size={20} />
                        <span className="flex-1 ms-3 ml-3 whitespace-nowrap">
                        Analytics
                        </span>
                        </Link>
                        </li>

                        <li className='mt-2'>
                           <Link to="/enrolled-trainings" className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white  dark:hover:bg-gray-700 group
                              ${tab === "training"? 'bg-gray-400 dark:bg-gray-500':''}
                              hover:bg-gray-300 `}
                           >
                              <Shapes  className="relative bottom-0.5 right-0.5 text-gray-700 dark:text-gray-300 " size={25} />
                              <span className="flex-1 ms-1.5 whitespace-nowrap">Trainings</span>
                           </Link>
                        </li>
                        
                        <li className="mt-2">
                           <Link
                              to="/referral"
                              className={`flex items-center p-2 rounded-lg hover:bg-gray-300 dark:hover:text-white dark:hover:bg-gray-700 group
                              ${tab === "referral" ? 'bg-gray-400 dark:bg-gray-500 dark:text-white' : 'text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white'}`}
                           >
                              <UserPlus className="relative bottom-0.5 right-0.5 text-gray-700 dark:text-gray-100 " size={20} />
                           <span className="flex-1 ms-3 ml-3 whitespace-nowrap">
                              Referral
                           </span>
                           </Link>
                        </li>
                     </div>


                        

                        {/* {email=="admin1@testportal.com"&&<li  className='mt-2'>
                           <Link to="/admin"  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group">
                           <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 20a4 4 0 00-3.995-4H10a4 4 0 00-3.995 4M16 8a4 4 0 11-8 0 4 4 0 018 0zM21 12.5a1.5 1.5 0 00-2.5-1.06 1.5 1.5 0 000 2.12 1.5 1.5 0 002.5-1.06z" />
                           </svg>
                              <span className="flex-1 ms-3 whitespace-nowrap">Admin</span>
                           </Link>
                        </li>} */}

                  
                     <div className='mb-2'>
                        <li>
                           <Link to="/faq" className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group
                           ${tab === "faq"? 'bg-gray-400 dark:bg-gray-500':''}
                           `}
                           >
                              <span className='shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'>
                                 <BotMessageSquare className="relative bottom-0.5 right-0.5" size={25} />
                              </span>
                              <span className="flex-1 ms-3 whitespace-nowrap">FAQ</span>
                           </Link>
                        </li>
                        <li  className='mt-2'>
                           <Link to="/help" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group">
                              <svg className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                 <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z"/>
                              </svg>
                              <span className="flex-1 ms-3 whitespace-nowrap">Help</span>
                           </Link>
                        </li>
                        <li  className='mt-2'>
                           <button
                              onClick={handleLogout}
                              disabled={logoutLoading}
                              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 group disabled:opacity-50 disabled:cursor-not-allowed">
                              <svg
                                 className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                 aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 18 16">
                                 <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
                                 </svg>
                                 <span className="flex-1 ms-3 whitespace-nowrap">{logoutLoading ? 'Signing Out...' : 'Sign Out'}</span>
                              </button>
                           </li>
                     </div> 

                     

                  </>}  
               </ul>
            </div>
         </aside>


         {/* Transparent Click-away Area */}
         {open && (
            <div
               className="fixed inset-0 bg-transparent z-30 md:hidden"
               onClick={() => setOpen(false)}
            />
         )}
    </>
};


export default Sidebar;
// src/utils/handleUnauthorized.js

export const handleUnauthorized = () => {
  // Check if current route is the home page
  const currentPath = window.location.pathname;
  
  if (currentPath === '/') {
    // Don't redirect for home page, just clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('tpuser');
    return;
  }
  
  // Clear local storage or any auth-related data
  localStorage.removeItem('token');
  localStorage.removeItem('email'); // if you store user info
  localStorage.removeItem('tpuser'); // if you store user info

  // Redirect to login for all other routes
  window.location.href = '/login'; // Hard redirect to refresh app state
};

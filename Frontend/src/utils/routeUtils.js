// utils/routeUtils.js

// Define public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/help',
  '/contact',
  '/faq',
  '/pricing',
  '/about',
  '/terms',
  '/privacy',
  '/cookie-preferences',
  '/ai-conversation-promo',
  '/book-demo',
  '/solutions/educators',
  '/solutions/recruiters',
  '/solutions/online-exams',
  '/solutions/proctoring',
  '/test-portal-under-2000-inr',
  '/checkout',
  '/github-callback',
  '/login/confirmation',
  '/forgot-password',
  '/reset-password',
  '/login/password/edit'
];

// Helper function to check if current route is public
export const isPublicRoute = (pathname) => {
  // Check exact matches first
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Check dynamic routes (like /:slug)
  if (pathname.startsWith('/respondent-details/') ||
      pathname.startsWith('/face-detection-setup/') ||
      pathname.startsWith('/attempt/') ||
      pathname.startsWith('/dashboard/') ||
      pathname.startsWith('/test-attempt/') ||
      pathname.startsWith('/verify-otp/') ||
      pathname.startsWith('/response/')) {
    return true;
  }
  
  return false;
};

// Helper function to check if current route requires authentication
export const requiresAuth = (pathname) => {
  return !isPublicRoute(pathname);
}; 
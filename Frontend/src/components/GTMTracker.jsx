import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isAnalyticsAllowed } from '../utils/cookieUtils';

const GTMTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track if analytics cookies are allowed
    if (isAnalyticsAllowed() && window.dataLayer) {
      window.dataLayer.push({
        event: 'pageview',
        page: location.pathname + location.search
      });
      console.log("📊 GTM Pageview:", location.pathname + location.search)
    }
  }, [location]);

  return null;
};

export default GTMTracker;

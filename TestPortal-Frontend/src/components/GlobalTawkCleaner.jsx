import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function removeTawk() {
  if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
    window.Tawk_API.hideWidget();
  }
  document.querySelectorAll('[id^="tawk_"], .tawkchat-container, iframe[src*="tawk.to"], .tawk-widget, #tawk-bubble-container').forEach(el => el.remove());
  const tawkScript = document.querySelector('script[src*="tawk.to"]');
  if (tawkScript) tawkScript.remove();
}

function GlobalTawkCleaner() {
  const location = useLocation();

  useEffect(() => {
    let observer;
    if (location.pathname !== "/") {
      removeTawk();
      observer = new MutationObserver(removeTawk);
      observer.observe(document.body, { childList: true, subtree: true });
    }
    return () => {
      if (observer) observer.disconnect();
      if (location.pathname !== "/") {
        removeTawk();
      }
    };
  }, [location.pathname]);

  return null;
}

export default GlobalTawkCleaner;

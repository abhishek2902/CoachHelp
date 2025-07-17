import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

const TAWK_SRC = 'https://embed.tawk.to/684fff8057eabb190a26686c/1its7s3rs';

function removeTawk() {
  // Remove all Tawk scripts
  document.querySelectorAll('script[id^="tawkto-script-"]').forEach(script => script.remove());
  // Remove widget DOM
  document.querySelectorAll('[id^="tawk_"], .tawkchat-container, iframe[src*="tawk.to"], .tawk-widget, #tawk-bubble-container').forEach(el => el.remove());
  // Remove globals
  if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
    window.Tawk_API.hideWidget();
  }
  delete window.Tawk_API;
  delete window.Tawk_LoadStart;
}

function injectTawkScript(uniqueId) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `${TAWK_SRC}?cb=${Date.now()}-${Math.random().toString(36).slice(2)}`;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  script.id = uniqueId;
  document.body.appendChild(script);
  // Debug log
  console.log('[TawkWidgetLoader] Injected Tawk script:', script.id);
}

function tawkWidgetPresent() {
  return document.querySelector('[id^="tawk_"], .tawkchat-container, iframe[src*="tawk.to"], .tawk-widget, #tawk-bubble-container');
}

const TawkWidgetLoader = () => {
  const location = useLocation();
  const mountedRef = useRef(false);
  const injectTimeoutRef = useRef();
  const cleanupTimeoutRef = useRef();
  const reloadTimeoutRef = useRef();

  useEffect(() => {
    mountedRef.current = true;
    // Always remove any existing widget/script on every navigation
    removeTawk();
    if (location.pathname === "/" && !isLoggedIn()) {
      // Step 1: Wait for DOM cleanup
      cleanupTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        // Step 2: Wait for next animation frame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (!mountedRef.current) return;
          // Step 3: Inject with a unique script ID
          const uniqueId = `tawkto-script-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          injectTawkScript(uniqueId);
          // Step 4: After 2s, if widget is not present, reload page (only once)
          reloadTimeoutRef.current = setTimeout(() => {
            if (!tawkWidgetPresent() && !sessionStorage.getItem('tawkReloaded')) {
              sessionStorage.setItem('tawkReloaded', '1');
              console.warn('[TawkWidgetLoader] Widget not present after injection, reloading page...');
              window.location.reload();
            } else {
              sessionStorage.removeItem('tawkReloaded');
            }
          }, 2000);
        });
      }, 500);
    }
    return () => {
      mountedRef.current = false;
      clearTimeout(injectTimeoutRef.current);
      clearTimeout(cleanupTimeoutRef.current);
      clearTimeout(reloadTimeoutRef.current);
      removeTawk();
    };
  }, [location.pathname]);

  return null;
};

export default TawkWidgetLoader; 
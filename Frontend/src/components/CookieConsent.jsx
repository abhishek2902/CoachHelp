import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, Info, CheckCircle } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setCookiePreferences(preferences);
    setShowBanner(false);
    
    // Enable all cookies
    enableCookies();
  };

  const handleAcceptNecessary = () => {
    const preferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setCookiePreferences(preferences);
    setShowBanner(false);
    
    // Only enable necessary cookies
    enableNecessaryCookies();
  };

  const handleSavePreferences = () => {
    const preferences = {
      ...cookiePreferences,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
    
    // Enable cookies based on preferences
    if (preferences.analytics) enableAnalyticsCookies();
    if (preferences.marketing) enableMarketingCookies();
    if (preferences.functional) enableFunctionalCookies();
  };

  const enableCookies = () => {
    // Enable all types of cookies
    enableAnalyticsCookies();
    enableMarketingCookies();
    enableFunctionalCookies();
  };

  const enableNecessaryCookies = () => {
    // Necessary cookies are always enabled
    console.log('Necessary cookies enabled');
  };

  const enableAnalyticsCookies = () => {
    // Enable Google Analytics, etc.
    console.log('Analytics cookies enabled');
    // Add your analytics initialization here
  };

  const enableMarketingCookies = () => {
    // Enable marketing/tracking cookies
    console.log('Marketing cookies enabled');
    // Add your marketing cookie initialization here
  };

  const enableFunctionalCookies = () => {
    // Enable functional cookies
    console.log('Functional cookies enabled');
    // Add your functional cookie initialization here
  };

  const handlePreferenceChange = (type) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">
                      We use cookies to enhance your experience
                    </h3>
                    <p className="text-sm text-gray-300">
                      We use cookies and similar technologies to help personalize content, 
                      provide a better user experience, and analyze our traffic. 
                      <a 
                        href="/privacy" 
                        className="text-gray-300 hover:text-white underline ml-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn more
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Customize
                </button>
                <button
                  onClick={handleAcceptNecessary}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Necessary Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-300" />
                  Cookie Preferences
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div>
                        <h3 className="font-semibold text-white">Necessary Cookies</h3>
                        <p className="text-sm text-gray-300">Essential for the website to function properly</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Always Active</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    These cookies are essential for the website to function and cannot be disabled. 
                    They include security features, basic functionality, and user authentication.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-300" />
                      <div>
                        <h3 className="font-semibold text-white">Analytics Cookies</h3>
                        <p className="text-sm text-gray-300">Help us understand how visitors interact with our website</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.analytics}
                        onChange={() => handlePreferenceChange('analytics')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-300">
                    These cookies help us analyze website traffic and understand how visitors use our site. 
                    This information helps us improve our services and user experience.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-300" />
                      <div>
                        <h3 className="font-semibold text-white">Marketing Cookies</h3>
                        <p className="text-sm text-gray-300">Used to deliver personalized advertisements</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.marketing}
                        onChange={() => handlePreferenceChange('marketing')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-300">
                    These cookies are used to track visitors across websites to display relevant 
                    advertisements and measure the effectiveness of marketing campaigns.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-300" />
                      <div>
                        <h3 className="font-semibold text-white">Functional Cookies</h3>
                        <p className="text-sm text-gray-300">Enable enhanced functionality and personalization</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.functional}
                        onChange={() => handlePreferenceChange('functional')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-300">
                    These cookies enable enhanced functionality and personalization, such as 
                    remembering your preferences and settings for a better user experience.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;

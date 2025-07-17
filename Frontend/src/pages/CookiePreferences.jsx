import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Settings, Shield, Info, CheckCircle, Save, RefreshCw } from 'lucide-react';
import { 
  getCookieConsent, 
  updateCookiePreferences, 
  clearCookieConsent,
  initializeCookies 
} from '../utils/cookieUtils';

export default function CookiePreferences() {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent) {
      setCookiePreferences({
        necessary: true, // Always true
        analytics: consent.analytics || false,
        marketing: consent.marketing || false,
        functional: consent.functional || false
      });
    }
  }, []);

  const handlePreferenceChange = (type) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSavePreferences = () => {
    updateCookiePreferences(cookiePreferences);
    initializeCookies();
    setSaved(true);
    
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetPreferences = () => {
    clearCookieConsent();
    setCookiePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    });
    setSaved(true);
    
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Helmet>
        <title>Cookie Preferences | Talenttest.io</title>
        <meta name="description" content="Manage your cookie preferences and privacy settings on Talenttest.io." />
        <meta property="og:title" content="Cookie Preferences | Talenttest.io" />
        <meta property="og:description" content="Manage your cookie preferences and privacy settings on Talenttest.io." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talenttest.io/cookie-preferences" />
      </Helmet>
      
      <Navbar />
      
      <section className="relative bg-gray-900 text-white overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-purple-800 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-bg-pattern.svg')] bg-repeat" aria-hidden="true"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Cookie Preferences</h1>
          <p className="mb-4 text-lg text-gray-300">Manage your cookie preferences and control how we use cookies to enhance your experience on our website.</p>
        </div>
      </section>
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="space-y-8">
            {/* Necessary Cookies */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Necessary Cookies</h3>
                    <p className="text-sm text-gray-600">Essential for the website to function properly</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Always Active</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                These cookies are essential for the website to function and cannot be disabled. 
                They include security features, basic functionality, and user authentication.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600">Help us understand how visitors interact with our website</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cookiePreferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                These cookies help us analyze website traffic and understand how visitors use our site. 
                This information helps us improve our services and user experience.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600">Used to deliver personalized advertisements</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cookiePreferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                These cookies are used to track visitors across websites to display relevant 
                advertisements and measure the effectiveness of marketing campaigns.
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Functional Cookies</h3>
                    <p className="text-sm text-gray-600">Enable enhanced functionality and personalization</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cookiePreferences.functional}
                    onChange={() => handlePreferenceChange('functional')}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                These cookies enable enhanced functionality and personalization, such as 
                remembering your preferences and settings for a better user experience.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleResetPreferences}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Preferences
            </button>
          </div>

          {/* Success Message */}
          {saved && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Preferences saved successfully!</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            For more information about how we use cookies, please read our{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

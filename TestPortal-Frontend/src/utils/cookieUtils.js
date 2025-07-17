// Utility functions for managing cookie preferences

/**
 * Get the current cookie consent preferences
 * @returns {Object|null} Cookie preferences object or null if not set
 */
export const getCookieConsent = () => {
  try {
    const consent = localStorage.getItem('cookieConsent');
    return consent ? JSON.parse(consent) : null;
  } catch (error) {
    console.error('Error parsing cookie consent:', error);
    return null;
  }
};

/**
 * Check if a specific type of cookie is allowed
 * @param {string} cookieType - The type of cookie to check (necessary, analytics, marketing, functional)
 * @returns {boolean} Whether the cookie type is allowed
 */
export const isCookieAllowed = (cookieType) => {
  const consent = getCookieConsent();
  if (!consent) return false;
  
  // Necessary cookies are always allowed if consent exists
  if (cookieType === 'necessary') return true;
  
  return consent[cookieType] === true;
};

/**
 * Check if analytics cookies are allowed
 * @returns {boolean} Whether analytics cookies are allowed
 */
export const isAnalyticsAllowed = () => {
  return isCookieAllowed('analytics');
};

/**
 * Check if marketing cookies are allowed
 * @returns {boolean} Whether marketing cookies are allowed
 */
export const isMarketingAllowed = () => {
  return isCookieAllowed('marketing');
};

/**
 * Check if functional cookies are allowed
 * @returns {boolean} Whether functional cookies are allowed
 */
export const isFunctionalAllowed = () => {
  return isCookieAllowed('functional');
};

/**
 * Check if user has given any consent
 * @returns {boolean} Whether user has given any consent
 */
export const hasGivenConsent = () => {
  return getCookieConsent() !== null;
};

/**
 * Clear cookie consent (useful for testing or resetting preferences)
 */
export const clearCookieConsent = () => {
  localStorage.removeItem('cookieConsent');
};

/**
 * Update cookie preferences
 * @param {Object} preferences - New cookie preferences
 */
export const updateCookiePreferences = (preferences) => {
  const currentConsent = getCookieConsent() || {};
  const updatedConsent = {
    ...currentConsent,
    ...preferences,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('cookieConsent', JSON.stringify(updatedConsent));
};

/**
 * Get consent timestamp
 * @returns {string|null} ISO timestamp when consent was given
 */
export const getConsentTimestamp = () => {
  const consent = getCookieConsent();
  return consent?.timestamp || null;
};

/**
 * Check if consent is older than specified days
 * @param {number} days - Number of days to check
 * @returns {boolean} Whether consent is older than specified days
 */
export const isConsentExpired = (days = 365) => {
  const timestamp = getConsentTimestamp();
  if (!timestamp) return true;
  
  const consentDate = new Date(timestamp);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - days);
  
  return consentDate < expiryDate;
};

/**
 * Initialize cookies based on current preferences
 * This function should be called after the app loads to enable cookies based on user preferences
 */
export const initializeCookies = () => {
  const consent = getCookieConsent();
  if (!consent) return;
  
  // Enable cookies based on preferences
  if (consent.analytics) {
    // Initialize analytics cookies (Google Analytics, etc.)
    console.log('Initializing analytics cookies');
    // Add your analytics initialization here
  }
  
  if (consent.marketing) {
    // Initialize marketing cookies
    console.log('Initializing marketing cookies');
    // Add your marketing cookie initialization here
  }
  
  if (consent.functional) {
    // Initialize functional cookies
    console.log('Initializing functional cookies');
    // Add your functional cookie initialization here
  }
  
  // Necessary cookies are always enabled
  console.log('Necessary cookies are always enabled');
}; 
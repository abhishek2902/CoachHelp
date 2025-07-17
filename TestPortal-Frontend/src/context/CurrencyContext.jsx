import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectUserCurrency, formatPrice, getCurrencySymbol } from '../services/currency';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [userCurrency, setUserCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        setLoading(true);
        
        // Always use IP-based detection first
        const { currency, symbol } = await detectUserCurrency();
        setUserCurrency(currency);
        setCurrencySymbol(symbol);
        
        // Clear any stored selected country since we're using location-based detection
        localStorage.removeItem('temp_selected_country');
        setSelectedCountry(null);
      } catch (err) {
        console.error('Failed to detect user currency:', err);
        setError(err.message);
        // Fallback to INR
        setUserCurrency('INR');
        setCurrencySymbol('₹');
      } finally {
        setLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  const formatPriceWithCurrency = (price, currency = userCurrency) => {
    return formatPrice(price, currency);
  };

  const getSymbol = (currency = userCurrency) => {
    return getCurrencySymbol(currency);
  };

  const setSelectedCountryForCurrency = (country) => {
    setSelectedCountry(country);
    // Don't store or use selected country for currency detection
    // Currency will be determined by IP-based location detection
  };

  const clearSelectedCountry = () => {
    setSelectedCountry(null);
    localStorage.removeItem('temp_selected_country');
  };

  const value = {
    userCurrency,
    currencySymbol,
    loading,
    error,
    selectedCountry,
    formatPrice: formatPriceWithCurrency,
    getSymbol,
    setUserCurrency: (currency) => {
      setUserCurrency(currency);
      setCurrencySymbol(getCurrencySymbol(currency));
    },
    setSelectedCountryForCurrency,
    clearSelectedCountry
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 
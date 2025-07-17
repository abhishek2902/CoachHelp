import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Cache for currency data
let currencyCache = {
  userCurrency: null,
  symbol: null,
  lastDetected: null
};

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const detectUserCurrency = async () => {
  // Check cache first
  if (currencyCache.userCurrency && currencyCache.lastDetected) {
    const now = Date.now();
    if (now - currencyCache.lastDetected < CACHE_DURATION) {
      return {
        currency: currencyCache.userCurrency,
        symbol: currencyCache.symbol
      };
    }
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/currency/detect`);
    const { currency, symbol } = response.data;
    
    // Update cache
    currencyCache = {
      userCurrency: currency,
      symbol: symbol,
      lastDetected: Date.now()
    };
    
    return { currency, symbol };
  } catch (error) {
    console.error('Error detecting user currency:', error);
    // Return default values
    return { currency: 'USD', symbol: '$' };
  }
};

export const convertPrice = async (priceInINR, targetCurrency) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/currency/convert`, {
      params: {
        price: priceInINR,
        currency: targetCurrency
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error converting price:', error);
    return null;
  }
};

export const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/currency/rate`, {
      params: {
        from: fromCurrency,
        to: toCurrency
      }
    });
    return response.data.rate;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return null;
  }
};

export const formatPrice = (price, currency = 'INR') => {
  if (!price || isNaN(price)) return '₹0';
  
  const numPrice = parseFloat(price);
  
  try {
    // Use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: currency.toUpperCase() === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency.toUpperCase() === 'JPY' ? 0 : 2,
    });
    return formatter.format(numPrice);
  } catch (error) {
    // Fallback to manual formatting if Intl.NumberFormat fails
    console.warn('Currency formatting failed, using fallback:', error);
    switch (currency.toUpperCase()) {
      case 'USD':
        return `$${numPrice.toFixed(2)}`;
      case 'EUR':
        return `€${numPrice.toFixed(2)}`;
      case 'GBP':
        return `£${numPrice.toFixed(2)}`;
      case 'CAD':
        return `C$${numPrice.toFixed(2)}`;
      case 'AUD':
        return `A$${numPrice.toFixed(2)}`;
      case 'JPY':
        return `¥${Math.round(numPrice)}`;
      case 'INR':
      default:
        return `₹${numPrice.toFixed(2)}`;
    }
  }
};

export const getCurrencySymbol = (currency) => {
  const symbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥'
  };
  return symbols[currency.toUpperCase()] || currency;
};

// Clear cache (useful for testing or when you want fresh data)
export const clearCurrencyCache = () => {
  currencyCache = {
    userCurrency: null,
    symbol: null,
    lastDetected: null
  };
}; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, LoaderCircle, Trash2, CreditCard, Shield, Globe, ArrowLeft, Star, CheckCircle, Zap } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import { formatPrice } from '../services/currency';

const TOKEN_MIN = 2000;
const TOKEN_MAX = 1000000;

const TokenCheckout = () => {
  const navigate = useNavigate();
  const [tokenAmount, setTokenAmount] = useState(TOKEN_MIN);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Get token rate from env or fallback
  const TOKEN_RATE = Number(import.meta.env.VITE_API_RATE) || 1;

  // GST logic: Only apply GST if userCountry is IN
  let userCountry = '';
  try {
    const tpuser = JSON.parse(localStorage.getItem('tpuser'));
    if (tpuser && tpuser.user && tpuser.user.country) {
      userCountry = tpuser.user.country;
    } else if (tpuser && tpuser.country) {
      userCountry = tpuser.country;
    }
  } catch {
    userCountry = '';
  }
  const effectiveCountry = (userCountry || '').trim().toUpperCase();
  const gstApplicable = effectiveCountry === 'IN';

  // Price calculations
  const baseAmount = tokenAmount * TOKEN_RATE;
  const discount = +(baseAmount * (discountPercent / 100));
  const subtotal = baseAmount - discount;
  const gst = gstApplicable ? +(subtotal * 0.18) : 0;
  const total = subtotal + gst;

  // Use backend-calculated values if available, otherwise fallback to local
  const userCurrency = orderDetails ? orderDetails.user_currency : (gstApplicable ? 'INR' : 'USD');
  const isINR = userCurrency === 'INR';

  const baseAmountDisplay = orderDetails
    ? (isINR ? orderDetails.base_amount : orderDetails.converted_base_amount)
    : baseAmount;
  const discountDisplay = orderDetails
    ? (isINR ? orderDetails.discount : orderDetails.converted_discount)
    : discount;
  const discountPercentDisplay = orderDetails
    ? (orderDetails.discount_percent ?? 0)
    : discountPercent;
  const subtotalDisplay = orderDetails
    ? (isINR ? orderDetails.subtotal : orderDetails.converted_subtotal)
    : subtotal;
  const gstDisplay = orderDetails
    ? (isINR ? orderDetails.gst : orderDetails.converted_gst)
    : gst;
  const totalDisplay = orderDetails
    ? (isINR ? orderDetails.total : orderDetails.converted_amount)
    : total;

  // Helper to sanitize Razorpay description
  function sanitizeDescription(str) {
    // Allow only letters, numbers, spaces, and basic punctuation
    return str.replace(/[^a-zA-Z0-9 .,:;-]/g, '');
  }

  const handleApplyPromo = async () => {
    setApplying(true);
    setError('');
    setDiscountPercent(0);
    try {
      const token = localStorage.getItem('token');
      const basePromo = import.meta.env.VITE_API_BASE_URL2;
      const res = await axios.get(
        `${basePromo}/admin/promo_codes/show`,
        {
          params: { code: promoCode.trim() },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (res.data && res.data.promo_code && res.data.promo_code.discount) {
        setDiscountPercent(res.data.promo_code.discount);
        setError('');
      } else {
        setDiscountPercent(0);
        setError('Invalid or expired promo code');
      }
    } catch {
      setDiscountPercent(0);
      setError('Invalid or expired promo code');
    }
    setApplying(false);
  };

  const handlePay = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const baseOrder = import.meta.env.VITE_API_BASE_URL;
    let promoCodeId = undefined;
    
    try {
      if (promoCode.trim()) {
        try {
          // Fetch promo code by code to get its ID
          const basePromo = import.meta.env.VITE_API_BASE_URL2;
          const promoRes = await axios.get(
            `${basePromo}/admin/promo_codes/show`,
            {
              params: { code: promoCode.trim() },
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (promoRes.data && promoRes.data.promo_code && promoRes.data.promo_code.id) {
            promoCodeId = promoRes.data.promo_code.id;
          }
        } catch {
          // fallback: ignore promo code if not found
        }
      }

      // Fetch public IP
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip_address = ipData.ip;
      
      // Always send the discounted amount (total) to backend for order creation
      const { data } = await axios.post(
        `${baseOrder}/razorpay/create_order`,
        {
          amount: Number(total.toFixed(2)), // Use the discounted total
          tokens: tokenAmount,
          promo_code_id: promoCodeId,
          ip_address // Pass IP to backend
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setOrderDetails(data); // Save backend response
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.payment_currency || 'INR',
        name: 'TestPortal',
        description: sanitizeDescription(`Purchase ${tokenAmount} tokens`),
        order_id: data.order_id,
        handler: async (response) => {
          setLoading(true);
          try {
            await axios.post(
              `${baseOrder}/razorpay/verify_payment`,
              {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                tokens: tokenAmount,
                promo_code_id: promoCodeId
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            await Swal.fire({
              icon: 'success',
              title: 'Payment Successful!',
              text: 'Tokens Added',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Go to Wallet'
            });
            navigate('/account?from_purchase=true');
          } catch (verifyError) {
            await Swal.fire({
              icon: 'error',
              title: 'Payment Verification Failed',
              text: verifyError.response?.data?.errors || 'Could not verify payment.',
              confirmButtonColor: '#d33',
            });
          } finally {
            setLoading(false);
          }
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      setLoading(false);
      await Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: error.response?.data?.error || error.response?.data?.errors || 'Something went wrong during payment.',
        confirmButtonColor: '#d33',
      });
    }
  };

  // Modern token amount editor
  const handleTokenChange = (val) => {
    let value = parseInt(val, 10);
    if (isNaN(value) || value < TOKEN_MIN) value = TOKEN_MIN;
    if (value > TOKEN_MAX) value = TOKEN_MAX;
    setTokenAmount(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      
      <div className="flex flex-1 items-start justify-center p-4 lg:p-8 transition-all duration-300 lg:ml-64">
        <div className="w-full max-w-7xl mx-auto">
          {/* Mobile-first grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start mb-6 lg:mb-8">
            {/* Right Side: Token Purchase Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-gray-100 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Buy Tokens</h2>
                    <p className="text-gray-600 text-sm lg:text-base">Purchase tokens for your account</p>
                  </div>
                </div>

                {/* Token Amount Editor - Mobile Optimized */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Token Amount</label>
                  <div className="flex flex-col items-center gap-4 w-full">
                    {/* Mobile-friendly token controls */}
                    <div className="flex items-center gap-2 w-full max-w-xs">
                      <button
                        type="button"
                        className="flex-1 px-4 py-4 lg:px-6 lg:py-3 bg-gray-200 rounded-l-2xl text-xl lg:text-2xl font-bold hover:bg-gray-300 transition-colors touch-manipulation"
                        onClick={() => handleTokenChange(tokenAmount - 100)}
                        disabled={tokenAmount <= TOKEN_MIN}
                      >-</button>
                      <input
                        type="number"
                        min={TOKEN_MIN}
                        max={TOKEN_MAX}
                        value={tokenAmount}
                        onChange={e => handleTokenChange(Math.max(TOKEN_MIN, Math.min(TOKEN_MAX, Number(e.target.value))))}
                        className="flex-1 text-center border-2 border-gray-200 py-4 lg:py-3 text-lg lg:text-xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 touch-manipulation"
                      />
                      <button
                        type="button"
                        className="flex-1 px-4 py-4 lg:px-6 lg:py-3 bg-gray-200 rounded-r-2xl text-xl lg:text-2xl font-bold hover:bg-gray-300 transition-colors touch-manipulation"
                        onClick={() => handleTokenChange(tokenAmount + 100)}
                        disabled={tokenAmount >= TOKEN_MAX}
                      >+</button>
                    </div>
                    <input
                      type="range"
                      min={TOKEN_MIN}
                      max={TOKEN_MAX}
                      value={tokenAmount}
                      onChange={e => handleTokenChange(Number(e.target.value))}
                      className="w-full accent-blue-600 touch-manipulation"
                    />
                    <div className="text-xs lg:text-sm text-gray-500 text-center">Min: {TOKEN_MIN}, Max: {TOKEN_MAX}</div>
                  </div>
                </div>

                {/* Promo Code Section - Mobile Optimized */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 lg:p-6 mb-6 border border-purple-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    Promo Code
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 lg:py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white touch-manipulation"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      disabled={applying || discountPercent > 0}
                    />
                    {discountPercent > 0 ? (
                      <button
                        onClick={() => {
                          setPromoCode('');
                          setDiscountPercent(0);
                          setError('');
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                        disabled={applying}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                        onClick={handleApplyPromo}
                        disabled={applying}
                      >
                        {applying && <LoaderCircle className="w-4 h-4 animate-spin" />}
                        {applying ? 'Applying...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {error}
                    </p>
                  )}
                  {discountPercent > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Promo code applied! {discountPercent}% discount
                      </p>
                    </div>
                  )}
                </div>

                <button
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-4 lg:py-5 rounded-2xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 touch-manipulation"
                  onClick={handlePay}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 lg:w-6 lg:h-6" />
                      Proceed to Payment
                    </>
                  )}
                </button>

                <div className="mt-6 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 lg:gap-3 text-xs lg:text-sm text-gray-500 bg-gray-50 rounded-xl py-3 px-4">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure payment powered by Razorpay</span>
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Left Side: Token Details & Order Summary */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 lg:p-8">
                  {/* Token Details */}
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl lg:rounded-3xl p-6 lg:p-8 mb-6 lg:mb-8 border border-blue-100">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Star className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{tokenAmount} Tokens</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs lg:text-sm text-gray-600">
                                Rate: {formatPrice(TOKEN_RATE, userCurrency)} per token
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
                          Purchase tokens to use for creating tests, accessing premium features, and more.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                        What You Get
                      </h3>
                      <div className="grid gap-3">
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-white/50">
                          <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 font-medium text-sm lg:text-base">{tokenAmount} tokens added to your wallet</span>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-white/50">
                          <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 font-medium text-sm lg:text-base">Use tokens for test creation and premium features</span>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl border border-white/50">
                          <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 font-medium text-sm lg:text-base">Tokens never expire</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-200">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                      Order Summary
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 font-medium text-sm lg:text-base">Base Price</span>
                        <span className="font-semibold text-gray-900 text-sm lg:text-base">
                          {formatPrice(baseAmountDisplay, userCurrency)}
                        </span>
                      </div>

                      {discountDisplay > 0 && (
                        <div className="flex justify-between items-center py-2 bg-green-50 rounded-xl px-4">
                          <span className="text-green-700 font-medium text-sm lg:text-base">
                            Promo Discount ({discountPercentDisplay}%)
                          </span>
                          <span className="font-semibold text-green-700 text-sm lg:text-base">
                            -{formatPrice(discountDisplay, userCurrency)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 font-medium text-sm lg:text-base">Subtotal</span>
                        <span className="font-semibold text-gray-900 text-sm lg:text-base">
                          {formatPrice(subtotalDisplay, userCurrency)}
                        </span>
                      </div>

                      {gstDisplay > 0 && (
                        <div className="flex justify-between items-center py-2 bg-yellow-50 rounded-xl px-4">
                          <span className="text-yellow-700 font-medium text-sm lg:text-base">GST (18%)</span>
                          <span className="font-semibold text-yellow-700 text-sm lg:text-base">
                            +{formatPrice(gstDisplay, userCurrency)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-4 pt-4">
                        <span className="text-gray-900 font-bold text-base lg:text-lg">Total</span>
                        <span className="font-bold text-gray-900 text-base lg:text-lg">
                          {formatPrice(totalDisplay, userCurrency)}
                        </span>
                      </div>

                      {/* Show original INR amount for non-INR users */}
                      {!isINR && orderDetails?.total && orderDetails?.converted_amount && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="text-xs text-gray-500 text-center">
                            Original: {formatPrice(orderDetails.total, 'INR')} (INR)
                            {orderDetails.exchange_rate && (
                              <span className="block mt-1">
                                Rate: 1 INR = {orderDetails.exchange_rate} {userCurrency}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6 gap-4">
            <button
              onClick={() => navigate('/account')}
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              Back to Account
            </button>
            
            <div className="text-center order-first sm:order-none">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Complete Your Token Purchase</h2>
              <p className="text-xs lg:text-sm text-gray-500">Secure checkout process</p>
            </div>

            <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
              <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <LoaderCircle className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600 text-sm lg:text-base">Please wait while we securely process your payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenCheckout; 
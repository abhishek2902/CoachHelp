import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Star, LoaderCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { fetchPlans } from '../services/plans';
import { useCurrency } from '../context/CurrencyContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { userCurrency, formatPrice } = useCurrency();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const seoData = {
    title: "Pricing Plans",
    description: "Choose the perfect pricing plan for your online assessment needs. Flexible plans for educators, recruiters, and organizations. Start with a free trial today!",
    keywords: "pricing, plans, subscription, online assessment pricing, test platform pricing, educational technology pricing",
    url: "/pricing",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "PriceSpecification",
      "name": "TalentTest.io Pricing Plans",
      "description": "Flexible pricing plans for online assessment platform",
      "url": "https://talenttest.io/pricing",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "description": "Online assessment platform subscription"
      }
    }
  };

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const plansData = await fetchPlans();
        setPlans(plansData);
      } catch (err) {
        setError('Failed to load plans. Please try again later.');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const getDisplayPrice = (plan) => {
    // Use converted price if available, otherwise use original price
    if (plan.converted_price && userCurrency !== 'INR') {
      return formatPrice(plan.converted_price, userCurrency);
    }
    return formatPrice(plan.price, 'INR');
  };

  if (loading) {
    return (
      <>
        <SEO {...seoData} />
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center items-center h-32">
              <LoaderCircle className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-lg text-slate-600">Loading plans...</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO {...seoData} />
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO {...seoData} />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Choose Your <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Plan</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Flexible pricing for every stage. Upgrade, downgrade, or cancel anytime.
            </p>
            {userCurrency !== 'INR' && (
              <p className="text-sm text-slate-400 mt-4">
                Prices shown in {userCurrency} • Exchange rates updated daily
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {plans.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-600">No plans available at the moment. Please check back later.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col bg-white rounded-3xl shadow-2xl border ${
                    plan.name.toLowerCase().includes('premium') 
                      ? 'border-blue-600 shadow-blue-100 z-10 scale-105' 
                      : 'border-slate-200 hover:border-slate-300'
                  } p-8 transition-all duration-300 hover:scale-105`}
                >
                  {plan.name.toLowerCase().includes('premium') && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Star className="w-4 h-4 text-yellow-300" /> Recommended
                    </div>
                  )}
                  
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h2>
                  <div className="text-4xl font-extrabold text-blue-700 mb-2">
                    {plan.price === 0 ? 'Free' : getDisplayPrice(plan)}
                  </div>
                  <div className="text-sm text-blue-800 bg-blue-100 inline-block px-3 py-1 rounded-full mb-4 font-semibold">
                    {plan.interval === 365 ? 'per year' : plan.interval === 180 ? 'per 6 months' : `per ${Math.floor(parseInt(plan.interval) / 30)} months`}
                  </div>
                  
                  {userCurrency !== 'INR' && plan.converted_price && (
                    <div className="text-xs text-slate-500 mb-2">
                      Original: ₹{plan.price}
                    </div>
                  )}
                  
                  <p className="text-slate-700 mb-6 min-h-[48px]">{plan.description}</p>
                  
                  <ul className="mb-8 space-y-3 text-left">
                    {plan.features && plan.features.split(/\n|,/).map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`mt-auto w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      plan.name.toLowerCase().includes('premium') 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                    onClick={() => navigate('/checkout', { state: { plan } })}
                  >
                    {plan.price === 0 ? 'Get Started' : 'Buy Now'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Still Have Questions?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Contact Sales
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/faq')}
              className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              View FAQ
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Pricing; 
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle, Video, ShieldCheck, Star, Users, ArrowRight, TrendingUp, DollarSign, BookOpen, LifeBuoy, HelpCircle, ChevronDown, ChevronUp, LoaderCircle } from 'lucide-react'; // Added LoaderCircle
import { fetchPlans } from '../services/plans';
import axios from "axios";
import { Link } from 'react-router-dom';

export default function TestPortalUnder2000INR() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [publicOrgs, setPublicOrgs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null); // State to manage open FAQ item

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: "Fast Setup & Launch",
      description: "Get your custom test portal live in minutes. No coding required.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      title: "Secure & Scalable",
      description: "Enterprise-grade security and a mobile-friendly platform that grows with you.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "User Management",
      description: "Easily manage students, candidates, and groups with powerful admin tools.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-white" />,
      title: "Advanced Analytics",
      description: "Track performance, view detailed reports, and gain valuable insights.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-white" />,
      title: "Global Payments",
      description: "Accept payments in any currency (INR, USD, EUR, etc.) with zero hidden fees.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <LifeBuoy className="w-8 h-8 text-white" />,
      title: "Top-Rated Support",
      description: "Our 24/7 support team is here to help you succeed every step of the way.",
      color: "from-blue-500 to-blue-600"
    },
  ];

  useEffect(() => {
    fetchPlans()
      .then((data) => {
        setPlans(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load plans. Please try again later.');
        setLoading(false);
      });

    // Fetch public reviews
    const fetchReviews = async () => {
      try {
        const base2 = import.meta.env.VITE_API_BASE_URL2;
        const res = await fetch(`${base2}/admin/reviews`);
        const allReviews = await res.json();
        setReviews(allReviews.filter(r => r.show_in_public));
      } catch {
        setReviews([]);
      }
    };
    fetchReviews();

    // Fetch public organizations
    const fetchOrgs = async () => {
      try {
        const base2 = import.meta.env.VITE_API_BASE_URL2;
        const res = await fetch(`${base2}/admin/organizations`);
        const data = await res.json();
        const orgs = data.organizations || [];
        setPublicOrgs(orgs.filter(o => o.show_in_public));
      } catch {
        setPublicOrgs([]);
      }
    };
    fetchOrgs();

    // Fetch FAQs for public display
    const fetchFaqs = async () => {
      setFaqLoading(true);
      setFaqError(null);
      try {
        const base = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${base}/faqs`);
        setFaqs(res.data);
      } catch {
        setFaqError("Failed to load FAQs. Please try again later.");
      } finally {
        setFaqLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Helmet>
        <title>Affordable Test Portal Website Under 2000 INR | Talenttest.io</title>
        <meta name="description" content="Launch your own test portal website for under 2000 INR. Fast, secure, and feature-rich. Get started with Talenttest.io today!" />
        <meta property="og:title" content="Affordable Test Portal Website Under 2000 INR | Talenttest.io" />
        <meta property="og:description" content="Launch your own test portal website for under 2000 INR. Fast, secure, and feature-rich. Get started with Talenttest.io today!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talenttest.io/test-portal-under-2000-inr" />
        <meta property="og:image" content="https://talenttest.io/assets/seo-test-portal.jpg" />
        <link rel="canonical" href="https://talenttest.io/test-portal-under-2000-inr" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Test Portal Website Under 2000 INR",
            "image": "https://talenttest.io/assets/seo-test-portal.jpg",
            "description": "Affordable, feature-rich test portal website for under 2000 INR. Fast, secure, and mobile-friendly.",
            "brand": {
              "@type": "Brand",
              "name": "Talenttest.io"
            },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR",
              "price": "2000",
              "availability": "https://schema.org/InStock",
              "url": "https://talenttest.io/test-portal-under-2000-inr"
            }
          }
        `}</script>
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-800 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-bg-pattern.svg')] bg-repeat" aria-hidden="true"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in-right">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
                Your Own Test Portal
                <span className="block text-yellow-300">Under ₹2000</span>
              </h1>
              <p className="mb-8 text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                Launch a secure, feature-rich, and globally-ready test portal. Perfect for educators, recruiters, and organizations of any size.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/signup" className="group inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-yellow-300 transition-transform transform hover:scale-105">
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#video" className="group inline-flex items-center justify-center bg-gray-700/50 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-700/80 transition">
                  <Video className="w-5 h-5 mr-2" /> See a Demo
                </a>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400" /> Secure Payments</span>
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300" /> 4.9/5 User Rating</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-300" /> 10,000+ Happy Users</span>
              </div>
            </div>
            {/* Floating Product Image */}
            <div className="relative animate-fade-in-left hidden lg:block">
              <div className="absolute w-full h-full bg-indigo-500 rounded-full -bottom-24 -right-12 blur-3xl opacity-20"></div>
              <img
                src="/images/dashboard.png" // Corrected path to dashboard.png
                alt="Talenttest.io dashboard"
                className="relative rounded-xl shadow-2xl ring-1 ring-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Trusted by Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-center text-gray-800 text-4xl md:text-5xl font-extrabold mb-8">
              Trusted by Leading Organizations Worldwide
            </h3>
            <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
              {publicOrgs.map(org => org.image_url && (
                <div key={org.id} className="flex flex-col items-center mx-2">
                  <img
                    src={org.image_url}
                    alt={org.name}
                    className="h-16 w-16 bg-white rounded-xl shadow p-2 object-contain transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  />
                  <span className="text-sm text-gray-600 mt-2 text-center font-medium max-w-[100px] truncate">{org.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything You Need to Succeed</h2>
              <p className="mt-4 text-lg text-gray-600">
                Our platform is packed with powerful features designed to make online assessments simple, secure, and effective.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-xl shadow-md p-6 flex flex-col items-start hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className={`p-3 rounded-lg mb-4 bg-gradient-to-br ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Demo Section */}
        <section id="video" className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See It in Action</h2>
            <p className="text-lg text-gray-600 mb-10">Watch this short demo to see how easy it is to create and manage your test portal.</p>

            {/* Mockup Browser Window */}
            <div className="bg-gray-800 rounded-xl shadow-2xl p-2.5">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="w-full aspect-video rounded-b-lg overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/TX5FmtmWPtc?si=LEPbefTaJbCFCfd_" // IMPORTANT: Replace with your actual YouTube video ID
                  title="Talenttest.io Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-gray-600 text-center max-w-2xl">One plan. All features. Unbeatable price. Get started today with no hidden fees.</p>
            <div className="mt-12 w-full">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <LoaderCircle className="w-8 h-8 text-indigo-600 animate-spin" />
                  <span className="ml-3 text-lg text-gray-600">Loading plans...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-600">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : plans.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-yellow-600">No plans available at the moment. Please check back later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mb-6 transform hover:scale-105 transition-transform duration-300 flex flex-col">
                      <h3 className="text-2xl font-bold text-gray-900 text-center">{plan.name}</h3>
                      <div className="flex justify-center items-baseline my-6">
                        <span className="text-5xl font-extrabold text-indigo-600">₹{plan.price}</span>
                        <span className="text-gray-500 ml-2">
                          / {plan.interval === 365 ? 'year' : plan.interval === 180 ? '6 months' : `${Math.floor(parseInt(plan.interval) / 30)} months`}
                        </span>
                      </div>
                      <p className="text-center text-sm text-gray-500 mb-6">{plan.description}</p>
                      <ul className="space-y-4 text-gray-600 mb-8">
                        {plan.features && plan.features.split(/\n|,/).map((feature, idx) => (
                          <li key={idx} className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> {feature.trim()}</li>
                        ))}
                      </ul>
                      <Link to="/checkout" state={{ plan: plan }} className="group w-full inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-indigo-700 transition mt-auto">
                        Claim This Offer <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">What Our Users Say</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {reviews.map((review) => (
                  <div key={review.slug} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col items-start gap-4 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center gap-4 w-full">
                      <img
                        src={review.user?.profile_picture_url || '/default-avatar.png'}
                        alt={review.user ? `${review.user.first_name} ${review.user.last_name}` : 'User'}
                        className="w-16 h-16 rounded-full object-cover border-4 border-indigo-500 shadow-md flex-shrink-0"
                      />
                      <div className="flex flex-col flex-grow">
                        <div className="font-semibold text-lg text-gray-900">
                          {review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous User'}
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < review.rating ? '#facc15' : 'none'} />
                          ))}
                          {review.rating && <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>}
                        </div>
                      </div>
                    </div>
                    {/* Ensure review.comment is not null/undefined before rendering */}
                    {review.comment && (
                        <p className="italic text-gray-700 text-base leading-relaxed mb-4">"{review.comment}"</p>
                    )}
                    {review.title && (
                      <div className="text-sm text-gray-500 font-medium border-t border-gray-100 pt-3 mt-auto w-full">
                        <span className="font-bold text-indigo-600">{review.title}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
            {faqLoading ? (
              <div className="flex justify-center items-center h-32">
                <span className="text-gray-500 text-lg">Loading FAQs...</span>
              </div>
            ) : faqError ? (
              <div className="flex justify-center items-center h-32">
                <span className="text-red-500 text-lg">{faqError}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6"> {/* Changed to single column for better FAQ flow */}
                {faqs.length > 0 ? faqs.map((faq) => (
                  <div key={faq.id} className="bg-gray-50/70 p-6 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => toggleFaq(faq.id)}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                        <HelpCircle className="w-5 h-5 mr-2 text-indigo-500 flex-shrink-0" />{faq.question}
                      </h3>
                      {openFaq === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    {openFaq === faq.id && (
                      <p className="text-gray-600 mt-4 animate-fade-in-down">{faq.answer}</p>
                    )}
                  </div>
                )) : (
                  <div className="col-span-1 text-center text-gray-500">No FAQs available.</div> 
                )}
              </div>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready to Launch Your Test Portal?</h2>
            <p className="text-indigo-200 mt-4 mb-8 text-lg">Join over 10,000 satisfied users and take your assessments to the next level. It only takes a few minutes to get started.</p>
            <Link
              to="/checkout"
              state={{ plan: plans[0] }}
              className="group inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-yellow-300 transition-transform transform hover:scale-105"
            >
              Start Now for Just ₹2000 <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
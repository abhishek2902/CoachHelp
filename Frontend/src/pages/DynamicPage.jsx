import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle, Video, ShieldCheck, Star, Users, ArrowRight, ChevronDown, ChevronUp, LoaderCircle, HelpCircle, BookOpen, DollarSign, LifeBuoy, TrendingUp, MessageCircle, User, User2, User2Icon, X, Zap, Shield, Globe, Clock, Play, Award, Maximize2, RotateCw, RotateCcw, Pause, KeyRound, AlertTriangle, Quote } from 'lucide-react';
import { fetchPlans } from '../services/plans';
import axios from "axios";
import { Link, useParams, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export default function DynamicPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [publicOrgs, setPublicOrgs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // AI Video states
  const [imageFull, setImageFull] = useState({ show: false, src: '', alt: '' });
  const [videoFull, setVideoFull] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const aiVideoRef = React.useRef(null);
  const fullscreenVideoRef = React.useRef(null);

  // Set video playback rate to 2x
  useEffect(() => {
    if (aiVideoRef.current) {
      aiVideoRef.current.playbackRate = 2;
    }
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.playbackRate = 2;
    }
  }, []);
  
  // Update playback rate when fullscreen video is shown
  useEffect(() => {
    if (videoFull && fullscreenVideoRef.current) {
      fullscreenVideoRef.current.playbackRate = 2;
    }
  }, [videoFull]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (videoFull) {
          setVideoFull(false);
        }
        if (imageFull.show) {
          setImageFull({ show: false, src: '', alt: '' });
        }
      }
    };

    if (videoFull || imageFull.show) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [videoFull, imageFull.show]);

  useEffect(() => {
    // Fetch dynamic page data
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${base}/dynamic_pages/${slug}`);
        setPageData(res.data);
      } catch {
        setError('Page not found');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPageData();
  }, [slug]);

  useEffect(() => {
    fetchPlans()
      .then((data) => {
        setPlans(data);
      })
      .catch(() => {
        setError('Failed to load plans. Please try again later.');
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
        setFaqs(res.data.faqs);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoaderCircle className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        {/*<p className="text-gray-600">Loading page...</p>*/}
      </div>
    );
  }

  if (error || !pageData) {
    return <Navigate to="/404" replace />;
  }

  const currencySymbol = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  }[pageData.currency] || '₹';

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Helmet>
        <title>{pageData.og_title || pageData.title}</title>
        <meta name="description" content={pageData.meta_description} />
        <meta property="og:title" content={pageData.og_title || pageData.title} />
        <meta property="og:description" content={pageData.og_description || pageData.meta_description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageData.canonical_url} />
        <meta property="og:image" content={pageData.og_image} />
        <link rel="canonical" href={pageData.canonical_url} />
        {pageData.schema_data && (
          <script type="application/ld+json">
            {JSON.stringify(pageData.schema_data)}
          </script>
        )}
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
                {pageData.hero_title || pageData.title}
                {pageData.price && (
                  <span className="block text-yellow-300">Under {currencySymbol}{pageData.price}</span>
                )}
              </h1>
              <p className="mb-8 text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                {pageData.hero_subtitle || pageData.meta_description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href={pageData.hero_button_url || "/signup"} className="group inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-yellow-300 transition-transform transform hover:scale-105">
                  {pageData.hero_button_text || <>Get Started Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>}
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
                src="/images/dashboard.png"
                alt="Talenttest.io dashboard"
                className="relative rounded-xl shadow-2xl ring-1 ring-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Hero Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in-right">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powered by AI
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Experience the future of assessment with our AI-powered platform.
                Get instant feedback and actionable insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#ai-conversations" className="group inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
                  Learn More <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#video" className="group inline-flex items-center justify-center bg-gray-700/50 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-700/80 transition">
                  <Video className="w-5 h-5 mr-2" /> Watch AI Demo
                </a>
              </div>
            </div>
            <div className="relative animate-fade-in-left hidden lg:block">
              <div className="absolute w-full h-full bg-indigo-500 rounded-full -bottom-24 -right-12 blur-3xl opacity-20"></div>
              <img
                src="/images/ai-hero.png"
                alt="AI Powered Assessment"
                className="relative rounded-xl shadow-2xl ring-1 ring-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Conversation Promo Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 pt-20 pb-12 overflow-hidden">
        {/* 3D-styled Title */}
        <div className="relative z-10 text-center">
          <div className="text-[2.5rem] md:text-[5rem] lg:text-[7rem] font-extrabold text-blue-300 drop-shadow-2xl tracking-tight" style={{fontFamily:'Poppins, sans-serif', letterSpacing:'-0.04em'}}>
            <span className="block">AI CONVERSATION</span>
            <span className="block text-white text-[1.5rem] md:text-[2.5rem] font-bold mt-2 tracking-wide">for Test Creation</span>
          </div>
          <div className="mt-4 text-xl md:text-2xl text-blue-100 font-medium max-w-2xl mx-auto">
            Let AI handle your test creation, review, and management!
          </div>
        </div>

        {/* Floating Decorative Images - Now Clickable */}
        <img 
          src="/images/ai-conversations/ai--chats-for-test.png" 
          alt="AI Chat" 
          className="decorate absolute left-0 bottom-0 w-[30vw] max-w-xs md:max-w-md opacity-70 pointer-events-auto animate-float-slow cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 transform duration-300" 
          onClick={() => setImageFull({ show: true, src: "/images/ai-conversations/ai--chats-for-test.png", alt: "AI Chat" })}
        />
        <img 
          src="/images/ai-conversations/ai-conversation-full-review.png" 
          alt="AI Review" 
          className="decorate absolute right-0 bottom-0 w-[40vw] max-w-lg opacity-60 pointer-events-auto animate-float cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 transform duration-300" 
          onClick={() => setImageFull({ show: true, src: "/images/ai-conversations/ai-conversation-full-review.png", alt: "AI Review" })}
        />
        {/* Additional floating images for 5 total */}
        <img 
          src="/images/ai-conversations/ai-conversation-ai-agents.png" 
          alt="AI Agents" 
          className="decorate absolute left-1/4 top-1/4 w-[25vw] max-w-sm opacity-50 pointer-events-auto animate-float cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 transform duration-300" 
          onClick={() => setImageFull({ show: true, src: "/images/ai-conversations/ai-conversation-ai-agents.png", alt: "AI Agents" })}
        />
        <img 
          src="/images/ai-conversations/ai-conversation-preview-versions.png" 
          alt="Version History" 
          className="decorate absolute right-1/4 top-1/3 w-[28vw] max-w-sm opacity-55 pointer-events-auto animate-float-slow cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 transform duration-300" 
          onClick={() => setImageFull({ show: true, src: "/images/ai-conversations/ai-conversation-preview-versions.png", alt: "Version History" })}
        />
        <img 
          src="/images/ai-conversations/ai-conversation-complete.png" 
          alt="Complete Management" 
          className="decorate absolute left-1/2 transform -translate-x-1/2 top-1/6 w-[22vw] max-w-xs opacity-45 pointer-events-auto animate-float cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 transform duration-300" 
          onClick={() => setImageFull({ show: true, src: "/images/ai-conversations/ai-conversation-complete.png", alt: "Complete Management" })}
        />

        {/* Video Glass Card - Video Editor Style */}
        <div id="video" className="relative z-20 mt-12 w-full max-w-2xl mx-auto rounded-3xl shadow-2xl backdrop-blur-lg bg-white/10 border border-white/20 overflow-hidden group cursor-pointer" onClick={() => setVideoFull(true)}>
          {/* AI Editing Badge */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-10 animate-pulse">
            AI Editing
          </div>
          {/* Video Player */}
          <div className="relative w-full">
            <video
              ref={aiVideoRef}
              src="/videos/ai-conversation.webm"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-64 md:h-96 object-cover rounded-3xl"
            />
            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="p-3 bg-white/80 hover:bg-white text-gray-700 rounded-full transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
            </div>
            {/* Fullscreen icon */}
            <div className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-blue-700 rounded-full shadow-lg p-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); setVideoFull(true); }} title="Fullscreen">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
          {/* Animated Border/Glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-blue-400/30 group-hover:border-blue-500/60 transition-all animate-glow" />
        </div>

        {/* CTA Button for AI Conversation */}
        <div className="relative z-20 mt-8">
          <Link to="/ai-conversation">
            <button className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-pink-600 text-white text-2xl font-bold rounded-full shadow-2xl transition-all transform hover:scale-105">
              Start Your AI Conversation
              <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
          
        {/* Fullscreen Video Modal */}
        <AnimatePresence>
          {videoFull && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg pointer-events-auto cursor-pointer" onClick={() => setVideoFull(false)} tabIndex={-1}>
              <div className="relative w-full max-w-4xl mx-auto p-4 cursor-default" onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-lg p-2 cursor-pointer" onClick={() => setVideoFull(false)} aria-label="Close fullscreen">
                  <X className="w-6 h-6" />
                </button>
                <div className="rounded-3xl shadow-2xl overflow-hidden bg-white/10 border border-white/20">
                  <video
                    ref={fullscreenVideoRef}
                    src="/videos/ai-conversation.webm"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Fullscreen Image Modal */}
        <AnimatePresence>
          {imageFull.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg pointer-events-auto cursor-pointer" onClick={() => setImageFull({ show: false, src: '', alt: '' })} tabIndex={-1}>
              <div className="relative w-full max-w-6xl mx-auto p-4 cursor-default" onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button 
                  className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-blue-700 rounded-full shadow-lg p-2 border-2 border-blue-400/40 cursor-pointer" 
                  onClick={() => setImageFull({ show: false, src: '', alt: '' })} 
                  aria-label="Close fullscreen"
                >
                  <X className="w-6 h-6" />
                </button>
                {/* Image */}
                <div className="rounded-3xl shadow-2xl overflow-hidden bg-white/5 border border-white/20">
                  <img 
                    src={imageFull.src} 
                    alt={imageFull.alt} 
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
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
              {publicOrgs.map(org => (
                <div key={org.id} className="flex flex-col items-center mx-2">
                  {org.image_url ? (
                    <img
                      src={org.image_url}
                      alt={org.name}
                      className="h-16 w-16 bg-white rounded-xl shadow p-2 object-contain transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded-xl">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
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
              {[
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
              ].map((feature, index) => (
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
              <div className="grid grid-cols-1 gap-6">
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
              Start Now for Just {currencySymbol}{pageData.price || '2000'} <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      {/* Keyframes for AI conversation animations */}
      <style>{`
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out;
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Floating animations from AI conversation promo */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.04); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float { animation: float 3.5s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .decorate { z-index: 1; }
        /* Animated Glow for Video Card */
        @keyframes glow {
          0% { box-shadow: 0 0 24px 0 #60a5fa44, 0 0 0 0 #fff0; }
          50% { box-shadow: 0 0 48px 8px #6366f144, 0 0 0 0 #fff0; }
          100% { box-shadow: 0 0 24px 0 #60a5fa44, 0 0 0 0 #fff0; }
        }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
} 
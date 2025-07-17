import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Calendar, Clock, Users, CheckCircle, Star } from 'lucide-react';

const BookDemo = () => {
  useEffect(() => {
    // Redirect to Cal.com booking page after a short delay
    const timer = setTimeout(() => {
      window.location.href = 'https://cal.com/contact-test-vl2ryy/30min';
    }, 3000); // 3 second delay to show the page content

    return () => clearTimeout(timer);
  }, []);

  const seoData = {
    title: "Book a Free Demo | Talenttest.io",
    description: "Schedule a free 30-minute demo of Talenttest.io. See how our online assessment platform can transform your testing and evaluation process. Book your demo today!",
    keywords: "book demo, schedule demo, online assessment demo, talenttest demo, free demo, assessment platform demo",
    url: "/book-demo",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Book a Free Demo - Talenttest.io",
      "description": "Schedule a free 30-minute demo of Talenttest.io. See how our online assessment platform can transform your testing and evaluation process.",
      "url": "https://talenttest.io/book-demo",
      "mainEntity": {
        "@type": "Service",
        "name": "Talenttest.io Demo",
        "description": "Free 30-minute demo of our online assessment platform",
        "provider": {
          "@type": "Organization",
          "name": "Talenttest.io"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free demo session"
        }
      }
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://talenttest.io${seoData.url}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-bg-pattern.svg')] bg-repeat" aria-hidden="true"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Book Your Free
              <span className="block text-blue-300">Demo Today</span>
            </h1>
            <p className="mb-8 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the power of Talenttest.io in just 30 minutes. See how our platform can revolutionize your assessment process and help you create, deliver, and analyze tests with ease.
            </p>
            
            {/* Redirecting Message */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300 mr-3"></div>
                <span className="text-lg font-semibold">Redirecting to booking page...</span>
              </div>
              <p className="text-blue-200 mb-4">You'll be redirected to our secure booking system in a few seconds.</p>
              <a 
                href="https://cal.com/contact-test-vl2ryy/30min"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-2xl transition-all transform hover:scale-105"
              >
                Book Demo Now <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-400">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-300" /> 30-Minute Session</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-green-300" /> Free Demo</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-300" /> Expert Guidance</span>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
            <p className="text-lg text-gray-600">
              During your free demo, we'll show you everything you need to know about Talenttest.io
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h3>
              <p className="text-gray-600">
                Get a comprehensive tour of our assessment platform, including test creation, delivery, and analytics features.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Demo</h3>
              <p className="text-gray-600">
                Watch a live demonstration of creating tests, managing candidates, and analyzing results in real-time.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Q&A Session</h3>
              <p className="text-gray-600">
                Ask questions about specific features, pricing, implementation, and how Talenttest.io can meet your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-200 mb-8 text-lg">
            Join thousands of educators and organizations who trust Talenttest.io for their assessment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://cal.com/contact-test-vl2ryy/30min"
              className="group inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-yellow-300 transition-transform transform hover:scale-105"
            >
              Book Your Free Demo <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/contact"
              className="group inline-flex items-center justify-center bg-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-white/30 transition"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookDemo; 
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import axios from 'axios';
import $ from 'jquery';
import 'jquery-validation';
import Swal from 'sweetalert2';
import { useApiLoading } from '../hooks/useApiLoading';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', mobile: '' });
  const formRef = useRef();
  const { loading: submitLoading, withLoading } = useApiLoading('contact-submit');

  const seoData = {
    title: "Contact Us",
    description: "Get in touch with the TalentTest.io team. We're here to help you succeed with your online assessment needs. Contact us for support, questions, or to start your free trial.",
    keywords: "contact talenttest, support, customer service, help, contact us, online assessment support",
    url: "/contact",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact TalentTest.io",
      "description": "Get in touch with the TalentTest.io team for support and assistance",
      "url": "https://talenttest.io/contact",
      "mainEntity": {
        "@type": "Organization",
        "name": "TalentTest.io",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "support@talenttest.io",
          "telephone": "+91-XXXXXXXXXX",
          "availableLanguage": "English"
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Shadbox Infosystem Pvt Ltd",
          "addressLocality": "Nagpur",
          "addressRegion": "Maharashtra",
          "addressCountry": "India"
        }
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendContactMessage = async ({ name, email, message, mobile }) => {
    const base = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.post(`${base}/contacts`, {
      name,
      email,
      message,
      mobile
    });
    return response.data;
  };

  useEffect(() => {
    if (formRef.current) {
      $(formRef.current).validate({
        rules: {
          name: { required: true, minlength: 2 },
          email: { required: true, email: true },
          mobile: { required: true, minlength: 8, maxlength: 15, digits: true },
          message: { required: true, minlength: 10 }
        },
        messages: {
          name: 'Please enter your full name',
          email: 'Please enter a valid email address',
          mobile: 'Please enter a valid mobile number',
          message: 'Please enter your message (at least 10 characters)'
        },
        errorClass: 'text-red-500 text-sm mt-1',
        errorElement: 'div',
        highlight: function(element) {
          $(element).addClass('border-red-500');
        },
        unhighlight: function(element) {
          $(element).removeClass('border-red-500');
        }
      });
    }
  }, [form]);

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Our Address",
      details: [
        "Shadbox Infosystem Pvt Ltd",
        "Nagpur, Maharashtra, India"
      ]
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Contact",
      details: [
        import.meta.env.VITE_COMPANY_PHONE_NUMBER || "+91-XXXXXXXXXX",
        "support@talenttest.io"
      ]
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Working Hours",
      details: [
        "Mon - Fri: 11:00 AM - 8:00 PM",
        "Sat: 10:00 AM - 6:00 PM"
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
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
              Get in <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              We're here to help you succeed with your online assessment needs. 
              Contact us for support, questions, or to start your free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Let's Connect</h2>
              <p className="text-lg text-slate-600 mb-8">
                Get in touch with the TalentTest.io team — We're here to help you succeed!
              </p>
              
              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-slate-600">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-12 p-6 bg-slate-50 rounded-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Why Choose TalentTest.io?</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    24/7 Customer Support
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Free Trial Available
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Quick Response Time
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Expert Guidance
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
              <form ref={formRef} id="contactForm" className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="button"
                  disabled={submitLoading}
                  onClick={async () => {
                    // Validate using jQuery Validate
                    if (!$(formRef.current).valid()) return;
                    
                    await withLoading(async () => {
                      try {
                        await sendContactMessage(form);
                        Swal.fire({
                          icon: 'success',
                          title: 'Message Sent!',
                          text: 'Thank you for contacting us. We will get back to you soon.',
                          confirmButtonColor: '#3085d6',
                        });
                        setForm({ name: '', email: '', message: '', mobile: '' });
                      } catch {
                        Swal.fire({
                          icon: 'error',
                          title: 'Failed to send',
                          text: 'There was a problem sending your message. Please try again later.',
                          confirmButtonColor: '#d33',
                        });
                      }
                    });
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {submitLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage; 
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Users, Star, TrendingUp, ShieldCheck, ArrowRight, HeartHandshake, Award, Globe, MessageCircle, RotateCw, RotateCcw, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';

// YouTube video component with rotation controls
const RotatableYouTubeVideo = ({ videoId, title }) => {
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const rotateLeft = () => setRotation(prev => prev - 15);
  const rotateRight = () => setRotation(prev => prev + 15);
  const resetRotation = () => setRotation(0);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0`;

  return (
    <div className="relative group">
      {/* Rotation Controls - Always visible on mobile */}
      <div className="absolute -top-4 -right-4 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-2 bg-black/80 rounded-lg p-2 backdrop-blur-sm">
          <button
            onClick={rotateLeft}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            title="Rotate Left"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={rotateRight}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            title="Rotate Right"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={resetRotation}
            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            title="Reset Rotation"
          >
            <Award className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div 
        className="relative rounded-xl shadow-2xl ring-1 ring-white/10 overflow-hidden transform transition-transform duration-500 hover:scale-105"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder="0"
        />
        
        {/* Play/Pause Overlay - Always visible on mobile */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Rotation Indicator - Always visible on mobile */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
        {rotation}°
      </div>
    </div>
  );
};

export default function About() {
  const seoData = {
    title: "About Us",
    description: "Learn about TalentTest.io, our mission, values, and the team behind the leading online assessment platform. Discover how we're transforming education and recruitment.",
    keywords: "about talenttest, online assessment company, educational technology, assessment platform, team, mission, values",
    url: "/about",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TalentTest.io",
      "url": "https://talenttest.io",
      "logo": "https://talenttest.io/images/tplogo.png",
      "description": "Leading online assessment platform for educators, recruiters, and organizations",
      "foundingDate": "2020",
      "numberOfEmployees": "50+",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "India"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@talenttest.io"
      }
    }
  };

  const values = [
    {
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: "Innovation",
      description: "We constantly innovate to deliver the best assessment technology for educators, recruiters, and organizations.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      title: "Integrity",
      description: "We believe in fairness, transparency, and security in every assessment.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-white" />,
      title: "Customer Focus",
      description: "Our users are at the heart of everything we do. We listen, adapt, and support.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Award className="w-8 h-8 text-white" />,
      title: "Excellence",
      description: "We strive for excellence in our platform, support, and results.",
      color: "from-yellow-500 to-yellow-600"
    }
  ];

  const team = [
    {
      name: "Rohit Sharma",
      role: "Founder & CEO",
      img: "/images/man_1.jpg"
    },
    {
      name: "Priya Verma",
      role: "Head of Product",
      img: "/images/women_1.jpg"
    },
    {
      name: "Amit Patel",
      role: "Lead Engineer",
      img: "/images/man_2.jpg"
    },
    {
      name: "Sara Lee",
      role: "Customer Success Manager",
      img: "/images/women_2.jpg"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                About <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">TalentTest.io</span>
              </h1>
              <p className="mb-8 text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0">
                Empowering organizations and educators to assess, learn, and grow with confidence. Our mission is to make world-class assessment technology accessible to everyone.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-8 text-sm text-slate-400">
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300" /> Trusted by 10,000+ users</span>
                <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-300" /> 50+ Countries</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-300" /> 1M+ Assessments Delivered</span>
              </div>
            </div>
            {/* Rotatable Company Video */}
            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="absolute w-full h-full bg-blue-500 rounded-full -bottom-24 -right-12 blur-3xl opacity-20"></div>
              <RotatableYouTubeVideo 
                videoId="TX5FmtmWPtc"
                title="About TalentTest.io"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-lg text-slate-600 mb-8">
            To democratize access to high-quality assessments, enabling every learner and organization to unlock their full potential.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {values.map((value, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className={`p-3 rounded-lg mb-4 bg-gradient-to-br ${value.color}`}>{value.icon}</div>
                <h3 className="font-semibold text-xl text-slate-800 mb-2">{value.title}</h3>
                <p className="text-slate-600 text-sm text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to revolutionizing assessment technology and empowering learners worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <img 
                    src={member.img} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{member.name}</h3>
                <p className="text-slate-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Assessments?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of educators and organizations already using TalentTest.io
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 
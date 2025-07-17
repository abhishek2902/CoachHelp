import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  UserCheck, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  FileText,
  Video,
  MessageCircle,
  Globe,
  Zap,
  Award,
  Target,
  RotateCw,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';
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
            <Star className="w-4 h-4" />
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

export default function Recruiters() {
  const features = [
    {
      icon: <UserCheck className="w-8 h-8 text-white" />,
      title: "Automated Candidate Screening",
      description: "Screen thousands of candidates efficiently with AI-powered assessments and instant scoring.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FileText className="w-8 h-8 text-white" />,
      title: "Custom Test Creation",
      description: "Design role-specific tests with coding, aptitude, and behavioral questions. Use our library or add your own.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Advanced Analytics",
      description: "Get actionable insights on candidate performance, strengths, and fit for the role.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      title: "Secure & Fair Testing",
      description: "Prevent cheating with proctoring, browser lockdown, and plagiarism detection.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <Clock className="w-8 h-8 text-white" />,
      title: "Fast Shortlisting",
      description: "Instantly shortlist top candidates based on customizable criteria and benchmarks.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <Globe className="w-8 h-8 text-white" />,
      title: "Global Reach",
      description: "Invite candidates from anywhere in the world. Mobile-friendly and accessible 24/7.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const benefits = [
    "Reduce hiring time by 60%",
    "Screen 10,000+ candidates with ease",
    "Unbiased, data-driven shortlisting",
    "Enhance employer branding with a modern experience",
    "Integrate with your ATS and HR tools",
    "Hire the best talent, faster"
  ];

  const testimonials = [
    {
      name: "Priya Mehra",
      role: "Talent Acquisition Lead",
      institution: "FinTech Corp",
      content: "Talenttest.io has made our hiring process 3x faster. The automated shortlisting and analytics are game changers.",
      rating: 5
    },
    {
      name: "Rahul Singh",
      role: "HR Manager",
      institution: "Global Solutions",
      content: "We can now assess thousands of candidates in a day, with complete confidence in the results. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Helmet>
        <title>For Recruiters | Talenttest.io</title>
        <meta name="description" content="Streamline your hiring with Talenttest.io. Automate candidate screening, create custom tests, and hire the best talent faster." />
        <meta property="og:title" content="For Recruiters | Talenttest.io" />
        <meta property="og:description" content="Streamline your hiring with Talenttest.io. Automate candidate screening, create custom tests, and hire the best talent faster." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talenttest.io/solutions/recruiters" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-blue-800 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-bg-pattern.svg')] bg-repeat" aria-hidden="true"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Hire Smarter with
                <span className="block text-green-300">Automated Assessments</span>
              </h1>
              <p className="mb-8 text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                Automate candidate screening, reduce hiring time, and hire the best talent with our all-in-one recruitment platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/pricing" 
                  className="group inline-flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                >
                  Start Free Trial <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a 
                  href="#features" 
                  className="group inline-flex items-center justify-center bg-gray-700/50 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-700/80 transition"
                >
                  <Video className="w-5 h-5 mr-2" /> Watch Demo
                </a>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Free Trial Available</span>
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300" /> 4.9/5 Recruiter Rating</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-300" /> 100,000+ Candidates</span>
              </div>
            </div>
            {/* Floating Product Image */}
            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="absolute w-full h-full bg-green-500 rounded-full -bottom-24 -right-12 blur-3xl opacity-20"></div>
              <RotatableYouTubeVideo videoId="TX5FmtmWPtc" title="Rotatable YouTube Video" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Hire the Best</h2>
              <p className="text-lg text-gray-600">
                Our platform is designed for recruiters, providing all the tools you need to screen, assess, and hire top talent efficiently.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Recruiters Choose Talenttest.io</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Join leading recruiters who have transformed their hiring process with our platform.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <Target className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Success Metrics</h3>
                  <p className="text-gray-600">Average improvements reported by recruiters</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">60%</div>
                    <div className="text-sm text-gray-600">Faster Hiring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">90%</div>
                    <div className="text-sm text-gray-600">Screening Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">80%</div>
                    <div className="text-sm text-gray-600">Reduced Manual Work</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">95%</div>
                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Recruiters Say</h2>
              <p className="text-lg text-gray-600">
                Hear from recruiters who have transformed their hiring with Talenttest.io.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.institution}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-t-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready to Hire Smarter?</h2>
            <p className="text-green-200 mt-4 mb-8 text-lg">Join leading recruiters who are already using Talenttest.io to hire the best talent, faster.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pricing"
                className="group inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-yellow-300 transition-transform transform hover:scale-105"
              >
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="/book-demo"
                className="group inline-flex items-center justify-center bg-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-white/30 transition"
              >
                <MessageCircle className="w-5 h-5 mr-2" /> Schedule Demo
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatsSection from './StatsSection';
import { fetchPlans } from '../services/plans';
import { MessageCircle, User, User2, User2Icon, X, ArrowRight, CheckCircle, Star, Zap, Shield, Globe, Clock, Play, Award, TrendingUp, Users, BookOpen, BarChart3, Quote, KeyRound, AlertTriangle, Maximize2, RotateCw, RotateCcw, Pause } from "lucide-react";
import { useCurrency } from '../context/CurrencyContext';
import { AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [flash, setFlash] = useState(null);
  const [plans, setPlans] = useState([]);
  const [reviews, setReviews] = useState([]);
  const { userCurrency, formatPrice } = useCurrency();
  const [testCode, setTestCode] = useState("");
  const navigate = useNavigate();
  
  // Modal states
  const [imageFull, setImageFull] = useState({ show: false, src: '', alt: '' });
  const [videoFull, setVideoFull] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const aiVideoRef = useRef(null);
  const fullscreenVideoRef = useRef(null);
  
  // Set video playback rate to 2x
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2;
    }
    if (aiVideoRef.current) {
      aiVideoRef.current.playbackRate = 2;
    }
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.playbackRate = 2;
    }
  }, []);

  // Sync isPlaying state with video playback (main video)
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
    if (aiVideoRef.current) {
      if (isPlaying) {
        aiVideoRef.current.play();
      } else {
        aiVideoRef.current.pause();
      }
    }
    if (fullscreenVideoRef.current) {
      if (isPlaying) {
        fullscreenVideoRef.current.play();
      } else {
        fullscreenVideoRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Update playback rate when fullscreen video is shown
  useEffect(() => {
    if (videoFull && fullscreenVideoRef.current) {
      fullscreenVideoRef.current.playbackRate = 2;
    }
  }, [videoFull]);
  
  // 3D Background refs
  const threeContainer = useRef(null);
  const [botScreen, setBotScreen] = useState({ x: 0, y: 0 });
  const botRef = useRef(null);
  const [balls, setBalls] = useState([]);
  const colors = ["#60a5fa", "#a78bfa", "#f472b6", "#fbbf24", "#6366f1", "#818cf8"];
  
  //fetch plan
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await fetchPlans();
        setPlans(plansData);
      } catch (err) {
        console.error('Error fetching plans:', err);
      }
    };

    loadPlans();
  }, []);

  // Fetch public reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const base2 = import.meta.env.VITE_API_BASE_URL2;
        const res = await fetch(`${base2}/admin/reviews`);
        const allReviews = await res.json();
        setReviews(allReviews['reviews'].filter(r => r.show_in_public));
      } catch {
        setReviews([]);
      }
    };
    fetchReviews();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef(null);

  const handleOutsideClick = (e) => {
    if (chatRef.current && !chatRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Mouse tracking and smooth animation (entire page)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 768) return; // desktop only
    let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let animId;
    let lastBallTime = 0;
    const handleMove = e => {
      target = { x: e.clientX, y: e.clientY };
      // Particle effect: only add a ball if enough time has passed
      const now = Date.now();
      if (now - lastBallTime > 30) {
        lastBallTime = now;
        setBalls(balls => {
          if (balls.length > 30) return balls; // limit for perf
          const angle = Math.random() * 2 * Math.PI;
          const speed = Math.random() * 40 + 30;
          return [
            ...balls,
            {
              id: Math.random().toString(36).slice(2),
              x: e.clientX,
              y: e.clientY,
              color: colors[Math.floor(Math.random() * colors.length)],
              size: Math.random() * 18 + 12,
              dx: Math.cos(angle) * speed,
              dy: Math.sin(angle) * speed,
              created: now
            }
          ];
        });
      }
    };
    const animate = () => {
      setBotScreen(prev => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18
        };
      });
      animId = requestAnimationFrame(animate);
    };
    window.addEventListener('mousemove', handleMove);
    animId = requestAnimationFrame(animate);
    document.body.style.cursor = 'none';
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(animId);
      document.body.style.cursor = '';
    };
  }, []);

  // Animate and remove balls after 1s
  useEffect(() => {
    if (!balls.length) return;
    const interval = setInterval(() => {
      setBalls(balls => balls.filter(b => Date.now() - b.created < 1000));
    }, 100);
    return () => clearInterval(interval);
  }, [balls]);

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

  // 3D Background with Three.js
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined' || !threeContainer.current) return;
    // Only run on desktop (skip on mobile for perf)
    if (window.innerWidth < 768) return;
    let THREE;
    let renderer, scene, camera, animationId;
    let spheres = [];
    let width = threeContainer.current.offsetWidth;
    let height = threeContainer.current.offsetHeight;
    (async () => {
      THREE = await import('three');
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      threeContainer.current.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.z = 80;
      // Add glowing spheres
      const colors = [0x60a5fa, 0xa78bfa, 0xf472b6, 0xfbbf24, 0x6366f1, 0x818cf8];
      for (let i = 0; i < 18; i++) {
        const geometry = new THREE.SphereGeometry(Math.random() * 2.5 + 2, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], emissive: colors[i % colors.length], emissiveIntensity: 0.7, transparent: true, opacity: 0.85 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        );
        scene.add(sphere);
        spheres.push({ mesh: sphere, speed: Math.random() * 0.008 + 0.002 });
      }
      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);
      const point = new THREE.PointLight(0xffffff, 1.2);
      point.position.set(0, 0, 80);
      scene.add(point);
      // Animate
      function animate() {
        animationId = requestAnimationFrame(animate);
        spheres.forEach((s, i) => {
          s.mesh.position.y += Math.sin(Date.now() * s.speed + i) * 0.04;
          s.mesh.position.x += Math.cos(Date.now() * s.speed + i) * 0.02;
        });
        renderer.render(scene, camera);
      }
      animate();
    })();
    // Cleanup
    return () => {
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      if (animationId) cancelAnimationFrame(animationId);
      spheres = [];
    };
  }, []);

  const getDisplayPrice = (plan) => {
    // Use converted price if available, otherwise use original price
    if (plan.converted_price && userCurrency !== 'INR') {
      return formatPrice(plan.converted_price, userCurrency);
    }
    return formatPrice(plan.price, 'INR');
  };



  const handleStart = async () => {
    try {
      if (!testCode) {
        setFlash({ message: "Please enter test code.", type: 'error' });
        return;
      }
      const base = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${base}/tests/by_code?code=${testCode}`);
      if (!res.ok) throw new Error("Invalid code");
      const data = await res.json();
      const slug = data.slug;
      navigate(`/respondent-details/${slug}`);
    } catch {
      setFlash({ message: "Invalid or expired test code.", type: 'error' });
    }
  };

  return (
    <>
      {/* Mouse-following AI Bot SVG (desktop only, global) */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <>
          {/* Particle balls */}
          {balls.map(ball => (
            <div
              key={ball.id}
              className="fixed z-40 pointer-events-none animate-ball-pop"
              style={{
                left: ball.x - ball.size / 2,
                top: ball.y - ball.size / 2,
                width: ball.size,
                height: ball.size,
                background: ball.color,
                borderRadius: '50%',
                opacity: 0.7,
                boxShadow: `0 0 16px 0 ${ball.color}99`,
                transform: `translate(${ball.dx}px, ${ball.dy}px) scale(1)`,
                animationDelay: '0s',
                animationDuration: '1s',
              }}
            />
          ))}
          <div
            ref={botRef}
            className="fixed z-50 pointer-events-none"
            style={{
              left: botScreen.x - 60,
              top: botScreen.y - 60,
              width: 120,
              height: 120,
              transition: 'filter 0.2s',
              filter: 'drop-shadow(0 0 32px #60a5fa)'
            }}
          >
            <svg
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Robot Head */}
              <ellipse cx="60" cy="60" rx="38" ry="32" fill="#e0e7ef" stroke="#6366f1" strokeWidth="3" />
              {/* Visor/Face */}
              <rect x="38" y="52" width="44" height="18" rx="9" fill="#23272f" stroke="#60a5fa" strokeWidth="2" />
              {/* Eyes (digital) */}
              <rect x="50" y="59" width="5" height="5" rx="2.5" fill="#60a5fa" />
              <rect x="65" y="59" width="5" height="5" rx="2.5" fill="#60a5fa" />
              {/* Smile (digital) */}
              <rect x="57" y="66" width="6" height="2" rx="1" fill="#60a5fa" />
              {/* Antenna */}
              <rect x="58.5" y="28" width="3" height="14" rx="1.5" fill="#60a5fa" />
              <circle cx="60" cy="26" r="4" fill="#fbbf24" stroke="#60a5fa" strokeWidth="2" />
              {/* Glowing Ears */}
              <ellipse cx="22" cy="60" rx="6" ry="10" fill="#a5b4fc" fillOpacity="0.7" />
              <ellipse cx="98" cy="60" rx="6" ry="10" fill="#a5b4fc" fillOpacity="0.7" />
              {/* Floating Body */}
              <ellipse cx="60" cy="100" rx="18" ry="8" fill="#6366f1" fillOpacity="0.7" />
              <ellipse cx="60" cy="110" rx="10" ry="3" fill="#60a5fa" fillOpacity="0.3" />
              {/* Arms (floating) */}
              <rect x="20" y="80" width="12" height="4" rx="2" fill="#6366f1" fillOpacity="0.7" />
              <rect x="88" y="80" width="12" height="4" rx="2" fill="#6366f1" fillOpacity="0.7" />
            </svg>
          </div>
        </>
      )}
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
        <div id="video" className="relative z-20 mt-12 w-full max-w-2xl mx-auto rounded-3xl shadow-2xl backdrop-blur-lg bg-white/10 border border-white/20 overflow-hidden group cursor-pointer">
          {/* AI Editing Badge */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-10 animate-pulse">
            AI Editing
          </div>
          {/* Video Player */}
          <div className="relative w-full">
            <video
              ref={aiVideoRef}
              src="/videos/ai-conversation.webm"
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
      {/* Original Home Page Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 overflow-hidden">
        {/* 3D Canvas Background */}
        <div ref={threeContainer} id="container3D" className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
        
        {/* Subtle background SVG accent */}
        <svg className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-20 z-0" viewBox="0 0 600 600" fill="none">
          <circle cx="300" cy="300" r="300" fill="url(#paint0_radial)" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-10 z-0" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="200" fill="url(#paint1_radial)" />
        </svg>
        <defs>
          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(300 300) scale(300)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a5b4fc" />
            <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientTransform="translate(200 200) scale(200)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f472b6" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
        </defs>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side: Main Content */}
            <div className="text-center lg:text-left animate-fade-in-right flex flex-col gap-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
                Join thousands of satisfied educators and organizations
              </h1>
              <p className="mb-8 text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                The easiest way to create, deliver, and analyze online assessments. Secure, scalable, and trusted by top companies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/pricing" className="group inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-yellow-300 transition-transform transform hover:scale-105">
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/book-demo" className="group inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
                  Book Free Demo <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="group inline-flex items-center justify-center bg-gray-700/50 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-700/80 transition">
                  Contact Sales
                </Link>
              </div>
            </div>
            {/* Right Side: Video + Test Code in Card */}
            <div className="relative animate-fade-in-left flex flex-col items-center justify-center gap-6">
              <div className="bg-white/90 rounded-2xl shadow-2xl border border-slate-100 px-6 py-8 flex flex-col items-center w-full max-w-md lg:max-w-lg group cursor-pointer" onClick={() => setVideoFull(true)}>
                <div className="relative w-full mb-6">
                <video
                    ref={videoRef}
                  src="/videos/Video_Clip_Ready_TalentTest.mp4"
                  muted
                  loop
                  playsInline
                    className="rounded-xl shadow-lg w-full bg-black"
                  style={{ minHeight: '260px', maxHeight: '340px', objectFit: 'cover' }}
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
                  <div className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-lg p-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); setVideoFull(true); }} title="Fullscreen">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
                {/* Start Test by Code (polished) */}
                <div className="w-full" onClick={e => e.stopPropagation()}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Have a test code?</label>
                  <div className="flex flex-col sm:flex-row gap-2 bg-white/60 rounded-lg px-2 py-1 shadow-inner border border-slate-200">
                    <span className="flex items-center pl-2 pr-1 text-indigo-400"><KeyRound className="w-5 h-5" /></span>
                    <input
                      value={testCode}
                      onChange={e => setTestCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleStart()}
                      placeholder="Enter test code..."
                      className="flex-1 px-2 py-2 bg-transparent border-none text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                    />
                    <button
                      onClick={handleStart}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                    >
                      Start
                    </button>
                  </div>
                  {flash?.type === 'error' && (
                    <div className="mt-3 flex items-center gap-2 bg-red-500/90 text-white text-sm rounded-lg px-4 py-2 shadow-md animate-fade-in">
                      <AlertTriangle className="w-5 h-5 mr-1 text-white/90" />
                      <span>{flash.message}</span>
                      <button onClick={() => setFlash(null)} className="ml-auto text-white/80 hover:text-white focus:outline-none">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Create Amazing Tests
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From simple quizzes to complex assessments, we've got you covered
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-full text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Create Tests</h3>
              <p className="text-slate-600">Build engaging assessments with our intuitive editor. Support for multiple question types and rich media.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-full text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Share & Distribute</h3>
              <p className="text-slate-600">Generate unique test codes and share them with your students or candidates. They can access tests from anywhere.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-full text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Analyze Results</h3>
              <p className="text-slate-600">Get instant results and detailed analytics. Track performance, identify trends, and make data-driven decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <TrendingUp className="w-4 h-4" />
                Growing rapidly
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                About <span className="text-blue-600">Our Platform</span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                At TalentTest.io, we believe that assessment should be seamless, secure, and insightful. 
                Our platform combines cutting-edge technology with intuitive design to deliver the best 
                testing experience for both educators and students.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Whether you're a teacher looking to create engaging assessments, a recruiter seeking to 
                evaluate candidates, or an organization conducting online exams, we have the tools you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/about" 
                  className="inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-slate-900 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                    <span>Reduce administrative workload by 70%</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                    <span>Improve student engagement with interactive assessments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                    <span>Get instant results and detailed feedback</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                    <span>Ensure fair and secure testing environment</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                    <span>Scale from 10 to 10,000+ students easily</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        What Our Customers Say
      </h2>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto">
        Join thousands of satisfied educators and organizations
      </p>
    </div>

    {/* Featured Testimonial */}
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(reviews.length > 0 ? reviews.slice(0, 3) : Array(3).fill(null)).map((review, index) => (
              <div key={index} className="max-w-lg lg:mx-0 group">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 px-8 py-7 flex flex-col gap-4 items-start relative transform transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl hover:border-blue-200 cursor-pointer">
                  <Quote className="absolute -top-6 left-6 w-10 h-10 text-indigo-200 group-hover:text-blue-400 transition-colors duration-300" />

            <div className="flex items-center gap-2 mb-2">
              {Array.from({ length: review?.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                ))}
            </div>

                  <blockquote className="text-lg md:text-xl italic text-slate-700 font-medium mb-4 pl-2 border-l-4 border-indigo-100 group-hover:border-blue-400 transition-colors duration-300">
              {review?.comment || 'Great platform!'}
            </blockquote>

            <div className="flex items-center gap-3 mt-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-xl text-indigo-700 border-2 border-indigo-200 group-hover:bg-blue-100 group-hover:border-blue-300 group-hover:text-blue-700 transition-all duration-300">
                {review?.user && (review.user.first_name || review.user.last_name)
                ? `${(review.user.first_name?.[0] || '')}${(review.user.last_name?.[0] || '')}`.toUpperCase()
                : 'U'}
              </div>
              <div>
                      <div className="font-semibold text-slate-900 text-base group-hover:text-blue-700 transition-colors duration-300">
                  {review?.user
                  ? `${review.user.first_name || ''} ${review.user.last_name || ''}`.trim() || 'Anonymous User'
                  : 'Anonymous User'}
                </div>
                      <div className="text-slate-500 text-sm group-hover:text-slate-600 transition-colors duration-300">
                  {review?.user?.email || 'Customer'}
                </div>
              </div>
            </div>
          </div>
        </div>
        ))}
    </div>
  </div>
</section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Most popular choice
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include our core features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="relative bg-white rounded-2xl border border-slate-200 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 group cursor-pointer"
              >
                {plan.name.toLowerCase().includes('premium') && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg group-hover:bg-blue-600 transition-colors duration-300">
                    <Star className="w-4 h-4 text-amber-400" /> Recommended
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{plan.name}</h3>
                  <p className="text-slate-600 mb-6">Valid for {Math.floor(parseInt(plan.interval) / 30)} months</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{getDisplayPrice(plan)}</span>
                  </div>
                  <p className="text-slate-600 mb-6 group-hover:text-slate-700 transition-colors duration-300">{plan.description}</p>
                  
                  <ul className="text-left mb-8 space-y-3">
                    {plan.features.split(",").map((feature, idx) => (
                      <li key={idx} className="flex items-center text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        <span>{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/checkout"
                    state={{ plan: plan }}
                    className="w-full inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 group-hover:shadow-lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Assessments?</h2>
          <p className="text-xl mb-8 text-slate-300">
            Join thousands of educators and organizations already using TalentTest.io
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/pricing" 
              className="inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-yellow-300 transition-transform transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/book-demo" 
              className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              Book Free Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center bg-gray-700/50 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-gray-700/80 transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <StatsSection/>

      {/* Keyframes for 3D animations */}
      <style>{`
        @keyframes ball-pop {
          0% { opacity: 0.7; transform: scale(1) translate(0,0); }
          60% { opacity: 0.8; transform: scale(1.2) translate(var(--dx,0), var(--dy,0)); }
          100% { opacity: 0; transform: scale(0.7) translate(var(--dx,0), var(--dy,0)); }
        }
        .animate-ball-pop {
          animation: ball-pop 1s cubic-bezier(.4,1.6,.6,1) forwards;
        }
        @media (min-width: 768px) {
          body { cursor: none !important; }
        }
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
    </>
  );
};

export default Hero;
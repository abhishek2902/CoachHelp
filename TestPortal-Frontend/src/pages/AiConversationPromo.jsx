import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';

const features = [
  {
    number: '01',
    title: 'AI-Powered Test Creation',
    image: '/images/ai-conversations/ai--chats-for-test.png',
    description: 'Chat with our AI to generate tests instantly. No more manual question entry! Just describe your needs and let the AI do the heavy lifting.'
  },
  {
    number: '02',
    title: 'Collaborative AI Agents',
    image: '/images/ai-conversations/ai-conversation-ai-agents.png',
    description: 'Multiple AI agents help you refine, review, and enhance your tests. Get suggestions, improvements, and instant feedback.'
  },
  {
    number: '03',
    title: 'Full Test Preview',
    image: '/images/ai-conversations/ai-conversation-full-review.png',
    description: 'See exactly what your candidates will see, in real time. Instantly preview your test as you build and edit.'
  },
  {
    number: '04',
    title: 'Version History & Review',
    image: '/images/ai-conversations/ai-conversation-preview-versions.png',
    description: 'Easily preview previous versions and track changes. Never lose your progress and always stay in control.'
  },
  {
    number: '05',
    title: 'Complete AI Conversation Management',
    image: '/images/ai-conversations/ai-conversation-complete.png',
    description: 'Manage, organize, and revisit all your AI-powered test conversations in one place. Stay productive and efficient.'
  },
];

const seoData = {
  title: 'AI Conversations for Test Creation',
  description: 'Revolutionize your test creation with AI-powered chat. Instantly generate, preview, and manage tests with collaborative AI agents. Try now!',
  keywords: 'ai test creation, ai chat, online assessment, test automation, ai agents, test preview, version history, education technology',
  image: 'https://talenttest.io/images/ai-conversations/ai--chats-for-test.png',
  url: '/ai-conversation-promo',
  type: 'website',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'AI Conversations for Test Creation',
    'description': 'Revolutionize your test creation with AI-powered chat. Instantly generate, preview, and manage tests with collaborative AI agents.',
    'url': 'https://talenttest.io/ai-conversation-promo',
    'image': 'https://talenttest.io/images/ai-conversations/ai--chats-for-test.png',
    'publisher': {
      '@type': 'Organization',
      'name': 'TalentTest.io',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://talenttest.io/images/og-image.jpg'
      }
    }
  }
};

export default function AiConversationPromo() {
  const threeContainer = useRef(null);
  // Mouse-following AI bot state
  const [botScreen, setBotScreen] = useState({ x: 0, y: 0 }); // px
  const botRef = useRef(null);
  // Particle balls state
  const [balls, setBalls] = useState([]);
  const colors = ["#60a5fa", "#a78bfa", "#f472b6", "#fbbf24", "#6366f1", "#818cf8"];
  // Video fullscreen state
  const [videoFull, setVideoFull] = useState(false);
  // Image fullscreen state
  const [imageFull, setImageFull] = useState({ show: false, src: '', alt: '' });

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
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [videoFull, imageFull.show]);

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

  return (
    <>
      <SEO {...seoData} />
      <Navbar />

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

      {/* Hero Section */}
      <section
        id="banner"
        className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 pt-20 pb-12 overflow-hidden"
      >
        {/* 3D Canvas Background */}
        <div ref={threeContainer} id="container3D" className="absolute inset-0 w-full h-full z-0 pointer-events-none" />
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
          {/* Play/Pause Overlay Button */}
          <VideoEditorPlayer />
          {/* Animated Border/Glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-blue-400/30 group-hover:border-blue-500/60 transition-all animate-glow" />
          {/* Fullscreen icon */}
          <div className="absolute bottom-4 right-4 z-20 bg-white/80 hover:bg-white text-blue-700 rounded-full shadow-lg p-2 border-2 border-blue-400/40 cursor-pointer" onClick={e => { e.stopPropagation(); setVideoFull(true); }} title="Fullscreen" aria-label="Fullscreen">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
        </div>
        {/* Fullscreen Video Modal */}
        {videoFull && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg pointer-events-auto cursor-pointer" onClick={() => setVideoFull(false)} tabIndex={-1}>
            <div className="relative w-full max-w-4xl mx-auto p-4 cursor-default" onClick={e => e.stopPropagation()}>
              {/* Close button */}
              <button className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-blue-700 rounded-full shadow-lg p-2 border-2 border-blue-400/40 cursor-pointer" onClick={() => setVideoFull(false)} aria-label="Close fullscreen">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="22" y2="22"/><line x1="22" y1="6" x2="6" y2="22"/></svg>
              </button>
              {/* AI Editing Badge */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-10 animate-pulse">
                AI Editing
              </div>
              <div className="rounded-3xl shadow-2xl backdrop-blur-lg bg-white/10 border border-white/20 overflow-hidden">
                <VideoEditorPlayer large />
              </div>
            </div>
          </div>
        )}
        {/* Fullscreen Image Modal */}
        {imageFull.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg pointer-events-auto cursor-pointer" onClick={() => setImageFull({ show: false, src: '', alt: '' })} tabIndex={-1}>
            <div className="relative w-full max-w-6xl mx-auto p-4 cursor-default" onClick={e => e.stopPropagation()}>
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-blue-700 rounded-full shadow-lg p-2 border-2 border-blue-400/40 cursor-pointer" 
                onClick={() => setImageFull({ show: false, src: '', alt: '' })} 
                aria-label="Close fullscreen"
              >
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="22" y2="22"/><line x1="22" y1="6" x2="6" y2="22"/></svg>
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
      </section>

      {/* Features Sections */}
      <main id="features" className="relative z-10">
        {features.map((feature) => (
          <section key={feature.title} className="section relative min-h-[60vh] flex items-center justify-center py-16 md:py-24 bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 border-b border-white/10 overflow-hidden">
            <div className="content-fit flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto w-full px-4">
              <div className="number text-[6rem] md:text-[10rem] font-extrabold text-blue-200 drop-shadow-2xl opacity-20 select-none leading-none" style={{fontFamily:'Poppins, sans-serif'}}>{feature.number}</div>
              <div className="des flex-1">
                <div className="title text-3xl md:text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg" style={{fontFamily:'Poppins, sans-serif'}}>{feature.title}</div>
                <p className="text-lg md:text-xl text-blue-700 mb-4 font-medium max-w-2xl drop-shadow-sm">{feature.description}</p>
              </div>
              <img 
                src={feature.image} 
                alt={feature.title} 
                className="decorate w-[200px] md:w-[320px] rounded-2xl shadow-2xl border border-white/20 object-cover pointer-events-auto cursor-pointer hover:scale-105 transition-transform duration-300" 
                onClick={() => setImageFull({ show: true, src: feature.image, alt: feature.title })}
              />
            </div>
          </section>
        ))}
      </main>

      {/* Final CTA Section */}
      <section className="section relative min-h-[40vh] flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700">
        <div className="content-fit text-center">
          <div className="number text-[4rem] md:text-[7rem] font-extrabold text-blue-200 drop-shadow-2xl opacity-20 select-none leading-none" style={{fontFamily:'Poppins, sans-serif'}}>06</div>
          <div className="title text-3xl md:text-5xl font-extrabold text-blue-100 mb-4 drop-shadow-lg" style={{fontFamily:'Poppins, sans-serif'}}>Ready to supercharge your test creation?</div>
          <Link to="/ai-conversation">
            <button className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-pink-600 text-white text-2xl font-bold rounded-full shadow-2xl transition-all mt-6">
              Start Your AI Conversation
            </button>
          </Link>
        </div>
      </section>

      {/* Keyframes for floating animation */}
      <style>{`
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
        .section { width: 100%; position: relative; }
        .content-fit { width: min(1200px, 90vw); margin: auto; position: relative; }
        .decorate { z-index: 1; }
        /* Flying AI Bot Animation */
        @keyframes bot-fly {
          0% { left: 0; top: 0; transform: translateY(0) scale(1); }
          20% { left: 20vw; top: 10px; transform: translateY(-10px) scale(1.05); }
          40% { left: 40vw; top: 30px; transform: translateY(10px) scale(1.1); }
          60% { left: 60vw; top: 10px; transform: translateY(-10px) scale(1.05); }
          80% { left: 80vw; top: 0; transform: translateY(0) scale(1); }
          100% { left: 100vw; top: 0; transform: translateY(0) scale(1); }
        }
        .animate-bot-fly {
          animation: bot-fly 12s linear infinite;
        }
        /* Animated Glow for Video Card */
        @keyframes glow {
          0% { box-shadow: 0 0 24px 0 #60a5fa44, 0 0 0 0 #fff0; }
          50% { box-shadow: 0 0 48px 8px #6366f144, 0 0 0 0 #fff0; }
          100% { box-shadow: 0 0 24px 0 #60a5fa44, 0 0 0 0 #fff0; }
        }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        @media (min-width: 768px) {
          body { cursor: none !important; }
        }
        @keyframes ball-pop {
          0% { opacity: 0.7; transform: scale(1) translate(0,0); }
          60% { opacity: 0.8; transform: scale(1.2) translate(var(--dx,0), var(--dy,0)); }
          100% { opacity: 0; transform: scale(0.7) translate(var(--dx,0), var(--dy,0)); }
        }
        .animate-ball-pop {
          animation: ball-pop 1s cubic-bezier(.4,1.6,.6,1) forwards;
        }
      `}</style>
    </>
  );
}

// VideoEditorPlayer component
function VideoEditorPlayer({ large }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 2; // Set playback speed to 2x
    if (playing) video.play();
    else video.pause();
    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) || 0);
    };
    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, [playing]);

  return (
    <div className={`relative w-full ${large ? 'h-[60vh] md:h-[70vh]' : 'h-64 md:h-96'} flex flex-col justify-end`}>
      <video
        ref={videoRef}
        src="/videos/ai-conversation.webm"
        poster="/images/ai-conversations/ai--chats-for-test.png"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover rounded-3xl"
        style={{background:'#222'}}
        tabIndex={-1}
        controls={large}
      >
        Sorry, your browser does not support embedded videos.
      </video>
      {/* Play/Pause Button Overlay (hide if large/controls) */}
      {!large && (
        <button
          aria-label={playing ? 'Pause video' : 'Play video'}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-blue-700 rounded-full shadow-lg p-4 z-10 border-2 border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => setPlaying(p => !p)}
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setPlaying(p => !p); }}
        >
          {playing ? (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="7" y="7" width="6" height="18" rx="2" fill="#2563eb"/><rect x="19" y="7" width="6" height="18" rx="2" fill="#2563eb"/></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><polygon points="10,7 26,16 10,25" fill="#2563eb"/></svg>
          )}
        </button>
      )}
      {/* Fake Timeline/Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center">
        <div
          className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-r-2xl transition-all"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
} 
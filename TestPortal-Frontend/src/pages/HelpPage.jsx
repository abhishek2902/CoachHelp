import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';
import { Play, X, Video, MessageCircle, ArrowRight, CheckCircle, Star, Users, RotateCw, RotateCcw, Pause } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApiLoading } from '../hooks/useApiLoading';

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

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    : null;
};

const HelpPage = () => {
  const [helps, setHelps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHelp, setSelectedHelp] = useState(null);
  const base2 = import.meta.env.VITE_API_BASE_URL2;
  const { startLoading, stopLoading, isLoading } = useApiLoading();

  useEffect(() => {
    const fetchHelps = async () => {
      startLoading();
      try {
        const response = await axios.get(`${base2}/helps`);
        setHelps(response.data.helps || []);
      } catch (error) {
        console.error('Error fetching help content:', error);
      } finally {
        setLoading(false);
        stopLoading();
      }
    };
    fetchHelps();
  }, [base2]);

  // Banner video: use first help's video or fallback
  const bannerDesc = helps[0]?.description
    ? helps[0].description.replace(/<[^>]+>/g, '').slice(0, 120) + '...'
    : 'Browse our comprehensive video guides and tutorials. Click any video to read the full help article.';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Helmet>
        <title>Help Center | Talenttest.io</title>
        <meta name="description" content="Get help and support for Talenttest.io. Browse our comprehensive video guides and tutorials to make the most of our platform." />
        <meta property="og:title" content="Help Center | Talenttest.io" />
        <meta property="og:description" content="Get help and support for Talenttest.io. Browse our comprehensive video guides and tutorials." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talenttest.io/help" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-indigo-800 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-bg-pattern.svg')] bg-repeat" aria-hidden="true"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Help
                <span className="block text-blue-300">Center</span>
              </h1>
              <p className="mb-8 text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                {bannerDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="#videos" 
                  className="group inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                  Browse Videos <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <a 
                  href="#contact" 
                  className="group inline-flex items-center justify-center bg-gray-700/50 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-700/80 transition"
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Contact Support
                </a>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Video Tutorials</span>
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300" /> Step-by-Step Guides</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-300" /> Expert Support</span>
              </div>
            </div>
            {/* Rotatable Hero Video */}
            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="absolute w-full h-full bg-blue-500 rounded-full -bottom-24 -right-12 blur-3xl opacity-20"></div>
              {helps[0]?.video_url ? (
                <RotatableYouTubeVideo 
                  videoId={helps[0].video_url.split('v=')[1] || 'TX5FmtmWPtc'}
                  title="Help Center Demo"
                />
              ) : (
                <RotatableYouTubeVideo 
                  videoId="TX5FmtmWPtc"
                  title="Help Center Demo"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Video Grid Section */}
        <section id="videos" className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Video Tutorials & Guides</h2>
              <p className="text-lg text-gray-600">
                Learn how to use Talenttest.io effectively with our comprehensive video tutorials and step-by-step guides.
              </p>
            </div>
            
            {helps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Video className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No help topics available.</p>
                <p className="text-gray-400 text-sm">Check back soon for new tutorials.</p>
              </div>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {helps.map((help) => {
                  const thumb = getYouTubeThumbnail(help.video_url);
                  return (
                    <div
                      key={help.id}
                      className="bg-gray-50 rounded-xl shadow-md overflow-hidden flex flex-col cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                      onClick={() => setSelectedHelp(help)}
                    >
                      <div className="relative aspect-w-16 aspect-h-9 bg-black overflow-hidden">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={help.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-gray-400">
                            <Play className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black/60 rounded-full p-3 hover:bg-blue-600 transition-all duration-200">
                            <Play className="w-8 h-8 text-white hover:scale-110 transition-transform" />
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <h3 className="font-semibold text-xl text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">{help.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-3">
                          {help.description ? help.description.replace(/<[^>]+>/g, '').slice(0, 100) + '...' : 'Click to view this tutorial.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Need More Help?</h2>
            <p className="text-blue-200 mt-4 mb-8 text-lg">Can't find what you're looking for? Our support team is here to help you get the most out of Talenttest.io.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@talenttest.io"
                className="group inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg shadow-2xl hover:bg-yellow-300 transition-transform transform hover:scale-105"
              >
                Contact Support <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
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

      {/* Modal for full help */}
      <AnimatePresence>
        {selectedHelp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            onClick={() => setSelectedHelp(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                onClick={() => setSelectedHelp(null)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-900">{selectedHelp.title}</h2>
              {selectedHelp.video_url && (
                <div className="aspect-w-16 aspect-h-9 mb-8">
                  <iframe
                    src={getYouTubeEmbedUrl(selectedHelp.video_url)}
                    title={selectedHelp.title}
                    className="w-full h-full rounded-lg shadow"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="prose max-w-none text-gray-700 mx-auto text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedHelp.description }} />
            </div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default HelpPage; 
import { useEffect, useRef, useState } from "react";
import { Eye, Download, Volume2, VolumeX, Maximize2 } from "lucide-react";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/loader.json";

function VideoViewer({ videoUrl, onLoad }) {
  const videoRef = useRef();
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "training_video.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video && video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center px-2 sm:px-4">
      {/* Controls */}
      <div className="absolute -top-10 flex justify-end items-center w-full text-xs mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleFullscreen}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Video player */}
      <div className="w-full max-w-4xl rounded-xl shadow-lg bg-gradient-to-br from-white via-gray-50 to-gray-100 p-1">
        <div className="rounded-xl bg-white overflow-hidden border border-gray-200 shadow-inner">
          {isLoading && (
            <div className="flex justify-center items-center min-h-[70vh]">
              <Lottie animationData={loaderAnimation} loop={true} className="w-44 h-44" />
            </div>
          )}
          <video
            ref={videoRef}
            controls
            onLoadedData={handleLoadedData}
            className={`w-full rounded-xl ${isLoading ? "hidden" : ""}`}
            muted={isMuted}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default VideoViewer;

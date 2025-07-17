import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { showWarningAlert } from '../utils/sweetAlert';

const FaceDetectionSetup = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { attemptId, guest_token } = useParams();

  const [webcamRequired, setWebcamRequired] = useState(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const [isCalibrated, setIsCalibrated] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Constants for detection thresholds
  const CONSTANTS = {
    CALIBRATION_TIME: 5000, // 5 seconds for calibration
    FACE_SIZE_MIN: 0.15,    // minimum face size relative to frame
    PARTIAL_LANDMARK_THRESHOLD: 80, // less than this landmarks = partial face
  };

  // Fetch the attempt/test config to see if webcam is required
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/test_attempts/${attemptId}`,
          { params: { guest_token } }
        );
        const webcamFlag = response.data.test?.webcam_required;
        setWebcamRequired(!!webcamFlag);
      } catch (error) {
        console.error('Error fetching test config:', error);
        setWebcamRequired(true);
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, [attemptId, guest_token]);

  const onResults = (results) => {
    if (!canvasRef.current) return;
    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    const faceCount = results.multiFaceLandmarks?.length || 0;
    setFacesDetected(faceCount);

    // Draw face mesh if available
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_TESSELATION, 
          { color: '#C0C0C070', lineWidth: 1 });
        window.drawConnectors(canvasCtx, landmarks, window.FACEMESH_FACE_OVAL, 
          { color: '#E0E0E0', lineWidth: 2 });
      }
    }

    // Check if face is properly detected
    if (faceCount === 1) {
      const landmarks = results.multiFaceLandmarks[0];
      const visibleLandmarksCount = landmarks.filter((lm) => lm !== undefined && lm !== null).length;
      if (visibleLandmarksCount >= CONSTANTS.PARTIAL_LANDMARK_THRESHOLD) {
        setIsReady(true);
      } else {
        setIsReady(false);
      }
    } else {
      setIsReady(false);
    }
  };

  useEffect(() => {
    if (webcamRequired !== true) return;

    const initializeFaceMesh = async () => {
      if (!window.FaceMesh) {
        console.error('MediaPipe FaceMesh not loaded');
        return;
      }

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 5,
        refineLandmarks: true,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });

      faceMesh.onResults(onResults);

      try {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });

        await camera.start();

        // Start calibration timer
        setTimeout(() => {
          setIsCalibrated(true);
        }, CONSTANTS.CALIBRATION_TIME);
      } catch (error) {
        console.error('Camera initialization failed:', error);
        showWarningAlert(
          'Camera initialization failed',
          'Please ensure your camera is working and try again.'
        );
      }
    };

    // Delay a bit to ensure videoRef is attached
    const timeoutId = setTimeout(initializeFaceMesh, 1000);
    return () => clearTimeout(timeoutId);
  }, [webcamRequired]);

  // Add helper to convert dataURL to Blob
  const dataURLToBlob = (dataURL) => {
    const [header, base64Data] = dataURL.split(',');
    const contentTypeMatch = header.match(/:(.*?);/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/jpeg';
    const raw = window.atob(base64Data);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  };

  // Add screenshot upload function
  const uploadScreenshotToServer = async (reasonSuffix) => {
    if (!videoRef.current) return;
    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoRef.current.videoWidth;
    tempCanvas.height = videoRef.current.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.5);
    const blob = dataURLToBlob(dataUrl);
    const formData = new FormData();
    formData.append('test_attempt_id', attemptId);
    formData.append('screenshot', blob, `${reasonSuffix}_${Date.now()}.jpg`);
    // Add tag for backend
    if (reasonSuffix === 'start') {
      formData.append('tag', 'start_test');
    }
    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      await axios.post(
        `${base}/face_detection_screenshots`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'guest_token': guest_token
          }
        }
      );
      // Optionally: console.log('Start screenshot uploaded');
    } catch (error) {
      console.error('Failed to upload start screenshot:', error);
    }
  };

  const handleStartTest = async () => {
    if (webcamRequired) {
      if (facesDetected > 1) {
        showWarningAlert('Multiple faces detected!', 'Please ensure only one person is visible before starting the test.');
        return;
      }
      if (!isReady) {
        showWarningAlert('Face not properly detected', 'Please ensure your face is clearly visible before starting the test.');
        return;
      }
    }
    // Capture and upload screenshot before navigating
    await uploadScreenshotToServer('start');
    // Navigate directly to the test page
    navigate(`/attempt/${attemptId}/${guest_token}`);
  };

  // While fetching config, show a loading placeholder
  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-700 text-lg">Loading...</div>
      </div>
    );
  }

  // If webcam is NOT required, show a simple UI
  if (!webcamRequired) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Ready</h1>
          <button
            onClick={handleStartTest}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  // If webcam IS required, render the face-detection UI
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Face Detection Setup
        </h1>

        <div className="relative mb-6">
          <video
            ref={videoRef}
            className="w-full rounded-lg border-2 border-gray-300"
            style={{ display: 'none' }}
            autoPlay
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg border-2 border-gray-300"
            width="640"
            height="480"
          />

          {!isCalibrated && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <div className="text-xl font-semibold mb-2">Calibrating Camera...</div>
                <div className="w-48 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-5000"
                    style={{
                      width: '100%',
                      animation: 'progress 5s linear forwards',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <div className="text-lg font-semibold text-gray-700 mb-2">
            Status:{' '}
            {!isCalibrated
              ? 'Calibrating...'
              : facesDetected === 0
              ? 'No face detected'
              : facesDetected > 1
              ? 'Multiple faces detected!'
              : !isReady
              ? 'Face not properly detected'
              : 'Ready to start'}
          </div>
          <div className="text-sm text-gray-600">
            {!isCalibrated
              ? 'Please wait while we calibrate the camera...'
              : facesDetected === 0
              ? 'Please ensure your face is visible in the camera'
              : facesDetected > 1
              ? 'Please ensure only one person is visible'
              : !isReady
              ? 'Please position your face properly in the frame'
              : 'Your face is properly detected. You can start the test when ready.'}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleStartTest}
            disabled={!isCalibrated || !isReady || facesDetected !== 1}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors
              ${(!isCalibrated || !isReady || facesDetected !== 1)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionSetup;

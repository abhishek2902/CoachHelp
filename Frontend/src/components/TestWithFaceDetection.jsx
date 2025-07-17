import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showWarningAlert } from '../utils/sweetAlert';
import './TestWithFaceDetection.css';
import Swal from 'sweetalert2';

const TestWithFaceDetection = forwardRef(({ children, handleSubmitRef }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [facesDetected, setFacesDetected] = useState(0);
  const [eventLog, setEventLog] = useState([]);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [warningCount, setWarningCount] = useState(0);

  // State for whether webcam is required and loading flag
  const [webcamRequired, setWebcamRequired] = useState(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const { testId, attemptId, guest_token } = useParams();
  const navigate = useNavigate();

  const isWarningOpenRef = useRef(false);
  const lastWarningTimeRef = useRef(0);
  const multipleFacesDetectedRef = useRef(false);
  const warningStateRef = useRef({ count: 0, lastUpdate: 0 });

  const CONSTANTS = {
    CALIBRATION_TIME: 5000, // 5 seconds for calibration
    PARTIAL_LANDMARK_THRESHOLD: 80, // minimum landmarks to consider face "ready"
    MAX_WARNINGS: 3,       // number of warnings before auto-submit
    WARNING_COOLDOWN: 2000 // 2-second cooldown between warnings
  };

  // Helper: convert a dataURL string into a Blob
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

  // Upload a screenshot to the backend
  const uploadScreenshotToServer = async (reasonSuffix) => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);
    const blob = dataURLToBlob(dataUrl);

    const formData = new FormData();
    formData.append('test_attempt_id', attemptId);
    formData.append('screenshot', blob, `${reasonSuffix}_${Date.now()}.jpg`);
    // Add tag for backend
    if (reasonSuffix === 'start') {
      formData.append('tag', 'start_test');
    } else if (reasonSuffix === 'end') {
      formData.append('tag', 'end_test');
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
      console.log(`Screenshot uploaded: ${reasonSuffix}`);
    } catch (error) {
      console.error('Failed to upload screenshot:', error);
    }
  };

  // Log a security event (and optionally upload a screenshot)
  const addEvent = async (type, severity = 'info', screenshotReason = null) => {
    const timestamp = new Date().toISOString();
    const event = { type, severity, timestamp };

    if (screenshotReason && canvasRef.current) {
      await uploadScreenshotToServer(screenshotReason);
    }

    try {
      const base = import.meta.env.VITE_API_BASE_URL;
      await axios.post(
        `${base}/test_attempts/${attemptId}/security_events`,
        {
          event_type: type,
          timestamp,
          severity
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'guest_token': guest_token
          }
        }
      );
    } catch (error) {
      console.error('Failed to send security event:', error);
    }

    setEventLog((prev) => [...prev, event]);
  };

  // Show a warning dialog; on the final warning, auto-submit the test
  const showWarning = async (warningNumber, isNoFace = false) => {
    if (isWarningOpenRef.current) return;

    setWarningCount(warningNumber);
    warningStateRef.current = { count: warningNumber, lastUpdate: Date.now() };

    const reasonText = isNoFace ? 'No face detected' : 'Multiple faces detected';
    const screenshotReason = isNoFace ? 'no_face_warning' : 'multiple_faces_warning';

    // If final warning, log it, show modal, then auto-submit
    if (warningNumber >= CONSTANTS.MAX_WARNINGS) {
      await addEvent(
        `${reasonText} - Final warning (${warningNumber}/${CONSTANTS.MAX_WARNINGS}) - Auto-submitting test`,
        'high',
        screenshotReason
      );

      Swal.fire({
        title: 'Final Warning - Test Will Be Submitted',
        text: `This is your final warning (${warningNumber}/${CONSTANTS.MAX_WARNINGS}). ${reasonText}. The test will be submitted automatically.`,
        icon: 'error',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => {
        if (handleSubmitRef?.current) {
          handleSubmitRef.current(true);
        } else {
          console.error('handleSubmitRef is not available for test submission');
        }
      });
      return;
    }

    // Otherwise, log the warning and show a modal
    await addEvent(
      `${reasonText} - Warning ${warningNumber}/${CONSTANTS.MAX_WARNINGS}`,
      'high',
      screenshotReason
    );

    isWarningOpenRef.current = true;
    lastWarningTimeRef.current = Date.now();

    Swal.fire({
      title: isNoFace ? 'No Face Detected!' : 'Multiple Faces Detected!',
      text: `Warning ${warningNumber}/${CONSTANTS.MAX_WARNINGS}: ${reasonText}. The test will be auto-submitted after ${CONSTANTS.MAX_WARNINGS} warnings.`,
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      isWarningOpenRef.current = false;
      if (result.isConfirmed) {
        // Prevent immediate retrigger
        setTimeout(() => {
          multipleFacesDetectedRef.current = false;
        }, CONSTANTS.WARNING_COOLDOWN * 2);
      }
    });
  };

  // MediaPipe FaceMesh callback
  const onResults = (results) => {
    if (!canvasRef.current) return;
    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    const faceCount = results.multiFaceLandmarks?.length || 0;
    setFacesDetected(faceCount);

    const hasInvalidFaceCount = faceCount === 0 || faceCount > 1;
    const now = Date.now();

    if (
      hasInvalidFaceCount &&
      !isWarningOpenRef.current &&
      !multipleFacesDetectedRef.current &&
      now - lastWarningTimeRef.current >= CONSTANTS.WARNING_COOLDOWN &&
      warningStateRef.current.count < CONSTANTS.MAX_WARNINGS
    ) {
      multipleFacesDetectedRef.current = true;
      const nextWarning = warningStateRef.current.count + 1;
      showWarning(nextWarning, faceCount === 0);
    }

    if (!hasInvalidFaceCount && !isWarningOpenRef.current) {
      multipleFacesDetectedRef.current = false;

      if (faceCount === 1) {
        const landmarks = results.multiFaceLandmarks[0];
        const visibleCount = landmarks.filter((lm) => lm != null).length;
        if (visibleCount >= CONSTANTS.PARTIAL_LANDMARK_THRESHOLD) {
          setIsCalibrated(true);
        }
      }
    }
  };

  // Reset warnings on mount
  useEffect(() => {
    setWarningCount(0);
    warningStateRef.current = { count: 0, lastUpdate: 0 };
    multipleFacesDetectedRef.current = false;
    lastWarningTimeRef.current = 0;
    isWarningOpenRef.current = false;
  }, []);

  // Fetch the test configuration (to see if webcam is required)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(
          `${base}/test_attempts/${attemptId}`,
          {
            params: { guest_token },
            headers: { 'Content-Type': 'application/json' }
          }
        );
        const webcamFlag = response.data.test?.webcam_required;
        setWebcamRequired(!!webcamFlag);
      } catch (error) {
        console.error('Error fetching test config:', error);
        // If there's an error, default to requiring webcam
        setWebcamRequired(true);
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchConfig();
  }, [attemptId, guest_token]);

  // Initialize FaceMesh only if webcam is required
  useEffect(() => {
    if (webcamRequired !== true) return;

    const initializeFaceMesh = async () => {
      if (!window.FaceMesh) {
        console.error('MediaPipe FaceMesh not loaded');
        return;
      }

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 5,
        refineLandmarks: true,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3
      });

      faceMesh.onResults(onResults);

      try {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.send({ image: videoRef.current });
          },
          width: 640,
          height: 480
        });
        await camera.start();

        // After calibration time, mark as calibrated if one valid face is found
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

    const timeoutId = setTimeout(initializeFaceMesh, 1000);
    return () => clearTimeout(timeoutId);
  }, [webcamRequired]);

  useImperativeHandle(ref, () => ({
    uploadEndScreenshot: async () => {
      await uploadScreenshotToServer('end');
    }
  }));

  // While fetching config, show a loading placeholder
  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-700 text-lg">Loading...</div>
      </div>
    );
  }

  // If webcam is NOT required, bypass face detection entirely
  if (webcamRequired === false) {
    return <>{children}</>;
  }

  // If webcam IS required, render the face-detection wrapper
  return (
    <div className="test-with-face-detection">
      {/* Hidden video and canvas elements */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
      />

      {/* Main test content */}
      {children}
    </div>
  );
});

export default TestWithFaceDetection;

import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const videoRef = useRef(null);

  // Check if browser supports camera
  const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const stopCamera = useCallback(() => {
    setStream(currentStream => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
  }, []);

  const startCamera = useCallback(async (overrideMode) => {
    if (!isSupported) {
      setError('Your browser does not support camera access.');
      return;
    }

    setIsLoading(true);
    setError(null);
    stopCamera(); // Stop any existing stream before starting a new one

    try {
      // Add ideal resolution and facing mode constraints
      const modeToUse = typeof overrideMode === 'string' ? overrideMode : facingMode;
      const constraints = {
        video: {
          facingMode: modeToUse,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Need to wait for video to load metadata before it can play properly in some browsers
        videoRef.current.onloadedmetadata = () => {
           videoRef.current.play().catch(e => console.error("Error playing video:", e));
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      // Handle common specific errors
      if (err.name === 'NotAllowedError') {
         setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
         setError('No camera device found on this device.');
      } else if (err.name === 'NotReadableError') {
         setError('Camera is already in use by another application.');
      } else {
         setError('Could not access the camera. Please ensure permissions are granted and camera is not in use.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, isSupported, stopCamera]);

  const toggleCamera = useCallback(() => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    
    // Auto-restart if we already had a stream running
    if (stream) {
      startCamera(newMode);
    }
  }, [facingMode, stream, startCamera]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !stream) return null;

    const canvas = document.createElement('canvas');
    // Ensure we use actual video dimensions
    canvas.width = videoRef.current.videoWidth || 1920;
    canvas.height = videoRef.current.videoHeight || 1080;
    
    const ctx = canvas.getContext('2d');
    
    // If using front camera, mirror the image on canvas so it looks like the preview
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9); // High quality JPEG
    });
  }, [stream, facingMode]);

  return {
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    toggleCamera,
    isSupported,
    isLoading,
    facingMode,
    error,
    stream
  };
};

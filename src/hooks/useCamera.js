import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for camera capture functionality
 * Supports both live camera and file upload
 */
export function useCamera() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      // Set active first so video element mounts, then connect in useEffect
      setCameraActive(true);
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      return false;
    }
  }, [facingMode]);

  // Connect stream to video element AFTER it mounts
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (!videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [cameraActive]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];

    setCapturedImage(dataUrl);
    setImageBase64(base64);
    stopCamera();

    return { dataUrl, base64 };
  }, [stopCamera]);

  const handleFileUpload = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const base64 = dataUrl.split(',')[1];
        setCapturedImage(dataUrl);
        setImageBase64(base64);
        resolve({ dataUrl, base64 });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const flipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    if (cameraActive) {
      stopCamera();
      // Will restart with new facing mode
      setTimeout(startCamera, 100);
    }
  }, [cameraActive, stopCamera, startCamera]);

  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setImageBase64(null);
  }, []);

  const setCroppedImage = useCallback((dataUrl, base64) => {
    setCapturedImage(dataUrl);
    setImageBase64(base64);
  }, []);

  return {
    videoRef,
    capturedImage,
    imageBase64,
    cameraActive,
    facingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    handleFileUpload,
    flipCamera,
    clearImage,
    setCroppedImage
  };
}

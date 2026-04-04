import { useState, useRef, useCallback, useEffect } from 'react';
import documentService from '../services/documentService';
import { adaptiveSettings, compressImage } from '../utils/performance';

/**
 * Custom hook for camera capture functionality
 * Supports both live camera and file upload, plus document processing
 * Optimized for low-end devices with adaptive resolution and compression
 */
export function useCamera() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null); // Lazy-create canvas only when needed

  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    return canvasRef.current;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const camConstraints = adaptiveSettings.cameraConstraints;
      const constraints = {
        video: {
          facingMode,
          ...camConstraints,
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
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

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = getCanvas();

    // Adaptive: limit capture resolution for low-end devices
    const maxDim = adaptiveSettings.maxImageDimension;
    let w = video.videoWidth;
    let h = video.videoHeight;

    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    const quality = adaptiveSettings.imageQuality;
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.split(',')[1];

    // Free canvas memory
    canvas.width = 0;
    canvas.height = 0;

    setCapturedImage(dataUrl);
    setImageBase64(base64);
    stopCamera();

    return { dataUrl, base64 };
  }, [stopCamera, getCanvas]);

  const handleFileUpload = useCallback(async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;

        // Compress uploaded image for low-end devices
        const compressed = await compressImage(dataUrl);
        setCapturedImage(compressed.dataUrl);
        setImageBase64(compressed.base64);
        resolve(compressed);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDocumentUpload = useCallback(async (file) => {
    try {
      const result = await documentService.processFile(file);

      if (result.type === 'image') {
        const base64 = result.images[0];
        const dataUrl = result.preview;
        // Compress
        const compressed = await compressImage(dataUrl);
        setCapturedImage(compressed.dataUrl);
        setImageBase64(compressed.base64);
        setDocumentContent(null);
      } else {
        setDocumentContent(result);
        setCapturedImage(result.preview || null);
        setImageBase64(null);
      }

      return result;
    } catch (err) {
      console.error('Document upload error:', err);
      throw err;
    }
  }, []);

  const flipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    if (cameraActive) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [cameraActive, stopCamera, startCamera]);

  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setImageBase64(null);
    // Free canvas memory
    if (canvasRef.current) {
      canvasRef.current.width = 0;
      canvasRef.current.height = 0;
    }
  }, []);

  const clearDocument = useCallback(() => {
    setDocumentContent(null);
  }, []);

  const setCroppedImage = useCallback(async (dataUrl, base64) => {
    // Compress cropped image too
    const compressed = await compressImage(dataUrl);
    setCapturedImage(compressed.dataUrl);
    setImageBase64(compressed.base64);
  }, []);

  return {
    videoRef,
    capturedImage,
    imageBase64,
    documentContent,
    cameraActive,
    facingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    handleFileUpload,
    handleDocumentUpload,
    flipCamera,
    clearImage,
    clearDocument,
    setCroppedImage
  };
}

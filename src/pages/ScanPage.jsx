/**
 * ScanPage — Camera + upload route wrapper.
 * Bridges the useCamera hook with the CameraCapture component
 * and uses the scan store for AI processing.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import { useCamera } from '../hooks/useCamera';
import { useScanStore, useSettingsStore } from '../store';

export default function ScanPage() {
  const camera = useCamera();
  const navigate = useNavigate();
  const explain = useScanStore((s) => s.explain);
  const setCapturedImage = useScanStore((s) => s.setCapturedImage);
  const setDocumentContent = useScanStore((s) => s.setDocumentContent);
  const isProcessing = useScanStore((s) => s.isProcessing);
  const settings = useSettingsStore();

  const handleExplain = useCallback(async () => {
    if (!camera.imageBase64 && !camera.documentContent) return;
    // Push image/doc into scan store
    if (camera.imageBase64) {
      setCapturedImage(camera.capturedImage, camera.imageBase64);
    }
    if (camera.documentContent) {
      setDocumentContent(camera.documentContent);
    }
    // Navigate to explanation, then start processing
    navigate('/explain');
    await explain(settings);
  }, [camera, setCapturedImage, setDocumentContent, explain, settings, navigate]);

  const handleImageCropped = useCallback((croppedImage) => {
    const croppedBase64 = croppedImage.split(',')[1];
    camera.setCroppedImage(croppedImage, croppedBase64);
  }, [camera]);

  return (
    <CameraCapture
      videoRef={camera.videoRef}
      capturedImage={camera.capturedImage}
      cameraActive={camera.cameraActive}
      onStartCamera={camera.startCamera}
      onStopCamera={camera.stopCamera}
      onCapturePhoto={camera.capturePhoto}
      onFileUpload={camera.handleFileUpload}
      onFlipCamera={camera.flipCamera}
      onClearImage={camera.clearImage}
      onExplain={handleExplain}
      isProcessing={isProcessing}
      onImageCropped={handleImageCropped}
      facingMode={camera.facingMode}
      onDocumentUpload={camera.handleDocumentUpload}
      onClearDocument={camera.clearDocument}
      documentContent={camera.documentContent}
    />
  );
}

/**
 * ScanPage — Camera + upload route wrapper.
 * Bridges the useCamera hook with the CameraCapture component
 * and uses the scan store for AI processing.
 * If an active explanation exists in the store, shows a banner to resume.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import { useCamera } from '../hooks/useCamera';
import { useScanStore, useSettingsStore } from '../store';
import Button from '../lib/components/Button';
import { ArrowRight } from 'lucide-react';

export default function ScanPage() {
  const camera = useCamera();
  const navigate = useNavigate();
  const explain = useScanStore((s) => s.explain);
  const setCapturedImage = useScanStore((s) => s.setCapturedImage);
  const setDocumentContent = useScanStore((s) => s.setDocumentContent);
  const isProcessing = useScanStore((s) => s.isProcessing);
  const existingExplanation = useScanStore((s) => s.explanation);
  const resetScan = useScanStore((s) => s.resetScan);
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
    <>
    {/* Resume banner — shown when an explanation is already in memory */}
    {existingExplanation && !isProcessing && !existingExplanation.startsWith('**Connection Error**') && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', margin: '0 16px 8px',
        background: 'rgba(99, 102, 241, 0.1)', borderRadius: 12,
        border: '1px solid rgba(99, 102, 241, 0.25)',
      }}>
        <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>
          You have an active explanation
        </span>
        <Button variant="primary" size="xs" icon={<ArrowRight size={14} />}
          onClick={() => navigate('/explain')}>
          Resume
        </Button>
        <Button variant="ghost" size="xs" onClick={resetScan}
          style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Dismiss
        </Button>
      </div>
    )}
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
    </>
  );
}

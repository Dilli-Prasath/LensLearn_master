import { useRef, useEffect } from 'react';
import { Camera, SwitchCamera, Upload, X, RotateCcw } from 'lucide-react';

export default function CameraCapture({
  videoRef,
  capturedImage,
  cameraActive,
  onStartCamera,
  onCapturePhoto,
  onFileUpload,
  onFlipCamera,
  onClearImage,
  onExplain,
  isProcessing
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
    e.target.value = '';
  };

  // Show captured image preview
  if (capturedImage) {
    return (
      <div style={styles.previewContainer} className="fade-in">
        <div style={styles.previewImageWrapper}>
          <img src={capturedImage} alt="Captured textbook page" style={styles.previewImage} />
          {!isProcessing && (
            <button style={styles.clearBtn} onClick={onClearImage} aria-label="Clear image">
              <X size={18} />
            </button>
          )}
        </div>
        <div style={styles.previewActions}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onClearImage}
            disabled={isProcessing}
          >
            <RotateCcw size={18} />
            Retake
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={onExplain}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Analyzing...
              </>
            ) : (
              <>
                <BookOpenIcon />
                Explain This
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Show camera viewfinder
  if (cameraActive) {
    return (
      <div style={styles.cameraContainer} className="fade-in">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />
        <div style={styles.cameraOverlay}>
          <div style={styles.cameraGuide}>
            <div style={{ ...styles.corner, top: 0, left: 0 }} />
            <div style={{ ...styles.corner, top: 0, right: 0, transform: 'scaleX(-1)' }} />
            <div style={{ ...styles.corner, bottom: 0, left: 0, transform: 'scaleY(-1)' }} />
            <div style={{ ...styles.corner, bottom: 0, right: 0, transform: 'scale(-1)' }} />
          </div>
          <p style={styles.cameraHint}>Position the textbook page within the frame</p>
        </div>
        <div style={styles.cameraControls}>
          <button className="btn btn-icon btn-secondary" onClick={onFlipCamera}>
            <SwitchCamera size={22} />
          </button>
          <button style={styles.captureBtn} onClick={onCapturePhoto}>
            <div style={styles.captureBtnInner} />
          </button>
          <button className="btn btn-icon btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={22} />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  // Show capture options (initial state)
  return (
    <div style={styles.captureOptions} className="fade-in">
      <div style={styles.illustration}>
        <div style={styles.illustrationCircle}>
          <Camera size={48} color="var(--primary-light)" />
        </div>
      </div>
      <h2 style={styles.title}>Point your lens at any page</h2>
      <p style={styles.subtitle}>
        Take a photo of a textbook page, homework problem, or any learning material
      </p>
      <div style={styles.buttonGroup}>
        <button className="btn btn-primary btn-full" onClick={onStartCamera}>
          <Camera size={20} />
          Open Camera
        </button>
        <button className="btn btn-secondary btn-full" onClick={() => fileInputRef.current?.click()}>
          <Upload size={20} />
          Upload Image
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

function BookOpenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

const styles = {
  captureOptions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 24px',
    gap: 20,
    textAlign: 'center',
  },
  illustration: { marginBottom: 8 },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
    border: '2px solid rgba(99,102,241,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: 15,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    maxWidth: 320,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxWidth: 320,
    marginTop: 8,
  },
  // Camera viewfinder styles
  cameraContainer: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#000',
  },
  video: {
    flex: 1,
    objectFit: 'cover',
    width: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  cameraGuide: {
    position: 'relative',
    width: '80%',
    aspectRatio: '4/3',
    maxHeight: '60%',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderTop: '3px solid var(--primary-light)',
    borderLeft: '3px solid var(--primary-light)',
    borderRadius: '4px 0 0 0',
  },
  cameraHint: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    background: 'rgba(0,0,0,0.5)',
    padding: '6px 14px',
    borderRadius: 20,
  },
  cameraControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    padding: '20px 24px',
    background: 'rgba(0,0,0,0.7)',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: '4px solid white',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  captureBtnInner: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'white',
    transition: 'transform 0.15s',
  },
  // Preview styles
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
  },
  previewImageWrapper: {
    position: 'relative',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  previewImage: {
    width: '100%',
    maxHeight: 360,
    objectFit: 'contain',
    background: '#000',
    display: 'block',
  },
  clearBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewActions: {
    display: 'flex',
    gap: 12,
  },
};

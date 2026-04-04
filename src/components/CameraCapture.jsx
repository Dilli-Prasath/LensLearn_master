import { useRef, useState } from 'react';
import {
  Camera, SwitchCamera, Upload, X, RotateCcw, FileText, Crop, Sparkles,
  ArrowRight, Zap, FlashlightOff, Grid3X3, Timer, Focus
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ImageCropper from './ImageCropper';
import documentService from '../services/documentService';

export default function CameraCapture({
  videoRef,
  capturedImage,
  cameraActive,
  onStartCamera,
  onStopCamera,
  onCapturePhoto,
  onFileUpload,
  onFlipCamera,
  onClearImage,
  onExplain,
  isProcessing,
  onImageCropped,
  facingMode,
  onDocumentUpload,
  onClearDocument,
  documentContent
}) {
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [captureFlash, setCaptureFlash] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileWithType(file);
    e.target.value = '';
  };

  const handleFileWithType = async (file) => {
    setUploadError(null);
    try {
      if (file.type.startsWith('image/')) {
        onFileUpload(file);
      } else {
        await onDocumentUpload?.(file);
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to process file');
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer?.files?.[0]) handleFileWithType(e.dataTransfer.files[0]);
  };

  const handleCapture = () => {
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 200);
    onCapturePhoto();
  };

  const handleCropComplete = (croppedImage) => { setShowCropper(false); onImageCropped?.(croppedImage); };
  const handleSkipCrop = () => setShowCropper(false);
  const handleRetakeCrop = () => { setShowCropper(false); onClearImage(); };

  // --- Cropper view ---
  if (capturedImage && showCropper) {
    return (
      <ImageCropper
        imageSrc={capturedImage}
        onCropComplete={handleCropComplete}
        onRetake={handleRetakeCrop}
        onSkip={handleSkipCrop}
      />
    );
  }

  // --- Document preview ---
  if (documentContent) {
    const ext = documentContent.fileName?.split('.').pop()?.toLowerCase();
    const typeLabel = ext === 'pdf' ? 'PDF' : ext === 'docx' || ext === 'doc' ? 'Word' : ext === 'csv' ? 'CSV' : ext === 'md' ? 'Markdown' : 'Text';

    return (
      <div style={s.previewContainer} className="slide-up">
        <div style={s.docCard}>
          {documentContent.preview && (
            <div style={s.docThumb}>
              <img src={documentContent.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={s.docInfo}>
            <div style={s.docIcon}><FileText size={22} color="var(--primary-light)" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={s.docName}>{documentContent.fileName}</p>
              <div style={s.docMeta}>
                <span style={s.docBadge}>{typeLabel}</span>
                {documentContent.pageCount && <span style={s.docPages}>{documentContent.pageCount} page{documentContent.pageCount !== 1 ? 's' : ''}</span>}
              </div>
            </div>
            {!isProcessing && (
              <button style={s.xBtn} onClick={() => { onClearImage(); onClearDocument?.(); }}><X size={16} /></button>
            )}
          </div>
        </div>
        <div style={s.actionRow} className="stagger-children">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { onClearImage(); onClearDocument?.(); }} disabled={isProcessing}>
            <RotateCcw size={18} /> Clear
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={onExplain} disabled={isProcessing}>
            {isProcessing ? <><LoadingSpinner variant="scan" size="sm" /> Analyzing...</> : <><Sparkles size={18} /> Explain This</>}
          </button>
        </div>
      </div>
    );
  }

  // --- Captured image preview ---
  if (capturedImage) {
    return (
      <div style={s.previewContainer} className="scale-in">
        <div style={s.imgWrapper}>
          <img src={capturedImage} alt="Captured" style={s.previewImg} />
          {!isProcessing && (
            <button style={s.xBtnAbsolute} onClick={onClearImage}><X size={18} /></button>
          )}
        </div>
        <div style={s.actionRow} className="stagger-children">
          <button className="btn btn-secondary" onClick={onClearImage} disabled={isProcessing}>
            <RotateCcw size={18} /> Retake
          </button>
          <button className="btn btn-secondary" onClick={() => setShowCropper(true)} disabled={isProcessing}>
            <Crop size={18} /> Crop
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={onExplain} disabled={isProcessing}>
            {isProcessing ? <><LoadingSpinner variant="scan" size="sm" /> Analyzing...</> : <><Sparkles size={18} /> Explain This</>}
          </button>
        </div>
      </div>
    );
  }

  // --- Camera viewfinder ---
  if (cameraActive) {
    return (
      <div style={s.cameraContainer}>
        {/* Flash effect on capture */}
        {captureFlash && <div style={s.captureFlash} />}

        {/* Top bar: close + tools */}
        <div style={s.cameraTopBar} className="fade-in">
          <button style={s.camTopBtn} onClick={onStopCamera} title="Close camera">
            <X size={22} color="white" />
          </button>
          <div style={s.camTopCenter}>
            <div style={s.camModeBadge}>
              <Camera size={14} /> Photo
            </div>
          </div>
          <div style={s.camTopRight}>
            <button
              style={{ ...s.camTopBtn, ...(showGrid ? { background: 'rgba(99,102,241,0.5)' } : {}) }}
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle grid"
            >
              <Grid3X3 size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Video feed */}
        <div style={s.videoWrapper}>
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={s.video}
            onLoadedMetadata={(e) => e.target.play().catch(() => {})}
            onCanPlay={(e) => e.target.play().catch(() => {})}
          />

          {/* Overlay: guide frame + grid */}
          <div style={s.cameraOverlay}>
            <div style={s.scanLine} />

            {/* Guide frame */}
            <div style={s.cameraGuide}>
              <div style={{ ...s.corner, top: 0, left: 0 }} />
              <div style={{ ...s.corner, top: 0, right: 0, transform: 'scaleX(-1)' }} />
              <div style={{ ...s.corner, bottom: 0, left: 0, transform: 'scaleY(-1)' }} />
              <div style={{ ...s.corner, bottom: 0, right: 0, transform: 'scale(-1)' }} />

              {/* Rule-of-thirds grid */}
              {showGrid && (
                <>
                  <div style={{ ...s.gridLine, top: '33.3%', left: 0, right: 0, height: 1 }} />
                  <div style={{ ...s.gridLine, top: '66.6%', left: 0, right: 0, height: 1 }} />
                  <div style={{ ...s.gridLine, left: '33.3%', top: 0, bottom: 0, width: 1 }} />
                  <div style={{ ...s.gridLine, left: '66.6%', top: 0, bottom: 0, width: 1 }} />
                </>
              )}
            </div>

            <p style={s.cameraHint} className="fade-in">
              <Focus size={14} style={{ marginRight: 6 }} />
              Position the page within the frame
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div style={s.cameraControls}>
          <div style={s.controlsRow}>
            {/* Gallery / Upload */}
            <button style={s.camSideBtn} onClick={() => fileInputRef.current?.click()} title="Upload file">
              <Upload size={22} color="white" />
              <span style={s.camSideBtnLabel}>Gallery</span>
            </button>

            {/* Capture button */}
            <div style={s.captureWrap}>
              <button style={s.captureBtn} onClick={handleCapture}>
                <div style={s.captureBtnOuter}>
                  <div style={s.captureBtnInner} />
                </div>
              </button>
            </div>

            {/* Flip camera */}
            <button style={s.camSideBtn} onClick={onFlipCamera} title="Flip camera">
              <SwitchCamera size={22} color="white" />
              <span style={s.camSideBtnLabel}>{facingMode === 'user' ? 'Front' : 'Back'}</span>
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept={documentService.getSupportedTypes()} onChange={handleFileChange} style={{ display: 'none' }} />
      </div>
    );
  }

  // ===== INITIAL SCAN PAGE =====
  return (
    <div
      style={s.scanPage}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && <div style={s.dragOverlay} />}

      {uploadError && (
        <div style={s.errorBanner} className="slide-up">
          <span>{uploadError}</span>
          <button style={s.errorClose} onClick={() => setUploadError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Hero camera button */}
      <button style={s.heroBtn} onClick={onStartCamera} aria-label="Open camera" className="bounce-in">
        <div style={s.heroRipple1} />
        <div style={s.heroRipple2} />
        <div style={s.heroCircle}>
          <Camera size={40} color="white" strokeWidth={1.8} />
        </div>
        <div style={s.heroLabel}>
          <span style={s.heroLabelText}>Open Camera</span>
          <span style={s.heroLabelSub}>Tap to scan a page</span>
        </div>
      </button>

      {/* Divider */}
      <div style={s.divider} className="fade-in">
        <div style={s.dividerLine} />
        <span style={s.dividerText}>or upload</span>
        <div style={s.dividerLine} />
      </div>

      {/* Upload cards */}
      <div style={s.uploadGrid} className="stagger-children">
        <button style={s.uploadCard} className="hover-lift" onClick={() => fileInputRef.current?.click()}>
          <div style={s.uploadIconWrap}>
            <Upload size={24} color="var(--primary-light)" />
          </div>
          <span style={s.uploadCardTitle}>Image</span>
          <span style={s.uploadCardSub}>JPG, PNG, WebP</span>
        </button>
        <button style={s.uploadCard} className="hover-lift" onClick={() => docInputRef.current?.click()}>
          <div style={{ ...s.uploadIconWrap, background: 'rgba(245,158,11,0.12)' }}>
            <FileText size={24} color="var(--accent)" />
          </div>
          <span style={s.uploadCardTitle}>Document</span>
          <span style={s.uploadCardSub}>PDF, DOCX, TXT</span>
        </button>
      </div>

      {/* Drop zone */}
      <div style={{ ...s.dropZone, ...(isDragging ? { borderColor: 'var(--primary)', background: 'rgba(99,102,241,0.06)' } : {}) }} className="fade-in">
        <p style={s.dropText}>Drag & drop any file here</p>
      </div>

      {/* Supported formats */}
      <div style={s.formatsRow} className="fade-in">
        <span style={s.formatChip}>PDF</span>
        <span style={s.formatChip}>DOCX</span>
        <span style={s.formatChip}>PNG</span>
        <span style={s.formatChip}>JPG</span>
        <span style={s.formatChip}>TXT</span>
        <span style={s.formatChip}>CSV</span>
      </div>

      {/* How it works */}
      <div style={s.stepsContainer} className="slide-up">
        <p style={s.stepsTitle}>How it works</p>
        <div style={s.stepsRow} className="stagger-children">
          <div style={s.step}>
            <div style={s.stepNum}>1</div>
            <span style={s.stepText}>Capture or upload</span>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
          <div style={s.step}>
            <div style={s.stepNum}>2</div>
            <span style={s.stepText}>AI explains it</span>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
          <div style={s.step}>
            <div style={s.stepNum}>3</div>
            <span style={s.stepText}>Quiz yourself</span>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      <input ref={docInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.md,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
    </div>
  );
}

// ===== STYLES =====
const s = {
  // Scan page
  scanPage: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '32px 20px 100px', gap: 24, maxWidth: 520, margin: '0 auto', width: '100%', position: 'relative',
  },
  dragOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.08)',
    borderRadius: 'var(--radius-lg)', border: '2px dashed var(--primary-light)', pointerEvents: 'none', zIndex: 10,
  },

  // Hero
  heroBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 0',
    WebkitTapHighlightColor: 'transparent', position: 'relative',
  },
  heroRipple1: {
    position: 'absolute', top: 10, width: 100, height: 100, borderRadius: '50%',
    border: '2px solid rgba(99,102,241,0.3)', animation: 'ripplePulse 2.5s ease-out infinite', pointerEvents: 'none',
  },
  heroRipple2: {
    position: 'absolute', top: 10, width: 100, height: 100, borderRadius: '50%',
    border: '2px solid rgba(99,102,241,0.2)', animation: 'ripplePulse 2.5s ease-out 1.2s infinite', pointerEvents: 'none',
  },
  heroCircle: {
    width: 100, height: 100, borderRadius: '50%',
    background: 'linear-gradient(135deg, #818cf8, #6366f1, #4f46e5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'breathe 3s ease-in-out infinite',
  },
  heroLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  heroLabelText: { fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' },
  heroLabelSub: { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 },

  // Divider
  divider: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 360 },
  dividerLine: { flex: 1, height: 1, background: 'var(--border)' },
  dividerText: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },

  // Upload grid
  uploadGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 360 },
  uploadCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px',
    background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', color: 'inherit',
  },
  uploadIconWrap: {
    width: 48, height: 48, borderRadius: 'var(--radius)', background: 'rgba(99,102,241,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  uploadCardTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' },
  uploadCardSub: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },

  // Drop zone
  dropZone: {
    width: '100%', maxWidth: 360, padding: '16px 20px', borderRadius: 'var(--radius)',
    border: '1.5px dashed var(--border)', background: 'transparent', transition: 'all 0.2s',
  },
  dropText: { fontSize: 13, color: 'var(--text-muted)', margin: 0, fontWeight: 500, textAlign: 'center' },

  // Supported formats
  formatsRow: {
    display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360,
  },
  formatChip: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-card)',
    border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Steps
  stepsContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: 400, marginTop: 8 },
  stepsTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 },
  stepsRow: { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  step: { display: 'flex', alignItems: 'center', gap: 6 },
  stepNum: {
    width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary-light)',
  },
  stepText: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' },

  // Error
  errorBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px',
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius)',
    color: '#f87171', fontSize: 13, width: '100%', maxWidth: 360,
  },
  errorClose: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 2, display: 'flex' },

  // Preview
  previewContainer: { display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 600, margin: '0 auto', width: '100%' },
  imgWrapper: { position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' },
  previewImg: { width: '100%', maxHeight: 400, objectFit: 'contain', background: '#000', display: 'block' },
  xBtnAbsolute: {
    position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  actionRow: { display: 'flex', gap: 10 },

  // Document preview
  docCard: {
    display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--bg-card)',
  },
  docThumb: { width: '100%', height: 160, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', background: '#000' },
  docInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  docIcon: {
    width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  docName: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  docMeta: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 },
  docBadge: { fontSize: 11, fontWeight: 700, color: 'white', background: 'var(--primary)', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' },
  docPages: { fontSize: 12, color: 'var(--text-muted)' },
  xBtn: {
    width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-dark)', border: '1px solid var(--border)',
    color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0,
  },

  // ===== CAMERA VIEWFINDER =====
  cameraContainer: {
    position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
    background: '#000', overflow: 'hidden',
  },
  captureFlash: {
    position: 'absolute', inset: 0, background: 'white', zIndex: 100, pointerEvents: 'none',
    animation: 'fadeIn 0.05s ease-out',
  },

  // Top bar
  cameraTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
  },
  camTopBtn: {
    width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)', transition: 'background 0.15s',
  },
  camTopCenter: { display: 'flex', alignItems: 'center', gap: 8 },
  camModeBadge: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20,
    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
    color: 'white', fontSize: 13, fontWeight: 600,
  },
  camTopRight: { display: 'flex', gap: 8 },

  // Video
  videoWrapper: { flex: 1, position: 'relative', overflow: 'hidden' },
  video: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },

  // Overlay
  cameraOverlay: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
  },
  scanLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)',
    animation: 'scanAnimation 2.5s ease-in-out infinite',
  },
  cameraGuide: {
    position: 'relative', width: '80%', aspectRatio: '4/3', maxHeight: '65%',
  },
  corner: {
    position: 'absolute', width: 28, height: 28,
    borderTop: '3px solid rgba(255,255,255,0.8)', borderLeft: '3px solid rgba(255,255,255,0.8)',
    borderRadius: '4px 0 0 0',
  },
  gridLine: {
    position: 'absolute', background: 'rgba(255,255,255,0.15)',
  },
  cameraHint: {
    marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.8)',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center',
    fontWeight: 500,
  },

  // Bottom controls
  cameraControls: {
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
    padding: '16px 24px 28px', borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  controlsRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: 320, margin: '0 auto',
  },
  camSideBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'white',
    minWidth: 56,
  },
  camSideBtnLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500,
  },
  captureWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  captureBtn: {
    width: 72, height: 72, borderRadius: '50%', background: 'transparent',
    border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnOuter: {
    width: 72, height: 72, borderRadius: '50%', border: '4px solid white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4,
    transition: 'transform 0.1s',
  },
  captureBtnInner: {
    width: '100%', height: '100%', borderRadius: '50%', background: 'white',
    transition: 'transform 0.1s, opacity 0.1s',
  },
};

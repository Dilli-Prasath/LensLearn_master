import { useRef, useState } from 'react';
import {
  Camera, SwitchCamera, Upload, X, RotateCcw, FileText, Crop, Sparkles,
  ArrowRight, Zap, FlashlightOff, Grid3X3, Timer, Focus, Layers, Eye
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
        <div style={s.docCard} className="glass-card">
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
                <span className="gradient-badge">{typeLabel}</span>
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
        <div style={s.imgWrapper} className="glow-border">
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
        {captureFlash && <div style={s.captureFlash} />}

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

        <div style={s.videoWrapper}>
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={s.video}
            onLoadedMetadata={(e) => e.target.play().catch(() => {})}
            onCanPlay={(e) => e.target.play().catch(() => {})}
          />

          <div style={s.cameraOverlay}>
            <div style={s.scanLine} />
            <div style={s.cameraGuide}>
              <div style={{ ...s.corner, top: 0, left: 0 }} />
              <div style={{ ...s.corner, top: 0, right: 0, transform: 'scaleX(-1)' }} />
              <div style={{ ...s.corner, bottom: 0, left: 0, transform: 'scaleY(-1)' }} />
              <div style={{ ...s.corner, bottom: 0, right: 0, transform: 'scale(-1)' }} />
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

        <div style={s.cameraControls}>
          <div style={s.controlsRow}>
            <button style={s.camSideBtn} onClick={() => fileInputRef.current?.click()} title="Upload file">
              <Upload size={22} color="white" />
              <span style={s.camSideBtnLabel}>Gallery</span>
            </button>
            <div style={s.captureWrap}>
              <button style={s.captureBtn} onClick={handleCapture}>
                <div style={s.captureBtnOuter}>
                  <div style={s.captureBtnInner} />
                </div>
              </button>
            </div>
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

  // ===== INITIAL SCAN PAGE — Unique Design =====
  return (
    <div
      style={s.scanPage}
      className="mesh-bg"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && <div style={s.dragOverlay} />}

      {/* Decorative background elements */}
      <div style={s.bgOrb1} className="morph-blob" />
      <div style={s.bgOrb2} className="morph-blob" />

      {uploadError && (
        <div style={s.errorBanner} className="slide-up">
          <span>{uploadError}</span>
          <button style={s.errorClose} onClick={() => setUploadError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Hero camera button — with orbiting rings */}
      <div style={s.heroSection} className="bounce-in">
        <button style={s.heroBtn} onClick={onStartCamera} aria-label="Open camera">
          <div style={s.heroRipple1} />
          <div style={s.heroRipple2} />
          <div style={s.heroOrbitRing} className="orbit-ring" />
          <div style={s.heroCircle}>
            <Camera size={38} color="white" strokeWidth={1.8} />
          </div>
        </button>
        <div style={s.heroLabel}>
          <span style={s.heroLabelText} className="gradient-text">Scan & Learn</span>
          <span style={s.heroLabelSub}>Point your camera at any page</span>
        </div>
      </div>

      {/* Divider */}
      <div style={s.divider} className="fade-in">
        <div style={s.dividerLine} />
        <span style={s.dividerText}>or upload</span>
        <div style={s.dividerLine} />
      </div>

      {/* Upload cards — Glass style */}
      <div style={s.uploadGrid} className="stagger-children">
        <button style={s.uploadCard} className="glass-card hover-lift" onClick={() => fileInputRef.current?.click()}>
          <div style={s.uploadIconWrap}>
            <Upload size={22} color="var(--primary-light)" />
          </div>
          <div style={s.uploadCardText}>
            <span style={s.uploadCardTitle}>Image</span>
            <span style={s.uploadCardSub}>JPG, PNG, WebP</span>
          </div>
        </button>
        <button style={s.uploadCard} className="glass-card hover-lift" onClick={() => docInputRef.current?.click()}>
          <div style={{ ...s.uploadIconWrap, background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <FileText size={22} color="var(--accent)" />
          </div>
          <div style={s.uploadCardText}>
            <span style={s.uploadCardTitle}>Document</span>
            <span style={s.uploadCardSub}>PDF, DOCX, TXT</span>
          </div>
        </button>
      </div>

      {/* Drop zone — with animated border */}
      <div
        style={{ ...s.dropZone, ...(isDragging ? { borderColor: 'var(--primary)', background: 'rgba(99,102,241,0.06)' } : {}) }}
        className="fade-in"
      >
        <Layers size={16} color="var(--text-muted)" style={{ marginBottom: 4 }} />
        <p style={s.dropText}>Drag & drop any file here</p>
      </div>

      {/* Supported formats — Pills */}
      <div style={s.formatsRow} className="fade-in">
        {['PDF', 'DOCX', 'PNG', 'JPG', 'TXT', 'CSV'].map(fmt => (
          <span key={fmt} style={s.formatChip}>{fmt}</span>
        ))}
      </div>

      {/* How it works — Connected steps */}
      <div style={s.stepsContainer} className="slide-up">
        <p style={s.stepsTitle}>How it works</p>
        <div style={s.stepsRow} className="stagger-children">
          <StepItem num="1" icon={<Camera size={16} />} text="Capture" color="var(--primary)" />
          <div style={s.stepConnector} />
          <StepItem num="2" icon={<Eye size={16} />} text="AI Explains" color="var(--accent)" />
          <div style={s.stepConnector} />
          <StepItem num="3" icon={<Zap size={16} />} text="Quiz" color="var(--success)" />
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      <input ref={docInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.md,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
    </div>
  );
}

function StepItem({ num, icon, text, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}15`, border: `1.5px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{text}</span>
    </div>
  );
}

// ===== STYLES =====
const s = {
  // Scan page
  scanPage: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '24px 20px 100px', gap: 20, maxWidth: 680, margin: '0 auto',
    width: '100%', position: 'relative',
  },
  bgOrb1: {
    position: 'absolute', top: -40, right: -30, width: 160, height: 160,
    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
    filter: 'blur(40px)', pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: 100, left: -40, width: 140, height: 140,
    background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
    filter: 'blur(40px)', pointerEvents: 'none',
  },
  dragOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.08)',
    borderRadius: 'var(--radius-lg)', border: '2px dashed var(--primary-light)', pointerEvents: 'none', zIndex: 10,
  },

  // Hero
  heroSection: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    paddingTop: 8, position: 'relative', zIndex: 1,
  },
  heroBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    WebkitTapHighlightColor: 'transparent', position: 'relative',
    width: 110, height: 110,
  },
  heroRipple1: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '2px solid rgba(99,102,241,0.25)', animation: 'ripplePulse 2.5s ease-out infinite', pointerEvents: 'none',
  },
  heroRipple2: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '2px solid rgba(99,102,241,0.15)', animation: 'ripplePulse 2.5s ease-out 1.2s infinite', pointerEvents: 'none',
  },
  heroOrbitRing: {
    position: 'absolute', inset: -8, border: '1.5px dashed rgba(99,102,241,0.2)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  heroCircle: {
    width: 96, height: 96, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary-light), var(--primary), var(--primary-dark))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'breathe 3s ease-in-out infinite',
    boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
  },
  heroLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  heroLabelText: { fontSize: 20, fontWeight: 800, letterSpacing: -0.3 },
  heroLabelSub: { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 },

  // Divider
  divider: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 360 },
  dividerLine: { flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' },
  dividerText: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },

  // Upload grid
  uploadGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 360 },
  uploadCard: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 14px',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
    border: 'none', textAlign: 'left',
  },
  uploadIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  uploadCardText: { display: 'flex', flexDirection: 'column', gap: 2 },
  uploadCardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  uploadCardSub: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 },

  // Drop zone
  dropZone: {
    width: '100%', maxWidth: 360, padding: '14px 20px', borderRadius: 'var(--radius)',
    border: '1.5px dashed rgba(255,255,255,0.08)', background: 'rgba(30,41,59,0.3)',
    transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center',
    backdropFilter: 'blur(4px)',
  },
  dropText: { fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 500, textAlign: 'center' },

  // Supported formats
  formatsRow: {
    display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360,
  },
  formatChip: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
    background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.06)', padding: '4px 10px',
    borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Steps
  stepsContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 14, width: '100%', maxWidth: 400, marginTop: 4,
  },
  stepsTitle: {
    fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: 1, margin: 0,
  },
  stepsRow: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' },
  stepConnector: {
    width: 24, height: 1,
    background: 'linear-gradient(90deg, var(--border), rgba(99,102,241,0.3))',
  },

  // Error
  errorBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px',
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius)',
    color: '#f87171', fontSize: 13, width: '100%', maxWidth: 360, position: 'relative', zIndex: 1,
  },
  errorClose: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 2, display: 'flex' },

  // Preview
  previewContainer: { display: 'flex', flexDirection: 'column', gap: 16, padding: 16, maxWidth: 600, margin: '0 auto', width: '100%' },
  imgWrapper: { position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  previewImg: { width: '100%', maxHeight: 400, objectFit: 'contain', background: '#000', display: 'block', position: 'relative', zIndex: 1 },
  xBtnAbsolute: {
    position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: 'none', color: 'white',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  actionRow: { display: 'flex', gap: 10 },

  // Document preview
  docCard: {
    display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
    borderRadius: 'var(--radius-lg)',
  },
  docThumb: { width: '100%', height: 160, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', background: '#000' },
  docInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  docIcon: {
    width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  docName: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  docMeta: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 },
  docPages: { fontSize: 12, color: 'var(--text-muted)' },
  xBtn: {
    width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
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
  videoWrapper: { flex: 1, position: 'relative', overflow: 'hidden' },
  video: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cameraOverlay: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
  },
  scanLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)',
    animation: 'scanAnimation 2.5s ease-in-out infinite',
  },
  cameraGuide: { position: 'relative', width: '80%', aspectRatio: '4/3', maxHeight: '65%' },
  corner: {
    position: 'absolute', width: 28, height: 28,
    borderTop: '3px solid rgba(255,255,255,0.8)', borderLeft: '3px solid rgba(255,255,255,0.8)',
    borderRadius: '4px 0 0 0',
  },
  gridLine: { position: 'absolute', background: 'rgba(255,255,255,0.15)' },
  cameraHint: {
    marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.8)',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
    padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', fontWeight: 500,
  },
  cameraControls: {
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
    padding: '16px 24px 28px', borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  controlsRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: 320, margin: '0 auto',
  },
  camSideBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'white', minWidth: 56,
  },
  camSideBtnLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 },
  captureWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
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

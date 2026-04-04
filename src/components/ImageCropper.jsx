import { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, Crop, Maximize } from 'lucide-react';

const HANDLE_SIZE = 20;
const MIN_CROP = 40;
const PRIMARY = '#6366f1';

export default function ImageCropper({ imageSrc, onCropComplete, onRetake, onSkip }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const cropRef = useRef(null);
  const drawInfoRef = useRef(null);
  const dragRef = useRef({ active: false, handle: null, sx: 0, sy: 0, sc: null });
  const [ready, setReady] = useState(false);

  // Get pointer position in canvas coords
  const getPos = useCallback((e) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    const t = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }, []);

  // Draw canvas
  const draw = useCallback(() => {
    const c = canvasRef.current;
    const img = imgRef.current;
    const crop = cropRef.current;
    const di = drawInfoRef.current;
    if (!c || !img || !crop || !di) return;

    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, di.dx, di.dy, di.dw, di.dh);

    // Dark overlay (4 rects around crop)
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, w, crop.y);
    ctx.fillRect(0, crop.y + crop.h, w, h - crop.y - crop.h);
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    ctx.fillRect(crop.x + crop.w, crop.y, w - crop.x - crop.w, crop.h);

    // Border
    ctx.strokeStyle = PRIMARY;
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    // Grid (rule of thirds)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(crop.x + crop.w * i / 3, crop.y);
      ctx.lineTo(crop.x + crop.w * i / 3, crop.y + crop.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crop.x, crop.y + crop.h * i / 3);
      ctx.lineTo(crop.x + crop.w, crop.y + crop.h * i / 3);
      ctx.stroke();
    }

    // L-shaped corner handles
    const t = 4;
    ctx.fillStyle = PRIMARY;
    // TL
    ctx.fillRect(crop.x - 1, crop.y - 1, HANDLE_SIZE, t);
    ctx.fillRect(crop.x - 1, crop.y - 1, t, HANDLE_SIZE);
    // TR
    ctx.fillRect(crop.x + crop.w - HANDLE_SIZE + 1, crop.y - 1, HANDLE_SIZE, t);
    ctx.fillRect(crop.x + crop.w - t + 1, crop.y - 1, t, HANDLE_SIZE);
    // BL
    ctx.fillRect(crop.x - 1, crop.y + crop.h - t + 1, HANDLE_SIZE, t);
    ctx.fillRect(crop.x - 1, crop.y + crop.h - HANDLE_SIZE + 1, t, HANDLE_SIZE);
    // BR
    ctx.fillRect(crop.x + crop.w - HANDLE_SIZE + 1, crop.y + crop.h - t + 1, HANDLE_SIZE, t);
    ctx.fillRect(crop.x + crop.w - t + 1, crop.y + crop.h - HANDLE_SIZE + 1, t, HANDLE_SIZE);
  }, []);

  // Setup: load image, wait for container to have dimensions, then init canvas
  useEffect(() => {
    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;

      // Wait for container to have layout dimensions (requestAnimationFrame)
      const initCanvas = () => {
        const container = containerRef.current;
        if (!container || cancelled) return;

        const cw = container.clientWidth;
        const ch = container.clientHeight;

        // If container not laid out yet, retry next frame
        if (cw < 10 || ch < 10) {
          requestAnimationFrame(initCanvas);
          return;
        }

        const canvas = canvasRef.current;
        canvas.width = cw;
        canvas.height = ch;

        // Compute image fit
        const ia = img.width / img.height;
        const ca = cw / ch;
        let dw, dh, dx, dy;
        if (ia > ca) { dw = cw; dh = cw / ia; dx = 0; dy = (ch - dh) / 2; }
        else { dh = ch; dw = ch * ia; dx = (cw - dw) / 2; dy = 0; }
        drawInfoRef.current = { dx, dy, dw, dh };

        // Default crop: 85% of image area
        const m = 0.075;
        cropRef.current = {
          x: dx + dw * m,
          y: dy + dh * m,
          w: dw * (1 - 2 * m),
          h: dh * (1 - 2 * m),
        };

        setReady(true);
        draw();
      };

      requestAnimationFrame(initCanvas);
    };

    img.onerror = () => { if (!cancelled) setReady(true); };
    img.src = imageSrc;

    return () => { cancelled = true; };
  }, [imageSrc, draw]);

  // Redraw once ready
  useEffect(() => { if (ready) draw(); }, [ready, draw]);

  const hitTest = useCallback((px, py) => {
    const cr = cropRef.current;
    if (!cr) return null;
    const d = HANDLE_SIZE + 10;
    const corners = [
      { n: 'tl', cx: cr.x, cy: cr.y },
      { n: 'tr', cx: cr.x + cr.w, cy: cr.y },
      { n: 'bl', cx: cr.x, cy: cr.y + cr.h },
      { n: 'br', cx: cr.x + cr.w, cy: cr.y + cr.h },
    ];
    for (const c of corners) {
      if (Math.abs(px - c.cx) < d && Math.abs(py - c.cy) < d) return c.n;
    }
    if (px >= cr.x && px <= cr.x + cr.w && py >= cr.y && py <= cr.y + cr.h) return 'move';
    return null;
  }, []);

  const onDown = useCallback((e) => {
    e.preventDefault();
    const p = getPos(e);
    const h = hitTest(p.x, p.y);
    if (!h) return;
    dragRef.current = { active: true, handle: h, sx: p.x, sy: p.y, sc: { ...cropRef.current } };
  }, [getPos, hitTest]);

  const onMove = useCallback((e) => {
    const dr = dragRef.current;
    if (!dr.active) return;
    e.preventDefault();
    const p = getPos(e);
    const dx = p.x - dr.sx, dy = p.y - dr.sy;
    const s = dr.sc;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mw = canvas.width, mh = canvas.height;
    let nx = s.x, ny = s.y, nw = s.w, nh = s.h;

    switch (dr.handle) {
      case 'move':
        nx = Math.max(0, Math.min(s.x + dx, mw - s.w));
        ny = Math.max(0, Math.min(s.y + dy, mh - s.h));
        break;
      case 'tl':
        nx = Math.max(0, Math.min(s.x + dx, s.x + s.w - MIN_CROP));
        ny = Math.max(0, Math.min(s.y + dy, s.y + s.h - MIN_CROP));
        nw = s.x + s.w - nx; nh = s.y + s.h - ny;
        break;
      case 'tr':
        ny = Math.max(0, Math.min(s.y + dy, s.y + s.h - MIN_CROP));
        nw = Math.max(MIN_CROP, Math.min(s.w + dx, mw - s.x));
        nh = s.y + s.h - ny;
        break;
      case 'bl':
        nx = Math.max(0, Math.min(s.x + dx, s.x + s.w - MIN_CROP));
        nw = s.x + s.w - nx;
        nh = Math.max(MIN_CROP, Math.min(s.h + dy, mh - s.y));
        break;
      case 'br':
        nw = Math.max(MIN_CROP, Math.min(s.w + dx, mw - s.x));
        nh = Math.max(MIN_CROP, Math.min(s.h + dy, mh - s.y));
        break;
    }
    cropRef.current = { x: nx, y: ny, w: nw, h: nh };
    draw();
  }, [getPos, draw]);

  const onUp = useCallback(() => { dragRef.current.active = false; }, []);

  // Global listeners for drag outside canvas
  useEffect(() => {
    const move = (e) => { if (dragRef.current.active) onMove(e); };
    const up = () => { if (dragRef.current.active) onUp(); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [onMove, onUp]);

  const applyCrop = useCallback(() => {
    const img = imgRef.current;
    const crop = cropRef.current;
    const di = drawInfoRef.current;
    if (!img || !crop || !di) return;

    const sx = img.width / di.dw;
    const sy = img.height / di.dh;
    const srcX = Math.max(0, (crop.x - di.dx) * sx);
    const srcY = Math.max(0, (crop.y - di.dy) * sy);
    const srcW = Math.min(img.width - srcX, crop.w * sx);
    const srcH = Math.min(img.height - srcY, crop.h * sy);

    const out = document.createElement('canvas');
    out.width = srcW;
    out.height = srcH;
    out.getContext('2d').drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    onCropComplete(out.toDataURL('image/jpeg', 0.85));
  }, [onCropComplete]);

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Crop Image</h2>
        <p style={styles.subtitle}>Drag corners to adjust, then tap Crop</p>
      </div>

      <div
        ref={containerRef}
        style={styles.canvasContainer}
        onMouseDown={onDown}
        onTouchStart={onDown}
      >
        {!ready && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner} />
          </div>
        )}
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>

      <div style={styles.actions}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onRetake}>
          <RotateCcw size={18} /> Retake
        </button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onSkip}>
          <Maximize size={18} /> Full Image
        </button>
        <button className="btn btn-primary" style={{ flex: 1.5 }} onClick={applyCrop} disabled={!ready}>
          <Crop size={18} /> Crop
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
    height: '100%', maxHeight: '100vh', overflow: 'hidden',
  },
  header: { textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' },
  subtitle: { fontSize: 13, color: 'var(--text-secondary)', margin: 0 },
  canvasContainer: {
    flex: 1, position: 'relative', backgroundColor: '#000',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    border: '1px solid var(--border)', touchAction: 'none',
    cursor: 'crosshair', minHeight: 250,
  },
  canvas: { width: '100%', height: '100%', display: 'block', touchAction: 'none', userSelect: 'none' },
  loadingOverlay: {
    position: 'absolute', inset: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)', zIndex: 2,
  },
  spinner: {
    width: 36, height: 36,
    border: '3px solid rgba(99,102,241,0.2)',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  actions: { display: 'flex', gap: 10, paddingBottom: 8 },
};

if (typeof document !== 'undefined' && !document.head.querySelector('style[data-cropper]')) {
  const s = document.createElement('style');
  s.setAttribute('data-cropper', 'true');
  s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
}

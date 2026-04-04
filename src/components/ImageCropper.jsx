import { useRef, useEffect, useState } from 'react';
import { RotateCcw, Crop, Maximize } from 'lucide-react';

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onRetake,
  onSkip,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const [cropRect, setCropRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedHandle, setDraggedHandle] = useState(null);
  const [startPos, setStartPos] = useState(null);

  // Initialize image and set default crop area
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageData(img);
      const containerWidth = containerRef.current?.clientWidth || 300;
      const containerHeight = containerRef.current?.clientHeight || 400;

      // Default crop rect: 80% of container, centered
      const width = Math.min(img.width, containerWidth * 0.8);
      const height = Math.min(img.height, containerHeight * 0.8);
      const x = (containerWidth - width) / 2;
      const y = (containerHeight - height) / 2;

      setCropRect({ x, y, width, height });
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw canvas with image and crop overlay
  useEffect(() => {
    if (!canvasRef.current || !imageData || !cropRect) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;

    // Set canvas size to match container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Calculate scaling to fit image in container
    const imgAspect = imageData.width / imageData.height;
    const containerAspect = canvas.width / canvas.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > containerAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspect;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    // Draw image
    ctx.drawImage(imageData, drawX, drawY, drawWidth, drawHeight);

    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.clearRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);

    // Draw border and handles
    ctx.strokeStyle = 'var(--primary-light)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);

    // Draw corner handles
    const handleSize = 12;
    const handles = [
      { x: cropRect.x, y: cropRect.y }, // top-left
      { x: cropRect.x + cropRect.width, y: cropRect.y }, // top-right
      { x: cropRect.x, y: cropRect.y + cropRect.height }, // bottom-left
      { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height }, // bottom-right
    ];

    handles.forEach((handle) => {
      ctx.fillStyle = 'var(--primary-light)';
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
  }, [imageData, cropRect]);

  // Handle mouse/touch events
  const handlePointerDown = (e) => {
    if (!cropRect || !canvasRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches?.[0] || e).clientX - rect.left;
    const y = (e.touches?.[0] || e).clientY - rect.top;

    const handleSize = 16; // Larger hit area for touch
    const handles = [
      { name: 'tl', x: cropRect.x, y: cropRect.y },
      { name: 'tr', x: cropRect.x + cropRect.width, y: cropRect.y },
      { name: 'bl', x: cropRect.x, y: cropRect.y + cropRect.height },
      { name: 'br', x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
    ];

    // Check if clicking on a handle
    for (const handle of handles) {
      if (
        Math.abs(x - handle.x) < handleSize &&
        Math.abs(y - handle.y) < handleSize
      ) {
        setDraggedHandle(handle.name);
        setStartPos({ x, y, cropRect });
        setIsDragging(true);
        return;
      }
    }

    // Allow dragging the entire crop area
    if (
      x > cropRect.x &&
      x < cropRect.x + cropRect.width &&
      y > cropRect.y &&
      y < cropRect.y + cropRect.height
    ) {
      setDraggedHandle('move');
      setStartPos({ x, y, cropRect });
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !startPos || !draggedHandle || !cropRect) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches?.[0] || e).clientX - rect.left;
    const y = (e.touches?.[0] || e).clientY - rect.top;

    const dx = x - startPos.x;
    const dy = y - startPos.y;
    const originalRect = startPos.cropRect;

    let newRect = { ...originalRect };

    const minSize = 50; // Minimum crop size
    const maxWidth = canvas.width;
    const maxHeight = canvas.height;

    if (draggedHandle === 'move') {
      // Move entire crop area
      newRect.x = Math.max(0, Math.min(originalRect.x + dx, maxWidth - originalRect.width));
      newRect.y = Math.max(0, Math.min(originalRect.y + dy, maxHeight - originalRect.height));
    } else if (draggedHandle === 'tl') {
      // Top-left handle
      newRect.x = Math.max(0, originalRect.x + dx);
      newRect.y = Math.max(0, originalRect.y + dy);
      newRect.width = Math.max(minSize, originalRect.width - dx);
      newRect.height = Math.max(minSize, originalRect.height - dy);
    } else if (draggedHandle === 'tr') {
      // Top-right handle
      newRect.y = Math.max(0, originalRect.y + dy);
      newRect.width = Math.max(minSize, originalRect.width + dx);
      newRect.height = Math.max(minSize, originalRect.height - dy);
    } else if (draggedHandle === 'bl') {
      // Bottom-left handle
      newRect.x = Math.max(0, originalRect.x + dx);
      newRect.width = Math.max(minSize, originalRect.width - dx);
      newRect.height = Math.max(minSize, originalRect.height + dy);
    } else if (draggedHandle === 'br') {
      // Bottom-right handle
      newRect.width = Math.max(minSize, originalRect.width + dx);
      newRect.height = Math.max(minSize, originalRect.height + dy);
    }

    // Constrain to canvas bounds
    newRect.width = Math.min(newRect.width, maxWidth - newRect.x);
    newRect.height = Math.min(newRect.height, maxHeight - newRect.y);

    setCropRect(newRect);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDraggedHandle(null);
    setStartPos(null);
  };

  // Apply crop and return cropped image
  const handleCrop = async () => {
    if (!imageData || !cropRect) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate scaling factor from displayed image to actual image
    const containerWidth = canvasRef.current.width;
    const containerHeight = canvasRef.current.height;

    const imgAspect = imageData.width / imageData.height;
    const containerAspect = containerWidth / containerHeight;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > containerAspect) {
      drawWidth = containerWidth;
      drawHeight = containerWidth / imgAspect;
      drawX = 0;
      drawY = (containerHeight - drawHeight) / 2;
    } else {
      drawHeight = containerHeight;
      drawWidth = containerHeight * imgAspect;
      drawX = (containerWidth - drawWidth) / 2;
      drawY = 0;
    }

    // Calculate crop coordinates in the original image
    const scaleX = imageData.width / drawWidth;
    const scaleY = imageData.height / drawHeight;

    const srcX = (cropRect.x - drawX) * scaleX;
    const srcY = (cropRect.y - drawY) * scaleY;
    const srcWidth = cropRect.width * scaleX;
    const srcHeight = cropRect.height * scaleY;

    // Set canvas size to crop size
    canvas.width = srcWidth;
    canvas.height = srcHeight;

    // Draw cropped portion
    ctx.drawImage(
      imageData,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      0,
      0,
      srcWidth,
      srcHeight
    );

    const croppedImage = canvas.toDataURL('image/jpeg', 0.85);
    onCropComplete(croppedImage);
  };

  if (isLoading) {
    return (
      <div style={styles.container} className="fade-in">
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading image...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Crop Image</h2>
        <p style={styles.subtitle}>Adjust the frame to focus on the content you want to analyze</p>
      </div>

      <div
        ref={containerRef}
        style={styles.canvasContainer}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          style={styles.canvas}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      <div style={styles.actions}>
        <button
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={onRetake}
          aria-label="Retake photo"
        >
          <RotateCcw size={18} />
          Retake
        </button>
        <button
          className="btn btn-outline"
          style={{ flex: 1 }}
          onClick={onSkip}
          aria-label="Use full image"
        >
          <Maximize size={18} />
          Full Image
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 1.5 }}
          onClick={handleCrop}
          aria-label="Apply crop"
        >
          <Crop size={18} />
          Crop
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    maxHeight: '100vh',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.4,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--border)',
    cursor: 'grab',
    minHeight: 300,
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
    touchAction: 'none',
  },
  actions: {
    display: 'flex',
    gap: 10,
    paddingBottom: 8,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 300,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTop: '3px solid var(--primary-light)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: 14,
    color: 'var(--text-secondary)',
  },
};

// Add spin animation if not already present
if (!document.head.querySelector('style[data-cropper]')) {
  const style = document.createElement('style');
  style.setAttribute('data-cropper', 'true');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

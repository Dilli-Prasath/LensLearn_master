/**
 * LensLearn Performance Utilities
 * Device detection, adaptive settings, and memory management
 * for low-end devices (low RAM, slow CPU, limited storage)
 */

// Detect device capabilities once on load
const detectDevice = () => {
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua) || (window.innerWidth >= 600 && window.innerWidth <= 1024);

  // Device memory (GB) — Chrome/Edge only, fallback to 2
  const deviceMemory = navigator.deviceMemory || 2;

  // Hardware concurrency (CPU cores)
  const cpuCores = navigator.hardwareConcurrency || 2;

  // Connection info
  const connection = navigator.connection || {};
  const effectiveType = connection.effectiveType || '4g';
  const saveData = connection.saveData || false;

  // Classify device tier
  let tier = 'high'; // high, medium, low
  if (deviceMemory <= 2 || cpuCores <= 2 || saveData) {
    tier = 'low';
  } else if (deviceMemory <= 4 || cpuCores <= 4 || effectiveType === '3g') {
    tier = 'medium';
  }

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    deviceMemory,
    cpuCores,
    effectiveType,
    saveData,
    tier,
    // Screen info
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2), // Cap at 2x
  };
};

export const device = detectDevice();

/**
 * Adaptive settings based on device tier
 */
export const adaptiveSettings = {
  // Streaming throttle interval (ms) — slower devices need more throttle
  get streamingThrottle() {
    if (device.tier === 'low') return 400;
    if (device.tier === 'medium') return 250;
    return 150;
  },

  // Max image dimension for capture/crop
  get maxImageDimension() {
    if (device.tier === 'low') return 1024;
    if (device.tier === 'medium') return 1600;
    return 1920;
  },

  // JPEG quality for captured images
  get imageQuality() {
    if (device.tier === 'low') return 0.6;
    if (device.tier === 'medium') return 0.75;
    return 0.85;
  },

  // Max chat messages to render (virtualization threshold)
  get maxVisibleMessages() {
    if (device.tier === 'low') return 10;
    if (device.tier === 'medium') return 20;
    return 50;
  },

  // Whether to enable animations
  get enableAnimations() {
    if (device.tier === 'low' || device.saveData) return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Camera resolution constraints
  get cameraConstraints() {
    if (device.tier === 'low') {
      return { width: { ideal: 1280 }, height: { ideal: 720 } };
    }
    if (device.tier === 'medium') {
      return { width: { ideal: 1600 }, height: { ideal: 900 } };
    }
    return { width: { ideal: 1920 }, height: { ideal: 1080 } };
  },

  // Number of Ollama tokens to predict
  get maxTokens() {
    if (device.tier === 'low') return 2048;
    if (device.tier === 'medium') return 3072;
    return 4096;
  },

  // Debounce for input events
  get inputDebounce() {
    if (device.tier === 'low') return 300;
    return 150;
  },
};

/**
 * Compress an image (dataURL or base64) to fit within maxDimension
 * Returns { dataUrl, base64 }
 */
export function compressImage(dataUrl, maxDim = adaptiveSettings.maxImageDimension, quality = adaptiveSettings.imageQuality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only downscale if needed
      if (width <= maxDim && height <= maxDim) {
        const base64 = dataUrl.split(',')[1];
        resolve({ dataUrl, base64 });
        return;
      }

      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', quality);
      const base64 = compressed.split(',')[1];

      // Clean up
      canvas.width = 0;
      canvas.height = 0;

      resolve({ dataUrl: compressed, base64 });
    };
    img.onerror = () => {
      const base64 = dataUrl.split(',')[1];
      resolve({ dataUrl, base64 });
    };
    img.src = dataUrl;
  });
}

/**
 * Debounce utility
 */
export function debounce(fn, delay) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Throttle utility (trailing edge)
 */
export function throttle(fn, interval) {
  let lastTime = 0;
  let timer = null;
  return (...args) => {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    if (remaining <= 0) {
      clearTimeout(timer);
      lastTime = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * Release large objects from memory
 */
export function releaseMemory(...refs) {
  refs.forEach(ref => {
    if (ref && typeof ref === 'object' && 'current' in ref) {
      ref.current = null;
    }
  });
  // Hint to GC if available
  if (window.gc) window.gc();
}

/**
 * Get responsive breakpoint
 */
export function getBreakpoint() {
  const w = window.innerWidth;
  if (w < 480) return 'xs';    // small phone
  if (w < 768) return 'sm';    // phone / small tablet
  if (w < 1024) return 'md';   // tablet
  if (w < 1440) return 'lg';   // laptop
  return 'xl';                  // desktop
}

/**
 * Check if we should use reduced quality
 */
export function shouldReduceQuality() {
  return device.tier === 'low' || device.saveData;
}

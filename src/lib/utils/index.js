/**
 * @module utils
 * @description Utility functions for common tasks across the application
 */

/**
 * Merge class names, filtering out falsy values
 * @param {...*} classNames - Class names to merge
 * @returns {string} Merged class names
 *
 * @example
 * cn('btn', 'btn-primary', isDisabled && 'btn-disabled')
 * // 'btn btn-primary btn-disabled'
 */
export function cn(...classNames) {
  return classNames
    .flat()
    .filter((cls) => typeof cls === 'string' && cls.length > 0)
    .join(' ');
}

/**
 * Merge multiple style objects into one
 * Later styles override earlier ones
 * @param {...Object} styles - Style objects to merge
 * @returns {Object} Merged style object
 *
 * @example
 * mergeStyles({ color: 'red' }, { fontSize: '16px' })
 * // { color: 'red', fontSize: '16px' }
 */
export function mergeStyles(...styles) {
  return Object.assign({}, ...styles.filter((s) => typeof s === 'object' && s !== null));
}

/**
 * Clamp a number between min and max values
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 *
 * @example
 * clamp(150, 0, 100) // 100
 * clamp(-5, 0, 100)  // 0
 * clamp(50, 0, 100)  // 50
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Format a number into human-readable format (1.2K, 3.5M, etc.)
 * @param {number} num - Number to format
 * @param {number} [decimals=1] - Number of decimal places
 * @returns {string} Formatted number
 *
 * @example
 * formatNumber(1234) // '1.2K'
 * formatNumber(1234567) // '1.2M'
 * formatNumber(1234567890) // '1.2B'
 */
export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined) return '0';

  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1e9) {
    return `${sign}${(num / 1e9).toFixed(decimals)}B`;
  }
  if (abs >= 1e6) {
    return `${sign}${(num / 1e6).toFixed(decimals)}M`;
  }
  if (abs >= 1e3) {
    return `${sign}${(num / 1e3).toFixed(decimals)}K`;
  }
  return `${sign}${num.toFixed(decimals)}`;
}

/**
 * Pluralize a word based on count
 * @param {number} count - Count for pluralization
 * @param {string} singular - Singular form
 * @param {string} [plural] - Plural form (defaults to singular + 's')
 * @returns {string} "count singular" or "count plural"
 *
 * @example
 * pluralize(1, 'item') // '1 item'
 * pluralize(5, 'item') // '5 items'
 * pluralize(2, 'person', 'people') // '2 people'
 */
export function pluralize(count, singular, plural) {
  const form = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${form}`;
}

/**
 * Truncate text to a maximum length with suffix
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (including suffix)
 * @param {string} [suffix='...'] - Suffix to append
 * @returns {string} Truncated text
 *
 * @example
 * truncateText('Hello World', 8) // 'Hello...'
 * truncateText('Hello', 10) // 'Hello'
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Generate a unique ID, optionally with a prefix
 * Uses timestamp + random number for uniqueness
 * @param {string} [prefix=''] - Optional prefix for the ID
 * @returns {string} Unique ID
 *
 * @example
 * generateId() // 'bg5f3k2x'
 * generateId('btn') // 'btn-bg5f3k2x'
 */
export function generateId(prefix = '') {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Copy text to clipboard asynchronously
 * Falls back to execCommand for older browsers
 * @param {string} text - Text to copy
 * @returns {Promise<void>} Promise that resolves when copy is complete
 *
 * @example
 * await copyToClipboard('Hello World')
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    throw err;
  }
}

/**
 * Share content using Web Share API with clipboard fallback
 * @param {Object} data - Share data
 * @param {string} data.title - Title to share
 * @param {string} data.text - Text to share
 * @param {string} data.url - URL to share
 * @returns {Promise<void>} Promise that resolves when share is complete
 *
 * @example
 * await shareContent({
 *   title: 'Check this out',
 *   text: 'Great article about learning',
 *   url: 'https://example.com'
 * })
 */
export async function shareContent(data) {
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      // Fallback: copy to clipboard
      const shareText = `${data.title}\n${data.text}\n${data.url}`;
      await copyToClipboard(shareText);
      console.log('Copied to clipboard (share not supported)');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Share failed:', err);
    }
  }
}

/**
 * Check if user has prefers-reduced-motion enabled
 * Respects accessibility preferences for animations
 * @returns {boolean} True if reduced motion is preferred
 *
 * @example
 * if (isReducedMotion()) {
 *   // Skip animations for accessibility
 * }
 */
export function isReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if device supports hover (not touch-only)
 * @returns {boolean} True if hover is supported
 *
 * @example
 * if (supportsHover()) {
 *   // Add hover effects
 * }
 */
export function supportsHover() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Detect if device is touch-capable
 * @returns {boolean} True if touch is supported
 *
 * @example
 * if (isTouchDevice()) {
 *   // Use touch-friendly UI
 * }
 */
export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return (
    (typeof window.ontouchstart !== 'undefined') ||
    (typeof navigator.maxTouchPoints !== 'undefined' && navigator.maxTouchPoints > 0) ||
    (typeof navigator.msMaxTouchPoints !== 'undefined' && navigator.msMaxTouchPoints > 0)
  );
}

/**
 * Promise-based delay
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} Promise that resolves after delay
 *
 * @example
 * await sleep(1000) // Wait 1 second
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * No-operation function
 * Useful as a default callback
 * @returns {void}
 *
 * @example
 * const onClick = callback || noop;
 */
export function noop() {}

/**
 * Create a simple event emitter for pub/sub communication
 * @returns {Object} Event emitter with on, off, and emit methods
 *
 * @example
 * const emitter = createEventEmitter();
 * emitter.on('user-login', (user) => console.log('User logged in:', user));
 * emitter.emit('user-login', { id: 1, name: 'John' });
 */
export function createEventEmitter() {
  const events = {};

  return {
    /**
     * Subscribe to an event
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName].push(callback);

      // Return unsubscribe function
      return () => {
        events[eventName] = events[eventName].filter((cb) => cb !== callback);
      };
    },

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback to remove
     * @returns {void}
     */
    off(eventName, callback) {
      if (events[eventName]) {
        events[eventName] = events[eventName].filter((cb) => cb !== callback);
      }
    },

    /**
     * Emit an event
     * @param {string} eventName - Event name
     * @param {...*} args - Arguments to pass to callbacks
     * @returns {void}
     */
    emit(eventName, ...args) {
      if (events[eventName]) {
        events[eventName].forEach((callback) => {
          try {
            callback(...args);
          } catch (err) {
            console.error(`Error in event listener for ${eventName}:`, err);
          }
        });
      }
    },

    /**
     * Get all listeners for an event
     * @param {string} eventName - Event name
     * @returns {Function[]} Array of callbacks
     */
    listeners(eventName) {
      return events[eventName] || [];
    },

    /**
     * Remove all listeners for an event or all events
     * @param {string} [eventName] - Optional event name to clear
     * @returns {void}
     */
    clear(eventName) {
      if (eventName) {
        delete events[eventName];
      } else {
        Object.keys(events).forEach((key) => delete events[key]);
      }
    },
  };
}

/**
 * Debounce a function (wait for user to stop calling before executing)
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function (execute at most once per time period)
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 *
 * @example
 * const throttledScroll = throttle(() => updateScroll(), 100);
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Render an icon prop that may be JSX, a component reference, or null.
 * Handles forwardRef/memo-wrapped components (lucide-react icons, etc.)
 * @param {*} icon - JSX element, component function/object, or falsy
 * @param {number} [size=18] - Icon size passed as prop when icon is a component ref
 * @returns {React.ReactNode|null}
 *
 * @example
 * renderIcon(<Camera />) // returns <Camera /> as-is
 * renderIcon(Camera)      // returns <Camera size={18} />
 * renderIcon(null)        // returns null
 */
export default {
  cn,
  mergeStyles,
  clamp,
  formatNumber,
  pluralize,
  truncateText,
  generateId,
  copyToClipboard,
  shareContent,
  isReducedMotion,
  supportsHover,
  isTouchDevice,
  sleep,
  noop,
  createEventEmitter,
  debounce,
  throttle,
};

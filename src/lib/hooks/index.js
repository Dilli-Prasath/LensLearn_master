/**
 * LensLearn Custom Hooks Library
 *
 * A collection of reusable, composable hooks for building
 * dynamic, responsive, accessible React applications.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── useDebounce ────────────────────────────────────────────
/**
 * Debounce a value by a given delay.
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in ms (default 300)
 * @returns {*} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── useDebouncedCallback ───────────────────────────────────
/**
 * Returns a debounced version of the callback.
 * @param {Function} callback
 * @param {number} delay
 * @returns {Function}
 */
export function useDebouncedCallback(callback, delay = 300) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debouncedFn = useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
  }, [delay]);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  return debouncedFn;
}

// ─── useThrottle ────────────────────────────────────────────
/**
 * Throttle a value by a given interval.
 * @param {*} value - The value to throttle
 * @param {number} interval - Throttle interval in ms (default 200)
 * @returns {*} The throttled value
 */
export function useThrottle(value, interval = 200) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastExecuted.current + interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastExecuted.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// ─── useThrottledCallback ───────────────────────────────────
export function useThrottledCallback(callback, interval = 200) {
  const lastExecuted = useRef(0);
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const throttledFn = useCallback((...args) => {
    const now = Date.now();
    const remaining = interval - (now - lastExecuted.current);
    if (remaining <= 0) {
      lastExecuted.current = now;
      callbackRef.current(...args);
    } else if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        lastExecuted.current = Date.now();
        timerRef.current = null;
        callbackRef.current(...args);
      }, remaining);
    }
  }, [interval]);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  return throttledFn;
}

// ─── useMediaQuery ──────────────────────────────────────────
/**
 * Subscribe to a CSS media query.
 * @param {string} query - CSS media query string
 * @returns {boolean} Whether the query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ─── useBreakpoint ──────────────────────────────────────────
/**
 * Get the current responsive breakpoint.
 * @returns {{ isMobile, isTablet, isDesktop, isLarge, breakpoint }}
 */
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 479px)');
  const isTablet = useMediaQuery('(min-width: 480px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLarge = useMediaQuery('(min-width: 1280px)');

  const breakpoint = useMemo(() => {
    if (isLarge) return 'xl';
    if (isDesktop) return 'lg';
    if (isTablet) return 'md';
    return 'sm';
  }, [isMobile, isTablet, isDesktop, isLarge]);

  return { isMobile, isTablet, isDesktop, isLarge, breakpoint };
}

// ─── useClickOutside ────────────────────────────────────────
/**
 * Detect clicks outside a ref element.
 * @param {React.RefObject} ref
 * @param {Function} handler
 */
export function useClickOutside(ref, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handlerRef.current(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref]);
}

// ─── useKeyboard ────────────────────────────────────────────
/**
 * Register keyboard shortcut handlers.
 * @param {Object} keyMap - { 'Escape': handler, 'ctrl+s': handler, ... }
 * @param {Object} options - { target, enabled }
 */
export function useKeyboard(keyMap, options = {}) {
  const { target, enabled = true } = options;
  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;

  useEffect(() => {
    if (!enabled) return;
    const el = target?.current || document;

    const handler = (e) => {
      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey) parts.push('shift');
      parts.push(e.key);
      const combo = parts.join('+');

      // Check exact combo first, then just the key
      const fn = keyMapRef.current[combo] || keyMapRef.current[e.key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };

    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [target, enabled]);
}

// ─── useIntersectionObserver ────────────────────────────────
/**
 * Observe when an element enters the viewport.
 * @param {Object} options - IntersectionObserver options
 * @returns {[React.RefObject, IntersectionObserverEntry]}
 */
export function useIntersectionObserver(options = {}) {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef(null);
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        if (triggerOnce && entry.isIntersecting) {
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, entry];
}

// ─── useLocalStorage ────────────────────────────────────────
/**
 * Persist state in localStorage with SSR safety.
 * @param {string} key
 * @param {*} initialValue
 * @returns {[value, setValue, removeValue]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {
      console.warn(`useLocalStorage: Failed to set "${key}"`, e);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (e) {
      console.warn(`useLocalStorage: Failed to remove "${key}"`, e);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// ─── useToggle ──────────────────────────────────────────────
/**
 * Boolean toggle state.
 * @param {boolean} initial
 * @returns {[boolean, toggle, setTrue, setFalse]}
 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return [value, toggle, setTrue, setFalse];
}

// ─── usePrevious ────────────────────────────────────────────
/**
 * Track the previous value of a variable.
 * @param {*} value
 * @returns {*} Previous value
 */
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

// ─── useAsync ───────────────────────────────────────────────
/**
 * Execute async functions with loading/error state.
 * @param {Function} asyncFn
 * @param {boolean} immediate - Run on mount
 * @returns {{ execute, value, error, loading, reset }}
 */
export function useAsync(asyncFn, immediate = false) {
  const [state, setState] = useState({ value: null, error: null, loading: immediate });

  const execute = useCallback(async (...args) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const value = await asyncFn(...args);
      setState({ value, error: null, loading: false });
      return value;
    } catch (error) {
      setState(s => ({ ...s, error, loading: false }));
      throw error;
    }
  }, [asyncFn]);

  const reset = useCallback(() => setState({ value: null, error: null, loading: false }), []);

  useEffect(() => {
    if (immediate) execute();
  }, []);

  return { ...state, execute, reset };
}

// ─── useMounted ─────────────────────────────────────────────
export function useMounted() {
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return mounted;
}

// ─── useEventListener ───────────────────────────────────────
export function useEventListener(eventName, handler, element) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const target = element?.current || window;
    const listener = (e) => handlerRef.current(e);
    target.addEventListener(eventName, listener);
    return () => target.removeEventListener(eventName, listener);
  }, [eventName, element]);
}

// ─── useCountdown ───────────────────────────────────────────
export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate) {
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

// ─── useScrollPosition ──────────────────────────────────────
export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setPosition({ x: window.scrollX, y: window.scrollY });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return position;
}

// ─── useLongPress ───────────────────────────────────────────
export function useLongPress(callback, options = {}) {
  const { delay = 500, onStart, onCancel } = options;
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const start = useCallback((e) => {
    onStart?.(e);
    timerRef.current = setTimeout(() => callbackRef.current(e), delay);
  }, [delay, onStart]);

  const cancel = useCallback((e) => {
    clearTimeout(timerRef.current);
    onCancel?.(e);
  }, [onCancel]);

  return {
    onMouseDown: start, onMouseUp: cancel, onMouseLeave: cancel,
    onTouchStart: start, onTouchEnd: cancel,
  };
}

// ─── useSwipe ───────────────────────────────────────────────
export function useSwipe(ref, handlers = {}) {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 } = handlers;
  const startPos = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e) => {
      startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e) => {
      if (!startPos.current) return;
      const dx = e.changedTouches[0].clientX - startPos.current.x;
      const dy = e.changedTouches[0].clientY - startPos.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > threshold) {
        if (absDx > absDy) {
          dx > 0 ? onSwipeRight?.() : onSwipeLeft?.();
        } else {
          dy > 0 ? onSwipeDown?.() : onSwipeUp?.();
        }
      }
      startPos.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);
}

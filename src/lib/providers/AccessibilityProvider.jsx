/**
 * AccessibilityProvider - Wraps accessibility context for the whole app
 *
 * Features:
 *   - Screen reader announcements via announce()
 *   - Keyboard navigation tracking
 *   - Reduced motion detection
 *   - High contrast detection
 *   - Focus management
 *
 * Usage:
 *   <AccessibilityProvider>
 *     <App />
 *   </AccessibilityProvider>
 *
 *   const { announce, isKeyboardUser, prefersReducedMotion } = useA11y();
 */
import { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from 'react';

const A11yContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const politeRef = useRef(null);
  const assertiveRef = useRef(null);

  // Detect keyboard vs mouse navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.body.setAttribute('data-keyboard-user', 'true');
      }
    };
    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.removeAttribute('data-keyboard-user');
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Detect system preferences
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    setPrefersReducedMotion(motionQuery.matches);
    setPrefersHighContrast(contrastQuery.matches);

    const onMotionChange = (e) => setPrefersReducedMotion(e.matches);
    const onContrastChange = (e) => setPrefersHighContrast(e.matches);

    motionQuery.addEventListener('change', onMotionChange);
    contrastQuery.addEventListener('change', onContrastChange);
    return () => {
      motionQuery.removeEventListener('change', onMotionChange);
      contrastQuery.removeEventListener('change', onContrastChange);
    };
  }, []);

  // Screen reader announcements
  const announce = useCallback((message, priority = 'polite') => {
    const ref = priority === 'assertive' ? assertiveRef : politeRef;
    if (ref.current) {
      ref.current.textContent = '';
      requestAnimationFrame(() => {
        if (ref.current) ref.current.textContent = message;
      });
    }
  }, []);

  // Focus management
  const focusElement = useCallback((selector) => {
    requestAnimationFrame(() => {
      const el = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector;
      if (el) el.focus({ preventScroll: false });
    });
  }, []);

  const focusMain = useCallback(() => focusElement('#main-content'), [focusElement]);

  const value = useMemo(() => ({
    announce,
    focusElement,
    focusMain,
    isKeyboardUser,
    prefersReducedMotion,
    prefersHighContrast,
  }), [announce, focusElement, focusMain, isKeyboardUser, prefersReducedMotion, prefersHighContrast]);

  const srOnly = {
    position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
    overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
  };

  return (
    <A11yContext.Provider value={value}>
      {children}
      {/* Screen reader live regions */}
      <div ref={politeRef} aria-live="polite" aria-atomic="true" style={srOnly} />
      <div ref={assertiveRef} role="alert" aria-live="assertive" aria-atomic="true" style={srOnly} />
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) {
    return {
      announce: () => {},
      focusElement: () => {},
      focusMain: () => {},
      isKeyboardUser: false,
      prefersReducedMotion: false,
      prefersHighContrast: false,
    };
  }
  return ctx;
}

export default AccessibilityProvider;

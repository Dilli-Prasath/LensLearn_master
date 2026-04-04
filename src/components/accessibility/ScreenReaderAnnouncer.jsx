/**
 * ScreenReaderAnnouncer — Live region for screen reader announcements.
 * Call announce() from anywhere to speak a message to assistive tech.
 *
 * Usage:
 *   import { announce } from './accessibility/ScreenReaderAnnouncer';
 *   announce('Quiz loaded with 4 questions');
 */
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Global announce queue
let _announceCallback = null;

export function announce(message, priority = 'polite') {
  if (_announceCallback) _announceCallback(message, priority);
}

export default function ScreenReaderAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const handleAnnounce = useCallback((message, priority) => {
    if (priority === 'assertive') {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage('');
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  useEffect(() => {
    _announceCallback = handleAnnounce;
    return () => { _announceCallback = null; };
  }, [handleAnnounce]);

  return (
    <>
      {/* Polite: read when user is idle */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>

      {/* Assertive: interrupt immediately */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </>
  );
}

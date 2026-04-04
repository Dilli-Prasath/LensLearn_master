import { useState, useEffect } from 'react';
import '../styles/InstallPrompt.css';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user has dismissed this prompt before
      const isDismissed = localStorage.getItem('lenslearn-install-dismissed') === 'true';
      // Check if this is at least 2nd visit
      const visitCount = parseInt(localStorage.getItem('lenslearn-visit-count') || '0', 10);

      // Increment visit count
      localStorage.setItem('lenslearn-visit-count', String(visitCount + 1));

      // Show prompt only if: not dismissed AND (2nd+ visit OR first visit after 5 seconds)
      if (!isDismissed) {
        if (visitCount >= 1) {
          setShowPrompt(true);
        } else {
          // On first visit, show after 5 seconds
          const timer = setTimeout(() => {
            setShowPrompt(true);
          }, 5000);
          return () => clearTimeout(timer);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('lenslearn-install-dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('lenslearn-install-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-message">
          <div className="install-prompt-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="install-prompt-text">
            <p className="install-prompt-title">Install LensLearn</p>
            <p className="install-prompt-subtitle">Get instant access to offline learning</p>
          </div>
        </div>
        <div className="install-prompt-actions">
          <button className="btn btn-primary install-btn" onClick={handleInstall}>
            Install
          </button>
          <button className="btn-dismiss" onClick={handleDismiss} aria-label="Dismiss install prompt">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

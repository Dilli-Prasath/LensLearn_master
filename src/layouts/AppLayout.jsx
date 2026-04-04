/**
 * AppLayout — Root layout for all routes.
 * Renders: skip links, header, bottom nav, accessibility tools, and the active page.
 */
import { useEffect, useState, Suspense, lazy, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import SkipLinks from '../components/accessibility/SkipLinks';
import ScreenReaderAnnouncer, { announce } from '../components/accessibility/ScreenReaderAnnouncer';
import ColorBlindFilters from '../components/accessibility/ColorBlindFilters';
import VoiceControl from '../components/accessibility/VoiceControl';
import { useSettingsStore, useConnectionStore, useAccessibilityStore } from '../store';
import { adaptiveSettings } from '../utils/performance';

const Onboarding = lazy(() => import('../components/Onboarding'));
const InstallPrompt = lazy(() => import('../components/InstallPrompt'));

const LoadingFallback = memo(() => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 48, flexDirection: 'column' }}
    role="status" aria-label="Loading page">
    <div style={{ display: 'flex', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '150ms' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '300ms' }} />
    </div>
    <span style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Loading...</span>
  </div>
));
LoadingFallback.displayName = 'LoadingFallback';

// Route name map for screen reader announcements
const ROUTE_NAMES = {
  '/': 'Home',
  '/scan': 'Scan',
  '/explain': 'Explanation',
  '/quiz': 'Quiz',
  '/flashcards': 'Flashcards',
  '/subjects': 'Subjects',
  '/history': 'History',
  '/settings': 'Settings',
  '/accessibility': 'Accessibility Settings',
  '/achievements': 'Achievements',
  '/study-plan': 'Study Plan',
};

export default function AppLayout() {
  const location = useLocation();

  // Settings store
  const applyTheme = useSettingsStore((s) => s.applyTheme);
  const theme = useSettingsStore((s) => s.theme);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const font = useSettingsStore((s) => s.font);
  const borderRadius = useSettingsStore((s) => s.borderRadius);
  const layoutWidth = useSettingsStore((s) => s.layoutWidth);

  // Accessibility store
  const applyA11y = useAccessibilityStore((s) => s.applyToDOM);
  const screenReaderMode = useAccessibilityStore((s) => s.screenReaderMode);
  const autoFocusContent = useAccessibilityStore((s) => s.autoFocusContent);

  // Connection
  const startPolling = useConnectionStore((s) => s.startPolling);
  const stopPolling = useConnectionStore((s) => s.stopPolling);

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('lenslearn-onboarded')
  );

  // Apply theme + a11y on mount and changes
  useEffect(() => {
    applyTheme();
    applyA11y();
    if (!adaptiveSettings.enableAnimations) {
      document.body.dataset.reduceAnimations = 'true';
    }
  }, [theme, accentColor, font, borderRadius, layoutWidth, applyTheme, applyA11y]);

  // Start connection polling
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  // Announce route changes for screen readers + auto-focus content
  useEffect(() => {
    const routeName = ROUTE_NAMES[location.pathname] || 'Page';
    announce(`Navigated to ${routeName}`);

    // Set document title
    document.title = `${routeName} — LensLearn`;

    // Auto-focus main content for keyboard users
    if (autoFocusContent) {
      setTimeout(() => {
        const main = document.getElementById('main-content');
        if (main) main.focus({ preventScroll: true });
      }, 100);
    }
  }, [location.pathname, autoFocusContent]);

  const activeTab = getActiveTab(location.pathname);
  const hideHeader = location.pathname === '/settings' || location.pathname === '/accessibility';

  if (showOnboarding) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </Suspense>
    );
  }

  return (
    <>
      {/* Invisible a11y infrastructure */}
      <ColorBlindFilters />
      <ScreenReaderAnnouncer />
      <SkipLinks />
      <VoiceControl />

      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>

      {!hideHeader && <Header />}

      {/* Main content area */}
      <div
        className="page"
        style={{ paddingBottom: 80 }}
        id="main-content"
        role="main"
        tabIndex={-1}
        aria-label="Main content"
      >
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </div>

      <BottomNav activeTab={activeTab} />
    </>
  );
}

function getActiveTab(pathname) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/scan') || pathname.startsWith('/explain') || pathname.startsWith('/quiz') || pathname.startsWith('/flashcards')) return 'scan';
  if (pathname.startsWith('/subjects')) return 'subjects';
  if (pathname.startsWith('/history')) return 'history';
  if (pathname.startsWith('/settings') || pathname.startsWith('/accessibility')) return 'settings';
  return 'home';
}

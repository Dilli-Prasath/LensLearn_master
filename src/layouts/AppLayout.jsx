/**
 * AppLayout — Root layout for all routes.
 * Renders Header, BottomNav, and the active page via <Outlet />.
 * Also handles: connection polling, theme application, onboarding gate.
 */
import { useEffect, useState, Suspense, lazy, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useSettingsStore, useConnectionStore } from '../store';
import { adaptiveSettings } from '../utils/performance';

const Onboarding = lazy(() => import('../components/Onboarding'));
const InstallPrompt = lazy(() => import('../components/InstallPrompt'));

// Loading fallback
const LoadingFallback = memo(() => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 48, flexDirection: 'column' }}>
    <div style={{ display: 'flex', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '150ms' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '300ms' }} />
    </div>
    <span style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Loading...</span>
  </div>
));
LoadingFallback.displayName = 'LoadingFallback';

export default function AppLayout() {
  const location = useLocation();
  const applyTheme = useSettingsStore((s) => s.applyTheme);
  const theme = useSettingsStore((s) => s.theme);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const font = useSettingsStore((s) => s.font);
  const borderRadius = useSettingsStore((s) => s.borderRadius);
  const layoutWidth = useSettingsStore((s) => s.layoutWidth);
  const textSize = useSettingsStore((s) => s.textSize);
  const highContrast = useSettingsStore((s) => s.highContrast);
  const reduceAnimations = useSettingsStore((s) => s.reduceAnimations);

  const startPolling = useConnectionStore((s) => s.startPolling);
  const stopPolling = useConnectionStore((s) => s.stopPolling);

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('lenslearn-onboarded')
  );

  // Apply theme on mount + when settings change
  useEffect(() => {
    applyTheme();
    if (!adaptiveSettings.enableAnimations) {
      document.body.dataset.reduceAnimations = 'true';
    }
  }, [theme, accentColor, font, borderRadius, layoutWidth, textSize, highContrast, reduceAnimations, applyTheme]);

  // Start connection polling
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  // Determine which tab is active from the URL path
  const activeTab = getActiveTab(location.pathname);
  const hideHeader = location.pathname === '/settings';

  // Onboarding gate
  if (showOnboarding) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>

      {!hideHeader && <Header />}

      <div className="page" style={{ paddingBottom: 80 }}>
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </div>

      <BottomNav activeTab={activeTab} />
    </>
  );
}

/** Map pathname to tab name for BottomNav */
function getActiveTab(pathname) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/scan') || pathname.startsWith('/explain') || pathname.startsWith('/quiz') || pathname.startsWith('/flashcards')) return 'scan';
  if (pathname.startsWith('/subjects')) return 'subjects';
  if (pathname.startsWith('/history')) return 'history';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'home';
}

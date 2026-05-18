/**
 * LensLearn Router Configuration
 *
 * Route structure:
 *   /                  → Home (dashboard)
 *   /scan              → Camera / upload
 *   /scan/explain      → Explanation view (after scanning)
 *   /scan/quiz         → Quiz from explanation
 *   /scan/flashcards   → Flashcards from explanation
 *   /subjects          → Subject library
 *   /subjects/:id      → Individual subject detail (future)
 *   /history           → Scan history
 *   /history/:id       → View a past session
 *   /settings          → Settings panel
 *   /achievements      → Gamification / badges (future)
 *   /study-plan        → AI study planner (future)
 *   /collaborate       → Shared study rooms (future)
 *   *                  → 404 fallback → redirect home
 */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';

/**
 * Retry wrapper for lazy imports.
 * After a new deploy, chunk hashes change. If a cached page still references
 * old chunk names, the dynamic import fails. This retries once with a cache-bust
 * and, if that also fails, reloads the page so the browser fetches fresh HTML.
 */
function lazyRetry(importFn) {
  return lazy(() =>
    importFn().catch(() => {
      // First retry: bust module cache by appending a timestamp query
      return importFn().catch(() => {
        // Second failure: force a full page reload (once per session)
        const reloaded = sessionStorage.getItem('chunk_reload');
        if (!reloaded) {
          sessionStorage.setItem('chunk_reload', '1');
          window.location.reload();
          return new Promise(() => {}); // never resolves — page is reloading
        }
        sessionStorage.removeItem('chunk_reload');
        // Give up — throw so the error boundary can show something
        throw new Error('Failed to load page after retry. Please refresh.');
      });
    })
  );
}

// ── Lazy-loaded page components (with retry on chunk-load failure) ──
const HomePage = lazyRetry(() => import('./pages/HomePage'));
const ScanPage = lazyRetry(() => import('./pages/ScanPage'));
const ExplanationPage = lazyRetry(() => import('./pages/ExplanationPage'));
const QuizPage = lazyRetry(() => import('./pages/QuizPage'));
const FlashcardsPage = lazyRetry(() => import('./pages/FlashcardsPage'));
const SubjectsPage = lazyRetry(() => import('./pages/SubjectsPage'));
const SubjectDetailPage = lazyRetry(() => import('./pages/SubjectDetailPage'));
const HistoryPage = lazyRetry(() => import('./pages/HistoryPage'));
const HistoryDetailPage = lazyRetry(() => import('./pages/HistoryDetailPage'));
const SettingsPage = lazyRetry(() => import('./pages/SettingsPage'));
const AchievementsPage = lazyRetry(() => import('./pages/AchievementsPage'));
const StudyPlanPage = lazyRetry(() => import('./pages/StudyPlanPage'));
const AccessibilityPage = lazyRetry(() => import('./pages/AccessibilityPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // ── Main tabs ──
      { index: true, element: <HomePage /> },
      { path: 'scan', element: <ScanPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'subjects/:subjectId', element: <SubjectDetailPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'history/:sessionId', element: <HistoryDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'accessibility', element: <AccessibilityPage /> },

      // ── Scan sub-routes ──
      { path: 'explain', element: <ExplanationPage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'flashcards', element: <FlashcardsPage /> },

      // ── Future pages ──
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'study-plan', element: <StudyPlanPage /> },

      // ── Catch-all ──
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

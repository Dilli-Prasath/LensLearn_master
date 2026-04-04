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

// ── Lazy-loaded page components ──
const HomePage = lazy(() => import('./pages/HomePage'));
const ScanPage = lazy(() => import('./pages/ScanPage'));
const ExplanationPage = lazy(() => import('./pages/ExplanationPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'));
const SubjectDetailPage = lazy(() => import('./pages/SubjectDetailPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const HistoryDetailPage = lazy(() => import('./pages/HistoryDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const StudyPlanPage = lazy(() => import('./pages/StudyPlanPage'));

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

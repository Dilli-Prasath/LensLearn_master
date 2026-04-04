/**
 * History Store — Zustand
 * Reactive wrapper around historyService with localStorage persistence.
 * All components that read sessions will auto-rerender on changes.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_SESSIONS = 50;

/* ─── Subject auto-detection ─── */
const SUBJECT_KEYWORDS = {
  math: ['equation', 'algebra', 'geometry', 'calculus', 'number', 'solve', 'formula', 'derivative', 'integral', 'matrix', 'trigonometry', 'statistics', 'probability'],
  science: ['atom', 'molecule', 'reaction', 'energy', 'force', 'physics', 'chemistry', 'biology', 'cell', 'organism', 'electron', 'gravity', 'evolution', 'photosynthesis'],
  english: ['literature', 'grammar', 'vocabulary', 'sentence', 'paragraph', 'write', 'author', 'poem', 'narrative', 'essay', 'metaphor', 'syntax'],
  history: ['war', 'period', 'revolution', 'century', 'empire', 'historical', 'ancient', 'medieval', 'modern', 'civilization', 'dynasty', 'treaty'],
  geography: ['continent', 'ocean', 'climate', 'population', 'map', 'region', 'latitude', 'longitude', 'terrain', 'ecosystem'],
  computer: ['algorithm', 'programming', 'variable', 'function', 'data', 'software', 'hardware', 'binary', 'network', 'database', 'code', 'loop'],
};

function detectSubject(text) {
  const lower = (text || '').toLowerCase();
  let bestMatch = 'General';
  let maxMatches = 0;
  Object.entries(SUBJECT_KEYWORDS).forEach(([subject, keywords]) => {
    const matches = keywords.filter(k => lower.includes(k)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = subject.charAt(0).toUpperCase() + subject.slice(1);
    }
  });
  return bestMatch;
}

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      sessions: [],

      // ── Save a new session ──
      saveSession: ({ image, explanation, subject, language, quiz }) => {
        const session = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          image,
          explanation,
          subject: subject && subject !== 'auto-detect' ? subject : detectSubject(explanation),
          language,
          quiz: quiz || null,
          bookmarked: false,
          // Future fields
          tags: [],
          notes: '',
          rating: null,
          studyTime: 0,
        };
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, MAX_SESSIONS),
        }));
        return session;
      },

      // ── Get a single session ──
      getSession: (id) => get().sessions.find(s => s.id === id),

      // ── Delete a session ──
      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id),
      })),

      // ── Clear all ──
      clearHistory: () => set({ sessions: [] }),

      // ── Toggle bookmark ──
      toggleBookmark: (id) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === id ? { ...s, bookmarked: !s.bookmarked } : s
        ),
      })),

      // ── Update session (notes, tags, rating, etc.) ──
      updateSession: (id, patch) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === id ? { ...s, ...patch } : s
        ),
      })),

      // ── Computed: stats ──
      getStats: () => {
        const { sessions } = get();
        const todayStr = new Date().toDateString();
        const todayScans = sessions.filter(s => new Date(s.timestamp).toDateString() === todayStr).length;

        // Quiz average
        const quizzes = sessions
          .filter(s => s.quiz?.questions)
          .map(s => {
            const correct = s.quiz.questions.filter(q => q.userAnswer === q.correct).length;
            return (correct / s.quiz.questions.length) * 100;
          });
        const avgQuizScore = quizzes.length ? Math.round(quizzes.reduce((a, b) => a + b, 0) / quizzes.length) : 0;

        // Streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessionDays = new Set(sessions.map(s => {
          const d = new Date(s.timestamp);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        }));
        const check = new Date(today);
        while (sessionDays.has(check.getTime())) {
          streak++;
          check.setDate(check.getDate() - 1);
        }

        // Unique languages & subjects
        const languages = new Set(sessions.map(s => s.language));
        const subjects = new Set(sessions.map(s => s.subject));

        return {
          totalScans: sessions.length,
          todayScans,
          avgQuizScore,
          languagesUsed: languages.size,
          subjectsStudied: subjects.size,
          studyStreak: streak,
          bookmarkedCount: sessions.filter(s => s.bookmarked).length,
        };
      },

      // ── Computed: sessions by subject ──
      getSessionsBySubject: (subject) =>
        get().sessions.filter(s => s.subject.toLowerCase().includes(subject.toLowerCase())),

      // ── Computed: bookmarked ──
      getBookmarked: () => get().sessions.filter(s => s.bookmarked),

      // ── Computed: recent N ──
      getRecent: (n = 5) => get().sessions.slice(0, n),
    }),
    {
      name: 'lenslearn-history-v2',
      version: 1,
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);

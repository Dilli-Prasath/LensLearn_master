/**
 * History Store — Zustand
 * Reactive wrapper around historyService with localStorage persistence.
 * All components that read sessions will auto-rerender on changes.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_SESSIONS = 50;
const THUMBNAIL_MAX_DIM = 200;
const THUMBNAIL_QUALITY = 0.5;

/**
 * Compress a base64 image to a small JPEG thumbnail.
 * Returns a promise that resolves to the compressed base64 string,
 * or the original (truncated) if compression fails.
 */
function compressImageToThumbnail(base64) {
  return new Promise((resolve) => {
    if (!base64 || !base64.startsWith('data:image')) {
      resolve(null);
      return;
    }
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > THUMBNAIL_MAX_DIM) { height = (height * THUMBNAIL_MAX_DIM) / width; width = THUMBNAIL_MAX_DIM; }
        } else {
          if (height > THUMBNAIL_MAX_DIM) { width = (width * THUMBNAIL_MAX_DIM) / height; height = THUMBNAIL_MAX_DIM; }
        }
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY));
      };
      img.onerror = () => resolve(null);
      img.src = base64;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Safe localStorage storage that catches quota errors and evicts old sessions.
 */
const safeStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      if (e?.name === 'QuotaExceededError') {
        // Try to free space by parsing, removing oldest sessions, and retrying
        try {
          const parsed = JSON.parse(value);
          if (parsed?.state?.sessions?.length > 1) {
            // Remove images from oldest half of sessions
            const sessions = parsed.state.sessions;
            const half = Math.ceil(sessions.length / 2);
            for (let i = half; i < sessions.length; i++) {
              sessions[i].image = null;
            }
            // Also trim to fewer sessions if still large
            if (sessions.length > 20) {
              parsed.state.sessions = sessions.slice(0, 20);
            }
            localStorage.setItem(name, JSON.stringify(parsed));
            return;
          }
        } catch { /* ignore parse errors */ }
        console.warn('[LensLearn] Storage quota exceeded, clearing old history');
        try { localStorage.removeItem(name); } catch { /* give up */ }
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch { /* ignore */ }
  },
};

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

      // ── Save a new session (compresses image to thumbnail) ──
      saveSession: async ({ image, explanation, subject, language, quiz }) => {
        // Compress image to small thumbnail to avoid localStorage quota issues
        const thumbnail = image ? await compressImageToThumbnail(image) : null;
        const session = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          image: thumbnail,
          explanation,
          subject: subject && subject !== 'auto-detect' ? subject : detectSubject(explanation),
          language,
          quiz: quiz || null,
          bookmarked: false,
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
      storage: safeStorage,
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);

/**
 * Settings Store — Zustand
 * Manages user preferences with localStorage persistence.
 * Includes theme, language, accessibility, layout, and AI model settings.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyCustomization } from '../utils/themes';

const DEFAULT_SETTINGS = {
  // Learning preferences
  language: 'English',
  gradeLevel: 'middle school (ages 11-13)',
  subject: 'auto-detect',

  // Appearance
  theme: 'dark',
  accentColor: 'indigo',
  font: 'inter',
  borderRadius: 'medium',
  layoutWidth: 'wide',

  // Accessibility
  textSize: 'medium',
  highContrast: false,
  reduceAnimations: false,

  // AI model
  preferredModel: 'gemma4:e4b',

  // Future: notification preferences
  notificationsEnabled: false,
  dailyGoal: 5, // scans per day
  reminderTime: null,

  // Future: study preferences
  quizDifficulty: 'medium',
  flashcardCount: 8,
  autoSave: true,
  streamingEnabled: true,
};

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      // ── Update a single setting ──
      setSetting: (key, value) => set({ [key]: value }),

      // ── Batch update multiple settings ──
      updateSettings: (patch) => set(patch),

      // ── Replace all settings (e.g., from SettingsPanel) ──
      setAll: (newSettings) => set({ ...newSettings }),

      // ── Reset to defaults ──
      resetSettings: () => set({ ...DEFAULT_SETTINGS }),

      // ── Apply theme to DOM (call after mount + on changes) ──
      applyTheme: () => {
        const s = get();
        applyCustomization({
          theme: s.theme,
          accentColor: s.accentColor,
          font: s.font,
          borderRadius: s.borderRadius,
          layoutWidth: s.layoutWidth,
        });
        document.body.dataset.textSize = s.textSize;
        document.body.dataset.highContrast = s.highContrast ? 'true' : 'false';
        document.body.dataset.reduceAnimations = s.reduceAnimations ? 'true' : 'false';
      },

      // ── Convenience getters ──
      getLanguage: () => get().language,
      getGradeLevel: () => get().gradeLevel,
    }),
    {
      name: 'lenslearn-settings',
      version: 2,
      // Only persist user-facing settings, not methods
      partialize: (state) => {
        const { setSetting, updateSettings, setAll, resetSettings, applyTheme, getLanguage, getGradeLevel, ...rest } = state;
        return rest;
      },
    }
  )
);

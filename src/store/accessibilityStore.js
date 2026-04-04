/**
 * Accessibility Store — Zustand
 * Central store for ALL accessibility preferences.
 * Designed for: blind users, motor impaired, children, elderly, cognitive disabilities.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      // ── Screen Reader / Blind ──
      screenReaderMode: false,   // Enables enhanced ARIA, auto-announcements
      autoReadExplanations: false, // Auto-read aloud when explanation loads
      speechRate: 1.0,             // TTS speed (0.5 = slow, 2.0 = fast)
      speechPitch: 1.0,

      // ── Voice Control ──
      voiceControlEnabled: false,  // Navigate app with voice commands
      voiceLanguage: 'en-US',

      // ── Visual ──
      textSize: 'medium',          // small | medium | large | xlarge
      highContrast: false,
      reduceAnimations: false,
      colorBlindMode: 'none',      // none | protanopia | deuteranopia | tritanopia
      largeButtons: false,         // 48px+ touch targets everywhere
      cursorSize: 'normal',        // normal | large

      // ── Motor / Physical ──
      stickyButtons: false,        // Buttons stay pressed, no need for hold
      longPressDelay: 500,         // ms before long-press triggers (higher = more forgiving)
      switchNavigation: false,     // Single-switch scanning mode (future)

      // ── Cognitive / Children ──
      simplifiedUI: false,         // Hides advanced features, shows only core actions
      guidedMode: false,           // Step-by-step guidance with arrows and highlights
      emojiLabels: false,          // Add emoji to buttons for children

      // ── Focus ──
      focusHighlight: false,       // Extra-visible focus ring (4px, bright color)
      autoFocusContent: true,      // Auto-focus main content on page change

      // ═══ Actions ═══
      setSetting: (key, value) => set({ [key]: value }),
      toggleSetting: (key) => set((s) => ({ [key]: !s[key] })),

      resetAll: () => set({
        screenReaderMode: false,
        autoReadExplanations: false,
        speechRate: 1.0,
        speechPitch: 1.0,
        voiceControlEnabled: false,
        voiceLanguage: 'en-US',
        textSize: 'medium',
        highContrast: false,
        reduceAnimations: false,
        colorBlindMode: 'none',
        largeButtons: false,
        cursorSize: 'normal',
        stickyButtons: false,
        longPressDelay: 500,
        switchNavigation: false,
        simplifiedUI: false,
        guidedMode: false,
        emojiLabels: false,
        focusHighlight: false,
        autoFocusContent: true,
      }),

      // ── Apply to DOM ──
      applyToDOM: () => {
        const s = get();
        const b = document.body;
        b.dataset.textSize = s.textSize;
        b.dataset.highContrast = s.highContrast ? 'true' : 'false';
        b.dataset.reduceAnimations = s.reduceAnimations ? 'true' : 'false';
        b.dataset.colorBlindMode = s.colorBlindMode;
        b.dataset.largeButtons = s.largeButtons ? 'true' : 'false';
        b.dataset.focusHighlight = s.focusHighlight ? 'true' : 'false';
        b.dataset.simplifiedUi = s.simplifiedUI ? 'true' : 'false';
        b.dataset.screenReader = s.screenReaderMode ? 'true' : 'false';
        b.dataset.emojiLabels = s.emojiLabels ? 'true' : 'false';
        b.dataset.guidedMode = s.guidedMode ? 'true' : 'false';

        // Auto-detect system preferences
        if (window.matchMedia('(prefers-contrast: more)').matches && !s.highContrast) {
          set({ highContrast: true });
          b.dataset.highContrast = 'true';
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !s.reduceAnimations) {
          set({ reduceAnimations: true });
          b.dataset.reduceAnimations = 'true';
        }
      },
    }),
    {
      name: 'lenslearn-accessibility',
      version: 1,
      partialize: (state) => {
        const { setSetting, toggleSetting, resetAll, applyToDOM, ...rest } = state;
        return rest;
      },
    }
  )
);

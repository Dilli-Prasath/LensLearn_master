/**
 * Data Migration — One-time migration from old localStorage keys
 * to new Zustand persist format.
 *
 * Old keys:
 *   'lenslearn-history'  → sessions array
 *   'lenslearn-settings' → settings object
 *
 * New keys (Zustand persist):
 *   'lenslearn-history-v2' → { state: { sessions }, version: 1 }
 *   'lenslearn-settings'   → { state: { ...settings }, version: 2 }
 *
 * This runs once at app startup. If migration already happened, it's a no-op.
 */

const MIGRATION_KEY = 'lenslearn-migrated-v2';

export function migrateOldData() {
  // Skip if already migrated
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    // ── Migrate history ──
    const oldHistory = localStorage.getItem('lenslearn-history');
    const newHistory = localStorage.getItem('lenslearn-history-v2');

    if (oldHistory && !newHistory) {
      const sessions = JSON.parse(oldHistory);
      if (Array.isArray(sessions) && sessions.length > 0) {
        // Ensure all sessions have the new fields
        const migrated = sessions.map(s => ({
          ...s,
          tags: s.tags || [],
          notes: s.notes || '',
          rating: s.rating ?? null,
          studyTime: s.studyTime || 0,
        }));

        localStorage.setItem('lenslearn-history-v2', JSON.stringify({
          state: { sessions: migrated },
          version: 1,
        }));

        console.log(`[LensLearn] Migrated ${migrated.length} sessions to new store`);
      }
    }

    // ── Migrate settings ──
    const oldSettings = localStorage.getItem('lenslearn-settings');
    if (oldSettings) {
      try {
        const parsed = JSON.parse(oldSettings);
        // Old format is a plain object, new format has { state, version }
        if (parsed && !parsed.state) {
          localStorage.setItem('lenslearn-settings', JSON.stringify({
            state: {
              language: parsed.language || 'English',
              gradeLevel: parsed.gradeLevel || 'middle school (ages 11-13)',
              subject: parsed.subject || 'auto-detect',
              theme: parsed.theme || 'dark',
              accentColor: parsed.accentColor || 'indigo',
              font: parsed.font || 'inter',
              borderRadius: parsed.borderRadius || 'medium',
              layoutWidth: parsed.layoutWidth || 'wide',
              textSize: parsed.textSize || 'medium',
              highContrast: parsed.highContrast || false,
              reduceAnimations: parsed.reduceAnimations || false,
              preferredModel: 'gemma4:e4b',
              notificationsEnabled: false,
              dailyGoal: parsed.dailyGoal || 5,
              reminderTime: null,
              quizDifficulty: 'medium',
              flashcardCount: 8,
              autoSave: true,
              streamingEnabled: true,
            },
            version: 2,
          }));
          console.log('[LensLearn] Migrated settings to new store format');
        }
      } catch {
        // Settings parse failed, leave as-is for Zustand to handle
      }
    }
  } catch (err) {
    console.error('[LensLearn] Migration error:', err);
  }

  // Mark migration complete
  localStorage.setItem(MIGRATION_KEY, Date.now().toString());
}

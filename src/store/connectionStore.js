/**
 * Connection Store — Zustand
 * Tracks Ollama connection status and model availability.
 * Polls periodically based on device tier.
 */
import { create } from 'zustand';
import ollamaService from '../services/ollamaService';
import { device } from '../utils/performance';
import { useSettingsStore } from './settingsStore';

export const useConnectionStore = create((set, get) => ({
  status: null,         // { connected, model, models, error }
  isChecking: false,
  lastChecked: null,
  pollInterval: null,

  // ── Check connection (reads preferred model from settings) ──
  check: async () => {
    set({ isChecking: true });
    try {
      const preferred = useSettingsStore.getState().preferredModel;
      const status = await ollamaService.checkConnection(preferred);
      set({ status, isChecking: false, lastChecked: Date.now() });
      return status;
    } catch (err) {
      set({
        status: { connected: false, error: err.message },
        isChecking: false,
        lastChecked: Date.now(),
      });
      return { connected: false, error: err.message };
    }
  },

  // ── Switch model: update service + settings + store in one call ──
  switchModel: (modelId) => {
    const ok = ollamaService.setModel(modelId);
    if (ok) {
      // Persist preference
      useSettingsStore.getState().setSetting('preferredModel', modelId);
      // Update local status
      const prev = get().status;
      set({ status: { ...prev, model: modelId } });
    }
    return ok;
  },

  // ── Start periodic polling ──
  startPolling: () => {
    const { pollInterval } = get();
    if (pollInterval) return; // already polling

    // Check immediately
    get().check();

    const ms = device.tier === 'low' ? 60000 : 30000;
    const id = setInterval(() => get().check(), ms);
    set({ pollInterval: id });
  },

  // ── Stop polling ──
  stopPolling: () => {
    const { pollInterval } = get();
    if (pollInterval) {
      clearInterval(pollInterval);
      set({ pollInterval: null });
    }
  },

  // ── Convenience ──
  isConnected: () => get().status?.connected ?? false,
  getModel: () => get().status?.model ?? null,
}));

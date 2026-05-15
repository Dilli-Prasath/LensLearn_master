/**
 * LensLearn — AI Service Adapter
 *
 * Auto-detects the best available AI backend:
 *   1. Try Ollama (local) — fastest, private, offline
 *   2. Fall back to Google AI (cloud) — works everywhere
 *
 * The rest of the app imports `aiService` from this file
 * instead of directly importing ollamaService.
 * All method calls are forwarded to whichever backend is active.
 */

import ollamaService from './ollamaService';
import geminiService from './geminiService';

class AIAdapter {
  constructor() {
    this.activeService = ollamaService; // default to local
    this.provider = 'ollama';           // 'ollama' | 'ollama-cloud' | 'google-ai'
    this.isReady = false;
    this._initPromise = null;
  }

  /**
   * Initialize: detect best available backend.
   * Called once on app startup from connectionStore.
   */
  async init(preferredModel) {
    if (this._initPromise) return this._initPromise;

    this._initPromise = this._detectBackend(preferredModel);
    const result = await this._initPromise;
    this._initPromise = null;
    return result;
  }

  async _detectBackend(preferredModel) {
    // 1. Try Ollama (local) first — with a fast 3s timeout so cloud fallback isn't delayed
    try {
      ollamaService.switchToLocal(); // ensure we're pointing at local
      const ollamaPromise = ollamaService.checkConnection(preferredModel);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      );
      const ollamaStatus = await Promise.race([ollamaPromise, timeoutPromise]);
      if (ollamaStatus.connected) {
        this.activeService = ollamaService;
        this.provider = 'ollama';
        this.isReady = true;
        return { ...ollamaStatus, provider: 'ollama' };
      }
    } catch { /* Ollama local unavailable or timed out */ }

    // 2. Try Ollama Cloud — runs REAL Gemma 4 models via ollama.com API
    const ollamaApiKey = import.meta.env.VITE_OLLAMA_API_KEY;
    if (ollamaApiKey) {
      try {
        ollamaService.switchToCloud(ollamaApiKey);
        const cloudStatus = await ollamaService.checkConnection(preferredModel);
        if (cloudStatus.connected) {
          this.activeService = ollamaService;
          this.provider = 'ollama-cloud';
          this.isReady = true;
          return { ...cloudStatus, provider: 'ollama-cloud' };
        }
      } catch { /* Ollama cloud unavailable */ }
    }

    // 3. Try Google AI (Gemini) as last-resort fallback
    const googleKey = import.meta.env.VITE_GOOGLE_AI_KEY;
    if (googleKey) {
      try {
        geminiService.init(googleKey);
        const geminiStatus = await geminiService.checkConnection();
        if (geminiStatus.connected) {
          this.activeService = geminiService;
          this.provider = 'google-ai';
          this.isReady = true;
          return { ...geminiStatus, provider: 'google-ai' };
        }
      } catch { /* Gemini also unavailable */ }
    }

    // 4. Nothing available — return disconnected
    this.isReady = false;
    const hasAnyKey = ollamaApiKey || googleKey;
    return {
      connected: false,
      provider: 'none',
      error: hasAnyKey
        ? 'No AI backend is reachable. Check your API keys and internet connection.'
        : 'No AI backend configured. Set VITE_OLLAMA_API_KEY or VITE_GOOGLE_AI_KEY.',
    };
  }

  /**
   * Force switch to a specific provider
   */
  async switchProvider(provider, apiKey) {
    if (provider === 'ollama') {
      const status = await ollamaService.checkConnection();
      if (status.connected) {
        this.activeService = ollamaService;
        this.provider = 'ollama';
        this.isReady = true;
        return status;
      }
      return { connected: false, error: 'Ollama not available' };
    }

    if (provider === 'google-ai') {
      if (apiKey) geminiService.init(apiKey);
      const status = await geminiService.checkConnection();
      if (status.connected) {
        this.activeService = geminiService;
        this.provider = 'google-ai';
        this.isReady = true;
        return status;
      }
      return { connected: false, error: 'Google AI not available' };
    }

    return { connected: false, error: 'Unknown provider' };
  }

  /**
   * Re-check connection on current provider, or auto-detect again.
   * Once connected, only re-checks the active provider (no re-probing).
   */
  async checkConnection(preferredModel) {
    // If already connected, just verify the current provider is still alive
    if (this.isReady && this.provider === 'google-ai') {
      try {
        const status = await geminiService.checkConnection();
        return { ...status, provider: 'google-ai' };
      } catch {
        this.isReady = false;
      }
    }
    if (this.isReady && (this.provider === 'ollama' || this.provider === 'ollama-cloud')) {
      try {
        const status = await ollamaService.checkConnection(preferredModel);
        if (status.connected) return { ...status, provider: this.provider };
        this.isReady = false;
      } catch {
        this.isReady = false;
      }
    }
    // Not ready or provider went down — full detection
    return this._detectBackend(preferredModel);
  }

  // ═══════════════════════════════════
  //  Forwarded methods — mirror ollamaService API
  // ═══════════════════════════════════

  get supportsThinking() { return this.activeService.supportsThinking; }
  get supportsVision() { return this.activeService.supportsVision; }

  setModel(modelId) { return this.activeService.setModel(modelId); }
  abort() { return this.activeService.abort(); }

  explain(content, options) { return this.activeService.explain(content, options); }
  explainImage(imageBase64, options) { return this.activeService.explainImage(imageBase64, options); }
  generateQuiz(content, options) { return this.activeService.generateQuiz(content, options); }
  generateFlashcards(content, options) { return this.activeService.generateFlashcards(content, options); }
  extractKeyTerms(content, options) { return this.activeService.extractKeyTerms(content, options); }
  detectSubject(content) { return this.activeService.detectSubject(content); }
  simplify(content, options) { return this.activeService.simplify(content, options); }
  translate(content, options) { return this.activeService.translate(content, options); }
  askFollowUp(context, question, options) { return this.activeService.askFollowUp(context, question, options); }
  summarize(text, options) { return this.activeService.summarize(text, options); }
  deepDive(content, options) { return this.activeService.deepDive(content, options); }
  solveStepByStep(content, options) { return this.activeService.solveStepByStep(content, options); }
  generateStudyPlan(content, options) { return this.activeService.generateStudyPlan(content, options); }

  getStatus() {
    const status = this.activeService.getStatus();
    return { ...status, provider: this.provider };
  }
}

const aiService = new AIAdapter();
export default aiService;

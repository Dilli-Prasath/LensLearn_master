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
    this.provider = 'ollama';           // 'ollama' | 'google-ai'
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
    // 1. Try Ollama (local) first — always preferred
    try {
      const ollamaStatus = await ollamaService.checkConnection(preferredModel);
      if (ollamaStatus.connected) {
        this.activeService = ollamaService;
        this.provider = 'ollama';
        this.isReady = true;
        return { ...ollamaStatus, provider: 'ollama' };
      }
    } catch { /* Ollama unavailable, try cloud */ }

    // 2. Try Google AI (cloud) fallback
    const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
    if (apiKey) {
      try {
        geminiService.init(apiKey);
        const geminiStatus = await geminiService.checkConnection();
        if (geminiStatus.connected) {
          this.activeService = geminiService;
          this.provider = 'google-ai';
          this.isReady = true;
          return { ...geminiStatus, provider: 'google-ai' };
        }
      } catch { /* Gemini also unavailable */ }
    }

    // 3. Nothing available — return disconnected
    this.isReady = false;
    return {
      connected: false,
      provider: 'none',
      error: apiKey
        ? 'Neither Ollama nor Google AI is reachable.'
        : 'Ollama is not running and no cloud API key is configured.',
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
   * Re-check connection on current provider, or auto-detect again
   */
  async checkConnection(preferredModel) {
    return this.init(preferredModel);
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

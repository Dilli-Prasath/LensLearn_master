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
    this._isStreaming = false;           // guard: prevents polling from disrupting active streams
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

    // 2. Try Ollama Cloud — runs REAL Gemma 4 models via Vercel proxy
    //    The proxy at /api/ollama-cloud forwards to ollama.com with the API key
    //    server-side. We always try it (the proxy returns 500 if no key is set).
    try {
      ollamaService.switchToCloud();
      const cloudPromise = ollamaService.checkConnection(preferredModel);
      const cloudTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 8000)
      );
      const cloudStatus = await Promise.race([cloudPromise, cloudTimeout]);
      if (cloudStatus.connected) {
        this.activeService = ollamaService;
        this.provider = 'ollama-cloud';
        this.isReady = true;
        return { ...cloudStatus, provider: 'ollama-cloud' };
      }
    } catch { /* Ollama cloud unavailable or timed out */ }

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
    return {
      connected: false,
      provider: 'none',
      error: googleKey
        ? 'No AI backend is reachable. Check your API keys and internet connection.'
        : 'No AI backend configured. Set OLLAMA_API_KEY or VITE_GOOGLE_AI_KEY in your environment.',
    };
  }

  /**
   * Force switch to a specific provider
   */
  async switchProvider(provider, apiKey) {
    if (provider === 'ollama') {
      ollamaService.switchToLocal(); // ensure we're pointing at local
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
    // Don't re-probe while actively streaming — it would destroy the connection
    if (this._isStreaming && this.isReady) {
      return this.getStatus();
    }
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

  // Streaming-aware wrappers — set guard so polling doesn't destroy in-flight connections
  async explain(content, options) {
    this._isStreaming = true;
    try { return await this.activeService.explain(content, options); }
    finally { this._isStreaming = false; }
  }
  explainImage(imageBase64, options) { return this.explain({ images: [imageBase64] }, options); }
  async simplify(content, options) {
    this._isStreaming = true;
    try { return await this.activeService.simplify(content, options); }
    finally { this._isStreaming = false; }
  }
  async translate(content, options) {
    this._isStreaming = true;
    try { return await this.activeService.translate(content, options); }
    finally { this._isStreaming = false; }
  }
  async deepDive(content, options) {
    this._isStreaming = true;
    try { return await this.activeService.deepDive(content, options); }
    finally { this._isStreaming = false; }
  }
  async askFollowUp(context, question, options) {
    this._isStreaming = true;
    try { return await this.activeService.askFollowUp(context, question, options); }
    finally { this._isStreaming = false; }
  }
  async summarize(text, options) {
    this._isStreaming = true;
    try { return await this.activeService.summarize(text, options); }
    finally { this._isStreaming = false; }
  }
  async solveStepByStep(content, options) {
    this._isStreaming = true;
    try { return await this.activeService.solveStepByStep(content, options); }
    finally { this._isStreaming = false; }
  }

  // Non-streaming operations — no guard needed
  generateQuiz(content, options) { return this.activeService.generateQuiz(content, options); }
  generateFlashcards(content, options) { return this.activeService.generateFlashcards(content, options); }
  extractKeyTerms(content, options) { return this.activeService.extractKeyTerms(content, options); }
  detectSubject(content) { return this.activeService.detectSubject(content); }
  generateStudyPlan(content, options) { return this.activeService.generateStudyPlan(content, options); }

  getStatus() {
    const status = this.activeService.getStatus();
    return { ...status, provider: this.provider };
  }
}

const aiService = new AIAdapter();
export default aiService;

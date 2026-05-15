/**
 * LensLearn — AI Service Adapter
 *
 * Auto-detects the best available AI backend:
 *   1. Try Ollama (local) — fastest, private, offline
 *   2. Try Ollama Cloud — real Gemma 4 via Vercel proxy
 *   3. Fall back to Google AI (cloud) — works everywhere
 *
 * Runtime fallback: if the active provider fails during inference
 * (e.g., Ollama Cloud 504), automatically retries with Google AI.
 *
 * The rest of the app imports `aiService` from this file
 * instead of directly importing ollamaService.
 */

import ollamaService from './ollamaService';
import geminiService from './geminiService';

/**
 * Extract a human-readable error message from any error shape.
 * The Ollama SDK sometimes throws objects where .message is itself an object.
 */
function extractErrorMessage(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (typeof err.message === 'string' && err.message) return err.message;
  if (typeof err.message === 'object') {
    // Ollama SDK sometimes wraps errors like { message: { error: '...' } }
    return err.message.error || JSON.stringify(err.message);
  }
  if (err.error) return typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
  if (err.statusText) return `${err.status || ''} ${err.statusText}`.trim();
  try { return JSON.stringify(err); } catch { return String(err); }
}

class AIAdapter {
  constructor() {
    this.activeService = ollamaService; // default to local
    this.provider = 'ollama';           // 'ollama' | 'ollama-cloud' | 'google-ai'
    this.isReady = false;
    this._initPromise = null;
    this._isStreaming = false;           // guard: prevents polling from disrupting active streams
    this._googleAiReady = false;        // whether Google AI fallback is initialized
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
      ollamaService.switchToLocal();
      const ollamaPromise = ollamaService.checkConnection(preferredModel);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      );
      const ollamaStatus = await Promise.race([ollamaPromise, timeoutPromise]);
      if (ollamaStatus.connected) {
        this.activeService = ollamaService;
        this.provider = 'ollama';
        this.isReady = true;
        this._initGoogleAiFallback(); // warm up fallback in background
        return { ...ollamaStatus, provider: 'ollama' };
      }
    } catch { /* Ollama local unavailable or timed out */ }

    // 2. Try Ollama Cloud — real Gemma 4 models via Vercel proxy
    //    Shows "Gemma 4" branding for the hackathon.
    //    If /api/chat fails at runtime, _withFallback auto-switches to Google AI.
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
        this._initGoogleAiFallback(); // warm up Google AI for runtime fallback
        return { ...cloudStatus, provider: 'ollama-cloud' };
      }
    } catch { /* Ollama cloud unavailable or timed out */ }

    // 3. Try Google AI (Gemini) — last-resort cloud fallback
    const googleKey = import.meta.env.VITE_GOOGLE_AI_KEY;
    if (googleKey) {
      try {
        geminiService.init(googleKey);
        const geminiStatus = await geminiService.checkConnection();
        if (geminiStatus.connected) {
          this.activeService = geminiService;
          this.provider = 'google-ai';
          this.isReady = true;
          this._googleAiReady = true;
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
        : 'No AI backend configured. Set VITE_GOOGLE_AI_KEY in your environment.',
    };
  }

  /**
   * Warm up Google AI as a fallback (non-blocking).
   * If primary is Ollama (local or cloud), we initialize Gemini in the background
   * so runtime fallback is instant when primary fails.
   */
  _initGoogleAiFallback() {
    if (this._googleAiReady) return;
    const googleKey = import.meta.env.VITE_GOOGLE_AI_KEY;
    if (googleKey) {
      try {
        geminiService.init(googleKey);
        this._googleAiReady = true;
      } catch { /* ignore */ }
    }
  }

  /**
   * Runtime fallback wrapper.
   * Tries activeService first; if it throws (e.g., Ollama Cloud 504),
   * automatically retries with Google AI if available.
   */
  async _withFallback(method, args) {
    this._isStreaming = true;
    try {
      return await this.activeService[method](...args);
    } catch (primaryErr) {
      // If active service is already Google AI, or no fallback available, rethrow
      if (this.provider === 'google-ai' || !this._googleAiReady) {
        // Normalize the error before rethrowing
        const msg = extractErrorMessage(primaryErr);
        const err = new Error(msg);
        err.originalError = primaryErr;
        throw err;
      }

      // Try Google AI fallback
      console.warn(`[AIAdapter] ${this.provider} failed, falling back to Google AI:`, extractErrorMessage(primaryErr));
      try {
        const result = await geminiService[method](...args);
        // Fallback succeeded — switch provider for subsequent calls
        this.activeService = geminiService;
        this.provider = 'google-ai';
        return result;
      } catch (fallbackErr) {
        // Both failed — throw the more useful error
        const msg = extractErrorMessage(primaryErr);
        const err = new Error(`${msg} (Google AI fallback also failed: ${extractErrorMessage(fallbackErr)})`);
        err.originalError = primaryErr;
        throw err;
      }
    } finally {
      this._isStreaming = false;
    }
  }

  /**
   * Force switch to a specific provider
   */
  async switchProvider(provider, apiKey) {
    if (provider === 'ollama') {
      ollamaService.switchToLocal();
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
        this._googleAiReady = true;
        return status;
      }
      return { connected: false, error: 'Google AI not available' };
    }

    return { connected: false, error: 'Unknown provider' };
  }

  /**
   * Re-check connection on current provider, or auto-detect again.
   */
  async checkConnection(preferredModel) {
    if (this._isStreaming && this.isReady) {
      return this.getStatus();
    }
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
    return this._detectBackend(preferredModel);
  }

  // ═══════════════════════════════════
  //  Forwarded methods — with runtime fallback
  // ═══════════════════════════════════

  get supportsThinking() { return this.activeService.supportsThinking; }
  get supportsVision() { return this.activeService.supportsVision; }

  setModel(modelId) { return this.activeService.setModel(modelId); }
  abort() { return this.activeService.abort(); }

  // Streaming operations — wrapped with fallback
  explain(content, options) { return this._withFallback('explain', [content, options]); }
  explainImage(imageBase64, options) { return this.explain({ images: [imageBase64] }, options); }
  simplify(content, options) { return this._withFallback('simplify', [content, options]); }
  translate(content, options) { return this._withFallback('translate', [content, options]); }
  deepDive(content, options) { return this._withFallback('deepDive', [content, options]); }
  askFollowUp(context, question, options) { return this._withFallback('askFollowUp', [context, question, options]); }
  summarize(text, options) { return this._withFallback('summarize', [text, options]); }
  solveStepByStep(content, options) { return this._withFallback('solveStepByStep', [content, options]); }

  // Non-streaming operations — also with fallback
  generateQuiz(content, options) { return this._withFallback('generateQuiz', [content, options]); }
  generateFlashcards(content, options) { return this._withFallback('generateFlashcards', [content, options]); }
  extractKeyTerms(content, options) { return this._withFallback('extractKeyTerms', [content, options]); }
  detectSubject(content) { return this._withFallback('detectSubject', [content]); }
  generateStudyPlan(content, options) { return this._withFallback('generateStudyPlan', [content, options]); }

  getStatus() {
    const status = this.activeService.getStatus();
    return { ...status, provider: this.provider };
  }
}

const aiService = new AIAdapter();
export default aiService;

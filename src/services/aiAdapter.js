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

/** Provider display names */
const PROVIDER_NAMES = {
  'ollama': 'Ollama Local',
  'ollama-cloud': 'Ollama Cloud (Gemma 4)',
  'google-ai': 'Google AI (Gemini)',
  'none': 'No AI provider',
};

/**
 * Extract a human-readable error message from any error shape.
 *
 * KEY INSIGHT: The Ollama SDK's ResponseError does:
 *   super(errorValue)  →  .message becomes "[object Object]" if errorValue is an object
 *   this.error = errorValue  →  .error keeps the original
 *   this.status_code = statusCode
 *
 * So we MUST check .error BEFORE .message, because .message can be the
 * misleading "[object Object]" string while .error has the real data.
 */
function extractErrorMessage(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;

  // ── 1. Check .error first (Ollama SDK ResponseError stores real data here) ──
  if (typeof err.error === 'string' && err.error) {
    // e.g., ResponseError { error: "Error 504: Gateway Timeout", status_code: 504 }
    return err.error;
  }
  if (err.error && typeof err.error === 'object') {
    // e.g., ResponseError { error: { message: "...", code: "..." } }
    if (typeof err.error.message === 'string') return err.error.message;
    if (typeof err.error.error === 'string') return err.error.error;
    try {
      const s = JSON.stringify(err.error);
      if (s && s !== '{}') return s;
    } catch { /* fall through */ }
  }

  // ── 2. Check .message (standard Error), but skip "[object Object]" ──
  if (typeof err.message === 'string' && err.message && err.message !== '[object Object]') {
    return err.message;
  }

  // ── 3. Check .message as object (some SDKs wrap errors here) ──
  if (err.message && typeof err.message === 'object') {
    if (typeof err.message.error === 'string') return err.message.error;
    if (typeof err.message.message === 'string') return err.message.message;
    try {
      const s = JSON.stringify(err.message);
      if (s && s !== '{}') return s;
    } catch { /* fall through */ }
  }

  // ── 4. HTTP status info ──
  if (err.status_code) return `HTTP ${err.status_code} error`;
  if (err.status && err.statusText) return `HTTP ${err.status}: ${err.statusText}`;
  if (err.status) return `HTTP ${err.status} error`;

  // ── 5. Catch-all ──
  try {
    const s = JSON.stringify(err);
    if (s && s !== '{}' && s !== '""') return s;
  } catch { /* circular reference */ }

  const s = String(err);
  return (s === '[object Object]') ? 'Unknown AI service error' : s;
}

/**
 * Classify an error into a user-friendly reason based on HTTP status or message content.
 */
function classifyError(msg, err) {
  const statusCode = err?.status_code || err?.status || 0;
  const lowerMsg = (msg || '').toLowerCase();

  if (statusCode === 429 || lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('rate limit')) {
    return { reason: 'API quota exceeded (free tier limit reached)', suggestion: 'Wait a few minutes or upgrade to a paid API key.' };
  }
  if (statusCode === 504 || lowerMsg.includes('504') || lowerMsg.includes('gateway timeout')) {
    return { reason: 'Server timeout (504)', suggestion: 'The AI server took too long to respond. Try again.' };
  }
  if (statusCode === 502 || lowerMsg.includes('502')) {
    return { reason: 'Server unreachable (502)', suggestion: 'The AI server is temporarily down. Try again shortly.' };
  }
  if (statusCode === 503 || lowerMsg.includes('503') || lowerMsg.includes('unavailable')) {
    return { reason: 'Service unavailable (503)', suggestion: 'The AI service is overloaded. Try again in a moment.' };
  }
  if (statusCode === 401 || statusCode === 403 || lowerMsg.includes('unauthorized') || lowerMsg.includes('forbidden')) {
    return { reason: 'Authentication failed', suggestion: 'Check that your API key is valid.' };
  }
  if (lowerMsg.includes('network') || lowerMsg.includes('fetch') || lowerMsg.includes('econnrefused')) {
    return { reason: 'Network error', suggestion: 'Check your internet connection.' };
  }
  if (lowerMsg.includes('timeout')) {
    return { reason: 'Request timed out', suggestion: 'The server is slow. Try again.' };
  }
  return { reason: msg || 'Unknown error', suggestion: 'Try refreshing the page.' };
}

/**
 * Classify error into a category for icon/color selection in the UI.
 * Returns: 'network' | 'timeout' | 'quota' | 'auth' | 'server' | 'unknown'
 */
function classifyErrorType(msg, err) {
  const statusCode = err?.status_code || err?.status || 0;
  const lower = (msg || '').toLowerCase();
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('econnrefused') || lower.includes('failed to fetch'))
    return 'network';
  if (statusCode === 429 || lower.includes('429') || lower.includes('quota') || lower.includes('rate limit'))
    return 'quota';
  if (statusCode === 504 || lower.includes('504') || lower.includes('gateway timeout') || lower.includes('timeout'))
    return 'timeout';
  if (statusCode === 401 || statusCode === 403 || lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('api key'))
    return 'auth';
  if (statusCode >= 500 || lower.includes('502') || lower.includes('503') || lower.includes('unavailable'))
    return 'server';
  return 'unknown';
}

/**
 * Build a structured error report object for the UI.
 * The UI component will render this as a rich diagnostic card.
 */
function buildStructuredError(provider, primaryErr, fallbackErr) {
  const primaryMsg = extractErrorMessage(primaryErr);
  const primaryInfo = classifyError(primaryMsg, primaryErr);
  const primaryType = classifyErrorType(primaryMsg, primaryErr);
  const providerName = PROVIDER_NAMES[provider] || provider;

  const attempts = [
    {
      provider: providerName,
      providerId: provider,
      status: 'failed',
      type: primaryType,
      reason: primaryInfo.reason,
      suggestion: primaryInfo.suggestion,
    },
  ];

  if (fallbackErr) {
    const fallbackMsg = extractErrorMessage(fallbackErr);
    const fallbackInfo = classifyError(fallbackMsg, fallbackErr);
    const fallbackType = classifyErrorType(fallbackMsg, fallbackErr);
    attempts.push({
      provider: PROVIDER_NAMES['google-ai'],
      providerId: 'google-ai',
      status: 'failed',
      type: fallbackType,
      reason: fallbackInfo.reason,
      suggestion: fallbackInfo.suggestion,
    });
  }

  // Pick the best suggestion (from the last failed attempt)
  const lastAttempt = attempts[attempts.length - 1];

  return {
    title: 'Could not generate explanation',
    attempts,
    suggestion: lastAttempt.suggestion,
    timestamp: new Date().toLocaleTimeString(),
  };
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
        const structured = buildStructuredError(this.provider, primaryErr, null);
        const err = new Error(structured.title);
        err.structured = structured;
        err.provider = this.provider;
        throw err;
      }

      // Try Google AI fallback
      const primaryMsg = extractErrorMessage(primaryErr);
      console.warn(`[AIAdapter] ${PROVIDER_NAMES[this.provider]} failed:`, primaryMsg, '— falling back to Google AI');
      try {
        const result = await geminiService[method](...args);
        // Fallback succeeded — switch provider for subsequent calls
        this.activeService = geminiService;
        this.provider = 'google-ai';
        return result;
      } catch (fallbackErr) {
        // Both failed — build a structured error report
        const structured = buildStructuredError(this.provider, primaryErr, fallbackErr);
        const err = new Error(structured.title);
        err.structured = structured;
        err.provider = this.provider;
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

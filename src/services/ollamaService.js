/**
 * LensLearn - Ollama/Gemma 4 Integration Service
 * Uses official ollama-js SDK with all advanced features:
 * - Thinking mode for deep reasoning
 * - Structured output for reliable JSON
 * - Multi-modal (text + image) processing
 * - Streaming with abort support
 * - Smart model selection
 */

import { Ollama } from 'ollama/browser';
import { selectBestModel, getModelById } from '../config/models';

const DEFAULT_MODEL = 'gemma4:e4b';

// Detect device tier for adaptive token limits
const getDeviceTier = () => {
  const mem = navigator.deviceMemory || 2;
  const cores = navigator.hardwareConcurrency || 2;
  if (mem <= 2 || cores <= 2) return 'low';
  if (mem <= 4 || cores <= 4) return 'medium';
  return 'high';
};

const DEVICE_TIER = getDeviceTier();
const MAX_TOKENS = DEVICE_TIER === 'low' ? 1536 : DEVICE_TIER === 'medium' ? 2048 : 3072;

// Max input text length to send to the model (characters).
// Prevents extremely long documents from overwhelming the model and causing timeouts.
const MAX_INPUT_TEXT = DEVICE_TIER === 'low' ? 4000 : DEVICE_TIER === 'medium' ? 8000 : 12000;

// Max number of page images to include for PDF analysis
const MAX_PAGE_IMAGES = DEVICE_TIER === 'low' ? 1 : DEVICE_TIER === 'medium' ? 2 : 3;

// Gemma 4 optimized sampling parameters — tuned for SPEED
// Lower temperature = more deterministic = faster convergence
// Lower num_predict = shorter responses = faster completion
const GEMMA4_OPTIONS = {
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  num_predict: MAX_TOKENS,
};

// Fast options for structured JSON output (quiz, flashcards, key terms)
const GEMMA4_FAST_OPTIONS = {
  temperature: 0.4,
  top_p: 0.85,
  top_k: 30,
  num_predict: DEVICE_TIER === 'low' ? 1024 : 1536,
};

/**
 * Truncate text to a maximum length, preserving sentence boundaries.
 * Adds a note when truncation occurs so the model knows content was cut.
 */
function truncateText(text, maxLen = MAX_INPUT_TEXT) {
  if (!text || text.length <= maxLen) return text;
  // Find the last sentence boundary before maxLen
  const truncated = text.substring(0, maxLen);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  const cutPoint = Math.max(lastPeriod, lastNewline, maxLen * 0.8);
  return truncated.substring(0, cutPoint + 1) + '\n\n[...document truncated for faster processing. Key content shown above.]';
}

/**
 * Limit the number of images to reduce processing time.
 */
function limitImages(images, max = MAX_PAGE_IMAGES) {
  if (!images || images.length <= max) return images;
  return images.slice(0, max);
}

class OllamaService {
  constructor() {
    const host = window.location.origin + '/api/ollama-local';
    this.ollama = new Ollama({ host });
    this.model = DEFAULT_MODEL;
    this.isConnected = false;
    this.availableModels = [];
    this.isCloud = false;
  }

  /**
   * Switch to Ollama Cloud API — runs real Gemma 4 models remotely.
   * Uses a Vercel Edge Function proxy at /api/ollama-cloud to:
   *   1. Bypass CORS (browser can't call ollama.com directly)
   *   2. Keep API key server-side (never in browser bundle)
   */
  switchToCloud() {
    // Point the SDK at our proxy — it forwards to https://ollama.com/api/*
    const host = window.location.origin + '/api/ollama-cloud';
    this.ollama = new Ollama({ host });
    this.isCloud = true;
    this.isConnected = false;
    this.availableModels = [];
  }

  /**
   * Switch back to local Ollama instance
   */
  switchToLocal() {
    const host = window.location.origin + '/api/ollama-local';
    this.ollama = new Ollama({ host });
    this.isCloud = false;
    this.isConnected = false;
    this.availableModels = [];
  }

  /**
   * Check if current model supports thinking mode (only Gemma 4 does)
   */
  get supportsThinking() {
    const cfg = getModelById(this.model);
    return cfg.thinking || this.model.toLowerCase().startsWith('gemma4');
  }

  /**
   * Check if current model supports multimodal (image) input
   */
  get supportsVision() {
    const cfg = getModelById(this.model);
    return cfg.multimodal;
  }

  /**
   * Switch the active model. Called from UI when user picks a different model.
   * @param {string} modelId - Ollama model tag (e.g., 'gemma4:e4b')
   */
  setModel(modelId) {
    if (modelId && this.availableModels.includes(modelId)) {
      this.model = modelId;
      return true;
    }
    return false;
  }

  /**
   * Check connection and auto-detect best available model.
   * Respects a preferred model if provided.
   * @param {string} [preferredModel] - User's preferred model from settings
   */
  async checkConnection(preferredModel) {
    try {
      const response = await this.ollama.list();
      this.availableModels = response.models?.map(m => m.name) || [];

      // Use registry-based selection (prefers user's choice, then priority)
      const best = selectBestModel(this.availableModels, preferredModel || this.model);
      if (best) this.model = best;

      this.isConnected = true;
      return { connected: true, model: this.model, models: this.availableModels };
    } catch (err) {
      this.isConnected = false;
      return { connected: false, error: err.message };
    }
  }

  /**
   * Abort all running requests
   */
  abort() {
    this.ollama.abort();
  }

  /**
   * CORE: Explain content — handles images, text, or mixed input
   * @param {Object} content - { images?: string[], text?: string }
   * @param {Object} options - { language, gradeLevel, subject, onStream }
   */
  async explain(content, options = {}) {
    const {
      language = 'English',
      gradeLevel = 'middle school',
      subject = 'auto-detect',
      onStream = null
    } = options;

    const systemPrompt = `You are LensLearn, an encouraging tutor. Explain in ${language} for ${gradeLevel} students.
Rules: Use simple language. For math, solve step-by-step. For text, summarize key concepts. For diagrams, describe and explain. Use real-world analogies. End with 1-2 review questions. Use markdown formatting. Be concise but thorough.`;

    let userContent = '';
    // Truncate text and limit images for faster processing
    const safeText = truncateText(content.text);
    const safeImages = limitImages(content.images);

    if (safeText && safeImages?.length) {
      // Mixed: PDF with images — send truncated text + limited images
      userContent = `I have a document with both text and visual content. Here is the extracted text:\n\n${safeText}\n\nI'm also including images of the pages for any diagrams, charts, or visual content. Please explain the key concepts clearly and concisely.`;
    } else if (safeText) {
      // Text-only: DOCX, TXT, extracted PDF text
      userContent = subject === 'auto-detect'
        ? `Here is content from a document. Please explain the key concepts clearly:\n\n${safeText}`
        : `This is from a ${subject} document. Explain the key concepts:\n\n${safeText}`;
    } else {
      // Image-only: camera capture or image upload
      userContent = subject === 'auto-detect'
        ? `Look at this textbook page and explain what it's teaching. Give a clear explanation.`
        : `This is from a ${subject} textbook. Explain this content clearly.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: userContent,
        ...(safeImages?.length > 0 && { images: safeImages })
      }
    ];

    // Skip thinking mode for faster responses — the quality tradeoff is worth it for speed
    return this._streamOrChat(messages, onStream);
  }

  /**
   * Legacy method for backward compatibility
   */
  async explainImage(imageBase64, options = {}) {
    return this.explain({ images: [imageBase64] }, options);
  }

  /**
   * Generate quiz with structured JSON output
   */
  async generateQuiz(content, options = {}) {
    const { language = 'English', difficulty = 'medium', numQuestions = 4 } = options;

    const systemPrompt = `You are a quiz generator for LensLearn. Create engaging quiz questions in ${language}. You MUST respond with valid JSON only, no other text.`;

    // Truncate content for quiz generation — we don't need the full text
    const safeContent = truncateText(content, Math.min(MAX_INPUT_TEXT, 6000));

    const userPrompt = `Based on this content, create ${numQuestions} ${difficulty}-difficulty multiple choice questions. Respond with ONLY this JSON format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct": "A",
      "explanation": "Why this is correct"
    }
  ]
}

Content:\n${safeContent}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        keep_alive: '10m',
        options: GEMMA4_FAST_OPTIONS,
      });

      const text = response.message?.content || '';
      return JSON.parse(text);
    } catch (err) {
      // Fallback: try without format: json
      try {
        const response = await this.ollama.chat({
          model: this.model,
          messages,
          keep_alive: '10m',
          options: GEMMA4_FAST_OPTIONS,
        });
        const text = response.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };
      } catch {
        return { questions: [] };
      }
    }
  }

  /**
   * Generate flashcards with structured JSON output
   */
  async generateFlashcards(content, options = {}) {
    const { language = 'English' } = options;

    const systemPrompt = `You are a flashcard generator for LensLearn. Create educational flashcards in ${language}. You MUST respond with valid JSON only.`;

    const safeContent = truncateText(content, Math.min(MAX_INPUT_TEXT, 6000));

    const userPrompt = `Based on this content, create 5-8 flashcards. Respond with ONLY this JSON format:
{
  "flashcards": [
    {
      "front": "Question or prompt",
      "back": "Answer or explanation"
    }
  ]
}

Content:\n${safeContent}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        keep_alive: '10m',
        options: GEMMA4_FAST_OPTIONS,
      });

      const text = response.message?.content || '';
      return JSON.parse(text);
    } catch {
      try {
        const response = await this.ollama.chat({
          model: this.model,
          messages,
          keep_alive: '10m',
          options: GEMMA4_FAST_OPTIONS,
        });
        const text = response.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { flashcards: [] };
      } catch {
        return { flashcards: [] };
      }
    }
  }

  /**
   * Detect subject from content using structured output
   */
  async detectSubject(content) {
    const messages = [
      { role: 'system', content: 'Classify the subject. Respond with ONLY valid JSON.' },
      { role: 'user', content: `Classify this educational content into one subject. Respond ONLY with: {"subject": "Math"|"Science"|"History"|"Geography"|"Literature"|"Biology"|"Chemistry"|"Physics"|"Computer Science"|"Language"|"Other"}\n\nContent: ${content.substring(0, 500)}` }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        keep_alive: '10m',
        options: { ...GEMMA4_OPTIONS, num_predict: 50 },
      });
      const result = JSON.parse(response.message?.content || '{}');
      return result.subject || 'Other';
    } catch {
      return 'Other';
    }
  }

  /**
   * Simplify content with streaming
   */
  async simplify(content, options = {}) {
    const { language = 'English', level = 'simpler', onStream = null } = options;

    const messages = [
      { role: 'system', content: `You are LensLearn. Re-explain the following content in ${language}, making it ${level}. Use everyday analogies and simple language.` },
      { role: 'user', content: `Re-explain this:\n\n${content}` }
    ];

    return this._streamOrChat(messages, onStream);
  }

  /**
   * Translate content to another language with streaming
   */
  async translate(content, options = {}) {
    const { language = 'English', onStream = null } = options;

    const messages = [
      { role: 'system', content: `You are LensLearn. Translate and re-explain the following educational content into ${language}. Keep the same structure and detail level. Use natural ${language} phrasing.` },
      { role: 'user', content: `Re-explain this in ${language}:\n\n${content}` }
    ];

    return this._streamOrChat(messages, onStream);
  }

  /**
   * Follow-up question with streaming
   */
  async askFollowUp(context, question, options = {}) {
    const { language = 'English', onStream = null } = options;

    const messages = [
      { role: 'system', content: `You are LensLearn, a patient tutor. Answer in ${language}. Be encouraging and clear.` },
      { role: 'user', content: `Previous content:\n${context}\n\nStudent's question: ${question}` }
    ];

    return this._streamOrChat(messages, onStream);
  }

  /**
   * Summarize long documents
   */
  async summarize(text, options = {}) {
    const { language = 'English', onStream = null } = options;

    const messages = [
      { role: 'system', content: `You are LensLearn. Create a comprehensive study summary in ${language}. Include key concepts, important terms, and main takeaways. Format with markdown.` },
      { role: 'user', content: `Summarize this educational content:\n\n${truncateText(text)}` }
    ];

    return this._streamOrChat(messages, onStream);
  }

  /**
   * Internal: Stream or chat based on onStream callback
   */
  async _streamOrChat(messages, onStream = null, extraOpts = {}) {
    if (onStream) {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        stream: true,
        keep_alive: '15m',
        options: GEMMA4_OPTIONS,
        ...extraOpts,
      });

      let fullResponse = '';
      for await (const chunk of response) {
        if (chunk.message?.content) {
          fullResponse += chunk.message.content;
          onStream(fullResponse, chunk.message.content);
        }
      }
      return fullResponse;
    }

    const response = await this.ollama.chat({
      model: this.model,
      messages,
      keep_alive: '15m',
      options: GEMMA4_OPTIONS,
      ...extraOpts,
    });

    return response.message?.content || '';
  }

  /**
   * Deep Dive - more detailed, academic-level explanation
   */
  async deepDive(content, options = {}) {
    const { language = 'English', onStream = null } = options;

    const messages = [
      { role: 'system', content: `You are an expert tutor providing a comprehensive, academic-level explanation in ${language}. Include:\n- Detailed analysis\n- Real-world examples and applications\n- Advanced connections to related concepts\n- Historical context if relevant\n- Critical thinking questions\n\nFormat with clear sections using markdown.` },
      { role: 'user', content: `Provide a deep dive explanation of this content:\n\n${content}` }
    ];

    return this._streamOrChat(messages, onStream);
  }

  /**
   * Extract key terms and vocabulary with JSON output
   */
  async extractKeyTerms(content, options = {}) {
    const { language = 'English' } = options;

    const safeContent = truncateText(content, Math.min(MAX_INPUT_TEXT, 6000));

    const messages = [
      { role: 'system', content: `You are a vocabulary expert. Extract key terms from educational content in ${language}. Respond with ONLY valid JSON.` },
      { role: 'user', content: `Extract 5-10 key terms/vocabulary words from this content. For each, provide a clear definition and an example sentence. Respond ONLY with this JSON format:
{
  "terms": [
    {
      "term": "word",
      "definition": "clear definition",
      "example": "example sentence using the word"
    }
  ]
}

Content:\n${safeContent}` }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        keep_alive: '10m',
        options: GEMMA4_FAST_OPTIONS,
      });

      const text = response.message?.content || '';
      return JSON.parse(text);
    } catch {
      try {
        const response = await this.ollama.chat({
          model: this.model,
          messages,
          keep_alive: '10m',
          options: GEMMA4_FAST_OPTIONS,
        });
        const text = response.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { terms: [] };
      } catch {
        return { terms: [] };
      }
    }
  }

  /**
   * Solve step-by-step - for math/science problems
   */
  async solveStepByStep(content, options = {}) {
    const { language = 'English', onStream = null } = options;

    const messages = [
      { role: 'system', content: `You are a math and science tutor in ${language}. Break down problems into clear, manageable steps. For each step:\n- Show the operation\n- Explain why this step is needed\n- Show intermediate results\n- Keep explanations simple and encouraging\n\nFormat with numbered steps using markdown.` },
      { role: 'user', content: `Solve this problem step by step:\n\n${content}` }
    ];

    return this._streamOrChat(messages, onStream);
  }

  /**
   * Generate study plan with JSON output
   */
  async generateStudyPlan(content, options = {}) {
    const { language = 'English' } = options;

    const safeContent = truncateText(content, Math.min(MAX_INPUT_TEXT, 4000));

    const messages = [
      { role: 'system', content: `You are an educational planner. Create a structured study plan in ${language}. Respond with ONLY valid JSON.` },
      { role: 'user', content: `Create a personalized study plan for mastering this topic. Include 4-6 topics to learn in sequence. Respond ONLY with this JSON format:
{
  "plan": [
    {
      "topic": "topic name",
      "description": "what to study",
      "duration": "estimated time (e.g., '20 mins')",
      "resources": ["suggested activity or resource", "..."]
    }
  ]
}

Topic:\n${safeContent}` }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        keep_alive: '10m',
        options: GEMMA4_FAST_OPTIONS,
      });

      const text = response.message?.content || '';
      return JSON.parse(text);
    } catch {
      try {
        const response = await this.ollama.chat({
          model: this.model,
          messages,
          keep_alive: '10m',
          options: GEMMA4_FAST_OPTIONS,
        });
        const text = response.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { plan: [] };
      } catch {
        return { plan: [] };
      }
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      model: this.model,
      models: this.availableModels,
      provider: this.isCloud ? 'ollama-cloud' : 'ollama',
    };
  }
}

const ollamaService = new OllamaService();
export default ollamaService;

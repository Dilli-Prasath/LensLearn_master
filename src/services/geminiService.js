/**
 * LensLearn — Google AI (Gemini/Gemma) Cloud Fallback Service
 *
 * Mirrors the ollamaService API surface so the app can seamlessly
 * switch between local Ollama and cloud Google AI.
 *
 * Uses @google/generative-ai SDK with Gemma models when available,
 * falling back to Gemini Flash for maximum compatibility.
 *
 * All methods match ollamaService signatures exactly.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Model preference order — try Gemma 4 first, fall back to Gemini
const CLOUD_MODELS = [
  'gemma-4-e4b',
  'gemma-4-e2b',
  'gemma-3-4b',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

// Adaptive token limits (same tiers as ollamaService)
const getDeviceTier = () => {
  const mem = navigator.deviceMemory || 2;
  const cores = navigator.hardwareConcurrency || 2;
  if (mem <= 2 || cores <= 2) return 'low';
  if (mem <= 4 || cores <= 4) return 'medium';
  return 'high';
};

const DEVICE_TIER = getDeviceTier();
const MAX_TOKENS = DEVICE_TIER === 'low' ? 1536 : DEVICE_TIER === 'medium' ? 2048 : 3072;
const MAX_INPUT_TEXT = DEVICE_TIER === 'low' ? 4000 : DEVICE_TIER === 'medium' ? 8000 : 12000;
const MAX_PAGE_IMAGES = DEVICE_TIER === 'low' ? 1 : DEVICE_TIER === 'medium' ? 2 : 3;

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: MAX_TOKENS,
};

const FAST_GENERATION_CONFIG = {
  temperature: 0.4,
  topP: 0.85,
  topK: 30,
  maxOutputTokens: DEVICE_TIER === 'low' ? 1024 : 1536,
};

function truncateText(text, maxLen = MAX_INPUT_TEXT) {
  if (!text || text.length <= maxLen) return text;
  const truncated = text.substring(0, maxLen);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  const cutPoint = Math.max(lastPeriod, lastNewline, maxLen * 0.8);
  return truncated.substring(0, cutPoint + 1) + '\n\n[...document truncated for faster processing.]';
}

function limitImages(images, max = MAX_PAGE_IMAGES) {
  if (!images || images.length <= max) return images;
  return images.slice(0, max);
}

class GeminiService {
  constructor() {
    this.apiKey = null;
    this.genAI = null;
    this.model = null;
    this.modelName = '';
    this.isConnected = false;
    this.availableModels = [];
    this._abortController = null;
  }

  get supportsThinking() { return false; }
  get supportsVision() { return true; }

  /**
   * Initialize with API key. Called once from settings or env var.
   */
  init(apiKey) {
    if (!apiKey) return false;
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    return true;
  }

  /**
   * Check connection by listing available models and picking the best one.
   */
  async checkConnection(preferredModel) {
    if (!this.genAI) {
      // Try env var
      const envKey = import.meta.env.VITE_GOOGLE_AI_KEY;
      if (envKey) {
        this.init(envKey);
      } else {
        return { connected: false, error: 'No API key configured' };
      }
    }

    // If already verified, return cached status (avoid wasting tokens)
    if (this.isConnected && this.model) {
      return {
        connected: true,
        model: this.modelName,
        models: this.availableModels,
        provider: 'google-ai',
      };
    }

    try {
      // Try to use the model — simplest connectivity check
      const testModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await testModel.generateContent('Hi');

      // Find best available model
      this.modelName = 'gemini-2.0-flash';
      this.model = testModel;
      this.isConnected = true;
      this.availableModels = ['gemini-2.0-flash'];

      return {
        connected: true,
        model: this.modelName,
        models: this.availableModels,
        provider: 'google-ai',
      };
    } catch (err) {
      this.isConnected = false;
      return { connected: false, error: err.message, provider: 'google-ai' };
    }
  }

  setModel(modelId) {
    if (modelId && this.genAI) {
      try {
        this.model = this.genAI.getGenerativeModel({ model: modelId });
        this.modelName = modelId;
        return true;
      } catch { return false; }
    }
    return false;
  }

  abort() {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  }

  /**
   * Prepare image parts for Gemini API from base64 strings
   */
  _prepareImageParts(images) {
    if (!images?.length) return [];
    return limitImages(images).map(b64 => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: b64,
      }
    }));
  }

  /**
   * Core generation — handles both streaming and non-streaming
   */
  async _generate(systemPrompt, userContent, images, onStream, config = GENERATION_CONFIG) {
    if (!this.genAI) throw new Error('Google AI not initialized');

    const model = this.genAI.getGenerativeModel({
      model: this.modelName || 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: config,
    });

    const parts = [];
    if (userContent) parts.push({ text: userContent });
    const imageParts = this._prepareImageParts(images);
    parts.push(...imageParts);

    if (onStream) {
      const result = await model.generateContentStream(parts);
      let fullResponse = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullResponse += text;
          onStream(fullResponse, text);
        }
      }
      return fullResponse;
    } else {
      const result = await model.generateContent(parts);
      return result.response?.text?.() || '';
    }
  }

  /**
   * Generate JSON output — wraps _generate with JSON parsing
   */
  async _generateJSON(systemPrompt, userContent, config = FAST_GENERATION_CONFIG) {
    if (!this.genAI) throw new Error('Google AI not initialized');

    const model = this.genAI.getGenerativeModel({
      model: this.modelName || 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        ...config,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(userContent);
    const text = result.response?.text?.() || '';
    return JSON.parse(text);
  }

  // ═══════════════════════════════════
  //  Public API — mirrors ollamaService
  // ═══════════════════════════════════

  async explain(content, options = {}) {
    const { language = 'English', gradeLevel = 'middle school', subject = 'auto-detect', onStream = null } = options;

    const systemPrompt = `You are LensLearn, an encouraging tutor. Explain in ${language} for ${gradeLevel} students.
Rules: Use simple language. For math, solve step-by-step. For text, summarize key concepts. For diagrams, describe and explain. Use real-world analogies. End with 1-2 review questions. Use markdown formatting. Be concise but thorough.`;

    const safeText = truncateText(content.text);
    const safeImages = limitImages(content.images);
    let userContent = '';

    if (safeText && safeImages?.length) {
      userContent = `I have a document with both text and visual content. Here is the extracted text:\n\n${safeText}\n\nPlease explain the key concepts clearly and concisely.`;
    } else if (safeText) {
      userContent = subject === 'auto-detect'
        ? `Here is content from a document. Please explain the key concepts clearly:\n\n${safeText}`
        : `This is from a ${subject} document. Explain the key concepts:\n\n${safeText}`;
    } else {
      userContent = subject === 'auto-detect'
        ? 'Look at this textbook page and explain what it\'s teaching. Give a clear explanation.'
        : `This is from a ${subject} textbook. Explain this content clearly.`;
    }

    return this._generate(systemPrompt, userContent, safeImages, onStream);
  }

  async explainImage(imageBase64, options = {}) {
    return this.explain({ images: [imageBase64] }, options);
  }

  async generateQuiz(content, options = {}) {
    const { language = 'English', difficulty = 'medium', numQuestions = 4 } = options;
    const safeContent = truncateText(content, Math.min(MAX_INPUT_TEXT, 6000));

    const systemPrompt = `You are a quiz generator for LensLearn. Create engaging quiz questions in ${language}. You MUST respond with valid JSON only.`;
    const userPrompt = `Based on this content, create ${numQuestions} ${difficulty}-difficulty multiple choice questions. Respond with ONLY this JSON format:
{"questions":[{"question":"Question text","options":["A) option1","B) option2","C) option3","D) option4"],"correct":"A","explanation":"Why this is correct"}]}

Content:\n${safeContent}`;

    try {
      return await this._generateJSON(systemPrompt, userPrompt);
    } catch {
      return { questions: [] };
    }
  }

  async generateFlashcards(content, options = {}) {
    const { language = 'English' } = options;
    const safeContent = truncateText(content, Math.min(MAX_INPUT_TEXT, 6000));

    const systemPrompt = `You are a flashcard generator for LensLearn. Create educational flashcards in ${language}. You MUST respond with valid JSON only.`;
    const userPrompt = `Based on this content, create 5-8 flashcards. Respond with ONLY this JSON format:
{"flashcards":[{"front":"Question or prompt","back":"Answer or explanation"}]}

Content:\n${safeContent}`;

    try {
      return await this._generateJSON(systemPrompt, userPrompt);
    } catch {
      return { flashcards: [] };
    }
  }

  async extractKeyTerms(content, options = {}) {
    const { language = 'English' } = options;
    const safeContent = truncateText(content, Math.min(MAX_INPUT_TEXT, 6000));

    const systemPrompt = `You are a vocabulary expert. Extract key terms in ${language}. Respond with ONLY valid JSON.`;
    const userPrompt = `Extract 5-10 key terms. Respond ONLY with: {"terms":[{"term":"word","definition":"clear definition","example":"example sentence"}]}

Content:\n${safeContent}`;

    try {
      return await this._generateJSON(systemPrompt, userPrompt);
    } catch {
      return { terms: [] };
    }
  }

  async detectSubject(content) {
    const systemPrompt = 'Classify the subject. Respond with ONLY valid JSON.';
    const userPrompt = `Classify: {"subject":"Math"|"Science"|"History"|"Geography"|"Literature"|"Biology"|"Chemistry"|"Physics"|"Computer Science"|"Language"|"Other"}\n\nContent: ${(content || '').substring(0, 500)}`;

    try {
      const result = await this._generateJSON(systemPrompt, userPrompt);
      return result.subject || 'Other';
    } catch {
      return 'Other';
    }
  }

  async simplify(content, options = {}) {
    const { language = 'English', level = 'simpler', onStream = null } = options;
    const systemPrompt = `You are LensLearn. Re-explain in ${language}, making it ${level}. Use everyday analogies.`;
    return this._generate(systemPrompt, `Re-explain this:\n\n${content}`, null, onStream);
  }

  async translate(content, options = {}) {
    const { language = 'English', onStream = null } = options;
    const systemPrompt = `You are LensLearn. Translate and re-explain into ${language}. Keep the same structure.`;
    return this._generate(systemPrompt, `Re-explain this in ${language}:\n\n${content}`, null, onStream);
  }

  async askFollowUp(context, question, options = {}) {
    const { language = 'English', onStream = null } = options;
    const systemPrompt = `You are LensLearn, a patient tutor. Answer in ${language}. Be encouraging and clear.`;
    return this._generate(systemPrompt, `Previous content:\n${context}\n\nStudent's question: ${question}`, null, onStream);
  }

  async summarize(text, options = {}) {
    const { language = 'English', onStream = null } = options;
    const systemPrompt = `You are LensLearn. Create a study summary in ${language}. Include key concepts, terms, takeaways. Use markdown.`;
    return this._generate(systemPrompt, `Summarize:\n\n${truncateText(text)}`, null, onStream);
  }

  async deepDive(content, options = {}) {
    const { language = 'English', onStream = null } = options;
    const systemPrompt = `You are an expert tutor providing a comprehensive explanation in ${language}. Include detailed analysis, real-world examples, advanced connections, and critical thinking questions. Use markdown.`;
    return this._generate(systemPrompt, `Deep dive explanation:\n\n${content}`, null, onStream);
  }

  async solveStepByStep(content, options = {}) {
    const { language = 'English', onStream = null } = options;
    const systemPrompt = `You are a math/science tutor in ${language}. Break down problems step-by-step. Show operations, explain why, show results. Use numbered markdown steps.`;
    return this._generate(systemPrompt, `Solve step by step:\n\n${content}`, null, onStream);
  }

  async generateStudyPlan(content, options = {}) {
    const { language = 'English' } = options;
    const safeContent = truncateText(content, Math.min(MAX_INPUT_TEXT, 4000));
    const systemPrompt = `You are an educational planner. Create a study plan in ${language}. Respond with ONLY valid JSON.`;
    const userPrompt = `Create a study plan with 4-6 topics. Respond ONLY with: {"plan":[{"topic":"name","description":"what to study","duration":"time","resources":["activity"]}]}

Topic:\n${safeContent}`;

    try {
      return await this._generateJSON(systemPrompt, userPrompt);
    } catch {
      return { plan: [] };
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      model: this.modelName,
      models: this.availableModels,
      provider: 'google-ai',
    };
  }
}

const geminiService = new GeminiService();
export default geminiService;

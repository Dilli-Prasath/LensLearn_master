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
const MAX_TOKENS = DEVICE_TIER === 'low' ? 2048 : DEVICE_TIER === 'medium' ? 3072 : 4096;

// Gemma 4 recommended sampling parameters (adaptive to device)
const GEMMA4_OPTIONS = {
  temperature: 1.0,
  top_p: 0.95,
  top_k: 64,
  num_predict: MAX_TOKENS,
};

class OllamaService {
  constructor() {
    const host = window.location.origin + '/api/ollama';
    this.ollama = new Ollama({ host });
    this.model = DEFAULT_MODEL;
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

    const systemPrompt = `You are LensLearn, a patient and encouraging tutor. Help students understand their learning material.

RULES:
- Explain in ${language}. Use simple, clear language appropriate for ${gradeLevel} students.
- If the content shows a math problem, solve it step-by-step showing all work.
- If it shows text/theory, summarize the key concepts and explain them simply.
- If it shows a diagram/chart, describe what it represents and explain the concept.
- Use analogies and real-world examples students can relate to.
- End with 1-2 quick review questions to check understanding.
- Be encouraging and supportive.
- Format your response with clear sections using markdown.`;

    let userContent = '';

    if (content.text && content.images?.length) {
      // Mixed: PDF with images — send text + images
      userContent = `I have a document with both text and visual content. Here is the extracted text:\n\n${content.text}\n\nI'm also including images of the pages for any diagrams, charts, or visual content. Please explain everything thoroughly.`;
    } else if (content.text) {
      // Text-only: DOCX, TXT, extracted PDF text
      userContent = subject === 'auto-detect'
        ? `Here is content from a document. Please explain what it's teaching:\n\n${content.text}`
        : `This is from a ${subject} document. Explain this content:\n\n${content.text}`;
    } else {
      // Image-only: camera capture or image upload
      userContent = subject === 'auto-detect'
        ? `Look at this textbook page and explain what it's teaching. Give a step-by-step explanation.`
        : `This is from a ${subject} textbook. Explain this content with a step-by-step explanation.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: userContent,
        ...(content.images?.length > 0 && { images: content.images })
      }
    ];

    return this._streamOrChat(messages, onStream, this.supportsThinking ? { think: true } : {});
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

Content:\n${content}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        ...(this.supportsThinking ? { think: true } : {}),
        keep_alive: '10m',
        options: GEMMA4_OPTIONS,
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
          options: GEMMA4_OPTIONS,
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

    const userPrompt = `Based on this content, create 5-8 flashcards. Respond with ONLY this JSON format:
{
  "flashcards": [
    {
      "front": "Question or prompt",
      "back": "Answer or explanation"
    }
  ]
}

Content:\n${content}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        ...(this.supportsThinking ? { think: true } : {}),
        keep_alive: '10m',
        options: GEMMA4_OPTIONS,
      });

      const text = response.message?.content || '';
      return JSON.parse(text);
    } catch {
      try {
        const response = await this.ollama.chat({
          model: this.model,
          messages,
          keep_alive: '10m',
          options: GEMMA4_OPTIONS,
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
      { role: 'user', content: `Summarize this educational content:\n\n${text}` }
    ];

    return this._streamOrChat(messages, onStream, this.supportsThinking ? { think: true } : {});
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
        keep_alive: '10m',
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
      keep_alive: '10m',
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

    return this._streamOrChat(messages, onStream, this.supportsThinking ? { think: true } : {});
  }

  /**
   * Extract key terms and vocabulary with JSON output
   */
  async extractKeyTerms(content, options = {}) {
    const { language = 'English' } = options;

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

Content:\n${content}` }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        keep_alive: '10m',
        options: GEMMA4_OPTIONS,
      });

      const text = response.message?.content || '';
      return JSON.parse(text);
    } catch {
      try {
        const response = await this.ollama.chat({
          model: this.model,
          messages,
          keep_alive: '10m',
          options: GEMMA4_OPTIONS,
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

    return this._streamOrChat(messages, onStream, this.supportsThinking ? { think: true } : {});
  }

  /**
   * Generate study plan with JSON output
   */
  async generateStudyPlan(content, options = {}) {
    const { language = 'English' } = options;

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

Topic:\n${content}` }
    ];

    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages,
        format: 'json',
        keep_alive: '10m',
        options: GEMMA4_OPTIONS,
      });

      const text = response.message?.content || '';
      return JSON.parse(text);
    } catch {
      try {
        const response = await this.ollama.chat({
          model: this.model,
          messages,
          keep_alive: '10m',
          options: GEMMA4_OPTIONS,
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
      models: this.availableModels
    };
  }
}

const ollamaService = new OllamaService();
export default ollamaService;

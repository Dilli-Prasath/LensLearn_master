/**
 * LensLearn - Ollama/Gemma 4 Integration Service
 * Handles all communication with the local Ollama instance running Gemma 4
 */

const OLLAMA_BASE = '/api/ollama';
const DEFAULT_MODEL = 'gemma4:e4b';

// Fallback models in order of preference
const MODEL_FALLBACKS = ['gemma4:e4b', 'gemma4:e2b', 'gemma4', 'gemma3'];

class OllamaService {
  constructor() {
    this.baseUrl = OLLAMA_BASE;
    this.model = DEFAULT_MODEL;
    this.isConnected = false;
    this.availableModels = [];
  }

  /**
   * Check if Ollama is running and find available Gemma models
   */
  async checkConnection() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error('Ollama not responding');

      const data = await res.json();
      this.availableModels = data.models?.map(m => m.name) || [];

      // Find best available Gemma model
      for (const fallback of MODEL_FALLBACKS) {
        const match = this.availableModels.find(m => m.startsWith(fallback));
        if (match) {
          this.model = match;
          break;
        }
      }

      this.isConnected = true;
      return { connected: true, model: this.model, models: this.availableModels };
    } catch (err) {
      this.isConnected = false;
      return { connected: false, error: err.message };
    }
  }

  /**
   * Convert an image file/blob to base64
   */
  async imageToBase64(imageSource) {
    if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
      return imageSource.split(',')[1];
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    });
  }

  /**
   * Core method: Explain a textbook page image
   */
  async explainImage(imageBase64, options = {}) {
    const {
      language = 'English',
      gradeLevel = 'middle school',
      subject = 'auto-detect',
      detail = 'step-by-step',
      onStream = null
    } = options;

    const systemPrompt = `You are LensLearn, a patient and encouraging tutor. Your job is to help students understand their textbook content.

RULES:
- Explain in ${language}. Use simple, clear language appropriate for ${gradeLevel} students.
- If the image shows a math problem, solve it step-by-step showing all work.
- If it shows text/theory, summarize the key concepts and explain them simply.
- If it shows a diagram/chart, describe what it represents and explain the concept.
- Use analogies and real-world examples students can relate to.
- End with 1-2 quick review questions to check understanding.
- Be encouraging. Say things like "Great question!" or "Let's figure this out together."
- Format your response with clear sections using markdown.`;

    const userPrompt = subject === 'auto-detect'
      ? `Look at this textbook page and explain what it's teaching. Give a ${detail} explanation.`
      : `This is from a ${subject} textbook. Explain this content with a ${detail} explanation.`;

    return this._chat(systemPrompt, userPrompt, [imageBase64], onStream);
  }

  /**
   * Generate a quiz based on the explained content
   */
  async generateQuiz(content, options = {}) {
    const { language = 'English', difficulty = 'medium', numQuestions = 3 } = options;

    const systemPrompt = `You are a quiz generator for LensLearn. Create engaging quiz questions in ${language}.

OUTPUT FORMAT (strictly follow this JSON format):
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct": "A",
      "explanation": "Why this is correct"
    }
  ]
}`;

    const userPrompt = `Based on this content, create ${numQuestions} ${difficulty}-difficulty multiple choice questions:\n\n${content}`;

    const response = await this._chat(systemPrompt, userPrompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };
    } catch {
      return { questions: [] };
    }
  }

  /**
   * Simplify or re-explain content at a different level
   */
  async simplify(content, options = {}) {
    const { language = 'English', level = 'simpler' } = options;

    const systemPrompt = `You are LensLearn. Re-explain the following content in ${language}, making it ${level}. Use everyday analogies.`;

    return this._chat(systemPrompt, `Re-explain this:\n\n${content}`);
  }

  /**
   * Follow-up question about previously explained content
   */
  async askFollowUp(context, question, options = {}) {
    const { language = 'English', onStream = null } = options;

    const systemPrompt = `You are LensLearn, a patient tutor helping a student. Answer in ${language}. The student previously learned about the content below and now has a follow-up question. Be encouraging and clear.`;

    const userPrompt = `Previous content:\n${context}\n\nStudent's question: ${question}`;

    return this._chat(systemPrompt, userPrompt, [], onStream);
  }

  /**
   * Internal chat method with streaming support
   */
  async _chat(systemPrompt, userPrompt, images = [], onStream = null) {
    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: userPrompt,
        ...(images.length > 0 && { images })
      }
    ];

    const body = {
      model: this.model,
      messages,
      stream: !!onStream,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 2048
      }
    };

    if (onStream) {
      return this._streamChat(body, onStream);
    }

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.message?.content || '';
  }

  /**
   * Streaming chat for real-time response display
   */
  async _streamChat(body, onStream) {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            fullResponse += json.message.content;
            onStream(fullResponse, json.message.content);
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }

    return fullResponse;
  }

  /**
   * Get connection status info
   */
  getStatus() {
    return {
      connected: this.isConnected,
      model: this.model,
      models: this.availableModels
    };
  }
}

// Singleton instance
const ollamaService = new OllamaService();
export default ollamaService;

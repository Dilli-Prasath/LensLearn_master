/**
 * Scan / AI Store — Zustand
 * Manages the current scan session: captured image, explanation,
 * AI processing state, quiz, flashcards, and all AI operations.
 */
import { create } from 'zustand';
import aiService from '../services/aiAdapter';

export const useScanStore = create((set, get) => ({
  // ── Current scan data ──
  capturedImage: null,     // data URL of captured / uploaded image
  imageBase64: null,       // base64 (without prefix) for Ollama
  documentContent: null,   // parsed text from PDF / DOCX / TXT
  croppedImage: null,

  // ── Explanation state ──
  explanation: '',
  isProcessing: false,
  isStreaming: false,
  error: null,

  // ── Quiz state ──
  quiz: null,
  quizLoading: false,

  // ── Flashcard state ──
  flashcards: null,
  flashcardsLoading: false,

  // ── Key terms state (future) ──
  keyTerms: null,
  keyTermsLoading: false,

  // ── Study plan (future) ──
  studyPlan: null,
  studyPlanLoading: false,

  // ── History session being viewed ──
  viewingSession: null,

  // ═══════════════════════════════════
  //  Image / document setters
  // ═══════════════════════════════════
  setCapturedImage: (dataUrl, base64) => set({
    capturedImage: dataUrl,
    imageBase64: base64,
    error: null,
  }),

  setDocumentContent: (content) => set({
    documentContent: content,
    error: null,
  }),

  setCroppedImage: (dataUrl, base64) => set({
    capturedImage: dataUrl,
    imageBase64: base64,
    croppedImage: dataUrl,
  }),

  // ═══════════════════════════════════
  //  AI Operations
  // ═══════════════════════════════════

  /** Main explain action */
  explain: async (settings) => {
    const { imageBase64, documentContent } = get();
    if (!imageBase64 && !documentContent) return;

    set({ isProcessing: true, isStreaming: true, explanation: '', error: null });

    try {
      const content = documentContent || { images: [imageBase64] };
      const hint = documentContent ? '*Analyzing your document...*' : '*Analyzing your image...*';
      set({ explanation: hint });

      await aiService.explain(content, {
        language: settings.language,
        gradeLevel: settings.gradeLevel,
        subject: settings.subject,
        onStream: (fullText) => set({ explanation: fullText }),
      });
    } catch (err) {
      const provider = aiService.provider;
      const hint = provider === 'ollama'
        ? '1. Make sure Ollama is running\n2. Run: `ollama pull gemma4:e4b`\n3. Start: `OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve`'
        : '1. Check your internet connection\n2. Verify your API key is valid\n3. Try refreshing the page';
      // Extract a clean string from the error (Ollama SDK sometimes throws {message: {error: '...'}})
      const errMsg = typeof err?.message === 'string' ? err.message
        : typeof err?.message === 'object' ? (err.message.error || JSON.stringify(err.message))
        : String(err);
      set({
        explanation: `**Connection Error**\n\nCouldn't reach the AI model.\n\n${hint}\n\n*Error: ${errMsg}*`,
        error: errMsg,
      });
    }
    set({ isStreaming: false, isProcessing: false });
  },

  /** Deep dive into current explanation */
  deepDive: async (language) => {
    const { explanation } = get();
    set({ isStreaming: true, explanation: '' });
    try {
      await aiService.deepDive(explanation, {
        language,
        onStream: (fullText) => set({ explanation: fullText }),
      });
    } catch (err) {
      console.error('Deep dive failed:', err);
    }
    set({ isStreaming: false });
  },

  /** Simplify explanation */
  simplify: async (language) => {
    const { explanation } = get();
    set({ isStreaming: true, explanation: '' });
    try {
      await aiService.simplify(explanation, {
        language,
        level: 'simpler, using everyday language and fun analogies',
        onStream: (fullText) => set({ explanation: fullText }),
      });
    } catch (err) {
      console.error('Simplify failed:', err);
    }
    set({ isStreaming: false });
  },

  /** Translate explanation */
  translate: async (newLang) => {
    const { explanation } = get();
    set({ isStreaming: true });
    const original = explanation;
    set({ explanation: '' });
    try {
      await aiService.translate(original, {
        language: newLang,
        onStream: (fullText) => set({ explanation: fullText }),
      });
    } catch (err) {
      console.error('Translation failed:', err);
      set({ explanation: original });
    }
    set({ isStreaming: false });
  },

  /** Follow-up question */
  askFollowUp: async (question, language) => {
    const { explanation } = get();
    return aiService.askFollowUp(explanation, question, { language });
  },

  /** Generate quiz */
  generateQuiz: async (language, difficulty = 'medium', numQuestions = 4) => {
    const { explanation } = get();
    set({ quizLoading: true });
    try {
      const quizData = await aiService.generateQuiz(explanation, {
        language, difficulty, numQuestions,
      });
      if (quizData.questions?.length > 0) {
        // Normalize the correct answer field to a single uppercase letter
        // so that history stats (q.userAnswer === q.correct) always match.
        const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
        const normalized = {
          ...quizData,
          questions: quizData.questions.map(q => {
            const raw = String(q.correct ?? '').trim();
            let correct = 'A';
            if (/^[A-Fa-f]$/.test(raw)) {
              correct = raw.toUpperCase();
            } else if (/^[A-Fa-f][).:\s]/.test(raw)) {
              correct = raw.charAt(0).toUpperCase();
            } else if (typeof q.correct === 'number') {
              // LLMs typically use 1-based indexing (1=A, 2=B)
              const idx = q.correct >= 1 ? q.correct - 1 : q.correct;
              correct = LETTERS[Math.max(0, Math.min(idx, (q.options?.length || 4) - 1))] || 'A';
            } else if (/^\d$/.test(raw)) {
              const idx = parseInt(raw, 10);
              correct = LETTERS[Math.min(idx <= 0 ? 0 : idx - 1, (q.options?.length || 4) - 1)] || 'A';
            } else if (raw.length > 1) {
              // Full text match against options
              const lowerRaw = raw.toLowerCase();
              const matchIdx = (q.options || []).findIndex(opt =>
                String(opt).toLowerCase().includes(lowerRaw) ||
                lowerRaw.includes(String(opt).replace(/^[A-Fa-f0-9][).:\s]+\s*/, '').toLowerCase())
              );
              correct = matchIdx >= 0 ? LETTERS[matchIdx] : 'A';
            }
            return { ...q, correct };
          }),
        };
        set({ quiz: normalized, quizLoading: false });
        return true; // signal success for navigation
      }
    } catch (err) {
      console.error('Quiz generation failed:', err);
    }
    set({ quizLoading: false });
    return false;
  },

  /** Generate flashcards */
  generateFlashcards: async (language) => {
    const { explanation } = get();
    set({ flashcardsLoading: true });
    try {
      const data = await aiService.generateFlashcards(explanation, { language });
      if (data.flashcards?.length > 0) {
        set({ flashcards: data.flashcards, flashcardsLoading: false });
        return true;
      }
    } catch (err) {
      console.error('Flashcard generation failed:', err);
    }
    set({ flashcardsLoading: false });
    return false;
  },

  /** Extract key terms */
  extractKeyTerms: async (language) => {
    const { explanation } = get();
    set({ keyTermsLoading: true });
    try {
      const data = await aiService.extractKeyTerms(explanation, { language });
      set({ keyTerms: data, keyTermsLoading: false });
      return data;
    } catch (err) {
      console.error('Key terms failed:', err);
      set({ keyTermsLoading: false });
      return { terms: [] };
    }
  },

  /** Generate study plan (future) */
  generateStudyPlan: async (language) => {
    const { explanation } = get();
    set({ studyPlanLoading: true });
    try {
      const plan = await aiService.generateStudyPlan(explanation, { language });
      set({ studyPlan: plan, studyPlanLoading: false });
      return plan;
    } catch (err) {
      console.error('Study plan failed:', err);
      set({ studyPlanLoading: false });
      return null;
    }
  },

  /** Abort current AI operation */
  abort: () => {
    aiService.abort();
    set({ isStreaming: false, isProcessing: false });
  },

  // ═══════════════════════════════════
  //  View history session
  // ═══════════════════════════════════
  viewSession: (session) => set({
    viewingSession: session,
    explanation: session.explanation,
    quiz: session.quiz || null,
  }),

  // ═══════════════════════════════════
  //  Reset
  // ═══════════════════════════════════
  resetScan: () => {
    // Abort any in-flight AI request before resetting state
    aiService.abort();
    set({
    capturedImage: null,
    imageBase64: null,
    documentContent: null,
    croppedImage: null,
    explanation: '',
    isProcessing: false,
    isStreaming: false,
    error: null,
    quiz: null,
    quizLoading: false,
    flashcards: null,
    flashcardsLoading: false,
    keyTerms: null,
    keyTermsLoading: false,
    studyPlan: null,
    studyPlanLoading: false,
    viewingSession: null,
  });},
}));

/**
 * Scan / AI Store — Zustand
 * Manages the current scan session: captured image, explanation,
 * AI processing state, quiz, flashcards, and all AI operations.
 */
import { create } from 'zustand';
import ollamaService from '../services/ollamaService';

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

      await ollamaService.explain(content, {
        language: settings.language,
        gradeLevel: settings.gradeLevel,
        subject: settings.subject,
        onStream: (fullText) => set({ explanation: fullText }),
      });
    } catch (err) {
      set({
        explanation: `**Connection Error**\n\nCouldn't reach the AI model. Please make sure:\n\n1. Ollama is running\n2. Run: \`ollama pull gemma4:e4b\`\n3. Start: \`OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve\`\n\n*Error: ${err.message}*`,
        error: err.message,
      });
    }
    set({ isStreaming: false, isProcessing: false });
  },

  /** Deep dive into current explanation */
  deepDive: async (language) => {
    const { explanation } = get();
    set({ isStreaming: true, explanation: '' });
    try {
      await ollamaService.deepDive(explanation, {
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
      await ollamaService.simplify(explanation, {
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
      await ollamaService.translate(original, {
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
    return ollamaService.askFollowUp(explanation, question, { language });
  },

  /** Generate quiz */
  generateQuiz: async (language, difficulty = 'medium', numQuestions = 4) => {
    const { explanation } = get();
    set({ quizLoading: true });
    try {
      const quizData = await ollamaService.generateQuiz(explanation, {
        language, difficulty, numQuestions,
      });
      if (quizData.questions?.length > 0) {
        set({ quiz: quizData });
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
      const data = await ollamaService.generateFlashcards(explanation, { language });
      if (data.flashcards?.length > 0) {
        set({ flashcards: data.flashcards });
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
      const data = await ollamaService.extractKeyTerms(explanation, { language });
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
      const plan = await ollamaService.generateStudyPlan(explanation, { language });
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
    ollamaService.abort();
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
  resetScan: () => set({
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
  }),
}));

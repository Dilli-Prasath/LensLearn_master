/**
 * ExplanationPage — Shows AI explanation after a scan.
 * Reads all state from the scan store. No prop drilling.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ExplanationView from '../components/ExplanationView';
import { useScanStore, useSettingsStore, useHistoryStore } from '../store';

// Back button
function BackButton({ onClick, label = 'Back' }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <button className="btn btn-secondary" onClick={onClick} style={{ fontSize: 13 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {label}
      </button>
    </div>
  );
}

export default function ExplanationPage() {
  const navigate = useNavigate();
  const {
    explanation, isStreaming, capturedImage,
    quizLoading, flashcardsLoading,
    abort, deepDive, simplify, translate,
    askFollowUp, generateQuiz, generateFlashcards,
    extractKeyTerms, viewingSession, resetScan, explain,
  } = useScanStore();

  const settings = useSettingsStore();
  const saveSession = useHistoryStore((s) => s.saveSession);

  const isViewingHistory = !!viewingSession;
  const imagePreview = isViewingHistory ? viewingSession?.image : capturedImage;

  const handleBack = useCallback(() => {
    if (isViewingHistory) {
      navigate('/history');
    } else {
      resetScan();
      navigate('/scan');
    }
  }, [isViewingHistory, navigate, resetScan]);

  const handleQuiz = useCallback(async () => {
    const ok = await generateQuiz(settings.language);
    if (ok) navigate('/quiz');
  }, [generateQuiz, settings.language, navigate]);

  const handleFlashcards = useCallback(async () => {
    const ok = await generateFlashcards(settings.language);
    if (ok) navigate('/flashcards');
  }, [generateFlashcards, settings.language, navigate]);

  const handleSimplify = useCallback(() => simplify(settings.language), [simplify, settings.language]);
  const handleDeepDive = useCallback(() => deepDive(settings.language), [deepDive, settings.language]);
  const handleRetry = useCallback(() => explain(settings), [explain, settings]);
  const handleFollowUp = useCallback((q) => askFollowUp(q, settings.language), [askFollowUp, settings.language]);
  const handleExtractKeyTerms = useCallback(() => extractKeyTerms(settings.language), [extractKeyTerms, settings.language]);

  const handleLanguageChange = useCallback(async (newLang) => {
    useSettingsStore.getState().setSetting('language', newLang);
    if (explanation && newLang !== settings.language) {
      await translate(newLang);
    }
  }, [explanation, settings.language, translate]);

  const handleSave = useCallback(() => {
    if (capturedImage && explanation) {
      saveSession({
        image: capturedImage,
        explanation,
        subject: settings.subject,
        language: settings.language,
        quiz: useScanStore.getState().quiz,
      });
    }
  }, [capturedImage, explanation, settings, saveSession]);

  return (
    <>
      <BackButton onClick={handleBack} label={isViewingHistory ? 'Back' : 'New Scan'} />
      <ExplanationView
        explanation={explanation}
        isStreaming={isStreaming}
        imagePreview={imagePreview}
        language={settings.language}
        onGenerateQuiz={handleQuiz}
        onGenerateFlashcards={handleFlashcards}
        onSimplify={handleSimplify}
        onAskFollowUp={handleFollowUp}
        quizLoading={quizLoading}
        flashcardsLoading={flashcardsLoading}
        onSaveSession={!isViewingHistory ? handleSave : undefined}
        onLanguageChange={handleLanguageChange}
        onRetry={handleRetry}
        onAbort={abort}
        onDeepDive={handleDeepDive}
        onExtractKeyTerms={handleExtractKeyTerms}
      />
    </>
  );
}

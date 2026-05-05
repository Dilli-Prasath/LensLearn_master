/**
 * ExplanationPage — Shows AI explanation after a scan.
 * Reads all state from the scan store. No prop drilling.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ExplanationView from '../components/ExplanationView';
import { useScanStore, useSettingsStore, useHistoryStore, useAccessibilityStore } from '../store';
import speechService from '../services/speechService';
import { announce } from '../components/accessibility/ScreenReaderAnnouncer';

import Button from '../lib/components/Button';
import { ArrowLeft } from 'lucide-react';

// Back button
function BackButton({ onClick, label = 'Back' }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <Button variant="secondary" icon={ArrowLeft} onClick={onClick} style={{ fontSize: 13 }}>
        {label}
      </Button>
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
  const autoRead = useAccessibilityStore((s) => s.autoReadExplanations);
  const speechRate = useAccessibilityStore((s) => s.speechRate);
  const prevStreamingRef = useRef(isStreaming);

  // Auto-read explanation for blind users when streaming finishes
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming && explanation && autoRead) {
      announce('Explanation ready. Reading aloud.');
      speechService.speak(explanation, { language: settings.language, rate: speechRate });
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, explanation, autoRead, settings.language, speechRate]);

  // Announce streaming status
  useEffect(() => {
    if (isStreaming) announce('Generating explanation, please wait...');
  }, [isStreaming]);

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

  const handleSave = useCallback(async () => {
    if (capturedImage && explanation) {
      try {
        await saveSession({
          image: capturedImage,
          explanation,
          subject: settings.subject,
          language: settings.language,
          quiz: useScanStore.getState().quiz,
        });
      } catch (err) {
        console.warn('Failed to save session:', err);
      }
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

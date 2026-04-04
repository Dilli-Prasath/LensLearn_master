import { useState, useEffect, useCallback, lazy, Suspense, memo } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import { useCamera } from './hooks/useCamera';
import { useLocalStorage } from './hooks/useLocalStorage';
import ollamaService from './services/ollamaService';
import historyService from './services/historyService';
import { device, adaptiveSettings } from './utils/performance';
import { applyCustomization } from './utils/themes';

// Lazy-load all heavy views — only loaded when user navigates to them
const CameraCapture = lazy(() => import('./components/CameraCapture'));
const ExplanationView = lazy(() => import('./components/ExplanationView'));
const QuizView = lazy(() => import('./components/QuizView'));
const FlashcardView = lazy(() => import('./components/FlashcardView'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const InstallPrompt = lazy(() => import('./components/InstallPrompt'));
const HomePage = lazy(() => import('./pages/HomePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'));

const DEFAULT_SETTINGS = {
  language: 'English',
  gradeLevel: 'middle school (ages 11-13)',
  subject: 'auto-detect',
  textSize: 'medium',
  highContrast: false,
  reduceAnimations: false,
};

// Loading fallback with animated dots
const LoadingFallback = memo(() => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 48, flexDirection: 'column' }}>
    <div style={{ display: 'flex', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '150ms' }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)', animation: 'dotBounce 1.2s ease-in-out infinite', animationDelay: '300ms' }} />
    </div>
    <span style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Loading...</span>
  </div>
));
LoadingFallback.displayName = 'LoadingFallback';

// Memoized back button to avoid re-renders
const BackButton = memo(({ onClick, label = 'Back' }) => (
  <div style={styles.topBar}>
    <button className="btn btn-secondary" onClick={onClick} style={{ fontSize: 13 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </button>
  </div>
));
BackButton.displayName = 'BackButton';

export default function App() {
  const camera = useCamera();
  const [settings, setSettings] = useLocalStorage('lenslearn-settings', DEFAULT_SETTINGS);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('lenslearn-onboarded');
  });

  // Tab navigation
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState('main');

  // App state
  const [explanation, setExplanation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [flashcards, setFlashcards] = useState(null);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [selectedHistorySession, setSelectedHistorySession] = useState(null);

  // Check Ollama connection on mount and periodically
  useEffect(() => {
    const check = async () => {
      const status = await ollamaService.checkConnection();
      setConnectionStatus(status);
    };
    check();
    // Low-end: check less often (60s vs 30s)
    const interval = setInterval(check, device.tier === 'low' ? 60000 : 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = useCallback(async () => {
    const status = await ollamaService.checkConnection();
    setConnectionStatus(status);
  }, []);

  // Stop camera when switching away from scan tab
  useEffect(() => {
    if (activeTab !== 'scan') {
      camera.stopCamera();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Apply theme & customization
  useEffect(() => {
    applyCustomization({
      theme: settings.theme || 'dark',
      accentColor: settings.accentColor || 'indigo',
      font: settings.font || 'inter',
      borderRadius: settings.borderRadius || 'medium',
      layoutWidth: settings.layoutWidth || 'wide',
    });
  }, [settings.theme, settings.accentColor, settings.font, settings.borderRadius, settings.layoutWidth]);

  // Apply accessibility settings
  useEffect(() => {
    document.body.dataset.textSize = settings.textSize || 'medium';
    document.body.dataset.highContrast = settings.highContrast ? 'true' : 'false';
    document.body.dataset.reduceAnimations = settings.reduceAnimations ? 'true' : 'false';
    // Also disable animations on low-end
    if (!adaptiveSettings.enableAnimations) {
      document.body.dataset.reduceAnimations = 'true';
    }
  }, [settings.textSize, settings.highContrast, settings.reduceAnimations]);

  // Main explain function
  const handleExplain = useCallback(async () => {
    if (!camera.imageBase64 && !camera.documentContent) return;

    setIsProcessing(true);
    setIsStreaming(true);
    setExplanation('');
    setView('explanation');

    try {
      let explainContent;

      if (camera.documentContent) {
        setExplanation('*Analyzing your document...*');
        explainContent = camera.documentContent;
      } else {
        setExplanation('*Analyzing your image...*');
        explainContent = { images: [camera.imageBase64] };
      }

      await ollamaService.explain(explainContent, {
        language: settings.language,
        gradeLevel: settings.gradeLevel,
        subject: settings.subject,
        onStream: (fullText) => {
          setExplanation(fullText);
        }
      });
    } catch (err) {
      setExplanation(
        `**Connection Error**\n\nCouldn't reach the AI model. Please make sure:\n\n1. Ollama is running on your computer\n2. Run: \`ollama pull gemma4:e4b\`\n3. Start Ollama: \`OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve\`\n4. Start dev server with: \`NO_PROXY=127.0.0.1,localhost npx vite --host\`\n\n*Error: ${err.message}*`
      );
    }
    setIsStreaming(false);
    setIsProcessing(false);
  }, [camera.imageBase64, camera.documentContent, settings]);

  const handleRetry = useCallback(() => {
    handleExplain();
  }, [handleExplain]);

  const handleAbort = useCallback(() => {
    ollamaService.abort();
    setIsStreaming(false);
    setIsProcessing(false);
  }, []);

  const handleDeepDive = useCallback(async () => {
    setIsStreaming(true);
    setExplanation('');
    try {
      await ollamaService.deepDive(explanation, {
        language: settings.language,
        onStream: (fullText) => setExplanation(fullText)
      });
    } catch (err) {
      console.error('Deep dive failed:', err);
    }
    setIsStreaming(false);
  }, [explanation, settings.language]);

  const handleExtractKeyTerms = useCallback(async () => {
    try {
      return await ollamaService.extractKeyTerms(explanation, {
        language: settings.language
      });
    } catch (err) {
      console.error('Extract key terms failed:', err);
      return { terms: [] };
    }
  }, [explanation, settings.language]);

  const handleSaveSession = useCallback(() => {
    if (camera.capturedImage && explanation) {
      historyService.saveSession(
        camera.capturedImage,
        explanation,
        settings.subject,
        settings.language,
        quiz
      );
    }
  }, [camera.capturedImage, explanation, settings, quiz]);

  const handleGenerateQuiz = useCallback(async () => {
    setQuizLoading(true);
    try {
      const quizData = await ollamaService.generateQuiz(explanation, {
        language: settings.language,
        difficulty: 'medium',
        numQuestions: 4
      });
      if (quizData.questions.length > 0) {
        setQuiz(quizData);
        setView('quiz');
      }
    } catch (err) {
      console.error('Quiz generation failed:', err);
    }
    setQuizLoading(false);
  }, [explanation, settings.language]);

  const handleGenerateFlashcards = useCallback(async () => {
    setFlashcardsLoading(true);
    try {
      const flashcardData = await ollamaService.generateFlashcards(explanation, {
        language: settings.language
      });
      if (flashcardData.flashcards.length > 0) {
        setFlashcards(flashcardData.flashcards);
        setView('flashcards');
      }
    } catch (err) {
      console.error('Flashcard generation failed:', err);
    }
    setFlashcardsLoading(false);
  }, [explanation, settings.language]);

  const handleSimplify = useCallback(async () => {
    setIsStreaming(true);
    setExplanation('');
    try {
      await ollamaService.simplify(explanation, {
        language: settings.language,
        level: 'simpler, using everyday language and fun analogies',
        onStream: (fullText) => setExplanation(fullText)
      });
    } catch (err) {
      console.error('Simplify failed:', err);
    }
    setIsStreaming(false);
  }, [explanation, settings.language]);

  const handleLanguageChange = useCallback(async (newLang) => {
    setSettings(prev => ({ ...prev, language: newLang }));
    if (explanation && newLang !== settings.language) {
      setIsStreaming(true);
      const originalExplanation = explanation;
      setExplanation('');
      try {
        await ollamaService.translate(originalExplanation, {
          language: newLang,
          onStream: (fullText) => setExplanation(fullText)
        });
      } catch (err) {
        console.error('Translation failed:', err);
        setExplanation(originalExplanation);
      }
      setIsStreaming(false);
    }
  }, [explanation, settings.language, setSettings]);

  const handleFollowUp = useCallback(async (question) => {
    return ollamaService.askFollowUp(explanation, question, {
      language: settings.language
    });
  }, [explanation, settings.language]);

  const handleImageCropped = useCallback((croppedImage) => {
    const croppedBase64 = croppedImage.split(',')[1];
    camera.setCroppedImage(croppedImage, croppedBase64);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.setCroppedImage]);

  // Reset to main view — also frees memory
  const handleNewCapture = useCallback(() => {
    camera.clearImage();
    camera.clearDocument();
    setExplanation('');
    setQuiz(null);
    setFlashcards(null);
    setView('main');
    setActiveTab('scan');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.clearImage, camera.clearDocument]);

  const handleGoHome = useCallback(() => {
    setView('main');
    setActiveTab('home');
    camera.clearImage();
    camera.clearDocument();
    setExplanation('');
    setQuiz(null);
    setFlashcards(null);
    setSelectedHistorySession(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.clearImage, camera.clearDocument]);

  const handleViewHistorySession = useCallback((session) => {
    setSelectedHistorySession(session);
    setExplanation(session.explanation);
    setView('viewHistory');
  }, []);

  const handleTabChange = useCallback((tab) => {
    if (tab === 'scan') {
      setView('main');
      setActiveTab('scan');
    } else if (tab === 'home') {
      setView('main');
      setActiveTab('home');
    } else if (tab === 'subjects') {
      setView('main');
      setActiveTab('subjects');
    } else if (tab === 'history') {
      setView('main');
      setActiveTab('history');
    } else if (tab === 'settings') {
      setView('settings');
      setActiveTab('settings');
    }
  }, []);

  // Show onboarding
  if (showOnboarding) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </Suspense>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>

      {view !== 'settings' && (
        <Header
          connectionStatus={connectionStatus}
          onHomeClick={handleGoHome}
          onReconnect={handleReconnect}
        />
      )}

      <div className="page" style={pageStyle}>
        <Suspense fallback={<LoadingFallback />}>
          {view === 'main' && activeTab === 'home' && (
            <HomePage
              onScanClick={() => setActiveTab('scan')}
              onHistoryClick={() => setActiveTab('history')}
              onQuizClick={handleGenerateQuiz}
              settings={settings}
            />
          )}

          {view === 'main' && activeTab === 'scan' && (
            <CameraCapture
              videoRef={camera.videoRef}
              capturedImage={camera.capturedImage}
              cameraActive={camera.cameraActive}
              onStartCamera={camera.startCamera}
              onStopCamera={camera.stopCamera}
              onCapturePhoto={camera.capturePhoto}
              onFileUpload={camera.handleFileUpload}
              onFlipCamera={camera.flipCamera}
              onClearImage={camera.clearImage}
              onExplain={handleExplain}
              isProcessing={isProcessing}
              onImageCropped={handleImageCropped}
              facingMode={camera.facingMode}
              onDocumentUpload={camera.handleDocumentUpload}
              onClearDocument={camera.clearDocument}
              documentContent={camera.documentContent}
            />
          )}

          {view === 'main' && activeTab === 'subjects' && (
            <SubjectsPage onScanClick={() => setActiveTab('scan')} />
          )}

          {view === 'main' && activeTab === 'history' && (
            <HistoryPage
              onViewSession={handleViewHistorySession}
              onDeleteAll={handleGoHome}
            />
          )}

          {view === 'settings' && (
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              connectionStatus={connectionStatus}
            />
          )}

          {view === 'explanation' && (
            <>
              <BackButton onClick={handleNewCapture} label="New Scan" />
              <ExplanationView
                explanation={explanation}
                isStreaming={isStreaming}
                imagePreview={camera.capturedImage}
                language={settings.language}
                onGenerateQuiz={handleGenerateQuiz}
                onGenerateFlashcards={handleGenerateFlashcards}
                onSimplify={handleSimplify}
                onAskFollowUp={handleFollowUp}
                quizLoading={quizLoading}
                flashcardsLoading={flashcardsLoading}
                onSaveSession={handleSaveSession}
                onLanguageChange={handleLanguageChange}
                onRetry={handleRetry}
                onAbort={handleAbort}
                onDeepDive={handleDeepDive}
                onExtractKeyTerms={handleExtractKeyTerms}
              />
            </>
          )}

          {view === 'quiz' && (
            <>
              <BackButton onClick={() => setView('explanation')} />
              <QuizView
                quiz={quiz}
                onClose={() => setView('explanation')}
                onRetry={handleGenerateQuiz}
              />
            </>
          )}

          {view === 'flashcards' && (
            <>
              <BackButton onClick={() => setView('explanation')} />
              <FlashcardView
                flashcards={flashcards}
                onClose={() => setView('explanation')}
              />
            </>
          )}

          {view === 'viewHistory' && (
            <>
              <BackButton onClick={handleGoHome} />
              <ExplanationView
                explanation={explanation}
                isStreaming={false}
                imagePreview={selectedHistorySession?.image}
                language={settings.language}
                onGenerateQuiz={handleGenerateQuiz}
                onGenerateFlashcards={handleGenerateFlashcards}
                onSimplify={handleSimplify}
                onAskFollowUp={handleFollowUp}
                quizLoading={quizLoading}
                flashcardsLoading={flashcardsLoading}
                onLanguageChange={handleLanguageChange}
                onRetry={handleRetry}
                onAbort={handleAbort}
                onDeepDive={handleDeepDive}
                onExtractKeyTerms={handleExtractKeyTerms}
              />
            </>
          )}
        </Suspense>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
}

// Static style objects — never recreated
const pageStyle = { paddingBottom: 80 };

const styles = {
  topBar: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
};

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CameraCapture from './components/CameraCapture';
import ExplanationView from './components/ExplanationView';
import QuizView from './components/QuizView';
import FlashcardView from './components/FlashcardView';
import SettingsPanel from './components/SettingsPanel';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import InstallPrompt from './components/InstallPrompt';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SubjectsPage from './pages/SubjectsPage';
import { useCamera } from './hooks/useCamera';
import { useLocalStorage } from './hooks/useLocalStorage';
import ollamaService from './services/ollamaService';
import historyService from './services/historyService';

const DEFAULT_SETTINGS = {
  language: 'English',
  gradeLevel: 'middle school (ages 11-13)',
  subject: 'auto-detect',
  textSize: 'medium',
  highContrast: false,
  reduceAnimations: false,
};

export default function App() {
  const camera = useCamera();
  const [settings, setSettings] = useLocalStorage('lenslearn-settings', DEFAULT_SETTINGS);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('lenslearn-onboarded');
  });

  // Tab navigation
  const [activeTab, setActiveTab] = useState('home'); // home | scan | subjects | history | settings
  const [view, setView] = useState('main'); // main | explanation | quiz | flashcards | viewHistory

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
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Stop camera when switching away from scan tab
  useEffect(() => {
    if (activeTab !== 'scan') {
      camera.stopCamera();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Apply accessibility settings to document.body
  useEffect(() => {
    document.body.dataset.textSize = settings.textSize || 'medium';
    document.body.dataset.highContrast = settings.highContrast ? 'true' : 'false';
    document.body.dataset.reduceAnimations = settings.reduceAnimations ? 'true' : 'false';
  }, [settings.textSize, settings.highContrast, settings.reduceAnimations]);

  // Main explain function
  const handleExplain = useCallback(async () => {
    if (!camera.imageBase64) return;
    setIsProcessing(true);
    setIsStreaming(true);
    setExplanation('');
    setView('explanation');

    try {
      setExplanation('*Analyzing your image... This may take 30-60 seconds for image processing.*');
      await ollamaService.explainImage(camera.imageBase64, {
        language: settings.language,
        gradeLevel: settings.gradeLevel,
        subject: settings.subject,
        onStream: (fullText) => {
          setExplanation(fullText);
        }
      });
    } catch (err) {
      setExplanation(
        `**Connection Error**\n\nCouldn't reach the AI model. Please make sure:\n\n1. Ollama is running on your computer\n2. Run: \`ollama pull gemma3:4b\`\n3. Start Ollama: \`OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve\`\n4. Start dev server with: \`NO_PROXY=127.0.0.1,localhost npx vite --host\`\n\n*Error: ${err.message}*`
      );
    }
    setIsStreaming(false);
    setIsProcessing(false);
  }, [camera.imageBase64, settings]);

  // Save session to history
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

  // Generate quiz
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

  // Generate flashcards
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

  // Simplify explanation
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

  // Handle language change from explanation view — re-translate content
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
        setExplanation(originalExplanation); // Restore original on error
      }
      setIsStreaming(false);
    }
  }, [explanation, settings.language, setSettings]);

  // Follow-up question
  const handleFollowUp = useCallback(async (question) => {
    return ollamaService.askFollowUp(explanation, question, {
      language: settings.language
    });
  }, [explanation, settings.language]);

  // Handle cropped image
  const handleImageCropped = useCallback((croppedImage) => {
    // Update the camera's captured image with the cropped version
    const croppedBase64 = croppedImage.split(',')[1];
    camera.setCroppedImage?.(croppedImage, croppedBase64);
  }, [camera]);

  // Reset to main view
  const handleNewCapture = useCallback(() => {
    camera.clearImage();
    setExplanation('');
    setQuiz(null);
    setFlashcards(null);
    setView('main');
    setActiveTab('scan');
  }, [camera]);

  // Navigate to home
  const handleGoHome = useCallback(() => {
    setView('main');
    setActiveTab('home');
    camera.clearImage();
    setExplanation('');
    setQuiz(null);
    setFlashcards(null);
  }, [camera]);

  // View history session
  const handleViewHistorySession = (session) => {
    setSelectedHistorySession(session);
    setExplanation(session.explanation);
    setView('viewHistory');
  };

  // Handle tab change
  const handleTabChange = (tab) => {
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
  };

  // Show onboarding
  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  // Main app view
  return (
    <>
      <InstallPrompt />
      {view !== 'settings' && (
        <Header
          connectionStatus={connectionStatus}
          onHomeClick={handleGoHome}
        />
      )}

      <div className="page" style={{ paddingBottom: 80 }}>
        {view === 'main' && activeTab === 'home' && (
          <HomePage
            onScanClick={() => {
              setActiveTab('scan');
            }}
            onHistoryClick={() => {
              setActiveTab('history');
            }}
            onQuizClick={handleGenerateQuiz}
          />
        )}

        {view === 'main' && activeTab === 'scan' && (
          <CameraCapture
            videoRef={camera.videoRef}
            capturedImage={camera.capturedImage}
            cameraActive={camera.cameraActive}
            onStartCamera={camera.startCamera}
            onCapturePhoto={camera.capturePhoto}
            onFileUpload={camera.handleFileUpload}
            onFlipCamera={camera.flipCamera}
            onClearImage={camera.clearImage}
            onExplain={handleExplain}
            isProcessing={isProcessing}
            onImageCropped={handleImageCropped}
            facingMode={camera.facingMode}
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
            <div style={styles.topBar}>
              <button className="btn btn-secondary" onClick={handleNewCapture} style={{ fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                New Scan
              </button>
            </div>
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
            />
          </>
        )}

        {view === 'quiz' && (
          <>
            <div style={styles.topBar}>
              <button className="btn btn-secondary" onClick={() => setView('explanation')} style={{ fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back
              </button>
            </div>
            <QuizView
              quiz={quiz}
              onClose={() => setView('explanation')}
              onRetry={handleGenerateQuiz}
            />
          </>
        )}

        {view === 'flashcards' && (
          <>
            <div style={styles.topBar}>
              <button className="btn btn-secondary" onClick={() => setView('explanation')} style={{ fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back
              </button>
            </div>
            <FlashcardView
              flashcards={flashcards}
              onClose={() => setView('explanation')}
            />
          </>
        )}

        {view === 'viewHistory' && (
          <>
            <div style={styles.topBar}>
              <button className="btn btn-secondary" onClick={handleGoHome} style={{ fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back
              </button>
            </div>
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
            />
          </>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
}

const styles = {
  topBar: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
};

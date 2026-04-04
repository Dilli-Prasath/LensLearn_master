import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CameraCapture from './components/CameraCapture';
import ExplanationView from './components/ExplanationView';
import QuizView from './components/QuizView';
import SettingsPanel from './components/SettingsPanel';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import { useCamera } from './hooks/useCamera';
import { useLocalStorage } from './hooks/useLocalStorage';
import ollamaService from './services/ollamaService';
import historyService from './services/historyService';

const DEFAULT_SETTINGS = {
  language: 'English',
  gradeLevel: 'middle school (ages 11-13)',
  subject: 'auto-detect',
};

export default function App() {
  const camera = useCamera();
  const [settings, setSettings] = useLocalStorage('lenslearn-settings', DEFAULT_SETTINGS);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('lenslearn-onboarded');
  });

  // Tab navigation
  const [activeTab, setActiveTab] = useState('home'); // home | scan | history | settings
  const [view, setView] = useState('main'); // main | explanation | quiz | viewHistory

  // App state
  const [explanation, setExplanation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
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

  // Main explain function
  const handleExplain = useCallback(async () => {
    if (!camera.imageBase64) return;
    setIsProcessing(true);
    setIsStreaming(true);
    setExplanation('');
    setView('explanation');

    try {
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
        `**Connection Error**\n\nCouldn't reach the AI model. Please make sure:\n\n1. Ollama is running on your computer\n2. You've downloaded Gemma 4: \`ollama pull gemma4:e4b\`\n3. Try refreshing the page\n\n*Error: ${err.message}*`
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

  // Follow-up question
  const handleFollowUp = useCallback(async (question) => {
    return ollamaService.askFollowUp(explanation, question, {
      language: settings.language
    });
  }, [explanation, settings.language]);

  // Reset to main view
  const handleNewCapture = useCallback(() => {
    camera.clearImage();
    setExplanation('');
    setQuiz(null);
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
      {view !== 'settings' && (
        <Header
          connectionStatus={connectionStatus}
          onHomeClick={handleGoHome}
        />
      )}

      <div className="page" style={{ paddingBottom: view === 'settings' ? 0 : 0 }}>
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
          />
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
              onSimplify={handleSimplify}
              onAskFollowUp={handleFollowUp}
              quizLoading={quizLoading}
              onSaveSession={handleSaveSession}
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
              onSimplify={handleSimplify}
              onAskFollowUp={handleFollowUp}
              quizLoading={quizLoading}
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

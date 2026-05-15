/**
 * QuizPage — Quiz route. Reads quiz data from scan store.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizView from '../components/QuizView';
import { useScanStore, useSettingsStore } from '../store';

function BackButton({ onClick }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <button className="btn btn-secondary" onClick={onClick} style={{ fontSize: 13 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>
    </div>
  );
}

export default function QuizPage() {
  const navigate = useNavigate();
  const quiz = useScanStore((s) => s.quiz);
  const generateQuiz = useScanStore((s) => s.generateQuiz);
  const quizLoading = useScanStore((s) => s.quizLoading);
  const language = useSettingsStore((s) => s.language);

  // Track quiz identity so Try Again forces a full remount (resets all local state)
  const [quizKey, setQuizKey] = useState(0);

  if (!quiz && !quizLoading) {
    navigate('/explain', { replace: true });
    return null;
  }

  const handleRetry = async () => {
    const ok = await generateQuiz(language);
    if (ok) setQuizKey(k => k + 1); // force QuizView remount
  };

  return (
    <>
      <BackButton onClick={() => navigate('/explain')} />
      {quizLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48 }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Generating new quiz...</span>
        </div>
      ) : quiz ? (
        <QuizView
          key={quizKey}
          quiz={quiz}
          onClose={() => navigate('/explain')}
          onRetry={handleRetry}
        />
      ) : null}
    </>
  );
}

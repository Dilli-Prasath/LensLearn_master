/**
 * QuizPage — Quiz route. Reads quiz data from scan store.
 */
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
  const language = useSettingsStore((s) => s.language);

  if (!quiz) {
    navigate('/explain', { replace: true });
    return null;
  }

  return (
    <>
      <BackButton onClick={() => navigate('/explain')} />
      <QuizView
        quiz={quiz}
        onClose={() => navigate('/explain')}
        onRetry={() => generateQuiz(language)}
      />
    </>
  );
}

/**
 * FlashcardsPage — Flashcard route. Reads data from scan store.
 */
import { useNavigate } from 'react-router-dom';
import FlashcardView from '../components/FlashcardView';
import { useScanStore } from '../store';

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

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const flashcards = useScanStore((s) => s.flashcards);

  if (!flashcards) {
    navigate('/explain', { replace: true });
    return null;
  }

  return (
    <>
      <BackButton onClick={() => navigate('/explain')} />
      <FlashcardView
        flashcards={flashcards}
        onClose={() => navigate('/explain')}
      />
    </>
  );
}

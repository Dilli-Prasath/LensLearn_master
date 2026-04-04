/**
 * HistoryDetailPage — View a past session's explanation.
 * Loads session from history store by URL param, pushes to scan store.
 */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScanStore, useHistoryStore } from '../store';
import ExplanationPage from './ExplanationPage';

export default function HistoryDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const sessions = useHistoryStore((s) => s.sessions);
  const viewSession = useScanStore((s) => s.viewSession);

  useEffect(() => {
    const session = sessions.find(s => String(s.id) === sessionId);
    if (session) {
      viewSession(session);
    } else {
      navigate('/history', { replace: true });
    }
  }, [sessionId, sessions, viewSession, navigate]);

  return <ExplanationPage />;
}

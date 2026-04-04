/**
 * SubjectDetailPage — Individual subject deep-dive (future).
 * Will show: mastery level, all sessions for this subject,
 * weak areas, recommended practice, AI tutor chat.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useHistoryStore } from '../store';

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const sessions = useHistoryStore((s) => s.getSessionsBySubject(subjectId));

  return (
    <div style={{ padding: '20px clamp(16px, 4vw, 32px) 100px', maxWidth: 'var(--layout-max-width, 1200px)', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/subjects')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', marginBottom: 20, fontSize: 13 }}
      >
        <ArrowLeft size={16} /> Back to Subjects
      </button>

      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen size={36} color="var(--primary-light)" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'capitalize' }}>
          {subjectId}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          {sessions.length} scan{sessions.length !== 1 ? 's' : ''} recorded
        </p>
        <div style={{
          padding: 24, borderRadius: 'var(--radius)', background: 'rgba(30,41,59,0.4)',
          border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: 14,
        }}>
          Detailed subject analytics, mastery tracking, and AI tutor coming soon.
        </div>
      </div>
    </div>
  );
}

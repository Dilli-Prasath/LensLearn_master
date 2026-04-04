/**
 * StudyPlanPage — AI-powered study planner (future).
 * Will show: personalized study schedule, topic recommendations,
 * spaced repetition calendar, progress tracking.
 */
import { Calendar } from 'lucide-react';

export default function StudyPlanPage() {
  return (
    <div style={{ padding: '20px clamp(16px, 4vw, 32px) 100px', maxWidth: 'var(--layout-max-width, 1200px)', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Calendar size={44} color="#10b981" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Study Planner
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 300, margin: '0 auto' }}>
          AI-generated study schedules with spaced repetition. Coming soon!
        </p>
      </div>
    </div>
  );
}

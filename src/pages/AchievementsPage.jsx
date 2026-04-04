/**
 * AchievementsPage — Gamification / badges (future).
 * Will show: badges earned, progress bars, leaderboard, challenges.
 */
import { Trophy } from 'lucide-react';

export default function AchievementsPage() {
  return (
    <div style={{ padding: '20px clamp(16px, 4vw, 32px) 100px', maxWidth: 'var(--layout-max-width, 1200px)', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trophy size={44} color="#f59e0b" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Achievements
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 300, margin: '0 auto' }}>
          Earn badges, track milestones, and compete with friends. Coming soon!
        </p>
      </div>
    </div>
  );
}

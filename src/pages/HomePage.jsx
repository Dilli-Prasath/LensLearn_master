import { TrendingUp, BookOpen, Languages, Flame, ArrowRight } from 'lucide-react';
import historyService from '../services/historyService';

const QUOTES = [
  'Every expert was once a beginner.',
  'Knowledge is power.',
  'Progress, not perfection.',
  'Learn something new every day.',
  'Your potential is limitless.',
];

export default function HomePage({ onScanClick, onHistoryClick, onQuizClick }) {
  const stats = historyService.getStats();
  const recentSessions = historyService.getSessions().slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div style={styles.container}>
      {/* Header Greeting */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.greeting}>
            {getGreeting()}, Student! 👋
          </h1>
          <p style={styles.subGreeting}>Ready to learn something new?</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={TrendingUp}
          label="Total Scans"
          value={stats.totalScans}
          color="#6366f1"
        />
        <StatCard
          icon={BookOpen}
          label="Quiz Score"
          value={`${stats.avgQuizScore}%`}
          color="#f59e0b"
        />
        <StatCard
          icon={Languages}
          label="Languages"
          value={stats.languagesUsed}
          color="#10b981"
        />
        <StatCard
          icon={Flame}
          label="Study Streak"
          value={`${stats.studyStreak}d`}
          color="#ef4444"
        />
      </div>

      {/* Quick Action Buttons */}
      <div style={styles.actionSection}>
        <button style={styles.actionBtn} onClick={onScanClick}>
          <div style={styles.actionBtnIcon}>📸</div>
          <div>
            <div style={styles.actionBtnLabel}>Scan Page</div>
            <div style={styles.actionBtnSubtitle}>Photograph & analyze</div>
          </div>
          <ArrowRight size={20} />
        </button>

        {stats.avgQuizScore > 0 && (
          <button style={styles.actionBtn} onClick={onQuizClick}>
            <div style={styles.actionBtnIcon}>🧠</div>
            <div>
              <div style={styles.actionBtnLabel}>Review Quiz</div>
              <div style={styles.actionBtnSubtitle}>Test your knowledge</div>
            </div>
            <ArrowRight size={20} />
          </button>
        )}

        {recentSessions.length > 0 && (
          <button style={styles.actionBtn} onClick={onHistoryClick}>
            <div style={styles.actionBtnIcon}>📚</div>
            <div>
              <div style={styles.actionBtnLabel}>Continue Learning</div>
              <div style={styles.actionBtnSubtitle}>View your history</div>
            </div>
            <ArrowRight size={20} />
          </button>
        )}
      </div>

      {/* Recent Scans */}
      {recentSessions.length > 0 && (
        <div style={styles.recentSection}>
          <h2 style={styles.sectionTitle}>Recent Scans</h2>
          <div style={styles.recentList}>
            {recentSessions.map(session => (
              <div key={session.id} style={styles.recentItem}>
                <img
                  src={session.image}
                  alt={session.subject}
                  style={styles.recentImage}
                />
                <div style={styles.recentInfo}>
                  <div style={styles.recentSubject}>{session.subject}</div>
                  <div style={styles.recentDate}>
                    {new Date(session.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Quote */}
      <div style={styles.quoteCard}>
        <p style={styles.quoteText}>"{quote}"</p>
        <div style={styles.quoteDot} />
      </div>

      {/* Bottom Padding for Nav */}
      <div style={styles.navPadding} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={styles.statCard} className="card">
      <div style={{ ...styles.statIcon, color }}>
        <Icon size={24} />
      </div>
      <div style={styles.statContent}>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 16px 100px',
    maxWidth: 480,
    margin: '0 auto',
  },
  header: {
    marginBottom: 32,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: 'var(--text-secondary)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(99, 102, 241, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 32,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
    color: 'var(--text-primary)',
  },
  actionBtnIcon: {
    fontSize: 32,
  },
  actionBtnLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 2,
  },
  actionBtnSubtitle: {
    fontSize: 12,
    color: 'var(--text-secondary)',
  },
  recentSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 12,
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  recentItem: {
    display: 'flex',
    gap: 12,
    padding: 12,
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  recentImage: {
    width: 80,
    height: 80,
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
    background: '#000',
  },
  recentInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  recentSubject: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  quoteCard: {
    position: 'relative',
    padding: 20,
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1))',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    borderRadius: 'var(--radius)',
    textAlign: 'center',
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'var(--text-primary)',
    lineHeight: 1.6,
  },
  quoteDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'var(--primary-light)',
    margin: '12px auto 0',
  },
  navPadding: {
    height: 20,
  },
};

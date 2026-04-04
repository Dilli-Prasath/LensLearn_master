import { TrendingUp, BookOpen, Languages, Flame, ArrowRight, Target, Trophy, Sparkles, Clock, Zap, Star } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import historyService from '../services/historyService';

const QUOTES = [
  'Every expert was once a beginner.',
  'Knowledge is power.',
  'Progress, not perfection.',
  'Learn something new every day.',
  'Your potential is limitless.',
  'The best time to learn is now.',
  'Small steps lead to big results.',
];

const STUDY_TIPS = [
  { icon: '🎯', title: 'Active Recall', tip: 'Test yourself instead of re-reading. Use the Quiz feature after each scan.' },
  { icon: '🔄', title: 'Spaced Repetition', tip: 'Review flashcards at increasing intervals for long-term memory.' },
  { icon: '📝', title: 'Teach It Back', tip: 'Try explaining the concept in your own words using the chat feature.' },
  { icon: '🧩', title: 'Connect Ideas', tip: 'Link new concepts to things you already know for deeper understanding.' },
];

const QUICK_SUBJECTS = [
  { name: 'Math', icon: '📐', color: '#6366f1' },
  { name: 'Science', icon: '🔬', color: '#10b981' },
  { name: 'History', icon: '📖', color: '#f59e0b' },
  { name: 'English', icon: '✍️', color: '#ef4444' },
  { name: 'Biology', icon: '🧬', color: '#06b6d4' },
  { name: 'Chemistry', icon: '⚗️', color: '#8b5cf6' },
];

const ACHIEVEMENTS = [
  { id: 'first_scan', icon: '📸', title: 'First Scan', desc: 'Complete your first scan', threshold: 1 },
  { id: 'five_scans', icon: '🔥', title: 'Getting Started', desc: 'Complete 5 scans', threshold: 5 },
  { id: 'ten_scans', icon: '⭐', title: 'Scholar', desc: 'Complete 10 scans', threshold: 10 },
  { id: 'quiz_master', icon: '🧠', title: 'Quiz Master', desc: 'Score 80%+ on a quiz', threshold: 80 },
];

const DAILY_GOAL = 3; // scans per day

export default function HomePage({ onScanClick, onHistoryClick, onQuizClick }) {
  const stats = historyService.getStats();
  const recentSessions = historyService.getSessions().slice(0, 3);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % STUDY_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  // Daily progress
  const todayScans = useMemo(() => {
    const today = new Date().toDateString();
    return historyService.getSessions().filter(s =>
      new Date(s.timestamp).toDateString() === today
    ).length;
  }, []);
  const dailyProgress = Math.min(todayScans / DAILY_GOAL, 1);

  // Achievements
  const earnedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(a => {
      if (a.id === 'quiz_master') return stats.avgQuizScore >= a.threshold;
      return stats.totalScans >= a.threshold;
    });
  }, [stats]);

  return (
    <div style={st.container}>
      {/* Header Greeting */}
      <div style={st.header} className="slide-up">
        <h1 style={st.greeting}>{getGreeting()}! 👋</h1>
        <p style={st.subGreeting}>Ready to learn something new?</p>
      </div>

      {/* Daily Goal Progress */}
      <div style={st.dailyGoal} className="pop-in">
        <div style={st.dailyGoalHeader}>
          <div style={st.dailyGoalLeft}>
            <Target size={18} color="var(--accent)" />
            <span style={st.dailyGoalTitle}>Daily Goal</span>
          </div>
          <span style={st.dailyGoalCount}>{todayScans}/{DAILY_GOAL} scans</span>
        </div>
        <div style={st.progressTrack}>
          <div style={{ ...st.progressFill, width: `${dailyProgress * 100}%` }} />
        </div>
        {dailyProgress >= 1 && (
          <div style={st.goalComplete} className="bounce-in">
            <Trophy size={14} color="var(--accent)" />
            <span>Daily goal completed!</span>
          </div>
        )}
      </div>

      {/* Quick Actions — Primary CTAs */}
      <div style={st.quickActions} className="stagger-children">
        <button style={st.primaryAction} className="hover-lift" onClick={onScanClick}>
          <div style={st.primaryActionIcon}>
            <Camera size={24} />
          </div>
          <div style={st.primaryActionText}>
            <span style={st.primaryActionLabel}>Scan Page</span>
            <span style={st.primaryActionSub}>Photograph & analyze</span>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" />
        </button>

        {stats.totalScans > 0 && (
          <button style={st.secondaryAction} className="hover-lift" onClick={onHistoryClick}>
            <Clock size={20} color="var(--primary-light)" />
            <span style={st.secondaryActionLabel}>Continue Learning</span>
            <ArrowRight size={16} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div style={st.statsGrid} className="stagger-children">
        <StatCard icon={TrendingUp} label="Total Scans" value={stats.totalScans} color="#6366f1" />
        <StatCard icon={Flame} label="Streak" value={`${stats.studyStreak}d`} color="#ef4444" />
        <StatCard icon={BookOpen} label="Quiz Score" value={`${stats.avgQuizScore}%`} color="#f59e0b" />
        <StatCard icon={Languages} label="Languages" value={stats.languagesUsed} color="#10b981" />
      </div>

      {/* Achievements */}
      {earnedAchievements.length > 0 && (
        <div style={st.section} className="fade-in">
          <div style={st.sectionHeader}>
            <h2 style={st.sectionTitle}><Trophy size={16} /> Achievements</h2>
            <span style={st.sectionBadge}>{earnedAchievements.length}/{ACHIEVEMENTS.length}</span>
          </div>
          <div style={st.achievementRow} className="stagger-children">
            {earnedAchievements.map(a => (
              <div key={a.id} style={st.achievementCard}>
                <span style={st.achievementIcon}>{a.icon}</span>
                <span style={st.achievementTitle}>{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Tips Carousel */}
      <div style={st.section} className="fade-in">
        <h2 style={st.sectionTitle}><Zap size={16} /> Study Tips</h2>
        <div style={st.tipCard} className="slide-in-left" key={currentTipIndex}>
          <div style={st.tipIcon}>{STUDY_TIPS[currentTipIndex].icon}</div>
          <div style={st.tipContent}>
            <div style={st.tipTitle}>{STUDY_TIPS[currentTipIndex].title}</div>
            <div style={st.tipText}>{STUDY_TIPS[currentTipIndex].tip}</div>
          </div>
        </div>
        <div style={st.tipDots}>
          {STUDY_TIPS.map((_, idx) => (
            <div key={idx} style={{ ...st.tipDot, ...(idx === currentTipIndex ? st.tipDotActive : {}) }} />
          ))}
        </div>
      </div>

      {/* Quick Subjects */}
      <div style={st.section} className="fade-in">
        <h2 style={st.sectionTitle}><Star size={16} /> Quick Subjects</h2>
        <div style={st.subjectGrid} className="stagger-children">
          {QUICK_SUBJECTS.map(subject => (
            <button key={subject.name} style={st.subjectBtn} className="hover-lift" onClick={onScanClick}>
              <div style={st.subjectIcon}>{subject.icon}</div>
              <div style={st.subjectName}>{subject.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      {recentSessions.length > 0 && (
        <div style={st.section} className="fade-in">
          <div style={st.sectionHeader}>
            <h2 style={st.sectionTitle}><Clock size={16} /> Recent Scans</h2>
            <button style={st.viewAllBtn} onClick={onHistoryClick}>View all <ArrowRight size={14} /></button>
          </div>
          <div style={st.recentList} className="stagger-children">
            {recentSessions.map(session => (
              <div key={session.id} style={st.recentItem} className="hover-lift" onClick={onHistoryClick}>
                <img src={session.image} alt={session.subject} style={st.recentImage} loading="lazy" />
                <div style={st.recentInfo}>
                  <div style={st.recentSubject}>{session.subject}</div>
                  <div style={st.recentDate}>
                    {new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Quote */}
      <div style={st.quoteCard} className="fade-in">
        <Sparkles size={16} color="var(--primary-light)" style={{ marginBottom: 8 }} />
        <p style={st.quoteText}>"{quote}"</p>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}

// Inline Camera icon for the quick action (avoids importing from lucide twice with different sizes)
function Camera({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={st.statCard} className="card">
      <div style={{ ...st.statIcon, color, background: `${color}15` }}>
        <Icon size={20} />
      </div>
      <div style={st.statValue}>{value}</div>
      <div style={st.statLabel}>{label}</div>
    </div>
  );
}

const st = {
  container: { padding: '20px 16px 100px', maxWidth: 960, margin: '0 auto', width: '100%' },
  header: { marginBottom: 24, paddingTop: 4 },
  greeting: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.2 },
  subGreeting: { fontSize: 14, color: 'var(--text-secondary)' },

  // Daily goal
  dailyGoal: {
    padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', marginBottom: 20,
  },
  dailyGoalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  dailyGoalLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  dailyGoalTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  dailyGoalCount: { fontSize: 13, fontWeight: 600, color: 'var(--accent)' },
  progressTrack: { height: 6, background: 'var(--bg-dark)', borderRadius: 3, overflow: 'hidden' },
  progressFill: {
    height: '100%', borderRadius: 3,
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  goalComplete: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
    fontSize: 12, fontWeight: 600, color: 'var(--accent)',
  },

  // Quick actions
  quickActions: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  primaryAction: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))',
    border: '1.5px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-lg)',
    cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit', textAlign: 'left',
    transition: 'all 0.2s',
  },
  primaryActionIcon: {
    width: 48, height: 48, borderRadius: 'var(--radius)', background: 'var(--primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0,
  },
  primaryActionText: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  primaryActionLabel: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' },
  primaryActionSub: { fontSize: 12, color: 'var(--text-muted)' },
  secondaryAction: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit', textAlign: 'left',
    transition: 'all 0.2s',
  },
  secondaryActionLabel: { flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },

  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 },
  statCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px',
    textAlign: 'center',
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0, marginBottom: 12 },
  sectionBadge: {
    fontSize: 11, fontWeight: 700, color: 'var(--primary-light)', background: 'rgba(99,102,241,0.1)',
    padding: '3px 8px', borderRadius: 10,
  },
  viewAllBtn: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
    color: 'var(--primary-light)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },

  // Achievements
  achievementRow: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 },
  achievementCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', minWidth: 80, flexShrink: 0,
  },
  achievementIcon: { fontSize: 24 },
  achievementTitle: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', whiteSpace: 'nowrap' },

  // Tips
  tipCard: {
    display: 'flex', gap: 14, padding: 16,
    background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(99,102,241,0.05))',
    border: '1px solid rgba(168,85,247,0.15)', borderRadius: 'var(--radius)', marginBottom: 10,
  },
  tipIcon: { fontSize: 28, flexShrink: 0 },
  tipContent: { display: 'flex', flexDirection: 'column', gap: 4 },
  tipTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  tipText: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 },
  tipDots: { display: 'flex', gap: 6, justifyContent: 'center' },
  tipDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--border)', transition: 'all 0.3s' },
  tipDotActive: { background: 'var(--primary-light)', width: 18, borderRadius: 3 },

  // Subjects
  subjectGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  subjectBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 14,
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', color: 'inherit',
  },
  subjectIcon: { fontSize: 26 },
  subjectName: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' },

  // Recent
  recentList: { display: 'flex', flexDirection: 'column', gap: 8 },
  recentItem: {
    display: 'flex', gap: 12, padding: 12, background: 'var(--bg-card)',
    borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
  },
  recentImage: { width: 56, height: 56, borderRadius: 'var(--radius-sm)', objectFit: 'cover', background: '#000', flexShrink: 0 },
  recentInfo: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  recentSubject: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 },
  recentDate: { fontSize: 12, color: 'var(--text-muted)' },

  // Quote
  quoteCard: {
    padding: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.06))',
    border: '1px solid rgba(168,85,247,0.15)', borderRadius: 'var(--radius-lg)', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  quoteText: { fontSize: 14, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 },
};

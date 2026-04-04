import { TrendingUp, BookOpen, Languages, Flame, ArrowRight, Target, Trophy, Sparkles, Clock, Zap, Star, ChevronRight, Layers } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore, useSettingsStore } from '../store';

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

export default function HomePage() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const getStats = useHistoryStore((s) => s.getStats);
  const getRecent = useHistoryStore((s) => s.getRecent);
  const DAILY_GOAL = settings.dailyGoal || 3;
  const stats = getStats();
  const recentSessions = getRecent(3);

  // Router-based navigation callbacks
  const onScanClick = () => navigate('/scan');
  const onHistoryClick = () => navigate('/history');
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

  const todayScans = stats.todayScans;
  const dailyProgress = Math.min(todayScans / DAILY_GOAL, 1);

  const earnedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(a => {
      if (a.id === 'quiz_master') return stats.avgQuizScore >= a.threshold;
      return stats.totalScans >= a.threshold;
    });
  }, [stats]);

  return (
    <div style={st.container} className="mesh-bg">
      {/* Decorative blobs */}
      <div style={st.blobOne} className="morph-blob" />
      <div style={st.blobTwo} className="morph-blob" />

      {/* Hero Greeting */}
      <div style={st.hero} className="slide-up">
        <div style={st.greetingRow}>
          <div>
            <h1 style={st.greeting} className="gradient-text">{getGreeting()}!</h1>
            <p style={st.subGreeting}>Ready to learn something new?</p>
          </div>
          <div style={st.heroOrb} className="float">
            <Sparkles size={22} color="var(--primary-light)" />
          </div>
        </div>
      </div>

      {/* Daily Goal — Glass Card */}
      <div style={st.dailyGoal} className="glass-card pop-in">
        <div style={st.dailyGoalHeader}>
          <div style={st.dailyGoalLeft}>
            <div style={st.goalIconWrap}>
              <Target size={16} color="white" />
            </div>
            <span style={st.dailyGoalTitle}>Daily Goal</span>
          </div>
          <span style={st.dailyGoalCount}>{todayScans}/{DAILY_GOAL}</span>
        </div>
        <div style={st.progressTrack}>
          <div style={{ ...st.progressFill, width: `${dailyProgress * 100}%` }} />
          {/* Animated glow dot at the end of progress */}
          {dailyProgress > 0 && dailyProgress < 1 && (
            <div style={{ ...st.progressDot, left: `${dailyProgress * 100}%` }} />
          )}
        </div>
        {dailyProgress >= 1 && (
          <div style={st.goalComplete} className="bounce-in">
            <Trophy size={14} color="var(--accent)" />
            <span>Goal crushed!</span>
          </div>
        )}
      </div>

      {/* Primary CTA — Scan Button with Glow */}
      <button style={st.scanCTA} className="glow-border hover-lift" onClick={onScanClick}>
        <div style={st.scanCTAInner}>
          <div style={st.scanCTAIconWrap}>
            <div style={st.scanCTAOrbit} className="orbit-ring" />
            <Camera size={26} />
          </div>
          <div style={st.scanCTAText}>
            <span style={st.scanCTALabel}>Scan & Learn</span>
            <span style={st.scanCTASub}>Point your camera at any textbook page</span>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" />
        </div>
      </button>

      {stats.totalScans > 0 && (
        <button style={st.continueCTA} className="hover-lift" onClick={onHistoryClick}>
          <Clock size={18} color="var(--primary-light)" />
          <span style={st.continueCTALabel}>Continue where you left off</span>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>
      )}

      {/* Stats — Bento Grid */}
      <div style={st.statsGrid} className="responsive-grid-2 stagger-children">
        <BentoStat icon={TrendingUp} label="Scans" value={stats.totalScans} color="#6366f1" size="large" />
        <BentoStat icon={Flame} label="Streak" value={`${stats.studyStreak}d`} color="#ef4444" />
        <BentoStat icon={BookOpen} label="Quiz Avg" value={`${stats.avgQuizScore}%`} color="#f59e0b" />
        <BentoStat icon={Languages} label="Languages" value={stats.languagesUsed} color="#10b981" />
      </div>

      {/* Achievements — Horizontal Scroll with Gradient Edge */}
      {earnedAchievements.length > 0 && (
        <div style={st.section} className="fade-in">
          <div style={st.sectionHeader}>
            <h2 style={st.sectionTitle}><Trophy size={16} /> Achievements</h2>
            <span className="gradient-badge">{earnedAchievements.length}/{ACHIEVEMENTS.length}</span>
          </div>
          <div style={st.achievementScroll}>
            <div style={st.achievementRow} className="stagger-children">
              {earnedAchievements.map(a => (
                <div key={a.id} style={st.achievementCard} className="glass-card">
                  <span style={st.achievementIcon}>{a.icon}</span>
                  <span style={st.achievementTitle}>{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Study Tips — Carousel with Morph Background */}
      {settings.showTips !== false && (
        <div style={st.section} className="fade-in">
          <h2 style={st.sectionTitle}><Zap size={16} /> Study Tips</h2>
          <div style={st.tipCard} className="glass-card" key={currentTipIndex}>
            <div style={st.tipIconCircle}>
              <span style={st.tipIcon}>{STUDY_TIPS[currentTipIndex].icon}</span>
            </div>
            <div style={st.tipContent}>
              <div style={st.tipTitle}>{STUDY_TIPS[currentTipIndex].title}</div>
              <div style={st.tipText}>{STUDY_TIPS[currentTipIndex].tip}</div>
            </div>
          </div>
          <div style={st.tipDots}>
            {STUDY_TIPS.map((_, idx) => (
              <div
                key={idx}
                style={{
                  ...st.tipDot,
                  ...(idx === currentTipIndex ? st.tipDotActive : {}),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Subjects — Hexagonal-Inspired Grid */}
      <div style={st.section} className="fade-in">
        <h2 style={st.sectionTitle}><Star size={16} /> Quick Subjects</h2>
        <div style={st.subjectGrid} className="responsive-grid-3 stagger-children">
          {QUICK_SUBJECTS.map(subject => (
            <button key={subject.name} style={st.subjectBtn} className="hover-lift" onClick={onScanClick}>
              <div style={{ ...st.subjectIconBg, background: `${subject.color}15`, borderColor: `${subject.color}30` }}>
                <span style={st.subjectIcon}>{subject.icon}</span>
              </div>
              <div style={st.subjectName}>{subject.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Scans — Cards with Image Overlay */}
      {recentSessions.length > 0 && (
        <div style={st.section} className="fade-in">
          <div style={st.sectionHeader}>
            <h2 style={st.sectionTitle}><Clock size={16} /> Recent</h2>
            <button style={st.viewAllBtn} onClick={onHistoryClick}>View all <ArrowRight size={14} /></button>
          </div>
          <div style={st.recentList} className="stagger-children">
            {recentSessions.map(session => (
              <div key={session.id} style={st.recentItem} className="glass-card hover-lift" onClick={onHistoryClick}>
                <div style={st.recentImageWrap}>
                  <img src={session.image} alt={session.subject} style={st.recentImage} loading="lazy" />
                  <div style={st.recentImageOverlay} />
                </div>
                <div style={st.recentInfo}>
                  <div style={st.recentSubject}>{session.subject}</div>
                  <div style={st.recentDate}>
                    {new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Quote — Elegant Glass */}
      <div style={st.quoteCard} className="glass-card fade-in">
        <div style={st.quoteMark}>"</div>
        <p style={st.quoteText} className="shimmer-text">{quote}</p>
        <div style={st.quoteAttr}>
          <Sparkles size={12} color="var(--primary-light)" />
          <span style={st.quoteLabel}>Daily Inspiration</span>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

function Camera({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function BentoStat({ icon: Icon, label, value, color, size = 'normal' }) {
  const isLarge = size === 'large';
  return (
    <div
      style={{
        ...st.bentoCard,
        ...(isLarge ? st.bentoLarge : {}),
      }}
      className="glass-card"
    >
      <div style={{ ...st.bentoIcon, color, background: `${color}18` }}>
        <Icon size={isLarge ? 22 : 18} />
      </div>
      <div style={{ ...st.bentoValue, fontSize: isLarge ? 28 : 20 }}>{value}</div>
      <div style={st.bentoLabel}>{label}</div>
    </div>
  );
}

const st = {
  container: {
    padding: '16px 24px 100px',
    maxWidth: 'var(--layout-max-width, 1200px)',
    margin: '0 auto',
    width: '100%',
    position: 'relative',
  },

  // Decorative blobs
  blobOne: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  blobTwo: {
    position: 'absolute',
    top: 300,
    left: -50,
    width: 160,
    height: 160,
    background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },

  // Hero
  hero: { marginBottom: 20, paddingTop: 4, position: 'relative', zIndex: 1 },
  greetingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 4,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  subGreeting: { fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 },
  heroOrb: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
    border: '1px solid rgba(99,102,241,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Daily goal
  dailyGoal: {
    padding: 16,
    borderRadius: 'var(--radius-lg)',
    marginBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  dailyGoalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  dailyGoalLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  goalIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyGoalTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  dailyGoalCount: { fontSize: 22, fontWeight: 800, color: 'var(--primary-light)' },
  progressTrack: {
    height: 8,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    background: 'linear-gradient(90deg, var(--primary-dark), var(--primary), var(--primary-light))',
    backgroundSize: '200% 100%',
    animation: 'gradientShift 3s ease infinite',
    transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  progressDot: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'var(--primary-light)',
    border: '2px solid var(--bg-dark)',
    transform: 'translateX(-50%)',
    boxShadow: '0 0 8px rgba(99,102,241,0.6)',
  },
  goalComplete: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--accent)',
  },

  // Primary CTA
  scanCTA: {
    width: '100%',
    padding: 0,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.06))',
    border: '1.5px solid rgba(99,102,241,0.2)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    textAlign: 'left',
    marginBottom: 10,
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  scanCTAInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '18px 18px',
    position: 'relative',
    zIndex: 2,
  },
  scanCTAIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
    position: 'relative',
    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
  },
  scanCTAOrbit: {
    position: 'absolute',
    inset: -4,
    border: '1.5px dashed rgba(99,102,241,0.3)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  scanCTAText: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  scanCTALabel: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
  scanCTASub: { fontSize: 12, color: 'var(--text-muted)' },

  continueCTA: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: 'rgba(30,41,59,0.5)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    textAlign: 'left',
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
  },
  continueCTALabel: { flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' },

  // Bento Stats
  statsGrid: {
    marginBottom: 24,
    position: 'relative',
    zIndex: 1,
  },
  bentoCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    padding: 16,
    borderRadius: 'var(--radius-lg)',
    position: 'relative',
    overflow: 'hidden',
  },
  bentoLarge: {
    gridColumn: 'span 2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bentoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoValue: {
    fontSize: 20,
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: -0.5,
  },
  bentoLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: 600,
  },

  // Sections
  section: { marginBottom: 24, position: 'relative', zIndex: 1 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    margin: 0,
    marginBottom: 12,
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    color: 'var(--primary-light)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // Achievements
  achievementScroll: { overflow: 'hidden', position: 'relative' },
  achievementRow: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 },
  achievementCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '14px 18px',
    borderRadius: 'var(--radius)',
    minWidth: 90,
    flexShrink: 0,
  },
  achievementIcon: { fontSize: 28 },
  achievementTitle: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', whiteSpace: 'nowrap' },

  // Tips
  tipCard: {
    display: 'flex',
    gap: 14,
    padding: 16,
    borderRadius: 'var(--radius)',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  tipIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipIcon: { fontSize: 22 },
  tipContent: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  tipText: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 },
  tipDots: { display: 'flex', gap: 6, justifyContent: 'center' },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--border)',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  tipDotActive: {
    background: 'var(--primary-light)',
    width: 20,
    borderRadius: 3,
    boxShadow: '0 0 6px rgba(99,102,241,0.4)',
  },

  // Subjects
  subjectGrid: { /* responsive-grid-3 class handles the grid */ },
  subjectBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '16px 10px',
    background: 'rgba(30,41,59,0.4)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    color: 'inherit',
  },
  subjectIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  subjectIcon: { fontSize: 22 },
  subjectName: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' },

  // Recent
  recentList: { display: 'flex', flexDirection: 'column', gap: 8 },
  recentItem: {
    display: 'flex',
    gap: 12,
    padding: 10,
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    alignItems: 'center',
  },
  recentImageWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  recentImage: { width: '100%', height: '100%', objectFit: 'cover' },
  recentImageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), transparent)',
    pointerEvents: 'none',
  },
  recentInfo: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  recentSubject: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 },
  recentDate: { fontSize: 12, color: 'var(--text-muted)' },

  // Quote
  quoteCard: {
    padding: '24px 20px',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  quoteMark: {
    fontSize: 48,
    fontWeight: 800,
    lineHeight: 1,
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: -8,
    opacity: 0.6,
  },
  quoteText: {
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.7,
    margin: 0,
    maxWidth: 280,
  },
  quoteAttr: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  quoteLabel: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5 },
};

import { useState, useMemo } from 'react';
import {
  Calculator,
  Microscope,
  Scroll,
  Globe,
  BookMarked,
  Dna,
  Flame,
  Zap,
  Code,
  Languages,
  HelpCircle,
  TrendingUp,
  Target,
  BookOpen,
  ChevronRight,
  Star,
  Award,
  BarChart3,
} from 'lucide-react';
import historyService from '../services/historyService';

const SUBJECT_CONFIG = {
  math: { color: '#6366f1', icon: Calculator, gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))' },
  science: { color: '#10b981', icon: Microscope, gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' },
  history: { color: '#f59e0b', icon: Scroll, gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))' },
  geography: { color: '#06b6d4', icon: Globe, gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))' },
  literature: { color: '#d946ef', icon: BookMarked, gradient: 'linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(217, 70, 239, 0.05))' },
  biology: { color: '#14b8a6', icon: Dna, gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05))' },
  chemistry: { color: '#f97316', icon: Flame, gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05))' },
  physics: { color: '#8b5cf6', icon: Zap, gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))' },
  'computer science': { color: '#06b6d4', icon: Code, gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))' },
  language: { color: '#ec4899', icon: Languages, gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))' },
  other: { color: '#64748b', icon: HelpCircle, gradient: 'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(100, 116, 139, 0.05))' },
};

const EXPLORE_SUBJECTS = [
  { name: 'Math', icon: Calculator, color: '#6366f1', tip: 'Scan equations, graphs, or word problems' },
  { name: 'Science', icon: Microscope, color: '#10b981', tip: 'Scan diagrams, experiments, or theories' },
  { name: 'History', icon: Scroll, color: '#f59e0b', tip: 'Scan timelines, maps, or historical texts' },
  { name: 'Biology', icon: Dna, color: '#14b8a6', tip: 'Scan cell diagrams, anatomy, or ecosystems' },
  { name: 'Physics', icon: Zap, color: '#8b5cf6', tip: 'Scan formulas, circuits, or motion diagrams' },
  { name: 'Literature', icon: BookMarked, color: '#d946ef', tip: 'Scan poems, passages, or book excerpts' },
];

export default function SubjectsPage({ onScanClick }) {
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const sessions = historyService.getSessions();

  const { subjectCards, totalScans, avgProgress, topSubject } = useMemo(() => {
    const groupedBySubject = {};
    sessions.forEach(session => {
      const subject = normalizeSubject(session.subject);
      if (!groupedBySubject[subject]) groupedBySubject[subject] = [];
      groupedBySubject[subject].push(session);
    });

    const cards = Object.entries(groupedBySubject).map(([subject, subjectSessions]) => {
      const quizzes = subjectSessions
        .filter(s => s.quiz)
        .map(s => {
          const correct = s.quiz.questions?.filter(q => q.userAnswer === q.correct).length || 0;
          const total = s.quiz.questions?.length || 1;
          return (correct / total) * 100;
        });
      const progress = quizzes.length > 0
        ? Math.round(quizzes.reduce((a, b) => a + b) / quizzes.length)
        : 0;
      const lastStudied = new Date(subjectSessions[0].timestamp);

      // Determine mastery level
      let level = 'Beginner';
      if (subjectSessions.length >= 10 && progress >= 80) level = 'Master';
      else if (subjectSessions.length >= 5 && progress >= 60) level = 'Advanced';
      else if (subjectSessions.length >= 3) level = 'Intermediate';

      return { subject, sessions: subjectSessions, progress, lastStudied, count: subjectSessions.length, level };
    });

    cards.sort((a, b) => b.count - a.count);

    const total = cards.reduce((sum, c) => sum + c.count, 0);
    const avg = cards.length > 0 ? Math.round(cards.reduce((sum, c) => sum + c.progress, 0) / cards.length) : 0;
    const top = cards.length > 0 ? cards[0].subject : null;

    return { subjectCards: cards, totalScans: total, avgProgress: avg, topSubject: top };
  }, [sessions]);

  return (
    <div style={styles.container}>
      {subjectCards.length === 0 ? (
        <div className="fade-in">
          {/* Empty state with explore suggestions */}
          <div style={styles.emptyState}>
            <div style={styles.emptyIconWrap} className="bounce-in">
              <BookOpen size={48} color="var(--primary-light)" />
            </div>
            <h2 style={styles.emptyTitle}>Start Your Learning Journey</h2>
            <p style={styles.emptyText}>Scan textbook pages to track your progress across different subjects!</p>
            <button className="btn btn-primary" onClick={onScanClick} style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} />
              Start Scanning
            </button>
          </div>

          {/* Explore subjects */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <BookOpen size={18} color="var(--primary-light)" />
              <h3 style={styles.sectionTitle}>Subjects to Explore</h3>
            </div>
            <div style={styles.exploreGrid} className="responsive-grid-2 stagger-children">
              {EXPLORE_SUBJECTS.map((sub) => {
                const Icon = sub.icon;
                return (
                  <div key={sub.name} style={styles.exploreCard} className="hover-lift" onClick={onScanClick}>
                    <div style={{ ...styles.exploreIcon, background: `${sub.color}20`, color: sub.color }}>
                      <Icon size={24} />
                    </div>
                    <div style={styles.exploreName}>{sub.name}</div>
                    <div style={styles.exploreTip}>{sub.tip}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="fade-in">
          {/* Header with stats */}
          <div style={styles.header} className="slide-in-left">
            <h1 style={styles.title} className="gradient-text">Your Subjects</h1>
            <p style={styles.subtitle}>
              {subjectCards.length} subject{subjectCards.length !== 1 ? 's' : ''} studied
            </p>
          </div>

          {/* Stats overview */}
          <div style={styles.statsRow} className="responsive-grid-3 stagger-children">
            <div style={styles.statCard} className="hover-lift">
              <BarChart3 size={18} color="var(--primary-light)" />
              <div style={styles.statValue}>{totalScans}</div>
              <div style={styles.statLabel}>Total Scans</div>
            </div>
            <div style={styles.statCard} className="hover-lift">
              <TrendingUp size={18} color="var(--success)" />
              <div style={styles.statValue}>{avgProgress}%</div>
              <div style={styles.statLabel}>Avg Score</div>
            </div>
            <div style={styles.statCard} className="hover-lift">
              <Star size={18} color="var(--accent)" />
              <div style={styles.statValue}>{subjectCards.length}</div>
              <div style={styles.statLabel}>Subjects</div>
            </div>
          </div>

          {/* Top subject highlight */}
          {topSubject && (
            <div style={styles.topSubjectBanner} className="bounce-in">
              <Award size={20} color="var(--accent)" />
              <span style={styles.topSubjectText}>
                <strong>{topSubject}</strong> is your most studied subject!
              </span>
            </div>
          )}

          {/* View toggle */}
          <div style={styles.viewToggle}>
            <button
              style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>

          {/* Subject cards */}
          <div style={viewMode === 'grid' ? styles.cardsGridView : styles.cardsListView} className="stagger-children">
            {subjectCards.map(subject => (
              <SubjectCard
                key={subject.subject}
                subject={subject}
                isExpanded={expandedSubject === subject.subject}
                viewMode={viewMode}
                onToggle={() =>
                  setExpandedSubject(expandedSubject === subject.subject ? null : subject.subject)
                }
              />
            ))}
          </div>

          {/* Explore more */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <BookOpen size={18} color="var(--primary-light)" />
              <h3 style={styles.sectionTitle}>Explore More</h3>
            </div>
            <div style={styles.exploreRow}>
              {EXPLORE_SUBJECTS.filter(s => !subjectCards.find(c => c.subject.toLowerCase() === s.name.toLowerCase())).slice(0, 3).map((sub) => {
                const Icon = sub.icon;
                return (
                  <div key={sub.name} style={styles.exploreChip} className="hover-lift" onClick={onScanClick}>
                    <Icon size={16} color={sub.color} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{sub.name}</span>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div style={styles.navPadding} />
    </div>
  );
}

function SubjectCard({ subject, isExpanded, onToggle, viewMode }) {
  const config = SUBJECT_CONFIG[subject.subject.toLowerCase()] || SUBJECT_CONFIG.other;
  const Icon = config.icon;

  const levelColors = {
    'Beginner': '#64748b',
    'Intermediate': '#06b6d4',
    'Advanced': '#8b5cf6',
    'Master': '#f59e0b',
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (viewMode === 'grid') {
    return (
      <div
        style={{ ...styles.gridCard, borderColor: `${config.color}30` }}
        className="hover-lift"
        onClick={onToggle}
      >
        <div style={{ ...styles.gridCardIcon, background: `${config.color}15`, color: config.color }}>
          <Icon size={28} />
        </div>
        <h3 style={styles.gridCardTitle}>{subject.subject}</h3>
        <div style={styles.gridCardMeta}>{subject.count} scans</div>
        <div style={{ ...styles.levelBadge, background: `${levelColors[subject.level]}20`, color: levelColors[subject.level] }}>
          {subject.level}
        </div>
        {/* Mini progress ring */}
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ margin: '8px auto 0' }}>
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="20" cy="20" r="16"
            fill="none" stroke={config.color} strokeWidth="3"
            strokeDasharray={`${100.5 * (subject.progress / 100)} 100.5`}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 0.8s ease' }}
          />
          <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-primary)' }}>
            {subject.progress}%
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{ ...styles.card, background: config.gradient, borderLeft: `4px solid ${config.color}` }}
      className="hover-lift"
    >
      <div style={styles.cardHeader} onClick={onToggle}>
        <div style={styles.cardHeaderLeft}>
          <div style={{ ...styles.cardIcon, color: config.color }}>
            <Icon size={28} />
          </div>
          <div style={styles.cardInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={styles.cardTitle}>{subject.subject}</h3>
              <span style={{ ...styles.levelBadge, background: `${levelColors[subject.level]}20`, color: levelColors[subject.level] }}>
                {subject.level}
              </span>
            </div>
            <p style={styles.cardMeta}>
              {subject.count} scan{subject.count !== 1 ? 's' : ''} • Last studied {formatDate(subject.lastStudied)}
            </p>
          </div>
        </div>
        <div style={{ ...styles.expandIcon, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
          <ChevronRight size={18} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressLabel}>
          <span style={styles.progressText}>Quiz Score</span>
          <span style={styles.progressValue}>{subject.progress}%</span>
        </div>
        <div style={{ ...styles.progressBar, background: 'rgba(0, 0, 0, 0.1)' }}>
          <div
            style={{
              ...styles.progressFill,
              width: `${subject.progress}%`,
              background: `linear-gradient(90deg, ${config.color}, ${config.color}88)`,
            }}
          />
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={styles.expandedContent} className="fade-in">
          <div style={styles.sessionsList} className="stagger-children">
            {subject.sessions.map((session, idx) => (
              <div key={session.id} style={styles.sessionItem}>
                <div style={{ ...styles.sessionNumber, background: `${config.color}20`, color: config.color }}>{idx + 1}</div>
                <div style={styles.sessionDetails}>
                  <div style={styles.sessionDate}>
                    {new Date(session.timestamp).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  {session.quiz && (
                    <div style={styles.sessionScore}>
                      {(() => {
                        const correct = session.quiz.questions?.filter(q => q.userAnswer === q.correct).length || 0;
                        const total = session.quiz.questions?.length || 0;
                        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                        return `Quiz: ${pct}% (${correct}/${total})`;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeSubject(subject) {
  if (!subject) return 'Other';
  const lower = subject.toLowerCase();
  if (lower.includes('math')) return 'Math';
  if (lower.includes('science')) return 'Science';
  if (lower.includes('history')) return 'History';
  if (lower.includes('geography')) return 'Geography';
  if (lower.includes('literature') || lower.includes('english')) return 'Literature';
  if (lower.includes('biology')) return 'Biology';
  if (lower.includes('chemistry')) return 'Chemistry';
  if (lower.includes('physics')) return 'Physics';
  if (lower.includes('computer')) return 'Computer Science';
  if (lower.includes('language')) return 'Language';
  return 'Other';
}

const styles = {
  container: {
    padding: '24px 24px 100px',
    maxWidth: 'var(--layout-max-width, 1200px)',
    margin: '0 auto',
  },
  header: { marginBottom: 20, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)' },

  // Stats row
  statsRow: {
    marginBottom: 16,
  },
  statCard: {
    background: 'rgba(30,41,59,0.5)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
    borderRadius: 'var(--radius)',
    padding: '14px 8px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  statValue: { fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' },
  statLabel: { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },

  // Top subject banner
  topSubjectBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.03))',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 'var(--radius)',
    marginBottom: 16,
  },
  topSubjectText: { fontSize: 13, color: 'var(--text-secondary)' },

  // View toggle
  viewToggle: {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 3,
    border: '1px solid var(--border)',
    width: 'fit-content',
  },
  viewBtn: {
    padding: '6px 16px',
    fontSize: 12,
    fontWeight: 600,
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--text-muted)',
    transition: 'all 0.2s',
  },
  viewBtnActive: {
    background: 'var(--primary)',
    color: 'white',
  },

  // Grid view
  cardsGridView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    background: 'rgba(30,41,59,0.5)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
    borderRadius: 'var(--radius)',
    padding: 16,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.25s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  gridCardIcon: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  gridCardMeta: { fontSize: 11, color: 'var(--text-muted)' },

  // Level badge
  levelBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // List view
  cardsListView: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: { display: 'flex', gap: 12, flex: 1 },
  cardIcon: {
    width: 48, height: 48,
    borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: 'var(--text-muted)' },
  expandIcon: { color: 'var(--text-muted)' },
  progressContainer: { marginBottom: 0 },
  progressLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressText: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  progressValue: { fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  expandedContent: { marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.1)' },
  sessionsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  sessionItem: { display: 'flex', gap: 10, padding: 10, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-sm)', alignItems: 'flex-start' },
  sessionNumber: {
    fontSize: 12, fontWeight: 700,
    width: 24, height: 24, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sessionDetails: { flex: 1, fontSize: 12 },
  sessionDate: { color: 'var(--text-secondary)', marginBottom: 3 },
  sessionScore: { color: 'var(--text-muted)', fontSize: 11 },

  // Section
  section: { marginTop: 24, marginBottom: 16 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },

  // Explore grid
  exploreGrid: {
    /* responsive-grid-2 class handles the grid */
  },
  exploreCard: {
    background: 'rgba(30,41,59,0.5)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    borderRadius: 'var(--radius)',
    padding: 16,
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  exploreIcon: {
    width: 48, height: 48, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  exploreName: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  exploreTip: { fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 },

  // Explore chips (when some subjects already studied)
  exploreRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  exploreChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 20px 32px',
    textAlign: 'center',
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  emptyText: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280 },
  navPadding: { height: 20 },
};

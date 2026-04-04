import { useState } from 'react';
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
} from 'lucide-react';
import historyService from '../services/historyService';

const SUBJECT_CONFIG = {
  math: {
    color: '#6366f1',
    icon: Calculator,
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
  },
  science: {
    color: '#10b981',
    icon: Microscope,
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
  },
  history: {
    color: '#f59e0b',
    icon: Scroll,
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
  },
  geography: {
    color: '#06b6d4',
    icon: Globe,
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))',
  },
  literature: {
    color: '#d946ef',
    icon: BookMarked,
    gradient: 'linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(217, 70, 239, 0.05))',
  },
  biology: {
    color: '#14b8a6',
    icon: Dna,
    gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05))',
  },
  chemistry: {
    color: '#f97316',
    icon: Flame,
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05))',
  },
  physics: {
    color: '#8b5cf6',
    icon: Zap,
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
  },
  'computer science': {
    color: '#06b6d4',
    icon: Code,
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))',
  },
  language: {
    color: '#ec4899',
    icon: Languages,
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))',
  },
  other: {
    color: '#64748b',
    icon: HelpCircle,
    gradient: 'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(100, 116, 139, 0.05))',
  },
};

export default function SubjectsPage({ onScanClick }) {
  const [expandedSubject, setExpandedSubject] = useState(null);
  const sessions = historyService.getSessions();

  // Group sessions by subject
  const groupedBySubject = {};
  sessions.forEach(session => {
    const subject = normalizeSubject(session.subject);
    if (!groupedBySubject[subject]) {
      groupedBySubject[subject] = [];
    }
    groupedBySubject[subject].push(session);
  });

  // Create subject cards
  const subjectCards = Object.entries(groupedBySubject).map(([subject, subjectSessions]) => {
    // Calculate progress (average quiz score)
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

    // Get last studied date
    const lastStudied = new Date(subjectSessions[0].timestamp);

    return {
      subject,
      sessions: subjectSessions,
      progress,
      lastStudied,
      count: subjectSessions.length,
    };
  });

  // Sort by count (most studied first)
  subjectCards.sort((a, b) => b.count - a.count);

  return (
    <div style={styles.container}>
      {subjectCards.length === 0 ? (
        // Empty state
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📚</div>
          <h2 style={styles.emptyTitle}>No subjects yet</h2>
          <p style={styles.emptyText}>Start scanning textbook pages to track your progress across different subjects!</p>
          <button className="btn btn-primary" onClick={onScanClick} style={{ marginTop: 16 }}>
            Start Scanning
          </button>
        </div>
      ) : (
        <>
          <div style={styles.header}>
            <h1 style={styles.title}>Your Subjects</h1>
            <p style={styles.subtitle}>Track your progress across {subjectCards.length} subject{subjectCards.length !== 1 ? 's' : ''}</p>
          </div>

          <div style={styles.cardsGrid}>
            {subjectCards.map(subject => (
              <SubjectCard
                key={subject.subject}
                subject={subject}
                isExpanded={expandedSubject === subject.subject}
                onToggle={() =>
                  setExpandedSubject(
                    expandedSubject === subject.subject ? null : subject.subject
                  )
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Bottom Padding for Nav */}
      <div style={styles.navPadding} />
    </div>
  );
}

function SubjectCard({ subject, isExpanded, onToggle }) {
  const config = SUBJECT_CONFIG[subject.subject.toLowerCase()] || SUBJECT_CONFIG.other;
  const Icon = config.icon;

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

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      style={{
        ...styles.card,
        background: config.gradient,
        borderLeft: `4px solid ${config.color}`,
      }}
      className="card"
    >
      <div style={styles.cardHeader} onClick={onToggle}>
        <div style={styles.cardHeaderLeft}>
          <div style={{ ...styles.cardIcon, color: config.color }}>
            <Icon size={28} />
          </div>
          <div style={styles.cardInfo}>
            <h3 style={styles.cardTitle}>{subject.subject}</h3>
            <p style={styles.cardMeta}>
              {subject.count} scan{subject.count !== 1 ? 's' : ''} • Last studied {formatDate(subject.lastStudied)}
            </p>
          </div>
        </div>
        <div style={styles.expandIcon}>
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressLabel}>
          <span style={styles.progressText}>Progress</span>
          <span style={styles.progressValue}>{subject.progress}%</span>
        </div>
        <div style={{ ...styles.progressBar, background: 'rgba(0, 0, 0, 0.1)' }}>
          <div
            style={{
              ...styles.progressFill,
              width: `${subject.progress}%`,
              background: config.color,
            }}
          />
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={styles.expandedContent}>
          <div style={styles.sessionsList}>
            {subject.sessions.map((session, idx) => (
              <div key={session.id} style={styles.sessionItem}>
                <div style={styles.sessionNumber}>{idx + 1}</div>
                <div style={styles.sessionDetails}>
                  <div style={styles.sessionDate}>
                    {new Date(session.timestamp).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
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

  // Direct matches
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
    padding: '24px 16px 100px',
    maxWidth: 480,
    margin: '0 auto',
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--text-secondary)',
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    display: 'flex',
    gap: 12,
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  expandIcon: {
    fontSize: 14,
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 0,
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sessionItem: {
    display: 'flex',
    gap: 10,
    padding: 10,
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 'var(--radius-sm)',
    alignItems: 'flex-start',
  },
  sessionNumber: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-muted)',
    background: 'rgba(255, 255, 255, 0.1)',
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sessionDetails: {
    flex: 1,
    fontSize: 12,
  },
  sessionDate: {
    color: 'var(--text-secondary)',
    marginBottom: 3,
  },
  sessionScore: {
    color: 'var(--text-muted)',
    fontSize: 11,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: 280,
  },
  navPadding: {
    height: 20,
  },
};

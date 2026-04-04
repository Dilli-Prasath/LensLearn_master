import { useState, useMemo } from 'react';
import {
  Search, Trash2, Heart, Download,
  Calendar, TrendingUp, BookOpen, Clock,
  ChevronRight, BarChart3, Flame, Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../store';
import exportService from '../services/exportService';

/* ─── tiny helpers ─── */
const Glass = ({ children, style, className = '', ...rest }) => (
  <div style={{ ...glassBase, ...style }} className={className} {...rest}>{children}</div>
);

const glassBase = {
  background: 'rgba(30,41,59,0.45)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const sessions = useHistoryStore((s) => s.sessions);
  const deleteSession = useHistoryStore((s) => s.deleteSession);
  const toggleBookmark = useHistoryStore((s) => s.toggleBookmark);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  /* ── Study insights ── */
  const insights = useMemo(() => {
    if (sessions.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDays = new Set(sessions.map(s => {
      const d = new Date(s.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }));
    let streak = 0;
    const checkDate = new Date(today);
    while (sessionDays.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const subjectCounts = {};
    sessions.forEach(s => {
      const sub = s.subject || 'Other';
      subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
    });
    const topSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const weekActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const count = sessions.filter(s => {
        const sd = new Date(s.timestamp);
        sd.setHours(0, 0, 0, 0);
        return sd.getTime() === d.getTime();
      }).length;
      weekActivity.push({ day: d.toLocaleDateString('en-US', { weekday: 'narrow' }), count, isToday: i === 0 });
    }
    const maxCount = Math.max(...weekActivity.map(w => w.count), 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekCount = sessions.filter(s => new Date(s.timestamp) >= weekStart).length;

    return { streak, topSubject, weekActivity, maxCount, thisWeekCount, totalSessions: sessions.length };
  }, [sessions]);

  /* ── Filtering / sorting ── */
  let displaySessions = sessions;
  if (filterMode === 'bookmarked') {
    displaySessions = displaySessions.filter(s => s.bookmarked);
  }
  if (sortBy === 'subject') {
    displaySessions = [...displaySessions].sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
  }
  const filteredSessions = displaySessions.filter(session =>
    session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── Handlers ── */
  const handleDelete = (id, e) => { e.stopPropagation(); deleteSession(id); };
  const handleToggleBookmark = (id, e) => { e.stopPropagation(); toggleBookmark(id); };
  const handleClearAll = () => {
    if (window.confirm('Are you sure? This will delete all your scan history.')) {
      clearHistory(); navigate('/');
    }
  };
  const handleExportAll = () => exportService.exportAllNotes(sessions);
  const handleViewSession = (session) => navigate(`/history/${session.id}`);

  /* ── Empty state ── */
  if (sessions.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyState} className="fade-in">
          <div style={styles.emptyIconRing}>
            <Clock size={44} color="var(--primary-light)" />
          </div>
          <h2 style={styles.emptyTitle}>No Scans Yet</h2>
          <p style={styles.emptyText}>
            Your learning history will appear here as you scan and analyze pages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="fade-in">

      {/* ═══ INSIGHTS DASHBOARD ═══ */}
      {insights && (
        <section style={styles.insightsSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIconWrap}>
              <BarChart3 size={16} color="var(--primary-light)" />
            </div>
            <h3 style={styles.sectionTitle}>Study Insights</h3>
          </div>

          {/* ── Stats row ── */}
          <div style={styles.statsRow}>
            {/* Streak */}
            <Glass style={styles.statCard} className="hover-lift">
              <div style={{ ...styles.statIconBg, background: 'linear-gradient(135deg, rgba(251,146,60,0.2), rgba(245,158,11,0.08))' }}>
                <Flame size={20} color="#fb923c" />
              </div>
              <div style={styles.statNumber}>{insights.streak}</div>
              <div style={styles.statLabel}>Day Streak</div>
            </Glass>

            {/* This week */}
            <Glass style={styles.statCard} className="hover-lift">
              <div style={{ ...styles.statIconBg, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.08))' }}>
                <BookOpen size={20} color="var(--primary-light)" />
              </div>
              <div style={styles.statNumber}>{insights.thisWeekCount}</div>
              <div style={styles.statLabel}>This Week</div>
            </Glass>

            {/* All time */}
            <Glass style={styles.statCard} className="hover-lift">
              <div style={{ ...styles.statIconBg, background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))' }}>
                <Calendar size={20} color="#10b981" />
              </div>
              <div style={styles.statNumber}>{insights.totalSessions}</div>
              <div style={styles.statLabel}>All Time</div>
            </Glass>

            {/* Top subject */}
            <Glass style={styles.statCard} className="hover-lift">
              <div style={{ ...styles.statIconBg, background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.08))' }}>
                <Sparkles size={20} color="#a855f7" />
              </div>
              <div style={{ ...styles.statNumber, fontSize: insights.topSubject.length > 8 ? 15 : 20 }}>{insights.topSubject}</div>
              <div style={styles.statLabel}>Top Subject</div>
            </Glass>
          </div>

          {/* ── Weekly activity chart ── */}
          <Glass style={styles.weekChart}>
            <div style={styles.weekChartHeader}>
              <span style={styles.weekChartTitle}>Weekly Activity</span>
              <span style={styles.weekChartCount}>{insights.thisWeekCount} scans</span>
            </div>
            <div style={styles.weekBars}>
              {insights.weekActivity.map((day, i) => (
                <div key={i} style={styles.weekBarCol}>
                  <div style={styles.weekCountLabel}>{day.count > 0 ? day.count : ''}</div>
                  <div style={styles.weekBarTrack}>
                    <div style={{
                      width: '100%',
                      borderRadius: 6,
                      transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      height: day.count > 0 ? `${Math.max((day.count / insights.maxCount) * 100, 12)}%` : '4%',
                      background: day.isToday
                        ? 'linear-gradient(180deg, var(--primary-light), var(--primary))'
                        : day.count > 0
                          ? 'linear-gradient(180deg, rgba(99,102,241,0.5), rgba(99,102,241,0.25))'
                          : 'rgba(255,255,255,0.05)',
                      boxShadow: day.isToday && day.count > 0 ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: day.isToday ? 700 : 500,
                    color: day.isToday ? 'var(--primary-light)' : 'var(--text-muted)',
                    marginTop: 4,
                  }}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </Glass>
        </section>
      )}

      {/* ═══ TOOLBAR ═══ */}
      <section style={styles.toolbar}>
        <div style={styles.filterTabs}>
          {[
            { key: 'all', label: `All (${sessions.length})` },
            { key: 'bookmarked', label: 'Saved', icon: <Heart size={12} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterMode(tab.key)}
              style={{
                ...styles.filterTab,
                ...(filterMode === tab.key ? styles.filterTabActive : {}),
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div style={styles.toolbarRight}>
          <select
            style={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recent</option>
            <option value="subject">Subject</option>
          </select>

          <button style={styles.exportBtn} onClick={handleExportAll} className="hover-lift">
            <Download size={14} />
            Export
          </button>
        </div>
      </section>

      {/* ═══ SEARCH ═══ */}
      <Glass style={styles.searchContainer}>
        <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search scans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {searchTerm && (
          <button style={styles.clearSearch} onClick={() => setSearchTerm('')}>&times;</button>
        )}
      </Glass>

      <div style={styles.resultCount}>
        {filteredSessions.length} of {displaySessions.length} scans
      </div>

      {/* ═══ SESSION CARDS ═══ */}
      <div style={styles.sessionGrid} className="stagger-children">
        {filteredSessions.map(session => (
          <Glass
            key={session.id}
            style={styles.sessionCard}
            onClick={() => handleViewSession(session)}
            className="hover-lift"
          >
            {/* Thumbnail */}
            <div style={styles.thumbWrap}>
              <img src={session.image} alt={session.subject} style={styles.thumbnail} loading="lazy" />
              {session.bookmarked && (
                <div style={styles.thumbBadge}>
                  <Heart size={10} color="#fff" fill="#fff" />
                </div>
              )}
            </div>

            {/* Info */}
            <div style={styles.sessionInfo}>
              <div style={styles.subject}>{session.subject}</div>
              <div style={styles.sessionMeta}>
                <span style={styles.date}>
                  {new Date(session.timestamp).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <span style={styles.langBadge}>{session.language}</span>
              </div>
              <div style={styles.previewText}>
                {session.explanation?.slice(0, 80)}...
              </div>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button
                style={styles.actionBtn}
                onClick={(e) => handleToggleBookmark(session.id, e)}
                title={session.bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <Heart
                  size={15}
                  color={session.bookmarked ? '#f472b6' : 'var(--text-muted)'}
                  fill={session.bookmarked ? '#f472b6' : 'none'}
                />
              </button>
              <button
                style={styles.actionBtn}
                onClick={(e) => handleDelete(session.id, e)}
                title="Delete"
              >
                <Trash2 size={15} color="var(--text-muted)" />
              </button>
              <div style={{ flex: 1 }} />
              <ChevronRight size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            </div>
          </Glass>
        ))}
      </div>

      {/* Clear all */}
      {sessions.length > 1 && (
        <button style={styles.clearAllBtn} onClick={handleClearAll}>
          Clear All History
        </button>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

/* ─── STYLES ─── */
const styles = {
  page: {
    padding: '20px clamp(16px, 4vw, 32px) 100px',
    maxWidth: 'var(--layout-max-width, 1200px)',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },

  /* Section header */
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    background: 'rgba(99,102,241,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.3 },

  /* Insights */
  insightsSection: { marginBottom: 28 },

  /* Stats row — horizontal, responsive */
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    padding: '18px 14px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    cursor: 'default',
    transition: 'transform 0.25s, box-shadow 0.25s',
  },
  statIconBg: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statNumber: {
    fontSize: 26, fontWeight: 800, color: 'var(--text-primary)',
    letterSpacing: -0.5, lineHeight: 1,
  },
  statLabel: {
    fontSize: 10, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700,
  },

  /* Week chart */
  weekChart: { padding: '18px 20px' },
  weekChartHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  weekChartTitle: {
    fontSize: 12, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700,
  },
  weekChartCount: { fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 },
  weekBars: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    height: 80, gap: 8,
  },
  weekBarCol: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    flex: 1, minWidth: 0,
  },
  weekCountLabel: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
    marginBottom: 4, minHeight: 14,
  },
  weekBarTrack: {
    width: '100%', maxWidth: 28, height: 60,
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    borderRadius: 6, overflow: 'hidden',
    background: 'rgba(255,255,255,0.03)',
  },

  /* Toolbar */
  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 10, marginBottom: 14,
  },
  filterTabs: { display: 'flex', gap: 6 },
  filterTab: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 16px', borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(30,41,59,0.4)',
    color: 'var(--text-secondary)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterTabActive: {
    background: 'var(--primary)', color: '#fff',
    borderColor: 'var(--primary)',
    boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
  },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  sortSelect: {
    padding: '7px 12px', fontSize: 12, fontWeight: 600,
    background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-sm, 8px)', color: 'var(--text-secondary)',
    cursor: 'pointer', outline: 'none',
  },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
    border: 'none', color: '#fff',
    borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(99,102,241,0.3)',
    transition: 'all 0.2s',
  },

  /* Search */
  searchContainer: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 16px', marginBottom: 10,
  },
  searchInput: {
    flex: 1, background: 'none', border: 'none',
    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  },
  clearSearch: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
  },
  resultCount: {
    fontSize: 11, color: 'var(--text-muted)', marginBottom: 14,
    textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600,
  },

  /* Session cards */
  sessionGrid: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  sessionCard: {
    display: 'flex', gap: 14, padding: 14, cursor: 'pointer',
    alignItems: 'center', transition: 'transform 0.2s, box-shadow 0.2s',
  },
  thumbWrap: { position: 'relative', flexShrink: 0 },
  thumbnail: {
    width: 68, height: 68,
    borderRadius: 'var(--radius-sm, 8px)',
    objectFit: 'cover', background: 'rgba(0,0,0,0.3)',
  },
  thumbBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 20, height: 20, borderRadius: '50%',
    background: 'linear-gradient(135deg, #f472b6, #ec4899)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(244,114,182,0.4)',
  },
  sessionInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  subject: {
    fontSize: 14, fontWeight: 650, color: 'var(--text-primary)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  sessionMeta: { display: 'flex', alignItems: 'center', gap: 8 },
  date: { fontSize: 11, color: 'var(--text-muted)' },
  langBadge: {
    fontSize: 10, color: 'var(--primary-light)', fontWeight: 600,
    padding: '2px 8px', borderRadius: 4,
    background: 'rgba(99,102,241,0.1)',
  },
  previewText: {
    fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, flexShrink: 0, minHeight: 68, paddingTop: 2,
  },
  actionBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
    color: 'var(--text-muted)',
  },

  /* Empty */
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
  },
  emptyIconRing: {
    width: 96, height: 96, borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04))',
    border: '2px solid rgba(99,102,241,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0 12px 40px rgba(99,102,241,0.12)',
  },
  emptyTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  emptyText: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 300 },

  /* Clear all */
  clearAllBtn: {
    width: '100%', padding: '12px 24px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444', borderRadius: 'var(--radius, 12px)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

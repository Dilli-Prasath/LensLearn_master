import { useState, useMemo } from 'react';
import {
  Search, Trash2, Eye, Heart, Download,
  Calendar, TrendingUp, BookOpen, Clock,
  Filter, ChevronRight, BarChart3,
} from 'lucide-react';
import historyService from '../services/historyService';
import exportService from '../services/exportService';

export default function HistoryPage({ onViewSession, onDeleteAll }) {
  const [sessions, setSessions] = useState(historyService.getSessions());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'subject', 'bookmarked'

  // Study insights
  const insights = useMemo(() => {
    if (sessions.length === 0) return null;

    // Study streak (consecutive days)
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

    // Most studied subject
    const subjectCounts = {};
    sessions.forEach(s => {
      const sub = s.subject || 'Other';
      subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
    });
    const topSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Weekly activity (last 7 days)
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

    // This week total
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekCount = sessions.filter(s => new Date(s.timestamp) >= weekStart).length;

    return { streak, topSubject, weekActivity, maxCount, thisWeekCount, totalSessions: sessions.length };
  }, [sessions]);

  let displaySessions = sessions;
  if (filterMode === 'bookmarked') {
    displaySessions = displaySessions.filter(s => s.bookmarked);
  }

  // Sort
  if (sortBy === 'subject') {
    displaySessions = [...displaySessions].sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
  }

  // Search
  const filteredSessions = displaySessions.filter(session =>
    session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id, e) => {
    e.stopPropagation();
    historyService.deleteSession(id);
    setSessions(historyService.getSessions());
  };

  const handleToggleBookmark = (id, e) => {
    e.stopPropagation();
    historyService.toggleBookmark(id);
    setSessions(historyService.getSessions());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure? This will delete all your scan history.')) {
      historyService.clearHistory();
      setSessions([]);
      onDeleteAll?.();
    }
  };

  const handleExportAll = () => {
    exportService.exportAllNotes(sessions);
  };

  if (sessions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState} className="fade-in">
          <div style={styles.emptyIconWrap} className="bounce-in">
            <Clock size={48} color="var(--primary-light)" />
          </div>
          <h2 style={styles.emptyTitle}>No Scans Yet</h2>
          <p style={styles.emptyText}>
            Your learning history will appear here as you scan and analyze pages
          </p>
        </div>
        <div style={styles.navPadding} />
      </div>
    );
  }

  return (
    <div style={styles.container} className="fade-in">
      {/* Study Insights */}
      {insights && (
        <div style={styles.insightsSection}>
          <div style={styles.sectionHeader}>
            <BarChart3 size={18} color="var(--primary-light)" />
            <h3 style={styles.sectionTitle}>Study Insights</h3>
          </div>

          <div style={styles.insightsGrid} className="stagger-children">
            <div style={styles.insightCard} className="hover-lift">
              <div style={{ ...styles.insightIcon, background: 'rgba(245,158,11,0.15)' }}>
                <TrendingUp size={18} color="#f59e0b" />
              </div>
              <div style={styles.insightValue}>{insights.streak}</div>
              <div style={styles.insightLabel}>Day Streak</div>
            </div>
            <div style={styles.insightCard} className="hover-lift">
              <div style={{ ...styles.insightIcon, background: 'rgba(99,102,241,0.15)' }}>
                <BookOpen size={18} color="var(--primary-light)" />
              </div>
              <div style={styles.insightValue}>{insights.thisWeekCount}</div>
              <div style={styles.insightLabel}>This Week</div>
            </div>
            <div style={styles.insightCard} className="hover-lift">
              <div style={{ ...styles.insightIcon, background: 'rgba(16,185,129,0.15)' }}>
                <Calendar size={18} color="#10b981" />
              </div>
              <div style={styles.insightValue}>{insights.totalSessions}</div>
              <div style={styles.insightLabel}>All Time</div>
            </div>
          </div>

          {/* Weekly activity chart */}
          <div style={styles.weekChart}>
            <div style={styles.weekChartLabel}>Weekly Activity</div>
            <div style={styles.weekBars}>
              {insights.weekActivity.map((day, i) => (
                <div key={i} style={styles.weekBarCol}>
                  <div style={styles.weekBarTrack}>
                    <div style={{
                      ...styles.weekBarFill,
                      height: `${(day.count / insights.maxCount) * 100}%`,
                      background: day.isToday ? 'var(--primary)' : 'var(--primary-light)',
                      opacity: day.count > 0 ? 1 : 0.2,
                      minHeight: day.count > 0 ? 4 : 2,
                    }} />
                  </div>
                  <span style={{ ...styles.weekBarDay, color: day.isToday ? 'var(--primary-light)' : 'var(--text-muted)' }}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions bar */}
      <div style={styles.actionsBar} className="stagger-children">
        <button style={styles.exportBtn} onClick={handleExportAll} className="hover-lift">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Filter & Sort row */}
      <div style={styles.filterRow}>
        <div style={styles.filterTabs}>
          <button
            style={{ ...styles.filterTab, ...(filterMode === 'all' ? styles.filterTabActive : styles.filterTabInactive) }}
            onClick={() => setFilterMode('all')}
          >
            All ({sessions.length})
          </button>
          <button
            style={{ ...styles.filterTab, ...(filterMode === 'bookmarked' ? styles.filterTabActive : styles.filterTabInactive) }}
            onClick={() => setFilterMode('bookmarked')}
          >
            <Heart size={13} style={{ marginRight: 4 }} />
            Saved
          </button>
        </div>
        <select
          style={styles.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Recent</option>
          <option value="subject">Subject</option>
        </select>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer} className="fade-in">
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search scans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {searchTerm && (
          <button style={styles.clearSearch} onClick={() => setSearchTerm('')}>
            &times;
          </button>
        )}
      </div>

      {/* Result Count */}
      <div style={styles.resultCount}>
        {filteredSessions.length} of {displaySessions.length} scans
      </div>

      {/* Sessions List */}
      <div style={styles.sessionsList} className="stagger-children">
        {filteredSessions.map(session => (
          <div
            key={session.id}
            style={styles.sessionCard}
            onClick={() => onViewSession(session)}
            className="card hover-lift"
          >
            <img src={session.image} alt={session.subject} style={styles.thumbnail} loading="lazy" />
            <div style={styles.sessionInfo}>
              <div style={styles.subjectRow}>
                <div style={styles.subject}>{session.subject}</div>
                {session.bookmarked && (
                  <Heart size={12} color="var(--accent)" fill="var(--accent)" style={{ flexShrink: 0 }} />
                )}
              </div>
              <div style={styles.date}>
                {new Date(session.timestamp).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </div>
              <div style={styles.language}>{session.language}</div>
            </div>
            <div style={styles.actions}>
              <button style={styles.actionBtn} onClick={(e) => handleToggleBookmark(session.id, e)} title={session.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
                <Heart size={16} color={session.bookmarked ? 'var(--accent)' : 'var(--text-muted)'} fill={session.bookmarked ? 'var(--accent)' : 'none'} />
              </button>
              <button style={styles.actionBtn} onClick={(e) => handleDelete(session.id, e)} title="Delete">
                <Trash2 size={16} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clear All */}
      {sessions.length > 0 && (
        <button style={styles.clearAllBtn} onClick={handleClearAll}>
          Clear All History
        </button>
      )}

      <div style={styles.navPadding} />
    </div>
  );
}

const styles = {
  container: { padding: '16px 16px 100px', maxWidth: 960, margin: '0 auto' },

  // Section header
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },

  // Insights
  insightsSection: { marginBottom: 20 },
  insightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 },
  insightCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '12px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  insightIcon: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  insightValue: { fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' },
  insightLabel: { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },

  // Week chart
  weekChart: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: 14,
  },
  weekChartLabel: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, marginBottom: 10 },
  weekBars: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 48, gap: 4 },
  weekBarCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 },
  weekBarTrack: { width: '100%', maxWidth: 20, height: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderRadius: 3, overflow: 'hidden' },
  weekBarFill: { width: '100%', borderRadius: 3, transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  weekBarDay: { fontSize: 10, fontWeight: 600 },

  // Actions bar
  actionsBar: { display: 'flex', gap: 8, marginBottom: 12 },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    background: 'var(--primary)', border: 'none', color: 'white',
    borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Filter row
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 },
  filterTabs: { display: 'flex', gap: 6 },
  filterTab: {
    display: 'flex', alignItems: 'center', padding: '6px 14px', borderRadius: 20,
    border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
  },
  filterTabActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  filterTabInactive: { background: 'var(--bg-card)', color: 'var(--text-secondary)' },
  sortSelect: {
    padding: '6px 10px', fontSize: 12, fontWeight: 600, background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
    cursor: 'pointer',
  },

  // Search
  searchContainer: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 10,
  },
  searchInput: { flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none' },
  clearSearch: {
    background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer', padding: '0 4px',
  },
  resultCount: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },

  // Sessions
  sessionsList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  sessionCard: { display: 'flex', gap: 12, padding: 12, cursor: 'pointer', alignItems: 'center' },
  thumbnail: { width: 72, height: 72, borderRadius: 'var(--radius-sm)', objectFit: 'cover', background: '#000', flexShrink: 0 },
  sessionInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  subjectRow: { display: 'flex', alignItems: 'center', gap: 6 },
  subject: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  date: { fontSize: 11, color: 'var(--text-muted)' },
  language: {
    fontSize: 11, color: 'var(--text-secondary)', padding: '2px 8px',
    background: 'rgba(99, 102, 241, 0.1)', borderRadius: 4, width: 'fit-content',
  },
  actions: { display: 'flex', flexDirection: 'column', gap: 6 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', flexShrink: 0,
  },

  // Empty
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  emptyText: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280 },

  // Clear all
  clearAllBtn: {
    width: '100%', padding: '10px 24px',
    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navPadding: { height: 20 },
};

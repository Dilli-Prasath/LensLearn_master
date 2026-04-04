import { useState } from 'react';
import { Search, Trash2, Eye, Heart } from 'lucide-react';
import historyService from '../services/historyService';

export default function HistoryPage({ onViewSession, onDeleteAll }) {
  const [sessions, setSessions] = useState(historyService.getSessions());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'bookmarked'

  let displaySessions = sessions;

  // Apply filter mode
  if (filterMode === 'bookmarked') {
    displaySessions = displaySessions.filter(s => s.bookmarked);
  }

  // Apply search
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

  if (sessions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📚</div>
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
    <div style={styles.container}>
      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        <button
          style={{
            ...styles.filterTab,
            ...(filterMode === 'all' ? styles.filterTabActive : styles.filterTabInactive)
          }}
          onClick={() => setFilterMode('all')}
        >
          All
        </button>
        <button
          style={{
            ...styles.filterTab,
            ...(filterMode === 'bookmarked' ? styles.filterTabActive : styles.filterTabInactive)
          }}
          onClick={() => setFilterMode('bookmarked')}
        >
          <Heart size={14} style={{ marginRight: 4 }} />
          Bookmarked
        </button>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search by subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Result Count */}
      <div style={styles.resultCount}>
        {filteredSessions.length} of {displaySessions.length} {filterMode === 'bookmarked' ? 'bookmarked' : ''} scans
      </div>

      {/* Sessions List */}
      <div style={styles.sessionsList}>
        {filteredSessions.map(session => (
          <div
            key={session.id}
            style={styles.sessionCard}
            onClick={() => onViewSession(session)}
            className="card"
          >
            {/* Thumbnail */}
            <img
              src={session.image}
              alt={session.subject}
              style={styles.thumbnail}
            />

            {/* Info */}
            <div style={styles.sessionInfo}>
              <div style={styles.subjectRow}>
                <div style={styles.subject}>{session.subject}</div>
                {session.bookmarked && (
                  <Heart size={14} color="var(--accent)" fill="var(--accent)" style={{ marginLeft: 6, flexShrink: 0 }} />
                )}
              </div>
              <div style={styles.date}>
                {new Date(session.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div style={styles.language}>{session.language}</div>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button
                style={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSession(session);
                }}
                title="View"
              >
                <Eye size={18} />
              </button>
              <button
                style={styles.actionBtn}
                onClick={(e) => handleToggleBookmark(session.id, e)}
                title={session.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <Heart size={18} color={session.bookmarked ? 'var(--accent)' : 'var(--text-secondary)'} fill={session.bookmarked ? 'var(--accent)' : 'none'} />
              </button>
              <button
                style={styles.actionBtn}
                onClick={(e) => handleDelete(session.id, e)}
                title="Delete"
              >
                <Trash2 size={18} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clear All Button */}
      {sessions.length > 0 && (
        <button
          style={styles.clearAllBtn}
          onClick={handleClearAll}
        >
          Clear All History
        </button>
      )}

      <div style={styles.navPadding} />
    </div>
  );
}

const styles = {
  container: {
    padding: '16px 16px 100px',
    maxWidth: 480,
    margin: '0 auto',
  },
  filterTabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  filterTabActive: {
    background: 'var(--primary)',
    color: 'white',
    borderColor: 'var(--primary)',
  },
  filterTabInactive: {
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
  },
  resultCount: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 600,
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  sessionCard: {
    display: 'flex',
    gap: 12,
    padding: 12,
    cursor: 'pointer',
    alignItems: 'center',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
    background: '#000',
    flexShrink: 0,
  },
  sessionInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  subjectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
  },
  subject: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  date: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  language: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    padding: '2px 8px',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 4,
    width: 'fit-content',
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
    flexShrink: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: 280,
  },
  clearAllBtn: {
    width: '100%',
    padding: '12px 24px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  navPadding: {
    height: 20,
  },
};

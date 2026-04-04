import { Wifi, WifiOff, BookOpen, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function Header({ connectionStatus, onHomeClick, onReconnect }) {
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      if (onReconnect) {
        await onReconnect();
      }
    } finally {
      // Small delay so spin is visible even on fast reconnects
      setTimeout(() => setIsReconnecting(false), 600);
    }
  };

  return (
    <header style={styles.header} className="slide-in-left">
      <button style={styles.logo} onClick={onHomeClick} title="Home">
        <BookOpen size={22} color="var(--primary-light)" />
        <span style={styles.logoText}>LensLearn</span>
      </button>
      <div style={styles.right}>
        <button
          style={styles.refreshBtn}
          onClick={handleReconnect}
          disabled={isReconnecting}
          title="Refresh connection"
        >
          <RefreshCw
            size={18}
            color={isReconnecting ? 'var(--primary-light)' : 'var(--text-secondary)'}
            className={isReconnecting ? 'icon-spin' : ''}
            style={{ transition: 'color 0.2s' }}
          />
        </button>
        <div style={styles.status}>
          {connectionStatus?.connected ? (
            <div style={styles.statusBadgeConnected} className="pop-in" title={`Connected: ${connectionStatus.model}`}>
              <div style={styles.statusDot} />
              <Wifi size={14} color="var(--success)" />
              <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>Gemma 4</span>
            </div>
          ) : (
            <div style={styles.statusBadge} title="Ollama not connected">
              <WifiOff size={14} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-dark)',
    flexShrink: 0,
    zIndex: 10,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: 'inherit',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  right: { display: 'flex', alignItems: 'center', gap: 10 },
  refreshBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    transition: 'background 0.15s',
  },
  status: { display: 'flex', alignItems: 'center' },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 20,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
  },
  statusBadgeConnected: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 20,
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--success)',
    animation: 'pulse 2s ease-in-out infinite',
  },
};

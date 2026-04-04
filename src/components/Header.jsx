import { WifiOff, BookOpen, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectionStore } from '../store';

function formatModelName(model) {
  if (!model) return 'Unknown';
  const m = model.toLowerCase();
  if (m.startsWith('gemma4')) {
    const variant = m.split(':')[1] || '';
    return `Gemma 4${variant ? ' ' + variant.toUpperCase() : ''}`;
  }
  if (m.startsWith('gemma3')) {
    const variant = m.split(':')[1] || '';
    return `Gemma 3${variant ? ' ' + variant.toUpperCase() : ''}`;
  }
  if (m.startsWith('gemma')) {
    const parts = m.replace('gemma', 'Gemma ').split(':');
    return parts[0] + (parts[1] ? ' ' + parts[1].toUpperCase() : '');
  }
  return model;
}

export default function Header() {
  const connectionStatus = useConnectionStore((s) => s.status);
  const checkConnection = useConnectionStore((s) => s.check);
  const navigate = useNavigate();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await checkConnection();
    } finally {
      setTimeout(() => setIsReconnecting(false), 600);
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerBg} />

      <button style={styles.logo} onClick={() => navigate('/')} title="Home">
        <div style={styles.logoIconWrap}>
          <BookOpen size={18} color="white" />
        </div>
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
            size={16}
            color={isReconnecting ? 'var(--primary-light)' : 'var(--text-muted)'}
            className={isReconnecting ? 'icon-spin' : ''}
            style={{ transition: 'color 0.2s' }}
          />
        </button>

        <div style={styles.status}>
          {connectionStatus?.connected ? (
            <div style={styles.statusBadgeConnected} className="pop-in" title={`Connected: ${connectionStatus.model}`}>
              <div style={styles.statusDot} />
              <span style={styles.statusText}>{formatModelName(connectionStatus.model)}</span>
            </div>
          ) : (
            <div style={styles.statusBadge} title="Ollama not connected">
              <WifiOff size={13} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}>Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    flexShrink: 0, zIndex: 10, position: 'relative',
  },
  headerBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(90deg, rgba(99,102,241,0.04), transparent, rgba(168,85,247,0.03))',
    pointerEvents: 'none',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 0, color: 'inherit', position: 'relative', zIndex: 1,
  },
  logoIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
  logoText: {
    fontSize: 17, fontWeight: 800,
    background: 'linear-gradient(135deg, var(--text-primary), var(--primary-light))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -0.3,
  },
  right: { display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 },
  refreshBtn: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer', padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, transition: 'all 0.15s',
  },
  status: { display: 'flex', alignItems: 'center' },
  statusBadge: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
    borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
  },
  statusBadgeConnected: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
    borderRadius: 20, background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(8px)',
  },
  statusDot: {
    width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
    boxShadow: '0 0 6px rgba(16,185,129,0.5)', animation: 'pulse 2s ease-in-out infinite',
  },
  statusText: { color: 'var(--success)', fontSize: 11, fontWeight: 700, letterSpacing: 0.3 },
};

import { BookOpen, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectionStore } from '../store';
import IconButton from '../lib/components/IconButton';
import Badge from '../lib/components/Badge';

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
        <IconButton
          icon={<RefreshCw size={16} />}
          variant="ghost"
          size="sm"
          onClick={handleReconnect}
          disabled={isReconnecting}
          title="Refresh connection"
          className={isReconnecting ? 'icon-spin' : ''}
        />

        <div style={styles.status}>
          {connectionStatus?.connected ? (
            <Badge
              variant="success"
              dot
              pulse
              title={`Connected: ${connectionStatus.model}`}
              className="pop-in"
            >
              {formatModelName(connectionStatus.model)}
            </Badge>
          ) : (
            <Badge variant="default" title="Ollama not connected">
              Offline
            </Badge>
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
    padding: '10px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    flexShrink: 0,
    zIndex: 10,
    position: 'relative',
  },
  headerBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(99,102,241,0.04), transparent, rgba(168,85,247,0.03))',
    pointerEvents: 'none',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: 'inherit',
    position: 'relative',
    zIndex: 1,
  },
  logoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
  logoText: {
    fontSize: 17,
    fontWeight: 800,
    background: 'linear-gradient(135deg, var(--text-primary), var(--primary-light))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: -0.3,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    zIndex: 1,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
  },
};

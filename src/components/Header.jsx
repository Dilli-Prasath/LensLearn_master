import { BookOpen, RefreshCw, Loader } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConnectionStore, useScanStore } from '../store';
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
  if (m.startsWith('gemini')) {
    return model.replace('gemini-', 'Gemini ').replace('-', ' ');
  }
  return model;
}

export default function Header() {
  const connectionStatus = useConnectionStore((s) => s.status);
  const provider = useConnectionStore((s) => s.provider);
  const checkConnection = useConnectionStore((s) => s.check);
  const isProcessing = useScanStore((s) => s.isProcessing);
  const isStreaming = useScanStore((s) => s.isStreaming);
  const navigate = useNavigate();
  const location = useLocation();
  const [isReconnecting, setIsReconnecting] = useState(false);
  // Show processing banner on non-explanation pages when AI is working
  const showProcessingBanner = (isProcessing || isStreaming) && location.pathname !== '/explain';

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
              title={`${provider === 'ollama' ? 'Local' : 'Cloud'}: ${connectionStatus.model}`}
              className="pop-in"
            >
              {provider !== 'ollama' ? '☁️ ' : ''}{formatModelName(connectionStatus.model)}
            </Badge>
          ) : (
            <Badge variant="default" title="AI not connected">
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Global processing banner — shows on non-explanation pages */}
      {showProcessingBanner && (
        <div
          style={styles.processingBanner}
          onClick={() => navigate('/explain')}
          role="button"
          tabIndex={0}
        >
          <div className="icon-spin" style={{ display: 'flex' }}>
            <Loader size={14} />
          </div>
          <span>AI is generating your explanation...</span>
          <span style={styles.processingTap}>Tap to view</span>
        </div>
      )}
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
  processingBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '8px 16px',
    background: 'linear-gradient(90deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
    borderBottom: '1px solid rgba(99,102,241,0.2)',
    fontSize: 13, fontWeight: 600,
    color: 'var(--primary-light)',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  processingTap: {
    fontSize: 11, fontWeight: 700, opacity: 0.7,
    background: 'rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: 10,
  },
};

import { useState } from 'react';
import { Settings, Wifi, WifiOff, BookOpen } from 'lucide-react';

export default function Header({ connectionStatus, onSettingsClick }) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.logo}>
          <BookOpen size={22} color="var(--primary-light)" />
          <span style={styles.logoText}>LensLearn</span>
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.status}>
          {connectionStatus?.connected ? (
            <div style={styles.statusBadge} title={`Connected: ${connectionStatus.model}`}>
              <Wifi size={14} color="var(--success)" />
              <span style={{ color: 'var(--success)', fontSize: 12 }}>Gemma 4</span>
            </div>
          ) : (
            <div style={styles.statusBadge} title="Ollama not connected">
              <WifiOff size={14} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Offline</span>
            </div>
          )}
        </div>
        <button style={styles.settingsBtn} onClick={onSettingsClick} aria-label="Settings">
          <Settings size={20} color="var(--text-secondary)" />
        </button>
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
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  status: { display: 'flex', alignItems: 'center' },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 20,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
  },
  settingsBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
  },
};

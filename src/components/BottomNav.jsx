import { Home, Camera, BookOpen, Clock, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan', icon: Camera },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav style={styles.nav} className="safe-area-padding">
      <div style={styles.navInner}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isScan = tab.id === 'scan';
          return (
            <button
              key={tab.id}
              style={{
                ...styles.navItem,
                ...(isActive && !isScan ? styles.navItemActive : {}),
                ...(isScan ? styles.scanNavItem : {}),
              }}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isScan ? (
                <div style={{
                  ...styles.scanIconBg,
                  ...(isActive ? styles.scanIconBgActive : {}),
                }}>
                  <Icon size={20} />
                </div>
              ) : (
                <Icon
                  size={21}
                  style={{
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    ...(isActive ? { transform: 'scale(1.1)' } : {}),
                  }}
                />
              )}
              <span style={{
                ...styles.navLabel,
                ...(isScan && isActive ? { color: 'var(--primary-light)' } : {}),
              }}>{tab.label}</span>
              {isActive && <div style={styles.activeIndicator} className="scale-in" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--border)',
    zIndex: 50,
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.35)',
  },
  navInner: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    maxWidth: 960,
    margin: '0 auto',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: '6px 10px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    transition: 'color 0.2s',
    position: 'relative',
    flex: 1,
  },
  navItemActive: {
    color: 'var(--primary-light)',
  },
  scanNavItem: {
    color: 'var(--text-muted)',
  },
  // Scan icon — filled rounded square background, stays inside the nav
  scanIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
    color: 'var(--text-secondary)',
  },
  scanIconBgActive: {
    background: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'white',
    transform: 'scale(1.05)',
    boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
  },
  navLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 16,
    height: 3,
    borderRadius: 2,
    background: 'var(--primary-light)',
  },
};

import { Home, Camera, Clock, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan', icon: Camera },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav style={styles.nav} className="safe-area-padding">
      <div style={styles.navInner}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={24} style={styles.navIcon} />
              <span style={styles.navLabel}>{tab.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
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
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid var(--border)',
    zIndex: 50,
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
  },
  navInner: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    maxWidth: 480,
    margin: '0 auto',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    transition: 'all var(--transition-fast)',
    position: 'relative',
    flex: 1,
  },
  navItemActive: {
    color: 'var(--primary-light)',
  },
  navIcon: {
    transition: 'all var(--transition-fast)',
  },
  navLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -14,
    width: 3,
    height: 3,
    borderRadius: '50%',
    background: 'var(--primary-light)',
    animation: 'pulse 2s infinite',
  },
};

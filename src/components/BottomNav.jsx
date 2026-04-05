import { Home, Camera, BookOpen, Clock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const TAB_ROUTES = {
  home: '/',
  scan: '/scan',
  subjects: '/subjects',
  history: '/history',
  settings: '/settings',
};

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'scan', label: 'Scan', icon: Camera },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ activeTab }) {
  const navigate = useNavigate();

  return (
    <nav
      style={styles.nav}
      role="navigation"
      aria-label="Main navigation"
      id="bottom-nav"
    >
      <div style={styles.topBorder} aria-hidden="true" />
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
              }}
              onClick={() => navigate(TAB_ROUTES[tab.id])}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isScan ? (
                <div
                  style={{
                    ...styles.scanBtn,
                    ...(isActive ? styles.scanBtnActive : {}),
                  }}
                >
                  <Icon size={20} />
                  {isActive && (
                    <div style={styles.scanRing} className="orbit-ring" />
                  )}
                </div>
              ) : (
                <div style={styles.iconWrap}>
                  <Icon
                    size={20}
                    style={{
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      ...(isActive ? { transform: 'scale(1.1)' } : {}),
                    }}
                  />
                  {isActive && (
                    <div style={styles.glowDot} className="pop-in" />
                  )}
                </div>
              )}
              <span
                style={{
                  ...styles.navLabel,
                  ...(isActive ? styles.navLabelActive : {}),
                }}
              >
                {tab.label}
              </span>
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
    background: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    zIndex: 50,
    boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.3)',
  },
  topBorder: {
    height: 1,
    background:
      'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(168,85,247,0.2), transparent)',
  },
  navInner: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    maxWidth: 'var(--layout-max-width, 1200px)',
    margin: '0 auto',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '6px 10px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 500,
    transition: 'color 0.2s',
    position: 'relative',
    flex: 1,
  },
  navItemActive: { color: 'var(--primary-light)' },
  iconWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'var(--primary-light)',
    boxShadow: '0 0 8px rgba(99,102,241,0.6)',
  },
  scanBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    background: 'rgba(30,41,59,0.6)',
    border: '1.5px solid rgba(99,102,241,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    color: 'var(--text-secondary)',
    position: 'relative',
  },
  scanBtnActive: {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    borderColor: 'var(--primary)',
    color: 'white',
    transform: 'scale(1.08)',
    boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
  },
  scanRing: {
    position: 'absolute',
    inset: -5,
    border: '1.5px dashed rgba(99,102,241,0.3)',
    borderRadius: 17,
    pointerEvents: 'none',
  },
  navLabel: { fontSize: 10, letterSpacing: 0.3, fontWeight: 500 },
  navLabelActive: { fontWeight: 700, color: 'var(--primary-light)' },
};

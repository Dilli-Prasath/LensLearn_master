import { X, Globe, GraduationCap, Cpu } from 'lucide-react';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese',
  'Hindi', 'Tamil', 'Bengali', 'Arabic', 'Chinese',
  'Japanese', 'Korean', 'Indonesian', 'Swahili', 'Russian'
];

const GRADE_LEVELS = [
  'elementary school (ages 6-10)',
  'middle school (ages 11-13)',
  'high school (ages 14-17)',
  'college / university',
  'professional / advanced'
];

export default function SettingsPanel({ settings, onChange, connectionStatus, onClose }) {
  const update = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} className="slide-up" onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Language */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Globe size={18} color="var(--primary-light)" />
              <span>Explanation Language</span>
            </div>
            <div style={styles.chips}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  style={{
                    ...styles.chip,
                    ...(settings.language === lang ? styles.chipActive : {})
                  }}
                  onClick={() => update('language', lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Level */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <GraduationCap size={18} color="var(--primary-light)" />
              <span>Learning Level</span>
            </div>
            <div style={styles.options}>
              {GRADE_LEVELS.map(level => (
                <button
                  key={level}
                  style={{
                    ...styles.option,
                    ...(settings.gradeLevel === level ? styles.optionActive : {})
                  }}
                  onClick={() => update('gradeLevel', level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Connection Status */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Cpu size={18} color="var(--primary-light)" />
              <span>AI Model</span>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Status</span>
                <span className={`badge ${connectionStatus?.connected ? 'badge-success' : 'badge-error'}`}>
                  {connectionStatus?.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {connectionStatus?.connected && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Model</span>
                  <span style={styles.infoValue}>{connectionStatus.model}</span>
                </div>
              )}
              {!connectionStatus?.connected && (
                <p style={styles.helpText}>
                  Start Ollama on your computer and run:<br />
                  <code style={styles.codeBlock}>ollama pull gemma4:e4b</code>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            LensLearn v1.0 - Powered by Gemma 4
          </p>
          <p style={styles.footerSubtext}>
            Point your lens. Learn anything.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85vh',
    background: 'var(--bg-dark)',
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--border)',
  },
  title: { fontSize: 20, fontWeight: 700 },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 12 },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 600,
    fontSize: 15,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    padding: '8px 14px',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  chipActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-light)',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  option: {
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    textTransform: 'capitalize',
    transition: 'all 0.15s',
    width: '100%',
  },
  optionActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-light)',
  },
  infoCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    border: '1px solid var(--border)',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: { fontSize: 13, color: 'var(--text-muted)' },
  infoValue: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' },
  helpText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  codeBlock: {
    display: 'inline-block',
    background: 'var(--bg-dark)',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  footer: {
    padding: '16px 20px 24px',
    borderTop: '1px solid var(--border)',
    textAlign: 'center',
  },
  footerText: { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 },
  footerSubtext: { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 },
};

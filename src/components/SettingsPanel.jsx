import { useState } from 'react';
import { Globe, GraduationCap, Cpu, Trash2, Info, Eye, Volume2 } from 'lucide-react';
import historyService from '../services/historyService';

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

export default function SettingsPanel({ settings, onChange, connectionStatus }) {
  const update = (key, value) => onChange({ ...settings, [key]: value });

  const TEXT_SIZES = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'xlarge' }
  ];

  const handleResetData = () => {
    if (window.confirm('Reset all data? This cannot be undone.')) {
      historyService.clearHistory();
      onChange({
        language: 'English',
        gradeLevel: 'middle school (ages 11-13)',
        subject: 'auto-detect',
      });
    }
  };

  return (
    <div style={styles.container} className="page">
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
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


          {/* Accessibility Features */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Eye size={18} color="var(--primary-light)" />
              <span>Accessibility</span>
            </div>

            {/* Text Size */}
            <div style={styles.subsection}>
              <label style={styles.subsectionLabel}>Text Size</label>
              <div style={styles.textSizeButtons}>
                {TEXT_SIZES.map(size => (
                  <button
                    key={size.value}
                    style={{
                      ...styles.textSizeBtn,
                      ...(settings.textSize === size.value ? styles.textSizeBtnActive : {})
                    }}
                    onClick={() => update('textSize', size.value)}
                    title={`Set text size to ${size.label}`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Mode */}
            <div style={styles.subsection}>
              <div style={styles.toggleRow}>
                <label style={styles.toggleLabel}>High Contrast Mode</label>
                <button
                  style={{
                    ...styles.toggleSwitch,
                    ...(settings.highContrast ? styles.toggleSwitchActive : {})
                  }}
                  onClick={() => update('highContrast', !settings.highContrast)}
                  title={settings.highContrast ? 'Disable high contrast' : 'Enable high contrast'}
                >
                  <div style={{
                    ...styles.toggleCircle,
                    ...(settings.highContrast ? styles.toggleCircleActive : {})
                  }} />
                </button>
              </div>
            </div>

            {/* Reduce Animations */}
            <div style={styles.subsection}>
              <div style={styles.toggleRow}>
                <label style={styles.toggleLabel}>Reduce Animations</label>
                <button
                  style={{
                    ...styles.toggleSwitch,
                    ...(settings.reduceAnimations ? styles.toggleSwitchActive : {})
                  }}
                  onClick={() => update('reduceAnimations', !settings.reduceAnimations)}
                  title={settings.reduceAnimations ? 'Enable animations' : 'Disable animations'}
                >
                  <div style={{
                    ...styles.toggleCircle,
                    ...(settings.reduceAnimations ? styles.toggleCircleActive : {})
                  }} />
                </button>
              </div>
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

          {/* Data Management */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Trash2 size={18} color="var(--primary-light)" />
              <span>Data</span>
            </div>
            <button
              style={styles.dangerBtn}
              onClick={handleResetData}
            >
              <Trash2 size={16} />
              Clear All Data
            </button>
          </div>

          {/* About */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Info size={18} color="var(--primary-light)" />
              <span>About</span>
            </div>
            <div style={styles.aboutCard}>
              <p style={styles.aboutText}>
                <strong>LensLearn v1.0</strong>
              </p>
              <p style={styles.aboutSubtext}>
                Powered by Gemma 4
              </p>
              <p style={styles.aboutTagline}>
                Point your lens. Learn anything.
              </p>
            </div>
          </div>
      </div>

      {/* Bottom Padding */}
      <div style={styles.bottomPadding} />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 960,
    margin: '0 auto',
  },
  header: {
    padding: '24px 16px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 16px 100px',
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
  themeBtn: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all var(--transition)',
  },
  dangerBtn: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius)',
    color: '#ef4444',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    transition: 'all var(--transition)',
  },
  aboutCard: {
    padding: 16,
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  aboutSubtext: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginBottom: 8,
  },
  aboutTagline: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 20,
  },
  subsection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 0',
    borderBottom: '1px solid var(--border-light)',
  },
  subsectionLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  textSizeButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: 8,
  },
  textSizeBtn: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all var(--transition-fast)',
  },
  textSizeBtnActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-light)',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    border: 'none',
    background: 'var(--bg-card-hover)',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    transition: 'background var(--transition-fast)',
  },
  toggleSwitchActive: {
    background: 'var(--primary)',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    background: 'white',
    transition: 'transform var(--transition-fast)',
  },
  toggleCircleActive: {
    transform: 'translateX(20px)',
  },
};

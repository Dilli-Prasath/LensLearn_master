import { useState } from 'react';
import {
  Globe, GraduationCap, Cpu, Trash2, Info, Eye, Palette,
  Type, Circle, Square, Sparkles, Target, Brain, ChevronRight,
  BookOpen, Zap,
} from 'lucide-react';
import historyService from '../services/historyService';
import { THEMES, ACCENT_COLORS, FONT_OPTIONS, BORDER_RADIUS_OPTIONS, LAYOUT_WIDTH_OPTIONS } from '../utils/themes';

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
  return model;
}

export default function SettingsPanel({ settings, onChange, connectionStatus }) {
  const [activeSection, setActiveSection] = useState(null);
  const update = (key, value) => onChange({ ...settings, [key]: value });

  const TEXT_SIZES = [
    { label: 'S', value: 'small' },
    { label: 'M', value: 'medium' },
    { label: 'L', value: 'large' },
    { label: 'XL', value: 'xlarge' }
  ];

  const handleResetData = () => {
    if (window.confirm('Reset all data? This cannot be undone.')) {
      historyService.clearHistory();
      onChange({
        ...settings,
        language: 'English',
        gradeLevel: 'middle school (ages 11-13)',
        subject: 'auto-detect',
      });
    }
  };

  const handleResetCustomization = () => {
    if (window.confirm('Reset all appearance settings to defaults?')) {
      onChange({
        ...settings,
        theme: 'dark',
        accentColor: 'indigo',
        font: 'inter',
        borderRadius: 'medium',
        layoutWidth: 'wide',
        textSize: 'medium',
        highContrast: false,
        reduceAnimations: false,
      });
    }
  };

  // Collapsible section component
  const Section = ({ id, icon: Icon, title, badge, children }) => {
    const isOpen = activeSection === id;
    return (
      <div style={styles.section}>
        <button style={styles.sectionBtn} onClick={() => setActiveSection(isOpen ? null : id)}>
          <div style={styles.sectionBtnLeft}>
            <div style={styles.sectionIconWrap}>
              <Icon size={18} color="var(--primary-light)" />
            </div>
            <span style={styles.sectionBtnTitle}>{title}</span>
          </div>
          <div style={styles.sectionBtnRight}>
            {badge && <span style={styles.sectionBadge}>{badge}</span>}
            <ChevronRight
              size={16}
              color="var(--text-muted)"
              style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }}
            />
          </div>
        </button>
        {isOpen && (
          <div style={styles.sectionContent} className="fade-in">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container} className="page">
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Customize your learning experience</p>
      </div>

      <div style={styles.content}>

        {/* ===== APPEARANCE ===== */}
        <Section id="appearance" icon={Palette} title="Appearance" badge={THEMES[settings.theme || 'dark']?.name}>
          {/* Theme */}
          <div style={styles.subsection}>
            <label style={styles.label}>Theme</label>
            <div style={styles.themeGrid}>
              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  style={{
                    ...styles.themeCard,
                    borderColor: (settings.theme || 'dark') === t.id ? 'var(--primary)' : 'var(--border)',
                    boxShadow: (settings.theme || 'dark') === t.id ? '0 0 0 2px var(--primary)' : 'none',
                  }}
                  onClick={() => update('theme', t.id)}
                >
                  <div style={styles.themePreview}>
                    <div style={{ ...styles.themePreviewBg, background: t.preview.bg }}>
                      <div style={{ ...styles.themePreviewCard, background: t.preview.card }}>
                        <div style={{ width: '60%', height: 3, borderRadius: 2, background: t.preview.text, opacity: 0.7 }} />
                        <div style={{ width: '40%', height: 3, borderRadius: 2, background: t.preview.text, opacity: 0.4 }} />
                      </div>
                    </div>
                  </div>
                  <span style={{
                    ...styles.themeLabel,
                    color: (settings.theme || 'dark') === t.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                    fontWeight: (settings.theme || 'dark') === t.id ? 700 : 500,
                  }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div style={styles.subsection}>
            <label style={styles.label}>Accent Color</label>
            <div style={styles.colorGrid}>
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.id}
                  style={{
                    ...styles.colorSwatch,
                    background: color.primary,
                    boxShadow: (settings.accentColor || 'indigo') === color.id
                      ? `0 0 0 3px var(--bg-dark), 0 0 0 5px ${color.primary}`
                      : 'none',
                    transform: (settings.accentColor || 'indigo') === color.id ? 'scale(1.15)' : 'scale(1)',
                  }}
                  onClick={() => update('accentColor', color.id)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Font */}
          <div style={styles.subsection}>
            <label style={styles.label}>Font</label>
            <div style={styles.fontGrid}>
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.id}
                  style={{
                    ...styles.fontBtn,
                    fontFamily: f.family,
                    borderColor: (settings.font || 'inter') === f.id ? 'var(--primary)' : 'var(--border)',
                    color: (settings.font || 'inter') === f.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: (settings.font || 'inter') === f.id ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                  }}
                  onClick={() => update('font', f.id)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div style={styles.subsection}>
            <label style={styles.label}>Corner Style</label>
            <div style={styles.radiusGrid}>
              {BORDER_RADIUS_OPTIONS.map(r => (
                <button
                  key={r.id}
                  style={{
                    ...styles.radiusBtn,
                    borderRadius: r.radius,
                    borderColor: (settings.borderRadius || 'medium') === r.id ? 'var(--primary)' : 'var(--border)',
                    color: (settings.borderRadius || 'medium') === r.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: (settings.borderRadius || 'medium') === r.id ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                  }}
                  onClick={() => update('borderRadius', r.id)}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Width */}
          <div style={styles.subsection}>
            <label style={styles.label}>Layout Width</label>
            <div style={styles.radiusGrid}>
              {LAYOUT_WIDTH_OPTIONS.map(l => (
                <button
                  key={l.id}
                  style={{
                    ...styles.radiusBtn,
                    borderColor: (settings.layoutWidth || 'wide') === l.id ? 'var(--primary)' : 'var(--border)',
                    color: (settings.layoutWidth || 'wide') === l.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: (settings.layoutWidth || 'wide') === l.id ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                  }}
                  onClick={() => update('layoutWidth', l.id)}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reset appearance */}
          <button style={styles.resetBtn} onClick={handleResetCustomization}>
            Reset to Defaults
          </button>
        </Section>

        {/* ===== ACCESSIBILITY ===== */}
        <Section id="accessibility" icon={Eye} title="Accessibility" badge={settings.textSize || 'medium'}>
          {/* Text Size */}
          <div style={styles.subsection}>
            <label style={styles.label}>Text Size</label>
            <div style={styles.textSizeRow}>
              {TEXT_SIZES.map(size => (
                <button
                  key={size.value}
                  style={{
                    ...styles.textSizeBtn,
                    borderColor: settings.textSize === size.value ? 'var(--primary)' : 'var(--border)',
                    color: settings.textSize === size.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: settings.textSize === size.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                  }}
                  onClick={() => update('textSize', size.value)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <ToggleRow
            label="High Contrast Mode"
            description="Increases text contrast for better readability"
            value={settings.highContrast}
            onChange={() => update('highContrast', !settings.highContrast)}
          />
          <ToggleRow
            label="Reduce Animations"
            description="Disables all animations and transitions"
            value={settings.reduceAnimations}
            onChange={() => update('reduceAnimations', !settings.reduceAnimations)}
          />
        </Section>

        {/* ===== LEARNING ===== */}
        <Section id="learning" icon={Brain} title="Learning" badge={settings.language}>
          {/* Language */}
          <div style={styles.subsection}>
            <label style={styles.label}>Explanation Language</label>
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
          <div style={styles.subsection}>
            <label style={styles.label}>Learning Level</label>
            <div style={styles.optionsList}>
              {GRADE_LEVELS.map(level => (
                <button
                  key={level}
                  style={{
                    ...styles.optionBtn,
                    ...(settings.gradeLevel === level ? styles.optionBtnActive : {})
                  }}
                  onClick={() => update('gradeLevel', level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div style={styles.subsection}>
            <label style={styles.label}>Daily Scan Goal</label>
            <div style={styles.goalRow}>
              {[1, 3, 5, 10].map(g => (
                <button
                  key={g}
                  style={{
                    ...styles.goalBtn,
                    borderColor: (settings.dailyGoal || 3) === g ? 'var(--primary)' : 'var(--border)',
                    color: (settings.dailyGoal || 3) === g ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: (settings.dailyGoal || 3) === g ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                  }}
                  onClick={() => update('dailyGoal', g)}
                >
                  {g}
                </button>
              ))}
              <span style={styles.goalUnit}>scans/day</span>
            </div>
          </div>

          {/* Auto features */}
          <ToggleRow
            label="Auto-Quiz After Scan"
            description="Automatically generate a quiz after each explanation"
            value={settings.autoQuiz || false}
            onChange={() => update('autoQuiz', !(settings.autoQuiz || false))}
          />
          <ToggleRow
            label="Auto-Save Sessions"
            description="Automatically save every scan to history"
            value={settings.autoSave !== false}
            onChange={() => update('autoSave', settings.autoSave === false ? true : false)}
          />
          <ToggleRow
            label="Show Study Tips"
            description="Display study tips on the home page"
            value={settings.showTips !== false}
            onChange={() => update('showTips', settings.showTips === false ? true : false)}
          />
        </Section>

        {/* ===== AI MODEL ===== */}
        <Section id="ai" icon={Cpu} title="AI Model" badge={connectionStatus?.connected ? 'Connected' : 'Offline'}>
          <div style={styles.infoCard}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Status</span>
              <span style={{
                ...styles.statusBadge,
                background: connectionStatus?.connected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: connectionStatus?.connected ? 'var(--success)' : 'var(--error)',
              }}>
                {connectionStatus?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {connectionStatus?.connected && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Model</span>
                <span style={styles.infoValue}>{formatModelName(connectionStatus.model)}</span>
              </div>
            )}
            {connectionStatus?.connected && connectionStatus.models?.length > 0 && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Available</span>
                <span style={styles.infoValue}>{connectionStatus.models.length} models</span>
              </div>
            )}
            {!connectionStatus?.connected && (
              <p style={styles.helpText}>
                Start Ollama on your computer and run:<br />
                <code style={styles.codeBlock}>ollama pull gemma4:e4b</code>
              </p>
            )}
          </div>
        </Section>

        {/* ===== DATA ===== */}
        <Section id="data" icon={Trash2} title="Data Management">
          <button style={styles.dangerBtn} onClick={handleResetData}>
            <Trash2 size={16} />
            Clear All Data
          </button>
          <p style={styles.dangerHint}>This will delete all scan history, quiz results, and bookmarks.</p>
        </Section>

        {/* ===== ABOUT ===== */}
        <Section id="about" icon={Info} title="About">
          <div style={styles.aboutCard}>
            <div style={styles.aboutLogo}>
              <BookOpen size={28} color="var(--primary-light)" />
            </div>
            <p style={styles.aboutName}>LensLearn v1.0</p>
            <p style={styles.aboutPowered}>Powered by Gemma 4</p>
            <p style={styles.aboutTagline}>Point your lens. Learn anything.</p>
            <div style={styles.aboutLinks}>
              <span style={styles.aboutLink}>Made for Gemma 4 Good Hackathon</span>
            </div>
          </div>
        </Section>

      </div>

      <div style={styles.bottomPadding} />
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div style={styles.toggleRow}>
      <div style={styles.toggleInfo}>
        <span style={styles.toggleLabel}>{label}</span>
        {description && <span style={styles.toggleDesc}>{description}</span>}
      </div>
      <button
        style={{
          ...styles.toggleSwitch,
          background: value ? 'var(--primary)' : 'var(--bg-card-hover)',
        }}
        onClick={onChange}
      >
        <div style={{
          ...styles.toggleCircle,
          transform: value ? 'translateX(20px)' : 'translateX(0)',
        }} />
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 'var(--layout-max-width, 1200px)',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    padding: '24px 16px 16px',
    borderBottom: '1px solid var(--border)',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px 100px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  // Section
  section: {
    borderBottom: '1px solid var(--border)',
  },
  sectionBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary)',
  },
  sectionBtnLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(99,102,241,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBtnTitle: {
    fontSize: 15,
    fontWeight: 600,
  },
  sectionBtnRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    padding: '2px 8px',
    background: 'var(--bg-card)',
    borderRadius: 8,
    textTransform: 'capitalize',
  },
  sectionContent: {
    padding: '4px 4px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  // Subsection
  subsection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Theme grid
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: 8,
  },
  themeCard: {
    padding: 8,
    borderRadius: 'var(--radius)',
    border: '2px solid var(--border)',
    background: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  themePreview: {
    width: '100%',
    height: 42,
    borderRadius: 6,
    overflow: 'hidden',
  },
  themePreviewBg: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  themePreviewCard: {
    width: '80%',
    height: '100%',
    borderRadius: 4,
    padding: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    justifyContent: 'center',
  },
  themeLabel: {
    fontSize: 11,
    fontWeight: 500,
  },

  // Color grid
  colorGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Font grid
  fontGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 8,
  },
  fontBtn: {
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Radius grid
  radiusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: 8,
  },
  radiusBtn: {
    padding: '10px 8px',
    border: '1.5px solid var(--border)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
  },

  // Text size
  textSizeRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
    gap: 8,
  },
  textSizeBtn: {
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Daily goal
  goalRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  goalBtn: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalUnit: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginLeft: 4,
  },

  // Toggle
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid var(--divider)',
  },
  toggleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    paddingRight: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  toggleDesc: {
    fontSize: 11,
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: 2,
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    background: 'white',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },

  // Chips (language)
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    padding: '6px 12px',
    borderRadius: 16,
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: 12,
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

  // Options list (grade level)
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  optionBtn: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    textTransform: 'capitalize',
    transition: 'all 0.15s',
    width: '100%',
  },
  optionBtnActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-light)',
  },

  // Info card (AI model)
  infoCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    border: '1px solid var(--border)',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: { fontSize: 13, color: 'var(--text-muted)' },
  infoValue: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  statusBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 10,
  },
  helpText: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  codeBlock: {
    display: 'inline-block',
    background: 'var(--bg-dark)',
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },

  // Danger
  dangerBtn: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius)',
    color: '#ef4444',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  dangerHint: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginTop: 4,
  },
  resetBtn: {
    padding: '8px 16px',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s',
    alignSelf: 'flex-start',
  },

  // About
  aboutCard: {
    padding: 20,
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  aboutLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'rgba(99,102,241,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  aboutName: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  aboutPowered: {
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  aboutTagline: {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  aboutLinks: {
    marginTop: 8,
  },
  aboutLink: {
    fontSize: 11,
    color: 'var(--primary-light)',
    fontWeight: 500,
  },

  bottomPadding: {
    height: 20,
  },
};

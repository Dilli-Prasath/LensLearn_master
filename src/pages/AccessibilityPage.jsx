/**
 * AccessibilityPage — Inclusive settings for ALL users.
 * Designed with large touch targets, clear labels, and screen reader support.
 *
 * Categories:
 *   1. Vision (blind, low vision, color blind)
 *   2. Hearing & Speech (TTS, voice control)
 *   3. Motor & Physical (large buttons, sticky buttons)
 *   4. Cognitive & Learning (simplified UI, guided mode, children mode)
 */
import { Eye, Ear, Hand, Brain, Volume2, Mic, ZoomIn, Contrast, Palette, ArrowLeft, RotateCcw, Sparkles, Heart, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccessibilityStore } from '../store';
import { announce } from '../components/accessibility/ScreenReaderAnnouncer';
import Button from '../lib/components/Button';
import Card from '../lib/components/Card';

/* ─── Toggle component with proper a11y ─── */
function Toggle({ label, description, checked, onChange, icon: Icon }) {
  const id = `toggle-${label.replace(/\s/g, '-').toLowerCase()}`;
  return (
    <div style={styles.toggleRow} role="group" aria-labelledby={`${id}-label`}>
      <div style={styles.toggleLeft}>
        {Icon && (
          <div style={styles.toggleIcon} aria-hidden="true">
            <Icon size={18} color="var(--primary-light)" />
          </div>
        )}
        <div>
          <label id={`${id}-label`} htmlFor={id} style={styles.toggleLabel}>{label}</label>
          {description && <p style={styles.toggleDesc}>{description}</p>}
        </div>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => { onChange(!checked); announce(`${label} ${!checked ? 'enabled' : 'disabled'}`); }}
        style={{
          ...styles.toggleSwitch,
          background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        }}
      >
        <div style={{
          ...styles.toggleKnob,
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
        }} />
      </button>
    </div>
  );
}

/* ─── Choice chips ─── */
function ChipGroup({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} style={styles.chipGroup}>
      <span style={styles.chipLabel}>{label}</span>
      <div style={styles.chips}>
        {options.map(opt => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => { onChange(opt.value); announce(`${label}: ${opt.label}`); }}
            style={{
              ...styles.chip,
              ...(value === opt.value ? styles.chipActive : {}),
            }}
          >
            {opt.emoji && <span aria-hidden="true">{opt.emoji}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Section header ─── */
function Section({ icon: Icon, title, color, children }) {
  return (
    <Card variant="glass" style={styles.section} role="region" aria-labelledby={`section-${title.replace(/\s/g, '-')}`}>
      <div style={styles.sectionHeader}>
        <div style={{ ...styles.sectionIconWrap, background: `${color}20` }}>
          <Icon size={18} color={color} />
        </div>
        <h2 id={`section-${title.replace(/\s/g, '-')}`} style={styles.sectionTitle}>{title}</h2>
      </div>
      <div style={styles.sectionContent}>{children}</div>
    </Card>
  );
}

export default function AccessibilityPage() {
  const navigate = useNavigate();
  const a11y = useAccessibilityStore();

  const handleReset = () => {
    a11y.resetAll();
    a11y.applyToDOM();
    announce('All accessibility settings reset to defaults');
  };

  return (
    <div style={styles.page} role="main" aria-label="Accessibility Settings">

      {/* Header */}
      <div style={styles.header}>
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={() => navigate('/settings')}
          aria-label="Back to Settings"
        />
        <div>
          <h1 style={styles.pageTitle}>Accessibility</h1>
          <p style={styles.pageSubtitle}>Make LensLearn work for everyone</p>
        </div>
      </div>

      {/* Quick enable banner */}
      <div style={styles.quickBanner} role="note">
        <Heart size={16} color="#f472b6" aria-hidden="true" />
        <span style={styles.quickBannerText}>
          LensLearn is designed for students of all abilities — vision, hearing, motor, and cognitive.
        </span>
      </div>

      {/* ═══ VISION ═══ */}
      <Section icon={Eye} title="Vision" color="#6366f1">
        <Toggle
          label="Screen Reader Mode"
          description="Enhanced labels, auto-announcements, semantic navigation for blind users"
          checked={a11y.screenReaderMode}
          onChange={(v) => { a11y.setSetting('screenReaderMode', v); a11y.applyToDOM(); }}
          icon={Eye}
        />
        <Toggle
          label="High Contrast"
          description="Stronger colors and borders for low vision"
          checked={a11y.highContrast}
          onChange={(v) => { a11y.setSetting('highContrast', v); a11y.applyToDOM(); }}
          icon={Contrast}
        />
        <Toggle
          label="Extra-Large Focus Ring"
          description="Bright 4px focus ring on all interactive elements"
          checked={a11y.focusHighlight}
          onChange={(v) => { a11y.setSetting('focusHighlight', v); a11y.applyToDOM(); }}
        />
        <Toggle
          label="Large Buttons"
          description="All buttons and touch targets at least 48px for easier tapping"
          checked={a11y.largeButtons}
          onChange={(v) => { a11y.setSetting('largeButtons', v); a11y.applyToDOM(); }}
          icon={ZoomIn}
        />
        <ChipGroup
          label="Text Size"
          value={a11y.textSize}
          onChange={(v) => { a11y.setSetting('textSize', v); a11y.applyToDOM(); }}
          options={[
            { value: 'small', label: 'Small', emoji: 'A' },
            { value: 'medium', label: 'Medium', emoji: 'A' },
            { value: 'large', label: 'Large', emoji: 'A' },
            { value: 'xlarge', label: 'X-Large', emoji: 'A' },
          ]}
        />
        <ChipGroup
          label="Color Blind Support"
          value={a11y.colorBlindMode}
          onChange={(v) => { a11y.setSetting('colorBlindMode', v); a11y.applyToDOM(); }}
          options={[
            { value: 'none', label: 'Off' },
            { value: 'protanopia', label: 'Red-Blind' },
            { value: 'deuteranopia', label: 'Green-Blind' },
            { value: 'tritanopia', label: 'Blue-Blind' },
          ]}
        />
        <Toggle
          label="Reduce Animations"
          description="Stop all motion for users sensitive to movement"
          checked={a11y.reduceAnimations}
          onChange={(v) => { a11y.setSetting('reduceAnimations', v); a11y.applyToDOM(); }}
        />
      </Section>

      {/* ═══ HEARING & SPEECH ═══ */}
      <Section icon={Ear} title="Hearing & Speech" color="#10b981">
        <Toggle
          label="Auto-Read Explanations"
          description="Read AI explanations aloud automatically when they finish loading"
          checked={a11y.autoReadExplanations}
          onChange={(v) => a11y.setSetting('autoReadExplanations', v)}
          icon={Volume2}
        />
        <ChipGroup
          label="Speech Speed"
          value={String(a11y.speechRate)}
          onChange={(v) => a11y.setSetting('speechRate', parseFloat(v))}
          options={[
            { value: '0.5', label: 'Slow' },
            { value: '0.8', label: 'Relaxed' },
            { value: '1.0', label: 'Normal' },
            { value: '1.5', label: 'Fast' },
          ]}
        />
        <Toggle
          label="Voice Control"
          description='Say "help" for commands. Navigate hands-free: "go home", "scan", "read aloud", "scroll down"'
          checked={a11y.voiceControlEnabled}
          onChange={(v) => a11y.setSetting('voiceControlEnabled', v)}
          icon={Mic}
        />
      </Section>

      {/* ═══ MOTOR & PHYSICAL ═══ */}
      <Section icon={Hand} title="Motor & Physical" color="#f59e0b">
        <Toggle
          label="Large Touch Targets"
          description="Make all buttons and links at least 48px for easier tapping"
          checked={a11y.largeButtons}
          onChange={(v) => { a11y.setSetting('largeButtons', v); a11y.applyToDOM(); }}
        />
        <Toggle
          label="Sticky Buttons"
          description="No need to hold buttons — a single tap activates them"
          checked={a11y.stickyButtons}
          onChange={(v) => a11y.setSetting('stickyButtons', v)}
        />
      </Section>

      {/* ═══ COGNITIVE & LEARNING ═══ */}
      <Section icon={Brain} title="Cognitive & Learning" color="#a855f7">
        <Toggle
          label="Simplified Mode"
          description="Hides advanced features. Shows only: Scan, Read, Quiz. Perfect for young children or first-time users"
          checked={a11y.simplifiedUI}
          onChange={(v) => { a11y.setSetting('simplifiedUI', v); a11y.applyToDOM(); }}
          icon={Sparkles}
        />
        <Toggle
          label="Guided Mode"
          description="Step-by-step instructions with arrows showing what to do next"
          checked={a11y.guidedMode}
          onChange={(v) => { a11y.setSetting('guidedMode', v); a11y.applyToDOM(); }}
          icon={HelpCircle}
        />
        <Toggle
          label="Emoji Labels"
          description="Add emojis to buttons and labels for children who can't read yet"
          checked={a11y.emojiLabels}
          onChange={(v) => { a11y.setSetting('emojiLabels', v); a11y.applyToDOM(); }}
        />
      </Section>

      {/* Reset */}
      <Button variant="danger" icon={RotateCcw} fullWidth onClick={handleReset} aria-label="Reset all accessibility settings">
        Reset All Settings
      </Button>

      <div style={{ height: 32 }} />
    </div>
  );
}

/* ─── Styles ─── */
const styles = {
  page: {
    padding: '20px clamp(16px, 4vw, 32px) 100px',
    maxWidth: 'var(--layout-max-width, 1200px)',
    margin: '0 auto', width: '100%', boxSizing: 'border-box',
  },
  header: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  backBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: 10, cursor: 'pointer', color: 'var(--text-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 44, minHeight: 44,
  },
  pageTitle: {
    fontSize: 22, fontWeight: 800, letterSpacing: -0.5,
    background: 'linear-gradient(135deg, var(--text-primary), var(--primary-light))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  pageSubtitle: { fontSize: 13, color: 'var(--text-muted)', marginTop: 2 },

  quickBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px', borderRadius: 12,
    background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)',
    marginBottom: 24,
  },
  quickBannerText: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 },

  // Sections
  section: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  sectionIconWrap: {
    width: 34, height: 34, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.2,
    background: 'none', WebkitBackgroundClip: 'unset', WebkitTextFillColor: 'unset',
  },
  sectionContent: { padding: '8px 0' },

  // Toggle
  toggleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', gap: 14,
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  toggleLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  toggleIcon: {
    width: 36, height: 36, borderRadius: 8,
    background: 'rgba(99,102,241,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  toggleLabel: {
    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer',
    display: 'block',
  },
  toggleDesc: {
    fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4,
  },
  toggleSwitch: {
    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
    position: 'relative', flexShrink: 0, transition: 'background 0.2s',
    padding: 0,
  },
  toggleKnob: {
    width: 20, height: 20, borderRadius: '50%', background: '#fff',
    transition: 'transform 0.2s', position: 'absolute', top: 2,
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },

  // Chips
  chipGroup: { padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  chipLabel: {
    fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
    display: 'block', marginBottom: 8,
  },
  chips: {
    display: 'flex', gap: 8, flexWrap: 'wrap',
  },
  chip: {
    padding: '8px 16px', borderRadius: 20,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: 4,
    minHeight: 36,
  },
  chipActive: {
    background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },

  // Reset
  resetBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '14px 24px',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444', borderRadius: 12,
    fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8,
    minHeight: 48,
  },
};

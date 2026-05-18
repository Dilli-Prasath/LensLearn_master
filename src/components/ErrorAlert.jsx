/**
 * ErrorAlert — Rich diagnostic error display for AI failures.
 *
 * Shows which providers were tried, why each failed (with icons and colors),
 * and actionable next steps. Renders as a professional-looking card
 * with an expandable "technical details" section.
 */
import { useState } from 'react';
import {
  AlertTriangle, Wifi, WifiOff, Clock, ShieldAlert, Server,
  HelpCircle, ChevronDown, ChevronUp, RotateCcw, Zap,
  Cloud, Monitor, Globe, XCircle, RefreshCw,
} from 'lucide-react';

/** Map error type → icon, color, label */
const ERROR_TYPE_META = {
  network: {
    icon: WifiOff,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    label: 'Network Issue',
    description: 'Your device could not reach the AI server. This is usually an internet connectivity problem.',
  },
  timeout: {
    icon: Clock,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    label: 'Timeout',
    description: 'The AI server took too long to respond. The server may be overloaded.',
  },
  quota: {
    icon: Zap,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    label: 'Quota Exceeded',
    description: 'The API usage limit has been reached. Free tier quotas reset periodically.',
  },
  auth: {
    icon: ShieldAlert,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    label: 'Auth Failed',
    description: 'The API key is invalid or expired. Check your configuration.',
  },
  server: {
    icon: Server,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    label: 'Server Error',
    description: 'The AI server encountered an internal error.',
  },
  unknown: {
    icon: HelpCircle,
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.12)',
    label: 'Unknown',
    description: 'An unexpected error occurred.',
  },
};

/** Map provider ID → icon */
const PROVIDER_ICONS = {
  'ollama': Monitor,
  'ollama-cloud': Cloud,
  'google-ai': Globe,
  'unknown': Server,
};

function ProviderAttemptRow({ attempt, index, total }) {
  const meta = ERROR_TYPE_META[attempt.type] || ERROR_TYPE_META.unknown;
  const TypeIcon = meta.icon;
  const ProviderIcon = PROVIDER_ICONS[attempt.providerId] || Server;

  return (
    <div style={styles.attemptRow}>
      {/* Step indicator */}
      <div style={styles.stepColumn}>
        <div style={{ ...styles.stepBadge, background: meta.bg, color: meta.color }}>
          {index + 1}
        </div>
        {index < total - 1 && <div style={styles.stepLine} />}
      </div>

      {/* Content */}
      <div style={styles.attemptContent}>
        {/* Provider name and status */}
        <div style={styles.attemptHeader}>
          <div style={styles.providerLabel}>
            <ProviderIcon size={14} style={{ opacity: 0.7 }} />
            <span style={styles.providerName}>{attempt.provider}</span>
          </div>
          <div style={{ ...styles.statusBadge, background: meta.bg, color: meta.color }}>
            <XCircle size={12} />
            <span>Failed</span>
          </div>
        </div>

        {/* Error type and reason */}
        <div style={{ ...styles.reasonBox, borderLeft: `3px solid ${meta.color}` }}>
          <div style={styles.reasonHeader}>
            <TypeIcon size={15} color={meta.color} />
            <span style={{ ...styles.reasonType, color: meta.color }}>{meta.label}</span>
          </div>
          <p style={styles.reasonText}>{attempt.reason}</p>
        </div>
      </div>
    </div>
  );
}

export default function ErrorAlert({ error, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error || !error.attempts) return null;

  const { attempts, suggestion, timestamp } = error;
  const lastAttempt = attempts[attempts.length - 1];
  const lastMeta = ERROR_TYPE_META[lastAttempt?.type] || ERROR_TYPE_META.unknown;

  return (
    <div style={styles.container} className="slide-up">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <div style={styles.headerText}>
          <h3 style={styles.title}>Unable to generate explanation</h3>
          <p style={styles.subtitle}>
            {attempts.length === 1
              ? `${attempts[0].provider} failed`
              : `Tried ${attempts.length} AI providers — all failed`}
          </p>
        </div>
        {timestamp && <span style={styles.timestamp}>{timestamp}</span>}
      </div>

      {/* Provider attempts timeline */}
      <div style={styles.timeline}>
        {attempts.map((attempt, i) => (
          <ProviderAttemptRow
            key={attempt.providerId}
            attempt={attempt}
            index={i}
            total={attempts.length}
          />
        ))}
      </div>

      {/* Suggestion box */}
      <div style={styles.suggestionBox}>
        <div style={styles.suggestionIcon}>
          <RefreshCw size={16} color="var(--primary-light)" />
        </div>
        <div style={styles.suggestionContent}>
          <span style={styles.suggestionLabel}>What to do</span>
          <p style={styles.suggestionText}>{suggestion}</p>
        </div>
      </div>

      {/* Expandable details */}
      <button
        style={styles.detailsToggle}
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
      >
        {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>{showDetails ? 'Hide' : 'Show'} technical details</span>
      </button>

      {showDetails && (
        <div style={styles.detailsBox}>
          {attempts.map((attempt) => {
            const meta = ERROR_TYPE_META[attempt.type] || ERROR_TYPE_META.unknown;
            return (
              <div key={attempt.providerId} style={styles.detailRow}>
                <span style={styles.detailProvider}>{attempt.provider}</span>
                <span style={styles.detailSeparator}>—</span>
                <span style={styles.detailInfo}>{meta.description}</span>
              </div>
            );
          })}

          {/* Common fixes */}
          <div style={styles.fixesSection}>
            <span style={styles.fixesTitle}>Common fixes:</span>
            <ul style={styles.fixesList}>
              {attempts.some(a => a.type === 'network') && (
                <li>Check your Wi-Fi or mobile data connection</li>
              )}
              {attempts.some(a => a.type === 'quota') && (
                <li>Free API quota resets daily — try again later or use a paid key</li>
              )}
              {attempts.some(a => a.type === 'timeout') && (
                <li>The server may be overloaded — wait a moment and retry</li>
              )}
              {attempts.some(a => a.type === 'auth') && (
                <li>Go to Settings and check your API key configuration</li>
              )}
              {attempts.some(a => a.type === 'server') && (
                <li>Server-side issue — usually resolves itself in a few minutes</li>
              )}
              <li>Try refreshing the page or switching to a different AI model in Settings</li>
            </ul>
          </div>
        </div>
      )}

      {/* Retry button */}
      <div style={styles.actions}>
        <button style={styles.retryButton} onClick={onRetry}>
          <RotateCcw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'var(--bg-card, rgba(15,23,42,0.6))',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '16px 16px 12px',
    background: 'rgba(239,68,68,0.06)',
    borderBottom: '1px solid rgba(239,68,68,0.12)',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'rgba(239,68,68,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  },
  subtitle: {
    margin: '2px 0 0',
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  timestamp: {
    fontSize: 11,
    color: 'var(--text-muted)',
    flexShrink: 0,
    marginTop: 2,
  },

  // Timeline
  timeline: {
    padding: '16px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  attemptRow: {
    display: 'flex',
    gap: 12,
  },
  stepColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: 24,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 12,
    background: 'rgba(255,255,255,0.08)',
    margin: '4px 0',
  },
  attemptContent: {
    flex: 1,
    paddingBottom: 16,
    minWidth: 0,
  },
  attemptHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  providerLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--text-primary)',
  },
  providerName: {
    fontSize: 14,
    fontWeight: 600,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  reasonBox: {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '0 8px 8px 0',
  },
  reasonHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reasonType: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    margin: 0,
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },

  // Suggestion
  suggestionBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    margin: '0 16px',
    padding: '12px 14px',
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: 10,
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    background: 'rgba(99,102,241,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--primary-light)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionText: {
    margin: '2px 0 0',
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },

  // Details toggle
  detailsToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    padding: '10px 16px',
    margin: '12px 0 0',
    background: 'none',
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    color: 'var(--text-muted)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },

  // Details box
  detailsBox: {
    padding: '0 16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  detailProvider: {
    fontWeight: 600,
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  detailSeparator: {
    opacity: 0.4,
  },
  detailInfo: {
    color: 'var(--text-muted)',
  },
  fixesSection: {
    marginTop: 4,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
  },
  fixesTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  fixesList: {
    margin: '6px 0 0',
    paddingLeft: 18,
    listStyle: 'disc',
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.8,
  },

  // Actions
  actions: {
    padding: '12px 16px 16px',
    display: 'flex',
    justifyContent: 'center',
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 24px',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #4f46e5))',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
};

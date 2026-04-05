/**
 * Progress - Linear and circular progress indicators
 *
 * Usage:
 *   <Progress value={75} max={100} />
 *   <Progress.Circle value={85} size={120} strokeWidth={8} />
 *   <Progress.Steps current={2} steps={['Scan', 'Explain', 'Quiz']} />
 */
import { memo, useMemo } from 'react';

// ─── Linear Progress ────────────────────────────────────────
function Progress({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  animated = true,
  style,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const SIZES = { xs: '2px', sm: '4px', md: '8px', lg: '12px' };
  const height = SIZES[size] || SIZES.md;

  const COLORS = {
    primary: 'var(--accent-main, #6366f1)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: 'linear-gradient(90deg, var(--accent-main, #6366f1), #a855f7)',
  };
  const color = COLORS[variant] || COLORS.primary;

  return (
    <div style={{ width: '100%', ...style }}>
      {showLabel && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginBottom: '4px',
          fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)',
        }}>
          <span>{Math.round(percentage)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div
        style={{
          width: '100%', height, borderRadius: '9999px',
          background: 'var(--bg-tertiary, rgba(51,65,85,0.5))', overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div style={{
          height: '100%', borderRadius: '9999px',
          width: `${percentage}%`,
          background: color,
          transition: animated ? 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }} />
      </div>
    </div>
  );
}

// ─── Circular Progress ──────────────────────────────────────
const ProgressCircle = memo(function ProgressCircle({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = 'var(--accent-main, #6366f1)',
  trackColor = 'var(--bg-tertiary, rgba(51,65,85,0.5))',
  showValue = true,
  label,
  children,
  animated = true,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: animated ? 'stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none' }}
        />
      </svg>
      <div style={{
        position: 'absolute', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {children || (
          <>
            {showValue && <span style={{ fontSize: size * 0.22, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>{Math.round(percentage)}%</span>}
            {label && <span style={{ fontSize: size * 0.12, color: 'var(--text-tertiary, #64748b)' }}>{label}</span>}
          </>
        )}
      </div>
    </div>
  );
});

// ─── Steps Progress ─────────────────────────────────────────
const ProgressSteps = memo(function ProgressSteps({
  steps = [],
  current = 0,
  variant = 'primary',
  size = 'md',
  style,
}) {
  const dotSize = { sm: 8, md: 12, lg: 16 }[size] || 12;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', width: '100%', ...style }}>
      {steps.map((step, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;
        const label = typeof step === 'string' ? step : step.label;

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: `${dotSize}px`, height: `${dotSize}px`, borderRadius: '50%',
                background: isCompleted || isCurrent ? 'var(--accent-main, #6366f1)' : 'var(--bg-tertiary, #334155)',
                border: isCurrent ? '2px solid var(--accent-light, #818cf8)' : 'none',
                transition: 'all 300ms ease',
                boxShadow: isCurrent ? '0 0 8px var(--accent-glow, rgba(99,102,241,0.4))' : 'none',
              }} />
              {label && <span style={{ fontSize: '0.625rem', color: isCurrent ? 'var(--accent-light, #818cf8)' : 'var(--text-tertiary, #64748b)', whiteSpace: 'nowrap' }}>{label}</span>}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 4px',
                background: isCompleted ? 'var(--accent-main, #6366f1)' : 'var(--bg-tertiary, #334155)',
                transition: 'background 300ms ease',
                alignSelf: label ? 'flex-start' : 'center',
                marginTop: label ? `${dotSize / 2}px` : 0,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
});

Progress.Circle = ProgressCircle;
Progress.Steps = ProgressSteps;

export default memo(Progress);

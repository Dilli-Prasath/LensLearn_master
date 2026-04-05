/**
 * Toggle - Accessible switch component
 *
 * Usage:
 *   <Toggle checked={isDark} onChange={setIsDark} label="Dark Mode" />
 *   <Toggle size="lg" variant="primary" />
 */
import { forwardRef, memo, useId, useMemo } from 'react';

const SIZES = {
  sm: { track: { w: 36, h: 20 }, thumb: 14, translate: 16 },
  md: { track: { w: 44, h: 24 }, thumb: 18, translate: 20 },
  lg: { track: { w: 52, h: 28 }, thumb: 22, translate: 24 },
};

const Toggle = forwardRef(function Toggle(
  {
    checked = false,
    onChange,
    label,
    description,
    size = 'md',
    disabled = false,
    style,
    ...props
  },
  ref
) {
  const id = useId();
  const s = SIZES[size] || SIZES.md;

  const trackStyle = useMemo(() => ({
    position: 'relative',
    width: `${s.track.w}px`,
    height: `${s.track.h}px`,
    borderRadius: '9999px',
    background: checked ? 'var(--accent-main, #6366f1)' : 'var(--bg-tertiary, #334155)',
    border: checked ? 'none' : '1px solid var(--border-primary, rgba(255,255,255,0.1))',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
  }), [s, checked, disabled]);

  const thumbStyle = useMemo(() => ({
    position: 'absolute',
    top: '50%',
    left: checked ? `${s.translate + 3}px` : '3px',
    transform: 'translateY(-50%)',
    width: `${s.thumb}px`,
    height: `${s.thumb}px`,
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'left 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  }), [s, checked]);

  const handleToggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };

  return (
    <div
      ref={ref}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', ...style }}
      {...props}
    >
      {(label || description) && (
        <div style={{ flex: 1, minWidth: 0 }}>
          {label && (
            <label htmlFor={id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary, #f1f5f9)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
              {label}
            </label>
          )}
          {description && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)', marginTop: '2px' }}>
              {description}
            </span>
          )}
        </div>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle'}
        onClick={handleToggle}
        disabled={disabled}
        style={{ ...trackStyle, border: trackStyle.border, padding: 0, outline: 'none' }}
      >
        <div style={thumbStyle} />
      </button>
    </div>
  );
});

export default memo(Toggle);

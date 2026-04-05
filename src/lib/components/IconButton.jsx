/**
 * IconButton - Circular icon-only button with tooltip support
 *
 * Usage:
 *   <IconButton icon={<Settings />} label="Settings" onClick={handleClick} />
 *   <IconButton icon={<X />} variant="ghost" size="sm" />
 */
import { forwardRef, memo, useMemo, isValidElement, createElement } from 'react';

/** Render an icon prop that may be JSX or a component reference */
function renderIcon(icon, size) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) {
    return createElement(icon, { size });
  }
  return icon;
}

const SIZES = {
  xs: { size: '24px', iconSize: 14, padding: '4px' },
  sm: { size: '32px', iconSize: 16, padding: '6px' },
  md: { size: '40px', iconSize: 20, padding: '8px' },
  lg: { size: '48px', iconSize: 24, padding: '10px' },
  xl: { size: '56px', iconSize: 28, padding: '12px' },
};

const IconButton = forwardRef(function IconButton(
  {
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    badge,
    active = false,
    disabled = false,
    loading = false,
    style,
    ...props
  },
  ref
) {
  const s = SIZES[size] || SIZES.md;

  const VARIANT_STYLES = {
    ghost: { background: 'transparent', color: 'var(--text-secondary, #94a3b8)', hoverBg: 'var(--bg-tertiary, rgba(51,65,85,0.5))' },
    filled: { background: 'var(--bg-tertiary, #334155)', color: 'var(--text-primary, #f1f5f9)', hoverBg: 'var(--bg-secondary, #1e293b)' },
    primary: { background: 'var(--accent-main, #6366f1)', color: '#ffffff', hoverBg: 'var(--accent-dark, #4f46e5)' },
    glass: { background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary, #f1f5f9)', hoverBg: 'rgba(255,255,255,0.12)' },
  };

  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.ghost;

  const buttonStyle = useMemo(() => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: s.size,
    height: s.size,
    minWidth: s.size,
    padding: s.padding,
    borderRadius: '50%',
    border: 'none',
    background: active ? 'var(--accent-main, #6366f1)' : v.background,
    color: active ? '#ffffff' : v.color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    ...style,
  }), [s, v, active, disabled, style]);

  return (
    <button
      ref={ref}
      style={buttonStyle}
      disabled={disabled || loading}
      aria-label={label}
      title={label}
      {...props}
    >
      {loading ? (
        <svg width={s.iconSize} height={s.iconSize} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : renderIcon(icon, s.iconSize)}
      {badge !== undefined && badge !== null && (
        <span style={{
          position: 'absolute', top: '-2px', right: '-2px',
          background: '#ef4444', color: '#fff', fontSize: '0.625rem',
          fontWeight: 700, minWidth: '16px', height: '16px',
          borderRadius: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '0 4px',
        }}>
          {badge}
        </span>
      )}
    </button>
  );
});

export default memo(IconButton);

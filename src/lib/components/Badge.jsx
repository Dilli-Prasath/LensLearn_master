/**
 * Badge - Status/label badge component
 *
 * Usage:
 *   <Badge variant="success">Connected</Badge>
 *   <Badge variant="warning" dot>Pending</Badge>
 *   <Badge size="lg" pill>New Feature</Badge>
 */
import { memo, useMemo, isValidElement, createElement } from 'react';

function renderIcon(icon, size = 14) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) return createElement(icon, { size });
  return icon;
}

const VARIANTS = {
  default:  { bg: 'var(--bg-tertiary, #334155)', color: 'var(--text-primary, #f1f5f9)', dot: '#94a3b8' },
  primary:  { bg: 'rgba(99,102,241,0.15)', color: 'var(--accent-light, #818cf8)', dot: 'var(--accent-main, #6366f1)' },
  success:  { bg: 'rgba(16,185,129,0.15)', color: '#34d399', dot: '#10b981' },
  warning:  { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', dot: '#f59e0b' },
  error:    { bg: 'rgba(239,68,68,0.15)', color: '#f87171', dot: '#ef4444' },
  info:     { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', dot: '#3b82f6' },
};

const SIZES = {
  xs: { padding: '1px 6px', fontSize: '0.625rem' },
  sm: { padding: '2px 8px', fontSize: '0.75rem' },
  md: { padding: '4px 10px', fontSize: '0.8125rem' },
  lg: { padding: '6px 14px', fontSize: '0.875rem' },
};

function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  pill = true,
  icon,
  children,
  style,
  ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const s = SIZES[size] || SIZES.sm;

  const badgeStyle = useMemo(() => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: s.padding,
    fontSize: s.fontSize,
    fontWeight: 600,
    lineHeight: 1.4,
    borderRadius: pill ? '9999px' : '6px',
    background: v.bg,
    color: v.color,
    whiteSpace: 'nowrap',
    ...style,
  }), [v, s, pill, style]);

  return (
    <span style={badgeStyle} {...props}>
      {dot && (
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%', background: v.dot,
          animation: pulse ? 'pulse 2s infinite' : 'none', flexShrink: 0,
        }} />
      )}
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{renderIcon(icon)}</span>}
      {children}
    </span>
  );
}

export default memo(Badge);

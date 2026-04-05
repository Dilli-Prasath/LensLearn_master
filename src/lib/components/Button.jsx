/**
 * Button - Polymorphic, accessible button component
 *
 * Supports variants, sizes, icons, loading state, and the `as` prop
 * for rendering as links, router links, etc.
 *
 * Usage:
 *   <Button variant="primary" size="lg" icon={<Camera />}>Scan</Button>
 *   <Button as="a" href="/about">About</Button>
 *   <Button variant="ghost" loading>Processing...</Button>
 */
import { forwardRef, memo, useMemo, isValidElement, createElement } from 'react';

/** Render an icon prop that may be JSX or a component reference */
function renderIcon(icon) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) {
    return createElement(icon, { size: 18 });
  }
  return icon;
}

const VARIANTS = {
  primary: {
    background: 'var(--accent-main, #6366f1)',
    color: '#ffffff',
    border: 'none',
    hoverBg: 'var(--accent-dark, #4f46e5)',
    shadow: '0 2px 8px var(--accent-glow, rgba(99,102,241,0.3))',
  },
  secondary: {
    background: 'var(--bg-tertiary, #334155)',
    color: 'var(--text-primary, #f1f5f9)',
    border: '1px solid var(--border-primary, #334155)',
    hoverBg: 'var(--bg-secondary, #1e293b)',
    shadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary, #94a3b8)',
    border: 'none',
    hoverBg: 'var(--bg-tertiary, rgba(51,65,85,0.5))',
    shadow: 'none',
  },
  outline: {
    background: 'transparent',
    color: 'var(--accent-main, #6366f1)',
    border: '1px solid var(--accent-main, #6366f1)',
    hoverBg: 'rgba(99, 102, 241, 0.1)',
    shadow: 'none',
  },
  danger: {
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
    hoverBg: '#b91c1c',
    shadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
  },
  success: {
    background: '#10b981',
    color: '#ffffff',
    border: 'none',
    hoverBg: '#059669',
    shadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text-primary, #f1f5f9)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    hoverBg: 'rgba(255, 255, 255, 0.12)',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(8px)',
  },
};

const SIZES = {
  xs:  { padding: '4px 8px',   fontSize: '0.75rem', height: '28px', gap: '4px',  borderRadius: '6px' },
  sm:  { padding: '6px 12px',  fontSize: '0.8125rem', height: '32px', gap: '6px',  borderRadius: '8px' },
  md:  { padding: '8px 16px',  fontSize: '0.875rem', height: '40px', gap: '8px',  borderRadius: '10px' },
  lg:  { padding: '12px 24px', fontSize: '1rem',     height: '48px', gap: '10px', borderRadius: '12px' },
  xl:  { padding: '16px 32px', fontSize: '1.125rem', height: '56px', gap: '12px', borderRadius: '14px' },
};

const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    pill = false,
    children,
    style,
    className,
    ...props
  },
  ref
) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  const buttonStyle = useMemo(() => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    fontSize: s.fontSize,
    minHeight: s.height,
    fontWeight: 600,
    fontFamily: 'inherit',
    lineHeight: 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: v.border,
    borderRadius: pill ? '9999px' : s.borderRadius,
    background: v.background,
    color: v.color,
    boxShadow: v.shadow,
    backdropFilter: v.backdropFilter || 'none',
    WebkitBackdropFilter: v.backdropFilter || 'none',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  }), [v, s, disabled, loading, fullWidth, pill, style]);

  const isButton = Component === 'button';

  return (
    <Component
      ref={ref}
      style={buttonStyle}
      disabled={isButton ? (disabled || loading) : undefined}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      role={!isButton ? 'button' : undefined}
      tabIndex={!isButton && !disabled ? 0 : undefined}
      className={className}
      {...props}
    >
      {loading && <Spinner size={s.fontSize} />}
      {!loading && icon && <span style={{ display: 'flex', flexShrink: 0 }}>{renderIcon(icon)}</span>}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span style={{ display: 'flex', flexShrink: 0 }}>{renderIcon(iconRight)}</span>}
    </Component>
  );
});

function Spinner({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default memo(Button);
export { VARIANTS as buttonVariants, SIZES as buttonSizes };

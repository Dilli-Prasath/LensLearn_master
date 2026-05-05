/**
 * Card - Composable card component with compound sub-components
 *
 * Usage:
 *   <Card variant="glass" hoverable>
 *     <Card.Header title="Quiz Results" icon={<Trophy />} />
 *     <Card.Body>Content here</Card.Body>
 *     <Card.Footer>
 *       <Button>Continue</Button>
 *     </Card.Footer>
 *   </Card>
 *
 *   <Card as="article" variant="elevated" onClick={handleClick}>
 *     Simple content without sub-components
 *   </Card>
 */
import { forwardRef, memo, createContext, useContext, useMemo, isValidElement, createElement } from 'react';

function renderIcon(icon, size = 20) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) return createElement(icon, { size });
  return icon;
}

const CardContext = createContext({ variant: 'default' });

const CARD_VARIANTS = {
  default: {
    background: 'var(--bg-secondary, #1e293b)',
    border: '1px solid var(--border-primary, #334155)',
    shadow: 'none',
  },
  elevated: {
    background: 'var(--bg-elevated, #1a2744)',
    border: '1px solid var(--border-primary, #334155)',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    backdropFilter: 'blur(12px)',
  },
  outline: {
    background: 'transparent',
    border: '1px solid var(--border-primary, #334155)',
    shadow: 'none',
  },
  ghost: {
    background: 'transparent',
    border: 'none',
    shadow: 'none',
  },
  gradient: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
    border: '1px solid rgba(99,102,241,0.2)',
    shadow: '0 4px 16px rgba(99, 102, 241, 0.1)',
  },
};

const Card = forwardRef(function Card(
  {
    as: Component = 'div',
    variant = 'default',
    padding = '16px',
    radius = '12px',
    hoverable = false,
    clickable = false,
    selected = false,
    fullWidth = false,
    children,
    style,
    className,
    ...props
  },
  ref
) {
  const v = CARD_VARIANTS[variant] || CARD_VARIANTS.default;
  const isInteractive = hoverable || clickable || !!props.onClick;

  const cardStyle = useMemo(() => ({
    background: v.background,
    border: selected ? '1px solid var(--accent-main, #6366f1)' : v.border,
    borderRadius: radius,
    boxShadow: selected ? '0 0 0 2px var(--accent-glow, rgba(99,102,241,0.3))' : v.shadow,
    backdropFilter: v.backdropFilter || 'none',
    WebkitBackdropFilter: v.backdropFilter || 'none',
    padding,
    width: fullWidth ? '100%' : 'auto',
    cursor: isInteractive ? 'pointer' : 'default',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    position: 'relative',
    ...style,
  }), [v, padding, radius, selected, fullWidth, isInteractive, style]);

  return (
    <CardContext.Provider value={{ variant }}>
      <Component
        ref={ref}
        style={cardStyle}
        className={className}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        {...props}
      >
        {children}
      </Component>
    </CardContext.Provider>
  );
});

// ─── Card.Header ────────────────────────────────────────────
const CardHeader = memo(forwardRef(function CardHeader(
  { title, subtitle, icon, action, children, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: children ? '12px' : '0px', gap: '12px', ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        {icon && <span style={{ display: 'flex', flexShrink: 0, color: 'var(--accent-main, #6366f1)' }}>{renderIcon(icon)}</span>}
        <div style={{ minWidth: 0 }}>
          {title && <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h3>}
          {subtitle && <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>{subtitle}</p>}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      {children}
    </div>
  );
}));

// ─── Card.Body ──────────────────────────────────────────────
const CardBody = memo(forwardRef(function CardBody({ children, style, ...props }, ref) {
  return (
    <div ref={ref} style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.875rem', lineHeight: 1.6, ...style }} {...props}>
      {children}
    </div>
  );
}));

// ─── Card.Footer ────────────────────────────────────────────
const CardFooter = memo(forwardRef(function CardFooter({ children, style, align = 'right', ...props }, ref) {
  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end', between: 'space-between' };
  return (
    <div
      ref={ref}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        justifyContent: justifyMap[align] || 'flex-end',
        marginTop: '16px', paddingTop: '12px',
        borderTop: '1px solid var(--border-primary, rgba(255,255,255,0.06))',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}));

// ─── Card.Stat ──────────────────────────────────────────────
const CardStat = memo(function CardStat({ label, value, icon, trend, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px' }}>
      {icon && <div style={{ color: color || 'var(--accent-main)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{renderIcon(icon)}</div>}
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color || 'var(--text-primary, #f1f5f9)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)', marginTop: '2px' }}>{label}</div>
      {trend && (
        <div style={{ fontSize: '0.7rem', color: trend > 0 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
});

// Wrap in memo first, then attach sub-components to the EXPORTED object
Card.displayName = 'Card';
const MemoCard = memo(Card);
MemoCard.Header = CardHeader;
MemoCard.Body = CardBody;
MemoCard.Footer = CardFooter;
MemoCard.Stat = CardStat;

export default MemoCard;
export { CARD_VARIANTS as cardVariants, CardContext };

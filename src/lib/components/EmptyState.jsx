/**
 * EmptyState - Reusable empty/placeholder component
 *
 * A flexible placeholder component used when there's no content to display.
 * Perfect for initial states, no-results pages, and loading finished states.
 *
 * Usage:
 *   <EmptyState
 *     icon={<InboxIcon />}
 *     title="No messages"
 *     description="You're all caught up! Check back later."
 *     action={<Button>Create Message</Button>}
 *   />
 *
 *   <EmptyState
 *     icon={<SearchIcon />}
 *     title="No results found"
 *     description="Try adjusting your search terms"
 *     size="sm"
 *   />
 */
import { forwardRef, memo, useMemo, isValidElement, createElement } from 'react';

function renderIcon(icon, size = 48) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) return createElement(icon, { size });
  return icon;
}

const SIZE_CONFIG = {
  sm: {
    iconSize: 40,
    titleSize: '1rem',
    descSize: '0.8125rem',
    padding: '24px 16px',
    gap: '8px',
  },
  md: {
    iconSize: 64,
    titleSize: '1.25rem',
    descSize: '0.875rem',
    padding: '40px 24px',
    gap: '12px',
  },
  lg: {
    iconSize: 96,
    titleSize: '1.5rem',
    descSize: '1rem',
    padding: '60px 32px',
    gap: '16px',
  },
};

const EmptyState = forwardRef(function EmptyState(
  {
    icon,
    title,
    description,
    action,
    size = 'md',
    style,
    ...props
  },
  ref
) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const containerStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: config.padding,
    textAlign: 'center',
    minHeight: '200px',
    ...style,
  }), [config.padding, style]);

  const contentStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: config.gap,
  }), [config.gap]);

  const iconStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: config.iconSize,
    height: config.iconSize,
    borderRadius: '12px',
    backgroundColor: 'var(--bg-tertiary, rgba(51, 65, 85, 0.5))',
    color: 'var(--text-tertiary, #64748b)',
    flexShrink: 0,
  }), [config.iconSize]);

  const titleStyle = useMemo(() => ({
    fontSize: config.titleSize,
    fontWeight: 600,
    color: 'var(--text-primary, #f1f5f9)',
    margin: 0,
    lineHeight: 1.3,
  }), [config.titleSize]);

  const descriptionStyle = useMemo(() => ({
    fontSize: config.descSize,
    color: 'var(--text-secondary, #94a3b8)',
    margin: 0,
    lineHeight: 1.5,
    maxWidth: '280px',
  }), [config.descSize]);

  const actionStyle = useMemo(() => ({
    marginTop: '12px',
  }), []);

  return (
    <div
      ref={ref}
      style={containerStyle}
      role="status"
      aria-label={title || 'No content'}
      {...props}
    >
      <div style={contentStyle}>
        {icon && (
          <div style={iconStyle}>
            {renderIcon(icon, sizeConfig.iconSize)}
          </div>
        )}

        {title && <h2 style={titleStyle}>{title}</h2>}

        {description && <p style={descriptionStyle}>{description}</p>}

        {action && (
          <div style={actionStyle}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default memo(EmptyState);

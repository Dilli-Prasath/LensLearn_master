/**
 * Chip - Selectable chip/tag component for filters and categories
 *
 * Usage:
 *   <Chip>Mathematics</Chip>
 *   <Chip selected onSelect={toggle} icon={<BookOpen />}>Science</Chip>
 *   <Chip.Group value={selected} onChange={setSelected} options={subjects} />
 */
import { memo, forwardRef, useCallback, isValidElement, createElement } from 'react';

function renderIcon(icon, size = 16) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) return createElement(icon, { size });
  return icon;
}

const Chip = forwardRef(function Chip(
  {
    children,
    icon,
    selected = false,
    onSelect,
    onRemove,
    size = 'md',
    variant = 'default',
    disabled = false,
    style,
    ...props
  },
  ref
) {
  const SIZES = {
    sm: { padding: '4px 8px', fontSize: '0.75rem', gap: '4px' },
    md: { padding: '6px 12px', fontSize: '0.8125rem', gap: '6px' },
    lg: { padding: '8px 16px', fontSize: '0.875rem', gap: '8px' },
  };
  const s = SIZES[size] || SIZES.md;

  return (
    <button
      ref={ref}
      role={onSelect ? 'option' : undefined}
      aria-selected={selected}
      disabled={disabled}
      onClick={() => onSelect?.(!selected)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: s.gap,
        padding: s.padding, fontSize: s.fontSize, fontWeight: 500,
        fontFamily: 'inherit', lineHeight: 1.4,
        borderRadius: '9999px',
        border: selected
          ? '1px solid var(--accent-main, #6366f1)'
          : '1px solid var(--border-primary, rgba(255,255,255,0.1))',
        background: selected
          ? 'rgba(99, 102, 241, 0.15)'
          : 'var(--bg-tertiary, rgba(51,65,85,0.5))',
        color: selected
          ? 'var(--accent-light, #818cf8)'
          : 'var(--text-secondary, #94a3b8)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 200ms ease',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{renderIcon(icon)}</span>}
      {children}
      {onRemove && (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ cursor: 'pointer', marginLeft: '2px', opacity: 0.6, fontSize: '1em' }}
        >
          ×
        </span>
      )}
    </button>
  );
});

// ─── Chip.Group ─────────────────────────────────────────────
const ChipGroup = memo(function ChipGroup({
  options = [],
  value,
  onChange,
  multiple = false,
  size = 'md',
  style,
  label,
}) {
  const isSelected = useCallback((optValue) => {
    if (multiple) return Array.isArray(value) && value.includes(optValue);
    return value === optValue;
  }, [value, multiple]);

  const handleSelect = useCallback((optValue) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(optValue) ? arr.filter(v => v !== optValue) : [...arr, optValue]);
    } else {
      onChange(value === optValue ? null : optValue);
    }
  }, [value, multiple, onChange]);

  return (
    <div role="listbox" aria-label={label} aria-multiselectable={multiple} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', ...style }}>
      {options.map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const optIcon = typeof opt === 'object' ? opt.icon : undefined;

        return (
          <Chip
            key={optValue}
            size={size}
            selected={isSelected(optValue)}
            onSelect={() => handleSelect(optValue)}
            icon={optIcon}
          >
            {optLabel}
          </Chip>
        );
      })}
    </div>
  );
});

Chip.Group = ChipGroup;
Chip.displayName = 'Chip';

export default memo(Chip);

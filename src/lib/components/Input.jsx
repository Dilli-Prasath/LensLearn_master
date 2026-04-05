/**
 * Input - Accessible form input with multiple variants
 *
 * Usage:
 *   <Input label="Email" type="email" placeholder="you@example.com" />
 *   <Input as="textarea" label="Notes" rows={4} />
 *   <Input icon={<Search />} placeholder="Search..." />
 *   <Input.Select label="Language" options={languages} />
 */
import { forwardRef, memo, useId, useMemo, isValidElement, createElement } from 'react';

function renderIcon(icon, size = 18) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) return createElement(icon, { size });
  return icon;
}

const Input = forwardRef(function Input(
  {
    as: Component = 'input',
    label,
    error,
    hint,
    icon,
    iconRight,
    variant = 'default',
    size = 'md',
    fullWidth = true,
    style,
    containerStyle,
    ...props
  },
  ref
) {
  const id = useId();

  const SIZES = {
    sm: { height: '32px', padding: '6px 10px', fontSize: '0.8125rem' },
    md: { height: '40px', padding: '8px 14px', fontSize: '0.875rem' },
    lg: { height: '48px', padding: '12px 16px', fontSize: '1rem' },
  };

  const s = SIZES[size] || SIZES.md;
  const isTextarea = Component === 'textarea';

  const inputStyle = useMemo(() => ({
    width: fullWidth ? '100%' : 'auto',
    minHeight: isTextarea ? '80px' : s.height,
    height: isTextarea ? 'auto' : s.height,
    padding: icon ? `${s.padding.split(' ')[0]} ${s.padding.split(' ')[1]} ${s.padding.split(' ')[0]} 36px` : s.padding,
    paddingRight: iconRight ? '36px' : undefined,
    fontSize: s.fontSize,
    fontFamily: 'inherit',
    color: 'var(--text-primary, #f1f5f9)',
    background: variant === 'filled' ? 'var(--bg-tertiary, #334155)' : 'transparent',
    border: error ? '1px solid #ef4444' : '1px solid var(--border-primary, #334155)',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 200ms, box-shadow 200ms',
    resize: isTextarea ? 'vertical' : 'none',
    ...style,
  }), [s, icon, iconRight, fullWidth, isTextarea, variant, error, style]);

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', ...containerStyle }}>
      {label && (
        <label htmlFor={id} style={{
          display: 'block', fontSize: '0.8125rem', fontWeight: 500,
          color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            display: 'flex', color: 'var(--text-tertiary, #64748b)', pointerEvents: 'none',
          }}>
            {renderIcon(icon)}
          </span>
        )}
        <Component
          ref={ref}
          id={id}
          style={inputStyle}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {iconRight && (
          <span style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            display: 'flex', color: 'var(--text-tertiary, #64748b)',
          }}>
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" style={{ fontSize: '0.75rem', color: '#ef4444', margin: '4px 0 0' }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)', margin: '4px 0 0' }}>
          {hint}
        </p>
      )}
    </div>
  );
});

// ─── Input.Select ───────────────────────────────────────────
const InputSelect = forwardRef(function InputSelect(
  { label, options = [], error, hint, icon, size = 'md', fullWidth = true, style, containerStyle, ...props },
  ref
) {
  const id = useId();
  const SIZES = {
    sm: { height: '32px', padding: '6px 10px', fontSize: '0.8125rem' },
    md: { height: '40px', padding: '8px 14px', fontSize: '0.875rem' },
    lg: { height: '48px', padding: '12px 16px', fontSize: '1rem' },
  };
  const s = SIZES[size] || SIZES.md;

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', ...containerStyle }}>
      {label && (
        <label htmlFor={id} style={{
          display: 'block', fontSize: '0.8125rem', fontWeight: 500,
          color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px',
        }}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        style={{
          width: fullWidth ? '100%' : 'auto',
          height: s.height,
          padding: s.padding,
          fontSize: s.fontSize,
          fontFamily: 'inherit',
          color: 'var(--text-primary, #f1f5f9)',
          background: 'var(--bg-tertiary, #334155)',
          border: error ? '1px solid #ef4444' : '1px solid var(--border-primary, #334155)',
          borderRadius: '10px',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
          ...style,
        }}
        aria-invalid={!!error}
        {...props}
      >
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
      {error && <p role="alert" style={{ fontSize: '0.75rem', color: '#ef4444', margin: '4px 0 0' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)', margin: '4px 0 0' }}>{hint}</p>}
    </div>
  );
});

Input.Select = InputSelect;
Input.displayName = 'Input';

export default memo(Input);

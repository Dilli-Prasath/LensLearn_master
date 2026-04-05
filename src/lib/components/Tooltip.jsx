/**
 * Tooltip - Lightweight tooltip component
 *
 * Usage:
 *   <Tooltip content="Click to scan a page">
 *     <Button>Scan</Button>
 *   </Tooltip>
 */
import { memo, useState, useRef, useCallback } from 'react';

function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const show = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay, disabled]);

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  const positionStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '6px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '6px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '6px' },
  };

  if (!content) return children;

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...positionStyles[position],
            padding: '6px 10px',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#ffffff',
            background: 'var(--bg-tertiary, #334155)',
            border: '1px solid var(--border-primary, rgba(255,255,255,0.1))',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            zIndex: 70,
            pointerEvents: 'none',
            animation: 'fadeIn 150ms ease-out',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default memo(Tooltip);

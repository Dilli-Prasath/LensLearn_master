/**
 * Modal - Accessible dialog component with portal rendering
 *
 * Usage:
 *   <Modal open={isOpen} onClose={close} title="Confirm">
 *     <p>Are you sure?</p>
 *     <Modal.Actions>
 *       <Button variant="ghost" onClick={close}>Cancel</Button>
 *       <Button onClick={confirm}>Confirm</Button>
 *     </Modal.Actions>
 *   </Modal>
 */
import { forwardRef, memo, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const Modal = forwardRef(function Modal(
  {
    open = false,
    onClose,
    title,
    subtitle,
    size = 'md',
    closable = true,
    closeOnOverlay = true,
    closeOnEscape = true,
    children,
    style,
    ...props
  },
  ref
) {
  const contentRef = useRef(null);

  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handler = (e) => {
      if (e.key === 'Escape' && closable) onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeOnEscape, closable, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus();
    }
  }, [open]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget && closeOnOverlay && closable) onClose?.();
  }, [closeOnOverlay, closable, onClose]);

  if (!open) return null;

  const sizeMap = { sm: '400px', md: '500px', lg: '640px', xl: '800px', full: '95vw' };
  const maxWidth = sizeMap[size] || sizeMap.md;

  const modal = (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        zIndex: 50,
        animation: 'fadeIn 200ms ease-out',
      }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        tabIndex={-1}
        style={{
          background: 'var(--bg-secondary, #1e293b)',
          border: '1px solid var(--border-primary, #334155)',
          borderRadius: '16px',
          width: '100%',
          maxWidth,
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 200ms ease-out',
          outline: 'none',
          ...style,
        }}
        {...props}
      >
        {(title || closable) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 0', gap: '12px',
          }}>
            <div>
              {title && <h2 id="modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>{title}</h2>}
              {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>{subtitle}</p>}
            </div>
            {closable && (
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-tertiary, #64748b)',
                  cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex',
                  fontSize: '1.25rem', lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <div style={{ padding: '20px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
});

// ─── Modal.Actions ──────────────────────────────────────────
const ModalActions = memo(function ModalActions({ children, align = 'right', style }) {
  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
  return (
    <div style={{
      display: 'flex', gap: '8px', justifyContent: justifyMap[align] || 'flex-end',
      marginTop: '16px', paddingTop: '16px',
      borderTop: '1px solid var(--border-primary, rgba(255,255,255,0.06))',
      ...style,
    }}>
      {children}
    </div>
  );
});

Modal.displayName = 'Modal';
const MemoModal = memo(Modal);
MemoModal.Actions = ModalActions;

export default MemoModal;

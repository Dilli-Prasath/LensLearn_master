/**
 * Toast - Toast notification system
 *
 * A complete toast notification system with variants (success, error, warning, info),
 * auto-dismiss, and portal rendering. Includes a useToast() hook for easy integration.
 *
 * Usage:
 *   import { useToast } from './Toast';
 *
 *   function App() {
 *     const { show, dismiss } = useToast();
 *
 *     return (
 *       <>
 *         <Toast />
 *         <button onClick={() => show('Success!', { variant: 'success' })}>
 *           Show Toast
 *         </button>
 *       </>
 *     );
 *   }
 *
 *   // Advanced usage:
 *   show('Custom message', {
 *     variant: 'error',
 *     duration: 5000,
 *     action: { label: 'Retry', onClick: () => {...} }
 *   });
 */
import { createContext, useContext, useState, useCallback, useEffect, useMemo, forwardRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Toast Item Component ───────────────────────────────────
const ToastItem = memo(function ToastItem({
  id,
  message,
  variant = 'info',
  duration = 4000,
  action,
  onDismiss,
}) {
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  // Variant config
  const variants = {
    success: {
      icon: CheckCircle,
      bgColor: 'rgba(16, 185, 129, 0.1)',
      textColor: '#10b981',
      borderColor: '#10b981',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'rgba(239, 68, 68, 0.1)',
      textColor: '#ef4444',
      borderColor: '#ef4444',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'rgba(245, 158, 11, 0.1)',
      textColor: '#f59e0b',
      borderColor: '#f59e0b',
    },
    info: {
      icon: Info,
      bgColor: 'rgba(99, 102, 241, 0.1)',
      textColor: '#6366f1',
      borderColor: '#6366f1',
    },
  };

  const config = variants[variant] || variants.info;
  const IconComponent = config.icon;

  const toastStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    marginBottom: '12px',
    backgroundColor: config.bgColor,
    border: `1px solid ${config.borderColor}`,
    borderRadius: '8px',
    color: config.textColor,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    animation: isExiting ? 'toastExit 300ms cubic-bezier(0.4, 0, 1, 1) forwards' : 'toastEnter 300ms cubic-bezier(0, 0, 0.2, 1) forwards',
    maxWidth: '400px',
    minWidth: '280px',
  }), [config, isExiting]);

  const iconStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '20px',
    height: '20px',
    marginTop: '2px',
  }), []);

  const contentStyle = useMemo(() => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  }), []);

  const actionButtonStyle = useMemo(() => ({
    padding: 0,
    margin: 0,
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: 600,
    textDecoration: 'underline',
    opacity: 0.8,
    transition: 'opacity 150ms ease',
    '&:hover': {
      opacity: 1,
    },
  }), []);

  const closeButtonStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    marginLeft: '8px',
    flexShrink: 0,
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
    opacity: 0.6,
    '&:hover': {
      opacity: 1,
    },
  }), []);

  const handleActionClick = useCallback(() => {
    action?.onClick?.();
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 300);
  }, [action, id, onDismiss]);

  return (
    <div style={toastStyle}>
      <style>{`
        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toastExit {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-12px);
          }
        }
      `}</style>

      <div style={iconStyle}>
        <IconComponent size={20} />
      </div>

      <div style={contentStyle}>
        <div>{message}</div>
        {action && (
          <button
            style={actionButtonStyle}
            onClick={handleActionClick}
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        style={closeButtonStyle}
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(id), 300);
        }}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
});

ToastItem.displayName = 'ToastItem';

// ─── Toast Container Component ──────────────────────────────
const ToastContainer = memo(function ToastContainer({ toasts, onDismiss }) {
  const containerStyle = useMemo(() => ({
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    pointerEvents: 'auto',
  }), []);

  return (
    <div style={containerStyle} role="region" aria-label="Toast notifications" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';

// ─── Toast Provider ─────────────────────────────────────────
let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, options = {}) => {
    const id = `toast-${toastIdCounter++}`;
    const toast = {
      id,
      message,
      variant: options.variant || 'info',
      duration: options.duration !== undefined ? options.duration : 4000,
      action: options.action,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <ToastContainer toasts={toasts} onDismiss={dismiss} />,
        document.body
      )}
    </ToastContext.Provider>
  );
}

// ─── useToast Hook ──────────────────────────────────────────
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn('useToast must be used within a ToastProvider');
    return {
      show: () => {},
      dismiss: () => {},
    };
  }
  return context;
}

// ─── Toast Component (standalone) ───────────────────────────
const Toast = forwardRef(function Toast(props, ref) {
  const toastContext = useContext(ToastContext);

  if (!toastContext) {
    return null;
  }

  // This component renders the portal, which is handled by ToastProvider
  // This exists for convenience if not using ToastProvider
  return null;
});

Toast.displayName = 'Toast';

export default memo(Toast);
export { ToastContext };

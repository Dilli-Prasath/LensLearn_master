import { forwardRef, memo } from 'react';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../lib/components/Button';

const ErrorState = forwardRef(
  ({ title, message, onRetry, type = 'general', className, style }, ref) => {
    const getIcon = () => {
      switch (type) {
        case 'connection':
          return <WifiOff size={48} style={styles.icon} />;
        case 'processing':
          return <AlertCircle size={48} style={styles.icon} />;
        case 'general':
        default:
          return <AlertCircle size={48} style={styles.icon} />;
      }
    };

    const getHelpText = () => {
      switch (type) {
        case 'connection':
          return [
            'Check your internet connection',
            'Make sure Ollama is running locally',
            'Try refreshing the page',
          ];
        case 'processing':
          return [
            'Processing is taking longer than expected',
            'Try uploading a smaller or clearer image',
            'Check that your device has sufficient memory',
          ];
        case 'general':
        default:
          return [
            'Try refreshing the page',
            'Check your internet connection',
            'If the problem persists, try again later',
          ];
      }
    };

    const helpText = getHelpText();
    const containerStyle = {
      ...styles.container,
      ...(style || {}),
    };

    return (
      <div
        ref={ref}
        style={containerStyle}
        className={className}
      >
        <div style={styles.content}>
          <div style={styles.iconWrapper}>{getIcon()}</div>

          <h2 style={styles.title}>{title}</h2>
          <p style={styles.message}>{message}</p>

          <div style={styles.tipsContainer}>
            <p style={styles.tipsHeader}>Here are some tips:</p>
            <ul style={styles.tipsList}>
              {helpText.map((tip, index) => (
                <li key={index} style={styles.tipsItem}>
                  <span style={styles.bulletPoint}>&#8226;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {onRetry && (
            <Button
              onClick={onRetry}
              variant="primary"
              className="w-full mt-2"
              icon={<RefreshCw size={18} />}
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    minHeight: '300px',
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    color: 'var(--error)',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  message: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    margin: 0,
  },
  tipsContainer: {
    width: '100%',
    textAlign: 'left',
    background: 'rgba(99, 102, 241, 0.05)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: 'var(--radius)',
    padding: 16,
    marginTop: 8,
  },
  tipsHeader: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 10px 0',
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  tipsItem: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    margin: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletPoint: {
    color: 'var(--primary-light)',
    fontWeight: 'bold',
    flexShrink: 0,
  },
};

export default memo(ErrorState);

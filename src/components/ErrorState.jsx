import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title, message, onRetry, type = 'general' }) {
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
        return (
          <ul style={styles.tipsList}>
            <li style={styles.tipsItem}>Check your internet connection</li>
            <li style={styles.tipsItem}>Make sure Ollama is running locally</li>
            <li style={styles.tipsItem}>Try refreshing the page</li>
          </ul>
        );
      case 'processing':
        return (
          <ul style={styles.tipsList}>
            <li style={styles.tipsItem}>Processing is taking longer than expected</li>
            <li style={styles.tipsItem}>Try uploading a smaller or clearer image</li>
            <li style={styles.tipsItem}>Check that your device has sufficient memory</li>
          </ul>
        );
      case 'general':
      default:
        return (
          <ul style={styles.tipsList}>
            <li style={styles.tipsItem}>Try refreshing the page</li>
            <li style={styles.tipsItem}>Check your internet connection</li>
            <li style={styles.tipsItem}>If the problem persists, try again later</li>
          </ul>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconWrapper}>{getIcon()}</div>

        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>

        <div style={styles.tipsContainer}>
          <p style={styles.tipsHeader}>Here are some tips:</p>
          {getHelpText()}
        </div>

        {onRetry && (
          <button style={styles.retryBtn} onClick={onRetry} className="btn btn-primary btn-full">
            <RefreshCw size={18} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

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
    paddingLeft: 16,
    position: 'relative',
  },
  retryBtn: {
    width: '100%',
    marginTop: 8,
  },
};

// Add bullet point styling
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  [style*="paddingLeft: 16px"]::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--primary-light);
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
}

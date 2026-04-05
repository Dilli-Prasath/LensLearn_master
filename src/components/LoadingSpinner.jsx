import { forwardRef, memo } from 'react';

const LoadingSpinner = forwardRef(
  (
    { variant = 'pulse', text, size = 'md', className, style },
    ref
  ) => {
    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return { width: 20, height: 20, dotSize: 4 };
        case 'lg':
          return { width: 40, height: 40, dotSize: 8 };
        case 'md':
        default:
          return { width: 32, height: 32, dotSize: 6 };
      }
    };

    const sizeStyles = getSizeStyles();

    const pulseVariant = () => (
      <div style={styles.pulseContainer}>
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
        <div style={{ ...styles.pulseWrapper, gap: sizeStyles.dotSize }}>
          <div
            style={{
              ...styles.pulseDot,
              width: sizeStyles.dotSize,
              height: sizeStyles.dotSize,
              animationDelay: '0s',
            }}
          />
          <div
            style={{
              ...styles.pulseDot,
              width: sizeStyles.dotSize,
              height: sizeStyles.dotSize,
              animationDelay: '0.2s',
            }}
          />
          <div
            style={{
              ...styles.pulseDot,
              width: sizeStyles.dotSize,
              height: sizeStyles.dotSize,
              animationDelay: '0.4s',
            }}
          />
        </div>
      </div>
    );

    const scanVariant = () => (
      <div style={styles.scanContainer}>
        <style>{`
          @keyframes scan-line {
            0% {
              top: 0;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              top: 100%;
              opacity: 0;
            }
          }
        `}</style>
        <div style={styles.scanBox}>
          <div style={styles.scanLineAnimated} />
        </div>
        {text && <p style={styles.scanText}>{text}</p>}
      </div>
    );

    const brainVariant = () => (
      <div style={styles.brainContainer}>
        <style>{`
          @keyframes brain-pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
            }
          }
          @keyframes sparkle-float {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translate(var(--tx), var(--ty)) scale(0);
              opacity: 0;
            }
          }
        `}</style>
        <div style={styles.brainWrapper}>
          <svg
            width={sizeStyles.width}
            height={sizeStyles.height}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={styles.brainIcon}
          >
            <path
              d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z"
              fill="none"
              stroke="var(--primary-light)"
              strokeWidth="1.5"
            />
            <path
              d="M16 8c-2 0-3 1-3 2.5v2c0 1 .5 2 1.5 2 1.5 0 2-1 2-2v-2c0-1.5-1-2.5-3-2.5z"
              fill="var(--primary-light)"
            />
            <path
              d="M13 18c0 1.5 1 2 2.5 2s2.5-.5 2.5-2"
              stroke="var(--primary-light)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          <div
            style={{
              ...styles.sparkle,
              '--tx': '12px',
              '--ty': '-8px',
              animationDelay: '0s',
            }}
          >
            ✨
          </div>
          <div
            style={{
              ...styles.sparkle,
              '--tx': '-12px',
              '--ty': '-8px',
              animationDelay: '0.3s',
            }}
          >
            ✨
          </div>
          <div
            style={{
              ...styles.sparkle,
              '--tx': '0px',
              '--ty': '14px',
              animationDelay: '0.6s',
            }}
          >
            ✨
          </div>
        </div>
        {text && <p style={styles.brainText}>{text}</p>}
      </div>
    );

    const renderVariant = () => {
      switch (variant) {
        case 'scan':
          return scanVariant();
        case 'brain':
          return brainVariant();
        case 'pulse':
        default:
          return pulseVariant();
      }
    };

    const wrapperStyle = {
      ...styles.wrapper,
      ...(style || {}),
    };

    return (
      <div
        ref={ref}
        style={wrapperStyle}
        className={className}
      >
        {renderVariant()}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pulseContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  pulseDot: {
    borderRadius: '50%',
    background: 'var(--primary-light)',
    animation: 'pulse-dot 1.4s ease-in-out infinite',
  },
  scanContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  scanBox: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 'var(--radius)',
    border: '2px solid var(--primary-light)',
    overflow: 'hidden',
    background: 'rgba(99, 102, 241, 0.05)',
  },
  scanLineAnimated: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: 'linear-gradient(90deg, transparent, var(--primary-light), transparent)',
    animation: 'scan-line 2s ease-in-out infinite',
  },
  scanText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontWeight: 500,
    margin: 0,
  },
  brainContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  brainWrapper: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainIcon: {
    animation: 'brain-pulse 2s ease-in-out infinite',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
    animation: 'sparkle-float 1.5s ease-out infinite',
  },
  brainText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontWeight: 500,
    margin: 0,
  },
};

export default memo(LoadingSpinner);

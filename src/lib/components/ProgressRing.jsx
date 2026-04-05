/**
 * ProgressRing - Circular SVG progress ring component
 *
 * A reusable, library-grade circular progress indicator with smooth transitions,
 * optional value display, and customizable styling via inline styles and CSS variables.
 *
 * Usage:
 *   <ProgressRing value={65} size={120} color="var(--accent-main)" />
 *   <ProgressRing value={75} showValue label="Progress" size={140} />
 *   <ProgressRing value={50} size={100}>
 *     <span style={{ fontSize: '1rem', fontWeight: 600 }}>50%</span>
 *   </ProgressRing>
 */
import { forwardRef, memo, useMemo } from 'react';

const ProgressRing = forwardRef(function ProgressRing(
  {
    value = 0,
    size = 120,
    strokeWidth = 6,
    color = 'var(--accent-main)',
    trackColor = 'var(--border-primary)',
    showValue = false,
    label = '',
    children,
    style,
    ...props
  },
  ref
) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // SVG circle calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const containerStyle = useMemo(() => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: size,
    height: size,
    ...style,
  }), [size, style]);

  const svgStyle = useMemo(() => ({
    transform: 'rotate(-90deg)',
    width: size,
    height: size,
  }), [size]);

  const circleTrackStyle = useMemo(() => ({
    fill: 'none',
    stroke: trackColor,
    strokeWidth,
  }), [trackColor, strokeWidth]);

  const circleProgressStyle = useMemo(() => ({
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeDasharray: circumference,
    strokeDashoffset,
    transition: 'stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)',
    transformOrigin: `${size / 2}px ${size / 2}px`,
  }), [color, strokeWidth, circumference, strokeDashoffset, size]);

  const contentContainerStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  }), []);

  const valueTextStyle = useMemo(() => ({
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary, #f1f5f9)',
    margin: 0,
    lineHeight: 1,
  }), []);

  const labelTextStyle = useMemo(() => ({
    fontSize: '0.75rem',
    color: 'var(--text-secondary, #94a3b8)',
    margin: 0,
    lineHeight: 1,
    textAlign: 'center',
  }), []);

  return (
    <div
      ref={ref}
      style={containerStyle}
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `Progress: ${normalizedValue}%`}
      {...props}
    >
      <svg style={svgStyle} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          style={circleTrackStyle}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          style={circleProgressStyle}
        />
      </svg>

      <div style={contentContainerStyle}>
        {children ? (
          children
        ) : (
          <>
            {showValue && <div style={valueTextStyle}>{normalizedValue}%</div>}
            {label && <div style={labelTextStyle}>{label}</div>}
          </>
        )}
      </div>
    </div>
  );
});

ProgressRing.displayName = 'ProgressRing';

export default memo(ProgressRing);

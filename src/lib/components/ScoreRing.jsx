/**
 * ScoreRing - Quiz/flashcard score display ring with grade letter
 *
 * A circular progress ring that displays quiz scores with automatic grade
 * calculation (A+/A/B/C/D) and color-coded feedback based on performance.
 * Suitable for quiz results, assessments, and skill evaluations.
 *
 * Usage:
 *   <ScoreRing score={95} total={100} showGrade />
 *   <ScoreRing score={18} total={25} size={150} />
 *   <ScoreRing score={80} total={100}>
 *     <span>Excellent!</span>
 *   </ScoreRing>
 */
import { forwardRef, memo, useMemo } from 'react';

/**
 * Calculate grade letter based on percentage
 * @param {number} percentage - Score as percentage (0-100)
 * @returns {{ grade: string, color: string }}
 */
function calculateGrade(percentage) {
  if (percentage >= 97) return { grade: 'A+', color: '#10b981' };
  if (percentage >= 93) return { grade: 'A', color: '#10b981' };
  if (percentage >= 87) return { grade: 'B+', color: '#3b82f6' };
  if (percentage >= 80) return { grade: 'B', color: '#3b82f6' };
  if (percentage >= 70) return { grade: 'C', color: '#f59e0b' };
  if (percentage >= 60) return { grade: 'D', color: '#ef4444' };
  return { grade: 'F', color: '#dc2626' };
}

const ScoreRing = forwardRef(function ScoreRing(
  {
    score = 0,
    total = 100,
    showGrade = true,
    size = 120,
    children,
    style,
    ...props
  },
  ref
) {
  // Calculate percentage and ensure it's between 0 and 100
  const percentage = Math.min(Math.max((score / total) * 100, 0), 100);
  const { grade, color } = calculateGrade(percentage);

  // SVG circle calculations
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
    stroke: 'var(--border-primary, #334155)',
    strokeWidth,
  }), []);

  const circleProgressStyle = useMemo(() => ({
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeDasharray: circumference,
    strokeDashoffset,
    transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1), stroke 400ms ease',
    transformOrigin: `${size / 2}px ${size / 2}px`,
  }), [color, circumference, strokeDashoffset, size]);

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
    gap: showGrade ? '4px' : '8px',
  }), [showGrade]);

  const percentageStyle = useMemo(() => ({
    fontSize: '1.5rem',
    fontWeight: 700,
    color: color,
    margin: 0,
    lineHeight: 1,
  }), [color]);

  const gradeStyle = useMemo(() => ({
    fontSize: '1.25rem',
    fontWeight: 600,
    color: color,
    margin: 0,
    lineHeight: 1,
  }), [color]);

  return (
    <div
      ref={ref}
      style={containerStyle}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score: ${Math.round(percentage)}%, Grade: ${grade}`}
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
            <div style={percentageStyle}>{Math.round(percentage)}%</div>
            {showGrade && <div style={gradeStyle}>{grade}</div>}
          </>
        )}
      </div>
    </div>
  );
});

ScoreRing.displayName = 'ScoreRing';

export default memo(ScoreRing);
export { calculateGrade };

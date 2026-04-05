/**
 * Skeleton - Content loading placeholder
 *
 * Usage:
 *   <Skeleton width="200px" height="20px" />
 *   <Skeleton.Circle size="48px" />
 *   <Skeleton.Text lines={3} />
 *   <Skeleton.Card />
 */
import { memo } from 'react';

const shimmerStyle = {
  background: 'linear-gradient(90deg, var(--bg-tertiary, #334155) 25%, rgba(255,255,255,0.08) 50%, var(--bg-tertiary, #334155) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite linear',
};

function Skeleton({ width = '100%', height = '16px', radius = '8px', style, ...props }) {
  return (
    <div
      style={{
        width, height, borderRadius: radius,
        ...shimmerStyle, ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

const SkeletonCircle = memo(function SkeletonCircle({ size = '40px', style }) {
  return <Skeleton width={size} height={size} radius="50%" style={style} />;
});

const SkeletonText = memo(function SkeletonText({ lines = 3, gap = '8px', lastWidth = '60%', style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastWidth : '100%'}
          height="14px"
        />
      ))}
    </div>
  );
});

const SkeletonCard = memo(function SkeletonCard({ style }) {
  return (
    <div style={{
      padding: '16px', borderRadius: '12px',
      background: 'var(--bg-secondary, #1e293b)',
      border: '1px solid var(--border-primary, #334155)',
      ...style,
    }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <SkeletonCircle size="40px" />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
});

Skeleton.Circle = SkeletonCircle;
Skeleton.Text = SkeletonText;
Skeleton.Card = SkeletonCard;

export default memo(Skeleton);

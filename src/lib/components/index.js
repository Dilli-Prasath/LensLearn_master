/**
 * LensLearn UI Components Library
 *
 * All reusable UI primitives and compound components.
 *
 * Usage:
 *   import { Button, Card, Badge, Modal, ChatThread } from '@/lib/components';
 */

// ─── Primitives ────────────────────────────────────────────
export { default as Button, buttonVariants, buttonSizes } from './Button';
export { default as IconButton } from './IconButton';
export { default as Card, cardVariants, CardContext } from './Card';
export { default as Badge } from './Badge';
export { default as Chip } from './Chip';
export { default as Input } from './Input';
export { default as Toggle } from './Toggle';
export { default as Modal } from './Modal';
export { default as Tooltip } from './Tooltip';
export { default as Skeleton } from './Skeleton';
export { default as Progress } from './Progress';

// ─── Compound Components ───────────────────────────────────
export { default as ProgressRing } from './ProgressRing';
export { default as ScoreRing } from './ScoreRing';
export { default as ChatThread } from './ChatThread';
export { default as LanguageSelector } from './LanguageSelector';
export { default as Dropdown } from './Dropdown';
export { default as EmptyState } from './EmptyState';
export { default as Toast, ToastProvider, useToast } from './Toast';

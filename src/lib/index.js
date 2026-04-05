/**
 * LensLearn UI Library
 *
 * A complete, reusable React component library for building
 * beautiful, accessible, AI-powered educational applications.
 *
 * @package @lenslearn/ui
 * @version 1.0.0
 * @license Apache-2.0
 *
 * Usage:
 *   // Import individual modules
 *   import { Button, Card, Badge } from '@lenslearn/ui/components';
 *   import { useDebounce, useBreakpoint } from '@lenslearn/ui/hooks';
 *   import { tokens, createTheme } from '@lenslearn/ui/tokens';
 *
 *   // Or import everything
 *   import { Button, useDebounce, tokens } from '@lenslearn/ui';
 */

// ─── Design Tokens ─────────────────────────────────────────
export {
  default as tokens,
  colorPrimitives,
  semanticColors,
  spacing,
  typography,
  radii,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  themePresets,
  accentColors,
  createTheme,
  applyThemeToDOM,
  sx,
} from './tokens';

// ─── Components ────────────────────────────────────────────
export {
  Button,
  buttonVariants,
  buttonSizes,
  IconButton,
  Card,
  cardVariants,
  CardContext,
  Badge,
  Chip,
  Input,
  Toggle,
  Modal,
  Tooltip,
  Skeleton,
  Progress,
  ProgressRing,
  ScoreRing,
  ChatThread,
  LanguageSelector,
  Dropdown,
  EmptyState,
  Toast,
  ToastProvider,
  useToast,
} from './components';

// ─── Hooks ─────────────────────────────────────────────────
export {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useMediaQuery,
  useBreakpoint,
  useClickOutside,
  useKeyboard,
  useIntersectionObserver,
  useLocalStorage,
  useToggle,
  usePrevious,
  useAsync,
  useMounted,
  useEventListener,
  useCountdown,
  useScrollPosition,
  useLongPress,
  useSwipe,
} from './hooks';

// ─── Providers ─────────────────────────────────────────────
export {
  ThemeProvider,
  useTheme,
  AccessibilityProvider,
  useA11y,
} from './providers';

// ─── Animations ────────────────────────────────────────────
export {
  keyframes,
  animate,
  stagger,
  combineAnimations,
  keyframeCSS,
  preloadAnimations,
} from './animations';

// ─── Utilities ─────────────────────────────────────────────
export {
  cn,
  mergeStyles,
  clamp,
  formatNumber,
  pluralize,
  truncateText,
  generateId,
  copyToClipboard,
  shareContent,
  isReducedMotion,
  supportsHover,
  isTouchDevice,
  sleep,
  noop,
  createEventEmitter,
} from './utils';

// ─── Higher-Order Components ───────────────────────────────
export {
  withErrorBoundary,
  withAccessibility,
  withAnalytics,
  withLazyLoad,
} from './hoc';

/**
 * LensLearn Design Token System
 *
 * A comprehensive, composable design token system for building
 * consistent UI across the entire application.
 *
 * Usage:
 *   import { tokens, createTheme, spacing, colors } from '@/lib/tokens';
 */

// ─── Color Primitives ───────────────────────────────────────
export const colorPrimitives = {
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
    400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
    800: '#1e293b', 900: '#0f172a', 950: '#020617',
  },
  indigo: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
    400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
    800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
    400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
    800: '#065f46', 900: '#064e3b', 950: '#022c22',
  },
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
    800: '#92400e', 900: '#78350f', 950: '#451a03',
  },
  red: {
    50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
    400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
    800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
  },
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
    800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
  },
  purple: {
    50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
    400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
    800: '#6b21a8', 900: '#581c87', 950: '#3b0764',
  },
  cyan: {
    50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
    400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
    800: '#155e75', 900: '#164e63', 950: '#083344',
  },
  pink: {
    50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4',
    400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d',
    800: '#9d174d', 900: '#831843', 950: '#500724',
  },
  orange: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
    400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
    800: '#9a3412', 900: '#7c2d12', 950: '#431407',
  },
  green: {
    50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
    400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
    800: '#166534', 900: '#14532d', 950: '#052e16',
  },
  lime: {
    50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264',
    400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f',
    800: '#3f6212', 900: '#365314', 950: '#1a2e05',
  },
};

// ─── Semantic Colors ────────────────────────────────────────
export const semanticColors = {
  primary: colorPrimitives.indigo,
  secondary: colorPrimitives.slate,
  success: colorPrimitives.emerald,
  warning: colorPrimitives.amber,
  error: colorPrimitives.red,
  info: colorPrimitives.blue,
};

// ─── Spacing Scale (4px base) ───────────────────────────────
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
};

// ─── Typography ─────────────────────────────────────────────
export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ─── Border Radius ──────────────────────────────────────────
export const radii = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

// ─── Shadows ────────────────────────────────────────────────
export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  glow: (color = 'rgba(99, 102, 241, 0.4)') => `0 0 20px ${color}`,
  glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
};

// ─── Transitions ────────────────────────────────────────────
export const transitions = {
  duration: {
    fastest: '50ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  property: {
    all: 'all',
    colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform',
  },
};

// ─── Breakpoints ────────────────────────────────────────────
export const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ─── Z-Index ────────────────────────────────────────────────
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  banner: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 9999,
};

// ─── Theme Presets ──────────────────────────────────────────
export const themePresets = {
  dark: {
    name: 'Dark',
    colors: {
      bg: { primary: '#0f172a', secondary: '#1e293b', tertiary: '#334155', elevated: '#1a2744' },
      text: { primary: '#f1f5f9', secondary: '#94a3b8', tertiary: '#64748b', inverse: '#0f172a' },
      border: { primary: '#334155', secondary: '#475569', focus: '#6366f1' },
      surface: { glass: 'rgba(30, 41, 59, 0.7)', overlay: 'rgba(0, 0, 0, 0.5)' },
    },
  },
  midnight: {
    name: 'Midnight',
    colors: {
      bg: { primary: '#030712', secondary: '#111827', tertiary: '#1f2937', elevated: '#0a1628' },
      text: { primary: '#f9fafb', secondary: '#9ca3af', tertiary: '#6b7280', inverse: '#030712' },
      border: { primary: '#1f2937', secondary: '#374151', focus: '#6366f1' },
      surface: { glass: 'rgba(17, 24, 39, 0.8)', overlay: 'rgba(0, 0, 0, 0.7)' },
    },
  },
  amoled: {
    name: 'AMOLED',
    colors: {
      bg: { primary: '#000000', secondary: '#0a0a0a', tertiary: '#171717', elevated: '#0d0d1a' },
      text: { primary: '#ffffff', secondary: '#a3a3a3', tertiary: '#737373', inverse: '#000000' },
      border: { primary: '#262626', secondary: '#404040', focus: '#6366f1' },
      surface: { glass: 'rgba(10, 10, 10, 0.9)', overlay: 'rgba(0, 0, 0, 0.8)' },
    },
  },
  light: {
    name: 'Light',
    colors: {
      bg: { primary: '#ffffff', secondary: '#f8fafc', tertiary: '#f1f5f9', elevated: '#ffffff' },
      text: { primary: '#0f172a', secondary: '#475569', tertiary: '#94a3b8', inverse: '#ffffff' },
      border: { primary: '#e2e8f0', secondary: '#cbd5e1', focus: '#6366f1' },
      surface: { glass: 'rgba(255, 255, 255, 0.7)', overlay: 'rgba(0, 0, 0, 0.3)' },
    },
  },
  sepia: {
    name: 'Sepia',
    colors: {
      bg: { primary: '#f5f0e8', secondary: '#ede6d8', tertiary: '#ddd4c2', elevated: '#faf6ee' },
      text: { primary: '#3d2e1f', secondary: '#6b5744', tertiary: '#9c8b78', inverse: '#f5f0e8' },
      border: { primary: '#d4c9b8', secondary: '#bfb39f', focus: '#8b6914' },
      surface: { glass: 'rgba(245, 240, 232, 0.7)', overlay: 'rgba(0, 0, 0, 0.3)' },
    },
  },
};

// ─── Accent Color Map ───────────────────────────────────────
export const accentColors = {
  indigo:  { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', glow: 'rgba(99, 102, 241, 0.3)' },
  blue:    { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', glow: 'rgba(59, 130, 246, 0.3)' },
  purple:  { main: '#a855f7', light: '#c084fc', dark: '#9333ea', glow: 'rgba(168, 85, 247, 0.3)' },
  pink:    { main: '#ec4899', light: '#f472b6', dark: '#db2777', glow: 'rgba(236, 72, 153, 0.3)' },
  orange:  { main: '#f97316', light: '#fb923c', dark: '#ea580c', glow: 'rgba(249, 115, 22, 0.3)' },
  green:   { main: '#22c55e', light: '#4ade80', dark: '#16a34a', glow: 'rgba(34, 197, 94, 0.3)' },
  red:     { main: '#ef4444', light: '#f87171', dark: '#dc2626', glow: 'rgba(239, 68, 68, 0.3)' },
  cyan:    { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2', glow: 'rgba(6, 182, 212, 0.3)' },
  lime:    { main: '#84cc16', light: '#a3e635', dark: '#65a30d', glow: 'rgba(132, 204, 22, 0.3)' },
  amber:   { main: '#f59e0b', light: '#fbbf24', dark: '#d97706', glow: 'rgba(245, 158, 11, 0.3)' },
};

// ─── Create Theme Function ──────────────────────────────────
export function createTheme(preset = 'dark', accent = 'indigo', overrides = {}) {
  const base = themePresets[preset] || themePresets.dark;
  const accentColor = accentColors[accent] || accentColors.indigo;

  return {
    ...base,
    accent: accentColor,
    colors: {
      ...base.colors,
      accent: accentColor,
      ...(overrides.colors || {}),
    },
    spacing,
    typography,
    radii,
    shadows,
    transitions,
    breakpoints,
    zIndex,
    ...overrides,
  };
}

// ─── Apply Theme to CSS Variables ───────────────────────────
export function applyThemeToDOM(theme) {
  const root = document.documentElement;
  const { colors, accent } = theme;

  // Background colors
  root.style.setProperty('--bg-primary', colors.bg.primary);
  root.style.setProperty('--bg-secondary', colors.bg.secondary);
  root.style.setProperty('--bg-tertiary', colors.bg.tertiary);
  root.style.setProperty('--bg-elevated', colors.bg.elevated);

  // Text colors
  root.style.setProperty('--text-primary', colors.text.primary);
  root.style.setProperty('--text-secondary', colors.text.secondary);
  root.style.setProperty('--text-tertiary', colors.text.tertiary);

  // Border colors
  root.style.setProperty('--border-primary', colors.border.primary);
  root.style.setProperty('--border-secondary', colors.border.secondary);
  root.style.setProperty('--border-focus', colors.border.focus);

  // Surface
  root.style.setProperty('--surface-glass', colors.surface.glass);
  root.style.setProperty('--surface-overlay', colors.surface.overlay);

  // Accent
  root.style.setProperty('--accent-main', accent.main);
  root.style.setProperty('--accent-light', accent.light);
  root.style.setProperty('--accent-dark', accent.dark);
  root.style.setProperty('--accent-glow', accent.glow);

  // Legacy compatibility
  root.style.setProperty('--primary', accent.main);
  root.style.setProperty('--primary-light', accent.light);
  root.style.setProperty('--primary-dark', accent.dark);
  root.style.setProperty('--primary-glow', accent.glow);
}

// ─── Style Helpers ──────────────────────────────────────────
export const sx = {
  flex: (direction = 'row', align = 'center', justify = 'flex-start') => ({
    display: 'flex', flexDirection: direction, alignItems: align, justifyContent: justify,
  }),
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  flexColumn: { display: 'flex', flexDirection: 'column' },

  grid: (cols = 1, gap = '16px') => ({
    display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap,
  }),
  autoGrid: (minWidth = '200px', gap = '16px') => ({
    display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`, gap,
  }),

  glass: (opacity = 0.7) => ({
    background: `rgba(30, 41, 59, ${opacity})`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }),

  truncate: {
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  lineClamp: (lines = 2) => ({
    display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  }),

  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  fixedFill: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },

  transition: (prop = 'all', duration = '200ms', easing = 'cubic-bezier(0.4, 0, 0.2, 1)') =>
    ({ transition: `${prop} ${duration} ${easing}` }),

  gradient: (from, to, direction = '135deg') =>
    ({ background: `linear-gradient(${direction}, ${from}, ${to})` }),

  size: (w, h) => ({ width: w, height: h || w }),
  minSize: (w, h) => ({ minWidth: w, minHeight: h || w }),
};

// ─── Default Export ─────────────────────────────────────────
const tokens = {
  colors: colorPrimitives,
  semantic: semanticColors,
  spacing,
  typography,
  radii,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  themes: themePresets,
  accents: accentColors,
};

export default tokens;

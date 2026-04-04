/**
 * LensLearn Theme System
 * Supports built-in themes + custom accent color
 */

export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Dark',
    preview: { bg: '#0f172a', card: '#1e293b', text: '#f1f5f9' },
    vars: {
      '--bg-dark': '#0f172a',
      '--bg-base': '#1a202c',
      '--bg-card': '#1e293b',
      '--bg-card-hover': '#334155',
      '--bg-input': '#1e293b',
      '--bg-overlay': 'rgba(15, 23, 42, 0.8)',
      '--bg-glass': 'rgba(30, 41, 59, 0.7)',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--text-subtle': '#475569',
      '--border': '#334155',
      '--border-light': '#475569',
      '--divider': 'rgba(226, 232, 240, 0.1)',
      '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    preview: { bg: '#020617', card: '#0f172a', text: '#e2e8f0' },
    vars: {
      '--bg-dark': '#020617',
      '--bg-base': '#0a0f1e',
      '--bg-card': '#0f172a',
      '--bg-card-hover': '#1e293b',
      '--bg-input': '#0f172a',
      '--bg-overlay': 'rgba(2, 6, 23, 0.9)',
      '--bg-glass': 'rgba(15, 23, 42, 0.7)',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--text-subtle': '#475569',
      '--border': '#1e293b',
      '--border-light': '#334155',
      '--divider': 'rgba(226, 232, 240, 0.06)',
      '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
    },
  },
  amoled: {
    id: 'amoled',
    name: 'AMOLED Black',
    preview: { bg: '#000000', card: '#0a0a0a', text: '#ffffff' },
    vars: {
      '--bg-dark': '#000000',
      '--bg-base': '#050505',
      '--bg-card': '#0a0a0a',
      '--bg-card-hover': '#1a1a1a',
      '--bg-input': '#0a0a0a',
      '--bg-overlay': 'rgba(0, 0, 0, 0.9)',
      '--bg-glass': 'rgba(10, 10, 10, 0.8)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#a1a1a1',
      '--text-muted': '#6b6b6b',
      '--text-subtle': '#4a4a4a',
      '--border': '#1a1a1a',
      '--border-light': '#2a2a2a',
      '--divider': 'rgba(255, 255, 255, 0.06)',
      '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.8), 0 2px 4px -2px rgba(0, 0, 0, 0.6)',
    },
  },
  light: {
    id: 'light',
    name: 'Light',
    preview: { bg: '#f8fafc', card: '#ffffff', text: '#0f172a' },
    vars: {
      '--bg-dark': '#f8fafc',
      '--bg-base': '#f1f5f9',
      '--bg-card': '#ffffff',
      '--bg-card-hover': '#f1f5f9',
      '--bg-input': '#ffffff',
      '--bg-overlay': 'rgba(248, 250, 252, 0.9)',
      '--bg-glass': 'rgba(255, 255, 255, 0.8)',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-muted': '#94a3b8',
      '--text-subtle': '#cbd5e1',
      '--border': '#e2e8f0',
      '--border-light': '#cbd5e1',
      '--divider': 'rgba(15, 23, 42, 0.08)',
      '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
    },
  },
  sepia: {
    id: 'sepia',
    name: 'Warm Sepia',
    preview: { bg: '#fdf6e3', card: '#fff8e7', text: '#3b2e1a' },
    vars: {
      '--bg-dark': '#fdf6e3',
      '--bg-base': '#f5edd6',
      '--bg-card': '#fff8e7',
      '--bg-card-hover': '#f5edd6',
      '--bg-input': '#fff8e7',
      '--bg-overlay': 'rgba(253, 246, 227, 0.9)',
      '--bg-glass': 'rgba(255, 248, 231, 0.8)',
      '--text-primary': '#3b2e1a',
      '--text-secondary': '#6b5c48',
      '--text-muted': '#9c8b72',
      '--text-subtle': '#c4b59d',
      '--border': '#e8dcc8',
      '--border-light': '#d4c4a8',
      '--divider': 'rgba(59, 46, 26, 0.08)',
      '--shadow': '0 4px 6px -1px rgba(59, 46, 26, 0.08), 0 2px 4px -2px rgba(59, 46, 26, 0.04)',
    },
  },
};

export const ACCENT_COLORS = [
  { id: 'indigo', name: 'Indigo', primary: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
  { id: 'blue', name: 'Blue', primary: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
  { id: 'emerald', name: 'Emerald', primary: '#10b981', light: '#34d399', dark: '#059669' },
  { id: 'rose', name: 'Rose', primary: '#f43f5e', light: '#fb7185', dark: '#e11d48' },
  { id: 'amber', name: 'Amber', primary: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
  { id: 'violet', name: 'Violet', primary: '#8b5cf6', light: '#a78bfa', dark: '#7c3aed' },
  { id: 'cyan', name: 'Cyan', primary: '#06b6d4', light: '#22d3ee', dark: '#0891b2' },
  { id: 'pink', name: 'Pink', primary: '#ec4899', light: '#f472b6', dark: '#db2777' },
  { id: 'orange', name: 'Orange', primary: '#f97316', light: '#fb923c', dark: '#ea580c' },
  { id: 'teal', name: 'Teal', primary: '#14b8a6', light: '#2dd4bf', dark: '#0d9488' },
];

export const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  { id: 'system', name: 'System', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { id: 'mono', name: 'Mono', family: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace" },
  { id: 'serif', name: 'Serif', family: "'Georgia', 'Times New Roman', serif" },
];

export const BORDER_RADIUS_OPTIONS = [
  { id: 'none', name: 'Sharp', radius: '0px', radiusSm: '0px', radiusLg: '0px' },
  { id: 'small', name: 'Subtle', radius: '6px', radiusSm: '4px', radiusLg: '8px' },
  { id: 'medium', name: 'Rounded', radius: '12px', radiusSm: '8px', radiusLg: '16px' },
  { id: 'large', name: 'Pill', radius: '20px', radiusSm: '14px', radiusLg: '24px' },
];

export const LAYOUT_WIDTH_OPTIONS = [
  { id: 'compact', name: 'Compact', maxWidth: '680px' },
  { id: 'comfortable', name: 'Comfortable', maxWidth: '900px' },
  { id: 'wide', name: 'Wide', maxWidth: '1200px' },
  { id: 'full', name: 'Full Width', maxWidth: '100%' },
];

/**
 * Apply theme + accent + font + radius to the document
 */
export function applyCustomization(customization) {
  const {
    theme = 'dark',
    accentColor = 'indigo',
    font = 'inter',
    borderRadius = 'medium',
    layoutWidth = 'wide',
  } = customization;

  const root = document.documentElement;

  // Apply theme vars
  const themeData = THEMES[theme];
  if (themeData) {
    Object.entries(themeData.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  // Apply accent color
  const accent = ACCENT_COLORS.find(a => a.id === accentColor);
  if (accent) {
    root.style.setProperty('--primary', accent.primary);
    root.style.setProperty('--primary-light', accent.light);
    root.style.setProperty('--primary-dark', accent.dark);
  }

  // Apply font
  const fontOption = FONT_OPTIONS.find(f => f.id === font);
  if (fontOption) {
    document.body.style.fontFamily = fontOption.family;
  }

  // Apply border radius
  const radiusOption = BORDER_RADIUS_OPTIONS.find(r => r.id === borderRadius);
  if (radiusOption) {
    root.style.setProperty('--radius', radiusOption.radius);
    root.style.setProperty('--radius-sm', radiusOption.radiusSm);
    root.style.setProperty('--radius-lg', radiusOption.radiusLg);
  }

  // Apply layout width
  const layoutOption = LAYOUT_WIDTH_OPTIONS.find(l => l.id === layoutWidth);
  if (layoutOption) {
    root.style.setProperty('--layout-max-width', layoutOption.maxWidth);
  }

  // Set data-theme on body for any CSS selectors that need it
  document.body.dataset.theme = theme;
}

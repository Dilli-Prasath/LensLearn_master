/**
 * ThemeProvider - Centralized theme context for the entire app
 *
 * Usage:
 *   <ThemeProvider preset="dark" accent="indigo">
 *     <App />
 *   </ThemeProvider>
 *
 *   const { theme, setPreset, setAccent } = useTheme();
 */
import { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react';
import { createTheme, applyThemeToDOM, themePresets, accentColors } from '../tokens';

const ThemeContext = createContext(null);

export function ThemeProvider({
  children,
  preset: initialPreset = 'dark',
  accent: initialAccent = 'indigo',
  overrides = {},
}) {
  const [preset, setPresetState] = useState(initialPreset);
  const [accent, setAccentState] = useState(initialAccent);

  const theme = useMemo(
    () => createTheme(preset, accent, overrides),
    [preset, accent, overrides]
  );

  useEffect(() => {
    applyThemeToDOM(theme);
    document.documentElement.setAttribute('data-theme', preset);
  }, [theme, preset]);

  const setPreset = useCallback((p) => {
    if (themePresets[p]) setPresetState(p);
  }, []);

  const setAccent = useCallback((a) => {
    if (accentColors[a]) setAccentState(a);
  }, []);

  const value = useMemo(
    () => ({ theme, preset, accent, setPreset, setAccent, presets: themePresets, accents: accentColors }),
    [theme, preset, accent, setPreset, setAccent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for usage outside provider — return default theme
    return {
      theme: createTheme('dark', 'indigo'),
      preset: 'dark',
      accent: 'indigo',
      setPreset: () => {},
      setAccent: () => {},
      presets: themePresets,
      accents: accentColors,
    };
  }
  return ctx;
}

export default ThemeProvider;

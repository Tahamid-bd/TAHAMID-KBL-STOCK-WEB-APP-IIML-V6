import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeName, ThemeMode } from '../types';

export const VALID_THEMES: ThemeName[] = [
  'corporate-light',
  'corporate-dark',
  'ocean-blue',
  'emerald-green',
  'royal-purple',
  'slate-gray',
  'modern-teal',
  'executive-navy',
  'warm-sand',
  'high-contrast',
];

interface ThemeContextType {
  themeName: ThemeName;
  setThemeName: (theme: ThemeName) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_NAME_KEY = 'potato_theme_name';
const THEME_MODE_KEY = 'potato_theme_mode';

const getInitialTheme = (): ThemeName => {
  try {
    const saved = localStorage.getItem(THEME_NAME_KEY) as ThemeName;
    if (saved && VALID_THEMES.includes(saved)) {
      return saved;
    }
  } catch (err) {
    console.error('Failed to read theme from localStorage:', err);
  }
  return 'corporate-dark';
};

const getInitialMode = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(THEME_MODE_KEY) as ThemeMode;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (err) {
    console.error('Failed to read theme mode from localStorage:', err);
  }
  return 'dark';
};

/**
 * Apply data-theme and .dark class synchronously to DOM roots
 */
export const applyThemeToDOM = (theme: ThemeName, mode: ThemeMode) => {
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (document.body) {
        document.body.setAttribute('data-theme', theme);
      }
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
        if (document.body) document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        if (document.body) document.body.classList.remove('dark');
      }
    }
  } catch (err) {
    console.error('Error applying theme to DOM:', err);
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>(() => {
    const initialTheme = getInitialTheme();
    const initialMode = getInitialMode();
    // Synchronously apply theme upon initialization
    applyThemeToDOM(initialTheme, initialMode);
    return initialTheme;
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return getInitialMode();
  });

  const isDark = themeMode === 'dark';

  const setThemeName = useCallback(
    (newTheme: ThemeName) => {
      if (!VALID_THEMES.includes(newTheme)) return;

      setThemeNameState(newTheme);

      try {
        localStorage.setItem(THEME_NAME_KEY, newTheme);
      } catch (err) {
        console.error('Failed to save theme to localStorage:', err);
      }

      let targetMode = themeMode;
      if (newTheme === 'corporate-light') {
        targetMode = 'light';
        setThemeModeState('light');
        try {
          localStorage.setItem(THEME_MODE_KEY, 'light');
        } catch (e) {}
      } else if (newTheme === 'corporate-dark') {
        targetMode = 'dark';
        setThemeModeState('dark');
        try {
          localStorage.setItem(THEME_MODE_KEY, 'dark');
        } catch (e) {}
      }

      // Apply immediately to DOM so the UI reflects change without lag
      applyThemeToDOM(newTheme, targetMode);
    },
    [themeMode]
  );

  const setThemeMode = useCallback(
    (newMode: ThemeMode) => {
      setThemeModeState(newMode);
      try {
        localStorage.setItem(THEME_MODE_KEY, newMode);
      } catch (err) {
        console.error('Failed to save mode to localStorage:', err);
      }
      applyThemeToDOM(themeName, newMode);
    },
    [themeName]
  );

  const toggleDarkMode = useCallback(() => {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [themeMode, setThemeMode]);

  // Guarantee persistence and DOM sync across state updates
  useEffect(() => {
    applyThemeToDOM(themeName, themeMode);
    try {
      localStorage.setItem(THEME_NAME_KEY, themeName);
      localStorage.setItem(THEME_MODE_KEY, themeMode);
    } catch (e) {}
  }, [themeName, themeMode]);

  // Sync across browser tabs if user changes theme in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_NAME_KEY && e.newValue) {
        const val = e.newValue as ThemeName;
        if (VALID_THEMES.includes(val)) {
          setThemeNameState(val);
        }
      }
      if (e.key === THEME_MODE_KEY && e.newValue) {
        const val = e.newValue as ThemeMode;
        if (val === 'light' || val === 'dark') {
          setThemeModeState(val);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        setThemeName,
        themeMode,
        setThemeMode,
        isDark,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

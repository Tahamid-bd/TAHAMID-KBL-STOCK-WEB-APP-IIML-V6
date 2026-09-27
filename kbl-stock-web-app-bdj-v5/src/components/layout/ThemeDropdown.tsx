import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sun, Moon, ChevronDown, Sliders } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { ThemeName } from '../../types';

export interface ThemeOption {
  id: ThemeName;
  name: string;
  color: string;
  colorName: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'corporate-dark',
    name: 'Corporate Dark',
    color: '#38bdf8',
    colorName: 'Cyan / Deep Slate',
    description: 'Modern executive dark theme with cyan highlights',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    color: '#2563eb',
    colorName: 'Royal Blue',
    description: 'Deep professional corporate blue',
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    color: '#059669',
    colorName: 'Forest Green',
    description: 'Fresh agricultural seed emerald green',
  },
  {
    id: 'corporate-light',
    name: 'Corporate Light',
    color: '#0284c7',
    colorName: 'Sky Blue / Light',
    description: 'Bright high-clarity enterprise white',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    color: '#7c3aed',
    colorName: 'Imperial Violet',
    description: 'Rich royal purple & indigo accents',
  },
  {
    id: 'modern-teal',
    name: 'Modern Teal',
    color: '#0d9488',
    colorName: 'Teal & Mint',
    description: 'Fresh modern teal & cold-storage aqua',
  },
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    color: '#1e3a8a',
    colorName: 'Deep Navy',
    description: 'Prestigious maritime navy palette',
  },
  {
    id: 'slate-gray',
    name: 'Slate Gray',
    color: '#475569',
    colorName: 'Neutral Slate',
    description: 'Subtle, balanced neutral slate palette',
  },
  {
    id: 'warm-sand',
    name: 'Warm Sand',
    color: '#b45309',
    colorName: 'Harvest Amber',
    description: 'Warm agricultural harvest amber tones',
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    color: '#000000',
    colorName: 'Monochrome High-Vis',
    description: 'Maximum contrast for high visibility',
  },
];

interface ThemeDropdownProps {
  onOpenThemeModal?: () => void;
  className?: string;
}

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({
  onOpenThemeModal,
  className = '',
}) => {
  const { themeName, setThemeName, themeMode, setThemeMode, isDark, toggleDarkMode } = useTheme();
  const { addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentTheme = THEME_OPTIONS.find((t) => t.id === themeName) || THEME_OPTIONS[0];

  const handleSelectTheme = (themeId: ThemeName, themeTitle: string) => {
    setThemeName(themeId);
    if (themeId === 'corporate-light') {
      setThemeMode('light');
    } else if (themeId === 'corporate-dark') {
      setThemeMode('dark');
    }
    setIsOpen(false);
    addToast?.(`Theme applied: ${themeTitle}`, 'info');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors border border-transparent hover:border-slate-600/60 cursor-pointer"
        title={`Current Theme: ${currentTheme.name}. Click to switch theme palette.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Theme selector dropdown"
      >
        <div className="flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-sky-400 shrink-0" />
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0 shadow-2xs"
            style={{ backgroundColor: currentTheme.color }}
          />
        </div>

        <span className="hidden xl:inline text-xs font-semibold text-slate-200 truncate max-w-[110px]">
          {currentTheme.name}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Theme Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Theme Palette
              </span>
            </div>

            {/* Quick Dark/Light Switch */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Toggle Light / Dark mode"
            >
              {isDark ? (
                <>
                  <Moon className="w-3 h-3 text-sky-400" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          {/* Theme Items List */}
          <div className="p-2 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = themeName === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id, theme.name)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className="w-5 h-5 rounded-full shrink-0 border border-black/10 dark:border-white/20 shadow-xs flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: theme.color }}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 shadow-2xs" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected
                              ? 'text-sky-700 dark:text-sky-300'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {theme.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                          ({theme.color})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {theme.colorName} • {theme.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-full bg-sky-500 text-white shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Action */}
          {onOpenThemeModal && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium px-2">
                Active: <strong className="text-slate-700 dark:text-slate-300">{currentTheme.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenThemeModal();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 px-2 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>More Appearance Options</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useEffect } from 'react';
import { X, Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { ThemeName } from '../../types';

interface ThemeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { isThemeModalOpen: contextIsOpen, setIsThemeModalOpen, addToast } = useApp();
  const { themeName, setThemeName, themeMode, setThemeMode } = useTheme();

  const isOpen = propIsOpen !== undefined ? propIsOpen : contextIsOpen;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    }
    setIsThemeModalOpen(false);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const themes: { id: ThemeName; label: string; primary: string; desc: string }[] = [
    { id: 'corporate-dark', label: 'Corporate Dark', primary: '#38bdf8', desc: 'Modern cyan & dark slate' },
    { id: 'corporate-light', label: 'Corporate Light', primary: '#0284c7', desc: 'Clean bright enterprise white' },
    { id: 'ocean-blue', label: 'Ocean Blue', primary: '#2563eb', desc: 'Deep professional blue' },
    { id: 'emerald-green', label: 'Emerald Green', primary: '#059669', desc: 'Natural agriculture forest green' },
    { id: 'royal-purple', label: 'Royal Purple', primary: '#7c3aed', desc: 'Rich indigo & violet' },
    { id: 'modern-teal', label: 'Modern Teal', primary: '#0d9488', desc: 'Crisp teal & cold storage mint' },
    { id: 'executive-navy', label: 'Executive Navy', primary: '#1e3a8a', desc: 'Prestigious maritime deep navy' },
    { id: 'slate-gray', label: 'Slate Gray', primary: '#475569', desc: 'Subtle neutral slate gray' },
    { id: 'warm-sand', label: 'Warm Amber', primary: '#b45309', desc: 'Warm harvest amber sand' },
    { id: 'high-contrast', label: 'High Contrast', primary: '#000000', desc: 'Maximum contrast monochrome' },
  ];

  const handleSelectTheme = (id: ThemeName, label: string) => {
    setThemeName(id);
    if (id === 'corporate-light') {
      setThemeMode('light');
    } else if (id === 'corporate-dark') {
      setThemeMode('dark');
    }
    addToast?.(`Switched theme to ${label}`, 'info');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs no-print"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Theme & Appearance
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personalize your workspace palette & display mode
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Light / Dark Mode Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Color Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setThemeMode('light');
                  addToast?.('Switched to Light Mode', 'info');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  themeMode === 'light'
                    ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setThemeMode('dark');
                  addToast?.('Switched to Dark Mode', 'info');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  themeMode === 'dark'
                    ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-4 h-4 text-sky-400" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Accent Palette
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {themes.map((t) => {
                const isSelected = themeName === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTheme(t.id, t.label)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/50 ring-1 ring-sky-500/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-white/20"
                        style={{ backgroundColor: t.primary }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {t.label}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {t.desc}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-500 shrink-0 ml-1 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Selected: <strong className="text-slate-700 dark:text-slate-300">{themeName}</strong>
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

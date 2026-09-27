import React from 'react';
import { Keyboard, X, Sparkles, Command, Printer, PackagePlus, Truck, FileSpreadsheet, Search, Menu, ArrowUp, CornerDownLeft } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutSections = [
    {
      title: 'Quick Data Entry & Modals',
      icon: PackagePlus,
      color: 'text-emerald-500',
      shortcuts: [
        {
          keys: [modKey, 'N'],
          description: 'Open New Stock Entry modal (Cold Storage In)',
          tag: 'Stock In',
        },
        {
          keys: [modKey, 'Shift', 'N'],
          description: 'Open New Delivery / Stock Out modal',
          tag: 'Delivery',
        },
        {
          keys: [modKey, 'I'],
          description: 'Open Import 2024 Excel batch dialog',
          tag: 'Import',
        },
        {
          keys: ['Alt', 'Q'],
          description: 'Toggle Quick Access Speed Dial menu',
          tag: 'Speed Dial',
        },
      ],
    },
    {
      title: 'Printing & Output',
      icon: Printer,
      color: 'text-sky-500',
      shortcuts: [
        {
          keys: [modKey, 'P'],
          description: 'Print preview & trigger high-res report printing',
          tag: 'Print',
        },
        {
          keys: [modKey, 'Shift', 'R'],
          description: 'Open Recycle Bin & deleted records vault',
          tag: 'Recycle',
        },
      ],
    },
    {
      title: 'Navigation & Search',
      icon: Search,
      color: 'text-indigo-500',
      shortcuts: [
        {
          keys: [modKey, 'K'],
          description: 'Focus global search / universal omnibar in header',
          tag: 'Search',
        },
        {
          keys: [modKey, 'B'],
          description: 'Toggle left sidebar menu expand / collapse',
          tag: 'Sidebar',
        },
        {
          keys: [modKey, '1'],
          description: 'Jump to Main Dashboard',
          tag: 'Nav',
        },
        {
          keys: [modKey, '2'],
          description: 'Jump to Stock Inward Register',
          tag: 'Nav',
        },
        {
          keys: [modKey, '3'],
          description: 'Jump to Deliveries Register',
          tag: 'Nav',
        },
        {
          keys: [modKey, '4'],
          description: 'Jump to Stock In All Records Report',
          tag: 'Nav',
        },
        {
          keys: [modKey, '5'],
          description: 'Jump to Closing Stock Report',
          tag: 'Nav',
        },
      ],
    },
    {
      title: 'General & Utilities',
      icon: Sparkles,
      color: 'text-amber-500',
      shortcuts: [
        {
          keys: ['Shift', '?'],
          description: 'Open this Keyboard Shortcuts cheat sheet',
          tag: 'Help',
        },
        {
          keys: ['Esc'],
          description: 'Close active modal, search popover, or speed dial',
          tag: 'Dismiss',
        },
        {
          keys: ['Alt', '↑'],
          description: 'Smooth scroll back to top of the page',
          tag: 'Scroll',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Keyboard Shortcuts for Power Users
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Speed up stock entries, printing, reporting, and navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {shortcutSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.title} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <Icon className={`w-4 h-4 ${sec.color}`} />
                  <span>{sec.title}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sec.shortcuts.map((sc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-slate-800 dark:text-slate-200 font-medium text-[11px] truncate">
                          {sc.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {sc.keys.map((k, ki) => (
                          <kbd
                            key={ki}
                            className="inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 text-[11px] font-mono font-bold rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 font-mono font-bold bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">Esc</kbd> anytime to dismiss dialogs</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

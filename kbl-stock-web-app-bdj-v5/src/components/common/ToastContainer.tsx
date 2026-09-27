import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastItem } from '../../types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const getToastConfig = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-500 dark:text-emerald-400',
          borderColor: 'border-emerald-500/40 dark:border-emerald-500/30',
          bgBadge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          indicator: 'bg-emerald-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-500 dark:text-amber-400',
          borderColor: 'border-amber-500/40 dark:border-amber-500/30',
          bgBadge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          indicator: 'bg-amber-500',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-rose-500 dark:text-rose-400',
          borderColor: 'border-rose-500/40 dark:border-rose-500/30',
          bgBadge: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
          indicator: 'bg-rose-500',
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-sky-500 dark:text-sky-400',
          borderColor: 'border-sky-500/40 dark:border-sky-500/30',
          bgBadge: 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
          indicator: 'bg-sky-500',
        };
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print px-3 sm:px-0"
    >
      {toasts.map((toast) => {
        const config = getToastConfig(toast.type);
        const IconComponent = config.icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border ${config.borderColor} shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all animate-in slide-in-from-right-6 duration-200`}
          >
            <div className="shrink-0 mt-0.5">
              <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

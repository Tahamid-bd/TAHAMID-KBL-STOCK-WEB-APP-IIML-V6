import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface AppFeedbackModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AppFeedbackModal: React.FC<AppFeedbackModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { feedbackDialog, closeFeedbackDialog } = useApp();

  const isOpen = propIsOpen !== undefined ? propIsOpen : (feedbackDialog?.isOpen ?? false);

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    }
    if (feedbackDialog?.onCancel) {
      feedbackDialog.onCancel();
    }
    closeFeedbackDialog();
  };

  const handleConfirm = () => {
    if (feedbackDialog?.onConfirm) {
      feedbackDialog.onConfirm();
    }
    if (propOnClose) {
      propOnClose();
    }
    closeFeedbackDialog();
  };

  // Close on Escape key
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

  const {
    type = 'info',
    title = 'Notification',
    message = '',
    confirmText = 'CONFIRM',
    cancelText = 'CANCEL',
    isConfirmation = false,
  } = feedbackDialog || {};

  const getIcon = () => {
    if (isConfirmation) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800 shadow-xs">
          <Trash2 className="w-6 h-6 stroke-[2.2]" />
        </div>
      );
    }
    switch (type) {
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800 shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800 shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800 shadow-xs">
            <Info className="w-6 h-6 stroke-[2.2]" />
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative gradient top bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isConfirmation || type === 'error'
              ? 'bg-rose-500'
              : type === 'warning'
              ? 'bg-amber-500'
              : type === 'success'
              ? 'bg-emerald-500'
              : 'bg-sky-500'
          }`}
        />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            {getIcon()}
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {isConfirmation ? 'Confirmation Required' : 'System Notification'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <div className="my-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-750">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          {isConfirmation ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold uppercase rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-xs font-bold uppercase rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold uppercase rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

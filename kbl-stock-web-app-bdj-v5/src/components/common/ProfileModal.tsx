import React from 'react';
import { X, User, Mail, Shield, Building, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, companySettings } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                User Profile
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Current session details & permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'KB'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentUser?.name || 'Administrator'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser?.email || 'admin@kisanbotanix.com'}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 uppercase">
                {currentUser?.role || 'Super Admin'}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-500">Organization</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {companySettings?.companyName || 'Kishan Botanix Ltd.'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-500">Access Level</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Full System Administration
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-500">Status</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

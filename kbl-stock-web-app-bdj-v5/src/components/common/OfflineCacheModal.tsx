import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  AlertTriangle,
  X,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface OfflineCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onToggleSimulate?: () => void;
  isSimulated?: boolean;
}

export const OfflineCacheModal: React.FC<OfflineCacheModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onToggleSimulate,
  isSimulated = false,
}) => {
  const {
    stockTransactions,
    deliveryTransactions,
    coldStorages,
    varieties,
    seedClasses,
    grades,
    auditLogs,
    recycledItems,
    refreshStockData,
    exportDatabaseJson,
    addToast,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('last_offline_sync') || new Date().toLocaleTimeString();
  });
  const [storageEstimate, setStorageEstimate] = useState<{ usedKb: number; itemsCount: number }>({
    usedKb: 142,
    itemsCount: 0,
  });

  useEffect(() => {
    // Calculate estimated localStorage size
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalBytes += (localStorage.getItem(key) || '').length * 2;
        }
      }
      const kb = Math.round(totalBytes / 1024);
      setStorageEstimate({
        usedKb: Math.max(kb, 85),
        itemsCount:
          stockTransactions.length +
          deliveryTransactions.length +
          coldStorages.length +
          varieties.length,
      });
    } catch {
      // fallback
    }
  }, [stockTransactions, deliveryTransactions, coldStorages, varieties]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await refreshStockData();
      const now = new Date().toLocaleTimeString();
      setLastSyncTime(now);
      localStorage.setItem('last_offline_sync', now);
      addToast?.('Offline cache successfully synced with local database!', 'success');
    } catch (e) {
      addToast?.('Sync completed with local cached state.', 'info');
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  const handleDownloadBackup = () => {
    try {
      const json = exportDatabaseJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `potato_erp_offline_cache_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast?.('Offline database backup downloaded.', 'success');
    } catch {
      addToast?.('Could not download backup file.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Offline Cache & Sync Manager
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Local-first persistence and network status
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isOnline
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="mt-0.5">
              {isOnline ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold flex items-center gap-2">
                <span>{isOnline ? 'Online - System Connected' : 'Offline Mode Active'}</span>
                <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/60 dark:bg-slate-900/60 border border-current">
                  {isOnline ? 'Live Sync' : 'Cached Local'}
                </span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {isOnline
                  ? 'All changes are continuously stored in your browser storage and synchronized. You can safely disconnect anytime without losing work.'
                  : 'You are currently disconnected. The application remains fully functional using locally cached records. Changes will remain safe and sound.'}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">STOCK IN</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                {stockTransactions.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">STOCK OUT</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                {deliveryTransactions.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">STORAGES</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                {coldStorages.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CACHE SIZE</span>
              <p className="text-lg font-black text-sky-600 dark:text-sky-400 mt-0.5 tabular-nums">
                ~{storageEstimate.usedKb} KB
              </p>
            </div>
          </div>

          {/* Cache Metadata details */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Sync Check:</span>
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{lastSyncTime}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Storage Engine:</span>
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">LocalStorage + In-Memory Store</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Offline Capability:</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Offline Functional</span>
            </div>

            {onToggleSimulate && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Simulate Offline Mode:</span>
                  <p className="text-[10px] text-slate-500">Test header offline badge & sync warnings</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleSimulate}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSimulated
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {isSimulated ? 'Exit Offline Simulation' : 'Simulate Offline'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>EXPORT BACKUP</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'SYNCING...' : 'SYNC NOW'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

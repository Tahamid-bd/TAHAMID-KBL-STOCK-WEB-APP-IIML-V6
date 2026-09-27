import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { OfflineCacheModal } from './OfflineCacheModal';

interface OfflineIndicatorProps {
  className?: string;
  showText?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showText = true,
}) => {
  const { isOnline, offlineSince, isSimulatedOffline, toggleSimulatedOffline } = useNetworkStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToastBanner, setShowToastBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // Track connectivity transitions for user feedback
  useEffect(() => {
    if (!isOnline) {
      setBannerMessage('You are offline. Working in local-first mode. Data might not sync.');
      setShowToastBanner(true);
      const timer = setTimeout(() => setShowToastBanner(false), 6000);
      return () => clearTimeout(timer);
    } else {
      setBannerMessage('Connection restored. You are back online.');
      setShowToastBanner(true);
      const timer = setTimeout(() => setShowToastBanner(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <>
      {/* If OFFLINE: Display subtle warning badge in the Header */}
      {!isOnline ? (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all shadow-2xs cursor-pointer group animate-pulse ${className}`}
          title="You are currently offline. Changes are saved locally and data might not sync until connection is restored."
          aria-label="Offline Mode: Data might not sync"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>

          <WifiOff className="w-3.5 h-3.5 text-amber-400" />

          {showText && (
            <span className="text-[11px] font-medium text-amber-200">
              Offline <span className="hidden sm:inline font-normal text-amber-300/80">• Data might not sync</span>
            </span>
          )}
        </button>
      ) : (
        /* If ONLINE: Show subtle, calm status dot/badge that doesn't distract but allows viewing cache status */
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer ${className}`}
          title="Online & Connected. Click to view local cache & sync status or simulate offline mode."
          aria-label="Network Status: Online"
        >
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] text-slate-300 uppercase tracking-wider hidden md:inline">
            Online
          </span>
        </button>
      )}

      {/* Connectivity Transition Notification Banner */}
      {showToastBanner && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-18 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl shadow-xl border animate-in slide-in-from-top-2 duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
            }`}
          />
          {!isOnline && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
          <span>{bannerMessage}</span>
          <button
            type="button"
            onClick={() => setShowToastBanner(false)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      <OfflineCacheModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isOnline={isOnline}
        onToggleSimulate={toggleSimulatedOffline}
        isSimulated={isSimulatedOffline}
      />
    </>
  );
};

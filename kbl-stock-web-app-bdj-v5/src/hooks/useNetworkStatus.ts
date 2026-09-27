import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  offlineSince: Date | null;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  resetSimulatedOffline: () => void;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [browserOnline, setBrowserOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [offlineSince, setOfflineSince] = useState<Date | null>(() => {
    return typeof navigator !== 'undefined' && !navigator.onLine ? new Date() : null;
  });

  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setBrowserOnline(true);
      setOfflineSince(null);
    };

    const handleOffline = () => {
      setBrowserOnline(false);
      setOfflineSince(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      if (next) {
        setOfflineSince(new Date());
      } else if (browserOnline) {
        setOfflineSince(null);
      }
      return next;
    });
  }, [browserOnline]);

  const resetSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline(false);
    if (browserOnline) {
      setOfflineSince(null);
    }
  }, [browserOnline]);

  const effectiveOnline = browserOnline && !isSimulatedOffline;

  return {
    isOnline: effectiveOnline,
    offlineSince: effectiveOnline ? null : offlineSince || new Date(),
    isSimulatedOffline,
    toggleSimulatedOffline,
    resetSimulatedOffline,
  };
};

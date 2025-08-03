// hooks/useVersion.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getCurrentVersion, 
  getBuildDate, 
  checkVersionUpdate, 
  checkForUpdates, 
  applyPendingUpdate,
  getStoredVersionInfo
} from '@/lib/version';

interface UseVersionReturn {
  currentVersion: string;
  buildDate: string;
  updateAvailable: boolean;
  isCheckingForUpdates: boolean;
  lastChecked: string | null;
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
  hasJustUpdated: boolean;
}

export function useVersion(): UseVersionReturn {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [hasJustUpdated, setHasJustUpdated] = useState(false);

  const currentVersion = getCurrentVersion();
  const buildDate = getBuildDate();

  // Check for version updates on mount
  useEffect(() => {
    const checkVersionOnMount = async () => {
      try {
        const justUpdated = await checkVersionUpdate();
        setHasJustUpdated(justUpdated);
        
        const versionInfo = await getStoredVersionInfo();
        if (versionInfo?.lastChecked) {
          setLastChecked(versionInfo.lastChecked);
        }
        
        // Check for updates
        await handleCheckForUpdates();
      } catch (error) {
        console.error('Error checking version on mount:', error);
      }
    };

    checkVersionOnMount();
  }, []);

  // Set up service worker update listener
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorkerUpdate = () => {
        setUpdateAvailable(true);
      };

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // The page has been refreshed with a new service worker
        setHasJustUpdated(true);
        setUpdateAvailable(false);
      });

      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', handleServiceWorkerUpdate);
        
        // Check if there's already a waiting service worker
        if (registration.waiting) {
          setUpdateAvailable(true);
        }
      });

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', () => {});
      };
    }
  }, []);

  const handleCheckForUpdates = useCallback(async () => {
    if (isCheckingForUpdates) return;
    
    setIsCheckingForUpdates(true);
    try {
      const hasUpdate = await checkForUpdates();
      setUpdateAvailable(hasUpdate);
      setLastChecked(new Date().toISOString());
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsCheckingForUpdates(false);
    }
  }, [isCheckingForUpdates]);

  const handleApplyUpdate = useCallback(async () => {
    try {
      await applyPendingUpdate();
      setUpdateAvailable(false);
    } catch (error) {
      console.error('Error applying update:', error);
    }
  }, []);

  return {
    currentVersion,
    buildDate,
    updateAvailable,
    isCheckingForUpdates,
    lastChecked,
    checkForUpdates: handleCheckForUpdates,
    applyUpdate: handleApplyUpdate,
    hasJustUpdated
  };
}
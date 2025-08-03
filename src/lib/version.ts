// lib/version.ts
import { storage } from './storage';

export interface AppVersion {
  id: string;
  version: string;
  buildDate: string;
  lastChecked?: string;
  updateAvailable?: boolean;
}

// Get version from package.json
export const getCurrentVersion = (): string => {
  return process.env.npm_package_version || '0.1.0';
};

// Get build date
export const getBuildDate = (): string => {
  return process.env.BUILD_DATE || new Date().toISOString();
};

// Get stored version info
export const getStoredVersionInfo = async (): Promise<AppVersion | null> => {
  try {
    await storage.init();
    const versionInfo = await storage.get<AppVersion>('appSettings', 'version');
    return versionInfo || null;
  } catch (error) {
    console.error('Error getting stored version info:', error);
    return null;
  }
};

// Update stored version info
export const updateStoredVersionInfo = async (versionInfo: AppVersion): Promise<void> => {
  try {
    await storage.init();
    await storage.store('appSettings', versionInfo);
  } catch (error) {
    console.error('Error updating stored version info:', error);
  }
};

// Check if app version has been updated
export const checkVersionUpdate = async (): Promise<boolean> => {
  const currentVersion = getCurrentVersion();
  const storedVersionInfo = await getStoredVersionInfo();
  
  if (!storedVersionInfo) {
    // First time - store current version
    await updateStoredVersionInfo({
      id: 'version',
      version: currentVersion,
      buildDate: getBuildDate(),
      lastChecked: new Date().toISOString()
    });
    return false;
  }
  
  const hasUpdate = storedVersionInfo.version !== currentVersion;
  
  if (hasUpdate) {
    // Update stored version with new version
    await updateStoredVersionInfo({
      ...storedVersionInfo,
      version: currentVersion,
      buildDate: getBuildDate(),
      lastChecked: new Date().toISOString(),
      updateAvailable: false
    });
  }
  
  return hasUpdate;
};

// Check for available updates (simulated - in real app would check server)
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    // In a real implementation, this would check a server for updates
    // For now, we'll simulate by checking if service worker has updates
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        return true; // Service worker update is waiting
      }
    }
    
    // Update last checked time
    const storedVersionInfo = await getStoredVersionInfo();
    if (storedVersionInfo) {
      await updateStoredVersionInfo({
        ...storedVersionInfo,
        lastChecked: new Date().toISOString()
      });
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
};

// Apply pending updates
export const applyPendingUpdate = async (): Promise<void> => {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        // Tell the waiting service worker to skip waiting and become active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page to use the new service worker
        window.location.reload();
      }
    }
  } catch (error) {
    console.error('Error applying update:', error);
  }
};
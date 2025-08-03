// components/VersionInfo.tsx
'use client';

import { useState } from 'react';
import { Info, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useVersion } from '@/hooks/useVersion';

export default function VersionInfo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    currentVersion, 
    buildDate, 
    lastChecked, 
    checkForUpdates, 
    isCheckingForUpdates,
    updateAvailable 
  } = useVersion();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Aldrig';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just nu';
    if (diffInMinutes < 60) return `${diffInMinutes} min sedan`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} tim sedan`;
    
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBuildDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-gray-300 hover:text-white transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4" />
          <span className="text-sm font-medium">App-version</span>
          {updateAvailable && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Ny!
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">v{currentVersion}</span>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 mb-1">Version</p>
              <p className="text-white font-mono">v{currentVersion}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Byggdatum</p>
              <p className="text-white">{formatBuildDate(buildDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-2 text-xs">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">
                Senast kontrollerad: {formatDate(lastChecked)}
              </span>
            </div>
            
            <button
              onClick={checkForUpdates}
              disabled={isCheckingForUpdates}
              className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingForUpdates ? 'animate-spin' : ''}`} />
              <span>{isCheckingForUpdates ? 'Kontrollerar...' : 'Kontrollera'}</span>
            </button>
          </div>
          
          {updateAvailable && (
            <div className="flex items-center space-x-2 text-xs text-green-400 pt-2 border-t border-gray-700">
              <CheckCircle className="w-3 h-3" />
              <span>Uppdatering tillgänglig!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
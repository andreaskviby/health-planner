// components/UpdateNotification.tsx
'use client';

import { useState } from 'react';
import { Download, X, RefreshCw } from 'lucide-react';

interface UpdateNotificationProps {
  isVisible: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
  isUpdating?: boolean;
}

export default function UpdateNotification({ 
  isVisible, 
  onUpdate, 
  onDismiss, 
  isUpdating = false 
}: UpdateNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isVisible || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm mx-4">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-xl border border-white/20 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isUpdating ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <Download className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">
                  {isUpdating ? 'Uppdaterar...' : 'Uppdatering tillgänglig!'}
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  {isUpdating 
                    ? 'Appen uppdateras, vänta ett ögonblick...'
                    : 'En ny version av Health Planner är tillgänglig. Uppdatera för att få de senaste funktionerna.'
                  }
                </p>
              </div>
            </div>
            {!isUpdating && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {!isUpdating && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={onUpdate}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors backdrop-blur-sm"
              >
                Uppdatera nu
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-transparent hover:bg-white/10 text-white/80 font-medium py-2 px-4 rounded-md text-sm transition-colors"
              >
                Senare
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
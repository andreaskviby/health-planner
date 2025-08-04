'use client';

import { useState, useEffect } from 'react';
import { Heart, Bluetooth } from 'lucide-react';
import { useBluetooth } from '@/hooks/useBluetooth';
import ProfileSetup from '@/components/ProfileSetup';
import WelcomeTutorial from '@/components/WelcomeTutorial';
import Dashboard from '@/components/Dashboard';
import { storage } from '@/lib/storage';
import { UserProfile, AppSettings } from '@/lib/types';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { bluetoothState, enterHuggingMode } = useBluetooth();

  useEffect(() => {
    async function loadUser() {
      try {
        await storage.init();
        
        // Check if user has seen tutorial
        const settings = await storage.get<AppSettings>('appSettings', 'tutorial');
        if (settings?.hasSeenTutorial) {
          setHasSeenTutorial(true);
        }
        
        // Load user profile
        const users = await storage.getAll<UserProfile>('userProfiles');
        if (users.length > 0) {
          setCurrentUser(users[0]);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleTutorialComplete = async () => {
    try {
      // Mark tutorial as seen
      await storage.store('appSettings', { 
        id: 'tutorial', 
        hasSeenTutorial: true 
      });
      setHasSeenTutorial(true);
    } catch (error) {
      console.error('Error saving tutorial completion:', error);
      // Still proceed if storage fails
      setHasSeenTutorial(true);
    }
  };

  const handleProfileComplete = async (profile: UserProfile) => {
    setCurrentUser(profile);
    // If user just completed profile setup, mark tutorial as seen too
    if (!hasSeenTutorial) {
      await handleTutorialComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Laddar din hälsoresa...</p>
        </div>
      </div>
    );
  }

  // Show tutorial for new users
  if (!hasSeenTutorial && !currentUser) {
    return <WelcomeTutorial onComplete={handleTutorialComplete} />;
  }

  if (!currentUser) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  if (bluetoothState.isHuggingMode) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500">
        <div className="text-center text-white p-8">
          <Heart className="w-24 h-24 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold mb-4">Kramar Mode Aktiverat! 🤗</h1>
          <p className="text-xl mb-6">Söker efter din partner...</p>
          {bluetoothState.isConnected ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
              <Bluetooth className="w-12 h-12 mx-auto mb-4 text-green-300" />
              <p className="text-lg">Ansluten till partner! Data synkas...</p>
            </div>
          ) : (
            <div className="animate-pulse">
              <Bluetooth className="w-12 h-12 mx-auto mb-4" />
              <p>Håll enheten nära din partner...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <Dashboard user={currentUser} />;
}

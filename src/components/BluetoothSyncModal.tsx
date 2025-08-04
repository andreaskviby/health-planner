'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Bluetooth, Check, User, Target, Utensils, ChefHat, Dumbbell, TrendingUp, Smartphone } from 'lucide-react';
import { UserProfile, HealthPlan, FoodList, Recipe, Activity, DailyCheckIn } from '@/lib/types';
import { storage } from '@/lib/storage';

interface SyncData {
  profile?: UserProfile;
  healthPlan?: HealthPlan;
  foodList?: FoodList;
  recipes?: Recipe[];
  activities?: Activity[];
  progress?: DailyCheckIn[];
}

interface SyncSelection {
  profile: boolean;
  healthPlan: boolean;
  foodList: boolean;
  recipes: boolean;
  activities: boolean;
  progress: boolean;
}

interface BluetoothSyncModalProps {
  user: UserProfile;
  isConnected: boolean;
  partnerName?: string;
  onClose: () => void;
  onSyncComplete: (syncedData: SyncData) => void;
}

export default function BluetoothSyncModal({ 
  user, 
  isConnected, 
  partnerName = 'Partner', 
  onClose, 
  onSyncComplete 
}: BluetoothSyncModalProps) {
  const [currentStep, setCurrentStep] = useState<'selection' | 'syncing' | 'complete'>('selection');
  const [outgoingSelection, setOutgoingSelection] = useState<SyncSelection>({
    profile: false,
    healthPlan: false,
    foodList: false,
    recipes: false,
    activities: false,
    progress: false,
  });
  const [incomingSelection, setIncomingSelection] = useState<SyncSelection>({
    profile: false,
    healthPlan: false,
    foodList: false,
    recipes: false,
    activities: false,
    progress: false,
  });
  const [availableData, setAvailableData] = useState<SyncData>({});
  const [receivedData, setReceivedData] = useState<SyncData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAvailableData();
  }, [user]);

  const loadAvailableData = async () => {
    try {
      // Load user's data that can be shared
      const [healthPlan, foodList, recipes, activities, checkIns] = await Promise.all([
        storage.getAll<HealthPlan>('healthPlans').then(plans => plans.find(p => p.userId === user.id)),
        storage.get<FoodList>('foodLists', user.id),
        storage.get<{ userId: string; recipes: Recipe[] }>('recipes', user.id).then(data => data?.recipes || []),
        storage.get<{ userId: string; activities: Activity[] }>('activities', user.id).then(data => data?.activities || []),
        storage.getAll<DailyCheckIn>('dailyCheckIns').then(checkIns => 
          checkIns.filter(c => c.userId === user.id).slice(-7) // Last 7 days
        )
      ]);

      setAvailableData({
        profile: user,
        healthPlan: healthPlan || undefined,
        foodList: foodList || undefined,
        recipes: recipes,
        activities: activities,
        progress: checkIns
      });
    } catch (error) {
      console.error('Error loading available data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutgoingToggle = (key: keyof SyncSelection) => {
    setOutgoingSelection(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleIncomingToggle = (key: keyof SyncSelection) => {
    setIncomingSelection(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const startSync = async () => {
    setCurrentStep('syncing');
    
    // Simulate sync process
    try {
      // In a real implementation, this would:
      // 1. Send selected outgoing data to partner
      // 2. Receive partner's selected data
      // 3. Process and store the received data with partner tags
      
      // For now, simulate receiving data
      setTimeout(() => {
        // Mock received data
        const mockReceivedData: SyncData = {};
        
        if (incomingSelection.profile) {
          mockReceivedData.profile = {
            ...user,
            id: `${partnerName}-profile`,
            name: partnerName,
            currentWeight: 70,
            targetWeight: 65,
          };
        }
        
        if (incomingSelection.healthPlan && availableData.healthPlan) {
          mockReceivedData.healthPlan = {
            ...availableData.healthPlan,
            id: `${partnerName}-healthplan`,
            userId: `${partnerName}-profile`,
            plan: `${partnerName}s hälsoplan - ${availableData.healthPlan.plan.substring(0, 100)}...`,
          };
        }
        
        if (incomingSelection.foodList && availableData.foodList) {
          mockReceivedData.foodList = {
            yes: [...availableData.foodList.yes, 'Quinoa', 'Avokado'].slice(0, 10),
            no: [...availableData.foodList.no, 'Socker', 'Friterat'].slice(0, 10),
            sometimes: [...availableData.foodList.sometimes, 'Choklad', 'Glass'].slice(0, 10),
          };
        }

        setReceivedData(mockReceivedData);
        setCurrentStep('complete');
      }, 3000);
      
    } catch (error) {
      console.error('Sync error:', error);
      setCurrentStep('selection');
    }
  };

  const completeSyncAndClose = async () => {
    // Store partner data with partner tags
    try {
      if (receivedData.profile) {
        await storage.store('partnerProfiles', receivedData.profile);
      }
      
      if (receivedData.healthPlan) {
        await storage.store('partnerHealthPlans', receivedData.healthPlan);
      }
      
      if (receivedData.foodList) {
        await storage.store('partnerFoodLists', { userId: receivedData.profile?.id || partnerName, ...receivedData.foodList });
      }
      
      onSyncComplete(receivedData);
    } catch (error) {
      console.error('Error storing partner data:', error);
    }
    
    onClose();
  };

  const renderDataItem = (
    key: keyof SyncSelection,
    icon: React.ReactNode,
    title: string,
    description: string,
    hasData: boolean,
    isOutgoing: boolean
  ) => {
    const isSelected = isOutgoing ? outgoingSelection[key] : incomingSelection[key];
    
    return (
      <div
        onClick={() => hasData ? (isOutgoing ? handleOutgoingToggle(key) : handleIncomingToggle(key)) : undefined}
        className={`border rounded-lg p-4 transition-all cursor-pointer ${
          hasData
            ? isSelected
              ? 'border-pink-500 bg-pink-500/10'
              : 'border-white/20 bg-white/5 hover:border-white/40'
            : 'border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h4 className="text-white font-semibold">{title}</h4>
              <p className="text-gray-300 text-sm">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasData && (
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? 'border-pink-500 bg-pink-500' : 'border-gray-400'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            )}
            {!hasData && (
              <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                Inte tillgänglig
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="bg-blue-500/20 p-3 rounded-full">
            <Smartphone className="w-6 h-6 text-blue-400" />
          </div>
          <Heart className="w-6 h-6 text-pink-400" />
          <div className="bg-green-500/20 p-3 rounded-full">
            <Smartphone className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Välj vad du vill synka</h3>
        <p className="text-gray-300">
          Ansluten till <strong>{partnerName}</strong>. Välj vilken data du vill dela och ta emot.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Outgoing Data */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
            Dela med {partnerName}
          </h4>
          
          {renderDataItem(
            'profile',
            <User className="w-5 h-5 text-blue-400" />,
            'Profil & Mål',
            `${user.name}s profil och hälsomål`,
            !!availableData.profile,
            true
          )}
          
          {renderDataItem(
            'healthPlan',
            <Target className="w-5 h-5 text-green-400" />,
            'Hälsoplan',
            'AI-genererad personlig hälsoplan',
            !!availableData.healthPlan,
            true
          )}
          
          {renderDataItem(
            'foodList',
            <Utensils className="w-5 h-5 text-yellow-400" />,
            'Matlistor',
            'Ja/Nej/Ibland matpreferenser',
            !!availableData.foodList,
            true
          )}
          
          {renderDataItem(
            'recipes',
            <ChefHat className="w-5 h-5 text-orange-400" />,
            'Recept',
            `${availableData.recipes?.length || 0} sparade recept`,
            (availableData.recipes?.length || 0) > 0,
            true
          )}
          
          {renderDataItem(
            'activities',
            <Dumbbell className="w-5 h-5 text-purple-400" />,
            'Aktiviteter',
            `${availableData.activities?.length || 0} planerade aktiviteter`,
            (availableData.activities?.length || 0) > 0,
            true
          )}
          
          {renderDataItem(
            'progress',
            <TrendingUp className="w-5 h-5 text-pink-400" />,
            'Framsteg',
            `${availableData.progress?.length || 0} dagars data`,
            (availableData.progress?.length || 0) > 0,
            true
          )}
        </div>

        {/* Incoming Data */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            Ta emot från {partnerName}
          </h4>
          
          {renderDataItem(
            'profile',
            <User className="w-5 h-5 text-blue-400" />,
            'Profil & Mål',
            `${partnerName}s profil och hälsomål`,
            true, // Assume partner has profile
            false
          )}
          
          {renderDataItem(
            'healthPlan',
            <Target className="w-5 h-5 text-green-400" />,
            'Hälsoplan',
            `${partnerName}s hälsoplan`,
            true, // Assume partner has health plan
            false
          )}
          
          {renderDataItem(
            'foodList',
            <Utensils className="w-5 h-5 text-yellow-400" />,
            'Matlistor',
            `${partnerName}s matpreferenser`,
            true, // Assume partner has food lists
            false
          )}
          
          {[
            { key: 'recipes' as const, icon: <ChefHat className="w-5 h-5 text-orange-400" />, title: 'Recept', desc: `${partnerName}s recept` },
            { key: 'activities' as const, icon: <Dumbbell className="w-5 h-5 text-purple-400" />, title: 'Aktiviteter', desc: `${partnerName}s aktiviteter` },
            { key: 'progress' as const, icon: <TrendingUp className="w-5 h-5 text-pink-400" />, title: 'Framsteg', desc: `${partnerName}s framsteg` },
          ].map(item => renderDataItem(item.key, item.icon, item.title, item.desc, true, false))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-white/20">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Avbryt
        </button>
        <button
          onClick={startSync}
          disabled={!Object.values(outgoingSelection).some(Boolean) && !Object.values(incomingSelection).some(Boolean)}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          Starta synkning
        </button>
      </div>
    </div>
  );

  const renderSyncingStep = () => (
    <div className="text-center py-12">
      <div className="relative mb-8">
        <div className="flex items-center justify-center space-x-8">
          <div className="bg-blue-500/20 p-4 rounded-full">
            <Smartphone className="w-8 h-8 text-blue-400" />
          </div>
          <div className="relative">
            <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="bg-green-500/20 p-4 rounded-full">
            <Smartphone className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4">Synkar data...</h3>
      <p className="text-gray-300 mb-6">
        Överför säkert data mellan dina enheter. Detta kan ta ett ögonblick.
      </p>
      
      <div className="bg-white/5 rounded-lg p-4 max-w-md mx-auto">
        <div className="space-y-2 text-sm text-gray-300">
          {Object.entries(outgoingSelection).filter(([_, selected]) => selected).map(([key, _]) => (
            <div key={key} className="flex items-center justify-between">
              <span>Skickar {key === 'profile' ? 'profil' : key === 'healthPlan' ? 'hälsoplan' : key === 'foodList' ? 'matlistor' : key}...</span>
              <div className="w-4 h-4 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ))}
          {Object.entries(incomingSelection).filter(([_, selected]) => selected).map(([key, _]) => (
            <div key={key} className="flex items-center justify-between">
              <span>Tar emot {key === 'profile' ? 'profil' : key === 'healthPlan' ? 'hälsoplan' : key === 'foodList' ? 'matlistor' : key}...</span>
              <div className="w-4 h-4 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Synkning klar!</h3>
        <p className="text-gray-300">
          Data har framgångsrikt synkats med {partnerName}. All partnerdata är taggad för att inte skriva över din egen data.
        </p>
      </div>

      {Object.keys(receivedData).length > 0 && (
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">Mottagen data från {partnerName}:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {receivedData.profile && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Profil & Mål</span>
              </div>
            )}
            {receivedData.healthPlan && (
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Hälsoplan</span>
              </div>
            )}
            {receivedData.foodList && (
              <div className="flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Matlistor</span>
              </div>
            )}
            {receivedData.recipes && (
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Recept</span>
              </div>
            )}
            {receivedData.activities && (
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Aktiviteter</span>
              </div>
            )}
            {receivedData.progress && (
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-pink-400" />
                <span className="text-gray-300">Framsteg</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
        <p className="text-yellow-200 text-sm">
          💡 <strong>Tips:</strong> Du kan nu se och jämföra {partnerName}s data i appen. All partnerdata är märkt så du kan välja att overlay med din egen data eller visa separat.
        </p>
      </div>

      <button
        onClick={completeSyncAndClose}
        className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all"
      >
        Klar - Tillbaka till appen
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-4xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
            <p className="text-white">Förbereder synkning...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Bluetooth className="w-6 h-6 mr-2" />
            Kramar Mode - Synka data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {currentStep === 'selection' && renderSelectionStep()}
          {currentStep === 'syncing' && renderSyncingStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  );
}
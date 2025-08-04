'use client';

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Target, 
  Calendar, 
  Utensils, 
  Dumbbell, 
  MessageCircle,
  Bluetooth,
  Settings,
  ChefHat,
  Activity
} from 'lucide-react';
import { UserProfile, DailyCheckIn, HealthPlan, FoodList } from '@/lib/types';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useVersion } from '@/hooks/useVersion';
import { storage } from '@/lib/storage';
import { generateHealthPlan, generateMotivationalMessage } from '@/lib/openai';
import DailyCheckInModal from './DailyCheckInModal';
import HealthPlanModal from './HealthPlanModal';
import FoodListModal from './FoodListModal';
import VersionInfo from './VersionInfo';
import UpdateNotification from './UpdateNotification';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [healthPlan, setHealthPlan] = useState<HealthPlan | null>(null);
  const [foodList, setFoodList] = useState<FoodList | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showHealthPlanModal, setShowHealthPlanModal] = useState(false);
  const [showFoodListModal, setShowFoodListModal] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { enterHuggingMode, hasNativeBluetoothAPI, isMobile } = useBluetooth();
  const { updateAvailable, applyUpdate, hasJustUpdated } = useVersion();

  useEffect(() => {
    const loadData = async () => {
      await loadTodayData();
      await loadHealthPlan();
      await loadFoodList();
    };
    loadData();
  }, [user]);

  const loadTodayData = async () => {
    try {
      const today = new Date().toDateString();
      const checkIns = await storage.getAll<DailyCheckIn>('dailyCheckIns');
      const todayData = checkIns.find(c => 
        c.userId === user.id && new Date(c.date).toDateString() === today
      );
      setTodayCheckIn(todayData || null);
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  };

  const loadHealthPlan = async () => {
    try {
      const plans = await storage.getAll<HealthPlan>('healthPlans');
      const userPlan = plans.find(p => p.userId === user.id);
      setHealthPlan(userPlan || null);
    } catch (error) {
      console.error('Error loading health plan:', error);
    }
  };

  const loadFoodList = async () => {
    try {
      const list = await storage.get<FoodList>('foodLists', user.id);
      setFoodList(list || null);
    } catch (error) {
      console.error('Error loading food list:', error);
    }
  };

  const handleCheckInComplete = async (checkIn: DailyCheckIn) => {
    setTodayCheckIn(checkIn);
    setShowCheckInModal(false);
    
    // Generate motivational message
    try {
      const message = await generateMotivationalMessage({
        mood: checkIn.mood,
        energy: checkIn.energy,
        notes: checkIn.notes
      });
      setMotivationalMessage(message);
    } catch (error) {
      setMotivationalMessage('Bra jobbat idag! Fortsätt så här! 💪');
    }
  };

  const handleGenerateHealthPlan = async () => {
    setIsLoading(true);
    try {
      const planText = await generateHealthPlan({
        userProfile: {
          name: user.name,
          currentWeight: user.currentWeight,
          targetWeight: user.targetWeight,
          height: user.height,
          age: user.age,
          goals: user.goals,
          lifestyle: user.lifestyle,
        }
      });

      const newPlan: HealthPlan = {
        id: crypto.randomUUID(),
        userId: user.id,
        plan: planText,
        exercises: [],
        recipes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await storage.store('healthPlans', newPlan);
      setHealthPlan(newPlan);
      setShowHealthPlanModal(true);
    } catch {
      console.error('Error generating health plan');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (user.currentWeight === user.targetWeight) return 100;
    const totalChange = Math.abs(user.targetWeight - user.currentWeight);
    const currentChange = Math.abs((todayCheckIn?.weight || user.currentWeight) - user.currentWeight);
    return Math.min(100, (currentChange / totalChange) * 100);
  };

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    await applyUpdate();
    // Note: The page will reload after this, so isUpdating state won't persist
  };

  const handleDismissUpdate = () => {
    // User chose to dismiss the update notification
    // It will show again on next app launch if update is still available
  };

  return (
    <div className="h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Update Notification */}
      <UpdateNotification
        isVisible={updateAvailable}
        onUpdate={handleApplyUpdate}
        onDismiss={handleDismissUpdate}
        isUpdating={isUpdating}
      />

      {/* Just Updated Notification */}
      {hasJustUpdated && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm mx-4">
          <div className="bg-green-600 text-white rounded-lg shadow-xl p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Appen har uppdaterats!</span>
            </div>
            <p className="text-xs text-green-100 mt-1">
              Du använder nu den senaste versionen av Health Planner.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Hej {user.name}! 👋</h1>
            <p className="text-gray-300">Låt oss göra idag fantastisk</p>
          </div>
          
          <div className="flex space-x-2">
            {/* Always show hugging mode button for better mobile UX */}
            <button
              onClick={enterHuggingMode}
              className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full transition-all"
              title={hasNativeBluetoothAPI ? "Kramar Mode (Bluetooth)" : "Kramar Mode"}
            >
              <Heart className="w-6 h-6" />
            </button>
            
            <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold">{user.targetWeight} kg</p>
            <p className="text-gray-300 text-sm">Målvikt</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-semibold">{getProgressPercentage().toFixed(0)}%</p>
            <p className="text-gray-300 text-sm">Framsteg</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-white font-semibold">{todayCheckIn ? '✓' : '○'}</p>
            <p className="text-gray-300 text-sm">Idag</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-white font-semibold">{todayCheckIn?.mood || '?'}/10</p>
            <p className="text-gray-300 text-sm">Humör</p>
          </div>
        </div>

        {/* Daily Check-in */}
        {!todayCheckIn && (
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Dagens incheckning</h3>
                <p className="text-gray-300">Hur mår du idag? Dela dina tankar och känslor.</p>
              </div>
              <button
                onClick={() => setShowCheckInModal(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Checka in
              </button>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {motivationalMessage && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
            <div className="flex items-center mb-3">
              <MessageCircle className="w-6 h-6 text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Din AI-coach säger:</h3>
            </div>
            <p className="text-gray-200">{motivationalMessage}</p>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Plan */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setShowHealthPlanModal(true)}>
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Hälsoplan</h3>
            </div>
            {healthPlan ? (
              <p className="text-gray-300 text-sm">Uppdaterad {new Date(healthPlan.updatedAt).toLocaleDateString()}</p>
            ) : (
              <div>
                <p className="text-gray-300 text-sm mb-4">Låt AI skapa din personliga hälsoplan</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateHealthPlan();
                  }}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Genererar...' : 'Skapa plan'}
                </button>
              </div>
            )}
          </div>

          {/* Food Lists */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer" onClick={() => setShowFoodListModal(true)}>
            <div className="flex items-center mb-4">
              <Utensils className="w-8 h-8 text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Matlistor</h3>
            </div>
            <p className="text-gray-300 text-sm">
              {foodList ? 'Hantera dina mat-preferenser' : 'Skapa dina ja/nej/ibland-listor'}
            </p>
          </div>

          {/* Recipes */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer">
            <div className="flex items-center mb-4">
              <ChefHat className="w-8 h-8 text-yellow-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Recept</h3>
            </div>
            <p className="text-gray-300 text-sm">AI-genererade recept baserat på dina preferenser</p>
          </div>

          {/* Exercises */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer">
            <div className="flex items-center mb-4">
              <Dumbbell className="w-8 h-8 text-purple-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Aktiviteter</h3>
            </div>
            <p className="text-gray-300 text-sm">Roliga aktiviteter för dig och din partner</p>
          </div>

          {/* Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-8 h-8 text-red-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Framsteg</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Viktmål</span>
                <span className="text-white">{getProgressPercentage().toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Partner Sync - Always available with appropriate messaging */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Bluetooth className="w-8 h-8 text-indigo-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Partner</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={enterHuggingMode}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-4 py-2 rounded text-sm transition-all w-full"
              >
                Aktivera kramar mode
              </button>
              {!hasNativeBluetoothAPI && isMobile && (
                <p className="text-xs text-gray-300">
                  📱 Mobilläge: Begränsad Bluetooth-support
                </p>
              )}
            </div>
          </div>

          {/* Version Info */}
          <VersionInfo />
        </div>
      </div>

      {/* Modals */}
      {showCheckInModal && (
        <DailyCheckInModal
          user={user}
          onComplete={handleCheckInComplete}
          onClose={() => setShowCheckInModal(false)}
        />
      )}

      {showHealthPlanModal && healthPlan && (
        <HealthPlanModal
          healthPlan={healthPlan}
          onClose={() => setShowHealthPlanModal(false)}
        />
      )}

      {showFoodListModal && (
        <FoodListModal
          user={user}
          foodList={foodList}
          onSave={(list) => {
            setFoodList(list);
            setShowFoodListModal(false);
          }}
          onClose={() => setShowFoodListModal(false)}
        />
      )}
    </div>
  );
}
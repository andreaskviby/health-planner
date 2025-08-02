'use client';

import { useState } from 'react';
import { User, Scale, Target, Heart, ArrowRight } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { storage } from '@/lib/storage';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    age: '',
    goals: [] as string[],
    lifestyle: [] as string[],
  });

  const goalOptions = [
    'Gå ner i vikt',
    'Gå upp i vikt',
    'Bygga muskler',
    'Förbättra kondition',
    'Må bättre',
    'Sova bättre',
    'Minska stress',
    'Äta hälsosammare',
  ];

  const lifestyleOptions = [
    'Tränar regelbundet',
    'Sitter mycket',
    'Går mycket',
    'Stress i vardagen',
    'Oregelbundna måltider',
    'Socialt aktiv',
    'Arbetar hemifrån',
    'Reser mycket',
  ];

  const handleGoalToggle = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleLifestyleToggle = (lifestyle: string) => {
    setProfile(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
    }));
  };

  const handleSubmit = async () => {
    const userProfile: UserProfile = {
      id: crypto.randomUUID(),
      name: profile.name,
      currentWeight: parseFloat(profile.currentWeight),
      targetWeight: parseFloat(profile.targetWeight),
      height: parseFloat(profile.height),
      age: parseInt(profile.age),
      goals: profile.goals,
      lifestyle: profile.lifestyle,
    };

    try {
      await storage.store('userProfiles', userProfile);
      onComplete(userProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profile.name.trim() !== '';
      case 2:
        return profile.currentWeight !== '' && profile.targetWeight !== '' && 
               profile.height !== '' && profile.age !== '';
      case 3:
        return profile.goals.length > 0;
      case 4:
        return profile.lifestyle.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Välkommen till din hälsoresa!</h1>
          <p className="text-gray-300">Steg {step} av 4</p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-blue-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Vad heter du?</h2>
              </div>
              <input
                type="text"
                placeholder="Ditt namn"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Scale className="w-6 h-6 text-green-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Grunduppgifter</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Nuvarande vikt (kg)"
                  value={profile.currentWeight}
                  onChange={(e) => setProfile(prev => ({ ...prev, currentWeight: e.target.value }))}
                  className="px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="number"
                  placeholder="Målvikt (kg)"
                  value={profile.targetWeight}
                  onChange={(e) => setProfile(prev => ({ ...prev, targetWeight: e.target.value }))}
                  className="px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="number"
                  placeholder="Längd (cm)"
                  value={profile.height}
                  onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))}
                  className="px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="number"
                  placeholder="Ålder"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                  className="px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-yellow-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Vad vill du uppnå?</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      profile.goals.includes(goal)
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/20 text-gray-300 hover:bg-white/30'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-red-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Din livsstil</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {lifestyleOptions.map((lifestyle) => (
                  <button
                    key={lifestyle}
                    onClick={() => handleLifestyleToggle(lifestyle)}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      profile.lifestyle.includes(lifestyle)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-gray-300 hover:bg-white/30'
                    }`}
                  >
                    {lifestyle}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"
            >
              Tillbaka
            </button>
          )}
          
          <button
            onClick={step === 4 ? handleSubmit : () => setStep(step + 1)}
            disabled={!isStepValid()}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center ml-auto ${
              isStepValid()
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            {step === 4 ? 'Starta resan!' : 'Nästa'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        <div className="mt-6">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { X, User, Weight, Ruler, Calendar, Target, Activity } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { storage } from '@/lib/storage';

interface SettingsModalProps {
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
  onClose: () => void;
}

export default function SettingsModal({ user, onSave, onClose }: SettingsModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    currentWeight: user.currentWeight.toString(),
    targetWeight: user.targetWeight.toString(),
    height: user.height.toString(),
    age: user.age.toString(),
    goals: [...user.goals],
    lifestyle: [...user.lifestyle],
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const goalOptions = [
    'Gå ner i vikt',
    'Gå upp i vikt',
    'Bibehålla vikt',
    'Bygga muskler',
    'Förbättra kondition',
    'Äta hälsosammare',
    'Sova bättre',
    'Minska stress',
    'Öka energi',
    'Förbättra mental hälsa'
  ];

  const lifestyleOptions = [
    'Stillasittande jobb',
    'Tränar regelbundet',
    'Aktiv livsstil',
    'Stressigt liv',
    'Oregelbundna arbetstider',
    'Vegetarian/Vegan',
    'Reser mycket',
    'Familjeliv med barn',
    'Student',
    'Pensionär'
  ];

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleLifestyleToggle = (lifestyle: string) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser: UserProfile = {
        ...user,
        name: formData.name,
        currentWeight: parseFloat(formData.currentWeight),
        targetWeight: parseFloat(formData.targetWeight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        goals: formData.goals,
        lifestyle: formData.lifestyle,
      };

      await storage.store('userProfiles', updatedUser);
      onSave(updatedUser);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <User className="w-6 h-6 mr-2" />
            Inställningar
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personlig information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Namn
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Ålder
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Ruler className="w-4 h-4 inline mr-1" />
                  Längd (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Weight className="w-4 h-4 inline mr-1" />
                  Nuvarande vikt (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.currentWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentWeight: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Målvikt (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetWeight: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Mål
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {goalOptions.map((goal) => (
                <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                    className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lifestyle */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Livsstil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lifestyleOptions.map((lifestyle) => (
                <label key={lifestyle} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.lifestyle.includes(lifestyle)}
                    onChange={() => handleLifestyleToggle(lifestyle)}
                    className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">{lifestyle}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {isSaving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>
    </div>
  );
}
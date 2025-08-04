'use client';

import { useState } from 'react';
import { X, Target, Calendar, Edit3, Save, Plus, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { HealthPlan, UserProfile } from '@/lib/types';
import { storage } from '@/lib/storage';
import { generateAdvancedHealthPlan } from '@/lib/openai';

interface WeeklySchedule {
  week: number;
  startDate: Date;
  focus: string;
  goals: string[];
  exercises: string[];
  nutrition: string[];
  tips: string;
}

interface HealthPlanModalProps {
  healthPlan: HealthPlan;
  user: UserProfile;
  onClose: () => void;
  onUpdate?: (updatedPlan: HealthPlan) => void;
}

export default function HealthPlanModal({ healthPlan, user, onClose, onUpdate }: HealthPlanModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(healthPlan.plan);
  const [isSaving, setIsSaving] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'weekly' | 'edit'>('overview');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule[]>([]);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedHealthPlan: HealthPlan = {
        ...healthPlan,
        plan: editedPlan,
        updatedAt: new Date(),
      };

      await storage.store('healthPlans', updatedHealthPlan);
      
      if (onUpdate) {
        onUpdate(updatedHealthPlan);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving health plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateWeeklySchedule = async () => {
    setIsGeneratingWeekly(true);
    try {
      const weeklyData = await generateAdvancedHealthPlan({
        userProfile: {
          name: user.name,
          currentWeight: user.currentWeight,
          targetWeight: user.targetWeight,
          height: user.height,
          age: user.age,
          goals: user.goals,
          lifestyle: user.lifestyle,
        },
        startDate: new Date(startDate),
        weeksCount: 12, // 12 week program
        basePlan: healthPlan.plan,
      });

      setWeeklySchedule(weeklyData);
      setCurrentView('weekly');
    } catch (error) {
      console.error('Error generating weekly schedule:', error);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const calculateWeeksDifference = (targetDate: Date, currentWeight: number, targetWeight: number) => {
    const weightDifference = Math.abs(targetWeight - currentWeight);
    const weeksEstimate = Math.max(8, Math.ceil(weightDifference * 2)); // Rough estimate: 0.5kg per week
    return Math.min(weeksEstimate, 52); // Max 1 year
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          Skapad {new Date(healthPlan.createdAt).toLocaleDateString('sv-SE')}
          {healthPlan.updatedAt && healthPlan.updatedAt !== healthPlan.createdAt && (
            <span className="ml-2">• Uppdaterad {new Date(healthPlan.updatedAt).toLocaleDateString('sv-SE')}</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentView('weekly')}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all text-sm"
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Veckoschema
          </button>
          <button
            onClick={() => setCurrentView('edit')}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all text-sm"
          >
            <Edit3 className="w-4 h-4 inline mr-1" />
            Redigera
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6">
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
            {healthPlan.plan}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Stäng
        </button>
      </div>
    </div>
  );

  const renderWeeklyView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Veckovis planering</h3>
        <button
          onClick={() => setCurrentView('overview')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
        >
          Tillbaka till översikt
        </button>
      </div>

      {weeklySchedule.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-4">Skapa veckoschema</h4>
            <p className="text-gray-300 mb-6">
              Låt AI skapa ett detaljerat veckoschema baserat på din hälsoplan och dina mål.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Startdatum</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div className="text-sm text-gray-400 mb-6">
              <p>Beräknad tid till målet: {calculateWeeksDifference(new Date(startDate), user.currentWeight, user.targetWeight)} veckor</p>
            </div>

            <button
              onClick={generateWeeklySchedule}
              disabled={isGeneratingWeekly}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {isGeneratingWeekly ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                  Genererar schema...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 inline mr-1" />
                  Skapa veckoschema
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {weeklySchedule.map((week) => (
            <div key={week.week} className="bg-white/5 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                className="w-full p-4 text-left hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">Vecka {week.week}</h4>
                    <p className="text-gray-300 text-sm">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {week.startDate.toLocaleDateString('sv-SE')} - Fokus: {week.focus}
                    </p>
                  </div>
                  {expandedWeek === week.week ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedWeek === week.week && (
                <div className="p-4 pt-0 space-y-4">
                  <div>
                    <h5 className="text-white font-medium mb-2">Mål för veckan:</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {week.goals.map((goal, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-400 mr-2">•</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Träning:</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {week.exercises.map((exercise, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          {exercise}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Kost:</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {week.nutrition.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-400 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {week.tips && (
                    <div className="bg-purple-500/10 rounded-lg p-3">
                      <h5 className="text-purple-300 font-medium mb-1">Veckans tips:</h5>
                      <p className="text-gray-300 text-sm">{week.tips}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEditView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Redigera hälsoplan</h3>
        <button
          onClick={() => setCurrentView('overview')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
        >
          Avbryt
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Hälsoplan
        </label>
        <textarea
          value={editedPlan}
          onChange={(e) => setEditedPlan(e.target.value)}
          className="w-full h-96 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          placeholder="Skriv din hälsoplan här..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            setEditedPlan(healthPlan.plan);
            setCurrentView('overview');
          }}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Avbryt
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || editedPlan.trim() === ''}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
              Sparar...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 inline mr-1" />
              Spara ändringar
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Din Personliga Hälsoplan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {currentView === 'overview' && renderOverview()}
          {currentView === 'weekly' && renderWeeklyView()}
          {currentView === 'edit' && renderEditView()}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { X, Dumbbell, Plus, Sparkles, Clock, Target, ChevronRight } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { storage } from '@/lib/storage';
import { generateActivitySuggestions } from '@/lib/openai';

// Activity type definition
interface Activity {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Lätt' | 'Medel' | 'Svår';
  category: 'Kondition' | 'Styrka' | 'Flexibilitet' | 'Balans' | 'Mental hälsa' | 'Utomhus' | 'Grupp';
  source: 'manual' | 'ai';
  createdAt: Date;
}

interface ActivitiesModalProps {
  user: UserProfile;
  activities: Activity[];
  onSave: (activities: Activity[]) => void;
  onClose: () => void;
}

type ActivityView = 'list' | 'add-manual' | 'ai-suggestions' | 'view-activity';

export default function ActivitiesModal({ user, activities, onSave, onClose }: ActivitiesModalProps) {
  const [currentView, setCurrentView] = useState<ActivityView>('list');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual activity form
  const [manualForm, setManualForm] = useState({
    name: '',
    description: '',
    duration: '',
    difficulty: 'Medel' as Activity['difficulty'],
    category: 'Kondition' as Activity['category'],
  });

  const difficultyOptions: Activity['difficulty'][] = ['Lätt', 'Medel', 'Svår'];
  const categoryOptions: Activity['category'][] = [
    'Kondition', 'Styrka', 'Flexibilitet', 'Balans', 'Mental hälsa', 'Utomhus', 'Grupp'
  ];

  const handleSaveManualActivity = async () => {
    if (!manualForm.name.trim()) return;

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      userId: user.id,
      name: manualForm.name,
      description: manualForm.description,
      duration: manualForm.duration,
      difficulty: manualForm.difficulty,
      category: manualForm.category,
      source: 'manual',
      createdAt: new Date(),
    };

    const updatedActivities = [...activities, newActivity];
    await storage.store('activities', { userId: user.id, activities: updatedActivities });
    onSave(updatedActivities);
    
    // Reset form
    setManualForm({
      name: '',
      description: '',
      duration: '',
      difficulty: 'Medel',
      category: 'Kondition',
    });
    setCurrentView('list');
  };

  const handleGenerateAISuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await generateActivitySuggestions({
        userProfile: {
          name: user.name,
          goals: user.goals,
          lifestyle: user.lifestyle,
          age: user.age,
        },
        existingActivities: activities.map(a => a.name),
      });

      // Convert suggestions to Activity objects
      const newActivities = suggestions.map(suggestion => ({
        id: crypto.randomUUID(),
        userId: user.id,
        name: suggestion.name,
        description: suggestion.description,
        duration: suggestion.duration,
        difficulty: suggestion.difficulty as Activity['difficulty'],
        category: suggestion.category as Activity['category'],
        source: 'ai' as const,
        createdAt: new Date(),
      }));

      const updatedActivities = [...activities, ...newActivities];
      await storage.store('activities', { userId: user.id, activities: updatedActivities });
      onSave(updatedActivities);
      
      setCurrentView('list');
    } catch (error) {
      console.error('Error generating activity suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => {
    let title = 'Aktiviteter';
    switch (currentView) {
      case 'add-manual':
        title = 'Lägg till aktivitet';
        break;
      case 'ai-suggestions':
        title = 'AI-förslag';
        break;
      case 'view-activity':
        title = selectedActivity?.name || 'Visa aktivitet';
        break;
    }

    return (
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Dumbbell className="w-6 h-6 mr-2" />
          {title}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    );
  };

  const renderActivityList = () => (
    <div className="space-y-4">
      {/* Add Activity Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentView('add-manual')}
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4 hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-left"
        >
          <Plus className="w-6 h-6 text-blue-400 mb-2" />
          <h3 className="text-white font-semibold mb-1">Lägg till manuellt</h3>
          <p className="text-gray-300 text-sm">Skapa din egen aktivitet</p>
        </button>

        <button
          onClick={() => setCurrentView('ai-suggestions')}
          className="bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 rounded-lg p-4 hover:from-pink-500/30 hover:to-orange-500/30 transition-all text-left"
        >
          <Sparkles className="w-6 h-6 text-pink-400 mb-2" />
          <h3 className="text-white font-semibold mb-1">AI-förslag</h3>
          <p className="text-gray-300 text-sm">Baserat på dina mål och livsstil</p>
        </button>
      </div>

      {/* Activity List */}
      {activities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Dina aktiviteter</h3>
          
          {/* Group activities by category */}
          {categoryOptions.map(category => {
            const categoryActivities = activities.filter(a => a.category === category);
            if (categoryActivities.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h4 className="text-md font-medium text-gray-300 border-b border-gray-600 pb-1">
                  {category}
                </h4>
                {categoryActivities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => {
                      setSelectedActivity(activity);
                      setCurrentView('view-activity');
                    }}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-semibold">{activity.name}</h5>
                        <p className="text-gray-300 text-sm">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          {activity.duration && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {activity.duration}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs ${
                            activity.difficulty === 'Lätt' ? 'bg-green-500/20 text-green-300' :
                            activity.difficulty === 'Medel' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {activity.difficulty}
                          </span>
                          <span className="bg-purple-500/20 px-2 py-1 rounded text-purple-300">
                            {activity.source === 'manual' ? 'Egen' : 'AI'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Dumbbell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Inga aktiviteter än. Lägg till din första aktivitet!</p>
        </div>
      )}
    </div>
  );

  const renderManualForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Namn på aktivitet</label>
          <input
            type="text"
            value={manualForm.name}
            onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="T.ex. Morgonyoga eller Jogging i parken"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Beskrivning</label>
          <textarea
            value={manualForm.description}
            onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows={3}
            placeholder="Beskriv aktiviteten och vad den är bra för..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Varaktighet</label>
            <input
              type="text"
              value={manualForm.duration}
              onChange={(e) => setManualForm(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="T.ex. 30 min"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Svårighetsgrad</label>
            <select
              value={manualForm.difficulty}
              onChange={(e) => setManualForm(prev => ({ ...prev, difficulty: e.target.value as Activity['difficulty'] }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {difficultyOptions.map(difficulty => (
                <option key={difficulty} value={difficulty} className="bg-gray-800">
                  {difficulty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
            <select
              value={manualForm.category}
              onChange={(e) => setManualForm(prev => ({ ...prev, category: e.target.value as Activity['category'] }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {categoryOptions.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setCurrentView('list')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Tillbaka
        </button>
        <button
          onClick={handleSaveManualActivity}
          disabled={!manualForm.name.trim()}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          Spara aktivitet
        </button>
      </div>
    </div>
  );

  const renderAISuggestions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-6">
          Låt AI föreslå aktiviteter baserat på dina mål, livsstil och vad du redan gör.
        </p>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">Dina mål:</h4>
        <div className="text-sm text-gray-300 mb-4">
          {user.goals.map((goal, index) => (
            <span key={index} className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded mr-2 mb-1">
              {goal}
            </span>
          ))}
        </div>
        
        <h4 className="text-white font-semibold mb-2">Din livsstil:</h4>
        <div className="text-sm text-gray-300">
          {user.lifestyle.map((item, index) => (
            <span key={index} className="inline-block bg-green-500/20 text-green-300 px-2 py-1 rounded mr-2 mb-1">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setCurrentView('list')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Tillbaka
        </button>
        <button
          onClick={handleGenerateAISuggestions}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-600 hover:from-pink-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          {isLoading ? 'Genererar förslag...' : 'Få AI-förslag'}
        </button>
      </div>
    </div>
  );

  const renderActivityView = () => {
    if (!selectedActivity) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">{selectedActivity.name}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Varaktighet</p>
              <p className="text-white font-semibold">{selectedActivity.duration || 'Flexibel'}</p>
            </div>
            
            <div className="text-center">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Svårighetsgrad</p>
              <p className={`font-semibold ${
                selectedActivity.difficulty === 'Lätt' ? 'text-green-300' :
                selectedActivity.difficulty === 'Medel' ? 'text-yellow-300' :
                'text-red-300'
              }`}>
                {selectedActivity.difficulty}
              </p>
            </div>
            
            <div className="text-center">
              <Dumbbell className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Kategori</p>
              <p className="text-white font-semibold">{selectedActivity.category}</p>
            </div>
            
            <div className="text-center">
              <Sparkles className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Källa</p>
              <p className="text-white font-semibold">
                {selectedActivity.source === 'manual' ? 'Egen' : 'AI-förslag'}
              </p>
            </div>
          </div>
          
          {selectedActivity.description && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Beskrivning</h4>
              <p className="text-gray-300 leading-relaxed">{selectedActivity.description}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setCurrentView('list')}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            Tillbaka till listan
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {renderHeader()}
        
        <div className="p-6">
          {currentView === 'list' && renderActivityList()}
          {currentView === 'add-manual' && renderManualForm()}
          {currentView === 'ai-suggestions' && renderAISuggestions()}
          {currentView === 'view-activity' && renderActivityView()}
        </div>
      </div>
    </div>
  );
}
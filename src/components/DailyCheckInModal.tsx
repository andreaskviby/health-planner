'use client';

import { useState } from 'react';
import { X, Smile, Battery, Calendar } from 'lucide-react';
import { UserProfile, DailyCheckIn } from '@/lib/types';
import { storage } from '@/lib/storage';

interface DailyCheckInModalProps {
  user: UserProfile;
  onComplete: (checkIn: DailyCheckIn) => void;
  onClose: () => void;
}

export default function DailyCheckInModal({ user, onComplete, onClose }: DailyCheckInModalProps) {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const activities = [
    'Gick en promenad',
    'Tränade på gym',
    'Yoga/stretching',
    'Lagade hälsosam mat',
    'Drack mycket vatten',
    'Sov bra',
    'Medierade',
    'Träffade vänner',
    'Joggade',
    'Cyklade',
  ];

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = async () => {
    const checkIn: DailyCheckIn = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date(),
      mood,
      energy,
      weight: weight ? parseFloat(weight) : undefined,
      notes,
      activities: selectedActivities,
    };

    try {
      await storage.store('dailyCheckIns', checkIn);
      onComplete(checkIn);
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return '😢';
    if (value <= 4) return '😐';
    if (value <= 6) return '🙂';
    if (value <= 8) return '😊';
    return '😄';
  };

  const getEnergyEmoji = (value: number) => {
    if (value <= 2) return '🔋';
    if (value <= 4) return '🔋🔋';
    if (value <= 6) return '🔋🔋🔋';
    if (value <= 8) return '⚡';
    return '⚡⚡';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-blue-400 mr-2" />
            <h2 className="text-xl font-semibold text-white">Dagens incheckning</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Mood */}
          <div>
            <div className="flex items-center mb-3">
              <Smile className="w-5 h-5 text-yellow-400 mr-2" />
              <label className="text-white font-medium">Humör ({mood}/10) {getMoodEmoji(mood)}</label>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Mycket dåligt</span>
              <span>Fantastiskt</span>
            </div>
          </div>

          {/* Energy */}
          <div>
            <div className="flex items-center mb-3">
              <Battery className="w-5 h-5 text-green-400 mr-2" />
              <label className="text-white font-medium">Energinivå ({energy}/10) {getEnergyEmoji(energy)}</label>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Helt slut</span>
              <span>Superenergi</span>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-white font-medium mb-2">Vikt (frivilligt)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Vikt i kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Activities */}
          <div>
            <label className="block text-white font-medium mb-3">Vad har du gjort idag?</label>
            <div className="grid grid-cols-2 gap-2">
              {activities.map((activity) => (
                <button
                  key={activity}
                  onClick={() => handleActivityToggle(activity)}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    selectedActivities.includes(activity)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-white font-medium mb-2">Tankar och känslor</label>
            <textarea
              placeholder="Hur känner du dig idag? Något speciellt som hänt?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all"
          >
            Spara incheckning
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
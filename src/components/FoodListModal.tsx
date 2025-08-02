'use client';

import { useState } from 'react';
import { X, Utensils, Plus, Trash2 } from 'lucide-react';
import { UserProfile, FoodList } from '@/lib/types';
import { storage } from '@/lib/storage';

interface FoodListModalProps {
  user: UserProfile;
  foodList: FoodList | null;
  onSave: (foodList: FoodList) => void;
  onClose: () => void;
}

export default function FoodListModal({ user, foodList, onSave, onClose }: FoodListModalProps) {
  const [lists, setLists] = useState<FoodList>({
    yes: foodList?.yes || [],
    no: foodList?.no || [],
    sometimes: foodList?.sometimes || [],
  });
  
  const [newItems, setNewItems] = useState({
    yes: '',
    no: '',
    sometimes: '',
  });

  const addItem = (category: keyof FoodList) => {
    const item = newItems[category].trim();
    if (item) {
      setLists(prev => ({
        ...prev,
        [category]: [...prev[category], item]
      }));
      setNewItems(prev => ({ ...prev, [category]: '' }));
    }
  };

  const removeItem = (category: keyof FoodList, index: number) => {
    setLists(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      await storage.store('foodLists', { ...lists, userId: user.id });
      onSave(lists);
    } catch (error) {
      console.error('Error saving food list:', error);
    }
  };

  const categories = [
    { key: 'yes' as const, title: 'JA-lista', subtitle: 'Mat jag älskar', color: 'green' },
    { key: 'no' as const, title: 'NEJ-lista', subtitle: 'Mat jag undviker', color: 'red' },
    { key: 'sometimes' as const, title: 'IBLAND-lista', subtitle: 'Mat jag äter ibland', color: 'yellow' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          header: 'bg-green-500/20 border-green-400/30',
          button: 'bg-green-500 hover:bg-green-600',
          tag: 'bg-green-500/20 text-green-300 border-green-400/30'
        };
      case 'red':
        return {
          header: 'bg-red-500/20 border-red-400/30',
          button: 'bg-red-500 hover:bg-red-600',
          tag: 'bg-red-500/20 text-red-300 border-red-400/30'
        };
      case 'yellow':
        return {
          header: 'bg-yellow-500/20 border-yellow-400/30',
          button: 'bg-yellow-500 hover:bg-yellow-600',
          tag: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
        };
      default:
        return {
          header: 'bg-gray-500/20 border-gray-400/30',
          button: 'bg-gray-500 hover:bg-gray-600',
          tag: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Utensils className="w-6 h-6 text-green-400 mr-2" />
            <h2 className="text-xl font-semibold text-white">Matlistor</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          Skapa dina personliga matlistor för att hjälpa AI:n att generera bättre recept och måltidsförslag.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const colors = getColorClasses(category.color);
            return (
              <div key={category.key} className="space-y-4">
                <div className={`p-4 rounded-lg border ${colors.header}`}>
                  <h3 className="font-semibold text-white text-lg">{category.title}</h3>
                  <p className="text-gray-300 text-sm">{category.subtitle}</p>
                </div>

                {/* Add new item */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Lägg till mat..."
                    value={newItems[category.key]}
                    onChange={(e) => setNewItems(prev => ({ ...prev, [category.key]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addItem(category.key)}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                  <button
                    onClick={() => addItem(category.key)}
                    className={`p-2 rounded-lg text-white transition-colors ${colors.button}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Items list */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lists[category.key].map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded border ${colors.tag}`}
                    >
                      <span className="text-sm">{item}</span>
                      <button
                        onClick={() => removeItem(category.key, index)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {lists[category.key].length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-4">
                      Inga matvaror tillagda än
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold transition-all"
          >
            Spara listor
          </button>
        </div>
      </div>
    </div>
  );
}
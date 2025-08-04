'use client';

import { useState } from 'react';
import { X, ChefHat, Plus, Link, Sparkles, Clock, Users, ChevronRight } from 'lucide-react';
import { UserProfile, FoodList } from '@/lib/types';
import { storage } from '@/lib/storage';
import { generateRecipe } from '@/lib/claude';

// Recipe type definition
interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: string;
  source: 'manual' | 'link' | 'ai';
  sourceUrl?: string;
  createdAt: Date;
}

interface RecipeModalProps {
  user: UserProfile;
  recipes: Recipe[];
  foodList: FoodList | null;
  onSave: (recipes: Recipe[]) => void;
  onClose: () => void;
}

type RecipeView = 'list' | 'add-manual' | 'add-link' | 'ai-generate' | 'view-recipe';

export default function RecipeModal({ user, recipes, foodList, onSave, onClose }: RecipeModalProps) {
  const [currentView, setCurrentView] = useState<RecipeView>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual recipe form
  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cookingTime: '',
    servings: '',
  });

  // Link form
  const [linkUrl, setLinkUrl] = useState('');

  const addIngredient = () => {
    setManualForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setManualForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const removeIngredient = (index: number) => {
    if (manualForm.ingredients.length > 1) {
      setManualForm(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const addInstruction = () => {
    setManualForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setManualForm(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const removeInstruction = (index: number) => {
    if (manualForm.instructions.length > 1) {
      setManualForm(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveManualRecipe = async () => {
    if (!manualForm.title.trim()) return;

    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: manualForm.title,
      description: manualForm.description,
      ingredients: manualForm.ingredients.filter(ing => ing.trim()),
      instructions: manualForm.instructions.filter(inst => inst.trim()),
      cookingTime: manualForm.cookingTime,
      servings: manualForm.servings,
      source: 'manual',
      createdAt: new Date(),
    };

    const updatedRecipes = [...recipes, newRecipe];
    await storage.store('recipes', { userId: user.id, recipes: updatedRecipes });
    onSave(updatedRecipes);
    
    // Reset form
    setManualForm({
      title: '',
      description: '',
      ingredients: [''],
      instructions: [''],
      cookingTime: '',
      servings: '',
    });
    setCurrentView('list');
  };

  const handleGenerateFromLink = async () => {
    if (!linkUrl.trim()) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would parse the webpage
      // For now, we'll use AI to generate a recipe based on the URL
      const recipeData = await generateRecipe({
        type: 'from-link',
        url: linkUrl,
        userPreferences: foodList || undefined,
      });

      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        userId: user.id,
        title: recipeData.title || 'Recept från länk',
        description: recipeData.description || '',
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        cookingTime: recipeData.cookingTime || '',
        servings: recipeData.servings || '',
        source: 'link',
        sourceUrl: linkUrl,
        createdAt: new Date(),
      };

      const updatedRecipes = [...recipes, newRecipe];
      await storage.store('recipes', { userId: user.id, recipes: updatedRecipes });
      onSave(updatedRecipes);
      
      setLinkUrl('');
      setCurrentView('list');
    } catch (error) {
      console.error('Error generating recipe from link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!foodList) return;
    
    setIsLoading(true);
    try {
      const recipeData = await generateRecipe({
        type: 'from-preferences',
        userPreferences: foodList || undefined,
        userName: user.name,
      });

      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        userId: user.id,
        title: recipeData.title || 'AI-genererat recept',
        description: recipeData.description || '',
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        cookingTime: recipeData.cookingTime || '',
        servings: recipeData.servings || '',
        source: 'ai',
        createdAt: new Date(),
      };

      const updatedRecipes = [...recipes, newRecipe];
      await storage.store('recipes', { userId: user.id, recipes: updatedRecipes });
      onSave(updatedRecipes);
      
      setCurrentView('list');
    } catch (error) {
      console.error('Error generating AI recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => {
    let title = 'Recept';
    switch (currentView) {
      case 'add-manual':
        title = 'Lägg till recept manuellt';
        break;
      case 'add-link':
        title = 'Lägg till från länk';
        break;
      case 'ai-generate':
        title = 'AI-genererat recept';
        break;
      case 'view-recipe':
        title = selectedRecipe?.title || 'Visa recept';
        break;
    }

    return (
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <ChefHat className="w-6 h-6 mr-2" />
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

  const renderRecipeList = () => (
    <div className="space-y-4">
      {/* Add Recipe Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setCurrentView('add-manual')}
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4 hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-left"
        >
          <Plus className="w-6 h-6 text-blue-400 mb-2" />
          <h3 className="text-white font-semibold mb-1">Lägg till manuellt</h3>
          <p className="text-gray-300 text-sm">Skriv in ditt eget recept</p>
        </button>

        <button
          onClick={() => setCurrentView('add-link')}
          className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-lg p-4 hover:from-green-500/30 hover:to-teal-500/30 transition-all text-left"
        >
          <Link className="w-6 h-6 text-green-400 mb-2" />
          <h3 className="text-white font-semibold mb-1">Från länk</h3>
          <p className="text-gray-300 text-sm">Importera från webbsida</p>
        </button>

        <button
          onClick={() => setCurrentView('ai-generate')}
          disabled={!foodList}
          className="bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 rounded-lg p-4 hover:from-pink-500/30 hover:to-orange-500/30 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-6 h-6 text-pink-400 mb-2" />
          <h3 className="text-white font-semibold mb-1">AI-genererat</h3>
          <p className="text-gray-300 text-sm">
            {foodList ? 'Baserat på dina preferenser' : 'Skapa matlistor först'}
          </p>
        </button>
      </div>

      {/* Recipe List */}
      {recipes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Dina recept</h3>
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => {
                setSelectedRecipe(recipe);
                setCurrentView('view-recipe');
              }}
              className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">{recipe.title}</h4>
                  <p className="text-gray-300 text-sm">{recipe.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    {recipe.cookingTime && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.cookingTime}
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {recipe.servings} portioner
                      </span>
                    )}
                    <span className="bg-purple-500/20 px-2 py-1 rounded">
                      {recipe.source === 'manual' ? 'Manuell' : 
                       recipe.source === 'link' ? 'Länk' : 'AI'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {recipes.length === 0 && (
        <div className="text-center py-8">
          <ChefHat className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Inga recept än. Lägg till ditt första recept!</p>
        </div>
      )}
    </div>
  );

  const renderManualForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Titel</label>
          <input
            type="text"
            value={manualForm.title}
            onChange={(e) => setManualForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="T.ex. Grönsakspasta med pesto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Beskrivning</label>
          <textarea
            value={manualForm.description}
            onChange={(e) => setManualForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows={3}
            placeholder="Kort beskrivning av receptet..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tillagning</label>
            <input
              type="text"
              value={manualForm.cookingTime}
              onChange={(e) => setManualForm(prev => ({ ...prev, cookingTime: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="T.ex. 30 min"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Portioner</label>
            <input
              type="text"
              value={manualForm.servings}
              onChange={(e) => setManualForm(prev => ({ ...prev, servings: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="T.ex. 4"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ingredienser</label>
          {manualForm.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="T.ex. 200g pasta"
              />
              {manualForm.ingredients.length > 1 && (
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addIngredient}
            className="mt-2 text-sm text-pink-400 hover:text-pink-300 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till ingrediens
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Instruktioner</label>
          {manualForm.instructions.map((instruction, index) => (
            <div key={index} className="flex items-start space-x-2 mb-2">
              <span className="text-gray-400 text-sm mt-2 w-6">{index + 1}.</span>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows={2}
                placeholder="Beskriv detta steg..."
              />
              {manualForm.instructions.length > 1 && (
                <button
                  onClick={() => removeInstruction(index)}
                  className="text-red-400 hover:text-red-300 mt-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addInstruction}
            className="mt-2 text-sm text-pink-400 hover:text-pink-300 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till steg
          </button>
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
          onClick={handleSaveManualRecipe}
          disabled={!manualForm.title.trim()}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          Spara recept
        </button>
      </div>
    </div>
  );

  const renderLinkForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Link className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-6">
          Klistra in länken till ett recept så använder vi AI för att hämta och formatera det åt dig.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Receptlänk</label>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="https://example.com/recept"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setCurrentView('list')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Tillbaka
        </button>
        <button
          onClick={handleGenerateFromLink}
          disabled={!linkUrl.trim() || isLoading}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          {isLoading ? 'Hämtar recept...' : 'Hämta recept'}
        </button>
      </div>
    </div>
  );

  const renderAIGenerate = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-6">
          Låt AI skapa ett recept baserat på dina matpreferenser från dina matlistor.
        </p>
      </div>

      {foodList && (
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Dina preferenser:</h4>
          <div className="text-sm text-gray-300">
            <p><strong>Ja:</strong> {foodList.yes.slice(0, 3).join(', ')}{foodList.yes.length > 3 ? '...' : ''}</p>
            <p><strong>Nej:</strong> {foodList.no.slice(0, 3).join(', ')}{foodList.no.length > 3 ? '...' : ''}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setCurrentView('list')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          Tillbaka
        </button>
        <button
          onClick={handleAIGenerate}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-600 hover:from-pink-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          {isLoading ? 'Genererar recept...' : 'Generera recept'}
        </button>
      </div>
    </div>
  );

  const renderRecipeView = () => {
    if (!selectedRecipe) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{selectedRecipe.title}</h3>
          {selectedRecipe.description && (
            <p className="text-gray-300 mb-4">{selectedRecipe.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
            {selectedRecipe.cookingTime && (
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {selectedRecipe.cookingTime}
              </span>
            )}
            {selectedRecipe.servings && (
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {selectedRecipe.servings} portioner
              </span>
            )}
            {selectedRecipe.sourceUrl && (
              <a
                href={selectedRecipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-400 hover:text-blue-300"
              >
                <Link className="w-4 h-4 mr-1" />
                Källa
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Ingredienser</h4>
          <ul className="space-y-1">
            {selectedRecipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-300 flex items-start">
                <span className="text-pink-400 mr-2">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Instruktioner</h4>
          <ol className="space-y-3">
            {selectedRecipe.instructions.map((instruction, index) => (
              <li key={index} className="text-gray-300 flex items-start">
                <span className="text-pink-400 font-semibold mr-3 mt-1">{index + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
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
          {currentView === 'list' && renderRecipeList()}
          {currentView === 'add-manual' && renderManualForm()}
          {currentView === 'add-link' && renderLinkForm()}
          {currentView === 'ai-generate' && renderAIGenerate()}
          {currentView === 'view-recipe' && renderRecipeView()}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecipe } from '../../contexts/RecipeContext';
import { useAI } from '../../contexts/AIContext';
import { toast } from 'react-toastify';

const RecipeModification = () => {
  const { recipeId } = useParams();
  const { recipe, updateRecipe } = useRecipe();
  const { modifyRecipe, aiUsage } = useAI();
  const [loading, setLoading] = useState(false);
  const [modifications, setModifications] = useState({
    makeLowCarb: false,
    makeVegan: false,
    makeGlutenFree: false,
    reducedCalories: false
  });

  const handleModification = async () => {
    try {
      setLoading(true);
      
      const selectedMods = Object.entries(modifications)
        .filter(([_, value]) => value)
        .map(([key]) => key);
        
      if (selectedMods.length === 0) {
        toast.error('Wybierz co najmniej jedną modyfikację');
        return;
      }

      const result = await modifyRecipe(recipeId, selectedMods);
      
      if (result.error) {
        throw new Error(result.error);
      }

      await updateRecipe(recipeId, result.recipe);
      toast.success('Przepis został zmodyfikowany!');
    } catch (error) {
      toast.error(error.message || 'Błąd podczas modyfikacji przepisu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Modyfikacja przepisu</h2>
      
      {/* Informacja o limitach AI */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p>Pozostało modyfikacji dzisiaj: {aiUsage.remaining}</p>
        <p>Limit dzienny: {aiUsage.limit}</p>
      </div>

      {/* Opcje modyfikacji */}
      <div className="space-y-4 mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={modifications.makeLowCarb}
            onChange={(e) => setModifications({
              ...modifications,
              makeLowCarb: e.target.checked
            })}
            className="form-checkbox"
          />
          <span>Wersja niskowęglowodanowa</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={modifications.makeVegan}
            onChange={(e) => setModifications({
              ...modifications,
              makeVegan: e.target.checked
            })}
            className="form-checkbox"
          />
          <span>Wersja wegańska</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={modifications.makeGlutenFree}
            onChange={(e) => setModifications({
              ...modifications,
              makeGlutenFree: e.target.checked
            })}
            className="form-checkbox"
          />
          <span>Bez glutenu</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={modifications.reducedCalories}
            onChange={(e) => setModifications({
              ...modifications,
              reducedCalories: e.target.checked
            })}
            className="form-checkbox"
          />
          <span>Zredukowana kaloryczność</span>
        </label>
      </div>

      <button
        onClick={handleModification}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
      >
        {loading ? 'Modyfikuję...' : 'Modyfikuj przepis'}
      </button>
    </div>
  );
};

export default RecipeModification; 
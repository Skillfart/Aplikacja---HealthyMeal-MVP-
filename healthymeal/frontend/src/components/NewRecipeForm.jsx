import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const NewRecipeForm = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: [{ name: '', quantity: '', unit: 'g' }],
    instructions: [''],
    preparationTime: 30,
    servings: 4,
    hashtags: []
  });

  // Sprawdź autoryzację
  useEffect(() => {
    if (!session?.access_token) {
      navigate('/login');
    }
  }, [session, navigate]);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = value;
    setRecipe(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: '', quantity: '', unit: 'g' }
      ]
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeIngredient = (index) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const removeInstruction = (index) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.access_token) {
      setError('Musisz być zalogowany aby dodać przepis');
      return;
    }

    // Walidacja danych
    if (!recipe.title.trim()) {
      setError('Tytuł jest wymagany');
      return;
    }

    if (recipe.ingredients.length === 0 || recipe.ingredients.some(ing => !ing.name || !ing.quantity)) {
      setError('Wszystkie składniki muszą mieć nazwę i ilość');
      return;
    }

    if (recipe.instructions.length === 0 || recipe.instructions.some(instr => !instr.trim())) {
      setError('Wymagana jest co najmniej jedna instrukcja');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3031';
      
      // Przygotowanie danych do wysłania
      const recipeData = {
        ...recipe,
        // Upewnij się, że hashtagi są tablicą unikalnych wartości
        hashtags: [...new Set(recipe.hashtags.filter(tag => tag.trim()))],
        // Upewnij się, że instrukcje są tablicą niepustych stringów
        instructions: recipe.instructions.filter(instr => instr.trim()),
        // Upewnij się, że składniki mają wszystkie wymagane pola
        ingredients: recipe.ingredients.map(ing => ({
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
          unit: ing.unit || 'g'
        }))
      };

      const response = await axios.post(`${API_BASE}/api/recipes`, recipeData, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      // Przekieruj do widoku utworzonego przepisu
      navigate(`/recipes/${response.data._id}`);
    } catch (err) {
      console.error('Błąd podczas tworzenia przepisu:', err);
      
      if (err.response?.status === 401) {
        setError('Sesja wygasła. Zaloguj się ponownie.');
        navigate('/login');
      } else if (err.response?.status === 400) {
        // Błędy walidacji z backendu
        if (err.response.data?.details) {
          const details = Object.values(err.response.data.details).filter(Boolean);
          setError(`Błędy walidacji: ${details.join(', ')}`);
        } else {
          setError(err.response.data?.error || 'Nieprawidłowe dane przepisu');
        }
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Nie udało się utworzyć przepisu. Spróbuj ponownie później.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session?.access_token) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Podstawowe informacje */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Podstawowe informacje
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tytuł przepisu
            </label>
            <input
              type="text"
              required
              value={recipe.title}
              onChange={e => setRecipe(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tagi (oddzielone przecinkami)
            </label>
            <input
              type="text"
              value={recipe.hashtags.join(', ')}
              onChange={e => setRecipe(prev => ({
                ...prev,
                hashtags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              className="mt-1 input input-bordered w-full"
              placeholder="np. wegetariańskie, szybkie, deser"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Czas przygotowania (minuty)
            </label>
            <input
              type="number"
              required
              min="1"
              value={recipe.preparationTime}
              onChange={e => setRecipe(prev => ({ ...prev, preparationTime: parseInt(e.target.value) }))}
              className="mt-1 input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ilość porcji
            </label>
            <input
              type="number"
              required
              min="1"
              value={recipe.servings}
              onChange={e => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
              className="mt-1 input input-bordered w-full"
            />
          </div>
        </div>
      </div>

      {/* Składniki */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Składniki</h3>
          <button
            type="button"
            onClick={addIngredient}
            className="btn btn-secondary btn-sm"
          >
            Dodaj składnik
          </button>
        </div>
        <div className="space-y-4">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="Nazwa składnika"
                  value={ingredient.name}
                  onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  placeholder="Ilość"
                  value={ingredient.quantity}
                  onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="w-24">
                <select
                  value={ingredient.unit}
                  onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="szt">szt</option>
                  <option value="łyżka">łyżka</option>
                  <option value="łyżeczka">łyżeczka</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="btn btn-ghost btn-sm text-red-500"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instrukcje */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Instrukcje</h3>
          <button
            type="button"
            onClick={addInstruction}
            className="btn btn-secondary btn-sm"
          >
            Dodaj krok
          </button>
        </div>
        <div className="space-y-4">
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <textarea
                  required
                  placeholder={`Krok ${index + 1}`}
                  value={instruction}
                  onChange={e => handleInstructionChange(index, e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows="2"
                />
              </div>
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="btn btn-ghost btn-sm text-red-500"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Zapisywanie...' : 'Zapisz przepis'}
        </button>
      </div>
    </form>
  );
};

export default NewRecipeForm; 
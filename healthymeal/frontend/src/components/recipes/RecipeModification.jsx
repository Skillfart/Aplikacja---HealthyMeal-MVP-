import React, { useState } from 'react';
import { useAuth } from '@frontend/contexts/AuthContext';
import { modifyRecipeWithAI } from '@frontend/services/aiService';

const RecipeModification = ({ recipe }) => {
  const { user } = useAuth();
  const [modifiedRecipe, setModifiedRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleModify = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await modifyRecipeWithAI(recipe, user.user_metadata.preferences);
      
      if (error) throw error;
      
      setModifiedRecipe(data);
    } catch (err) {
      setError(err.message || 'Błąd modyfikacji przepisu');
    } finally {
      setLoading(false);
    }
  };

  const getChanges = () => {
    if (!modifiedRecipe) return [];
    
    const changes = [];
    
    // Porównaj składniki
    recipe.ingredients.forEach((original, index) => {
      const modified = modifiedRecipe.ingredients[index];
      if (original.name !== modified.name) {
        changes.push(`${original.name} → ${modified.name}`);
      }
    });
    
    return changes;
  };

  return (
    <div className="recipe-modification">
      <h2>Modyfikacja przepisu</h2>
      
      <div className="preferences-info">
        <h3>Preferencje</h3>
        <p>Typ diety: {user.user_metadata.preferences.dietType}</p>
        <p>Maksymalna ilość węglowodanów: {user.user_metadata.preferences.maxCarbs}g</p>
        <p>Wykluczone produkty: {user.user_metadata.preferences.excludedProducts.join(', ')}</p>
      </div>
      
      <button 
        onClick={handleModify}
        disabled={loading}
        className="modify-button"
      >
        {loading ? 'Modyfikowanie...' : 'Modyfikuj przepis'}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {modifiedRecipe && (
        <div className="comparison">
          <div className="original-recipe">
            <h3>Oryginalny przepis</h3>
            <h4>{recipe.title}</h4>
            <h5>Składniki:</h5>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient.name} - {ingredient.amount}</li>
              ))}
            </ul>
            <h5>Instrukcje:</h5>
            <p>{recipe.instructions}</p>
          </div>
          
          <div className="modified-recipe">
            <h3>Zmodyfikowany przepis</h3>
            <h4>{modifiedRecipe.title}</h4>
            <h5>Składniki:</h5>
            <ul>
              {modifiedRecipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient.name} - {ingredient.amount}</li>
              ))}
            </ul>
            <h5>Instrukcje:</h5>
            <p>{modifiedRecipe.instructions}</p>
          </div>
          
          <div className="changes-summary">
            <h3>Podsumowanie zmian</h3>
            <ul>
              {getChanges().map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeModification; 
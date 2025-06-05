import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaMagic, FaTrash, FaPrint, FaExchangeAlt } from 'react-icons/fa';
import styles from './SingleRecipe.module.css';
import { useAuth } from '../../contexts/AuthContext';

export const SingleRecipe = ({ recipe: propRecipe, onEdit, onModify, onDelete }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [recipe, setRecipe] = useState(propRecipe);
  const [loading, setLoading] = useState(!propRecipe);
  const [error, setError] = useState(null);
  const [modifiedRecipes, setModifiedRecipes] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();

  // Funkcja pomocnicza do pobierania tokenu autoryzacji
  const getAuthConfig = () => {
    const token = getAccessToken();
    return token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
  };

  // Pobierz przepis, jeśli nie został przekazany jako props
  useEffect(() => {
    const fetchRecipe = async () => {
      if (propRecipe) {
        setRecipe(propRecipe);
        return;
      }

      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/recipes/${id}`, getAuthConfig());
        setRecipe(response.data);
        
        // Pobierz zmodyfikowane wersje przepisu
        try {
          const modifiedResponse = await axios.get(`/api/recipes/modified?originalId=${id}`, getAuthConfig());
          if (modifiedResponse.data && Array.isArray(modifiedResponse.data.recipes)) {
            setModifiedRecipes(modifiedResponse.data.recipes);
          }
        } catch (modifiedErr) {
          console.warn('Nie udało się pobrać zmodyfikowanych przepisów:', modifiedErr);
          // Nie przerywamy ładowania głównego przepisu
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Nie udało się pobrać przepisu. Spróbuj ponownie później.');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, propRecipe, getAccessToken]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/recipes/${id}/edit`);
    }
  };

  const handleModify = () => {
    if (onModify) {
      onModify();
    } else {
      navigate(`/recipes/${id}/modify`);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete();
      return;
    }

    if (window.confirm('Czy na pewno chcesz usunąć ten przepis?')) {
      try {
        await axios.delete(`/api/recipes/${id}`, getAuthConfig());
        navigate('/recipes');
      } catch (err) {
        console.error('Error deleting recipe:', err);
        setError('Nie udało się usunąć przepisu. Spróbuj ponownie później.');
      }
    }
  };

  const handlePrint = () => {
    navigate(`/recipes/${id}/print`);
  };

  const handleCompare = (modifiedId) => {
    if (modifiedId) {
      navigate(`/recipes/compare?originalId=${id}&modifiedId=${modifiedId}`);
    } else if (modifiedRecipes.length > 0) {
      navigate(`/recipes/compare?originalId=${id}&modifiedId=${modifiedRecipes[0]._id}`);
    } else {
      // Jeśli nie ma zmodyfikowanych przepisów, pokaż komunikat
      alert('Brak zmodyfikowanych wersji tego przepisu do porównania.');
    }
  };

  if (loading) {
    return <div className={styles.loading} data-testid="loading-indicator">Ładowanie przepisu...</div>;
  }

  if (error) {
    return <div className={styles.error} data-testid="error-message">{error}</div>;
  }

  if (!recipe) {
    return <div className={styles.notFound} data-testid="recipe-not-found">Przepis nie został znaleziony.</div>;
  }

  return (
    <div className={styles.recipeContainer} data-testid="recipe-container">
      <div className={styles.recipeHeader} data-testid="recipe-header">
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 data-testid="recipe-title">{recipe.title}</h1>
            <div className={styles.recipeMetadata} data-testid="recipe-metadata">
              <span className={styles.metaItem} data-testid="recipe-prep-time">
                <i className={styles.icon}>⏱️</i> {recipe.preparationTime} min
              </span>
              <span className={styles.metaItem} data-testid="recipe-difficulty">
                <i className={styles.icon}>👨‍🍳</i> 
                {recipe.difficulty === 'easy' && 'Łatwy'}
                {recipe.difficulty === 'medium' && 'Średni'}
                {recipe.difficulty === 'hard' && 'Trudny'}
                {(recipe.difficulty !== 'easy' && recipe.difficulty !== 'medium' && recipe.difficulty !== 'hard') && recipe.difficulty}
              </span>
              <span className={styles.metaItem} data-testid="recipe-servings">
                <i className={styles.icon}>🍽️</i> {recipe.servings} porcji
              </span>
            </div>
          </div>
          
          <div className={styles.actionButtons} data-testid="recipe-actions">
            <button onClick={handleEdit} className={styles.editButton} data-testid="edit-button">
              <FaEdit /> Edytuj
            </button>
            <button onClick={handleModify} className={styles.modifyButton} data-testid="modify-button">
              <FaMagic /> Modyfikuj z AI
            </button>
            {modifiedRecipes.length > 0 && (
              <button onClick={() => handleCompare()} className={styles.compareButton} data-testid="compare-button">
                <FaExchangeAlt /> Porównaj zmodyfikowane
              </button>
            )}
            <button onClick={handlePrint} className={styles.printButton} data-testid="print-button">
              <FaPrint /> Drukuj
            </button>
            <button onClick={handleDelete} className={styles.deleteButton} data-testid="delete-button">
              <FaTrash /> Usuń
            </button>
          </div>
        </div>
      </div>

      {recipe.description && (
        <div className={styles.recipeDescription} data-testid="recipe-description">
          <p>{recipe.description}</p>
        </div>
      )}

      {recipe.tags && recipe.tags.length > 0 && (
        <div className={styles.recipeTags} data-testid="recipe-tags">
          {recipe.tags.map((tag, index) => (
            <span key={index} className={styles.tag} data-testid={`recipe-tag-${index}`}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.recipeContent}>
        <div className={styles.tabButtons} data-testid="recipe-tabs">
          <button 
            className={`${styles.tabButton} ${activeTab === 'ingredients' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ingredients')}
            data-testid="ingredients-tab"
          >
            Składniki
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'instructions' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('instructions')}
            data-testid="instructions-tab"
          >
            Przygotowanie
          </button>
          {recipe.nutritionalValues && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'nutritionalValues' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('nutritionalValues')}
              data-testid="nutrition-tab"
            >
              Wartości odżywcze
            </button>
          )}
          {recipe.notes && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'notes' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('notes')}
              data-testid="notes-tab"
            >
              Notatki
            </button>
          )}
        </div>

        <div className={styles.tabContent} data-testid="tab-content">
          {activeTab === 'ingredients' && (
            <div className={styles.ingredientsTab} data-testid="recipe-ingredients">
              <h2>Składniki</h2>
              <ul className={styles.ingredientsList}>
                {Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className={styles.ingredientItem} data-testid={`ingredient-${index}`}>
                    <span className={styles.ingredientName}>
                      {ingredient.ingredient?.name || ingredient.name || ''}
                    </span>
                    <span className={styles.ingredientAmount}>
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </li>
                )) : <li>Brak danych o składnikach</li>}
              </ul>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className={styles.instructionsTab} data-testid="recipe-instructions">
              <h2>Sposób przygotowania</h2>
              <ol className={styles.stepsList}>
                {Array.isArray(recipe.steps) ? recipe.steps.map((step, index) => (
                  <li key={index} className={styles.stepItem} data-testid={`step-${index}`}>
                    <div className={styles.stepContent}>
                      <span className={styles.stepDescription}>{step.description}</span>
                    </div>
                  </li>
                )) : <li>Brak kroków przygotowania</li>}
              </ol>
            </div>
          )}

          {activeTab === 'nutritionalValues' && recipe.nutritionalValues && (
            <div className={styles.nutritionTab} data-testid="recipe-nutrition">
              <h2>Wartości odżywcze (na porcję)</h2>
              <div className={styles.nutritionGrid}>
                {recipe.nutritionalValues.totalCalories && (
                  <div className={styles.nutritionItem} data-testid="nutrition-calories">
                    <span className={styles.nutritionLabel}>Kalorie</span>
                    <span className={styles.nutritionValue}>
                      {Math.round(recipe.nutritionalValues.totalCalories / recipe.servings)} kcal
                    </span>
                  </div>
                )}
                {recipe.nutritionalValues.totalCarbs && (
                  <div className={styles.nutritionItem} data-testid="nutrition-carbs">
                    <span className={styles.nutritionLabel}>Węglowodany</span>
                    <span className={styles.nutritionValue}>
                      {Math.round(recipe.nutritionalValues.totalCarbs / recipe.servings)} g
                    </span>
                  </div>
                )}
                {recipe.nutritionalValues.totalProtein && (
                  <div className={styles.nutritionItem} data-testid="nutrition-protein">
                    <span className={styles.nutritionLabel}>Białko</span>
                    <span className={styles.nutritionValue}>
                      {Math.round(recipe.nutritionalValues.totalProtein / recipe.servings)} g
                    </span>
                  </div>
                )}
                {recipe.nutritionalValues.totalFat && (
                  <div className={styles.nutritionItem} data-testid="nutrition-fat">
                    <span className={styles.nutritionLabel}>Tłuszcze</span>
                    <span className={styles.nutritionValue}>
                      {Math.round(recipe.nutritionalValues.totalFat / recipe.servings)} g
                    </span>
                  </div>
                )}
                {recipe.nutritionalValues.fiber && (
                  <div className={styles.nutritionItem} data-testid="nutrition-fiber">
                    <span className={styles.nutritionLabel}>Błonnik</span>
                    <span className={styles.nutritionValue}>
                      {Math.round(recipe.nutritionalValues.fiber / recipe.servings)} g
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && recipe.notes && (
            <div className={styles.notesTab} data-testid="recipe-notes">
              <h2>Notatki</h2>
              <p className={styles.notes}>{recipe.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.recipeFooter} data-testid="recipe-footer">
        <Link to="/recipes" className={styles.backButton} data-testid="back-button">
          ← Wróć do listy przepisów
        </Link>
      </div>
    </div>
  );
}

export default SingleRecipe; 
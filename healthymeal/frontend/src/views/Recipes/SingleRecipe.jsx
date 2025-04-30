import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaMagic, FaTrash, FaPrint } from 'react-icons/fa';
import styles from './SingleRecipe.module.css';

export const SingleRecipe = ({ recipe: propRecipe, onEdit, onModify, onDelete }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [recipe, setRecipe] = useState(propRecipe);
  const [loading, setLoading] = useState(!propRecipe);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

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
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/recipes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRecipe(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Nie udało się pobrać przepisu. Spróbuj ponownie później.');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, propRecipe]);

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
        const token = localStorage.getItem('token');
        await axios.delete(`/api/recipes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        navigate('/recipes');
      } catch (err) {
        console.error('Error deleting recipe:', err);
        setError('Nie udało się usunąć przepisu. Spróbuj ponownie później.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Ładowanie przepisu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Wystąpił błąd</h2>
        <p>{error}</p>
        <Link to="/recipes" className={styles.backButton}>
          Wróć do listy przepisów
        </Link>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>Przepis nie został znaleziony</h2>
        <p>Przepraszamy, ale przepis, którego szukasz, nie istnieje.</p>
        <Link to="/recipes" className={styles.backButton}>
          Wróć do listy przepisów
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.recipeContainer}>
      <div className={styles.recipeHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1>{recipe.title}</h1>
            <div className={styles.recipeMetadata}>
              <span className={styles.metaItem}>
                <i className={styles.icon}>⏱️</i> {recipe.preparationTime} min
              </span>
              <span className={styles.metaItem}>
                <i className={styles.icon}>👨‍🍳</i> 
                {recipe.difficulty === 'easy' && 'Łatwy'}
                {recipe.difficulty === 'medium' && 'Średni'}
                {recipe.difficulty === 'hard' && 'Trudny'}
              </span>
              <span className={styles.metaItem}>
                <i className={styles.icon}>🍽️</i> {recipe.servings} porcji
              </span>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            <button onClick={handleEdit} className={styles.editButton}>
              Edytuj
            </button>
            <button onClick={handleModify} className={styles.modifyButton}>
              Modyfikuj z AI
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              Usuń
            </button>
            <button onClick={handlePrint} className={styles.printButton}>
              Drukuj
            </button>
          </div>
        </div>
      </div>

      {recipe.description && (
        <div className={styles.recipeDescription}>
          <p>{recipe.description}</p>
        </div>
      )}

      {recipe.tags && recipe.tags.length > 0 && (
        <div className={styles.recipeTags}>
          {recipe.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.recipeContent}>
        <div className={styles.tabButtons}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'ingredients' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Składniki
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'instructions' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            Przygotowanie
          </button>
          {recipe.nutritionalValues && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'nutritionalValues' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('nutritionalValues')}
            >
              Wartości odżywcze
            </button>
          )}
          {recipe.notes && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'notes' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              Notatki
            </button>
          )}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'ingredients' && (
            <div className={styles.ingredientsTab}>
              <h2>Składniki</h2>
              <ul className={styles.ingredientsList}>
                {Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className={styles.ingredientItem}>
                    <span className={styles.ingredientName}>
                      {ingredient.ingredient?.name || ingredient.name || ''}
                    </span>
                    <span className={styles.ingredientAmount}>
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </li>
                )) : <li>Brak składników</li>}
              </ul>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className={styles.instructionsTab}>
              <h2>Przygotowanie</h2>
              <ol className={styles.stepsList}>
                {Array.isArray(recipe.steps) ? recipe.steps.map((step, index) => (
                  <li key={index} className={styles.stepItem}>
                    <div className={styles.stepNumber}>{step.number}</div>
                    <div className={styles.stepDescription}>{step.description}</div>
                  </li>
                )) : <li>Brak kroków przygotowania</li>}
              </ol>
            </div>
          )}

          {activeTab === 'nutritionalValues' && recipe.nutritionalValues && (
            <div className={styles.nutritionTab}>
              <h2>Wartości odżywcze</h2>
              <div className={styles.nutritionInfo}>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Kalorie:</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.totalCalories || recipe.nutritionalValues.calories || '-'} kcal
                  </span>
                </div>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Węglowodany:</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.totalCarbs || '-'} g
                  </span>
                </div>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Węglowodany / porcja:</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.carbsPerServing || '-'} g
                  </span>
                </div>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Białko:</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.totalProtein || '-'} g
                  </span>
                </div>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Tłuszcz:</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.totalFat || '-'} g
                  </span>
                </div>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Błonnik:</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.totalFiber || '-'} g
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && recipe.notes && (
            <div className={styles.notesTab}>
              <h2>Notatki</h2>
              <div className={styles.notesContent}>
                {recipe.notes}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.recipeFooter}>
        <Link to="/recipes" className={styles.backButton}>
          ← Wróć do listy przepisów
        </Link>
      </div>
    </div>
  );
}

export default SingleRecipe; 
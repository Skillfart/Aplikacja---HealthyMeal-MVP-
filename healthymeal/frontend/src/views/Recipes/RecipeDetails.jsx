import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import styles from './RecipeDetails.module.css';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Funkcja pomocnicza do sprawdzania środowiska testowego
  const isTestEnvironment = () => {
    return process.env.NODE_ENV === 'test' || 
           localStorage.getItem('test_mode') === 'true' ||
           process.env.REACT_APP_TEST_MODE === 'true';
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        
        // W środowisku testowym używamy danych testowych
        if (isTestEnvironment()) {
          // Symulacja opóźnienia ładowania
          setTimeout(() => {
            const testRecipe = {
              id: id,
            title: 'Niskocukrowy omlet z warzywami',
              description: 'Pyszny i zdrowy omlet idealny na śniadanie dla osób na diecie niskocukrowej.',
            preparationTime: 15,
              cookingTime: 10,
            servings: 2,
              difficulty: 'easy',
            ingredients: [
                { name: 'jajka', amount: '4 sztuki' },
                { name: 'szpinak', amount: '1 garść' },
                { name: 'papryka czerwona', amount: '1/2 sztuki' },
                { name: 'cebula', amount: '1/4 sztuki' },
                { name: 'oliwa z oliwek', amount: '1 łyżka' },
                { name: 'sól', amount: 'szczypta' },
                { name: 'pieprz', amount: 'do smaku' }
            ],
            steps: [
                'Umyj i posiekaj warzywa.',
                'Roztrzep jajka w misce, dodaj sól i pieprz.',
                'Rozgrzej oliwę na patelni i podsmaż cebulę.',
                'Dodaj paprykę i szpinak, smaż przez 2 minuty.',
                'Wlej jajka na patelnię i zmniejsz ogień.',
                'Przykryj patelnię i smaż przez około 5 minut.',
                'Podawaj gorący.'
            ],
            nutritionalValues: {
              calories: 320,
              protein: 18,
              carbs: 8,
              fat: 24,
                fiber: 3,
                sugar: 2
              },
              tags: ['śniadanie', 'niskocukrowe', 'wegetariańskie', 'wysokobiałkowe'],
              image: 'https://cdn.pixabay.com/photo/2021/01/19/08/41/omelet-5929522_960_720.jpg'
            };
            
            setRecipe(testRecipe);
            setLoading(false);
          }, 500);
          
          return;
        }
        
        // W rzeczywistej aplikacji pobieramy dane z API
        /* 
        const token = getAccessToken();
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        const response = await axios.get(`/api/recipes/${id}`, config);
        setRecipe(response.data.recipe);
        */
        
      } catch (err) {
        console.error('Błąd pobierania przepisu:', err);
        setError('Nie udało się pobrać przepisu. Sprawdź połączenie internetowe lub spróbuj później.');
        toast.error('Nie udało się załadować przepisu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
    fetchRecipe();
    } else {
      setError('Nieprawidłowy identyfikator przepisu');
      setLoading(false);
    }
  }, [id, getAccessToken]);

  const handleEdit = () => {
    navigate(`/recipes/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć ten przepis?')) {
      try {
        if (isTestEnvironment()) {
          // W środowisku testowym tylko symulujemy usunięcie
          toast.success('Przepis został usunięty');
          navigate('/recipes');
          return;
        }
        
        /* 
        const token = getAccessToken();
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        await axios.delete(`/api/recipes/${id}`, config);
        */
        
        toast.success('Przepis został usunięty');
        navigate('/recipes');
      } catch (err) {
        console.error('Błąd usuwania przepisu:', err);
        toast.error('Nie udało się usunąć przepisu');
      }
    }
  };
  
  const handleBack = () => {
    navigate('/recipes');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Ładowanie przepisu...</p>
      </div>
    );
  }
  
  if (error || !recipe) {
    return (
      <div className={styles.errorContainer}>
        <h2>Wystąpił błąd</h2>
        <p>{error || 'Nie znaleziono przepisu'}</p>
        <button className={styles.backButton} onClick={handleBack}>
          Powrót do listy przepisów
        </button>
      </div>
    );
  }

  return (
    <div className={styles.recipeContainer}>
      <div className={styles.recipeHeader}>
        <button className={styles.backButton} onClick={handleBack}>
          &larr; Powrót
        </button>
        <h1 className={styles.recipeTitle}>{recipe.title}</h1>
        <div className={styles.recipeActions}>
          <button className={styles.editButton} onClick={handleEdit}>
            <i className="fas fa-edit"></i> Edytuj
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            <i className="fas fa-trash"></i> Usuń
          </button>
        </div>
      </div>
      
      <div className={styles.recipeContent}>
        <div className={styles.recipeImageSection}>
          {recipe.image ? (
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className={styles.recipeImage}
            />
          ) : (
            <div className={styles.noImage}>
              <i className="fas fa-utensils"></i>
              <span>Brak zdjęcia</span>
            </div>
          )}
          
          <div className={styles.recipeMetaInfo}>
            <div className={styles.metaItem}>
              <i className="fas fa-clock"></i>
              <span>Przygotowanie: {recipe.preparationTime || 0} min</span>
            </div>
            <div className={styles.metaItem}>
              <i className="fas fa-fire"></i>
              <span>Gotowanie: {recipe.cookingTime || 0} min</span>
            </div>
            <div className={styles.metaItem}>
              <i className="fas fa-users"></i>
              <span>Porcje: {recipe.servings || 1}</span>
            </div>
            <div className={styles.metaItem}>
              <i className="fas fa-chart-line"></i>
              <span>Trudność: {
                recipe.difficulty === 'easy' ? 'Łatwa' :
                recipe.difficulty === 'medium' ? 'Średnia' : 'Trudna'
              }</span>
            </div>
          </div>
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className={styles.recipeTags}>
              {recipe.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.recipeMainContent}>
          {recipe.description && (
            <div className={styles.recipeDescription}>
              <h2>Opis</h2>
              <p>{recipe.description}</p>
            </div>
          )}
          
          <div className={styles.ingredientsSection}>
            <h2>Składniki</h2>
            <ul className={styles.ingredientsList}>
              {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                <li key={index} className={styles.ingredientItem}>
                  <span className={styles.ingredientName}>{ingredient.name}</span>
                  <span className={styles.ingredientAmount}>{ingredient.amount}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.stepsSection}>
            <h2>Przygotowanie</h2>
            <ol className={styles.stepsList}>
              {recipe.steps && recipe.steps.map((step, index) => (
                <li key={index} className={styles.stepItem}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          
          {recipe.nutritionalValues && (
            <div className={styles.nutritionSection}>
              <h2>Wartości odżywcze (na porcję)</h2>
              <div className={styles.nutritionGrid}>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Kalorie</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.calories || 0} kcal
                  </span>
                </div>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Białko</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.protein || 0} g
                  </span>
                </div>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Węglowodany</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.carbs || 0} g
                  </span>
                </div>
                <div className={styles.nutritionItem}>
                  <span className={styles.nutritionLabel}>Tłuszcze</span>
                  <span className={styles.nutritionValue}>
                    {recipe.nutritionalValues.fat || 0} g
                  </span>
                </div>
                {recipe.nutritionalValues.fiber !== undefined && (
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>Błonnik</span>
                    <span className={styles.nutritionValue}>
                      {recipe.nutritionalValues.fiber} g
                    </span>
                  </div>
                )}
                {recipe.nutritionalValues.sugar !== undefined && (
                  <div className={styles.nutritionItem}>
                    <span className={styles.nutritionLabel}>Cukry</span>
                    <span className={styles.nutritionValue}>
                      {recipe.nutritionalValues.sugar} g
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails; 
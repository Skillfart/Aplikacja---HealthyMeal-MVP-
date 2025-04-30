import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { RecipeComparisonModal } from './RecipeComparisonModal';
import styles from './RecipeCompare.module.css';

const RecipeCompare = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [originalRecipe, setOriginalRecipe] = useState(null);
  const [modifiedRecipe, setModifiedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Pobierz wszystkie przepisy użytkownika
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'Token istnieje' : 'Brak tokenu');
        
        const response = await axios.get('/api/recipes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Odpowiedź API:', response);
        console.log('Dane przepisów:', response.data);
        
        // Sprawdź, czy odpowiedź ma strukturę z zagnieżdżoną tablicą przepisów
        const recipesData = response.data.recipes ? response.data.recipes : response.data;
        
        setRecipes(Array.isArray(recipesData) ? recipesData : []);
        console.log('Stan recipes po aktualizacji:', Array.isArray(recipesData) ? recipesData : []);
        
        // Sprawdź czy mamy parametr recipeId w URL
        const params = new URLSearchParams(location.search);
        const recipeId = params.get('recipeId');
        
        if (recipeId) {
          // Jeśli mamy ID przepisu w URL, zaznacz go
          const foundRecipe = recipesData.find(recipe => recipe._id === recipeId);
          if (foundRecipe) {
            setSelectedRecipes([foundRecipe]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Nie udało się pobrać przepisów.');
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [location]);

  const handleRecipeSelect = (recipe) => {
    // Jeśli przepis jest już wybrany, usuń go z listy
    if (selectedRecipes.find(selected => selected._id === recipe._id)) {
      setSelectedRecipes(selectedRecipes.filter(selected => selected._id !== recipe._id));
    } 
    // Jeśli nie mamy jeszcze 2 przepisów, dodaj go
    else if (selectedRecipes.length < 2) {
      setSelectedRecipes([...selectedRecipes, recipe]);
    }
    // Jeśli mamy już 2 przepisy, zastąp drugi
    else {
      setSelectedRecipes([selectedRecipes[0], recipe]);
    }
  };

  const handleCompare = () => {
    if (selectedRecipes.length !== 2) {
      setError('Wybierz dokładnie dwa przepisy do porównania.');
      return;
    }

    setOriginalRecipe(selectedRecipes[0]);
    setModifiedRecipe(selectedRecipes[1]);
    setShowModal(true);
  };

  const handleClose = () => {
    if (showModal) {
      setShowModal(false);
      setOriginalRecipe(null);
      setModifiedRecipe(null);
    } else {
      navigate('/dashboard/recipes');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Ładowanie przepisów...</div>;
  }

  if (error && !showModal) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>{error}</div>
        <button onClick={handleClose} className={styles.button}>
          Wróć do przepisów
        </button>
      </div>
    );
  }

  return (
    <div className={styles.compareContainer}>
      <h2>Porównywanie przepisów</h2>
      
      {showModal ? (
        <RecipeComparisonModal 
          originalRecipe={originalRecipe}
          modifiedRecipe={modifiedRecipe}
          onClose={handleClose}
          isOpen={true}
        />
      ) : (
        <>
          <div className={styles.recipeSelectContainer}>
            <p>Wybierz dwa przepisy do porównania (wybrano: {selectedRecipes.length}/2)</p>
            
            <div className={styles.recipeList}>
              {Array.isArray(recipes) && recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <div 
                    key={recipe._id}
                    className={`${styles.recipeCard} ${
                      selectedRecipes.find(selected => selected._id === recipe._id) ? styles.selected : ''
                    }`}
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    <h3>{recipe.title}</h3>
                    {recipe.image && <img src={recipe.image} alt={recipe.title} />}
                  </div>
                ))
              ) : (
                <div className={styles.noRecipes}>
                  <p>Nie znaleziono przepisów do porównania. Dodaj nowe przepisy, aby móc je porównać.</p>
                </div>
              )}
            </div>
            
            <div className={styles.buttonContainer}>
              <button 
                onClick={handleCompare} 
                className={styles.compareButton}
                disabled={selectedRecipes.length !== 2}
              >
                Porównaj wybrane przepisy
              </button>
              <button onClick={handleClose} className={styles.cancelButton}>
                Anuluj
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { RecipeCompare };
export default RecipeCompare; 
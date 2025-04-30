import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModifyRecipeWithAI from './ModifyRecipeWithAI';
import styles from './RecipeModify.module.css';

export const RecipeModify = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    const fetchRecipeAndPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Brak autoryzacji. Zaloguj się ponownie.');
          setLoading(false);
          return;
        }
        
        // Pobieranie przepisu
        let recipeData;
        try {
          const recipeResponse = await axios.get(`/api/recipes/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          recipeData = recipeResponse.data;
        } catch (recipeError) {
          console.error('Błąd podczas pobierania przepisu:', recipeError);
          if (recipeError.response?.status === 404) {
            setError('Przepis nie został znaleziony.');
          } else {
            setError('Nie udało się pobrać przepisu. ' + (recipeError.response?.data?.message || ''));
          }
          setLoading(false);
          return;
        }
        
        // Pobieranie preferencji użytkownika
        let prefsData;
        try {
          const prefsResponse = await axios.get('/api/users/preferences', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          prefsData = prefsResponse.data;
        } catch (prefsError) {
          console.error('Błąd podczas pobierania preferencji:', prefsError);
          // Kontynuujemy z domyślnymi preferencjami
          prefsData = {
            dietType: 'normal',
            maxCarbs: 0,
            excludedProducts: [],
            allergens: []
          };
        }
        
        setRecipe(recipeData);
        setPreferences(prefsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Nie udało się pobrać danych. Spróbuj ponownie później.');
        setLoading(false);
      }
    };

    fetchRecipeAndPreferences();
  }, [id]);

  const handleSaveModified = async (modifiedRecipe) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Brak autoryzacji. Zaloguj się ponownie.');
        return;
      }
      
      if (!modifiedRecipe) {
        setError('Brak danych do zapisania.');
        return;
      }
      
      // Upewnij się, że wszystkie wymagane pola są obecne
      if (!modifiedRecipe.title || !modifiedRecipe.ingredients || !modifiedRecipe.steps) {
        setError('Brakuje wymaganych pól w zmodyfikowanym przepisie.');
        return;
      }
      
      await axios.post('/api/recipes/modified', modifiedRecipe, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      navigate('/recipes/modified');
    } catch (err) {
      console.error('Error saving modified recipe:', err);
      setError('Nie udało się zapisać zmodyfikowanego przepisu: ' + 
        (err.response?.data?.message || err.message || 'Nieznany błąd'));
    }
  };

  const handleCancel = () => {
    navigate(`/recipes/${id}`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Ładowanie danych...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Wystąpił błąd</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/recipes')} 
          className={styles.backButton}
        >
          Wróć do przepisów
        </button>
      </div>
    );
  }

  if (!recipe || !preferences) {
    return (
      <div className={styles.notFound}>
        <h2>Nie znaleziono przepisu lub preferencji.</h2>
        <button 
          onClick={() => navigate('/recipes')} 
          className={styles.backButton}
        >
          Wróć do przepisów
        </button>
      </div>
    );
  }

  return (
    <ModifyRecipeWithAI 
      recipe={recipe}
      preferences={preferences}
      onSave={handleSaveModified}
      onCancel={handleCancel}
      recipeId={id}
    />
  );
}; 
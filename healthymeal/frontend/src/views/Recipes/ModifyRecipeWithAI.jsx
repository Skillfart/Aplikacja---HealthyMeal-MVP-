import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ModifyRecipeWithAI.module.css';
import RecipeCard from '../../components/Recipe/RecipeCard';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { toast } from 'react-toastify';

const ModifyRecipeWithAI = ({ recipe, preferences, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [aiUsageLoading, setAiUsageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modifiedRecipe, setModifiedRecipe] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [remainingCredits, setRemainingCredits] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Pobierz informacje o użyciu AI
    const fetchAiUsage = async () => {
      try {
        setAiUsageLoading(true);
        const response = await axios.get('/api/ai/usage');
        setAiUsage(response.data);
        setRemainingCredits(response.data.remainingCredits || 0);
        setAiUsageLoading(false);
      } catch (error) {
        console.error('Błąd podczas pobierania informacji o użyciu AI:', error);
        
        // Sprawdź czy błąd jest związany z autentykacją
        if (error.response && error.response.status === 401) {
          setError('Musisz być zalogowany, aby korzystać z funkcji AI');
          navigate('/login');
        } else if (error.response && error.response.status === 403) {
          setError('Brak uprawnień do korzystania z funkcji AI');
        } else {
          setError('Nie udało się pobrać informacji o dostępnych kredytach AI');
        }
        
        setAiUsageLoading(false);
      }
    };

    fetchAiUsage();
  }, [navigate]);

  const handleModifyRecipe = async () => {
    // Sprawdź czy użytkownik ma wystarczającą liczbę kredytów
    if (remainingCredits <= 0) {
      setError('Nie masz wystarczającej liczby kredytów AI. Skontaktuj się z administratorem, aby uzyskać więcej kredytów.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`/api/ai/modify/${recipe.id}`, {
        preferences: preferences
      });

      // Aktualizuj liczbę pozostałych kredytów
      if (response.data.aiUsage) {
        setRemainingCredits(response.data.aiUsage.remainingCredits || 0);
      }

      setModifiedRecipe(response.data.recipe);
      setLoading(false);
    } catch (error) {
      console.error('Błąd podczas modyfikacji przepisu:', error);
      
      let errorMessage = 'Wystąpił problem podczas modyfikacji przepisu.';
      
      if (error.response) {
        // Obsługa różnych kodów błędów
        switch(error.response.status) {
          case 400:
            errorMessage = 'Nieprawidłowe dane. Sprawdź preferencje i spróbuj ponownie.';
            break;
          case 401:
            errorMessage = 'Musisz być zalogowany, aby modyfikować przepisy.';
            navigate('/login');
            break;
          case 403:
            errorMessage = 'Brak uprawnień do modyfikacji tego przepisu.';
            break;
          case 404:
            errorMessage = 'Przepis nie został znaleziony.';
            break;
          case 429:
            errorMessage = 'Przekroczono limit zapytań AI. Spróbuj ponownie później.';
            break;
          case 500:
            errorMessage = 'Wewnętrzny błąd serwera. Spróbuj ponownie później.';
            break;
          default:
            if (error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            }
        }
      } else if (error.request) {
        errorMessage = 'Brak odpowiedzi z serwera. Sprawdź połączenie z internetem.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSaveModifiedRecipe = () => {
    if (modifiedRecipe) {
      onSave(modifiedRecipe);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleModifyRecipe();
  };

  return (
    <div className={styles.container}>
      {error && (
        <Alert variant="danger" className={styles.error}>
          <strong>Błąd: </strong>{error}
          <div className={styles.buttonContainer} style={{ marginTop: '10px' }}>
            <Button variant="warning" onClick={() => setError(null)}>
              Zamknij
            </Button>
            {error !== 'Nie masz wystarczającej liczby kredytów AI. Skontaktuj się z administratorem, aby uzyskać więcej kredytów.' && (
              <Button variant="primary" onClick={handleRetry}>
                Spróbuj ponownie
              </Button>
            )}
          </div>
        </Alert>
      )}

      {!aiUsageLoading && !error && (
        <div className={styles.aiUsageInfo}>
          <p>Pozostałe kredyty AI: <strong>{remainingCredits}</strong></p>
          {remainingCredits <= 3 && (
            <p className="text-warning">Uwaga: Masz mało kredytów AI. Każda modyfikacja przepisu zużywa jeden kredyt.</p>
          )}
        </div>
      )}

      <div className={styles.preferencesContainer}>
        <h4>Twoje preferencje zdrowotne:</h4>
        <ul>
          {preferences && Object.entries(preferences).map(([key, value]) => (
            <li key={key}>
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong>: {value.toString()}
            </li>
          ))}
        </ul>
      </div>

      {!modifiedRecipe && (
        <div className={styles.recipeContainer}>
          <h4>Oryginalny przepis:</h4>
          <RecipeCard recipe={recipe} isDetailed />
        </div>
      )}

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <h4>Modyfikuję przepis...</h4>
          <p className={styles.aiLoadingInfo}>
            Ten proces może potrwać do 30 sekund. Używamy sztucznej inteligencji,
            aby dostosować przepis do Twoich preferencji zdrowotnych.
          </p>
        </div>
      )}

      {modifiedRecipe && (
        <>
          <h3 className="text-center mt-4 mb-3">Porównanie przepisów</h3>
          <div className={styles.recipeComparisonContainer}>
            <div className={styles.originalRecipeColumn}>
              <h4>Przepis oryginalny:</h4>
              <RecipeCard recipe={recipe} isDetailed />
            </div>
            <div className={styles.modifiedRecipeColumn}>
              <h4>Przepis zmodyfikowany:</h4>
              <RecipeCard recipe={modifiedRecipe} isDetailed />
            </div>
          </div>
        </>
      )}

      <div className={styles.buttonContainer}>
        {!loading && !modifiedRecipe && (
          <>
            <Button
              className={styles.modifyButton}
              onClick={handleModifyRecipe}
              disabled={loading || aiUsageLoading || remainingCredits <= 0}
            >
              Zmodyfikuj przepis z AI
            </Button>
            <Button className={styles.cancelButton} onClick={onCancel} disabled={loading}>
              Anuluj
            </Button>
          </>
        )}

        {modifiedRecipe && (
          <>
            <Button
              className={styles.saveButton}
              onClick={handleSaveModifiedRecipe}
              disabled={loading}
            >
              Zapisz zmodyfikowany przepis
            </Button>
            <Button
              className={styles.modifyAgainButton}
              onClick={() => {
                setModifiedRecipe(null);
                handleModifyRecipe();
              }}
              disabled={loading || remainingCredits <= 0}
            >
              Zmodyfikuj ponownie
            </Button>
            <Button className={styles.cancelButton} onClick={onCancel} disabled={loading}>
              Anuluj
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ModifyRecipeWithAI; 
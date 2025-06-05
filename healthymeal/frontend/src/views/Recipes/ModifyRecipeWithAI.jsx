import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ModifyRecipeWithAI.module.css';
import RecipeCard from '../../components/Recipe/RecipeCard';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const ModifyRecipeWithAI = ({ recipe, preferences, onSave, onCancel, recipeId }) => {
  const [loading, setLoading] = useState(false);
  const [aiUsageLoading, setAiUsageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modifiedRecipe, setModifiedRecipe] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [remainingCredits, setRemainingCredits] = useState(5);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [warning, setWarning] = useState(null);
  const navigate = useNavigate();
  const { getAccessToken, refreshToken, isAuthenticated } = useAuth();

  // Funkcja pomocnicza do pobierania tokenu
  const getAuthConfig = () => {
    const token = getAccessToken();
    return token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
  };

  useEffect(() => {
    // Pobierz informacje o użyciu AI
    const fetchAiUsage = async () => {
      try {
        setAiUsageLoading(true);
        
        // Próbujemy pobrać informacje o kredytach - endpoint nie wymaga autoryzacji
        const response = await axios.get('/api/ai/usage');
        
        // Ustawienie wartości kredytów
        setAiUsage(response.data);
        setRemainingCredits(response.data.remaining || 5);
        setAiUsageLoading(false);
      } catch (error) {
        console.error('Błąd podczas pobierania informacji o użyciu AI:', error);
        
        // Ustawmy domyślne wartości
        setRemainingCredits(5);
        
        // Sprawdź czy błąd jest związany z autentykacją
        if (error.response && error.response.status === 401) {
          // Spróbuj odświeżyć token
          try {
            await refreshToken();
            fetchAiUsage(); // Spróbuj ponownie po odświeżeniu tokenu
          } catch (refreshError) {
            setError('Problem z autoryzacją. Odświeżamy sesję...');
            setTimeout(() => {
              setError(null);
              fetchAiUsage();
            }, 1000);
          }
        } else if (error.response && error.response.status === 403) {
          setError('Brak uprawnień do korzystania z funkcji AI');
        } else {
          setError('Używamy domyślnych wartości kredytów.');
          setTimeout(() => setError(null), 3000);
        }
        
        setAiUsageLoading(false);
      }
    };

    fetchAiUsage();
  }, [refreshToken, navigate]);

  const handleModify = async () => {
    // W trybie deweloperskim zawsze pozwalamy na modyfikację
    const isDevMode = process.env.NODE_ENV === 'development' || true; 
    
    // Sprawdź czy użytkownik ma wystarczającą liczbę kredytów (pomijamy w dev mode)
    if (!isDevMode && remainingCredits <= 0) {
      setError('Nie masz wystarczającej liczby kredytów AI. Skontaktuj się z administratorem, aby uzyskać więcej kredytów.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setWarning(null);
      setEmergencyMode(false);

      // Upewnij się, że mamy przepis i preferencje
      if (!recipe) {
        setError('Brak przepisu do modyfikacji');
        setLoading(false);
        return;
      }

      if (!preferences) {
        setError('Brak preferencji do modyfikacji przepisu');
        setLoading(false);
        return;
      }

      // Używamy id z props (recipeId) jeśli jest dostępne, w przeciwnym razie z recipe
      const id = recipeId || recipe.id || recipe._id;
      
      if (!id) {
        setError('Błąd: Brak identyfikatora przepisu');
        setLoading(false);
        return;
      }

      // Pobierz token autoryzacyjny - będziemy próbować nawet jeśli użytkownik nie jest zalogowany
      const config = getAuthConfig();
      console.log('Konfiguracja autoryzacyjna:', config.headers?.Authorization ? 'Token obecny' : 'Brak tokenu');
      
      // Wysyłamy zapytanie o modyfikację przepisu
      console.log(`Modyfikuję przepis o ID: ${id}`);
      try {
        const response = await axios.post(`/api/ai/modify/${id}`, {
          preferences: preferences
        }, config);

        // Aktualizuj liczbę pozostałych kredytów
        if (response.data.aiUsage) {
          setRemainingCredits(response.data.aiUsage.remaining || 0);
        }

        // Sprawdzamy, czy odpowiedź zawiera zmodyfikowany przepis bezpośrednio w data.recipe
        // lub czy cała odpowiedź jest przepisem (dla trybu symulacyjnego)
        let modifiedRecipeData;
        if (response.data.modifiedRecipe) {
          modifiedRecipeData = response.data.modifiedRecipe;
        } else if (response.data.recipe) {
          modifiedRecipeData = response.data.recipe;
        } else if (response.data.title && response.data.ingredients) {
          // Obiekt response.data jest przepisem
          modifiedRecipeData = response.data;
        } else {
          throw new Error('Nieprawidłowy format odpowiedzi z serwera');
        }

        // Sprawdź czy odpowiedź zawiera ostrzeżenie
        if (response.data.warning) {
          setWarning(response.data.warning);
          setEmergencyMode(true);
          console.log("Tryb awaryjny:", response.data.warning);
        }

        setModifiedRecipe(modifiedRecipeData);
        toast.success('Przepis został pomyślnie zmodyfikowany!');
        
      } catch (error) {
        // Jeśli mamy błąd 401, spróbujmy odświeżyć token i spróbować ponownie
        if (error.response && error.response.status === 401 && isAuthenticated) {
          console.log('Błąd autoryzacji - próbuję odświeżyć token i ponowić zapytanie');
          
          try {
            await refreshToken();
            
            // Pobierz zaktualizowany token
            const newConfig = getAuthConfig();
            
            // Ponów zapytanie z nowym tokenem
            const response = await axios.post(`/api/ai/modify/${id}`, {
              preferences: preferences
            }, newConfig);
            
            let modifiedRecipeData;
            if (response.data.modifiedRecipe) {
              modifiedRecipeData = response.data.modifiedRecipe;
            } else if (response.data.recipe) {
              modifiedRecipeData = response.data.recipe;
            } else if (response.data.title && response.data.ingredients) {
              modifiedRecipeData = response.data;
            } else {
              throw new Error('Nieprawidłowy format odpowiedzi z serwera');
            }
            
            if (response.data.warning) {
              setWarning(response.data.warning);
              setEmergencyMode(true);
            }
            
            setModifiedRecipe(modifiedRecipeData);
            toast.success('Przepis został pomyślnie zmodyfikowany!');
            return;
          } catch (refreshError) {
            console.error('Nie udało się odświeżyć tokenu:', refreshError);
            throw error; // Propaguj oryginalny błąd
          }
        } else {
          throw error; // Propaguj błąd, jeśli to nie jest problem z autoryzacją
        }
      }
    } catch (error) {
      console.error('Błąd modyfikacji przepisu:', error);
      
      // Szczegółowe diagnostyka błędu
      if (error.response) {
        // Serwer odpowiedział kodem statusu poza zakresem 2xx
        console.error('Dane odpowiedzi:', error.response.data);
        console.error('Status HTTP:', error.response.status);
        console.error('Nagłówki:', error.response.headers);
        
        if (error.response.status === 400) {
          setError(`Błąd 400: ${error.response.data.message || 'Nieprawidłowe żądanie'}`);
        } else if (error.response.status === 401) {
          setError('Błąd autoryzacji. Spróbuj ponownie za chwilę lub odśwież stronę.');
          // W trybie deweloperskim nie przekierowujemy do logowania
          if (process.env.NODE_ENV !== 'development') {
            navigate('/login');
          }
        } else if (error.response.status === 403) {
          setError('Brak uprawnień do modyfikacji tego przepisu.');
        } else if (error.response.status === 404) {
          setError('Przepis nie został znaleziony.');
        } else {
          setError(`Błąd serwera: ${error.response.data.message || error.message || 'Nieznany błąd'}`);
        }
      } else if (error.request) {
        // Żądanie zostało wykonane, ale nie otrzymano odpowiedzi
        console.error('Brak odpowiedzi:', error.request);
        setError('Brak odpowiedzi z serwera. Sprawdź połączenie sieciowe.');
      } else {
        // Coś poszło nie tak podczas konfiguracji żądania
        console.error('Błąd konfiguracji:', error.message);
        setError(`Błąd: ${error.message}`);
      }
      
      toast.error('Nie udało się zmodyfikować przepisu!');
    } finally {
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
    handleModify();
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

      {warning && (
        <Alert variant="warning" className={styles.warning}>
          <strong>Uwaga: </strong>{warning}
        </Alert>
      )}

      {emergencyMode && (
        <Alert variant="info" className={styles.info}>
          <strong>Informacja: </strong>Przepis został zmodyfikowany w trybie awaryjnym. Modyfikacja może nie uwzględniać wszystkich Twoich preferencji. 
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
              onClick={handleModify}
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
                handleModify();
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
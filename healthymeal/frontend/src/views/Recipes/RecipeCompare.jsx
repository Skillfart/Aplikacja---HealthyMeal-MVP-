import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './RecipeCompare.module.css';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useAuth } from '../../contexts/AuthContext';

const RecipeCompare = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);
  const { getAccessToken, refreshToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pobierz parametry z URL
  const queryParams = new URLSearchParams(location.search);
  const originalId = queryParams.get('originalId');
  const modifiedId = queryParams.get('modifiedId');
  
  // Funkcja pomocnicza do pobierania tokenu
  const getAuthConfig = () => {
    const token = getAccessToken();
    return token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
  };
  
  useEffect(() => {
    const fetchComparison = async () => {
      if (!originalId || !modifiedId) {
        setError('Brakujące identyfikatory przepisów do porównania');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const config = getAuthConfig();
        
        const response = await axios.get(`/api/recipes/compare?originalId=${originalId}&modifiedId=${modifiedId}`, config);
        setComparison(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Błąd podczas pobierania porównania przepisów:', err);
        
        // Sprawdź czy to błąd autoryzacji
        if (err.response && err.response.status === 401) {
          try {
            await refreshToken();
            const newConfig = getAuthConfig();
            const response = await axios.get(`/api/recipes/compare?originalId=${originalId}&modifiedId=${modifiedId}`, newConfig);
            setComparison(response.data);
          } catch (refreshErr) {
            setError('Problem z autoryzacją. Spróbuj zalogować się ponownie.');
            toast.error('Problem z autoryzacją. Spróbuj zalogować się ponownie.');
          }
        } else {
          setError(err.response?.data?.message || 'Wystąpił błąd podczas pobierania porównania przepisów');
          toast.error('Nie udało się pobrać porównania przepisów');
        }
        setLoading(false);
      }
    };
    
    fetchComparison();
  }, [originalId, modifiedId, getAccessToken, refreshToken]);
  
  const handleSaveModified = () => {
    // Przekieruj do widoku zmodyfikowanego przepisu
    navigate(`/recipes/${modifiedId}`);
  };
  
  const handleBack = () => {
    // Wróć do poprzedniej strony
    navigate(-1);
  };
  
  // Renderuj spinner podczas ładowania
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Ładowanie...</span>
        </Spinner>
        <p>Ładowanie porównania przepisów...</p>
      </div>
    );
  }
  
  // Renderuj komunikat błędu
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="secondary" onClick={handleBack}>
          Powrót
        </Button>
      </div>
    );
  }
  
  // Renderuj porównanie przepisów
  if (!comparison) {
    return (
      <div className={styles.errorContainer}>
        <Alert variant="warning">
          Nie znaleziono danych do porównania przepisów
        </Alert>
        <Button variant="secondary" onClick={handleBack}>
          Powrót
        </Button>
      </div>
    );
  }
  
  const { original, modified, changes } = comparison;
  
  // Funkcja pomocnicza do sprawdzania czy składnik został zmieniony
  const isIngredientChanged = (ingredientName) => {
    return changes.ingredients.some(change => 
      (change.original && change.original.name === ingredientName) || 
      (change.modified && change.modified.name === ingredientName)
    );
  };
  
  // Funkcja pomocnicza do znajdowania powodu zmiany składnika
  const getChangeReason = (ingredientName) => {
    const change = changes.ingredients.find(change => 
      (change.original && change.original.name === ingredientName) || 
      (change.modified && change.modified.name === ingredientName)
    );
    return change ? change.reason : '';
  };
  
  // Funkcja pomocnicza do obliczania procentowej zmiany wartości
  const calculatePercentChange = (oldValue, newValue) => {
    if (!oldValue || oldValue === 0) return 0;
    const change = ((newValue - oldValue) / oldValue) * 100;
    return change.toFixed(1);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Porównanie przepisów</h1>
        <div className={styles.nutritionChanges}>
          <div className={styles.carbsReduction}>
            <span className={styles.label}>Zmniejszenie węglowodanów:</span>
            <span className={styles.value}>
              {changes.nutritionalChanges.carbsReduction}%
            </span>
          </div>
          <div className={styles.caloriesReduction}>
            <span className={styles.label}>Zmniejszenie kalorii:</span>
            <span className={styles.value}>
              {changes.nutritionalChanges.caloriesReduction}%
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.summary}>
        <h3>Podsumowanie zmian:</h3>
        <p>{changes.summary}</p>
      </div>
      
      <div className={styles.recipesContainer}>
        {/* Oryginalny przepis */}
        <div className={styles.recipeColumn}>
          <div className={styles.recipeHeader}>
            <h2>Oryginalny przepis</h2>
            <h3>{original.title}</h3>
          </div>
          
          <div className={styles.recipeSection}>
            <h4>Składniki:</h4>
            <ul className={styles.ingredients}>
              {original.ingredients.map((ing, idx) => (
                <li 
                  key={`orig-ing-${idx}`}
                  className={isIngredientChanged(ing.ingredient.name) ? styles.changedIngredient : ''}
                >
                  {ing.quantity} {ing.unit} {ing.ingredient.name}
                  {isIngredientChanged(ing.ingredient.name) && (
                    <span className={styles.changeIndicator}>&#x2714;</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.recipeSection}>
            <h4>Przygotowanie:</h4>
            <ol className={styles.steps}>
              {original.steps.map((step, idx) => (
                <li key={`orig-step-${idx}`}>
                  {step.description}
                </li>
              ))}
            </ol>
          </div>
          
          <div className={styles.nutritionInfo}>
            <h4>Wartości odżywcze:</h4>
            <p>Kalorie: {original.nutritionalValues.totalCalories} kcal</p>
            <p>Węglowodany: {original.nutritionalValues.totalCarbs} g</p>
            <p>Białko: {original.nutritionalValues.totalProtein} g</p>
            <p>Tłuszcze: {original.nutritionalValues.totalFat} g</p>
          </div>
        </div>
        
        {/* Strzałki wskazujące zmiany */}
        <div className={styles.arrows}>
          {changes.ingredients.map((change, idx) => (
            <div 
              key={`arrow-${idx}`} 
              className={styles.arrow}
              style={{ 
                top: `${100 + idx * 40}px`,
                opacity: 0.8
              }}
              title={change.reason}
            >
              {change.original && change.modified ? "→" : change.original ? "✕" : "+"} 
              <span className={styles.arrowTooltip}>{change.reason}</span>
            </div>
          ))}
        </div>
        
        {/* Zmodyfikowany przepis */}
        <div className={styles.recipeColumn}>
          <div className={styles.recipeHeader}>
            <h2>Zmodyfikowany przepis</h2>
            <h3>{modified.title}</h3>
          </div>
          
          <div className={styles.recipeSection}>
            <h4>Składniki:</h4>
            <ul className={styles.ingredients}>
              {modified.ingredients.map((ing, idx) => {
                const isChanged = isIngredientChanged(ing.ingredient.name);
                const changeReason = getChangeReason(ing.ingredient.name);
                
                return (
                  <li 
                    key={`mod-ing-${idx}`}
                    className={isChanged ? styles.changedIngredient : ''}
                    title={changeReason}
                  >
                    {ing.quantity} {ing.unit} {ing.ingredient.name}
                    {isChanged && (
                      <span className={styles.changeIndicator} title={changeReason}>
                        &#x2714;
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className={styles.recipeSection}>
            <h4>Przygotowanie:</h4>
            <ol className={styles.steps}>
              {modified.steps.map((step, idx) => (
                <li key={`mod-step-${idx}`}>
                  {step.description}
                </li>
              ))}
            </ol>
          </div>
          
          <div className={styles.nutritionInfo}>
            <h4>Wartości odżywcze:</h4>
            <p>
              Kalorie: {modified.nutritionalValues.totalCalories} kcal 
              <span className={styles.changePercentage}>
                ({calculatePercentChange(
                  original.nutritionalValues.totalCalories, 
                  modified.nutritionalValues.totalCalories
                )}%)
              </span>
            </p>
            <p>
              Węglowodany: {modified.nutritionalValues.totalCarbs} g
              <span className={styles.changePercentage}>
                ({calculatePercentChange(
                  original.nutritionalValues.totalCarbs, 
                  modified.nutritionalValues.totalCarbs
                )}%)
              </span>
            </p>
            <p>Białko: {modified.nutritionalValues.totalProtein} g</p>
            <p>Tłuszcze: {modified.nutritionalValues.totalFat} g</p>
          </div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleBack}>
          Powrót
        </Button>
        <Button variant="primary" onClick={handleSaveModified}>
          Przejdź do zmodyfikowanego przepisu
        </Button>
      </div>
    </div>
  );
};

export default RecipeCompare; 
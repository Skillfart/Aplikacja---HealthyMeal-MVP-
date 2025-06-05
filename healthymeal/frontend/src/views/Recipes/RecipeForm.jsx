import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RecipeForm.module.css';

export const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [{ number: 1, description: '' }],
    preparationTime: '',
    difficulty: 'medium',
    servings: 1,
    tags: '',
    nutritionalValues: {
      totalCalories: 0,
      totalCarbs: 0,
      totalProtein: 0,
      totalFat: 0,
      totalFiber: 0,
      carbsPerServing: 0
    }
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  
  // Pobierz składniki z bazy danych
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/ingredients', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Odpowiedź API składników:', response.data);
        
        // Upewniamy się, że odpowiedź to tablica
        if (Array.isArray(response.data)) {
          setIngredients(response.data);
        } else if (response.data && Array.isArray(response.data.ingredients)) {
          setIngredients(response.data.ingredients);
        } else {
          console.error('Nieprawidłowy format odpowiedzi z API składników:', response.data);
          setIngredients([]);
        }
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        // Zamiast ustawiać błąd, inicjalizujemy pustą tablicę
        setIngredients([]);
      }
    };
    
    fetchIngredients();
  }, []);
  
  useEffect(() => {
    const fetchRecipe = async () => {
      if (isEditing) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`/api/recipes/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const recipe = response.data;
          setFormData({
            title: recipe.title,
            ingredients: recipe.ingredients.map(ing => ({
              name: ing.ingredient.name,
              quantity: ing.quantity,
              unit: ing.unit
            })),
            steps: recipe.steps,
            preparationTime: recipe.preparationTime || '',
            difficulty: recipe.difficulty || 'medium',
            servings: recipe.servings,
            tags: recipe.tags.join(', '),
            nutritionalValues: recipe.nutritionalValues
          });
          setLoading(false);
        } catch (err) {
          console.error('Error fetching recipe:', err);
          setError('Nie udało się pobrać przepisu do edycji.');
          setLoading(false);
        }
      }
    };
    
    fetchRecipe();
  }, [id, isEditing]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    // Nazwa pola jest w formacie "nutritionalValues.fieldName"
    const fieldName = name.split('.')[1];
    
    setFormData(prev => ({
      ...prev,
      nutritionalValues: {
        ...prev.nutritionalValues,
        [fieldName]: parseFloat(value) || 0
      }
    }));
  };
  
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };
  
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }));
  };
  
  const removeIngredient = (index) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };
  
  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      description: value
    };
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };
  
  const addStep = () => {
    const nextNumber = formData.steps.length + 1;
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { number: nextNumber, description: '' }]
    }));
  };
  
  const removeStep = (index) => {
    const newSteps = [...formData.steps];
    newSteps.splice(index, 1);
    
    // Aktualizacja numerów kroków
    const updatedSteps = newSteps.map((step, idx) => ({
      ...step,
      number: idx + 1
    }));
    
    setFormData(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };
  
  const handleReturn = () => {
    navigate('/recipes');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      // Sprawdzamy czy formData.ingredients jest tablicą
      if (!Array.isArray(formData.ingredients)) {
        console.error('formData.ingredients nie jest tablicą:', formData.ingredients);
        setError('Wystąpił błąd z formatem składników. Spróbuj ponownie.');
        setSubmitting(false);
        return;
      }
      
      // Sprawdzamy poprawność danych przed wysłaniem
      for (let i = 0; i < formData.ingredients.length; i++) {
        const ing = formData.ingredients[i];
        
        // Sprawdź czy składnik ma nazwę
        if (!ing.name || ing.name.trim() === '') {
          setError(`Nieprawidłowy format składnika na pozycji ${i+1}. Podaj nazwę lub ID składnika.`);
          setSubmitting(false);
          return;
        }

        // Usunięto walidację znaków specjalnych - zamiast tego sanityzujemy dane
        
        // Sprawdź czy składnik ma ilość
        if (ing.quantity === undefined || ing.quantity.toString().trim() === '') {
          setError(`Składnik '${ing.name}' musi mieć określoną ilość.`);
          setSubmitting(false);
          return;
        }
        
        // Sprawdź czy składnik ma jednostkę
        if (!ing.unit || ing.unit.trim() === '') {
          setError(`Składnik '${ing.name}' musi mieć określoną jednostkę.`);
          setSubmitting(false);
          return;
        }
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nie jesteś zalogowany. Zaloguj się i spróbuj ponownie.');
        setSubmitting(false);
        return;
      }
      
      // Funkcja do sanityzacji nazwy składnika - usuwa znaki specjalne
      const sanitizeIngredientName = (name) => {
        if (!name) return '';
        // Usuwamy wszystkie znaki specjalne oprócz liter, cyfr, myślników i spacji
        // Zachowujemy polskie znaki diakrytyczne
        return name.trim()
          .replace(/[^\p{L}\p{N}\s-]/gu, '')
          .toLowerCase();
      };
      
      // Przygotowanie listy składników w poprawnym formacie
      const preparedIngredients = [];
      
      for (const ing of formData.ingredients) {
        if (!ing || typeof ing !== 'object') {
          console.error('Nieprawidłowy obiekt składnika:', ing);
          setError('Nieprawidłowy format składnika. Spróbuj ponownie.');
          setSubmitting(false);
          return;
        }
        
        const ingredientName = ing.name ? sanitizeIngredientName(ing.name) : '';
        
        // Przywracamy strukturę wymaganą przez backend, ale bez _id
        preparedIngredients.push({
          ingredient: { 
            name: ingredientName
            // bez pola _id, które powoduje problemy
          },
          quantity: parseFloat(ing.quantity) || 0,
          unit: ing.unit.trim(),
          isOptional: false
        });
      }
      
      // Przygotowanie kroków w poprawnym formacie
      const preparedSteps = [];
      for (let i = 0; i < formData.steps.length; i++) {
        preparedSteps.push({
          number: i + 1,
          description: formData.steps[i].description.trim()
        });
      }
      
      // Przygotowanie tagów w poprawnym formacie
      let preparedTags = [];
      if (formData.tags) {
        preparedTags = formData.tags.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
      
      // Przygotowanie danych do wysłania
      const preparedData = {
        title: formData.title.trim(),
        ingredients: preparedIngredients,
        steps: preparedSteps,
        preparationTime: parseInt(formData.preparationTime) || 0,
        difficulty: formData.difficulty || 'medium',
        servings: parseInt(formData.servings) || 1,
        tags: preparedTags,
        description: '',
        nutritionalValues: formData.nutritionalValues
      };
      
      console.log('Wysyłane dane (zmodyfikowane):', JSON.stringify(preparedData, null, 2));
      console.log('Szczegóły składników (uproszczone):', JSON.stringify(preparedIngredients, null, 2));
      
      let response;
      if (isEditing) {
        response = await axios.put(`/api/recipes/${id}`, preparedData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        console.log('Wysyłam dane do /api/recipes:', JSON.stringify(preparedData, null, 2));
        
        response = await axios.post('/api/recipes', preparedData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          timeout: 10000 // Dodano timeout 10 sekund
        });
      }
      console.log('Odpowiedź serwera:', response.data);
      navigate('/recipes');
    } catch (err) {
      console.error('Error saving recipe:', err);
      if (err.response) {
        console.error('Status błędu:', err.response.status);
        console.error('Dane odpowiedzi:', err.response.data);
        console.error('Pełna treść odpowiedzi:', JSON.stringify(err.response, null, 2));
        
        // Obsługa różnych formatów błędów z serwera
        if (err.response.data && err.response.data.message) {
          setError(`Wystąpił błąd podczas zapisywania przepisu: ${err.response.data.message}`);
        } else if (err.response.data && err.response.data.error) {
          setError(`Wystąpił błąd: ${err.response.data.error}`);
        } else if (typeof err.response.data === 'string') {
          setError(`Błąd: ${err.response.data}`);
        } else {
          setError(`Wystąpił błąd podczas zapisywania przepisu (kod: ${err.response.status}). 
                   Sprawdź poprawność danych i spróbuj ponownie.`);
        }
      } else {
        console.error('Pełny błąd:', err);
        setError('Wystąpił błąd podczas zapisywania przepisu. Sprawdź połączenie z serwerem.');
      }
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className={styles.loading}>Ładowanie...</div>;
  }
  
  return (
    <div className={styles.formWrapper}>
      <div className={styles.navBar}>
        <button 
          onClick={handleReturn} 
          className={styles.backButton}
        >
          ← Powrót do przepisów
        </button>
      </div>
      
      <div className={styles.formContainer}>
        <h2>{isEditing ? 'Edytuj przepis' : 'Dodaj nowy przepis'}</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <h3>Podstawowe informacje</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">Tytuł przepisu</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={styles.fullWidth}
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="preparationTime">Czas przygotowania (min)</label>
                <input
                  id="preparationTime"
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="difficulty">Poziom trudności</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Łatwy</option>
                  <option value="medium">Średni</option>
                  <option value="hard">Trudny</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="servings">Ilość porcji</label>
                <input
                  id="servings"
                  type="number"
                  name="servings"
                  min="1"
                  value={formData.servings}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h3>Składniki</h3>
            {Array.isArray(formData.ingredients) ? formData.ingredients.map((ingredient, index) => (
              <div key={index} className={styles.ingredientRow}>
                <div className={styles.ingredientName}>
                  <input
                    type="text"
                    placeholder="Nazwa składnika"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    required
                    list="ingredients-list"
                  />
                </div>
                <div className={styles.ingredientQuantity}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ilość"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.ingredientUnit}>
                  <input
                    type="text"
                    placeholder="Jednostka"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="button" 
                  className={styles.removeButton}
                  onClick={() => removeIngredient(index)}
                  disabled={formData.ingredients.length <= 1}
                >
                  Usuń
                </button>
              </div>
            )) : (
              <div className={styles.error}>Błąd: Brak poprawnej listy składników</div>
            )}
            <datalist id="ingredients-list">
              {Array.isArray(ingredients) ? ingredients.map(ing => (
                <option key={ing._id} value={ing.name} />
              )) : null}
            </datalist>
            <button 
              type="button" 
              className={styles.addButton}
              onClick={addIngredient}
            >
              + Dodaj składnik
            </button>
          </div>
          
          <div className={styles.formSection}>
            <h3>Kroki przygotowania</h3>
            {Array.isArray(formData.steps) ? formData.steps.map((step, index) => (
              <div key={index} className={styles.stepRow}>
                <span className={styles.stepNumber}>{step.number}.</span>
                <textarea
                  placeholder="Opis kroku"
                  value={step.description}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  required
                  className={styles.stepDescription}
                />
                <button 
                  type="button" 
                  className={styles.removeButton}
                  onClick={() => removeStep(index)}
                  disabled={formData.steps.length <= 1}
                >
                  Usuń
                </button>
              </div>
            )) : (
              <div className={styles.error}>Błąd: Brak poprawnej listy kroków</div>
            )}
            <button 
              type="button" 
              className={styles.addButton}
              onClick={addStep}
            >
              + Dodaj krok
            </button>
          </div>
          
          <div className={styles.formSection}>
            <h3>Dodatkowe informacje</h3>
            <div className={styles.formGroup}>
              <label htmlFor="tags">Tagi (oddzielone przecinkami)</label>
              <input
                id="tags"
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="np. obiad, wegetariański, szybki"
                className={styles.fullWidth}
              />
            </div>
            
            <h4>Wartości odżywcze</h4>
            <div className={styles.nutritionGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="totalCalories">Kalorie (kcal)</label>
                <input
                  id="totalCalories"
                  type="number"
                  name="nutritionalValues.totalCalories"
                  value={formData.nutritionalValues.totalCalories}
                  onChange={handleNutritionChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="totalCarbs">Węglowodany (g)</label>
                <input
                  id="totalCarbs"
                  type="number"
                  name="nutritionalValues.totalCarbs"
                  value={formData.nutritionalValues.totalCarbs}
                  onChange={handleNutritionChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="totalProtein">Białko (g)</label>
                <input
                  id="totalProtein"
                  type="number"
                  name="nutritionalValues.totalProtein"
                  value={formData.nutritionalValues.totalProtein}
                  onChange={handleNutritionChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="totalFat">Tłuszcz (g)</label>
                <input
                  id="totalFat"
                  type="number"
                  name="nutritionalValues.totalFat"
                  value={formData.nutritionalValues.totalFat}
                  onChange={handleNutritionChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="totalFiber">Błonnik (g)</label>
                <input
                  id="totalFiber"
                  type="number"
                  name="nutritionalValues.totalFiber"
                  value={formData.nutritionalValues.totalFiber}
                  onChange={handleNutritionChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="carbsPerServing">Węglowodany / porcja (g)</label>
                <input
                  id="carbsPerServing"
                  type="number"
                  name="nutritionalValues.carbsPerServing"
                  value={formData.nutritionalValues.carbsPerServing}
                  onChange={handleNutritionChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={handleReturn} 
              className={styles.cancelButton}
              disabled={submitting}
            >
              Anuluj
            </button>
            <button 
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? 'Zapisywanie...' : (isEditing ? 'Zapisz zmiany' : 'Dodaj przepis')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm; 
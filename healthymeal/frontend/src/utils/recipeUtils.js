/**
 * Funkcje pomocnicze do operacji na przepisach
 */

/**
 * Oblicza całkowity czas przygotowania przepisu
 * @param {number} prepTime - czas przygotowania w minutach
 * @param {number} cookTime - czas gotowania w minutach
 * @returns {number} - całkowity czas przygotowania w minutach
 */
export const calculateTotalTime = (prepTime, cookTime) => {
  const prep = prepTime ? parseInt(prepTime, 10) : 0;
  const cook = cookTime ? parseInt(cookTime, 10) : 0;
  return prep + cook;
};

/**
 * Formatuje czas przygotowania do wyświetlenia
 * @param {number} minutes - czas w minutach
 * @returns {string} - sformatowany czas (np. "1h 15min" lub "30min")
 */
export const formatCookingTime = (minutes) => {
  if (!minutes || minutes <= 0) return "0min";
  
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hrs > 0) {
    return `${hrs}h${mins > 0 ? ' ' + mins + 'min' : ''}`;
  }
  
  return `${mins}min`;
};

/**
 * Formatuje składniki przepisu do czytelnej postaci
 * @param {Array} ingredients - tablica składników
 * @returns {Array} - tablica sformatowanych składników
 */
export const formatIngredients = (ingredients) => {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  
  return ingredients.map(ing => {
    const name = ing.ingredient?.name || ing.name || '';
    const amount = ing.amount || 0;
    const unit = ing.unit || '';
    
    if (!unit) return name;
    if (!name) return `${amount}${unit}`;
    
    return `${amount}${unit} ${name}`;
  });
};

/**
 * Oblicza wartości odżywcze na porcję
 * @param {Object} nutritionalValues - wartości odżywcze całego przepisu
 * @param {number} servings - liczba porcji
 * @returns {Object} - wartości odżywcze na porcję
 */
export const calculateNutritionalValuesPerServing = (nutritionalValues, servings) => {
  if (!nutritionalValues || !servings || servings <= 0) return {};
  
  const result = {};
  const serv = parseInt(servings, 10);
  
  for (const [key, value] of Object.entries(nutritionalValues)) {
    if (typeof value === 'number') {
      result[key] = Math.round((value / serv) * 10) / 10;
    }
  }
  
  return result;
};

/**
 * Ocenia poziom trudności przepisu
 * @param {Object} recipe - dane przepisu
 * @returns {string} - poziom trudności (easy, medium, hard)
 */
export const assessRecipeDifficulty = (recipe) => {
  // Brak danych lub nieprawidłowe dane
  if (!recipe) return 'easy';
  
  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];
  const prepTime = recipe.prepTime || 0;
  const cookTime = recipe.cookTime || 0;
  const totalTime = calculateTotalTime(prepTime, cookTime);
  
  // Prosty algorytm oceny trudności
  if (ingredients.length <= 5 && steps.length <= 4 && totalTime <= 30) {
    return 'easy';
  } else if (ingredients.length >= 10 || steps.length >= 8 || totalTime >= 120) {
    return 'hard';
  }
  
  return 'medium';
};

/**
 * Funkcja walidująca poprawność danych przepisu
 * @param {Object} recipe - dane przepisu
 * @returns {Object} - wynik walidacji {isValid: boolean, errors: Array}
 */
export const validateRecipe = (recipe) => {
  const errors = [];
  
  if (!recipe.title || recipe.title.trim() === '') {
    errors.push('Tytuł jest wymagany');
  }
  
  if (!recipe.ingredients) {
    errors.push('Składniki są wymagane');
  } else if (!Array.isArray(recipe.ingredients)) {
    errors.push('Składniki muszą być listą');
  } else if (recipe.ingredients.length === 0) {
    errors.push('Przepis musi zawierać co najmniej jeden składnik');
  }
  
  if (!recipe.steps) {
    errors.push('Kroki przygotowania są wymagane');
  } else if (!Array.isArray(recipe.steps)) {
    errors.push('Kroki muszą być listą');
  } else if (recipe.steps.length === 0) {
    errors.push('Przepis musi zawierać co najmniej jeden krok przygotowania');
  }
  
  if (recipe.servings !== undefined && (!Number.isInteger(recipe.servings) || recipe.servings <= 0)) {
    errors.push('Liczba porcji musi być liczbą większą od zera');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 
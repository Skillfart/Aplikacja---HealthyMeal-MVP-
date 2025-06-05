/**
 * Funkcje do filtrowania i wyszukiwania przepisów
 */

/**
 * Pomocnicza funkcja do obliczania całkowitego czasu przygotowania
 * @param {Object} recipe - Przepis
 * @returns {number} Całkowity czas w minutach
 */
const calculateTotalTime = (recipe) => {
  const prepTime = recipe.prepTime || 0;
  const cookTime = recipe.cookTime || 0;
  
  return parseInt(prepTime, 10) + parseInt(cookTime, 10);
};

/**
 * Główna funkcja do filtrowania przepisów
 * @param {Array} recipes - Lista przepisów
 * @param {Object} filters - Obiekt z filtrami
 * @param {Array} filters.tags - Lista tagów
 * @param {string} filters.difficulty - Poziom trudności
 * @param {number} filters.maxPreparationTime - Maksymalny czas przygotowania
 * @param {number} filters.maxCarbs - Maksymalna ilość węglowodanów
 * @returns {Array} Przefiltrowana lista przepisów
 */
export const filterRecipes = (recipes, filters = {}) => {
  if (!recipes || !Array.isArray(recipes)) {
    return [];
  }

  return recipes.filter(recipe => {
    // Filtrowanie po tagach
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = recipe.tags?.some(tag => 
        filters.tags.includes(tag.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }

    // Filtrowanie po trudności
    if (filters.difficulty) {
      if (recipe.difficulty !== filters.difficulty) return false;
    }

    // Filtrowanie po czasie przygotowania
    if (filters.maxPreparationTime) {
      if (recipe.preparationTime > filters.maxPreparationTime) return false;
    }

    // Filtrowanie po węglowodanach
    if (filters.maxCarbs) {
      if (recipe.nutritionalValues?.carbsPerServing > filters.maxCarbs) return false;
    }

    return true;
  });
};

/**
 * Filtruje przepisy według typu diety
 * @param {Array} recipes - Lista przepisów
 * @param {string} dietType - Typ diety do filtrowania
 * @returns {Array} Przefiltrowana lista przepisów
 */
export const filterRecipesByDiet = (recipes, dietType) => {
  if (!recipes || !Array.isArray(recipes)) {
    return [];
  }
  
  if (!dietType) {
    return recipes;
  }
  
  return recipes.filter(recipe => recipe.dietType === dietType);
};

/**
 * Filtruje przepisy według zawieranych składników
 * @param {Array} recipes - Lista przepisów
 * @param {Array} ingredients - Lista nazw składników
 * @returns {Array} Przefiltrowana lista przepisów
 */
export const filterRecipesByIngredients = (recipes, ingredients) => {
  if (!recipes || !Array.isArray(recipes)) {
    return [];
  }
  
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return recipes;
  }
  
  return recipes.filter(recipe => {
    // Sprawdź czy przepis zawiera wszystkie podane składniki
    return ingredients.every(ingredient => {
      return recipe.ingredients && recipe.ingredients.some(recipeIngredient => {
        const ingredientName = recipeIngredient.ingredient?.name || recipeIngredient.name;
        return ingredientName && ingredientName.toLowerCase().includes(ingredient.toLowerCase());
      });
    });
  });
};

/**
 * Filtruje przepisy według poziomu trudności
 * @param {Array} recipes - Lista przepisów
 * @param {string} difficulty - Poziom trudności (easy, medium, hard)
 * @returns {Array} Przefiltrowana lista przepisów
 */
export const filterRecipesByDifficulty = (recipes, difficulty) => {
  if (!recipes || !Array.isArray(recipes)) {
    return [];
  }
  
  if (!difficulty) {
    return recipes;
  }
  
  return recipes.filter(recipe => recipe.difficulty === difficulty);
};

/**
 * Filtruje przepisy według maksymalnego czasu przygotowania
 * @param {Array} recipes - Lista przepisów
 * @param {number} maxTime - Maksymalny czas w minutach
 * @returns {Array} Przefiltrowana lista przepisów
 */
export const filterRecipesByTime = (recipes, maxTime) => {
  if (!recipes || !Array.isArray(recipes)) {
    return [];
  }
  
  if (!maxTime || typeof maxTime !== 'number') {
    return recipes;
  }
  
  return recipes.filter(recipe => calculateTotalTime(recipe) <= maxTime);
};

/**
 * Wyszukuje przepisy według frazy w nazwie lub składnikach
 * @param {Array} recipes - Lista przepisów
 * @param {string} query - Fraza do wyszukania
 * @returns {Array} Lista pasujących przepisów
 */
export const searchRecipes = (recipes, query) => {
  if (!recipes || !Array.isArray(recipes)) {
    return [];
  }
  
  if (!query) {
    return recipes;
  }
  
  const normalizedQuery = query.toLowerCase();
  
  return recipes.filter(recipe => {
    // Sprawdź czy fraza jest w tytule
    if (recipe.title && recipe.title.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Sprawdź czy fraza jest w składnikach
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      return recipe.ingredients.some(ingredient => {
        const ingredientName = ingredient.ingredient?.name || ingredient.name;
        return ingredientName && ingredientName.toLowerCase().includes(normalizedQuery);
      });
    }
    
    return false;
  });
}; 
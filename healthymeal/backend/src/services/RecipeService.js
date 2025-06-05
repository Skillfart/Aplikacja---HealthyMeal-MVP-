const RecipeRepository = require('../repositories/RecipeRepository');
const { NotFoundError } = require('../repositories/BaseRepository');
const { validateRecipe } = require('../validators/recipeValidator');

class RecipeService {
  constructor() {
    this.repository = new RecipeRepository();
  }

  async getAllRecipes() {
    return this.repository.findAll();
  }

  async getRecipeById(id) {
    const recipe = await this.repository.findById(id);
    if (!recipe) {
      throw new NotFoundError(`Przepis o ID ${id} nie został znaleziony`);
    }
    return recipe;
  }

  async createRecipe(data) {
    // Walidacja danych
    const validationErrors = validateRecipe(data);
    if (validationErrors.length > 0) {
      const error = new Error('Błąd walidacji');
      error.name = 'ValidationError';
      error.details = validationErrors;
      throw error;
    }

    // Obliczanie wartości odżywczych
    if (data.ingredients) {
      data.nutritionalValues = this.calculateNutritionalValues(data.ingredients);
    }

    return this.repository.create(data);
  }

  async updateRecipe(id, data) {
    // Sprawdzenie czy przepis istnieje
    await this.getRecipeById(id);

    // Walidacja danych
    const validationErrors = validateRecipe(data);
    if (validationErrors.length > 0) {
      const error = new Error('Błąd walidacji');
      error.name = 'ValidationError';
      error.details = validationErrors;
      throw error;
    }

    // Aktualizacja wartości odżywczych
    if (data.ingredients) {
      data.nutritionalValues = this.calculateNutritionalValues(data.ingredients);
    }

    return this.repository.update(id, data);
  }

  async deleteRecipe(id) {
    // Sprawdzenie czy przepis istnieje
    await this.getRecipeById(id);
    await this.repository.delete(id);
  }

  calculateNutritionalValues(ingredients) {
    // Implementacja obliczania wartości odżywczych na podstawie składników
    const nutritionalValues = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    ingredients.forEach(ingredient => {
      // Tutaj dodać logikę obliczania wartości odżywczych
      // na podstawie bazy danych składników
    });

    return nutritionalValues;
  }
}

module.exports = RecipeService; 
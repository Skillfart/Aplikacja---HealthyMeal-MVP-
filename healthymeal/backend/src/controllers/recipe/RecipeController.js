const { NotFoundError } = require('../../errors/BaseError');
const RecipeService = require('./RecipeService');
const { validateRequest } = require('../../middleware/validation/validateRequest');
const {
  createRecipeSchema,
  updateRecipeSchema,
  getRecipeSchema,
  deleteRecipeSchema,
  listRecipesSchema,
} = require('../../validators/schemas/recipe.schema');
const logger = require('../../utils/logger');

class RecipeController {
  constructor() {
    this.recipeService = new RecipeService();
  }

  // Pobierz przepis dnia (najnowszy przepis)
  getRecipeOfDay = async (req, res, next) => {
    try {
      const recipe = await this.recipeService.getRecipeOfDay(req.user.id);
      res.json(recipe);
    } catch (error) {
      logger.error('Błąd podczas pobierania przepisu dnia:', error);
      next(error);
    }
  };

  // Pobierz ostatnie przepisy
  getRecentRecipes = async (req, res, next) => {
    try {
      const { limit = 5 } = req.query;
      const recipes = await this.recipeService.getRecentRecipes(req.user.id, parseInt(limit));
      res.json(recipes);
    } catch (error) {
      logger.error('Błąd podczas pobierania ostatnich przepisów:', error);
      next(error);
    }
  };

  // Lista wszystkich przepisów
  listRecipes = async (req, res, next) => {
    try {
      validateRequest(listRecipesSchema, req);
      const { recipes, pagination } = await this.recipeService.listRecipes(req.query, req.user.id);
      res.json({ data: recipes, pagination });
    } catch (error) {
      logger.error('Błąd podczas pobierania listy przepisów:', error);
      next(error);
    }
  };

  // Pobierz pojedynczy przepis
  getRecipe = async (req, res, next) => {
    try {
      validateRequest(getRecipeSchema, req);
      const recipe = await this.recipeService.getRecipeById(req.params.id, req.user.id);
      if (!recipe) {
        throw new NotFoundError('Przepis nie został znaleziony');
      }
      res.json({ data: recipe });
    } catch (error) {
      logger.error('Błąd podczas pobierania przepisu:', error);
      next(error);
    }
  };

  // Utwórz nowy przepis
  createRecipe = async (req, res, next) => {
    try {
      validateRequest(createRecipeSchema, req);
      const recipe = await this.recipeService.createRecipe({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json({ data: recipe });
    } catch (error) {
      logger.error('Błąd podczas tworzenia przepisu:', error);
      next(error);
    }
  };

  // Aktualizuj przepis
  updateRecipe = async (req, res, next) => {
    try {
      validateRequest(updateRecipeSchema, req);
      const recipe = await this.recipeService.updateRecipe(
        req.params.id,
        req.body,
        req.user.id
      );
      if (!recipe) {
        throw new NotFoundError('Przepis nie został znaleziony');
      }
      res.json({ data: recipe });
    } catch (error) {
      logger.error('Błąd podczas aktualizacji przepisu:', error);
      next(error);
    }
  };

  // Usuń przepis
  deleteRecipe = async (req, res, next) => {
    try {
      validateRequest(deleteRecipeSchema, req);
      await this.recipeService.deleteRecipe(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Błąd podczas usuwania przepisu:', error);
      next(error);
    }
  };

  // Porównaj przepisy (oryginalny vs zmodyfikowany)
  compareRecipes = async (req, res, next) => {
    try {
      const { originalId, modifiedId } = req.params;
      const comparison = await this.recipeService.compareRecipes(originalId, modifiedId, req.user.id);
      res.json(comparison);
    } catch (error) {
      logger.error('Błąd podczas porównywania przepisów:', error);
      next(error);
    }
  };
}

module.exports = new RecipeController(); 
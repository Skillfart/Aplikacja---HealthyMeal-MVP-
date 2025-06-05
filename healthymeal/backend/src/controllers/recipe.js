const Recipe = require('../models/Recipe');
const ModifiedRecipe = require('../models/ModifiedRecipe');
const Ingredient = require('../models/Ingredient');
const logger = require('../utils/logger');
const { validateRecipe } = require('../validators/recipeValidator');
const { generateRecipeModification } = require('../services/aiService');
const cache = require('../utils/cache');

class RecipeController {
  /**
   * Pobierz listę przepisów z filtrowaniem
   */
  async getRecipes(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = '-createdAt',
        difficulty,
        maxCarbs,
        tags,
        search
      } = req.query;

      const query = { isDeleted: false };

      // Filtrowanie po trudności
      if (difficulty) {
        query.difficulty = difficulty;
      }

      // Filtrowanie po maksymalnej ilości węglowodanów
      if (maxCarbs) {
        query['nutritionalValues.carbsPerServing'] = { $lte: parseFloat(maxCarbs) };
      }

      // Filtrowanie po tagach
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $all: tagArray };
      }

      // Wyszukiwanie po tekście
      if (search) {
        query.$text = { $search: search };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: {
          path: 'ingredients.ingredient',
          select: 'name nutritionalValues'
        }
      };

      const recipes = await Recipe.paginate(query, options);

      res.json({
        recipes: recipes.docs,
        totalPages: recipes.totalPages,
        currentPage: recipes.page,
        totalRecipes: recipes.totalDocs
      });
    } catch (error) {
      logger.error('Error fetching recipes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Pobierz szczegóły przepisu
   */
  async getRecipe(req, res) {
    try {
      const recipe = await Recipe.findOne({
        _id: req.params.id,
        isDeleted: false
      }).populate('ingredients.ingredient', 'name nutritionalValues');

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      res.json(recipe);
    } catch (error) {
      logger.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Utwórz nowy przepis
   */
  async createRecipe(req, res) {
    try {
      const { error } = validateRecipe(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const recipe = new Recipe({
        ...req.body,
        user: {
          _id: req.user._id,
          email: req.user.email
        }
      });

      await recipe.calculateNutritionalValues();
      await recipe.save();

      res.status(201).json(recipe);
    } catch (error) {
      logger.error('Error creating recipe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Zaktualizuj przepis
   */
  async updateRecipe(req, res) {
    try {
      const { error } = validateRecipe(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const recipe = await Recipe.findOne({
        _id: req.params.id,
        'user._id': req.user._id,
        isDeleted: false
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      Object.assign(recipe, req.body);
      await recipe.calculateNutritionalValues();
      await recipe.save();

      res.json(recipe);
    } catch (error) {
      logger.error('Error updating recipe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Usuń przepis (soft delete)
   */
  async deleteRecipe(req, res) {
    try {
      const recipe = await Recipe.findOne({
        _id: req.params.id,
        'user._id': req.user._id,
        isDeleted: false
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      await recipe.softDelete();
      res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      logger.error('Error deleting recipe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Zmodyfikuj przepis za pomocą AI
   */
  async modifyRecipe(req, res) {
    try {
      const { dietType, maxCarbs } = req.body;

      const recipe = await Recipe.findOne({
        _id: req.params.id,
        isDeleted: false
      }).populate('ingredients.ingredient');

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Sprawdź limit użycia AI
      if (req.user.aiUsage.count >= req.user.aiUsage.limit) {
        return res.status(429).json({ error: 'AI usage limit exceeded' });
      }

      // Sprawdź cache
      const cacheKey = `recipe:${recipe._id}:modification:${dietType}:${maxCarbs}`;
      const cachedModification = await cache.get(cacheKey);

      if (cachedModification) {
        return res.json(JSON.parse(cachedModification));
      }

      // Generuj modyfikację przepisu
      const modification = await generateRecipeModification(recipe, {
        dietType,
        maxCarbs,
        userPreferences: req.user.preferences
      });

      // Zapisz zmodyfikowany przepis
      const modifiedRecipe = new ModifiedRecipe({
        originalRecipe: {
          _id: recipe._id,
          title: recipe.title
        },
        user: {
          _id: req.user._id,
          email: req.user.email
        },
        ...modification
      });

      await modifiedRecipe.calculateNutritionalValues(recipe);
      await modifiedRecipe.save();

      // Aktualizuj licznik użycia AI
      req.user.aiUsage.count += 1;
      await req.user.save();

      // Zapisz w cache
      await cache.set(cacheKey, JSON.stringify(modifiedRecipe), 86400); // 24h

      res.json(modifiedRecipe);
    } catch (error) {
      logger.error('Error modifying recipe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Pobierz listę zmodyfikowanych przepisów użytkownika
   */
  async getModifiedRecipes(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = '-createdAt'
      } = req.query;

      const query = {
        'user._id': req.user._id,
        isDeleted: false
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: {
          path: 'originalRecipe._id',
          select: 'title nutritionalValues'
        }
      };

      const recipes = await ModifiedRecipe.paginate(query, options);

      res.json({
        recipes: recipes.docs,
        totalPages: recipes.totalPages,
        currentPage: recipes.page,
        totalRecipes: recipes.totalDocs
      });
    } catch (error) {
      logger.error('Error fetching modified recipes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Pobierz przepis dnia (najnowszy przepis)
   */
  async getRecipeOfDay(req, res) {
    try {
      const recipe = await Recipe.findOne({ isDeleted: false })
        .sort({ createdAt: -1 })
        .populate('ingredients.ingredient', 'name nutritionalValues');

      if (!recipe) {
        return res.status(404).json({ error: 'Nie znaleziono przepisu dnia' });
      }

      res.json(recipe);
    } catch (error) {
      logger.error('Error fetching recipe of day:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Pobierz ostatnie przepisy
   */
  async getRecentRecipes(req, res) {
    try {
      const { limit = 5 } = req.query;
      const recipes = await Recipe.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('ingredients.ingredient', 'name nutritionalValues');

      res.json(recipes);
    } catch (error) {
      logger.error('Error fetching recent recipes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new RecipeController(); 
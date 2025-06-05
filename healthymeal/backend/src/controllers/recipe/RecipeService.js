const Recipe = require('../../models/Recipe');
const ModifiedRecipe = require('../../models/ModifiedRecipe');
const { NotFoundError, AuthorizationError, ValidationError } = require('../../errors/BaseError');
const logger = require('../../utils/logger');
const cache = require('../../utils/cache');

class RecipeService {
  // Pobierz przepis dnia
  async getRecipeOfDay(userId) {
    const cacheKey = `recipe-of-day-${userId}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const recipe = await Recipe.findOne({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate('ingredients.ingredient', 'name nutritionalValues');

    if (!recipe) {
      throw new NotFoundError('Nie znaleziono przepisu dnia');
    }

    await cache.set(cacheKey, recipe, 3600); // cache na 1 godzinę
    return recipe;
  }

  // Pobierz ostatnie przepisy
  async getRecentRecipes(userId, limit = 5) {
    const cacheKey = `recent-recipes-${userId}-${limit}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const recipes = await Recipe.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('ingredients.ingredient', 'name nutritionalValues');

    await cache.set(cacheKey, recipes, 1800); // cache na 30 minut
    return recipes;
  }

  // Utwórz nowy przepis
  async createRecipe(recipeData) {
    const recipe = new Recipe({
      ...recipeData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await recipe.save();
    await this.invalidateUserCache(recipeData.userId);
    
    return recipe;
  }

  // Aktualizuj przepis
  async updateRecipe(id, updateData, userId) {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      {
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('ingredients.ingredient', 'name nutritionalValues');

    if (!recipe) {
      throw new NotFoundError('Przepis nie został znaleziony');
    }

    await this.invalidateUserCache(userId);
    return recipe;
  }

  // Usuń przepis
  async deleteRecipe(id, userId) {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: id, userId },
      { 
        isDeleted: true,
        updatedAt: new Date()
      }
    );

    if (!recipe) {
      throw new NotFoundError('Przepis nie został znaleziony');
    }

    await this.invalidateUserCache(userId);
  }

  // Lista przepisów z filtrowaniem
  async listRecipes(query, userId) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      difficulty,
      maxCarbs,
      tags
    } = query;

    const filter = { userId, isDeleted: false };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (maxCarbs) {
      filter['nutritionalValues.carbsPerServing'] = { $lte: parseFloat(maxCarbs) };
    }

    if (tags) {
      filter.tags = { $all: Array.isArray(tags) ? tags : [tags] };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('ingredients.ingredient', 'name nutritionalValues');

    return {
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Pobierz pojedynczy przepis
  async getRecipeById(id, userId) {
    const recipe = await Recipe.findOne({ _id: id, userId, isDeleted: false })
      .populate('ingredients.ingredient', 'name nutritionalValues');

    if (!recipe) {
      throw new NotFoundError('Przepis nie został znaleziony');
    }

    return recipe;
  }

  // Porównaj przepisy (oryginalny vs zmodyfikowany)
  async compareRecipes(originalId, modifiedId, userId) {
    const [original, modified] = await Promise.all([
      Recipe.findOne({ _id: originalId, userId, isDeleted: false }),
      ModifiedRecipe.findOne({ _id: modifiedId, userId, isDeleted: false })
    ]);

    if (!original || !modified) {
      throw new NotFoundError('Jeden z przepisów nie został znaleziony');
    }

    const changes = this.calculateRecipeChanges(original, modified);

    return {
      original,
      modified,
      changes
    };
  }

  // Pomocnicza metoda do obliczania zmian między przepisami
  calculateRecipeChanges(original, modified) {
    const changes = {
      ingredients: {
        added: [],
        removed: [],
        modified: []
      },
      nutritionalValues: {
        calories: modified.nutritionalValues.calories - original.nutritionalValues.calories,
        protein: modified.nutritionalValues.protein - original.nutritionalValues.protein,
        carbs: modified.nutritionalValues.carbs - original.nutritionalValues.carbs,
        fat: modified.nutritionalValues.fat - original.nutritionalValues.fat
      },
      preparationTime: modified.preparationTime - original.preparationTime
    };

    // Porównaj składniki
    const originalIngredients = new Map(original.ingredients.map(i => [i.ingredient.toString(), i]));
    const modifiedIngredients = new Map(modified.ingredients.map(i => [i.ingredient.toString(), i]));

    for (const [id, ingredient] of originalIngredients) {
      if (!modifiedIngredients.has(id)) {
        changes.ingredients.removed.push(ingredient);
      } else {
        const modifiedIngredient = modifiedIngredients.get(id);
        if (ingredient.amount !== modifiedIngredient.amount || 
            ingredient.unit !== modifiedIngredient.unit) {
          changes.ingredients.modified.push({
            original: ingredient,
            modified: modifiedIngredient
          });
        }
      }
    }

    for (const [id, ingredient] of modifiedIngredients) {
      if (!originalIngredients.has(id)) {
        changes.ingredients.added.push(ingredient);
      }
    }

    return changes;
  }

  // Invalidate cache dla użytkownika
  async invalidateUserCache(userId) {
    await Promise.all([
      cache.del(`recipe-of-day-${userId}`),
      cache.del(`recent-recipes-${userId}-5`),
      cache.del(`recent-recipes-${userId}-10`)
    ]);
  }

  async getUserRecipes(userId, query) {
    const { page = 1, limit = 10 } = query;

    const filter = { userId };
    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async searchRecipes(searchTerm, query) {
    const { page = 1, limit = 10 } = query;

    const filter = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { 'ingredients.name': { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = RecipeService; 
module.exports = RecipeService; 
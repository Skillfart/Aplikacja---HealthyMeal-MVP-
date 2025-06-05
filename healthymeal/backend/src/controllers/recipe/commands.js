const Recipe = require('../../models/Recipe');
const { validateRecipe, validateIngredients } = require('./validation');
const { sanitizeIngredients, calculateNutritionalValues } = require('./utils');
const aiService = require('../../services/aiService');

// Utwórz nowy przepis
exports.createRecipe = async (req, res) => {
  try {
    const validationResult = validateRecipe(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        message: 'Błąd walidacji', 
        errors: validationResult.errors 
      });
    }

    const { 
      title, 
      ingredients, 
      steps, 
      preparationTime, 
      difficulty, 
      servings, 
      tags 
    } = req.body;

    const sanitizedIngredients = await sanitizeIngredients(ingredients);
    const nutritionalValues = await calculateNutritionalValues(sanitizedIngredients, servings);

    const recipe = new Recipe({
      title,
      user: {
        _id: req.user._id,
        email: req.user.email,
        supabaseId: req.user.supabaseId
      },
      ingredients: sanitizedIngredients,
      steps,
      preparationTime,
      difficulty,
      servings,
      tags,
      nutritionalValues
    });

    await recipe.save();

    res.status(201).json({
      message: 'Przepis dodany pomyślnie',
      recipeId: recipe._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Aktualizuj przepis
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const validationResult = validateRecipe(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        message: 'Błąd walidacji', 
        errors: validationResult.errors 
      });
    }

    const { 
      title, 
      ingredients, 
      steps, 
      preparationTime, 
      difficulty, 
      servings, 
      tags 
    } = req.body;

    const sanitizedIngredients = await sanitizeIngredients(ingredients);
    const nutritionalValues = await calculateNutritionalValues(sanitizedIngredients, servings);

    const recipe = await Recipe.findOneAndUpdate(
      { 
        _id: id, 
        'user._id': req.user._id,
        isDeleted: false 
      },
      {
        $set: {
          title,
          ingredients: sanitizedIngredients,
          steps,
          preparationTime,
          difficulty,
          servings,
          tags,
          nutritionalValues,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }

    res.status(200).json({
      message: 'Przepis zaktualizowany pomyślnie',
      recipe
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Usuń przepis (soft delete)
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findOneAndUpdate(
      { 
        _id: id, 
        'user._id': req.user._id,
        isDeleted: false 
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    );

    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }

    res.status(200).json({ message: 'Przepis usunięty pomyślnie' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Modyfikuj przepis używając AI
exports.modifyRecipeWithAI = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferences } = req.body;

    const recipe = await Recipe.findOne({ 
      _id: id, 
      'user._id': req.user._id,
      isDeleted: false 
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }

    const modifiedRecipe = await aiService.modifyRecipe(recipe, preferences);
    
    res.status(200).json({
      message: 'Przepis zmodyfikowany pomyślnie',
      recipe: modifiedRecipe
    });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
}; 
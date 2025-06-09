import express from 'express';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';
import { modifyRecipe } from '../services/ai.js';

const router = express.Router();

// Modyfikuj przepis używając AI
router.post('/modify-recipe/:id', async (req, res) => {
  try {
    // Znajdź przepis
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      author: req.user.id
    }).populate('ingredients.ingredient');

    if (!recipe) {
      return res.status(404).json({ error: 'Przepis nie znaleziony' });
    }

    // Znajdź użytkownika i sprawdź limit AI
    const user = await User.findOne({ supabaseId: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    try {
      user.incrementAiUsage();
    } catch (error) {
      return res.status(429).json({ error: error.message });
    }

    // Modyfikuj przepis
    const modifiedRecipeData = await modifyRecipe(recipe, user.preferences);

    // Stwórz nowy przepis na podstawie modyfikacji
    const modifiedRecipe = new Recipe({
      title: `${recipe.title} (Zmodyfikowany)`,
      author: req.user.id,
      ingredients: modifiedRecipeData.ingredients,
      steps: modifiedRecipeData.steps,
      preparationTime: recipe.preparationTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      tags: [...recipe.tags, 'zmodyfikowany'],
      nutritionalValues: modifiedRecipeData.nutritionalValues,
      isModified: true,
      originalRecipe: recipe._id
    });

    await Promise.all([
      modifiedRecipe.save(),
      user.save()
    ]);

    const populatedRecipe = await Recipe.findById(modifiedRecipe._id)
      .populate('ingredients.ingredient');

    res.json({
      recipe: populatedRecipe,
      aiUsage: user.aiUsage
    });
  } catch (error) {
    console.error('Błąd podczas modyfikacji przepisu:', error);
    res.status(500).json({ error: 'Błąd serwera podczas modyfikacji przepisu' });
  }
});

// Pobierz statystyki użycia AI
router.get('/usage', async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    user.resetAiUsageIfNewDay();
    await user.save();

    res.json(user.aiUsage);
  } catch (error) {
    console.error('Błąd podczas pobierania statystyk AI:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania statystyk AI' });
  }
});

export default router; 
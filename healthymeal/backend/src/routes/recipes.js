import express from 'express';
import { Recipe } from '../models/Recipe.js';
import User from '../models/User.js';
import { modifyRecipeWithAI } from '../services/openRouterService.js';

const router = express.Router();

// Pobierz wszystkie przepisy użytkownika
router.get('/', async (req, res) => {
  try {
    const { search, hashtags, page = 1, limit = 10 } = req.query;
    
    const query = { author: req.user.id };
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (hashtags) {
      const tagList = hashtags.split(',').map(tag => tag.trim());
      query.hashtags = { $all: tagList };
    }

    const skip = (page - 1) * limit;
    
    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Recipe.countDocuments(query)
    ]);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      recipes
    });
  } catch (error) {
    console.error('Błąd podczas pobierania przepisów:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania przepisów' });
  }
});

// Pobierz pojedynczy przepis
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      author: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Przepis nie znaleziony' });
    }

    res.json(recipe);
  } catch (error) {
    console.error('Błąd podczas pobierania przepisu:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania przepisu' });
  }
});

// Utwórz nowy przepis
router.post('/', async (req, res) => {
  try {
    const {
      title,
      ingredients,
      instructions,
      hashtags
    } = req.body;

    // Walidacja wymaganych pól
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ 
        error: 'Brak wymaganych pól',
        details: {
          title: !title ? 'Tytuł jest wymagany' : null,
          ingredients: !ingredients ? 'Składniki są wymagane' : null,
          instructions: !instructions ? 'Instrukcje są wymagane' : null
        }
      });
    }

    const recipe = new Recipe({
      title,
      author: req.user.id,
      ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
      instructions,
      hashtags: hashtags || []
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Błąd podczas tworzenia przepisu:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Błąd serwera podczas tworzenia przepisu' });
  }
});

// Zaktualizuj przepis
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      author: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Przepis nie znaleziony' });
    }

    const {
      title,
      ingredients,
      instructions,
      hashtags
    } = req.body;

    // Aktualizuj tylko przesłane pola
    if (title) recipe.title = title;
    if (ingredients) recipe.ingredients = Array.isArray(ingredients) ? ingredients : [ingredients];
    if (instructions) recipe.instructions = instructions;
    if (hashtags) recipe.hashtags = hashtags;

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    console.error('Błąd podczas aktualizacji przepisu:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Błąd walidacji',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Błąd serwera podczas aktualizacji przepisu' });
  }
});

// Usuń przepis
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Przepis nie znaleziony' });
    }

    res.json({ message: 'Przepis został usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania przepisu:', error);
    res.status(500).json({ error: 'Błąd serwera podczas usuwania przepisu' });
  }
});

// Modyfikuj przepis przez AI
router.post('/:id/ai-modify', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      author: req.user.id
    }).populate('ingredients.ingredient');

    if (!recipe) {
      return res.status(404).json({ error: 'Przepis nie znaleziony' });
    }

    // Sprawdź czy użytkownik ma dostępne modyfikacje AI
    await req.mongoUser.resetAIUsageIfNeeded();
    const dailyLimit = process.env.DAILY_AI_LIMIT || 5;
    
    if (req.mongoUser.aiUsage.count >= dailyLimit) {
      return res.status(429).json({ 
        error: 'Przekroczono dzienny limit użycia AI',
        current: req.mongoUser.aiUsage.count,
        limit: dailyLimit
      });
    }

    // Pobierz preferencje użytkownika
    const userPreferences = req.mongoUser.preferences;

    // Modyfikuj przepis przez AI
    const modifiedRecipe = await modifyRecipeWithAI(recipe, userPreferences);

    // Inkrementuj licznik AI
    req.mongoUser.incrementAiUsage();
    await req.mongoUser.save();

    // Zapisz zmodyfikowany przepis jako nowy
    const newRecipe = new Recipe({
      ...modifiedRecipe,
      author: req.user.id,
      isModified: true,
      originalRecipe: recipe._id
    });

    await newRecipe.save();
    
    const populatedNewRecipe = await Recipe.findById(newRecipe._id)
      .populate('ingredients.ingredient');

    res.json({
      recipe: populatedNewRecipe,
      aiUsage: {
        current: req.mongoUser.aiUsage.count,
        limit: dailyLimit,
        remaining: dailyLimit - req.mongoUser.aiUsage.count
      }
    });
  } catch (error) {
    console.error('Błąd podczas modyfikacji przepisu przez AI:', error);
    res.status(500).json({ error: 'Błąd serwera podczas modyfikacji przepisu przez AI' });
  }
});

export default router; 
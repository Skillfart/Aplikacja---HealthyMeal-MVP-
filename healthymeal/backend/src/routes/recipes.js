import express from 'express';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';

const router = express.Router();

// Pobierz wszystkie przepisy użytkownika
router.get('/', async (req, res) => {
  try {
    const { search, tags, difficulty, maxPreparationTime, page = 1, limit = 10 } = req.query;
    
    const query = { author: req.user.id };
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (tags) {
      query.tags = { $all: tags.split(',') };
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (maxPreparationTime) {
      query.preparationTime = { $lte: parseInt(maxPreparationTime) };
    }

    const skip = (page - 1) * limit;
    
    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .populate('ingredients.ingredient')
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
    }).populate('ingredients.ingredient');

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
      steps,
      preparationTime,
      difficulty,
      servings,
      tags
    } = req.body;

    const recipe = new Recipe({
      title,
      author: req.user.id,
      ingredients,
      steps,
      preparationTime,
      difficulty,
      servings,
      tags
    });

    await recipe.save();
    
    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('ingredients.ingredient');

    res.status(201).json(populatedRecipe);
  } catch (error) {
    console.error('Błąd podczas tworzenia przepisu:', error);
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
      steps,
      preparationTime,
      difficulty,
      servings,
      tags
    } = req.body;

    recipe.title = title;
    recipe.ingredients = ingredients;
    recipe.steps = steps;
    recipe.preparationTime = preparationTime;
    recipe.difficulty = difficulty;
    recipe.servings = servings;
    recipe.tags = tags;

    await recipe.save();
    
    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('ingredients.ingredient');

    res.json(populatedRecipe);
  } catch (error) {
    console.error('Błąd podczas aktualizacji przepisu:', error);
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

export default router; 
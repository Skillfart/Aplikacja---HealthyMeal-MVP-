import express from 'express';
import User from '../models/User.js';
import { Recipe } from '../models/Recipe.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Użyj użytkownika z middleware (req.mongoUser)
    const user = req.mongoUser;
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    // Pobierz ostatnie przepisy użytkownika
    const recentRecipes = await Recipe.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Pobierz losowy przepis jako przepis dnia
    const recipeCount = await Recipe.countDocuments();
    let recipeOfDay = null;
    if (recipeCount > 0) {
      const random = Math.floor(Math.random() * recipeCount);
      recipeOfDay = await Recipe.findOne().skip(random);
    }

    // Przygotuj dane do odpowiedzi
    const dashboardData = {
      recipeOfDay,
      recentRecipes,
      aiUsage: user.aiUsage,
      preferences: user.preferences
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Błąd podczas pobierania danych dashboardu:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania danych dashboardu' });
  }
});

export default router; 
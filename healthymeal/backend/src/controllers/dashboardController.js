const Recipe = require('../models/Recipe');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Pobierz preferencje użytkownika
    const user = await User.findById(userId).select('preferences aiUsage');

    // Pobierz przepis dnia (najnowszy przepis)
    const recipeOfDay = await Recipe.findOne({ isDeleted: false })
      .sort({ createdAt: -1 })
      .select('title preparationTime difficulty nutritionalValues')
      .lean();

    // Pobierz ostatnie przepisy
    const recentRecipes = await Recipe.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt')
      .lean();

    // Przygotuj dane o użyciu AI
    const aiUsage = {
      date: user.aiUsage?.date || new Date(),
      count: user.aiUsage?.count || 0,
      dailyLimit: process.env.AI_DAILY_LIMIT || 5,
      remaining: (process.env.AI_DAILY_LIMIT || 5) - (user.aiUsage?.count || 0)
    };

    res.json({
      recipeOfDay: recipeOfDay ? {
        id: recipeOfDay._id,
        title: recipeOfDay.title,
        preparationTime: recipeOfDay.preparationTime,
        difficulty: recipeOfDay.difficulty,
        nutritionalValues: {
          carbsPerServing: recipeOfDay.nutritionalValues?.carbsPerServing || 0
        }
      } : null,
      recentRecipes: recentRecipes.map(recipe => ({
        id: recipe._id,
        title: recipe.title,
        createdAt: recipe.createdAt
      })),
      aiUsage,
      preferences: user.preferences || {
        dietType: 'normal',
        maxCarbs: 0,
        excludedProducts: [],
        allergens: []
      }
    });

  } catch (error) {
    logger.error('Błąd podczas pobierania danych dashboardu:', error);
    res.status(500).json({ 
      error: 'Wystąpił błąd podczas pobierania danych dashboardu'
    });
  }
}; 
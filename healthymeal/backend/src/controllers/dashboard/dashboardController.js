const Recipe = require('../../models/Recipe');
const ModifiedRecipe = require('../../models/ModifiedRecipe');
const User = require('../../models/User');
const { DashboardError } = require('../../errors/DashboardError');
const logger = require('../../utils/logger');

/**
 * Kontroler dashboardu
 * @class DashboardController
 */
class DashboardController {
  /**
   * Pobiera dane do dashboardu użytkownika
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;

      // Pobierz dane użytkownika
      const user = await User.findById(userId)
        .populate('preferences')
        .populate('recentRecipes')
        .populate('favoriteRecipes');

      if (!user) {
        throw new DashboardError('Nie znaleziono użytkownika', 404);
      }

      // Pobierz statystyki przepisów
      const recipesStats = await Promise.all([
        Recipe.countDocuments({ author: userId }),
        ModifiedRecipe.countDocuments({ user: userId }),
        Recipe.countDocuments({ favorites: userId }),
        Recipe.find({ author: userId }).sort('-createdAt').limit(5)
      ]);

      // Pobierz statystyki AI
      const aiStats = {
        totalModifications: recipesStats[1],
        carbsReduction: await ModifiedRecipe.aggregate([
          { $match: { user: userId } },
          { $group: {
            _id: null,
            totalReduction: { $sum: '$nutritionalValues.carbsReduction' }
          }}
        ]).then(result => result[0]?.totalReduction || 0),
        caloriesReduction: await ModifiedRecipe.aggregate([
          { $match: { user: userId } },
          { $group: {
            _id: null,
            totalReduction: { $sum: '$nutritionalValues.caloriesReduction' }
          }}
        ]).then(result => result[0]?.totalReduction || 0)
      };

      // Przygotuj dane do odpowiedzi
      const dashboard = {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences
        },
        stats: {
          totalRecipes: recipesStats[0],
          modifiedRecipes: recipesStats[1],
          favoriteRecipes: recipesStats[2],
          recentRecipes: recipesStats[3].map(recipe => ({
            id: recipe._id,
            title: recipe.title,
            createdAt: recipe.createdAt
          }))
        },
        aiUsage: {
          totalModifications: aiStats.totalModifications,
          carbsReduction: aiStats.carbsReduction,
          caloriesReduction: aiStats.caloriesReduction,
          remainingCredits: user.aiCredits
        },
        recentActivity: await this.getRecentActivity(userId)
      };

      logger.info('Pobrano dane dashboardu', { userId });

      res.json(dashboard);
    } catch (error) {
      logger.error('Błąd podczas pobierania danych dashboardu', { error });
      throw error;
    }
  }

  /**
   * Pobiera ostatnią aktywność użytkownika
   * @param {string} userId - ID użytkownika
   * @returns {Promise<Array>} Lista ostatnich aktywności
   * @private
   */
  async getRecentActivity(userId) {
    const activities = await Promise.all([
      // Ostatnio utworzone przepisy
      Recipe.find({ author: userId })
        .sort('-createdAt')
        .limit(5)
        .select('title createdAt'),

      // Ostatnio zmodyfikowane przepisy
      ModifiedRecipe.find({ user: userId })
        .sort('-createdAt')
        .limit(5)
        .populate('originalRecipe', 'title')
        .select('title createdAt originalRecipe'),

      // Ostatnio dodane do ulubionych
      Recipe.find({ favorites: userId })
        .sort('-updatedAt')
        .limit(5)
        .select('title updatedAt')
    ]);

    // Połącz i posortuj aktywności
    return [...activities[0], ...activities[1], ...activities[2]]
      .map(activity => ({
        type: activity.originalRecipe ? 'modification' : 
              activity.favorites ? 'favorite' : 'creation',
        title: activity.title,
        originalTitle: activity.originalRecipe?.title,
        date: activity.createdAt || activity.updatedAt
      }))
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
  }
}

module.exports = new DashboardController(); 
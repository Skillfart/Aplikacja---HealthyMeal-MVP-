const Preferences = require('../../models/Preferences');
const logger = require('../../utils/logger');

/**
 * Pobierz preferencje użytkownika
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id; // Zakładamy, że mamy middleware auth, który dodaje user do req
    
    let preferences = await Preferences.findOne({ userId });
    
    if (!preferences) {
      // Jeśli nie ma preferencji, tworzymy domyślne
      preferences = await Preferences.create({
        userId,
        stats: {
          totalRecipes: 0,
          favoriteRecipes: 0,
          recentRecipes: 0,
          rating: 0
        }
      });
    }

    res.json(preferences);
  } catch (error) {
    logger.error('Błąd podczas pobierania preferencji:', error);
    res.status(500).json({ message: 'Błąd podczas pobierania preferencji' });
  }
};

/**
 * Aktualizuj preferencje użytkownika
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const preferences = await Preferences.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json(preferences);
  } catch (error) {
    logger.error('Błąd podczas aktualizacji preferencji:', error);
    res.status(500).json({ message: 'Błąd podczas aktualizacji preferencji' });
  }
};

/**
 * Dodaj przepis do ulubionych
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.body;

    const preferences = await Preferences.findOneAndUpdate(
      { userId },
      { 
        $addToSet: { favoriteRecipes: recipeId },
        $inc: { 'stats.favoriteRecipes': 1 }
      },
      { new: true, upsert: true }
    );

    res.json(preferences);
  } catch (error) {
    logger.error('Błąd podczas dodawania do ulubionych:', error);
    res.status(500).json({ message: 'Błąd podczas dodawania do ulubionych' });
  }
};

/**
 * Usuń przepis z ulubionych
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    const preferences = await Preferences.findOneAndUpdate(
      { userId },
      { 
        $pull: { favoriteRecipes: recipeId },
        $inc: { 'stats.favoriteRecipes': -1 }
      },
      { new: true }
    );

    res.json(preferences);
  } catch (error) {
    logger.error('Błąd podczas usuwania z ulubionych:', error);
    res.status(500).json({ message: 'Błąd podczas usuwania z ulubionych' });
  }
};

/**
 * Dodaj przepis do ostatnio oglądanych
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addToRecent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.body;

    const preferences = await Preferences.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          recentRecipes: {
            $each: [recipeId],
            $position: 0,
            $slice: 10 // Zachowaj tylko 10 ostatnich
          }
        },
        $inc: { 'stats.recentRecipes': 1 }
      },
      { new: true, upsert: true }
    );

    res.json(preferences);
  } catch (error) {
    logger.error('Błąd podczas dodawania do ostatnich:', error);
    res.status(500).json({ message: 'Błąd podczas dodawania do ostatnich' });
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  addToFavorites,
  removeFromFavorites,
  addToRecent
}; 
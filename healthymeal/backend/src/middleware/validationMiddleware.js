const mongoose = require('mongoose');

/**
 * Middleware walidujący parametr recipeId
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 * @param {Function} next - Funkcja przekazująca sterowanie do następnego middleware
 */
function validateRecipeId(req, res, next) {
  const { recipeId } = req.params;
  
  // Sprawdzenie, czy recipeId jest prawidłowym ObjectId MongoDB
  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: 'Invalid recipe ID format' });
  }
  
  next();
}

module.exports = {
  validateRecipeId
}; 
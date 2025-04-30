const crypto = require('crypto');

/**
 * Generuje unikalny hash na podstawie ID przepisu i preferencji użytkownika
 * @param {string} recipeId - ID przepisu
 * @param {Object} userPreferences - Preferencje użytkownika
 * @returns {string} - Unikalny hash MD5
 */
function generateInputHash(recipeId, userPreferences) {
  // Sortujemy tablice, aby zapewnić spójność hasha niezależnie od kolejności elementów
  const sortedExcludedProducts = [...userPreferences.excludedProducts].sort();
  const sortedAllergens = [...userPreferences.allergens].sort();
  
  const input = JSON.stringify({
    recipeId,
    preferences: {
      dietType: userPreferences.dietType,
      maxCarbs: userPreferences.maxCarbs,
      excludedProducts: sortedExcludedProducts,
      allergens: sortedAllergens
    }
  });
  
  return crypto.createHash('md5').update(input).digest('hex');
}

module.exports = {
  generateInputHash
}; 
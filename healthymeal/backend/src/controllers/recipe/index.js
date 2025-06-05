const recipeQueries = require('./queries');
const recipeCommands = require('./commands');
const recipeValidation = require('./validation');
const recipeUtils = require('./utils');

module.exports = {
  // Query methods
  getUserRecipes: recipeQueries.getUserRecipes,
  getRecipeById: recipeQueries.getRecipeById,
  searchRecipes: recipeQueries.searchRecipes,
  
  // Command methods
  createRecipe: recipeCommands.createRecipe,
  updateRecipe: recipeCommands.updateRecipe,
  deleteRecipe: recipeCommands.deleteRecipe,
  modifyRecipeWithAI: recipeCommands.modifyRecipeWithAI,
  
  // Validation helpers
  validateRecipe: recipeValidation.validateRecipe,
  validateIngredients: recipeValidation.validateIngredients,
  
  // Utility functions
  calculateNutritionalValues: recipeUtils.calculateNutritionalValues,
  sanitizeIngredients: recipeUtils.sanitizeIngredients
}; 
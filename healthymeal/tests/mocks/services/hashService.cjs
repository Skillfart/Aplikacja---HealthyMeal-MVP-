/**
 * Mock dla hashService.js
 */
module.exports = {
  generateHash: (input) => {
    return Buffer.from(JSON.stringify(input)).toString('base64');
  },
  
  generateRecipeHash: (recipeId, userPreferences) => {
    return Buffer.from(`${recipeId}_${JSON.stringify(userPreferences)}`).toString('base64');
  }
}; 
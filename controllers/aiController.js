const Recipe = require('../models/Recipe');
const AICache = require('../models/AICache');
const hashService = require('../services/hashService');
const aiService = require('../services/aiService');
const userService = require('../services/userService');

/**
 * Modyfikuje przepis przy użyciu AI zgodnie z preferencjami użytkownika
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 */
async function modifyRecipe(req, res) {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    // 1. Pobieranie danych przepisu
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Sprawdzenie, czy użytkownik ma dostęp do przepisu
    if (recipe.isDeleted) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // 2. Pobieranie preferencji użytkownika
    const userPreferences = req.user.preferences;
    
    // 3. Generowanie hash dla cache'u
    const inputHash = hashService.generateInputHash(recipeId, userPreferences);
    
    // 4. Sprawdzenie cache'u
    const cachedResponse = await AICache.findOne({ inputHash });
    
    if (cachedResponse) {
      return res.status(200).json({
        message: "Recipe modified successfully",
        modifiedRecipe: cachedResponse.response,
        fromCache: true
      });
    }

    // 5. Komunikacja z API AI i przetwarzanie odpowiedzi
    const prompt = aiService.buildPrompt(recipe, userPreferences);
    
    try {
      // Wywołanie API AI
      const aiResponse = await aiService.callAI(prompt);
      
      // Przetworzenie odpowiedzi
      const processedResponse = aiService.processResponse(aiResponse, recipe);
      
      // 6. Zapisanie odpowiedzi w cache
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      await AICache.create({
        inputHash,
        recipeId,
        userPreferences,
        response: processedResponse,
        createdAt: new Date(),
        expiresAt
      });
      
      // 7. Inkrementacja licznika użycia AI
      await userService.incrementAIUsageCounter(userId);
      
      // 8. Zwrócenie odpowiedzi
      return res.status(200).json({
        message: "Recipe modified successfully",
        modifiedRecipe: processedResponse,
        fromCache: false
      });
      
    } catch (aiError) {
      console.error('AI Service Error:', aiError);
      return res.status(500).json({
        message: "Error processing recipe with AI. Please try again later.",
        error: aiError.message
      });
    }
    
  } catch (error) {
    console.error('Error in modifyRecipe controller:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

module.exports = {
  modifyRecipe
}; 
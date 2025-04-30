const Recipe = require('../models/Recipe');
const AICache = require('../models/AICache');
const hashService = require('../services/hashService');
const aiService = require('../services/aiService');
const userService = require('../services/userService');
const openRouterService = require('../services/openRouterService');
const { ProcessingError } = require('../errors/OpenRouterError');
const config = require('../config/env');

/**
 * Modyfikuje przepis przy użyciu AI zgodnie z preferencjami użytkownika
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 */
async function modifyRecipe(req, res) {
  try {
    const { recipeId } = req.params;
    const user = req.user;
    
    // Sprawdź limity dzienne
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (user.aiUsage && user.aiUsage.date >= todayStart && user.aiUsage.count >= config.AI_DAILY_LIMIT) {
      return res.status(403).json({
        message: `Osiągnięto dzienny limit modyfikacji AI (${config.AI_DAILY_LIMIT}/${config.AI_DAILY_LIMIT})`,
        aiUsage: {
          dailyLimit: config.AI_DAILY_LIMIT,
          used: user.aiUsage.count,
          remaining: 0
        }
      });
    }
    
    // Pobierz przepis
    const recipe = await Recipe.findOne({
      _id: recipeId,
      'user._id': user._id,
      isDeleted: false
    }).lean();
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    // Pobierz preferencje użytkownika
    const preferences = user.preferences || {
      dietType: 'normal',
      maxCarbs: 0,
      excludedProducts: [],
      allergens: []
    };
    
    // Sprawdź status API przed użyciem
    if (openRouterService.mockMode) {
      console.warn('Uwaga: używamy trybu atrapy dla OpenRouter API');
    }
    
    try {
      // Modyfikuj przepis za pomocą OpenRouter
      const modifiedRecipe = await openRouterService.modifyRecipe(recipe, preferences);
      
      // Aktualizuj licznik AI
      if (!user.aiUsage || user.aiUsage.date < todayStart) {
        user.aiUsage = {
          date: today,
          count: 1
        };
      } else {
        user.aiUsage.count += 1;
      }
      await user.save();
      
      res.status(200).json({
        message: 'Przepis zmodyfikowany pomyślnie',
        originalRecipe: recipe,
        modifiedRecipe: modifiedRecipe,
        aiUsage: {
          dailyLimit: config.AI_DAILY_LIMIT,
          used: user.aiUsage.count,
          remaining: Math.max(0, config.AI_DAILY_LIMIT - user.aiUsage.count)
        }
      });
    } catch (error) {
      if (error instanceof ProcessingError) {
        console.error('Błąd przetwarzania odpowiedzi AI:', error);
        return res.status(422).json({ 
          message: 'Nie udało się przetworzyć odpowiedzi AI',
          error: error.message
        });
      }
      
      throw error; // Przekazujemy inne błędy do głównego bloku catch
    }
  } catch (error) {
    console.error('Błąd modyfikacji przepisu przez AI:', error);
    res.status(500).json({ 
      message: 'Błąd serwera podczas modyfikacji przepisu', 
      error: error.message 
    });
  }
}

/**
 * Pobierz informacje o limitach AI dla użytkownika
 */
async function getAIUsage(req, res) {
  try {
    const user = req.user;
    
    // Oblicz pozostałe limity
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let remainingCount = config.AI_DAILY_LIMIT;
    let usedCount = 0;
    
    if (user.aiUsage && user.aiUsage.date >= todayStart) {
      usedCount = user.aiUsage.count;
      remainingCount = Math.max(0, config.AI_DAILY_LIMIT - usedCount);
    }
    
    // Sprawdź czy OpenRouter API jest dostępne
    let apiStatus = { status: 'unknown' };
    try {
      apiStatus = await openRouterService.checkStatus();
    } catch (error) {
      console.warn('Nie udało się sprawdzić statusu OpenRouter API:', error);
      apiStatus = { status: 'error', message: error.message };
    }
    
    res.status(200).json({
      dailyLimit: config.AI_DAILY_LIMIT,
      used: usedCount,
      remaining: remainingCount,
      resetAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      apiStatus: apiStatus
    });
  } catch (error) {
    console.error('Błąd pobierania limitów AI:', error);
    res.status(500).json({ 
      message: 'Błąd serwera podczas pobierania limitów AI', 
      error: error.message 
    });
  }
}

/**
 * Sugeruje alternatywy dla składników zgodnie z preferencjami użytkownika
 */
async function suggestAlternatives(req, res) {
  try {
    const { recipeId } = req.params;
    const { ingredients } = req.body;
    const user = req.user;
    
    let ingredientsToUse = ingredients;
    
    // Jeśli nie przekazano składników, pobierz z przepisu
    if (!ingredients || ingredients.length === 0) {
      // Pobierz przepis
      const recipe = await Recipe.findOne({
        _id: recipeId,
        isDeleted: false
      }).lean();
      
      if (!recipe) {
        return res.status(404).json({ message: 'Przepis nie znaleziony' });
      }
      
      ingredientsToUse = recipe.ingredients;
    }
    
    if (!ingredientsToUse || ingredientsToUse.length === 0) {
      return res.status(400).json({ message: 'Brak składników do analizy' });
    }
    
    // Pobierz preferencje użytkownika
    const preferences = user.preferences || {
      dietType: 'normal',
      excludedProducts: [],
      allergens: []
    };
    
    try {
      // Sugeruj alternatywy za pomocą OpenRouter
      const alternatives = await openRouterService.suggestIngredientAlternatives(
        ingredientsToUse,
        preferences
      );
      
      res.status(200).json(alternatives);
    } catch (error) {
      if (error instanceof ProcessingError) {
        console.error('Błąd przetwarzania odpowiedzi AI dla alternatyw:', error);
        return res.status(422).json({ 
          message: 'Nie udało się przetworzyć odpowiedzi AI',
          error: error.message
        });
      }
      
      throw error; // Przekazujemy inne błędy do głównego bloku catch
    }
  } catch (error) {
    console.error('Błąd pobierania alternatyw składników:', error);
    res.status(500).json({ 
      message: 'Błąd serwera podczas pobierania alternatyw', 
      error: error.message 
    });
  }
}

/**
 * Pobiera status API OpenRouter
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 */
async function getAPIStatus(req, res) {
  try {
    const status = await openRouterService.checkStatus();
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      apiStatus: status,
      mockMode: openRouterService.mockMode,
      model: openRouterService.defaultModel
    });
  } catch (error) {
    console.error('Błąd pobierania statusu API:', error);
    res.status(500).json({ 
      message: 'Błąd serwera podczas sprawdzania statusu API', 
      error: error.message 
    });
  }
}

module.exports = {
  modifyRecipe,
  getAIUsage,
  suggestAlternatives,
  getAPIStatus
}; 
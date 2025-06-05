const Recipe = require('../models/Recipe');
const AICache = require('../models/AICache');
const User = require('../models/User');
const { OpenRouterService, OpenRouterError } = require('../services/openRouterService');
const { ProcessingError } = require('../errors/OpenRouterError');
const config = require('../config/env');
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');
const { getSampleRecipe } = require('../utils/sampleRecipes');
const logger = require('../utils/logger');
const userService = require('../services/userService');

// Domyślny limit AI jeśli nie jest zdefiniowany w konfiguracji
if (!config.AI_DAILY_LIMIT) {
  config.AI_DAILY_LIMIT = 5;
}

// Limity użycia AI dla różnych typów kont
const DAILY_AI_LIMITS = {
  free: 3,      // 3 użycia dziennie dla konta darmowego
  premium: 10,  // 10 użyć dziennie dla konta premium
  unlimited: -1 // bez limitu dla konta "unlimited"
};

/**
 * Inkrementuje liczniki użycia AI dla użytkownika
 * @private
 */
const _incrementAIUsage = async (userId) => {
  try {
    const today = new Date();
    
    // Znajdź użytkownika i zaktualizuj dane o wykorzystaniu AI
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Nie znaleziono użytkownika');
    }
    
    // Inicjalizuj obiekt aiUsage, jeśli nie istnieje
    if (!user.aiUsage) {
      user.aiUsage = {
        count: 0,
        date: today,
        totalUsage: 0
      };
    }
    
    // Sprawdź, czy należy zresetować licznik dzienny
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (user.aiUsage.date < todayStart) {
      user.aiUsage.count = 0;
    }
    
    // Zaktualizuj liczniki
    user.aiUsage.count += 1;
    user.aiUsage.date = today;
    
    // Zapisz zmiany
    await user.save();
    
    return user.aiUsage;
  } catch (error) {
    logger.error('Błąd podczas aktualizacji liczników użycia AI:', error);
    throw error;
  }
};

/**
 * Sprawdza, czy użytkownik może korzystać z AI
 * @private
 */
const _canUseAI = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Nie znaleziono użytkownika');
    }
    
    // Określ limit dzienny na podstawie typu konta
    const accountType = user.accountType || 'free';
    const dailyLimit = DAILY_AI_LIMITS[accountType] || DAILY_AI_LIMITS.free;
    
    // Jeśli konto jest typu "unlimited", zawsze może korzystać z AI
    if (dailyLimit === -1) {
      return true;
    }
    
    // Sprawdź licznik dzienny
    const aiUsage = user.aiUsage || { count: 0, date: new Date() };
    
    // Sprawdź, czy należy zresetować licznik dzienny
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (aiUsage.date < todayStart) {
      return true; // Nowy dzień, można korzystać z AI
    }
    
    // Sprawdź, czy przekroczono limit dzienny
    return aiUsage.count < dailyLimit;
  } catch (error) {
    logger.error('Błąd podczas sprawdzania możliwości użycia AI:', error);
    throw error;
  }
};

/**
 * Modyfikuje przepis z użyciem AI na podstawie preferencji użytkownika
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 */
exports.modifyRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    // Utwórz testowego użytkownika jeśli nie jest zalogowany
    const user = req.user || { 
      _id: 'test-user-id', 
      id: 'test-user-id',
      email: 'test@example.com',
      aiUsage: { count: 0, date: new Date() }
    };
    
    console.log(`Rozpoczynam modyfikację przepisu ${recipeId} dla użytkownika ${user?.id || user?._id || 'niezalogowany'}`);
    
    // Sprawdź czy to testowe ID
    const isTestId = testIds.includes(recipeId);
    
    // Dla testowych ID zawsze zezwalaj na modyfikację
    if (!isTestId && user._id !== 'test-user-id') {
      // Sprawdź możliwość użycia AI dla rzeczywistych użytkowników
      const canUse = await _canUseAI(user._id);
      if (!canUse) {
        return res.status(403).json({
          message: `Osiągnięto dzienny limit modyfikacji AI`,
          aiUsage: {
            dailyLimit: config.AI_DAILY_LIMIT,
            used: user.aiUsage?.count || 0,
            remaining: 0
          }
        });
      }
    }
    
    // Pobierz przepis
    let recipe;
    
    // Obsługa testowych ID
    if (testIds.includes(recipeId)) {
      console.log(`Użyto testowego ID (${recipeId}), używam testowego przepisu`);
      recipe = getSampleRecipe(recipeId);
    } else {
      const recipeDoc = await Recipe.findById(recipeId);
      if (!recipeDoc) {
        return res.status(404).json({ message: 'Przepis nie został znaleziony' });
      }
      recipe = recipeDoc.toObject();
    }
    
    // Preferencje z zapytania lub domyślne z profilu użytkownika
    const preferences = req.body.preferences || user?.preferences || {
      dietType: 'normal',
      maxCarbs: 0,
      excludedProducts: [],
      allergens: []
    };
    
    try {
      // Użyj serwisu OpenRouter do modyfikacji przepisu
      const openRouterService = new OpenRouterService();
      const result = await openRouterService.modifyRecipe(recipe, preferences);
      
      // Aktualizuj licznik użycia AI dla użytkownika (tylko jeśli to nie test i użytkownik jest realny)
      if (!isTestId && user._id !== 'test-user-id') {
        try {
          await _incrementAIUsage(user._id);
          console.log(`Zaktualizowano licznik AI dla użytkownika ${user._id}: ${user.aiUsage?.count || 1}`);
        } catch (error) {
          console.error('Błąd zapisu statystyk AI dla użytkownika:', error);
        }
      }
      
      // Obsługujemy oba formaty odpowiedzi: bezpośredni przepis lub obiekt z modifiedRecipe i aiUsage
      const modifiedRecipe = result.modifiedRecipe || result;
      const aiUsage = result.aiUsage || {
        dailyLimit: config.AI_DAILY_LIMIT,
        used: user?.aiUsage?.count || 1,
        remaining: Math.max(0, config.AI_DAILY_LIMIT - (user?.aiUsage?.count || 1))
      };
      
      // Zwróć zmodyfikowany przepis i informacje o użyciu AI
      return res.json({
        modifiedRecipe,
        aiUsage
      });
    } catch (error) {
      console.error('Błąd AI podczas modyfikacji przepisu:', error);
      
      // W przypadku błędu OpenRoutera (np. brak kredytów), zwróć symulowany przepis
      if (error.code === 'RATE_LIMIT' || error.response?.status === 429 || error.message.includes('kredyt') || error.message.includes('limit')) {
        console.log('Wykryto błąd limitu kredytów, używam lokalnego mocka');
        
        // Użyj mocka zamiast rzeczywistego AI
        const mockService = new OpenRouterService({ simulationMode: true });
        const mockResult = await mockService.modifyRecipe(recipe, preferences);
        
        return res.status(207).json({
          modifiedRecipe: mockResult.modifiedRecipe || mockResult,
          aiUsage: {
            dailyLimit: config.AI_DAILY_LIMIT,
            used: user?.aiUsage?.count || 0,
            remaining: 0
          },
          warning: "Modyfikacja przeprowadzona w trybie awaryjnym (brak kredytów AI). Skontaktuj się z administratorem."
        });
      }
      
      // Inny błąd - zwróć komunikat błędu
      throw error;
    }
  } catch (error) {
    console.error('Błąd modyfikacji przepisu przez AI:', error);
    res.status(500).json({ 
      message: 'Błąd serwera podczas modyfikacji przepisu', 
      error: error.message 
    });
  }
};

/**
 * Pobierz informacje o limitach AI dla użytkownika
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 */
exports.getAIUsage = async (req, res) => {
  try {
    // Zawsze dostarcz informacje nawet bez zalogowanego użytkownika
    const user = req.user || { 
      _id: 'test-user-id', 
      id: 'test-user-id',
      email: 'test@example.com',
      aiUsage: { count: 0, date: new Date() }
    };
    
    console.log(`Pobieranie informacji o kredytach AI dla użytkownika: ${user._id || user.id || 'niezidentyfikowany'}`);
    
    // Sprawdź czy jest to użytkownik testowy, tryb dev, lub tryb testowy
    const isTestUser = user._id === 'test-user-id' || user._id === 'dev-user-id' || 
                      user.id === 'test-user-id' || user.id === 'dev-user-id' ||
                      process.env.TEST_MODE === 'true' || config.TEST_MODE === 'true';
    
    // Dla trybu testowego - zawsze zwracaj informacje
    if (isTestUser) {
      console.log('Sprawdzanie limitu AI dla testowego użytkownika:', user._id || user.id);
      
      return res.status(200).json({
        aiUsage: user.aiUsage || { count: 0, date: new Date() },
        hasRemainingModifications: true,
        dailyLimit: parseInt(process.env.AI_DAILY_LIMIT || config.AI_DAILY_LIMIT || 5, 10),
        remainingModifications: parseInt(process.env.AI_DAILY_LIMIT || config.AI_DAILY_LIMIT || 5, 10),
        isTestUser: true
      });
    }
    
    // Dla rzeczywistych użytkowników sprawdź limit
    const result = await userService.checkAIUsageLimit(user._id || user.id);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Błąd podczas pobierania informacji o limitach AI:', error);
    return res.status(500).json({ 
      message: 'Wystąpił błąd podczas pobierania informacji o limitach AI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generuje alternatywne składniki na podstawie preferencji użytkownika
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi 
 */
exports.suggestAlternatives = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { ingredients, preferences } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Wymagana jest lista składników do modyfikacji' });
    }
    
    // Sprawdź możliwość użycia AI
    const user = req.user;
    if (user && user._id !== 'test-user-id') {
      const canUse = await _canUseAI(user._id);
      if (!canUse) {
        return res.status(403).json({ 
          message: 'Przekroczono dzienny limit użycia AI'
        });
      }
    }
    
    // Pobierz przepis jeśli podano ID
    let recipe = null;
    if (recipeId && recipeId !== 'undefined') {
      if (testIds.includes(recipeId)) {
        recipe = getSampleRecipe(recipeId);
      } else if (mongoose.Types.ObjectId.isValid(recipeId)) {
        recipe = await Recipe.findById(recipeId);
        if (!recipe) {
          return res.status(404).json({ message: 'Przepis nie został znaleziony' });
        }
      }
    }
    
    // Użyj serwisu OpenRouter do generowania alternatyw
    const openRouterService = new OpenRouterService();
    
    try {
      const alternatives = await openRouterService.suggestIngredientAlternatives(
        ingredients,
        preferences || user?.preferences || {},
        recipe
      );
      
      // Aktualizuj licznik użycia AI
      if (user && user._id !== 'test-user-id') {
        await _incrementAIUsage(user._id);
      }
      
      return res.status(200).json({ alternatives });
    } catch (error) {
      console.error('Błąd AI podczas sugerowania alternatyw:', error);
      
      // W przypadku błędu, spróbuj tryb symulacji
      if (error.code === 'RATE_LIMIT' || error.response?.status === 429) {
        const mockService = new OpenRouterService({ simulationMode: true });
        const mockAlternatives = await mockService.suggestIngredientAlternatives(
          ingredients,
          preferences || user?.preferences || {}
        );
        
        return res.status(207).json({
          alternatives: mockAlternatives,
          warning: "Sugestie wygenerowane w trybie awaryjnym (brak kredytów AI)"
        });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Błąd podczas generowania alternatyw składników:', error);
    res.status(500).json({ 
      message: 'Błąd serwera', 
      error: error.message 
    });
  }
};

/**
 * Sprawdza status API AI
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 */
exports.getAPIStatus = async (req, res) => {
  try {
    const openRouterService = new OpenRouterService();
    const status = await openRouterService.checkAPIStatus();
    
    return res.status(200).json(status);
  } catch (error) {
    console.error('Błąd sprawdzania statusu API:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Nie można sprawdzić statusu API',
      error: error.message
    });
  }
};

// Zastępuję stary eksport
module.exports = {
  getAIUsage: exports.getAIUsage,
  modifyRecipe: exports.modifyRecipe,
  suggestAlternatives: exports.suggestAlternatives,
  getAPIStatus: exports.getAPIStatus
}; 
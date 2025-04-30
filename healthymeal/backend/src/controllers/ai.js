/**
 * Kontroler AI - obsługuje funkcje związane z wykorzystaniem AI w aplikacji
 * w tym modyfikację przepisów i generowanie alternatyw dla składników
 */

const OpenRouterService = require('../services/openRouterService');
const User = require('../models/User');
const logger = require('../utils/logger');

// Inicjalizacja serwisu OpenRouter z kluczem API z zmiennych środowiskowych
// Jeśli klucz API nie jest dostępny, serwis działa w trybie symulacji
const openRouterService = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3-opus:beta',
  simulationMode: process.env.NODE_ENV === 'test' || !process.env.OPENROUTER_API_KEY
});

// Limity użycia AI dla różnych typów kont
const DAILY_AI_LIMITS = {
  free: 3,      // 3 użycia dziennie dla konta darmowego
  premium: 10,  // 10 użyć dziennie dla konta premium
  unlimited: -1 // bez limitu dla konta "unlimited"
};

/**
 * Pobiera informacje o wykorzystaniu AI przez użytkownika
 */
const getAIUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Pobierz użytkownika z bazy danych
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
    }
    
    // Pobierz dane o wykorzystaniu AI, z odpowiednimi wartościami domyślnymi
    const aiUsage = user.aiUsage || {
      date: new Date(),
      count: 0
    };

    // Sprawdź, czy licznik powinien zostać zresetowany
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usageDate = new Date(aiUsage.date || today);
    usageDate.setHours(0, 0, 0, 0);
    
    // Jeśli data jest inna niż dzisiejsza, resetujemy licznik
    if (today.getTime() !== usageDate.getTime()) {
      aiUsage.date = today;
      aiUsage.count = 0;
      
      // Zapisz zresetowany licznik
      user.aiUsage = aiUsage;
      await user.save();
    }
    
    // Pobierz dzienny limit z konfiguracji
    const dailyLimit = parseInt(process.env.AI_DAILY_LIMIT || 5);
    
    // Zwróć informacje o wykorzystaniu w ustrukturyzowany sposób
    return res.status(200).json({
      aiUsage: {
        count: aiUsage.count || 0,
        date: aiUsage.date || today
      },
      dailyLimit: dailyLimit,
      remaining: Math.max(0, dailyLimit - (aiUsage.count || 0))
    });
  } catch (error) {
    logger.error('Błąd podczas pobierania informacji o wykorzystaniu AI:', error);
    return res.status(500).json({ 
      message: 'Wystąpił błąd serwera',
      error: error.message
    });
  }
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
        dailyUsage: 0,
        lastUsageDate: today,
        totalUsage: 0
      };
    }
    
    // Sprawdź, czy należy zresetować licznik dzienny
    const lastUsageDay = user.aiUsage.lastUsageDate 
      ? new Date(user.aiUsage.lastUsageDate).toISOString().split('T')[0] 
      : null;
    const todayStr = today.toISOString().split('T')[0];
    
    if (lastUsageDay && lastUsageDay !== todayStr) {
      user.aiUsage.dailyUsage = 0;
    }
    
    // Zaktualizuj liczniki
    user.aiUsage.dailyUsage += 1;
    user.aiUsage.totalUsage += 1;
    user.aiUsage.lastUsageDate = today;
    
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
    const aiUsage = user.aiUsage || { dailyUsage: 0, lastUsageDate: new Date() };
    
    // Sprawdź, czy należy zresetować licznik dzienny
    const today = new Date().toISOString().split('T')[0];
    const lastUsageDay = aiUsage.lastUsageDate 
      ? new Date(aiUsage.lastUsageDate).toISOString().split('T')[0] 
      : null;
    
    if (lastUsageDay && lastUsageDay !== today) {
      return true; // Nowy dzień, można korzystać z AI
    }
    
    // Sprawdź, czy przekroczono limit dzienny
    return aiUsage.dailyUsage < dailyLimit;
  } catch (error) {
    logger.error('Błąd podczas sprawdzania możliwości użycia AI:', error);
    throw error;
  }
};

/**
 * Modyfikuje przepis za pomocą AI na podstawie preferencji użytkownika
 */
const modifyRecipeWithAI = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipe, preferences } = req.body;
    
    // Walidacja danych wejściowych
    if (!recipe || !preferences) {
      return res.status(400).json({ 
        message: 'Brak wymaganych danych: przepis lub preferencje' 
      });
    }
    
    // Sprawdź, czy użytkownik może korzystać z AI
    const canUse = await _canUseAI(userId);
    if (!canUse) {
      return res.status(403).json({ 
        message: 'Przekroczono dzienny limit użycia AI. Spróbuj ponownie jutro lub rozważ aktualizację konta.' 
      });
    }
    
    // Modyfikuj przepis
    const modifiedRecipe = await openRouterService.modifyRecipe(recipe, preferences);
    
    // Zaktualizuj liczniki użycia AI
    await _incrementAIUsage(userId);
    
    // Zwróć zmodyfikowany przepis
    return res.status(200).json({ recipe: modifiedRecipe });
  } catch (error) {
    logger.error('Błąd podczas modyfikacji przepisu z AI:', error);
    
    // Obsługa konkretnych błędów
    if (error.name === 'OpenRouterError') {
      return res.status(400).json({ 
        message: `Błąd modyfikacji przepisu: ${error.message}`,
        code: error.code
      });
    }
    
    return res.status(500).json({ message: 'Wystąpił błąd serwera' });
  }
};

/**
 * Generuje alternatywne składniki na podstawie preferencji użytkownika
 */
const suggestIngredientAlternatives = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ingredient, preferences } = req.body;
    
    // Walidacja danych wejściowych
    if (!ingredient || !preferences) {
      return res.status(400).json({ 
        message: 'Brak wymaganych danych: składnik lub preferencje' 
      });
    }
    
    // Sprawdź, czy użytkownik może korzystać z AI
    const canUse = await _canUseAI(userId);
    if (!canUse) {
      return res.status(403).json({ 
        message: 'Przekroczono dzienny limit użycia AI. Spróbuj ponownie jutro lub rozważ aktualizację konta.' 
      });
    }
    
    // Generuj alternatywy
    const alternatives = await openRouterService.suggestIngredientAlternatives(
      ingredient, 
      preferences
    );
    
    // Zaktualizuj liczniki użycia AI
    await _incrementAIUsage(userId);
    
    // Zwróć alternatywy
    return res.status(200).json({ alternatives });
  } catch (error) {
    logger.error('Błąd podczas generowania alternatyw składników:', error);
    
    // Obsługa konkretnych błędów
    if (error.name === 'OpenRouterError') {
      return res.status(400).json({ 
        message: `Błąd generowania alternatyw: ${error.message}`,
        code: error.code
      });
    }
    
    return res.status(500).json({ message: 'Wystąpił błąd serwera' });
  }
};

/**
 * Sprawdza status API OpenRouter
 */
const checkAPIStatus = async (req, res) => {
  try {
    const status = await openRouterService.checkAPIStatus();
    return res.status(200).json(status);
  } catch (error) {
    logger.error('Błąd podczas sprawdzania statusu API:', error);
    return res.status(500).json({ 
      status: 'error',
      message: error.message || 'Wystąpił błąd serwera'
    });
  }
};

module.exports = {
  getAIUsage,
  modifyRecipeWithAI,
  suggestIngredientAlternatives,
  checkAPIStatus
}; 
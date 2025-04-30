/**
 * Middleware do ograniczania liczby zapytań do API
 */
const apiLimitManager = require('../services/apiLimitManager');

/**
 * Middleware do ograniczania liczby zapytań
 * @param {number} limit - Maksymalna liczba zapytań w oknie czasowym
 * @param {string} apiName - Nazwa API do monitorowania
 * @returns {Function} - Middleware Express
 */
function rateLimiter(limit = 100, apiName = 'default') {
  return (req, res, next) => {
    // Identyfikator klienta - adres IP lub ID użytkownika (jeśli dostępne)
    const clientId = req.user ? req.user._id.toString() : req.ip;
    
    // Sprawdź czy nie przekroczono limitu
    const allowed = apiLimitManager.checkRateLimit(clientId, limit, apiName);
    
    if (!allowed) {
      return res.status(429).json({
        message: 'Przekroczono limit zapytań. Spróbuj ponownie później.',
        limit: limit,
        api: apiName
      });
    }
    
    next();
  };
}

/**
 * Middleware ograniczające dostęp do API AI
 */
function aiApiLimiter(req, res, next) {
  // Sprawdź limity użytkownika w bazie danych
  if (!req.user) {
    return res.status(401).json({ message: 'Nieautoryzowany dostęp' });
  }
  
  apiLimitManager.checkUserAILimit(req.user)
    .then(limitInfo => {
      if (limitInfo.limitExceeded) {
        return res.status(429).json({
          message: `Osiągnięto dzienny limit zapytań AI (${limitInfo.usedCount}/${limitInfo.dailyLimit})`,
          limitInfo: limitInfo
        });
      }
      
      // Dodaj informacje o limitach do obiektu żądania
      req.aiLimitInfo = limitInfo;
      next();
    })
    .catch(error => {
      console.error('Błąd sprawdzania limitów AI:', error);
      // W przypadku błędu pozwól na kontynuację (nie blokuj użytkownika)
      next();
    });
}

module.exports = {
  rateLimiter,
  aiApiLimiter
}; 
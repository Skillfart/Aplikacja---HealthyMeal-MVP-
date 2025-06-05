/**
 * Middleware do ograniczania liczby zapytań do API
 */
const apiLimitManager = require('../services/apiLimitManager');
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Konfiguracja podstawowego rate limitera
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minut
    max = 100, // limit 100 żądań na okno czasowe
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip,
    skip = (req) => false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    keyGenerator,
    skip,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

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

// Ograniczenie dla API
const apiLimiter = rateLimit({
  windowMs: config.rateLimits?.api?.windowMs || 15 * 60 * 1000, // 15 minut
  max: config.rateLimits?.api?.max || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: 'Zbyt wiele zapytań. Proszę spróbować ponownie później.'
  }
});

// Ograniczenie dla autentykacji
const authLimiter = rateLimit({
  windowMs: config.rateLimits?.auth?.windowMs || 15 * 60 * 1000, // 15 minut
  max: config.rateLimits?.auth?.max || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: 'Zbyt wiele prób logowania. Proszę spróbować ponownie później.'
  }
});

// Ograniczenie dla AI
const aiLimiter = rateLimit({
  windowMs: config.rateLimits?.ai?.windowMs || 15 * 60 * 1000, // 15 minut
  max: config.rateLimits?.ai?.max || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: 'Przekroczono dzienny limit zapytań AI. Proszę spróbować ponownie jutro.'
  }
});

module.exports = {
  createRateLimiter,
  rateLimiter,
  aiApiLimiter,
  authLimiter,
  apiLimiter,
  aiLimiter
}; 
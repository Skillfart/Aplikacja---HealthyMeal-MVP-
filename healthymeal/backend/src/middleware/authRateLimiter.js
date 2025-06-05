const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Konfiguracja limitera dla prób logowania
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // limit 5 prób
  skipSuccessfulRequests: true, // nie liczmy udanych prób
  handler: (req, res) => {
    logger.warn('Przekroczono limit prób logowania', {
      ip: req.ip,
      email: req.body.email
    });
    
    res.status(429).json({
      error: 'Zbyt wiele nieudanych prób logowania. Konto zostało tymczasowo zablokowane. Spróbuj ponownie za 15 minut.'
    });
  }
});

// Konfiguracja limitera dla resetowania hasła
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minut
  max: 3, // limit 3 próby
  handler: (req, res) => {
    logger.warn('Przekroczono limit prób resetowania hasła', {
      ip: req.ip,
      email: req.body.email
    });
    
    res.status(429).json({
      error: 'Zbyt wiele prób resetowania hasła. Spróbuj ponownie za godzinę.'
    });
  }
});

module.exports = {
  loginLimiter,
  passwordResetLimiter
}; 
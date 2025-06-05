const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');
const logger = require('../utils/logger');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Tablica testowych ID dla celów deweloperskich
const testIds = [
  'test-recipe-1',
  'test-recipe-2',
  'test-recipe-3',
  'sample-recipe-1',
  'sample-recipe-2'
];

// Inicjalizacja klienta Supabase
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

/**
 * Middleware do weryfikacji tokena JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = (req, res, next) => {
  try {
    // Sprawdź czy mamy token w nagłówku
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Brak tokenu autoryzacji' });
    }

    // Token powinien być w formacie "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Nieprawidłowy format tokenu' });
    }

    // Weryfikuj token
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    // Dodaj dane użytkownika do obiektu request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    logger.error('Błąd autoryzacji:', error);
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

/**
 * Middleware do weryfikacji limitu AI
 */
const checkAILimit = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.hasRemainingAIModifications()) {
      return res.status(429).json({
        error: 'AI daily limit exceeded',
        limit: 5,
        current: user.aiUsage.count,
        nextReset: new Date(user.aiUsage.date).setHours(24, 0, 0, 0)
      });
    }

    next();
  } catch (error) {
    logger.error('AI limit check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  authMiddleware,
  checkAILimit,
  testIds
}; 
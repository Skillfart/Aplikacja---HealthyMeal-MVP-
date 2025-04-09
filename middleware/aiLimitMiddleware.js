const userService = require('../services/userService');
const config = require('../config/env');

/**
 * Middleware weryfikujący limity użycia AI
 * @param {Object} req - Obiekt żądania
 * @param {Object} res - Obiekt odpowiedzi
 * @param {Function} next - Funkcja przekazująca sterowanie do następnego middleware
 */
async function checkAIUsageLimit(req, res, next) {
  try {
    // Sprawdzenie, czy użytkownik ma dostępne modyfikacje AI
    const usage = await userService.checkAIUsageLimit(req.user._id);
    
    if (!usage.hasRemainingModifications) {
      return res.status(403).json({
        message: "Daily AI modification limit exceeded. Limit: 5 modifications per day.",
        aiUsage: {
          count: usage.aiUsage.count,
          limit: usage.dailyLimit,
          remainingModifications: 0
        },
        nextResetDate: new Date(
          usage.aiUsage.date.getFullYear(),
          usage.aiUsage.date.getMonth(),
          usage.aiUsage.date.getDate() + 1
        ).toISOString()
      });
    }
    
    // Dodanie informacji o limitach do obiektu req
    req.aiUsage = usage;
    
    next();
  } catch (error) {
    console.error('Error checking AI usage limit:', error);
    return res.status(500).json({ message: 'Error checking AI usage limits' });
  }
}

module.exports = {
  checkAIUsageLimit
}; 
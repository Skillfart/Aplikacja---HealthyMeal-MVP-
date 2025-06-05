const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Middleware do sprawdzania limitu użycia AI
 */
const checkAILimit = async (req, res, next) => {
  try {
    // Sprawdź czy użytkownik ma ustawiony limit
    if (!req.user.aiUsage) {
      req.user.aiUsage = {
        count: 0,
        limit: config.aiDailyLimit,
        lastReset: new Date()
      };
      await req.user.save();
    }

    // Sprawdź czy minął dzień od ostatniego resetu
    const now = new Date();
    const lastReset = new Date(req.user.aiUsage.lastReset);
    const daysPassed = (now - lastReset) / (1000 * 60 * 60 * 24);

    if (daysPassed >= 1) {
      // Reset licznika
      req.user.aiUsage.count = 0;
      req.user.aiUsage.lastReset = now;
      await req.user.save();
      logger.info(`Reset AI usage counter for user: ${req.user.email}`);
    }

    // Sprawdź limit
    if (req.user.aiUsage.count >= req.user.aiUsage.limit) {
      logger.warn(`AI usage limit exceeded for user: ${req.user.email}`);
      return res.status(429).json({
        error: 'AI Usage Limit Exceeded',
        message: 'You have reached your daily AI usage limit',
        limit: req.user.aiUsage.limit,
        count: req.user.aiUsage.count,
        nextReset: new Date(lastReset.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    next();
  } catch (error) {
    logger.error('Error checking AI limit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  checkAILimit
};
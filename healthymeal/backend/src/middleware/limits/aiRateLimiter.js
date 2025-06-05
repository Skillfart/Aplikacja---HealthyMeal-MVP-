const { RateLimitError } = require('../../errors/BaseError');
const User = require('../../models/User');
const config = require('../../config');

const AI_DAILY_LIMIT = 5;
const AI_HOURLY_LIMIT = 3;
const AI_MINUTE_LIMIT = 1;

const aiRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = Date.now();
    
    // Pobierz lub stwórz dokument użytkownika z limitami
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Inicjalizuj liczniki jeśli nie istnieją
    if (!user.aiUsage) {
      user.aiUsage = {
        minuteCount: 0,
        hourCount: 0,
        dayCount: 0,
        lastMinute: now,
        lastHour: now,
        lastDay: now
      };
    }

    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);
    const day = Math.floor(now / 86400000);

    // Reset liczników jeśli minął odpowiedni czas
    if (Math.floor(user.aiUsage.lastMinute / 60000) < minute) {
      user.aiUsage.minuteCount = 0;
      user.aiUsage.lastMinute = now;
    }
    if (Math.floor(user.aiUsage.lastHour / 3600000) < hour) {
      user.aiUsage.hourCount = 0;
      user.aiUsage.lastHour = now;
    }
    if (Math.floor(user.aiUsage.lastDay / 86400000) < day) {
      user.aiUsage.dayCount = 0;
      user.aiUsage.lastDay = now;
    }

    // Sprawdź limity
    if (user.aiUsage.dayCount >= AI_DAILY_LIMIT) {
      throw new RateLimitError('Przekroczono dzienny limit zapytań AI', {
        limit: AI_DAILY_LIMIT,
        remaining: 0,
        resetTime: (day + 1) * 86400000,
      });
    }

    if (user.aiUsage.hourCount >= AI_HOURLY_LIMIT) {
      throw new RateLimitError('Przekroczono godzinny limit zapytań AI', {
        limit: AI_HOURLY_LIMIT,
        remaining: 0,
        resetTime: (hour + 1) * 3600000,
      });
    }

    if (user.aiUsage.minuteCount >= AI_MINUTE_LIMIT) {
      throw new RateLimitError('Przekroczono minutowy limit zapytań AI', {
        limit: AI_MINUTE_LIMIT,
        remaining: 0,
        resetTime: (minute + 1) * 60000,
      });
    }

    // Zwiększ liczniki
    user.aiUsage.minuteCount++;
    user.aiUsage.hourCount++;
    user.aiUsage.dayCount++;

    // Zapisz zmiany
    await user.save();

    // Dodaj informacje o limitach do odpowiedzi
    res.set({
      'X-RateLimit-Limit-Daily': AI_DAILY_LIMIT,
      'X-RateLimit-Remaining-Daily': AI_DAILY_LIMIT - user.aiUsage.dayCount,
      'X-RateLimit-Reset-Daily': (day + 1) * 86400000,
    });

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware do resetowania dziennego licznika
const resetDailyAILimit = async () => {
  try {
    await User.updateMany(
      {},
      { 
        $set: { 
          'aiUsage.dayCount': 0,
          'aiUsage.lastDay': Date.now() 
        } 
      }
    );
  } catch (error) {
    console.error('Błąd podczas resetowania limitów AI:', error);
  }
};

module.exports = {
  aiRateLimiter,
  resetDailyAILimit,
}; 
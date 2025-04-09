const User = require('../models/User');
const config = require('../config/env');

/**
 * Sprawdza, czy użytkownik może wykonać kolejną modyfikację AI
 * @param {string} userId - ID użytkownika
 * @returns {Promise<Object>} - Obiekt z informacjami o limicie AI
 */
async function checkAIUsageLimit(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const hasRemaining = user.hasRemainingAIModifications(config.AI_DAILY_LIMIT);
    
    // Przygotowanie danych dla klienta
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Resetowanie licznika, jeśli to nowy dzień
    if (!user.aiUsage.date || user.aiUsage.date < today) {
      user.aiUsage.date = today;
      user.aiUsage.count = 0;
      await user.save();
    }
    
    return {
      hasRemainingModifications: hasRemaining,
      aiUsage: {
        date: user.aiUsage.date,
        count: user.aiUsage.count
      },
      dailyLimit: config.AI_DAILY_LIMIT,
      remainingModifications: Math.max(0, config.AI_DAILY_LIMIT - user.aiUsage.count)
    };
  } catch (error) {
    console.error('Error checking AI usage limit:', error);
    throw error;
  }
}

/**
 * Inkrementuje licznik użycia AI dla użytkownika
 * @param {string} userId - ID użytkownika
 * @returns {Promise<Object>} - Zaktualizowany obiekt użytkownika
 */
async function incrementAIUsageCounter(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Resetowanie licznika, jeśli to nowy dzień
    if (!user.aiUsage.date || user.aiUsage.date < today) {
      user.aiUsage.date = today;
      user.aiUsage.count = 1;
    } else {
      user.aiUsage.count += 1;
    }
    
    await user.save();
    return user;
  } catch (error) {
    console.error('Error incrementing AI usage counter:', error);
    throw error;
  }
}

module.exports = {
  checkAIUsageLimit,
  incrementAIUsageCounter
}; 
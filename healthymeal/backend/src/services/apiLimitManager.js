/**
 * Serwis do zarządzania limitami API
 * Pozwala na monitorowanie i kontrolowanie użycia zewnętrznych API
 */
const User = require('../models/User');
const config = require('../config/env');

class ApiLimitManager {
  constructor() {
    this.requestCounts = new Map(); // Mapa do śledzenia liczby zapytań
    this.resetInterval = 24 * 60 * 60 * 1000; // 24 godziny w milisekundach
    
    // Resetuj liczniki co 24 godziny
    setInterval(() => this._resetCounters(), this.resetInterval);
  }
  
  /**
   * Sprawdza czy użytkownik przekroczył dzienny limit zapytań AI
   * @param {Object} user - Obiekt użytkownika
   * @returns {Object} - Informacje o limitach i czy przekroczono limit
   */
  async checkUserAILimit(user) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let usedCount = 0;
    let remainingCount = config.AI_DAILY_LIMIT;
    
    if (user.aiUsage && user.aiUsage.date >= todayStart) {
      usedCount = user.aiUsage.count;
      remainingCount = Math.max(0, config.AI_DAILY_LIMIT - usedCount);
    }
    
    const limitExceeded = usedCount >= config.AI_DAILY_LIMIT;
    
    return {
      limitExceeded,
      usedCount,
      remainingCount,
      dailyLimit: config.AI_DAILY_LIMIT,
      resetAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    };
  }
  
  /**
   * Zwiększa licznik użycia AI dla użytkownika
   * @param {Object} user - Obiekt użytkownika
   * @returns {Promise<Object>} - Zaktualizowane informacje o limitach
   */
  async incrementUserAIUsage(user) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (!user.aiUsage || user.aiUsage.date < todayStart) {
      user.aiUsage = {
        date: today,
        count: 1
      };
    } else {
      user.aiUsage.count += 1;
    }
    
    await user.save();
    
    return {
      usedCount: user.aiUsage.count,
      remainingCount: Math.max(0, config.AI_DAILY_LIMIT - user.aiUsage.count),
      dailyLimit: config.AI_DAILY_LIMIT
    };
  }
  
  /**
   * Monitoruje użycie API przez określonego klienta (np. IP)
   * @param {string} clientId - Identyfikator klienta (np. adres IP)
   * @param {number} limitPerTimeFrame - Limit zapytań w danym oknie czasowym
   * @param {string} apiName - Nazwa API do monitorowania
   * @returns {boolean} - True jeśli nie przekroczono limitu, false w przeciwnym razie
   */
  checkRateLimit(clientId, limitPerTimeFrame, apiName = 'default') {
    const key = `${clientId}:${apiName}`;
    const currentCount = this.requestCounts.get(key) || 0;
    
    if (currentCount >= limitPerTimeFrame) {
      return false; // Przekroczono limit
    }
    
    this.requestCounts.set(key, currentCount + 1);
    return true; // Nie przekroczono limitu
  }
  
  /**
   * Zwraca aktualne statystyki użycia API
   * @returns {Object} - Statystyki użycia dla wszystkich klientów
   */
  getUsageStatistics() {
    const stats = {};
    
    for (const [key, count] of this.requestCounts.entries()) {
      const [clientId, apiName] = key.split(':');
      
      if (!stats[apiName]) {
        stats[apiName] = {};
      }
      
      stats[apiName][clientId] = count;
    }
    
    return stats;
  }
  
  /**
   * Resetuje wszystkie liczniki zapytań
   * @private
   */
  _resetCounters() {
    this.requestCounts.clear();
    console.log(`[${new Date().toISOString()}] API rate limit counters reset`);
  }
}

// Eksportuj pojedynczą instancję
const apiLimitManager = new ApiLimitManager();
module.exports = apiLimitManager; 
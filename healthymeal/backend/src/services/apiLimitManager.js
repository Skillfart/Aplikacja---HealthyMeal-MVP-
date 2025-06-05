/**
 * Serwis do zarządzania limitami API
 * Śledzi wykorzystanie API przez użytkowników i zarządza resetem limitów
 */

const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ApiLimitManager {
  constructor() {
    this.dataFile = path.join(__dirname, '../../data/api_limits.json');
    this.limits = null;
    this._ensureDataFile();
  }

  /**
   * Upewnia się, że plik z danymi istnieje
   * @private
   */
  async _ensureDataFile() {
    try {
      await fs.access(this.dataFile);
    } catch (error) {
      // Plik nie istnieje, utwórz katalog i pusty plik
      const dir = path.dirname(this.dataFile);
      
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (mkdirError) {
        if (mkdirError.code !== 'EEXIST') {
          logger.error(`Błąd podczas tworzenia katalogu dla limitów API: ${mkdirError.message}`);
        }
      }
      
      await this._saveData({});
      logger.info(`Utworzono nowy plik do śledzenia limitów API: ${this.dataFile}`);
    }
  }

  /**
   * Ładuje dane z pliku
   * @private
   * @returns {Promise<Object>} Dane limitów API
   */
  async _loadData() {
    if (this.limits) {
      return this.limits;
    }
    
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      this.limits = JSON.parse(data);
      return this.limits;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Plik nie istnieje, utwórz go
        this.limits = {};
        await this._saveData(this.limits);
        return this.limits;
      }
      
      logger.error(`Błąd podczas wczytywania limitów API: ${error.message}`);
      return {};
    }
  }

  /**
   * Zapisuje dane do pliku
   * @private
   * @param {Object} data - Dane do zapisania
   * @returns {Promise<void>}
   */
  async _saveData(data) {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2), 'utf8');
      this.limits = data;
    } catch (error) {
      logger.error(`Błąd podczas zapisywania limitów API: ${error.message}`);
    }
  }

  /**
   * Pobiera limity użytkownika
   * @param {string} userId - ID użytkownika
   * @returns {Promise<Object>} Informacje o limitach
   */
  async getUserLimits(userId) {
    const data = await this._loadData();
    const today = new Date().toISOString().split('T')[0];
    
    // Jeśli nie ma rekordu dla tego użytkownika lub data się nie zgadza, utwórz nowy
    if (!data[userId] || data[userId].date !== today) {
      data[userId] = {
        id: userId,
        date: today,
        usedToday: 0,
        lastReset: new Date().toISOString()
      };
      
      await this._saveData(data);
    }
    
    return data[userId];
  }

  /**
   * Zwiększa licznik wykorzystania API dla użytkownika
   * @param {string} userId - ID użytkownika
   * @returns {Promise<Object>} Zaktualizowane informacje o limitach
   */
  async incrementUsage(userId) {
    const data = await this._loadData();
    const today = new Date().toISOString().split('T')[0];
    
    // Jeśli nie ma rekordu dla tego użytkownika lub data się nie zgadza, utwórz nowy
    if (!data[userId] || data[userId].date !== today) {
      data[userId] = {
        id: userId,
        date: today,
        usedToday: 0,
        lastReset: new Date().toISOString()
      };
    }
    
    // Zwiększ licznik
    data[userId].usedToday += 1;
    data[userId].lastUpdate = new Date().toISOString();
    
    // Zapisz zmiany
    await this._saveData(data);
    
    return data[userId];
  }

  /**
   * Resetuje licznik wykorzystania API dla użytkownika
   * @param {string} userId - ID użytkownika
   * @returns {Promise<Object>} Zaktualizowane informacje o limitach
   */
  async resetUsage(userId) {
    const data = await this._loadData();
    const today = new Date().toISOString().split('T')[0];
    
    data[userId] = {
      id: userId,
      date: today,
      usedToday: 0,
      lastReset: new Date().toISOString()
    };
    
    // Zapisz zmiany
    await this._saveData(data);
    
    return data[userId];
  }
  
  /**
   * Pobiera statystyki wykorzystania API dla wszystkich użytkowników
   * @returns {Promise<Object>} Statystyki wykorzystania
   */
  async getStats() {
    const data = await this._loadData();
    const today = new Date().toISOString().split('T')[0];
    
    // Agregacja danych
    const stats = {
      totalUsers: Object.keys(data).length,
      activeToday: 0,
      totalRequestsToday: 0,
      usersAtLimit: 0,
      date: today
    };
    
    // Limit dzienny
    const maxDailyRequests = parseInt(process.env.AI_DAILY_LIMIT, 10) || 10;
    
    // Oblicz statystyki
    for (const userId in data) {
      const userRecord = data[userId];
      
      if (userRecord.date === today) {
        stats.activeToday++;
        stats.totalRequestsToday += userRecord.usedToday;
        
        if (userRecord.usedToday >= maxDailyRequests) {
          stats.usersAtLimit++;
        }
      }
    }
    
    return stats;
  }
}

module.exports = ApiLimitManager; 
const NodeCache = require('node-cache');
const logger = require('./logger');

class Cache {
  constructor(ttlSeconds = 3600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });

    this.cache.on('expired', (key, value) => {
      logger.debug('Cache entry expired:', { key });
    });
  }

  async get(key) {
    try {
      const value = this.cache.get(key);
      return value || null;
    } catch (error) {
      logger.error('Cache get error:', { key, error });
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      return this.cache.set(key, value, ttl);
    } catch (error) {
      logger.error('Cache set error:', { key, error });
      return false;
    }
  }

  async del(key) {
    try {
      return this.cache.del(key);
    } catch (error) {
      logger.error('Cache delete error:', { key, error });
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const keys = this.cache.keys();
      const regex = new RegExp(pattern);
      const matchingKeys = keys.filter(key => regex.test(key));
      return this.cache.del(matchingKeys);
    } catch (error) {
      logger.error('Cache delete pattern error:', { pattern, error });
      return false;
    }
  }

  async exists(key) {
    try {
      return this.cache.has(key);
    } catch (error) {
      logger.error('Cache exists error:', { key, error });
      return false;
    }
  }

  async ttl(key) {
    try {
      const stats = this.cache.getTtl(key);
      if (!stats) return -2;
      const now = Date.now();
      return Math.max(0, Math.floor((stats - now) / 1000));
    } catch (error) {
      logger.error('Cache TTL error:', { key, error });
      return -2;
    }
  }

  async clear() {
    try {
      return this.cache.flushAll();
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  // Dodatkowe metody specyficzne dla node-cache
  getStats() {
    return this.cache.getStats();
  }

  keys() {
    return this.cache.keys();
  }
}

// Eksportuj pojedynczą instancję
module.exports = new Cache(); 
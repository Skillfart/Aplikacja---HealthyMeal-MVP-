const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthymeal',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  
  // Konfiguracja API AI
  AI_API_KEY: process.env.AI_API_KEY,
  AI_API_URL: process.env.AI_API_URL || 'https://api.anthropic.com/v1/complete',
  AI_MODEL: process.env.AI_MODEL || 'claude-2',
  AI_TIMEOUT: parseInt(process.env.AI_TIMEOUT || '30000'),
  
  // Limity użycia AI
  AI_DAILY_LIMIT: parseInt(process.env.AI_DAILY_LIMIT || '5'),
  
  // Konfiguracja cache
  CACHE_TTL_HOURS: parseInt(process.env.CACHE_TTL_HOURS || '24')
}; 
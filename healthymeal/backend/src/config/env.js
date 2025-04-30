/**
 * Konfiguracja zmiennych środowiskowych
 * Plik ten zawiera domyślne wartości, które mogą być nadpisane przez zmienne środowiskowe
 */

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB - dla kompatybilności
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthymeal',
  
  // JWT - dla kompatybilności
  JWT_SECRET: process.env.JWT_SECRET || 'healthymeal-jwt-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Supabase - nowa konfiguracja autentykacji
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  
  // API Limits
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minut
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 zapytań na okno
  
  // AI usage limits
  AI_DAILY_LIMIT: parseInt(process.env.AI_DAILY_LIMIT) || 10
}; 
const config = require('./config');

function validateConfig() {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'OPENAI_API_KEY',
    'ALLOWED_ORIGINS'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Brakujące wymagane zmienne środowiskowe: ${missingVars.join(', ')}`);
  }

  // Walidacja wartości
  if (isNaN(Number(process.env.PORT))) {
    throw new Error('PORT musi być liczbą');
  }

  if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error('Nieprawidłowy format MONGODB_URI');
  }

  // Walidacja URL Supabase
  try {
    new URL(process.env.SUPABASE_URL);
  } catch (error) {
    throw new Error('Nieprawidłowy format SUPABASE_URL');
  }

  // Walidacja kluczy Supabase
  if (!process.env.SUPABASE_ANON_KEY.startsWith('eyJ')) {
    throw new Error('Nieprawidłowy format SUPABASE_ANON_KEY');
  }

  if (!process.env.SUPABASE_SERVICE_KEY.startsWith('eyJ')) {
    throw new Error('Nieprawidłowy format SUPABASE_SERVICE_KEY');
  }

  // Walidacja konfiguracji rate limitingu
  if (config.rateLimits.auth.maxRequests < 1 || config.rateLimits.auth.windowMs < 1000) {
    throw new Error('Nieprawidłowa konfiguracja rate limitingu dla autentykacji');
  }

  if (config.rateLimits.api.maxRequests < 1 || config.rateLimits.api.windowMs < 1000) {
    throw new Error('Nieprawidłowa konfiguracja rate limitingu dla API');
  }

  if (config.rateLimits.ai.maxRequests < 1 || config.rateLimits.ai.windowMs < 1000) {
    throw new Error('Nieprawidłowa konfiguracja rate limitingu dla AI');
  }

  return true;
}

module.exports = validateConfig; 
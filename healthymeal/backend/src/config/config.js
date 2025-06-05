const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Sprawdź różne sposoby, w których może być ustawiony tryb testowy
const isTestModeFromEnv = process.env.NODE_ENV === 'test' || 
                         process.env.TEST_MODE === 'true' || 
                         process.env.VITEST === 'true';

// Ładowanie zmiennych środowiskowych z env.config.json (jeśli istnieje)
const configJsonPath = path.resolve(process.cwd(), 'env.config.json');
let configFromJson = {};

// Jeśli plik konfiguracyjny istnieje, załaduj go
if (fs.existsSync(configJsonPath)) {
  try {
    const rawConfig = fs.readFileSync(configJsonPath, 'utf8');
    configFromJson = JSON.parse(rawConfig);
    console.log(`Załadowano konfigurację z ${configJsonPath}`);
    
    // Określ środowisko
    const env = process.env.NODE_ENV || 'development';
    console.log(`Uruchamianie w środowisku: ${env}`);
    
    // Pobierz konfigurację dla danego środowiska i wspólną
    const envConfig = configFromJson[env] || {};
    const commonConfig = configFromJson.common || {};
    
    // Połącz konfiguracje
    const mergedConfig = { ...commonConfig, ...envConfig };
    
    console.log('Inicjalizacja konfiguracji backendu z:', configJsonPath);
    console.log(`Ustawianie ${Object.keys(mergedConfig).length} zmiennych środowiskowych`);
    
    // Ustaw zmienne środowiskowe z konfiguracji
    Object.keys(mergedConfig).forEach(key => {
      process.env[key] = mergedConfig[key];
    });
    
    console.log('Zmienne środowiskowe zostały ustawione pomyślnie');
    
    // Zapisz połączoną konfigurację do użycia w module
    configFromJson = mergedConfig;
    
    // Jeśli konfiguracja JSON wskazuje na tryb testowy, ustaw flagę
    if (env === 'test' || configFromJson.TEST_MODE === 'true') {
      process.env.TEST_MODE = 'true';
    }
  } catch (error) {
    console.error(`Błąd ładowania konfiguracji z JSON: ${error.message}`);
  }
}

// Ostateczne ustalenie trybu testowego
const isTestMode = isTestModeFromEnv || 
                  configFromJson.TEST_MODE === 'true' ||
                  process.env.NODE_ENV === 'test';

// Ładowanie zmiennych środowiskowych z pliku .env (jeśli istnieje)
const getEnvFilePath = () => {
  // W trybie testowym próbujemy załadować .env.test
  if (isTestMode) {
    const testEnvPath = path.resolve(process.cwd(), '.env.test');
    if (fs.existsSync(testEnvPath)) {
      console.log('Używanie konfiguracji .env.test dla trybu testowego');
      return testEnvPath;
    }
  }
  
  // Domyślny plik .env
  return path.resolve(process.cwd(), '.env');
};

const envPath = getEnvFilePath();
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`Błąd ładowania pliku .env: ${result.error.message}`);
  } else {
    console.log(`Załadowano zmienne środowiskowe z ${envPath}`);
  }
}

// Jeśli wykryliśmy tryb testowy, wymuś ustawienie zmiennych środowiskowych
if (isTestMode) {
  process.env.NODE_ENV = 'test';
  process.env.TEST_MODE = 'true';
  
  // Ustaw bazę danych testową, jeśli nie jest jawnie zdefiniowana
  if (!process.env.MONGODB_URI && !configFromJson.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/healthymeal_test';
  }
  
  console.log('Wymuszono tryb testowy dla aplikacji');
}

// Wykryj czy mamy uruchamiać z mockami czy bez
const shouldUseMocks = () => {
  // Jeśli explicite ustawiono w środowisku
  if (process.env.USE_MOCKS === 'false') {
    console.log('USE_MOCKS=false ustawione w zmiennych środowiskowych');
    return false;
  }
  
  if (process.env.USE_MOCKS === 'true') {
    console.log('USE_MOCKS=true ustawione w zmiennych środowiskowych');
    return true;
  }
  
  // Jeśli ustawiono w pliku konfiguracyjnym
  if (configFromJson.USE_MOCKS === 'false') {
    console.log('USE_MOCKS=false ustawione w pliku konfiguracyjnym');
    return false;
  }
  
  if (configFromJson.USE_MOCKS === 'true') {
    console.log('USE_MOCKS=true ustawione w pliku konfiguracyjnym');
    return true;
  }
  
  // Domyślna logika - w trybie testowym używaj mocków, chyba że jawnie wyłączono
  console.log(`Używanie domyślnej wartości USE_MOCKS=${isTestMode}`);
  return isTestMode;
};

const useMocks = shouldUseMocks();
console.log(`Tryb mocków: ${useMocks ? 'WŁĄCZONY' : 'WYŁĄCZONY'}`);

// Logowanie inicjalizacji Supabase
console.log(`Inicjalizacja Supabase - URL: ${process.env.SUPABASE_URL ? 'ustawiony' : 'brak'}`);
console.log(`Pomijanie uwierzytelniania (SKIP_AUTH): ${process.env.SKIP_AUTH === 'true' ? 'WŁĄCZONE' : 'WYŁĄCZONE'}`);

// Priorytet zmiennych: process.env > configFromJson > domyślne wartości
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: 3001,
  mongoUri: process.env.MONGODB_URI,
  debug: process.env.DEBUG === 'true',
  testMode: process.env.TEST_MODE === 'true',
  useMocks: process.env.USE_MOCKS === 'true',
  skipAuth: process.env.SKIP_AUTH === 'true',
  
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET
  },

  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'gpt-4o-mini',
    referer: process.env.OPENROUTER_REFERER || 'https://healthymeal.app'
  },

  rateLimits: {
    api: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minut
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },
    auth: {
      windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) || 900000, // 15 minut
      max: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS, 10) || 5
    },
    ai: {
      windowMs: parseInt(process.env.RATE_LIMIT_AI_WINDOW_MS, 10) || 900000, // 15 minut
      max: parseInt(process.env.RATE_LIMIT_AI_MAX_REQUESTS, 10) || 10
    }
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001']
  },

  ai: {
    dailyLimit: parseInt(process.env.AI_DAILY_LIMIT, 10) || 5
  }
};

/**
 * Walidacja konfiguracji
 * Sprawdza czy wszystkie wymagane zmienne środowiskowe są ustawione
 * i czy mają prawidłowe wartości
 */
function validateConfig() {
  // Dla testów pozwalamy na brak niektórych zmiennych
  if (isTestMode) {
    return;
  }

  const requiredVars = [
    'MONGODB_URI',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => 
    !process.env[varName] && !configFromJson[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(`Brakujące wymagane zmienne środowiskowe: ${missingVars.join(', ')}`);
  }

  // Walidacja wartości
  if (config.port && (isNaN(config.port) || config.port < 1 || config.port > 65535)) {
    throw new Error('PORT musi być liczbą z zakresu 1-65535');
  }

  // Walidacja URI MongoDB
  if (config.mongoUri && 
      !config.mongoUri.startsWith('mongodb://') && 
      !config.mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('Nieprawidłowy format MONGODB_URI');
  }

  // Walidacja URL Supabase
  if (config.supabase.url) {
    try {
      new URL(config.supabase.url);
    } catch (error) {
      throw new Error('Nieprawidłowy format SUPABASE_URL');
    }
  }

  // Walidacja kluczy Supabase
  if (config.supabase.anonKey && !config.supabase.anonKey.startsWith('eyJ')) {
    throw new Error('Nieprawidłowy format SUPABASE_ANON_KEY');
  }

  if (config.supabase.serviceKey && !config.supabase.serviceKey.startsWith('eyJ')) {
    throw new Error('Nieprawidłowy format SUPABASE_SERVICE_KEY');
  }

  return;
}

// Eksport konfiguracji i funkcji walidacji
module.exports = {
  ...config,
  validateConfig,
  isTestMode
}; 
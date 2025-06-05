/**
 * Konfiguracja zmiennych środowiskowych
 * Plik ten zawiera domyślne wartości, które mogą być nadpisane przez zmienne środowiskowe
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Określenie środowiska aplikacji
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`Uruchamianie w środowisku: ${nodeEnv}`);

// Ścieżki do plików konfiguracyjnych
const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
const defaultEnvPath = path.resolve(process.cwd(), '.env');

// Najpierw próbujemy załadować plik specyficzny dla środowiska
if (fs.existsSync(envPath)) {
  console.log(`Ładowanie konfiguracji z pliku: ${envPath}`);
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`Błąd podczas ładowania pliku ${envPath}:`, result.error);
  }
} 

// Następnie ładujemy domyślny plik .env (jeśli istnieje)
if (fs.existsSync(defaultEnvPath)) {
  console.log(`Ładowanie domyślnej konfiguracji z pliku: ${defaultEnvPath}`);
  const result = dotenv.config({ path: defaultEnvPath });
  if (result.error) {
    console.error(`Błąd podczas ładowania pliku ${defaultEnvPath}:`, result.error);
  }
}

// Ładowanie zmiennych środowiskowych z pliku konfiguracyjnego
// i ustawianie ich w obiekcie process.env
function loadEnvFromJsonFile(configPath) {
  try {
    console.log(`Ładowanie konfiguracji z pliku: ${configPath}`);
    
    // Sprawdź, czy plik istnieje
    if (!fs.existsSync(configPath)) {
      console.error(`Plik konfiguracyjny nie istnieje: ${configPath}`);
      return null;
    }
    
    // Wczytaj zawartość pliku i sparsuj jako JSON
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    const envVars = {};
    
    // Iteruj przez wszystkie pary klucz-wartość w obiekcie konfiguracyjnym
    // i ustaw odpowiednie zmienne środowiskowe
    console.log(`Ustawianie ${Object.keys(configData).length} zmiennych środowiskowych`);
    Object.entries(configData).forEach(([key, value]) => {
      // Ustaw zmienną środowiskową
      process.env[key] = String(value);
      
      // Zachowaj wartość w obiekcie envVars
      envVars[key] = String(value);
    });
    
    console.log("Zmienne środowiskowe zostały ustawione pomyślnie");
    return envVars;
  } catch (error) {
    console.error(`Błąd podczas ładowania konfiguracji z pliku JSON: ${error.message}`);
    return null;
  }
}

// Funkcja pomocnicza do aktualizowania domyślnych wartości
// poprzez załadowanie ich z pliku .env
function loadEnvFile(filePath) {
  try {
    // Sprawdź, czy plik istnieje
    if (!fs.existsSync(filePath)) {
      console.error(`Plik .env nie istnieje: ${filePath}`);
      return false;
    }
    
    console.log(`Ładowanie domyślnej konfiguracji z pliku: ${filePath}`);
    
    // Załaduj zmienne środowiskowe z pliku .env
    dotenv.config({ path: filePath });
    
    return true;
  } catch (error) {
    console.error(`Błąd podczas ładowania pliku .env: ${error.message}`);
    return false;
  }
}

// Eksportuj zmienne, które mają być dostępne w aplikacji
module.exports = {
  // Środowisko
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Serwer
  port: parseInt(process.env.PORT, 10) || 3001,
  
  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthymeal',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  
  // OpenRouter (AI)
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-sonnet',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // AI
  aiDailyLimit: parseInt(process.env.AI_DAILY_LIMIT, 10) || 5,
  
  // Cache
  cacheEnabled: process.env.CACHE_ENABLED === 'true',
  cacheTtl: parseInt(process.env.CACHE_TTL, 10) || 86400, // 24 godziny
  
  // Logi
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Limity
  maxRequestSize: '10mb',
  
  // Dostępne publiczne funkcje
  loadEnvFromJsonFile,
  loadEnvFile
}; 
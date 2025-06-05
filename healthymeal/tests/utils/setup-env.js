/**
 * Konfiguracja środowiska testowego
 * Ten plik odpowiada za ustawienie odpowiednich zmiennych środowiskowych dla testów
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Domyślne środowisko testowe
const DEFAULT_TEST_ENV = {
  NODE_ENV: 'test',
  REACT_APP_TEST_MODE: 'true',
  REACT_APP_NODE_ENV: 'test',
  TEST_MODE: 'true',
  USE_MOCKS: 'false', // Domyślnie nie używamy mocków
  MONGODB_URI: 'mongodb://localhost:27017/healthymeal_test',
  PORT: '3031',
};

/**
 * Ładuje konfigurację z pliku JSON
 * @param {string} configPath - ścieżka do pliku konfiguracyjnego
 * @returns {Object|null} - załadowana konfiguracja lub null w przypadku błędu
 */
export function loadConfig(configPath) {
  try {
    console.log(`Ładowanie konfiguracji z pliku: ${configPath}`);
    
    // Sprawdź, czy plik istnieje
    if (!fs.existsSync(configPath)) {
      console.error(`Plik konfiguracyjny nie istnieje: ${configPath}`);
      return null;
    }
    
    // Wczytaj zawartość pliku i sparsuj jako JSON
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error(`Błąd podczas ładowania konfiguracji z pliku JSON: ${error.message}`);
    return null;
  }
}

/**
 * Ładuje zmienne środowiskowe z pliku .env
 * @param {string} envPath - ścieżka do pliku .env
 * @returns {Object|null} - załadowane zmienne środowiskowe lub null w przypadku błędu
 */
export function loadEnvFile(envPath) {
  try {
    if (!fs.existsSync(envPath)) {
      console.error(`Plik .env nie istnieje: ${envPath}`);
      return null;
    }
    
    console.log(`Ładowanie zmiennych z pliku: ${envPath}`);
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    return envConfig;
  } catch (error) {
    console.error(`Błąd podczas ładowania pliku .env: ${error.message}`);
    return null;
  }
}

/**
 * Ustawia zmienne środowiskowe
 * @param {Object} config - konfiguracja do ustawienia
 */
export function setEnvironmentVariables(config) {
  if (!config) {
    console.error('Brak konfiguracji do ustawienia');
    return;
  }
  
  // Iteruj przez wszystkie pary klucz-wartość w obiekcie konfiguracyjnym
  // i ustaw odpowiednie zmienne środowiskowe
  console.log(`Ustawianie ${Object.keys(config).length} zmiennych środowiskowych`);
  Object.entries(config).forEach(([key, value]) => {
    // Ustaw zmienną środowiskową
    process.env[key] = String(value);
    
    // Dla backendu i testów ustaw również odpowiedniki REACT_APP_*
    if (!key.startsWith('REACT_APP_') && ['NODE_ENV', 'TEST_MODE', 'USE_MOCKS', 'DEBUG'].includes(key)) {
      process.env[`REACT_APP_${key}`] = String(value);
    }
    
    // Dla frontendu ustaw również odpowiedniki bez REACT_APP_
    if (key.startsWith('REACT_APP_')) {
      const normalKey = key.replace('REACT_APP_', '');
      process.env[normalKey] = String(value);
    }
  });
  
  console.log("Konfiguracja zmiennych środowiskowych zakończona pomyślnie");
  return true;
}

/**
 * Ładuje konfigurację środowiskową
 * @param {string} env - nazwa środowiska (np. 'test', 'unit', 'e2e')
 * @returns {Object|null} - załadowana konfiguracja lub null w przypadku błędu
 */
export function loadEnvironmentConfig(env = 'test') {
  console.log(`Próba załadowania konfiguracji dla środowiska: ${env}`);
  
  // Ścieżki do plików konfiguracyjnych
  const rootPath = path.resolve(process.cwd(), '..');
  const testConfigPath = path.resolve(process.cwd(), 'env.config.json');
  const frontendConfigPath = path.resolve(rootPath, 'frontend/env.config.json');
  const backendConfigPath = path.resolve(rootPath, 'backend/env.config.json');
  
  // Ładuj konfigurację z różnych źródeł
  const testConfig = loadConfig(testConfigPath);
  const frontendConfig = loadConfig(frontendConfigPath);
  const backendConfig = loadConfig(backendConfigPath);
  
  // Połącz wszystkie konfiguracje, priorytetyzując konfigurację testową
  let config = {
    ...DEFAULT_TEST_ENV,
    ...(backendConfig || {}),
    ...(frontendConfig || {}),
    ...(testConfig || {})
  };
  
  // Ustaw środowisko testowe niezależnie od konfiguracji
  config.NODE_ENV = 'test';
  config.REACT_APP_NODE_ENV = 'test';
  config.TEST_MODE = 'true';
  config.REACT_APP_TEST_MODE = 'true';
  
  // Ustaw zmienne środowiskowe
  setEnvironmentVariables(config);
  
  return config;
}

/**
 * Inicjalizuje konfigurację środowiskową
 * @param {string} env - nazwa środowiska (np. 'test', 'unit', 'e2e')
 */
export default function initializeConfig(env = 'unit') {
  // Ustaw podstawowe zmienne środowiskowe
  process.env.NODE_ENV = 'test';
  process.env.REACT_APP_NODE_ENV = 'test';
  
  // Załaduj pełną konfigurację
  const config = loadEnvironmentConfig(env);
  
  // Wyświetl podstawowe informacje o konfiguracji
  console.log(`Konfiguracja dla środowiska ${env} została zainicjalizowana`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`PORT: ${process.env.PORT}`);
  console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? 'ustawione' : 'brak'}`);
  console.log(`USE_MOCKS: ${process.env.USE_MOCKS}`);
  
  return config;
}

// Automatycznie inicjalizuj konfigurację
initializeConfig(); 
/**
 * Skrypt do synchronizacji konfiguracji między frontendem, backendem i testami
 * 
 * Sposób użycia:
 * node config-sync.js [env]
 * gdzie env to opcjonalny parametr określający środowisko (development, test, production)
 */

import fs from 'fs';
import path from 'path';

// Domyślne środowisko to development
const env = process.argv[2] || 'development';
console.log(`Synchronizacja konfiguracji dla środowiska: ${env}`);

// Ścieżki do plików konfiguracyjnych
const rootPath = path.resolve(process.cwd(), '..');
const frontendConfigPath = path.resolve(rootPath, 'frontend/env.config.json');
const backendConfigPath = path.resolve(rootPath, 'backend/env.config.json');
const testsConfigPath = path.resolve(rootPath, 'tests/env.config.json');

// Domyślna konfiguracja dla różnych środowisk
const defaultConfigs = {
  development: {
    NODE_ENV: 'development',
    REACT_APP_NODE_ENV: 'development',
    MONGODB_URI: 'mongodb://localhost:27017/healthymeal',
    PORT: '3031',
    DEBUG: 'true',
    TEST_MODE: 'false',
    REACT_APP_TEST_MODE: 'false',
    USE_MOCKS: 'false',
    REACT_APP_USE_MOCKS: 'false',
  },
  test: {
    NODE_ENV: 'test',
    REACT_APP_NODE_ENV: 'test',
    MONGODB_URI: 'mongodb://localhost:27017/healthymeal_test',
    PORT: '3031',
    DEBUG: 'true',
    TEST_MODE: 'true',
    REACT_APP_TEST_MODE: 'true',
    USE_MOCKS: 'false',
    REACT_APP_USE_MOCKS: 'false',
  },
  production: {
    NODE_ENV: 'production',
    REACT_APP_NODE_ENV: 'production',
    MONGODB_URI: 'mongodb://localhost:27017/healthymeal',
    PORT: '3031',
    DEBUG: 'false',
    TEST_MODE: 'false',
    REACT_APP_TEST_MODE: 'false',
    USE_MOCKS: 'false',
    REACT_APP_USE_MOCKS: 'false',
  }
};

/**
 * Ładuje konfigurację z pliku JSON
 * @param {string} configPath - ścieżka do pliku konfiguracyjnego
 * @returns {Object|null} - załadowana konfiguracja lub null w przypadku błędu
 */
function loadConfig(configPath) {
  try {
    if (fs.existsSync(configPath)) {
      console.log(`Ładowanie konfiguracji z pliku: ${configPath}`);
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    console.log(`Plik konfiguracyjny nie istnieje: ${configPath}`);
    return null;
  } catch (error) {
    console.error(`Błąd podczas ładowania konfiguracji z pliku JSON: ${error.message}`);
    return null;
  }
}

/**
 * Zapisuje konfigurację do pliku JSON
 * @param {string} configPath - ścieżka do pliku konfiguracyjnego
 * @param {Object} config - konfiguracja do zapisania
 * @returns {boolean} - true jeśli zapisano pomyślnie, false w przypadku błędu
 */
function saveConfig(configPath, config) {
  try {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`Zapisano konfigurację do pliku: ${configPath}`);
    return true;
  } catch (error) {
    console.error(`Błąd podczas zapisywania konfiguracji do pliku JSON: ${error.message}`);
    return false;
  }
}

/**
 * Synchronizuje konfigurację między frontendem, backendem i testami
 * @param {string} env - nazwa środowiska (development, test, production)
 */
function syncConfigs(env) {
  // Załaduj istniejące konfiguracje
  const frontendConfig = loadConfig(frontendConfigPath) || {};
  const backendConfig = loadConfig(backendConfigPath) || {};
  const testsConfig = loadConfig(testsConfigPath) || {};
  
  // Domyślna konfiguracja dla wybranego środowiska
  const defaultConfig = defaultConfigs[env] || defaultConfigs.development;
  
  // Połącz wszystkie konfiguracje
  const mergedConfig = {
    ...defaultConfig,
    ...backendConfig,
    ...frontendConfig,
    ...testsConfig
  };
  
  // Upewnij się, że kluczowe zmienne środowiskowe są ustawione
  mergedConfig.NODE_ENV = env;
  mergedConfig.REACT_APP_NODE_ENV = env;
  
  if (env === 'test') {
    mergedConfig.TEST_MODE = 'true';
    mergedConfig.REACT_APP_TEST_MODE = 'true';
    mergedConfig.MONGODB_URI = 'mongodb://localhost:27017/healthymeal_test';
  } else {
    mergedConfig.TEST_MODE = 'false';
    mergedConfig.REACT_APP_TEST_MODE = 'false';
  }
  
  // Przygotuj konfigurację dla frontendu (dodaj REACT_APP_ do kluczy, które go nie mają)
  const frontendMergedConfig = { ...mergedConfig };
  Object.keys(mergedConfig).forEach(key => {
    if (!key.startsWith('REACT_APP_') && !['NODE_ENV', 'PORT'].includes(key)) {
      frontendMergedConfig[`REACT_APP_${key}`] = mergedConfig[key];
    }
  });
  
  // Zapisz zsynchronizowane konfiguracje
  saveConfig(frontendConfigPath, frontendMergedConfig);
  saveConfig(backendConfigPath, mergedConfig);
  saveConfig(testsConfigPath, mergedConfig);
  
  console.log(`Konfiguracja została zsynchronizowana dla środowiska: ${env}`);
}

// Wykonaj synchronizację
syncConfigs(env); 
const fs = require('fs');
const path = require('path');

/**
 * Ładuje konfigurację z pliku JSON
 * @param {string} configPath - Ścieżka do pliku konfiguracyjnego
 * @returns {Object} - Załadowana konfiguracja
 */
function loadConfig(configPath) {
  try {
    console.log(`Ładowanie konfiguracji z pliku: ${configPath}`);
    
    // Sprawdź, czy plik istnieje
    if (!fs.existsSync(configPath)) {
      console.error(`Plik konfiguracyjny nie istnieje: ${configPath}`);
      return {};
    }
    
    // Wczytaj zawartość pliku
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Parsuj JSON
    const config = JSON.parse(configContent);
    console.log(`Załadowano konfigurację: ${Object.keys(config).join(', ')}`);
    
    return config;
  } catch (error) {
    console.error(`Błąd podczas ładowania konfiguracji: ${error.message}`);
    return {};
  }
}

/**
 * Ustawia zmienne środowiskowe na podstawie załadowanej konfiguracji
 * @param {Object} config - Konfiguracja do załadowania do zmiennych środowiskowych
 */
function setEnvironmentVariables(config) {
  try {
    console.log(`Ustawianie ${Object.keys(config).length} zmiennych środowiskowych`);
    
    // Ustaw każdą zmienną w process.env
    Object.entries(config).forEach(([key, value]) => {
      process.env[key] = value;
    });
    
    console.log('Zmienne środowiskowe zostały ustawione pomyślnie');
  } catch (error) {
    console.error(`Błąd podczas ustawiania zmiennych środowiskowych: ${error.message}`);
  }
}

/**
 * Ładuje konfigurację dla danego środowiska
 * @param {string} environment - Środowisko (tests, backend, frontend)
 * @returns {Object} - Załadowana konfiguracja
 */
function loadEnvironmentConfig(environment = 'tests') {
  try {
    // Najpierw spróbuj z __dirname
    const currentDir = __dirname;
    console.log(`Bieżący katalog: ${currentDir}`);
    
    // Katalog testów to dwa poziomy wyżej od utils
    const testsDir = path.resolve(currentDir, '..');
    console.log(`Katalog testów: ${testsDir}`);
    
    const configPath = path.join(testsDir, 'env.config.json');
    console.log(`Pełna ścieżka do konfiguracji: ${configPath}`);
    
    return loadConfig(configPath);
  } catch (error) {
    console.error(`Błąd podczas ładowania konfiguracji: ${error.message}`);
    return {};
  }
}

/**
 * Inicjalizuje konfigurację dla danego środowiska
 * @param {string} environment - Środowisko (tests, backend, frontend)
 */
function initializeConfig(environment = 'tests') {
  console.log(`Inicjalizacja konfiguracji dla środowiska: ${environment}`);
  
  // Załaduj konfigurację
  const config = loadEnvironmentConfig(environment);
  
  // Ustaw zmienne środowiskowe
  setEnvironmentVariables(config);
  
  return config;
}

module.exports = {
  loadConfig,
  setEnvironmentVariables,
  loadEnvironmentConfig,
  initializeConfig
}; 
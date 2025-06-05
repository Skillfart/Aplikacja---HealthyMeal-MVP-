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
 * Inicjalizuje konfigurację dla backendu
 */
function initializeConfig() {
  // Ścieżka do pliku konfiguracyjnego
  const configPath = path.resolve(__dirname, '../../env.config.json');
  
  console.log(`Inicjalizacja konfiguracji backendu z: ${configPath}`);
  
  // Załaduj konfigurację
  const config = loadConfig(configPath);
  
  // Ustaw zmienne środowiskowe
  setEnvironmentVariables(config);
  
  return config;
}

module.exports = {
  loadConfig,
  setEnvironmentVariables,
  initializeConfig
}; 
/**
 * Konfiguracja środowiska testowego bez mocków
 * Ten skrypt przygotowuje środowisko do testów z rzeczywistymi usługami, bez mockowania
 */

import fs from 'fs';
import path from 'path';
import { loadConfig, loadEnvironmentConfig, setEnvironmentVariables } from './setup-env.js';

console.log('Konfiguracja środowiska testowego bez używania mocków');

// Wymuś ustawienie NODE_ENV=test
process.env.NODE_ENV = 'test';
process.env.REACT_APP_NODE_ENV = 'test';
process.env.TEST_MODE = 'true';
process.env.REACT_APP_TEST_MODE = 'true';

// Wymuś wyłączenie mocków
process.env.USE_MOCKS = 'false';
process.env.REACT_APP_USE_MOCKS = 'false';

// Ścieżki do plików konfiguracyjnych
const rootPath = path.resolve(process.cwd(), '..');
const testsConfigPath = path.resolve(process.cwd(), 'env.config.json');
const frontendConfigPath = path.resolve(rootPath, 'frontend/env.config.json');
const backendConfigPath = path.resolve(rootPath, 'backend/env.config.json');

// Sprawdź czy posiadamy klucz API dla OpenRouter
function checkApiKeys() {
  // Załaduj konfigurację
  const config = loadConfig(testsConfigPath);
  
  if (!config || !config.OPENROUTER_API_KEY) {
    console.warn('\x1b[33m%s\x1b[0m', 'UWAGA: Brak klucza API OpenRouter w konfiguracji!');
    console.warn('\x1b[33m%s\x1b[0m', 'Testy AI mogą nie działać poprawnie bez rzeczywistego klucza API.');
    console.warn('\x1b[33m%s\x1b[0m', 'Dodaj klucz API w pliku env.config.json lub zmiennych środowiskowych.');
    return false;
  }
  
  console.log('\x1b[32m%s\x1b[0m', 'Znaleziono klucz API OpenRouter w konfiguracji.');
  return true;
}

// Zaktualizuj konfigurację
function updateConfig(configPath) {
  try {
    if (!fs.existsSync(configPath)) {
      console.warn(`Plik konfiguracyjny nie istnieje: ${configPath}`);
      return false;
    }
    
    // Załaduj konfigurację
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Aktualizuj ustawienia mocków
    config.USE_MOCKS = 'false';
    config.REACT_APP_USE_MOCKS = 'false';
    
    // Zapisz zaktualizowaną konfigurację
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Zaktualizowano konfigurację w: ${configPath}`);
    
    return true;
  } catch (error) {
    console.error(`Błąd podczas aktualizacji konfiguracji: ${error.message}`);
    return false;
  }
}

// Funkcja główna
async function setupNoMocks() {
  console.log('Rozpoczynam konfigurację środowiska bez mocków');
  
  // Sprawdź czy mamy klucz API
  const hasApiKey = checkApiKeys();
  if (!hasApiKey) {
    console.log('\x1b[33m%s\x1b[0m', 'Kontynuuję konfigurację mimo braku klucza API...');
  }
  
  // Aktualizuj wszystkie pliki konfiguracyjne
  updateConfig(testsConfigPath);
  updateConfig(frontendConfigPath);
  updateConfig(backendConfigPath);
  
  // Załaduj pełną konfigurację
  const config = loadEnvironmentConfig('test');
  
  // Upewnij się, że USE_MOCKS jest ustawione na false
  config.USE_MOCKS = 'false';
  config.REACT_APP_USE_MOCKS = 'false';
  
  // Ustaw zmienne środowiskowe
  setEnvironmentVariables(config);
  
  console.log('\x1b[32m%s\x1b[0m', 'Konfiguracja środowiska bez mocków zakończona pomyślnie!');
  console.log('Uruchom testy za pomocą: npm run test:no-mocks');
}

// Uruchom konfigurację
setupNoMocks();

export default setupNoMocks; 
/**
 * Skrypt do konfiguracji zmiennych środowiskowych dla testów
 * 
 * Ten skrypt powinien być uruchamiany przed testami, aby zapewnić
 * odpowiednią konfigurację zmiennych środowiskowych, nawet jeśli
 * plik .env nie jest dostępny (np. w CI/CD).
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ścieżki do plików .env
const ENV_PATH = path.resolve(__dirname, '../.env');
const ENV_E2E_PATH = path.resolve(__dirname, '../.env.e2e');
const ENV_EXAMPLE_PATH = path.resolve(__dirname, '../.env.example');

/**
 * Ładuje zmienne środowiskowe z odpowiedniego pliku, w zależności od typu testu
 * @param {string} testType - Typ testu (unit, integration, e2e, etc.)
 */
function setupEnv(testType = 'unit') {
  console.log(`Konfigurowanie zmiennych środowiskowych dla testów typu: ${testType}`);
  
  // Sprawdź, czy istnieje plik .env
  if (fs.existsSync(ENV_PATH)) {
    console.log('Ładowanie zmiennych z pliku .env');
    dotenv.config({ path: ENV_PATH });
  } 
  // Dla testów E2E użyj specjalnego pliku konfiguracyjnego
  else if (testType === 'e2e' && fs.existsSync(ENV_E2E_PATH)) {
    console.log('Ładowanie zmiennych z pliku .env.e2e');
    dotenv.config({ path: ENV_E2E_PATH });
  }
  // Jeśli żaden plik nie istnieje, ale istnieje przykładowy plik, użyj go
  else if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    console.log('Ładowanie zmiennych z pliku .env.example');
    dotenv.config({ path: ENV_EXAMPLE_PATH });
  }
  // W przeciwnym razie ustaw domyślne wartości
  else {
    console.log('Używanie domyślnych wartości zmiennych środowiskowych');
    setDefaultEnvVars();
  }
  
  // Zawsze nadpisz zmienne specyficzne dla testów
  setTestSpecificEnvVars(testType);
  
  console.log('Konfiguracja zmiennych środowiskowych zakończona');
}

/**
 * Ustawia domyślne wartości zmiennych środowiskowych, gdy nie znaleziono pliku .env
 */
function setDefaultEnvVars() {
  // Supabase
  process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'example-anon-key';
  process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'example-service-key';
  
  // React App
  process.env.REACT_APP_SUPABASE_URL = process.env.SUPABASE_URL;
  process.env.REACT_APP_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  
  // API
  process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
}

/**
 * Ustawia zmienne środowiskowe specyficzne dla danego typu testu
 * @param {string} testType - Typ testu
 */
function setTestSpecificEnvVars(testType) {
  // Dane do testów autentykacji
  process.env.TEST_USER_EMAIL = 'test@example.com';
  process.env.TEST_USER_PASSWORD = 'test123password';
  
  // Tryb testowy
  process.env.NODE_ENV = 'test';
  
  // Specyficzne dla typu testu
  if (testType === 'unit') {
    // Dla testów jednostkowych używaj mocków
    process.env.USE_MOCKS = 'true';
  } else if (testType === 'e2e') {
    // Dla testów E2E używaj rzeczywistych usług
    process.env.USE_MOCKS = 'false';
    // Inne specyficzne zmienne dla E2E
    process.env.BROWSER = process.env.BROWSER || 'chrome';
  }
}

// Eksportuj funkcję, aby mogła być używana przez inne skrypty
export default setupEnv;
import { FullConfig } from '@playwright/test';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Rozwiązanie problemu z __dirname w ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_CONFIG_PATH = path.resolve(__dirname, '../env.config.json');

/**
 * Globalny setup przed uruchomieniem testów Playwright
 * - Ładuje zmienne środowiskowe
 * - Przygotowuje środowisko testowe
 * - Tworzy użytkownika testowego w Supabase, jeśli nie istnieje
 */
async function globalSetup(config: FullConfig) {
  // Ładowanie odpowiednich zmiennych środowiskowych
  if (fs.existsSync(ENV_CONFIG_PATH)) {
    console.log('Ładowanie zmiennych środowiskowych z env.config.json');
    try {
      const configData = JSON.parse(fs.readFileSync(ENV_CONFIG_PATH, 'utf8'));
      Object.entries(configData).forEach(([key, value]) => {
        process.env[key] = String(value);
      });
    } catch (error) {
      console.error('Błąd podczas ładowania konfiguracji:', error);
    }
  } else {
    console.warn('Plik env.config.json nie istnieje, używam domyślnych wartości');
  }

  // Zmienne środowiskowe z konfiguracji
  process.env.NODE_ENV = 'test';
  process.env.USE_MOCKS = process.env.USE_MOCKS || 'true';
  process.env.REACT_APP_TEST_MODE = 'true';
  
  // Dane testowego użytkownika
  const testUserEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
  const testUserPassword = process.env.TEST_USER_PASSWORD || 'test123password';
  const testUserName = process.env.TEST_USER_NAME || 'Testowy Użytkownik';
  
  // API do komunikacji z backendem
  const port = process.env.PORT || 3031;
  const apiEndpoints = [
    process.env.API_BASE_URL || `http://localhost:${port}/api`,
    `http://localhost:3030/api`,
    `http://localhost:3031/api`,
    `http://localhost:5000/api`
  ];
  
  // Funkcja do próby komunikacji z różnymi API endpointami
  const tryApiEndpoints = async (endpoint: string, method: string, data?: any) => {
    let lastError = null;
    
    for (const baseUrl of apiEndpoints) {
      try {
        console.log(`Próba połączenia z API: ${baseUrl}${endpoint}`);
        if (method === 'GET') {
          return await axios.get(`${baseUrl}${endpoint}`);
        } else if (method === 'POST') {
          return await axios.post(`${baseUrl}${endpoint}`, data);
        }
      } catch (error) {
        console.warn(`Nie udało się połączyć z: ${baseUrl}${endpoint}`, error.message);
        lastError = error;
      }
    }
    
    throw lastError || new Error('Nie udało się połączyć z żadnym API');
  };

  // Utworzenie użytkownika testowego, jeśli potrzeba
  try {
    console.log('Przygotowywanie użytkownika testowego...');
    
    // Próba rejestracji (może się nie powieść, jeśli użytkownik już istnieje)
    try {
      await tryApiEndpoints('/auth/register', 'POST', {
        email: testUserEmail,
        password: testUserPassword,
        name: testUserName
      });
      console.log('Zarejestrowano użytkownika testowego');
    } catch (error) {
      // Sprawdzamy czy backend jest dostępny - jeśli nie, używamy mocków
      if (error.message && (error.message.includes('ECONNREFUSED') || 
          error.message.includes('Nie udało się połączyć z żadnym API'))) {
        console.log('Backend niedostępny, używamy środowiska mockowego');
        process.env.USE_MOCKS = 'true';
      } else if (error.response && error.response.status === 400 && 
          error.response.data.message && error.response.data.message.includes('Email jest już zajęty')) {
        console.log('Użytkownik testowy już istnieje');
      } else {
        console.warn('Błąd podczas rejestracji użytkownika testowego:', error.message);
        console.log('Używamy środowiska mockowego do testów');
        process.env.USE_MOCKS = 'true';
      }
    }
    
    // Zapisujemy informacje o środowisku testowym
    const storageState = path.join(__dirname, 'storageState.json');
    fs.writeFileSync(
      storageState,
      JSON.stringify({
        cookies: [],
        origins: [
          {
            origin: config.projects[0].use.baseURL || 'http://localhost:3000',
            localStorage: [
              { 
                name: 'testUser', 
                value: JSON.stringify({ 
                  email: testUserEmail,
                  password: testUserPassword 
                }) 
              },
              { 
                name: 'test_mode', 
                value: 'true' 
              },
              { 
                name: 'token', 
                value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci1pZCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXSDhJa-N3Nvkt9t6Q2WQ'
              }
            ]
          }
        ]
      })
    );
    
    console.log('Środowisko testowe zostało przygotowane pomyślnie.');
  } catch (error) {
    console.error('Błąd podczas przygotowywania środowiska testowego:', error.message);
    console.log('Używamy środowiska mockowego do testów');
    process.env.USE_MOCKS = 'true';
  }
}

export default globalSetup; 
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Rozwiązanie problemu z __dirname w ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ładowanie zmiennych środowiskowych dla testów E2E
const ENV_CONFIG_PATH = path.resolve(__dirname, 'env.config.json');

if (fs.existsSync(ENV_CONFIG_PATH)) {
  console.log('Ładowanie zmiennych z pliku env.config.json');
  try {
    const configData = JSON.parse(fs.readFileSync(ENV_CONFIG_PATH, 'utf8'));
    Object.entries(configData).forEach(([key, value]) => {
      process.env[key] = String(value);
    });
  } catch (error) {
    console.error('Błąd podczas ładowania konfiguracji:', error);
  }
} else {
  console.log('Uwaga: Plik env.config.json nie istnieje');
}

// Ustawienie zmiennych testowych
process.env.NODE_ENV = 'test';
process.env.REACT_APP_TEST_MODE = 'true';

// Ustawienie adresu testowej instancji Supabase
const testSupabaseUrl = process.env.SUPABASE_URL || 'https://example-test.supabase.co';
const testSupabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'example-anon-key';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'cd ../frontend && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  globalTimeout: 600000,
}); 
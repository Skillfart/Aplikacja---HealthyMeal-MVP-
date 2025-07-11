import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Środowisko testowe
    environment: 'jsdom',
    
    // Pliki setup
    setupFiles: ['./tests/setup.js'],
    
    // Globalne zmienne testowe
    globals: true,
    
    // Wzorce plików testowych - tylko nasze testy
    include: [
      'tests/unit/**/*.{test,spec}.{js,jsx}',
      'tests/integration/**/*.{test,spec}.{js,jsx}',
      'tests/performance/**/*.{test,spec}.{js,jsx}',
      'tests/e2e/**/*.{test,spec}.{js,jsx}',
      'tests/*.{test,spec}.{js,jsx}'
    ],
    
    // Wykluczenia
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'tests/e2e/**',
      'tests/playwright-report/**',
      'tests/coverage/**',
      'tests/node_modules/**',
      '**/node_modules/**'
    ],
    
    // Timeout testów
    testTimeout: 10000,
    
    // Pokrycie kodu
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './tests/coverage',
      include: [
        'frontend/src/**/*.{js,jsx,ts,tsx}',
        'backend/src/**/*.{js,jsx,ts,tsx}'
      ],
      exclude: [
        'node_modules',
        'tests',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/coverage/**',
        '**/dist/**',
        'frontend/src/main.jsx',
        'backend/src/server.js'
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    
    // Konfiguracja dla różnych środowisk
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    }
  },
  
  // Konfiguracja resolve dla aliasów
  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend/src'),
      '@backend': resolve(__dirname, './backend/src'),
      '@tests': resolve(__dirname, './tests')
    }
  }
}); 
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wymuszamy tryb testowy
process.env.NODE_ENV = 'test';
process.env.TEST_MODE = 'true';
process.env.USE_MOCKS = 'true';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/e2e',
        '**/*.d.ts',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}'
      ]
    },
    include: [
      'unit/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'e2e'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@frontend': path.resolve(__dirname, '../frontend/src'),
      '@backend': path.resolve(__dirname, '../backend/src'),
      '@tests': path.resolve(__dirname, '.')
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
}); 
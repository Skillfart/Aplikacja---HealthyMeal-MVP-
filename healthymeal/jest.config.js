module.exports = {
  // Środowisko testowe
  testEnvironment: 'jsdom',

  // Ścieżki do plików testowych
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Ignorowane ścieżki
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],

  // Transformacje plików
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },

  // Mapowanie modułów
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },

  // Konfiguracja pokrycia kodu
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Konfiguracja setupTests
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  // Globalne zmienne
  globals: {
    'process.env': {
      NODE_ENV: 'test'
    }
  },

  // Timeout dla testów
  testTimeout: 10000,

  // Maksymalna liczba równoległych workerów
  maxWorkers: '50%',

  // Wyświetlanie szczegółowych informacji o testach
  verbose: true
}; 
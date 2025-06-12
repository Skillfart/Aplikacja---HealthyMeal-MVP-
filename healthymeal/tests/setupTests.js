// Dodaj rozszerzenia dla testów
import '@testing-library/jest-dom';

// Konfiguracja dla fetch API
import 'whatwg-fetch';

// Konfiguracja dla testów komponentów React
import { configure } from '@testing-library/react';

// Konfiguracja timeoutów dla testów asynchronicznych
configure({ asyncUtilTimeout: 5000 });

// Mock dla localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock dla sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock dla window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock dla window.scroll
global.scroll = jest.fn();
global.scrollTo = jest.fn();

// Mock dla console.error aby testy nie wyświetlały błędów w konsoli
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 
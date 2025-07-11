// Dodaj rozszerzenia dla testów
import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

// Konfiguracja dla fetch API
import 'whatwg-fetch';

// Konfiguracja dla testów komponentów React
import { configure } from '@testing-library/react';

// Konfiguracja timeoutów dla testów asynchronicznych
configure({ asyncUtilTimeout: 5000 });

// Mock dla localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock dla sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock dla window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock dla window.scroll
global.scroll = vi.fn();
global.scrollTo = vi.fn();

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
import '@testing-library/jest-dom';
import { vi, expect, afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Konfiguracja testów
configure({
  testIdAttribute: 'data-testid',
});

// Rozszerzenie matchers dla testów DOM
expect.extend(matchers);

// Ustawienie globalnej zmiennej vitest
global.vi = vi;

// Mocki dla localStorage i sessionStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock dla fetch API
global.fetch = vi.fn();

// Resetowanie wszystkich mocków przed każdym testem
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});

// Przywracanie oryginalnych implementacji po wszystkich testach
afterAll(() => {
  vi.restoreAllMocks();
}); 
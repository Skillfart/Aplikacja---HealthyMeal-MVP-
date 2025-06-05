# Testy HealthyMeal

Ten katalog zawiera testy dla aplikacji HealthyMeal.

## Struktura

```
tests/
├── e2e/                # Testy end-to-end (Playwright)
│   └── basic.test.js   # Podstawowe testy nawigacji
├── unit/               # Testy jednostkowe (Vitest)
│   └── example.test.js # Przykładowy test
├── playwright.config.ts # Konfiguracja Playwright
├── vitest.config.js    # Konfiguracja Vitest
└── vitest.setup.js     # Setup dla testów Vitest
```

## Uruchamianie testów

### Testy jednostkowe (Vitest)

```bash
# Uruchom wszystkie testy jednostkowe
npm test

# Uruchom testy w trybie watch
npm test -- --watch

# Uruchom testy z UI
npm run test:ui

# Wygeneruj raport pokrycia kodu
npm run test:coverage
```

### Testy E2E (Playwright)

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# Uruchom testy E2E z UI
npm run test:e2e:ui

# Uruchom testy E2E w konkretnej przeglądarce
npm run test:e2e -- --project=chromium
```

## Przeglądarki w testach E2E

- Chrome Desktop
- Firefox Desktop
- Safari Desktop
- Chrome Mobile (Pixel 5)
- Safari Mobile (iPhone 12)

## Konwencje

### Testy jednostkowe

- Pliki testów powinny mieć rozszerzenie `.test.js` lub `.spec.js`
- Używamy składni Vitest/Jest dla asercji
- Każdy test powinien być niezależny
- Mockujemy zewnętrzne zależności

### Testy E2E

- Testy powinny symulować rzeczywiste scenariusze użycia
- Używamy Page Object Pattern dla powtarzalnych elementów
- Testy powinny być niezależne od danych testowych
- Każdy test powinien sprzątać po sobie 
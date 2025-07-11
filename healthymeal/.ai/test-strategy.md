# 🧪 Strategia testowania HealthyMeal

## Narzędzia testowe

### 🏃‍♂️ Vitest - Testy jednostkowe i integracyjne
- **Szybkie**: ~10x szybsze niż Jest
- **Moderne**: Natywna obsługa ES modules
- **Kompatybilne**: Działa z Vite out-of-the-box
- **Hot Reload**: Automatyczne odświeżanie testów

### 🎭 Playwright - Testy E2E
- **Cross-browser**: Chrome, Firefox, Safari
- **Reliable**: Auto-wait, retry mechanisms
- **Visual**: Screenshots, video recording
- **CI/CD ready**: Headless mode

## Struktura testów

```
tests/
├── unit/                 # Vitest - szybkie testy jednostkowe
│   ├── components/       # Testy komponentów React
│   ├── utils/           # Testy funkcji pomocniczych
│   ├── hooks/           # Testy custom hooks
│   └── services/        # Testy API services
├── integration/         # Vitest - testy z prawdziwym API
│   ├── api/             # Testy endpoints z testową DB
│   ├── auth/            # Testy przepływu autoryzacji
│   └── ai/              # Testy integracji AI
├── e2e/                 # Playwright - testy pełnej aplikacji
│   ├── auth.spec.js     # Przepływ logowania/rejestracji
│   ├── recipes.spec.js  # Zarządzanie przepisami
│   └── ai.spec.js       # Modyfikacja przepisów AI
└── fixtures/            # Dane testowe
    ├── users.json       # Testowi użytkownicy
    └── recipes.json     # Testowe przepisy
```

## Skrypty npm

```bash
# Uruchamianie testów
npm run test              # Wszystkie testy (Vitest + Playwright)
npm run test:unit         # Tylko jednostkowe (Vitest)
npm run test:integration  # Tylko integracyjne (Vitest)
npm run test:e2e         # Tylko E2E (Playwright)

# Tryby deweloperskie
npm run test:watch       # Vitest watch mode
npm run test:ui          # Vitest UI mode
npm run test:e2e:ui      # Playwright UI mode

# Raporty
npm run test:coverage    # Raport pokrycia kodu
npm run test:report      # HTML report testów E2E
```

## Priorytety testowe

### 🔥 Wysoki priorytet
- [x] Testy komponentów React (RecipeCard, RecipeList)
- [x] Testy autoryzacji (login, logout, register)
- [x] Testy CRUD przepisów (create, read, update, delete)
- [ ] Testy integracji AI (modyfikacja przepisów)
- [ ] Testy filtrowania i wyszukiwania

### 🟡 Średni priorytet  
- [ ] Testy preferencji użytkownika
- [ ] Testy walidacji formularzy
- [ ] Testy accessibility
- [ ] Testy responsywności

### 🔵 Niski priorytet
- [ ] Testy performance
- [ ] Testy visual regression
- [ ] Testy load testing

## Konfiguracja środowiska

### Vitest Setup
```js
// vite.config.js
export default {
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
}
```

### Playwright Setup
```js
// playwright.config.js
export default {
  testDir: './tests/e2e',
  baseURL: 'http://localhost:5173',
  webServer: {
    command: 'npm run dev',
    port: 5173
  }
}
```

## Dobre praktyki

### 🧪 Testy jednostkowe
- Testuj jedną funkcję/komponent na raz
- Używaj opisowych nazw testów
- Grupuj testy logicznie (`describe`)
- Mockuj zależności zewnętrzne

### 🔗 Testy integracyjne
- Testuj współpracę między komponentami
- Używaj prawdziwych danych testowych
- Testuj happy path i edge cases
- Czyść bazę danych po testach

### 🎭 Testy E2E
- Testuj krytyczne przepływy użytkownika
- Używaj Page Object Model
- Testuj na różnych przeglądarkach
- Zapisuj screenshoty przy błędach

## Metryki jakości

### Pokrycie kodu
- **Docelowe**: 80% dla kodu biznesowego
- **Minimalne**: 60% dla całego projektu
- **Wykluczone**: pliki konfiguracyjne, testy

### Czasy wykonania
- **Unit tests**: < 30s
- **Integration tests**: < 2min
- **E2E tests**: < 10min

### Stabilność
- **Flaky tests**: < 5%
- **Success rate**: > 95%
- **Retry rate**: < 10% 
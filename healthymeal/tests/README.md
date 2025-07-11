# HealthyMeal Test Suite

Kompletny zestaw testów dla aplikacji HealthyMeal obejmujący testy jednostkowe, integracyjne i E2E.

## 🚀 Szybki start

```bash
# Zainstaluj zależności
cd healthymeal/tests
npm install

# Zainstaluj przeglądarki dla Playwright
npm run install:playwright

# Uruchom wszystkie testy
npm run test:all
```

## 📁 Struktura testów

```
tests/
├── backend/
│   ├── unit/          # Testy jednostkowe backendu
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   └── integration/   # Testy integracyjne API
├── frontend/
│   ├── unit/          # Testy jednostkowe frontendu
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── utils/
│   └── integration/   # Testy integracyjne UI
├── e2e/               # Testy End-to-End
│   ├── auth-flow.spec.js
│   ├── recipe-management.spec.js
│   └── ai-modification.spec.js
├── __mocks__/         # Mocki globalne
└── coverage/          # Raporty pokrycia kodu
```

## 🧪 Typy testów

### Testy jednostkowe (Unit Tests)
- **Backend**: Middleware, modele, serwisy, funkcje pomocnicze
- **Frontend**: Komponenty React, hooki, konteksty, utils
- **Narzędzia**: Jest, React Testing Library

### Testy integracyjne (Integration Tests)
- **Backend**: Endpointy API, przepływ danych, integracja z bazą danych
- **Frontend**: Przepływ między komponentami, integracja z API
- **Narzędzia**: Supertest, Mock Service Worker

### Testy E2E (End-to-End Tests)
- **Scenariusze użytkownika**: Pełne przepływy aplikacji
- **Narzędzia**: Playwright

## 📝 Komendy testowe

### Podstawowe komendy

```bash
# Wszystkie testy
npm run test

# Testy w trybie watch
npm run test:watch

# Testy z pokryciem kodu
npm run test:coverage

# Testy CI/CD
npm run test:ci
```

### Testy według typu

```bash
# Testy jednostkowe
npm run test:unit

# Testy integracyjne
npm run test:integration

# Testy backend
npm run test:backend

# Testy frontend
npm run test:frontend

# Testy E2E
npm run test:e2e

# Testy E2E z interfejsem
npm run test:e2e:ui

# Testy E2E z przeglądarką
npm run test:e2e:headed
```

### Testy według funkcjonalności

```bash
# Testy autoryzacji
npm run test:auth

# Testy przepisów
npm run test:recipe

# Testy AI
npm run test:ai
```

## 🎯 Priorytety testowe

### 🔥 Krytyczne (muszą działać)
- [x] Middleware autoryzacji
- [x] Modyfikacja przepisów przez AI
- [x] Hooki zarządzające stanem
- [x] Komponenty kluczowe

### ⚠️ Średnie (powinny działać)
- [x] Filtrowanie i wyszukiwanie
- [x] Zarządzanie preferencjami
- [x] Dashboard i statystyki
- [x] Responsywność UI

### 🔧 Niskie (warto mieć)
- [x] Testy wydajnościowe
- [x] Testy dostępności
- [x] Testy bezpieczeństwa

## 📊 Pokrycie kodu

### Obecne wymagania
- **Linie kodu**: 70%
- **Funkcje**: 70%
- **Gałęzie**: 70%
- **Instrukcje**: 70%

### Generowanie raportów
```bash
# Raport w konsoli
npm run test:coverage

# Raport HTML (coverage/lcov-report/index.html)
npm run test:coverage && open coverage/lcov-report/index.html
```

## 🔧 Konfiguracja

### Zmienne środowiskowe
```bash
# .env.test
BASE_URL=http://localhost:5173
API_URL=http://localhost:3031
CI=false
```

### Konfiguracja Jest
- Plik: `jest.config.js`
- Środowisko: jsdom (frontend), node (backend)
- Timeout: 10s
- Pokrycie: 70%

### Konfiguracja Playwright
- Plik: `playwright.config.js`
- Przeglądarki: Chrome, Firefox, Safari
- Urządzenia: Desktop, Mobile
- Timeout: 30s

## 🚦 Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd healthymeal/tests
          npm install
      - name: Run tests
        run: |
          cd healthymeal/tests
          npm run test:all
```

## 🐛 Debugowanie testów

### Jest
```bash
# Debugowanie pojedynczego testu
npm run test -- --testNamePattern="should handle AI errors"

# Debugowanie z watch mode
npm run test:watch -- --testNamePattern="auth"

# Verbose output
npm run test -- --verbose
```

### Playwright
```bash
# Debugowanie E2E
npm run test:e2e -- --debug

# Interfejs graficzny
npm run test:e2e:ui

# Trace viewer
npx playwright show-trace trace.zip
```

## 📋 Checklist nowych testów

### Przed dodaniem nowego testu
- [ ] Sprawdź czy podobny test już istnieje
- [ ] Wybierz odpowiednią kategorię (unit/integration/e2e)
- [ ] Dodaj odpowiednie mocki
- [ ] Sprawdź pokrycie kodu
- [ ] Dodaj test do CI/CD

### Po dodaniu nowego testu
- [ ] Test przechodzi lokalnie
- [ ] Test przechodzi na CI
- [ ] Pokrycie kodu nie spadło
- [ ] Dokumentacja zaktualizowana
- [ ] PR review przeprowadzone

## 🆘 Troubleshooting

### Częste problemy

**Q: Testy JS nie działają**
```bash
# Sprawdź konfigurację Babel
cat babel.config.js

# Sprawdź node_modules
rm -rf node_modules && npm install
```

**Q: Testy Playwright nie uruchamiają się**
```bash
# Zainstaluj przeglądarki
npx playwright install

# Sprawdź porty
lsof -i :5173
lsof -i :3031
```

**Q: Testy bazodanowe nie działają**
```bash
# Sprawdź MongoDB
mongosh --eval "db.runCommand('ping')"

# Sprawdź zmienne środowiskowe
echo $MONGODB_URI
```

## 🤝 Współpraca

### Dodawanie nowych testów
1. Stwórz branch: `git checkout -b feature/add-tests-for-xyz`
2. Dodaj testy w odpowiednich katalogach
3. Sprawdź pokrycie: `npm run test:coverage`
4. Stwórz PR z opisem zmian

### Zgłaszanie problemów
- Użyj GitHub Issues
- Dodaj logi i screenshoty
- Określ środowisko (OS, Node.js, browser)

## 📚 Dokumentacja

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## 🏆 Metryki jakości

| Metryka | Obecna | Docelowa |
|---------|--------|----------|
| Pokrycie linii | 45% | 70% |
| Pokrycie funkcji | 40% | 70% |
| Testy E2E | 3 | 15 |
| Testy jednostkowe | 5 | 50 |
| Testy integracyjne | 0 | 20 | 
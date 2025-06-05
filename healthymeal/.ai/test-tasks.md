# Zadania do uzupełnienia testów w projekcie HealthyMeal

Na podstawie analizy istniejących testów i Test Planu zidentyfikowano następujące zadania do uzupełnienia testów w projekcie HealthyMeal:

## Testy UI (Playwright)

- [x] Testy funkcjonalności "Zobacz przepis" (recipe_view.spec.js)
- [x] Testy przepływu autentykacji (auth_flow.spec.js)
- [x] Testy funkcjonalności ulubionych przepisów (favorites.spec.js)
- [ ] Testy filtrowania i wyszukiwania przepisów
- [ ] Testy edycji profilu użytkownika
- [ ] Testy dostępności (accessibility)
- [ ] Testy responsywności interfejsu

## Testy jednostkowe

- [x] Testy komponentu AuthContext
- [ ] Testy komponentu PrivateRoute
- [ ] Testy walidacji formularzy
- [ ] Testy hooka useFetch
- [ ] Testy komponentów UI (RecipeCard, RecipeDetails itp.)
- [ ] Testy transformacji danych (mapowanie danych API do modeli)

## Testy integracyjne

- [x] Testy przepływu autentykacji i zarządzania przepisami
- [ ] Testy integracji z AI (modyfikacja przepisów)
- [ ] Testy zarządzania preferencjami użytkownika
- [ ] Testy filtrowania i wyszukiwania przepisów
- [ ] Testy paginacji wyników

## Testy API

- [ ] Testy endpointów API dla filtrowania przepisów
- [ ] Testy endpointów API dla wyszukiwania przepisów
- [ ] Testy endpointów API dla zarządzania ulubionymi
- [ ] Testy endpointów API dla preferencji użytkownika
- [ ] Testy walidacji danych wejściowych API

## Testy wydajnościowe

- [ ] Testy wydajności ładowania listy przepisów
- [ ] Testy wydajności wyszukiwania
- [ ] Testy mechanizmów cache
- [ ] Testy obsługi dużych zbiorów danych

## Usprawnienia infrastruktury testowej

- [ ] Automatyzacja testów E2E w pipeline CI/CD
- [ ] Dodanie raportowania wyników testów
- [ ] Implementacja testów wizualnych dla UI
- [ ] Monitorowanie pokrycia testami
- [ ] Skonfigurowanie nightly build z pełnym zestawem testów

## Priorytety

### Zadania o wysokim priorytecie
1. Testy filtrowania i wyszukiwania przepisów
2. Testy edycji profilu użytkownika
3. Testy bezpieczeństwa dla autentykacji i autoryzacji
4. Testy integracji z AI

### Zadania o średnim priorytecie
1. Testy responsywności interfejsu
2. Testy zarządzania preferencjami użytkownika
3. Automatyzacja testów E2E w pipeline CI/CD
4. Monitorowanie pokrycia testami

### Zadania o niskim priorytecie
1. Testy wydajnościowe
2. Testy mechanizmów cache
3. Testy wizualne UI

## Instrukcje uruchamiania testów

Aby zainstalować wszystkie zależności do testów, uruchom:

```bash
# Na systemie Linux/MacOS
cd healthymeal
bash .ai/install-test-dependencies.sh

# Na systemie Windows
cd healthymeal
powershell -ExecutionPolicy Bypass -File .ai/install-test-dependencies.ps1
```

Aby uruchomić testy:

```bash
# Wszystkie testy
cd healthymeal/tests
npm run test:all

# Testy jednostkowe
npm run test:unit

# Testy integracyjne
npm run test:integration

# Testy E2E Playwright
npm run test:e2e

# Testy Playwright w trybie interaktywnym (UI)
npm run test:e2e:ui

# Testy związane z autentykacją
npm run test:auth

# Testy związane z przepisami
npm run test:recipe
``` 
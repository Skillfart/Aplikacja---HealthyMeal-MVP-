# ✅ Test Plan – HealthyMeal

Dokument opisuje plan testowania aplikacji HealthyMeal, opracowany na podstawie pełnej dokumentacji funkcjonalnej i kodowej (`test-tasks.md`, `ui-plan.md`, `api-plan.md`, itd.). Może być edytowany lub rozwijany w oparciu o analizę przez @Codebase lub GitIngest + Google AI Studio.

---

## 🎯 Cel testów

Zapewnienie wysokiej jakości funkcjonalnej, niezawodności i bezpieczeństwa aplikacji HealthyMeal — systemu wspierającego osoby z insulinoopornością i cukrzycą.

---

## 🔍 Zakres testowania

| Obszar                    | Rodzaj testów          | Status         |
|---------------------------|------------------------|----------------|
| Autentykacja              | Jednostkowe, E2E       | ✅ Częściowo    |
| Modyfikacja AI            | Jednostkowe, E2E       | ✅ Gotowe       |
| Walidacja formularzy      | Jednostkowe            | ❌ Brak         |
| Preferencje użytkownika   | Jednostkowe, E2E       | ❌ Brak         |
| Endpointy API             | Jednostkowe, integracyjne | ❌ Brak      |
| Komponenty UI             | Jednostkowe            | ⚠️ Częściowe    |
| Wyszukiwanie/filtrowanie  | E2E                    | ❌ Brak         |
| Cache i limity AI         | Jednostkowe            | ✅ Obecne       |

---

## 🧪 Typy testów

- **Unit tests** (Vitest): logika, komponenty, hooki
- **E2E tests** (Playwright): pełne przepływy użytkownika
- **Integration tests**: auth ↔ przepisy ↔ AI
- **API tests**: poprawność żądań i walidacja danych
- **Performance tests**: ładowanie przepisów, cache
- **Security tests**: JWT, CSRF, ograniczenia dostępu

---

## 📊 Metryki jakości

- Pokrycie kodu: **≥70%** (docelowo 90% dla AI i Auth)
- Czas testów: jednostkowe <30s, E2E <3min
- Wszystkie testy przechodzące w CI/CD
- Nightly testy regresyjne

---

## 📌 Priorytety testowe

### 🚨 Tydzień 1 – Krytyczne:
- Naprawa mocków `import.meta.env`
- Konfiguracja testów backendu (ESM, Mongoose)
- Uruchomienie testów jednostkowych (min. 7)
- Integracja E2E z CI/CD

### ⚠️ Tydzień 2 – Średnie:
- Testy API endpointów
- Testy walidacji formularzy
- Testy komponentów UI: `RecipeList`, `PreferencesWizard`
- Pokrycie kodu 70%+

### 🔧 Tydzień 3+ – Niskie:
- Testy wydajnościowe (cache, ładowanie)
- Testy bezpieczeństwa
- Raportowanie testów w CI (coverage, alerty)

---

## 🧪 Przykład testu jednostkowego – PromptBuilder

Plik: `tests/unit/promptBuilder.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { buildPrompt } from '@/lib/ai/promptBuilder'

describe('PromptBuilder', () => {
  it('tworzy poprawny prompt dla preferencji i przepisu', () => {
    const recipe = {
      title: 'Makaron z kurczakiem',
      ingredients: ['kurczak', 'makaron', 'śmietana'],
      instructions: 'Ugotuj makaron i dodaj kurczaka',
    }

    const preferences = {
      avoid: ['śmietana'],
      goal: 'obniżenie indeksu glikemicznego',
    }

    const prompt = buildPrompt(recipe, preferences)

    expect(prompt).toContain('obniżenie indeksu glikemicznego')
    expect(prompt).toContain('usuń śmietana')
    expect(prompt).toContain('Makaron z kurczakiem')
  })
})

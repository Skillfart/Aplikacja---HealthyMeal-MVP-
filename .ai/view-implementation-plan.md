# Plan implementacji endpointu API: POST /api/ai/modify/:recipeId

## 1. Przegląd punktu końcowego
Endpoint `POST /api/ai/modify/:recipeId` umożliwia przetwarzanie istniejącego przepisu kulinarnego za pomocą sztucznej inteligencji w celu stworzenia jego zmodyfikowanej wersji, dostosowanej do preferencji dietetycznych użytkownika. Funkcjonalność ta jest kluczowym elementem aplikacji HealthyMeal, pozwalającym na automatyczne dostosowanie przepisów do indywidualnych potrzeb dietetycznych.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/ai/modify/:recipeId`
- **Parametry ścieżki**:
  - `recipeId` (string, wymagany) - identyfikator przepisu do modyfikacji
- **Nagłówki**:
  - `Authorization` (wymagany) - token JWT, format: `Bearer {token}`
- **Request Body**: Brak (preferencje dietetyczne są pobierane z profilu użytkownika)

## 3. Wykorzystywane typy
```typescript
// Typy importowane z src/types.ts
// Dla struktury odpowiedzi
import { ModifyRecipeResultDto, AIModifiedIngredientDto, AIModifiedStepDto } from "../types";

// Do wykorzystania wewnątrz implementacji
interface AIRequestPayload {
  recipe: {
    title: string;
    ingredients: Array<{
      name: string;
      quantity: number;
      unit: string;
    }>;
    steps: Array<{
      number: number;
      description: string;
    }>;
    nutritionalValues: {
      totalCarbs: number;
      carbsPerServing: number;
    };
  };
  userPreferences: {
    dietType: string;
    maxCarbs: number;
    excludedProducts: string[];
    allergens: string[];
  };
}

// Model wewnętrzny dla cache'u AI
interface AICacheEntry {
  inputHash: string;
  recipeId: string;
  userPreferences: {
    dietType: string;
    maxCarbs: number;
    excludedProducts: string[];
    allergens: string[];
  };
  response: {
    title: string;
    ingredients: AIModifiedIngredientDto[];
    steps: AIModifiedStepDto[];
    nutritionalValues: {
      totalCarbs: number;
      carbsReduction: number;
    };
    changesDescription: string;
  };
  createdAt: Date;
  expiresAt: Date;
}
```

## 4. Szczegóły odpowiedzi
- **Format**: JSON
- **Struktura odpowiedzi**:
```json
{
  "message": "Recipe modified successfully",
  "modifiedRecipe": {
    "title": "Low-carb Keto Pancakes",
    "ingredients": [
      {
        "ingredient": {
          "name": "Coconut Flour"
        },
        "quantity": 80,
        "unit": "g",
        "isModified": true,
        "substitutionReason": "Lower carb alternative to almond flour"
      }
    ],
    "steps": [
      {
        "number": 1,
        "description": "Mix all ingredients in a bowl",
        "isModified": false
      }
    ],
    "nutritionalValues": {
      "totalCarbs": 6,
      "carbsReduction": 40
    },
    "changesDescription": "Reduced carbs by replacing remaining flour with coconut flour"
  },
  "fromCache": false
}
```

- **Kody odpowiedzi**:
  - `200 OK` - Modyfikacja przepisu zakończona sukcesem
  - `401 Unauthorized` - Brak autoryzacji lub nieprawidłowy token
  - `403 Forbidden` - Przekroczony dzienny limit modyfikacji AI (5 dziennie)
  - `404 Not Found` - Przepis o podanym ID nie istnieje
  - `500 Internal Server Error` - Błąd podczas przetwarzania przez API AI

## 5. Przepływ danych

1. **Walidacja i pobieranie danych**
   - Sprawdzenie tokenu JWT i identyfikacja użytkownika
   - Weryfikacja istnienia przepisu o podanym `recipeId`
   - Sprawdzenie, czy użytkownik ma uprawnienia dostępu do przepisu
   - Pobranie preferencji dietetycznych użytkownika

2. **Weryfikacja limitu AI**
   - Sprawdzenie aktualnego licznika użycia AI przez użytkownika
   - Weryfikacja, czy użytkownik nie przekroczył dziennego limitu (5 modyfikacji)

3. **Sprawdzenie cache'u**
   - Wygenerowanie unikalnego hasha na podstawie ID przepisu i preferencji użytkownika
   - Przeszukanie kolekcji `AICache` pod kątem pasującego hasha
   - Jeśli znaleziono wynik w cache, zwrócenie go z flagą `fromCache: true`

4. **Komunikacja z AI (jeśli nie znaleziono w cache)**
   - Przygotowanie danych przepisu i preferencji w odpowiednim formacie dla API AI
   - Utworzenie odpowiedniego promptu dla AI
   - Wysłanie żądania do Claude API lub OpenAI API
   - Oczekiwanie na odpowiedź z timeout'em

5. **Przetwarzanie odpowiedzi AI**
   - Parsowanie i walidacja odpowiedzi otrzymanej od AI
   - Obliczenie redukcji węglowodanów i innych wartości odżywczych
   - Mapowanie struktury odpowiedzi na format DTO

6. **Aktualizacja cache'u i limitów**
   - Zapisanie odpowiedzi w kolekcji `AICache` z 24-godzinnym TTL
   - Inkrementacja licznika dziennego użycia AI dla użytkownika
   - Zapisanie zmian w bazie danych

7. **Zwrócenie odpowiedzi**
   - Przygotowanie obiektu odpowiedzi zgodnego z `ModifyRecipeResultDto`
   - Zwrócenie odpowiedzi do klienta

## 6. Względy bezpieczeństwa

1. **Uwierzytelnianie i autoryzacja**
   - Każde żądanie musi zawierać ważny token JWT
   - Implementacja middleware do weryfikacji tokenu przed przetwarzaniem żądania
   - Sprawdzanie, czy użytkownik ma uprawnienia do modyfikacji danego przepisu

2. **Walidacja danych**
   - Sanityzacja parametrów wejściowych, szczególnie `recipeId`
   - Weryfikacja spójności danych przepisu przed wysłaniem do AI
   - Walidacja odpowiedzi AI przed jej zwróceniem użytkownikowi

3. **Zarządzanie limitami**
   - Mechanizm resetowania dziennego licznika użycia AI
   - Blokowanie nadmiernego korzystania z usług AI
   - Monitorowanie wzorców użycia pod kątem nadużyć

4. **Ochrona danych**
   - Szyfrowanie komunikacji z zewnętrznymi API
   - Bezpieczne przechowywanie kluczy API do usług AI
   - Implementacja polityki dostępu do cache'u

5. **Audyt i monitorowanie**
   - Logowanie wszystkich żądań modyfikacji przepisów
   - Monitorowanie wydajności i responsywności API AI
   - Wykrywanie anomalii w wykorzystaniu usług

## 7. Obsługa błędów

1. **Brak autoryzacji**
   - **Kod**: 401 Unauthorized
   - **Przyczyna**: Brak tokenu JWT lub token wygasł
   - **Odpowiedź**: `{ "message": "Authentication required" }`
   - **Obsługa**: Przekierowanie użytkownika do ekranu logowania

2. **Limit AI przekroczony**
   - **Kod**: 403 Forbidden
   - **Przyczyna**: Użytkownik wykorzystał dzienny limit 5 modyfikacji
   - **Odpowiedź**: `{ "message": "Daily AI modification limit exceeded. Limit: 5 modifications per day." }`
   - **Obsługa**: Informacja dla użytkownika o pozostałym czasie do resetu limitu

3. **Przepis nie znaleziony**
   - **Kod**: 404 Not Found
   - **Przyczyna**: Nieprawidłowy identyfikator przepisu lub przepis został usunięty
   - **Odpowiedź**: `{ "message": "Recipe not found" }`
   - **Obsługa**: Wyświetlenie komunikatu o błędzie i opcji powrotu do listy przepisów

4. **Błąd API AI**
   - **Kod**: 500 Internal Server Error
   - **Przyczyna**: Błąd w komunikacji z API AI lub nieprawidłowa odpowiedź
   - **Odpowiedź**: `{ "message": "Error processing recipe with AI. Please try again later." }`
   - **Obsługa**: Retry mechanizm, logowanie błędu, powiadomienie dla administratora

5. **Timeout API AI**
   - **Kod**: 504 Gateway Timeout
   - **Przyczyna**: API AI nie odpowiedziało w określonym czasie
   - **Odpowiedź**: `{ "message": "AI service response timeout. Please try again later." }`
   - **Obsługa**: Wizualizacja dla użytkownika z możliwością ponowienia próby

## 8. Rozważania dotyczące wydajności

1. **Strategia cachowania**
   - Implementacja kolekcji `AICache` z TTL indeksem (24 godziny)
   - Generowanie optymalnego hasha na podstawie recipeId i preferencji użytkownika
   - Priorytetowe sprawdzanie cache'u przed wywołaniem API AI

2. **Optymalizacja promptów AI**
   - Minimalizacja długości prompta przez usuwanie zbędnych informacji
   - Strukturyzacja zapytań do AI dla uzyskania spójnych odpowiedzi
   - Regularne dostrajanie promptów dla poprawy jakości i szybkości odpowiedzi

3. **Zarządzanie połączeniami**
   - Implementacja puli połączeń do API AI
   - Ustawienie rozsądnych timeoutów dla operacji zewnętrznych
   - Mechanizm circuit breaker dla ochrony przed przeciążeniem

4. **Równoległe przetwarzanie**
   - Asynchroniczne przetwarzanie zapytań do AI
   - Wykorzystanie Promise.all dla równoległego wykonywania operacji (np. pobieranie przepisu i sprawdzanie limitu)
   - Buforowanie częstych zapytań

5. **Indeksowanie bazy danych**
   - Optymalizacja indeksów dla kolekcji Recipe i AICache
   - Wykorzystanie indeksu compound dla AICache (inputHash + expiresAt)
   - Ograniczenie pobieranych pól do niezbędnego minimum

## 9. Etapy wdrożenia

1. **Konfiguracja środowiska**
   - Zdefiniowanie zmiennych środowiskowych dla kluczy API AI
   - Konfiguracja parametrów połączenia z MongoDB
   - Ustawienie limitów i parametrów cachowania

2. **Implementacja modeli i schematów**
   - Rozszerzenie istniejącego schematu User o pole aiUsage
   - Implementacja schematu AICache z TTL indeksem
   - Aktualizacja walidatorów Mongoose dla nowych schematów

3. **Utworzenie serwisów**
   - Implementacja `hashService.js` do generowania unikalnych kluczy cache'u
   - Utworzenie `aiService.js` do obsługi komunikacji z API AI
   - Rozszerzenie `userService.js` o funkcje zarządzania limitami AI

4. **Implementacja middleware**
   - Utworzenie middleware `checkAIUsage.js` do weryfikacji limitów użycia AI
   - Aktualizacja middleware auth do obsługi specyficznych wymagań endpointu

5. **Implementacja kontrolera**
   - Utworzenie metody `modifyRecipe` w `aiController.js`
   - Implementacja logiki przepływu danych i obsługi błędów
   - Integracja z middleware i serwisami

6. **Definiowanie tras**
   - Dodanie nowej trasy w `routes/aiRoutes.js`
   - Konfiguracja middleware dla trasy

7. **Implementacja testów**
   - Napisanie testów jednostkowych dla funkcji generowania hasha i budowania promptów
   - Implementacja testów integracyjnych dla endpointu
   - Testy wydajnościowe dla strategii cachowania

8. **Dokumentacja i walidacja**
   - Aktualizacja dokumentacji API
   - Przeprowadzenie code review
   - Sprawdzenie zgodności z wymaganiami bezpieczeństwa

9. **Deployment i monitoring**
   - Wdrożenie na środowisko testowe
   - Konfiguracja monitoringu i alertów
   - Obserwacja wydajności i wykorzystania usług AI
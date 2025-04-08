# Plan implementacji endpointu POST /api/ai/modify/:recipeId

## 1. Opis funkcjonalności

Endpoint służy do modyfikacji przepisów kulinarnych za pomocą AI (Claude/OpenAI), aby dostosować je do preferencji żywieniowych użytkownika. Zmodyfikowany przepis zawiera alternatywne składniki, zmodyfikowane kroki przygotowania oraz zaktualizowane wartości odżywcze, ze szczególnym naciskiem na redukcję węglowodanów.

## 2. Specyfikacja API

- **Metoda HTTP**: POST
- **URL**: `/api/ai/modify/:recipeId`
- **Parametry URL**:
  - `recipeId` - ID przepisu do modyfikacji (MongoDB ObjectId)
- **Wymagana autoryzacja**: JWT Token + weryfikacja limitu użycia AI
- **Nagłówki**:
  - `Authorization: Bearer {jwt_token}`
  - `Content-Type: application/json`
- **Odpowiedź:**
  ```json
  {
    "message": "Recipe modified successfully",
    "modifiedRecipe": {
      "title": "Zmodyfikowany tytuł przepisu",
      "ingredients": [
        {
          "ingredient": {
            "name": "Nazwa składnika"
          },
          "quantity": 100,
          "unit": "g",
          "isModified": true,
          "substitutionReason": "Powód zamiany składnika"
        }
      ],
      "steps": [
        {
          "number": 1,
          "description": "Opis kroku",
          "isModified": true,
          "modificationReason": "Powód modyfikacji kroku"
        }
      ],
      "nutritionalValues": {
        "totalCarbs": 10,
        "carbsReduction": 40
      },
      "changesDescription": "Ogólny opis wprowadzonych zmian"
    },
    "fromCache": false
  }
  ```
- **Kody odpowiedzi**:
  - 200 OK - przepis zmodyfikowany pomyślnie
  - 401 Unauthorized - brak lub nieprawidłowy token
  - 403 Forbidden - przekroczony dzienny limit modyfikacji AI
  - 404 Not Found - przepis nie istnieje lub nie należy do użytkownika
  - 500 Internal Server Error - błąd serwera lub API AI

## 3. Przepływ danych i logika

1. **Walidacja wejścia i autoryzacja**
   - Sprawdzenie poprawności parametru `recipeId`
   - Weryfikacja tokenu JWT i pobranie danych użytkownika
   - Sprawdzenie limitu dziennych modyfikacji AI użytkownika (max. 5)

2. **Pobranie danych wejściowych**
   - Pobranie przepisu o podanym ID z bazy danych
   - Weryfikacja czy przepis należy do zalogowanego użytkownika
   - Pobranie preferencji żywieniowych użytkownika z jego profilu

3. **Sprawdzenie cache'u**
   - Generowanie unikalnego hasha na podstawie ID przepisu i preferencji użytkownika
   - Sprawdzenie czy zmodyfikowany przepis istnieje w cache'u (kolekcja AICache)
   - Jeśli znaleziono w cache'u, zwrócenie zbuforowanej odpowiedzi

4. **Przygotowanie zapytania do AI**
   - Utworzenie strukturyzowanego promptu zawierającego:
     - Szczegóły oryginalnego przepisu (nazwa, składniki, kroki)
     - Preferencje użytkownika (typ diety, max. węglowodanów, wykluczone produkty, alergeny)
     - Instrukcje dla AI dot. formatu odpowiedzi (JSON)

5. **Wywołanie API AI**
   - Wysłanie zapytania do Claude API lub OpenAI API (w zależności od konfiguracji)
   - Obsługa błędów komunikacji z zewnętrznym API
   - Parsowanie odpowiedzi JSON z AI

6. **Przetwarzanie odpowiedzi AI**
   - Walidacja odpowiedzi pod kątem wymaganej struktury
   - Formatowanie danych do wymaganego formatu odpowiedzi API

7. **Zapisanie wyników w cache'u**
   - Zapisanie odpowiedzi AI w kolekcji AICache
   - Ustawienie TTL (Time-To-Live) na 24 godziny

8. **Aktualizacja licznika użycia AI**
   - Zwiększenie licznika użycia AI dla użytkownika
   - Zapisanie aktualnej daty i licznika w dokumencie użytkownika

9. **Przygotowanie i wysłanie odpowiedzi**
   - Zwrócenie zmodyfikowanego przepisu z flag fromCache=false
   - Ustawienie odpowiednich nagłówków i kodu statusu HTTP

## 4. Modele i struktury danych

1. **Struktura promptu do AI**
   ```
   Zmodyfikuj ten przepis zgodnie z następującymi preferencjami żywieniowymi:
   
   Preferencje:
   - Typ diety: {dietType}
   - Maksymalna ilość węglowodanów: {maxCarbs}g
   - Wykluczone produkty: {excludedProducts}
   - Alergeny do unikania: {allergens}
   
   Oryginalny przepis:
   - Nazwa: {title}
   - Składniki: {ingredients}
   - Kroki: {steps}
   
   Zmodyfikuj ten przepis, aby zawierał mniej węglowodanów, unikał wymienionych produktów i alergenów,
   a jednocześnie zachował podobny smak i charakter. Wyjaśnij powody swoich zmian.
   
   Zwróć zmodyfikowany przepis w następującym formacie JSON:
   {
     "title": "Zmodyfikowana nazwa przepisu",
     "ingredients": [
       {
         "ingredient": { "name": "nazwa składnika" },
         "quantity": liczba,
         "unit": "jednostka",
         "isModified": true/false,
         "substitutionReason": "powód zamiany (jeśli zamieniono)"
       }
     ],
     "steps": [
       {
         "number": 1,
         "description": "opis kroku",
         "isModified": true/false,
         "modificationReason": "powód modyfikacji (jeśli zmodyfikowano)"
       }
     ],
     "nutritionalValues": {
       "totalCarbs": liczba,
       "carbsReduction": liczba procentowa (0-100)
     },
     "changesDescription": "Ogólny opis wprowadzonych zmian"
   }
   ```

2. **Model AICache**
   ```javascript
   {
     _id: ObjectId,
     inputHash: String,          // MD5 hash z recipeId i preferencji
     recipeId: ObjectId,         // Referencja do oryginalnego przepisu
     userPreferences: {          // Preferencje użytkownika w momencie zapytania
       dietType: String,
       maxCarbs: Number,
       excludedProducts: [String],
       allergens: [String]
     },
     response: Object,           // Odpowiedź z AI (cała struktura modifiedRecipe)
     createdAt: Date,            // Data utworzenia wpisu
     expiresAt: Date             // Data wygaśnięcia (TTL)
   }
   ```

## 5. Implementacja

### 5.1 Kontroler

```javascript
const modifyRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;
    
    // 1. Sprawdź, czy przepis istnieje i należy do użytkownika
    const recipe = await Recipe.findOne({
      _id: recipeId,
      'user._id': userId,
      isDeleted: false
    });
    
    if (!recipe) {
      return res.status(404).json({ message: 'Przepis nie znaleziony' });
    }
    
    // 2. Pobierz preferencje użytkownika
    const userPreferences = req.user.preferences;
    
    // 3. Generuj hash do cache'a
    const inputHash = generateInputHash(recipeId, userPreferences);
    
    // 4. Sprawdź, czy wynik jest w cache'u
    let cachedResult = await AICache.findOne({ inputHash });
    
    if (cachedResult) {
      // Zwróć cache'owany wynik
      return res.status(200).json({
        message: 'Przepis zmodyfikowany pomyślnie (z cache)',
        modifiedRecipe: cachedResult.response,
        fromCache: true
      });
    }
    
    // 5. Przygotuj prompt dla AI
    const prompt = buildAIPrompt(recipe, userPreferences);
    
    // 6. Wywołaj API AI
    const aiResponseData = await callAIService(prompt);
    
    // 7. Zapisz wynik do cache'a
    const cacheEntry = new AICache({
      inputHash,
      recipeId,
      userPreferences,
      response: aiResponseData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h TTL
    });
    
    await cacheEntry.save();
    
    // 8. Zwiększ licznik użycia AI
    req.user.aiUsage.count += 1;
    await req.user.save();
    
    // 9. Zwróć odpowiedź
    res.status(200).json({
      message: 'Przepis zmodyfikowany pomyślnie',
      modifiedRecipe: aiResponseData,
      fromCache: false
    });
    
  } catch (error) {
    console.error('Błąd modyfikacji przepisu przez AI:', error);
    res.status(500).json({ 
      message: 'Błąd serwera podczas komunikacji z AI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

### 5.2 Funkcje pomocnicze

```javascript
// Generowanie hasha na podstawie ID przepisu i preferencji użytkownika
const generateInputHash = (recipeId, preferences) => {
  const input = JSON.stringify({
    recipeId: recipeId.toString(),
    preferences
  });
  
  return crypto.createHash('md5').update(input).digest('hex');
};

// Budowanie promptu dla AI
const buildAIPrompt = (recipe, preferences) => {
  // Formatowanie składników do czytelnej postaci
  const ingredientsText = recipe.ingredients
    .map(i => `${i.quantity} ${i.unit} ${i.ingredient.name}`)
    .join(', ');
  
  // Formatowanie kroków do czytelnej postaci
  const stepsText = recipe.steps
    .map(s => s.description)
    .join(' ');
  
  return `
    Zmodyfikuj ten przepis zgodnie z następującymi preferencjami żywieniowymi:
    
    Preferencje:
    - Typ diety: ${preferences.dietType}
    - Maksymalna ilość węglowodanów: ${preferences.maxCarbs}g
    - Wykluczone produkty: ${preferences.excludedProducts.join(', ')}
    - Alergeny do unikania: ${preferences.allergens.join(', ')}
    
    Oryginalny przepis:
    - Nazwa: ${recipe.title}
    - Składniki: ${ingredientsText}
    - Kroki: ${stepsText}
    
    Zmodyfikuj ten przepis, aby zawierał mniej węglowodanów, unikał wymienionych produktów i alergenów,
    a jednocześnie zachował podobny smak i charakter. Wyjaśnij powody swoich zmian.
    
    Zwróć zmodyfikowany przepis w następującym formacie JSON:
    {
      "title": "Zmodyfikowana nazwa przepisu",
      "ingredients": [
        {
          "ingredient": { "name": "nazwa składnika" },
          "quantity": liczba,
          "unit": "jednostka",
          "isModified": true/false,
          "substitutionReason": "powód zamiany (jeśli zamieniono)"
        }
      ],
      "steps": [
        {
          "number": 1,
          "description": "opis kroku",
          "isModified": true/false,
          "modificationReason": "powód modyfikacji (jeśli zmodyfikowano)"
        }
      ],
      "nutritionalValues": {
        "totalCarbs": liczba,
        "carbsReduction": liczba procentowa (0-100)
      },
      "changesDescription": "Ogólny opis wprowadzonych zmian"
    }
  `;
};

// Wywołanie API AI (Claude lub OpenAI)
const callAIService = async (prompt) => {
  // Wybierz API (Claude lub OpenAI) w zależności od konfiguracji
  let aiResponse;
  
  if (process.env.AI_PROVIDER === 'claude') {
    // Wywołanie API Claude (Anthropic)
    aiResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        messages: [
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.AI_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    // Parsuj odpowiedź z Claude
    const responseContent = aiResponse.data.content[0].text;
    return JSON.parse(responseContent);
    
  } else {
    // Domyślnie: Wywołanie API OpenAI
    aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: "Jesteś ekspertem od modyfikacji przepisów kulinarnych dla osób z insulinoopornością i cukrzycą typu 2." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_API_KEY}`
        }
      }
    );
    
    // Parsuj odpowiedź z OpenAI
    return JSON.parse(aiResponse.data.choices[0].message.content);
  }
};
```

### 5.3 Middleware

```javascript
// Middleware do sprawdzania limitu dziennych modyfikacji AI
const checkAIUsageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Sprawdź, czy data ostatniego użycia jest dzisiejsza
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Resetuj licznik, jeśli to nowy dzień
    if (!user.aiUsage.date || user.aiUsage.date < today) {
      user.aiUsage.date = today;
      user.aiUsage.count = 0;
      await user.save();
      return next();
    }
    
    // Sprawdź, czy użytkownik nie przekroczył limitu dziennego (5)
    if (user.aiUsage.count >= 5) {
      return res.status(403).json({ 
        message: 'Przekroczono dzienny limit modyfikacji AI (5/5)',
        aiUsage: user.aiUsage,
        dailyLimit: 5
      });
    }
    
    next();
  } catch (error) {
    console.error('Błąd sprawdzania limitu AI:', error);
    return res.status(500).json({ message: 'Błąd serwera' });
  }
};
```

### 5.4 Trasa API

```javascript
// Definicja trasy w pliku routes/ai.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { checkAIUsageLimit } = require('../middleware/aiLimit');
const { modifyRecipe, checkAIUsageLimit: getAIUsage } = require('../controllers/ai');

// Wszystkie trasy wymagają uwierzytelnienia
router.use(verifyToken);

// Modyfikacja przepisu przez AI
router.post('/modify/:recipeId', checkAIUsageLimit, modifyRecipe);

// Sprawdzenie limitu użycia AI
router.get('/usage', getAIUsage);

module.exports = router;
```

## 6. Testowanie

### 6.1 Testy jednostkowe

1. **Test budowania promptu**
   - Sprawdzenie czy prompt zawiera wszystkie wymagane informacje
   - Testowanie różnych typów diet i preferencji

2. **Test generowania hasha**
   - Sprawdzenie czy ten sam przepis i preferencje generują zawsze ten sam hash
   - Sprawdzenie czy różne preferencje generują różne hashe dla tego samego przepisu

3. **Test middleware limitu AI**
   - Sprawdzenie resetowania licznika dla nowego dnia
   - Sprawdzenie blokowania po przekroczeniu limitu (5 modyfikacji)

### 6.2 Testy integracyjne

1. **Test pełnego przepływu endpointu**
   - Sprawdzenie czy endpoint zwraca poprawne dane dla istniejącego przepisu
   - Sprawdzenie obsługi błędów dla nieistniejącego przepisu
   - Weryfikacja limitów AI

2. **Test mechanizmu cache'owania**
   - Sprawdzenie czy identyczne zapytanie zwraca dane z cache'u
   - Weryfikacja flagi fromCache w odpowiedzi
   - Sprawdzenie, czy licznik AI nie jest zwiększany przy odpowiedzi z cache'u

3. **Test integracji z AI**
   - Mock API AI dla testów
   - Sprawdzenie obsługi błędów komunikacji z AI
   - Testowanie parsowania różnych formatów odpowiedzi

### 6.3 Testy wydajnościowe

1. **Test czasu odpowiedzi**
   - Porównanie czasu odpowiedzi z cache i bez cache
   - Monitorowanie opóźnień związanych z API AI

2. **Test obciążeniowy**
   - Symulacja wielu równoczesnych zapytań
   - Weryfikacja stabilności przy dużym obciążeniu

## 7. Potencjalne wyzwania i rozwiązania

1. **Długi czas odpowiedzi API AI**
   - *Problem*: API Claude/OpenAI może mieć długi czas odpowiedzi (kilka sekund)
   - *Rozwiązanie*: Implementacja asynchronicznego przetwarzania, system powiadomień lub wskaźnika postępu

2. **Niespójne odpowiedzi AI**
   - *Problem*: AI może generować odpowiedzi w różnych formatach lub z błędami
   - *Rozwiązanie*: Dokładne formatowanie promptu, walidacja odpowiedzi, obsługa przypadków brzegowych

3. **Przekroczenie limitów API**
   - *Problem*: Zewnętrzne API mogą mieć własne limity zapytań
   - *Rozwiązanie*: Implementacja kolejkowania, rate-limitingu, monitorowanie zużycia API

4. **Przeciążenie bazy danych cache'em**
   - *Problem*: Duża liczba wpisów cache'u może obciążyć bazę danych
   - *Rozwiązanie*: Automatyczne usuwanie nieaktualnych wpisów (TTL indeks), optymalizacja indeksów

5. **Obsługa dużych przepisów**
   - *Problem*: Bardzo złożone przepisy mogą przekraczać limity tokenów AI
   - *Rozwiązanie*: Implementacja strategi chunking dla dużych przepisów, podział na mniejsze zapytania

## 8. Metryki i monitorowanie

1. **Metryki wydajności**
   - Czas odpowiedzi endpointu (średni, p95, p99)
   - Czas odpowiedzi API AI
   - Współczynnik trafień cache (cache hit ratio)

2. **Metryki biznesowe**
   - Liczba zmodyfikowanych przepisów dziennie/tygodniowo
   - Procent użytkowników korzystających z funkcji modyfikacji
   - Średnia redukcja węglowodanów w przepisach

3. **Monitorowanie błędów**
   - Wskaźnik błędów API AI
   - Liczba nieudanych zapytań
   - Błędy parsowania odpowiedzi

4. **Alerty**
   - Alert przy wysokim czasie odpowiedzi API (>5s)
   - Alert przy wysokim wskaźniku błędów (>5%)
   - Alert przy zbliżaniu się do limitów zewnętrznego API 
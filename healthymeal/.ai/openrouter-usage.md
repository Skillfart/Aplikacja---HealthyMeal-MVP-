# Serwis OpenRouter - Przykłady użycia

Ten dokument zawiera przykłady użycia serwisu OpenRouter w aplikacji HealthyMeal.

## Spis treści

1. [Inicjalizacja serwisu](#inicjalizacja-serwisu)
2. [Generowanie tekstu](#generowanie-tekstu)
3. [Generowanie strukturyzowanych danych](#generowanie-strukturyzowanych-danych)
4. [Modyfikacja przepisów](#modyfikacja-przepisów)
5. [Sugerowanie alternatywnych składników](#sugerowanie-alternatywnych-składników)
6. [Sprawdzanie statusu API](#sprawdzanie-statusu-api)
7. [Obsługa błędów](#obsługa-błędów)
8. [Tryb symulacji](#tryb-symulacji)

## Inicjalizacja serwisu

### Podstawowa inicjalizacja

```javascript
const openRouterService = require('../services/openRouterService');

// Serwis jest już zainicjalizowany z domyślnymi opcjami
// Możesz go używać bezpośrednio
```

### Inicjalizacja własnej instancji

```javascript
const { OpenRouterService } = require('../services/openRouterService');

// Tworzenie własnej instancji z niestandardowymi opcjami
const customService = new OpenRouterService({
  apiKey: 'twój-klucz-api', // Nadpisuje klucz z .env
  defaultModel: 'anthropic/claude-3-opus', // Inny model domyślny
  logger: customLogger, // Niestandardowy logger
  httpReferrer: 'https://twoja-aplikacja.com',
  appName: 'Niestandardowa Aplikacja',
  retryOptions: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 60000
  }
});
```

## Generowanie tekstu

### Przykład podstawowy

```javascript
async function generateSimpleText() {
  try {
    const response = await openRouterService.generateText({
      prompt: 'Wyjaśnij korzyści z regularnego ćwiczenia',
      systemMessage: 'Jesteś ekspertem od zdrowia i fitnessu'
    });
    
    console.log('Odpowiedź:', response);
  } catch (error) {
    console.error('Błąd:', error);
  }
}
```

### Z dodatkowymi parametrami

```javascript
async function generateTextWithParams() {
  try {
    const response = await openRouterService.generateText({
      prompt: 'Opisz historię wegańskiej diety w 50 słowach',
      systemMessage: 'Jesteś historykiem żywienia',
      model: 'openai/gpt-4o', // Wybór konkretnego modelu
      temperature: 0.3, // Niższa temperatura = bardziej przewidywalne odpowiedzi
      maxTokens: 100, // Ograniczenie długości odpowiedzi
      additionalParams: {
        top_p: 0.9,
        frequency_penalty: 0.5
      }
    });
    
    console.log('Odpowiedź:', response);
  } catch (error) {
    console.error('Błąd:', error);
  }
}
```

## Generowanie strukturyzowanych danych

### Przykład generowania JSON

```javascript
async function generateStructuredData() {
  try {
    const recipeSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              quantity: { type: 'number' },
              unit: { type: 'string' }
            }
          }
        },
        steps: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    };
    
    const response = await openRouterService.generateStructured({
      prompt: 'Stwórz przepis na zdrową sałatkę owocową',
      systemMessage: 'Jesteś doświadczonym szefem kuchni, który tworzy zdrowe przepisy',
      schema: recipeSchema,
      temperature: 0.4
    });
    
    console.log('Przepis:', response);
    // Dane są już sparsowane do obiektu zgodnego ze schematem
  } catch (error) {
    console.error('Błąd:', error);
  }
}
```

## Modyfikacja przepisów

### Przykładowa modyfikacja przepisu

```javascript
async function modifyRecipeExample() {
  try {
    const recipe = {
      title: 'Naleśniki tradycyjne',
      ingredients: [
        { name: 'mąka pszenna', quantity: 200, unit: 'g' },
        { name: 'mleko', quantity: 300, unit: 'ml' },
        { name: 'jajka', quantity: 2, unit: 'szt' },
        { name: 'cukier', quantity: 1, unit: 'łyżka' },
        { name: 'sól', quantity: 1, unit: 'szczypta' }
      ],
      steps: [
        'Wymieszaj składniki suche', 
        'Dodaj mleko i dokładnie wymieszaj', 
        'Dodaj jajka i wymieszaj na gładką masę',
        'Smaż na patelni z niewielką ilością oleju'
      ]
    };
    
    const preferences = {
      dietType: 'bezglutenowa',
      excludedProducts: ['mleko'],
      allergens: ['gluten', 'laktoza']
    };
    
    const modifiedRecipe = await openRouterService.modifyRecipe(recipe, preferences);
    console.log('Zmodyfikowany przepis:', modifiedRecipe);
    
    // Zmodyfikowany przepis będzie zawierał:
    // - Zastąpioną mąkę pszenną (bezglutenowa alternatywa)
    // - Zastąpione mleko (alternatywa bez laktozy)
    // - Dostosowane kroki
    // - Wartości odżywcze
  } catch (error) {
    console.error('Błąd podczas modyfikacji przepisu:', error);
  }
}
```

## Sugerowanie alternatywnych składników

### Przykład sugerowania zamienników

```javascript
async function suggestAlternativesExample() {
  try {
    const ingredients = [
      'mąka pszenna',
      'mleko krowie',
      'masło',
      'cukier biały'
    ];
    
    const preferences = {
      dietType: 'wegańska',
      excludedProducts: ['nabiał'],
      allergens: ['gluten']
    };
    
    const alternatives = await openRouterService.suggestIngredientAlternatives(
      ingredients,
      preferences
    );
    
    console.log('Alternatywne składniki:', alternatives);
    
    // Funkcja zwróci obiekt:
    // {
    //   alternatives: [
    //     {
    //       original: "mąka pszenna",
    //       alternatives: [
    //         { name: "mąka z ciecierzycy", benefit: "bezglutenowa, bogata w białko" },
    //         { name: "mąka ryżowa", benefit: "bezglutenowa, lekka konsystencja" }
    //       ]
    //     },
    //     {
    //       original: "mleko krowie",
    //       alternatives: [...]
    //     }
    //   ]
    // }
  } catch (error) {
    console.error('Błąd podczas sugerowania alternatyw:', error);
  }
}
```

## Sprawdzanie statusu API

### Przykład sprawdzania statusu

```javascript
async function checkApiStatusExample() {
  try {
    const status = await openRouterService.checkStatus();
    console.log('Status API:', status);
    
    // Status zawiera:
    // {
    //   status: 'connected', // lub 'error'
    //   response: 'OK', // odpowiedź z API
    //   timestamp: '2023-11-15T12:34:56.789Z' // kiedy sprawdzono
    // }
    
    if (status.status === 'connected') {
      console.log('API działa poprawnie');
    } else {
      console.warn('Problem z API:', status.error);
    }
  } catch (error) {
    console.error('Błąd podczas sprawdzania statusu:', error);
  }
}
```

## Obsługa błędów

### Przykład łapania błędów serwisu

```javascript
async function errorHandlingExample() {
  try {
    // Próba użycia serwisu
    const result = await openRouterService.generateText({
      prompt: 'Testowy prompt'
    });
    
    return result;
  } catch (error) {
    // Sprawdzanie typu błędu
    if (error instanceof openRouterService.AuthenticationError) {
      console.error('Błąd uwierzytelniania:', error.message);
      // Np. nieprawidłowy klucz API
    } else if (error instanceof openRouterService.RateLimitError) {
      console.error('Przekroczono limit zapytań:', error.message);
      // Można dodać logikę oczekiwania i ponownej próby
    } else if (error instanceof openRouterService.NetworkError) {
      console.error('Problem z siecią:', error.message);
      // Problemy z połączeniem z API
    } else if (error instanceof openRouterService.ProcessingError) {
      console.error('Błąd przetwarzania:', error.message);
      // Np. nieprawidłowy format odpowiedzi
    } else {
      console.error('Nieznany błąd:', error);
    }
    
    // Możesz też użyć kodu błędu
    console.log('Kod błędu:', error.code);
    console.log('Status HTTP:', error.httpStatus);
    
    // W przypadku potrzeby można sprawdzić oryginalny błąd
    if (error.originalError) {
      console.error('Oryginalny błąd:', error.originalError);
    }
    
    throw error; // Rzuć dalej lub obsłuż
  }
}
```

## Tryb symulacji

Jeśli z jakiegoś powodu moduł OpenAI nie jest dostępny lub występują problemy z kluczem API, serwis automatycznie przełączy się w tryb symulacji.

### Sprawdzanie trybu

```javascript
function checkMockMode() {
  if (openRouterService.mockMode) {
    console.warn('Serwis działa w trybie symulacji - odpowiedzi są generowane lokalnie');
    // Możesz dodać własną logikę do obsługi tego trybu
  }
}
```

### Wymuszanie trybu symulacji (w testach)

```javascript
const { OpenRouterService } = require('../services/openRouterService');

// Wymuszenie trybu symulacji dla testów
const testService = new OpenRouterService({
  apiKey: 'nieprawidłowy-klucz' // Celowo nieprawidłowy
});

// Serwis powinien przełączyć się w tryb symulacji
console.log('Czy tryb symulacji:', testService.mockMode); // true
``` 
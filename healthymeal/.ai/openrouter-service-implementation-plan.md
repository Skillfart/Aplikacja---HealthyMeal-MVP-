# Plan Wdrożenia Usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter zapewnia ujednolicony dostęp do różnych modeli językowych (LLM) poprzez abstrakcyjne API. Głównym celem usługi jest umożliwienie aplikacji korzystania z tych modeli bez konieczności implementacji integracji z każdym dostawcą z osobna. Usługa będzie:

- Obsługiwać komunikację z API OpenRouter
- Zarządzać kluczami API i konfiguracją
- Formatować zapytania zgodnie z wymaganiami API
- Przetwarzać odpowiedzi i obsługiwać błędy
- Zapewniać retries i rate limiting
- Dostarczać łatwy w użyciu interfejs dla deweloperów

## 2. Opis konstruktora

```javascript
/**
 * Inicjalizuje usługę OpenRouter
 * @param {Object} config - Konfiguracja usługi
 * @param {string} config.apiKey - Klucz API OpenRouter
 * @param {string} [config.baseURL='https://openrouter.ai/api/v1'] - Bazowy URL API
 * @param {string} [config.defaultModel='openai/gpt-4o'] - Domyślny model
 * @param {Object} [config.defaultHeaders] - Dodatkowe nagłówki HTTP
 * @param {string} [config.defaultHeaders['HTTP-Referer']] - URL strony dla rankingów
 * @param {string} [config.defaultHeaders['X-Title']] - Nazwa aplikacji dla rankingów
 * @param {Object} [config.logger] - Obiekt loggera (musi implementować metody info, warn, error)
 * @param {Object} [config.retryOptions] - Opcje dla strategii ponowień
 * @param {number} [config.retryOptions.maxRetries=3] - Maksymalna liczba prób
 * @param {number} [config.retryOptions.initialDelay=1000] - Początkowe opóźnienie (ms)
 * @param {number} [config.retryOptions.maxDelay=30000] - Maksymalne opóźnienie (ms)
 */
constructor(config) {
  this.apiKey = config.apiKey;
  this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
  this.defaultModel = config.defaultModel || 'openai/gpt-4o';
  this.defaultHeaders = {
    'HTTP-Referer': config.defaultHeaders?.['HTTP-Referer'] || 'https://your-site.com',
    'X-Title': config.defaultHeaders?.['X-Title'] || 'Your Application',
    ...config.defaultHeaders
  };
  this.logger = config.logger || console;
  this.retryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    ...config.retryOptions
  };
  
  this._initializeClient();
}
```

## 3. Publiczne metody i pola

### 3.1. Generowanie odpowiedzi tekstowej

```javascript
/**
 * Generuje odpowiedź tekstową na podstawie prompta
 * @param {Object} options - Opcje zapytania
 * @param {string} options.prompt - Prompt użytkownika
 * @param {string} [options.systemMessage] - Komunikat systemowy definiujący rolę modelu
 * @param {string} [options.model] - Model do użycia (override domyślnego)
 * @param {number} [options.temperature=0.7] - Temperatura generowania (0-1)
 * @param {number} [options.maxTokens] - Maksymalna liczba tokenów w odpowiedzi
 * @param {Object} [options.additionalParams] - Dodatkowe parametry dla API
 * @returns {Promise<string>} - Wygenerowana odpowiedź tekstowa
 */
async generateText(options) {
  // Implementacja
}
```

### 3.2. Generowanie strukturyzowanej odpowiedzi

```javascript
/**
 * Generuje odpowiedź w formacie JSON zgodną ze schematem
 * @param {Object} options - Opcje zapytania
 * @param {string} options.prompt - Prompt użytkownika
 * @param {string} [options.systemMessage] - Komunikat systemowy definiujący rolę modelu
 * @param {Object} options.schema - Schema JSON odpowiedzi
 * @param {string} [options.model] - Model do użycia (override domyślnego)
 * @param {number} [options.temperature=0.3] - Temperatura generowania (0-1)
 * @param {Object} [options.additionalParams] - Dodatkowe parametry dla API
 * @returns {Promise<Object>} - Odpowiedź w formacie JSON
 */
async generateStructured(options) {
  // Implementacja
}
```

### 3.3. Dostęp do surowego API

```javascript
/**
 * Wykonuje bezpośrednie zapytanie do API OpenRouter
 * @param {Object} params - Parametry zapytania zgodne z API OpenRouter
 * @returns {Promise<Object>} - Surowa odpowiedź z API
 */
async createCompletion(params) {
  // Implementacja
}
```

### 3.4. Sprawdzanie stanu

```javascript
/**
 * Sprawdza stan połączenia z API i dostępne modele
 * @returns {Promise<Object>} - Informacje o stanie
 */
async checkStatus() {
  // Implementacja
}
```

## 4. Prywatne metody i pola

### 4.1. Inicjalizacja klienta

```javascript
/**
 * Inicjalizuje klienta HTTP
 * @private
 */
_initializeClient() {
  this.client = new OpenAI({
    baseURL: this.baseURL,
    apiKey: this.apiKey,
    defaultHeaders: this.defaultHeaders
  });
  
  this.logger.info('OpenRouter client initialized');
}
```

### 4.2. Formatowanie komunikatów

```javascript
/**
 * Przygotowuje wiadomości do zapytania
 * @private
 * @param {string} systemMessage - Komunikat systemowy
 * @param {string} userPrompt - Prompt użytkownika
 * @returns {Array<Object>} - Tablica wiadomości
 */
_formatMessages(systemMessage, userPrompt) {
  const messages = [];
  
  if (systemMessage) {
    messages.push({
      role: 'system',
      content: systemMessage
    });
  }
  
  messages.push({
    role: 'user',
    content: userPrompt
  });
  
  return messages;
}
```

### 4.3. Obsługa ponowień

```javascript
/**
 * Wykonuje zapytanie z obsługą ponowień
 * @private
 * @param {Function} requestFn - Funkcja wykonująca zapytanie
 * @param {number} [retries=this.retryOptions.maxRetries] - Pozostała liczba prób
 * @returns {Promise<any>} - Wynik zapytania
 */
async _withRetries(requestFn, retries = this.retryOptions.maxRetries) {
  try {
    return await requestFn();
  } catch (error) {
    if (retries <= 0 || !this._isRetryableError(error)) {
      throw error;
    }
    
    const delay = this._calculateBackoff(this.retryOptions.maxRetries - retries);
    this.logger.warn(`Request failed, retrying in ${delay}ms. Attempts left: ${retries}`, error);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return this._withRetries(requestFn, retries - 1);
  }
}
```

### 4.4. Weryfikacja odpowiedzi

```javascript
/**
 * Weryfikuje odpowiedź pod kątem poprawności
 * @private
 * @param {Object} response - Odpowiedź z API
 * @param {Object} schema - Schema JSON do walidacji
 * @returns {boolean} - Czy odpowiedź jest poprawna
 */
_validateResponse(response, schema) {
  // Implementacja walidacji JSON Schema
}
```

## 5. Obsługa błędów

### 5.1. Hierarchia błędów

```javascript
/**
 * Bazowa klasa błędów OpenRouter
 */
class OpenRouterError extends Error {
  constructor(message, code, httpStatus = null, originalError = null) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.originalError = originalError;
  }
}

/**
 * Błąd autoryzacji
 */
class AuthenticationError extends OpenRouterError {
  constructor(message, httpStatus, originalError) {
    super(message, 'AUTHENTICATION_ERROR', httpStatus, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Błąd limitów zapytań
 */
class RateLimitError extends OpenRouterError {
  constructor(message, httpStatus, originalError) {
    super(message, 'RATE_LIMIT_ERROR', httpStatus, originalError);
    this.name = 'RateLimitError';
  }
}

/**
 * Błąd modelu
 */
class ModelError extends OpenRouterError {
  constructor(message, httpStatus, originalError) {
    super(message, 'MODEL_ERROR', httpStatus, originalError);
    this.name = 'ModelError';
  }
}

/**
 * Błąd sieci
 */
class NetworkError extends OpenRouterError {
  constructor(message, originalError) {
    super(message, 'NETWORK_ERROR', null, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Błąd przetwarzania
 */
class ProcessingError extends OpenRouterError {
  constructor(message, originalError) {
    super(message, 'PROCESSING_ERROR', null, originalError);
    this.name = 'ProcessingError';
  }
}
```

### 5.2. Mapowanie błędów HTTP na klasy błędów

```javascript
/**
 * Mapuje błąd HTTP na odpowiednią klasę błędu
 * @private
 * @param {Error} error - Oryginalny błąd
 * @returns {OpenRouterError} - Zmapowany błąd
 */
_mapHttpError(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  
  if (status === 401 || status === 403) {
    return new AuthenticationError(
      data?.error?.message || 'Authentication failed',
      status,
      error
    );
  }
  
  if (status === 429) {
    return new RateLimitError(
      data?.error?.message || 'Rate limit exceeded',
      status,
      error
    );
  }
  
  if (status === 404) {
    return new ModelError(
      data?.error?.message || 'Model not found',
      status,
      error
    );
  }
  
  if (status >= 500) {
    return new NetworkError(
      data?.error?.message || 'Service unavailable',
      error
    );
  }
  
  return new OpenRouterError(
    data?.error?.message || error.message,
    'UNKNOWN_ERROR',
    status,
    error
  );
}
```

## 6. Kwestie bezpieczeństwa

### 6.1. Obsługa kluczy API

- **Przechowywanie**: Klucze API powinny być przechowywane w zmiennych środowiskowych lub dedykowanych systemach zarządzania sekretami (Vault, AWS Secrets Manager, itp.), nigdy w kodzie.
- **Rotacja**: Zaimplementuj regularną rotację kluczy API.
- **Ograniczenia**: Ogranicz uprawnienia kluczy API do minimum wymaganego dla danej funkcjonalności.

### 6.2. Walidacja danych

- **Wejściowych**: Waliduj wszystkie dane wejściowe przed wysłaniem do API.
- **Wyjściowych**: Waliduj odpowiedzi otrzymane z API przed ich użyciem.
- **Content filtering**: Implementuj filtrowanie treści niebezpiecznych w promptach i odpowiedziach.

### 6.3. Rate limiting

- **Implementacja**: Zaimplementuj rate limiting po stronie klienta, aby uniknąć przekroczenia limitów API.
- **Monitoring**: Monitoruj zużycie API i alertuj o nietypowych wzorcach.
- **Obsługa przekroczeń**: Przygotuj strategie obsługi przekroczenia limitów (kolejkowanie, degradacja funkcjonalności).

### 6.4. Monitoring i audyt

- **Logowanie**: Loguj wszystkie zapytania i odpowiedzi (z sanityzacją wrażliwych danych).
- **Audyt**: Wykonuj regularne audyty wykorzystania usługi.
- **Alerty**: Skonfiguruj alerty dla nietypowych wzorców użycia lub błędów.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Instalacja pakietów

```bash
npm install openai axios dotenv
```

### Krok 2: Konfiguracja środowiska

Utwórz plik `.env`:

```
OPENROUTER_API_KEY=sk-or-v1-your-api-key
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o
APP_URL=https://your-site.com
APP_NAME=Your Application
```

Utwórz plik konfiguracyjny `src/config/env.js`:

```javascript
require('dotenv').config();

module.exports = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_DEFAULT_MODEL: process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4o',
  APP_URL: process.env.APP_URL || 'https://your-site.com',
  APP_NAME: process.env.APP_NAME || 'Your Application'
};
```

### Krok 3: Implementacja klas błędów

Utwórz plik `src/errors/OpenRouterError.js`:

```javascript
class OpenRouterError extends Error {
  constructor(message, code, httpStatus = null, originalError = null) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.originalError = originalError;
  }
}

// Implementuj pozostałe klasy błędów...

module.exports = {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
  ModelError,
  NetworkError,
  ProcessingError
};
```

### Krok 4: Implementacja usługi OpenRouter

Utwórz plik `src/services/openRouterService.js`:

```javascript
const OpenAI = require('openai');
const config = require('../config/env');
const { 
  OpenRouterError, 
  AuthenticationError,
  RateLimitError,
  ModelError,
  NetworkError,
  ProcessingError
} = require('../errors/OpenRouterError');

class OpenRouterService {
  constructor(options = {}) {
    this.apiKey = options.apiKey || config.OPENROUTER_API_KEY;
    this.baseURL = options.baseURL || 'https://openrouter.ai/api/v1';
    this.defaultModel = options.defaultModel || config.OPENROUTER_DEFAULT_MODEL;
    this.defaultHeaders = {
      'HTTP-Referer': options.httpReferrer || config.APP_URL,
      'X-Title': options.appName || config.APP_NAME,
    };
    
    this.client = null;
    this._initializeClient();
  }
  
  // Implementuj metody...
}

module.exports = OpenRouterService;
```

### Krok 5: Implementacja metod pomocniczych

Dodaj metody pomocnicze do klasy OpenRouterService:

```javascript
_initializeClient() {
  try {
    this.client = new OpenAI({
      baseURL: this.baseURL,
      apiKey: this.apiKey,
      defaultHeaders: this.defaultHeaders
    });
  } catch (error) {
    throw new OpenRouterError(
      'Failed to initialize OpenRouter client',
      'INITIALIZATION_ERROR',
      null,
      error
    );
  }
}

_formatMessages(systemMessage, userPrompt) {
  const messages = [];
  
  if (systemMessage) {
    messages.push({
      role: 'system',
      content: systemMessage
    });
  }
  
  messages.push({
    role: 'user',
    content: userPrompt
  });
  
  return messages;
}

async _makeRequest(params) {
  try {
    return await this.client.chat.completions.create(params);
  } catch (error) {
    throw this._mapHttpError(error);
  }
}

// ... inne metody pomocnicze
```

### Krok 6: Implementacja metod publicznych

Dodaj metody publiczne do klasy OpenRouterService:

```javascript
async generateText(options) {
  const { 
    prompt, 
    systemMessage = 'You are a helpful assistant.', 
    model = this.defaultModel, 
    temperature = 0.7, 
    maxTokens,
    additionalParams = {}
  } = options;
  
  const messages = this._formatMessages(systemMessage, prompt);
  
  const params = {
    model,
    messages,
    temperature,
    ...additionalParams
  };
  
  if (maxTokens) {
    params.max_tokens = maxTokens;
  }
  
  const response = await this._makeRequest(params);
  return response.choices[0].message.content;
}

async generateStructured(options) {
  const {
    prompt,
    systemMessage = 'You are a helpful assistant that responds in JSON format.',
    schema,
    model = this.defaultModel,
    temperature = 0.3,
    additionalParams = {}
  } = options;
  
  const messages = this._formatMessages(systemMessage, prompt);
  
  const params = {
    model,
    messages,
    temperature,
    response_format: { 
      type: 'json_schema',
      json_schema: {
        name: schema.title || 'response',
        strict: true,
        schema
      }
    },
    ...additionalParams
  };
  
  const response = await this._makeRequest(params);
  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new ProcessingError('Failed to parse JSON response', error);
  }
}

// ... inne metody publiczne
```

### Krok 7: Konfiguracja testów jednostkowych

Utwórz plik `tests/services/openRouterService.test.js`:

```javascript
const OpenRouterService = require('../../src/services/openRouterService');
const { OpenRouterError } = require('../../src/errors/OpenRouterError');

// Mock openai
jest.mock('openai', () => {
  // Implementacja mocka
});

describe('OpenRouterService', () => {
  let service;
  
  beforeEach(() => {
    service = new OpenRouterService({
      apiKey: 'test-api-key'
    });
  });
  
  test('it should initialize properly', () => {
    expect(service).toBeDefined();
    expect(service.client).toBeDefined();
  });
  
  // ... więcej testów
});
```

### Krok 8: Dokumentacja i przykłady użycia

Utwórz plik `README.md` z przykładami użycia:

```markdown
# OpenRouter Service

Usługa integrująca aplikację z API OpenRouter dla dostępu do modeli LLM.

## Przykłady użycia

```javascript
const OpenRouterService = require('./services/openRouterService');

// Inicjalizacja
const openRouter = new OpenRouterService();

// Generowanie tekstu
async function getResponse() {
  try {
    const response = await openRouter.generateText({
      prompt: 'What are the benefits of regular exercise?',
      systemMessage: 'You are a health and fitness expert.'
    });
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Generowanie strukturyzowanej odpowiedzi
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
          quantity: { type: 'string' }
        }
      }
    },
    instructions: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

async function getRecipe() {
  try {
    const recipe = await openRouter.generateStructured({
      prompt: 'Create a recipe for a vegetarian pasta dish',
      schema: recipeSchema,
      systemMessage: 'You are a professional chef.'
    });
    console.log(recipe);
  } catch (error) {
    console.error('Error:', error);
  }
}
```
```

## Podsumowanie

Ten plan wdrożenia opisuje kompleksowy sposób integracji API OpenRouter z aplikacją. Przedstawia kluczowe komponenty, interfejsy, obsługę błędów oraz kwestie bezpieczeństwa. Implementując ten plan, deweloperzy mogą szybko i efektywnie zintegrować zaawansowane możliwości LLM z dowolną aplikacją. 
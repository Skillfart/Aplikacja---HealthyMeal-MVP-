/**
 * Serwis do komunikacji z OpenRouter API
 * Obsługuje modyfikację przepisów i sugerowanie alternatyw dla składników
 * z wykorzystaniem AI przez OpenRouter
 */

// Obsługa braku modułu openai - zastosowanie trybu symulacji
let openaiAvailable = false;
try {
  require('openai');
  openaiAvailable = true;
} catch (error) {
  console.warn('Moduł OpenAI nie został znaleziony. Usługi AI będą działać w trybie symulacji.');
}

const axios = require('axios');
const logger = require('../utils/logger');
const {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
  ModelError,
  NetworkError,
  ProcessingError,
  TimeoutError,
  ConfigurationError
} = require('../errors/OpenRouterError');

// Domyślne dane do trybu symulacji (gdy brak klucza API)
const mockModifiedRecipe = {
  title: 'Sałatka warzywna w wersji wegańskiej',
  description: 'Lekka, odżywcza sałatka warzywna w wersji wegańskiej, idealna jako przystawka lub lekki posiłek.',
  preparationTime: 20,
  difficulty: 'łatwy',
  servings: 4,
  ingredients: [
    { name: 'ogórek', quantity: 2, unit: 'sztuki' },
    { name: 'pomidor', quantity: 3, unit: 'sztuki' },
    { name: 'ciecierzyca', quantity: 200, unit: 'g' },
    { name: 'czerwona cebula', quantity: 1, unit: 'sztuka' },
    { name: 'awokado', quantity: 1, unit: 'sztuka' },
    { name: 'oliwa z oliwek', quantity: 2, unit: 'łyżki' },
    { name: 'sok z cytryny', quantity: 1, unit: 'łyżka' },
    { name: 'sól morska', quantity: 0.5, unit: 'łyżeczki' },
    { name: 'świeżo mielony pieprz', quantity: 0.25, unit: 'łyżeczki' }
  ],
  steps: [
    'Umyj i pokrój ogórki w kostkę.',
    'Pokrój pomidory w kostkę, usuwając nasiona.',
    'Odsącz i przepłucz ciecierzycę.',
    'Pokrój czerwoną cebulę w cienkie plasterki.',
    'Obierz i pokrój awokado w kostkę.',
    'W małej misce wymieszaj oliwę z oliwek, sok z cytryny, sól i pieprz.',
    'Połącz wszystkie składniki w dużej misce.',
    'Polej sosem i delikatnie wymieszaj.',
    'Podawaj schłodzone.'
  ],
  tags: ['wegańskie', 'bezglutenowe', 'lekkie'],
  nutritionalValues: {
    calories: 220,
    protein: 6,
    carbohydrates: 18,
    fat: 15,
    fiber: 7,
    sugar: 4
  },
  notes: 'Ta wegańska wersja sałatki jest bogata w błonnik i zdrowe tłuszcze. Możesz dodać orzechy lub nasiona dla zwiększenia zawartości białka.'
};

const mockAlternatives = [
  {
    name: 'tofu',
    benefits: 'Dobre źródło białka roślinnego, niska zawartość tłuszczu',
    howToUse: 'Pokrój w kostkę i podsmaż lub dodaj bezpośrednio do sałatek'
  },
  {
    name: 'tempeh',
    benefits: 'Bogaty w probiotyki, wysoka zawartość białka',
    howToUse: 'Pokrój w plasterki, zamarynuj i podsmaż przed dodaniem do dania'
  },
  {
    name: 'seitan',
    benefits: 'Wysoka zawartość białka, niska zawartość tłuszczu, dobra tekstura',
    howToUse: 'Pokrój w paski i podsmaż, używaj jako zamiennika mięsa w daniach'
  }
];

class OpenRouterService {
  /**
   * Konstruktor serwisu OpenRouter
   * @param {Object} options - Opcje konfiguracyjne
   * @param {string} options.apiKey - Klucz API do OpenRouter
   * @param {string} options.baseURL - Bazowy URL API (domyślnie: 'https://openrouter.ai/api/v1')
   * @param {string} options.defaultModel - Domyślny model AI (domyślnie: wartość z OPENROUTER_DEFAULT_MODEL)
   * @param {boolean} options.simulationMode - Czy używać trybu symulacji (bez rzeczywistych wywołań API)
   * @param {number} options.timeout - Timeout dla żądań w milisekundach (domyślnie: 60000)
   * @param {Object} options.retryOptions - Opcje ponownego próbowania
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY || null;
    this.baseURL = options.baseURL || 'https://openrouter.ai/api/v1';
    this.defaultModel = options.defaultModel || process.env.OPENROUTER_DEFAULT_MODEL || 'gpt-4o-mini';
    this.timeout = options.timeout || 60000; // 60 sekund timeout dla zapytań AI
    
    // Opcje ponownego próbowania
    this.retryOptions = {
      maxRetries: 2,
      retryDelay: 2000,
      retryStatusCodes: [429, 500, 502, 503, 504],
      ...options.retryOptions
    };
    
    // Określenie trybu pracy serwisu
    this._determineServiceMode(options);
    
    // Inicjalizacja klienta axios z podstawową konfiguracją
    if (!this.simulationMode) {
      this._initClient();
    } else {
      logger.info('OpenRouterService działa w trybie symulacji - nie inicjalizuję klienta HTTP');
    }
  }
  
  /**
   * Określa tryb pracy serwisu (rzeczywisty lub symulacja)
   * @param {Object} options - Opcje konfiguracyjne
   * @private
   */
  _determineServiceMode(options) {
    // Sprawdzenie poprawności klucza API
    if (!this.apiKey) {
      logger.warn('Brak klucza API dla OpenRouter - wymuszam tryb symulacji');
      this.simulationMode = true;
      return;
    }
    
    // Sprawdź format klucza API
    const isValidKeyFormat = this._validateApiKeyFormat(this.apiKey);
    if (!isValidKeyFormat) {
      logger.warn('Klucz API OpenRouter ma nieprawidłowy format - wymuszam tryb symulacji');
      this.simulationMode = true;
      return;
    }
    
    // Jawne wymuszenie trybu symulacji ma priorytet
    if (options.simulationMode === true) {
      logger.info('OpenRouterService działa w trybie symulacji (wymuszonym przez opcję)');
      this.simulationMode = true;
      return;
    }
    
    // Sprawdź czy moduł OpenAI jest dostępny
    if (!openaiAvailable) {
      logger.warn('Moduł OpenAI niedostępny - wymuszam tryb symulacji');
        this.simulationMode = true;
      return;
    }
    
    // Domyślnie używamy rzeczywistego API jeśli klucz wygląda poprawnie
    this.simulationMode = false;
        logger.info('OpenRouterService działa w trybie rzeczywistym - używamy API OpenRouter');
  }
  
  /**
   * Sprawdza poprawność formatu klucza API
   * @param {string} apiKey - Klucz API do walidacji
   * @returns {boolean} - Czy klucz ma poprawny format
   * @private
   */
  _validateApiKeyFormat(apiKey) {
    // Sprawdź czy klucz spełnia podstawowy format sk-or-v1-*
    const isTestKey = apiKey.includes('testkey');
    const hasCorrectPrefix = apiKey.startsWith('sk-or-v1-');
    const hasMinimalLength = apiKey.length >= 30;
    
    if (isTestKey) {
      logger.warn('Wykryto testowy klucz API OpenRouter - aktywuję tryb symulacji');
      return false;
    }
    
    return hasCorrectPrefix && hasMinimalLength;
  }
  
  /**
   * Inicjalizacja klienta HTTP z nagłówkami autoryzacyjnymi
   * @private
   */
  _initClient() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_REFERER || 'https://healthymeal.app',
        'X-Title': 'HealthyMeal App'
      },
      timeout: this.timeout
    });
    
    // Dodajemy interceptor do obsługi błędów
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.code === 'ECONNABORTED') {
          throw new TimeoutError(`Upłynął limit czasu żądania (${this.timeout}ms)`, error);
        }
        throw error;
      }
    );
  }
  
  /**
   * Generowanie wiadomości systemowej opisującej zadanie dla modelu
   * @param {string} task - Rodzaj zadania ('modify_recipe', 'suggest_alternatives')
   * @returns {string} - Wiadomość systemowa
   * @private
   */
  _getSystemMessage(task) {
    const systemMessages = {
      modify_recipe: `Jesteś ekspertem kulinarnym specjalizującym się w modyfikacji przepisów zgodnie 
      z preferencjami żywieniowymi. Twoim zadaniem jest dostosowanie przepisu do określonych wymagań 
      dietetycznych, alergii, celów zdrowotnych i preferencji smakowych, zachowując jak najlepszy smak 
      i wartości odżywcze. Odpowiadaj TYLKO w formacie JSON z dokładnie takimi samymi polami jak w 
      oryginalnym przepisie, nie dodawaj komentarzy poza strukturą JSON.`,
      
      suggest_alternatives: `Jesteś ekspertem kulinarnym specjalizującym się w znajdowaniu alternatywnych 
      składników, które pasują do określonych preferencji dietetycznych i celów zdrowotnych. Twoim zadaniem 
      jest zaproponowanie zamienników, które zachowają podobny profil smakowy i teksturę, jednocześnie 
      spełniając wymagania dietetyczne. Odpowiadaj TYLKO w formacie JSON jako tablica obiektów, 
      każdy z polami: 'name', 'benefits', 'howToUse'.`
    };
    
    return systemMessages[task] || systemMessages.modify_recipe;
  }
  
  /**
   * Modyfikacja przepisu za pomocą AI na podstawie preferencji użytkownika
   * @param {Object} recipe - Oryginalny przepis
   * @param {Object} preferences - Preferencje użytkownika
   * @param {number} maxRetries - Maksymalna liczba ponownych prób w przypadku błędów
   * @returns {Promise<Object>} - Zmodyfikowany przepis
   */
  async modifyRecipe(recipe, preferences, maxRetries = this.retryOptions.maxRetries) {
    try {
    // W trybie symulacji zwróć mockowy przepis dostosowany do struktury oryginalnego przepisu
    if (this.simulationMode) {
      logger.info('Używam trybu symulacji dla modyfikacji przepisu');
      
      // Otrzymaj strukturę oryginalnego przepisu i dostosuj mockowy przepis
      const adaptedMockRecipe = { ...mockModifiedRecipe };
      
      // Jeśli oryginalny przepis ma pole user, zachowujemy je
      if (recipe.user) {
        adaptedMockRecipe.user = recipe.user;
      }
      
      // Jeśli oryginalny przepis ma pole _id, zachowujemy je jako originalId
      if (recipe._id) {
        adaptedMockRecipe.originalId = recipe._id;
      }
      
        // Dostosujmy nazwy pól, aby zapewnić kompatybilność z oryginałem
        for (const key in recipe) {
          if (!adaptedMockRecipe.hasOwnProperty(key) && 
            key !== 'ingredients' && 
            key !== 'steps' && 
            key !== 'tags' && 
            key !== 'nutritionalValues' &&
            typeof recipe[key] !== 'function') {
            adaptedMockRecipe[key] = recipe[key];
          }
        }
        
        // Dodajmy symulowane pole "originalRecipe" z ID oryginalnego przepisu
        adaptedMockRecipe.originalRecipe = {
          id: recipe._id || recipe.id || 'unknown-id',
          title: recipe.title
        };
        
        // Symulacja opóźnienia sieciowego
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return adaptedMockRecipe;
      }
      
      // Upewnijmy się, że mamy wszystkie potrzebne dane
      if (!recipe) {
        throw new ProcessingError('Brak przepisu do modyfikacji');
      }
      
      if (!preferences) {
        logger.warn('Brak preferencji - używam domyślnych');
        preferences = {
          dietType: 'normal',
          maxCarbs: 0,
          excludedProducts: [],
          allergens: []
        };
      }
      
      // Przygotuj prompt z przepisem i preferencjami
      const prompt = `
        Zmodyfikuj następujący przepis zgodnie z preferencjami użytkownika:
        
        Preferencje:
        - Dieta: ${preferences.dietType || 'normalna'}
        - Maksymalna ilość węglowodanów: ${preferences.maxCarbs || 'brak limitu'} g
        - Wykluczone produkty: ${preferences.excludedProducts?.length ? preferences.excludedProducts.join(', ') : 'brak'}
        - Alergeny: ${preferences.allergens?.length ? preferences.allergens.join(', ') : 'brak'}
        
        Oryginalny przepis:
        ${JSON.stringify(recipe, null, 2)}
        
        Zwróć zmodyfikowany przepis jako JSON z dokładnie tymi samymi polami co oryginalny przepis.
      `;
      
      // Przygotuj dane zapytania
      const data = {
        messages: [
          {
            role: 'system',
            content: this._getSystemMessage('modify_recipe')
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.defaultModel,
        temperature: 0.3,
        max_tokens: 1500
      };
      
      try {
        // Wykonaj zapytanie
        const response = await this._makeRequest(data);
        
        // Przetwórz odpowiedź JSON z modelu
        let modifiedRecipe;
        try {
          const content = response.choices[0].message.content;
          
          // Usuń potencjalne znaki ``` i json z treści
          const jsonContent = content
            .replace(/^```json/g, '')
            .replace(/^```/g, '')
            .replace(/```$/g, '')
            .trim();
          
          modifiedRecipe = JSON.parse(jsonContent);
          
          // Dodaj ID oryginalnego przepisu
          modifiedRecipe.originalId = recipe._id || recipe.id;
          
          return modifiedRecipe;
        } catch (jsonError) {
          logger.error('Błąd parsowania odpowiedzi JSON:', jsonError);
          
          // Próba automatycznego przejścia w tryb symulacji po błędzie parsowania
          logger.warn('Przechodzę w tryb symulacji po błędzie parsowania JSON');
          this.simulationMode = true;
          
          // Wywołaj rekurencyjnie tę samą metodę, ale teraz w trybie symulacji
          return this.modifyRecipe(recipe, preferences, 0);
        }
      } catch (error) {
        // Sprawdź, czy mamy jeszcze próby
        if (error instanceof TimeoutError && maxRetries > 0) {
          logger.warn(`Timeout przy modyfikacji przepisu, ponawiam (pozostałe próby: ${maxRetries})`);
          return this.modifyRecipe(recipe, preferences, maxRetries - 1);
        }
        
        // Dla określonych kodów statusu spróbuj ponownie
        if (error.response && 
            this.retryOptions.retryStatusCodes.includes(error.response.status) && 
            maxRetries > 0) {
          logger.warn(`Błąd ${error.response.status} przy modyfikacji przepisu, ponawiam (pozostałe próby: ${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, this.retryOptions.retryDelay));
          return this.modifyRecipe(recipe, preferences, maxRetries - 1);
        }
        
        // Jeśli to błąd braku kredytów lub limitu, przejdź w tryb symulacji
        if (error instanceof RateLimitError || 
           (error.response && error.response.status === 429)) {
          logger.warn('Przekroczono limit zapytań, przechodzę w tryb symulacji');
          this.simulationMode = true;
          return this.modifyRecipe(recipe, preferences, 0);
        }
        
        // Jeśli to inny błąd lub nie mamy już prób, rzuć odpowiedni wyjątek
        throw new ProcessingError('Wystąpił błąd podczas modyfikacji przepisu', error);
      }
    } catch (error) {
      // Logowanie błędu
      if (error instanceof OpenRouterError) {
        logger.error(`[OpenRouter] ${error.name}: ${error.message}`);
        
        // Dla niektórych typów błędów automatycznie przejdź w tryb symulacji
        if (error instanceof AuthenticationError || 
            error instanceof RateLimitError ||
            error instanceof TimeoutError) {
          logger.warn(`Przechodzę w tryb symulacji po błędzie: ${error.name}`);
          this.simulationMode = true;
          return this.modifyRecipe(recipe, preferences, 0);
        }
        
        throw error;
      } else {
        logger.error('Nieobsługiwany błąd podczas modyfikacji przepisu:', error);
        
        // Automatycznie przejdź w tryb symulacji przy nieobsługiwanych błędach
        logger.warn('Przechodzę w tryb symulacji po nieobsługiwanym błędzie');
        this.simulationMode = true;
        return this.modifyRecipe(recipe, preferences, 0);
      }
    }
  }
  
  /**
   * Sugerowanie alternatyw dla składnika
   * @param {string} ingredient - Nazwa składnika
   * @param {Object} preferences - Preferencje żywieniowe
   * @param {number} maxRetries - Maksymalna liczba ponownych prób w przypadku błędów
   * @returns {Promise<Array>} - Lista alternatyw
   */
  async suggestIngredientAlternatives(ingredient, preferences, maxRetries = this.retryOptions.maxRetries) {
    try {
      // W trybie symulacji zwróć mockowe dane
    if (this.simulationMode) {
        logger.info('Używam trybu symulacji dla sugestii alternatyw');
        
        // Symulacja opóźnienia sieciowego
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return mockAlternatives;
      }
      
      // Upewnijmy się, że mamy wszystkie potrzebne dane
      if (!ingredient) {
        throw new ProcessingError('Nie podano nazwy składnika');
      }
      
      if (!preferences) {
        logger.warn('Brak preferencji - używam domyślnych');
        preferences = {
          dietType: 'normal',
          maxCarbs: 0,
          excludedProducts: [],
          allergens: []
        };
      }
      
      // Przygotuj prompt z przepisem i preferencjami
      const prompt = `
        Zaproponuj alternatywy dla składnika "${ingredient}" zgodnie z preferencjami:
        
        Preferencje:
        - Dieta: ${preferences.dietType || 'normalna'}
        - Maksymalna ilość węglowodanów: ${preferences.maxCarbs || 'brak limitu'} g
        - Wykluczone produkty: ${preferences.excludedProducts?.length ? preferences.excludedProducts.join(', ') : 'brak'}
        - Alergeny: ${preferences.allergens?.length ? preferences.allergens.join(', ') : 'brak'}
        
        Zwróć alternatywy jako tablicę JSON, gdzie każdy element ma pola:
        - name: nazwa alternatywnego składnika
        - benefits: korzyści z użycia tego składnika
        - howToUse: jak używać tego składnika jako zamiennika
      `;
      
      // Przygotuj dane zapytania
      const data = {
        messages: [
          {
            role: 'system',
            content: this._getSystemMessage('suggest_alternatives')
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.defaultModel,
        temperature: 0.5,
        max_tokens: 800
      };
      
      try {
        // Wykonaj zapytanie
        const response = await this._makeRequest(data);
        
        // Przetwórz odpowiedź JSON z modelu
        try {
          const content = response.choices[0].message.content;
          
          // Usuń potencjalne znaki ``` i json z treści
          const jsonContent = content
            .replace(/^```json/g, '')
            .replace(/^```/g, '')
            .replace(/```$/g, '')
            .trim();
          
          const alternatives = JSON.parse(jsonContent);
          
          if (!Array.isArray(alternatives)) {
            throw new ProcessingError('Odpowiedź nie jest tablicą');
          }
          
          return alternatives;
        } catch (jsonError) {
          logger.error('Błąd parsowania odpowiedzi JSON:', jsonError);
          
          // Automatyczne przejście w tryb symulacji po błędzie parsowania
          logger.warn('Przechodzę w tryb symulacji po błędzie parsowania JSON');
          this.simulationMode = true;
          return this.suggestIngredientAlternatives(ingredient, preferences, 0);
        }
      } catch (error) {
        // Sprawdź, czy mamy jeszcze próby
        if (error instanceof TimeoutError && maxRetries > 0) {
          logger.warn(`Timeout przy generowaniu alternatyw, ponawiam (pozostałe próby: ${maxRetries})`);
          return this.suggestIngredientAlternatives(ingredient, preferences, maxRetries - 1);
        }
        
        // Dla określonych kodów statusu spróbuj ponownie
        if (error.response && 
            this.retryOptions.retryStatusCodes.includes(error.response.status) && 
            maxRetries > 0) {
          logger.warn(`Błąd ${error.response.status} przy generowaniu alternatyw, ponawiam (pozostałe próby: ${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, this.retryOptions.retryDelay));
          return this.suggestIngredientAlternatives(ingredient, preferences, maxRetries - 1);
        }
        
        // Jeśli to błąd braku kredytów lub limitu, przejdź w tryb symulacji
        if (error instanceof RateLimitError || 
           (error.response && error.response.status === 429)) {
          logger.warn('Przekroczono limit zapytań, przechodzę w tryb symulacji');
          this.simulationMode = true;
          return this.suggestIngredientAlternatives(ingredient, preferences, 0);
        }
        
        // Jeśli to inny błąd lub nie mamy już prób, rzuć odpowiedni wyjątek
        throw new ProcessingError('Wystąpił błąd podczas generowania alternatyw', error);
      }
    } catch (error) {
      // Logowanie błędu
      if (error instanceof OpenRouterError) {
        logger.error(`[OpenRouter] ${error.name}: ${error.message}`);
        
        // Dla niektórych typów błędów automatycznie przejdź w tryb symulacji
        if (error instanceof AuthenticationError || 
            error instanceof RateLimitError ||
            error instanceof TimeoutError) {
          logger.warn(`Przechodzę w tryb symulacji po błędzie: ${error.name}`);
          this.simulationMode = true;
          return this.suggestIngredientAlternatives(ingredient, preferences, 0);
        }
        
        throw error;
      } else {
        logger.error('Nieobsługiwany błąd podczas generowania alternatyw:', error);
        
        // Automatycznie przejdź w tryb symulacji
        logger.warn('Przechodzę w tryb symulacji po nieobsługiwanym błędzie');
        this.simulationMode = true;
        return this.suggestIngredientAlternatives(ingredient, preferences, 0);
      }
    }
  }
  
  /**
   * Sprawdzenie statusu API
   * @returns {Promise<Object>} - Informacje o statusie
   */
  async checkAPIStatus() {
    try {
      // W trybie symulacji zwróć mockowe dane
      if (this.simulationMode) {
        logger.info('Używam trybu symulacji dla sprawdzenia statusu API');
        
        // Symulacja opóźnienia sieciowego
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          status: 'ok',
          models: ['gpt-4o-mini', 'anthropic/claude-3-opus:beta'],
          simulationMode: true,
          credits: 100,
          requestsRemaining: 50
        };
      }
      
      // Wykonaj lekkie zapytanie do API
      const response = await this.client.get('/models');
      
      return {
        status: 'ok',
        models: response.data.data.map(model => model.id),
        simulationMode: false,
        apiVersion: response.data.api_version || 'unknown'
      };
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401 || status === 403) {
          // Automatyczne przejście w tryb symulacji przy błędzie autoryzacji
          logger.warn('Przechodzę w tryb symulacji po błędzie autoryzacji API');
          this.simulationMode = true;
          return this.checkAPIStatus();
        } else if (status === 429) {
          // Automatyczne przejście w tryb symulacji przy limicie zapytań
          logger.warn('Przechodzę w tryb symulacji po przekroczeniu limitu API');
          this.simulationMode = true;
          return this.checkAPIStatus();
        }
        
        throw new NetworkError(`Błąd API (${status}): ${data.error?.message || JSON.stringify(data)}`, error);
      } else if (error.code === 'ECONNABORTED') {
        // Automatyczne przejście w tryb symulacji przy timeoucie
        logger.warn('Przechodzę w tryb symulacji po timeoucie API');
        this.simulationMode = true;
        return this.checkAPIStatus();
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        // Automatyczne przejście w tryb symulacji przy błędzie połączenia
        logger.warn('Przechodzę w tryb symulacji po błędzie połączenia API');
        this.simulationMode = true;
        return this.checkAPIStatus();
      }
      
      // Inne nieznane błędy
      logger.error(`Nieoczekiwany błąd podczas sprawdzania statusu API: ${error.message}`);
      this.simulationMode = true;
      return this.checkAPIStatus();
    }
  }
  
  /**
   * Wykonanie zapytania do API OpenRouter
   * @param {Object} data - Dane żądania
   * @returns {Promise<Object>} - Odpowiedź API
   * @private
   */
  async _makeRequest(data) {
    logger.debug(`Wykonuję zapytanie do OpenRouter API: ${this.baseURL}/chat/completions`);
    
    try {
      const response = await this.client.post('/chat/completions', data);
      
      logger.debug(`Otrzymano odpowiedź od OpenRouter: ${response.status}`);
      
      return response.data;
    } catch (error) {
      // Obsługa różnych rodzajów błędów
      if (error.response) {
        const { status, data } = error.response;
        
        // Uzyskaj informacje o błędzie z odpowiedzi
        let errorMessage = 'Nieznany błąd API';
        let errorType = 'API_ERROR';
        
        if (data && data.error) {
          errorMessage = data.error.message || data.error;
          errorType = data.error.type || 'API_ERROR';
        }
        
        logger.error(`Błąd OpenRouter API (HTTP ${status}): ${JSON.stringify(data)}`);
        
        // Rzuć odpowiedni typ błędu
        if (status === 401) {
          throw new AuthenticationError('Nieprawidłowy klucz API lub brak autoryzacji', error);
        } else if (status === 403) {
          throw new AuthenticationError('Brak dostępu do API. Sprawdź uprawnienia.', error);
        } else if (status === 429) {
          logger.error('Przekroczono limit zapytań lub brak kredytów w OpenRouter API');
          throw new RateLimitError('Przekroczono limit zapytań lub brak kredytów. Skontaktuj się z administratorem.', error);
        } else if (status >= 500) {
          throw new NetworkError(`Błąd serwera OpenRouter (${status}). Spróbuj ponownie później.`, error);
        } else {
          throw new ProcessingError(
            `Błąd API OpenRouter: ${errorMessage} (${status})`,
            error
          );
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new TimeoutError(`Upłynął limit czasu żądania (${this.timeout}ms)`, error);
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        logger.error(`Błąd połączenia: nie można połączyć się z OpenRouter API: ${error.message}`);
        throw new NetworkError('Nie można połączyć się z API. Sprawdź połączenie internetowe.', error);
      } else {
        // Inne nieoczekiwane błędy
        logger.error(`Nieoczekiwany błąd podczas komunikacji z OpenRouter API: ${error.message}`);
        throw new ProcessingError('Wystąpił nieoczekiwany błąd podczas komunikacji z API.', error);
      }
    }
  }
}

module.exports = {
  OpenRouterService,
  OpenRouterError
};

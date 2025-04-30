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
   * @param {string} options.defaultModel - Domyślny model AI (domyślnie: 'anthropic/claude-3-opus:beta')
   * @param {boolean} options.simulationMode - Czy używać trybu symulacji (bez rzeczywistych wywołań API)
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey || '';
    this.baseURL = options.baseURL || 'https://openrouter.ai/api/v1';
    this.defaultModel = options.defaultModel || 'anthropic/claude-3-opus:beta';
    this.simulationMode = options.simulationMode || !this.apiKey || !openaiAvailable;
    
    if (!openaiAvailable) {
      logger.warn('Moduł OpenAI nie jest dostępny - serwis będzie działał w trybie symulacji');
      this.simulationMode = true;
    } else if (this.simulationMode) {
      logger.warn('OpenRouterService działa w trybie symulacji - nie są wykonywane rzeczywiste zapytania do API');
    } else if (!this.apiKey) {
      logger.error('Brak klucza API dla OpenRouter - serwis będzie działał w trybie symulacji');
      this.simulationMode = true;
    }
    
    // Inicjalizacja klienta axios z podstawową konfiguracją
    this._initClient();
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
      timeout: 60000 // 60 sekund timeout dla zapytań AI
    });
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
   * @returns {Promise<Object>} - Zmodyfikowany przepis
   */
  async modifyRecipe(recipe, preferences) {
    // W trybie symulacji zwróć mockowy przepis
    if (this.simulationMode) {
      return Promise.resolve(mockModifiedRecipe);
    }
    
    try {
      // Przygotuj wiadomość systemową
      const systemMessage = this._getSystemMessage('modify_recipe');
      
      // Przygotuj wiadomość użytkownika z przepisem i preferencjami
      const userMessage = JSON.stringify({
        recipe,
        preferences
      });
      
      // Wykonaj zapytanie do API
      const response = await this._makeRequest({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: this.defaultModel,
        temperature: 0.7,
        max_tokens: 4000
      });
      
      // Parsuj odpowiedź jako JSON
      let modifiedRecipe;
      try {
        modifiedRecipe = JSON.parse(response);
      } catch (e) {
        logger.error('Błąd podczas parsowania odpowiedzi JSON:', e);
        // Jeśli parsowanie się nie powiedzie, spróbuj wydobyć JSON z tekstu
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                          response.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          try {
            modifiedRecipe = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch (e2) {
            throw new Error('Nie udało się sparsować odpowiedzi jako JSON');
          }
        } else {
          throw new Error('Odpowiedź nie zawiera poprawnego formatu JSON');
        }
      }
      
      return modifiedRecipe;
    } catch (error) {
      logger.error('Błąd podczas modyfikacji przepisu:', error);
      throw new OpenRouterError('RECIPE_MODIFICATION_FAILED', error.message);
    }
  }
  
  /**
   * Sugerowanie alternatywnych składników na podstawie preferencji
   * @param {string} ingredient - Oryginalny składnik
   * @param {Object} preferences - Preferencje użytkownika
   * @returns {Promise<Array>} - Lista alternatywnych składników
   */
  async suggestIngredientAlternatives(ingredient, preferences) {
    // W trybie symulacji zwróć mockowe alternatywy
    if (this.simulationMode) {
      return Promise.resolve(mockAlternatives);
    }
    
    try {
      // Przygotuj wiadomość systemową
      const systemMessage = this._getSystemMessage('suggest_alternatives');
      
      // Przygotuj wiadomość użytkownika ze składnikiem i preferencjami
      const userMessage = JSON.stringify({
        ingredient,
        preferences
      });
      
      // Wykonaj zapytanie do API
      const response = await this._makeRequest({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: this.defaultModel,
        temperature: 0.7,
        max_tokens: 2000
      });
      
      // Parsuj odpowiedź jako JSON
      let alternatives;
      try {
        alternatives = JSON.parse(response);
      } catch (e) {
        // Jeśli parsowanie się nie powiedzie, spróbuj wydobyć JSON z tekstu
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                          response.match(/\[([\s\S]*?)\]/);
        
        if (jsonMatch) {
          try {
            alternatives = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch (e2) {
            throw new Error('Nie udało się sparsować odpowiedzi jako JSON');
          }
        } else {
          throw new Error('Odpowiedź nie zawiera poprawnego formatu JSON');
        }
      }
      
      return alternatives;
    } catch (error) {
      logger.error('Błąd podczas sugerowania alternatyw składników:', error);
      throw new OpenRouterError('ALTERNATIVES_SUGGESTION_FAILED', error.message);
    }
  }
  
  /**
   * Sprawdzenie statusu API OpenRouter
   * @returns {Promise<Object>} - Status API
   */
  async checkAPIStatus() {
    // W trybie symulacji zwróć mockowy status
    if (this.simulationMode) {
      return Promise.resolve({
        status: 'ok',
        message: 'Tryb symulacji - nie sprawdzono rzeczywistego statusu API'
      });
    }
    
    try {
      // Wykonaj proste zapytanie do API, aby sprawdzić jego status
      const response = await this.client.get('/');
      
      return {
        status: 'ok',
        message: 'API działa poprawnie',
        apiVersion: response.data.version || 'unknown'
      };
    } catch (error) {
      logger.error('Błąd podczas sprawdzania statusu API:', error);
      return {
        status: 'error',
        message: error.message || 'Nieznany błąd',
        code: error.response?.status || 500
      };
    }
  }
  
  /**
   * Wykonanie zapytania do API OpenRouter
   * @param {Object} data - Dane zapytania
   * @returns {Promise<string>} - Odpowiedź z API
   * @private
   */
  async _makeRequest(data) {
    try {
      const response = await this.client.post('/chat/completions', data);
      
      // Sprawdź czy odpowiedź zawiera oczekiwaną strukturę
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Nieoczekiwana struktura odpowiedzi z API');
      }
      
      // Wyciągnij tekst odpowiedzi
      const content = response.data.choices[0].message.content;
      return content;
    } catch (error) {
      // Obsłuż błędy z API
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        // Mapuj kody błędów HTTP na konkretne typy błędów
        if (status === 401) {
          throw new OpenRouterError('UNAUTHORIZED', 'Nieprawidłowy klucz API');
        } else if (status === 403) {
          throw new OpenRouterError('FORBIDDEN', 'Brak dostępu do API');
        } else if (status === 429) {
          throw new OpenRouterError('RATE_LIMIT', 'Przekroczono limit zapytań');
        } else {
          throw new OpenRouterError(
            'API_ERROR', 
            data.error?.message || 'Błąd podczas komunikacji z API'
          );
        }
      } else if (error.request) {
        // Błąd połączenia
        throw new OpenRouterError('CONNECTION_ERROR', 'Nie można połączyć się z API');
      } else {
        // Inny błąd
        throw error;
      }
    }
  }
}

/**
 * Klasa błędu dla serwisu OpenRouter
 */
class OpenRouterError extends Error {
  /**
   * Konstruktor błędu OpenRouter
   * @param {string} code - Kod błędu
   * @param {string} message - Wiadomość błędu
   */
  constructor(code, message) {
    super(message);
    this.name = 'OpenRouterError';
    this.code = code;
  }
}

module.exports = OpenRouterService; 
const { OpenRouterService } = require('../../src/services/openRouterService');
const { 
  OpenRouterError, 
  ProcessingError,
  NetworkError,
  RateLimitError 
} = require('../../src/errors/OpenRouterError');

// Mock modułu OpenAI
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockImplementation(async (params) => {
              // Symuluj różne odpowiedzi w zależności od zawartości zapytania
              if (params.messages.some(m => m.content.includes('error'))) {
                throw new Error('Simulated API error');
              }
              
              if (params.messages.some(m => m.content.includes('rate_limit'))) {
                const error = new Error('Rate limit exceeded');
                error.response = { status: 429, data: { error: { message: 'Too many requests' } } };
                throw error;
              }
              
              if (params.messages.some(m => m.content.includes('invalid_json'))) {
                return {
                  choices: [{
                    message: {
                      content: '{invalid json'
                    }
                  }]
                };
              }
              
              // Standardowa odpowiedź
              return {
                choices: [{
                  message: {
                    content: params.response_format?.type === 'json_object' ? 
                      JSON.stringify({
                        title: "Zmodyfikowany przepis testowy",
                        ingredients: [
                          { name: "mąka bezglutenowa", quantity: 200, unit: "g" },
                          { name: "mleko kokosowe", quantity: 300, unit: "ml" }
                        ],
                        steps: ["Krok 1", "Krok 2"],
                        nutritionalValues: {
                          totalCalories: 400,
                          totalCarbs: 70,
                          totalProtein: 12,
                          totalFat: 8
                        }
                      }) : 
                      "Testowa odpowiedź tekstowa"
                  }
                }]
              };
            })
          }
        }
      };
    })
  };
});

describe('OpenRouterService', () => {
  let service;
  
  beforeEach(() => {
    // Resetuj mocki przed każdym testem
    jest.clearAllMocks();
    
    // Logger mockowy do testów
    const mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    
    // Inicjalizuj serwis z opcjami testowymi
    service = new OpenRouterService({
      apiKey: 'test-api-key',
      logger: mockLogger
    });
  });
  
  describe('Inicjalizacja', () => {
    test('Powinien poprawnie inicjalizować serwis z domyślnymi opcjami', () => {
      expect(service).toBeDefined();
      expect(service.client).toBeDefined();
      expect(service.apiKey).toBe('test-api-key');
      expect(service.mockMode).toBe(false);
    });
    
    test('Powinien ustawić tryb mock w przypadku błędu inicjalizacji', () => {
      // Zmodyfikuj implementację konstruktora OpenAI, aby rzucił błąd
      require('openai').OpenAI.mockImplementationOnce(() => {
        throw new Error('Initialization error');
      });
      
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      
      // Inicjalizacja powinna użyć mocka zamiast rzucać wyjątek
      const serviceWithMock = new OpenRouterService({
        apiKey: 'invalid-key',
        logger: mockLogger
      });
      
      expect(serviceWithMock).toBeDefined();
      expect(serviceWithMock.mockMode).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
  
  describe('Metoda generateText', () => {
    test('Powinna zwrócić odpowiedź tekstową', async () => {
      const response = await service.generateText({ 
        prompt: 'Testowe zapytanie',
        systemMessage: 'Jesteś pomocnym asystentem'
      });
      
      expect(response).toBe('Testowa odpowiedź tekstowa');
      expect(service.client.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(service.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: 'system', content: 'Jesteś pomocnym asystentem' },
            { role: 'user', content: 'Testowe zapytanie' }
          ]
        })
      );
    });
    
    test('Powinna obsłużyć błąd API', async () => {
      await expect(service.generateText({ 
        prompt: 'Test error',
        systemMessage: 'Jesteś pomocnym asystentem'
      })).rejects.toThrow();
      
      expect(service.client.chat.completions.create).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Metoda generateStructured', () => {
    test('Powinna sparsować odpowiedź JSON', async () => {
      const result = await service.generateStructured({
        prompt: 'Test structured',
        schema: { type: 'object' }
      });
      
      expect(result).toEqual({
        title: "Zmodyfikowany przepis testowy",
        ingredients: [
          { name: "mąka bezglutenowa", quantity: 200, unit: "g" },
          { name: "mleko kokosowe", quantity: 300, unit: "ml" }
        ],
        steps: ["Krok 1", "Krok 2"],
        nutritionalValues: {
          totalCalories: 400,
          totalCarbs: 70,
          totalProtein: 12,
          totalFat: 8
        }
      });
      
      expect(service.client.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(service.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          response_format: expect.objectContaining({
            type: 'json_object'
          })
        })
      );
    });
    
    test('Powinna rzucić ProcessingError przy nieprawidłowym JSON', async () => {
      await expect(service.generateStructured({
        prompt: 'invalid_json test',
        schema: { type: 'object' }
      })).rejects.toThrow(ProcessingError);
    });
  });
  
  describe('Metoda modifyRecipe', () => {
    test('Powinna zmodyfikować przepis zgodnie z preferencjami', async () => {
      const mockRecipe = {
        title: 'Testowy przepis',
        ingredients: [
          { name: 'mąka', quantity: 200, unit: 'g' },
          { name: 'mleko', quantity: 300, unit: 'ml' }
        ],
        steps: ['Wymieszaj', 'Upiecz']
      };
      
      const mockPreferences = {
        dietType: 'bezglutenowa',
        excludedProducts: ['mleko']
      };
      
      const result = await service.modifyRecipe(mockRecipe, mockPreferences);
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        ingredients: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            quantity: expect.any(Number),
            unit: expect.any(String)
          })
        ]),
        steps: expect.any(Array)
      }));
      
      expect(service.client.chat.completions.create).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Metoda checkStatus', () => {
    test('Powinna zwrócić status connected dla działającego API', async () => {
      const status = await service.checkStatus();
      
      expect(status).toEqual(expect.objectContaining({
        status: 'connected',
        response: expect.any(String),
        timestamp: expect.any(String)
      }));
    });
    
    test('Powinna zwrócić status error dla błędu API', async () => {
      // Zmodyfikuj mock, aby rzucał błąd
      service.generateText = jest.fn().mockRejectedValueOnce(new Error('API Down'));
      
      const status = await service.checkStatus();
      
      expect(status).toEqual(expect.objectContaining({
        status: 'error',
        error: expect.any(String),
        timestamp: expect.any(String)
      }));
    });
  });
  
  describe('Obsługa ponowień', () => {
    test('Powinna ponowić zapytanie po błędzie rate limit', async () => {
      // Mockuj ponowienia, aby nie czekać w testach
      service._calculateBackoff = jest.fn().mockReturnValue(0);
      
      // Pierwszy wywołanie zwraca błąd rate limit, drugie sukces
      service.client.chat.completions.create
        .mockRejectedValueOnce({ 
          response: { status: 429, data: { error: { message: 'Rate limit exceeded' } } }
        })
        .mockResolvedValueOnce({
          choices: [{ 
            message: { 
              content: 'Success after retry' 
            }
          }]
        });
      
      const result = await service.generateText({
        prompt: 'Test retry',
        systemMessage: 'System message'
      });
      
      expect(result).toBe('Success after retry');
      expect(service.client.chat.completions.create).toHaveBeenCalledTimes(2);
    });
  });
}); 
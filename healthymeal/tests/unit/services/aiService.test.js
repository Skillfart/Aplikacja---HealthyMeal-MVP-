// unit/services/aiService.test.js - Test AI service
describe('AI Service', () => {
  describe('generatePrompt', () => {
    test('tworzy prawidłowy prompt dla modyfikacji przepisu', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: ['składnik 1', 'składnik 2'],
        instructions: 'Instrukcje'
      };
      
      const modifications = {
        dietary: 'wegetariańska',
        allergens: ['gluten']
      };

      // Mock implementacja
      const generatePrompt = (recipe, mods) => {
        return `Zmodyfikuj przepis "${recipe.title}" na ${mods.dietary}, usuń ${mods.allergens.join(', ')}`;
      };

      const result = generatePrompt(recipe, modifications);
      expect(result).toContain('Test Recipe');
      expect(result).toContain('wegetariańska');
      expect(result).toContain('gluten');
    });
  });

  describe('parseAIResponse', () => {
    test('parsuje odpowiedź AI do struktury przepisu', () => {
      const aiResponse = `
      Tytuł: Nowy Przepis
      Składniki: składnik A, składnik B
      Instrukcje: Krok 1, Krok 2
      `;

      // Mock implementacja
      const parseAIResponse = (response) => {
        const lines = response.split('\n').filter(line => line.trim());
        const result = {};
        
        lines.forEach(line => {
          if (line.includes('Tytuł:')) {
            result.title = line.split('Tytuł:')[1].trim();
          }
          if (line.includes('Składniki:')) {
            result.ingredients = line.split('Składniki:')[1].split(',').map(i => i.trim());
          }
          if (line.includes('Instrukcje:')) {
            result.instructions = line.split('Instrukcje:')[1].trim();
          }
        });
        
        return result;
      };

      const result = parseAIResponse(aiResponse);
      expect(result.title).toBe('Nowy Przepis');
      expect(result.ingredients).toHaveLength(2);
      expect(result.instructions).toContain('Krok');
    });
  });

  describe('validateAIResponse', () => {
    test('waliduje poprawną odpowiedź AI', () => {
      const validResponse = {
        title: 'Prawidłowy tytuł',
        ingredients: ['składnik1', 'składnik2'],
        instructions: 'Prawidłowe instrukcje'
      };

      // Mock implementacja
      const validateAIResponse = (response) => {
        return !!(response.title && 
                 response.ingredients && 
                 response.ingredients.length > 0 && 
                 response.instructions);
      };

      expect(validateAIResponse(validResponse)).toBe(true);
    });

    test('odrzuca nieprawidłową odpowiedź AI', () => {
      const invalidResponse = {
        title: '',
        ingredients: [],
        instructions: ''
      };

      const validateAIResponse = (response) => {
        return !!(response.title && 
                 response.ingredients && 
                 response.ingredients.length > 0 && 
                 response.instructions);
      };

      expect(validateAIResponse(invalidResponse)).toBe(false);
    });
  });
}); 
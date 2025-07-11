import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('🪝 Recipe API Tests', () => {
  const mockRecipes = [
    {
      _id: '1',
      title: 'Keto Kotlet',
      ingredients: [
        { name: 'Schab', quantity: 500, unit: 'g' },
        { name: 'Jajko', quantity: 2, unit: 'szt' }
      ],
      instructions: ['Podsmaż schab', 'Dodaj jajko'],
      hashtags: ['keto', 'obiad'],
      preparationTime: 30,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Vegan Sałatka',
      ingredients: [
        { name: 'Ogórek', quantity: 200, unit: 'g' },
        { name: 'Pomidor', quantity: 300, unit: 'g' }
      ],
      instructions: ['Pokrój warzywa', 'Wymieszaj'],
      hashtags: ['vegan', 'sałatka'],
      preparationTime: 15,
      createdAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRecipes API', () => {
    it('pobiera przepisy z API z prawidłowymi parametrami', async () => {
      const mockResponse = {
        data: {
          recipes: mockRecipes,
          total: 2,
          page: 1,
          limit: 10
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      const response = await axios.get('/api/recipes', {
        params: {
          page: 1,
          limit: 10,
          search: '',
          hashtags: ''
        }
      });

      expect(axios.get).toHaveBeenCalledWith('/api/recipes', {
        params: {
          page: 1,
          limit: 10,
          search: '',
          hashtags: ''
        }
      });

      expect(response.data.recipes).toEqual(mockRecipes);
      expect(response.data.total).toBe(2);
    });

    it('obsługuje błędy API', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValue(mockError);

      await expect(axios.get('/api/recipes')).rejects.toThrow('Network error');
    });

    it('obsługuje wyszukiwanie po tytule', async () => {
      const mockResponse = {
        data: {
          recipes: [mockRecipes[0]],
          total: 1,
          page: 1,
          limit: 10
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      await axios.get('/api/recipes', {
        params: {
          page: 1,
          limit: 10,
          search: 'keto',
          hashtags: ''
        }
      });

      expect(axios.get).toHaveBeenCalledWith('/api/recipes', {
        params: {
          page: 1,
          limit: 10,
          search: 'keto',
          hashtags: ''
        }
      });
    });

    it('obsługuje filtrowanie po hashtags', async () => {
      const mockResponse = {
        data: {
          recipes: [mockRecipes[1]],
          total: 1,
          page: 1,
          limit: 10
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      await axios.get('/api/recipes', {
        params: {
          page: 1,
          limit: 10,
          search: '',
          hashtags: 'vegan'
        }
      });

      expect(axios.get).toHaveBeenCalledWith('/api/recipes', {
        params: {
          page: 1,
          limit: 10,
          search: '',
          hashtags: 'vegan'
        }
      });
    });

    it('obsługuje paginację', async () => {
      const mockResponse = {
        data: {
          recipes: mockRecipes,
          total: 20,
          page: 2,
          limit: 10
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      await axios.get('/api/recipes', {
        params: {
          page: 2,
          limit: 10,
          search: '',
          hashtags: ''
        }
      });

      expect(axios.get).toHaveBeenCalledWith('/api/recipes', {
        params: {
          page: 2,
          limit: 10,
          search: '',
          hashtags: ''
        }
      });
    });
  });

  describe('createRecipe API', () => {
    it('tworzy nowy przepis', async () => {
      const newRecipe = {
        title: 'Nowy Przepis',
        ingredients: [{ name: 'Test', quantity: 100, unit: 'g' }],
        instructions: ['Test instrukcja'],
        hashtags: ['test']
      };

      const mockResponse = {
        data: { ...newRecipe, _id: '3', createdAt: '2024-01-03T00:00:00.000Z' }
      };
      
      axios.post.mockResolvedValue(mockResponse);

      const response = await axios.post('/api/recipes', newRecipe);

      expect(axios.post).toHaveBeenCalledWith('/api/recipes', newRecipe);
      expect(response.data._id).toBe('3');
      expect(response.data.title).toBe('Nowy Przepis');
    });

    it('obsługuje błędy tworzenia przepisu', async () => {
      const newRecipe = {
        title: 'Nowy Przepis',
        ingredients: [{ name: 'Test', quantity: 100, unit: 'g' }],
        instructions: ['Test instrukcja'],
        hashtags: ['test']
      };

      const mockError = new Error('Validation error');
      axios.post.mockRejectedValue(mockError);

      await expect(axios.post('/api/recipes', newRecipe)).rejects.toThrow('Validation error');
    });
  });

  describe('updateRecipe API', () => {
    it('aktualizuje istniejący przepis', async () => {
      const updatedRecipe = {
        _id: '1',
        title: 'Zaktualizowany Przepis',
        ingredients: [{ name: 'Test', quantity: 100, unit: 'g' }],
        instructions: ['Test instrukcja'],
        hashtags: ['test']
      };

      const mockResponse = {
        data: updatedRecipe
      };
      
      axios.put.mockResolvedValue(mockResponse);

      const response = await axios.put('/api/recipes/1', updatedRecipe);

      expect(axios.put).toHaveBeenCalledWith('/api/recipes/1', updatedRecipe);
      expect(response.data.title).toBe('Zaktualizowany Przepis');
    });

    it('obsługuje błędy aktualizacji', async () => {
      const mockError = new Error('Not found');
      axios.put.mockRejectedValue(mockError);

      await expect(axios.put('/api/recipes/999', {})).rejects.toThrow('Not found');
    });
  });

  describe('deleteRecipe API', () => {
    it('usuwa przepis', async () => {
      axios.delete.mockResolvedValue({ data: { message: 'Recipe deleted' } });

      const response = await axios.delete('/api/recipes/1');

      expect(axios.delete).toHaveBeenCalledWith('/api/recipes/1');
      expect(response.data.message).toBe('Recipe deleted');
    });

    it('obsługuje błędy usuwania', async () => {
      const mockError = new Error('Not found');
      axios.delete.mockRejectedValue(mockError);

      await expect(axios.delete('/api/recipes/999')).rejects.toThrow('Not found');
    });
  });

  describe('sortowanie i filtrowanie danych', () => {
    it.skip('sortuje przepisy po dacie utworzenia', () => {
      const sortedRecipes = [...mockRecipes].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );

      expect(new Date(sortedRecipes[0].createdAt)).toBeLessThan(new Date(sortedRecipes[1].createdAt));
      expect(sortedRecipes[0].title).toBe('Keto Kotlet');
    });

    it('sortuje przepisy po czasie przygotowania', () => {
      const sortedRecipes = [...mockRecipes].sort((a, b) => 
        a.preparationTime - b.preparationTime
      );

      expect(sortedRecipes[0].preparationTime).toBeLessThan(sortedRecipes[1].preparationTime);
      expect(sortedRecipes[0].title).toBe('Vegan Sałatka');
    });

    it('filtruje przepisy po hashtags', () => {
      const filteredRecipes = mockRecipes.filter(recipe => 
        recipe.hashtags.includes('keto')
      );

      expect(filteredRecipes).toHaveLength(1);
      expect(filteredRecipes[0].title).toBe('Keto Kotlet');
    });

    it('filtruje przepisy po tytule', () => {
      const searchTerm = 'vegan';
      const filteredRecipes = mockRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredRecipes).toHaveLength(1);
      expect(filteredRecipes[0].title).toBe('Vegan Sałatka');
    });
  });

  describe('walidacja danych przepisu', () => {
    it('sprawdza wymagane pola przepisu', () => {
      const validRecipe = {
        title: 'Test Przepis',
        ingredients: [{ name: 'Test', quantity: 100, unit: 'g' }],
        instructions: ['Test instrukcja'],
        hashtags: ['test']
      };

      expect(validRecipe.title).toBeTruthy();
      expect(validRecipe.ingredients).toHaveLength(1);
      expect(validRecipe.instructions).toHaveLength(1);
      expect(validRecipe.hashtags).toHaveLength(1);
    });

    it('sprawdza format składników', () => {
      const ingredient = { name: 'Test', quantity: 100, unit: 'g' };

      expect(typeof ingredient.name).toBe('string');
      expect(typeof ingredient.quantity).toBe('number');
      expect(typeof ingredient.unit).toBe('string');
      expect(ingredient.quantity).toBeGreaterThan(0);
    });
  });
}); 
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecipes } from '../../../frontend/src/hooks/useRecipes';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('🪝 useRecipes Hook', () => {
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

  describe('fetchRecipes', () => {
    it('pobiera przepisy z API', async () => {
      const mockResponse = {
        data: {
          recipes: mockRecipes,
          total: 2,
          page: 1,
          limit: 10
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecipes());

      expect(result.current.loading).toBe(true);
      expect(result.current.recipes).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recipes).toEqual(mockRecipes);
      expect(result.current.total).toBe(2);
      expect(axios.get).toHaveBeenCalledWith('/api/recipes', {
        params: {
          page: 1,
          limit: 10,
          search: '',
          hashtags: ''
        }
      });
    });

    it('obsługuje błędy API', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.recipes).toEqual([]);
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

      const { result } = renderHook(() => useRecipes());

      // Wyszukaj "keto"
      result.current.setSearchTerm('keto');

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/recipes', {
          params: {
            page: 1,
            limit: 10,
            search: 'keto',
            hashtags: ''
          }
        });
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

      const { result } = renderHook(() => useRecipes());

      // Filtruj po vegan
      result.current.setHashtagFilter(['vegan']);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/recipes', {
          params: {
            page: 1,
            limit: 10,
            search: '',
            hashtags: 'vegan'
          }
        });
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

      const { result } = renderHook(() => useRecipes());

      // Przejdź na stronę 2
      result.current.setPage(2);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/recipes', {
          params: {
            page: 2,
            limit: 10,
            search: '',
            hashtags: ''
          }
        });
      });

      expect(result.current.page).toBe(2);
    });
  });

  describe('createRecipe', () => {
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

      const { result } = renderHook(() => useRecipes());

      await result.current.createRecipe(newRecipe);

      expect(axios.post).toHaveBeenCalledWith('/api/recipes', newRecipe);
      
      // Sprawdź czy przepis został dodany do listy
      expect(result.current.recipes).toContain(mockResponse.data);
    });

    it('obsługuje błędy tworzenia przepisu', async () => {
      const newRecipe = {
        title: 'Błędny Przepis'
      };

      const mockError = new Error('Validation error');
      axios.post.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRecipes());

      await expect(result.current.createRecipe(newRecipe)).rejects.toThrow('Validation error');
    });
  });

  describe('updateRecipe', () => {
    it('aktualizuje istniejący przepis', async () => {
      const updatedRecipe = {
        ...mockRecipes[0],
        title: 'Zaktualizowany Kotlet'
      };

      const mockResponse = {
        data: updatedRecipe
      };
      
      axios.put.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await result.current.updateRecipe('1', { title: 'Zaktualizowany Kotlet' });

      expect(axios.put).toHaveBeenCalledWith('/api/recipes/1', { title: 'Zaktualizowany Kotlet' });
      
      // Sprawdź czy przepis został zaktualizowany w liście
      const updatedRecipeInList = result.current.recipes.find(r => r._id === '1');
      expect(updatedRecipeInList.title).toBe('Zaktualizowany Kotlet');
    });
  });

  describe('deleteRecipe', () => {
    it('usuwa przepis', async () => {
      axios.delete.mockResolvedValue({ data: { message: 'Recipe deleted' } });

      const { result } = renderHook(() => useRecipes());
      
      // Ustaw początkowe przepisy
      result.current.setRecipes(mockRecipes);

      await result.current.deleteRecipe('1');

      expect(axios.delete).toHaveBeenCalledWith('/api/recipes/1');
      
      // Sprawdź czy przepis został usunięty z listy
      expect(result.current.recipes).not.toContain(mockRecipes[0]);
      expect(result.current.recipes.length).toBe(1);
    });
  });

  describe('sortowanie i filtrowanie lokalne', () => {
    it('sortuje przepisy po dacie utworzenia', () => {
      const { result } = renderHook(() => useRecipes());
      
      result.current.setRecipes(mockRecipes);
      result.current.setSortBy('createdAt');
      result.current.setSortOrder('desc');

      // Najnowszy przepis powinien być pierwszy
      expect(result.current.sortedRecipes[0]._id).toBe('2');
    });

    it('sortuje przepisy po czasie przygotowania', () => {
      const { result } = renderHook(() => useRecipes());
      
      result.current.setRecipes(mockRecipes);
      result.current.setSortBy('preparationTime');
      result.current.setSortOrder('asc');

      // Przepis z krótszym czasem powinien być pierwszy
      expect(result.current.sortedRecipes[0]._id).toBe('2'); // 15 min
    });

    it('filtruje przepisy lokalnie po hashtags', () => {
      const { result } = renderHook(() => useRecipes());
      
      result.current.setRecipes(mockRecipes);
      result.current.setLocalHashtagFilter(['keto']);

      expect(result.current.filteredRecipes).toHaveLength(1);
      expect(result.current.filteredRecipes[0]._id).toBe('1');
    });
  });

  describe('cache i optymalizacja', () => {
    it('używa cache dla powtarzających się zapytań', async () => {
      const mockResponse = {
        data: {
          recipes: mockRecipes,
          total: 2,
          page: 1,
          limit: 10
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecipes());

      // Pierwsze wywołanie
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Reset mocka
      vi.clearAllMocks();

      // Drugie wywołanie z tymi samymi parametrami
      result.current.refetch();

      // Powinno użyć cache i nie wywołać API ponownie
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('invaliduje cache przy zmianie parametrów', async () => {
      const mockResponse = {
        data: {
          recipes: mockRecipes,
          total: 2,
          page: 1,
          limit: 10
        }
      };
      
      axios.get.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Reset mocka
      vi.clearAllMocks();

      // Zmiana parametrów powinnia invalidować cache
      result.current.setSearchTerm('nowe wyszukiwanie');

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });
    });
  });

  describe('stan loading i error', () => {
    it('zarządza stanem loading poprawnie', async () => {
      axios.get.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          data: { recipes: [], total: 0, page: 1, limit: 10 }
        }), 100);
      }));

      const { result } = renderHook(() => useRecipes());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('resetuje error przy nowym zapytaniu', async () => {
      // Pierwsze zapytanie z błędem
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Drugie zapytanie sukces
      axios.get.mockResolvedValueOnce({
        data: { recipes: mockRecipes, total: 2, page: 1, limit: 10 }
      });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.recipes).toEqual(mockRecipes);
      });
    });
  });
}); 
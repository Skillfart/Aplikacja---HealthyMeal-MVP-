import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRecipe } from '../../../frontend/src/contexts/RecipeContext';
import { renderHook, act } from '@testing-library/react';

describe('RecipeContext - operacje CRUD', () => {
  const mockRecipe = {
    id: '123',
    title: 'Test Recipe',
    ingredients: [
      { name: 'Składnik 1', quantity: 100, unit: 'g' },
      { name: 'Składnik 2', quantity: 200, unit: 'ml' }
    ],
    steps: ['Krok 1', 'Krok 2'],
    preparationTime: 30,
    difficulty: 'łatwy',
    servings: 4
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  it('powinien pobrać listę przepisów', async () => {
    const mockRecipes = [mockRecipe];
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipes)
    });

    const { result } = renderHook(() => useRecipe());

    await act(async () => {
      await result.current.fetchRecipes();
    });

    expect(result.current.recipes).toEqual(mockRecipes);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/recipes'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );
  });

  it('powinien dodać nowy przepis', async () => {
    const newRecipe = { ...mockRecipe };
    delete newRecipe.id;

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...newRecipe, id: '123' })
    });

    const { result } = renderHook(() => useRecipe());

    await act(async () => {
      await result.current.createRecipe(newRecipe);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/recipes'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newRecipe)
      })
    );
  });

  it('powinien zaktualizować istniejący przepis', async () => {
    const updatedRecipe = {
      ...mockRecipe,
      title: 'Updated Recipe'
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updatedRecipe)
    });

    const { result } = renderHook(() => useRecipe());

    await act(async () => {
      await result.current.updateRecipe('123', updatedRecipe);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/recipes/123'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedRecipe)
      })
    );
  });

  it('powinien usunąć przepis', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Recipe deleted' })
    });

    const { result } = renderHook(() => useRecipe());

    await act(async () => {
      await result.current.deleteRecipe('123');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/recipes/123'),
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  it('powinien obsłużyć błędy podczas operacji CRUD', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Database error'
      })
    });

    const { result } = renderHook(() => useRecipe());

    let error;
    await act(async () => {
      try {
        await result.current.createRecipe(mockRecipe);
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeDefined();
  });
}); 
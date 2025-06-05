import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAI } from '../../../frontend/src/contexts/AIContext';
import { renderHook, act } from '@testing-library/react';

describe('AIContext - modyfikacja przepisów', () => {
  const mockRecipe = {
    id: '123',
    title: 'Test Recipe',
    ingredients: [
      { name: 'Mąka pszenna', quantity: 200, unit: 'g' },
      { name: 'Mleko', quantity: 250, unit: 'ml' }
    ],
    steps: ['Wymieszaj składniki', 'Upiecz'],
    nutritionalValues: {
      calories: 350,
      carbs: 60,
      protein: 8,
      fat: 4
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  it('powinien zmodyfikować przepis na wersję niskowęglowodanową', async () => {
    const mockResponse = {
      ...mockRecipe,
      ingredients: [
        { name: 'Mąka migdałowa', quantity: 200, unit: 'g' },
        { name: 'Mleko migdałowe', quantity: 250, unit: 'ml' }
      ],
      nutritionalValues: {
        calories: 280,
        carbs: 8,
        protein: 12,
        fat: 22
      }
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        recipe: mockResponse,
        aiUsage: { remaining: 4, limit: 5 }
      })
    });

    const { result } = renderHook(() => useAI());

    await act(async () => {
      const response = await result.current.modifyRecipe('123', ['makeLowCarb']);
      expect(response.recipe.nutritionalValues.carbs).toBeLessThan(mockRecipe.nutritionalValues.carbs);
    });
  });

  it('powinien zmodyfikować przepis na wersję wegańską', async () => {
    const mockResponse = {
      ...mockRecipe,
      ingredients: [
        { name: 'Mąka pszenna', quantity: 200, unit: 'g' },
        { name: 'Mleko sojowe', quantity: 250, unit: 'ml' }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        recipe: mockResponse,
        aiUsage: { remaining: 3, limit: 5 }
      })
    });

    const { result } = renderHook(() => useAI());

    await act(async () => {
      const response = await result.current.modifyRecipe('123', ['makeVegan']);
      expect(response.recipe.ingredients.some(i => i.name === 'Mleko sojowe')).toBeTruthy();
    });
  });

  it('powinien obsłużyć przekroczenie limitu AI', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({
        error: 'Przekroczono dzienny limit modyfikacji AI',
        aiUsage: { remaining: 0, limit: 5 }
      })
    });

    const { result } = renderHook(() => useAI());

    let error;
    await act(async () => {
      try {
        await result.current.modifyRecipe('123', ['makeLowCarb']);
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeDefined();
    expect(error.message).toContain('limit');
  });

  it('powinien zachować historię modyfikacji', async () => {
    const mockResponse = {
      ...mockRecipe,
      modificationHistory: [
        {
          date: new Date().toISOString(),
          type: 'makeLowCarb',
          changes: ['Zamieniono mąkę pszenną na migdałową']
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        recipe: mockResponse,
        aiUsage: { remaining: 2, limit: 5 }
      })
    });

    const { result } = renderHook(() => useAI());

    await act(async () => {
      const response = await result.current.modifyRecipe('123', ['makeLowCarb']);
      expect(response.recipe.modificationHistory).toBeDefined();
      expect(response.recipe.modificationHistory.length).toBeGreaterThan(0);
    });
  });

  it('powinien aktualizować licznik pozostałych modyfikacji', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        recipe: mockRecipe,
        aiUsage: { remaining: 4, limit: 5 }
      })
    });

    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.modifyRecipe('123', ['makeLowCarb']);
    });

    expect(result.current.aiUsage.remaining).toBe(4);
    expect(result.current.aiUsage.limit).toBe(5);
  });
}); 
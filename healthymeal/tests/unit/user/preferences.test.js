import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfile } from '../../../frontend/src/contexts/ProfileContext';
import { renderHook, act } from '@testing-library/react';

describe('ProfileContext - preferencje użytkownika', () => {
  const mockPreferences = {
    dietType: 'wegetariańska',
    allergies: ['orzechy', 'gluten'],
    excludedIngredients: ['cebula', 'czosnek'],
    caloriesPerDay: 2000,
    mealsPerDay: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  it('powinien pobrać preferencje użytkownika', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences })
    });

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.fetchPreferences();
    });

    expect(result.current.preferences).toEqual(mockPreferences);
  });

  it('powinien zaktualizować preferencje dietetyczne', async () => {
    const updatedPreferences = {
      ...mockPreferences,
      dietType: 'wegańska'
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ preferences: updatedPreferences })
    });

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.updatePreferences(updatedPreferences);
    });

    expect(result.current.preferences.dietType).toBe('wegańska');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/preferences'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedPreferences)
      })
    );
  });

  it('powinien dodać nowy alergen', async () => {
    const updatedPreferences = {
      ...mockPreferences,
      allergies: [...mockPreferences.allergies, 'soja']
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ preferences: updatedPreferences })
    });

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.addAllergy('soja');
    });

    expect(result.current.preferences.allergies).toContain('soja');
  });

  it('powinien usunąć wykluczony składnik', async () => {
    const updatedPreferences = {
      ...mockPreferences,
      excludedIngredients: ['czosnek']
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ preferences: updatedPreferences })
    });

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.removeExcludedIngredient('cebula');
    });

    expect(result.current.preferences.excludedIngredients).not.toContain('cebula');
  });

  it('powinien zaktualizować dzienne zapotrzebowanie kaloryczne', async () => {
    const updatedPreferences = {
      ...mockPreferences,
      caloriesPerDay: 1800
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ preferences: updatedPreferences })
    });

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.updateCaloriesPerDay(1800);
    });

    expect(result.current.preferences.caloriesPerDay).toBe(1800);
  });

  it('powinien zwalidować preferencje przed zapisem', async () => {
    const invalidPreferences = {
      ...mockPreferences,
      caloriesPerDay: -100, // nieprawidłowa wartość
      mealsPerDay: 10 // poza zakresem
    };

    const { result } = renderHook(() => useProfile());

    let error;
    await act(async () => {
      try {
        await result.current.updatePreferences(invalidPreferences);
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeDefined();
    expect(error.message).toContain('nieprawidłowe');
  });

  it('powinien obsłużyć błędy serwera', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        error: 'Internal server error'
      })
    });

    const { result } = renderHook(() => useProfile());

    let error;
    await act(async () => {
      try {
        await result.current.fetchPreferences();
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeDefined();
  });

  it('powinien zsynchronizować preferencje z AI', async () => {
    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.fetchPreferences();
    });

    expect(result.current.preferences.dietType).toBeDefined();
    expect(result.current.preferences.allergies).toBeDefined();
    expect(result.current.aiPreferences).toEqual({
      dietType: result.current.preferences.dietType,
      allergies: result.current.preferences.allergies,
      excludedIngredients: result.current.preferences.excludedIngredients
    });
  });
}); 
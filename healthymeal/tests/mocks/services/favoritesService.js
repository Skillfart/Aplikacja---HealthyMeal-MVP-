// Mock dla usługi ulubionych przepisów
import { vi } from 'vitest';

const mockFavorites = [
  { 
    id: 'recipe-1',
    title: 'Ulubiony przepis 1',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 30 
  },
  { 
    id: 'recipe-2',
    title: 'Ulubiony przepis 2',
    difficulty: 'medium',
    prepTime: 20,
    cookTime: 40
  }
];

export const getFavorites = vi.fn().mockResolvedValue({
  data: mockFavorites,
  error: null
});

export const addToFavorites = vi.fn().mockResolvedValue({
  data: { success: true },
  error: null
});

export const removeFromFavorites = vi.fn().mockResolvedValue({
  data: { success: true },
  error: null
});

export const isFavorite = vi.fn().mockResolvedValue({
  data: true,
  error: null
});

export default {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite
}; 
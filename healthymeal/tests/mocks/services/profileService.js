// Mock dla usługi profilu użytkownika
import { vi } from 'vitest';

const mockProfile = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  preferences: {
    dietaryRestrictions: ['vegetarian'],
    allergies: ['nuts'],
    favoritesCuisines: ['italian', 'asian']
  },
  stats: {
    recipesCreated: 5,
    favoriteRecipes: 10,
    mealPlansCreated: 2
  }
};

export const getUserProfile = vi.fn().mockResolvedValue({
  data: mockProfile,
  error: null
});

export const updateUserProfile = vi.fn().mockResolvedValue({
  data: mockProfile,
  error: null
});

export const getUserPreferences = vi.fn().mockResolvedValue({
  data: mockProfile.preferences,
  error: null
});

export const updateUserPreferences = vi.fn().mockResolvedValue({
  data: mockProfile.preferences,
  error: null
});

export default {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences
}; 
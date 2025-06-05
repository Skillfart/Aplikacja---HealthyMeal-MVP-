import { vi } from 'vitest';

// Mock dla API przepisów
export const mockRecipes = [
  {
    id: '1',
    title: 'Test Recipe 1',
    description: 'Test Description 1',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: ['step1', 'step2'],
    tags: ['tag1', 'tag2'],
    difficulty: 'easy',
    prepTime: 30,
    cookTime: 20,
    servings: 4,
    carbs: 20,
    protein: 15,
    fat: 10,
    calories: 300
  },
  {
    id: '2',
    title: 'Test Recipe 2',
    description: 'Test Description 2',
    ingredients: ['ingredient3', 'ingredient4'],
    instructions: ['step3', 'step4'],
    tags: ['tag3', 'tag4'],
    difficulty: 'medium',
    prepTime: 45,
    cookTime: 30,
    servings: 6,
    carbs: 25,
    protein: 20,
    fat: 15,
    calories: 400
  }
];

// Mock dla API ulubionych przepisów
export const mockFavorites = [
  {
    id: '1',
    userId: 'test-user',
    recipeId: '1',
    recipe: mockRecipes[0]
  }
];

// Mock dla API użytkownika
export const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  name: 'Test User',
  preferences: {
    excludedIngredients: ['ingredient1'],
    dietaryRestrictions: ['vegetarian'],
    allergies: ['nuts']
  }
};

// Mock dla API autentykacji
export const mockAuth = {
  user: mockUser,
  session: {
    access_token: 'test-token',
    refresh_token: 'test-refresh-token'
  }
};

// Mock dla API AI
export const mockAI = {
  modifyRecipe: vi.fn().mockResolvedValue({
    ...mockRecipes[0],
    title: 'Modified Recipe',
    description: 'Modified Description'
  }),
  suggestAlternatives: vi.fn().mockResolvedValue([
    'alternative1',
    'alternative2'
  ])
};

// Mock dla API filtrowania
export const mockFilters = {
  tags: ['tag1'],
  difficulty: 'easy',
  maxPrepTime: 60,
  maxCarbs: 30
};

// Mock dla API wyszukiwania
export const mockSearch = {
  query: 'test',
  results: mockRecipes
};

// Mock dla API profilu
export const mockProfile = {
  ...mockUser,
  favoriteRecipes: mockFavorites,
  recentRecipes: mockRecipes
}; 
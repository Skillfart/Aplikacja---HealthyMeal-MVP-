import { vi } from 'vitest';

// Mock dla AuthContext
export const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  loading: false,
  error: null,
  isAuthenticated: vi.fn().mockReturnValue(true),
  login: vi.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
  logout: vi.fn().mockResolvedValue(true),
  register: vi.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
  resetPassword: vi.fn().mockResolvedValue(true),
  updateProfile: vi.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
  clearError: vi.fn()
};

// Mock dla RecipeContext
export const mockRecipeContext = {
  recipes: [
    {
      id: 'test-recipe-id-1',
      title: 'Test Recipe 1',
      description: 'Test description 1',
      ingredients: ['1 cup flour', '2 eggs', '1 cup sugar'],
      steps: ['Mix ingredients', 'Bake for 30 minutes'],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: 'easy',
      tags: ['vegetarian', 'dessert'],
      nutritionalValues: {
        calories: 350,
        protein: 5,
        fat: 12,
        carbs: 58
      },
      user_id: 'test-user-id',
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-02T12:00:00Z'
    },
    {
      id: 'test-recipe-id-2',
      title: 'Test Recipe 2',
      description: 'Test description 2',
      ingredients: ['500g chicken', '1 onion', '2 tbsp olive oil'],
      steps: ['Cook chicken', 'Add vegetables', 'Season'],
      prepTime: 10,
      cookTime: 25,
      servings: 2,
      difficulty: 'medium',
      tags: ['meat', 'dinner'],
      nutritionalValues: {
        calories: 420,
        protein: 35,
        fat: 18,
        carbs: 22
      },
      user_id: 'test-user-id',
      created_at: '2023-01-03T12:00:00Z',
      updated_at: '2023-01-04T12:00:00Z'
    }
  ],
  loading: false,
  error: null,
  getRecipes: vi.fn().mockResolvedValue([]),
  getRecipeById: vi.fn().mockImplementation((id) => {
    const recipe = mockRecipeContext.recipes.find(r => r.id === id);
    return Promise.resolve(recipe);
  }),
  createRecipe: vi.fn().mockImplementation((recipe) => {
    const newRecipe = {
      ...recipe,
      id: 'new-test-recipe-id',
      user_id: 'test-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return Promise.resolve(newRecipe);
  }),
  updateRecipe: vi.fn().mockImplementation((id, recipe) => {
    return Promise.resolve({
      ...recipe,
      id,
      updated_at: new Date().toISOString()
    });
  }),
  deleteRecipe: vi.fn().mockResolvedValue(true),
  clearError: vi.fn(),
  searchRecipes: vi.fn().mockImplementation((searchTerm) => {
    if (!searchTerm) return mockRecipeContext.recipes;
    return mockRecipeContext.recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }),
  filterRecipes: vi.fn().mockImplementation((filters) => {
    if (!filters || Object.keys(filters).length === 0) return mockRecipeContext.recipes;
    
    return mockRecipeContext.recipes.filter(recipe => {
      let match = true;
      
      if (filters.tags && filters.tags.length > 0) {
        match = match && filters.tags.some(tag => recipe.tags.includes(tag));
      }
      
      if (filters.difficulty) {
        match = match && recipe.difficulty === filters.difficulty;
      }
      
      if (filters.maxPrepTime) {
        match = match && recipe.prepTime <= filters.maxPrepTime;
      }
      
      if (filters.maxCookTime) {
        match = match && recipe.cookTime <= filters.maxCookTime;
      }
      
      return match;
    });
  })
};

// Mock dla FavoritesContext
export const mockFavoritesContext = {
  favorites: [
    {
      id: 'test-favorite-id-1',
      recipe_id: 'test-recipe-id-1',
      user_id: 'test-user-id',
      created_at: '2023-01-01T12:00:00Z'
    }
  ],
  loading: false,
  error: null,
  getFavorites: vi.fn().mockResolvedValue([]),
  addFavorite: vi.fn().mockImplementation((recipeId) => {
    const newFavorite = {
      id: `test-favorite-id-${recipeId}`,
      recipe_id: recipeId,
      user_id: 'test-user-id',
      created_at: new Date().toISOString()
    };
    return Promise.resolve(newFavorite);
  }),
  removeFavorite: vi.fn().mockResolvedValue(true),
  isFavorite: vi.fn().mockImplementation((recipeId) => {
    return mockFavoritesContext.favorites.some(fav => fav.recipe_id === recipeId);
  }),
  clearError: vi.fn()
};

// Mock dla ProfileContext
export const mockProfileContext = {
  profile: {
    id: 'test-profile-id',
    user_id: 'test-user-id',
    name: 'Test User',
    diet_type: 'vegetarian',
    max_carbs: 150,
    excluded_products: ['meat'],
    allergens: ['peanuts'],
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z'
  },
  loading: false,
  error: null,
  getProfile: vi.fn().mockResolvedValue({}),
  updateProfile: vi.fn().mockImplementation((profile) => {
    return Promise.resolve({
      ...mockProfileContext.profile,
      ...profile,
      updated_at: new Date().toISOString()
    });
  }),
  clearError: vi.fn()
};

// Mock dla AIContext
export const mockAIContext = {
  usage: {
    count: 3,
    limit: 10,
    remaining: 7,
    last_used: '2023-01-01T12:00:00Z'
  },
  loading: false,
  error: null,
  generatingRecipe: false,
  modifyingRecipe: false,
  getAIUsage: vi.fn().mockResolvedValue({}),
  generateRecipe: vi.fn().mockImplementation((preferences) => {
    return Promise.resolve({
      title: 'AI Generated Recipe',
      description: 'This is an AI generated recipe based on your preferences',
      ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
      steps: ['Step 1', 'Step 2', 'Step 3'],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: 'medium',
      tags: preferences.diet_type ? [preferences.diet_type] : ['balanced'],
      nutritionalValues: {
        calories: 350,
        protein: 20,
        fat: 15,
        carbs: 40
      }
    });
  }),
  modifyRecipe: vi.fn().mockImplementation((recipe, preferences) => {
    return Promise.resolve({
      ...recipe,
      title: `Modified ${recipe.title}`,
      description: `Modified version of the recipe: ${recipe.description}`,
      tags: [...(recipe.tags || []), ...(preferences.diet_type ? [preferences.diet_type] : [])]
    });
  }),
  clearError: vi.fn()
}; 
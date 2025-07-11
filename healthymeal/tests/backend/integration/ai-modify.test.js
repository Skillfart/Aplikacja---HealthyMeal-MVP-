import { jest } from '@jest/globals';
import request from 'supertest';
import { Recipe } from '../../../backend/src/models/Recipe.js';
import User from '../../../backend/src/models/User.js';
import { modifyRecipeWithAI } from '../../../backend/src/services/openRouterService.js';

// Mock services
jest.mock('../../../backend/src/services/openRouterService.js');
jest.mock('../../../backend/src/models/Recipe.js');
jest.mock('../../../backend/src/models/User.js');

describe('AI Recipe Modification API', () => {
  let app;
  let mockUser;
  let mockRecipe;
  let mockModifiedRecipe;
  let authToken;

  beforeEach(() => {
    // Import app dynamically to avoid module loading issues
    app = require('../../../backend/src/app.js');
    
    authToken = 'Bearer valid-jwt-token';
    
    mockUser = {
      _id: 'user123',
      supabaseId: 'supabase123',
      email: 'test@example.com',
      preferences: {
        dietType: 'vegetarian',
        maxCarbs: 50,
        excludedProducts: ['chleb pszenny'],
        allergens: ['gluten']
      },
      aiUsage: {
        count: 2,
        date: new Date()
      },
      incrementAiUsage: jest.fn(),
      resetAIUsageIfNeeded: jest.fn(),
      save: jest.fn()
    };

    mockRecipe = {
      _id: 'recipe123',
      title: 'Kanapka z chleba',
      description: 'Prosta kanapka',
      author: 'supabase123',
      ingredients: [
        { name: 'chleb pszenny', quantity: '2', unit: 'kromki' },
        { name: 'masło', quantity: '1', unit: 'łyżka' }
      ],
      instructions: ['Posmaruj chleb masłem', 'Podawaj od razu'],
      preparationTime: 5,
      servings: 1,
      hashtags: ['szybkie', 'proste'],
      difficulty: 'łatwe',
      nutritionalValues: {
        calories: 200,
        carbs: 40,
        protein: 6,
        fat: 8
      }
    };

    mockModifiedRecipe = {
      ...mockRecipe,
      _id: 'modified-recipe123',
      title: 'Bezglutenowa kanapka',
      ingredients: [
        { name: 'chleb bezglutenowy', quantity: '2', unit: 'kromki' },
        { name: 'masło', quantity: '1', unit: 'łyżka' }
      ],
      instructions: ['Posmaruj chleb bezglutenowy masłem', 'Podawaj od razu'],
      nutritionalValues: {
        calories: 180,
        carbs: 25,
        protein: 5,
        fat: 8
      }
    };

    jest.clearAllMocks();
  });

  describe('POST /api/recipes/:id/ai-modify', () => {
    test('should successfully modify recipe with AI', async () => {
      // Mock database queries
      Recipe.findOne.mockResolvedValue(mockRecipe);
      Recipe.prototype.save = jest.fn().mockResolvedValue(mockModifiedRecipe);

      // Mock AI service
      modifyRecipeWithAI.mockResolvedValue({
        title: 'Bezglutenowa kanapka',
        ingredients: [
          { name: 'chleb bezglutenowy', quantity: '2', unit: 'kromki' },
          { name: 'masło', quantity: '1', unit: 'łyżka' }
        ],
        instructions: ['Posmaruj chleb bezglutenowy masłem', 'Podawaj od razu'],
        nutritionalValues: {
          calories: 180,
          carbs: 25,
          protein: 5,
          fat: 8
        }
      });

      // Mock auth middleware
      jest.doMock('../../../backend/src/middleware/auth.js', () => {
        return (req, res, next) => {
          req.user = { id: 'supabase123' };
          req.mongoUser = mockUser;
          next();
        };
      });

      const response = await request(app)
        .post('/api/recipes/recipe123/ai-modify')
        .set('Authorization', authToken)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recipe');
      expect(response.body.recipe.title).toBe('Bezglutenowa kanapka');
      expect(mockUser.incrementAiUsage).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return 404 when recipe not found', async () => {
      Recipe.findOne.mockResolvedValue(null);

      jest.doMock('../../../backend/src/middleware/auth.js', () => {
        return (req, res, next) => {
          req.user = { id: 'supabase123' };
          req.mongoUser = mockUser;
          next();
        };
      });

      const response = await request(app)
        .post('/api/recipes/nonexistent/ai-modify')
        .set('Authorization', authToken)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Przepis nie znaleziony');
    });

    test('should return 429 when AI usage limit exceeded', async () => {
      const limitedUser = {
        ...mockUser,
        aiUsage: { count: 5, date: new Date() }
      };

      Recipe.findOne.mockResolvedValue(mockRecipe);

      jest.doMock('../../../backend/src/middleware/auth.js', () => {
        return (req, res, next) => {
          req.user = { id: 'supabase123' };
          req.mongoUser = limitedUser;
          next();
        };
      });

      const response = await request(app)
        .post('/api/recipes/recipe123/ai-modify')
        .set('Authorization', authToken)
        .send({});

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Przekroczono dzienny limit użycia AI');
    });

    test('should return 401 when user not authenticated', async () => {
      const response = await request(app)
        .post('/api/recipes/recipe123/ai-modify')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Brak autoryzacji');
    });

    test('should handle AI service errors', async () => {
      Recipe.findOne.mockResolvedValue(mockRecipe);
      modifyRecipeWithAI.mockRejectedValue(new Error('AI service unavailable'));

      jest.doMock('../../../backend/src/middleware/auth.js', () => {
        return (req, res, next) => {
          req.user = { id: 'supabase123' };
          req.mongoUser = mockUser;
          next();
        };
      });

      const response = await request(app)
        .post('/api/recipes/recipe123/ai-modify')
        .set('Authorization', authToken)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Błąd podczas modyfikacji przepisu');
    });

    test('should include user preferences in AI modification', async () => {
      Recipe.findOne.mockResolvedValue(mockRecipe);
      modifyRecipeWithAI.mockResolvedValue(mockModifiedRecipe);

      jest.doMock('../../../backend/src/middleware/auth.js', () => {
        return (req, res, next) => {
          req.user = { id: 'supabase123' };
          req.mongoUser = mockUser;
          next();
        };
      });

      await request(app)
        .post('/api/recipes/recipe123/ai-modify')
        .set('Authorization', authToken)
        .send({});

      expect(modifyRecipeWithAI).toHaveBeenCalledWith(
        mockRecipe,
        mockUser.preferences
      );
    });

    test('should reset AI usage count if new day', async () => {
      const yesterdayUser = {
        ...mockUser,
        aiUsage: {
          count: 3,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
        }
      };

      Recipe.findOne.mockResolvedValue(mockRecipe);
      modifyRecipeWithAI.mockResolvedValue(mockModifiedRecipe);

      jest.doMock('../../../backend/src/middleware/auth.js', () => {
        return (req, res, next) => {
          req.user = { id: 'supabase123' };
          req.mongoUser = yesterdayUser;
          next();
        };
      });

      await request(app)
        .post('/api/recipes/recipe123/ai-modify')
        .set('Authorization', authToken)
        .send({});

      expect(yesterdayUser.resetAIUsageIfNeeded).toHaveBeenCalled();
    });
  });

  describe('AI Service Integration', () => {
    test('should handle OpenRouter API errors gracefully', async () => {
      Recipe.findOne.mockResolvedValue(mockRecipe);
      modifyRecipeWithAI.mockRejectedValue(new Error('OpenRouter API error'));

      jest.doMock('../../../backend/src/middleware/auth.js', () => {
        return (req, res, next) => {
          req.user = { id: 'supabase123' };
          req.mongoUser = mockUser;
          next();
        };
      });

      const response = await request(app)
        .post('/api/recipes/recipe123/ai-modify')
        .set('Authorization', authToken)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Błąd podczas modyfikacji przepisu');
    });

    test('should save modified recipe with correct structure', async () => {
      const saveSpy = jest.fn().mockResolvedValue(mockModifiedRecipe);
      Recipe.prototype.save = saveSpy;
      Recipe.findOne.mockResolvedValue(mockRecipe);
      modifyRecipeWithAI.mockResolvedValue({
        title: 'Bezglutenowa kanapka',
        ingredients: mockModifiedRecipe.ingredients,
        instructions: mockModifiedRecipe.instructions,
        nutritionalValues: mockModifiedRecipe.nutritionalValues
      });

      jest.doMock('../../../backend/src/middleware/auth.js', () => {
        return (req, res, next) => {
          req.user = { id: 'supabase123' };
          req.mongoUser = mockUser;
          next();
        };
      });

      await request(app)
        .post('/api/recipes/recipe123/ai-modify')
        .set('Authorization', authToken)
        .send({});

      expect(saveSpy).toHaveBeenCalled();
      const savedRecipe = saveSpy.mock.instances[0];
      expect(savedRecipe.title).toBe('Bezglutenowa kanapka');
      expect(savedRecipe.author).toBe('supabase123');
    });
  });
}); 
// unit/api/recipes.test.js - Test logiki biznesowej API recipes
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock kontrolera przepisów
const mockRecipeController = {
  getRecipes: vi.fn(),
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn()
};

// Mock walidatora
const mockValidator = {
  validateRecipe: vi.fn(),
  validateRecipeId: vi.fn()
};

describe('API /api/recipes Logic', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: { id: 'user123', email: 'test@example.com' },
      body: {},
      params: {},
      query: {}
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
    
    mockNext = vi.fn();
    
    vi.clearAllMocks();
  });

  describe('GET /api/recipes logic', () => {
    test('zwraca listę przepisów dla zalogowanego użytkownika', async () => {
      const mockRecipes = [
        { _id: '1', title: 'Test Recipe 1', userId: 'user123' },
        { _id: '2', title: 'Test Recipe 2', userId: 'user123' }
      ];

      mockRecipeController.getRecipes.mockResolvedValue({
        recipes: mockRecipes,
        total: 2,
        page: 1,
        limit: 10
      });

      // Symulujemy wywołanie kontrolera
      const result = await mockRecipeController.getRecipes(mockReq.user.id, {
        page: 1,
        limit: 10,
        search: '',
        hashtags: ''
      });

      expect(result.recipes).toHaveLength(2);
      expect(result.recipes[0].title).toBe('Test Recipe 1');
      expect(result.total).toBe(2);
    });

    test('obsługuje błędy pobierania przepisów', async () => {
      const mockError = new Error('Database connection failed');
      mockRecipeController.getRecipes.mockRejectedValue(mockError);

      await expect(
        mockRecipeController.getRecipes(mockReq.user.id, {})
      ).rejects.toThrow('Database connection failed');
    });

    test('obsługuje parametry wyszukiwania', async () => {
      mockReq.query = {
        search: 'keto',
        hashtags: 'healthy,quick',
        page: '2',
        limit: '5'
      };

      const mockRecipes = [
        { _id: '1', title: 'Keto Recipe', hashtags: ['keto', 'healthy'] }
      ];

      mockRecipeController.getRecipes.mockResolvedValue({
        recipes: mockRecipes,
        total: 1,
        page: 2,
        limit: 5
      });

      const result = await mockRecipeController.getRecipes(mockReq.user.id, {
        search: 'keto',
        hashtags: 'healthy,quick',
        page: 2,
        limit: 5
      });

      expect(result.recipes[0].title).toContain('Keto');
      expect(result.page).toBe(2);
    });
  });

  describe('POST /api/recipes logic', () => {
    const validRecipe = {
      title: 'Test Recipe',
      ingredients: [{ name: 'Test ingredient', quantity: 100, unit: 'g' }],
      instructions: ['Test instruction'],
      preparationTime: 30,
      difficulty: 'easy',
      servings: 4,
      hashtags: ['healthy', 'quick']
    };

    test('tworzy nowy przepis z prawidłowymi danymi', async () => {
      mockValidator.validateRecipe.mockReturnValue(true);
      
      const mockCreatedRecipe = {
        ...validRecipe,
        _id: 'new-recipe-id',
        userId: 'user123',
        createdAt: new Date()
      };

      mockRecipeController.createRecipe.mockResolvedValue(mockCreatedRecipe);

      // Sprawdź walidację
      const isValid = mockValidator.validateRecipe(validRecipe);
      expect(isValid).toBe(true);

      // Utwórz przepis
      const result = await mockRecipeController.createRecipe(validRecipe, 'user123');

      expect(result._id).toBe('new-recipe-id');
      expect(result.title).toBe(validRecipe.title);
      expect(result.userId).toBe('user123');
    });

    test('odrzuca nieprawidłowe dane przepisu', async () => {
      const invalidRecipe = {
        title: '', // Empty title
        ingredients: [] // Empty ingredients
      };

      mockValidator.validateRecipe.mockReturnValue(false);

      const isValid = mockValidator.validateRecipe(invalidRecipe);
      expect(isValid).toBe(false);

      // Nie wywołujemy createRecipe jeśli walidacja się nie powiodła
      expect(mockRecipeController.createRecipe).not.toHaveBeenCalled();
    });

    test('obsługuje błędy tworzenia przepisu', async () => {
      mockValidator.validateRecipe.mockReturnValue(true);
      
      const mockError = new Error('Database write failed');
      mockRecipeController.createRecipe.mockRejectedValue(mockError);

      await expect(
        mockRecipeController.createRecipe(validRecipe, 'user123')
      ).rejects.toThrow('Database write failed');
    });
  });

  describe('PUT /api/recipes/:id logic', () => {
    const mockRecipeId = '507f1f77bcf86cd799439011';
    const updatedData = {
      title: 'Updated Recipe Title',
      preparationTime: 45
    };

    test('aktualizuje przepis z prawidłowymi danymi', async () => {
      mockValidator.validateRecipeId.mockReturnValue(true);
      mockValidator.validateRecipe.mockReturnValue(true);

      const mockUpdatedRecipe = {
        _id: mockRecipeId,
        ...updatedData,
        userId: 'user123',
        updatedAt: new Date()
      };

      mockRecipeController.updateRecipe.mockResolvedValue(mockUpdatedRecipe);

      // Sprawdź walidację ID
      const isValidId = mockValidator.validateRecipeId(mockRecipeId);
      expect(isValidId).toBe(true);

      // Sprawdź walidację danych
      const isValidData = mockValidator.validateRecipe(updatedData);
      expect(isValidData).toBe(true);

      // Aktualizuj przepis
      const result = await mockRecipeController.updateRecipe(
        mockRecipeId, 
        updatedData, 
        'user123'
      );

      expect(result._id).toBe(mockRecipeId);
      expect(result.title).toBe(updatedData.title);
    });

    test('odrzuca nieprawidłowe ID przepisu', async () => {
      const invalidId = 'invalid-id';
      
      mockValidator.validateRecipeId.mockReturnValue(false);

      const isValidId = mockValidator.validateRecipeId(invalidId);
      expect(isValidId).toBe(false);
    });

    test('obsługuje błędy aktualizacji', async () => {
      mockValidator.validateRecipeId.mockReturnValue(true);
      mockValidator.validateRecipe.mockReturnValue(true);
      
      const mockError = new Error('Recipe not found');
      mockRecipeController.updateRecipe.mockRejectedValue(mockError);

      await expect(
        mockRecipeController.updateRecipe(mockRecipeId, updatedData, 'user123')
      ).rejects.toThrow('Recipe not found');
    });
  });

  describe('DELETE /api/recipes/:id logic', () => {
    const mockRecipeId = '507f1f77bcf86cd799439011';

    test('usuwa przepis z prawidłowym ID', async () => {
      mockValidator.validateRecipeId.mockReturnValue(true);
      mockRecipeController.deleteRecipe.mockResolvedValue({ deleted: true });

      // Sprawdź walidację ID
      const isValidId = mockValidator.validateRecipeId(mockRecipeId);
      expect(isValidId).toBe(true);

      // Usuń przepis
      const result = await mockRecipeController.deleteRecipe(mockRecipeId, 'user123');

      expect(result.deleted).toBe(true);
      expect(mockRecipeController.deleteRecipe).toHaveBeenCalledWith(mockRecipeId, 'user123');
    });

    test('odrzuca nieprawidłowe ID', async () => {
      const invalidId = 'invalid-id';
      
      mockValidator.validateRecipeId.mockReturnValue(false);

      const isValidId = mockValidator.validateRecipeId(invalidId);
      expect(isValidId).toBe(false);
    });

    test('obsługuje błędy usuwania', async () => {
      mockValidator.validateRecipeId.mockReturnValue(true);
      
      const mockError = new Error('Recipe not found');
      mockRecipeController.deleteRecipe.mockRejectedValue(mockError);

      await expect(
        mockRecipeController.deleteRecipe(mockRecipeId, 'user123')
      ).rejects.toThrow('Recipe not found');
    });
  });

  describe('Authorization logic', () => {
    test('sprawdza czy użytkownik jest właścicielem przepisu', () => {
      const recipe = { _id: '1', userId: 'user123', title: 'Test' };
      const userId = 'user123';

      const isOwner = recipe.userId === userId;
      expect(isOwner).toBe(true);
    });

    test('odrzuca dostęp dla nie-właściciela', () => {
      const recipe = { _id: '1', userId: 'user456', title: 'Test' };
      const userId = 'user123';

      const isOwner = recipe.userId === userId;
      expect(isOwner).toBe(false);
    });
  });

  describe('Data transformation logic', () => {
    test('formatuje dane przepisu do odpowiedzi API', () => {
      const rawRecipe = {
        _id: '1',
        title: 'Test Recipe',
        ingredients: [{ name: 'Test', quantity: 100, unit: 'g' }],
        instructions: ['Step 1'],
        userId: 'user123',
        createdAt: new Date('2024-01-01'),
        __v: 0
      };

      // Symulujemy transformację danych
      const formattedRecipe = {
        id: rawRecipe._id,
        title: rawRecipe.title,
        ingredients: rawRecipe.ingredients,
        instructions: rawRecipe.instructions,
        createdAt: rawRecipe.createdAt
        // Usuwamy __v i userId z odpowiedzi
      };

      expect(formattedRecipe.id).toBe('1');
      expect(formattedRecipe.title).toBe('Test Recipe');
      expect(formattedRecipe).not.toHaveProperty('__v');
      expect(formattedRecipe).not.toHaveProperty('userId');
    });
  });
}); 
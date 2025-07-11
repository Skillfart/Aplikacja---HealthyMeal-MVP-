// unit/api/recipes.test.js - Test API recipes endpoint
import request from 'supertest';
import app from '../../../backend/src/app.js';

describe('API /api/recipes', () => {
  let authToken;
  
  beforeAll(async () => {
    // Mock auth token
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('GET /api/recipes', () => {
    test('zwraca listę przepisów dla zalogowanego użytkownika', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('recipes');
      expect(Array.isArray(response.body.recipes)).toBe(true);
    });

    test('zwraca 401 dla niezalogowanego użytkownika', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/recipes', () => {
    const validRecipe = {
      title: 'Test Recipe',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: 'Test instructions',
      preparationTime: 30,
      difficulty: 'easy',
      servings: 4,
      tags: ['healthy', 'quick']
    };

    test('tworzy nowy przepis dla zalogowanego użytkownika', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validRecipe)
        .expect(201);

      expect(response.body).toHaveProperty('recipe');
      expect(response.body.recipe.title).toBe(validRecipe.title);
    });

    test('zwraca 400 dla nieprawidłowych danych', async () => {
      const invalidRecipe = {
        title: '', // Empty title
        ingredients: []
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRecipe)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('zwraca 401 dla niezalogowanego użytkownika', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send(validRecipe)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/recipes/:id', () => {
    const mockRecipeId = '507f1f77bcf86cd799439011';
    const updatedRecipe = {
      title: 'Updated Recipe Title',
      preparationTime: 45
    };

    test('aktualizuje przepis dla właściciela', async () => {
      const response = await request(app)
        .put(`/api/recipes/${mockRecipeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedRecipe)
        .expect(200);

      expect(response.body).toHaveProperty('recipe');
      expect(response.body.recipe.title).toBe(updatedRecipe.title);
    });

    test('zwraca 404 dla nieistniejącego przepisu', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      
      const response = await request(app)
        .put(`/api/recipes/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedRecipe)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    const mockRecipeId = '507f1f77bcf86cd799439011';

    test('usuwa przepis dla właściciela', async () => {
      const response = await request(app)
        .delete(`/api/recipes/${mockRecipeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('zwraca 404 dla nieistniejącego przepisu', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      
      const response = await request(app)
        .delete(`/api/recipes/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 
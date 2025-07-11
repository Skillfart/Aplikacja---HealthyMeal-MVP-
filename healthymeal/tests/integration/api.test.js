import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../../backend/src/app.js';
import { Recipe } from '../../backend/src/models/Recipe.js';
import User from '../../backend/src/models/User.js';

describe('🌐 API Integration Tests', () => {
  let mongoServer;
  let testUser;
  let authToken;
  let testUserId = 'test-user-123';

  beforeAll(async () => {
    // Rozpocznij serwer MongoDB w pamięci
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Zamknij istniejące połączenie jeśli istnieje
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Utwórz testowego użytkownika
    testUser = new User({
      supabaseId: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      preferences: {
        dietType: 'keto',
        maxCarbs: 50,
        excludedProducts: ['gluten'],
        allergens: ['nuts']
      }
    });
    await testUser.save();

    // Utwórz token JWT
    authToken = jwt.sign(
      { 
        sub: testUserId,
        email: 'test@example.com' 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Wyczyść recipes po każdym teście (zostaw użytkownika)
    await Recipe.deleteMany({});
  });

  describe('🔐 Authentication Middleware', () => {
    test('Odrzuca requesty bez tokena', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(401);

      expect(response.body.error).toBe('Brak tokena autoryzacji');
    });

    test('Odrzuca requesty z nieprawidłowym tokenem', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Nieprawidłowy token');
    });

    test('Akceptuje requesty z prawidłowym tokenem', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.recipes).toBeDefined();
    });
  });

  describe('📋 Recipes API', () => {
    test('GET /api/recipes - Pobiera puste przepisy', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.recipes).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    test('POST /api/recipes - Tworzy nowy przepis', async () => {
      const newRecipe = {
        title: 'Keto Kotlet',
        ingredients: [
          { name: 'Kurczak', quantity: '500', unit: 'g' },
          { name: 'Jajko', quantity: '2', unit: 'szt' }
        ],
        instructions: ['Podsmaż kurczaka', 'Dodaj jajko'],
        preparationTime: 30,
        servings: 4,
        hashtags: ['keto', 'bezglutenowe']
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newRecipe)
        .expect(201);

      expect(response.body.title).toBe('Keto Kotlet');
      expect(response.body.author).toBe(testUserId);
      expect(response.body.ingredients).toHaveLength(2);
      expect(response.body._id).toBeDefined();
    });

    test('POST /api/recipes - Waliduje wymagane pola', async () => {
      const incompleteRecipe = {
        title: 'Niepełny przepis'
        // Brak ingredients i instructions
      };

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteRecipe)
        .expect(400);

      expect(response.body.error).toBe('Brak wymaganych pól');
      expect(response.body.details.ingredients).toBe('Składniki są wymagane');
    });

    test('GET /api/recipes/:id - Pobiera konkretny przepis', async () => {
      // Utwórz przepis
      const recipe = new Recipe({
        title: 'Test Recipe',
        author: testUserId,
        ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }],
        instructions: ['Test instruction']
      });
      await recipe.save();

      const response = await request(app)
        .get(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.title).toBe('Test Recipe');
      expect(response.body._id).toBe(recipe._id.toString());
    });

    test('PUT /api/recipes/:id - Aktualizuje przepis', async () => {
      // Utwórz przepis
      const recipe = new Recipe({
        title: 'Original Title',
        author: testUserId,
        ingredients: [{ name: 'Original', quantity: '100', unit: 'g' }],
        instructions: ['Original instruction']
      });
      await recipe.save();

      const updateData = {
        title: 'Updated Title',
        hashtags: ['updated', 'test']
      };

      const response = await request(app)
        .put(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.hashtags).toContain('updated');
    });

    test('DELETE /api/recipes/:id - Usuwa przepis', async () => {
      // Utwórz przepis
      const recipe = new Recipe({
        title: 'To Delete',
        author: testUserId,
        ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }],
        instructions: ['Test instruction']
      });
      await recipe.save();

      const response = await request(app)
        .delete(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Przepis został usunięty');

      // Sprawdź czy przepis został usunięty
      const deletedRecipe = await Recipe.findById(recipe._id);
      expect(deletedRecipe).toBeNull();
    });

    test('GET /api/recipes - Filtruje po wyszukiwaniu', async () => {
      // Utwórz kilka przepisów
      const recipes = [
        { title: 'Keto Kotlet', author: testUserId, ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] },
        { title: 'Vegan Sałatka', author: testUserId, ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] },
        { title: 'Keto Zupa', author: testUserId, ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] }
      ];
      await Recipe.insertMany(recipes);

      const response = await request(app)
        .get('/api/recipes?search=keto')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.recipes).toHaveLength(2);
      expect(response.body.recipes.map(r => r.title)).toEqual(['Keto Zupa', 'Keto Kotlet']);
    });

    test('GET /api/recipes - Filtruje po hashtags', async () => {
      // Utwórz przepisy z hashtags
      const recipes = [
        { title: 'Recipe 1', author: testUserId, hashtags: ['keto', 'lunch'], ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] },
        { title: 'Recipe 2', author: testUserId, hashtags: ['vegan', 'lunch'], ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] },
        { title: 'Recipe 3', author: testUserId, hashtags: ['keto', 'dinner'], ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] }
      ];
      await Recipe.insertMany(recipes);

      const response = await request(app)
        .get('/api/recipes?hashtags=keto,lunch')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.recipes).toHaveLength(1);
      expect(response.body.recipes[0].title).toBe('Recipe 1');
    });

    test('Izoluje przepisy między użytkownikami', async () => {
      // Utwórz drugiego użytkownika
      const user2 = new User({
        supabaseId: 'user2-id',
        email: 'user2@example.com'
      });
      await user2.save();

      const token2 = jwt.sign(
        { sub: 'user2-id', email: 'user2@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Utwórz przepisy dla obu użytkowników
      const recipes = [
        { title: 'User 1 Recipe', author: testUserId, ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] },
        { title: 'User 2 Recipe', author: 'user2-id', ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] }
      ];
      await Recipe.insertMany(recipes);

      // Sprawdź izolację
      const user1Response = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const user2Response = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(user1Response.body.recipes).toHaveLength(1);
      expect(user1Response.body.recipes[0].title).toBe('User 1 Recipe');

      expect(user2Response.body.recipes).toHaveLength(1);
      expect(user2Response.body.recipes[0].title).toBe('User 2 Recipe');
    });
  });

  describe('🤖 AI Integration', () => {
    test('POST /api/recipes/:id/ai-modify - Sprawdza limit AI', async () => {
      // Utwórz przepis
      const recipe = new Recipe({
        title: 'Test Recipe for AI',
        author: testUserId,
        ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }],
        instructions: ['Test instruction']
      });
      await recipe.save();

      // Ustaw limit AI na 0
      testUser.aiUsage.count = 5; // Domyślny limit
      await testUser.save();

      const response = await request(app)
        .post(`/api/recipes/${recipe._id}/ai-modify`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ modification: 'Zrób to keto' })
        .expect(429);

      expect(response.body.error).toBe('Przekroczono dzienny limit użycia AI');
    });

    test('POST /api/recipes/:id/ai-modify - Sprawdza dostęp do przepisu', async () => {
      // Utwórz przepis innego użytkownika
      const otherUserRecipe = new Recipe({
        title: 'Other User Recipe',
        author: 'other-user-id',
        ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }],
        instructions: ['Test instruction']
      });
      await otherUserRecipe.save();

      const response = await request(app)
        .post(`/api/recipes/${otherUserRecipe._id}/ai-modify`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ modification: 'Zrób to keto' })
        .expect(404);

      expect(response.body.error).toBe('Przepis nie znaleziony');
    });
  });

  describe('📊 Pagination and Limits', () => {
    test('GET /api/recipes - Obsługuje paginację', async () => {
      // Utwórz 15 przepisów
      const recipes = Array.from({ length: 15 }, (_, i) => ({
        title: `Recipe ${i + 1}`,
        author: testUserId,
        ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }],
        instructions: ['Test instruction']
      }));
      await Recipe.insertMany(recipes);

      // Sprawdź pierwszą stronę
      const page1 = await request(app)
        .get('/api/recipes?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(page1.body.recipes).toHaveLength(10);
      expect(page1.body.total).toBe(15);
      expect(page1.body.page).toBe(1);

      // Sprawdź drugą stronę
      const page2 = await request(app)
        .get('/api/recipes?page=2&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(page2.body.recipes).toHaveLength(5);
      expect(page2.body.page).toBe(2);
    });
  });
}); 
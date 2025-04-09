const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const app = require('../../app');
const Recipe = require('../../models/Recipe');
const User = require('../../models/User');
const AICache = require('../../models/AICache');
const aiService = require('../../services/aiService');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');

describe('AI Endpoints', () => {
  let testUser, testRecipe, authToken;
  
  before(async () => {
    // Połączenie z testową bazą danych
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/healthymeal_test');
    
    // Wyczyszczenie bazy przed testami
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await AICache.deleteMany({});
    
    // Utworzenie testowego użytkownika
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      preferences: {
        dietType: 'keto',
        maxCarbs: 20,
        excludedProducts: ['sugar'],
        allergens: ['gluten']
      },
      aiUsage: {
        date: new Date(),
        count: 0
      }
    });
    
    // Utworzenie testowego przepisu
    testRecipe = await Recipe.create({
      title: 'Test Pancakes',
      user: {
        _id: testUser._id,
        email: testUser.email
      },
      ingredients: [
        {
          ingredient: {
            _id: new mongoose.Types.ObjectId(),
            name: 'Wheat Flour'
          },
          quantity: 100,
          unit: 'g',
          isOptional: false
        }
      ],
      steps: [
        {
          number: 1,
          description: 'Mix all ingredients',
          estimatedTime: 5
        }
      ],
      preparationTime: 15,
      difficulty: 'easy',
      servings: 2,
      tags: ['breakfast'],
      nutritionalValues: {
        totalCalories: 350,
        totalCarbs: 50,
        totalProtein: 10,
        totalFat: 15,
        totalFiber: 2,
        caloriesPerServing: 175,
        carbsPerServing: 25
      },
      isDeleted: false
    });
    
    // Utworzenie tokenu autoryzacyjnego
    authToken = jwt.sign(
      { userId: testUser._id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );
  });
  
  after(async () => {
    // Rozłączenie z bazą po testach
    await mongoose.connection.close();
  });
  
  describe('POST /api/ai/modify/:recipeId', () => {
    let aiServiceStub;
    
    beforeEach(() => {
      // Stub dla aiService.callAI
      aiServiceStub = sinon.stub(aiService, 'callAI').resolves({
        completion: `
        {
          "title": "Keto Pancakes",
          "ingredients": [
            {
              "name": "Almond Flour",
              "quantity": 80,
              "unit": "g",
              "isModified": true,
              "substitutionReason": "Lower carb alternative"
            }
          ],
          "steps": [
            {
              "number": 1,
              "description": "Mix all ingredients",
              "isModified": false
            }
          ],
          "nutritionalValues": {
            "totalCarbs": 10
          },
          "changesDescription": "Replaced wheat flour with almond flour"
        }
        `
      });
    });
    
    afterEach(() => {
      // Przywrócenie oryginalnej implementacji
      aiServiceStub.restore();
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/ai/modify/${testRecipe._id}`);
      
      expect(response.status).to.equal(401);
    });
    
    it('should return 404 for non-existent recipe', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/ai/modify/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(404);
    });
    
    it('should successfully modify a recipe', async () => {
      const response = await request(app)
        .post(`/api/ai/modify/${testRecipe._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'Recipe modified successfully');
      expect(response.body).to.have.property('modifiedRecipe');
      expect(response.body.modifiedRecipe).to.have.property('title', 'Keto Pancakes');
      expect(response.body).to.have.property('fromCache', false);
      
      // Sprawdzenie, czy licznik AI został zaktualizowany
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.aiUsage.count).to.equal(1);
    });
    
    it('should return cached result for subsequent requests', async () => {
      // Pierwszy request powinien już stworzyć cache
      const response1 = await request(app)
        .post(`/api/ai/modify/${testRecipe._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Drugi request powinien zwrócić z cache'u
      const response2 = await request(app)
        .post(`/api/ai/modify/${testRecipe._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response2.status).to.equal(200);
      expect(response2.body).to.have.property('fromCache', true);
      
      // Sprawdzenie, czy licznik AI nie wzrósł ponownie
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.aiUsage.count).to.equal(1); // Wciąż 1, nie 2
    });
    
    it('should return 403 when daily limit is exceeded', async () => {
      // Ustawienie użytkownika na limit
      await User.findByIdAndUpdate(testUser._id, {
        'aiUsage.count': 5
      });
      
      const response = await request(app)
        .post(`/api/ai/modify/${testRecipe._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(403);
      expect(response.body.message).to.include('Daily AI modification limit exceeded');
    });
  });
  
  describe('GET /api/ai/usage', () => {
    it('should return current AI usage information', async () => {
      const response = await request(app)
        .get('/api/ai/usage')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('aiUsage');
      expect(response.body).to.have.property('dailyLimit');
      expect(response.body).to.have.property('remainingModifications');
    });
  });
});
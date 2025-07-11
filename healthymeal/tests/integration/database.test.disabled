import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Recipe } from '../../backend/src/models/Recipe.js';
import User from '../../backend/src/models/User.js';

describe('🗄️ Database Integration Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    // Rozpocznij serwer MongoDB w pamięci
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Wyczyść wszystkie kolekcje po każdym teście
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('User Model', () => {
    test('Tworzy użytkownika z preferencjami', async () => {
      const userData = {
        supabaseId: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          dietType: 'keto',
          maxCarbs: 50,
          excludedProducts: ['gluten', 'dairy'],
          allergens: ['nuts']
        }
      };

      const user = new User(userData);
      await user.save();

      const savedUser = await User.findOne({ supabaseId: 'test-user-123' });
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.preferences.dietType).toBe('keto');
      expect(savedUser.preferences.maxCarbs).toBe(50);
      expect(savedUser.preferences.excludedProducts).toContain('gluten');
      expect(savedUser.preferences.allergens).toContain('nuts');
    });

    test('Resetuje licznik AI po dniu', async () => {
      const user = new User({
        supabaseId: 'test-user-ai',
        email: 'ai@example.com',
        aiUsage: {
          count: 5,
          lastReset: new Date(Date.now() - 24 * 60 * 60 * 1000) // Wczoraj
        }
      });

      await user.save();
      
      // Sprawdź reset
      user.resetAIUsageIfNeeded();
      expect(user.aiUsage.count).toBe(0);
      expect(user.aiUsage.lastReset.toDateString()).toBe(new Date().toDateString());
    });

    test('Inkrementuje licznik AI', async () => {
      const user = new User({
        supabaseId: 'test-user-increment',
        email: 'increment@example.com'
      });

      await user.save();
      
      user.incrementAiUsage();
      expect(user.aiUsage.count).toBe(1);
      
      user.incrementAiUsage();
      expect(user.aiUsage.count).toBe(2);
    });
  });

  describe('Recipe Model', () => {
    test('Tworzy przepis z pełnymi danymi', async () => {
      const recipeData = {
        title: 'Keto Kotlet',
        description: 'Pyszny kotlet bez glutenu',
        author: 'test-user-123',
        ingredients: [
          { name: 'Kurczak', quantity: '500', unit: 'g' },
          { name: 'Jajko', quantity: '2', unit: 'szt' }
        ],
        instructions: ['Podsmaż kurczaka', 'Dodaj jajko'],
        preparationTime: 30,
        servings: 4,
        hashtags: ['keto', 'bezglutenowe']
      };

      const recipe = new Recipe(recipeData);
      await recipe.save();

      const savedRecipe = await Recipe.findOne({ title: 'Keto Kotlet' });
      expect(savedRecipe.title).toBe('Keto Kotlet');
      expect(savedRecipe.ingredients).toHaveLength(2);
      expect(savedRecipe.instructions).toContain('Podsmaż kurczaka');
      expect(savedRecipe.hashtags).toContain('keto');
      expect(savedRecipe.createdAt).toBeDefined();
    });

    test('Normalizuje hashtagi', async () => {
      const recipe = new Recipe({
        title: 'Test Recipe',
        author: 'test-user',
        ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }],
        instructions: ['Test'],
        hashtags: ['keto', 'keto', 'Vegan', ' low-carb ', ''] // Duplikaty i spacje
      });

      await recipe.save();

      const savedRecipe = await Recipe.findOne({ title: 'Test Recipe' });
      expect(savedRecipe.hashtags).toEqual(['keto', 'Vegan', 'low-carb']);
    });

    test('Wyszukuje przepisy po autorze', async () => {
      const recipes = [
        { title: 'Recipe 1', author: 'user1', ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] },
        { title: 'Recipe 2', author: 'user1', ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] },
        { title: 'Recipe 3', author: 'user2', ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }], instructions: ['Test'] }
      ];

      await Recipe.insertMany(recipes);

      const user1Recipes = await Recipe.find({ author: 'user1' });
      expect(user1Recipes).toHaveLength(2);
      expect(user1Recipes.map(r => r.title)).toEqual(['Recipe 1', 'Recipe 2']);
    });
  });

  describe('User-Recipe Relations', () => {
    test('Łączy użytkownika z przepisami', async () => {
      // Utwórz użytkownika
      const user = new User({
        supabaseId: 'test-relation-user',
        email: 'relation@example.com'
      });
      await user.save();

      // Utwórz przepisy
      const recipe1 = new Recipe({
        title: 'User Recipe 1',
        author: user.supabaseId,
        ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }],
        instructions: ['Test']
      });
      await recipe1.save();

      const recipe2 = new Recipe({
        title: 'User Recipe 2', 
        author: user.supabaseId,
        ingredients: [{ name: 'Test', quantity: '100', unit: 'g' }],
        instructions: ['Test']
      });
      await recipe2.save();

      // Sprawdź relację
      const userRecipes = await Recipe.find({ author: user.supabaseId });
      expect(userRecipes).toHaveLength(2);
      expect(userRecipes.map(r => r.title)).toContain('User Recipe 1');
      expect(userRecipes.map(r => r.title)).toContain('User Recipe 2');
    });
  });
}); 
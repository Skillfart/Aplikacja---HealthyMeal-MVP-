const { expect } = require('chai');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Recipe = require('../../models/Recipe');
const AICache = require('../../models/AICache');
const hashService = require('../../services/hashService');

describe('AI Cache Performance', () => {
  let testUser, testRecipe;
  
  before(async () => {
    // Połączenie z testową bazą danych
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/healthymeal_test');
    
    // Wyczyszczenie bazy przed testami
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await AICache.deleteMany({});
    
    // Utworzenie testowego użytkownika i przepisu
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      preferences: {
        dietType: 'keto',
        maxCarbs: 20,
        excludedProducts: ['sugar'],
        allergens: ['gluten']
      }
    });
    
    testRecipe = await Recipe.create({
      title: 'Test Recipe',
      user: { _id: testUser._id, email: testUser.email },
      ingredients: [{ ingredient: { name: 'Flour' }, quantity: 100, unit: 'g' }],
      nutritionalValues: { totalCarbs: 50 }
    });
  });
  
  after(async () => {
    await mongoose.connection.close();
  });
  
  it('should efficiently retrieve from cache with index', async () => {
    // Przygotowanie danych testowych - utworzenie 1000 wpisów w cache
    const cacheEntries = [];
    
    for (let i = 0; i < 1000; i++) {
      const inputHash = `test-hash-${i}`;
      cacheEntries.push({
        inputHash,
        recipeId: testRecipe._id,
        userPreferences: testUser.preferences,
        response: {
          title: `Modified Recipe ${i}`,
          ingredients: [],
          steps: [],
          nutritionalValues: { totalCarbs: 10, carbsReduction: 80 },
          changesDescription: 'Test modification'
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }
    
    await AICache.insertMany(cacheEntries);
    
    // Test wydajności - wyszukiwanie po hash
    const targetHash = `test-hash-${Math.floor(Math.random() * 1000)}`;
    
    console.time('Cache Lookup');
    const result = await AICache.findOne({ inputHash: targetHash });
    console.timeEnd('Cache Lookup');
    
    expect(result).to.exist;
    expect(result.inputHash).to.equal(targetHash);
    
    // Sprawdzenie, czy indeks działa poprawnie
    const explain = await AICache.findOne({ inputHash: targetHash }).explain('executionStats');
    expect(explain.executionStats.totalDocsExamined).to.be.lessThan(10); // Powinno użyć indeksu
  });
  
  it('should efficiently generate and lookup by hash', async () => {
    // Test wydajności generowania hasha
    const iterations = 1000;
    const preferences = testUser.preferences;
    
    console.time('Generate 1000 Hashes');
    for (let i = 0; i < iterations; i++) {
      hashService.generateInputHash(testRecipe._id, preferences);
    }
    console.timeEnd('Generate 1000 Hashes');
    
    // Test wydajności lookup z indeksem TTL
    console.time('TTL Index Performance');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Sprawdzenie ilu wpisów wygasło (powinno być 0, bo wszystkie utworzyliśmy przed chwilą z datą przyszłą)
    const expiredCount = await AICache.countDocuments({ expiresAt: { $lt: oneHourAgo } });
    console.timeEnd('TTL Index Performance');
    
    expect(expiredCount).to.equal(0);
  });
});
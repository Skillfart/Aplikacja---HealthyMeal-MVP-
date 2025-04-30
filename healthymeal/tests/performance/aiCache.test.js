/**
 * Test wydajnościowy dla mechanizmu cache'owania odpowiedzi AI
 */
const { expect } = require('chai');
const { generateHash } = require('../mocks/services/hashService');

// Mock dla AICache
const mockAICache = {
  cache: new Map(),
  
  findOne: async function(query) {
    const { inputHash } = query;
    const cacheEntry = this.cache.get(inputHash);
    return cacheEntry || null;
  },
  
  create: async function(data) {
    const { inputHash, response } = data;
    const entry = {
      ...data,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 dzień
    };
    this.cache.set(inputHash, entry);
    return entry;
  }
};

describe('AI Cache Performance Tests', function() {
  this.timeout(5000); // Ustawienie dłuższego timeoutu dla testów wydajnościowych
  
  // Przygotowanie danych testowych
  const numIterations = 100;
  const testData = [];
  
  before(function() {
    // Wygenerowanie danych testowych
    for (let i = 0; i < numIterations; i++) {
      const recipeId = `recipe-${i}`;
      const userPreferences = {
        dietType: i % 2 === 0 ? 'keto' : 'vegan',
        maxCarbs: i % 10 * 5,
        excludedProducts: [`product-${i % 5}`],
        allergens: []
      };
      
      testData.push({
        recipeId,
        userPreferences
      });
    }
  });
  
  it('should cache and retrieve AI responses efficiently', async function() {
    // Test zapisu do cache'u
    console.time('Cache Write Time');
    
    for (const data of testData) {
      const { recipeId, userPreferences } = data;
      const inputHash = generateHash({ recipeId, userPreferences });
      
      await mockAICache.create({
        inputHash,
        recipeId,
        userPreferences,
        response: {
          title: `Modified Recipe ${recipeId}`,
          ingredients: [{ name: 'Test Ingredient', quantity: 100, unit: 'g' }],
          steps: [{ number: 1, description: 'Test step' }],
          nutritionalValues: { totalCarbs: 10 }
        }
      });
    }
    
    console.timeEnd('Cache Write Time');
    
    // Test odczytu z cache'u
    console.time('Cache Read Time');
    
    let cacheHitCount = 0;
    
    for (const data of testData) {
      const { recipeId, userPreferences } = data;
      const inputHash = generateHash({ recipeId, userPreferences });
      
      const cachedResponse = await mockAICache.findOne({ inputHash });
      
      if (cachedResponse) {
        cacheHitCount++;
      }
    }
    
    console.timeEnd('Cache Read Time');
    
    // Asercje
    expect(cacheHitCount).to.equal(numIterations);
  });
  
  it('should handle cache misses efficiently', async function() {
    console.time('Cache Miss Time');
    
    let cacheMissCount = 0;
    
    // Zapytania dla nieistniejących danych
    for (let i = 0; i < numIterations; i++) {
      const nonExistentId = `non-existent-${i}`;
      const inputHash = generateHash({ recipeId: nonExistentId, userPreferences: {} });
      
      const cachedResponse = await mockAICache.findOne({ inputHash });
      
      if (!cachedResponse) {
        cacheMissCount++;
      }
    }
    
    console.timeEnd('Cache Miss Time');
    
    // Asercje
    expect(cacheMissCount).to.equal(numIterations);
  });
});
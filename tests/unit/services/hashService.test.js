const { expect } = require('chai');
const { generateInputHash } = require('../../../services/hashService');

describe('Hash Service', () => {
  describe('generateInputHash', () => {
    it('should generate consistent hash for the same input', () => {
      const recipeId = '60d21b4667d0d8992e610c85';
      const userPreferences = {
        dietType: 'keto',
        maxCarbs: 20,
        excludedProducts: ['sugar', 'wheat'],
        allergens: ['gluten']
      };
      
      const hash1 = generateInputHash(recipeId, userPreferences);
      const hash2 = generateInputHash(recipeId, userPreferences);
      
      expect(hash1).to.equal(hash2);
    });
    
    it('should generate different hash when preferences change', () => {
      const recipeId = '60d21b4667d0d8992e610c85';
      const preferencesA = {
        dietType: 'keto',
        maxCarbs: 20,
        excludedProducts: ['sugar'],
        allergens: ['gluten']
      };
      
      const preferencesB = {
        dietType: 'keto',
        maxCarbs: 30,
        excludedProducts: ['sugar'],
        allergens: ['gluten']
      };
      
      const hashA = generateInputHash(recipeId, preferencesA);
      const hashB = generateInputHash(recipeId, preferencesB);
      
      expect(hashA).to.not.equal(hashB);
    });
    
    it('should generate the same hash regardless of array order', () => {
      const recipeId = '60d21b4667d0d8992e610c85';
      const preferencesA = {
        dietType: 'keto',
        maxCarbs: 20,
        excludedProducts: ['sugar', 'wheat'],
        allergens: ['gluten', 'dairy']
      };
      
      const preferencesB = {
        dietType: 'keto',
        maxCarbs: 20,
        excludedProducts: ['wheat', 'sugar'],
        allergens: ['dairy', 'gluten']
      };
      
      const hashA = generateInputHash(recipeId, preferencesA);
      const hashB = generateInputHash(recipeId, preferencesB);
      
      expect(hashA).to.equal(hashB);
    });
  });
});
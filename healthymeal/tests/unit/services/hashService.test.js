const { expect } = require('chai');
const { generateHash, generateRecipeHash } = require('../../mocks/services/hashService.cjs');

describe('Hash Service', () => {
  describe('generateHash', () => {
    it('should generate a consistent hash for the same input', () => {
      const input = { test: 'data', number: 123 };
      
      const hash1 = generateHash(input);
      const hash2 = generateHash(input);
      
      expect(hash1).to.equal(hash2);
    });
    
    it('should generate different hashes for different inputs', () => {
      const input1 = { test: 'data', number: 123 };
      const input2 = { test: 'data', number: 456 };
      
      const hash1 = generateHash(input1);
      const hash2 = generateHash(input2);
      
      expect(hash1).to.not.equal(hash2);
    });
  });
  
  describe('generateRecipeHash', () => {
    it('should generate a consistent hash for the same recipe and preferences', () => {
      const recipeId = '123456789';
      const preferences = {
        dietType: 'keto',
        maxCarbs: 20
      };
      
      const hash1 = generateRecipeHash(recipeId, preferences);
      const hash2 = generateRecipeHash(recipeId, preferences);
      
      expect(hash1).to.equal(hash2);
    });
    
    it('should generate different hashes for different recipes', () => {
      const recipeId1 = '123456789';
      const recipeId2 = '987654321';
      const preferences = {
        dietType: 'keto',
        maxCarbs: 20
      };
      
      const hash1 = generateRecipeHash(recipeId1, preferences);
      const hash2 = generateRecipeHash(recipeId2, preferences);
      
      expect(hash1).to.not.equal(hash2);
    });
    
    it('should generate different hashes for different preferences', () => {
      const recipeId = '123456789';
      const preferences1 = {
        dietType: 'keto',
        maxCarbs: 20
      };
      const preferences2 = {
        dietType: 'paleo',
        maxCarbs: 30
      };
      
      const hash1 = generateRecipeHash(recipeId, preferences1);
      const hash2 = generateRecipeHash(recipeId, preferences2);
      
      expect(hash1).to.not.equal(hash2);
    });
  });
});
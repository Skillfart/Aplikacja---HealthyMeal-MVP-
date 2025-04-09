const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const { buildPrompt, callAI, processResponse } = require('../../../services/aiService');

describe('AI Service', () => {
  describe('buildPrompt', () => {
    it('should build a prompt with recipe and user preferences', () => {
      const recipe = {
        title: 'Test Recipe',
        ingredients: [
          { quantity: 100, unit: 'g', ingredient: { name: 'Flour' } }
        ],
        steps: [
          { number: 1, description: 'Mix ingredients' }
        ],
        nutritionalValues: {
          totalCarbs: 50,
          carbsPerServing: 25
        }
      };
      
      const userPreferences = {
        dietType: 'keto',
        maxCarbs: 20,
        excludedProducts: ['sugar'],
        allergens: ['gluten']
      };
      
      const prompt = buildPrompt(recipe, userPreferences);
      
      expect(prompt).to.have.property('prompt');
      expect(prompt.prompt).to.include('Test Recipe');
      expect(prompt.prompt).to.include('keto');
      expect(prompt.prompt).to.include('sugar');
      expect(prompt.prompt).to.include('gluten');
    });
  });
  
  describe('callAI', () => {
    let axiosPostStub;
    
    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, 'post');
    });
    
    afterEach(() => {
      axiosPostStub.restore();
    });
    
    it('should call AI API and return the response', async () => {
      const mockResponse = { data: { completion: '{"title":"Modified Recipe"}' } };
      axiosPostStub.resolves(mockResponse);
      
      const result = await callAI({ prompt: 'Test prompt' });
      
      expect(axiosPostStub.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockResponse.data);
    });
    
    it('should throw an error when API call fails', async () => {
      axiosPostStub.rejects(new Error('API error'));
      
      try {
        await callAI({ prompt: 'Test prompt' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('AI service error');
      }
    });
  });
  
  describe('processResponse', () => {
    it('should process valid AI response', () => {
      const aiResponse = {
        completion: `
        {
          "title": "Modified Recipe",
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
              "description": "Mix ingredients",
              "isModified": false
            }
          ],
          "nutritionalValues": {
            "totalCarbs": 10
          },
          "changesDescription": "Replaced flour with almond flour"
        }
        `
      };
      
      const originalRecipe = {
        title: 'Original Recipe',
        nutritionalValues: {
          totalCarbs: 50
        }
      };
      
      const result = processResponse(aiResponse, originalRecipe);
      
      expect(result.title).to.equal('Modified Recipe');
      expect(result.nutritionalValues.carbsReduction).to.equal(80); // (50-10)/50*100 = 80
      expect(result.ingredients[0].ingredient.name).to.equal('Almond Flour');
      expect(result.changesDescription).to.equal('Replaced flour with almond flour');
    });
    
    it('should throw an error for invalid JSON response', () => {
      const aiResponse = {
        completion: 'Not valid JSON'
      };
      
      const originalRecipe = {
        title: 'Original Recipe',
        nutritionalValues: {
          totalCarbs: 50
        }
      };
      
      try {
        processResponse(aiResponse, originalRecipe);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to process AI response');
      }
    });
  });
});
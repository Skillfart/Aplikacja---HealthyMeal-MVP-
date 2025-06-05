/**
 * Test dla serwisu AI 
 */

import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs';

// Ustal tryb testów z konfiguracji
const useMocks = process.env.USE_MOCKS === 'true';
const testMode = process.env.TEST_MODE === 'true';

// Dynamiczny import serwisu AI (CommonJS)
async function importAiService() {
  try {
    // Przystanek na odniesienie do ścieżki do backendu
    const backendPath = path.resolve(process.cwd(), '../backend/src/services/aiService.js');
    if (!fs.existsSync(backendPath)) {
      console.error(`Nie znaleziono pliku serwisu AI: ${backendPath}`);
      return null;
    }
    
    // Ominięcie ESM/CommonJS problemu przez utworzenie kopii modułu
    const aiServiceCode = fs.readFileSync(backendPath, 'utf8');
    const tempPath = path.resolve(process.cwd(), './unit/services/aiService-temp.cjs');
    fs.writeFileSync(tempPath, aiServiceCode);
    
    // Użyj require zamiast import dla modułu CommonJS
    const aiService = require(tempPath);
    return aiService;
      } catch (error) {
    console.error('Błąd podczas importowania serwisu AI:', error);
    return null;
  }
}

describe('Serwis AI', () => {
  let aiService;
  
  beforeAll(async () => {
    aiService = await importAiService();
    if (!aiService) {
      throw new Error('Nie udało się zaimportować serwisu AI');
    }
  });
  
  it('powinien istnieć i eksportować wymagane metody', () => {
    expect(aiService).toBeDefined();
    expect(aiService.modifyRecipe).toBeDefined();
    expect(aiService.buildAIPrompt).toBeDefined();
    expect(aiService.parseAIResponse).toBeDefined();
    expect(aiService.getMockModifiedRecipe).toBeDefined();
  });
  
  it('powinien działać w trybie testowym', () => {
    expect(testMode).toBe(true);
    console.log(`Test uruchomiony w trybie z mockami: ${useMocks}`);
  });
  
  it('powinien generować poprawny prompt dla AI', () => {
    const recipe = {
      title: 'Testowy przepis',
      ingredients: [
        { ingredient: { name: 'mąka' }, quantity: 200, unit: 'g' },
        { ingredient: { name: 'cukier' }, quantity: 100, unit: 'g' }
      ],
      steps: [
        { number: 1, description: 'Wymieszaj składniki' },
        { number: 2, description: 'Upiecz ciasto' }
      ]
    };
    
    const preferences = {
      dietType: 'lowCarb',
      maxCarbs: 50,
      excludedProducts: ['cukier'],
      allergens: ['gluten']
    };
    
    const prompt = aiService.buildAIPrompt(recipe, preferences);
    
    expect(prompt).toContain('Testowy przepis');
    expect(prompt).toContain('mąka');
    expect(prompt).toContain('cukier');
    expect(prompt).toContain('lowCarb');
    expect(prompt).toContain('50');
    expect(prompt).toContain('gluten');
  });
  
  it('powinien modyfikować przepis zgodnie z preferencjami', async () => {
    const recipe = {
      _id: '123',
      title: 'Testowy przepis',
        ingredients: [
        { ingredient: { name: 'mąka pszenna' }, quantity: 200, unit: 'g' },
        { ingredient: { name: 'cukier' }, quantity: 100, unit: 'g' }
        ],
        steps: [
        { number: 1, description: 'Wymieszaj składniki' },
        { number: 2, description: 'Upiecz ciasto' }
        ],
        nutritionalValues: {
        carbsPerServing: 30,
        caloriesPerServing: 250
      }
    };
    
    const preferences = {
      dietType: 'keto',
      maxCarbs: 10,
      excludedProducts: ['cukier'],
      allergens: ['gluten']
    };
    
    const modifiedRecipe = await aiService.modifyRecipe(recipe, preferences);
    
    expect(modifiedRecipe).toBeDefined();
    expect(modifiedRecipe.title).toContain(recipe.title);
    expect(modifiedRecipe.ingredients.length).toBeGreaterThanOrEqual(recipe.ingredients.length);
    expect(modifiedRecipe.steps.length).toBeGreaterThanOrEqual(recipe.steps.length);
    
    // Sprawdź czy składniki zostały zmodyfikowane zgodnie z preferencjami
    if (!useMocks) {
      console.log('Test z rzeczywistym API - sprawdzanie modyfikacji przepisu');
      
      // W rzeczywistym API powinny być zmodyfikowane składniki
      const hasMąkaModified = modifiedRecipe.ingredients.some(ing => 
        ing.ingredient.name !== 'mąka pszenna' && ing.isModified === true
      );
      
      const hasCukierModified = modifiedRecipe.ingredients.some(ing => 
        ing.ingredient.name !== 'cukier' && ing.isModified === true
      );
      
      // Sprawdź tylko jeśli nie używamy mocków
      if (!useMocks) {
        expect(hasMąkaModified || hasCukierModified).toBe(true);
      }
    }
  });
});